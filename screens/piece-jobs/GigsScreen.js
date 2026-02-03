"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Icons } from "../../constants/Icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SecondaryNav from "../../components/SecondaryNav";
import { getPomyGigs, subscribeToGigs} from "../../service/Supabase-Fuctions";

// Dummy job data
const JOBS_DATA = [
  {
    id: "1",
    title: "Help Moving Furniture",
    description:
      "Need help moving a couch and fridge from Matsapha to Manzini.",
    category: "Moving",
    price: 300,
    location: "Matsapha Industrial Site",
    coordinates: { lat: -26.5167, lng: 31.3167 },
    postedBy: "Sabelo D.",
    postedTime: "2h ago",
    image: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=400",
  },
  {
    id: "2",
    title: "House Cleaning Service",
    description:
      "3-room house in Logoba needs thorough cleaning and window wash.",
    category: "Cleaning",
    price: 250,
    location: "Logoba, Manzini",
    coordinates: { lat: -26.5008, lng: 31.3831 },
    postedBy: "Thandeka M.",
    postedTime: "4h ago",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400",
  },
  {
    id: "3",
    title: "Plumbing Repair Needed",
    description: "Leaking kitchen tap needs fixing today — bring tools.",
    category: "Handyman",
    price: 200,
    location: "Ngwane Park, Manzini",
    coordinates: { lat: -26.5122, lng: 31.3719 },
    postedBy: "Muzi T.",
    postedTime: "1h ago",
    image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400",
  },
  {
    id: "4",
    title: "Grocery Delivery",
    description: "Pick up groceries from Spar Manzini and deliver to Fairview.",
    category: "Delivery",
    price: 80,
    location: "Fairview, Manzini",
    coordinates: { lat: -26.4961, lng: 31.3849 },
    postedBy: "Lungile K.",
    postedTime: "30min ago",
    image: "https://images.unsplash.com/photo-1542838132924-5185137a7f0b?w=400",
  },
  {
    id: "5",
    title: "Garden Maintenance",
    description: "Trim hedges, mow lawn, and remove weeds from small yard.",
    category: "Gardening",
    price: 180,
    location: "Sidwashini, Mbabane",
    coordinates: { lat: -26.3167, lng: 31.1333 },
    postedBy: "Sifiso P.",
    postedTime: "5h ago",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
  },
  {
    id: "6",
    title: "Painting Interior Walls",
    description: "Need 2 rooms painted in Matsapha, paint already available.",
    category: "Handyman",
    price: 450,
    location: "Matsapha, Eswatini",
    coordinates: { lat: -26.5167, lng: 31.3167 },
    postedBy: "Nomsa W.",
    postedTime: "3h ago",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400",
  },
  {
    id: "7",
    title: "Pet Sitting for Weekend",
    description:
      "Need someone to look after 2 small dogs in Ezulwini this weekend.",
    category: "Pet Care",
    price: 250,
    location: "Ezulwini, Lobamba",
    coordinates: { lat: -26.4333, lng: 31.2 },
    postedBy: "Banele C.",
    postedTime: "6h ago",
    image: "https://images.unsplash.com/photo-154819997303cce0bbc87b?w=400",
  },
  {
    id: "8",
    title: "Computer Repair",
    description:
      "Laptop not turning on, need someone to check power supply issue.",
    category: "Tech",
    price: 300,
    location: "Mbabane City Centre",
    coordinates: { lat: -26.3167, lng: 31.1333 },
    postedBy: "Phindile S.",
    postedTime: "1h ago",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400",
  },
];

const CATEGORIES = [
  {
    id: "all",
    name: "All",
    iconName: "grid-outline",
    iconType: Icons.Ionicons,
  },
  {
    id: "Moving",
    name: "Moving",
    iconName: "cube-outline",
    iconType: Icons.Ionicons,
  },
  {
    id: "Cleaning",
    name: "Cleaning",
    iconName: "sparkles-outline",
    iconType: Icons.Ionicons,
  },
  {
    id: "Groundsman",
    name: "Groundsman",
    iconName: "hammer-outline",
    iconType: Icons.Ionicons,
  },
  {
    id: "LandScaping",
    name: "LandScaping",
    iconName: "spade",
    iconType: Icons.MaterialCommunityIcons,
  },
  {
    id: "Delivery",
    name: "Delivery",
    iconName: "bicycle-outline",
    iconType: Icons.Ionicons,
  },
  {
    id: "Gardening",
    name: "Gardening",
    iconName: "leaf-outline",
    iconType: Icons.Ionicons,
  },
  {
    id: "Pet Care",
    name: "Pet Care",
    iconName: "paw-outline",
    iconType: Icons.Ionicons,
  },
  {
    id: "Tech",
    name: "Tech",
    iconName: "laptop-outline",
    iconType: Icons.Ionicons,
  },
];

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

