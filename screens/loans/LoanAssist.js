"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput,
  Dimensions, Animated, Modal, Pressable, ActivityIndicator, ScrollView,
  KeyboardAvoidingView, Platform
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import * as Speech from 'expo-speech';
import { Icons } from "../../constants/Icons";
import { Images } from '../../constants/Images';
import { AppContext } from "../../context/appContext";
import FinancialBanner from "../../components/customBanner";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

// === DATA ===
const loanData = [
  { id: "1", bank: "Nedbank Eswatini", logo: require("../../assets/banks/bank1.jpeg"), type: "Personal Loan", category: 'loan', rate: "9.5%", max: "E150,000", term: "Up to 60 months", featured: true, description: "Flexible personal loans.", processingTime: "24 hours", location: { lat: -26.3275, long: 31.1420 }, likes: 120, reviews: 45 },
  { id: "2", bank: "Standard Bank", logo: require("../../assets/banks/bank2.png"), type: "Home Loan", category: 'loan', rate: "8.25%", max: "E2,500,000", term: "Up to 20 years", featured: true, description: "Build or buy your dream home.", processingTime: "3–5 days", location: { lat: -26.3050, long: 31.1365 }, likes: 200, reviews: 60 },
  { id: "3", bank: "FNB Eswatini", logo: require("../../assets/banks/bank3.jpeg"), type: "Business Loan", category: 'loan', rate: "11.0%", max: "E500,000", term: "Up to 84 months", featured: false, description: "Grow your business.", processingTime: "48 hours", location: { lat: -26.3180, long: 31.1450 }, likes: 150, reviews: 30 },
  { id: "4", bank: "Eswatini Bank", logo: require("../../assets/banks/bank1.jpeg"), type: "Vehicle Finance", category: 'loan', rate: "10.2%", max: "E300,000", term: "Up to 72 months", featured: false, description: "Drive away today.", processingTime: "24 hours", location: { lat: -26.3200, long: 31.1500 }, likes: 80, reviews: 20 },
  { id: "5", bank: "Swazi MTN MoMo", logo: require("../../assets/banks/bank2.png"), type: "Micro Loan", category: 'loan', rate: "15.0%", max: "E5,000", term: "30 days", featured: false, description: "Instant cash via phone.", processingTime: "5 mins", location: { lat: -26.3300, long: 31.1400 }, likes: 300, reviews: 75 },
];

const insuranceData = [
  { id: "i1", company: "Swaziland Insurance", logo: require("../../assets/banks/bank2.png"), type: "Medical Aid", category: 'insurance', cover: "Up to E500k", premium: "From E420/pm", featured: true, location: { lat: -26.3275, long: 31.1420 }, likes: 180, reviews: 50 },
  { id: "i2", company: "Old Mutual", logo: require("../../assets/banks/bank1.jpeg"), type: "Life Cover", category: 'insurance', cover: "E1M+", premium: "From E280/pm", featured: true, location: { lat: -26.3050, long: 31.1365 }, likes: 220, reviews: 65 },
  { id: "i3", company: "Liberty Eswatini", logo: require("../../assets/banks/bank3.jpeg"), type: "Funeral Plan", category: 'insurance', cover: "E50,000", premium: "E95/pm", featured: false, location: { lat: -26.3180, long: 31.1450 }, likes: 140, reviews: 40 },
  { id: "i4", company: "Momentum", logo: require("../../assets/banks/bank2.png"), type: "Car Insurance", category: 'insurance', cover: "Comprehensive", premium: "From E650/pm", featured: false, location: { lat: -26.3200, long: 31.1500 }, likes: 160, reviews: 55 },
];

