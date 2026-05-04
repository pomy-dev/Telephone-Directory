import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  Dimensions,
  Platform,
  StatusBar,
  ActivityIndicator,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Pressable,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Icons } from "../../constants/Icons";
import {
  registerAsWorker,
  updateWorkerProfile,
  getWorkerProfile,
} from "../../service/Supabase-Fuctions";
import { AuthContext } from "../../context/authProvider";
import { AppContext } from "../../context/appContext";
import CustomLoader from "../../components/customLoader";
import { handleCall } from "../../utils/callFunctions";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput } from "react-native-paper";

const { width } = Dimensions.get("window");
const MODAL_COLUMN_WIDTH = (width - 60) / 2;

// --- Helper for Dynamic Contact Icons ---
const getContactIcon = (platform) => {
  switch (platform) {
    case "whatsapp":
      return { name: "logo-whatsapp", color: "#25D366" };
    case "instagram":
      return { name: "logo-instagram", color: "#E4405F" };
    case "facebook":
      return { name: "logo-facebook", color: "#1877F2" };
    case "email":
      return { name: "mail", color: "#f43f5e" };
    default:
      return { name: "link", color: "#64748b" };
  }
};

// ==========================================
// COMPONENT 1: PROFILE PREVIEW (Read-Only)
// ==========================================
const ProfilePreview = ({ form, setGalleryVisible, handleCall, theme }) => {
  const handleContact = (platform, value) => {
    if (!value) return;
    let url = "";
    if (platform === "whatsapp") url = `whatsapp://send?phone=${value}`;
    else if (platform === "email") url = `mailto:${value}`;
    else if (platform === "instagram")
      url = `https://instagram.com/${value.replace("@", "")}`;
    else if (platform === "facebook") url = `https://facebook.com/${value}`;

    if (url)
      Linking.openURL(url).catch(() =>
        Alert.alert("Error", "Could not open link"),
      );
  };

  return (
    <>
      <View style={styles.heroContainer}>
        {form.worker_pp && form.worker_pp.length > 0 ? (
          <Image
            source={{ uri: form.worker_pp[0]?.url || form.worker_pp[0].uri }}
            style={styles.heroImage}
          />
        ) : (
          <View
            style={[
              styles.heroPlaceholder,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <Icons.Ionicons
              name="person-circle-outline"
              size={80}
              color={theme.colors.sub_text}
            />
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.galleryTrigger, { backgroundColor: theme.colors.card2 }]}
        style={[styles.galleryTrigger, { backgroundColor: theme.colors.card2 }]}
        onPress={() => setGalleryVisible(true)}
      >
        <Icons.Ionicons name="images" size={20} color={theme.colors.light} />
        <Text style={[styles.galleryTriggerText, { color: "#fff" }]}>
          View Portfolio ({form.experience_images?.length || 0})
        </Text>
        <Icons.Ionicons
          name="chevron-forward"
          size={16}
          color={theme.colors.sub_text}
        />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.mainContent}>
          {/* Identity */}
          <View style={styles.identityContainer}>
            <Text style={[styles.nameLabelText, { color: theme.colors.text }]}>
              {form.name || "Unnamed Professional"}
            </Text>
            <View style={styles.locRow}>
              <Icons.Ionicons
                name="location"
                size={14}
                color={theme.colors.card2}
              />
              <Text
                style={[
                  styles.locationLabelText,
                  { color: theme.colors.sub_text },
                ]}
              >
                {form.location?.address || "Location not set"}
              </Text>
            </View>

            <View style={styles.contactIconRow}>
              {form.phone && (
                <TouchableOpacity
                  style={[
                    styles.miniSocialBtn,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={handleCall}
                >
                  <Icons.Ionicons name="call" size={20} color="#fff" />
                </TouchableOpacity>
              )}
              {Object.entries(form.contact_options || {}).map(
                ([platform, value]) => {
                  if (!value) return null;
                  const icon = getContactIcon(platform);
                  return (
                    <TouchableOpacity
                      key={platform}
                      style={[
                        styles.miniSocialBtn,
                        { backgroundColor: icon.color },
                      ]}
                      onPress={() => handleContact(platform, value)}
                    >
                      <Icons.Ionicons name={icon.name} size={20} color="#fff" />
                    </TouchableOpacity>
                  );
                },
              )}
            </View>

            <View
              style={[styles.statsRow, { backgroundColor: theme.colors.card }]}
            >
              <View style={styles.statBox}>
                <Icons.Ionicons
                  name="thumbs-up"
                  size={16}
                  color={theme.colors.card2}
                />
                <Text style={[styles.statCount, { color: theme.colors.text }]}>
                  {form.likes || 0}
                </Text>
                <Text
                  style={[styles.statLabel, { color: theme.colors.sub_text }]}
                >
                  Likes
                </Text>
              </View>
              <View
                style={[
                  styles.statBox,
                  { borderLeftWidth: 1, borderColor: theme.colors.border },
                ]}
              >
                <Icons.Ionicons
                  name="thumbs-down"
                  size={16}
                  color={theme.colors.card2}
                />
                <Text style={[styles.statCount, { color: theme.colors.text }]}>
                  {form.dislikes || 0}
                </Text>
                <Text
                  style={[styles.statLabel, { color: theme.colors.sub_text }]}
                >
                  Dislikes
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[styles.divider, { backgroundColor: theme.colors.border }]}
          />

          {/* Bio */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionLabel, { color: theme.colors.sub_text }]}
            >
              Professional Bio
            </Text>
            <Text style={[styles.bioPreviewText, { color: theme.colors.text }]}>
              {form.bio || "No bio provided yet."}
            </Text>
          </View>

          {/* Documents */}
          <View style={styles.section}>
            {form.documents && form.documents.length > 0 && (
              <>
                <Text
                  style={[
                    styles.sectionLabel,
                    { color: theme.colors.sub_text },
                  ]}
                >
                  Qualifications / Certification
                </Text>
                <View style={{ gap: 10 }}>
                  {form.documents.map((doc, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.docPreviewItem,
                        {
                          backgroundColor: theme.colors.card,
                          borderColor: theme.colors.border,
                        },
                      ]}
                      onPress={() => {
                        if (doc?.url) Linking.openURL(doc?.url);
                      }}
                    >
                      <Icons.Ionicons
                        name="document-text"
                        size={18}
                        color={theme.colors.primary}
                      />
                      <Text
                        style={[
                          styles.docPreviewText,
                          { color: theme.colors.text },
                        ]}
                        numberOfLines={1}
                      >
                        {doc.name || "Document"}
                      </Text>
                      <Icons.Ionicons
                        name="open-outline"
                        size={16}
                        color={theme.colors.sub_text}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Services */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionLabel, { color: theme.colors.sub_text }]}
            >
              Services
            </Text>
            <View style={styles.skillsList}>
              {form.skills.map((skill, index) => (
                <View
                  key={index}
                  style={[
                    styles.skillItem,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Icons.Ionicons
                    name="checkmark-circle"
                    size={18}
                    color="#10b981"
                  />
                  <Text
                    style={[styles.skillText, { color: theme.colors.text }]}
                  >
                    {skill}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

// ==========================================
// COMPONENT 2: PROFILE FORM (Design Match)
// ==========================================
const ProfileForm = ({
  form,
  setForm,
  currentSkill,
  setCurrentSkill,
  addSkill,
  isGalleryPicking,
  isProfilePicking,
  removeSkill,
  pickDocument,
  removeDocument,
  pickImage,
  isWorker,
  setManageModalVisible,
  theme,
}) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = React.useRef(null);
  const [selectedPlatform, setSelectedPlatform] = useState("whatsapp");
  const [contactModalVisible, setContactModalVisible] = useState(false);

  const CONTACT_PLATFORMS = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: "logo-whatsapp",
      color: "#25D366",
      keyboard: "phone-pad",
      placeholder: "Enter phone number",
    },
    {
      id: "email",
      label: "Email",
      icon: "mail",
      color: "#f43f5e",
      keyboard: "email-address",
      placeholder: "Enter email address",
    },
    {
      id: "instagram",
      label: "Instagram",
      icon: "logo-instagram",
      color: "#E4405F",
      keyboard: "default",
      placeholder: "Enter username",
    },
    {
      id: "facebook",
      label: "Facebook",
      icon: "logo-facebook",
      color: "#1877F2",
      keyboard: "default",
      placeholder: "Enter page name",
    },
  ];

  const activePlatform = CONTACT_PLATFORMS.find(
    (p) => p.id === selectedPlatform,
  );

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        ref={scrollRef}
        onScroll={(e) => {
          const offset = e.nativeEvent.contentOffset.y;
          setShowScrollTop(offset > 200);
        }}
        scrollEventThrottle={16}
      >
        {/* ── Hero: Profile Picture + Gallery ── */}
        {isWorker && (
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            {/* ── Identity Row: Avatar + Name + Change Button ── */}
            <View style={styles.identityRow}>
              {/* Profile Picture */}
              <TouchableOpacity
                style={styles.avatarWrap}
                onPress={() => pickImage(false)}
                activeOpacity={0.8}
              >
                {form.worker_pp && form.worker_pp.length > 0 ? (
                  <Image
                    source={{
                      uri: form.worker_pp[0]?.url || form.worker_pp[0]?.uri,
                    }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View
                    style={[
                      styles.avatarPlaceholder,
                      { backgroundColor: theme.colors.background },
                    ]}
                  >
                    <Icons.Ionicons
                      name="person-circle-outline"
                      size={44}
                      color={theme.colors.sub_text}
                    />
                  </View>
                )}
                {/* Camera badge */}
                <View
                  style={[
                    styles.cameraBadge,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Icons.Ionicons name="camera" size={11} color="#fff" />
                </View>
              </TouchableOpacity>

              {/* Name + Location */}
              <View style={styles.identityInfo}>
                <Text
                  style={[styles.workerName, { color: theme.colors.text }]}
                  numberOfLines={1}
                >
                  {form.name || "Your Business Name"}
                </Text>
                <View style={styles.locRow}>
                  <View style={styles.locDot} />
                  <Text
                    style={[styles.workerLoc, { color: theme.colors.sub_text }]}
                    numberOfLines={1}
                  >
                    {form.location?.address || "Location not set"}
                  </Text>
                </View>
              </View>

              {/* Change profile pic button */}
              <TouchableOpacity
                style={[
                  styles.changePicBtn,
                  {
                    borderColor: theme.colors.primary,
                    backgroundColor: theme.colors.background,
                  },
                ]}
                onPress={() => pickImage(false)}
                activeOpacity={0.7}
              >
                {isProfilePicking ? (
                  <ActivityIndicator size={12} color={theme.colors.primary} />
                ) : (
                  <>
                    <Icons.MaterialIcons
                      name="flip-camera-ios"
                      size={14}
                      color={theme.colors.primary}
                    />
                    <Text
                      style={[
                        styles.changePicText,
                        { color: theme.colors.primary },
                      ]}
                    >
                      Change
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* ── Divider ── */}
            <View
              style={[
                styles.heroDivider,
                { backgroundColor: theme.colors.border },
              ]}
            />

            {/* ── Gallery Row ── */}
            <View style={styles.gallerySection}>
              <View style={styles.galleryHeader}>
                <Text
                  style={[
                    styles.galleryLabel,
                    { color: theme.colors.sub_text },
                  ]}
                >
                  Portfolio
                </Text>
                <View
                  style={[
                    styles.galleryCountBadge,
                    {
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.galleryCountText,
                      { color: theme.colors.sub_text },
                    ]}
                  >
                    {form.experience_images?.length || 0} photos
                  </Text>
                </View>
              </View>

              <View style={styles.galleryRow}>
                {/* Fixed "Add" button — always visible on the left */}
                <TouchableOpacity
                  style={[
                    styles.galleryAddThumb,
                    
                    {
                      borderColor: theme.colors.card2,
                      backgroundColor: theme.colors.card2,
            
                    },
                  ]}
                  onPress={() => pickImage(true)}
                  activeOpacity={0.7}
                >
                  {isGalleryPicking ? (
                    <ActivityIndicator size={16} color={theme.colors.primary} />
                  ) : (
                    <>
                      <Icons.Ionicons
                        name="add"
                        size={22}
                        color={"#fff"}
                      />
                      <Text
                        style={[
                          styles.galleryAddText,
                          { color: "#fff" },
                        ]}
                      >
                        Add
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Scrollable thumbnails */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.galleryScroll}
                  style={{ flex: 1 }}
                >
                  {form.experience_images &&
                  form.experience_images.length > 0 ? (
                    form.experience_images.map((img, index) => (
                      <TouchableOpacity
                        key={`gallery-${index}`}
                        onPress={() => setManageModalVisible(true)}
                        activeOpacity={0.85}
                      >
                        <Image
                          source={{ uri: img?.url || img?.uri }}
                          style={styles.galleryThumb}
                        />
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View
                      style={[
                        styles.galleryEmptyThumb,
                        {
                          backgroundColor: theme.colors.background,
                          borderColor: theme.colors.border,
                        },
                      ]}
                    >
                      <Icons.Ionicons
                        name="images-outline"
                        size={22}
                        color={theme.colors.sub_text}
                      />
                      <Text
                        style={[
                          styles.galleryEmptyText,
                          { color: theme.colors.sub_text },
                        ]}
                      >
                        No photos yet
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            </View>
          </View>
        )}

        {/* ── 1. Business Identity ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.sub_text }]}>
            Business Identity
          </Text>
          <TextInput
            label="Business Name"
            value={form.name}
            onChangeText={(t) => setForm({ ...form, name: t })}
            mode="outlined"
            style={styles.paperInput}
            theme={{ roundness: 12 }}
            left={<TextInput.Icon icon="briefcase-outline" />}
          />
        </View>

        {/* ── 2. Contact Number ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.sub_text }]}>
            Contact Number
          </Text>
          <TextInput
            label="Phone Number"
            value={form.phone}
            onChangeText={(t) => setForm({ ...form, phone: t })}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.paperInput}
            theme={{ roundness: 12 }}
            left={<TextInput.Icon icon="phone" />}
          />
        </View>

        {/* ── 3. Communication Channel ── */}
        {isWorker && (
          <View style={styles.section}>
            <Text
              style={[styles.sectionLabel, { color: theme.colors.sub_text }]}
            >
              Communication Channel
            </Text>
            <View style={styles.dynamicContactRow}>
              <TouchableOpacity
                style={[
                  styles.platformSelector,
                  { backgroundColor: activePlatform.color },
                ]}
                onPress={() => setContactModalVisible(true)}
              >
                <Icons.Ionicons
                  name={activePlatform.icon}
                  size={18}
                  color="#fff"
                />
                <Text style={styles.platformText}>{activePlatform.label}</Text>
                <Icons.Ionicons name="chevron-down" size={14} color="#fff" />
              </TouchableOpacity>

              <TextInput
                value={form.contact_options?.[selectedPlatform] || ""}
                onChangeText={(text) =>
                  setForm({
                    ...form,
                    contact_options: {
                      ...form.contact_options,
                      [selectedPlatform]: text,
                    },
                  })
                }
                placeholder={activePlatform.placeholder}
                keyboardType={activePlatform.keyboard}
                autoCapitalize="none"
                mode="outlined"
                style={[styles.paperInput, { flex: 1, marginBottom: 0 }]}
                theme={{ roundness: 12 }}
              />
            </View>
          </View>
        )}

        {/* ── 4. Location ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.sub_text }]}>
            Location
          </Text>
          <TextInput
            label="Primary Location (e.g. Mbabane)"
            value={form.location?.address}
            onChangeText={(t) => setForm({ ...form, location: { address: t } })}
            mode="outlined"
            style={styles.paperInput}
            theme={{ roundness: 12 }}
            left={<TextInput.Icon icon="map-marker-outline" />}
          />
        </View>

        <View
          style={[styles.divider, { backgroundColor: theme.colors.border }]}
        />

        {/* ── 5. Document Upload ── */}
        {isWorker && (
          <View style={styles.section}>
            <Text
              style={[styles.sectionLabel, { color: theme.colors.sub_text }]}
            >
              Qualifications & Clearances
            </Text>
            <Text style={[styles.helperText, { color: theme.colors.sub_text }]}>
              Add certificates, licenses, or police clearance
            </Text>
            <TouchableOpacity
              style={[
                styles.uploadDocBtn,
                {
                  backgroundColor: theme.colors.card2,
                  borderColor: theme.colors.card2,
                },
              ]}
              onPress={pickDocument}
            >
              <Icons.Ionicons
                name="cloud-upload"
                size={20}
                color={theme.colors.text}
              />
              <Text
                style={[
                  styles.uploadDocBtnText,
                  { color: theme.colors.text },
                ]}
              >
                Upload Document
              </Text>
            </TouchableOpacity>

            <View style={styles.docList}>
              {form.documents?.map((doc, index) => (
                <View
                  key={index}
                  style={[
                    styles.docItem,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Icons.Ionicons
                    name="document-text"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[styles.docName, { color: theme.colors.text }]}
                    numberOfLines={1}
                  >
                    {doc.name}
                  </Text>
                  <TouchableOpacity onPress={() => removeDocument(index)}>
                    <Icons.Ionicons
                      name="trash-outline"
                      size={18}
                      color="#ef4444"
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        <View
          style={[styles.divider, { backgroundColor: theme.colors.border }]}
        />

        {/* ── 6. Professional Bio ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.sub_text }]}>
            Professional Bio
          </Text>
          <TextInput
            label="What makes your service great?"
            value={form.bio}
            onChangeText={(t) => setForm({ ...form, bio: t })}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={[styles.paperInput, styles.bioInput]}
            theme={{ roundness: 12 }}
            left={<TextInput.Icon icon="text-box-outline" />}
          />
        </View>

        {/* ── 7. Services ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.sub_text }]}>
            Services You Provide
          </Text>
          <View style={styles.skillInputWrapper}>
            <TextInput
              label="e.g. Plumbing, Teaching..."
              value={currentSkill}
              onChangeText={setCurrentSkill}
              mode="outlined"
              style={[styles.paperInput, { flex: 1, marginBottom: 0 }]}
              theme={{ roundness: 12 }}
              left={<TextInput.Icon icon="plus-circle-outline" />}
            />
            <TouchableOpacity
              onPress={addSkill}
              style={[
                styles.addSkillFab,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Icons.Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.skillsList}>
            {form.skills.map((skill, index) => (
              <View
                key={index}
                style={[
                  styles.skillItemEdit,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text style={[styles.skillText, { color: theme.colors.text }]}>
                  • {skill}
                </Text>
                <TouchableOpacity onPress={() => removeSkill(index)}>
                  <Icons.Ionicons
                    name="close-circle"
                    size={20}
                    color="#ef4444"
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Platform picker modal */}
      <Modal visible={contactModalVisible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setContactModalVisible(false)}
        >
          <View
            style={[
              styles.platformModal,
              { backgroundColor: theme.colors.card },
            ]}
          >
            {CONTACT_PLATFORMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.platformOption}
                onPress={() => {
                  setSelectedPlatform(item.id);
                  setContactModalVisible(false);
                }}
              >
                <View
                  style={[styles.optionIcon, { backgroundColor: item.color }]}
                >
                  <Icons.Ionicons name={item.icon} size={18} color="#fff" />
                </View>
                <Text style={[styles.optionText, { color: theme.colors.text }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
const WorkerRegistration = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { theme, isDarkMode } = useContext(AppContext);
  const [isWorker, setIsWorker] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [currentSkill, setCurrentSkill] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    // email: user.email,
    skills: [],
    bio: "",
    worker_pp: [],
    experience_images: [],
    documents: [],
    likes: 0,
    dislikes: 0,
    location: { address: "" },
    contact_options: {},
  });
  const [isGalleryPicking, setIsGalleryPicking] = useState(false);
  const [isProfilePicking, setIsProfilePicking] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  const [manageModalVisible, setManageModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [isDeletingProfile, setIsDeletingProfile] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState([]);

  const toggleSelectAll = () => {
    if (selectedIndices.length === form.experience_images.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(form.experience_images.map((_, i) => i));
    }
  };

  const deleteSelectedImages = () => {
    if (selectedIndices.length === 0) return;
    Alert.alert(
      "Delete Images",
      `Are you sure you want to delete ${selectedIndices.length} selected image(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedImages = form.experience_images.filter(
              (_, index) => !selectedIndices.includes(index),
            );
            setForm({ ...form, experience_images: updatedImages });
            setSelectedIndices([]);
            setManageModalVisible(false);
          },
        },
      ],
    );
  };

  const toggleSelection = (index) => {
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const removeImage = (index, isGallery) => {
    Alert.alert("Delete Image", "Are you sure you want to remove this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          if (isGallery) {
            const updated = [...form.experience_images];
            updated.splice(index, 1);
            setForm({ ...form, experience_images: updated });
          } else {
            setForm({ ...form, worker_pp: [] });
          }
          setManageModalVisible(false);
        },
      },
    ]);
  };

  useEffect(() => {
    checkStatus();
  }, [user]);

  const checkStatus = async () => {
    if (!user?.uid) {
      setFetching(false);
      return;
    }
    const result = await getWorkerProfile(user.uid);
    if (result.success && result.data) {
      setForm(result.data);
      setOriginalData(result.data);
      setIsWorker(true);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
    setFetching(false);
  };

  const toggleEdit = () => {
    if (isEditing) {
      setForm(
        originalData || {
          name: "",
          phone: "",
          email: "",
          skills: [],
          bio: "",
          experience_images: [],
          documents: [],
          likes: 0,
          dislikes: 0,
          location: { address: "" },
        },
      );
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const addSkill = () => {
    if (currentSkill.trim() && !form.skills.includes(currentSkill.trim())) {
      setForm({ ...form, skills: [...form.skills, currentSkill.trim()] });
      setCurrentSkill("");
    }
  };

  const removeSkill = (index) => {
    const updated = [...form.skills];
    updated.splice(index, 1);
    setForm({ ...form, skills: updated });
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*" });
    if (!result.canceled) {
      setForm((prev) => ({
        ...prev,
        documents: [...(prev.documents || []), result.assets[0]],
      }));
    }
  };

  const removeDocument = (index) => {
    const updated = [...(form.documents || [])];
    updated.splice(index, 1);
    setForm({ ...form, documents: updated });
  };

  const handleSave = async () => {
    if (!form.name) {
      Alert.alert("Required", "Please enter business name.");
      return;
    }
    try {
      setLoading(true);
      const result = isWorker
        ? await updateWorkerProfile(user.uid, form)
        : await registerAsWorker({ ...form, user_id: user.uid });

      if (result.success) {
        Alert.alert("Success", "Profile updated.");
        setOriginalData(form);
        setIsEditing(false);
        setIsWorker(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (isGallery) => {
    try {
      isGallery ? setIsGalleryPicking(true) : setIsProfilePicking(true);
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: isGallery ? true : false,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled) {
        const newImages = result.assets.map((asset) => asset);
        isGallery
          ? setForm((prev) => ({
              ...prev,
              experience_images: [
                ...(prev.experience_images || []),
                ...newImages,
              ],
            }))
          : setForm((prev) => ({ ...prev, worker_pp: [...newImages] }));
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      isGallery ? setIsGalleryPicking(false) : setIsProfilePicking(false);
    }
  };

  if (fetching) return <CustomLoader />;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      {/* ── Header ── */}
      <View
        style={[
          styles.headerNav,
          {
            backgroundColor: theme.colors.background,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.Ionicons
            name="arrow-back"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {isEditing ? "Edit Profile" : "My Profile"}
        </Text>

        <View style={{ flexDirection: "row", gap: 15, alignItems: "center" }}>
          {isWorker && (
            <TouchableOpacity onPress={toggleEdit}>
              <Text
                style={[
                  styles.headerActionText,
                  isEditing && { color: "#ef4444" },
                ]}
              >
                {isEditing ? "Cancel" : "Edit"}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.syncBtn, { backgroundColor: theme.colors.card2 }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.syncBtnText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {isEditing ? (
          <ProfileForm
            form={form}
            setForm={setForm}
            isWorker={isWorker}
            currentSkill={currentSkill}
            setCurrentSkill={setCurrentSkill}
            addSkill={addSkill}
            removeSkill={removeSkill}
            pickDocument={pickDocument}
            removeDocument={removeDocument}
            setGalleryVisible={setGalleryVisible}
            pickImage={(isGallery) => pickImage(isGallery)}
            isGalleryPicking={isGalleryPicking}
            isProfilePicking={isProfilePicking}
            setSelectedImageIndex={setSelectedImageIndex}
            setIsDeletingProfile={setIsDeletingProfile}
            setManageModalVisible={setManageModalVisible}
            setSelectedIndices={setSelectedIndices}
            theme={theme}
          />
        ) : (
          <ProfilePreview
            form={form}
            setGalleryVisible={setGalleryVisible}
            theme={theme}
            handleCall={handleCall}
          />
        )}
      </KeyboardAvoidingView>

      {/* ── Portfolio Gallery Modal ── */}
      <Modal visible={galleryVisible} animationType="slide">
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: theme.colors.border },
            ]}
          >
            <TouchableOpacity onPress={() => setGalleryVisible(false)}>
              <Icons.Ionicons
                name="close"
                size={28}
                color={theme.colors.text}
              />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Portfolio
            </Text>
            {isEditing ? (
              <TouchableOpacity onPress={pickImage}>
                <Icons.Ionicons
                  name="add-circle"
                  size={28}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 28 }} />
            )}
          </View>

          <FlatList
            data={form.experience_images}
            numColumns={2}
            contentContainerStyle={{ padding: 10 }}
            ListHeaderComponent={
              <View style={{ paddingHorizontal: 10, paddingBottom: 10 }}>
                <Text
                  style={[
                    styles.sectionLabel,
                    { color: theme.colors.sub_text },
                  ]}
                >
                  Jobs Accomplished
                </Text>
              </View>
            }
            renderItem={({ item, index }) => (
              <View style={styles.modalItem}>
                <Image
                  source={{ uri: item?.url || item?.uri }}
                  style={styles.modalImage}
                />
                {index === 0 && (
                  <View style={styles.mainBadge}>
                    <Text style={styles.mainBadgeText}>MAIN</Text>
                  </View>
                )}
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* ── Manage Gallery Modal ── */}
      <Modal visible={manageModalVisible} animationType="slide">
        <SafeAreaView
          style={[
            styles.modalContainer,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: theme.colors.border },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                setManageModalVisible(false);
                setSelectedIndices([]);
              }}
            >
              <Icons.Ionicons
                name="close"
                size={28}
                color={theme.colors.text}
              />
            </TouchableOpacity>

            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Manage Gallery
            </Text>

            <View
              style={{ flexDirection: "row", gap: 16, alignItems: "center" }}
            >
              <TouchableOpacity onPress={toggleSelectAll}>
                <Text
                  style={[
                    styles.headerActionText,
                    { color: theme.colors.primary },
                  ]}
                >
                  {selectedIndices.length === form.experience_images.length
                    ? "Deselect All"
                    : "Select All"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={deleteSelectedImages}
                disabled={selectedIndices.length === 0}
              >
                <Icons.Ionicons
                  name="trash"
                  size={26}
                  color={
                    selectedIndices.length > 0
                      ? "#ef4444"
                      : theme.colors.sub_text
                  }
                />
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={form.experience_images}
            numColumns={3}
            keyExtractor={(_, index) => `manage-${index}`}
            contentContainerStyle={{ padding: 10 }}
            renderItem={({ item, index }) => {
              const isSelected = selectedIndices.includes(index);
              return (
                <TouchableOpacity
                  style={styles.manageItem}
                  onPress={() => toggleSelection(index)}
                >
                  <Image
                    source={{ uri: item?.url || item?.uri }}
                    style={styles.manageImage}
                  />
                  <View
                    style={[
                      styles.selectionOverlay,
                      isSelected && styles.selectedBox,
                    ]}
                  >
                    {isSelected && (
                      <Icons.Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#3b82f6"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          {selectedIndices.length > 0 && (
            <View
              style={[
                styles.selectionFooter,
                { borderTopColor: theme.colors.border },
              ]}
            >
              <Text
                style={[styles.footerText, { color: theme.colors.primary }]}
              >
                {selectedIndices.length} image
                {selectedIndices.length > 1 ? "s" : ""} selected
              </Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

// ────────────────────────────── Styles ──────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Header ──
  headerNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 60,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  headerActionText: {
    color: "#3b82f6",
    fontWeight: "700",
    fontSize: 15,
  },
  syncBtn: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  syncBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  // ── Scroll & Layout ──
  scrollContent: { paddingBottom: 50, paddingTop: 8 },
  mainContent: { paddingHorizontal: 24, paddingTop: 8 },

  // ── Hero Section ──
  heroSectionContainer: {
    flexDirection: "row",
    height: 280,
    paddingHorizontal: 5,
    paddingVertical: 4,
    gap: 6,
    marginBottom: 8,
  },
  heroLeftColumn: { flex: 3, gap: 6 },
  heroRightColumn: { flex: 1, gap: 6 },

  profilePictureSection: {
    flex: 2,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowOpacity: 0.1,
  },
  profilePictureImage: { width: "100%", height: "100%" },
  profilePicturePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  galleryPreviewSection: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowOpacity: 0.1,
  },
  galleryScrollContent: { paddingHorizontal: 8, paddingVertical: 8, gap: 8 },
  galleryThumbnail: {
    width: 100,
    height: "100%",
    borderRadius: 10,
    marginRight: 4,
  },
  galleryEmptyPlaceholder: {
    width: 100,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  actionButtonLarge: {
    flex: 2,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  actionButtonSmall: {
    flex: 1,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    gap: 6,
  },
  actionButtonSmallText: {
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },

  // ── Section & Inputs ──
  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  paperInput: {
    marginBottom: 12,
    backgroundColor: "transparent",
  },
  bioInput: {
    minHeight: 110,
  },
  helperText: {
    fontSize: 12,
    marginBottom: 10,
    marginTop: -6,
  },
  divider: { height: 1, marginVertical: 16 },

  // ── Dynamic Contact ──
  dynamicContactRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  platformSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  platformText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  // ── Documents ──
  uploadDocBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: "solid",
    gap: 10,
    marginBottom: 12,
  },
  uploadDocBtnText: { fontWeight: "800", fontSize: 15 },
  docList: { gap: 10 },
  docItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
  },
  docName: { flex: 1, fontSize: 14, fontWeight: "600" },

  docPreviewItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
  },
  docPreviewText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },

  // ── Skills ──
  skillInputWrapper: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  addSkillFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  skillsList: { gap: 10 },
  skillItemEdit: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  skillItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  skillText: { fontWeight: "600", flex: 1 },

  // ── Preview Header ──
  heroContainer: { height: 200 },
  heroImage: { width: "100%", height: "100%" },
  heroPlaceholder: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryTrigger: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    elevation: 6,
    shadowOpacity: 0.1,
    marginTop: -28,
    gap: 12,
    // borderWidth: 1,
  },
  galleryTriggerText: { flex: 1, fontWeight: "700" },

  // ── Preview Identity ──
  identityContainer: { marginBottom: 8 },
  nameLabelText: { fontSize: 26, fontWeight: "900", marginBottom: 6 },
  locRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  locationLabelText: { fontSize: 15, fontWeight: "600" },
  contactIconRow: { flexDirection: "row", gap: 12, marginTop: 16 },
  miniSocialBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 20,
  },
  statBox: { flex: 1, alignItems: "center" },
  statCount: { fontWeight: "900", fontSize: 16 },
  statLabel: { fontSize: 10, marginTop: 2 },
  bioPreviewText: { fontSize: 15, lineHeight: 22 },

  // ── Modals ──
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: { fontWeight: "800", fontSize: 18 },
  modalItem: {
    width: MODAL_COLUMN_WIDTH,
    margin: 10,
    borderRadius: 12,
    overflow: "hidden",
  },
  modalImage: { width: "100%", height: 150 },
  mainBadge: {
    position: "absolute",
    top: 5,
    left: 5,
    backgroundColor: "#10b981",
    padding: 4,
    borderRadius: 4,
  },
  mainBadgeText: { color: "#fff", fontSize: 8, fontWeight: "900" },

  // Platform modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 30,
  },
  platformModal: {
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowOpacity: 0.15,
  },
  platformOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 15,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: { fontWeight: "700", fontSize: 15 },

  // Manage gallery
  manageItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  manageImage: { width: "100%", height: "100%" },
  selectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 10,
  },
  selectedBox: {
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    borderColor: "#3b82f6",
  },
  selectionFooter: {
    padding: 20,
    borderTopWidth: 1,
    alignItems: "center",
  },
  footerText: { fontWeight: "800", fontSize: 15 },

  heroCard: {
    marginHorizontal: 0,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 0.5,
    overflow: "hidden",
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  avatarWrap: {
    position: "relative",
    width: 72,
    height: 72,
    flexShrink: 0,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  identityInfo: {
    flex: 1,
    minWidth: 0,
  },
  workerName: {
    fontSize: 16,
    fontWeight: "700",
  },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  locDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
  },
  workerLoc: {
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  changePicBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  changePicText: {
    fontSize: 12,
    fontWeight: "700",
  },
  heroDivider: {
    height: 0.5,
    marginHorizontal: 16,
  },
  gallerySection: {
    padding: 12,
    paddingTop: 10,
  },
  galleryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  galleryLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  galleryCountBadge: {
    borderRadius: 6,
    borderWidth: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  galleryCountText: {
    fontSize: 11,
  },
  galleryScroll: {
    gap: 8,
    paddingBottom: 2,
  },
  galleryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  galleryAddThumb: {
    width: 68,
    height: 68,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "solid",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
    flexShrink: 0, // never shrinks — always visible
  },
  galleryAddText: {
    fontSize: 10,
    fontWeight: "700",
  },
  galleryEmptyThumb: {
    width: 120,
    height: 68,
    borderRadius: 10,
    borderWidth: 0.5,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  galleryEmptyText: {
    fontSize: 10,
    fontWeight: "500",
  },
  galleryScroll: {
    gap: 8,
    paddingBottom: 2,
  },
  galleryThumb: {
    width: 68,
    height: 68,
    borderRadius: 10,
  },
});

export default WorkerRegistration;
