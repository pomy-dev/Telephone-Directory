"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  TextInput,
  Alert,
  RefreshControl
} from "react-native";
import { Icons } from '../../constants/Icons'
import { fetchAllCompaniesOffline, useEntities } from "../../service/getApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CustomToast } from "../../components/customToast";
import { CustomModal } from "../../components/customModal";
import { useCallFunction } from '../../components/customCallAlert';
import { AppContext } from '../../context/appContext';
import CustomLoader from "../../components/customLoader";
import CustomCard from "../../components/customCard";
import { Entity } from '../../models/Entity';
import { handleEmail, handleLocation, handleWhatsapp, handleBusinessPress } from "../../utils/callFunctions";

export default function BusinessList({ route, navigation }) {
  const { theme, isDarkMode, selectedState } = React.useContext(AppContext);
  const entities = useEntities();
  const { category } = route.params;
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBronzeBusiness, setSelectedBronzeBusiness] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const { handleCall, AlertUI } = useCallFunction();

  // Load favorites from AsyncStorage
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem("favorites");

        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.log("Error loading favorites:", error);
      }
    };

    loadFavorites();
  }, []);

  // Check if a business is in favorites
  const isInFavorites = (businessId) => {
    return favorites.some((fav) => fav._id === businessId);
  };

  // Toggle favorite status
  const toggleFavorite = async (business, e) => {
    if (e) {
      e.stopPropagation();
    }

    try {
      let newFavorites = [...favorites];

      if (isInFavorites(business._id)) {
        // Remove from favorites
        newFavorites = newFavorites.filter((fav) => fav._id !== business._id);
        CustomToast('Removed from Favorites', `${business.company_name} has been removed from your favorites.`)
      } else {
        // Add to favorites
        newFavorites.push(business);
        CustomToast('Added to Favorites', `${business.company_name} has been added to your favorites.`)
      }

      // Update state
      setFavorites(newFavorites);

      // Save to AsyncStorage
      await AsyncStorage.setItem("favorites", JSON.stringify(newFavorites));
    } catch (error) {
      console.log("Error updating favorites:", error);
      Alert.alert("Error", "Could not update favorites. Please try again.");
    }
  };

  // Mock data - in a real app, this would come from your API based on the category
  useEffect(() => {
    async function loadCompanies() {
      // console.log(category);
      setLoading(true);
      setBusinesses(entities);
      setLoading(false);
    }
    loadCompanies();
  }, [category]);

  useEffect(() => {
    if (businesses.length > 0) {
      const filteredArray = [];

      // Loop through the company data and categorize
      businesses.forEach((company) => {
        if (company.company_type === category) {
          filteredArray.push(company);
        }
      });

      // Further filter based on search query
      const filtered = filteredArray.filter(
        (business) =>
          business.company_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase().trim()) ||
          business.address
            .toLowerCase()
            .includes(searchQuery.toLowerCase().trim()) ||
          (business.description &&
            business.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase().trim())) ||
          (business.company_tags &&
            Array.isArray(business.company_tags) &&
            business.company_tags
              .join(", ")
              .toLowerCase()
              .includes(searchQuery.toLowerCase().trim()))
      );

      setFilteredBusinesses(filtered);
    }
  }, [searchQuery, businesses]);

  const onBusinessPress = (business) => {
    handleBusinessPress(
      business,
      navigation,
      setSelectedBronzeBusiness,
      setUpgradeModalVisible
    );
  };

  const renderBusinessItem = ({ item }) => (
    <CustomCard
      business={item}
      index={item._id}
      theme={theme}
      onBusinessPress={onBusinessPress}
      toggleFavorite={toggleFavorite}
      isInFavorites={isInFavorites}
      handleCall={handleCall}
      handleEmail={handleEmail}
      handleWhatsapp={handleWhatsapp}
      handleLocation={handleLocation}
    />
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      <AlertUI />

      {/* Upgrade Modal for Bronze Businesses */}
      <CustomModal
        isModalVisible={upgradeModalVisible}
        selectedBronzeBusiness={selectedBronzeBusiness}
        onClose={() => setUpgradeModalVisible(false)}
      />

      <View style={styles.titleContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.appTitle, { color: theme.colors.text }]}>{category}</Text>
        <View style={{ width: 24 }} />
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
            placeholder="Search businesses"
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholderTextColor={theme.colors.text}
            value={searchQuery}
            onChangeText={setSearchQuery}
            numberOfLines={1}
          />
        </View>
      </View>

      {loading ? (
        <>
          <CustomLoader />
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading businesses...</Text>
          </View>
        </>
      ) : (
        <FlatList
          data={filteredBusinesses}
          renderItem={renderBusinessItem}
          keyExtractor={(item, index) => `${item._id}-${index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.noResultsContainer}>
              <Icons.Ionicons name="business-outline" size={48} color="#DDDDDD" />
              <Text style={styles.noResultsText}>No businesses found</Text>
              <Text style={styles.noResultsSubtext}>
                Try a different search term
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor="transparent"
              progressBackgroundColor={theme.colors.card} // Background of the spinner (Android)
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: -0.5,
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
    flex: 1,
    fontSize: 16,
    fontWeight: "400",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#777777",
  },
  listContent: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    paddingBottom: 30,
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666666",
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#999999",
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  upgradeModalContent: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    maxHeight: "80%",
  },
  upgradeModalHeader: {
    backgroundColor: "#003366",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  upgradeModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  upgradeModalBody: {
    padding: 20,
  },
  businessBranding: {
    alignItems: "center",
    marginBottom: 20,
  },
  businessLogoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  businessLogo: {
    width: 50,
    height: 50,
  },
  businessInitialContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#003366",
    justifyContent: "center",
    alignItems: "center",
  },
  businessInitial: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  upgradeBusinessName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
    textAlign: "center",
  },
  businessType: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
  },
  basicInfoContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  basicInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 4,
  },
  basicInfoText: {
    fontSize: 15,
    color: "#333333",
    marginLeft: 12,
    flex: 1,
    flexWrap: "wrap",
  },
  actionButtonsContainer: {
    gap: 16,
  },
  primaryActionButton: {
    backgroundColor: "#003366",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  secondaryActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  secondaryActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    backgroundColor: "#F8F8F8",
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333333",
    marginTop: 4,
  },
});