const investmentData = [
  { id: "v1", company: "Eswatini Stock Exchange", logo: require("../../assets/banks/bank2.png"), type: "Shares & ETFs", category: 'investment', min: "E1,000", returns: "8–15% p.a.", featured: true, location: { lat: -26.3275, long: 31.1420 }, likes: 190, reviews: 48 },
  { id: "v2", company: "Nedbank Wealth", logo: require("../../assets/banks/bank3.jpeg"), type: "Unit Trusts", category: 'investment', min: "E5,000", returns: "7–12% p.a.", featured: true, location: { lat: -26.3050, long: 31.1365 }, likes: 210, reviews: 52 },
  { id: "v3", company: "Stanlib Eswatini", logo: require("../../assets/banks/bank1.jpeg"), type: "Fixed Deposits", category: 'investment', min: "E10,000", returns: "9.2% p.a.", featured: false, location: { lat: -26.3180, long: 31.1450 }, likes: 130, reviews: 35 },
  { id: "v4", company: "Allan Gray", logo: require("../../assets/banks/bank3.jpeg"), type: "Offshore Funds", category: 'investment', min: "E50,000", returns: "10–18% p.a.", featured: false, location: { lat: -26.3200, long: 31.1500 }, likes: 170, reviews: 60 },
];

const bannerPromos = [
  {
    id: 'loan-001',
    category: 'loan',
    companyLogo: Images.bank1,
    package: { id: "2", bank: "Standard Bank", logo: require("../../assets/banks/bank2.png"), type: "Home Loan", category: 'loan', rate: "8.25%", max: "E2,500,000", term: "Up to 20 years", featured: true, description: "Build or buy your dream home.", processingTime: "3–5 days", location: { lat: -26.3050, long: 31.1365 }, likes: 200, reviews: 60 },
    name: 'Home Loan',
    subtype: 'Prime Property',
    keyBenefits: [
      'Up to 100% financing',
      'Low interest from 9.25%',
      'Flexible repayment up to 30 years',
      'No deposit required for qualifying applicants'
    ],
    minAmount: 'R800,000',
    interestRate: 'from 9.25%',
    ctaLabel: 'Apply Now'
  },
  {
    id: 'loan-002',
    category: 'loan',
    companyLogo: Images.bank2,
    package:
      { id: "5", bank: "Swazi MTN MoMo", logo: require("../../assets/banks/bank2.png"), type: "Micro Loan", category: 'loan', rate: "15.0%", max: "E5,000", term: "30 days", featured: false, description: "Instant cash via phone.", processingTime: "5 mins", location: { lat: -26.3300, long: 31.1400 }, likes: 300, reviews: 75 },
    name: 'Personal Loan',
    subtype: 'Quick Cash',
    keyBenefits: [
      'Approval in minutes',
      'No collateral needed',
      'Up to R250,000',
      'Repay over 6–60 months'
    ],
    minAmount: 'R5,000',
    interestRate: 'from 14.9%',
    ctaLabel: 'Get Funds'
  },
  {
    id: 'inv-001',
    category: 'investment',
    companyLogo: Images.bank3,
    package: { id: "v1", company: "Eswatini Stock Exchange", logo: require("../../assets/banks/bank2.png"), type: "Shares & ETFs", category: 'investment', min: "E1,000", returns: "8–15% p.a.", featured: true, location: { lat: -26.3275, long: 31.1420 }, likes: 190, reviews: 48 },
    name: 'Balanced Growth Fund',
    subtype: 'Long-term',
    keyBenefits: [
      'Historical returns 8–12% p.a.',
      'Diversified across shares & bonds',
      'No lock-in period',
      'Expert fund management'
    ],
    minAmount: 'R1,000',
    expectedReturn: '8–12% p.a.',
    ctaLabel: 'Start Investing'
  },
  {
    id: 'ins-001',
    category: 'insurance',
    companyLogo: Images.bank3,
    package: { id: "i2", company: "Old Mutual", logo: require("../../assets/banks/bank1.jpeg"), type: "Life Cover", category: 'insurance', cover: "E1M+", premium: "From E280/pm", featured: true, location: { lat: -26.3050, long: 31.1365 }, likes: 220, reviews: 65 },
    name: 'Family Life Cover',
    subtype: 'Comprehensive',
    keyBenefits: [
      'Cover from R500,000 to R10,000,000',
      'Pays out on death or disability',
      'Premiums from R220/month',
      'Funeral benefit included'
    ],
    monthlyCost: 'from R220',
    ctaLabel: 'Get Quote'
  },
  {
    id: 'ins-002',
    category: 'insurance',
    companyLogo: Images.bank2,
    name: 'Hospital Cash Plan',
    subtype: 'Daily Benefit',
    keyBenefits: [
      'Up to R2,000 per day in hospital',
      'No medical test required',
      'Covers you + family',
      'Pays directly to your account'
    ],
    monthlyCost: 'from R145',
    ctaLabel: 'Join Today'
  }
];

