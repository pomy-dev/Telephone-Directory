"use client";

import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Icons } from "../../constants/Icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SecondaryNav from "../../components/SecondaryNav";
import { getPomyGigs, subscribeToGigs, logUserActivity } from "../../service/Supabase-Fuctions";
import { AppContext } from "../../context/appContext";
import { supabase } from "../../service/Supabase-Client";
import { AuthContext } from "../../context/authProvider";
import { MoreDropdown } from "../../components/moreDropDown";

const MEDIA_HEIGHT = 180;

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
    id: "Media",
    name: "Media",
    iconName: "camera-outline",
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
  {
    id: "Catering",
    name: "Catering",
    iconName: "pot-steam-outline",
    iconType: Icons.MaterialCommunityIcons,
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
    const lat = job.job_location?.latitude || 0;
    const lng = job.job_location?.longitude || 0;

    // Extract valid image URLs from the jsonb[] array
    let displayImages = [];
    if (job.job_images && Array.isArray(job.job_images)) {
      displayImages = job.job_images
        .map((img) => img?.url)
        .filter((url) => url && typeof url === "string");
    }

    return {
      id: job.id.toString(),
      title: job.job_title,
      description: job.job_description,
      category: job.job_category,
      price: job.job_price,
      requirements: job.job_requirements,
      location: job.job_location?.address || "Location N/A",
      coordinates: { lat, lng },
      applications: job.application_count || 0,
      postedBy: {
        name: job.postedby?.name || "Anonymous",
        email: job.postedby?.email,
        phone: job.postedby?.phone,
      },
      postedTime: job.created_at
        ? new Date(job.created_at).toLocaleDateString()
        : "Just now",
      images: displayImages, // Empty array if no images
      distance: userLocation
        ? calculateDistance(userLocation.lat, userLocation.lng, lat, lng)
        : null,
    };
  });
};

