"use client";

import React, { useState, useRef } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SecondaryNav from "../../components/SecondaryNav";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

// === LOAN DATA ===
const loanData = [
  {
    id: "1",
    bank: "Nedbank Eswatini",
    logo: require("../../assets/banks/bank1.jpeg"),
    type: "Personal Loan",
    rate: "9.5%",
    max: "E150,000",
    term: "Up to 60 months",
    featured: true,
    description: "Flexible personal loans for any purpose.",
    processingTime: "24 hours",
  },
  {
    id: "2",
    bank: "Standard Bank",
    logo: require("../../assets/banks/bank2.png"),
    type: "Home Loan",
    rate: "8.25%",
    max: "E2,500,000",
    term: "Up to 20 years",
    featured: true,
    description: "Build or buy your dream home.",
    processingTime: "3–5 days",
  },
  {
    id: "3",
    bank: "FNB Eswatini",
    logo: require("../../assets/banks/bank3.jpeg"),
    type: "Business Loan",
    rate: "11.0%",
    max: "E500,000",
    term: "Up to 84 months",
    featured: false,
    description: "Grow your business with smart financing.",
    processingTime: "48 hours",
  },
  {
    id: "4",
    bank: "Eswatini Bank",
    logo: require("../../assets/banks/bank1.jpeg"),
    type: "Vehicle Finance",
    rate: "10.2%",
    max: "E300,000",
    term: "Up to 72 months",
    featured: false,
    description: "Drive away today with easy payments.",
    processingTime: "24 hours",
  },
  {
    id: "5",
    bank: "Swazi MTN MoMo",
    logo: require("../../assets/banks/bank2.png"),
    type: "Micro Loan",
    rate: "15.0%",
    max: "E5,000",
    term: "30 days",
    featured: false,
    description: "Instant cash via your phone.",
    processingTime: "5 mins",
  },
];

// === CATEGORIES ===
const categories = ["All", "Personal", "Business", "Home", "Vehicle", "Micro"];

// === BANK LOGO WITH FALLBACK ===
const BankLogo = ({ source, bankName, size, large = false }) => {
  const [loadError, setLoadError] = React.useState(false);

  const initials = bankName
    .split(" ")
    .map((w) => w[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

  if (loadError) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: large ? size / 2 : 8,
          backgroundColor: "#E5E7EB",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: size * 0.35, fontWeight: "700", color: "#4B5563" }}>
          {initials || "?"}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={{
        width: size,
        height: size,
        resizeMode: "contain",
        borderRadius: large ? size / 2 : 8,
      }}
      onError={() => setLoadError(true)}
    />
  );
};

