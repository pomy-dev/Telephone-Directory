"use client";

import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, StatusBar,
  KeyboardAvoidingView, Platform, ActivityIndicator, Image
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Icons } from "../../constants/Icons";
import {
  registerAsWorker,
  updateWorkerProfile,
  getWorkerProfile
} from '../../service/Supabase-Fuctions';
import * as ImagePicker from 'expo-image-picker';
import SecondaryNav from '../../components/SecondaryNav';
import { AuthContext } from '../../context/authProvider';
import { AppContext } from '../../context/appContext';

const WorkerRegistration = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const { theme, isDarkMode } = useContext(AppContext);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [locating, setLocating] = useState(false);
  const [currentSkill, setCurrentSkill] = useState('');

  const [avatarUri, setAvatarUri] = useState(null);
  const [isPickImg, setIsPickImg] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    skills: [],
    bio: '',
    location: { address: '', lat: null, lng: null }
  });

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

  const handleAddProfileImg = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photos.');
      return;
    }

    try {
      setIsPickImg(true)
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8
      });

      if (!res.canceled) setAvatarUri(res.assets[0].uri);
      console.log('Image URL: ', res.assets[0])

    } catch (e) {
      console.error(e.message)
    } finally {
      setIsPickImg(false)
    }
  }

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
      // attach avatarUri to form if needed in the future
      // e.g., upload avatar then save URL with profile
      Alert.alert("Success", isEditMode ? "Profile updated!" : "Profile is now live!");
    } else {
      Alert.alert("Error", result.error);
    }
  };

  if (fetching) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.indicator} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />

      <SecondaryNav title={'Register As Freelancer'} rightIcon={'save'} onRightPress={handleRegister} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.mainScroll}>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionHeaderText, { color: theme.colors.text }]}>PERSONAL INFO</Text>
          </View>

          <View style={[styles.settingsGroup, { backgroundColor: theme.colors.card }]}>
            {isEditMode && (
              // {/* Profile Avatar */ }
              <View style={{ paddingTop: 10, alignItems: 'center', flex: 1 }}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <TouchableOpacity style={styles.avatarContainer} onPress={handleAddProfileImg}>
                    <View style={styles.avatarPlaceholder}>
                      <Icons.Ionicons name="camera" size={22} color="#888" />
                      <Text style={styles.avatarPlaceholderText}>Add PP</Text>
                    </View>
                  </TouchableOpacity>
                )}

                <TouchableOpacity onPress={handleAddProfileImg} style={{ position: 'absolute', bottom: 5, right: 130, marginLeft: 8 }}>
                  <Icons.Ionicons name="camera-reverse" size={26} color={theme.colors.indicator} />
                </TouchableOpacity>
              </View>
            )}

            {!isEditMode && (
              <>
                {/* Full Name */}
                <View style={styles.settingItem}>
                  <View style={[styles.iconBox, { backgroundColor: '#f0f4ff' }]}>
                    <Icons.Ionicons name="person" size={20} color={theme.colors.indicator} />
                  </View>
                  <View style={styles.settingContent}>
                    <TextInput
                      style={styles.settingInput}
                      mode='outlined'
                      value={form.name}
                      theme={{ roundness: 12 }}
                      onChangeText={(t) => setForm(prev => ({ ...prev, name: t }))}
                      label="Full Name"
                    />
                  </View>
                </View>

                {/* Phone */}
                <View style={styles.settingItem}>
                  <View style={[styles.iconBox, { backgroundColor: '#f0f4ff' }]}>
                    <Icons.Ionicons name="call" size={20} color={theme.colors.indicator} />
                  </View>
                  <View style={styles.settingContent}>
                    <TextInput
                      style={styles.settingInput}
                      mode="outlined"
                      keyboardType="phone-pad"
                      value={form.phone}
                      onChangeText={(t) => setForm(prev => ({ ...prev, phone: t }))}
                      label="Phone Number"
                      theme={{ roundness: 12 }}
                    />
                  </View>
                </View>
              </>
            )}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>PROFESSIONAL INFO</Text>
          </View>

          <View style={[styles.settingsGroup, { backgroundColor: theme.colors.card }]}>
            {/* Skills */}
            <View style={[styles.settingItem, { borderBottomWidth: form.skills.length > 0 ? 0 : 1 }]}>
              <View style={[styles.iconBox, { backgroundColor: '#f0f4ff' }]}>
                <Icons.Ionicons name="flash" size={20} color={theme.colors.indicator} />
              </View>
              <View style={styles.settingContent}>
                <View style={styles.skillInputRow}>
                  <TextInput
                    style={[styles.settingInput, { flex: 1 }]}
                    label="Skills"
                    mode="outlined"
                    theme={{ roundness: 12 }}
                    value={currentSkill}
                    onChangeText={setCurrentSkill}
                    onSubmitEditing={addSkill}
                  />
                  <TouchableOpacity onPress={addSkill} style={
                    [styles.addInlineBtn, { backgroundColor: theme.colors.indicator }]}
                  >
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
                    <Icons.Ionicons name="close-circle" size={16} color="#10b981" style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Work Area */}
            <View style={styles.settingItem}>
              <View style={[styles.iconBox, { backgroundColor: '#f0f4ff' }]}>
                <Icons.Ionicons name="location" size={20} color={theme.colors.indicator} />
              </View>
              <View style={styles.settingContent}>
                <View style={[styles.skillInputRow, { gap: 10, }]}>
                  <TextInput
                    style={[styles.settingInput, { flex: 1 }]}
                    value={form.location.address}
                    onChangeText={(t) => setForm(prev => ({ ...prev, location: { ...prev.location, address: t } }))}
                    label="Work Area / Location"
                    mode='outlined'
                    theme={{ roundness: 12 }}
                  />
                  <TouchableOpacity onPress={handleGetLocation} disabled={locating}
                    style={[styles.locateBtn, { backgroundColor: '#f0f4ff', alignItems: 'center', borderRadius: 10 }]}
                  >
                    {
                      locating
                        ? <ActivityIndicator size={24} color={theme.colors.indicator} />
                        : <Icons.Ionicons name="navigate-circle" size={40} color={theme.colors.indicator} />
                    }
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Bio */}
            <View style={[styles.settingItem, { height: 'auto', borderBottomWidth: 0 }]}>
              <View style={[styles.iconBox, { backgroundColor: '#f0f4ff', alignSelf: 'flex-start', marginTop: 15 }]}>
                <Icons.Ionicons name="document-text" size={20} color={theme.colors.indicator} />
              </View>
              <View style={styles.settingContent}>
                <TextInput
                  multiline
                  style={[styles.settingInput, { minHeight: 100, textAlignVertical: 'top', marginTop: 8 }]}
                  value={form.bio}
                  onChangeText={(t) => setForm(prev => ({ ...prev, bio: t }))}
                  label="Describe your services and why clients should hire you..."
                  mode='outlined'
                  theme={{ roundness: 12 }}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.fullSubmitBtn} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.fullSubmitText}>{isEditMode ? "SAVE ALL CHANGES" : "PUBLISH PROFILE"}</Text>}
          </TouchableOpacity>
          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View >
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

  skillInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  addInlineBtn: {
    marginLeft: 10, paddingHorizontal: 12,
    paddingVertical: 10, borderRadius: 6
  },
  addInlineText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  locateBtn: { paddingHorizontal: 10, paddingVertical: 1 },

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
  ,
  avatarContainer: {
    width: 86,
    height: 86,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cfcfcf',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa'
  },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  avatarPlaceholderText: { color: '#888', fontSize: 12, marginTop: 6 },
  avatarImage: { width: 86, height: 86, borderRadius: 50, resizeMode: 'cover' },
});

export default WorkerRegistration;