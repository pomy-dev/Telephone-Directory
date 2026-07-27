import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Platform,
  Linking,
  Dimensions,
  Share,
} from "react-native";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { TextInput } from "react-native-paper";
import { Icons } from "../../constants/Icons";
import React, { useState, useRef, useCallback } from "react";
import Carousel from "react-native-reanimated-carousel";
import * as DocumentPicker from "expo-document-picker";
import SecondaryNav from "../../components/SecondaryNav";
import { CustomToast } from "../../components/customToast";
import { AuthContext } from "../../context/authProvider";
import {
  applyForGig,
  logUserActivity,
  getGigById,
} from "../../service/Supabase-Fuctions";
import { AppContext } from "../../context/appContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatCurrency } from "../../utils/callFunctions";

const mapJobData = (rawJob) => {
  if (!rawJob) return {};

  // Handle the 'postedby' JSON field from Supabase
  let postedByData = rawJob.postedby;
  if (typeof postedByData === "string") {
    try {
      postedByData = JSON.parse(postedByData);
    } catch (e) {
      postedByData = {};
    }
  }

  // Handle the 'job_location' JSON field
  let locationData = rawJob.job_location;
  if (typeof locationData === "string") {
    try {
      locationData = JSON.parse(locationData);
    } catch (e) {
      locationData = {};
    }
  }

  // DATE FORMATTING LOGIC
  const rawDate = rawJob.postedTime;

  return {
    ...rawJob,
    id: rawJob.id,
    title: rawJob.job_title || rawJob.title,
    description: rawJob.job_description || rawJob.description,
    price: rawJob.job_price || rawJob.price,
    category: rawJob.job_category || rawJob.category,
    // Map job_requirements to requirements
    requirements: rawJob.job_requirements || rawJob.requirements || [],
    // Map job_images to images (extracting URLs if they are objects)
    images: (rawJob.job_images || rawJob.images || []).map((img) =>
      typeof img === "string" ? img : img.url,
    ),
    location:
      locationData?.address || rawJob.location || "Location not specified",
    postedBy: postedByData ||
      rawJob.postedBy || { name: "Poster", email: "", phone: "" },
    postedTime: rawDate,
    applications: rawJob.application_count || 0,
  };
};

