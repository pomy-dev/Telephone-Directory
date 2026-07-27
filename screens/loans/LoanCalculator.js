import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Keyboard,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AppContext } from "../../context/appContext";
import SecondaryNav from "../../components/SecondaryNav";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;

// Helper: format currency (Eswatini Lilangeni)
const formatCurrency = (value) => {
  return `E${parseFloat(value || 0).toLocaleString("en-SZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function LoanCalculator({ navigation, route }) {
  const product = route?.params?.product || null;
  const { theme, isDarkMode } = useContext(AppContext);

  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState(product?.interestRateApr?.toString() || "");
  const [termMonths, setTermMonths] = useState(product?.maxDurationMonths?.toString() || "");
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  // Calculate EMI
  useEffect(() => {
    const P = parseFloat(principal) || 0;
    const annualRate = parseFloat(rate) || 0;
    const r = annualRate / 12 / 100; // monthly rate
    const n = parseFloat(termMonths) || 0;

    if (P > 0 && r > 0 && n > 0) {
      const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPayable = emi * n;
      const interest = totalPayable - P;

      setMonthlyPayment(emi);
      setTotalInterest(interest);
    } else {
      setMonthlyPayment(0);
      setTotalInterest(0);
    }
  }, [principal, rate, termMonths]);

  const handleInput = (text, setter) => {
    const numeric = text.replace(/[^0-9.]/g, "");
    setter(numeric);
  };

  // Get company logo source
  const getLogoSource = () => {
    if (!product) return null;
    if (typeof product.logo === "number") {
      return product.logo;
    }
    return {
      uri: product.company?.logoFile?.url || product.company?.logoDataUrl || product.logoDataUrl,
    };
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
      <SecondaryNav title="Loan Calculator" />

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Product Details Header */}
        {product && (
          <View style={[styles.productHeader, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            {getLogoSource() && (
              <Image
                source={getLogoSource()}
                style={styles.companyLogo}
                resizeMode="stretch"
              />
            )}
            <View style={styles.productInfo}>
              <Text style={[styles.companyName, { color: theme.colors.sub_text }]} numberOfLines={1}>
                {product.company?.companyName || product.companyName}
              </Text>
              <Text style={[styles.productName, { color: theme.colors.text }]} numberOfLines={1}>
                {product.name}
              </Text>
              <View style={styles.productMetaRow}>
                <View style={styles.metaItem}>
                  <Text style={[styles.metaLabel, { color: theme.colors.sub_text }]}>Interest Rate</Text>
                  <Text style={[styles.metaValue, { color: theme.colors.text }]}>{product.interestRateApr}%</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={[styles.metaLabel, { color: theme.colors.sub_text }]}>Max Term</Text>
                  <Text style={[styles.metaValue, { color: theme.colors.text }]}>{product.maxDurationMonths} mo</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={[styles.metaLabel, { color: theme.colors.sub_text }]}>Max Amount</Text>
                  <Text style={[styles.metaValue, { color: theme.colors.text }]}>{formatCurrency(product.maxAmount)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Input Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Enter Loan Details</Text>

          {/* Principal */}
          <View style={[styles.inputRow, { backgroundColor: theme.colors.sub_card }]}>
            <Ionicons name="cash-outline" size={20} color="#6B7280" />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder={`Loan Amount (${product ? formatCurrency(product.maxAmount) : "E50,000.00"})`}
              placeholderTextColor={theme.colors.sub_text}
              keyboardType="numeric"
              value={principal}
              onChangeText={(text) => handleInput(text, setPrincipal)}
            />
          </View>

          {/* Interest Rate */}
          <View style={[styles.inputRow, { backgroundColor: theme.colors.sub_card }]}>
            <Ionicons name="trending-up-outline" size={20} color="#6B7280" />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Interest Rate % (e.g. 9.5)"
              keyboardType="numeric"
              value={rate}
              onChangeText={(text) => handleInput(text, setRate)}
              editable={!product}
            />
            {product && <Text style={styles.prefilled}>Pre-filled</Text>}
          </View>

          {/* Term */}
          <View style={[styles.inputRow, { backgroundColor: theme.colors.sub_card }]}>
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder={`Term in Months (up to ${product?.maxDurationMonths || 60})`}
              keyboardType="numeric"
              value={termMonths}
              onChangeText={(text) => handleInput(text, setTermMonths)}
              editable={!product}
            />
            {product && <Text style={styles.prefilled}>Pre-filled</Text>}
          </View>
        </View>

        {/* Results Card */}
        {monthlyPayment > 0 && (
          <View style={[styles.resultCard, { backgroundColor: theme.colors.card }]}>
            <Text style={styles.resultTitle}>Monthly Repayment</Text>

            <Text style={[styles.monthlyPayment, { color: theme.colors.sub_text }]}>
              {formatCurrency(monthlyPayment)}
            </Text>

            <View style={styles.resultDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Total Interest</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {formatCurrency(totalInterest)}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Total Payable</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {formatCurrency(monthlyPayment * parseFloat(termMonths))}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Clear Button */}
        {(principal || (rate && !product) || (termMonths && !product)) && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => {
              setPrincipal("");
              if (!product) setRate("");
              if (!product) setTermMonths("");
              Keyboard.dismiss();
            }}
          >
            <Ionicons name="refresh" size={18} color="#DC2626" />
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ====================== STYLES ====================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  scrollContent: { paddingTop: 12 },

  productHeader: {
    borderRadius: 16,
    marginHorizontal: 10,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  companyLogo: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  productInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 12,
    color: "#6B7280",
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    marginVertical: 4,
  },
  productMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 8,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
  },
  metaValue: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "700",
    marginTop: 2,
  },
  prefilled: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "600",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },

  resultCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    marginHorizontal: 10,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3B82F6",
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 8,
  },
  monthlyPayment: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 16,
  },

  resultDetails: {
    width: "100%",
    flexDirection: isTablet ? "row" : "column",
    justifyContent: "space-between",
    gap: 12,
  },
  detailItem: {
    flex: 1,
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 4,
  },

  clearBtn: {
    flexDirection: "row",
    marginHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: height * 0.1,
  },
  clearText: {
    color: "#DC2626",
    fontWeight: "600",
    fontSize: 14,
  },
});