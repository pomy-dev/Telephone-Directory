"use client";

import React, { useState, useContext, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Icons } from "../../constants/Icons";
import { 
  registerAsWorker, 
  updateWorkerProfile, 
  getWorkerProfile 
} from '../../service/Supabase-Fuctions';
import { AuthContext } from '../../context/authProvider';

const WorkerRegistration = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [locating, setLocating] = useState(false);
  const [currentSkill, setCurrentSkill] = useState(''); 

  const [form, setForm] = useState({ 
    name: '', 
    phone: '', 
    skills: [], 
    bio: '',
    location: { address: '', lat: null, lng: null } 
  });

  const placeholderColor = "#777"; // High visibility placeholder

  useEffect(() => {
    const checkStatus = async () => {
      if (!user?.uid) {
        setFetching(false);
        return;
      }
      const result = await getWorkerProfile(user.uid);
      if (result.success && result.data) {
        const p = result.data;
        setForm({
          name: p.name || '',
          phone: p.phone || '',
          skills: p.skills || [],
          bio: p.bio || '',
          location: p.location || { address: '', lat: null, lng: null }
        });
        setIsEditMode(true);
      }
      setFetching(false);
    };
    checkStatus();
  }, [user]);

  const addSkill = () => {
    const trimmed = currentSkill.trim();
    if (trimmed.length === 0) return;
    if (form.skills.includes(trimmed)) {
      Alert.alert("Duplicate", "Skill already added.");
      return;
    }
    setForm(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
    setCurrentSkill('');
  };

  const removeSkill = (index) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleGetLocation = async () => {
    setLocating(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location access is required.');
      setLocating(false);
      return;
    }
    let loc = await Location.getCurrentPositionAsync({});
    setForm(prev => ({
      ...prev,
      location: { ...prev.location, lat: loc.coords.latitude, lng: loc.coords.longitude }
    }));
    setLocating(false);
    Alert.alert("GPS Secured", "Your location has been updated.");
  };

  const handleRegister = async () => {
    if (!form.name || !form.phone || form.skills.length === 0 || !form.location.address) {
      Alert.alert("Missing Details", "Please fill in all required sections.");
      return;
    }
    setLoading(true);
    let result = isEditMode 
      ? await updateWorkerProfile(user.uid, form) 
      : await registerAsWorker({ ...form, user_id: user.uid });
    
    setLoading(false);
    if (result.success) {
      Alert.alert("Success", isEditMode ? "Profile updated!" : "Profile is now live!");
    } else {
      Alert.alert("Error", result.error);
    }
  };

  if (fetching) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header matching other screens */}

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerBtn} 
          onPress={() => navigation.goBack()} // Changed to goBack
        >
          <Icons.Ionicons name="chevron-back" size={28} color="#000" /> 
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {isEditMode ? "Edit Profile" : "Become a Worker"}
        </Text>

        <TouchableOpacity onPress={handleRegister} disabled={loading} style={styles.headerBtn}>
            {loading ? (
              <ActivityIndicator size="small" color="#10b981" />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.mainScroll}>
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>ACCOUNT DETAILS</Text>
          </View>

          <View style={styles.settingsGroup}>
            {/* Full Name */}
            <View style={styles.settingItem}>
               <View style={styles.iconBox}>
                  <Icons.Ionicons name="person" size={20} color="#10b981" />
               </View>
               <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Full Name</Text>
                  <TextInput 
                    style={styles.settingInput} 
                    value={form.name} 
                    onChangeText={(t) => setForm(prev => ({...prev, name: t}))} 
                    placeholder="Enter full name"
                    placeholderTextColor={placeholderColor}
                  />
               </View>
            </View>

            {/* Phone */}
            <View style={styles.settingItem}>
               <View style={styles.iconBox}>
                  <Icons.Ionicons name="call" size={20} color="#10b981" />
               </View>
               <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Phone Number</Text>
                  <TextInput 
                    style={styles.settingInput} 
                    keyboardType="phone-pad"
                    value={form.phone} 
                    onChangeText={(t) => setForm(prev => ({...prev, phone: t}))} 
                    placeholder="7600 0000"
                    placeholderTextColor={placeholderColor}
                  />
               </View>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>PROFESSIONAL INFO</Text>
          </View>

          <View style={styles.settingsGroup}>
             {/* Skills */}
             <View style={[styles.settingItem, { borderBottomWidth: form.skills.length > 0 ? 0 : 1 }]}>
               <View style={styles.iconBox}>
                  <Icons.Ionicons name="flash" size={20} color="#10b981" />
               </View>
               <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Skills (Press 'Add')</Text>
                  <View style={styles.skillInputRow}>
                    <TextInput 
                        style={[styles.settingInput, { flex: 1 }]} 
                        placeholder="e.g. Plumber, IT"
                        placeholderTextColor={placeholderColor}
                        value={currentSkill}
                        onChangeText={setCurrentSkill}
                        onSubmitEditing={addSkill}
                    />
                    <TouchableOpacity onPress={addSkill} style={styles.addInlineBtn}>
                        <Text style={styles.addInlineText}>ADD</Text>
                    </TouchableOpacity>
                  </View>
               </View>
            </View>

            {form.skills.length > 0 && (
                <View style={styles.tagWrapper}>
                    {form.skills.map((skill, index) => (
                    <TouchableOpacity key={index} style={styles.skillTag} onPress={() => removeSkill(index)}>
                        <Text style={styles.skillTagText}>{skill}</Text>
                        <Icons.Ionicons name="close-circle" size={16} color="#10b981" style={{marginLeft: 6}} />
                    </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Work Area */}
            <View style={styles.settingItem}>
               <View style={styles.iconBox}>
                  <Icons.Ionicons name="location" size={20} color="#10b981" />
               </View>
               <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Work Area / Location</Text>
                  <View style={styles.skillInputRow}>
                    <TextInput 
                        style={[styles.settingInput, { flex: 1 }]} 
                        value={form.location.address}
                        onChangeText={(t) => setForm(prev => ({...prev, location: {...prev.location, address: t}}))}
                        placeholder="Area Name (e.g. Manzini)"
                        placeholderTextColor={placeholderColor}
                    />
                    <TouchableOpacity onPress={handleGetLocation} style={styles.locateBtn}>
                        {locating ? <ActivityIndicator size="small" color="#10b981" /> : <Icons.Ionicons name="navigate-circle" size={24} color="#10b981" />}
                    </TouchableOpacity>
                  </View>
               </View>
            </View>

            {/* Bio */}
            <View style={[styles.settingItem, { height: 'auto', borderBottomWidth: 0 }]}>
               <View style={[styles.iconBox, { alignSelf: 'flex-start', marginTop: 15 }]}>
                  <Icons.Ionicons name="document-text" size={20} color="#10b981" />
               </View>
               <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Work Experience / Bio</Text>
                  <TextInput 
                    multiline 
                    style={[styles.settingInput, { minHeight: 100, textAlignVertical: 'top', marginTop: 8 }]} 
                    value={form.bio} 
                    onChangeText={(t) => setForm(prev => ({...prev, bio: t}))} 
                    placeholder="Describe your services and why clients should hire you..."
                    placeholderTextColor={placeholderColor}
                  />
               </View>
            </View>
          </View>

          <TouchableOpacity style={styles.fullSubmitBtn} onPress={handleRegister} disabled={loading}>
             {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.fullSubmitText}>{isEditMode ? "SAVE ALL CHANGES" : "PUBLISH PROFILE"}</Text>}
          </TouchableOpacity>
          <View style={{height: 60}} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f6' },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: 'space-between',
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    backgroundColor: "#fff", 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee' 
  },
  headerBtn: { width: 40, height: 35, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#000" },
  saveText: { color: '#10b981', fontWeight: '800', fontSize: 16 },

  mainScroll: { flex: 1 },
  sectionHeader: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 12 },
  sectionHeaderText: { fontSize: 13, fontWeight: '800', color: '#1a1a1a', letterSpacing: 0.5 },

  settingsGroup: { backgroundColor: '#fff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#eee' },
  settingItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingLeft: 20, 
    minHeight: 85,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5'
  },
  iconBox: { 
    width: 40, 
    height: 40, 
    borderRadius: 10, 
    backgroundColor: '#f0fdf4', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 15
  },
  settingContent: { flex: 1, paddingRight: 20, paddingVertical: 12 },
  settingLabel: { fontSize: 12, fontWeight: '700', color: '#888', textTransform: 'uppercase', marginBottom: 4 },
  settingInput: { fontSize: 16, color: '#000', fontWeight: '600', padding: 0 },
  
  skillInputRow: { flexDirection: 'row', alignItems: 'center' },
  addInlineBtn: { backgroundColor: '#10b981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  addInlineText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  locateBtn: { paddingLeft: 10 },

  tagWrapper: { flexDirection: 'row', flexWrap: 'wrap', paddingLeft: 75, paddingRight: 20, paddingBottom: 20, backgroundColor: '#fff', gap: 8, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  skillTag: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f0fdf4', 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#dcfce7' 
  },
  skillTagText: { color: '#10b981', fontSize: 13, fontWeight: '700' },

  fullSubmitBtn: { 
    margin: 20, 
    backgroundColor: '#000', 
    paddingVertical: 20, 
    borderRadius: 15, 
    alignItems: 'center', 
  },
  fullSubmitText: { color: '#fff', fontWeight: '900', fontSize: 15, letterSpacing: 1 }
});

export default WorkerRegistration;