const JobDetailScreen = ({ route, navigation }) => {
  const { theme, isDarkMode } = React.useContext(AppContext);
  const { user } = React.useContext(AuthContext);
  const { jobData } = route.params;
  const [job, setJob] = useState(jobData ? mapJobData(jobData) : []);
  const from = route.params?.from || "direct";
  const [validationError, setValidationError] = useState("");



  // Check if there are valid images (not placeholders)
  const hasImages =
    job?.images &&
    job.images.length > 0 &&
    !job.images[0].includes("via.placeholder.com");

  const [phone, setPhone] = useState("");
  const [expertiseInput, setExpertiseInput] = useState("");
  const [expertises, setExpertises] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [sheetMinHieght, setSheetMinHeight] = useState("60%");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { width } = Dimensions.get("window");

  const ref = useRef(null);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  React.useEffect(() => {
    const fetchFreshData = async () => {
      // Check if we need to fetch full details (e.g., from recommendation)
      if (from === "recommendation" && jobData) {
        try {
          const { data, error } = await getGigById(jobData.id);
          if (data) {
            // Update state with the fully mapped database record
            setJob(mapJobData(data));
          }
        } catch (err) {
          console.error("Error fetching full job details:", err);
        }
      }
    };

    fetchFreshData();
  }, [job?.id, from]);

  const openSheet = () => {
    ref.current?.present();
  };

  const handleCall = () => {
    Linking.openURL(`tel:${job?.postedBy?.phone}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${job?.postedBy?.email}`);
  };

  const handleSMS = async () => {
    shareMessage = `Hello ${job?.postedBy?.name}!\n\n`;
    const smsUrl =
      Platform.OS === "ios"
        ? `sms:${job?.postedBy?.phone}&body=${encodeURIComponent(shareMessage)}` // iOS uses semicolon
        : `smsto:${job?.postedBy?.phone}?body=${encodeURIComponent(shareMessage)}`;
    if (await Linking.canOpenURL(smsUrl)) {
      await Linking.openURL(smsUrl);
    } else {
      console.log("SMS client not available for URL:", smsUrl);
      throw new Error("SMS client not available");
    }
    console.log("After sending SMS");
  };

  const pickDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: false,
      });
      // 1. Check if the user canceled the selection
      if (result.canceled) {
        console.log("User cancelled document picker");
        return; // Exit early
      }

      if (result) {
        setAttachments([...attachments, result?.assets[0]]);
        // console.log('Picked document:', result);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const validateForm = () => {
    let isValid = false;
    if (phone.trim() !== "" && expertises.length > 0) isValid = true;

    return isValid;
  };

  // const handleSubmit = async () => {
  //   let finalExpertises = [...expertises];

  //   // 1. Auto-capture text remaining in the input
  //   if (expertiseInput.trim()) {
  //     finalExpertises.push(expertiseInput.trim());
  //   }

  //   // VALIDATION
  //   if (phone.trim() === "") {
  //     setValidationError("Please enter your phone number.");
  //     return;
  //   }

  //   if (finalExpertises.length === 0) {
  //     setValidationError("Please add at least one skill or experience.");
  //     return;
  //   }

  //   try {
  //     setIsSubmitting(true);
  //     const applicationData = {
  //       jobId: job.id,
  //       user: {
  //         name: user.displayName,
  //         email: user?.email,
  //         phone: phone?.trim(),
  //         user_id: user?.uid,
  //       },
  //       skillSet: finalExpertises,
  //       status: "pending",
  //       attachments: attachments,
  //     };

  //     const response = await applyForGig(applicationData);

  //     if (response.success) {
  //       await logUserActivity({
  //         userId: user.uid,
  //         itemId: job.id,
  //         action: "applied for gig",
  //         itemType: "pomy_gigs",
  //       });

  //       CustomToast("Success! 👍", "Application submitted successfully.");

  //       // Reset only on SUCCESS
  //       setValidationError("");
  //       setPhone("");
  //       setExpertises([]);
  //       setExpertiseInput("");
  //       setAttachments([]);
  //       ref.current?.dismiss();
  //     } else {
  //       throw new Error("Submission failed");
  //     }
  //   } catch (err) {
  //     setValidationError("Please make sure fill all the fields.");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleSubmit = async () => {
    // Flush any text still in the expertise input — user shouldn't lose it
    const finalExpertises = expertiseInput.trim()
      ? [...expertises, expertiseInput.trim()]
      : expertises;

    if (expertiseInput.trim()) {
      setExpertises(finalExpertises);
      setExpertiseInput("");
    }

    // Mark as submitted so inline errors appear
    setSubmitted(true);

    const phoneValid = phone.trim() !== "";
    const expertiseValid = finalExpertises.length > 0;

    if (!phoneValid || !expertiseValid) return;

    if (job.id == null || job.id == undefined)
      return Alert.alert("Job ID is missing");

    try {
      setIsSubmitting(true);
      const applicationData = {
        jobId: job.id,
        user: {
          name: user.displayName,
          email: user?.email,
          phone: phone?.trim(),
          user_id: user?.uid,
        },
        skillSet: finalExpertises,
        status: "pending",
        attachments: attachments,
      };
      const response = await applyForGig(applicationData);

      if (response.success) {
        await logUserActivity({
          userId: user.uid,
          itemId: job.id,
          action: "applied for gig",
          itemType: "pomy_gigs",
        });
        CustomToast(
          "Success!👍",
          "Your application has been successfully submitted.",
        );
      } else throw new Error("Application submission failed");
    } catch (err) {
      console.log(err);
      CustomToast("Failed to submit your application please try again later ");
      throw err;
    } finally {
      setIsSubmitting(false);
      ref.current?.dismiss();
      setPhone("");
      setExpertises([]);
      setAttachments([]);
      setSubmitted(false); // reset for next open
      setSheetMinHeight(0);
    }
  };

  const handleShareJob = () => {
    const shareMessage = `Check out this quick-job:\n 
        ${job.title} for R${job.price}.
        \n\nDescription: ${job.description}
        \n\nContact: ${job.postedBy?.name}, Phone: ${job.postedBy?.phone}
        \n\nFind more gigs on Business Link app!`;

    Share.share({
      message: shareMessage,
    })
      .then((result) => console.log("Share result:", result))
      .catch((error) => console.log("Error sharing:", error));
  };

  const addSkill = () => {
    if (!expertiseInput.trim()) return;
    setExpertises([...expertises, expertiseInput.trim()]);
    setExpertiseInput("");
  };

  return (
    <SafeAreaView
      // behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
      <SecondaryNav
        title="Job Details"
        rightIcon="share-social-outline"
        onRightPress={handleShareJob}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {hasImages ? (
          /* SHOW CAROUSEL IF IMAGES EXIST */
          <View style={{ height: 200 }}>
            <Carousel
              loop
              width={width}
              height={200}
              autoPlay={true}
              data={job.images}
              scrollAnimationDuration={2000}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={styles.image} />
              )}
            />
          </View>
        ) : (
          <View></View>
        )}

        <View style={styles.detailsContainer}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {job.title}
            </Text>
            <Text style={[styles.price, { color: theme.colors.indicator }]}>
              {formatCurrency(job.price)}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{job.category}</Text>
            </View>

            {user?.email === job.postedBy?.email && (
              <Text style={[styles.metaText]}>
                Candidates Applied:{job.applications}
              </Text>
            )}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Icons.Ionicons name="person-outline" size={16} color="#666" />
              <Text style={styles.metaText}>
                Posted by {job.postedBy?.name}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Icons.Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.metaText}>{job.postedTime}</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Icons.Ionicons name="location" size={20} color="#ef4444" />
            <Text
              style={[styles.locationText, { color: theme.colors.sub_text }]}
            >
              {job.location}
            </Text>
            {job.distance && (
              <Text style={styles.distanceText}>
                ({job.distance.toFixed(1)} km away)
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Description
            </Text>
            <Text style={styles.description}>{job.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Requirements
            </Text>
            {job.requirements?.length > 0 ? (
              job.requirements.map((requirement, index) => (
                <View key={index} style={styles.requirementItem}>
                  <Icons.Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={theme.colors.indicator}
                  />
                  <Text style={styles.requirementText}>{requirement}</Text>
                </View>
              ))
            ) : (
              <View style={styles.requirementEmpty}>
                <Icons.Ionicons
                  name="alert-circle"
                  size={20}
                  color="#ef4444"
                />
                <Text style={styles.requirementText}>
                  No specific requirements listed.
                </Text>
              </View>
            )}
          </View>

          {user?.email === job?.postedBy?.email && (
            <View style={{ height: 30 }} />
          )}

          {user?.email !== job?.postedBy?.email && (
            <>
              <View style={styles.section}>
                <Text
                  style={[styles.sectionTitle, { color: theme.colors.text }]}
                >
                  Connect Via
                </Text>

                <TouchableOpacity
                  onPress={handleCall}
                  style={[
                    styles.contactButton,
                    { backgroundColor: theme.colors.indicator },
                  ]}
                >
                  <Icons.Ionicons
                    name="call-outline"
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.contactButtonText}>
                    Call {job.postedBy?.name}
                  </Text>
                </TouchableOpacity>

                <View
                  style={{
                    flexDirection: "row",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={handleSMS}
                    style={[
                      styles.contactButtonSecondary,
                      {
                        borderColor: theme.colors.disabled,
                        flex: 1,
                        backgroundColor: isDarkMode ? "#666" : "#fff",
                      },
                    ]}
                  >
                    <Icons.Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color="#4381f3ff"
                    />
                    <Text
                      style={[
                        styles.contactButtonTextSecondary,
                        { color: theme.colors.text },
                      ]}
                    >
                      Send Message
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleEmail}
                    style={[
                      styles.contactButtonSecondary,
                      {
                        borderColor: theme.colors.disabled,
                        flex: 1,
                        backgroundColor: isDarkMode ? "#666" : "#fff",
                      },
                    ]}
                  >
                    <Icons.Ionicons
                      name="mail-outline"
                      size={20}
                      color="#fb2121ff"
                    />
                    <Text
                      style={[
                        styles.contactButtonTextSecondary,
                        { color: theme.colors.text },
                      ]}
                    >
                      Send Email
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {user?.email !== job?.postedBy?.email && (
        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.colors.card,
              borderTopColor: theme.colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.applyButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={openSheet}
          >
            <Text style={styles.applyButtonText}>Apply for this Gig</Text>
          </TouchableOpacity>
        </View>
      )}

      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={["40%", "50%", "60%", "70%", "80%", "90%"]}
        enableDynamicSizing={true}
        maxDynamicContentSize={Dimensions.get("window").height * 0.95}
        backdropComponent={renderBackdrop}
        onDismiss={() => {
          setPhone("");
          setExpertises([]);
          setAttachments([]);
        }}
        backgroundStyle={{ backgroundColor: isDarkMode ? "#666" : "#fff" }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.sub_text }}
        enablePanDownToClose
        keyboardBehavior={Platform.OS === "ios" ? "extend" : "interactive"}
        android_keyboardInputMode="adjustResize"
        enableContentPanningGesture={true}
        enableHandlePanningGesture={true}
      >
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.sheetContent,
            { backgroundColor: theme.colors.card },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Sheet header ── */}
          <View style={styles.sheetHeader}>
            <View
              style={[
                styles.sheetTitleIcon,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Icons.Feather name="send" size={20} color={"#fff"} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sheetTitle, { color: theme.colors.text }]}>
                Apply for this Gig
              </Text>
              <Text
                style={[
                  styles.sheetSubtitle,
                  { color: theme.colors.sub_text },
                ]}
              >
                {job.title}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.sheetDivider,
              { backgroundColor: theme.colors.border },
            ]}
          />

          {/* ── STEP 1: Contact ── */}
          <View style={styles.stepBlock}>
            <View style={styles.stepLabelRow}>
              <View
                style={[
                  styles.stepBadge,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text style={styles.stepBadgeText}>1</Text>
              </View>
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                Your Contact Number
              </Text>
            </View>
            <Text style={[styles.stepHint, { color: theme.colors.sub_text }]}>
              So the employer can reach you directly
            </Text>
            <TextInput
              label="Phone Number"
              mode="outlined"
              theme={{
                roundness: 12,
                colors: {
                  // Label color when NOT focused
                  onSurfaceVariant: theme.colors.sub_text,
                },
              }}
              value={phone}
              onChangeText={(v) => {
                setPhone(v);
              }}
              keyboardType="phone-pad"
              returnKeyType="done"
              textColor={theme.colors.text}
              activeOutlineColor={theme.colors.text}
              style={[styles.input, { backgroundColor: theme.colors.card }]}
              left={<TextInput.Icon icon="phone" color={theme.colors.text} />}
              error={submitted && phone.trim() === ""} // ← shows red outline
            />
            {submitted && phone.trim() === "" && (
              <View style={styles.fieldError}>
                <Icons.Ionicons
                  name="alert-circle-outline"
                  size={14}
                  color="#ef4444"
                />
                <Text style={styles.fieldErrorText}>
                  Phone number is required
                </Text>
              </View>
            )}
          </View>

          {/* ── STEP 2: Experience / Expertise ── */}
          <View style={styles.stepBlock}>
            <View style={styles.stepLabelRow}>
              <View
                style={[
                  styles.stepBadge,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text style={styles.stepBadgeText}>2</Text>
              </View>
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                Your Experience & Skills
              </Text>
            </View>
            <Text style={[styles.stepHint, { color: theme.colors.sub_text }]}>
              Describe what makes you the right fit. Press ↵ or + to add each
              skill.
            </Text>

            {/* Input + Add button */}
            <View style={styles.expertiseInputRow}>
              <TextInput
                label="e.g. 3 years plumbing"
                mode="outlined"
                theme={{
                  roundness: 12,
                  colors: {
                    // Label color when NOT focused
                    onSurfaceVariant: theme.colors.sub_text,
                  },
                }}
                value={expertiseInput}
                onChangeText={setExpertiseInput}
                multiline
                numberOfLines={3}
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={addSkill}
                textColor={theme.colors.text}
                activeOutlineColor={theme.colors.text}
                style={[
                  styles.expertiseInput,
                  { backgroundColor: theme.colors.card },
                ]}
                left={
                  <TextInput.Icon
                    icon="text-box-outline"
                    color={theme.colors.text}
                  />
                }
                error={
                  submitted &&
                  expertises.length === 0 &&
                  !expertiseInput.trim()
                } // ← shows red outline
              />

              <TouchableOpacity
                onPress={addSkill}
                activeOpacity={0.75}
                disabled={!expertiseInput.trim()}
                style={[
                  styles.addSkillBtn,
                  {
                    backgroundColor: expertiseInput.trim()
                      ? theme.colors.primary
                      : theme.colors.border,
                  },
                ]}
              >
                <Icons.Ionicons name="add" size={26} color="#fff" />
              </TouchableOpacity>
            </View>
            {submitted &&
              expertises.length === 0 &&
              !expertiseInput.trim() && (
                <View style={styles.fieldError}>
                  <Icons.Ionicons
                    name="alert-circle-outline"
                    size={14}
                    color="#ef4444"
                  />
                  <Text style={styles.fieldErrorText}>
                    Add at least one skill or experience
                  </Text>
                </View>
              )}

            {/* Chips — wrap to new line, grow naturally */}
            {expertises.length > 0 && (
              <View style={styles.chipsWrap}>
                {expertises.map((exp, index) => (
                  <View
                    key={index}
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          theme.colors.card2 || theme.colors.primary,
                      },
                    ]}
                  >
                    <Icons.Ionicons
                      name="checkmark-circle-outline"
                      size={13}
                      color="rgba(255,255,255,0.85)"
                      style={{ flexShrink: 0 }} // icon never shrinks
                    />
                    <Text
                      style={styles.chipText}
                      numberOfLines={2} // max 2 lines, then ellipsis
                      ellipsizeMode="tail"
                    >
                      {exp}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setExpertises((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
                      }
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      style={{ flexShrink: 0 }} // delete icon never shrinks
                    >
                      <Icons.Ionicons
                        name="close-circle"
                        size={17}
                        color="rgba(255,255,255,0.7)"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Empty state nudge */}
            {expertises.length === 0 && (
              <View
                style={[
                  styles.emptyChips,
                  { borderColor: theme.colors.border },
                ]}
              >
                <Icons.Ionicons
                  name="bulb-outline"
                  size={18}
                  color={theme.colors.sub_text}
                />
                <Text
                  style={[
                    styles.emptyChipsText,
                    { color: theme.colors.sub_text },
                  ]}
                >
                  Your skills will appear here as tags
                </Text>
              </View>
            )}
          </View>

          {/* ── STEP 3: Attachments ── */}
          <View style={styles.stepBlock}>
            <View style={styles.stepLabelRow}>
              <View
                style={[
                  styles.stepBadge,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text style={styles.stepBadgeText}>3</Text>
              </View>
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                Documents{" "}
                <Text
                  style={[
                    styles.optionalTag,
                    { color: theme.colors.sub_text },
                  ]}
                >
                  (optional)
                </Text>
              </Text>
            </View>
            <Text style={[styles.stepHint, { color: theme.colors.sub_text }]}>
              Attach your CV, certificates, or relevant files
            </Text>

            <TouchableOpacity
              onPress={pickDocuments}
              activeOpacity={0.75}
              style={[
                styles.attachBtn,
                {
                  backgroundColor: "#ccc",
                  borderColor: "#ccc",
                },
              ]}
            >
              <Icons.Ionicons
                name="cloud-upload-outline"
                size={20}
                color={theme.colors.primary}
              />
              <Text
                style={[
                  styles.attachBtnText,
                  { color: theme.colors.primary },
                ]}
              >
                Upload Document
              </Text>
            </TouchableOpacity>

            {/* Attachment items */}
            {attachments.length > 0 && (
              <View style={styles.attachList}>
                {attachments.map((att, index) => (
                  <View
                    key={index}
                    style={[
                      styles.attachItem,
                      {
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.attachIconWrap,
                        {
                          backgroundColor: isDarkMode ? "#172554" : "#eff6ff",
                        },
                      ]}
                    >
                      {att.mimeType?.startsWith("image/") ? (
                        <Image
                          source={{ uri: att.uri }}
                          style={styles.attachThumb}
                        />
                      ) : (
                        <Icons.Ionicons
                          name="document-text-outline"
                          size={22}
                          color={theme.colors.primary}
                        />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.attachName,
                          { color: theme.colors.text },
                        ]}
                        numberOfLines={1}
                      >
                        {att.name}
                      </Text>
                      <Text
                        style={[
                          styles.attachSize,
                          { color: theme.colors.sub_text },
                        ]}
                      >
                        {(att.size / 1024).toFixed(1)} KB
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        setAttachments((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
                      }
                      hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                    >
                      <Icons.Ionicons
                        name="trash-outline"
                        size={20}
                        color="#ef4444"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* ── Submit ── */}
          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={isSubmitting}
            style={[
              styles.submitBtn,
              {
                backgroundColor: theme.colors.primary,
                opacity: isSubmitting ? 0.7 : 1,
              },
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator size={18} color="#fff" />
            ) : (
              <Icons.Feather name="send" size={18} color="#fff" />
            )}
            <Text style={styles.submitBtnText}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </BottomSheetScrollView>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  image: {
    width: "100%",
    height: 300,
    backgroundColor: "#f0f0f0",
  },
  detailsContainer: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    flex: 1,
    marginRight: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: "700",
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: "#666",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#666",
  },
  locationText: {
    fontSize: 14,
    fontWeight: "500",
  },
  distanceText: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "600",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: "#666",
  },
  requirementEmpty: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  contactButtonSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
  },
  contactButtonTextSecondary: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    // marginBottom: 50,
  },
  applyButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    paddingHorizontal: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#003366",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    // marginBottom: 10,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  expertisesList: {
    maxHeight: 100,
    marginBottom: 10,
  },
  expertiseItem: {
    fontSize: 14,
    marginBottom: 5,
  },
  attachButton: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  attachButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  attachmentsList: {
    maxHeight: 150,
    marginBottom: 10,
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
  attachmentImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  attachmentFile: {
    flex: 1,
    marginRight: 10,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  attachmentSize: {
    fontSize: 12,
    color: "#666",
  },
  submitButton: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 15,
    marginTop: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  errorBanner: {
    backgroundColor: "#ef4444", // Red alert color
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    gap: 10,
  },
  errorBannerText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },

  // ── Sheet ──────────────────────────────────────────
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
  },
  sheetTitleIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  sheetSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
  sheetDivider: {
    height: 1,
    marginBottom: 20,
  },

  // ── Steps ──────────────────────────────────────────
  stepBlock: {
    marginBottom: 24,
  },
  stepLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  stepBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  stepHint: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
    marginLeft: 34,
  },
  optionalTag: {
    fontSize: 12,
    fontWeight: "400",
  },

  // ── Inputs ─────────────────────────────────────────
  input: {
    marginBottom: 0,
  },
  expertiseInputRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  expertiseInput: {
    flex: 1,
    minHeight: 90,
    marginBottom: 0,
  },
  addSkillBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },

  // ── Chips ──────────────────────────────────────────
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap", // chips flow to next line
    gap: 8,
    marginTop: 12,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    maxWidth: "100%", // never wider than the parent
    flexShrink: 1, // whole chip shrinks before overflowing
  },
  chipText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1, // text compresses first
    flexGrow: 1, // takes all available space between the two icons
  },

  emptyChips: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emptyChipsText: {
    fontSize: 13,
  },

  // ── Attach ─────────────────────────────────────────
  attachBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: "solid",
  },
  attachBtnText: {
    fontSize: 14,
    fontWeight: "700",
  },
  attachList: {
    marginTop: 12,
    gap: 8,
  },
  attachItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  attachIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  attachThumb: {
    width: 44,
    height: 44,
  },
  attachName: {
    fontSize: 14,
    fontWeight: "600",
  },
  attachSize: {
    fontSize: 12,
    marginTop: 2,
  },

  // ── Submit ─────────────────────────────────────────
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  fieldError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
    marginLeft: 4,
  },
  fieldErrorText: {
    fontSize: 12,
    color: "#ef4444",
    fontWeight: "500",
  },
});

export default JobDetailScreen;