// === REUSABLE LOGO WITH FALLBACK ===
const BankLogo = ({ source, name, size = 48, large = false }) => {
  const [error, setError] = React.useState(false);
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  if (error) {
    return (
      <View style={{ width: size, height: size, borderRadius: large ? size / 2 : 8, backgroundColor: "#E5E7EB", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: size * 0.35, fontWeight: "700", color: "#4B5563" }}>{initials || "?"}</Text>
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={{ width: size, height: size, resizeMode: "contain", borderRadius: large ? size / 2 : 8 }}
      onError={() => setError(true)}
    />
  );
};

// === QUICK EMI MODAL (Loans only) ===
const QuickCalcModal = ({ visible, loan, onClose, navigation }) => {
  const slideAnim = useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    Animated.timing(slideAnim, { toValue: visible ? 0 : 300, duration: 300, useNativeDriver: true }).start();
  }, [visible]);

  if (!loan) return null;

  const cleanAmount = (s) => parseFloat(s.replace(/[^0-9.]/g, "")) || 0;
  const cleanRate = (s) => parseFloat(s.replace("%", "")) / 12 / 100;
  const cleanTerm = (s) => parseInt(s.match(/\d+/)?.[0]) || 0;

  const P = cleanAmount(loan.max);
  const r = cleanRate(loan.rate);
  const n = cleanTerm(loan.term);
  const emi = P && r && n ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : 0;

  const format = (v) => `E${v.toLocaleString("en-SZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <Modal transparent visible={visible} animationType="none">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Quick EMI Estimate</Text>
            <TouchableOpacity onPress={onClose}><Icons.Ionicons name="close" size={24} color="#6B7280" /></TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.modalLabel}>Bank: {loan.bank}</Text>
            <Text style={styles.modalLabel}>Max: {loan.max} | Rate: {loan.rate} | Term: {loan.term}</Text>
            <View style={styles.emiResult}>
              <Text style={styles.emiLabel}>Monthly Repayment</Text>
              <Text style={styles.emiValue}>{emi > 0 ? format(emi) : "N/A"}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.fullCalcBtn} onPress={() => { onClose(); navigation.navigate("LoanCalculator"); }}>
            <Text style={styles.fullCalcText}>Open Full Calculator</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

// === MAIN SCREEN ===
export default function FinancialHubScreen({ navigation }) {
  const { theme } = React.useContext(AppContext)
  const [activeTab, setActiveTab] = useState("Loans");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLoans, setSelectedLoans] = useState([]);
  const [quickCalcLoan, setQuickCalcLoan] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isBannersVisible, setIsBannersVisible] = useState(true);
  const scrollX = useRef(new Animated.Value(0)).current;
  const bannerHeight = useRef(new Animated.Value(190)).current;
  const bannerOpacity = useRef(new Animated.Value(1)).current;
  const bannerTranslate = useRef(new Animated.Value(0)).current;

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

  // Bottom-sheet / filter state
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const bottomSheetY = useRef(new Animated.Value(500)).current; // offscreen by default
  const [filters, setFilters] = useState(null);
  const [isFilter, setIsFilter] = useState(false);
  const [form, setForm] = useState({
    category: "All",
    productType: "",
    nameOrCompany: "",
    minInterest: "",
    maxInterest: "",
    minTerm: "",
    maxTerm: "",
    otherDetails: "",
  });

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

  const openBottomSheet = () => setBottomSheetVisible(true);
  const closeBottomSheet = () => setBottomSheetVisible(false);

  // Helpers for parsing numeric values from strings
  const parseNumberFromString = (s) => {
    if (!s) return null;
    const match = String(s).replace(/–/g, "-").match(/\d+(?:[\.,]\d+)?/);
    if (!match) return null;
    return parseFloat(match[0].replace(',', '.'));
  };

  const parseTermToMonths = (s) => {
    if (!s) return null;
    const lower = String(s).toLowerCase();
    const numMatch = lower.match(/\d+(?:[\.,]\d+)?/);
    if (!numMatch) return null;
    let num = parseFloat(numMatch[0].replace(',', '.'));
    if (lower.includes('year')) num = num * 12;
    return Math.round(num);
  };

  // === FILTERING LOGIC (SAFER + DEBUG-FRIENDLY) ===

  const allProducts = [...loanData, ...insuranceData, ...investmentData].map(item => ({
    ...item,
    _category: item.category || (item.company ? 'insurance' : 'loan')
  }));

  // Helper: apply everything EXCEPT category
  const applyNonCategoryFilters = (data) => {
    if (!filters || !Array.isArray(data)) return data || [];  // safety

    return data.filter(item => {
      // Product type
      if (filters.productType) {
        const t = (item.type || item.name || '').toLowerCase();
        if (!t.includes(filters.productType.toLowerCase())) return false;
      }

      // Name / Company
      if (filters.nameOrCompany) {
        const n = ((item.bank || item.company || item.name) + '').toLowerCase();
        if (!n.includes(filters.nameOrCompany.toLowerCase())) return false;
      }

      // Interest rate
      const itemRate = parseNumberFromString(
        item.rate || item.returns || item.premium || item.interestRate || ''
      );
      if (filters.minInterest) {
        const minI = parseFloat(filters.minInterest);
        if (itemRate === null || itemRate < minI) return false;
      }
      if (filters.maxInterest) {
        const maxI = parseFloat(filters.maxInterest);
        if (itemRate === null || itemRate > maxI) return false;
      }

      // Term (months)
      const itemTerm = parseTermToMonths(item.term || '');
      if (filters.minTerm) {
        const minT = parseInt(filters.minTerm, 10);
        if (itemTerm === null || itemTerm < minT) return false;
      }
      if (filters.maxTerm) {
        const maxT = parseInt(filters.maxTerm, 10);
        if (itemTerm === null || itemTerm > maxT) return false;
      }

      // Other details
      if (filters.otherDetails) {
        const od = filters.otherDetails.toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const benefits = (item.keyBenefits || []).join(' ').toLowerCase();
        const timeProcessing = (item.processingTime || '').toLowerCase();
        if (!desc.includes(od) && !benefits.includes(od) && !timeProcessing.includes(od)) {
          return false;
        }
      }

      return true;
    });
  };

  // Determine base dataset — always an array
  // Use current active tab dataset as base unless filters.category overrides
  const currentDataLocal = activeTab === "Insurance" ? insuranceData : activeTab === "Investments" ? investmentData : loanData;
  let baseData = currentDataLocal || [];  // fallback to empty array if somehow undefined

  if (filters && typeof filters === 'object') {
    const category = filters.category;

    if (category === 'All') {
      baseData = allProducts;
    } else if (category === 'Loans') {
      baseData = allProducts.filter(i => (i.category || i._category) === 'loan');
    } else if (category === 'Insurance') {
      baseData = allProducts.filter(i => (i.category || i._category) === 'insurance');
    } else if (category === 'Investments') {
      baseData = allProducts.filter(i => (i.category || i._category) === 'investment');
    }
    // If category is something else or undefined → keep current tab (already set)
  }

  // Apply the rest of the filters
  const filteredBase = applyNonCategoryFilters(baseData);

  // Final displayed data (with search bar on top)
  const displayedData = filteredBase.filter(item => {
    const search = searchQuery.toLowerCase();
    if (!search) return true;

    const name = (item.bank || item.company || item.name || '').toLowerCase();
    const type = (item.type || item.name || '').toLowerCase();
    const category = (item.category || item._category || '').toLowerCase();

    return name.includes(search) || type.includes(search) || category.includes(search);
  });

  const refreshFilters = () => {
    const newFilters = {
      category: 'All',
      productType: '',
      nameOrCompany: '',
      minInterest: '',
      maxInterest: '',
      minTerm: '',
      maxTerm: '',
      otherDetails: '',
    };
    setFilters(null);
    setForm(newFilters);
    setIsFilter(false);
  };

  // Filter logic per tab
  const getCurrentData = () => {
    if (activeTab === "Insurance") return insuranceData;
    if (activeTab === "Investments") return investmentData;
    return loanData;
  };

  const currentData = getCurrentData();

  // base search (search bar) applied before or along with filters
  const searchedData = currentData.filter(item => {
    const search = searchQuery.toLowerCase();
    const name = (item.bank || item.company || "").toLowerCase();
    const type = (item.type || "").toLowerCase();
    const category = (item.category || "").toLowerCase();
    return search === "" || name.includes(search) || type.includes(search) || category.includes(search);
  });
  // Render Cards
  const renderLoanCard = ({ item }) => {
    return (
      <TouchableOpacity
        style={[styles.loanCard]}
        onPress={() => navigation.navigate("LoanDetails", { item: item })}
        activeOpacity={0.95}
      >
        <BankLogo source={item.logo} name={item.bank || item.company} size={48} />
        <View style={styles.cardContent}>
          <Text style={styles.cardBank}>{item.bank || item.company}</Text>
          <Text style={styles.cardType}>{item.type}</Text>

          {activeTab === "Loans" && (
            <>
              <View style={styles.cardDetails}>
                <Text style={styles.cardRate}>{item.rate}</Text>
                <Text style={styles.cardMax}>{item.max}</Text>
              </View>
              <Text style={styles.processingTime}>Processing: {item.processingTime}</Text>

              <View style={styles.cardButtons}>
                <TouchableOpacity style={styles.calcBtn} onPress={(e) => { e.stopPropagation(); navigation.navigate("LoanCalculator"); }}>
                  <Icons.Ionicons name="calculator-outline" size={16} color="#FFF" />
                  <Text style={styles.calcText}>Calculate</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickCalcBtn} onPress={(e) => { e.stopPropagation(); setQuickCalcLoan(item); }}>
                  <Icons.Ionicons name="flash-outline" size={16} color="#FFF" />
                  <Text style={styles.quickCalcText}>Quick EMI</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {activeTab === "Insurance" && (
            <>
              <Text style={styles.cardRate}>{item.premium}</Text>
              <Text style={styles.cardMax}>Cover: {item.cover}</Text>
            </>
          )}

          {activeTab === "Investments" && (
            <>
              <Text style={styles.cardRate}>Min: {item.min}</Text>
              <Text style={styles.cardMax}>Expected: {item.returns}</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const introText = `1. Explore top loan providers, insurance policies, and investment options in Eswatini.
  \n2. Use the search bar to quickly find specific products or companies.
  \n3. Tap on any listing for detailed information, user reviews, and contact options.
  \n4. Use the Quick EMI Calculator for instant loan repayment estimates.
  \n5. Access personalized financial advice by tapping the Ask AI button.`;

  const listAllVoiceOptions = async () => {
    try {
      console.log('listAllVoiceOptions: fetching voices');
      const voices = await Speech.getAvailableVoicesAsync();
      console.log('Available voices:', voices);
      return voices;
    } catch (err) {
      console.log('Error fetching voices:', err?.message || err);
      return null;
    }
  }

  const speak = async () => {
    try {
      console.log('speak: invoked, isSpeaking=', isSpeaking);
      if (isSpeaking) {
        Speech.stop();
        setIsSpeaking(false);
        console.log('speak: stopped');
        return;
      }

      // debug available voices (non-blocking)
      listAllVoiceOptions();

      setIsSpeaking(true);
      await Speech.speak(introText, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.95,
        volume: 1.0,
        onStart: () => {
          console.log('Speech started');
          setIsSpeaking(true);
        },
        onDone: () => {
          console.log('Speech done');
          setIsSpeaking(false);
        },
        onError: (err) => {
          console.log('Speech error:', err);
          setIsSpeaking(false);
        },
        onStopped: () => {
          console.log('Speech stopped');
          setIsSpeaking(false);
        },
      });
    } catch (err) {
      console.log('speak: exception', err);
      setIsSpeaking(false);
    }
  };

  const Header = () => (
    <>
      {/* back btn and search */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 8 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.Ionicons name="arrow-back" color={theme.colors.text} size={24} />
        </TouchableOpacity>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Icons.Ionicons name="search" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeTab === "Loans" ? "banks/loans" : activeTab === "Insurance" ? "insurers" : "investments"}...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
          {searchQuery ? <TouchableOpacity onPress={() => setSearchQuery("")}><Icons.Ionicons name="close-circle" size={20} color="#64748B" /></TouchableOpacity> : null}
        </View>
      </View>

      {/* AI and options */}
      <View style={styles.AIOptions}>
        <View style={{ alignItems: "center" }}>
          {/* summary audio-intro play */}
          <TouchableOpacity style={styles.button} onPress={speak}>
            {isSpeaking ? (
              <Icons.Ionicons name="stop-circle-outline" size={24} color="#fff" />
            ) : (
              <Icons.FontAwesome name="microphone" size={24} color="#fff" />
            )}
            <Text style={styles.label}>{isSpeaking ? 'Stop' : 'Quick Overview'}</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, gap: 6 }}>
            {/* banner hiding button (default=[enabled]) */}
            <TouchableOpacity style={[styles.Optionsbtn]} onPress={() => setIsBannersVisible(!isBannersVisible)}>
              <Icons.Feather name={isBannersVisible ? "chevrons-up" : "chevrons-down"} size={20} color={theme.colors.text} />
              <Text style={{ fontSize: 20, fontWeight: 200, color: theme.colors.text }}>For-Graps</Text>
            </TouchableOpacity>

            {/* options btn for criteria search - bottom bar */}
            <TouchableOpacity style={[styles.Optionsbtn]} onPress={openBottomSheet}>
              <Icons.Ionicons name="options-outline" size={24} color={theme.colors.text} />
              <Text style={{ fontSize: 20, fontWeight: 200, color: theme.colors.text }}>Opts</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI button btn for navigating to chat screen */}
        <TouchableOpacity style={[styles.AIbtn]} onPress={() =>
          navigation.navigate("Askai", { context: null, dealType: null })
        }>
          <Icons.MaterialCommunityIcons name="face-agent" size={28} color="#1E40AF" />
          <Text style={{ fontSize: 20, fontWeight: 200, color: theme.colors.text }}>Ask AI</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={{ height: bannerHeight, overflow: 'hidden' }}>
        <Animated.View style={{ flex: 1, opacity: bannerOpacity, transform: [{ translateY: bannerTranslate }] }}>
          <Carousel
            loop={bannerPromos.length > 1}
            width={width}
            height={190}
            autoPlay={bannerPromos.length > 1 && isBannersVisible}
            data={bannerPromos}
            scrollAnimationDuration={3000}
            renderItem={({ item }) => (
              <FinancialBanner
                key={item?.id}
                companyProfile={item?.companyLogo}
                visible={isBannersVisible}
                category={item?.category}
                productName={item?.name}
                productType={item?.subtype}
                onDismiss={() => handleDismiss(item?.id)}
                onLearnMore={() => navigation.navigate("LoanDetails", { item: item.package })}
              />
            )}
          />
        </Animated.View>
      </Animated.View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {(["Loans", "Insurance", "Investments"]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            onPress={() => { setActiveTab(tab); setSearchQuery(""); setSelectedLoans([]); }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === "Loans" ? "Loans" : tab === "Insurance" ? "Insurance" : "Investments"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  const ListHeader = () => (
    <>
      {/* Section Title + Compare Button */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>
          {activeTab === "Loans" ? "Loan Providers" : activeTab === "Insurance" ? "Insurance Policies" : "Investment Parties"}
        </Text>
        {/* refresh screen */}
        {isFilter &&
          <TouchableOpacity onPress={refreshFilters}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 6, backgroundColor: '#eff2f5ff', borderRadius: 20 }}>
            <Icons.Ionicons name="refresh" size={20} color={theme.colors.sub_text} />
            <Text style={{ fontSize: 16, color: theme.colors.text, fontWeight: "200" }}>
              Refresh
            </Text>
          </TouchableOpacity>
        }
      </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={{ height: 25 }} />

      {Header()}

      <View style={{ backgroundColor: theme.colors.card, borderTopRightRadius: 20, borderTopLeftRadius: 20, flex: 1 }}>
        <FlatList
          data={displayedData}
          renderItem={renderLoanCard}
          keyExtractor={item => item.id}
          numColumns={isTablet ? 2 : 1}
          columnWrapperStyle={isTablet ? { justifyContent: "space-between", paddingHorizontal: 16 } : null}
          contentContainerStyle={{ paddingBottom: 50 }}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={() => (
            <View style={{ alignItems: 'center', marginTop: 48 }}>
              <Icons.Ionicons name="search" size={48} color="#9CA3AF" />
              <Text style={{ color: '#9CA3AF', marginTop: 12, fontSize: 16 }}>No finds emerged!</Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Quick EMI Modal */}
      <QuickCalcModal visible={!!quickCalcLoan} loan={quickCalcLoan} onClose={() => setQuickCalcLoan(null)} navigation={navigation} />

      {/* Animated Bottom Sheet (custom) */}
      {bottomSheetVisible && (
        <Pressable style={styles.sheetOverlay} onPress={closeBottomSheet} />
      )}

      <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: bottomSheetY }] }]} pointerEvents={bottomSheetVisible ? 'auto' : 'none'}>
        <View style={styles.sheetHandle} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80}>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 60, }}>
            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Filter Criteria</Text>

            <Text style={styles.sheetLabel}>Category</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {['All', 'Loans', 'Insurance', 'Investments'].map(c => (
                <TouchableOpacity key={c} style={[styles.radioBtn, form.category === c && styles.radioBtnActive]} onPress={() => setForm(prev => ({ ...prev, category: c }))}>
                  <Text style={{ color: form.category === c ? '#fff' : '#374151', fontWeight: '600' }}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sheetLabel}>Product type</Text>
            <TextInput value={form.productType} onChangeText={(v) => setForm(prev => ({ ...prev, productType: v }))} style={styles.sheetInput} placeholder="e.g. Personal Loan" />

            <Text style={styles.sheetLabel}>Name / Company</Text>
            <TextInput value={form.nameOrCompany} onChangeText={(v) => setForm(prev => ({ ...prev, nameOrCompany: v }))} style={styles.sheetInput} placeholder="Bank or company name" />

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetLabel}>Min Interest (%)</Text>
                <TextInput keyboardType="numeric" value={form.minInterest} onChangeText={(v) => setForm(prev => ({ ...prev, minInterest: v }))} style={styles.sheetInput} placeholder="e.g. 8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetLabel}>Max Interest (%)</Text>
                <TextInput keyboardType="numeric" value={form.maxInterest} onChangeText={(v) => setForm(prev => ({ ...prev, maxInterest: v }))} style={styles.sheetInput} placeholder="e.g. 15" />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetLabel}>Min Term (months)</Text>
                <TextInput keyboardType="numeric" value={form.minTerm} onChangeText={(v) => setForm(prev => ({ ...prev, minTerm: v }))} style={styles.sheetInput} placeholder="e.g. 12" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetLabel}>Max Term (months)</Text>
                <TextInput keyboardType="numeric" value={form.maxTerm} onChangeText={(v) => setForm(prev => ({ ...prev, maxTerm: v }))} style={styles.sheetInput} placeholder="e.g. 240" />
              </View>
            </View>

            <Text style={styles.sheetLabel}>Other Details (Options)</Text>
            <TextInput value={form.otherDetails} onChangeText={(v) => setForm(prev => ({ ...prev, otherDetails: v }))} textAlignVertical="top" numberOfLines={3}
              style={[styles.sheetInput, { height: 70 }]}
              placeholder="Description, unique feature, process time, etc."
            />

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity style={styles.applyBtn} onPress={() => {
                // set the filters object (the filtering runs on render)
                setFilters(form);
                setIsFilter(true);
                closeBottomSheet();
              }}>
                {isFilter ? <ActivityIndicator color={'#fff'} size={20} /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Apply</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.resetBtn} onPress={refreshFilters}>
                <Text style={{ color: '#111827', fontWeight: '700' }}>Reset</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </View >
  );
}

// === STYLES (updated & extended) ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  // Tab Bar
  tabBar: { flexDirection: "row", paddingVertical: 12, paddingHorizontal: 16 },
  tabItem: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 30, backgroundColor: "#F2F2F7" },
  tabItemActive: { backgroundColor: "#111827" },
  tabText: { fontSize: 15, fontWeight: "600", color: "#6B7280" },
  tabTextActive: { color: "#FFFFFF" },

  button: {
    width: '100%', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', backgroundColor: '#000',
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 70, gap: 8, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 1
  },
  label: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  Optionsbtn: {
    flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 30,
    backgroundColor: '#f0f4ff', paddingVertical: 6, paddingHorizontal: 12,
    elevation: 1, shadowColor: '#1E40AF', shadowOpacity: 0.2, shadowRadius: 4
  },

  AIbtn: {
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#E0E7FF",
    borderRadius: 8,
    elevation: 8, shadowColor: "#1E40AF", shadowOpacity: 0.3, shadowRadius: 10
  },

  AIOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16, gap: 8,
    justifyContent: 'center', marginBottom: 8
  },

  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F2F2F7", margin: 16, paddingHorizontal: 16, borderRadius: 30, borderWidth: 1, borderColor: "#f2f2f2ff", gap: 8, elevation: 1 },
  searchInput: { flex: 1, fontSize: 16, color: "#111827" },

  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#111827", paddingHorizontal: 16, marginVertical: 12 },

  featuredSection: { marginBottom: 16 },
  featuredCard: { width: width - 32, height: 160, backgroundColor: "#FFFFFF", marginHorizontal: 16, borderRadius: 16, flexDirection: "row", overflow: "hidden", borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center", padding: 16 },
  featuredContent: { flex: 1, marginLeft: 16 },
  featuredType: { fontSize: 18, fontWeight: "700" },
  featuredBank: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  rateValue: { fontSize: 18, fontWeight: "800", color: "#1F2937", marginTop: 8 },

  maxAmount: { fontSize: 14, fontWeight: "600", color: "#111827", marginTop: 4 },

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

  compareBtnText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 }, grid: { paddingBottom: 100 },

  loanCard: { backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, marginBottom: 12, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB", flex: isTablet ? 0.48 : 1, marginHorizontal: 16, position: "relative" },

  checkbox: { position: "absolute", top: 12, right: 12, zIndex: 1 },

  cardContent: { flex: 1, marginLeft: 12 },
  cardBank: { fontSize: 14, fontWeight: "600", color: "#111827" },
  cardType: { fontSize: 15, fontWeight: "700", color: "#1F2937", marginTop: 2 },
  cardDetails: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  cardRate: { fontSize: 14, fontWeight: "700", color: "#DC2626" },
  cardMax: { fontSize: 13, fontWeight: "600", color: "#111827" },
  processingTime: { fontSize: 12, color: "#6B7280", marginTop: 4 },

  cardButtons: { flexDirection: "row", gap: 8, marginTop: 12 },
  calcBtn: { flex: 1, flexDirection: "row", backgroundColor: "#111827", paddingVertical: 10, borderRadius: 8, justifyContent: "center", alignItems: "center", gap: 6 },
  quickCalcBtn: { flex: 1, flexDirection: "row", backgroundColor: "#F59E0B", paddingVertical: 10, borderRadius: 8, justifyContent: "center", alignItems: "center", gap: 6 },
  calcText: { fontSize: 13, fontWeight: "600", color: "#FFF" },
  quickCalcText: { fontSize: 13, fontWeight: "600", color: "#FFF" },

  // FAB
  fab: {
    position: "absolute",
    right: 20,
    bottom: 60,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1E40AF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },

  // Modal styles (unchanged)
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  modalBody: { marginBottom: 16 },
  modalLabel: { fontSize: 14, color: "#6B7280", marginBottom: 6 },
  emiResult: { backgroundColor: "#FFF8E1", padding: 16, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "#F59E0B" },
  emiLabel: { fontSize: 14, color: "#92400E" },
  emiValue: { fontSize: 24, fontWeight: "800", color: "#B45309" },
  fullCalcBtn: { backgroundColor: "#111827", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  fullCalcText: { color: "#FFFFFF", fontWeight: "600", fontSize: 15 },
  sheetOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
  bottomSheet: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 480, backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, elevation: 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12 },
  sheetHandle: { width: 48, height: 6, backgroundColor: '#E5E7EB', borderRadius: 6, alignSelf: 'center', marginTop: 8, marginBottom: 10 },
  sheetLabel: { fontSize: 13, color: '#374151', marginBottom: 6, fontWeight: '600' },
  sheetInput: { backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#E6EEF8' },
  radioBtn: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#F1F5F9', borderRadius: 8 },
  radioBtnActive: { backgroundColor: '#111827' },
  applyBtn: { flex: 1, backgroundColor: '#111827', paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  resetBtn: { flex: 1, backgroundColor: '#F1F5F9', paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});