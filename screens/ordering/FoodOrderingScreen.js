import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SecondaryNav from '../../components/SecondaryNav';

export default function FoodOrderingScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All', icon: '🍽️' },
    { id: 'burger', name: 'Burger', icon: '🍔' },
    { id: 'pizza', name: 'Pizza', icon: '🍕' },
    { id: 'asian', name: 'Asian', icon: '🍜' },
    { id: 'dessert', name: 'Dessert', icon: '🍰' },
    { id: 'drinks', name: 'Drinks', icon: '🥤' },
  ];

  const featuredItems = [
    {
      id: 1,
      name: 'Cheese Hot Hamburger',
      restaurant: 'Burger Palace',
      price: 89.99,
      rating: 4.8,
      reviews: 234,
      image: '/placeholder.svg?height=200&width=300',
      deliveryTime: '15-20 min',
      distance: '1.2 km',
    },
    {
      id: 2,
      name: 'Pepperoni Pizza',
      restaurant: 'Pizza Heaven',
      price: 129.99,
      rating: 4.9,
      reviews: 456,
      image: '/placeholder.svg?height=200&width=300',
      deliveryTime: '20-25 min',
      distance: '2.1 km',
    },
  ];

  const popularRestaurants = [
    {
      id: 1,
      name: 'Burger Palace',
      cuisine: 'Burgers, Fast Food',
      rating: 4.7,
      reviews: 1200,
      deliveryTime: '15-20 min',
      deliveryFee: 15,
      image: '/placeholder.svg?height=120&width=120',
      distance: '1.2 km',
    },
    {
      id: 2,
      name: 'Pizza Heaven',
      cuisine: 'Pizza, Italian',
      rating: 4.8,
      reviews: 890,
      deliveryTime: '20-25 min',
      deliveryFee: 20,
      image: '/placeholder.svg?height=120&width=120',
      distance: '2.1 km',
    },
    {
      id: 3,
      name: 'Sushi Master',
      cuisine: 'Japanese, Sushi',
      rating: 4.9,
      reviews: 567,
      deliveryTime: '25-30 min',
      deliveryFee: 25,
      image: '/placeholder.svg?height=120&width=120',
      distance: '3.5 km',
    },
    {
      id: 4,
      name: 'Taco Fiesta',
      cuisine: 'Mexican, Tacos',
      rating: 4.6,
      reviews: 432,
      deliveryTime: '18-23 min',
      deliveryFee: 18,
      image: '/placeholder.svg?height=120&width=120',
      distance: '1.8 km',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <SecondaryNav title="Food Ordering" showLocation={true} rightIcon="cart-outline" onRightPress={() => alert("Notifications!")} />

      {/* <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={20} color="#00b14f" />
          <Text style={styles.locationText}>Mbabane, Eswatini</Text>
          <Ionicons name="chevron-down" size={20} color="#000" />
        </View>
        <TouchableOpacity style={styles.cartButton}>
          <Ionicons name="cart-outline" size={24} color="#000" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View> */}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for food or restaurants"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.name && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category.name)}
            >
              <Text style={styles.categoryEmoji}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.name && styles.categoryTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Items */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Items</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredContainer}
        >
          {featuredItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.featuredCard}>
              <Image source={{ uri: item.image }} style={styles.featuredImage} />
              <View style={styles.featuredContent}>
                <Text style={styles.featuredName}>{item.name}</Text>
                <Text style={styles.featuredRestaurant}>{item.restaurant}</Text>

                <View style={styles.featuredInfo}>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color="#FFB800" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                    <Text style={styles.reviewsText}>({item.reviews})</Text>
                  </View>
                  <View style={styles.deliveryInfo}>
                    <Ionicons name="time-outline" size={14} color="#666" />
                    <Text style={styles.deliveryText}>{item.deliveryTime}</Text>
                  </View>
                </View>

                <View style={styles.featuredFooter}>
                  <Text style={styles.priceText}>E{item.price}</Text>
                  <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>Add to Cart</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Popular Restaurants */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Restaurants</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.restaurantsGrid}>
          {popularRestaurants.map((restaurant) => (
            <TouchableOpacity key={restaurant.id} style={styles.restaurantCard}>
              <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
              <View style={styles.restaurantContent}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <Text style={styles.restaurantCuisine}>{restaurant.cuisine}</Text>

                <View style={styles.restaurantInfo}>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFB800" />
                    <Text style={styles.restaurantRating}>{restaurant.rating}</Text>
                    <Text style={styles.restaurantReviews}>({restaurant.reviews})</Text>
                  </View>
                </View>

                <View style={styles.restaurantFooter}>
                  <View style={styles.deliveryInfo}>
                    <Ionicons name="time-outline" size={14} color="#666" />
                    <Text style={styles.deliveryText}>{restaurant.deliveryTime}</Text>
                  </View>
                  <Text style={styles.deliveryFee}>E{restaurant.deliveryFee} fee</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#00b14f',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#00b14f',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#FFF',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryChipActive: {
    backgroundColor: '#00b14f',
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  seeAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#00b14f',
  },
  featuredContainer: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 30,
  },
  featuredCard: {
    width: 280,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  featuredImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  featuredContent: {
    padding: 16,
  },
  featuredName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  featuredRestaurant: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  featuredInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  reviewsText: {
    fontSize: 13,
    color: '#999',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryText: {
    fontSize: 13,
    color: '#999',
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  addButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  restaurantsGrid: {
    paddingHorizontal: 20,
    gap: 16,
  },
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  restaurantImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginRight: 12,
  },
  restaurantContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  restaurantName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  restaurantInfo: {
    marginBottom: 8,
  },
  restaurantRating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  restaurantReviews: {
    fontSize: 12,
    color: '#999',
  },
  restaurantFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deliveryFee: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00b14f',
  },
});