// === QUICK CALC MODAL ===
const QuickCalcModal = ({ visible, loan, onClose, navigation }) => {
  const slideAnim = useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!loan) return null;

  const cleanAmount = (str) => parseFloat(str.replace(/[^0-9.]/g, "")) || 0;
  const cleanRate = (str) => parseFloat(str.replace("%", "")) || 0; // Fixed: || 00 → || 0
  const cleanTerm = (str) => {
    const match = str.match(/(\d+)/);
    return match ? parseInt(match[0]) : 0;
  };

  const P = cleanAmount(loan.max);
  const r = cleanRate(loan.rate) / 12 / 100;
  const n = cleanTerm(loan.term);

  let emi = 0;
  if (P > 0 && r > 0 && n > 0) {
    emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  const format = (val) =>
    `E${val.toLocaleString("en-SZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
            <Text style={styles.modalTitle}>Quick EMI</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.modalLabel}>Bank: {loan.bank}</Text>
            <Text style={styles.modalLabel}>Max Amount: {loan.max}</Text>
            <Text style={styles.modalLabel}>Rate: {loan.rate}</Text>
            <Text style={styles.modalLabel}>Term: {loan.term}</Text>

            <View style={styles.emiResult}>
              <Text style={styles.emiLabel}>Monthly EMI</Text>
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
export default function LoansScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLoans, setSelectedLoans] = useState([]);
  const [quickCalcLoan, setQuickCalcLoan] = useState(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const filteredLoans = loanData.filter((loan) => {
    const matchesCategory =
      selectedCategory === "All" || loan.type.includes(selectedCategory);
    const matchesSearch =
      loan.bank.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredLoans = loanData.filter((l) => l.featured);

  const toggleSelection = (id) => {
    setSelectedLoans((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isSelected = (id) => selectedLoans.includes(id);

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.chip,
        selectedCategory === item && styles.chipActive,
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text
        style={[
          styles.chipText,
          selectedCategory === item && styles.chipTextActive,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderFeatured = ({ item, index }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.92, 1, 0.92],
      extrapolate: "clamp",
    });
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: "clamp",
    });

    return (
      <Animated.View style={{ transform: [{ scale }], opacity, width }}>
        <TouchableOpacity
          style={styles.featuredCard}
          onPress={() => navigation.navigate("LoanDetails", { loan: item })}
          activeOpacity={0.9}
        >
          <BankLogo source={item.logo} bankName={item.bank} size={70} large />
          <View style={styles.featuredContent}>
            <Text style={styles.featuredType}>{item.type}</Text>
            <Text style={styles.featuredBank}>{item.bank}</Text>
            <View style={styles.rateRow}>
              <Text style={styles.rateLabel}>Rate</Text>
              <Text style={styles.rateValue}>{item.rate}</Text>
            </View>
            <Text style={styles.maxAmount}>Up to {item.max}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderLoanCard = ({ item }) => {
    const selected = isSelected(item.id);

    return (
      <TouchableOpacity
        style={[styles.loanCard, selected && styles.loanCardSelected]}
        onPress={() => navigation.navigate("LoanDetails", { loan: item })}
        activeOpacity={0.95}
      >
        <TouchableOpacity
          style={styles.checkbox}
          onPress={(e) => {
            e.stopPropagation();
            toggleSelection(item.id);
          }}
        >
          <Ionicons
            name={selected ? "checkbox" : "square-outline"}
            size={22}
            color={selected ? "#F59E0B" : "#9CA3AF"}
          />
        </TouchableOpacity>

        <BankLogo source={item.logo} bankName={item.bank} size={48} />
        <View style={styles.cardContent}>
          <Text style={styles.cardBank}>{item.bank}</Text>
          <Text style={styles.cardType}>{item.type}</Text>
          <View style={styles.cardDetails}>
            <Text style={styles.cardRate}>{item.rate}</Text>
            <Text style={styles.cardMax}>{item.max}</Text>
          </View>
          <View style={styles.processingRow}>
            <Ionicons name="time-outline" size={14} color="#64748B" />
            <Text style={styles.processingTime}>{item.processingTime}</Text>
          </View>

          <View style={styles.cardButtons}>
            <TouchableOpacity
              style={styles.calcBtn}
              onPress={(e) => {
                e.stopPropagation();
                navigation.navigate("LoanCalculator");
              }}
            >
              <Ionicons name="calculator-outline" size={16} color="#FFFFFF" />
              <Text style={styles.calcText}>Calculate</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCalcBtn}
              onPress={(e) => {
                e.stopPropagation();
                setQuickCalcLoan(item);
              }}
            >
              <Ionicons name="flash-outline" size={16} color="#FFFFFF" />
              <Text style={styles.quickCalcText}>Quick EMI</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const showCompareButton = selectedLoans.length >= 2;

  const ListHeader = () => (
    <>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search banks or loan types..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#94A3B8"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.chipsContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4 }}
        />
      </View>

      {selectedCategory === "All" && searchQuery === "" && (
        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Featured Loans</Text>
          <AnimatedFlatList
            data={featuredLoans}
            renderItem={renderFeatured}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={width - 32}
            snapToAlignment="center"
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
          />
        </View>
      )}

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === "All" ? "All Available Loans" : `${selectedCategory} Loans`}
        </Text>

        {showCompareButton && (
          <TouchableOpacity
            style={styles.compareBtn}
            onPress={() => {
              const loansToCompare = loanData.filter((l) =>
                selectedLoans.includes(l.id)
              );
              navigation.navigate("LoanCompare", { loans: loansToCompare });
            }}
          >
            <Ionicons name="git-compare" size={18} color="#FFFFFF" />
            <Text style={styles.compareBtnText}>
              Compare ({selectedLoans.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <View style={{ height: 25 }} />
      <SecondaryNav title="Loan Entities" />

      <FlatList
        data={filteredLoans}
        renderItem={renderLoanCard}
        keyExtractor={(item) => item.id}
        numColumns={isTablet ? 2 : 1}
        columnWrapperStyle={isTablet ? styles.gridRow : null}
        contentContainerStyle={styles.grid}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
      />

      <QuickCalcModal
        visible={!!quickCalcLoan}
        loan={quickCalcLoan}
        onClose={() => setQuickCalcLoan(null)}
        navigation={navigation}
      />
    </View>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 16, color: "#111827" },

  chipsContainer: { paddingVertical: 12 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    marginLeft: 12,
  },
  chipActive: { backgroundColor: "#1F2937" },
  chipText: { fontSize: 14, fontWeight: "600", color: "#4B5563" },
  chipTextActive: { color: "#FFFFFF" },

  featuredSection: { marginTop: 8 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    paddingHorizontal: 16,
    marginBottom: 10,
    marginTop: 10,
  },

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
  },
  featuredContent: { flex: 1, padding: 16, justifyContent: "center" },
  featuredType: { fontSize: 18, fontWeight: "700", color: "#111827" },
  featuredBank: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  rateRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 8 },
  rateLabel: { fontSize: 13, color: "#6B7280" },
  rateValue: { fontSize: 19, fontWeight: "800", color: "#1F2937" },
  maxAmount: { fontSize: 14, fontWeight: "600", color: "#111827", marginTop: 4 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
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
  gridRow: { justifyContent: "space-between" },

  loanCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flex: isTablet ? 0.48 : 1,
    position: "relative",
    marginHorizontal: 16,
  },
  loanCardSelected: {
    borderColor: "#F59E0B",
    backgroundColor: "#FFF8E1", // Soft amber tint
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  checkbox: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
  },

  cardContent: { flex: 1, marginLeft: 12 },
  cardBank: { fontSize: 14, fontWeight: "600", color: "#111827" },
  cardType: { fontSize: 15, fontWeight: "700", color: "#1F2937", marginTop: 2 },
  cardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  cardRate: { fontSize: 14, fontWeight: "700", color: "#DC2626" },
  cardMax: { fontSize: 13, color: "#111827", fontWeight: "600" },
  processingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  processingTime: { fontSize: 12, color: "#6B7280" },

  // BUTTONS
  cardButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 8,
  },
  calcBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#111827",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  calcText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  quickCalcBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F59E0B", // Amber
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  quickCalcText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // MODAL
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
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  modalBody: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 6,
  },
  emiResult: {
    backgroundColor: "#FFF8E1",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  emiLabel: {
    fontSize: 14,
    color: "#92400E",
    marginBottom: 4,
  },
  emiValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#B45309",
  },
  fullCalcBtn: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  fullCalcText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
});