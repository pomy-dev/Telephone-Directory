import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, StatusBar,
  KeyboardAvoidingView, Platform, ActivityIndicator, Image, FlatList, Checkbox
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Icons } from "../../constants/Icons";
import { registerAsWorker, updateWorkerProfile, getWorkerProfile } from '../../service/Supabase-Fuctions';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import SecondaryNav from '../../components/SecondaryNav';
import { CustomToast } from '../../components/customToast';
import { AuthContext } from '../../context/authProvider';
import { AppContext } from '../../context/appContext';

const WorkerRegistration = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const authContext = useContext(AuthContext);
  const appContext = useContext(AppContext);

  const user = authContext?.user;
  const theme = appContext?.theme;
  const isDarkMode = appContext?.isDarkMode;

  // Prevent rendering if contexts are not available
  if (!theme || !appContext) {
    return <View style={{ flex: 1, backgroundColor: '#f4f7f6' }} />;
  }

  const [loading, setLoading] = useState(false);
  // const [fetching, setFetching] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [locating, setLocating] = useState(false);
  const [currentSkill, setCurrentSkill] = useState('');

  const [avatarUri, setAvatarUri] = useState(null);
  const [isPickImg, setIsPickImg] = useState(false);

  // Field-level edit mode tracking

  // Portfolio & Certificates
  const [workImages, setWorkImages] = useState([]);
  const [certificates, setCertificates] = useState([]);

  const [form, setForm] = useState({
    full_name: { value: '', onEdit: false },
    phone: { value: '', onEdit: false },
    skills: { value: [], onEdit: false },
    bio: { value: '', onEdit: false },
    location: { value: '', lat: null, lng: null, onEdit: false },
    isBusinessEntity: { value: false, onEdit: false },
    workImages: [],
    certificates: []
  })

  useEffect(() => {
    const checkStatus = async () => {
      if (!user?.uid) return;

      const result = await getWorkerProfile(user.uid);
      if (result.success && result.data) {
        const p = result.data;
        setForm({
          full_name: { value: p.name || '', onEdit: true },
          phone: { value: p.phone || '', onEdit: true },
          skills: { value: p.skills || [], onEdit: true },
          bio: { value: p.bio || '', onEdit: true },
          location: { value: p.location?.address || '', lat: p.location?.lat || null, lng: p.location?.lng || null, onEdit: true },
          isBusinessEntity: { value: p.isBusinessEntity || false, onEdit: true },
          workImages: p.workImages || [],
          certificates: p.certificates || []
        });
        setWorkImages(p.workImages || []);
        setCertificates(p.certificates || []);
        setIsEditMode(true);
      }
    };
    checkStatus();
  }, [user])

  const addSkill = () => {
    const trimmed = currentSkill.trim();
    if (trimmed.length === 0) return;
    if (form.skills.value.includes(trimmed)) {
      Alert.alert("Duplicate", "Skill already added.");
      return;
    }
    setForm(prev => ({ ...prev, skills: { ...prev.skills, value: [...prev.skills.value, trimmed] } }));
    setCurrentSkill('');
  }

  const removeSkill = (index) => {
    setForm(prev => ({
      ...prev,
      skills: { ...prev.skills, value: prev.skills.value.filter((_, i) => i !== index) }
    }));
  }

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
  }

  const handleAddWorkImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photos.');
      return;
    }

    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8
      });

      if (!res.canceled) {
        const newImage = res.assets[0].uri;
        setWorkImages(prev => [...prev, newImage]);
        setForm(prev => ({ ...prev, workImages: [...prev.workImages, newImage] }));
      }
    } catch (e) {
      console.error(e.message);
      Alert.alert("Error", "Failed to pick image");
    }
  }

  const handleRemoveWorkImage = (index) => {
    setWorkImages(prev => prev.filter((_, i) => i !== index));
    setForm(prev => ({ ...prev, workImages: prev.workImages.filter((_, i) => i !== index) }));
  };

  const handleAddCertificate = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*']
      });

      if (!res.canceled) {
        const doc = res.assets[0];
        const newCert = {
          name: doc.name,
          uri: doc.uri,
          type: doc.mimeType
        };
        setCertificates(prev => [...prev, newCert]);
        setForm(prev => ({ ...prev, certificates: [...prev.certificates, newCert] }));
      }
    } catch (e) {
      console.error(e.message);
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const handleRemoveCertificate = (index) => {
    setCertificates(prev => prev.filter((_, i) => i !== index));
    setForm(prev => ({ ...prev, certificates: prev.certificates.filter((_, i) => i !== index) }));
  };

  // Render text field - registration mode (always editable)
  const renderTextField = (fieldName, label, icon, multiline = false, keyboardType = 'default') => {
    const fieldData = form[fieldName];

    return (
      <View style={styles.settingItem}>
        <View style={[styles.iconBox, { backgroundColor: '#f0f4ff' }]}>
          {icon}
        </View>
        <View style={styles.settingContent}>
          <TextInput
            multiline={multiline}
            style={[styles.settingInput, multiline && { minHeight: 100, textAlignVertical: 'top' }]}
            label={label}
            mode="outlined"
            theme={{ roundness: 12 }}
            keyboardType={keyboardType}
            value={fieldData.value}
            onChangeText={(text) => {
              if (fieldName === 'skills') return;
              setForm((prev) => ({ ...prev, [fieldName]: { ...prev[fieldName], value: text } }))
            }}
            onSubmitEditing={fieldName === 'skills' && addSkill}
          />
        </View>
      </View>
    );
  };

  // Render text field - edit mode (toggle between view and edit)
  const renderEditableTextField = (fieldName, label, icon, multiline = false, keyboardType = 'default') => {
    const fieldData = form[fieldName];
    const isEditing = fieldData.onEdit;

    if (isEditing) {
      return (
        <View style={[styles.settingItem, { height: 'auto', alignItems: 'flex-start', paddingVertical: 12 }]}>
          <View style={[styles.iconBox, { backgroundColor: '#f0f4ff', marginTop: 12 }]}>
            {icon}
          </View>
          <View style={[styles.settingContent, { paddingTop: 0 }]}>
            <TextInput
              multiline={multiline}
              style={[styles.settingInput, multiline && { minHeight: 100, textAlignVertical: 'top' }]}
              mode="outlined"
              theme={{ roundness: 12 }}
              label={label}
              keyboardType={keyboardType}
              value={fieldData.value}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, [fieldName]: { ...prev[fieldName], value: text } }))
              }
            />
            <View style={styles.fieldActionRow}>
              <TouchableOpacity
                style={[styles.fieldActionBtn, { backgroundColor: '#10b981' }]}
                onPress={() => {
                  setForm((prev) => ({ ...prev, [fieldName]: { ...prev[fieldName], onEdit: false } }));
                }}
              >
                <Icons.Ionicons name="checkmark" size={18} color="#fff" />
                <Text style={styles.fieldActionText}>SAVE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.fieldActionBtn, { backgroundColor: '#ef4444' }]}
                onPress={() => {
                  setForm((prev) => ({ ...prev, [fieldName]: { ...prev[fieldName], onEdit: false } }));
                }}
              >
                <Icons.Ionicons name="close" size={18} color="#fff" />
                <Text style={styles.fieldActionText}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    // Read-only view
    return (
      <View style={[styles.settingItem, multiline && { minHeight: 100 }]}>
        <View style={[styles.iconBox, { backgroundColor: '#f0f4ff', marginTop: multiline ? 12 : 0 }]}>
          {icon}
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingLabel}>{label.toUpperCase()}</Text>
          <Text style={[styles.valueText, { color: theme.colors.text }]}>
            {fieldData.value?.toString().trim() ? fieldData.value : 'Not provided'}
          </Text>
          <TouchableOpacity
            style={[styles.editFieldBtn, { backgroundColor: theme.colors.indicator }]}
            onPress={() => setForm((prev) => ({ ...prev, [fieldName]: { ...prev[fieldName], onEdit: true } }))}
          >
            <Icons.Ionicons name="pencil" size={14} color="#fff" />
            <Text style={styles.editFieldBtnText}>EDIT</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleRegister = async () => {
    if (!form.full_name.value || !form.phone.value || !Array.isArray(form.skills.value) || form.skills.value.length === 0 || !form.location.value) {
      Alert.alert("Missing Details", "Please fill in all required sections.");
      return;
    }

    const submitData = {
      name: form.full_name.value,
      phone: form.phone.value,
      skills: form.skills.value,
      bio: form.bio.value,
      location: { address: form.location.value, lat: form.location.lat, lng: form.location.lng },
      isBusinessEntity: form.isBusinessEntity.value,
      workImages: form.workImages,
      certificates: form.certificates
    };

    try {
      setLoading(true);
      let result = isEditMode
        ? await updateWorkerProfile(user.uid, submitData)
        : await registerAsWorker({ ...submitData, user_id: user.uid });

      if (result.success) {
        CustomToast("Success👍", "Your Freelancer profile is now live!");
      } else {
        Alert.alert("Error", result.error);
      }
    } catch (err) {
      console.error(err.message)
    } finally {
      setLoading(false);
      setForm({
        full_name: { value: '', onEdit: false },
        phone: { value: '', onEdit: false },
        skills: { value: [], onEdit: false },
        bio: { value: '', onEdit: false },
        location: { value: '', lat: null, lng: null, onEdit: false },
        isBusinessEntity: { value: false, onEdit: false },
        workImages: [],
        certificates: []
      })
    }
  }

  // if (fetching) {
  //   return (
  //     <View style={[styles.container, { justifyContent: 'center' }]}>
  //       <ActivityIndicator size="large" color={theme.colors.indicator} />
  //     </View>
  //   );
  // }

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
                  <>
                    <Image source={{ uri: avatarUri }} style={styles.avatarImage} />

                    <TouchableOpacity onPress={handleAddProfileImg} style={{ position: 'absolute', bottom: 5, right: 130, marginLeft: 8 }}>
                      <Icons.Ionicons name="camera-reverse" size={26} color={theme.colors.indicator} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity style={styles.avatarContainer} onPress={handleAddProfileImg}>
                      <View style={styles.avatarPlaceholder}>
                        <Icons.Ionicons name="camera" size={22} color="#888" />
                        <Text style={styles.avatarPlaceholderText}>Add PP</Text>
                      </View>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            {/* Full Name */}
            {!isEditMode
              ? renderTextField('full_name', 'Full Name', <Icons.Ionicons name="person" size={20} color={theme.colors.indicator} />)
              : renderEditableTextField('full_name', 'Full Name', <Icons.Ionicons name="person" size={20} color={theme.colors.indicator} />)
            }

            {/* Phone */}
            {!isEditMode
              ? renderTextField('phone', 'Phone Number', <Icons.Ionicons name="call" size={20} color={theme.colors.indicator} />, false, 'phone-pad')
              : renderEditableTextField('phone', 'Phone Number', <Icons.Ionicons name="call" size={20} color={theme.colors.indicator} />, false, 'phone-pad')
            }
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>PROFESSIONAL INFO</Text>
          </View>

          <View style={[styles.settingsGroup, { backgroundColor: theme.colors.card }]}>
            {/* Skills */}
            {!isEditMode &&
              <View style={[styles.settingItem, { alignItems: 'center', paddingVertical: 6, borderWidth: 0, borderColor: theme.colors.card }]}>
                <View style={[styles.iconBox, { backgroundColor: '#f0f4ff' }]}>
                  <Icons.Ionicons name="flash" size={20} color={theme.colors.indicator} />
                </View>
                <View style={styles.settingContent}>
                  <TextInput
                    style={[styles.settingInput, { flex: 1 }]}
                    label="Add skill"
                    mode="outlined"
                    theme={{ roundness: 12 }}
                    value={currentSkill}
                    onChangeText={setCurrentSkill}
                    onSubmitEditing={addSkill}
                  />
                </View>
              </View>
            }

            {/* Tags - always visible if there are skills */}
            {form.skills.value?.length > 0 && (
              <View style={[styles.tagWrapper, { paddingLeft: 0 }]}>
                {form.skills.value.map((skill, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.skillTag}
                    onPress={() => removeSkill(i)}
                  >
                    <Text style={styles.skillTagText}>{skill}</Text>
                    <Icons.Ionicons name="close-circle" size={16} color="#10b981" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {isEditMode && (
              <>
                <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
                  <View style={[styles.iconBox, { backgroundColor: '#f0f4ff' }]} >
                    <Icons.Ionicons name="flash" size={20} color={theme.colors.indicator} />
                  </View>
                  <View style={styles.settingContent}>
                    <View style={styles.skillInputRow}>
                      <TextInput
                        style={[styles.settingInput, { flex: 1 }]}
                        label="Add new skill"
                        mode="outlined"
                        theme={{ roundness: 12 }}
                        value={currentSkill}
                        onChangeText={setCurrentSkill}
                        onSubmitEditing={addSkill}
                      />
                      <TouchableOpacity onPress={addSkill} style={[styles.addInlineBtn, { backgroundColor: theme.colors.indicator }]}>
                        <Text style={styles.addInlineText}>ADD</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* Work Area / Location */}
            {!isEditMode
              ? renderTextField('location', 'Work Area / Location', <Icons.Ionicons name="location" size={20} color={theme.colors.indicator} />)
              : renderEditableTextField('location', 'Work Area / Location', <Icons.Ionicons name="location" size={20} color={theme.colors.indicator} />)
            }

            {/* GPS Location Button */}
            {!isEditMode && (
              <View style={styles.settingItem}>
                <View style={[styles.settingContent, { flexDirection: 'row', alignItems: 'center' }]}>
                  <TouchableOpacity onPress={handleGetLocation} disabled={locating}>
                    <View style={[styles.iconBox, { backgroundColor: '#f0f4ff' }]} >
                      {locating
                        ? <ActivityIndicator size={'small'} color={theme.colors.indicator} />
                        : <Icons.Entypo name='direction' size={20} color={theme.colors.indicator} />
                      }
                    </View>
                  </TouchableOpacity>
                  {(form.location.lat && form.location.lng) ? (
                    <Text style={{ fontSize: 16, fontWeight: 200, color: theme.colors.text }}>
                      Lat: {form.location.lat} 🔵 Lng: {form.location.lng}
                    </Text>
                  ) : (
                    <Text style={{ fontSize: 16, fontWeight: 200, color: theme.colors.text }}>
                      None Map co-ordinates...
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Bio */}
            {!isEditMode
              ? renderTextField('bio', 'Describe your services...', <Icons.Ionicons name="document-text" size={20} color={theme.colors.indicator} />, true)
              : renderEditableTextField('bio', 'Describe your services...', <Icons.Ionicons name="document-text" size={20} color={theme.colors.indicator} />, true)
            }
          </View>

          {/* PORTFOLIO SECTION (Edit Mode Only) */}
          {isEditMode && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionHeaderText, { color: theme.colors.text }]}>PORTFOLIO & IMAGES</Text>
              </View>

              <View style={[styles.settingsGroup, { backgroundColor: theme.colors.card }]}>
                <TouchableOpacity
                  style={styles.addMediaBtn}
                  onPress={handleAddWorkImages}
                >
                  <Icons.Ionicons name="images" size={24} color={theme.colors.indicator} />
                  <Text style={[styles.addMediaText, { color: theme.colors.text }]}>Add Work Images</Text>
                </TouchableOpacity>

                {Array.isArray(workImages) && workImages.length > 0 && (
                  <View style={styles.mediaGrid}>
                    {workImages.map((img, index) => (
                      <View key={index} style={styles.imageCard}>
                        <Image source={{ uri: img }} style={styles.portfolioImage} />
                        <TouchableOpacity
                          style={styles.removeMediaBtn}
                          onPress={() => handleRemoveWorkImage(index)}
                        >
                          <Icons.Ionicons name="close-circle" size={24} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </>
          )}

          {/* CERTIFICATES SECTION (Edit Mode Only) */}
          {isEditMode && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionHeaderText, { color: theme.colors.text }]}>CERTIFICATES & DOCUMENTS</Text>
              </View>

              <View style={[styles.settingsGroup, { backgroundColor: theme.colors.card }]}>
                <TouchableOpacity
                  style={styles.addMediaBtn}
                  onPress={handleAddCertificate}
                >
                  <Icons.Ionicons name="document" size={24} color={theme.colors.indicator} />
                  <Text style={[styles.addMediaText, { color: theme.colors.text }]}>Add Certificate/Document</Text>
                </TouchableOpacity>

                {Array.isArray(certificates) && certificates.length > 0 && (
                  <View style={styles.certificatesList}>
                    {certificates.map((cert, index) => (
                      <View key={index} style={[styles.certCard, { borderColor: theme.colors.indicator }]}>
                        <View style={styles.certInfo}>
                          <Icons.Ionicons name="document-text" size={20} color={theme.colors.indicator} />
                          <Text style={[styles.certName, { color: theme.colors.text }]} numberOfLines={2}>
                            {cert.name}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.removeCertBtn}
                          onPress={() => handleRemoveCertificate(index)}
                        >
                          <Icons.Ionicons name="trash" size={18} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </>
          )}

          {/* BUSINESS TYPE SECTION (Edit Mode Only) */}
          {isEditMode && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionHeaderText, { color: theme.colors.text }]}>BUSINESS TYPE</Text>
              </View>

              <View style={[styles.settingsGroup, { backgroundColor: theme.colors.card }]}>
                <View style={styles.checkboxItem}>
                  {/* <Checkbox
                    status={form.isBusinessEntity.value ? 'checked' : 'unchecked'}
                    onPress={() => setForm(prev => ({ ...prev, isBusinessEntity: { ...prev.isBusinessEntity, value: !prev.isBusinessEntity.value } }))}
                    color={theme.colors.indicator}
                  /> */}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.checkboxLabel, { color: theme.colors.text }]}>
                      I operate as a small business / startup
                    </Text>
                    <Text style={[styles.checkboxHint, { color: '#888' }]}>
                      Check if you have a registered business entity
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}

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
  locateBtn: { paddingHorizontal: 5, paddingVertical: 1 },

  tagWrapper: { flexDirection: 'row', flexWrap: 'wrap', marginLeft: 20, paddingLeft: 75, paddingRight: 20, gap: 10 },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 5,
    gap: 10,
    paddingVertical: 6,
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

  // Edit field styles
  valueText: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  editFieldBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6
  },
  editFieldBtnText: { fontWeight: '700', fontSize: 12, color: '#fff' },
  fieldActionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  fieldActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6
  },
  fieldActionText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  // Portfolio & Media styles
  addMediaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5'
  },
  addMediaText: { fontSize: 15, fontWeight: '700' },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10
  },
  imageCard: { position: 'relative', width: '48%', aspectRatio: 1 },
  portfolioImage: { width: '100%', height: '100%', borderRadius: 12, resizeMode: 'cover' },
  removeMediaBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2
  },

  // Certificates styles
  certificatesList: { padding: 10, gap: 10 },
  certCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#fafafa'
  },
  certInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  certName: { fontSize: 13, fontWeight: '600', flex: 1 },
  removeCertBtn: { padding: 6 },

  // Checkbox styles
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15
  },
  checkboxLabel: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  checkboxHint: { fontSize: 12, fontWeight: '500' }
});

export default WorkerRegistration;