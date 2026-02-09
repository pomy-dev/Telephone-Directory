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
  StatusBar,
  ActivityIndicator,
  Share,
  Platform,
} from "react-native";
import BottomSheet, { BottomSheetTextInput, BottomSheetScrollView } from "@gorhom/bottom-sheet"; // Ensure this package is installed
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

  const [isCommentSheetOpen, setIsCommentSheetOpen] = React.useState(false);
  const [likes, setLikes] = React.useState(data?.likes); // Replace with real data if available
  const [isLiked, setIsLiked] = React.useState(false);
  const [reviews, setReviews] = React.useState(data?.reviews); // Replace with real data if available

  const [rating, setRating] = React.useState(0);
  const [reviewText, setReviewText] = React.useState("");
  const [myComments, setMyComments] = React.useState([]);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const sheetRef = React.useRef(null);

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

  const getDealType = () => {
    if (isLoan) return "Loans";
    if (isInsurance) return "Insurances";
    if (isInvestment) return "Investments";
    return "Financial Product";
  }

  const companyName = data.bank || data.company || "Financial Provider";
  const productName = data.type || "Financial Product";

  const handleCall = (phone) => Linking.openURL(`tel:${phone}`);

  const handleEmail = (email) => Linking.openURL(`mailto:${email}`);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleShare = async () => {
    try {
      const shareOptions = {
        message: `Check out this financial product: ${productName} by ${companyName}. Learn more about it!`,
      };
      await Share.share(shareOptions);
    } catch (error) {
      alert("Error sharing the product. Please try again.");
    }
  };

  const handleGetDirections = () => {
    if (data.location.lat && data.location.long) {
      const url =
        Platform.OS === "ios"
          ? `maps://app?daddr=${data.latitude},${data.longitude}`
          : `geo:${data.latitude},${data.longitude}?q=${data.latitude},${data.longitude}`;
      Linking.openURL(url).catch(() =>
        Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&destination=${data.latitude},${data.longitude}`
        )
      );
    } else {
      alert("Location coordinates not available");
    }
  };

  const openCommentSheet = () => {
    setIsCommentSheetOpen(true);
    sheetRef.current?.snapToIndex(0);
  };

  const handleSubmitReview = () => {
    if (rating === 0 || reviewText.trim() === "") {
      alert("Please provide a star rating and write a review.");
      return;
    }

    const newComment = {
      id: reviews.length + 1,
      name: "You", // Replace with actual user name from context/auth
      rating,
      text: reviewText.trim(),
      date: new Date().toISOString().split("T")[0],
    };
    setMyComments([...myComments, newComment]);

    setReviews(reviews + 1);
    setRating(0);
    setReviewText("");
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 2000);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      <View style={styles.hero}>
        <TouchableOpacity style={styles.navHeader} onPress={() => navigation.goBack()}>
          <Icons.Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

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

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Icons.Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? "#DC2626" : "#1F2937"}
            />
            <Text style={styles.actionButtonText}>
              {likes} Like{likes !== 1 ? "s" : ""}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Icons.Ionicons name="share-social-outline" size={24} color="#1F2937" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={openCommentSheet}>
            <Icons.Ionicons name="chatbubble-outline" size={24} color="#1F2937" />
            <Text style={styles.actionButtonText}>Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleGetDirections}>
            <Icons.Ionicons name="location-outline" size={24} color="#1F2937" />
            <Text style={styles.actionButtonText}>Directions</Text>
          </TouchableOpacity>
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

        <SectionCard title="About">
          <Text style={styles.paragraph}>
            {data.description ||
              "A trusted financial product designed with your goals in mind. Backed by strong institutional expertise and regulated by the Financial Services Regulatory Authority (FSRA) of Eswatini."}
          </Text>
        </SectionCard>

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
          <CollapsibleSection title="Coverage Details">
            <Text style={styles.bullet}>• In-patient & out-patient treatment</Text>
            <Text style={styles.bullet}>• Prescription medication coverage</Text>
            <Text style={styles.bullet}>• Emergency medical evacuation</Text>
            <Text style={styles.bullet}>• Dental & optical (limited)</Text>
          </CollapsibleSection>
        )}

        {isInvestment && (
          <CollapsibleSection title="Investment Strategy">
            <Text style={styles.paragraph}>
              Diversified portfolio combining blue-chip equities, government bonds, and cash equivalents
              for stable long-term growth with controlled risk exposure.
            </Text>
          </CollapsibleSection>
        )}

        <SectionCard title="Terms & Conditions">
          <Text style={styles.paragraph}>
            All applications are subject to final approval. Rates and terms may vary based on credit
            assessment. By proceeding, you agree to the provider’s terms of service, privacy policy,
            and compliance with FSRA regulations.
          </Text>
        </SectionCard>

        <SectionCard title="Help & Support">
          <TouchableOpacity style={styles.contactRow} onPress={() => handleCall("+26824040000")}>
            <Icons.Ionicons name="call-outline" size={22} color="#1F2937" />
            <Text style={styles.contactText}>+268 2404 0000</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactRow}
            onPress={() =>
              handleEmail(`support@${companyName.toLowerCase().replace(/\s+/g, "")}.sz`)
            }
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

      {/* Comment Bottom Sheet */}
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={["50%", "90%"]}
        enablePanDownToClose={true}
        onClose={() => {
          setIsCommentSheetOpen(false);
          setRating(0);
          setReviewText("");
        }}
        backgroundStyle={{ backgroundColor: theme.colors.card }}
        handleIndicatorStyle={{ backgroundColor: "#94A3B8" }}
      >
        <BottomSheetScrollView style={{}}>
          <Text style={styles.sheetTitle}>Reviews & Ratings</Text>

          {/* Review Form */}
          <View style={styles.reviewForm}>
            <Text style={styles.formLabel}>Your Rating</Text>
            <View style={styles.starContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                  <Icons.Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={32}
                    color="#FBBF24"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>Write Your Review</Text>
            <BottomSheetTextInput
              style={styles.reviewInput}
              placeholder="Share your experience..."
              multiline
              value={reviewText}
              onChangeText={setReviewText}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview}>
              <Text style={styles.submitButtonText}>
                {submitSuccess ? "Submitted!" : "Submit Review"}
              </Text>
            </TouchableOpacity>

            {submitSuccess && (
              <Text style={styles.successText}>Thank you! Your review has been added.</Text>
            )}
          </View>

          {/* Reviews List */}
          <Text style={styles.reviewsListTitle}>All Reviews ({reviews})</Text>
          {(reviews === 0 && rating === 0) ? (
            <Text style={styles.noReviewsText}>No reviews yet. Be the first to review!</Text>
          ) : (
            myComments?.map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{review.name}</Text>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icons.Ionicons
                        key={star}
                        name={star <= review.rating ? "star" : "star-outline"}
                        size={16}
                        color="#FBBF24"
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewText}>{review.text}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </BottomSheetScrollView>
      </BottomSheet>

      {/* Floating AI Agent FAB */}
      <TouchableOpacity style={styles.fab} onPress={() =>
        navigation.navigate("Askai", { context: item, dealType: getDealType() })}
        activeOpacity={0.9}
      >
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
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },

  // Hero (refined for classic look)
  hero: {
    marginBottom: 20,
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
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
    backgroundColor: "#1E40AF", // Deep blue for professional feel
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

  actionButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 5,
    paddingHorizontal: 10,
  },
  actionButton: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 70,
  },
  actionButtonText: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },

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
    backgroundColor: "#1E40AF", // Matching classic blue
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 14,
  },

  sheetTitle: {
    marginHorizontal: 10,
    marginVertical: 5,
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  reviewForm: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  starContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
    backgroundColor: "#F9FAFB",
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: "#1E40AF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  successText: {
    color: "#059669",
    textAlign: "center",
    marginTop: 10,
    fontWeight: "500",
  },
  reviewsListTitle: {
    marginHorizontal: 10,
    marginVertical: 5,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  noReviewsText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginTop: 40,
  },
  reviewItem: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  reviewStars: {
    flexDirection: "row",
    gap: 4,
  },
  reviewText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
  },
  reviewDate: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 8,
  },
});