import { Icons } from '../../constants/Icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  StatusBar
} from 'react-native';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  FAB,
  Menu,
  Text,
  Searchbar
} from 'react-native-paper';
import VendorCard from '../../components/vendorCard';
import { mockAreas, mockCategories, mockVendors } from '../../utils/mockData';
import { AppContext } from '../../context/appContext';

export default function SearchScreen({ navigation, route }) {
  const { theme, isDarkMode } = React.useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState(route?.params?.query || '');
  const [selectedCategory, setSelectedCategory] = useState(route?.params?.category || '');
  const [selectedArea, setSelectedArea] = useState('');
  const [sortBy, setSortBy] = useState('distance');
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  useEffect(() => {
    filterVendors();
  }, [searchQuery, selectedCategory, selectedArea, sortBy]);

  const filterVendors = () => {
    let filtered = [...mockVendors];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(vendor =>
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(vendor =>
        vendor.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by area
    if (selectedArea) {
      filtered = filtered.filter(vendor =>
        vendor.location.area.toLowerCase() === selectedArea.toLowerCase()
      );
    }

    // Sort vendors
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'distance':
          return Math.random() - 0.5; // Simulate distance sorting
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return Math.random() - 0.5; // Simulate price sorting
        default:
          return 0;
      }
    });

    setFilteredVendors(filtered);
  };

  const renderVendorCard = ({ item }) => (
    <VendorCard item={item} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icons.Ionicons name="search-outline" size={64} color={theme.colors.disabled} />
      <Text style={[styles.emptyTitle, { color: theme.colors.placeholder }]}>No vendors found</Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.placeholder }]}>
        Try adjusting your search criteria or explore different categories
      </Text>
      <TouchableOpacity
        onPress={() => {
          setSearchQuery('');
          setSelectedCategory('');
          setSelectedArea('');
        }}
        style={[styles.clearFiltersButton, { borderColor: theme.colors.primary }]}
      >
        <Text style={{ color: '#ccc', textAlign: 'center' }}>Clear Filters</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      <View style={[styles.header, { borderColor: theme.colors.border }]}>
        <View style={styles.headerSearch}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icons.Ionicons name='arrow-back' size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.filterContainer}>
            <Menu
              visible={sortMenuVisible}
              onDismiss={() => setSortMenuVisible(false)}
              anchor={
                <TouchableOpacity
                  onPress={() => setSortMenuVisible(true)}
                  style={[styles.sortButton, { borderColor: theme.colors.border }]}
                >
                  <Icons.MaterialCommunityIcons name='sort' size={24} color={theme.colors.sub_text} />
                  <Text style={{ color: theme.colors.text, textAlign: 'center' }}>
                    Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                  </Text>
                </TouchableOpacity>
              }
            >
              <Menu.Item onPress={() => { setSortBy('rating'); setSortMenuVisible(false); }} title="Rating" />
              <Menu.Item onPress={() => { setSortBy('distance'); setSortMenuVisible(false); }} title="Distance" />
              <Menu.Item onPress={() => { setSortBy('name'); setSortMenuVisible(false); }} title="Name" />
              <Menu.Item onPress={() => { setSortBy('price'); setSortMenuVisible(false); }} title="Price" />
            </Menu>
          </View>
        </View>

        <Searchbar
          placeholder="Search vendors, products, or areas..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.sub_card, borderColor: theme.colors.border }]}
          iconColor={theme.colors.text}
        />
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <Chip
            selected={!selectedCategory}
            onPress={() => setSelectedCategory('')}
            style={styles.filterChip}
          >
            All Categories
          </Chip>
          {mockCategories?.map((category) => (
            <Chip
              key={category.id}
              selected={selectedCategory === category.name}
              onPress={() => setSelectedCategory(category.name)}
              style={styles.filterChip}
            >
              {category.icon} {category.name}
            </Chip>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <Chip
            selected={!selectedArea}
            onPress={() => setSelectedArea('')}
            style={styles.filterChip}
          >
            All Areas
          </Chip>
          {mockAreas?.map((area) => (
            <Chip
              key={area}
              selected={selectedArea === area}
              onPress={() => setSelectedArea(area)}
              style={styles.filterChip}
            >
              {area}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredVendors}
        renderItem={renderVendorCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.vendorList}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerSearch: {
    marginVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    alignItems: 'center'
  },
  searchBar: {
    elevation: 4,
    paddingVertical: 2
  },
  filterContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 5
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  filtersContainer: {
    paddingVertical: 12
  },
  filtersScroll: {
    paddingHorizontal: 20,
  },
  filterChip: {
    backgroundColor: '#F4F0FF',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  vendorList: {
    paddingHorizontal: 10,
    paddingBottom: 50,
  },
  vendorCard: {
    marginBottom: 16,
    elevation: 4,
  },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vendorAvatar: {
    marginRight: 12,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  vendorType: {
    fontSize: 14,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    marginLeft: 4,
  },
  statusBadge: {
    color: 'white',
    fontSize: 10,
  },
  vendorDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  vendorDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    marginLeft: 4,
  },
  stockContainer: {
    marginTop: 8,
  },
  stockTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stockItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stockChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  clearFiltersButton: {
  }
});
