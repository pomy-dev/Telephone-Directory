import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Icons } from '../constants/Icons';
import { Images } from '../constants/Images';
import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import { AppContext } from '../context/appContext';
import { AuthContext } from '../context/authProvider';
import { CustomToast } from '../components/customToast';
import CustomLoader from '../components/customLoader';
import { addUser, getUserProfile, updateUserProfile } from '../service/getApi';

const generateId = () => `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

export default function ProfileScreen({ navigation, route }) {
  const register = route?.params?.register;
  const { theme, isDarkMode } = React.useContext(AppContext);
  const { user, logout } = React.useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [image, setImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = register
    ? useState({
      name: '',
      email: user.email,
      phone: '',
      whatsApp: '',
      title: '',
      company: '',
      location: '',
      industry: '',
      experience: '',
      acquiredSkills: [],
      innateSkills: [],
      domesticSkills: [],
      achievements: [],
      education: '',
      socialLinks: {
        linkedin: '',
        twitter: '',
        github: '',
        website: '',
        instagram: '',
        facebook: ''
      },
      avatar: null,
      isAvailableForWork: true,
    })
    : useState({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      whatsApp: '+268 7123456',
      title: 'Software Developer',
      company: 'Tech Solutions Inc.',
      location: 'San Francisco, CA',
      industry: 'Technology',
      experience: '5 years',
      acquiredSkills: ['JavaScript', 'React', 'Node.js'],
      innateSkills: ['Problem Solving', 'Critical Thinking'],
      domesticSkills: ['Time Management', 'Organization'],
      achievements: ['Led development of flagship product'],
      education: 'BS Computer Science, UC Berkeley',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/johndoe',
        twitter: 'https://twitter.com/johndoe',
        github: 'https://github.com/johndoe',
        website: 'https://johndoe.dev',
        instagram: '',
        facebook: '',
      },
      avatar: user.picture || Images.default_user,
      isAvailableForWork: true,
    });

  const [newAcquiredSkill, setNewAcquiredSkill] = useState('');
  const [newInnateSkill, setNewInnateSkill] = useState('');
  const [newDomesticSkill, setNewDomesticSkill] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Education', 'Marketing',
    'Energy', 'Agriculture', 'Construction', 'Transportation', 'Retail', 'Hospitality',
    'Real Estate', 'Legal', 'Consulting', 'Media', 'Telecommunications', 'Automotive',
    'Aerospace', 'Biotechnology', 'Pharmaceuticals', 'Food & Beverage', 'Fashion',
    'Sports', 'Non-Profit', 'Government', 'Insurance', 'Entertainment', 'Other'
  ];

  // Function to request permissions on Android
  const requestPermissions = async () => {

    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert(
          'Insufficient permissions!',
          'You need to grant camera and media library permissions to use this feature.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    }
    return true;
  };

  // Function to launch camera and take a photo
  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images', 'livePhotos'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log(result)
        handleImageSelected(result.assets[0]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      setError('Failed to take photo. Please try again.');
    }
  };

  // Function to open the gallery and pick an image
  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
        handleImageSelected(result.assets[0]);
      }
      return [];
    } catch (error) {
      console.error('Error picking image:', error);
      setError('Failed to select image. Please try again.');
    }
  };

  const handleImageSelected = async (asset) => {
    try {
      const fileInfo = new File(Paths.cache, "subdirName", asset);

      const newImage = {
        id: generateId(),
        uri: asset.uri,
        name: asset.uri.split('/').pop() || `image-${Date.now()}.jpg`,
        type: `image/${asset.uri.split('.').pop() || 'jpeg'}`,
        size: fileInfo.size,
        localPath: asset.uri
      };

      setImage(newImage);
      setProfile((prev) => ({ ...prev, avatar: newImage.uri }));
    } catch (error) {
      console.error('Error processing image:', error);
      setError('Failed to process image. Please try again.');
    }
  };

  // Submit form OR Edits 
  const handleSave = async () => {
    setIsEditing(false);
    setIsLoading(true)
    try {
      const payload = { ...profile };

      if (register) {
        if (image && image.uri) {
          try {
            // read image as base64
            const imageString = await FileSystem.readAsStringAsync(image.uri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            payload.avatar = `data:${image.type};base64,${imageString}`;
            // payload.avatarName = image.name;
          } catch (fsErr) {
            console.error('Failed to convert image to base64:', fsErr);
            CustomToast('Error', 'Failed to process image. Please try again.');
          }
        }
        const newUser = await addUser(payload);
        // console.log('\n\t\tNew User:', newUser);
        //   // set the new user in context
        // } else {
        //   setIsLoading(true)
        //   const updatedUser = await updateUserProfile(user.id, profile);
        //   // set the updated user in context
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      CustomToast('Error', error.message || 'Failed to your info. Please try again.');
    } finally {
      // reset fields and states
      setProfile({
        name: '',
        email: '',
        phone: '',
        whatsApp: '',
        title: '',
        company: '',
        location: '',
        industry: '',
        experience: '',
        acquiredSkills: [],
        innateSkills: [],
        domesticSkills: [],
        achievements: [],
        education: '',
        socialLinks: {
          linkedin: '',
          twitter: '',
          github: '',
          website: '',
          instagram: '',
          facebook: ''
        },
        avatar: null,
        isAvailableForWork: true,
      });
      setIsLoading(false);
    }
  };

  const addSkill = () => {
    if (newAcquiredSkill.trim() && !profile.acquiredSkills.includes(newAcquiredSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        acquiredSkills: [...prev.acquiredSkills, newAcquiredSkill.trim()]
      }));
      setNewAcquiredSkill('');
    }
  };

  const addInnateSkill = () => {
    if (newInnateSkill.trim() && !profile.innateSkills.includes(newInnateSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        innateSkills: [...prev.innateSkills, newInnateSkill.trim()]
      }));
      setNewInnateSkill('');
    }
  };

  const addDomesticSkill = () => {
    if (newDomesticSkill.trim() && !profile.domesticSkills.includes(newDomesticSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        domesticSkills: [...prev.domesticSkills, newDomesticSkill.trim()]
      }));
      setNewDomesticSkill('');
    }
  };

  const removeAcquiredSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      acquiredSkills: prev.acquiredSkills.filter(skill => skill !== skillToRemove)
    }));
  };

  const removeInnateSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      innateSkills: prev.innateSkills.filter(skill => skill !== skillToRemove)
    }));
  };

  const removeDomesticSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      domesticSkills: prev.domesticSkills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setProfile(prev => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement.trim()]
      }));
      setNewAchievement('');
    }
  };

  const removeAchievement = (achievementToRemove) => {
    setProfile(prev => ({
      ...prev,
      achievements: prev.achievements.filter(achievement => achievement !== achievementToRemove)
    }));
  };

  const hanldeLogout = () => {
    logout()
    navigation.goBack()
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // adjust if you have a header
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

        {isLoading && <CustomLoader />}

        <View style={styles.header}>
          {/* back button */}
          <TouchableOpacity onPress={() => { navigation.goBack() }}>
            <Icons.Ionicons name='arrow-back' size={24} color={theme.colors.text} />
          </TouchableOpacity>

          {!register &&
            <View style={styles.headerAvatarContainer}>
              <Image source={profile.avatar ? { uri: profile.avatar } : Images.default_user} style={styles.headerAvater} />
              <View style={[
                styles.availabilityBadge,
                // { backgroundColor: profile.isAvailableForWork ? '#dcfce7' : '#fef3c7' }
              ]}>
                <Text style={[
                  styles.availabilityText,
                  { color: profile.isAvailableForWork ? '#16a34a' : '#d97706' }
                ]}>
                  {profile.isAvailableForWork ? 'Open to Work' : 'Employed'}
                </Text>
              </View>
            </View>
          }

          {register &&
            <Text numberOfLines={1} ellipsizeMode='tail' style={[styles.title, { color: theme.colors.text }]}>Create Profile</Text>
          }

          <TouchableOpacity
            style={[styles.editButton, (isEditing || register) && styles.saveButton, { borderColor: theme.colors.border }]}
            onPress={isEditing ? handleSave : () => setIsEditing(true)}
          >
            {isEditing || register ? (
              <>
                <Icons.Ionicons name='save-outline' size={16} color="#ffffff" />
                <Text style={styles.buttonText}>Save</Text>
              </>
            ) : (
              <Text style={[styles.editButtonText, { color: theme.colors.text }]}>Edit Profile</Text>
            )}
          </TouchableOpacity>

          {!register && <Icons.AntDesign name='logout' onPress={hanldeLogout} size={20} color={theme.colors.text} />}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <>
            <View style={styles.avatarSection}>

              {register &&
                <>
                  <Image source={profile.avatar ? { uri: profile.avatar } : Images.default_user} style={styles.avatar} />

                  <View style={styles.imageOptionsContainer}>
                    <TouchableOpacity style={styles.imageOption} onPress={takePhoto}>
                      <Icons.AntDesign name='camerao' size={24} color="#4F46E5" />
                      <Text style={styles.imageOptionText}>Take Photo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.imageOption} onPress={pickImage}>
                      <Icons.Ionicons name='images-outline' size={24} color="#4F46E5" />
                      <Text style={styles.imageOptionText}>Gallery</Text>
                    </TouchableOpacity>
                  </View>
                </>
              }
            </View>

            <View style={[styles.cardBody, { backgroundColor: theme.colors.card }]}>
              <View style={styles.sectionHeader}>
                <Icons.Ionicons name='person-circle-outline' size={24} color={theme.colors.indicator} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Basic Information</Text>
              </View>

              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Full Name</Text>
                {isEditing || register ? (
                  <TextInput
                    style={styles.textInput}
                    value={profile.name}
                    onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <Text style={[styles.fieldValue, { color: theme.colors.sub_text }]}>{profile.name}</Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Email</Text>
                {isEditing || register ? (
                  <TextInput
                    style={styles.textInput}
                    value={profile.email}
                    onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
                    placeholder="Enter your email address"
                  // editable={false}
                  />
                ) : (
                  <Text style={[styles.fieldValue, { color: theme.colors.sub_text }]}>{profile.email}</Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Phone</Text>
                {isEditing || register ? (
                  <TextInput
                    style={styles.textInput}
                    value={profile.phone}
                    keyboardType='number-pad'
                    onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <Text style={[styles.fieldValue, { color: theme.colors.sub_text }]}>{profile.phone}</Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>WhatsApp</Text>
                {isEditing || register ? (
                  <TextInput
                    style={styles.textInput}
                    value={profile.whatsApp}
                    keyboardType='number-pad'
                    onChangeText={(text) => setProfile(prev => ({ ...prev, whatsApp: text }))}
                    placeholder="Enter your whatsApp number"
                  />
                ) : (
                  <Text style={[styles.fieldValue, { color: theme.colors.sub_text }]}>{profile.email}</Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Professional Title</Text>
                {isEditing || register ? (
                  <TextInput
                    style={styles.textInput}
                    value={profile.title}
                    onChangeText={(text) => setProfile(prev => ({ ...prev, title: text }))}
                    placeholder="Your job title"
                  />
                ) : (
                  <Text style={[styles.fieldValue, { color: theme.colors.sub_text }]}>{profile.title}</Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Company</Text>
                {isEditing || register ? (
                  <TextInput
                    style={styles.textInput}
                    value={profile.company}
                    onChangeText={(text) => setProfile(prev => ({ ...prev, company: text }))}
                    placeholder="Current company"
                  />
                ) : (
                  <Text style={[styles.fieldValue, { color: theme.colors.sub_text }]}>{profile.company}</Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Location</Text>
                {isEditing || register ? (
                  <TextInput
                    style={styles.textInput}
                    value={profile.location}
                    onChangeText={(text) => setProfile(prev => ({ ...prev, location: text }))}
                    placeholder="City, State"
                  />
                ) : (
                  <View style={styles.fieldValueRow}>
                    <Icons.Feather name='map-pin' size={16} color={theme.colors.light} />
                    <Text style={[styles.fieldValue, { color: theme.colors.sub_text }]}>{profile.location}</Text>
                  </View>
                )}
              </View>

              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Industry</Text>
                {isEditing || register ? (
                  <View style={styles.industrySelector}>
                    {industries.map((industry) => (
                      <TouchableOpacity
                        key={industry}
                        style={[
                          styles.industryChip,
                          profile.industry === industry && styles.industryChipSelected
                        ]}
                        onPress={() => setProfile(prev => ({ ...prev, industry }))}
                      >
                        <Text style={[
                          styles.industryChipText,
                          profile.industry === industry && styles.industryChipTextSelected
                        ]}>
                          {industry}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={[styles.fieldValue, { color: theme.colors.sub_text }]}>{profile.industry}</Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Experience</Text>
                {isEditing || register ? (
                  <TextInput
                    style={styles.textInput}
                    value={profile.experience}
                    onChangeText={(text) => setProfile(prev => ({ ...prev, experience: text }))}
                    placeholder="e.g., 5 years"
                  />
                ) : (
                  <View style={styles.fieldValueRow}>
                    <Icons.Feather name='briefcase' size={16} color={theme.colors.light} />
                    <Text style={[styles.fieldValue, { color: theme.colors.sub_text }]}>{profile.experience}</Text>
                  </View>
                )}
              </View>

              {isEditing || register && (
                <View style={styles.field}>
                  <Text style={[styles.fieldLabel, { color: theme.colors.text }]}>Work Availability</Text>
                  <View style={styles.availabilitySelector}>
                    <TouchableOpacity
                      style={[
                        styles.availabilityOption,
                        profile.isAvailableForWork && styles.availabilityOptionSelected
                      ]}
                      onPress={() => setProfile(prev => ({ ...prev, isAvailableForWork: true }))}
                    >
                      <Text style={[
                        styles.availabilityOptionText,
                        profile.isAvailableForWork && styles.availabilityOptionTextSelected
                      ]}>
                        Open to Work
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.availabilityOption,
                        !profile.isAvailableForWork && styles.availabilityOptionSelected
                      ]}
                      onPress={() => setProfile(prev => ({ ...prev, isAvailableForWork: false }))}
                    >
                      <Text style={[
                        styles.availabilityOptionText,
                        !profile.isAvailableForWork && styles.availabilityOptionTextSelected
                      ]}>
                        Employed
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            <View style={[styles.cardBody, { backgroundColor: theme.colors.card }]}>
              <View style={styles.sectionHeader}>
                <Icons.FontAwesome6 name='graduation-cap' size={20} color={theme.colors.indicator} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Education</Text>
              </View>
              {isEditing || register ? (
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={profile.education}
                  onChangeText={(text) => setProfile(prev => ({ ...prev, education: text }))}
                  placeholder="Degree, University"
                  multiline
                />
              ) : (
                <Text style={[styles.fieldValue, { color: theme.colors.text }]}>{profile.education}</Text>
              )}
            </View>

            <View style={[styles.cardBody, { backgroundColor: theme.colors.card }]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Acquired Skills</Text>
              </View>
              <View style={styles.skillsContainer}>
                {profile.acquiredSkills.map((skill, index) => (
                  <View key={index} style={styles.skillChip}>
                    <Text style={styles.skillText}>{skill}</Text>
                    {(isEditing || register) && (
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeAcquiredSkill(skill)}
                      >
                        <Icons.FontAwesome name='remove' size={12} color="#6b7280" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
              {(isEditing || register) && (
                <View style={styles.addSkillContainer}>
                  <TextInput
                    style={styles.addSkillInput}
                    value={newAcquiredSkill}
                    onChangeText={setNewAcquiredSkill}
                    placeholder="Add an acquired skill"
                  />
                  <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.indicator }]} onPress={addSkill}>
                    <Icons.Feather name='plus' size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={[styles.cardBody, { backgroundColor: theme.colors.card }]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Innate Skills</Text>
              </View>
              <View style={styles.skillsContainer}>
                {profile.innateSkills.map((skill, index) => (
                  <View key={index} style={styles.skillChip}>
                    <Text style={styles.skillText}>{skill}</Text>
                    {(isEditing || register) && (
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeInnateSkill(skill)}
                      >
                        <Icons.FontAwesome name='remove' size={12} color="#6b7280" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
              {(isEditing || register) && (
                <View style={styles.addSkillContainer}>
                  <TextInput
                    style={styles.addSkillInput}
                    value={newInnateSkill}
                    onChangeText={setNewInnateSkill}
                    placeholder="Add an innate skill"
                  />
                  <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.indicator }]} onPress={addInnateSkill}>
                    <Icons.Feather name='plus' size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={[styles.cardBody, { backgroundColor: theme.colors.card }]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Domestic Skills</Text>
              </View>
              <View style={styles.skillsContainer}>
                {profile.domesticSkills.map((skill, index) => (
                  <View key={index} style={styles.skillChip}>
                    <Text style={styles.skillText}>{skill}</Text>
                    {(isEditing || register) && (
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeDomesticSkill(skill)}
                      >
                        <Icons.FontAwesome name='remove' size={12} color="#6b7280" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
              {(isEditing || register) && (
                <View style={styles.addSkillContainer}>
                  <TextInput
                    style={styles.addSkillInput}
                    value={newDomesticSkill}
                    onChangeText={setNewDomesticSkill}
                    placeholder="Add a domestic skill"
                  />
                  <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.indicator }]} onPress={addDomesticSkill}>
                    <Icons.Feather name='plus' size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={[styles.cardBody, { backgroundColor: theme.colors.card }]}>
              <View style={styles.sectionHeader}>
                <Icons.FontAwesome6 name='award' size={20} color={theme.colors.indicator} />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Achievements</Text>
              </View>
              {profile.achievements.map((achievement, index) => (
                <View key={index} style={styles.achievementItem}>
                  <Text style={[styles.achievementText, { color: theme.colors.text }]}>• {achievement}</Text>
                  {isEditing || register && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeAchievement(achievement)}
                    >
                      <Icons.FontAwesome name='remove' size={14} color="#6b7280" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {(isEditing || register) && (
                <View style={styles.addAchievementContainer}>
                  <TextInput
                    style={[styles.textInput, styles.multilineInput, { marginBottom: 5 }]}
                    value={newAchievement}
                    onChangeText={setNewAchievement}
                    placeholder="Add an achievement"
                    multiline
                  />
                  <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.colors.indicator }]} onPress={addAchievement}>
                    <Text style={{ textAlign: 'center', fontSize: 16, color: '#ffff' }}>Add</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={[styles.cardBody, { backgroundColor: theme.colors.card, marginBottom: 30 }]}>
              <View style={styles.sectionHeader}>
                <Icons.EvilIcons name='external-link' size={24} color={theme.colors.indicator} />
                <Text style={styles.sectionTitle}>Social Links</Text>
              </View>
              {(isEditing || register) ? (
                <View>
                  <View style={styles.socialInputGroup}>
                    <Text style={styles.socialLabel}>LinkedIn</Text>
                    <TextInput
                      style={[styles.textInput, { textTransform: 'lowercase' }]}
                      value={profile.socialLinks.linkedin}
                      onChangeText={(text) => setProfile(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, linkedin: text }
                      }))}
                      autoCapitalize='none'
                      placeholder="https://linkedin.com/in/username"
                    />
                  </View>
                  <View style={styles.socialInputGroup}>
                    <Text style={styles.socialLabel}>Twitter</Text>
                    <TextInput
                      style={[styles.textInput, { textTransform: 'lowercase' }]}
                      value={profile.socialLinks.twitter}
                      onChangeText={(text) => setProfile(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, twitter: text }
                      }))}
                      autoCapitalize='none'
                      placeholder="https://twitter.com/username"
                    />
                  </View>
                  <View style={styles.socialInputGroup}>
                    <Text style={styles.socialLabel}>GitHub</Text>
                    <TextInput
                      style={[styles.textInput, { textTransform: 'lowercase' }]}
                      value={profile.socialLinks.github}
                      onChangeText={(text) => setProfile(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, github: text }
                      }))}
                      autoCapitalize='none'
                      placeholder="https://github.com/username"
                    />
                  </View>
                  <View style={styles.socialInputGroup}>
                    <Text style={styles.socialLabel}>Website</Text>
                    <TextInput
                      style={[styles.textInput, { textTransform: 'lowercase' }]}
                      value={profile.socialLinks.website}
                      onChangeText={(text) => setProfile(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, website: text }
                      }))}
                      autoCapitalize='none'
                      placeholder="https://yourwebsite.com"
                    />
                  </View>
                  <View style={styles.socialInputGroup}>
                    <Text style={styles.socialLabel}>Instagram</Text>
                    <TextInput
                      style={[styles.textInput, { textTransform: 'lowercase' }]}
                      value={profile.socialLinks.instagram}
                      onChangeText={(text) => setProfile(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, instagram: text }
                      }))}
                      autoCapitalize='none'
                      placeholder="https://instagram.com/username"
                    />
                  </View>
                  <View style={styles.socialInputGroup}>
                    <Text style={styles.socialLabel}>Facebook</Text>
                    <TextInput
                      style={[styles.textInput, { textTransform: 'lowercase' }]}
                      value={profile.socialLinks.facebook}
                      onChangeText={(text) => setProfile(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, facebook: text }
                      }))}
                      autoCapitalize='none'
                      placeholder="https://facebook.com/username"
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.socialLinksContainer}>
                  {profile.socialLinks.linkedin && (
                    <TouchableOpacity style={styles.socialLink}>
                      <Icons.EvilIcons name='external-link' size={16} color="#0077b5" />
                      <Text style={styles.socialLinkText}>LinkedIn</Text>
                    </TouchableOpacity>
                  )}
                  {profile.socialLinks.twitter && (
                    <TouchableOpacity style={styles.socialLink}>
                      <Icons.EvilIcons name='external-link' size={16} color="#1da1f2" />
                      <Text style={styles.socialLinkText}>Twitter</Text>
                    </TouchableOpacity>
                  )}
                  {profile.socialLinks.github && (
                    <TouchableOpacity style={styles.socialLink}>
                      <Icons.EvilIcons name='external-link' size={16} color="#333" />
                      <Text style={styles.socialLinkText}>GitHub</Text>
                    </TouchableOpacity>
                  )}
                  {profile.socialLinks.website && (
                    <TouchableOpacity style={styles.socialLink}>
                      <Icons.EvilIcons name='external-link' size={16} color="#10b981" />
                      <Text style={styles.socialLinkText}>Website</Text>
                    </TouchableOpacity>
                  )}
                  {profile.socialLinks.instagram && (
                    <TouchableOpacity style={styles.socialLink}>
                      <Icons.EvilIcons name='external-link' size={16} color="#e4405f" />
                      <Text style={styles.socialLinkText}>Instagram</Text>
                    </TouchableOpacity>
                  )}
                  {profile.socialLinks.facebook && (
                    <TouchableOpacity style={styles.socialLink}>
                      <Icons.EvilIcons name='external-link' size={16} color="#1877f2" />
                      <Text style={styles.socialLinkText}>Facebook</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    marginTop: 15,
    borderBottomColor: '#e5e7eb',
  },
  headerAvatarContainer: {
    gap: 5,
    flex: 1,
    flexDirection: 'row',
    marginLeft: 10
  },
  photo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5
  },
  title: {
    fontSize: 24,
    fontWeight: '700'
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1
  },
  saveButton: {
    backgroundColor: '#003366',
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  imageOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 16,
    gap: 10
  },
  imageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 8,
    flex: 0.48,
  },
  imageOptionText: {
    marginLeft: 8,
    color: '#4F46E5',
    fontWeight: '500',
  },
  imagesPreviewContainer: {
    marginBottom: 24,
  },
  imagesPreviewTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 12,
  },
  imagesScroll: {
    flexDirection: 'row',
    padding: 8
  },
  imagePreview: {
    position: 'relative',
    marginRight: 10
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardBody: {
    marginHorizontal: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#dcdcdcff',
    marginBottom: 20,
    borderRadius: 12,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 26,
  },
  headerAvater: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  availabilityBadge: {
    // paddingHorizontal: 12,
    // paddingVertical: 6,
    // borderRadius: 16,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
  },
  fieldValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    color: '#6b7280',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  industrySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  industryChip: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  industryChipSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  industryChipText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
  },
  industryChipTextSelected: {
    color: '#030303ff',
  },
  availabilitySelector: {
    flexDirection: 'row',
    marginTop: 8,
  },
  availabilityOption: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  availabilityOptionSelected: {
    backgroundColor: '#003366',
    borderColor: '#003366',
  },
  availabilityOptionText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  availabilityOptionTextSelected: {
    color: '#ffffff',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  skillChip: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillText: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '500',
  },
  removeButton: {
    marginLeft: 6,
    padding: 2,
  },
  addSkillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addSkillInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginRight: 8,
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 14,
    flex: 1,
  },
  addAchievementContainer: {
    marginTop: 12,
  }, 
  socialInputGroup: {
    marginBottom: 12,
  },
  socialLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  socialLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  socialLinkText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    marginLeft: 6,
  },
});