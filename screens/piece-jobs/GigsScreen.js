"use client";

import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, StatusBar, Pressable,
  Image, SafeAreaView, ActivityIndicator, Animated, TextInput, Linking, Dimensions
} from "react-native";
import { Icons } from "../../constants/Icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SecondaryNav from "../../components/SecondaryNav";
import { getPomyGigs, subscribeToGigs } from "../../service/Supabase-Fuctions";
import { AppContext } from "../../context/appContext";
import { supabase } from "../../service/Supabase-Client";
import { AuthContext } from "../../context/authProvider";
import { MoreDropdown } from "../../components/moreDropDown";

const MEDIA_HEIGHT = 180;
const { height, width } = Dimensions.get('window')

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
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [loadingGigs, setLoadingGigs] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState({ createdAt: null, id: null });
  const [viewMode, setViewMode] = useState("gigs"); // "gigs" | "workers"
  const [searchQuery, setSearchQuery] = useState("");
  const [fabOpen, setFabOpen] = useState(false);
  const fabRotation = React.useRef(new Animated.Value(0)).current;

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

    // Load both workers and gigs on mount
    fetchLiveGigs(false);
    fetchWorkers();

    const subscription = subscribeToGigs(() => {
      if (viewMode === "gigs") fetchLiveGigs(false);
    });

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [viewMode]);

  useEffect(() => {
    // Handle search filtering
    if (viewMode === "workers") {
      const filtered = workers.filter(worker =>
        worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (worker.skills && worker.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())))
      );
      setFilteredWorkers(filtered);
    }
  }, [searchQuery, workers, viewMode]);

  const fetchWorkers = async () => {
    setLoadingWorkers(true);
    const { data, error } = await supabase
      .from('pomy_workers')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      // Filter out the current user's own profile
      const otherWorkers = user?.uid
        ? data.filter(worker => worker.user_id !== user.uid)
        : data;

      setWorkers(otherWorkers);
      setFilteredWorkers(otherWorkers);
    }
    setLoadingWorkers(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  };

  // Fetch logic
  const fetchLiveGigs = async (isLoadMore = false) => {
    if (isLoadMore && !nextCursor.createdAt) return;

    isLoadMore ? setLoadingGigs(true) : setRefreshing(true);

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
    setLoadingGigs(false);
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
      <TouchableOpacity style={styles.workerBox}
        onPress={() => navigation.navigate("WorkerProfileScreen", { worker: item })}
      >
        {/* Availability Header */}
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: item.is_available ? '#E8F5E9' : '#F5F5F5' }]}>
            <View style={[styles.statusDot, { backgroundColor: item.is_available ? '#10b981' : '#999' }]} />
            <Text style={[styles.statusText, { color: item.is_available ? '#10b981' : '#666' }]}>
              {item.is_available ? 'Ready for Hire' : 'Currently Busy'}
            </Text>
          </View>
          <Text style={styles.memberSince}>Since {formatDate(item.created_at)}</Text>
        </View>

        <View style={styles.boxHeader}>
          <View style={styles.avatarSquare}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.workerName} numberOfLines={1}>{item.name}</Text>

            {/* SMART SKILLS DISPLAY */}
            <View style={styles.skillCloud}>
              {Array.isArray(item.skills) && item.skills.length > 0 ? (
                item.skills.map((skill, index) => (
                  <View key={index} style={styles.skillTagMini}>
                    <Text style={styles.skillTagTextMini}>{skill}</Text>
                  </View>
                ))
              ) : (
                <View style={[styles.skillTagMini, { backgroundColor: '#F3F4F6' }]}>
                  <Text style={[styles.skillTagTextMini, { color: '#999' }]}>General Labor</Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.callIconButton}
            onPress={() => Linking.openURL(`tel:${item.phone}`)}
          >
            <Icons.Ionicons name="call" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.boxBody}>
          <Text style={styles.sectionLabel}>Professional Profile</Text>
          <Text style={styles.workerBio} numberOfLines={3}>
            {item.bio || "Experience provider specializing in the skills listed above. Contact for quotes and availability."}
          </Text>
        </View>

        <View style={styles.boxFooter}>
          <View style={styles.locationContainer}>
            <Icons.Ionicons name="location-sharp" size={16} color="#666" />
            <View style={styles.locationTextGroup}>
              <Text style={styles.locationLabel}>Service Area</Text>
              <Text style={styles.locationText}>{item.location?.address || "Eswatini"}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewProfileBtn}
            onPress={() => Linking.openURL(`tel:${item.phone}`)}
          >
            <Text style={styles.viewProfileText}>Hire Now</Text>
            <Icons.Ionicons name="chevron-forward" size={14} color="#FFF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
      <View style={{ height: 20 }} />

      {/* Custom Modern Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.Ionicons name="arrow-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        {/* SEARCH BAR */}
        <View style={{ backgroundColor: theme.colors.background }}>
          <View style={[styles.searchBar, { backgroundColor: theme.colors.sub_card }]}>
            <Icons.Ionicons name="search" size={18} color={theme.colors.sub_text} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder={viewMode === "gigs" ? "Search jobs..." : "Search workers..."}
              placeholderTextColor={theme.colors.sub_text}
              value={searchQuery}
              numberOfLines={1}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icons.Ionicons name="close" size={18} color={theme.colors.sub_text} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Pressable style={{ borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#f0f4ff' }}
          onPress={() => { }}
        >
          <Icons.Ionicons name="options" size={30} color={theme.colors.sub_text} />
        </Pressable>
        <MoreDropdown items={moreItems} />
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
              Quick Jobs ({jobs?.length || 0})
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
              Freelancers ({workers?.length || 0})
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
            loadingGigs && (
              <ActivityIndicator
                style={{ margin: 20 }}
                color={theme.colors.indicator}
              />
            )
          }
        />
      ) : (
        <FlatList
          data={filteredWorkers}
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
            loadingWorkers && (
              <ActivityIndicator
                style={{ margin: 20 }}
                color={theme.colors.indicator}
              />
            )
          }
        />
      )}

      {/* FLOATING ACTION BUTTON */}
      <View style={styles.fabContainer}>
        {/* Secondary Buttons */}
        {fabOpen && (
          <>
            <Animated.View style={[
              styles.secondaryFabButton,
              {
                opacity: new Animated.Value(1),
                transform: [{
                  translateY: new Animated.Value(0)
                }]
              }
            ]}>
              <TouchableOpacity
                style={[styles.secondaryFab, { backgroundColor: '#10b981' }]}
                onPress={() => {
                  // toggleFAB();
                  navigation.navigate('PostJobScreen');
                }}
              >
                <Icons.AntDesign name="plus" size={20} color="#fff" />
                <Text style={styles.secondaryFabLabel}>Post Job</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={[
              styles.secondaryFabButton,
              {
                opacity: new Animated.Value(1),
                transform: [{
                  translateY: new Animated.Value(0)
                }]
              }
            ]}>
              <TouchableOpacity
                style={[styles.secondaryFab, { backgroundColor: '#3b82f6' }]}
                onPress={() => {
                  // toggleFAB();
                  navigation.navigate('WorkerRegistration');
                }}
              >
                <Icons.AntDesign name="plus" size={20} color="#fff" />
                <Text style={styles.secondaryFabLabel}>Freelancer</Text>
              </TouchableOpacity>
            </Animated.View>
          </>
        )}

        {/* Main FAB */}
        <Animated.View style={{
          transform: [{
            rotate: fabRotation.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '45deg']
            })
          }]
        }}>
          <TouchableOpacity
            style={[styles.mainFab, { backgroundColor: theme.colors.indicator }]}
            // onPress={toggleFAB}
          >
            <Icons.AntDesign name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    paddingHorizontal: 12,
    height: 44,
    width: width * 0.70,
    gap: 8,
    overflow: 'hidden'
  },
  searchInput: {
    // flex: 1,
    fontSize: 14,
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
    // overflow: "hidden",
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
  workerBox: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F1F1'
  },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  memberSince: { fontSize: 10, color: '#999', fontWeight: '600' },
  boxHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  avatarSquare: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  headerInfo: { flex: 1, marginLeft: 14 },
  workerName: { fontSize: 17, fontWeight: '800', color: '#000' },
  skillCloud: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, gap: 6 },
  skillTagMini: { backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  skillTagTextMini: { fontSize: 10, color: '#10b981', fontWeight: '800', textTransform: 'uppercase' },
  callIconButton: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center' },

  boxBody: { marginVertical: 15, paddingVertical: 15, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F9F9F9' },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#999', textTransform: 'uppercase', marginBottom: 6 },
  workerBio: { fontSize: 14, color: '#444', lineHeight: 20 },

  boxFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationContainer: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  locationTextGroup: { marginLeft: 8 },
  locationLabel: { fontSize: 9, fontWeight: '800', color: '#BBB', textTransform: 'uppercase' },
  locationText: { fontSize: 13, color: '#1A1A1A', fontWeight: '700' },

  viewProfileBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#000' },
  viewProfileText: { color: '#fff', fontSize: 13, fontWeight: '700', marginRight: 5 },
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
    paddingHorizontal: 10,
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
  // FAB Styles
  fabContainer: {
    position: 'absolute',
    bottom: height * 0.1,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  mainFab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryFabButton: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  secondaryFab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  secondaryFabLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default GigsScreen;
