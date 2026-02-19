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

const { width } = Dimensions.get("window");
const MODAL_COLUMN_WIDTH = (width - 60) / 2;

// ==========================================
// COMPONENT 1: PROFILE PREVIEW (Adaptive View)
// ==========================================
const ProfilePreview = ({
  form,
  setForm,
  isEditing,
  setGalleryVisible,
  pickImage,
  handleWhatsApp,
  handleCall,
  handleEmail,
}) => (
  <ScrollView
    showsVerticalScrollIndicator={false}
    contentContainerStyle={styles.scrollContent}
  >
    {/* Hero Section */}
    <View style={styles.heroContainer}>
      {form.experience_images?.length > 0 ? (
        <Image
          source={{ uri: form.experience_images[0] }}
          style={styles.heroImage}
        />
      ) : (
        <View style={styles.heroPlaceholder}>
          <Icons.Ionicons name="person-circle-outline" size={80} color="#e2e8f0" />
        </View>
      )}
    </View>

    {/* Portfolio Action Row */}
    <View style={styles.actionRow}>
      <TouchableOpacity
        style={styles.galleryTrigger}
        onPress={() => setGalleryVisible(true)}
      >
        <Icons.Ionicons name="images" size={20} color="#000" />
        <Text style={styles.galleryTriggerText}>
          Portfolio ({form.experience_images?.length || 0})
        </Text>
        <Icons.Ionicons name="chevron-forward" size={16} color="#94a3b8" />
      </TouchableOpacity>

      {/* Add Image Button (Visible only during Edit) */}
      {isEditing && (
        <TouchableOpacity style={styles.addMediaBtn} onPress={pickImage}>
          <Icons.Ionicons name="add-circle" size={32} color="#10b981" />
        </TouchableOpacity>
      )}
    </View>

    <View style={styles.mainContent}>
      {/* Identity & Availability */}
      <View style={styles.identityContainer}>
        <View style={styles.rowBetween}>
          <Text style={styles.nameLabelText}>
            {form.name || "Unnamed Professional"}
          </Text>
          <View style={[styles.availabilityBadge, { backgroundColor: form.is_available ? '#dcfce7' : '#fee2e2' }]}>
            <Text style={[styles.availabilityText, { color: form.is_available ? '#166534' : '#991b1b' }]}>
              {form.is_available ? "Available" : "Busy"}
            </Text>
          </View>
        </View>

        <View style={styles.locRow}>
          <Icons.Ionicons name="location" size={14} color="#10b981" />
          <Text style={styles.locationLabelText}>
            {form.location?.address || "Location not set"}
          </Text>
        </View>

        {/* Contact Modes (Dynamic JSONB handling) */}
        <View style={styles.contactIconRow}>
          {/* Primary Phone */}
          <TouchableOpacity
            style={[styles.miniSocialBtn, { backgroundColor: "#3b82f6" }]}
            onPress={handleCall}
          >
            <Icons.Ionicons name="call" size={18} color="#fff" />
          </TouchableOpacity>

          {/* WhatsApp from contact_options */}
          <TouchableOpacity
            style={[styles.miniSocialBtn, { backgroundColor: "#25D366" }]}
            onPress={handleWhatsApp}
          >
            <Icons.Ionicons name="logo-whatsapp" size={20} color="#fff" />
          </TouchableOpacity>

          {/* Email */}
          <TouchableOpacity
            style={[styles.miniSocialBtn, { backgroundColor: "#f43f5e" }]}
            onPress={handleEmail}
          >
            <Icons.Ionicons name="mail" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Edit Contact Options (Visible only when Editing) */}
        {isEditing && (
          <View style={styles.editContactBox}>
            <Text style={styles.sectionLabel}>Communication Options</Text>
            <View style={styles.contactInputRow}>
               <Icons.Ionicons name="logo-whatsapp" size={20} color="#25D366" />
               <TextInput 
                 style={styles.contactInput}
                 placeholder="WhatsApp Number"
                 value={form.contact_options?.whatsapp}
                 onChangeText={(val) => setForm({
                   ...form,
                   contact_options: { ...form.contact_options, whatsapp: val }
                 })}
               />
            </View>
            <View style={styles.contactInputRow}>
               <Icons.Ionicons name="globe-outline" size={20} color="#64748b" />
               <TextInput 
                 style={styles.contactInput}
                 placeholder="Website or Social Link"
                 value={form.contact_options?.website}
                 onChangeText={(val) => setForm({
                   ...form,
                   contact_options: { ...form.contact_options, website: val }
                 })}
               />
            </View>
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Icons.Ionicons name="thumbs-up" size={16} color="#10b981" />
            <Text style={styles.statCount}>{form.likes || 0}</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
          <View style={[styles.statBox, { borderLeftWidth: 1, borderColor: "#f1f5f9" }]}>
            <Icons.Ionicons name="thumbs-down" size={16} color="#ef4444" />
            <Text style={styles.statCount}>{form.dislikes || 0}</Text>
            <Text style={styles.statLabel}>Dislikes</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Qualifications Section */}
      {form.documents?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Qualifications & Documents</Text>
          {form.documents.map((doc, index) => (
            <TouchableOpacity
              key={index}
              style={styles.previewDocItem}
              onPress={() => Linking.openURL(doc.url || doc.uri)}
            >
              <Icons.Ionicons name="document-attach" size={20} color="#3b82f6" />
              <Text style={styles.previewDocText} numberOfLines={1}>
                {doc.name}
              </Text>
              <Icons.Ionicons name="eye-outline" size={18} color="#94a3b8" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Bio Section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Professional Bio</Text>
        {isEditing ? (
          <TextInput 
            multiline
            style={styles.bioInputEdit}
            value={form.bio}
            onChangeText={(t) => setForm({...form, bio: t})}
            placeholder="Tell clients about your work..."
          />
        ) : (
          <Text style={styles.bioPreviewText}>
            {form.bio || "No bio provided yet."}
          </Text>
        )}
      </View>

      {/* Skills Section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Services</Text>
        <View style={styles.skillsList}>
          {form.skills.map((skill, index) => (
            <View key={index} style={styles.skillItem}>
              <Icons.Ionicons name="checkmark-circle" size={18} color="#10b981" />
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  </ScrollView>
);

// ==========================================
// COMPONENT 2: PROFILE FORM (Editing Mode)
// ==========================================
// ==========================================
import React, { useState, useContext, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, 
  ScrollView, Image, Dimensions, Platform, StatusBar, ActivityIndicator, 
  SafeAreaView, Modal, FlatList, KeyboardAvoidingView, Linking 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Icons } from "../../constants/Icons";
import { registerAsWorker, updateWorkerProfile, getWorkerProfile } from '../../service/Supabase-Fuctions';
import { AuthContext } from '../../context/authProvider';

const { width } = Dimensions.get('window');
const MODAL_COLUMN_WIDTH = (width - 60) / 2;

// ==========================================
// COMPONENT 1: PROFILE PREVIEW (Read-Only)
// ==========================================
const ProfilePreview = ({ form, setGalleryVisible, handleWhatsApp, handleCall, handleEmail }) => (
  <ScrollView 
    showsVerticalScrollIndicator={false} 
    contentContainerStyle={styles.scrollContent}
  >
    <View style={styles.heroContainer}>
      {form.experience_images?.length > 0 ? (
        <Image source={{ uri: form.experience_images[0] }} style={styles.heroImage} />
      ) : (
        <View style={styles.heroPlaceholder}>
          <Icons.Ionicons name="person-circle-outline" size={80} color="#e2e8f0" />
        </View>
      )}
    </View>

    <TouchableOpacity style={styles.galleryTrigger} onPress={() => setGalleryVisible(true)}>
      <Icons.Ionicons name="images" size={20} color="#000" />
      <Text style={styles.galleryTriggerText}>View Portfolio ({form.experience_images?.length || 0})</Text>
      <Icons.Ionicons name="chevron-forward" size={16} color="#94a3b8" />
    </TouchableOpacity>

    <View style={styles.mainContent}>
      <View style={styles.identityContainer}>
        <Text style={styles.nameLabelText}>{form.name || "Unnamed Professional"}</Text>
        <View style={styles.locRow}>
          <Icons.Ionicons name="location" size={14} color="#10b981" />
          <Text style={styles.locationLabelText}>{form.location?.address || "Location not set"}</Text>
        </View>

        <View style={styles.contactIconRow}>
          {form.phone && (
            <TouchableOpacity style={[styles.miniSocialBtn, { backgroundColor: '#25D366' }]} onPress={handleWhatsApp}>
              <Icons.Ionicons name="logo-whatsapp" size={20} color="#fff" />
            </TouchableOpacity>
          )}
          {form.phone && (
            <TouchableOpacity style={[styles.miniSocialBtn, { backgroundColor: '#3b82f6' }]} onPress={handleCall}>
              <Icons.Ionicons name="call" size={18} color="#fff" />
            </TouchableOpacity>
          )}
          {form.email && (
            <TouchableOpacity style={[styles.miniSocialBtn, { backgroundColor: '#f43f5e' }]} onPress={handleEmail}>
              <Icons.Ionicons name="mail" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Icons.Ionicons name="thumbs-up" size={16} color="#10b981" />
            <Text style={styles.statCount}>{form.likes || 0}</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
          <View style={[styles.statBox, { borderLeftWidth: 1, borderColor: '#f1f5f9' }]}>
            <Icons.Ionicons name="thumbs-down" size={16} color="#ef4444" />
            <Text style={styles.statCount}>{form.dislikes || 0}</Text>
            <Text style={styles.statLabel}>Dislikes</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Professional Bio</Text>
        <Text style={styles.bioPreviewText}>{form.bio || "No bio provided yet."}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Services</Text>
        <View style={styles.skillsList}>
          {form.skills.map((skill, index) => (
            <View key={index} style={styles.skillItem}>
              <Icons.Ionicons name="checkmark-circle" size={18} color="#10b981" />
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  </ScrollView>
);

// ==========================================
// COMPONENT 2: PROFILE FORM (Design Match)
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
  setGalleryVisible
}) => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.heroPlaceholder}>
        <Icons.Ionicons name="images-outline" size={40} color="#cbd5e1" />
        <TouchableOpacity onPress={() => setGalleryVisible(true)}>
          <Text style={styles.galleryTriggerText}>Manage Portfolio ({form.experience_images?.length || 0})</Text>
        </TouchableOpacity>
      </View>

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
            <Icons.Ionicons name="call" size={20} color="#64748b" style={styles.inputIcon} />
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

        {/* 3. LOCATION */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Location</Text>
          <View style={styles.simpleInputWrapper}>
            <Icons.Ionicons name="location" size={20} color="#10b981" style={styles.inputIcon} />
            <TextInput
              style={styles.simpleTextInput}
              value={form.location?.address}
              placeholder="Primary Location (e.g. Mbabane)"
              placeholderTextColor="#94a3b8"
              onChangeText={(t) => setForm({ ...form, location: { address: t } })}
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* 4. DOCUMENT UPLOAD */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Qualifications & Clearances</Text>
          <Text style={styles.helperText}>Add certificates, licenses, or police clearance</Text>
          <TouchableOpacity style={styles.uploadDocBtn} onPress={pickDocument}>
            <Icons.Ionicons name="cloud-upload" size={20} color="#3b82f6" />
            <Text style={styles.uploadDocBtnText}>Upload Document</Text>
          </TouchableOpacity>

          <View style={styles.docList}>
            {form.documents?.map((doc, index) => (
              <View key={index} style={styles.docItem}>
                <Icons.Ionicons name="document-text" size={20} color="#64748b" />
                <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
                <TouchableOpacity onPress={() => removeDocument(index)}>
                  <Icons.Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* 5. BIO */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Professional Bio</Text>
          <TextInput 
            multiline 
            style={styles.bioInputEdit} 
            value={form.bio} 
            onChangeText={(t) => setForm({...form, bio: t})} 
            placeholder="What makes your service great?"
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* 6. SERVICES */}
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
                  <Icons.Ionicons name="close-circle" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
const WorkerRegistration = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [isWorker, setIsWorker] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [currentSkill, setCurrentSkill] = useState('');
  
  const [form, setForm] = useState({ 
    name: '', phone: '', email: '', skills: [], bio: '', experience_images: [], documents: [],
    likes: 0, dislikes: 0, location: { address: '' } 
  });
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => { checkStatus(); }, [user]);

  const checkStatus = async () => {
    if (!user?.uid) { setFetching(false); return; }
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
      setForm(originalData || { name: '', phone: '', email: '', skills: [], bio: '', experience_images: [], documents: [], likes: 0, dislikes: 0, location: { address: '' } });
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const addSkill = () => {
    if (currentSkill.trim() && !form.skills.includes(currentSkill.trim())) {
      setForm({ ...form, skills: [...form.skills, currentSkill.trim()] });
      setCurrentSkill('');
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
      setForm(prev => ({ ...prev, documents: [...(prev.documents || []), result.assets[0]] }));
    }
  };

  const removeDocument = (index) => {
    const updated = [...(form.documents || [])];
    updated.splice(index, 1);
    setForm({ ...form, documents: updated });
  };

  const handleSave = async () => {
    if (!form.name) { Alert.alert("Required", "Please enter business name."); return; }
    setLoading(true);
    const result = isWorker 
      ? await updateWorkerProfile(user.uid, form) 
      : await registerAsWorker({ ...form, user_id: user.uid });
    
    setLoading(false);
    if (result.success) {
      Alert.alert("Success", "Profile updated.");
      setOriginalData(form);
      setIsEditing(false);
      setIsWorker(true);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.7 });
    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setForm(prev => ({ ...prev, experience_images: [...(prev.experience_images || []), ...newImages] }));
    }
  };

  if (fetching) return <View style={styles.center}><ActivityIndicator color="#10b981" /></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.headerNav}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icons.Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? "EDIT PROFILE" : "PROFILE"}</Text>
          <View style={{ flexDirection: 'row', gap: 15 }}>
            {isWorker && (
              <TouchableOpacity onPress={toggleEdit}>
                <Text style={[styles.editBtnText, isEditing && { color: '#ef4444' }]}>{isEditing ? "CANCEL" : "EDIT"}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleSave} disabled={loading}>
              {loading ? <ActivityIndicator size="small" color="#10b981" /> : <Text style={styles.saveBtnText}>SYNC</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        {isEditing ? (
          <ProfileForm 
            form={form} setForm={setForm} 
            currentSkill={currentSkill} setCurrentSkill={setCurrentSkill}
            addSkill={addSkill} removeSkill={removeSkill}
            pickDocument={pickDocument} removeDocument={removeDocument}
            setGalleryVisible={setGalleryVisible}
          />
        ) : (
          <ProfilePreview 
            form={form} setGalleryVisible={setGalleryVisible}
            handleWhatsApp={() => Linking.openURL(`whatsapp://send?phone=${form.phone}`)}
            handleCall={() => Linking.openURL(`tel:${form.phone}`)}
            handleEmail={() => Linking.openURL(`mailto:${form.email}`)}
          />
        )}
      </KeyboardAvoidingView>

      <Modal visible={galleryVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
           <View style={styles.modalHeader}>
             <TouchableOpacity onPress={() => setGalleryVisible(false)}><Icons.Ionicons name="close" size={28} /></TouchableOpacity>
             <Text style={styles.modalTitle}>Portfolio</Text>
             {isEditing ? <TouchableOpacity onPress={pickImage}><Icons.Ionicons name="add-circle" size={28} color="#10b981" /></TouchableOpacity> : <View style={{width:28}}/>}
           </View>
           <FlatList 
              data={form.experience_images}
              numColumns={2}
              renderItem={({item, index}) => (
                <View style={styles.modalItem}>
                  <Image source={{ uri: item }} style={styles.modalImage} />
                  {index === 0 && <View style={styles.mainBadge}><Text style={styles.mainBadgeText}>MAIN</Text></View>}
                </View>
              )}
           />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerSafe: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60 },
  headerTitle: { fontSize: 11, fontWeight: '900', color: '#64748b' },
  editBtnText: { color: '#3b82f6', fontWeight: '900' },
  saveBtnText: { color: '#10b981', fontWeight: '900' },
  scrollContent: { paddingBottom: 100 },
  heroContainer: { height: 260, backgroundColor: '#f8fafc' },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: { height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  galleryTrigger: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 20, padding: 18, borderRadius: 15, elevation: 8, shadowOpacity: 0.1, marginTop: -30, gap: 12 },
  galleryTriggerText: { flex: 1, fontWeight: '800' },
  mainContent: { padding: 25 },
  nameLabelText: { fontSize: 26, fontWeight: '900' },
  nameInput: { fontSize: 20, fontWeight: '900', backgroundColor: '#f8fafc', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  locationLabelText: { fontSize: 16, color: '#64748b', fontWeight: '600' },
  simpleInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 15 },
  simpleTextInput: { flex: 1, fontSize: 16, fontWeight: '600', color: '#000' },
  inputIcon: { marginRight: 10 },
  contactIconRow: { flexDirection: 'row', gap: 12, marginTop: 15 },
  miniSocialBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', backgroundColor: '#f8fafc', borderRadius: 12, paddingVertical: 12, marginTop: 20 },
  statBox: { flex: 1, alignItems: 'center' },
  statCount: { fontWeight: '900' },
  statLabel: { fontSize: 10, color: '#94a3b8' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 25 },
  section: { marginBottom: 25 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8', marginBottom: 10 },
  bioPreviewText: { fontSize: 15, lineHeight: 22, color: '#475569' },
  bioInputEdit: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 12, minHeight: 120, textAlignVertical: 'top', borderWidth: 1, borderColor: '#e2e8f0' },
  helperText: { fontSize: 12, color: '#94a3b8', marginBottom: 10, marginTop: -5 },
  uploadDocBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff', padding: 15, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#3b82f6', gap: 10 },
  uploadDocBtnText: { color: '#3b82f6', fontWeight: '800' },
  docList: { marginTop: 15, gap: 10 },
  docItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 10, gap: 10 },
  docName: { flex: 1, fontSize: 14, fontWeight: '600' },
  skillInputWrapper: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  growingSkillInput: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  addSkillFab: { backgroundColor: '#10b981', width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  skillsList: { gap: 12 },
  skillItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  skillItemEdit: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f1f5f9', padding: 12, borderRadius: 10 },
  skillText: { fontWeight: '600', color: '#334155' },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  modalTitle: { fontWeight: '800', fontSize: 18 },
  modalItem: { width: MODAL_COLUMN_WIDTH, margin: 10, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f1f5f9' },
  modalImage: { width: '100%', height: 150 },
  mainBadge: { position: 'absolute', top: 5, left: 5, backgroundColor: '#10b981', padding: 4, borderRadius: 4 },
  mainBadgeText: { color: '#fff', fontSize: 8, fontWeight: '900' }
});

export default WorkerRegistration;

const WorkerRegistration = ({ navigation }) => {
  const { user, isWorker, setIsWorker } = useContext(AuthContext);
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
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
    setFetching(false);
  };

  const toggleEdit = () => {
    if (isEditing) {
      setForm(originalData);
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
    const updatedSkills = [...form.skills];
    updatedSkills.splice(index, 1);
    setForm({ ...form, skills: updatedSkills });
  };

  const handleSave = async () => {
    if (!form.name) {
      Alert.alert("Required", "Please enter your business name.");
      return;
    }
    setLoading(true);
    const result = isWorker
      ? await updateWorkerProfile(user.uid, form)
      : await registerAsWorker({ ...form, user_id: user.uid });

    setLoading(false);
    if (result.success) {
      Alert.alert("Success", "Profile updated.");
      setOriginalData(form);
      setIsEditing(false);
      setIsWorker(true);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      setForm((prev) => ({
        ...prev,
        experience_images: [...(prev.experience_images || []), ...newImages],
      }));
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const doc = result.assets[0];
        setForm((prev) => ({
          ...prev,
          documents: [
            ...(prev.documents || []),
            {
              name: doc.name,
              uri: doc.uri,
              mimeType: doc.mimeType,
              size: doc.size,
            },
          ],
        }));
      }
    } catch (err) {
      Alert.alert("Error", "Could not access documents.");
    }
  };

  const removeDocument = (index) => {
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  if (fetching)
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#10b981" />
      </View>
    );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      {/* SAFE AREA HEADER */}
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.headerNav}>
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
                  style={[
                    styles.editBtnText,
                    isEditing && { color: "#ef4444" },
                  ]}
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
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
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
            setGalleryVisible={setGalleryVisible}
            pickDocument={pickDocument}
            removeDocument={removeDocument}
          />
        ) : (
          <ProfilePreview
            form={form}
            setGalleryVisible={setGalleryVisible}
            handleWhatsApp={() =>
              Linking.openURL(`whatsapp://send?phone=${form.phone}`)
            }
            handleCall={() => Linking.openURL(`tel:${form.phone}`)}
            handleEmail={() => Linking.openURL(`mailto:${form.email}`)}
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
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item, index }) => (
              <View style={styles.modalItem}>
                <Image source={{ uri: item }} style={styles.modalImage} />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerSafe: {
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
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
  headerTitle: { fontSize: 11, fontWeight: "900", color: "#64748b" },
  editBtnText: { color: "#3b82f6", fontWeight: "900" },
  saveBtnText: { color: "#10b981", fontWeight: "900" },
  scrollContent: { paddingBottom: 100 }, // Extra padding so nothing gets hidden behind keyboard or home indicator
  heroContainer: { height: 260, backgroundColor: "#f8fafc" },
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
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginTop: -30,
    gap: 12,
  },
  galleryTriggerText: { flex: 1, fontWeight: "800" },
  mainContent: { padding: 25 },
  nameLabelText: { fontSize: 26, fontWeight: "900", color: "#000" },
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
  locationInput: { flex: 1, fontSize: 16, color: "#10b981", fontWeight: "600" },
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
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 25 },
  section: { marginBottom: 25 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94a3b8",
    marginBottom: 10,
  },
  bioPreviewText: { fontSize: 15, lineHeight: 22, color: "#475569" },
  bioInputEdit: {
    backgroundColor: "#f8fafc",
    padding: 15,
    borderRadius: 12,
    minHeight: 120,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  pickerWrapper: {
    flexDirection: "row",
    height: 55,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  pickerLeft: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
    gap: 6,
  },
  pickerLabel: { fontSize: 14, fontWeight: "700", color: "#475569" },
  pickerInput: {
    flex: 1,
    paddingHorizontal: 15,
    fontWeight: "600",
    color: "#000",
  },
  helperText: { fontSize: 12, color: "#94a3b8", marginTop: 8 },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#eff6ff",
    padding: 15,
    borderRadius: 12,
  },
  infoBoxText: { flex: 1, fontSize: 13, color: "#1e40af", fontWeight: "500" },
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
  simpleInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
  },
  simpleTextInput: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "600",
  },
  skillItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  // NEW DOCUMENT STYLES
  helperText: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 10,
    marginTop: -5,
  },
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
  uploadDocBtnText: { color: "#3b82f6", fontWeight: "800", fontSize: 14 },
  docList: { marginTop: 15, gap: 10 },
  docItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  docName: { flex: 1, fontSize: 14, color: "#1e293b", fontWeight: "600" },
  previewDocItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    marginBottom: 8,
    gap: 10,
  },
  previewDocText: {
    flex: 1,
    fontSize: 14,
    color: "#334155",
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: -30,
    gap: 10,
  },
  addMediaBtn: {
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availabilityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  editContactBox: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  contactInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 8,
    height: 40,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  contactInput: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
  },
  bioInputEdit: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
});
export default WorkerRegistration;
