import React from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  Dimensions, Linking, StatusBar, Share, Platform, Alert
} from "react-native";
import { Dialog, Portal, Divider, Button } from 'react-native-paper';
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

const SectionCard = ({ theme, title, children, style }) => (
  <View style={[styles.sectionCard, style, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
    <Text style={[styles.sectionTitleFixed, { color: theme.colors.text }]}>{title}</Text>
    <View style={[styles.sectionContentFixed]}>{children}</View>
  </View>
);

const CollapsibleSection = ({ theme, title, children, initiallyOpen = false }) => {
  const [open, setOpen] = React.useState(initiallyOpen);

  return (
    <View style={[styles.sectionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <TouchableOpacity
        style={styles.collapsibleHeader}
        onPress={() => setOpen(!open)}
        activeOpacity={0.7}
      >
        <Text style={[styles.sectionTitleFixed, { color: theme.colors.text }]}>{title}</Text>
        <Icons.Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={22}
          color={theme.colors.indicator}
        />
      </TouchableOpacity>
      {open && <View style={[styles.sectionContentFixed, { color: theme.colors.sub_text }]}>{children}</View>}
    </View>
  );
};

export default function FinancialDetailsScreen({ route, navigation }) {
  const { theme, isDarkMode } = React.useContext(AppContext);
  const { item } = route.params || {};
  const data = item;

  const [isCommentSheetOpen, setIsCommentSheetOpen] = React.useState(false);
  const [likes, setLikes] = React.useState(data?.likes || 24); // Replace with real data if available
  const [isLiked, setIsLiked] = React.useState(false);
  const [reviews, setReviews] = React.useState(data?.reviews || 3); // Replace with real data if available

  const [rating, setRating] = React.useState(0);
  const [reviewText, setReviewText] = React.useState("");
  const [myComments, setMyComments] = React.useState([]);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [dialogVisible, setDialogVisible] = React.useState(false);
  const [branchOptions, setBranchOptions] = React.useState([]);

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

  // console.log("Financial Product Details:", data); // Debug log to check data structure

  const isLoan = data?.category.toLowerCase() === "loans";
  const isSaving = data?.category.toLowerCase() === "savings";
  const isInsurance = data?.category.toLowerCase() === "insurance";
  const isInvestment = data?.category.toLowerCase() === "investment";

  const companyName = data.company.companyName || "Financial Provider";
  const productName = data.name || "Financial Product";

  // handle call
  const handleCall = (phone) => Linking.openURL(`tel:${phone}`);

  // handle whatsapp
  const handleWhatsapp = (number) => {
    const url = `https://wa.me/${number.replace(/[^0-9]/g, "")}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Unable to open WhatsApp. Please try again.")
    );
  }

  // handle email
  const handleEmail = (email) => Linking.openURL(`mailto:${email}`);

  // handle twitter
  const handleTwitter = (twitterHandle) => {
    const url = `https://twitter.com/${twitterHandle.replace('@', '')}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Unable to open Twitter. Please try again.")
    );
  };

  // handle facebook
  const handleFacebook = (facebookHandle) => {
    const url = `https://www.facebook.com/${facebookHandle.replace('@', '')}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Unable to open Facebook. Please try again.")
    );
  };

  // handle instagram
  const handleInstagram = (instagramHandle) => {
    const url = `https://www.instagram.com/${instagramHandle.replace('@', '')}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Unable to open Instagram. Please try again.")
    );
  };

  // handle website
  const handleWebsite = (website) => {
    const url = website.startsWith("http") ? website : `https://${website}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Unable to open website. Please try again.")
    );
  };

  // Directions handler using coordinates if available, otherwise fallback to address search
  const handleDirections = (company) => {
    if (company.latitude && company.longitude) {
      const url =
        Platform.OS === "ios"
          ? `maps://app?daddr=${company.latitude},${company.longitude}`
          : `geo:${company.latitude || company.latitide},${company.longitude || company.longitude}?q=${company.latitude},${company.longitude}`;
      Linking.openURL(url).catch(() =>
        Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&destination=${company.latitude},${company.longitude}`
        )
      );
    } else if (company.directionsText) {
      const query = encodeURIComponent(company.directionsText);
      const url =
        Platform.OS === "ios"
          ? `maps://app?daddr=${query}`
          : `https://www.google.com/maps/search/?api=1&query=${query}`;
      Linking.openURL(url).catch(() =>
        Alert.alert("Error", "Unable to open maps. Please try again.")
      );
    } else {
      Alert.alert("⚠️ Location!", "Location information not available");
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleShare = async () => {
    try {
      const shareOptions = {
        message: `Check out this financial product: ${productName} by ${companyName}. Learn more about it from the Business Link app > Smart Financing!`,
      };
      await Share.share(shareOptions);
    } catch (error) {
      alert("Error sharing the product. Please try again.");
    }
  };

  // branches display
  const hideDialog = () => setDialogVisible(false);
  const handleBranchesView = (branches) => {
    return (
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog}>
          <Dialog.Icon icon="google-maps" color={theme.colors.indicator} size={40} />
          <Dialog.Title style={{ textAlign: 'center', color: theme.colors.text }}>Choose Branch</Dialog.Title>
          <Dialog.Content>
            {branches.map((branch, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity onPress={() => { hideDialog(); handleDirections(branch); }}>
                  <Text numberOfLines={1} ellipsizeMode="tail" style={{ fontSize: 16, color: theme.colors.sub_text, paddingVertical: 12 }}>{branch.directionsText || `Branch ${index + 1}`}</Text>
                </TouchableOpacity>
                {(index < branches.length - 1) && <Divider />}
              </React.Fragment>
            ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  }

  const handleGetDirections = () => {
    if (data.company.branches && data.company.branches.length > 1) {
      setBranchOptions(data.company.branches);
      setDialogVisible(true);
    } else {
      handleDirections(data.company);
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
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
      {branchOptions.length > 0 && handleBranchesView(branchOptions)}

      <View style={[styles.hero, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity style={styles.navHeader} onPress={() => navigation.goBack()}>
          <Icons.Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.heroCard}>
          <BankLogo source={data.company.logoFile?.url || data.company?.logoDataUrl} name={companyName} />
          <View style={styles.heroTextContainer}>
            <Text style={[styles.companyName, { color: theme.colors.text }]}>{companyName}</Text>
            <Text style={[styles.productName, { color: theme.colors.text }]}>{productName}</Text>
            <View style={styles.tag}>
              <Text style={[styles.tagText]}>
                {isLoan ? "Loan Product" : isSaving ? "Savings Account" : isInsurance ? "Insurance Policy" : "Investment"}
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
              color={isLiked ? "#DC2626" : theme.colors.indicator}
            />
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
              {likes} Like{likes !== 1 ? "s" : ""}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Icons.Ionicons name="share-social-outline" size={24} color={theme.colors.indicator} />
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={openCommentSheet}>
            <Icons.Ionicons name="chatbubble-outline" size={24} color={theme.colors.indicator} />
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleGetDirections}>
            <Icons.Ionicons name="location-outline" size={24} color={theme.colors.indicator} />
            <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>Directions</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Key Highlights */}
        <View style={[styles.highlightsCard, { backgroundColor: theme.colors.sub_card }]}>
          {isLoan && (
            <>
              <HighlightItem theme={theme} label="Interest Rate" value={data.interestRateApr} isRate />
              <HighlightItem theme={theme} label="Maximum Amount" value={'E' + data.maxAmount} />
              <HighlightItem theme={theme} label="Term (Months)" value={data.maxDurationMonths} />
              <HighlightItem theme={theme} label="Repayment Frequency" value={data.repaymentFrequency} isRate />
              {data.collateral && <HighlightItem theme={theme} label="Collateral/Security" value={data.collateral} />}
              <HighlightItem theme={theme} label="Processing Time" value={data.processingTime} />
            </>
          )}

          {isSaving && (
            <>
              <HighlightItem theme={theme} label="Interest Apr" value={data.interestRateApr} isRate />
              <HighlightItem theme={theme} label="Minimum Balance" value={data.minBalance} />
              <HighlightItem theme={theme} label="Withdrawal Intervals" value={data.withdrawalIntervals || '24/7 - E5,000/day'} />
              <HighlightItem theme={theme} label="Account Type" value={data.accountType || 'Fixed Account'} />
            </>
          )}

          {isInsurance && (
            <>
              <HighlightItem theme={theme} label="Monthly Premium" value={data.monthlyPremium} isRate />
              <HighlightItem theme={theme} label="Coverage Amount" value={data.coverageAmount} />
              <HighlightItem theme={theme} label="Policy Type" value={data.policyType} />
            </>
          )}

          {isInvestment && (
            <>
              <HighlightItem theme={theme} label="Minimum Investment" value={data.minInvestment} isRate />
              <HighlightItem theme={theme} label="Expected Returns" value={data.expectedReturns} />
              <HighlightItem theme={theme} label="Risk Level" value={data.riskLevel} />
            </>
          )}
        </View>

        <SectionCard theme={theme} title="About">
          {data.summary && (
            <Text style={[styles.sumary, { color: theme.colors.text }]}>
              {data.summary}
            </Text>
          )}

          <Text style={[styles.paragraph, { color: theme.colors.sub_text }]}>
            {data.description ||
              "A trusted financial product designed with your goals in mind. Backed by strong institutional expertise and regulated by the Financial Services Regulatory Authority (FSRA) of Eswatini."}
          </Text>
        </SectionCard>

        <CollapsibleSection theme={theme} title="Eligibility Requirements" initiallyOpen={true}>
          {data.eligibility.map((el, index) => (
            <Text key={index} style={[styles.bullet, { color: theme.colors.sub_text }]}>• {el}</Text>
          ))}
        </CollapsibleSection>

        <CollapsibleSection theme={theme} title="Required Documents">
          {data.requirements.map((req, index) => (
            <Text key={index} style={[styles.bullet, { color: theme.colors.sub_text }]}>• {req}</Text>
          ))}
        </CollapsibleSection>

        {isInsurance && (
          <CollapsibleSection theme={theme} title="Coverage Details">
            {data.coverageDetails.map((detail, index) => (
              <Text key={index} style={[styles.bullet, { color: theme.colors.sub_text }]}>• {detail}</Text>
            ))}
          </CollapsibleSection>
        )}

        {isInvestment && (
          <CollapsibleSection theme={theme} title="Investment Strategy">
            <Text style={[styles.paragraph, { color: theme.colors.sub_text }]}>
              {data.investmentStrategy || "This investment product follows a diversified strategy, balancing growth and stability. It includes a mix of equities, bonds, and alternative assets to optimize returns while managing risk."}
            </Text>
          </CollapsibleSection>
        )}

        <SectionCard theme={theme} title="Terms & Conditions">
          <Text style={[styles.paragraph, { color: theme.colors.sub_text }]}>
            All applications are subject to final approval. Rates and terms may vary based on credit
            assessment. By proceeding, you agree to the provider’s terms of service, privacy policy,
            and compliance with FSRA regulations.
          </Text>
        </SectionCard>

        <SectionCard theme={theme} title="Application Process">
          {data.applicationSteps.map((step, index) => (
            <Text key={index} style={[styles.paragraph, { color: theme.colors.sub_text }]}>• {step}</Text>
          ))}
        </SectionCard>

        {data.charges &&
          <CollapsibleSection theme={theme} title="Charges & Fees">
            <Text style={[styles.paragraph, { color: theme.colors.sub_text }]}>{data.charges}</Text>
          </CollapsibleSection>
        }

        <SectionCard theme={theme} title="Help & Support">
          <View style={{ flexDirection: "row", flexWrap: 'wrap', alignItems: "center", gap: 8, marginBottom: 6, backgroundColor: theme.colors.sub_card, padding: 10, borderRadius: 8 }}>
            {data.company.companyPhone && <TouchableOpacity style={styles.contactRow} onPress={() => handleCall(data.company.companyPhone)}>
              <Icons.Ionicons name="call-outline" size={22} color={theme.colors.indicator} />
            </TouchableOpacity>}

            {data.company.whatsapp && <TouchableOpacity style={styles.contactRow} onPress={() => handleWhatsapp(data.company.whatsapp)}>
              <Icons.Ionicons name="logo-whatsapp" size={22} color={theme.colors.indicator} />
            </TouchableOpacity>}

            {data.company.email && <TouchableOpacity
              style={styles.contactRow}
              onPress={() =>
                handleEmail(data.company.email)
              }
            >
              <Icons.Ionicons name="mail-outline" size={22} color={theme.colors.indicator} />
            </TouchableOpacity>}

            {data.company.supportEmail && <TouchableOpacity
              style={styles.contactRow}
              onPress={() =>
                handleEmail(data.company.supportEmail)
              }
            >
              <Icons.Entypo name="email" size={22} color={theme.colors.indicator} />
            </TouchableOpacity>}

            {(data.company.twitter) && <TouchableOpacity
              style={styles.contactRow}
              onPress={() => handleTwitter(data.company.twitter)}
            >
              <Icons.Ionicons name="logo-twitter" size={22} color={theme.colors.indicator} />
            </TouchableOpacity>}

            {(data.company.facebook) && <TouchableOpacity
              style={styles.contactRow}
              onPress={() => handleFacebook(data.company.facebook)}
            >
              <Icons.Ionicons name="logo-facebook" size={22} color={theme.colors.indicator} />
            </TouchableOpacity>}

            {(data.company.instagram) && <TouchableOpacity
              style={styles.contactRow}
              onPress={() => handleInstagram(data.company.instagram)}
            >
              <Icons.Ionicons name="logo-instagram" size={22} color={theme.colors.indicator} />
            </TouchableOpacity>}

            {(data.company.website) && <TouchableOpacity
              style={styles.contactRow}
              onPress={() => handleWebsite(data.company.website)}
            >
              <Icons.Ionicons name="globe-outline" size={22} color={theme.colors.indicator} />
            </TouchableOpacity>}
          </View>

          {data.company.operationalHours && <View style={styles.operationalHrs}>
            <Icons.Ionicons name="time-outline" size={22} color={theme.colors.indicator} />
            <Text style={[styles.contactText, { color: theme.colors.sub_text }]}>{data.company.operationalHours}</Text>
          </View>}
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
        backgroundStyle={{ backgroundColor: isDarkMode ? '#666' : '#fff' }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.text }}
      >
        <BottomSheetScrollView style={{}}>
          <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>Reviews & Ratings</Text>

          {/* Review Form */}
          <View style={[styles.reviewForm, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.formLabel, { color: theme.colors.text }]}>Your Rating</Text>
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

            <Text style={[styles.formLabel, { color: theme.colors.text }]}>Write Your Review</Text>
            <BottomSheetTextInput
              style={[styles.reviewInput, { backgroundColor: isDarkMode ? theme.colors.card : "#F9FAFB", color: theme.colors.text }]}
              placeholder="Share your experience..."
              placeholderTextColor={theme.colors.sub_text}
              multiline
              value={reviewText}
              onChangeText={setReviewText}
            />

            <TouchableOpacity style={[styles.submitButton, { backgroundColor: theme.colors.indicator }]} onPress={handleSubmitReview}>
              <Text style={[styles.submitButtonText, { color: theme.colors.text }]}>
                {submitSuccess ? "Submitted!" : "Submit Review"}
              </Text>
            </TouchableOpacity>

            {submitSuccess && (
              <Text style={[styles.successText, { color: theme.colors.sub_text }]}>Thank you! Your review has been added.</Text>
            )}
          </View>

          {/* Reviews List */}
          <Text style={[styles.reviewsListTitle, { color: theme.colors.text }]}>All Reviews ({reviews})</Text>
          {(reviews === 0 && rating === 0) ? (
            <Text style={[styles.noReviewsText, { color: theme.colors.sub_text }]}>No reviews yet. Be the first to review!</Text>
          ) : (
            myComments?.map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={[styles.reviewerName, { color: theme.colors.text }]}>{review.name}</Text>
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
                <Text style={[styles.reviewText, { color: theme.colors.text }]}>{review.text}</Text>
                <Text style={[styles.reviewDate, { color: theme.colors.sub_text }]}>{review.date}</Text>
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </BottomSheetScrollView>
      </BottomSheet>

      {/* Floating AI Agent FAB */}
      <TouchableOpacity style={styles.fab} onPress={() =>
        navigation.navigate("Chatbot", { context: data })}
        activeOpacity={0.9}
      >
        <Icons.MaterialCommunityIcons name="face-agent" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const HighlightItem = ({ theme, label, value, isRate = false }) => (
  <View style={styles.highlightRow}>
    <Text style={[styles.highlightLabel, { color: theme.colors.sub_text }]}>{label}</Text>
    <Text style={[styles.highlightValue, !isRate && { color: theme.colors.sub_text }, isRate && styles.highlightValueRate]}>
      {value || "—"}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 120, paddingTop: 20 },
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
    marginBottom: 1,
    padding: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
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
    justifyContent: "center",
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
    fontWeight: "500",
  },

  highlightsCard: {
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    elevation: 2,
    marginBottom: 20,
  },
  highlightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  highlightLabel: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
  },
  highlightValue: {
    fontSize: 17,
    fontWeight: "700",
  },
  highlightValueRate: {
    color: "#DC2626",
    fontWeight: "800",
  },

  sectionCard: {
    marginHorizontal: 8,
    marginBottom: 16,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 0,
  },
  sectionTitleFixed: {
    fontSize: 18,
    fontWeight: "700",
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
    paddingVertical: 6,
    backgroundColor: "#F8FAFC",
  },

  paragraph: {
    fontSize: 15.5,
    lineHeight: 24,
  },
  bullet: {
    fontSize: 15.5,
    lineHeight: 26,
    color: "#4B5563",
    marginLeft: 6,
    marginVertical: 2,
  },
  sumary: {
    fontSize: 16,
    lineHeight: 28,
    fontWeight: "500",
  },

  contactRow: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
  },

  operationalHrs: {
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
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
    marginBottom: 16,
  },
  submitButton: {
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