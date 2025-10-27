import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import { useRealm, } from '@realm/react';
import { useEntities } from '../service/getApi';
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/env";
import { checkNetworkConnectivity } from "../service/checkNetwork";
import { fetchAllCompaniesOffline } from "../service/getApi";

const { width } = Dimensions.get("window");

const SplashScreen = ({ onConnectionSuccess }) => {
  const [isLoading, setIsLoading] = useState(true);
  const entities = useEntities();
  const [error, setError] = useState(null);
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const loadingOpacity = useState(new Animated.Value(0))[0];

  const theme = {
    background: isDark ? "#121212" : "#FFFFFF",
    primary: isDark ? "#5D5FEF" : "#003366",
    secondary: isDark ? "#2D2D3A" : "#F3F4F8",
    text: isDark ? "#FFFFFF" : "#2D2D3A",
    subtext: isDark ? "#AAAAAA" : "#71727A",
    error: isDark ? "#FF6B6B" : "#FF4757",
    card: isDark ? "#1E1E2C" : "#FFFFFF",
    border: isDark ? "#2D2D3A" : "#EAEAEA",
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

      clearTimeout(timeoutId);

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
        onConnectionSuccess();
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
          [{ text: "Continue", onPress: () => onConnectionSuccess() }]
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
        { text: "Continue", onPress: () => onConnectionSuccess() },
      ]);
    } else {
      Alert.alert("No Cached Data", "Please connect to internet first.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.backgroundElements}>
        <View
          style={[
            styles.circle,
            { backgroundColor: theme.primary + "10", left: -50, top: 100 },
          ]}
        />
        <View
          style={[
            styles.circle,
            { backgroundColor: theme.primary + "08", right: -70, bottom: 150 },
          ]}
        />
      </View>

      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View
          style={[styles.logoWrapper, { backgroundColor: theme.secondary }]}
        >
          <Image
            source={require("../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.appName, { color: theme.text }]}>
          Business Link
        </Text>
        <Text style={[styles.tagline, { color: theme.subtext }]}>
          Connect. Discover. Grow.
        </Text>
      </Animated.View>

      <View style={styles.statusContainer}>
        {isLoading ? (
          <Animated.View
            style={[styles.loadingContainer, { opacity: loadingOpacity }]}
          >
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.subtext }]}>
              Retrieving Businesses...
            </Text>
          </Animated.View>
        ) : error ? (
          <Animated.View
            style={[
              styles.errorContainer,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                shadowColor: isDark ? "#000000" : "#CCCCCC",
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
                style={[styles.button, { backgroundColor: theme.primary }]}
                onPress={handleRetry}
              >
                <Text style={styles.buttonText}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: theme.primary + "90" },
                ]}
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
          </Animated.View>
        ) : null}
      </View>

      <Text style={[styles.versionText, { color: theme.subtext }]}>
        Version 1.0.0
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  backgroundElements: { position: "absolute", width: "100%", height: "100%" },
  circle: { position: "absolute", width: 200, height: 200, borderRadius: 100 },
  logoContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  logo: { width: 80, height: 80 },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  tagline: { fontSize: 16, textAlign: "center" },
  statusContainer: { width: "100%", alignItems: "center", marginBottom: 40 },
  loadingContainer: { alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 12, fontSize: 16 },
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
    width: "100%",
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
  buttonText: { color: "#FFFFFF", fontWeight: "bold", fontSize: 16 },
  offlineButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 200,
    alignItems: "center",
    borderWidth: 1,
  },
  offlineButtonText: { fontWeight: "bold", fontSize: 16 },
  versionText: { fontSize: 12, marginBottom: 16 },
});

export default SplashScreen;
