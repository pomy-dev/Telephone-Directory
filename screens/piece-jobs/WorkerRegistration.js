"use client";

import React, { useState , useContext} from 'react';
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
import { registerAsWorker } from '../../service/Supabase-Fuctions';
import { AuthContext } from '../../context/authProvider';

const WorkerRegistration = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [currentSkill, setCurrentSkill] = useState(''); 

  
  const [form, setForm] = useState({ 
    name: '', 
    phone: '', 
    skills: [], // Updated to array
    bio: '',
    location: { address: '', lat: null, lng: null } 
  });

  // Logic to add skill to the array
  const addSkill = () => {
    const trimmed = currentSkill.trim();
    if (trimmed.length === 0) return;
    if (form.skills.includes(trimmed)) {
      Alert.alert("Duplicate", "You have already added this skill.");
      return;
    }
    setForm(prev => ({
      ...prev,
      skills: [...prev.skills, trimmed]
    }));
    setCurrentSkill('');
  };

  // Logic to remove skill from array
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
      Alert.alert('Permission Denied', 'Allow location access to help clients find you.');
      setLocating(false);
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    setForm(prev => ({
      ...prev,
      location: { ...prev.location, lat: loc.coords.latitude, lng: loc.coords.longitude }
    }));
    setLocating(false);
    Alert.alert("GPS Secured", "Your coordinates have been attached.");
  };

  const handleRegister = async () => {
    if (!form.name || !form.phone || form.skills.length === 0 || !form.location.address) {
      Alert.alert("Missing Details", "Please provide your name, phone, at least one skill, and address.");
      return;
    }

    setLoading(true);
    const result = await registerAsWorker({
      ...form,
      user_id: user.uid
    });
    setLoading(false);

    if (result.success) {
      Alert.alert("Success", "Your worker profile is live!", [
        { text: "View Gigs", onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert("Error", result.error);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icons.Ionicons name="close-outline" size={28} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Worker Setup</Text>
          <Text style={styles.headerSubtitle}>Step 1: Skills & Profile</Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroSection}>
            <View style={styles.iconCircle}>
              <Icons.Ionicons name="construct" size={40} color="#fff" />
            </View>
            <Text style={styles.heroTitle}>Get Hired in Eswatini</Text>
          </View>

          <View style={styles.formCard}>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Icons.Ionicons name="person-outline" size={20} color="#10b981" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  value={form.name} 
                  onChangeText={(t) => setForm(prev => ({...prev, name: t}))} 
                  placeholder="John Doe"
                />
              </View>
            </View>

            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Icons.Ionicons name="call-outline" size={20} color="#10b981" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  keyboardType="phone-pad"
                  value={form.phone} 
                  onChangeText={(t) => setForm(prev => ({...prev, phone: t}))} 
                  placeholder="7612 3456"
                />
              </View>
            </View>

            {/* NEW: Skills Tagging System */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>My Skills (e.g. Plumbing, IT)</Text>
              <View style={styles.inputWrapper}>
                <Icons.Ionicons name="flash-outline" size={20} color="#10b981" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  placeholder="Type a skill..."
                  value={currentSkill}
                  onChangeText={setCurrentSkill}
                  onSubmitEditing={addSkill} // Add skill on Enter
                  returnKeyType="done"
                />
                <TouchableOpacity onPress={addSkill} style={styles.addSkillBtn}>
                   <Icons.Ionicons name="add-circle" size={26} color="#10b981" />
                </TouchableOpacity>
              </View>
              
              {/* Skill Chips List */}
              <View style={styles.tagCloud}>
                {form.skills.map((skill, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.skillTag}
                    onPress={() => removeSkill(index)}
                  >
                    <Text style={styles.skillTagText}>{skill}</Text>
                    <Icons.Ionicons name="close-circle" size={14} color="#fff" style={{marginLeft: 5}} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Address Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Work Area</Text>
              <View style={styles.inputWrapper}>
                <Icons.Ionicons name="location-outline" size={20} color="#10b981" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input} 
                  value={form.location.address}
                  onChangeText={(t) => setForm(prev => ({...prev, location: {...prev.location, address: t}}))}
                  placeholder="Matsapha, Manzini..."
                />
                <TouchableOpacity onPress={handleGetLocation} style={styles.gpsBtn}>
                  {locating ? <ActivityIndicator size="small" color="#10b981" /> : <Icons.Ionicons name="navigate" size={18} color="#10b981" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Bio Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bio / Experience</Text>
              <View style={[styles.inputWrapper, { alignItems: 'flex-start', paddingTop: 12 }]}>
                <Icons.Ionicons name="document-text-outline" size={20} color="#10b981" style={styles.inputIcon} />
                <TextInput 
                  multiline numberOfLines={4} 
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
                  value={form.bio} 
                  onChangeText={(t) => setForm(prev => ({...prev, bio: t}))} 
                  placeholder="Tell clients why they should hire you..."
                />
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <Text style={styles.submitBtnText}>Publish Worker Profile</Text>
            )}
          </TouchableOpacity>
          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 15, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitleContainer: { marginLeft: 15 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#000" },
  headerSubtitle: { fontSize: 11, color: '#999', textTransform: 'uppercase', fontWeight: '700' },
  headerBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#f5f5f5", alignItems: "center", justifyContent: "center" },
  scrollContent: { padding: 20 },
  
  heroSection: { alignItems: 'center', marginBottom: 20 },
  iconCircle: { width: 70, height: 70, borderRadius: 25, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#000' },

  formCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, borderWeight: 1, borderColor: '#f0f0f0', elevation: 2, marginBottom: 25 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#000', marginBottom: 8, textTransform: 'uppercase' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', borderRadius: 16, paddingHorizontal: 15, borderWidth: 1, borderColor: '#eee' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#000' },
  
  // Skill Tags
  addSkillBtn: { marginLeft: 5 },
  tagCloud: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 8 },
  skillTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10b981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  skillTagText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  gpsBtn: { padding: 5, marginLeft: 5 },
  submitBtn: { backgroundColor: '#000', paddingVertical: 18, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 }
});

export default WorkerRegistration;