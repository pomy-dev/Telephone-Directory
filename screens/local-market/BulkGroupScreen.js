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
  Platform,
  KeyboardAvoidingView,
  Animated,
  TextInput as RNTextInput, // Rename to avoid conflict
  View,
  Text,
  Switch,
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
  Divider,
  FAB,
  TextInput,
  Avatar,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import Carousel from 'react-native-reanimated-carousel';
import { Icons } from '../../constants/Icons';
import { mockBulkGroups, mockSuppliers } from '../../utils/mockData';
import { AppContext } from '../../context/appContext';

const { width: screenWidth } = Dimensions.get('window');

export default function BulkGroupsScreen({ navigation, route }) {
  const { theme, isDarkMode } = React.useContext(AppContext);
  const { vendors } = route.params;
  const [bulkGroups, setBulkGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [selectedTab, setSelectedTab] = useState('available');

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
            navigation.navigate('GroupForm', { vendors: vendors });
          }
        }
      ]
    );
    console.log('vendors in group screen: ', vendors.length)
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
  }
});
