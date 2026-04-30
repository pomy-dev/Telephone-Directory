import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Platform,
  Linking,
  Dimensions,
  Share,
  KeyboardAvoidingView,
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
  const rawDate = rawJob.created_at;
  console.log(rawJob.created_at);
  const formattedDate = new Date(rawDate).toLocaleDateString(); // Result: "2026-02-03"

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
    postedTime: formattedDate,
    applications: rawJob.application_count || 0,
  };
};

const JobDetailScreen = ({ route, navigation }) => {
  const { theme, isDarkMode } = React.useContext(AppContext);
  const { user } = React.useContext(AuthContext);
  const { jobData } = route.params;
  const [job, setJob] = useState(jobData ? mapJobData(jobData) : []);
  const from = route.params?.from || "direct";

  // 4. Update the user check to be safe (postedBy will now always exist)
  const isOwner = user?.email === job?.postedBy?.email;

  // Check if there are valid images (not placeholders)
  const hasImages =
    job?.images &&
    job.images.length > 0 &&
    !job.images[0].includes("via.placeholder.com");

  const [modalVisible, setModalVisible] = useState(false);
  const [phone, setPhone] = useState("");
  const [expertiseInput, setExpertiseInput] = useState("");
  const [expertises, setExpertises] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [sheetMinHieght, setSheetMinHeight] = useState("60%");

  const [isSubmitting, setIsSubmitting] = useState(false);
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
      });
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

  const handleSubmit = async () => {
    if (!validateForm())
      return CustomToast("Incomplete!", "Please fill in all required fields.");

    if (job.id == null || job.id == undefined)
      return Alert.alert("Job ID is missing");

    try {
      setIsSubmitting(true);
      // map info
      const applicationData = {
        jobId: job.id,
        user: {
          name: user.displayName,
          email: user?.email,
          phone: phone?.trim(),
          user_id: user?.uid,
        },
        skillSet: expertises,
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
      CustomToast("Failed!", err.message);
      throw err;
    } finally {
      setIsSubmitting(false);
      setModalVisible(false);
      setPhone("");
      setExpertises([]);
      setAttachments([]);
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
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <View
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor={theme.colors.background}
        />
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
              <Text style={[styles.price, { color: theme.colors.success }]}>
                E{job.price}
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
                      color="#10b981"
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
          handleIndicatorStyle={{ backgroundColor: theme.colors.text }}
          enablePanDownToClose
          keyboardBehavior={Platform.OS === "ios" ? "extend" : "interactive"}
          android_keyboardInputMode="adjustResize"
          enableContentPanningGesture={true}
          enableHandlePanningGesture={true}
        >
          <BottomSheetView
            style={[
              styles.modalContent,
              { backgroundColor: isDarkMode ? "#666" : "#fff" },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Apply for this Gig
            </Text>

            <TextInput
              label="Phone Number"
              mode="outlined"
              theme={{ roundness: 12 }}
              value={phone}
              onChangeText={setPhone}
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  backgroundColor: isDarkMode ? "#AAA" : "#fff",
                },
              ]}
              keyboardType="phone-pad"
              onSubmitEditing={addSkill}
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <TextInput
                label="Add Expertise"
                mode="outlined"
                theme={{ roundness: 12 }}
                value={expertiseInput}
                onChangeText={setExpertiseInput}
                style={[
                  styles.input,
                  {
                    flex: 2,
                    color: theme.colors.text,
                    backgroundColor: isDarkMode ? "#AAA" : "#fff",
                  },
                ]}
              />
              <TouchableOpacity
                onPress={addSkill}
                style={[
                  styles.addButton,
                  { opacity: expertiseInput.trim() ? 1 : 0.5 },
                ]}
                disabled={!expertiseInput.trim()}
              >
                <Icons.Ionicons
                  name="add-circle-outline"
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            {/* Skills list – removable chips */}
            {expertises.length > 0 && (
              <BottomSheetScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingVertical: 12,
                  gap: 5,
                  flexDirection: "row",
                  flexWrap: "wrap",
                }}
                style={{ maxHeight: 100 }}
              >
                {expertises.map((exp, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: theme.colors.card2 || "#333",
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 20,
                      gap: 8,
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 14 }}>{exp}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        setExpertises((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
                      }
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                      <Icons.Ionicons
                        name="close-circle"
                        size={20}
                        color="#ff5555"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </BottomSheetScrollView>
            )}

            <TouchableOpacity
              onPress={pickDocuments}
              style={[
                styles.attachButton,
                { backgroundColor: theme.colors.card2 },
              ]}
            >
              <Icons.Ionicons name="attach-outline" color={"#fff"} size={24} />
              <Text style={styles.attachButtonText}>Attach Documents</Text>
            </TouchableOpacity>

            {/* Attachments list – removable */}
            {attachments.length > 0 && (
              <BottomSheetScrollView
                style={{ maxHeight: 180, marginTop: 12 }}
                contentContainerStyle={{ paddingBottom: 16 }}
              >
                {attachments.map((att, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: isDarkMode ? "#444" : "#f9f9f9",
                      padding: 12,
                      borderRadius: 12,
                      marginBottom: 8,
                      gap: 12,
                    }}
                  >
                    {att.mimeType?.startsWith("image/") ? (
                      <Image
                        source={{ uri: att.uri }}
                        style={{ width: 60, height: 60, borderRadius: 8 }}
                      />
                    ) : (
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontWeight: "600",
                            color: theme.colors.text,
                          }}
                        >
                          {att.name}
                        </Text>
                        <Text style={{ fontSize: 12, color: "#888" }}>
                          {(att.size / 1024).toFixed(1)} KB
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={() =>
                        setAttachments((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
                      }
                      hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
                    >
                      <Icons.Ionicons
                        name="close-circle-sharp"
                        size={28}
                        color="#ff4444"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </BottomSheetScrollView>
            )}

            <TouchableOpacity
              onPress={handleSubmit}
              style={styles.submitButton}
            >
              <Icons.Feather name="send" color={"#fff"} size={24} />
              <Text style={styles.submitButtonText}>Submit Application</Text>
              {isSubmitting && (
                <ActivityIndicator
                  size={15}
                  color="#fff"
                  style={{ marginLeft: 10 }}
                />
              )}
            </TouchableOpacity>
          </BottomSheetView>
        </BottomSheetModal>
      </View>
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
    marginBottom: 50,
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
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 70,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default JobDetailScreen;
