import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
} from "react-native";
import { Icons } from "../../constants/Icons";
import SecondaryNav from "../../components/SecondaryNav";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

// === COLLAPSIBLE SECTION ===
const CollapsibleSection = ({ title, children, initiallyOpen = false }) => {
  const [open, setOpen] = React.useState(initiallyOpen);

  return (
    <View style={styles.sectionCard}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <Icons.Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={22}
          color="#374151"
        />
      </TouchableOpacity>
      {open && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
};

// === LOGO WITH FALLBACK ===
const BankLogo = ({ source, name, size = 80 }) => {
  const [error, setError] = React.useState(false);
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (error || !source) {
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
      source={typeof source === "string" ? { uri: source } : source}
      style={{ width: size, height: size, borderRadius: 16 }}
      resizeMode="contain"
      onError={() => setError(true)}
    />
  );
};

// === MAIN DETAILS SCREEN ===
export default function FinancialDetailsScreen({ route, navigation }) {
  const { item } = route.params || {};
  const data = item;

  if (!data) {
    return (
      <View style={styles.container}>
        <View style={{ height: 25 }} />
        <SecondaryNav title="Details" />
        <Text style={styles.error}>No details available</Text>
      </View>
    );
  }

  const isLoan = data?.category === "loan";
  const isInsurance = data?.category === "insurance";
  const isInvestment = data?.category === "investment";

  const companyName = data.bank || data.company || "Financial Provider";
  const productName = data.type || "Product";

  const openAIAgent = () => {
    navigation.navigate("AIAgentChat");
  };

  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <View style={styles.container}>
      <View style={{ height: 25 }} />
      <SecondaryNav title={`${isLoan ? "Loan" : isInsurance ? "Insurance" : "Investment"} Details`} />

      {/* Header Hero */}
      <View style={styles.heroCard}>
        <BankLogo source={data.logo} name={companyName} size={isTablet ? 100 : 80} />
        <View style={styles.heroText}>
          <Text style={styles.companyName}>{companyName}</Text>
          <Text style={styles.productName}>{productName}</Text>
          {isLoan && <Text style={styles.tag}>Loan Product</Text>}
          {isInsurance && <Text style={styles.tag}>Insurance Policy</Text>}
          {isInvestment && <Text style={styles.tag}>Investment Option</Text>}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Key Highlights Grid */}
        <View style={styles.highlightsGrid}>
          {isLoan && (
            <>
              <View style={styles.highlightItem}>
                <Text style={styles.highlightLabel}>Interest Rate</Text>
                <Text style={styles.highlightValueRate}>{data.rate}</Text>
              </View>
              <View style={styles.highlightItem}>
                <Text style={styles.highlightLabel}>Maximum Amount</Text>
                <Text style={styles.highlightValue}>{data.max}</Text>
              </View>
              <View style={styles.highlightItem}>
                <Text style={styles.highlightLabel}>Loan Term</Text>
                <Text style={styles.highlightValue}>{data.term}</Text>
              </View>
              <View style={styles.highlightItem}>
                <Text style={styles.highlightLabel}>Processing Time</Text>
                <Text style={styles.highlightValue}>{data.processingTime}</Text>
              </View>
            </>
          )}

          {isInsurance && (
            <>
              <View style={styles.highlightItem}>
                <Text style={styles.highlightLabel}>Monthly Premium</Text>
                <Text style={styles.highlightValueRate}>{data.premium}</Text>
              </View>
              <View style={styles.highlightItem}>
                <Text style={styles.highlightLabel}>Coverage Amount</Text>
                <Text style={styles.highlightValue}>{data.cover}</Text>
              </View>
              <View style={styles.highlightItem}>
                <Text style={styles.highlightLabel}>Policy Type</Text>
                <Text style={styles.highlightValue}>{data.type}</Text>
              </View>
            </>
          )}

          {isInvestment && (
            <>
              <View style={styles.highlightItem}>
                <Text style={styles.highlightLabel}>Minimum Investment</Text>
                <Text style={styles.highlightValueRate}>{data.min}</Text>
              </View>
              <View style={styles.highlightItem}>
                <Text style={styles.highlightLabel}>Expected Returns</Text>
                <Text style={styles.highlightValue}>{data.returns}</Text>
              </View>
              <View style={styles.highlightItem}>
                <Text style={styles.highlightLabel}>Risk Level</Text>
                <Text style={styles.highlightValue}>Moderate</Text>
              </View>
            </>
          )}
        </View>

        {/* Collapsible Sections */}
        <CollapsibleSection title="About" initiallyOpen={true}>
          <Text style={styles.paragraph}>
            {data.description || "A reliable financial product designed to meet your needs with competitive terms and trusted backing."}
          </Text>
        </CollapsibleSection>

        {isLoan && (
          <>
            <CollapsibleSection title="Eligibility Requirements">
              <Text style={styles.bullet}>• Be an Eswatini resident aged 21–65</Text>
              <Text style={styles.bullet}>• Minimum monthly income: E5,000</Text>
              <Text style={styles.bullet}>• Valid ID and proof of residence</Text>
              <Text style={styles.bullet}>• 3 months bank statements</Text>
              <Text style={styles.bullet}>• Clean credit record preferred</Text>
            </CollapsibleSection>

            <CollapsibleSection title="Required Documents">
              <Text style={styles.bullet}>• Copy of National ID / Passport</Text>
              <Text style={styles.bullet}>• Proof of income (payslips)</Text>
              <Text style={styles.bullet}>• Proof of residence (utility bill)</Text>
              <Text style={styles.bullet}>• Bank statements (last 3 months)</Text>
            </CollapsibleSection>
          </>
        )}

        {isInsurance && (
          <>
            <CollapsibleSection title="Coverage Plan">
              <Text style={styles.bullet}>• Hospitalization & medical expenses</Text>
              <Text style={styles.bullet}>• Outpatient consultations</Text>
              <Text style={styles.bullet}>• Prescription medication</Text>
              <Text style={styles.bullet}>• Emergency evacuation</Text>
            </CollapsibleSection>

            <CollapsibleSection title="Claims Process">
              <Text style={styles.paragraph}>
                Submit claims within 90 days with original invoices and medical reports.
                Our dedicated claims team processes valid claims within 7–14 business days.
              </Text>
            </CollapsibleSection>
          </>
        )}

        {isInvestment && (
          <>
            <CollapsibleSection title="Investment Strategy">
              <Text style={styles.paragraph}>
                This fund invests in a diversified portfolio of blue-chip equities, government bonds, and cash equivalents
                to deliver consistent long-term growth with moderate risk exposure.
              </Text>
            </CollapsibleSection>

            <CollapsibleSection title="Fees & Charges">
              <Text style={styles.bullet}>• Annual Management Fee: 1.25%</Text>
              <Text style={styles.bullet}>• Performance Fee: None</Text>
              <Text style={styles.bullet}>• Entry/Exit Fee: 0%</Text>
              <Text style={styles.bullet}>• Minimum holding period: 12 months recommended</Text>
            </CollapsibleSection>
          </>
        )}

        <CollapsibleSection title="Terms & Conditions">
          <Text style={styles.paragraph}>
            By proceeding, you agree to the standard terms of service, privacy policy, and applicable regulatory requirements
            of the Financial Services Regulatory Authority (FSRA) of Eswatini. All rates and terms are subject to final credit approval.
          </Text>
        </CollapsibleSection>

        <CollapsibleSection title="Help & Support">
          <TouchableOpacity style={styles.helpItem} onPress={handleCall.bind(this, "+26824040000")}>
            <Icons.Ionicons name="call-outline" size={20} color="#374151" />
            <Text style={styles.helpText}>Call Agent: +268 2404 0000</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpItem} onPress={handleEmail.bind(this, `support@${companyName.toLowerCase().replace(/\s+/g, "")}.sz`)}>
            <Icons.Ionicons name="mail-outline" size={20} color="#374151" />
            <Text style={styles.helpText}>Email: support@{companyName.toLowerCase().replace(/\s+/g, "")}.sz</Text>
          </TouchableOpacity>
          <View style={styles.helpItem}>
            <Icons.Ionicons name="time-outline" size={20} color="#374151" />
            <Text style={styles.helpText}>Mon–Fri: 8:00 AM – 5:00 PM</Text>
          </View>
        </CollapsibleSection>
      </ScrollView>

      {/* Action Buttons */}
      <TouchableOpacity style={styles.fab} onPress={openAIAgent}>
        <Icons.MaterialCommunityIcons name="face-agent" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

// === CLASSIC & PROFESSIONAL STYLES ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  heroCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  heroText: { marginLeft: 20, flex: 1 },
  companyName: { fontSize: 22, fontWeight: "800", color: "#111827" },
  productName: { fontSize: 17, fontWeight: "600", color: "#374151", marginTop: 4 },
  tag: {
    marginTop: 8,
    backgroundColor: "#111827",
    color: "#FFF",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "600",
  },

  highlightsGrid: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  highlightItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
  },
  highlightLabel: { fontSize: 14, color: "#6B7280" },
  highlightValue: { fontSize: 16, fontWeight: "700", color: "#111827" },
  highlightValueRate: { fontSize: 16, fontWeight: "800", color: "#DC2626" },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    backgroundColor: "#F9FAFB",
  },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#111827" },
  sectionContent: { padding: 20, paddingTop: 12 },

  paragraph: { fontSize: 15, color: "#4B5563", lineHeight: 22 },
  bullet: { fontSize: 15, color: "#4B5563", lineHeight: 24, marginLeft: 8 },

  helpItem: { flexDirection: "row", alignItems: "center", marginVertical: 8, gap: 12 },
  helpText: { fontSize: 15, color: "#374151" },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 60,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },

  primaryButtonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderColor: "#111827",
    borderRadius: 14,
    justifyContent: "center",
  },
  secondaryButtonText: { color: "#111827", fontWeight: "600", fontSize: 16 },

  logoPlaceholder: {
    backgroundColor: "#E5E7EB",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: { fontWeight: "800", color: "#6B7280" },

  error: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#9CA3AF" },
});