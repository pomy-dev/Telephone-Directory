import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SecondaryNav from "../../components/SecondaryNav";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

// === COLORS ===
const COLORS = {
  primary: "#111827",     // Main dark gray
  accent: "#F59E0B",      // Warm amber
  accentLight: "#FFF8E1", // Soft amber tint
  text: "#111827",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  background: "#F9FAFB",
  white: "#FFFFFF",
};

/* ────────────────────── BANK LOGO ────────────────────── */
const BankLogo = ({ source, bankName, size = 50 }) => {
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
        borderRadius: 12,
        backgroundColor: "#F3F4F6",
        resizeMode: "contain",
      }}
      onError={() => setLoadError(true)}
    />
  );
};

/* ────────────────────── MAIN SCREEN ────────────────────── */
export default function LoanCompare({ route, navigation }) {
  const { loans } = route.params;

  const columnWidth = isTablet ? 150 : 120;
  const tableRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasShownTip = useRef(false);
  const animationTimeout = useRef(null);

  const getLogoSource = (logo) => {
    if (typeof logo === "string" && logo.startsWith("http")) {
      return { uri: logo };
    }
    return logo;
  };

  const fields = [
    {
      key: "bankName",
      label: "Bank Name",
      render: (loan) => <Text style={styles.boldText}>{loan.bank}</Text>,
    },
    {
      key: "type",
      label: "Loan Type",
      render: (loan) => <Text style={styles.boldText}>{loan.type}</Text>,
    },
    {
      key: "rate",
      label: "Interest Rate",
      render: (loan) => (
        <Text style={[styles.boldText, styles.rate]}>{loan.rate}</Text>
      ),
    },
    {
      key: "max",
      label: "Max Amount",
      render: (loan) => <Text style={styles.highlight}>{loan.max}</Text>,
    },
    {
      key: "term",
      label: "Term",
      render: (loan) => <Text style={styles.valueText}>{loan.term}</Text>,
    },
    {
      key: "processingTime",
      label: "Processing Time",
      render: (loan) => (
        <Text style={styles.valueText}>{loan.processingTime}</Text>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (loan) => (
        <Text style={styles.descriptionText}>{loan.description}</Text>
      ),
    },
  ];

  // === SHOW SCROLL TIP ONCE ===
  const checkAndShowTip = () => {
    if (hasShownTip.current || !tableRef.current) return;

    tableRef.current.measure((x, y, w, h, px, py) => {
      const totalWidth = columnWidth * (loans.length + 1);
      const screenWidth = Dimensions.get("window").width - 32;

      if (totalWidth > screenWidth) {
        hasShownTip.current = true;

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();

        animationTimeout.current = setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }, 3000);
      }
    });
  };

  useEffect(() => {
    const timer = setTimeout(checkAndShowTip, 500);
    return () => {
      clearTimeout(timer);
      if (animationTimeout.current) clearTimeout(animationTimeout.current);
    };
  }, [loans.length]);

  const renderBankHeader = ({ item }) => (
    <View style={styles.bankHeaderItem}>
      <BankLogo
        source={getLogoSource(item.logo)}
        bankName={item.bank}
        size={isTablet ? 70 : 60}
      />
      <Text style={styles.bankHeaderName} numberOfLines={2}>
        {item.bank}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={{ height: 25 }} />
      <SecondaryNav title={`Compare (${loans.length})`} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* BANK LOGOS */}
        <View style={styles.bankHeaderContainer}>
          <FlatList
            data={loans}
            renderItem={renderBankHeader}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bankHeaderList}
            snapToInterval={isTablet ? 160 : 130}
            decelerationRate="fast"
          />
        </View>

        {/* TABLE */}
        <View ref={tableRef} onLayout={checkAndShowTip}>
          <ScrollView horizontal style={styles.tableWrapper} showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>
              {fields.map((field, idx) => (
                <View
                  key={field.key}
                  style={[
                    styles.row,
                    idx === fields.length - 1 && styles.lastRow,
                  ]}
                >
                  <View style={[styles.labelCell, { width: columnWidth }]}>
                    <Text style={styles.label}>{field.label}</Text>
                  </View>

                  <View style={styles.values}>
                    {loans.map((loan) => (
                      <View
                        key={loan.id}
                        style={[styles.cell, { width: columnWidth }]}
                      >
                        {field.render(loan)}
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* SCROLL TIP */}
        <Animated.View
          style={[
            styles.scrollTip,
            { opacity: fadeAnim },
          ]}
          pointerEvents="none"
        >
          <Ionicons name="arrow-back-outline" size={16} color={COLORS.primary} />
          <Text style={styles.scrollTipText}>
            Swipe left/right to see all columns
          </Text>
          <Ionicons name="arrow-forward-outline" size={16} color={COLORS.primary} />
        </Animated.View>

        {/* BACK BUTTON */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.backText}>Back to Loans</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* ====================== STYLES ====================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1, paddingHorizontal: 16 },

  bankHeaderContainer: { marginVertical: 16, paddingHorizontal: 8 },
  bankHeaderList: { paddingHorizontal: 8 },
  bankHeaderItem: {
    width: isTablet ? 140 : 110,
    alignItems: "center",
    marginHorizontal: 8,
  },
  bankHeaderName: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    color: COLORS.primary,
    flexShrink: 1,
  },

  tableWrapper: { marginBottom: 24 },
  table: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    minHeight: 60,
    alignItems: "center",
  },
  lastRow: { borderBottomWidth: 0 },
  labelCell: { paddingLeft: 16, justifyContent: "center" },
  label: {
    fontWeight: "600",
    color: "#374151",
    fontSize: 14
  },
  values: { flexDirection: "row" },
  cell: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  boldText: {
    fontWeight: "700",
    fontSize: 14,
    color: COLORS.primary,
    textAlign: "center",
  },
  rate: { color: "#DC2626" },
  highlight: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 14
  },
  valueText: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center"
  },
  descriptionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center"
  },

  // SCROLL TIP
  scrollTip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    alignSelf: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  scrollTipText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },

  // BACK BUTTON
  backBtn: {
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignSelf: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  backText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15
  },

  // LOGO FALLBACK
  logoPlaceholder: {
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  logoText: {
    fontWeight: "700",
    color: "#4B5563"
  },
});