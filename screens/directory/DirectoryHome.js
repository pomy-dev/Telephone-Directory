// HomeScreen.js
import { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useRealm, } from '@realm/react';
import { Icons } from '../../constants/Icons';
import {
  fetchAllCompanies, fetchCompaniesWithAge,
  useEntities, fetchAllCompaniesOffline
} from '../../service/getApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkNetworkConnectivity } from '../../service/checkNetwork';
import CustomLoader from '../../components/customLoader';
import { Images } from '../../constants/Images';
import { API_BASE_URL } from '../../config/env';
import { CustomToast } from '../../components/customToast';
import { CustomModal } from '../../components/customModal';
import LoginScreen from '../../components/loginModal';
import { useCallFunction } from '../../components/customCallAlert';
import { AppContext } from '../../context/appContext';
import * as Notifications from 'expo-notifications';
import { handleLocation, handleBusinessPress, handleEmail, handleWhatsapp, filterAllBusinesses } from '../../utils/callFunctions';
import CustomCard from '../../components/customCard';
import { AuthContext } from '../../context/authProvider';

const { width } = Dimensions.get("window");

const DirectoryScreen = ({ navigation }) => {
  const { isDarkMode, theme, selectedState, isOnline, notificationsEnabled, notifications } = useContext(AppContext);
  const { user, loading } = useContext(AuthContext);
  const realm = useRealm();
  const entities = useEntities();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [selectedBronzeBusiness, setSelectedBronzeBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState('');
  const [favorites, setFavorites] = useState([]);

  const [featuredBusinesses, setFeaturedBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [searchedBusinesses, setSearchedBusinesses] = useState([]);
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [companyData, setCompanyData] = useState([]);

  const [businesses, setBusinesses] = useState([]);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { handleCall, AlertUI } = useCallFunction();
  const [showLogin, setShowLogin] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const loadingOpacity = useState(new Animated.Value(0))[0];

  const categories = ['All', 'Government', 'Emergency', 'More...'];
  // Function to schedule and store a notification
  const scheduleNotification = async (title, body, data = {}) => {
    if (!notificationsEnabled) return;
    const notificationId = data.notificationId;

    // Schedule notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { ...data, notificationId }, // Include notificationId for deep linking
      },
      trigger: null, // Immediate notification
    });
  };

  // Function to simulate mock notifications one by one
  const syncNotifications = () => {
    console.log('Notifications #', notifications.length)
    if (!notificationsEnabled && notifications.length === 0) return;

    notifications.forEach((notif, index) => {
      setTimeout(() => {
        // Notification title & body
        const title = `${notif.title}`;
        const body = `${notif.message}`;

        // Extra data for deep linking or later use
        const data = {
          notificationId: notif._id,
          category: notif.category,
          startDate: notif.startDate,
          endDate: notif.endDate,
        };
        // Call your schedule function
        scheduleNotification(title, body, data);
      }, index * 1000); // stagger them 1s apart
    });
  };

  // Example: load notifications automatically on mount
  useEffect(() => {
    syncNotifications();
  }, [notifications, notificationsEnabled]);

  // Load favorites from AsyncStorage
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem('favorites');
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.log('Error loading favorites:', error);
      }
    };

    loadFavorites();

    const unsubscribe = navigation.addListener('focus', () => {
      loadFavorites();
    });

    return unsubscribe;
  }, [navigation]);

  // Check if a business is in favorites
  const isInFavorites = (businessId) => {
    return favorites.some((fav) => fav._id === businessId);
  };

  const toggleFavorite = async (business) => {
    try {
      let newFavorites = [...favorites];

      if (isInFavorites(business._id)) {
        newFavorites = newFavorites.filter((fav) => fav._id !== business._id);
        notificationsEnabled &&
          CustomToast(
            'Removed from Favorites',
            `${business.company_name} has been removed from your favorites.`
          );
      } else {
        newFavorites.push(business);
        notificationsEnabled &&
          CustomToast(
            'Added to Favorites',
            `${business.company_name} has been added to your favorites.`
          );

      }

      setFavorites(newFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.log('Error updating favorites:', error);
      Alert.alert('Error', 'Could not update favorites. Please try again.');
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      const { ageInHours } = await fetchCompaniesWithAge();
      console.log('Data age (hours):', ageInHours);

      if (ageInHours < 1) {
        const ageInMinutes = Math.round(ageInHours * 60);
        setLastRefresh(`Last refresh was ${ageInMinutes} minutes ago`);
      } else {
        const roundedHours = Math.round(ageInHours * 100) / 100;
        setLastRefresh(`Last refresh was ${roundedHours} hours ago`);
      }

      if (ageInHours > 24) {
        handleRefresh();
      }
    };
    initializeData();
  }, []);

  useEffect(() => {
    loadBusinesses(isRefreshing);
    addEmergencyToFavorites(companyData);
  }, [isOnline]); // Add selectedState as a dependency to reload businesses when state changes

  useEffect(() => {
    filterBusinesses(allBusinesses, activeCategory);
  }, [activeCategory, allBusinesses]);

  useEffect(() => {
    filterALLBs(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      checkNetworkAndApi();
    }, 5000);
  }, []);

  const filterALLBs = async (query = searchQuery) => {
    setSearchedBusinesses([]);
    try {
      const filtered = await filterAllBusinesses(query, entities);
      setSearchedBusinesses(filtered);
    } catch (error) {
      console.log('Error in filterALLBs:', error);
      setSearchedBusinesses([]);
    }
  };

  const addEmergencyToFavorites = async (companies) => {
    try {
      const emergencyCompanies = companies.filter(
        (company) => company.company_type === "Emergency" && company.paid
      );
      const existingFavoritesJson = await AsyncStorage.getItem("favorites");
      const existingFavorites = existingFavoritesJson
        ? JSON.parse(existingFavoritesJson)
        : [];
      const existingFavoriteIds = new Set(
        existingFavorites.map((fav) => fav._id)
      );
      const newFavorites = emergencyCompanies.filter(
        (company) => !existingFavoriteIds.has(company._id)
      );
      if (newFavorites.length) {
        const updated = [...existingFavorites, ...newFavorites];
        await AsyncStorage.setItem("favorites", JSON.stringify(updated));
      }
    } catch (err) {
      console.error("Error adding emergency businesses:", err);
    }
  };

  const filterBusinesses = (data = allBusinesses, category = activeCategory) => {
    if (activeCategory !== 'More...') {
      const filtered = data.filter((business) => {
        const matchesCategory =
          category === 'All' ||
          business.company_type?.toLowerCase() === category.toLowerCase();
        return matchesCategory;
      });

      setFilteredBusinesses(filtered);
    } else {
      setActiveCategory('All');
      navigation.navigate('Countries', { screen: 'BusinessesMain' });
    }
  };

  const loadBusinesses = async (isRefresh) => {
    try {
      isRefresh ? setIsRefreshing(true) : setIsLoading(true);
      let companyData;
      if (isOnline) {
        const isConnected = await checkNetworkConnectivity();
        companyData = isConnected ? await fetchAllCompanies(realm) : entities;
      } else {
        companyData = entities;
        notificationsEnabled &&
          CustomToast('Offline Mode', 'Using cached data as app is in offline mode.')
      }

      setCompanyData(companyData);

      const featuredBusinesses = companyData.filter(
        (company) => company.subscription_type === 'Gold'
      );
      const shuffledFeatured = featuredBusinesses.sort(() => Math.random() - 0.5);

      const nonGoldCompanies = companyData.filter(
        (company) => company.subscription_type !== 'Gold'
      );

      setAllBusinesses(nonGoldCompanies);

      const shuffledNonGold = nonGoldCompanies.sort(() => Math.random() - 0.5);
      const regularBusinesses = shuffledNonGold.slice(0, 5);

      setFeaturedBusinesses(shuffledFeatured);
      setBusinesses(regularBusinesses);
      setFilteredBusinesses(regularBusinesses);
      filterBusinesses(nonGoldCompanies, activeCategory, searchQuery);

    } catch (err) {
      console.log(err.message);
      if (notificationsEnabled) {
        CustomToast('Error', 'Failed to load businesses. Using cached data if available.');
      }
    } finally {
      isRefresh ? setIsRefreshing(false) : setIsLoading(false);
    }
  };

  const onBusinessPress = (business) => {
    handleBusinessPress(
      business,
      navigation,
      setSelectedBronzeBusiness,
      setUpgradeModalVisible
    );
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      if (isOnline) {
        const isConnected = await checkNetworkConnectivity();
        if (isConnected) {
          try {
            const companies = await fetchAllCompanies(realm);

            const featuredBusinesses = companies.filter(
              (company) => company.subscription_type === 'Gold'
            );
            const nonGoldCompanies = companies.filter(
              (company) => company.subscription_type !== 'Gold'
            );

            setFeaturedBusinesses(featuredBusinesses);
            setBusinesses(nonGoldCompanies);
            setFilteredBusinesses(nonGoldCompanies);
            notificationsEnabled &&
              CustomToast('Refreshed 👍', 'Businesses refreshed successfully');

            setLastRefresh('Last refresh was just now');
          } catch (err) {
            console.log('API Error:', err.message);
            await loadBusinesses(isRefreshing);
            setLastRefresh('Using cached data (network unavailable)');
            notificationsEnabled &&
              CustomToast('Network Error', 'Failed to fetch new data. Using cached data.');
          }
        } else {
          await loadBusinesses(isRefreshing);
          setLastRefresh('Using cached data (offline mode)');
          notificationsEnabled &&
            CustomToast('Offline Mode', 'No network connection. Using cached data.');
        }
      } else {
        await loadBusinesses(isRefreshing);
        setLastRefresh('Using cached data (offline mode)');
        notificationsEnabled &&
          CustomToast('Offline Mode', 'App is in offline mode. Using cached data.');
      }
    } catch (err) {
      console.log('General Error:', err.message);
      await loadBusinesses(isRefreshing);
      setLastRefresh('Using cached data');
      notificationsEnabled &&
        CustomToast('Error', 'An error occurred. Using cached data.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    handleRefresh();
  }, [isOnline, notificationsEnabled]);

  const handleLogin = () => {
    if (loading) return;
    if (user) {
      navigation.navigate('Profile');
    } else {
      setShowLogin(true);
    }
  };

  const handleRetry = () => {
    loadingOpacity.setValue(0);
    Animated.timing(loadingOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    checkNetworkAndApi();
  };

  const openNetworkSettings = () => {
    Alert.alert(
      "Network Required",
      "Please turn on mobile data or connect to Wi-Fi.",
      [{ text: "Retry", onPress: handleRetry }, { text: "OK" }]
    );
  };

  const proceedOffline = async () => {
    const cachedCompanies = entities;
    if (cachedCompanies && cachedCompanies.length > 0) {
      await addEmergencyToFavorites(cachedCompanies);
      Alert.alert("Offline Mode", "Proceeding with offline data.", [
        {
          text: "Continue", onPress: () => {
            setIsLoading(true);
            loadBusinesses(isLoading)
          }
        },
      ]);
    } else {
      Alert.alert("No Cached Data", "Please connect to internet first.");
    }
  };

  const checkApiConnection = async () => {
    try {
      let page = 1;
      const limit = 20;
      let allCompanies = [];
      let totalPages = 1;

      setIsLoading(true);
      setError(null);

      Animated.timing(loadingOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // fetch the first page (fastest response)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_BASE_URL}/api/companies?page=${page}&limit=${limit}`, {
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();

      // Filter for paid companies only
      const paidCompanies = data.companies.filter((c) => c.paid === true);
      allCompanies = [...allCompanies, ...paidCompanies];

      totalPages = data.totalPages;

      // save immediately so splash can proceed
      await AsyncStorage.setItem("companiesList", JSON.stringify(allCompanies));
      await AsyncStorage.setItem("companies_timestamp", new Date().toISOString());
      await addEmergencyToFavorites(allCompanies);

      // ✅ proceed to app after splash
      setTimeout(() => {
        setIsLoading(false);
        loadBusinesses(isLoading);
      }, 2000);

      // 🔄 background fetch for remaining pages
      if (totalPages > 1) {
        for (let p = 2; p <= totalPages; p++) {
          try {
            const res = await fetch(`${API_BASE_URL}/api/companies?page=${p}&limit=${limit}`);
            if (!res.ok) continue;

            const pageData = await res.json();
            const morePaid = pageData.companies.filter((c) => c.paid === true);

            // merge new companies into AsyncStorage
            allCompanies = [...allCompanies, ...morePaid];
            await AsyncStorage.setItem("companiesList", JSON.stringify(allCompanies));
            await AsyncStorage.setItem("companies_timestamp", new Date().toISOString());
          } catch (bgErr) {
            console.warn(`Failed to fetch page ${p}:`, bgErr.message);
          }
        }
      }

    } catch (err) {
      console.log("API Connection Error:", err.message);
      setError(err.message);
      setIsLoading(false);

      Animated.timing(loadingOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const checkNetworkAndApi = async () => {
    const isConnected = await checkNetworkConnectivity();
    if (isConnected) {
      checkApiConnection();
    } else {
      const cachedCompanies = await fetchAllCompaniesOffline();
      if (cachedCompanies && cachedCompanies.length > 0) {
        await addEmergencyToFavorites(cachedCompanies);
        Alert.alert(
          "Offline Mode",
          "You're in offline mode. Data may be outdated.",
          [{
            text: "Continue", onPress: () => {
              setIsLoading(true);
              loadBusinesses(isLoading)
            }
          }]
        );
      } else {
        setError("No internet connection and no offline data available.");
        setIsLoading(false);
        Animated.timing(loadingOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const hide = searchQuery.length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      {/* Custom Loader    */}
      {isLoading && <CustomLoader />}

      {/* Upgrade Modal for Bronze Businesses */}
      <CustomModal
        isModalVisible={upgradeModalVisible}
        selectedBronzeBusiness={selectedBronzeBusiness}
        onClose={() => setUpgradeModalVisible(false)}
      />

      {/* Show ProfileScreen Modal */}
      {showProfile && (
        <ProfileScreen
          isVisible={showProfile}
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* Custom Alert */}
      <AlertUI />

      {/* App Title */}
      <View style={styles.titleContainer}>
        {/* menu button */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={selectedState === 'BE' ? Images.bs_eswatini : Images.eptc}
              style={styles.image}
            />
            <View style={{ marginLeft: 5 }}>
              <Text style={[styles.appTitle, { color: theme.colors.text }]}>{selectedState}</Text>
            </View>
          </View>
          {/* profile button */}
          {/* <TouchableOpacity onPress={handleLogin}>
            <Icons.Ionicons name="person-circle-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity> */}

          {/* Notifications */}
          {/* <TouchableOpacity style={styles.notificationButton} onPress={() => { navigation.navigate('Notifications') }}>
            <Icons.Ionicons name="notifications-outline" size={24} color={theme.colors.primary} />
            {notifications.length > 0 && <Badge style={[styles.notificationBadge, { backgroundColor: theme.colors.error }]}>{notifications.length}</Badge>}
          </TouchableOpacity> */}
          {/* Notifications */}
          <TouchableOpacity style={styles.notificationButton} onPress={() => { navigation.navigate('BusinessesScreen') }}>
            <Icons.Ionicons name="list-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchWrapper, { backgroundColor: theme.colors.sub_card, borderColor: theme.colors.border }]}>
          <Icons.Ionicons
            name="search-outline"
            size={20}
            color={theme.colors.text}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search business..."
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholderTextColor={theme.colors.text}
            value={searchQuery}
            onChangeText={setSearchQuery}
            numberOfLines={1}
          />
        </View>
      </View>

      <View style={styles.lastRefreshContainer}>
        <Icons.Ionicons name="time-outline" size={14} color={theme.colors.text} />
        <Text style={[styles.lastRefreshText, { color: theme.colors.text }]}>
          {lastRefresh || 'Checking data age...'}
        </Text>
      </View>

      {!hide
        ? (
          error
            ? (
              <Animated.View
                style={[
                  styles.errorContainer,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    shadowColor: isDarkMode ? "#000000" : "#CCCCCC",
                  },
                ]}
              >
                <Text style={[styles.errorText, { color: theme.error }]}>
                  Connection Error
                </Text>
                <Text style={[styles.errorDetails, { color: theme.subtext }]}>
                  {error}
                </Text>
                <Text style={[styles.helpText, { color: theme.text }]}>
                  Try turning on mobile data or connecting to Wi-Fi.
                </Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.primary }]}
                    onPress={handleRetry}
                  >
                    <Text style={styles.buttonText}>Retry</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.primary }]}
                    onPress={openNetworkSettings}
                  >
                    <Text style={styles.buttonText}>Network Help</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[styles.offlineButton, { borderColor: theme.primary }]}
                  onPress={proceedOffline}
                >
                  <Text
                    style={[styles.offlineButtonText, { color: theme.primary }]}
                  >
                    Continue in Offline Mode
                  </Text>
                </TouchableOpacity>
              </Animated.View>)
            : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={onRefresh}
                    colors={[theme.colors.primary]}
                    progressBackgroundColor={theme.colors.card}
                  />
                }>
                {/* Featured Businesses */}
                < View style={styles.sectionContainer}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Exclusive</Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate("Featured", { featuredBusinesses })}
                    >
                      <Text style={[styles.viewAllText, { color: theme.colors.text }]}>View all</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.featuredListContent}
                  >
                    {featuredBusinesses.map((item) => (
                      <TouchableOpacity
                        key={item._id}
                        style={styles.featuredItem}
                        onPress={() => onBusinessPress(item)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.featuredImageContainer, { backgroundColor: theme.colors.secondary }]}>
                          {item.logo ? (
                            <Image
                              source={{ uri: item.logo }}
                              style={styles.featuredImage}
                              resizeMode="contain"
                            />
                          ) : (
                            <View style={[styles.placeholderContent, { backgroundColor: theme.colors.indicator }]}>
                              <Text style={[styles.placeholderText, { color: theme.colors.background }]}>
                                {item.company_name.charAt(0)}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.featuredName, { color: theme.colors.text }]} numberOfLines={1}>
                          {item.company_name}
                        </Text>
                        <Text style={[styles.featuredCategory, { color: theme.colors.text }]} numberOfLines={1}>
                          {item.company_type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Categories */}
                <View style={styles.categoriesContainer}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesScrollContent}
                  >
                    {categories.map((category, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.categoryButton,
                          { backgroundColor: theme.colors.sub_card, borderColor: theme.colors.border },
                          activeCategory === category && { backgroundColor: theme.colors.primary },
                        ]}
                        onPress={() => setActiveCategory(category)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.categoryText,
                            { color: theme.colors.text },
                            activeCategory === category && { color: theme.colors.card },
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* All Businesses */}
                <View style={styles.businessesContainer}>
                  <Text style={[styles.businessesTitle, { color: theme.colors.text }]}>Featured</Text>
                  <View>
                    {filteredBusinesses.length > 0 ? (
                      filteredBusinesses.map((item, index) => (
                        <CustomCard
                          key={item._id}
                          business={item}
                          index={index}
                          theme={theme}
                          onBusinessPress={onBusinessPress}
                          toggleFavorite={toggleFavorite}
                          isInFavorites={isInFavorites}
                          handleCall={handleCall}
                          handleEmail={handleEmail}
                          handleWhatsapp={handleWhatsapp}
                          handleLocation={handleLocation}
                        />
                      ))
                    ) : (
                      <View style={styles.noResultsContainer}>
                        <Icons.Ionicons name="search" size={48} color={theme.colors.text} />
                        <Text style={[styles.noResultsText, { color: theme.colors.text }]}>No businesses found</Text>
                        <Text style={[styles.noResultsSubtext, { color: theme.colors.text }]}>Try a different search or category</Text>
                      </View>
                    )}
                  </View>
                </View>
              </ScrollView>
            ))
        : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.businessesContainer}>
              <View>
                {searchedBusinesses.length > 0 ? (
                  searchedBusinesses.map((item, index) => (
                    <CustomCard
                      key={item._id}
                      business={item}
                      index={index}
                      theme={theme}
                      onBusinessPress={onBusinessPress}
                      toggleFavorite={toggleFavorite}
                      isInFavorites={isInFavorites}
                      handleCall={handleCall}
                      handleEmail={handleEmail}
                      handleWhatsapp={handleWhatsapp}
                      handleLocation={handleLocation}
                    />
                  ))
                ) : (
                  <View style={styles.noResultsContainer}>
                    <Icons.Ionicons name="search" size={48} color={theme.colors.text} />
                    <Text style={[styles.noResultsText, { color: theme.colors.text }]}>No businesses found</Text>
                    <Text style={[styles.noResultsSubtext, { color: theme.colors.text }]}>Try a different search or category</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView >
        )
      }
    </SafeAreaView >
  );

};

