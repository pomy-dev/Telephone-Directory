import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SecondaryNav from "../../components/SecondaryNav";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

// Reusable Bank Logo with Fallback
const BankLogo = ({ source, bankName, size = 70 }) => {
  const [loadError, setLoadError] = React.useState(false);

  const initials = bankName
    .split(" ")
    .map((w) => w[0]?.toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join("");

  if (loadError) {
    return (
      <View style={[styles.logoPlaceholder, { width: size, height: size }]}>
        <Text style={[styles.logoText, { fontSize: size * 0.35 }]}>
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
        borderRadius: 16,
        backgroundColor: "#F3F4F6",
      }}
      resizeMode="contain"
      onError={() => setLoadError(true)}
    />
  );
};

export default function LoanDetails({ route, navigation }) {
  const { loan } = route.params;

  // Safely handle local or remote logo
  const logoSource =
    typeof loan.logo === "string" && loan.logo.startsWith("http")
      ? { uri: loan.logo }
      : loan.logo; // assume require()

  return (
    <View style={styles.container}>
      <View style={{ height: 25 }} />
      <SecondaryNav title="Loan Details" />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <BankLogo source={logoSource} bankName={loan.bank} size={isTablet ? 90 : 70} />
          <View style={styles.headerText}>
            <Text style={styles.bankName}>{loan.bank}</Text>
            <Text style={styles.loanType}>{loan.type}</Text>
          </View>
        </View>

        {/* Key Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Interest Rate</Text>
            <Text style={styles.metricValueRate}>{loan.rate}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Max Amount</Text>
            <Text style={styles.metricValue}>{loan.max}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Loan Term</Text>
            <Text style={styles.metricValue}>{loan.term}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Processing Time</Text>
            <Text style={styles.metricValue}>{loan.processingTime}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>About This Loan</Text>
          <Text style={styles.descriptionText}>{loan.description}</Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Back to Loans</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Header
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  bankName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  loanType: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },

  // Metrics Grid
  metricsGrid: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  metricItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
  },
  metricItemLast: {
    borderBottomWidth: 0,
  },
  metricLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  metricValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  metricValueRate: {
    fontSize: 15,
    fontWeight: "700",
    color: "#DC2626",
  },

  // Description
  descriptionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },

  // Back Button
  backButton: {
    flexDirection: "row",
    backgroundColor: "#1F2937",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignSelf: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },

  // Fallback Logo
  logoPlaceholder: {
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  logoText: {
    fontWeight: "700",
    color: "#4B5563",
  },
});