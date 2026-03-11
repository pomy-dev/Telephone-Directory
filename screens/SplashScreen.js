import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
} from "react-native";
import { AppContext } from "../context/appContext";
import { Images } from '../constants/Images';

const { width, height } = Dimensions.get("window");

const SplashScreen = ({ onConnectionSuccess }) => {
  const { theme, isDarkMode } = React.useContext(AppContext)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      
      <View style={styles.backgroundElements}>
        <View
          style={[
            styles.circle,
            { backgroundColor: isDarkMode ? '#003366' + '10' : "#5D5FEF" + "10", left: -50, top: 100 },
          ]}
        />
        <View
          style={[
            styles.circle,
            { backgroundColor: isDarkMode ? '#003366' + "08" : "#5D5FEF" + "08", right: -70, bottom: 150 },
          ]}
        />
      </View>

      <Animated.View
        style={styles.logoContainer}
      >
        <View
          style={[styles.logoWrapper, { backgroundColor: theme.colors.secondary }]}
        >
          <Image
            source={Images.appLogo}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.appName, { color: theme.colors.text }]}>
          Business Link
        </Text>
        <Text style={[styles.tagline, { color: theme.colors.sub_text }]}>
          Connect. Discover. Grow.
        </Text>
      </Animated.View>

      <View style={styles.statusContainer}>
        {isLoading ? (
          <Animated.View
            style={styles.loadingContainer}
          >
            <ActivityIndicator size="large" color={theme.colors.indicator} />
            <Text style={[styles.loadingText, { color: theme.colors.sub_text }]}>
              Starting...
            </Text>
          </Animated.View>
        ) : (
          <Animated.View>
            <TouchableOpacity
              style={[styles.offlineButton, { borderColor: theme.colors.indicator }]}
              onPress={() => onConnectionSuccess()}
            >
              <Text
                style={[styles.offlineButtonText, { color: theme.colors.indicator }]}
              >
                Get Started
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      <Text style={[styles.versionText, { color: theme.colors.sub_text }]}>
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
  offlineButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 200,
    alignItems: "center",
    borderWidth: 1,
  },
  offlineButtonText: { fontWeight: "bold", fontSize: 16 },
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
  versionText: { fontSize: 12, marginBottom: height * 0.05 },
});

export default SplashScreen;