const styles = StyleSheet.create({
  // connection error container
  errorContainer: {
    width: width * 0.9,
    maxWidth: 400,
    alignItems: "center",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignSelf: "center",
    marginTop: 50,
  },
  errorText: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  errorDetails: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  helpText: { fontSize: 14, textAlign: "center", marginBottom: 24 },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 120,
    alignItems: "center",
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  offlineButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 200,
    alignItems: "center",
    borderWidth: 1,
  },
  offlineButtonText: { fontWeight: "bold", fontSize: 16 },

  // that has always been there
  container: {
    flex: 1,
  },
  image: {
    width: 60,
    height: 40,
    borderRadius: 5,
    objectFit: 'contain'
  },
  scrollContent: {
    paddingBottom: 30,
  },
  lastRefreshContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 8,
    marginHorizontal: 24,
  },
  lastRefreshText: {
    fontSize: 12,
    marginLeft: 4,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 16,
  },
  appTitle: {
    fontSize: 17,
    fontWeight: "400",
    letterSpacing: -0.5,
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
  appSubTitle: {
    fontSize: 17,
    fontWeight: "200",
    letterSpacing: -0.5,
  },
  alphabetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    fontSize: 16,
    fontWeight: "400",
    flex: 1,
  },
  sectionContainer: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  featuredListContent: {
    paddingLeft: 24,
    paddingRight: 16,
  },
  featuredItem: {
    width: 100,
    alignItems: "center",
    marginRight: 20,
  },
  featuredImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featuredImage: {
    width: 60,
    height: 60,
    objectFit: 'cover'
  },
  placeholderContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  featuredName: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 2,
  },
  featuredCategory: {
    fontSize: 12,
    textAlign: "center",
  },
  categoriesContainer: {
    marginBottom: 28,
  },
  categoriesScrollContent: {
    paddingHorizontal: 24,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  businessesContainer: {
    paddingHorizontal: 10,
  },
  businessesTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default DirectoryScreen;
