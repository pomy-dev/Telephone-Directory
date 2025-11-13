import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SecondaryNav from "../../components/SecondaryNav";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

// Helper: format currency (Eswatini Lilangeni)
const formatCurrency = (value) => {
  return `E${parseFloat(value || 0).toLocaleString("en-SZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export default function LoanCalculator({ navigation }) {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [termMonths, setTermMonths] = useState("");
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

  return (
    <View style={styles.container}>
      <View style={{ height: 25 }} />
      <SecondaryNav title="Loan Calculator" />

      <View style={styles.content}>
        {/* Input Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Enter Loan Details</Text>

          {/* Principal */}
          <View style={styles.inputRow}>
            <Ionicons name="cash-outline" size={20} color="#6B7280" />
            <TextInput
              style={styles.input}
              placeholder="Loan Amount (e.g. 50000)"
              keyboardType="numeric"
              value={principal}
              onChangeText={(text) => handleInput(text, setPrincipal)}
            />
          </View>

          {/* Interest Rate */}
          <View style={styles.inputRow}>
            <Ionicons name="trending-up-outline" size={20} color="#6B7280" />
            <TextInput
              style={styles.input}
              placeholder="Annual Interest Rate % (e.g. 9.5)"
              keyboardType="numeric"
              value={rate}
              onChangeText={(text) => handleInput(text, setRate)}
            />
          </View>

          {/* Term */}
          <View style={styles.inputRow}>
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <TextInput
              style={styles.input}
              placeholder="Term in Months (e.g. 60)"
              keyboardType="numeric"
              value={termMonths}
              onChangeText={(text) => handleInput(text, setTermMonths)}
            />
          </View>
        </View>

        {/* Results Card */}
        {monthlyPayment > 0 && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Monthly Repayment</Text>

            <Text style={styles.monthlyPayment}>
              {formatCurrency(monthlyPayment)}
            </Text>

            <View style={styles.resultDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Total Interest</Text>
                <Text style={styles.detailValue}>
                  {formatCurrency(totalInterest)}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Total Payable</Text>
                <Text style={styles.detailValue}>
                  {formatCurrency(monthlyPayment * parseFloat(termMonths))}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Clear Button */}
        {(principal || rate || termMonths) && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => {
              setPrincipal("");
              setRate("");
              setTermMonths("");
              Keyboard.dismiss();
            }}
          >
            <Ionicons name="refresh" size={18} color="#DC2626" />
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

/* ====================== STYLES ====================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  content: { paddingHorizontal: 16, paddingTop: 12 },

  card: {
    backgroundColor: "#FFFFFF",
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
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#111827",
  },

  resultCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  clearText: {
    color: "#DC2626",
    fontWeight: "600",
    fontSize: 14,
  },
});