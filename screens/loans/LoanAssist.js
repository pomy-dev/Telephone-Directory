"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
  TouchableWithoutFeedback,
  LayoutAnimation, RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Carousel from "react-native-reanimated-carousel";
import * as Speech from 'expo-speech';
import NetInfo from "@react-native-community/netinfo";
import { Icons } from "../../constants/Icons";
import { Images } from "../../constants/Images";
import { AppContext } from "../../context/appContext";
import FinancialPromotion from "../../components/customBanner";
import { fetchSaccos, fetchSaccosPromos } from "../../service/getApi";
import CustomLoader from "../../components/customLoader";

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

// === DATA ===
const savingsDataUn = [
  {
    id: "s1",
    bank: "Standard Bank Eswatini",
    logo: require("../../assets/banks/bank2.png"),
    type: "Premium Savings Account",
    category: "savings",
    interestRate: "5.2%",
    minBalance: "E1,000",
    monthlyFee: "E0",
    featured: true,
    accountType: "Fixed",
    description: "Earn interest on your savings with no hidden charges.",
    processingTime: "Instant",
    location: { lat: -26.3275, long: 31.142 },
    likes: 250,
    reviews: 85,
    companyName: "Standard Bank",
    company: { companyName: "Standard Bank" },
  },
  {
    id: "s2",
    bank: "Nedbank Eswatini",
    logo: require("../../assets/banks/bank1.jpeg"),
    type: "Youth Savings Account",
    category: "savings",
    interestRate: "6.0%",
    minBalance: "E500",
    monthlyFee: "E0",
    featured: true,
    accountType: "Variable",
    description: "Special account for young savers with higher returns.",
    processingTime: "Instant",
    location: { lat: -26.305, long: 31.1365 },
    likes: 180,
    reviews: 62,
    companyName: "Nedbank",
    company: { companyName: "Nedbank" },
  },
  {
    id: "s3",
    bank: "FNB Eswatini",
    logo: require("../../assets/banks/bank3.jpeg"),
    type: "Goal Savings Account",
    category: "savings",
    interestRate: "4.8%",
    minBalance: "E2,000",
    monthlyFee: "E0",
    featured: false,
    accountType: "Variable",
    description:
      "Set savings goals and earn interest while building your fund.",
    processingTime: "Instant",
    location: { lat: -26.318, long: 31.145 },
    likes: 140,
    reviews: 48,
    companyName: "FNB",
    company: { companyName: "FNB" },
  },
  {
    id: "s4",
    bank: "Swazi Bank",
    logo: require("../../assets/banks/bank2.png"),
    type: "Fixed Deposit Account",
    category: "savings",
    interestRate: "7.5%",
    minBalance: "E5,000",
    monthlyFee: "E0",
    featured: false,
    accountType: "Fixed",
    description:
      "Lock your funds for guaranteed returns with higher interest rates.",
    processingTime: "1-2 days",
    location: { lat: -26.32, long: 31.15 },
    likes: 200,
    reviews: 71,
    companyName: "Swazi Bank",
    company: { companyName: "Swazi Bank" },
  },
];

