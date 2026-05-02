"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  Animated,
  Modal,
  Pressable,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  LayoutAnimation,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Carousel from "react-native-reanimated-carousel";
import * as Speech from "expo-speech";
import NetInfo from "@react-native-community/netinfo";
import { Icons } from "../../constants/Icons";
import { AppContext } from "../../context/appContext";
import FinancialPromotion from "../../components/customBanner";
import {
  fetchSaccosPaginated,
  fetchSaccosPromos,
  suggestSaccosProduct,
} from "../../service/getApi";
import CustomLoader from "../../components/customLoader";
import { Banner } from "react-native-paper";
import { Images } from "../../constants/Images";
import { logUserActivity } from "../../service/Supabase-Fuctions";
import { AuthContext } from "../../context/authProvider";
const { width } = Dimensions.get("window");
const isTablet = width >= 768;

// === UTILITY FUNCTIONS ===
const shuffleArray = (array) => {
  if (!Array.isArray(array)) return array;
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const formatCurrency = (amount, currency = "E") => {
  if (amount === null || amount === undefined || isNaN(amount))
    return `${currency}0.00`;
  const num = parseFloat(amount);
  return `${currency}${num.toLocaleString("en-SZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// === QUICK EMI MODAL (Loans only) ===
const QuickCalcModal = ({ visible, product, onClose, navigation }) => {
  const slideAnim = useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : 300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!product) return null;

  const cleanAmount = (s) => parseFloat(s) || 0;
  const cleanRate = (s) => parseFloat(s) / 12 / 100;
  const cleanTerm = (s) => parseInt(s) || 0;

  const P = cleanAmount(product?.maxAmount);
  const r = cleanRate(product?.interestRateApr);
  const n = cleanTerm(product?.maxDurationMonths);
  const emi =
    P && r && n ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : 0;

  const format = (v) => formatCurrency(v);

  return (
    <Modal transparent visible={visible} animationType="none">
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.modalContent,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Quick EMI Estimate</Text>
            <TouchableOpacity onPress={onClose}>
              <Icons.Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.modalLabel}>
              Company: {product?.company?.companyName}
            </Text>
            <Text style={styles.modalLabel}>
              Max: {product?.maxAmount} | Interest Rate:{" "}
              {product.interestRateApr}% | Term: {product.maxDurationMonths}{" "}
              months
            </Text>
            <View style={styles.emiResult}>
              <Text style={styles.emiLabel}>Monthly Repayment</Text>
              <Text style={styles.emiValue}>
                {emi > 0 ? format(emi) : "N/A"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.fullCalcBtn}
            onPress={() => {
              onClose();
              navigation.navigate("LoanCalculator", { product: product });
            }}
          >
            <Text style={styles.fullCalcText}>Open Full Calculator</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

// === MAIN SCREEN ===
export default function FinancialHubScreen({ route, navigation }) {
  const { user } = useContext(AuthContext);
  const [isOffline, setIsOffline] = useState(false);
  const fetchFromCloud = route.params?.saccoId || false;
  const { theme, isDarkMode } = React.useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Loans");
  const [loanData, setLoanData] = useState([]);
  const [savingsData, setSavingsData] = useState([]);
  const [insuranceData, setInsuranceData] = useState([]);
  const [investmentData, setInvestmentData] = useState([]);
  const [bannerPromos, setBannerPromos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedLoans, setSelectedLoans] = useState([]);
  const [quickCalcLoan, setQuickCalcLoan] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isBannersVisible, setIsBannersVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const bannerHeight = useRef(new Animated.Value(190)).current;
  const bannerOpacity = useRef(new Animated.Value(1)).current;
  const bannerTranslate = useRef(new Animated.Value(0)).current;

  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Bottom-sheet / filter state
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const bottomSheetY = useRef(new Animated.Value(500)).current; // offscreen by default
  const [filters, setFilters] = useState(null);
  const [isFilter, setIsFilter] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [showRetry, setShowRetry] = useState(false);
  const [form, setForm] = useState({
    category: "All",
    productType: "",
    nameOrCompany: "",
    minInterest: "",
    maxInterest: "",
    minTerm: "",
    maxTerm: "",
    otherDetails: "",
    interestRateApr: "",
    minInvestment: "",
    expectedReturns: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [allProducts, setAllProducts] = useState([]); // Master list for all categories
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const categoryFieldConfig = {
    All: {
      showRate: true,
      showTerm: true,
    },
    Loans: {
      showRate: true,
      showTerm: true,
    },
    Savings: {
      showRate: false,
      showTerm: false,
      interestRateApr: true,
    },
    Insurance: {
      showRate: true,
      showTerm: false,
    },
    Investments: {
      showRate: false,
      showTerm: false,
      minInvestment: true,
      expectedReturns: true,
    },
  };

  const activeCategoryConfig =
    categoryFieldConfig[form.category] || categoryFieldConfig.All;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });

    loadSaccoPromos();

    loadInitialSaccos(); // Changed from loadSaccos()

    return () => {
      unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, []);

  useEffect(() => {
    // Set a timeout for loading: 30 seconds = 30000 ms
    loadingTimeout;
  }, [isLoading])

  const loadingTimeout = setTimeout(() => {
    if (isLoading) {
      setIsLoading(false);
      setShowRetry(true);
    }
  }, 30000);

  useEffect(() => {
    // animate height (needs nativeDriver: false) and fade/translate (can use native driver)
    Animated.parallel([
      Animated.timing(bannerHeight, {
        toValue: isBannersVisible ? 190 : 0,
        duration: 420,
        useNativeDriver: false,
      }),
      Animated.timing(bannerOpacity, {
        toValue: isBannersVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(bannerTranslate, {
        toValue: isBannersVisible ? 0 : -12,
        duration: 360,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isBannersVisible]);

  useEffect(() => {
    Animated.timing(bottomSheetY, {
      toValue: bottomSheetVisible ? 0 : 500,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (!bottomSheetVisible) {
        // reset form when sheet fully closed? keep as-is to allow reuse
      }
    });
  }, [bottomSheetVisible]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => { });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => { });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const openBottomSheet = () => setBottomSheetVisible(true);
  const closeBottomSheet = () => {
    setBottomSheetVisible(false);
    setIsFilter(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // === IMPROVED SEARCH FUNCTION ===
  const getFilteredAndSearchedData = () => {
    let data = [];

    // If there's a search query → search across ALL products (ignore current tab)
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      const queryWords = query.split(/\s+/).filter(Boolean);

      // Combine all data sources
      const allProducts = [
        ...loanData,
        ...savingsData,
        ...insuranceData,
        ...investmentData,
      ];

      data = allProducts.filter((item) => {
        const searchableText = [
          item.company?.companyName || item.companyName || "",
          item.name || "",
          item.category || "",
          item.description || "",
          item.productType || "",
          item.policyType || "",
          item.processingTime || "",
          item.interestRateApr ? item.interestRateApr + "%" : "",
          item.expectedReturns ? item.expectedReturns + "%" : "",
          item.minBalance || "",
          item.maxAmount || "",
          item.coverageAmount || "",
          item.minInvestment || "",
          ...(item.benefits || []),
          ...(item.highlights || []),
          ...(item.specialties || []),
        ]
          .join(" ")
          .toLowerCase();

        // Every word in the query must be found somewhere in the text
        return queryWords.every((word) => searchableText.includes(word));
      });

      // Optional: Auto-switch tab to the first result's category (better UX)
      if (data.length > 0 && activeTab !== "All") {
        const firstResultCategory = getCategoryFromItem(data[0]);
        if (firstResultCategory && firstResultCategory !== activeTab) {
          // Auto-switch Tab
          setActiveTab(firstResultCategory);
        }
      }

      return data;
    }

    // No search query → use current tab as before
    switch (activeTab) {
      case "Loans":
        return loanData;
      case "Savings":
        return savingsData;
      case "Insurance":
        return insuranceData;
      case "Investments":
        return investmentData;
      default:
        return [];
    }
  };

  // Helper to normalize category
  const getCategoryFromItem = (item) => {
    const cat = (item?.category || "").toLowerCase().trim();
    if (cat.includes("loan")) return "Loans";
    if (cat.includes("saving")) return "Savings";
    if (cat.includes("insur")) return "Insurance";
    if (cat.includes("invest")) return "Investments";
    return null;
  };

  //filter when you land on the page
  const displayedData = getFilteredAndSearchedData();

  const handleApplyFilters = async () => {
    setIsLoading(true);
    try {
      const response = await suggestSaccosProduct(form);

      if (response && response.success) {
        setSearchResults(response.data); // Save the results
        setSearchModalVisible(true); // OPEN THE MODAL HERE
        setStatusMessage(response.message || "Search complete");
        // setFilterVisible(false);         // Close the filter input sheet
      } else {
        alert("No products found matching your criteria.");
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsLoading(false);
      closeBottomSheet();
    }
  };

  if (filters && typeof filters === "object") {
    const category = filters.category;

    if (category === "All") {
      baseData = allProducts;
    } else if (category === "Loans") {
      baseData = allProducts.filter(
        (i) => (i.category || i._category) === "loan",
      );
    } else if (category === "Insurance") {
      baseData = allProducts.filter(
        (i) => (i.category || i._category) === "insurance",
      );
    } else if (category === "Investments") {
      baseData = allProducts.filter(
        (i) => (i.category || i._category) === "investment",
      );
    }
    // If category is something else or undefined → keep current tab (already set)
  }

  const refreshFilters = () => {
    const newFilters = {
      category: "All",
      productType: "",
      nameOrCompany: "",
      minInterest: "",
      maxInterest: "",
      minTerm: "",
      maxTerm: "",
      otherDetails: "",
      interestRateApr: "",
      minInvestment: "",
      expectedReturns: "",
    };
    setFilters(null);
    setForm(newFilters);
    setIsFilter(false);
  };

  const loadSaccoPromos = async () => {
    try {
      const promos = await fetchSaccosPromos((partialPromos) => {
        setBannerPromos(partialPromos);
      });

      promos.length > 0 && setIsBannersVisible(true); // show banners if we got any promos
    } catch (err) {
      console.error(err);
    }
  };

  const loadInitialSaccos = async () => {
    setIsLoading(true);
    setShowRetry(false);
    try {
      const initialData = await fetchSaccosPaginated(1, 8);
      const newSaccos = Array.isArray(initialData.products)
        ? initialData.products
        : [];
      setAllProducts(newSaccos);
      updateUIFromSaccos(newSaccos);
      setTotalPages(initialData.totalPages);
      setCurrentPage(2);
      setInitialLoadDone(true);
      setIsLoading(false);

      // 2. Start background loading for the rest silently
      if (initialData.totalPages > 1) {
        loadRemainingSaccos(2, initialData.totalPages);
      }
    } catch (err) {
      console.error("Failed to load initial saccos:", err);
      setIsLoading(false);
      setShowRetry(true);
    }
  };

  // 3. Background silent loader
  const loadRemainingSaccos = async (startPage, totalPagesCount) => {
    for (let page = startPage; page <= totalPagesCount; page++) {
      try {
        const pageData = await fetchSaccosPaginated(page, 20);
        const newSaccos = Array.isArray(pageData.products)
          ? pageData.products
          : [];
        setAllProducts((prev) => {
          const updated = [...prev, ...newSaccos];
          updateUIFromSaccos(updated); // Update screen as data arrives
          return updated;
        });
      } catch (err) {
        console.error(`Background load error on page ${page}:`, err);
      }
    }
  };

  // 4. Scroll-to-load handler (for manual triggers)
  const loadMoreSaccos = async () => {
    if (isFetchingMore || currentPage > totalPages) return;
    setIsFetchingMore(true);
    try {
      const pageData = await fetchSaccosPaginated(currentPage, 20);
      const newSaccos = Array.isArray(pageData.products)
        ? pageData.products
        : [];
      setAllProducts((prev) => {
        const updated = [...prev, ...newSaccos];
        updateUIFromSaccos(updated);
        return updated;
      });
      setCurrentPage((prev) => prev + 1);
    } catch (err) {
      console.error("Load more error:", err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  // Helper function to avoid code duplication
  const updateUIFromSaccos = (saccos) => {
    try {
      const loans = saccos.filter((s) => s.category?.toLowerCase() === "loans");
      setLoanData(shuffleArray(loans));

      const insurance = saccos.filter(
        (s) => s.category?.toLowerCase() === "insurance",
      );
      setInsuranceData(shuffleArray(insurance));

      const investments = saccos.filter(
        (s) => s.category?.toLowerCase() === "investments",
      );
      setInvestmentData(shuffleArray(investments));

      const savings = saccos.filter(
        (s) => s.category?.toLowerCase() === "savings",
      );
      setSavingsData(shuffleArray(savings));
    } catch (err) {
      console.error("Error processing saccos:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setShowRetry(false);
    }
  };

  const getCompoundingFrequency = (frequency) => {
    if (!frequency || typeof frequency !== "string") return "";

    const freq = frequency.toLowerCase().trim();

    const frequencyMap = {
      monthly: "pm",
      weekly: "pw",
      yearly: "p.a",
      annually: "p.a",
      daily: "pd",
      quarterly: "pq",
      "bi-weekly": "pbw",
      "bi-monthly": "pbm",
      "semi-annual": "psa",
    };

    return frequencyMap[freq] || "pm";
  };

  // Render Cards
  const renderCard = ({ item }) => {
    // Determine background image source
    const bgSource =
      item.logo ||
      (typeof item.logo === "number"
        ? item.logo
        : { uri: item.company?.logoFile?.url || item.company?.logoDataUrl });

    // Normalize category for easier checking
    const category = item?.category?.toLowerCase() || "";

    // Boolean flags based on the item data itself
    const isLoan = category === "loans";
    const isSavings = category === "savings";
    const isInsurance = category === "insurance";
    const isInvestments = category === "investments";

    // For savings: show Fixed / Variable
    const accountType =
      activeTab === "Savings"
        ? item.accountType ||
        (item.type?.toLowerCase().includes("fixed")
          ? "Fixed Deposit"
          : "Variable Savings")
        : null;

    return (
      <TouchableOpacity
        style={[
          styles.loanCard,
          {
            backgroundColor: theme.colors.background,
            borderColor: item?.company?.themeColor,
          },
        ]}
        onPress={async () => {
          navigation.navigate("LoanDetails", { item: item });
          await logUserActivity({
            userId: user.uid,
            itemId: item._id,
            action: "click",
            itemType: `sacco_${item?.category?.toLowerCase() || "sacco_loans"}`,
          });
        }}
        activeOpacity={0.95}
      >
        {debouncedSearchQuery.trim() && (
          <Text style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
            {getCategoryFromItem(item)}
          </Text>
        )}

        {/* Skewed Background Image Container */}
        <View style={styles.cardBackgroundContainer}>
          <Image
            source={bgSource}
            style={styles.cardBackgroundImage}
            resizeMode="stretch"
          />

          {/* Gradient overlay to enhance the 3D book effect (shadow on the right, light on the protruding left) */}
          <LinearGradient
            colors={[
              "rgba(17, 24, 39, 0.05)", // light on the protruding left edge
              "rgba(17, 24, 39, 0.3)",
              "rgba(17, 24, 39, 0.7)", // shadow at the "spine" (center)
              "rgba(17, 24, 39, 0.95)", // dark on the right side
            ]}
            locations={[0.0, 0.3, 0.5, 1.0]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.cardGradientOverlay}
          />
        </View>

        <View style={styles.cardImageContainer}></View>

        <View style={styles.cardContent}>
          <Text
            style={[styles.cardBank, { color: "#f4f0ff" }]}
            numberOfLines={1}
          >
            {item.companyName || item.company.companyName}
          </Text>
          <Text
            style={[styles.cardType, { color: "#F59E0B" }]}
            numberOfLines={1}
          >
            {item?.name}
          </Text>

          {isLoan && (
            <>
              <View style={styles.cardDetails}>
                <Text style={[styles.cardRate, { color: "#fa6262ff" }]}>
                  {item?.interestRateApr + "%" || 0} interest
                </Text>
                <Text style={[styles.cardMax, { color: "#fff" }]}>
                  {formatCurrency(item?.maxAmount)}
                </Text>
              </View>

              <View style={styles.cardButtons}>
                <TouchableOpacity
                  style={[
                    styles.calcBtn,
                    { backgroundColor: theme.colors.indicator },
                  ]}
                  onPress={async (e) => {
                    e.stopPropagation();
                    navigation.navigate("LoanCalculator", { product: item });
                    await logUserActivity({
                      userId: user.uid,
                      itemId: item._id,
                      action: "Loan Calculator",
                      itemType: "sacco_loans",
                    });
                  }}
                >
                  <Icons.Ionicons
                    name="calculator-outline"
                    size={16}
                    color="#FFF"
                  />
                  <Text style={styles.calcText}>Calculate</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickCalcBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    setQuickCalcLoan(item);
                  }}
                >
                  <Icons.Ionicons name="flash-outline" size={16} color="#FFF" />
                  <Text style={styles.quickCalcText}>Quick EMI</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {isInsurance && (
            <>
              <Text style={[styles.cardRate, { color: "#f81e79ff" }]}>
                Premium: {formatCurrency(item?.monthlyPremium)}/
                {getCompoundingFrequency(item?.compoundingFrequency)}
              </Text>
              <Text style={[styles.cardMax, { color: "#ddd" }]}>
                Cover: Up to {formatCurrency(item?.coverageAmount)}
              </Text>
            </>
          )}

          {isInvestments && (
            <>
              <Text style={[styles.cardRate, { color: "#06be9fff" }]}>
                Min: {formatCurrency(item?.minInvestment)}
              </Text>
              <Text style={[styles.cardMax, { color: "#ddd" }]}>
                Expected: {item?.expectedReturns}%{" "}
                {getCompoundingFrequency(item.expectedReturnsFrequency)}
              </Text>
            </>
          )}

          {isSavings && (
            <>
              <View style={styles.cardDetails}>
                <Text style={[styles.cardRate, { color: "#a89ff8ff" }]}>
                  {item?.interestRateApr}%{" "}
                  {getCompoundingFrequency(item?.interestRateFrequency)}
                </Text>
                <Text style={[styles.cardMax, { color: "#828ff7ff" }]}>
                  Min: {formatCurrency(item?.minBalance)}
                </Text>
              </View>
              <Text style={[styles.cardSubText, { color: "#fff" }]}>
                Account Type: {accountType}
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const introText = `
    Hello, let me give a quick overview of this screen and what you can do with it.
    \n1. You can explore top loan providers, insurance policies, and investment options in Eswatini that are enlisted in this system.
    \n2. You may Use the search bar to quickly find specific financial products as well as their company profile.
    \n3. You may tap on any listing for detailed information, making reviews, and company provider contact options.
    \n4. At each listed financial product you can use the Quick Equated Monthly Installment (EMI) Calculator for instant loan repayment estimates.
    \nAnd last but not least, you can also acquire personalized financial advice by tapping the chat button. Have a good experience, and good bye.
  `;

  const speak = async () => {
    try {
      if (isSpeaking && !isPaused) {
        // Currently speaking, pause
        Speech.stop();
        setIsPaused(true);
        return;
      }

      if (isPaused) {
        const remainingText = introText.substring(currentIndex);

        Speech.speak(remainingText, {
          language: "en-US",
          pitch: 1.0,
          rate: 0.95,
          volume: 1.0,

          onStart: () => {
            setIsSpeaking(true);
            setIsPaused(false);
          },

          onBoundary: (event) => {
            // Track character position
            setCurrentIndex(currentIndex + event.charIndex);
          },

          onDone: () => {
            setIsSpeaking(false);
            setIsPaused(false);
            setCurrentIndex(0);
          },

          onError: (err) => {
            console.log("Speech error:", err);
            setIsSpeaking(false);
            setIsPaused(false);
          },
        });

        return;
      }

      // Not speaking, start
      Speech.speak(introText, {
        language: "en-US",
        voice: "id-id-x-dfz#female_3-local",
        pitch: 1.0,
        rate: 0.95,
        volume: 1.0,

        onStart: () => {
          setIsSpeaking(true);
          setCurrentIndex(0);
        },

        onPause: () => {
          setIsPaused(true);
        },

        onResume: () => {
          setIsPaused(false);
        },

        onBoundary: (event) => {
          setCurrentIndex(event.charIndex);
        },

        onDone: () => {
          setIsSpeaking(false);
          setIsPaused(false);
          setCurrentIndex(0);
        },

        onError: (err) => {
          console.log("Speech error:", err);
          setIsSpeaking(false);
          setIsPaused(false);
        },
      });
    } catch (err) {
      console.log("speak: exception", err);
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const Header = () => (
    <>
      {/* back btn and search */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.Ionicons
            name="arrow-back"
            color={theme.colors.text}
            size={24}
          />
        </TouchableOpacity>

        {/* Search */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Icons.Ionicons
            name="search"
            size={20}
            color={theme.colors.sub_text}
          />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder={`Search ${activeTab}...`}
            placeholderTextColor={theme.colors.sub_text}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Icons.Ionicons name="close-circle" size={20} color="#64748B" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* summary audio-intro play */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.indicator }]}
          onPress={speak}
        >
          {isSpeaking ? (
            isPaused ? (
              <Icons.Ionicons
                name="play-circle-outline"
                size={24}
                color={"#fff"}
              />
            ) : (
              <Icons.Ionicons
                name="pause-circle-outline"
                size={24}
                color={"#fff"}
              />
            )
          ) : (
            <Icons.FontAwesome name="microphone" size={24} color={"#fff"} />
          )}
        </TouchableOpacity>
      </View>

      {/* AI and options */}
      <View style={styles.AIOptions}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 6,
          }}
        >
          {/* banner hiding button (default=[enabled]) */}
          <TouchableOpacity
            style={[styles.Optionsbtn]}
            onPress={() => setIsBannersVisible(!isBannersVisible)}
          >
            <Icons.Feather
              name={isBannersVisible ? "chevrons-up" : "chevrons-down"}
              size={20}
              color={theme.colors.indicator}
            />
            <Text
              style={{
                fontSize: 20,
                fontWeight: 200,
                color: theme.colors.indicator,
              }}
            >
              For-Graps
            </Text>
          </TouchableOpacity>

          {/* options btn for criteria search - bottom bar */}
          <TouchableOpacity
            style={[styles.Optionsbtn]}
            onPress={openBottomSheet}
          >
            <Icons.Ionicons
              name="options-outline"
              size={24}
              color={theme.colors.indicator}
            />
            <Text
              style={{
                fontSize: 20,
                fontWeight: 200,
                color: theme.colors.indicator,
              }}
            >
              Opts
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI button btn for navigating to chat screen */}
        <TouchableOpacity
          style={[styles.AIbtn]}
          onPress={() => navigation.navigate("Chatbot", { context: "" })}
        >
          <Icons.AntDesign name="wechat" size={28} color="#1E40AF" />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ height: bannerHeight, overflow: "hidden" }}>
        <Animated.View
          style={{
            flex: 1,
            opacity: bannerOpacity,
            transform: [{ translateY: bannerTranslate }],
          }}
        >
          {isBannersVisible && (
            <Carousel
              loop={bannerPromos.length > 1}
              width={width}
              autoPlay={bannerPromos.length > 1 && isBannersVisible}
              data={bannerPromos}
              scrollAnimationDuration={3000}
              renderItem={({ item }) => (
                <FinancialPromotion
                  key={item?._id}
                  companyName={item.companyName}
                  productName={item?.productName}
                  companyLogo={
                    item?.companyLogoFile?.url || item?.companyLogoDataUrl
                  }
                  category={item?.productCategory}
                  highlights={item?.highlights || []}
                  headline={item?.headline}
                  description={item?.description}
                  specialties={item?.specialties || []}
                  callToAction={item?.callToAction}
                  validUntil={item?.validUntil}
                  onAction={() =>
                    navigation.navigate("LoanDetails", { item: item.package })
                  }
                />
              )}
            />
          )}
        </Animated.View>
      </Animated.View>

      {/* Tab Bar */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        >
          {["Loans", "Savings", "Insurance", "Investments"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabItem,
                activeTab === tab && {
                  backgroundColor: theme.colors.indicator,
                },
              ]}
              onPress={() => {
                setActiveTab(tab);
                setSearchQuery("");
                setSelectedLoans([]);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab === "Loans"
                  ? "Loans"
                  : tab === "Savings"
                    ? "Savings"
                    : tab === "Insurance"
                      ? "Insurance"
                      : "Investments"}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );

  const ListHeader = () => (
    <>
      {/* Section Title + Compare Button */}
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {activeTab === "Loans"
            ? "Loan Providers"
            : activeTab === "Savings"
              ? "Savings Account"
              : activeTab === "Insurance"
                ? "Insurance Policies"
                : "Investment Parties"}
        </Text>
        {/* refresh screen */}
        {isFilter && (
          <TouchableOpacity
            onPress={refreshFilters}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 6,
              backgroundColor: "#eff2f5ff",
              borderRadius: 20,
            }}
          >
            <Icons.Ionicons
              name="refresh"
              size={20}
              color={theme.colors.sub_text}
            />
            <Text
              style={{
                fontSize: 16,
                color: theme.colors.text,
                fontWeight: "200",
              }}
            >
              Refresh
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadSaccos(); // This will now properly wait until ALL pages are fetched
    } catch (err) {
      console.error("Loading Saccos Error:", err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    handleRefresh();
  }, []);

  if (isOffline) {
    return (
      <View
        style={[
          styles.offlineContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Icons.Ionicons
          name="cloud-offline-outline"
          size={64}
          color={theme.colors.sub_text}
        />
        <Text style={[styles.offlineTitle, { color: theme.colors.sub_text }]}>
          No Internet Connection
        </Text>
        <Text style={[styles.offlineText, { color: theme.colors.sub_text }]}>
          Check your network settings to see the latest gigs on Pomy.
        </Text>
        {/* <TouchableOpacity style={styles.retryButton} onPress={loadGigs}> */}
        <TouchableOpacity
          style={[
            styles.retryButton,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text style={[styles.retryText]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={{ height: 25 }} />

      {Header()}

      {isLoading && <CustomLoader />}

      <Banner
        visible={showRetry}
        actions={[
          {
            label: "Cancel",
            labelStyle: { color: theme.colors.text },
            onPress: () => setShowRetry(false),
          },
          {
            label: "Re-load",
            labelStyle: { color: theme.colors.indicator },
            onPress: () => {
              (loadInitialSaccos(), setShowRetry(false));
            },
          },
        ]}
        icon={({ size }) => (
          <Image
            source={Images.emptyFolder}
            style={{
              width: size,
              height: size,
              backgroundColor: '#f0f4ff',
              borderRadius: 8
            }}
          />
        )}
      >
        Loading took too long. Please try again.
      </Banner>

      <View
        style={{
          backgroundColor: theme.colors.card,
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20,
          flex: 1,
        }}
      >
        <FlatList
          data={displayedData}
          renderItem={renderCard}
          keyExtractor={(item, index) => index.toString()}
          numColumns={isTablet ? 2 : 1}
          columnWrapperStyle={
            isTablet
              ? { justifyContent: "space-between", paddingHorizontal: 10 }
              : null
          }
          contentContainerStyle={{ paddingBottom: 50 }}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={() => (
            <View style={{ alignItems: "center", marginTop: 48 }}>
              <Icons.Ionicons name="search" size={48} color="#9CA3AF" />
              <Text style={{ color: "#9CA3AF", marginTop: 12, fontSize: 16 }}>
                No finds emerged!
              </Text>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              progressBackgroundColor={theme.colors.card}
            />
          }
          onEndReached={loadMoreSaccos} // Load more on scroll
          onEndReachedThreshold={0.5}
          ListFooterComponent={() =>
            (!isLoading && isFetchingMore) ? (
              <ActivityIndicator
                size="large"
                color={theme.colors.primary}
                style={{ marginVertical: 20 }}
              />
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Quick EMI Modal */}
      <QuickCalcModal
        visible={!!quickCalcLoan}
        product={quickCalcLoan}
        onClose={() => setQuickCalcLoan(null)}
        navigation={navigation}
      />

      {/* Animated Bottom Sheet (custom) */}
      {bottomSheetVisible && (
        <Pressable style={styles.sheetOverlay} onPress={closeBottomSheet} />
      )}

      <Modal
        transparent
        visible={bottomSheetVisible}
        animationType="fade"
        onRequestClose={closeBottomSheet}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeBottomSheet}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ width: "100%", justifyContent: "flex-end" }}
          >
            <Animated.View
              style={[
                styles.bottomSheet,
                {
                  backgroundColor: isDarkMode ? "#666" : "#f1f1f1",
                  transform: [{ translateY: bottomSheetY }],
                },
              ]}
            >
              <View style={styles.sheetHandle} />
              <ScrollView
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingBottom: 60,
                }}
                keyboardShouldPersistTaps="handled"
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    marginBottom: 12,
                    color: theme.colors.text,
                  }}
                >
                  Filter Criteria
                </Text>

                <Text
                  style={[
                    styles.sheetLabel,
                    { color: theme.colors.sub_text },
                  ]}
                >
                  Category
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    flexDirection: "row",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  {[
                    "All",
                    "Loans",
                    "Savings",
                    "Insurance",
                    "Investments",
                  ].map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.radioBtn,
                        form.category === c && { backgroundColor: theme.colors.indicator },
                      ]}
                      onPress={() => {
                        LayoutAnimation.easeInEaseOut();
                        setForm((prev) => ({
                          ...prev,
                          category: c,
                          minInterest: "",
                          maxInterest: "",
                          minTerm: "",
                          maxTerm: "",
                          interestRateApr: "",
                          minInvestment: "",
                          expectedReturns: "",
                        }));
                      }}
                    >
                      <Text
                        style={{
                          color: form.category === c ? "#fff" : "#666",
                          fontWeight: "600",
                        }}
                      >
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text
                  style={[
                    styles.sheetLabel,
                    { color: theme.colors.sub_text },
                  ]}
                >
                  Financial Deal Type
                </Text>
                <TextInput
                  value={form.productType}
                  onChangeText={(v) =>
                    setForm((prev) => ({ ...prev, productType: v }))
                  }
                  style={styles.sheetInput}
                  placeholder="e.g. personal, home, life, funeral, unit trust..."
                />

                <Text
                  style={[
                    styles.sheetLabel,
                    { color: theme.colors.sub_text },
                  ]}
                >
                  Company Provider
                </Text>
                <TextInput
                  value={form.nameOrCompany}
                  onChangeText={(v) =>
                    setForm((prev) => ({ ...prev, nameOrCompany: v }))
                  }
                  style={styles.sheetInput}
                  placeholder="Bank or company name"
                />
                {activeCategoryConfig.interestRateApr && (
                  <>
                    <Text
                      style={[
                        styles.sheetLabel,
                        { color: theme.colors.sub_text },
                      ]}
                    >
                      Interest Rate
                    </Text>
                    <TextInput
                      keyboardType="numeric"
                      value={form.interestRateApr}
                      onChangeText={(v) =>
                        setForm((prev) => ({ ...prev, interestRateApr: v }))
                      }
                      style={styles.sheetInput}
                      placeholder="0"
                    />
                  </>
                )}
                {activeCategoryConfig.minInvestment && (
                  <>
                    <Text
                      style={[
                        styles.sheetLabel,
                        { color: theme.colors.sub_text },
                      ]}
                    >
                      Min Investment
                    </Text>
                    <TextInput
                      keyboardType="numeric"
                      value={form.minInvestment}
                      onChangeText={(v) =>
                        setForm((prev) => ({ ...prev, minInvestment: v }))
                      }
                      style={styles.sheetInput}
                      placeholder="0"
                    />
                  </>
                )}
                {activeCategoryConfig.expectedReturns && (
                  <>
                    <Text
                      style={[
                        styles.sheetLabel,
                        { color: theme.colors.sub_text },
                      ]}
                    >
                      Expected Returns
                    </Text>
                    <TextInput
                      keyboardType="numeric"
                      value={form.expectedReturns}
                      onChangeText={(v) =>
                        setForm((prev) => ({ ...prev, expectedReturns: v }))
                      }
                      style={styles.sheetInput}
                      placeholder="0"
                    />
                  </>
                )}

                {activeCategoryConfig.showRate && (
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.sheetLabel,
                          { color: theme.colors.sub_text },
                        ]}
                      >
                        Min Rate / Premium / Return (%)
                      </Text>
                      <TextInput
                        keyboardType="numeric"
                        value={form.minInterest}
                        onChangeText={(v) =>
                          setForm((prev) => ({ ...prev, minInterest: v }))
                        }
                        style={styles.sheetInput}
                        placeholder="e.g. 8"
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.sheetLabel,
                          { color: theme.colors.sub_text },
                        ]}
                      >
                        Max Rate / Premium / Return (%)
                      </Text>
                      <TextInput
                        keyboardType="numeric"
                        value={form.maxInterest}
                        onChangeText={(v) =>
                          setForm((prev) => ({ ...prev, maxInterest: v }))
                        }
                        style={styles.sheetInput}
                        placeholder="e.g. 15"
                      />
                    </View>
                  </View>
                )}

                {activeCategoryConfig.showTerm && (
                  <View
                    style={{ flexDirection: "row", gap: 8, marginTop: 8 }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.sheetLabel,
                          { color: theme.colors.sub_text },
                        ]}
                      >
                        Min Term (months)
                      </Text>
                      <TextInput
                        keyboardType="numeric"
                        value={form.minTerm}
                        onChangeText={(v) =>
                          setForm((prev) => ({ ...prev, minTerm: v }))
                        }
                        style={styles.sheetInput}
                        placeholder="e.g. 12"
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.sheetLabel,
                          { color: theme.colors.sub_text },
                        ]}
                      >
                        Max Term (months)
                      </Text>
                      <TextInput
                        keyboardType="numeric"
                        value={form.maxTerm}
                        onChangeText={(v) =>
                          setForm((prev) => ({ ...prev, maxTerm: v }))
                        }
                        style={styles.sheetInput}
                        placeholder="e.g. 240"
                      />
                    </View>
                  </View>
                )}

                <Text
                  style={[
                    styles.sheetLabel,
                    { color: theme.colors.sub_text },
                  ]}
                >
                  Other Details (Options)
                </Text>
                <TextInput
                  value={form.otherDetails}
                  onChangeText={(v) =>
                    setForm((prev) => ({ ...prev, otherDetails: v }))
                  }
                  textAlignVertical="top"
                  numberOfLines={3}
                  style={[styles.sheetInput, { height: 70 }]}
                  placeholder="instant, no collateral, comprehensive, offshore..."
                />

                <View
                  style={{ flexDirection: "row", gap: 12, marginTop: 16 }}
                >
                  <TouchableOpacity
                    style={[styles.applyBtn, { backgroundColor: theme.colors.indicator }]}
                    onPress={() => {
                      // set the filters object (the filtering runs on render)
                      // setFilters(form);
                      setIsFilter(true);
                      handleApplyFilters();
                    }}
                  >
                    {isFilter ? (
                      <ActivityIndicator color={"#fff"} size={20} />
                    ) : (
                      <Text style={{ color: "#fff", fontWeight: "700" }}>
                        Apply
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.resetBtn}
                    onPress={refreshFilters}
                  >
                    <Text style={{ color: "#111827", fontWeight: "700" }}>
                      Reset
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={false}
        visible={searchModalVisible}
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: isDarkMode ? "#333" : "#fff" },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSearchModalVisible(false)}>
              <Icons.Ionicons
                name="close"
                size={28}
                color={theme.colors.text}
              />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Search Results
            </Text>
            <View style={{ width: 28 }} />
          </View>
          {statusMessage ? (
            <View style={styles.messageContainer}>
              <Text style={styles.statusText}>{statusMessage}</Text>
            </View>
          ) : null}

          {/* Results List */}
          <FlatList
            data={searchResults}
            renderItem={renderCard} // This calls the logic that handles category-specific cards
            keyExtractor={(item, index) => item._id || index.toString()}
            numColumns={isTablet ? 2 : 1}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            ListEmptyComponent={() => (
              <View style={{ alignItems: "center", marginTop: 100 }}>
                <Icons.Ionicons
                  name="search-outline"
                  size={64}
                  color="#D1D5DB"
                />
                <Text
                  style={{
                    color: "#9CA3AF",
                    marginTop: 16,
                    fontSize: 16,
                    fontWeight: "500",
                  }}
                >
                  No matches found for your criteria.
                </Text>
              </View>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

// === STYLES (updated & extended) ===
const styles = StyleSheet.create({
  container: { flex: 1 },
  // offline
  offlineContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  offlineContent: {
    alignItems: "center",
    width: "100%",
  },
  offlineTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 20,
    marginBottom: 10,
  },
  offlineText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  // Tab Bar
  tabBar: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 30,
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 10,
  },
  tabText: { fontSize: 15, fontWeight: "600", color: "#aaabaeff" },
  tabTextActive: { color: "#FFFFFF" },

  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 70,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 1,
  },
  label: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  Optionsbtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 30,
    backgroundColor: "#f0f4ff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    elevation: 1,
    shadowColor: "#1E40AF",
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  AIbtn: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#E0E7FF",
    borderRadius: 8,
    elevation: 8,
    shadowColor: "#1E40AF",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },

  AIOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 8,
  },

  searchContainer: {
    width: width * 0.7,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    marginVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 30,
    borderWidth: 1,
    gap: 1,
    elevation: 1,
  },
  searchInput: { width: width * 0.5, fontSize: 16 },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: 16,
    marginVertical: 12,
  },

  featuredSection: { marginBottom: 16 },
  featuredCard: {
    width: width - 32,
    height: 160,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 16,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    padding: 16,
  },
  featuredContent: { flex: 1, marginLeft: 16 },
  featuredType: { fontSize: 18, fontWeight: "700" },
  featuredBank: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  rateValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginTop: 8,
  },

  maxAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginTop: 4,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 8,
  },

  compareBtn: {
    flexDirection: "row",
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    gap: 6,
  },

  compareBtnText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },
  grid: { paddingBottom: 100 },

  loanCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4, // thicker left border for accent
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    flex: isTablet ? 0.48 : 1,
    marginHorizontal: 8,
    position: "relative",
    overflow: "hidden",
    height: "auto", // slightly taller for better image presence
    backgroundColor: "#fff",
  },

  // Background Image - skewed / protruding effect
  cardBackgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    borderRadius: 14,
    // Perspective on the container allows children to rotate in 3D space
    perspective: 1000,
  },

  cardBackgroundImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    left: "-40%", // Start from the center (halfway across)
    transform: [
      { perspective: 1000 },
      { translateX: width * 0.2 }, // Adjust to center it horizontally relative to the card
      { rotateY: "75deg" }, // The "opened book" angle
      { scale: 1.8 }, // Scale up to ensure it covers the protrusion area
    ],
    opacity: 0.85,
  },

  // Diagonal gradient overlay - stronger on right, softer on left
  cardGradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // Existing small logo (kept on top)
  cardImageContainer: {
    position: "relative",
    marginRight: 16,
    justifyContent: "center",
    alignItems: "center",
    width: 56,
    height: 56,
    zIndex: 3,
    backgroundColor: "transperant",
    borderRadius: 12,
  },

  cardContent: {
    flex: 1,
    justifyContent: "space-between",
    zIndex: 2,
  },

  checkbox: { position: "absolute", top: 12, right: 12, zIndex: 1 },

  cardBank: { fontSize: 14, fontWeight: "600" },
  cardType: { fontSize: 18, fontWeight: "400", marginTop: 2 },
  cardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  cardRate: { fontSize: 18, fontWeight: "700" },
  cardMax: { fontSize: 14, fontWeight: "600" },
  processingTime: { fontSize: 12, color: "#6B7280", marginTop: 4 },

  cardDescription: { fontSize: 12, marginTop: 6, lineHeight: 16 },
  cardSubText: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
    fontWeight: "600",
  },

  cardButtons: { flexDirection: "row", gap: 8, marginTop: 12 },
  calcBtn: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  quickCalcBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F59E0B",
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  calcText: { fontSize: 13, fontWeight: "600", color: "#FFF" },
  quickCalcText: { fontSize: 13, fontWeight: "600", color: "#FFF" },

  // Modal styles (unchanged)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingBottom: 15,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  modalBody: { marginBottom: 16 },
  modalLabel: { fontSize: 14, color: "#6B7280", marginBottom: 6 },
  emiResult: {
    backgroundColor: "#FFF8E1",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  emiLabel: { fontSize: 14, color: "#92400E" },
  emiValue: { fontSize: 24, fontWeight: "800", color: "#B45309" },
  fullCalcBtn: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  fullCalcText: { color: "#FFFFFF", fontWeight: "600", fontSize: 15 },
  sheetOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 480,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  sheetHandle: {
    width: 48,
    height: 6,
    backgroundColor: "#aaa",
    borderRadius: 6,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 10,
  },
  sheetLabel: {
    fontSize: 13,
    marginBottom: 6,
    fontWeight: "600",
  },
  sheetInput: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E6EEF8",
  },
  radioBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F0F4FF",
    borderRadius: 30,
  },
  radioBtnActive: {},
  applyBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  resetBtn: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  messageContainer: {
    backgroundColor: "#FEF3C7", // Light amber background
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  statusText: {
    color: "#92400E",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  companyName: {
    fontSize: 12,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginVertical: 4,
  },
  interestRate: {
    fontSize: 16,
    fontWeight: "700",
    color: "#059669", // Green for rates
  },
  badge: {
    backgroundColor: "#EFF6FF",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    color: "#2563EB",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    color: "#9CA3AF",
  },
});
