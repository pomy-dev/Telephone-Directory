import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  Dimensions,
  Platform,
  StatusBar,
  ActivityIndicator,
  SafeAreaView,
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
            source={{ uri: form.worker_pp[0]?.url || form.worker_pp[0] }}
            style={styles.heroImage}
          />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Icons.Ionicons
              name="person-circle-outline"
              size={80}
              color="#e2e8f0"
            />
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.galleryTrigger}
        onPress={() => setGalleryVisible(true)}
      >
        <Icons.Ionicons name="images" size={20} color="#000" />
        <Text style={styles.galleryTriggerText}>
          View Portfolio ({form.experience_images?.length || 0})
        </Text>
        <Icons.Ionicons name="chevron-forward" size={16} color="#94a3b8" />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.mainContent}>
          <View style={styles.identityContainer}>
            <Text style={styles.nameLabelText}>
              {form.name || "Unnamed Professional"}
            </Text>
            <View style={styles.locRow}>
              <Icons.Ionicons name="location" size={14} color="#10b981" />
              <Text style={styles.locationLabelText}>
                {form.location?.address || "Location not set"}
              </Text>
            </View>

            <View style={styles.contactIconRow}>
              {form.phone && (
                <TouchableOpacity
                  style={[styles.miniSocialBtn, { backgroundColor: "#3b82f6" }]}
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

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Icons.Ionicons name="thumbs-up" size={16} color="#10b981" />
                <Text style={styles.statCount}>{form.likes || 0}</Text>
                <Text style={styles.statLabel}>Likes</Text>
              </View>
              <View
                style={[
                  styles.statBox,
                  { borderLeftWidth: 1, borderColor: "#f1f5f9" },
                ]}
              >
                <Icons.Ionicons name="thumbs-down" size={16} color="#ef4444" />
                <Text style={styles.statCount}>{form.dislikes || 0}</Text>
                <Text style={styles.statLabel}>Dislikes</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Professional Bio</Text>
            <Text style={styles.bioPreviewText}>
              {form.bio || "No bio provided yet."}
            </Text>
          </View>

          <View style={styles.section}>
            {form.documents && form.documents.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>
                  Qualifications / Certification
                </Text>
                <View style={{ gap: 10 }}>
                  {form.documents.map((doc, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.docPreviewItem}
                      onPress={() => {
                        if (doc?.url) {
                          Linking.openURL(doc?.url);
                        }
                      }}
                    >
                      <Icons.Ionicons
                        name="document-text"
                        size={18}
                        color={theme.colors.sub_text}
                      />
                      <Text style={styles.docPreviewText} numberOfLines={1}>
                        {doc.name || "Document"}
                      </Text>
                      <Icons.Ionicons
                        name="open-outline"
                        size={16}
                        color="#94a3b8"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Services</Text>
            <View style={styles.skillsList}>
              {form.skills.map((skill, index) => (
                <View key={index} style={styles.skillItem}>
                  <Icons.Ionicons
                    name="checkmark-circle"
                    size={18}
                    color="#10b981"
                  />
                  <Text style={styles.skillText}>{skill}</Text>
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
  setGalleryVisible,
  pickImage,
  isWorker,
  setSelectedImageIndex,
  setIsDeletingProfile,
  setManageModalVisible,
  setSelectedIndices,
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
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        ref={scrollRef}
        onScroll={(e) => {
          const offset = e.nativeEvent.contentOffset.y;
          setShowScrollTop(offset > 200);
        }}
        scrollEventThrottle={16}
      >
        {isWorker && (
          <View style={styles.heroSectionContainer}>
            {/* Left Column: Profile Picture + Gallery */}
            <View style={styles.heroLeftColumn}>
              {/* Profile Picture Section (2/3) */}
              <View style={styles.profilePictureSection}>
                {form.worker_pp && form.worker_pp.length > 0 ? (
                  <Image
                    source={{
                      uri: form.worker_pp[0]?.url || form.worker_pp[0],
                    }}
                    style={styles.profilePictureImage}
                  />
                ) : (
                  <View style={styles.profilePicturePlaceholder}>
                    <Icons.Ionicons
                      name="person-circle-outline"
                      size={60}
                      color="#cbd5e1"
                    />
                  </View>
                )}
              </View>

              {/* Gallery Section (1/3) */}

              <View style={styles.galleryPreviewSection}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.galleryScrollContent}
                >
                  {form.experience_images &&
                    form.experience_images.length > 0 ? (
                    form.experience_images.map((img, index) => (
                      // <TouchableOpacity
                      //   key={`gallery-image-${index}`}
                      //   style={styles.profilePictureSection}
                      //   onPress={() => {
                      //     setSelectedImageIndex(index);
                      //     setIsDeletingProfile(false);
                      //     setManageModalVisible(true);
                      //   }}
                      // >
                      <TouchableOpacity
                        key={`gallery-${index}`}
                        onPress={() => setManageModalVisible(true)} // Open the multi-select modal
                      >
                        <Image
                          key={index}
                          source={{ uri: img?.url || img }}
                          style={styles.galleryThumbnail}
                        />
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.galleryEmptyPlaceholder}>
                      <Icons.Ionicons
                        name="images-outline"
                        size={30}
                        color="#cbd5e1"
                      />
                    </View>
                  )}
                </ScrollView>
              </View>
            </View>

            {/* Right Column: Action Buttons */}
            <View style={styles.heroRightColumn}>
              {/* Add Profile Picture Button (2/3) */}
              <TouchableOpacity
                style={styles.actionButtonLarge}
                onPress={() => pickImage(false)}
                activeOpacity={0.7}
              >
                <Icons.MaterialIcons
                  name="flip-camera-ios"
                  size={28}
                  color="#3b82f6"
                />
                <Text style={styles.actionButtonText}>
                  {isProfilePicking ? "Picking..." : "Profile\nPicture"}
                </Text>
              </TouchableOpacity>

              {/* Add Gallery Button (1/3) */}
              <TouchableOpacity
                style={styles.actionButtonSmall}
                onPress={() => pickImage(true)}
                activeOpacity={0.7}
              >
                <Icons.MaterialCommunityIcons
                  name="camera-plus-outline"
                  size={20}
                  color="#10b981"
                />
                <Text style={styles.actionButtonSmallText}>
                  {isGalleryPicking ? "Picking..." : "Gallery"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.mainContent}>
          {/* 1. BUSINESS IDENTITY */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Business Identity</Text>
            <TextInput
              style={styles.nameInput}
              value={form.name}
              placeholder="Your Business Name"
              placeholderTextColor="#94a3b8"
              onChangeText={(t) => setForm({ ...form, name: t })}
            />
          </View>

          {/* 2. CONTACT DETAILS */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Contact Number</Text>
            <View style={styles.simpleInputWrapper}>
              <Icons.Ionicons
                name="call"
                size={20}
                color="#64748b"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.simpleTextInput}
                value={form.phone}
                placeholder="7600 0000"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                onChangeText={(t) => setForm({ ...form, phone: t })}
              />
            </View>
          </View>

          {/* 3. CONTACT OPTIONS */}
          {isWorker && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Communication Channel</Text>

              <View style={styles.dynamicContactRow}>
                {/* PLATFORM PICKER */}
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
                  <Text style={styles.platformText}>
                    {activePlatform.label}
                  </Text>
                  <Icons.Ionicons name="chevron-down" size={14} color="#fff" />
                </TouchableOpacity>

                {/* SINGLE INPUT */}
                <TextInput
                  style={styles.dynamicContactInput}
                  placeholder={activePlatform.placeholder}
                  keyboardType={activePlatform.keyboard}
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
                  autoCapitalize="none"
                />
              </View>
            </View>
          )}

          {/* 4. LOCATION */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Location</Text>
            <View style={styles.simpleInputWrapper}>
              <Icons.Ionicons
                name="location"
                size={20}
                color="#10b981"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.simpleTextInput}
                value={form.location?.address}
                placeholder="Primary Location (e.g. Mbabane)"
                placeholderTextColor="#94a3b8"
                onChangeText={(t) =>
                  setForm({ ...form, location: { address: t } })
                }
              />
            </View>
          </View>

          <View style={styles.divider} />

          {/* 5. DOCUMENT UPLOAD */}
          {isWorker && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                Qualifications & Clearances
              </Text>
              <Text style={styles.helperText}>
                Add certificates, licenses, or police clearance
              </Text>
              <TouchableOpacity
                style={styles.uploadDocBtn}
                onPress={pickDocument}
              >
                <Icons.Ionicons name="cloud-upload" size={20} color="#3b82f6" />
                <Text style={styles.uploadDocBtnText}>Upload Document</Text>
              </TouchableOpacity>

              <View style={styles.docList}>
                {form.documents?.map((doc, index) => (
                  <View key={index} style={styles.docItem}>
                    <Icons.Ionicons
                      name="document-text"
                      size={20}
                      color="#64748b"
                    />
                    <Text style={styles.docName} numberOfLines={1}>
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

          <View style={styles.divider} />

          {/* 6. BIO */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Professional Bio</Text>
            <TextInput
              multiline
              style={styles.bioInputEdit}
              value={form.bio}
              onChangeText={(t) => setForm({ ...form, bio: t })}
              placeholder="What makes your service great?"
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* 7. SERVICES */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Services You Provide</Text>
            <View style={styles.skillInputWrapper}>
              <TextInput
                style={styles.growingSkillInput}
                placeholder="e.g. Plumbing, Teaching..."
                placeholderTextColor="#94a3b8"
                value={currentSkill}
                onChangeText={setCurrentSkill}
              />
              <TouchableOpacity onPress={addSkill} style={styles.addSkillFab}>
                <Icons.Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.skillsList}>
              {form.skills.map((skill, index) => (
                <View key={index} style={styles.skillItemEdit}>
                  <Text style={styles.skillText}>• {skill}</Text>
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
        </View>
      </ScrollView>

      <Modal visible={contactModalVisible} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setContactModalVisible(false)}
        >
          <View style={styles.platformModal}>
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
                <Text style={styles.optionText}>{item.label}</Text>
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
    email: user.email,
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
            // Filter out the images whose indices are in the selectedIndices array
            const updatedImages = form.experience_images.filter(
              (_, index) => !selectedIndices.includes(index),
            );
            setForm({ ...form, experience_images: updatedImages });
            setSelectedIndices([]); // Reset selection
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
        const newImages = result.assets.map((asset) => asset.uri);
        isGallery
          ? setForm((prev) => ({
            ...prev,
            experience_images: [
              ...(prev.experience_images || []),
              ...newImages,
            ],
          }))
          : setForm((prev) => ({ ...prev, worker_pp: [...newImages] }));

        console.log("Is Gallery. : ", isGallery, "\nUri(s): ", newImages);
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      isGallery ? setIsGalleryPicking(false) : setIsProfilePicking(false);
    }
  };

  if (fetching) return <CustomLoader />;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />
      <View style={{ height: 20 }} />

      <View
        style={[
          styles.headerSafe,
          styles.headerNav,
          { backgroundColor: theme.colors.card },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {isEditing ? "EDIT PROFILE" : "PROFILE"}
        </Text>

        <View style={{ flexDirection: "row", gap: 15 }}>
          {isWorker && (
            <TouchableOpacity onPress={toggleEdit}>
              <Text
                style={[styles.editBtnText, isEditing && { color: "#ef4444" }]}
              >
                {isEditing ? "CANCEL" : "EDIT"}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#10b981" />
            ) : (
              <Text style={styles.saveBtnText}>SYNC</Text>
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

      <Modal visible={galleryVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setGalleryVisible(false)}>
              <Icons.Ionicons name="close" size={28} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Portfolio</Text>
            {isEditing ? (
              <TouchableOpacity onPress={pickImage}>
                <Icons.Ionicons name="add-circle" size={28} color="#10b981" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 28 }} />
            )}
          </View>

          <FlatList
            data={form.experience_images}
            numColumns={2}
            renderItem={({ item, index }) => (
              <View style={styles.modalItem}>
                <Image
                  source={{ uri: item?.url || item }}
                  style={styles.modalImage}
                />
                {index === 0 && (
                  <View style={styles.mainBadge}>
                    <Text style={styles.mainBadgeText}>MAIN</Text>
                  </View>
                )}
              </View>
            )}
            ListHeaderComponent={
              <View style={{ paddingHorizontal: 10 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: theme.colors.sub_text,
                  }}
                >
                  Jobs Accomplished
                </Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>

      {/* Image Management Modal */}
      {/* <Modal visible={manageModalVisible} transparent animationType="fade">
        <View style={styles.manageModalOverlay}>
          <View style={styles.manageModalContent}>
            <View style={styles.manageModalHeader}>
              <Text style={styles.manageModalTitle}>Manage Image</Text>
              <TouchableOpacity onPress={() => setManageModalVisible(false)}>
                <Icons.Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Image
              source={{
                uri: isDeletingProfile
                  ? form.worker_pp[0]?.url || form.worker_pp[0]
                  : form.experience_images[selectedImageIndex]?.url ||
                    form.experience_images[selectedImageIndex],
              }}
              style={styles.manageFullImage}
              resizeMode="contain"
            />

            <TouchableOpacity
              style={styles.deleteImageBtn}
              onPress={() =>
                removeImage(selectedImageIndex, !isDeletingProfile)
              }
            >
              <Icons.Ionicons name="trash-outline" size={20} color="#fff" />
              <Text style={styles.deleteImageBtnText}>Remove from Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> */}

      <Modal visible={manageModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          {/* <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setManageModalVisible(false);
                setSelectedIndices([]);
              }}
            >
              <Icons.Ionicons name="close" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Manage Gallery</Text>
            // In the Modal Header UI
            <TouchableOpacity onPress={toggleSelectAll}>
              <Text style={{ color: "#3b82f6", fontWeight: "700" }}>
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
                color={selectedIndices.length > 0 ? "#ef4444" : "#cbd5e1"}
              />
            </TouchableOpacity>
          </View> */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setManageModalVisible(false);
                setSelectedIndices([]);
              }}
            >
              <Icons.Ionicons name="close" size={28} color="#000" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Manage Gallery</Text>

            {/* Corrected: Comments inside JSX must be wrapped like this */}
            <TouchableOpacity onPress={toggleSelectAll}>
              <Text style={{ color: "#3b82f6", fontWeight: "700" }}>
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
                color={selectedIndices.length > 0 ? "#ef4444" : "#cbd5e1"}
              />
            </TouchableOpacity>
          </View>

          <FlatList
            data={form.experience_images}
            numColumns={3}
            keyExtractor={(_, index) => `manage-${index}`}
            renderItem={({ item, index }) => {
              const isSelected = selectedIndices.includes(index);
              return (
                <TouchableOpacity
                  style={styles.manageItem}
                  onPress={() => toggleSelection(index)}
                >
                  <Image
                    source={{ uri: item?.url || item }}
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
            contentContainerStyle={{ padding: 10 }}
          />

          {selectedIndices.length > 0 && (
            <View style={styles.selectionFooter}>
              <Text style={styles.footerText}>
                {selectedIndices.length} images selected
              </Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerSafe: { borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  headerNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 60,
  },
  headerTitle: { fontSize: 11, fontWeight: "900", color: "#64748b" },
  editBtnText: { color: "#3b82f6", fontWeight: "900" },
  saveBtnText: { color: "#10b981", fontWeight: "900" },
  scrollContent: { paddingBottom: 50 },
  heroSectionContainer: {
    flexDirection: "row",
    height: 280,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 5,
    paddingVertical: 4,
    gap: 6,
  },
  heroLeftColumn: { flex: 3, gap: 6 },
  heroRightColumn: { flex: 1, gap: 6 },

  // Profile Picture Section
  profilePictureSection: {
    flex: 2,
    backgroundColor: "#fff",
    borderRadius: 15,
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
    backgroundColor: "#f1f5f9",
  },

  // Gallery Preview Section
  galleryPreviewSection: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 15,
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
    backgroundColor: "#f1f5f9",
  },

  attachmentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  attachmentText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "600",
  },

  // From Lethu
  dynamicContactRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },

  platformSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },

  platformText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  dynamicContactInput: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 30,
  },

  platformModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
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

  optionText: {
    fontWeight: "700",
    fontSize: 15,
  },
  docPreviewItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  docPreviewText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },

  // Action Buttons
  actionButtonLarge: {
    flex: 2,
    backgroundColor: "#eff6ff",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#3b82f6",
    gap: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#3b82f6",
    textAlign: "center",
  },
  actionButtonSmall: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#10b981",
    gap: 6,
  },
  actionButtonSmallText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#10b981",
    textAlign: "center",
  },
  scrollContent: { paddingBottom: 50 },
  heroContainer: { height: 200, backgroundColor: "#f8fafc" },
  heroImage: { width: "100%", height: "100%" },
  heroPlaceholder: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  galleryTrigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 15,
    elevation: 8,
    shadowOpacity: 0.1,
    marginTop: -30,
    gap: 12,
  },
  galleryTriggerText: { flex: 1, fontWeight: "800" },
  mainContent: { padding: 25 },
  nameLabelText: { fontSize: 26, fontWeight: "900" },
  nameInput: {
    fontSize: 20,
    fontWeight: "900",
    backgroundColor: "#f8fafc",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  locRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  locationLabelText: { fontSize: 16, color: "#64748b", fontWeight: "600" },
  simpleInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  simpleTextInput: { flex: 1, fontSize: 16, fontWeight: "600", color: "#000" },
  inputIcon: { marginRight: 10 },
  contactIconRow: { flexDirection: "row", gap: 12, marginTop: 15 },
  miniSocialBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 20,
  },
  statBox: { flex: 1, alignItems: "center" },
  statCount: { fontWeight: "900" },
  statLabel: { fontSize: 10, color: "#94a3b8" },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 15 },
  section: { marginBottom: 25 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8', marginBottom: 10 },
  bioPreviewText: { fontSize: 15, lineHeight: 22, color: '#475569' },
  bioInputEdit: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 12, minHeight: 120, textAlignVertical: 'top', borderWidth: 1, borderColor: '#e2e8f0' },
  helperText: { fontSize: 12, color: '#94a3b8', marginBottom: 10, marginTop: -5 },
  uploadDocBtn: { marginBottom: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff', padding: 15, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#3b82f6', gap: 10 },
  uploadDocBtnText: { color: '#3b82f6', fontWeight: '800' },
  docList: { gap: 10 },
  docItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  docName: { flex: 1, fontSize: 14, fontWeight: "600" },
  skillInputWrapper: { flexDirection: "row", gap: 10, marginBottom: 15 },
  growingSkillInput: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  addSkillFab: {
    backgroundColor: "#10b981",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  skillsList: { gap: 12 },
  skillItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  skillItemEdit: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 10,
  },
  skillText: { fontWeight: "600", color: "#334155" },
  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontWeight: "800", fontSize: 18 },
  modalItem: {
    width: MODAL_COLUMN_WIDTH,
    margin: 10,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
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

  //single image delete
  manageModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  manageModalContent: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
  },
  manageModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
    alignItems: "center",
  },
  manageModalTitle: {
    fontWeight: "800",
    fontSize: 16,
    color: "#1e293b",
  },
  manageFullImage: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
  },
  deleteImageBtn: {
    flexDirection: "row",
    backgroundColor: "#ef4444",
    width: "100%",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  deleteImageBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },

  //multi image delete:
  manageItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  manageImage: {
    width: "100%",
    height: "100%",
  },
  selectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedBox: {
    backgroundColor: "rgba(59, 130, 246, 0.3)",
    borderColor: "#3b82f6",
  },
  selectionFooter: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    alignItems: "center",
  },
  footerText: {
    fontWeight: "800",
    color: "#3b82f6",
  },
});

export default WorkerRegistration;