const mapDatabaseToUI = (dbGigs, userLocation = null) => {
  return dbGigs.map((job) => {
    const lat = job.job_location?.lat || 0;
    const lng = job.job_location?.lng || 0;

    return {
      id: job.id.toString(),
      title: job.job_title,
      description: job.job_description,
      category: job.job_category,
      price: job.job_price,
      location: job.job_location?.address || "Location N/A",
      coordinates: { lat, lng },
      postedBy: job.postedby?.name || "Anonymous",
      // Formatting the date to a "2h ago" style or similar
      postedTime: new Date(job.created_at).toLocaleDateString(),
      // Get the first image from the array or use a placeholder
      image:
        job.job_images && job.job_images.length > 0
          ? job.job_images[0]
          : "https://via.placeholder.com/400",
      // Calculate distance if user location is available
      distance: userLocation
        ? calculateDistance(userLocation.lat, userLocation.lng, lat, lng)
        : null,
    };
  });
};


const GigsScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [userLocation, setUserLocation] = useState(null);
  const [jobs, setJobs] = useState([]); // This is our single source of truth
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState({ createdAt: null, id: null });


  // 1. Move this function ABOVE your useEffect calls
  const loadUserLocation = async () => {
    try {
      const location = await AsyncStorage.getItem("userLocation");
      if (location && location.startsWith("{")) {
        setUserLocation(JSON.parse(location));
      } else {
        // Default location (e.g., Manzini/Mbabane area)
        const defaultLoc = { lat: -26.4833, lng: 31.3667 };
        setUserLocation(defaultLoc);
        await AsyncStorage.setItem("userLocation", JSON.stringify(defaultLoc));
      }
    } catch (error) {
      console.log("Error loading location:", error);
      setUserLocation({ lat: -26.4833, lng: 31.3667 });
    }
  };

  // 2. Now the useEffect can safely find the function
  useEffect(() => {
    loadUserLocation();

    const subscription = subscribeToGigs(() => {
      fetchLiveGigs(false);
    });

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, []);

  // Realtime Subscription
  useEffect(() => {
    const subscription = subscribeToGigs(() => {
      fetchLiveGigs(false); 
    });
    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, []);

  // Fetch logic
  const fetchLiveGigs = async (isLoadMore = false) => {
    if (isLoadMore && !nextCursor.createdAt) return;

    isLoadMore ? setLoading(true) : setRefreshing(true);

    const filters = {
      category: selectedCategory === "all" ? null : selectedCategory,
      status: "open",
      afterCreatedAt: isLoadMore ? nextCursor.createdAt : null,
      afterId: isLoadMore ? nextCursor.id : null,
      pageSize: 15,
    };

    const result = await getPomyGigs(filters);

    if (result.success) {
      const mappedData = mapDatabaseToUI(result.data, userLocation);
      setJobs((prev) => (isLoadMore ? [...prev, ...mappedData] : mappedData));

      const lastItem = result.data[result.data.length - 1];
      if (lastItem?.next_created_at) {
        setNextCursor({ createdAt: lastItem.next_created_at, id: lastItem.next_id });
      } else {
        setNextCursor({ createdAt: null, id: null });
      }
    }
    setLoading(false);
    setRefreshing(false);
  };

  // Re-fetch when category changes
  useEffect(() => {
    fetchLiveGigs(false);
  }, [selectedCategory, userLocation]);

    const renderJobCard = ({ item }) => {
    // Check if the image is a real URL from your Supabase bucket
    const hasImage = item.image && !item.image.includes("via.placeholder.com");

    return (
      <TouchableOpacity
        style={styles.jobCard}
        onPress={() => navigation.navigate("JobDetailScreen", { job: item })}
      >
        {hasImage ? (
          // SMART VIEW: If image exists, show the full image
          <Image source={{ uri: item.image }} style={styles.jobImage} />
        ) : (
          // SMART VIEW: If no image, show a styled box with the full description instead
          <View style={styles.noImageDescriptionContainer}>
            <Text style={styles.noImageDescriptionText} numberOfLines={6}>
              {item.description}
            </Text>
          </View>
        )}

        <View style={styles.jobContent}>
          <View style={styles.jobHeader}>
            <Text style={styles.jobTitle}>{item.title}</Text>
            <Text style={styles.jobPrice}>R{item.price}</Text>
          </View>

          {/* Only show this small description if the image is present. 
                    If no image, we already showed the full description above. */}
          {hasImage && (
            <Text style={styles.jobDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          <View style={styles.jobFooter}>
            <View style={styles.locationContainer}>
              <Icons.Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
            {item.distance && (
              <Text style={styles.distanceText}>
                {item.distance.toFixed(1)} km away
              </Text>
            )}
          </View>

          <View style={styles.jobMeta}>
            <Text style={styles.postedBy}>{item.postedBy}</Text>
            <Text style={styles.postedTime}>{item.postedTime}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ height: 30 }} />
      <SecondaryNav
        title="Explore Gigs"
        rightIcon="add-circle-outline"
        onRightPress={() => navigation.navigate("PostJobScreen")}
        onBackPress={() => navigation.goBack()}
      />

      {/* FIXED TOP SECTION */}
      <View style={styles.headerGroup}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <category.iconType
                name={category.iconName}
                size={18}
                color={selectedCategory === category.id ? "#fff" : "#666"}
              />
              <Text style={[styles.categoryText, selectedCategory === category.id && styles.categoryTextActive]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {jobs.length} {jobs.length === 1 ? "gig" : "gigs"} near you
          </Text>
          {userLocation && <Text style={styles.sortedText}>Nearest first</Text>}
        </View>
      </View>

      {/* SCROLLABLE LIST */}
      <FlatList
        data={jobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.jobsList}
        showsVerticalScrollIndicator={false}
        onRefresh={() => fetchLiveGigs(false)}
        refreshing={refreshing}
        onEndReached={() => fetchLiveGigs(true)}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={() => !refreshing && (
          <View style={styles.emptyContainer}>
            <Icons.Ionicons name="search-outline" size={50} color="#DDD" />
            <Text style={styles.emptyTitle}>No Gigs Available</Text>
            <Text style={styles.emptySubtitle}>We couldn't find anything in {selectedCategory}.</Text>
          </View>
        )}
        ListFooterComponent={() => loading && (
          <ActivityIndicator style={{ margin: 20 }} color="#10b981" />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  categoriesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 16,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 10,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginRight: 8,
    minWidth: 100,
    height: 40,
  },
  categoryButtonActive: {
    backgroundColor: "#000",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginLeft: 6,
  },
  categoryTextActive: {
    color: "#fff",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fafafa",
  },
  resultsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  sortedText: {
    fontSize: 12,
    color: "#666",
  },
  jobsList: {
    paddingTop: 16,
    paddingBottom: 36,
  },
  jobCard: {
    backgroundColor: "#fff",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  jobImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#f0f0f0",
  },
  jobContent: {
    padding: 16,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    flex: 1,
    marginRight: 8,
  },
  jobPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10b981",
  },
  jobDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  jobFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  noImageDescriptionContainer: {
    width: "100%",
    height: 180,
    backgroundColor: "#f9f9f9",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  noImageDescriptionText: {
    fontSize: 16,
    color: "#444",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 24,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  locationText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 4,
  },
  distanceText: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "600",
  },
  jobMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  postedBy: {
    fontSize: 13,
    color: "#666",
  },
  postedTime: {
    fontSize: 12,
    color: "#999",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100, // Pushes it down a bit from the header
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 5,
    lineHeight: 20,
  },
  refreshButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#000",
    borderRadius: 20,
  },
  refreshButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fafafa",
    // Ensure it doesn't float
    width: '100%', 
  },
});

export default GigsScreen;
