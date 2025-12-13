import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions,
  Linking, StatusBar
} from "react-native";
import { Icons } from "../../constants/Icons";
import { AppContext } from "../../context/appContext";
import SecondaryNav from "../../components/SecondaryNav";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const BankLogo = ({ source, name, size = isTablet ? 100 : 80 }) => {
  const [error, setError] = React.useState(false);

  const initials = name
    .split(" ")
    .map((word) => word[0])
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
      style={{
        width: size,
        height: size,
        borderRadius: 18,
        backgroundColor: "#fff",
      }}
      resizeMode="contain"
      onError={() => setError(true)}
    />
  );
};

const SectionCard = ({ title, children, style }) => (
  <View style={[styles.sectionCard, style]}>
    <Text style={styles.sectionTitleFixed}>{title}</Text>
    <View style={styles.sectionContentFixed}>{children}</View>
  </View>
);

const CollapsibleSection = ({ title, children, initiallyOpen = false }) => {
  const [open, setOpen] = React.useState(initiallyOpen);

  return (
    <View style={styles.sectionCard}>
      <TouchableOpacity
        style={styles.collapsibleHeader}
        onPress={() => setOpen(!open)}
        activeOpacity={0.7}
      >
        <Text style={styles.sectionTitleFixed}>{title}</Text>
        <Icons.Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={22}
          color="#1F2937"
        />
      </TouchableOpacity>
      {open && <View style={styles.sectionContentFixed}>{children}</View>}
    </View>
  );
};

