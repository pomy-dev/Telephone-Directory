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
import { uploadImages, uploadAttachments } from "../../service/uploadFiles";

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
// COMPONENT 1: PROFILE PREVIEW
// ==========================================
const ProfilePreview = ({ form, setGalleryVisible }) => {
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
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.heroContainer}>
        {form.experience_images?.length > 0 ? (
          <Image
            source={{ uri: form.experience_images[0] }}
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
            {form.phone ? (
              <View style={styles.locRow}>
                <Text
                  style={[
                    {
                      fontSize: 15,
                      color: "#64748b",
                      fontWeight: "800",
                      paddingBottom: 9,
                    },
                  ]}
                >
                  {" "}
                  |{" "}
                </Text>
                <Icons.Ionicons name="call" size={14} color="#3b82f6" />
                <Text style={styles.locationLabelText}>{form.phone}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.contactIconRow}>
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
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Professional Bio</Text>
          <Text style={styles.bioPreviewText}>
            {form.bio || "No bio provided yet."}
          </Text>
        </View>

        <View style={styles.section}>
          {form.documents && form.documents.length > 0 ? (
            <>
             <Text style={styles.sectionLabel}>Qualifications / Certification</Text>
            <View style={{ gap: 10 }}>
              {form.documents.map((doc, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.docPreviewItem}
                  onPress={() => {
                    if (doc.url) {
                      Linking.openURL(doc.url);
                    }
                  }}
                >
                  <Icons.Ionicons
                    name="document-text"
                    size={18}
                    color="#64748b"
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
          ) : (
            <Text style={styles.bioPreviewText}>
              
            </Text>
          )}
        </View>

        {/* --- ADDED THIS SECTION BELOW --- */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Services Offered</Text>
          <View style={styles.skillsList}>
            {form.skills && form.skills.length > 0 ? (
              form.skills.map((skill, index) => (
                <View key={index} style={styles.skillItemDisplay}>
                  <Icons.Ionicons
                    name="checkmark-circle"
                    size={18}
                    color="#10b981"
                  />
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.bioPreviewText}>No services listed.</Text>
            )}
          </View>
        </View>
        {/* -------------------------------- */}
      </View>
    </ScrollView>
  );
};

// ==========================================
// COMPONENT 2: PROFILE FORM (With Dynamic Contacts)
// ==========================================
const ProfileForm = ({
  form,
  setForm,
  currentSkill,
  setCurrentSkill,
  addSkill,
  removeSkill,
  pickDocument,
  removeDocument,
  setGalleryVisible,
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
        <View style={styles.heroPlaceholder}>
          <Icons.Ionicons name="images-outline" size={40} color="#cbd5e1" />
          <TouchableOpacity onPress={() => setGalleryVisible(true)}>
            <Text style={styles.galleryTriggerText}>
              Manage Portfolio ({form.experience_images?.length || 0})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Business Identity</Text>
            <TextInput
              style={styles.nameInput}
              value={form.name}
              placeholder="Your Business Name"
              onChangeText={(t) => setForm({ ...form, name: t })}
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Phone number (Work no.)</Text>
            <TextInput
              style={styles.nameInput}
              value={form.phone}
              onChangeText={(t) => setForm({ ...form, phone: t })}
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Location (work station)</Text>
            <TextInput
              style={styles.nameInput}
              value={form.location?.address}
              onChangeText={(t) =>
                setForm({
                  ...form,
                  location: { ...form.location, address: t },
                })
              }
            />
          </View>

          {/* REFINED CONTACT OPTIONS DESIGN */}
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
                <Text style={styles.platformText}>{activePlatform.label}</Text>
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

          {/* DOCUMENT UPLOAD SECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Qualifications</Text>
            <TouchableOpacity
              style={styles.uploadDocBtn}
              onPress={pickDocument}
            >
              <Icons.Ionicons name="cloud-upload" size={20} color="#3b82f6" />
              <Text style={styles.uploadDocBtnText}>Upload Document</Text>
            </TouchableOpacity>
            <View style={styles.docList}>
              {form.documents?.map((doc, index) => (
                <View key={doc.uri || doc.url || index} style={styles.docItem}>
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

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Professional Bio</Text>
            <TextInput
              multiline
              style={styles.bioInputEdit}
              value={form.bio}
              onChangeText={(t) => setForm({ ...form, bio: t })}
              placeholder="What makes your service great?"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Services</Text>
            <View style={styles.skillInputWrapper}>
              <TextInput
                style={styles.growingSkillInput}
                placeholder="e.g. Plumbing..."
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
        <View style={styles.modalOverlay}>
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
        </View>
      </Modal>
    </>
  );
};

// ==========================================
// MAIN WORKER REGISTRATION COMPONENT
// ==========================================
const WorkerRegistration = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [isWorker, setIsWorker] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [currentSkill, setCurrentSkill] = useState("");

  const [form, setForm] = useState({
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
    contact_options: {},
  });
  const [originalData, setOriginalData] = useState(null);

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
    } else {
      setIsEditing(true);
    }
    setFetching(false);
  };

  const handleSave = async () => {
    if (!form.name)
      return Alert.alert("Required", "Please enter business name.");
    setLoading(true);
    try {
      let finalImages = [...form.experience_images];
      const localImages = form.experience_images.filter((uri) =>
        uri.startsWith("file://"),
      );
      if (localImages.length > 0) {
        const results = await uploadImages("workers", "portfolio", localImages);
        finalImages = [
          ...form.experience_images.filter((u) => !u.startsWith("file://")),
          ...results.map((r) => r.url),
        ];
      }


      let finalDocs = [];
    
    // 1. Keep existing documents that are already uploaded (they have a .url property)
    const existingRemoteDocs = (form.documents || []).filter(doc => doc.url && !doc.uri?.startsWith("file://"));
    
    // 2. Identify local documents that need uploading
    const localDocs = (form.documents || []).filter(doc => doc.uri && doc.uri.startsWith("file://"));

      if (localDocs.length > 0) {
        const uploadResults = await uploadAttachments(
          "workers",
          "certificates",
          localDocs,
        );
        finalDocs = [...existingRemoteDocs, ...uploadResults];
      }else {
      finalDocs = existingRemoteDocs;
    }
      

      const finalForm = {
        ...form,
        experience_images: finalImages,
        documents: finalDocs,
      };
      const result = isWorker
        ? await updateWorkerProfile(user.uid, finalForm)
        : await registerAsWorker({ ...finalForm, user_id: user.uid });

      if (result.success) {
        Alert.alert("Success", "Profile Synced.");
        setOriginalData(finalForm);
        setForm(finalForm);
        setIsEditing(false);
        setIsWorker(true);
      }
    } catch (e) {
      Alert.alert("Error", "Save failed.");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.6,
    });
    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      setForm((p) => ({
        ...p,
        experience_images: [...(p.experience_images || []), ...newUris],
      }));
    }
  };

  const pickDocument = async () => {
    const r = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });

    if (!r.canceled) {
      setForm((prev) => ({
        ...prev,
        documents: [...prev.documents, r.assets[0]],
      }));
    }
  };

  if (fetching)
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#10b981" />
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.headerNav}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? "EDIT MODE" : "WORKER PROFILE"}
        </Text>
        <View style={{ flexDirection: "row", gap: 15 }}>
          {isWorker && (
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
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
        keyboardVerticalOffset={0}
      >
        {isEditing ? (
          <ProfileForm
            form={form}
            setForm={setForm}
            currentSkill={currentSkill}
            setCurrentSkill={setCurrentSkill}
            addSkill={() => {
              if (currentSkill.trim())
                setForm({
                  ...form,
                  skills: [...form.skills, currentSkill.trim()],
                });
              setCurrentSkill("");
            }}
            removeSkill={(i) => {
              let s = [...form.skills];
              s.splice(i, 1);
              setForm({ ...form, skills: s });
            }}
            pickDocument={pickDocument}
            removeDocument={(i) => {
              let d = [...form.documents];
              d.splice(i, 1);
              setForm({ ...form, documents: d });
            }}
            setGalleryVisible={setGalleryVisible}
          />
        ) : (
          <ProfilePreview form={form} setGalleryVisible={setGalleryVisible} />
        )}
      </KeyboardAvoidingView>

      <Modal visible={galleryVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setGalleryVisible(false)}>
              <Icons.Ionicons name="close" size={28} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Gallery</Text>
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
            renderItem={({ item }) => (
              <View style={styles.modalItem}>
                <Image source={{ uri: item }} style={styles.modalImage} />
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerSafe: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 60,
  },
  headerTitle: {
    fontSize: 10,
    fontWeight: "900",
    color: "#94a3b8",
    letterSpacing: 1,
  },
  editBtnText: { color: "#3b82f6", fontWeight: "900", fontSize: 12 },
  saveBtnText: { color: "#10b981", fontWeight: "900", fontSize: 12 },
  scrollContent: {
    paddingBottom: 120,
    // flexGrow: 1,
  },
  heroContainer: { height: 260, backgroundColor: "#f8fafc" },
  heroImage: { width: "100%", height: "100%" },
  heroPlaceholder: {
    height: 180,
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
  galleryTriggerText: { flex: 1, fontWeight: "800", fontSize: 14 },
  mainContent: { padding: 25 },
  nameLabelText: { fontSize: 26, fontWeight: "900", color: "#1e293b" },
  nameInput: {
    fontSize: 18,
    fontWeight: "700",
    backgroundColor: "#f8fafc",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  locRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 5 },
  locationLabelText: { fontSize: 14, color: "#64748b", fontWeight: "600" },
  contactIconRow: { flexDirection: "row", gap: 10, marginTop: 20 },
  miniSocialBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 25 },
  section: { marginBottom: 25 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#cbd5e1",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  bioPreviewText: { fontSize: 15, lineHeight: 24, color: "#475569" },
  bioInputEdit: {
    backgroundColor: "#f8fafc",
    padding: 15,
    borderRadius: 12,
    minHeight: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  contactInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  contactIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactInput: { flex: 1, fontSize: 14, fontWeight: "600", color: "#1e293b" },
  uploadDocBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eff6ff",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#3b82f6",
    gap: 10,
  },
  uploadDocBtnText: { color: "#3b82f6", fontWeight: "800" },
  docList: { marginTop: 15, gap: 10 },
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
  skillsList: { gap: 4 },
  skillItemEdit: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 10,
  },
  skillText: { fontWeight: "600", color: "#475569" },
  skillItemDisplay: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    gap: 10,
  },
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
  },
  modalImage: { width: "100%", height: 150 },
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

});

export default WorkerRegistration;
