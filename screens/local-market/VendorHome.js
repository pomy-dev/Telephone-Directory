import { Icons } from '../../constants/Icons'
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  View
} from 'react-native';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Text,
  Searchbar
} from 'react-native-paper';
import { mockCategories, mockVendors } from '../../utils/mockData';
import { AppContext } from '../../context/appContext';
import VendorCard from '../../components/vendorCard';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { theme, isDarkMode } = React.useContext(AppContext)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [nearbyVendors, setNearbyVendors] = useState([]);
  const [featuredVendors, setFeaturedVendors] = useState([]);

  useEffect(() => {
    // Simulate loading nearby vendors
    setNearbyVendors(mockVendors.filter(vendor => vendor.isOnline));
    setFeaturedVendors(mockVendors.filter(vendor => vendor.rating > 4.5));
  }, []);

  const handleSearch = () => {
    navigation.navigate('SearchScreen', {
      query: searchQuery,
      category: selectedCategory
    });
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category.name);
    navigation.navigate('SearchScreen', {
      query: '',
      category: category.name
    });
  };

  const renderVendorCard = ({ item }) => (
    <VendorCard item={item} />
  );

  const renderCategoryCard = ({ item }) => (
    <TouchableOpacity style={[styles.categoryCard, { borderColor: theme.colors.border }]} onPress={() => handleCategoryPress(item)}>
      <Card.Content style={styles.categoryContent}>
        <Text style={styles.categoryIcon}>{item.icon}</Text>
        <Text style={[styles.categoryName, { color: theme.colors.text }]}>{item.name}</Text>
      </Card.Content>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      {/* header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 30 }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icons.Ionicons name='arrow-back' size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>Local Market</Text>
          </View>
          <>
            <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')} style={styles.notificationButton}>
              <Icons.Ionicons name="person-circle-outline" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationButton}>
              <Icons.Ionicons name="notifications-outline" size={24} color={theme.colors.primary} />
              <Badge style={[styles.notificationBadge, { backgroundColor: theme.colors.error }]}>3</Badge>
            </TouchableOpacity>
          </>
        </View>

        <Searchbar
          placeholder="Search vendors, products, or areas..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={[styles.searchBar, { backgroundColor: theme.colors.sub_card, borderColor: theme.colors.border }]}
          iconColor={theme.colors.text}
        />
      </View>

      <ScrollView contentContainerStyle={{ justifyContent: 'center' }}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Categories</Text>
          <FlatList
            data={mockCategories}
            renderItem={renderCategoryCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Nearby Vendors</Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('SearchScreen', { sortBy: 'distance' })}
              compact
            >
              See All
            </Button>
          </View>

          <FlatList
            data={nearbyVendors}
            renderItem={renderVendorCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.vendorList}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Top Rated</Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('SearchScreen', { sortBy: 'rating' })}
              compact
            >
              See All
            </Button>
          </View>

          <FlatList
            data={featuredVendors}
            renderItem={renderVendorCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.vendorList}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('BulkGroupsScreen')}
            >
              <Icons.Ionicons name="people" size={32} color={theme.colors.primary} />
              <Text style={[styles.actionText, { color: theme.colors.text }]}>Join Bulk Groups</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('OrdersScreen')}
            >
              <Icons.Ionicons name="receipt" size={32} color={theme.colors.primary} />
              <Text style={[styles.actionText, { color: theme.colors.text }]}>My Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('SupplyChain')}
            >
              <Icons.FontAwesome6 name="group-arrows-rotate" size={32} color={theme.colors.primary} />
              <Text style={[styles.actionText, { color: theme.colors.text }]}>Supply Chain</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  searchBar: {
    paddingVertical: 2,
    elevation: 4,
  },
  section: {
    paddingHorizontal: 10,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoryList: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  categoryCard: {
    backgroundColor: '#F0F4FF',
    borderWidth: 1,
    borderRadius: 50,
    width: 'auto',
    marginRight: 12,
  },
  categoryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  vendorList: {
    paddingBottom: 10,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    marginBottom: 60,
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    minWidth: 80,
  },
  actionText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  }
});