export default function FinancialDetailsScreen({ route, navigation }) {
  const { theme, isDarkMode } = React.useContext(AppContext);
  const { item } = route.params || {};
  const data = item;

  if (!data) {
    return (
      <View style={styles.container}>
        <View style={{ height: 25 }} />
        <SecondaryNav title="Details" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No details available</Text>
        </View>
      </View>
    );
  }

  const isLoan = data?.category === "loan";
  const isInsurance = data?.category === "insurance";
  const isInvestment = data?.category === "investment";

  const companyName = data.bank || data.company || "Financial Provider";
  const productName = data.type || "Financial Product";

  const openAIAgent = () => navigation.navigate("Ask-AI", { context: item });

  const handleCall = (phone) => Linking.openURL(`tel:${phone}`);
  const handleEmail = (email) => Linking.openURL(`mailto:${email}`);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      <View style={[styles.hero, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity style={styles.navHeader} onPress={() => navigation.goBack()}>
          <Icons.Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        {/* Hero Section */}
        <View style={styles.heroCard}>
          <BankLogo source={data.logo} name={companyName} />
          <View style={styles.heroTextContainer}>
            <Text style={styles.companyName}>{companyName}</Text>
            <Text style={styles.productName}>{productName}</Text>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {isLoan ? "Loan Product" : isInsurance ? "Insurance Policy" : "Investment"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Key Highlights */}
        <View style={styles.highlightsCard}>
          {isLoan && (
            <>
              <HighlightItem label="Interest Rate" value={data.rate} isRate />
              <HighlightItem label="Maximum Amount" value={data.max} />
              <HighlightItem label="Loan Term" value={data.term} />
              <HighlightItem label="Processing Time" value={data.processingTime} />
            </>
          )}

          {isInsurance && (
            <>
              <HighlightItem label="Monthly Premium" value={data.premium} isRate />
              <HighlightItem label="Coverage Amount" value={data.cover} />
              <HighlightItem label="Policy Type" value={data.type} />
            </>
          )}

          {isInvestment && (
            <>
              <HighlightItem label="Minimum Investment" value={data.min} isRate />
              <HighlightItem label="Expected Returns" value={data.returns} />
              <HighlightItem label="Risk Level" value="Moderate" />
            </>
          )}
        </View>

        {/* Fixed Sections (Non-collapsible) */}
        <SectionCard title="About">
          <Text style={styles.paragraph}>
            {data.description ||
              "A trusted financial product designed with your goals in mind. Backed by strong institutional expertise and regulated by the Financial Services Regulatory Authority (FSRA) of Eswatini."}
          </Text>
        </SectionCard>

        {/* Conditional Collapsible Sections */}
        {isLoan && (
          <>
            <CollapsibleSection title="Eligibility Requirements" initiallyOpen={true}>
              <Text style={styles.bullet}>• Eswatini resident aged 21–65</Text>
              <Text style={styles.bullet}>• Minimum monthly income: E5,000</Text>
              <Text style={styles.bullet}>• Valid National ID and proof of residence</Text>
              <Text style={styles.bullet}>• Last 3 months bank statements</Text>
              <Text style={styles.bullet}>• Good credit history preferred</Text>
            </CollapsibleSection>

            <CollapsibleSection title="Required Documents">
              <Text style={styles.bullet}>• Copy of National ID or Passport</Text>
              <Text style={styles.bullet}>• Recent payslips (last 3 months)</Text>
              <Text style={styles.bullet}>• Proof of residence (utility bill)</Text>
              <Text style={styles.bullet}>• Bank statements (last 3 months)</Text>
            </CollapsibleSection>
          </>
        )}

        {isInsurance && (
          <>
            <CollapsibleSection title="Coverage Details">
              <Text style={styles.bullet}>• In-patient & out-patient treatment</Text>
              <Text style={styles.bullet}>• Prescription medication coverage</Text>
              <Text style={styles.bullet}>• Emergency medical evacuation</Text>
              <Text style={styles.bullet}>• Dental & optical (limited)</Text>
            </CollapsibleSection>
          </>
        )}

        {isInvestment && (
          <>
            <CollapsibleSection title="Investment Strategy">
              <Text style={styles.paragraph}>
                Diversified portfolio combining blue-chip equities, government bonds, and cash equivalents for stable long-term growth with controlled risk exposure.
              </Text>
            </CollapsibleSection>
          </>
        )}

        {/* Always Visible Sections */}
        <SectionCard title="Terms & Conditions">
          <Text style={styles.paragraph}>
            All applications are subject to final approval. Rates and terms may vary based on credit assessment. By proceeding, you agree to the provider’s terms of service, privacy policy, and compliance with FSRA regulations.
          </Text>
        </SectionCard>

        <SectionCard title="Help & Support">
          <TouchableOpacity style={styles.contactRow} onPress={() => handleCall("+26824040000")}>
            <Icons.Ionicons name="call-outline" size={22} color="#1F2937" />
            <Text style={styles.contactText}>+268 2404 0000</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => handleEmail(`support@${companyName.toLowerCase().replace(/\s+/g, "")}.sz`)}
          >
            <Icons.Ionicons name="mail-outline" size={22} color="#1F2937" />
            <Text style={styles.contactText}>
              support@{companyName.toLowerCase().replace(/\s+/g, "")}.sz
            </Text>
          </TouchableOpacity>

          <View style={styles.contactRow}>
            <Icons.Ionicons name="time-outline" size={22} color="#1F2937" />
            <Text style={styles.contactText}>Monday – Friday: 8:00 AM – 5:00 PM</Text>
          </View>
        </SectionCard>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Floating AI Agent FAB */}
      <TouchableOpacity style={styles.fab} onPress={openAIAgent} activeOpacity={0.9}>
        <Icons.MaterialCommunityIcons name="face-agent" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const HighlightItem = ({ label, value, isRate = false }) => (
  <View style={styles.highlightRow}>
    <Text style={styles.highlightLabel}>{label}</Text>
    <Text style={[styles.highlightValue, isRate && styles.highlightValueRate]}>
      {value || "—"}
    </Text>
  </View>
);

// === PREMIUM CLASSIC STYLES ===
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 17,
    color: "#94A3B8",
    fontWeight: "500",
  },

  // nav header
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },

  // Hero
  hero: {
    marginBottom: 20,
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 12,
  },
  heroCard: { flexDirection: "row", alignItems: "center" },
  heroTextContainer: { marginLeft: 5, flex: 1 },
  companyName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
  },
  productName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4B5563",
    marginTop: 4,
  },
  tag: {
    marginTop: 12,
    backgroundColor: "#111827",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  // Highlights
  highlightsCard: {
    marginHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },
  highlightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  highlightLabel: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },
  highlightValue: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  highlightValueRate: {
    color: "#DC2626",
    fontWeight: "800",
  },

  // Cards
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 6,
  },
  sectionTitleFixed: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: "#F8FAFC",
  },
  sectionContentFixed: {
    padding: 20,
    paddingTop: 8,
  },

  collapsibleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: "#F8FAFC",
  },

  paragraph: {
    fontSize: 15.5,
    lineHeight: 24,
    color: "#4B5563",
  },
  bullet: {
    fontSize: 15.5,
    lineHeight: 26,
    color: "#4B5563",
    marginLeft: 6,
    marginVertical: 2,
  },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 14,
  },
  contactText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },

  logoPlaceholder: {
    backgroundColor: "#E2E8F0",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontWeight: "900",
    color: "#64748B",
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 80,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 14,
  },
});