const bannerPromos = [
  {
    id: "loan-001",
    category: "loan",
    companyLogo: Images.bank1,
    package: {
      id: "2",
      bank: "Standard Bank",
      logo: require("../../assets/banks/bank2.png"),
      type: "Home Loan",
      category: "loan",
      rate: "8.25%",
      max: "E2,500,000",
      term: "Up to 20 years",
      featured: true,
      description: "Build or buy your dream home.",
      processingTime: "3–5 days",
      location: { lat: -26.305, long: 31.1365 },
      likes: 200,
      reviews: 60,
    },
    name: "Home Loan",
    subtype: "Prime Property",
    keyBenefits: [
      "Up to 100% financing",
      "Low interest from 9.25%",
      "Flexible repayment up to 30 years",
      "No deposit required for qualifying applicants",
    ],
    minAmount: "R800,000",
    interestRate: "from 9.25%",
    ctaLabel: "Apply Now",
  },
  {
    id: "loan-002",
    category: "loan",
    companyLogo: Images.bank2,
    package: {
      id: "5",
      bank: "Swazi MTN MoMo",
      logo: require("../../assets/banks/bank2.png"),
      type: "Micro Loan",
      category: "loan",
      rate: "15.0%",
      max: "E5,000",
      term: "30 days",
      featured: false,
      description: "Instant cash via phone.",
      processingTime: "5 mins",
      location: { lat: -26.33, long: 31.14 },
      likes: 300,
      reviews: 75,
    },
    name: "Personal Loan",
    subtype: "Quick Cash",
    keyBenefits: [
      "Approval in minutes",
      "No collateral needed",
      "Up to R250,000",
      "Repay over 6–60 months",
    ],
    minAmount: "R5,000",
    interestRate: "from 14.9%",
    ctaLabel: "Get Funds",
  },
  {
    id: "inv-001",
    category: "investment",
    companyLogo: Images.bank3,
    package: {
      id: "v1",
      company: "Eswatini Stock Exchange",
      logo: require("../../assets/banks/bank2.png"),
      type: "Shares & ETFs",
      category: "investment",
      min: "E1,000",
      returns: "8–15% p.a.",
      featured: true,
      location: { lat: -26.3275, long: 31.142 },
      likes: 190,
      reviews: 48,
    },
    name: "Balanced Growth Fund",
    subtype: "Long-term",
    keyBenefits: [
      "Historical returns 8–12% p.a.",
      "Diversified across shares & bonds",
      "No lock-in period",
      "Expert fund management",
    ],
    minAmount: "R1,000",
    expectedReturn: "8–12% p.a.",
    ctaLabel: "Start Investing",
  },
  {
    id: "ins-001",
    category: "insurance",
    companyLogo: Images.bank3,
    package: {
      id: "i2",
      company: "Old Mutual",
      logo: require("../../assets/banks/bank1.jpeg"),
      type: "Life Cover",
      category: "insurance",
      cover: "E1M+",
      premium: "From E280/pm",
      featured: true,
      location: { lat: -26.305, long: 31.1365 },
      likes: 220,
      reviews: 65,
    },
    name: "Family Life Cover",
    subtype: "Comprehensive",
    keyBenefits: [
      "Cover from R500,000 to R10,000,000",
      "Pays out on death or disability",
      "Premiums from R220/month",
      "Funeral benefit included",
    ],
    monthlyCost: "from R220",
    ctaLabel: "Get Quote",
  },
  {
    id: "ins-002",
    category: "insurance",
    companyLogo: Images.bank2,
    package: {
      id: "i4",
      company: "Momentum",
      logo: require("../../assets/banks/bank2.png"),
      type: "Car Insurance",
      category: "insurance",
      cover: "Comprehensive",
      premium: "From E650/pm",
      featured: false,
      location: { lat: -26.32, long: 31.15 },
      likes: 160,
      reviews: 55,
    },
    name: "Hospital Cash Plan",
    subtype: "Daily Benefit",
    keyBenefits: [
      "Up to R2,000 per day in hospital",
      "No medical test required",
      "Covers you + family",
      "Pays directly to your account",
    ],
    monthlyCost: "from R145",
    ctaLabel: "Join Today",
  },
];

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

  const format = (v) =>
    `E${v.toLocaleString("en-SZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
              navigation.navigate("LoanCalculator");
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
export default function FinancialHubScreen({ navigation }) {
  const [isOffline, setIsOffline] = useState(false);
  const { theme, isDarkMode } = React.useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Loans");
  const [loanData, setLoanData] = useState([]);
  const [savingsData, setSavingsData] = useState([]);
  const [insuranceData, setInsuranceData] = useState([]);
  const [investmentData, setInvestmentData] = useState([]);
  const [bannerPromos, setBannerPromos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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
  const [form, setForm] = useState({
    category: "All",
    productType: "",
    nameOrCompany: "",
    minInterest: "",
    maxInterest: "",
    minTerm: "",
    maxTerm: "",
    otherDetails: "",
    interestRateApr:"",    
    minInvestment:'',
    expectedReturns:"",
  });
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
      minInvestment:true,
      expectedReturns:true,
    },
  };

  const activeCategoryConfig =
    categoryFieldConfig[form.category] || categoryFieldConfig.All;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });

    loadSaccos();
    loadSaccoPromos();
    return () => unsubscribe();
  }, []);

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

  // fetch saccos on mount (for future use)
  useEffect(() => {
    const loadSaccos = async () => {
      try {
        const saccos = await fetchSaccos();
        // =================== filter by category ======================== //
        // select loans
        const loans = saccos.filter(
          (s) => s.category && s.category.toLowerCase() === "loans",
        );
        setLoanData(loans);

        // select insurance
        const insurance = saccos.filter(
          (s) => s.category && s.category.toLowerCase() === "insurance",
        );
        setInsuranceData(insurance);

        // select investments
        const investments = saccos.filter(
          (s) => s.category && s.category.toLowerCase() === "investments",
        );
        setInvestmentData(investments);

        // select savings
        const savings = saccos.filter(
          (s) => s.category && s.category.toLowerCase() === "savings",
        );
        setSavingsData(savingsDataUn);

        // console.log("Saccos loaded:", saccos.length);
      } catch (err) {
        console.log("Failed to load saccos:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSaccos();
  }, []);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {});
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {});

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

  const getFilteredAndSearchedData = () => {
    // Start from current tab
    let data =
      activeTab === "Loans"
        ? loanData
        : activeTab === "Savings"
          ? savingsData
          : activeTab === "Insurance"
            ? insuranceData
            : activeTab === "Investments"
              ? investmentData
              : [];

    // 1. Bottom sheet category override (optional — only if user really wants to switch)
    if (filters?.category && filters.category !== "All") {
      if (filters.category === "Loans") data = loanData;
      else if (filters.category === "Insurance") data = insuranceData;
      else if (filters.category === "Investments") data = investmentData;
    }

    // 2. Apply structured filters
    if (filters) {
      data = data.filter((item) => {
        // Product type
        if (filters.productType) {
          const typeStr = (item.type || item.name || "").toLowerCase();
          if (!typeStr.includes(filters.productType.toLowerCase()))
            return false;
        }

        // Name / Company
        if (filters.nameOrCompany) {
          const nameStr = (item.bank || item.company || "").toLowerCase();
          if (!nameStr.includes(filters.nameOrCompany.toLowerCase()))
            return false;
        }

        // Interest / Rate / Premium / Return
        if (filters.minInterest || filters.maxInterest) {
          const rateStr =
            item.rate ||
            item.returns ||
            item.premium ||
            item.interestRate ||
            "";
          const rateNum = parseNumberFromString(rateStr); // improve this parser!
          if (rateNum === null) return false;

          if (filters.minInterest && rateNum < parseFloat(filters.minInterest))
            return false;
          if (filters.maxInterest && rateNum > parseFloat(filters.maxInterest))
            return false;
        }

        // Term in months
        if (filters.minTerm || filters.maxTerm) {
          const termMonths = parseTermToMonths(item.term || "");
          if (termMonths === null) return true; // be lenient if no term

          if (filters.minTerm && termMonths < parseInt(filters.minTerm))
            return false;
          if (filters.maxTerm && termMonths > parseInt(filters.maxTerm))
            return false;
        }

        // Free text match (more fields!)
        if (filters.otherDetails) {
          const query = filters.otherDetails.toLowerCase();
          const text = [
            item.description || "",
            ...(item.keyBenefits || []),
            item.processingTime || "",
            item.type || "",
            item.subtype || "",
          ]
            .join(" ")
            .toLowerCase();

          if (!text.includes(query)) return false;
        }

        return true;
      });
    }

    // 3. Apply search bar (always last)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      data = data.filter((item) => {
        const text = [
          item.bank || item.company || "",
          item.type || item.name || "",
          item.description || "",
          item.processingTime || "",
        ]
          .join(" ")
          .toLowerCase();
        return text.includes(q);
      });
    }

    return data;
  };

  //filter when you land on the page
  const displayedData = getFilteredAndSearchedData();

  // Helpers for parsing numeric values from strings
  const parseNumberFromString = (str) => {
    if (!str) return null;
    // Take the first realistic number (ignore % , p.a. etc)
    const match = str.match(/(\d+[.,]?\d*)/);
    return match ? parseFloat(match[1].replace(",", ".")) : null;
  };

  const parseTermToMonths = (str) => {
    if (!str) return null;
    const s = str
      .toLowerCase()
      .replace(/up to|maximum|approx/gi, "")
      .trim();

    const numMatch = s.match(/(\d+[.,]?\d*)/);
    if (!numMatch) return null;

    let num = parseFloat(numMatch[1].replace(",", "."));
    if (s.includes("year") || s.includes("yr")) num *= 12;
    if (s.includes("day")) num /= 30; // rough

    return Math.round(num);
  };

  // === FILTERING LOGIC (SAFER + DEBUG-FRIENDLY) ===
  const allProducts = [...loanData, ...savingsData, ...insuranceData, ...investmentData].map(item => ({
    ...item,
    _category: item.category || (item.name ? 'insurance' : 'loan')
  }));

  // Helper: apply everything EXCEPT category
  // const applyNonCategoryFilters = (data) => {
  //   if (!filters || !Array.isArray(data)) return data || [];  // safety

  //   return data.filter(item => {
  //     // Product type
  //     if (filters.productType) {
  //       const t = (item.type || item.name || '').toLowerCase();
  //       if (!t.includes(filters.productType.toLowerCase())) return false;
  //     }

  //     // Name / Company
  //     if (filters.nameOrCompany) {
  //       const n = ((item.bank || item.company || item.name) + '').toLowerCase();
  //       if (!n.includes(filters.nameOrCompany.toLowerCase())) return false;
  //     }

  //     // Interest rate
  //     const itemRate = parseNumberFromString(
  //       item.rate || item.returns || item.premium || item.interestRate || ''
  //     );
  //     if (filters.minInterest) {
  //       const minI = parseFloat(filters.minInterest);
  //       if (itemRate === null || itemRate < minI) return false;
  //     }
  //     if (filters.maxInterest) {
  //       const maxI = parseFloat(filters.maxInterest);
  //       if (itemRate === null || itemRate > maxI) return false;
  //     }

  //     // Term (months)
  //     const itemTerm = parseTermToMonths(item.term || '');
  //     if (filters.minTerm) {
  //       const minT = parseInt(filters.minTerm, 10);
  //       if (itemTerm === null || itemTerm < minT) return false;
  //     }
  //     if (filters.maxTerm) {
  //       const maxT = parseInt(filters.maxTerm, 10);
  //       if (itemTerm === null || itemTerm > maxT) return false;
  //     }

  //     // Other details
  //     if (filters.otherDetails) {
  //       const od = filters.otherDetails.toLowerCase();
  //       const desc = (item.description || '').toLowerCase();
  //       const benefits = (item.keyBenefits || []).join(' ').toLowerCase();
  //       const timeProcessing = (item.processingTime || '').toLowerCase();
  //       if (!desc.includes(od) && !benefits.includes(od) && !timeProcessing.includes(od)) {
  //         return false;
  //       }
  //     }

  //     return true;
  //   });
  // };

  // Determine base dataset — always an array
  // const currentDataLocal = activeTab === "Insurance"
  //   ? insuranceData : activeTab === "Investments"
  //     ? investmentData : loanData;
  // let baseData = currentDataLocal || [];

  // Inside your submission handler in LoanAssist.js

  //   const handleApplyFilters = async () => {
  //   console.log("--- Filter Process Started ---");
  //   setIsLoading(true);
  //   setStatusMessage("");

  //   try {
  //     console.log('Calling suggestSaccosProduct with form:', form);

  //     // Safety check: ensure form isn't null
  //     if (!form) throw new Error("Form data is missing");

  //     const response = await suggestSaccosProduct(form);

  //     console.log("API Response received successfully");

  //     if (response && response.success) {
  //       const results = response.data || [];

  //       if (form.category === "All") {
  //         console.log("Updating all categories...");
  //         setLoanData(results.filter((p) => p.category?.toLowerCase() === "loans"));
  //         setInsuranceData(results.filter((p) => p.category?.toLowerCase() === "insurance"));
  //         setInvestmentData(results.filter((p) => p.category?.toLowerCase() === "investments"));
  //         setSavingsData(results.filter((p) => p.category?.toLowerCase() === "savings"));
  //       } else {
  //         console.log(`Updating specific tab: ${activeTab}`);
  //         const setterMap = {
  //           Loans: setLoanData,
  //           Insurance: setInsuranceData,
  //           Investments: setInvestmentData,
  //           Savings: setSavingsData,
  //         };

  //         // Safety check for setterMap
  //         if (setterMap[activeTab]) {
  //           setterMap[activeTab](results);
  //         } else {
  //           console.warn(`No setter found for tab: ${activeTab}`);
  //         }
  //       }

  //       console.log("Server Message:", response.message);
  //       setStatusMessage(response.message || "Search complete");
  //       setBottomSheetVisible(false);
  //     } else {
  //       console.log("Response was not successful:", response);
  //     }

  //   } catch (error) {
  //     // This MUST log if the network fails
  //     console.error("CRITICAL Filter Error:", error);
  //     setStatusMessage("Could not connect to the server.");
  //   } finally {
  //     // This will now definitely run unless the app itself crashes
  //     console.log('--- Finally Block: Closing loading indicator ---');
  //     setIsLoading(false);
  //   }
  // };

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

  // Apply the rest of the filters
  // const filteredBase = applyNonCategoryFilters(baseData);

  // Final displayed data (with search bar on top)
  // const displayedData = filteredBase.filter(item => {
  //   const search = searchQuery.toLowerCase();
  //   if (!search) return true;

  //   const name = (item.bank || item.company || item.name || '').toLowerCase();
  //   const type = (item.type || item.name || '').toLowerCase();
  //   const category = (item.category || item._category || '').toLowerCase();

  //   return name.includes(search) || type.includes(search) || category.includes(search);
  // });

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
      interestRateApr:"",    
      minInvestment:'',
      expectedReturns:"",
    };
    setFilters(null);
    setForm(newFilters);
    setIsFilter(false);
  };

  // Filter logic per tab
  // const getCurrentData = () => {
  //   if (activeTab === "Insurance") return insuranceData;
  //   if (activeTab === "Investments") return investmentData;
  //   return loanData;
  // };

  // const currentData = getCurrentData();

  // base search (search bar) applied before or along with filters
  // const searchedData = currentData.filter(item => {
  //   const search = searchQuery.toLowerCase();
  //   const name = (item.bank || item.company || "").toLowerCase();
  //   const type = (item.type || "").toLowerCase();
  //   const category = (item.category || "").toLowerCase();
  //   return search === "" || name.includes(search) || type.includes(search) || category.includes(search);
  // });

  const loadSaccos = async () => {
    try {
      // For refresh, we can keep loading state separate
      const saccos = await fetchSaccos((partialSaccos) => {
        // This runs multiple times as pages load → good for progressive update
        updateUIFromSaccos(partialSaccos);
      });

      // Final update with complete data (optional but recommended)
      updateUIFromSaccos(saccos);

    } catch (err) {
      console.error("Failed to load saccos:", err);
      // Optionally show toast/error message to user
    }
  };

  const loadSaccoPromos = async () => {
    try {
      const promos = await fetchSaccosPromos((partialPromos) => {
        setBannerPromos(partialPromos);
      });

      promos && setIsBannersVisible(true); // show banners if we got any promos
      // console.log("Loaded promos:", promos);
    } catch (err) {
      console.error(err);
    }
  };

  // Helper function to avoid code duplication
  const updateUIFromSaccos = (saccos) => {
    try {
      const loans = saccos.filter(s => s.category?.toLowerCase() === "loans");
      setLoanData(shuffleArray(loans));

      const insurance = saccos.filter(s => s.category?.toLowerCase() === "insurance");
      setInsuranceData(shuffleArray(insurance));

      const investments = saccos.filter(s => s.category?.toLowerCase() === "investments");
      setInvestmentData(shuffleArray(investments));

      const savings = saccos.filter(s => s.category?.toLowerCase() === "savings");
      setSavingsData(shuffleArray(savingsDataUn));        // Fixed!
    } catch (err) {
      console.error("Error processing saccos:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const getCompoundingFrequency = (frequency) => {
    if (!frequency || typeof frequency !== 'string') return '';

    const freq = frequency.toLowerCase().trim();

    const frequencyMap = {
      'monthly': 'pm',
      'weekly': 'pw',
      'yearly': 'p.a',
      'annually': 'p.a',
      'daily': 'pd',
      'quarterly': 'pq',
      'bi-weekly': 'pbw',
      'bi-monthly': 'pbm',
      'semi-annual': 'psa',
    };

    return frequencyMap[freq] || '';
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
        onPress={() => navigation.navigate("LoanDetails", { item: item })}
        activeOpacity={0.95}
      >
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
            {item?.name || item?.type}
          </Text>

          {isLoan && (
            <>
              <View style={styles.cardDetails}>
                <Text style={[styles.cardRate, { color: "#fa6262ff" }]}>{item?.interestRateApr + '%' || 0} interest</Text>
                <Text style={[styles.cardMax, { color: theme.colors.text }]}>E{item?.maxAmount}</Text>
              </View>
              <Text style={[styles.processingTime, { color: "#fff" }]}>
                Processing Time: {item?.processingTime}
              </Text>

              <View style={styles.cardButtons}>
                <TouchableOpacity
                  style={[
                    styles.calcBtn,
                    { backgroundColor: theme.colors.indicator },
                  ]}
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate("LoanCalculator");
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
              <Text style={[styles.cardRate, { color: "#f81e79ff" }]}>Premium: E{item?.monthlyPremium}/{getCompoundingFrequency(item?.compoundingFrequency)}</Text>
              <Text style={[styles.cardMax, { color: '#ddd' }]}>Cover: Up to E{item?.coverageAmount}</Text>
            </>
          )}

          {isInvestments && (
            <>
              <Text style={[styles.cardRate, { color: "#06be9fff" }]}>Min: E{item?.minInvestment}</Text>
              <Text style={[styles.cardMax, { color: '#ddd' }]}>Expected: {item?.expectedReturns}% {getCompoundingFrequency(item.compoundingFrequency)}</Text>
            </>
          )}

          {isSavings && (
            <>
              <View style={styles.cardDetails}>
                <Text style={[styles.cardRate, { color: "#a89ff8ff" }]}>{item?.interestRate} {getCompoundingFrequency(item.compoundingFrequency)}</Text>
                <Text style={[styles.cardMax, { color: '#828ff7ff' }]}>Min: E{item?.minBalance}</Text>
              </View>
              <Text style={[styles.processingTime, { color: '#f4f0ff' }]}>Service Fee: {item?.monthlyFee}/{getCompoundingFrequency(item.compoundingFrequency)}</Text>
              <Text style={[styles.cardSubText, { color: '#fff' }]}>Account Type: {accountType}</Text>
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
    \nAnd last but not least, you can also access personalized financial advice by tapping the Ask AI button. Have a good experience, and good bye.
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
          marginBottom: 8,
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
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Icons.Ionicons name="search" size={20} color={theme.colors.sub_text} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeTab === "Loans" ? "banks/loans" : activeTab === "Savings" ? "Savings Account" : activeTab === "Insurance" ? "insurers" : "investments"}...`}
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
      </View>

      {/* AI and options */}
      <View style={styles.AIOptions}>
        <View style={{ alignItems: "center" }}>
          {/* summary audio-intro play */}
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.indicator }]} onPress={speak}>
            {isSpeaking ?
             ( isPaused ? (
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
            <Text style={styles.label}>
              {isSpeaking ? "Pause" : "Quick Overview"}
            </Text>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 12,
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
        </View>

        {/* AI button btn for navigating to chat screen */}
        <TouchableOpacity style={[styles.AIbtn]} onPress={() => navigation.navigate('Chatbot', { context: '' })}>
          <Icons.MaterialCommunityIcons name="face-agent" size={28} color="#1E40AF" />
          <Text style={{ fontSize: 20, fontWeight: 200, color: theme.colors.indicator }}>Ask AI</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={{ height: bannerHeight, overflow: 'hidden' }}>
        <Animated.View style={{ flex: 1, opacity: bannerOpacity, transform: [{ translateY: bannerTranslate }] }}>

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
                  companyLogo={item?.companyLogoFile?.url || item?.companyLogoDataUrl}
                  category={item?.productCategory}
                  highlights={item?.highlights || []}
                  headline={item?.headline}
                  description={item?.description}
                  specialties={item?.specialties || []}
                  callToAction={item?.callToAction}
                  validUntil={item?.validUntil}
                  onAction={() => navigation.navigate("LoanDetails", { item: item.package })}
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
                activeTab === tab && styles.tabItemActive,
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
      await loadSaccos();        // This will now properly wait until ALL pages are fetched
    } catch (err) {
      console.error('Loading Saccos Error:', err.message);
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
        <Text
          style={[styles.offlineSubtitle, { color: theme.colors.sub_text }]}
        >
          Check your network settings to see the latest gigs on Pomy.
        </Text>
        {/* <TouchableOpacity style={styles.retryButton} onPress={loadGigs}> */}
        <TouchableOpacity
          style={[
            styles.retryButton,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text style={[styles.retryText, { color: theme.colors.sub_text }]}>Retry</Text>
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
          keyExtractor={(item, index) => index}
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
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.bottomSheet,
                  { transform: [{ translateY: bottomSheetY }] },
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
                    }}
                  >
                    Filter Criteria
                  </Text>

                  <Text style={styles.sheetLabel}>Category</Text>
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
                          form.category === c && styles.radioBtnActive,
                        ]}
                        onPress={() =>{
                          LayoutAnimation.easeInEaseOut();
                          setForm((prev) => ({
                            ...prev,
                            category: c,
                            minInterest: "",
                            maxInterest: "",
                            minTerm: "",
                            maxTerm: "",
                            interestRateApr:"",    
                            minInvestment:'',
                            expectedReturns:"",
                          }))
                        }}
                      >
                        <Text
                          style={{
                            color: form.category === c ? "#fff" : "#374151",
                            fontWeight: "600",
                          }}
                        >
                          {c}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={styles.sheetLabel}>Product type</Text>
                  <TextInput
                    value={form.productType}
                    onChangeText={(v) =>
                      setForm((prev) => ({ ...prev, productType: v }))
                    }
                    style={styles.sheetInput}
                    placeholder="e.g. personal, home, life, funeral, unit trust..."
                  />

                  <Text style={styles.sheetLabel}>Name / Company</Text>
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
                        <Text style={styles.sheetLabel}>Interest Rate</Text>
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
                        <Text style={styles.sheetLabel}>Min Investment</Text>
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
                        <Text style={styles.sheetLabel}>Expected Returns</Text>
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
                        <Text style={styles.sheetLabel}>
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
                        <Text style={styles.sheetLabel}>
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
                        <Text style={styles.sheetLabel}>Min Term (months)</Text>
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
                        <Text style={styles.sheetLabel}>Max Term (months)</Text>
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

                  <Text style={styles.sheetLabel}>Other Details (Options)</Text>
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
                      style={styles.applyBtn}
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
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={false}
        visible={searchModalVisible}
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSearchModalVisible(false)}>
              <Icons.Ionicons name="close" size={28} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Search Results</Text>
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
    width: '100%', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 70, gap: 8, shadowColor: '#000',
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
    gap: 4,
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
    paddingHorizontal: 16,
    gap: 8,
    justifyContent: "center",
    marginBottom: 8,
  },

  searchContainer: {
    flexDirection: "row", alignItems: "center",
    margin: 16, paddingHorizontal: 16, borderRadius: 30,
    borderWidth: 1, gap: 8,
    elevation: 1
  },
  searchInput: { flex: 1, fontSize: 16, color: "#111827" },

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
  cardDetails: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
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
    backgroundColor: "#fff",
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
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 10,
  },
  sheetLabel: {
    fontSize: 13,
    color: "#374151",
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
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
  },
  radioBtnActive: { backgroundColor: "#111827" },
  applyBtn: {
    flex: 1,
    backgroundColor: "#111827",
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
    backgroundColor: "#F9FAFB",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
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
