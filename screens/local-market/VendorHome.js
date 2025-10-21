import { Icons } from '../../constants/Icons'
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
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
import { mockCategories } from '../../utils/mockData';
import { AppContext } from '../../context/appContext';
import { AuthContext } from '../../context/authProvider';
import * as Location from 'expo-location';
import VendorCard from '../../components/vendorCard';
import { getVendorsAndStock } from '../../service/getApi';
import CustomLorder from '../../components/customLoader';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { theme, isDarkMode } = React.useContext(AppContext)
  const { user } = React.useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [nearbyVendors, setNearbyVendors] = useState([]);
  const [featuredVendors, setFeaturedVendors] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🧮 Haversine formula to calculate distance (in km)
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    const loadVendors = async () => {
      try {
        setIsLoading(true);
        // 📍 Get device location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Permission to access location was denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setUserLocation({ latitude, longitude });

        // 🌐 Fetch vendors from backend
        const vendorsData = await getVendorsAndStock();
        const allVendors = vendorsData.vendors;

        // ⭐ Featured vendors
        const featured = allVendors.filter((v) => v.rating > 4.5).slice(0, 3);

        // 🧭 Find nearby vendors (sort by distance)
        const vendorsWithDistance = allVendors
          .filter(
            (v) =>
              v.location &&
              v.location.latitude &&
              v.location.longitude
          )
          .map((v) => ({
            ...v,
            distance: getDistance(
              latitude,
              longitude,
              v.location.latitude,
              v.location.longitude
            ),
          }))
          .sort((a, b) => a.distance - b.distance); // nearest first

        // 🧮 Get first 4 nearby vendors
        const nearest = vendorsWithDistance.slice(0, 4);

        // 💾 Save state
        setNearbyVendors(nearest);
        setFeaturedVendors(featured);
      } catch (error) {
        console.error('Error loading vendors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVendors();
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
    <TouchableOpacity style={styles.categoryCard} onPress={() => handleCategoryPress(item)}>
      <Card.Content style={styles.categoryContent}>
        <Text style={styles.categoryIcon}>{item.icon}</Text>
        <Text style={[styles.categoryName, { color: theme.colors.text }]}>{item.name}</Text>
      </Card.Content>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      {isLoading && <CustomLorder />}

      {/* header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icons.Ionicons name='arrow-back' size={24} color={theme.colors.primary} />
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')} style={styles.notificationButton}>
              {(user.picture !== null || user.picture !== '') ?
                <Image source={{ uri: user.picture }} style={styles.userImage} />
                :
                <Icons.Ionicons name="person-circle-outline" size={24} color={theme.colors.primary} />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}
              onPress={() => navigation.navigate('BulkGroupsScreen')}
            >
              <Icons.FontAwesome6 name="people-roof" size={24} color={theme.colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}
              onPress={() => navigation.navigate('OrdersScreen')}
            >
              <Icons.Ionicons name="receipt-outline" size={24} color={theme.colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('SupplyChain')}
            >
              <Icons.FontAwesome6 name="group-arrows-rotate" size={24} color={theme.colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.notificationButton}>
              <Icons.Ionicons name="notifications-outline" size={24} color={theme.colors.primary} />
              <Badge style={[styles.notificationBadge, { backgroundColor: theme.colors.error }]}>3</Badge>
            </TouchableOpacity>
          </View>
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

      <ScrollView contentContainerStyle={{ justifyContent: 'center', paddingBottom: 60 }}>
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
            keyExtractor={(item, index) => `${item._id}-${index}`}
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
            keyExtractor={(item, index) => `${item._id}-${index}`}
            scrollEnabled={false}
            contentContainerStyle={styles.vendorList}
          />
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
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userImage: {
    width: 40, height: 40,
    borderRadius: 20, marginRight: 12
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
    backgroundColor: 'transparent'
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
