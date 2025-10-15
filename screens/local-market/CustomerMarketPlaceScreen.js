import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Chip,
  IconButton,
  Searchbar,
  Surface,
  Text,
} from 'react-native-paper';
import { theme } from '../../constants/vendorTheme';

const { width } = Dimensions.get('window');

export default function CustomerMarketplaceScreen({ navigation }) {
  const [vendors, setVendors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedArea, setSelectedArea] = useState('All');

  const categories = ['All', 'Vegetables', 'Fruits', 'Food & Beverages', 'Handicrafts', 'Electronics', 'Clothing'];
  const areas = ['All', 'Mbabane', 'Manzini', 'Ezulwini', 'Malkerns', 'Matsapha'];

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = () => {
    // In real app, load from API
    setVendors([
      {
        id: '1',
        name: 'Thabo\'s Fresh Vegetables',
        category: 'Vegetables',
        area: 'Mbabane',
        rating: 4.5,
        reviewCount: 23,
        isOnline: true,
        deliveryRadius: 5,
        profileImage: 'https://via.placeholder.com/150',
        description: 'Fresh vegetables from local farms',
        featuredProducts: ['Tomatoes', 'Onions', 'Carrots'],
        distance: '0.5 km'
      },
      {
        id: '2',
        name: 'Sipho\'s Mobile Kitchen',
        category: 'Food & Beverages',
        area: 'Manzini',
        rating: 4.8,
        reviewCount: 45,
        isOnline: true,
        deliveryRadius: 8,
        profileImage: 'https://via.placeholder.com/150',
        description: 'Traditional Swazi meals and snacks',
        featuredProducts: ['Traditional Stew', 'Fresh Bread', 'Local Tea'],
        distance: '2.3 km'
      },
      {
        id: '3',
        name: 'Nomsa\'s Craft Shop',
        category: 'Handicrafts',
        area: 'Ezulwini',
        rating: 4.2,
        reviewCount: 18,
        isOnline: false,
        deliveryRadius: 15,
        profileImage: 'https://via.placeholder.com/150',
        description: 'Traditional Swazi crafts and souvenirs',
        featuredProducts: ['Traditional Baskets', 'Wooden Carvings', 'Beaded Jewelry'],
        distance: '5.1 km'
      }
    ]);
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || vendor.category === selectedCategory;
    const matchesArea = selectedArea === 'All' || vendor.area === selectedArea;
    return matchesSearch && matchesCategory && matchesArea;
  });

  const visitVendorStore = (vendor) => {
    navigation.navigate('CustomerStore', {
      vendor: vendor,
      products: vendor.featuredProducts.map(product => ({
        id: Math.random().toString(),
        name: product,
        price: Math.floor(Math.random() * 50) + 10,
        unit: 'pieces',
        stock: Math.floor(Math.random() * 100) + 10,
        description: `Fresh ${product.toLowerCase()} from ${vendor.name}`,
        images: [],
        category: vendor.category
      }))
    });
  };

  const renderVendor = ({ item }) => (
    <Card style={styles.vendorCard}>
      <Card.Content>
        <View style={styles.vendorHeader}>
          <View style={styles.vendorInfo}>
            <View style={styles.vendorMeta}>
              <Avatar.Image size={50} source={{ uri: item.profileImage }} />
              <View style={styles.vendorDetails}>
                <Text variant="titleMedium" style={styles.vendorName}>{item.name}</Text>
                <View style={styles.ratingContainer}>
                  <IconButton icon="star" size={16} iconColor="#FFD700" />
                  <Text variant="bodySmall" style={styles.rating}>
                    {item.rating} ({item.reviewCount})
                  </Text>
                </View>
                <Text variant="bodySmall" style={styles.vendorDescription}>
                  {item.description}
                </Text>
              </View>
            </View>

            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: item.isOnline ? '#4CAF50' : '#F44336' }]} />
              <Text variant="bodySmall" style={styles.statusText}>
                {item.isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.vendorMeta}>
          <View style={styles.metaRow}>
            <Chip mode="outlined" compact style={styles.categoryChip}>
              {item.category}
            </Chip>
            <Chip mode="outlined" compact style={styles.areaChip}>
              📍 {item.area}
            </Chip>
            <Text variant="bodySmall" style={styles.distanceText}>
              {item.distance}
            </Text>
          </View>

          <View style={styles.featuredProducts}>
            <Text variant="bodySmall" style={styles.featuredLabel}>Featured:</Text>
            <Text variant="bodySmall" style={styles.featuredText}>
              {item.featuredProducts.slice(0, 3).join(', ')}
            </Text>
          </View>
        </View>
      </Card.Content>

      <Card.Actions style={styles.cardActions}>
        <Button
          mode="outlined"
          onPress={() => { }}
          icon="phone"
          compact
        >
          Call
        </Button>
        <Button
          mode="contained"
          onPress={() => visitVendorStore(item)}
          icon="store"
          compact
        >
          Visit Store
        </Button>
      </Card.Actions>
    </Card>
  );

  const renderCategoryChip = (category) => (
    <TouchableOpacity
      key={category}
      onPress={() => setSelectedCategory(category)}
    >
      <Chip
        selected={selectedCategory === category}
        style={[
          styles.filterChip,
          selectedCategory === category && styles.selectedChip
        ]}
      >
        {category}
      </Chip>
    </TouchableOpacity>
  );

  const renderAreaChip = (area) => (
    <TouchableOpacity
      key={area}
      onPress={() => setSelectedArea(area)}
    >
      <Chip
        selected={selectedArea === area}
        style={[
          styles.filterChip,
          selectedArea === area && styles.selectedChip
        ]}
      >
        {area}
      </Chip>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={4}>
        <Text style={styles.headerTitle}>Vendor Marketplace</Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Find vendors near you
        </Text>
      </Surface>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search vendors or products..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        <View style={styles.filterSection}>
          <Text variant="titleSmall" style={styles.filterLabel}>Categories:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map(renderCategoryChip)}
          </ScrollView>
        </View>
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        <View style={styles.filterSection}>
          <Text variant="titleSmall" style={styles.filterLabel}>Areas:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {areas.map(renderAreaChip)}
          </ScrollView>
        </View>
      </ScrollView>

      <View style={styles.resultsHeader}>
        <Text variant="titleMedium" style={styles.resultsText}>
          {filteredVendors.length} vendors found
        </Text>
        <IconButton
          icon="map"
          onPress={() => navigation.navigate('MapView')}
          iconColor={theme.colors.primary}
        />
      </View>

      <FlatList
        data={filteredVendors}
        keyExtractor={(item) => item.id}
        renderItem={renderVendor}
        contentContainerStyle={styles.vendorsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text variant="titleLarge" style={styles.emptyText}>No vendors found</Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Try adjusting your search criteria
            </Text>
          </View>
        )}
      />

      <View style={styles.floatingActions}>
        <IconButton
          icon="account-group"
          style={styles.floatingButton}
          iconColor="white"
          onPress={() => navigation.navigate('GroupManagement')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchbar: {
    elevation: 2,
  },
  filtersContainer: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 8,
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterLabel: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  filterChip: {
    marginRight: 8,
  },
  selectedChip: {
    backgroundColor: theme.colors.primaryContainer,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsText: {
    fontWeight: 'bold',
  },
  vendorsList: {
    padding: 16,
    paddingBottom: 100,
  },
  vendorCard: {
    marginBottom: 16,
    elevation: 3,
  },
  vendorHeader: {
    marginBottom: 12,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorMeta: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  vendorDetails: {
    flex: 1,
    marginLeft: 12,
  },
  vendorName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    color: theme.colors.onSurfaceVariant,
  },
  vendorDescription: {
    color: theme.colors.onSurfaceVariant,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: theme.colors.onSurfaceVariant,
  },
  vendorMeta: {
    marginTop: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: theme.colors.primaryContainer,
  },
  areaChip: {
    backgroundColor: theme.colors.secondaryContainer,
  },
  distanceText: {
    color: theme.colors.onSurfaceVariant,
    marginLeft: 'auto',
  },
  featuredProducts: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredLabel: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  featuredText: {
    color: theme.colors.onSurfaceVariant,
    flex: 1,
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: 8,
  },
  emptySubtext: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  floatingActions: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  floatingButton: {
    backgroundColor: theme.colors.primary,
  },
});
