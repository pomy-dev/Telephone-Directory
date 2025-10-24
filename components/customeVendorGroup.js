import React, { useState } from 'react';
import {
  Alert, FlatList, StyleSheet, TouchableOpacity, Platform,
  KeyboardAvoidingView, Animated, StatusBar, TextInput as RNTextInput, View,
  Text, Switch, Dimensions
} from 'react-native';
import { Button, Menu, Divider, TextInput, Avatar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Icons } from '../constants/Icons';
import { AppContext } from '../context/appContext';
import { AuthContext } from '../context/authProvider';

const generateId = () => `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

const CustomeVendorGroup = ({ navigation, route }) => {
  const { theme, isDarkMode } = React.useContext(AppContext);
  const { user } = React.useContext(AuthContext);
  const { vendors } = route.params;
  const [groupForm, setGroupForm] = useState({
    name: '',
    supaAdmin: !!user.email,
    supaAdminId: { generateId },
    description: '',
    category: 'Sole Trader',
    isPrivate: false,
    profileImage: null,
    members: [],
    maxMembers: 100
  });
  const [showCategoryMenu, setShowCategoryMenu] = React.useState(false);
  const [vendorSearch, setVendorSearch] = React.useState('');
  const [formErrors, setFormErrors] = React.useState({});
  const [selectedVendorId, setSelectedVendorId] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const shakeAnimation = React.useRef(new Animated.Value(0)).current;

  // Trigger shake animation on invalid submit
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  // New: Clear all selected vendors
  const handleClearVendors = () => {
    setGroupForm((prev) => ({ ...prev, members: [] }));
  };

  const categories = ['Business', 'Agriculture', 'Food & Beverages', 'Crafts', 'Technology', 'Education', 'Other'];

  const filteredVendors = vendors.filter((vendor) =>
    vendor.businessName.toLowerCase().includes(vendorSearch.toLowerCase())
  );

  const pickGroupImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setGroupForm(prev => ({ ...prev, profileImage: result.assets[0] }));
    }
  };

  // Toggle Private/Public
  const togglePrivateGroup = () => {
    setGroupForm(prev => ({ ...prev, isPrivate: !prev.isPrivate }));
  };

  // Enhanced validation
  const validateForm = () => {
    const errors = {};
    if (!groupForm.name.trim()) errors.name = 'Group name is required';
    if (!groupForm.description.trim()) errors.description = 'Description is required';
    if (!groupForm.maxMembers || groupForm.maxMembers < 1) errors.maxMembers = 'Max members must be at least 1';
    if (groupForm.members.length < 3) errors.members = 'Select at least 3 vendors';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle vendor selection with role assignment
  const handleVendorToggle = (vendor) => {
    setGroupForm((prev) => {
      const isSelected = prev.members.some((m) => m.id === vendor._id);
      if (isSelected) {
        return {
          ...prev,
          members: prev.members.filter((m) => m.id !== vendor._id),
        };
      } else {
        const mappedVendor = {
          id: vendor._id,
          vendorBusiness: vendor.businessName,
          businessType: vendor.businessType,
          vendorName: vendor.ownerName,
          vendorEmail: vendor.email,
          vendorPhone: vendor.phone,
          vendorWhatsapp: vendor.whatsapp,
          vendorArea: vendor.area,
          vendorLocation: vendor.location,
          vendorCategory: vendor.category,
          role: 'Member'
        };

        return { ...prev, members: [...prev.members, mappedVendor] };
      }
    });
  };

  // Handle role change for a vendor
  const handleRoleChange = (vendorId, role) => {
    setGroupForm((prev) => ({
      ...prev,
      members: prev.members.map((m) =>
        m.id === vendorId ? { ...m, role } : m
      ),
    }));
  };

  // Handle form submission
  const handleSubmit = () => {
    try {
      if (validateForm()) {
        setIsSubmitting(true);
        console.log(groupForm)
        // setTimeout(() => {
        //   const updatedGroup = {
        //     ...groupForm,
        //     members: [...groupForm.members, mockUser],
        //   };
        //   navigation.navigate('GroupManagement', { group: updatedGroup });
        //   Alert.alert('Success!', 'Group created successfully.');
        // }, 1000);
      } else {
        triggerShake();
      }
    } catch (err) {
      console.error(err)
    } finally {
      setGroupForm({
        name: '',
        supaAdmin: !!user.email,
        supaAdminId: generateId(),
        description: '',
        category: 'Sole Trader',
        isPrivate: false,
        profileImage: null,
        members: [],
        maxMembers: 100
      });
      setIsSubmitting(false);
      setVendorSearch('');
      setFormErrors({});
      setSelectedVendorId(null);
    }
  };

  // 1. Group Image Profile
  const renderProfilePictureInput = () => (
    <View style={[styles.groupLogo, { borderColor: theme.colors.indicator }]}>
      <TouchableOpacity style={styles.imagePicker} onPress={pickGroupImage}>
        {groupForm.profileImage ? (
          <>
            <Avatar.Image
              size={100}
              source={{ uri: groupForm.profileImage.uri }}
              style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
            />
            <Icons.MaterialIcons name="flip-camera-ios" size={20} color={theme.colors.primary} />
          </>
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.surface }]}>
            <Icons.Ionicons name="image-outline" size={40} color={theme.colors.placeholder} />
            <Text style={[styles.avatarText, { color: theme.colors.sub_text }]}>Tap to add</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  // 2. Group Name (unchanged)
  const renderGroupNameInput = () => (
    <View style={styles.inputContainer}>
      <View style={styles.inputLabelContainer}>
        <Icons.FontAwesome6 name="people-roof" size={20} color={theme.colors.primary} />
        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Group Name *</Text>
      </View>
      <RNTextInput
        placeholder="John Doe"
        value={groupForm.name}
        onChangeText={(text) => setGroupForm((prev) => ({ ...prev, name: text }))}
        style={styles.input}
        error={!!formErrors.name}
        theme={{ colors: { primary: theme.colors.primary, error: theme.colors.error } }}
        returnKeyType="next"
      />
      {formErrors.name && <Text style={[styles.errorText, { color: theme.colors.error }]}>{formErrors.name}</Text>}
    </View>
  );

  // 3. Description (unchanged)
  const renderDescriptionInput = () => (
    <View style={styles.inputContainer}>
      <View style={styles.inputLabelContainer}>
        <Icons.MaterialIcons name="description" size={20} color={theme.colors.primary} />
        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Description *</Text>
      </View>
      <RNTextInput
        placeholder="Enter description"
        value={groupForm.description}
        onChangeText={(text) => setGroupForm((prev) => ({ ...prev, description: text }))}
        multiline
        numberOfLines={3}
        style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
        error={!!formErrors.description}
        theme={{ colors: { primary: theme.colors.primary, error: theme.colors.error } }}
        returnKeyType="next"
      />
      {formErrors.description && <Text style={[styles.errorText, { color: theme.colors.error }]}>{formErrors.description}</Text>}
    </View>
  );

  // 4. Category & Max-members
  const renderCategorySelector = () => (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'center', gap: 5
    }}>
      <View style={[styles.inputContainer, { flex: 1 }]}>
        <View style={styles.inputLabelContainer}>
          <Icons.MaterialIcons name="category" size={20} color={theme.colors.primary} />
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Category *</Text>
        </View>

        <Menu
          visible={showCategoryMenu}
          onDismiss={() => setShowCategoryMenu(false)}
          anchorPosition="bottom"
          contentStyle={{
            backgroundColor: theme.colors.card,
            borderRadius: 8,
            elevation: 4,
          }}
          anchor={
            <TouchableOpacity
              style={[
                styles.menuAnchor,
                {
                  backgroundColor: '#f9fafb',
                  borderWidth: 1,
                  borderRadius: 8,
                  color: '#6b7280',
                  borderColor: '#e5e7eb',
                }
              ]}
              onPress={() => setShowCategoryMenu(true)}
              accessibilityLabel="Select category"
            >
              <Text style={{ color: groupForm.category ? theme.colors.primary : theme.colors.onSurfaceVariant }}>
                {groupForm.category || 'Select Category'}
              </Text>
              <Icons.Ionicons
                name={showCategoryMenu ? "chevron-up" : "chevron-down"}
                size={20}
                color={showCategoryMenu ? theme.colors.primary : theme.colors.text}
              />

            </TouchableOpacity>
          }
        >
          {/* Custom Header */}
          <View style={{ padding: 12, backgroundColor: theme.colors.primaryContainer }}>
            <Text variant="labelLarge" style={{ color: theme.colors.primary }}>Market Category</Text>
          </View>
          <Divider />

          {/* Custom Items with Radio Icons */}
          {categories.map((cat, index) => (
            <React.Fragment key={`${cat}-${index}`}>
              <Menu.Item
                key={cat}
                leadingIcon={groupForm.category === cat ? 'check-circle' : 'circle-outline'} // Use your Icons constant
                onPress={() => {
                  setGroupForm(prev => ({ ...prev, category: cat }));
                  setShowCategoryMenu(false);
                }}
                title={cat}
                titleStyle={{ fontWeight: groupForm.category === cat ? 'bold' : 'normal' }}
              />
              {index < categories.length - 1 && <Divider />}
            </React.Fragment>
          ))}

          {/* Custom Footer */}
          <Divider />
          <View style={{ padding: 8, alignItems: 'flex-end' }}>
            <Button compact onPress={() => setShowCategoryMenu(false)}>Cancel</Button>
          </View>
        </Menu>
      </View>

      <View style={[styles.inputContainer, { flex: 1 }]}>
        <View style={styles.inputLabelContainer}>
          <Icons.MaterialIcons name="people-alt" size={20} color={theme.colors.primary} />
          <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Max Members *</Text>
        </View>
        <RNTextInput
          placeholder="Enter max members"
          value={groupForm.maxMembers}
          onChangeText={(text) =>
            setGroupForm((prev) => ({ ...prev, maxMembers: parseInt(text) || '' }))
          }
          keyboardType="numeric"
          style={styles.input}
          error={!!formErrors.maxMembers}
          theme={{ colors: { primary: theme.colors.primary, error: theme.colors.error } }}
          accessibilityLabel="Max members input"
        />
        {formErrors.maxMembers && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{formErrors.maxMembers}</Text>
        )}
      </View>
    </View>
  );

  // 5. Private/Public Toggle
  const renderPrivacyToggle = () => (
    <View style={styles.inputContainer}>
      <View style={styles.inputLabelContainer}>
        <Icons.MaterialIcons name="security" size={20} color={theme.colors.primary} />
        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Group Visibility</Text>
      </View>
      <View style={styles.toggleContainer}>
        <Text style={{ color: theme.colors.text, marginRight: 12 }}>
          {groupForm.isPrivate ? 'Private' : 'Public'}
        </Text>
        <Switch
          value={groupForm.isPrivate}
          onValueChange={togglePrivateGroup}
          trackColor={{ false: '#D1D5DB', true: '#60A5FA' }}
          thumbColor={groupForm.isPrivate ? '#FBBF24' : '#FFFFFF'}
          style={{ transform: [{ scale: 0.85 }], }}
        />
      </View>
      <Text style={[styles.helperText, { color: theme.colors.placeholder }]}>
        {groupForm.isPrivate
          ? 'Only invited members can join'
          : 'Anyone can join and discover this group'
        }
      </Text>
    </View>
  );

  // 7. Enhanced Vendor Selection
  const renderVendorSelection = () => (
    <View style={styles.inputContainer}>
      <View style={styles.inputLabelContainer}>
        <Icons.MaterialIcons name="store" size={20} color={theme.colors.primary} />
        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
          Add Vendors (min 3) * <Text style={styles.vendorCount}>({groupForm.members.length} selected)</Text>
        </Text>
        {groupForm.members.length > 0 && (
          <TouchableOpacity onPress={handleClearVendors} style={styles.clearButton}>
            <Text style={[styles.clearButtonText, { color: theme.colors.primary }]}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      <TextInput
        placeholder="Search vendors..."
        value={vendorSearch}
        onChangeText={setVendorSearch}
        style={[styles.input, styles.searchInput]}
        mode="outlined"
        left={
          <TextInput.Icon
            icon="magnify"
            color={theme.colors.placeholder}
            size={20}
          />
        }
        theme={{ colors: { primary: theme.colors.primary } }}
        accessibilityLabel="Search vendors input"
      />

      <FlatList
        data={filteredVendors}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.vendorItem,
              groupForm.members.some((m) => m.id === item._id) && styles.selectedVendor,
              { borderColor: theme.colors.border, backgroundColor: theme.colors.card },
            ]}
          >
            <TouchableOpacity
              style={styles.vendorInfo}
              onPress={() => handleVendorToggle(item)}
              accessibilityLabel={`Select ${item.businessName}`}
            >
              {(item.avata !== null || item.avatar !== '') ? (
                <Avatar.Image
                  size={60}
                  source={{ uri: item.avatar }}
                  style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
                />
              ) : (
                <Icons.Ionicons name="person-circle-outline" size={40} color={theme.colors.indicator} />
              )}
              <View style={{}}>
                <Text style={[styles.vendorName, { color: theme.colors.text }]}>{item.businessName}</Text>
                <Text style={[styles.vendorDetail, { color: theme.colors.placeholder }]}>
                  {item.businessType} - {item.area?.slice(0, 8) + `...`}
                </Text>
              </View>
            </TouchableOpacity>
            {
              groupForm.members.some((m) => m.id === item._id) && (
                <>
                  <Icons.MaterialIcons name="check-circle" size={20} color={theme.colors.success} style={styles.checkedVendor} />
                  <Menu
                    visible={selectedVendorId === item._id}
                    onDismiss={() => setSelectedVendorId(null)}
                    contentStyle={{
                      position: 'absolute',
                      right: 5,
                      bottom: 5
                    }}
                    anchor={
                      <TouchableOpacity
                        onPress={() => setSelectedVendorId(item._id)}
                        style={[styles.roleSelector, { borderColor: theme.colors.border }]}
                        accessibilityLabel={`Select role for ${item.businessName}`}
                      >
                        <Text style={{ color: theme.colors.text }}>
                          {groupForm.members.find((m) => m.id === item._id)?.role}
                        </Text>
                        <Icons.Ionicons
                          name={selectedVendorId === item._id ? "chevron-up" : "chevron-down"}
                          size={16}
                          color={theme.colors.text}
                        />
                      </TouchableOpacity>
                    }
                  >
                    {['Member', 'Moderator'].map((role) => (
                      <Menu.Item
                        key={role}
                        onPress={() => {
                          handleRoleChange(item._id, role);
                          setSelectedVendorId(null);
                        }}
                        title={role}
                      />
                    ))}
                  </Menu>
                </>
              )
            }
          </View >
        )}
        style={styles.vendorList}
        showsVerticalScrollIndicator={false}
      />
      {
        formErrors.members && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{formErrors.members}</Text>
        )
      }
    </View >
  );

  const renderFormActions = () => (
    <View style={styles.modalActions}>
      <Button
        mode="outlined"
        onPress={() => setShowCreateGroup(false)}
        style={[styles.actionButton, styles.cancelButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.sub_card }]}
        theme={{ colors: { primary: theme.colors.indicator } }}
        accessibilityLabel="Cancel group creation"
      >
        Cancel
      </Button>
      <Button
        mode="contained"
        onPress={handleSubmit}
        style={[styles.actionButton, styles.submitButton]}
        theme={{ colors: { primary: theme.colors.indicator } }}
        disabled={Object.keys(formErrors).length > 0 || isSubmitting}
        loading={isSubmitting}
        accessibilityLabel="Create group"
      >
        Create Group
      </Button>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      <View style={[styles.header, { borderColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icons.Ionicons name='arrow-back' size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>New Group</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Animated.View style={[styles.bottomSheetContent, { transform: [{ translateX: shakeAnimation }] }]}>
          <FlatList
            data={[1, 2, 3, 4, 5, 6]}
            keyExtractor={(item) => item.toString()}
            renderItem={({ index }) => (
              <View>
                {index === 0 && renderProfilePictureInput()}
                {index === 1 && renderGroupNameInput()}
                {index === 2 && renderDescriptionInput()}
                {index === 3 && renderCategorySelector()}
                {index === 4 && renderPrivacyToggle()}
                {index === 5 && renderVendorSelection()}
              </View>
            )}
            showsVerticalScrollIndicator={false}
            // contentContainerStyle={styles.formContent}
            ListFooterComponent={renderFormActions()}
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  )
}

export default CustomeVendorGroup

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 30,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    top: 35
  },
  headerTitle: {
    marginLeft: '30%',
    fontSize: 24,
    fontWeight: 'bold',
  },
  bottomSheetContent: {
    paddingHorizontal: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 5,
  },
  inputContainer: {
    marginBottom: 16,
  },
  groupLogo: {
    borderWidth: 2,
    borderRadius: 8,
    borderCurve: 'circular',
    borderStyle: 'dashed',
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginVertical: 20
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  vendorCount: {
    fontSize: 14,
    color: '#666',
  },
  clearButton: {
    marginLeft: 'auto',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  menuAnchor: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    justifyContent: 'space-between'
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    color: '#6b7280',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    fontSize: 16,
  },
  searchInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    color: '#6b7280',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    height: 56,
    backgroundColor: '#F8FAFC',
  },
  activeCategorySelector: {
    borderWidth: 2,
    backgroundColor: '#E6F0FA',
  },
  vendorList: {
    maxHeight: 280,
  },
  vendorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 8,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  selectedVendor: {
    borderColor: '#2563EB',
    backgroundColor: '#E6F0FA',
  },
  vendorInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  vendorDetail: {
    fontSize: 13,
    marginTop: 4,
  },
  checkedVendor: {
    position: 'absolute',
    top: 3,
    right: 5
  },
  roleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#F8FAFC',
  },
  errorText: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 5,
  },
  imagePicker: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  helperText: {
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  addVendorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 12,
  },
  addVendorText: {
    color: 'white',
    marginLeft: 4,
    fontWeight: '500',
  },
  selectedVendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  vendorCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  vendorCardInfo: {
    marginLeft: 12,
    flex: 1,
  },
  vendorCardName: {
    fontSize: 16,
    fontWeight: '600',
  },
  vendorCardDetail: {
    fontSize: 13,
    marginTop: 2,
  },
  vendorRole: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  removeVendor: {
    padding: 4,
  },
  selectedVendorsList: {
    maxHeight: 200,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 4,
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
})