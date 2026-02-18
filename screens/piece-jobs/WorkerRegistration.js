import React, { useState, useContext, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, 
  ScrollView, Image, Dimensions, Platform, StatusBar, ActivityIndicator, 
  SafeAreaView, Modal, FlatList, KeyboardAvoidingView 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Icons } from "../../constants/Icons";
import { registerAsWorker, updateWorkerProfile, getWorkerProfile } from '../../service/Supabase-Fuctions';
import { AuthContext } from '../../context/authProvider';

const { width, height } = Dimensions.get('window');
const MODAL_COLUMN_WIDTH = (width - 60) / 2; 

const WorkerRegistration = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  
  const [isWorker, setIsWorker] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [currentSkill, setCurrentSkill] = useState('');
  
  const [form, setForm] = useState({ 
    name: '', phone: '', skills: [], bio: '', experience_images: [],
    likes: 0, dislikes: 0, location: { address: '' } 
  });
  
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    checkStatus();
  }, [user]);

  const checkStatus = async () => {
    if (!user?.uid) { setFetching(false); return; }
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

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setForm(prev => ({ ...prev, experience_images: [...(prev.experience_images || []), ...newImages] }));
    }
  };

  const setAsThumbnail = (index) => {
    const updatedImages = [...form.experience_images];
    const selected = updatedImages.splice(index, 1)[0];
    updatedImages.unshift(selected);
    setForm({ ...form, experience_images: updatedImages });
  };

  const deleteImage = (index) => {
    Alert.alert("Delete", "Remove this image?", [
      { text: "Cancel" },
      { text: "Delete", style: 'destructive', onPress: () => {
          const updated = [...form.experience_images];
          updated.splice(index, 1);
          setForm({...form, experience_images: updated});
      }}
    ]);
  };

  const handleSave = async () => {
    if (!form.name) { Alert.alert("Required", "Please enter your name."); return; }
    setLoading(true);
    const result = isWorker 
      ? await updateWorkerProfile(user.uid, form) 
      : await registerAsWorker({ ...form, user_id: user.uid });
    
    setLoading(false);
    if (result.success) {
      Alert.alert("Saved", "Profile information updated.");
      setOriginalData(form);
      setIsEditing(false);
      setIsWorker(true);
    }
  };

  if (fetching) return <View style={styles.center}><ActivityIndicator color="#10b981" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* HEADER */}
      <View style={styles.headerNav}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconHitSlop}>
          <Icons.Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{isWorker ? "PROFESSIONAL PROFILE" : "WORKER SETUP"}</Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
            {isWorker && (
                <TouchableOpacity onPress={toggleEdit}>
                    <Text style={[styles.editBtnText, isEditing && { color: '#ef4444' }]}>
                        {isEditing ? "CANCEL" : "EDIT"}
                    </Text>
                </TouchableOpacity>
            )}
            
            {(isEditing || !isWorker) && (
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    {loading ? <ActivityIndicator size="small" color="#10b981" /> : <Text style={styles.saveBtnText}>SYNC</Text>}
                </TouchableOpacity>
            )}
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HERO SECTION */}
          <View style={styles.heroContainer}>
            {form.experience_images?.length > 0 ? (
              <Image source={{ uri: form.experience_images[0] }} style={styles.heroImage} />
            ) : (
              <View style={styles.heroPlaceholder}>
                <Icons.Ionicons name="person-circle-outline" size={80} color="#e2e8f0" />
              </View>
            )}
            {!isEditing && isWorker && <View style={styles.readOnlyOverlay} />}
          </View>

          {/* PORTFOLIO TRIGGER */}
          <TouchableOpacity 
              style={[styles.galleryTrigger, !isEditing && { marginTop: -30 }]} 
              onPress={() => setGalleryVisible(true)}
          >
            <Icons.Ionicons name="images" size={20} color="#000" />
            <Text style={styles.galleryTriggerText}>
              {isEditing ? "Manage Portfolio" : "View Portfolio"} ({form.experience_images?.length || 0})
            </Text>
            <Icons.Ionicons name="chevron-forward" size={16} color="#94a3b8" />
          </TouchableOpacity>

          <View style={styles.mainContent}>
            
            {/* IDENTITY & STATS */}
            <View style={styles.identityContainer}>
              <View style={styles.identityRow}>
                <TextInput 
                  editable={isEditing}
                  style={[styles.nameInput, !isEditing && styles.disabledText]} 
                  value={form.name} 
                  placeholder="Your Business Name"
                  onChangeText={(t) => setForm({...form, name: t})} 
                />
                <View style={styles.locRow}>
                    <Icons.Ionicons name="location" size={14} color="#10b981" />
                    <TextInput 
                    editable={isEditing}
                    style={[styles.locationInput, !isEditing && styles.disabledText]}
                    value={form.location?.address}
                    placeholder="Service Area"
                    placeholderTextColor="#10b981"
                    onChangeText={(t) => setForm({...form, location: {address: t}})}
                    />
                </View>
              </View>

              {/* NEW STATS ROW */}
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

            {/* BIO SECTION */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Professional Bio</Text>
                {isEditing && <Icons.Ionicons name="pencil" size={14} color="#10b981" />}
              </View>
              <TextInput 
                editable={isEditing}
                multiline 
                style={[styles.bioInput, !isEditing && styles.disabledBio]} 
                value={form.bio} 
                onChangeText={(t) => setForm({...form, bio: t})} 
                placeholder="Describe your expertise..."
              />
            </View>

            {/* SKILLS SECTION */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Skills & Specialties</Text>
              
              {isEditing && (
                  <View style={styles.skillInputWrapper}>
                    <TextInput 
                        style={styles.growingSkillInput}
                        placeholder="Type a skill (e.g. House Painting)..."
                        value={currentSkill}
                        onChangeText={setCurrentSkill}
                        multiline={true} // GROWING INPUT LIKE CHAT
                        blurOnSubmit={true}
                    />
                    <TouchableOpacity onPress={addSkill} style={styles.addSkillFab}>
                        <Icons.Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
              )}

              <View style={styles.skillsList}>
                {form.skills.map((skill, index) => (
                  <View key={index} style={styles.skillItem}>
                    <Icons.Ionicons name="checkmark-circle" size={20} color={isEditing ? "#10b981" : "#cbd5e1"} />
                    <Text style={[styles.skillText, !isEditing && styles.disabledText]}>{skill}</Text>
                    {isEditing && (
                      <TouchableOpacity onPress={() => removeSkill(index)} style={styles.removeSkillBtn}>
                          <Icons.Ionicons name="trash-outline" size={18} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* PORTFOLIO MODAL */}
      <Modal visible={galleryVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setGalleryVisible(false)} style={styles.iconHitSlop}>
              <Icons.Ionicons name="close" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{isEditing ? "Edit Portfolio" : "Portfolio"}</Text>
            {isEditing ? (
                <TouchableOpacity onPress={pickImage} style={styles.iconHitSlop}>
                    <Icons.Ionicons name="add-circle" size={28} color="#10b981" />
                </TouchableOpacity>
            ) : <View style={{ width: 28 }} />}
          </View>

          <FlatList 
            data={form.experience_images}
            numColumns={2}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.modalList}
            renderItem={({ item, index }) => (
              <View style={styles.modalItem}>
                <Image source={{ uri: item }} style={styles.modalImage} />
                {isEditing && (
                    <View style={styles.modalActions}>
                        <TouchableOpacity onPress={() => setAsThumbnail(index)} style={styles.iconHitSlop}>
                            <Icons.Ionicons name="star" size={20} color={index === 0 ? "#10b981" : "#cbd5e1"} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteImage(index)} style={styles.iconHitSlop}>
                            <Icons.Ionicons name="trash" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                )}
                {index === 0 && <View style={styles.mainBadge}><Text style={styles.mainBadgeText}>MAIN</Text></View>}
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
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, height: 60, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
    backgroundColor: '#fff'
  },
  headerTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 0.5, color: '#64748b' },
  editBtnText: { color: '#3b82f6', fontWeight: '900', fontSize: 13 },
  saveBtnText: { color: '#10b981', fontWeight: '900', fontSize: 13 },
  iconHitSlop: { padding: 5 },

  scrollContent: { paddingBottom: 100 },

  heroContainer: { height: 260, width: '100%', backgroundColor: '#f8fafc' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  readOnlyOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.05)' },
  
  galleryTrigger: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#fff', marginHorizontal: 20, 
    padding: 18, borderRadius: 15, elevation: 8, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10,
    gap: 12, borderWidth: 1, borderColor: '#f1f5f9'
  },
  galleryTriggerText: { flex: 1, fontSize: 15, fontWeight: '800', color: '#1e293b' },

  mainContent: { padding: 25 },
  identityContainer: { gap: 20 },
  nameInput: { fontSize: 28, fontWeight: '900', color: '#000', padding: 0, marginBottom: 5 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  locationInput: { fontSize: 16, color: '#10b981', fontWeight: '700', padding: 0 },
  disabledText: { color: '#64748b' },
  
  // STATS STYLES
  statsRow: { 
    flexDirection: 'row', 
    backgroundColor: '#f8fafc', 
    borderRadius: 12, 
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  statBox: { flex: 1, alignItems: 'center', gap: 2 },
  statCount: { fontSize: 18, fontWeight: '900', color: '#1e293b' },
  statLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' },

  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 25 },
  
  section: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5 },
  bioInput: { fontSize: 16, color: '#334155', lineHeight: 24, textAlignVertical: 'top', minHeight: 60 },
  disabledBio: { color: '#94a3b8' },

  // GROWING SKILL INPUT (CHAT STYLE)
  skillInputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', // Aligns button to bottom of growing text
    gap: 10, 
    backgroundColor: '#f8fafc', 
    padding: 10, 
    borderRadius: 15, 
    borderWidth: 1, 
    borderColor: '#e2e8f0',
    marginBottom: 20
  },
  growingSkillInput: { 
    flex: 1, 
    fontSize: 16, 
    color: '#000', 
    maxHeight: 120, // Prevents it from getting TOO big
    paddingTop: 5,
    paddingBottom: 5
  },
  addSkillFab: { 
    backgroundColor: '#10b981', 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },

  skillsList: { gap: 15 },
  skillItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  skillText: { flex: 1, fontSize: 16, color: '#1e293b', fontWeight: '600' },

  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalTitle: { fontSize: 16, fontWeight: '800' },
  modalList: { padding: 10, paddingBottom: 50 },
  modalItem: { width: MODAL_COLUMN_WIDTH, margin: 10, borderRadius: 15, overflow: 'hidden', backgroundColor: '#f8fafc' },
  modalImage: { width: '100%', height: 180 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-around', padding: 12, backgroundColor: '#fff' },
  mainBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: '#10b981', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
  mainBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900' }
});

export default WorkerRegistration;