const GigsScreen = ({ navigation }) => {
  const { user, isWorker } = React.useContext(AuthContext);
  const { theme, isDarkMode } = React.useContext(AppContext);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [userLocation, setUserLocation] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState({ createdAt: null, id: null });

  const [viewMode, setViewMode] = useState("gigs"); // "gigs" | "workers"

  const moreItems = [
    {
      title: "Find Freelancers",
      icon: "MaterialCommunityIcons",
      iconName: "briefcase-account-outline",
      onPress: () => navigation.navigate("WorkerDirectory"),
    },
    {
      title: "My Applied Gigs",
      icon: "FontAwesome6",
      iconName: "list-check",
      onPress: () =>
        navigation.navigate("JobInbox", { gigSelection: "applied" }),
    },
    {
      title: "My Posted Gigs",
      icon: "Ionicons",
      iconName: "newspaper-outline",
      onPress: () => navigation.navigate("MyPostedGigs"),
    },
    {
      title: isWorker ? "My Worker Profile" : "Become a Worker",
      icon: "Ionicons",
      iconName: isWorker ? "person-circle-outline" : "construct-outline",
      onPress: () => navigation.navigate("WorkerRegistration"),
    },
  ];

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

  useEffect(() => {
    loadUserLocation();

    const subscription = subscribeToGigs(() => {
      if (viewMode === "gigs") fetchLiveGigs(false);
    });

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === "gigs") {
      fetchLiveGigs(false);
    } else {
      // TODO: load workers when viewMode === "workers"
      // For now — placeholder data
      setWorkers([
        {
          id: "w1",
          name: "Thandi M.",
          profilePic: "https://i.pravatar.cc/150?img=68",
          skills: ["Cleaning", "Gardening", "Pet Care"],
          rating: 4.8,
          jobsCompleted: 47,
          location: "Manzini",
          distance: 3.2,
          hourlyRate: 120,
        },
        {
          id: "w2",
          name: "Sibusiso N.",
          profilePic: "https://i.pravatar.cc/150?img=45",
          skills: ["Moving", "Delivery", "Groundsman"],
          rating: 4.6,
          jobsCompleted: 31,
          location: "Mbabane",
          distance: 8.7,
          hourlyRate: 140,
        },
        // ... more dummy workers
      ]);
      setLoading(false);
    }
  }, [viewMode, selectedCategory, userLocation]);

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
        setNextCursor({
          createdAt: lastItem.next_created_at,
          id: lastItem.next_id,
        });
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
    const hasImage = item?.images && item.images.length > 0 && !item.images[0].includes("via.placeholder.com");

   const handlePressGig = (item) => {
     if (user) {
          logUserActivity(user.uid, item.id, 'pomy_gigs'); 
        }
        // ----------------------
        navigation.navigate("JobDetailScreen", { job: item });
      
    };

  return (
    <TouchableOpacity
      style={[
        styles.jobCard, 
        { backgroundColor: isDarkMode ? '#1A1A1A' : '#fff' }
      ]}
      // onPress={() => navigation.navigate("JobDetailScreen", { job: item })}
      onPress={() => handlePressGig(item)}
    >
      {/* --- TOP MEDIA SECTION (Fixed Height) --- */}
      <View style={{ height: MEDIA_HEIGHT, overflow: 'hidden' }}>
        {hasImage ? (
          <Image 
            source={{ uri: item.images[0] }} 
            style={styles.jobImage} 
            resizeMode="cover"
          />
        ) : (
          <View style={[
            styles.noImageDescriptionContainer, 
            { backgroundColor: isDarkMode ? '#252525' : '#f9f9f9', height: MEDIA_HEIGHT }
          ]}>
            <Icons.MaterialCommunityIcons 
              name="format-quote-open" 
              size={20} 
              color={theme.colors.indicator} 
              style={{ marginBottom: 4 }}
            />
            <Text 
              style={[styles.noImageDescriptionText, { color: theme.colors.text }]} 
              ellipsizeMode="tail" 
              numberOfLines={5}
            >
              {item.description}
            </Text>
          </View>
        )}
      </View>

        {/* --- BOTTOM CONTENT SECTION --- */}
        <View style={styles.jobContent}>
          <View style={styles.jobHeader}>
            <Text style={[styles.jobTitle, { color: theme.colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.jobPrice}>R{item.price}</Text>
          </View>

          {hasImage ? (
            <Text style={[styles.jobDescription, { color: isDarkMode ? '#aaa' : '#666' }]} numberOfLines={2}>
              {item.description}
            </Text>
          ) : (
            <View style={{ height: 40 }} />
          )}

          <View style={styles.jobFooter}>
            <View style={styles.locationContainer}>
              <Icons.Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
            </View>
            {item.distance && (
              <Text style={styles.distanceText}>
                {item.distance.toFixed(1)} km
              </Text>
            )}
          </View>

          <View style={[styles.jobMeta, { borderTopColor: isDarkMode ? '#333' : '#f0f0f0' }]}>
            <Text style={[styles.postedBy, { color: isDarkMode ? '#888' : '#444' }]}>
              {item.postedBy?.name || 'User'}
            </Text>
            <Text style={[styles.postedTime, { color: '#999' }]}>{item.postedTime}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderWorkerCard = ({ item }) => {
    return (
      <TouchableOpacity
        style={[
          styles.workerCard,
          { backgroundColor: isDarkMode ? "#1A1A1A" : "#fff" },
        ]}
        onPress={() =>
          navigation.navigate("WorkerProfileScreen", { worker: item })
        } // ← you'll need to create this screen
      >
        <View style={styles.workerTopRow}>
          <Image
            source={{ uri: item.profilePic }}
            style={styles.workerAvatar}
          />
          <View style={styles.workerInfo}>
            <Text style={[styles.workerName, { color: theme.colors.text }]}>
              {item.name}
            </Text>
            <View style={styles.ratingRow}>
              <Icons.MaterialCommunityIcons name="star" size={16} color="#f59e0b" />
              <Text style={styles.ratingText}>{item.rating}</Text>
              <Text style={styles.jobsCount}> • {item.jobsCompleted} jobs</Text>
            </View>
          </View>
          <View style={styles.rateContainer}>
            <Text style={styles.hourlyRate}>R{item.hourlyRate}</Text>
            <Text style={styles.perHour}>/hr</Text>
          </View>
        </View>

        <View style={styles.workerSkills}>
          {item.skills.slice(0, 3).map((skill, i) => (
            <View key={i} style={styles.skillBadge}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {item.skills.length > 3 && (
            <Text style={styles.moreSkills}>+{item.skills.length - 3}</Text>
          )}
        </View>

        <View style={styles.workerFooter}>
          <View style={styles.locationRow}>
            <Icons.Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.workerLocation} numberOfLines={1}>
              {item.location}
              {item.distance && ` • ${item.distance.toFixed(1)} km`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
      <View style={{ height: 30 }} />
      {/* Custom Modern Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.Ionicons name="arrow-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' }}>
          <TouchableOpacity style={{ backgroundColor: theme.colors.sub_card, marginRight: 5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center' }}
            onPress={() => navigation.navigate('PostJobScreen')}>
            <Icons.AntDesign name="plus" size={18} color={theme.colors.text} />
            <Text style={{ color: theme.colors.text, fontSize: 14 }}>Quick Job</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ backgroundColor: theme.colors.sub_card, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center' }}
            onPress={() => { navigation.navigate('WorkerRegistration') }}>
            <Icons.AntDesign name="plus" size={18} color={theme.colors.text} />
            <Text style={{ color: theme.colors.text, fontSize: 14 }}>Freelancer</Text>
          </TouchableOpacity>
          <MoreDropdown items={moreItems} />
        </View>
      </View>

      {/* FIXED TOP SECTION */}
      <View style={styles.headerGroup}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {/* your CATEGORIES buttons – unchanged */}
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                selectedCategory === cat.id && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <cat.iconType name={cat.iconName} size={18} color={selectedCategory === cat.id ? "#fff" : "#666"} />
              <Text style={[styles.categoryText, selectedCategory === cat.id && styles.categoryTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ─── TOGGLE BUTTONS ─── */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "gigs" && styles.toggleButtonActive,
            ]}
            onPress={() => setViewMode("gigs")}
          >
            <Text
              style={[
                styles.toggleButtonText,
                viewMode === "gigs" && styles.toggleButtonTextActive,
              ]}
            >
              Quick Jobs ({jobs?.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === "workers" && styles.toggleButtonActive,
            ]}
            onPress={() => setViewMode("workers")}
          >
            <Text
              style={[
                styles.toggleButtonText,
                viewMode === "workers" && styles.toggleButtonTextActive,
              ]}
            >
              Freelancers ({workers?.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SCROLLABLE LIST */}
      {viewMode === "gigs" ? (
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
          ListEmptyComponent={() =>
            !refreshing && (
              <View style={styles.emptyContainer}>
                <Icons.Ionicons name="search-outline" size={50} color="#DDD" />
                <Text style={styles.emptyTitle}>No Gigs Available</Text>
                <Text style={styles.emptySubtitle}>
                  We couldn't find anything in {selectedCategory}.
                </Text>
              </View>
            )
          }
          ListFooterComponent={() =>
            loading && (
              <ActivityIndicator
                style={{ margin: 20 }}
                color={theme.colors.indicator}
              />
            )
          }
        />
      ) : (
        <FlatList
          data={workers}
          renderItem={renderWorkerCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.jobsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icons.Ionicons name="people-outline" size={60} color="#DDD" />
              <Text style={styles.emptyTitle}>No Workers Found</Text>
              <Text style={styles.emptySubtitle}>
                Try changing the category or check back later.
              </Text>
            </View>
          }
          ListFooterComponent={() =>
            loading && (
              <ActivityIndicator
                style={{ margin: 20 }}
                color={theme.colors.indicator}
              />
            )
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoriesContainer: {
    borderBottomWidth: 1,
    paddingHorizontal: 3,
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
    backgroundColor: "#f0f4ff",
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
    paddingVertical: 6,
    backgroundColor: "#fafafa",
  },
  resultsText: {
    fontSize: 14,
    fontWeight: "600",
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
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#f1f1f1",
    borderRadius: 50,
    padding: 4,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: "hidden",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 50,
  },
  toggleButtonActive: {
    backgroundColor: "#000",
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  toggleButtonTextActive: {
    color: "#fff",
  },

  // ─── Worker Card Styles ───
  workerCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workerTopRow: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  workerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#e2e8f0",
  },
  workerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  workerName: {
    fontSize: 17,
    fontWeight: "700",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginLeft: 4,
  },
  jobsCount: {
    fontSize: 13,
    color: "#666",
    marginLeft: 4,
  },
  rateContainer: {
    alignItems: "flex-end",
  },
  hourlyRate: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10b981",
  },
  perHour: {
    fontSize: 12,
    color: "#888",
  },
  workerSkills: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  skillBadge: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 13,
    color: "#444",
    fontWeight: "500",
  },
  moreSkills: {
    fontSize: 13,
    color: "#666",
    alignSelf: "center",
  },
  workerFooter: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  workerLocation: {
    fontSize: 13,
    color: "#555",
    marginLeft: 4,
    flex: 1,
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
  },
  postedTime: {
    fontSize: 12,
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
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#878787ff",
    textAlign: "center",
    marginTop: 5,
    lineHeight: 20,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#f0f4ff",
    borderRadius: 50,
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
    // Ensure it doesn't float
    width: "100%",
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: "200",
    letterSpacing: -0.5,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  textLayoutCategory: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  noImageDescriptionContainer: {
    width: "100%",
    height: 160,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  noImageDescriptionText: {
    fontSize: 15,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: '500',
  },
  jobCard: {
    backgroundColor: "#fff",
    marginBottom: 16,
    borderRadius: 12, // Added rounding for a modern look
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  jobImage: {
    width: "100%",
    height: MEDIA_HEIGHT, // Fixed height
    backgroundColor: "#f0f0f0",
  },
  noImageDescriptionContainer: {
    width: "100%",
    height: MEDIA_HEIGHT, // Exactly the same as the image height
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});

export default GigsScreen;
