import React, { useState, useContext, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, 
  ScrollView, Image, Dimensions, Platform, StatusBar, ActivityIndicator, 
  SafeAreaView, Modal, FlatList, KeyboardAvoidingView, Linking 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
// COMPONENT 2: PROFILE FORM (Editing Mode)
// ==========================================
const ProfileForm = ({ form, setForm, currentSkill, setCurrentSkill, addSkill, removeSkill, setGalleryVisible, isWorker }) => {
  const [activePlatform, setActivePlatform] = useState('phone');

  const getPlatformInfo = () => {
    if (activePlatform === 'phone') return { icon: 'call', label: '+268', color: '#64748b' };
    if (activePlatform === 'whatsapp') return { icon: 'logo-whatsapp', label: 'WA', color: '#25D366' };
    return { icon: 'mail', label: 'Mail', color: '#f43f5e' };
  };

  const showPlatformPicker = () => {
    Alert.alert("Contact Method", "Choose which detail to update:", [
      { text: "Phone (+268)", onPress: () => setActivePlatform('phone') },
      { text: "WhatsApp", onPress: () => setActivePlatform('whatsapp') },
      { text: "Email", onPress: () => setActivePlatform('email') },
      { text: "Cancel", style: "cancel" }
    ]);
  };

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
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Business Identity</Text>
          <TextInput 
            style={styles.nameInput} 
            value={form.name} 
            placeholder="Your Business Name"
            onChangeText={(t) => setForm({...form, name: t})} 
          />
          <View style={styles.locRow}>
            <Icons.Ionicons name="location" size={16} color="#10b981" />
            <TextInput 
              style={styles.locationInput} 
              value={form.location?.address} 
              placeholder="Primary Location (e.g. Mbabane)"
              onChangeText={(t) => setForm({...form, location: {address: t}})} 
            />
          </View>
        </View>

        {isWorker ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Contact Channels</Text>
            <View style={styles.pickerWrapper}>
              <TouchableOpacity style={styles.pickerLeft} onPress={showPlatformPicker}>
                <Icons.Ionicons name={getPlatformInfo().icon} size={18} color={getPlatformInfo().color} />
                <Text style={styles.pickerLabel}>{getPlatformInfo().label}</Text>
                <Icons.Ionicons name="chevron-down" size={12} color="#94a3b8" />
              </TouchableOpacity>
              <TextInput 
                style={styles.pickerInput}
                value={activePlatform === 'email' ? form.email : form.phone}
                placeholder={activePlatform === 'email' ? "email@provider.com" : "7600 0000"}
                keyboardType={activePlatform === 'email' ? "email-address" : "phone-pad"}
                onChangeText={(t) => {
                  if(activePlatform === 'email') setForm({...form, email: t});
                  else setForm({...form, phone: t});
                }}
              />
            </View>
            <Text style={styles.helperText}>Clients will see these icons on your profile.</Text>
          </View>
        ) : (
          <View style={styles.infoBox}>
            <Icons.Ionicons name="information-circle" size={20} color="#3b82f6" />
            <Text style={styles.infoBoxText}>You can add Phone, WhatsApp, and Email details after your first sync.</Text>
          </View>
        )}

        <View style={styles.divider} />
        
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Professional Bio</Text>
          <TextInput 
            multiline 
            style={styles.bioInputEdit} 
            value={form.bio} 
            onChangeText={(t) => setForm({...form, bio: t})} 
            placeholder="What makes your service great?"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Services Provided</Text>
          <View style={styles.skillInputWrapper}>
            <TextInput 
              style={styles.growingSkillInput}
              placeholder="Add service..."
              value={currentSkill}
              onChangeText={setCurrentSkill}
            />
            <TouchableOpacity onPress={addSkill} style={styles.addSkillFab}>
              <Icons.Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.skillsList}>
            {form.skills.map((skill, index) => (
              <View key={index} style={styles.skillItem}>
                <TouchableOpacity onPress={() => removeSkill(index)}>
                  <Icons.Ionicons name="remove-circle" size={22} color="#ef4444" />
                </TouchableOpacity>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const WorkerRegistration = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [isWorker, setIsWorker] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [currentSkill, setCurrentSkill] = useState('');
  const [form, setForm] = useState({ 
    name: '', phone: '', email: '', skills: [], bio: '', experience_images: [],
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
      setForm(originalData);
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
    const updatedSkills = [...form.skills];
    updatedSkills.splice(index, 1);
    setForm({ ...form, skills: updatedSkills });
  };

  const handleSave = async () => {
    if (!form.name) { Alert.alert("Required", "Please enter your business name."); return; }
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
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      {/* SAFE AREA HEADER */}
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

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {isEditing ? (
          <ProfileForm 
            form={form} setForm={setForm} isWorker={isWorker}
            currentSkill={currentSkill} setCurrentSkill={setCurrentSkill}
            addSkill={addSkill} removeSkill={removeSkill} setGalleryVisible={setGalleryVisible}
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
              contentContainerStyle={{ paddingBottom: 40 }}
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
  headerSafe: { 
    backgroundColor: '#fff', 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    borderBottomWidth: 1, 
    borderBottomColor: '#f1f5f9' 
  },
  headerNav: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    height: 60 
  },
  headerTitle: { fontSize: 11, fontWeight: '900', color: '#64748b' },
  editBtnText: { color: '#3b82f6', fontWeight: '900' },
  saveBtnText: { color: '#10b981', fontWeight: '900' },
  scrollContent: { paddingBottom: 100 }, // Extra padding so nothing gets hidden behind keyboard or home indicator
  heroContainer: { height: 260, backgroundColor: '#f8fafc' },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: { height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  galleryTrigger: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    marginHorizontal: 20, 
    padding: 18, 
    borderRadius: 15, 
    elevation: 8, 
    shadowColor: '#000',
    shadowOpacity: 0.1, 
    shadowRadius: 10,
    marginTop: -30,
    gap: 12 
  },
  galleryTriggerText: { flex: 1, fontWeight: '800' },
  mainContent: { padding: 25 },
  nameLabelText: { fontSize: 26, fontWeight: '900', color: '#000' },
  nameInput: { fontSize: 20, fontWeight: '900', backgroundColor: '#f8fafc', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  locationLabelText: { fontSize: 16, color: '#64748b', fontWeight: '600' },
  locationInput: { flex: 1, fontSize: 16, color: '#10b981', fontWeight: '600' },
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
  pickerWrapper: { flexDirection: 'row', height: 55, backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
  pickerLeft: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: 12, borderRightWidth: 1, borderRightColor: '#e2e8f0', gap: 6 },
  pickerLabel: { fontSize: 14, fontWeight: '700', color: '#475569' },
  pickerInput: { flex: 1, paddingHorizontal: 15, fontWeight: '600', color: '#000' },
  helperText: { fontSize: 12, color: '#94a3b8', marginTop: 8 },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#eff6ff', padding: 15, borderRadius: 12 },
  infoBoxText: { flex: 1, fontSize: 13, color: '#1e40af', fontWeight: '500' },
  skillInputWrapper: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  growingSkillInput: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  addSkillFab: { backgroundColor: '#10b981', width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  skillsList: { gap: 12 },
  skillItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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