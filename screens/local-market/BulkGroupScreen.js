import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  StatusBar,
  TextInput,
  View,
  Dimensions
} from 'react-native';
import {
  Portal,
  Modal,
  Badge,
  Button,
  Menu,
  Card,
  Chip,
  FAB,
  Text,
} from 'react-native-paper';
import Carousel from 'react-native-reanimated-carousel';
import { Icons } from '../../constants/Icons';
import { mockBulkGroups, mockSuppliers } from '../../utils/mockData';
import { AppContext } from '../../context/appContext';

const { width: screenWidth } = Dimensions.get('window');

export default function BulkGroupsScreen({ navigation }) {
  const { theme, isDarkMode } = React.useContext(AppContext);
  const [bulkGroups, setBulkGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [selectedTab, setSelectedTab] = useState('available');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    category: 'Sole Trader',
    isPrivate: false,
    members: [],
    maxMembers: 100
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false); // For loading state
  const shakeAnimation = React.useRef(new Animated.Value(0)).current; // For shake animation on invalid submit

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

  const mockUser = { id: 'user1', name: 'Current User', role: 'Admin' };
  const categories = ['Business', 'Agriculture', 'Food & Beverages', 'Crafts', 'Technology', 'Education', 'Other'];

  useEffect(() => {
    setBulkGroups(mockBulkGroups);
    // Simulate user's joined groups
    setUserGroups([mockBulkGroups[0]]);
  }, []);

  const handleJoinGroup = (group) => {
    Alert.alert(
      'Join Bulk Group',
      `Join "${group.name}"?\n\nBenefits:\n${group.benefits.join('\n')}\n\nRequirements: ${group.requirements}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join Group',
          onPress: () => {
            navigation.navigate('GroupManagement')
            Alert.alert('Success!', 'You have successfully joined the bulk buying group. You will receive notifications about upcoming orders.');
          }
        }
      ]
    );
  };

  const handleCreateGroup = () => {
    Alert.alert(
      'Create Bulk Group',
      'Start your own bulk buying group to get better prices with other vendors.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create Group',
          onPress: () => {
            setShowCreateGroup(true)
          }
        }
      ]
    );

  };

  const handleViewSuppliers = () => {
    Alert.alert(
      'Suppliers',
      'View available suppliers for bulk orders.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Suppliers', onPress: () => console.log('View suppliers') }
      ]
    );
  };

  const renderGroupCard = ({ item, isUserGroup = false }) => (
    <Card style={[styles.groupCard, { backgroundColor: theme.colors.card }]}>
      <Card.Content>
        <View style={styles.groupHeader}>
          <View style={styles.groupInfo}>
            <Text style={styles.groupName}>{item.name}</Text>
            <Text style={[styles.groupCategory, { color: theme.colors.placeholder }]}>{item.category}</Text>
            <View style={styles.groupStats}>
              <View style={styles.statItem}>
                <Icons.Ionicons name="people" size={16} color={theme.colors.primary} />
                <Text style={[styles.statText, { color: theme.colors.placeholder }]}>{item.memberCount} members</Text>
              </View>
              <View style={styles.statItem}>
                <Icons.Ionicons name="cash" size={16} color={theme.colors.success} />
                <Text style={[styles.statText, { color: theme.colors.placeholder }]}>{item.savings}% savings</Text>
              </View>
            </View>
          </View>
          {isUserGroup && (
            <Badge style={[styles.joinedBadge, { backgroundColor: theme.colors.success }]}>Joined</Badge>
          )}
        </View>

        <Text style={[styles.groupDescription, { color: theme.colors.text }]}>
          {item.description}
        </Text>

        <View style={styles.groupDetails}>
          <View style={styles.detailRow}>
            <Icons.Ionicons name="location-outline" size={16} color={theme.colors.primary} />
            <Text style={[styles.detailText, { color: theme.colors.placeholder }]}>Area: {item.area}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icons.Ionicons name="calendar-outline" size={16} color={theme.colors.primary} />
            <Text style={[styles.detailText, { color: theme.colors.placeholder }]}>Next Order: {item.nextOrderDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icons.Ionicons name="receipt-outline" size={16} color={theme.colors.primary} />
            <Text style={[styles.detailText, { color: theme.colors.placeholder }]}>Min Order: E{item.minOrder}</Text>
          </View>
        </View>

        <View style={styles.benefitsContainer}>
          <Text style={[styles.benefitsTitle, { color: theme.colors.text }]}>Benefits:</Text>
          <View style={styles.benefitsList}>
            {item.benefits.map((benefit, index) => (
              <Chip key={index} style={[styles.benefitChip, { backgroundColor: '#F8FAFC' }]} compact>
                {benefit}
              </Chip>
            ))}
          </View>
        </View>

        {isUserGroup ? (
          <View style={styles.groupActions}>
            <TouchableOpacity
              mode="outlined"
              onPress={() => Alert.alert('Group Details', 'View group details and manage orders')}
              style={[styles.actionButton, { backgroundColor: theme.colors.indicator }]}
            >
              <Text style={{ color: '#ccc', textAlign: 'center' }}>Manage Group</Text>

            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert('Place Order', 'Place order for next bulk purchase')}
              style={[styles.actionButton, { backgroundColor: theme.colors.indicator }]}
            >
              <Text style={{ color: '#ccc', textAlign: 'center' }}>View Updates</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => handleJoinGroup(item)}
            style={[styles.joinButton, { backgroundColor: theme.colors.indicator }]}
          >
            <Text style={{ color: '#ccc', textAlign: 'center' }}>Join Group</Text>
          </TouchableOpacity>
        )}
      </Card.Content>
    </Card>
  );

  const renderSupplierCard = ({ item }) => (
    <Card style={[styles.supplierCard, { backgroundColor: theme.colors.card }]}>
      {/* Image background using vendor logo/profileImage */}
      <ImageBackground
        source={{ uri: item.profileImage || item.logo }}
        style={styles.cardImage}
        imageStyle={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
        resizeMode="cover"
      >
        <View style={styles.supplierOverlay}>
          <View style={styles.supplierHeaderTop}>
            <View style={styles.supplierTitleWrap}>
              <Text style={[styles.supplierNameOverlay, { color: '#fff' }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Chip style={styles.supplierTypeOverlay} compact mode="flat">
                {item.type}
              </Chip>
            </View>

            <Badge style={[styles.ratingBadge, { backgroundColor: theme.colors.success }]}>
              {item.rating}
            </Badge>
          </View>

          <Text style={[styles.supplierShortDesc, { color: 'rgba(255,255,255,0.9)' }]} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </ImageBackground>

      <Card.Content>
        <View style={styles.supplierDetails}>
          <View style={styles.detailRow}>
            <Icons.Ionicons name="location-outline" size={16} color={theme.colors.primary} />
            <Text style={[styles.detailText, { color: theme.colors.placeholder }]}>{item.location}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icons.Feather name="phone" size={16} color={theme.colors.primary} />
            <Text style={[styles.detailText, { color: theme.colors.placeholder }]}>{item.contact.phone}</Text>
          </View>
        </View>

        {/* Auto sliding adverts carousel */}
        <View style={styles.carouselContainer}>
          {item.deals && item.deals.length > 0 ? (
            <Carousel
              width={screenWidth - 60}
              height={180}
              loop
              autoPlay
              autoPlayInterval={3000}
              data={item.deals}
              scrollAnimationDuration={800}
              style={{ alignSelf: 'center' }}
              renderItem={({ item: ad }) => (
                <Card style={[styles.adCard, { width: screenWidth - 60 }]}>
                  <Image
                    source={{ uri: ad.image }}
                    style={styles.adImage}
                    resizeMode="cover"
                  />
                  <Card.Content>
                    <Text style={styles.adTitle}>{ad.title}</Text>
                    <Text style={styles.adDesc} numberOfLines={2}>{ad.desc}</Text>
                  </Card.Content>
                </Card>
              )}
            />
          ) : (
            <View style={styles.noAds}>
              <Text style={{ color: theme.colors.placeholder }}>No adverts available</Text>
            </View>
          )}
        </View>

        <View style={styles.entityActions}>
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Contact Supplier', `Contact ${item.name} for bulk orders`)}
            style={styles.contactButton}
          >
            Contact Supplier
          </Button>

          <Button
            mode="outlined"
            onPress={() => Alert.alert('Order', `Place an order with ${item.name}`)}
            style={styles.contactButton}
          >
            View Catelog
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderTabContent = () => {
    if (selectedTab === 'available') {
      return (
        <FlatList
          data={bulkGroups}
          renderItem={({ item }) => renderGroupCard({ item })}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      );
    } else if (selectedTab === 'my-groups') {
      return (
        <View>
          {userGroups.length > 0 ? (
            <FlatList
              data={userGroups}
              renderItem={({ item }) => renderGroupCard({ item, isUserGroup: true })}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Icons.Ionicons name="people-outline" size={64} color={theme.colors.disabled} />
              <Text style={[styles.emptyTitle, { color: theme.colors.placeholder }]}>No Groups Joined</Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.placeholder, }]}>
                Join bulk buying groups to get better prices and connect with other vendors
              </Text>
              <Button
                mode="contained"
                onPress={() => setSelectedTab('available')}
                style={styles.emptyActionButton}
              >
                Browse Groups
              </Button>
            </View>
          )}
        </View>
      );
    } else {
      return (
        <FlatList
          data={mockSuppliers}
          renderItem={renderSupplierCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      );
    }
  };
  // ==========================================================
  const filteredVendors = mockSuppliers.filter((vendor) =>
    vendor.name.toLowerCase().includes(vendorSearch.toLowerCase())
  );

  // Handle vendor selection with role assignment
  const handleVendorToggle = (vendor) => {
    setGroupForm((prev) => {
      const isSelected = prev.members.some((m) => m.id === vendor.id);
      if (isSelected) {
        return {
          ...prev,
          members: prev.members.filter((m) => m.id !== vendor.id),
        };
      } else {
        return {
          ...prev,
          members: [...prev.members, { ...vendor, role: 'Member' }],
        };
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

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!groupForm.name.trim()) errors.name = 'Group name is required';
    if (!groupForm.description.trim()) errors.description = 'Description is required';
    if (!groupForm.maxMembers || groupForm.maxMembers < 1)
      errors.maxMembers = 'Max members must be at least 1';
    if (groupForm.members.length < 3) errors.members = 'Select at least 3 vendors';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      // Add creator as Admin
      const updatedGroup = {
        ...groupForm,
        members: [...groupForm.members, mockUser],
      };
      setShowCreateGroup(false);
      navigation.navigate('GroupManagement', { group: updatedGroup });
      Alert.alert('Success!', 'Group created successfully.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      <View style={[styles.header, { borderColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icons.Ionicons name='arrow-back' size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Bulk Buying Groups</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.sub_text }]}>
          Join groups to get better prices on bulk orders
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'available' && styles.activeTab, { borderColor: theme.colors.border }]}
            onPress={() => setSelectedTab('available')}
          >
            <Text style={[styles.tabText, selectedTab === 'available' && styles.activeTabText, {
              color: theme.colors.placeholder
            }]}>
              Available Groups
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'my-groups' && styles.activeTab, { borderColor: theme.colors.border }]}
            onPress={() => setSelectedTab('my-groups')}
          >
            <Text style={[styles.tabText, selectedTab === 'my-groups' && styles.activeTabText, {
              color: theme.colors.placeholder
            }]}>
              My Groups ({userGroups.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'suppliers' && styles.activeTab, { borderColor: theme.colors.border }]}
            onPress={() => setSelectedTab('suppliers')}
          >
            <Text style={[styles.tabText, selectedTab === 'suppliers' && styles.activeTabText, {
              color: theme.colors.placeholder
            }]}>
              Suppliers
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </View>

      {renderTabContent()}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.sub_card }]}
        onPress={handleCreateGroup}
        label="Create Group"
      />

      <Portal>
        <Modal
          visible={showCreateGroup}
          onDismiss={() => setShowCreateGroup(false)}
          contentContainerStyle={[styles.bottomSheet, { backgroundColor: theme.colors.background }]}
          animationType="slide"
          theme={{ colors: { backdrop: 'rgba(0, 0, 0, 0.5)' } }}
        >
          <Animated.View style={[styles.bottomSheetContent, { transform: [{ translateX: shakeAnimation }] }]}>
            <View style={[styles.handle, { backgroundColor: theme.colors.placeholder }]} />
            <Text style={[styles.modalTitle, { color: theme.colors.text }]} accessibilityLabel="Create New Bulk Buying Group">
              Create New Bulk Buying Group
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Group Name */}
              <View style={styles.inputContainer}>
                <View style={styles.inputLabelContainer}>
                  <Icons.MaterialIcons name="group" size={20} color={theme.colors.primary} />
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Group Name *</Text>
                </View>
                <TextInput
                  label="Enter group name"
                  value={groupForm.name}
                  onChangeText={(text) => setGroupForm((prev) => ({ ...prev, name: text }))}
                  mode="outlined"
                  style={styles.input}
                  error={!!formErrors.name}
                  theme={{ colors: { primary: theme.colors.primary, error: theme.colors.error } }}
                  accessibilityLabel="Group name input"
                />
                {formErrors.name && (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>{formErrors.name}</Text>
                )}
              </View>

              {/* Description */}
              <View style={styles.inputContainer}>
                <View style={styles.inputLabelContainer}>
                  <Icons.MaterialIcons name="description" size={20} color={theme.colors.primary} />
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Description *</Text>
                </View>
                <TextInput
                  label="Enter description"
                  value={groupForm.description}
                  onChangeText={(text) => setGroupForm((prev) => ({ ...prev, description: text }))}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                  error={!!formErrors.description}
                  theme={{ colors: { primary: theme.colors.primary, error: theme.colors.error } }}
                  accessibilityLabel="Group description input"
                />
                {formErrors.description && (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>{formErrors.description}</Text>
                )}
              </View>

              {/* Category Selector */}
              <View style={styles.inputContainer}>
                <View style={styles.inputLabelContainer}>
                  <Icons.MaterialIcons name="category" size={20} color={theme.colors.primary} />
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Category *</Text>
                </View>
                <Menu
                  visible={showCategoryMenu}
                  onDismiss={() => setShowCategoryMenu(false)}
                  anchor={
                    <TouchableOpacity
                      onPress={() => setShowCategoryMenu(true)}
                      style={[
                        styles.categorySelector,
                        { borderColor: showCategoryMenu ? theme.colors.primary : theme.colors.border },
                        showCategoryMenu && styles.activeCategorySelector,
                      ]}
                      accessibilityLabel="Select category"
                    >
                      <Text style={{ color: theme.colors.text }}>{groupForm.category}</Text>
                      <Icons.Ionicons
                        name={showCategoryMenu ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={showCategoryMenu ? theme.colors.primary : theme.colors.text}
                      />
                    </TouchableOpacity>
                  }
                >
                  {categories.map((category) => (
                    <Menu.Item
                      key={category}
                      onPress={() => {
                        setGroupForm((prev) => ({ ...prev, category }));
                        setShowCategoryMenu(false);
                      }}
                      title={category}
                    />
                  ))}
                </Menu>
              </View>

              {/* Max Members */}
              <View style={styles.inputContainer}>
                <View style={styles.inputLabelContainer}>
                  <Icons.MaterialIcons name="people-alt" size={20} color={theme.colors.primary} />
                  <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Max Members *</Text>
                </View>
                <TextInput
                  label="Enter max members"
                  value={groupForm.maxMembers.toString()}
                  onChangeText={(text) =>
                    setGroupForm((prev) => ({ ...prev, maxMembers: parseInt(text) || '' }))
                  }
                  mode="outlined"
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

              {/* Vendor Selection */}
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
                  left={<TextInput.Icon icon={() => <Icons.MaterialIcons name="search" size={20} color={theme.colors.placeholder} />} />}
                  theme={{ colors: { primary: theme.colors.primary } }}
                  accessibilityLabel="Search vendors input"
                />
                <FlatList
                  data={filteredVendors}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <View
                      style={[
                        styles.vendorItem,
                        groupForm.members.some((m) => m.id === item.id) && styles.selectedVendor,
                        { borderColor: theme.colors.border },
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.vendorInfo}
                        onPress={() => handleVendorToggle(item)}
                        accessibilityLabel={`Select ${item.name}`}
                      >
                        <View style={styles.vendorInfoContent}>
                          <Text style={[styles.vendorName, { color: theme.colors.text }]}>{item.name}</Text>
                          <Text style={[styles.vendorDetail, { color: theme.colors.placeholder }]}>
                            {item.type} - {item.location}
                          </Text>
                        </View>
                        {groupForm.members.some((m) => m.id === item.id) && (
                          <Icons.MaterialIcons name="check-circle" size={20} color={theme.colors.success} />
                        )}
                      </TouchableOpacity>
                      {groupForm.members.some((m) => m.id === item.id) && (
                        <Menu
                          visible={selectedVendorId === item.id}
                          onDismiss={() => setSelectedVendorId(null)}
                          anchor={
                            <TouchableOpacity
                              onPress={() => setSelectedVendorId(item.id)}
                              style={[styles.roleSelector, { borderColor: theme.colors.border }]}
                              accessibilityLabel={`Select role for ${item.name}`}
                            >
                              <Text style={{ color: theme.colors.text }}>
                                {groupForm.members.find((m) => m.id === item.id)?.role}
                              </Text>
                              <Icons.Ionicons
                                name={selectedVendorId === item.id ? "chevron-up" : "chevron-down"}
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
                                handleRoleChange(item.id, role);
                                setSelectedVendorId(null);
                              }}
                              title={role}
                            />
                          ))}
                        </Menu>
                      )}
                    </View>
                  )}
                  style={styles.vendorList}
                  showsVerticalScrollIndicator={false}
                />
                {formErrors.members && (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>{formErrors.members}</Text>
                )}
              </View>

              {/* Form Actions */}
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowCreateGroup(false)}
                  style={[styles.actionButton, styles.cancelButton]}
                  theme={{ colors: { primary: theme.colors.primary } }}
                  accessibilityLabel="Cancel group creation"
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={[styles.actionButton, styles.submitButton]}
                  theme={{ colors: { primary: theme.colors.primary } }}
                  disabled={Object.keys(formErrors).length > 0 || isSubmitting}
                  loading={isSubmitting}
                  accessibilityLabel="Create group"
                >
                  Create Group
                </Button>
              </View>
            </ScrollView>
          </Animated.View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    top: 35
  },
  headerTitle: {
    marginLeft: '20%',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    opacity: 0.9,
    marginTop: 4,
    marginLeft: '10%',
  },
  tabContainer: {
    paddingVertical: 12,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: '#F0F4FF'
  },
  activeTab: {
    backgroundColor: "#003366"
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#ffffff',
  },
  listContainer: {
    padding: 10,
    paddingBottom: 100,
  },
  groupCard: {
    marginBottom: 16,
    elevation: 4,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  groupCategory: {
    fontSize: 14,
    marginBottom: 8,
  },
  groupStats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  joinedBadge: {
    color: 'white',
  },
  groupDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  groupDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    marginLeft: 8,
  },
  benefitsContainer: {
    marginBottom: 16,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  benefitsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  benefitChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  groupActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  joinButton: {
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  supplierCard: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardImage: {
    height: 160,
    width: '100%',
    justifyContent: 'flex-end',
  },
  supplierOverlay: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  supplierHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  supplierTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supplierNameOverlay: {
    fontSize: 16,
    fontWeight: '700',
    maxWidth: '75%',
  },
  supplierTypeOverlay: {
    marginLeft: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: '#fff',
  },
  supplierShortDesc: {
    marginTop: 6,
    fontSize: 13,
  },
  carouselContainer: {
    alignItems: 'center',
  },
  adCard: {
    borderRadius: 8,
  },
  adImage: {
    width: '100%',
    height: 100,
  },
  adTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
  adDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  noAds: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supplierDetails: {
    marginTop: 12,
    marginBottom: 8,
  },
  entityActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactButton: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyActionButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    marginHorizontal: 16,
    marginVertical: 60,
    right: 0,
    bottom: 0,
  },

  // =========================================================
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: Dimensions.get('window').height * 0.9,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    paddingTop: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  handle: {
    width: 50,
    height: 6,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  bottomSheetContent: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
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
  input: {
    backgroundColor: 'transparent',
  },
  searchInput: {
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
    maxHeight: 240,
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
  vendorInfoContent: {
    flex: 1,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  vendorDetail: {
    fontSize: 13,
    marginTop: 4,
  },
  roleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
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
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 4,
  },
  cancelButton: {
    borderWidth: 2,
  },
  submitButton: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
