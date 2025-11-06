import { Icons } from '../../constants/Icons';
import React, { useEffect, useState, useContext } from 'react';
import {
  Alert,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity
} from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Chip,
  FAB,
  List,
  Modal,
  Text,
  Portal,
  Switch,
  TextInput
} from 'react-native-paper';
import { mockVendors } from '../../utils/mockData';
import { AppContext } from '../../context/appContext';

export default function VendorProfileScreen({ navigation }) {
  const [userProfile, setUserProfile] = useState({
    name: 'John Mkhonta',
    email: 'john.mkhonta@email.com',
    phone: '+268 2400 1234',
    userType: 'customer',
    location: 'Mbabane Industrial Area',
    isVendor: false,
    businessProfile: null,
  });
  const [isOnline, setIsOnline] = useState(true);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const { theme, isDarkMode } = useContext(AppContext);
  const [newStockItem, setNewStockItem] = useState({ item: '', price: '', unit: '', available: true });

  useEffect(() => {
    // Check if user has business profile
    const businessProfile = mockVendors.find(v => v.ownerName === userProfile.name);
    if (businessProfile) {
      setUserProfile(prev => ({ ...prev, businessProfile, isVendor: true }));
    }
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => navigation.navigate('VendorLogin') }
      ]
    );
  };

  const handleSwitchToVendor = () => {
    if (!userProfile.isVendor) {
      navigation.navigate('AddVendor');
    }
  };

  const handleUpdateStock = () => {
    if (!newStockItem.item || !newStockItem.price) {
      Alert.alert('Error', 'Please fill in item name and price');
      return;
    }

    Alert.alert(
      'Stock Updated',
      `${newStockItem.item} has been added to your stock`,
      [
        {
          text: 'OK',
          onPress: () => {
            setStockModalVisible(false);
            setNewStockItem({ item: '', price: '', unit: '', available: true });
          }
        }
      ]
    );
  };

  const handleToggleAvailability = (itemIndex) => {
    Alert.alert(
      'Toggle Availability',
      'Mark this item as unavailable?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Update', onPress: () => console.log('Toggle availability') }
      ]
    );
  };

  const renderCustomerProfile = () => (
    <View>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[styles.cardTitle, { color: theme.colors.primary }]}>Account Information</Text>
          <List.Item
            title="Full Name"
            description={userProfile.name}
            left={() => <List.Icon icon="account" />}
          />
          <List.Item
            title="Email"
            description={userProfile.email}
            left={() => <List.Icon icon="email" />}
          />
          <List.Item
            title="Phone"
            description={userProfile.phone}
            left={() => <List.Icon icon="phone" />}
          />
          <List.Item
            title="Location"
            description={userProfile.location}
            left={() => <List.Icon icon="map-marker" />}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={[styles.cardTitle, { color: theme.colors.primary }]}>Quick Actions</Text>
          <Button
            mode="outlined"
            onPress={handleSwitchToVendor}
            style={styles.actionButton}
            icon="store"
          >
            Become a Vendor
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('BulkGroupsScreen')}
            style={styles.actionButton}
            icon="group"
          >
            Join Bulk Groups
          </Button>
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Support', 'Contact support for help')}
            style={styles.actionButton}
            icon="help-circle"
          >
            Get Support
          </Button>
        </Card.Content>
      </Card>
    </View>
  );

  const renderVendorProfile = () => (
    <View>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.vendorHeader}>
            <Avatar.Image
              size={80}
              source={{ uri: userProfile.businessProfile.profileImage }}
              style={styles.businessAvatar}
            />
            <View style={styles.businessInfo}>
              <Text style={styles.businessName}>{userProfile.businessProfile.name}</Text>
              <Text style={[styles.businessType, { color: theme.colors.placeholder }]}>{userProfile.businessProfile.type}</Text>
              <View style={styles.businessStats}>
                <View style={styles.statItem}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={[styles.statText, { color: theme.colors.placeholder }]}>{userProfile.businessProfile.rating}</Text>
                </View>
                <View style={[styles.statItem, { color: theme.colors.placeholder }]}>
                  <Ionicons name="people" size={16} color={theme.colors.primary} />
                  <Text style={styles.statText}>{userProfile.businessProfile.reviewCount} reviews</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.onlineStatus, { backgroundColor: theme.colors.surface }]}>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              color={theme.colors.primary}
            />
            <Text style={styles.onlineText}>
              {isOnline ? 'Online - Accepting Orders' : 'Offline - Not Accepting Orders'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={[styles.cardTitle, { color: theme.colors.primary }]}>Business Information</Text>
          <List.Item
            title="Business Name"
            description={userProfile.businessProfile.name}
            left={() => <List.Icon icon="store" />}
          />
          <List.Item
            title="Category"
            description={userProfile.businessProfile.category}
            left={() => <List.Icon icon="tag" />}
          />
          <List.Item
            title="Location"
            description={userProfile.businessProfile.location.area}
            left={() => <List.Icon icon="map-marker" />}
          />
          <List.Item
            title="Delivery Radius"
            description={`${userProfile.businessProfile.deliveryRadius} km`}
            left={() => <List.Icon icon="car" />}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.stockHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.primary }]}>Current Stock</Text>
            <Button
              mode="contained"
              onPress={() => setStockModalVisible(true)}
              compact
              icon="plus"
            >
              Add Item
            </Button>
          </View>

          {userProfile.businessProfile.stock.map((item, index) => (
            <View key={index} style={[styles.stockItem, { borderBottomColor: theme.colors.surface }]}>
              <View style={styles.stockInfo}>
                <Text style={styles.stockName}>{item.item}</Text>
                <Text style={[styles.stockPrice, { color: theme.colors.placeholder }]}>E{item.price} / {item.unit}</Text>
              </View>
              <Chip
                style={[
                  styles.availabilityChip,
                  { backgroundColor: item.available ? theme.colors.success : theme.colors.error }
                ]}
                textStyle={styles.availabilityText}
                onPress={() => handleToggleAvailability(index)}
              >
                {item.available ? 'Available' : 'Out of Stock'}
              </Chip>
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={[styles.cardTitle, { color: theme.colors.primary }]}>Business Actions</Text>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('BulkGroups')}
            style={styles.actionButton}
            icon="people"
          >
            Manage Bulk Groups
          </Button>
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Analytics', 'View your business analytics')}
            style={styles.actionButton}
            icon="chart-line"
          >
            View Analytics
          </Button>
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Orders', 'View your orders')}
            style={styles.actionButton}
            icon="receipt"
          >
            Manage Orders
          </Button>
        </Card.Content>
      </Card>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>

      {/* header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icons.Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <Avatar.Text
            size={40}
            label={userProfile.name.split(' ').map(n => n[0]).join('')}
            style={[styles.profileAvatar, { backgroundColor: theme.colors.primary }]}
          />

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userProfile.name}</Text>
            <Text style={[styles.profileType, { color: theme.colors.placeholder }]}>
              {userProfile.isVendor ? 'Vendor' : 'Customer'}
            </Text>
          </View>

          {/* logout */}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Icons.AntDesign name="logout" size={24} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Vendor or Customer */}
        {userProfile.isVendor ? renderVendorProfile() : renderCustomerProfile()}

        {/* settings */}
        <Card style={[styles.card, { marginBottom: 80 }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.primary }]}>Settings</Text>
            <List.Item
              title="Notifications"
              description="Manage your notification preferences"
              left={() => <List.Icon icon="bell" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => Alert.alert('Notifications', 'Notification settings')}
            />
            <List.Item
              title="Privacy"
              description="Manage your privacy settings"
              left={() => <List.Icon icon="shield-account" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => Alert.alert('Privacy', 'Privacy settings')}
            />
            <List.Item
              title="Help & Support"
              description="Get help and contact support"
              left={() => <List.Icon icon="help-circle" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => Alert.alert('Support', 'Help and support')}
            />
          </Card.Content>
        </Card>
      </ScrollView>

      {/*  Add stock if Vendor */}
      <Portal>
        <Modal
          visible={stockModalVisible}
          onDismiss={() => setStockModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={[styles.modalTitle, { color: theme.colors.primary }]}>Add Stock Item</Text>

          <TextInput
            label="Item Name"
            value={newStockItem.item}
            onChangeText={(value) => setNewStockItem(prev => ({ ...prev, item: value }))}
            mode="outlined"
            style={styles.modalInput}
          />

          <TextInput
            label="Price"
            value={newStockItem.price}
            onChangeText={(value) => setNewStockItem(prev => ({ ...prev, price: value }))}
            mode="outlined"
            keyboardType="numeric"
            style={styles.modalInput}
          />

          <TextInput
            label="Unit (e.g., per kg, each)"
            value={newStockItem.unit}
            onChangeText={(value) => setNewStockItem(prev => ({ ...prev, unit: value }))}
            mode="outlined"
            style={styles.modalInput}
          />

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setStockModalVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>

            <Button
              mode="contained"
              onPress={handleUpdateStock}
              style={styles.modalButton}
            >
              Add Item
            </Button>
          </View>
        </Modal>
      </Portal>

      {userProfile.isVendor && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.accent }]}
          onPress={() => setStockModalVisible(true)}
          label="Add Stock"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    paddingTop: 30,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 100,
  },
  profileCard: {
    marginBottom: 16,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    marginHorizontal: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  profileType: {
    fontSize: 14,
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 14,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 12,
  },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  businessAvatar: {
    marginRight: 16,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  businessType: {
    fontSize: 14,
    marginBottom: 8,
  },
  businessStats: {
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
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  onlineText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  stockInfo: {
    flex: 1,
  },
  stockName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  stockPrice: {
    fontSize: 12,
  },
  availabilityChip: {
    height: 28,
  },
  availabilityText: {
    color: 'white',
    fontSize: 10,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
