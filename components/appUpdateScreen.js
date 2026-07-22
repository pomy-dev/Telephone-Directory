import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppContext } from "../context/appContext";
import { openStore } from "../service/appUpdateChecker";
import { Icons } from "../constants/Icons";
import { Images } from "../constants/Images";

export default function UpdateScreen({
  version,
  playStoreUrl,
  forceUpdate = false,
  onLater,
}) {
  const { theme, isDarkMode } = React.useContext(AppContext);

  const handleUpdate = async () => {
    try {
      await openStore(playStoreUrl);
    } catch (error) {
      console.log("Failed to open store:", error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          {/* replace with your image */}
          <Image
            source={Images.appLogo}
            style={{ width: 80, height: 80 }}
          />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {forceUpdate ? "Update Required" : "Update Available"}
        </Text>

        {/* Message */}
        <Text style={styles.message}>
          {forceUpdate
            ? "A critical update is required to continue using Yatolla. Please update to the latest version."
            : "A new version of Yatolla is available with improvements and bug fixes."}
        </Text>

        {/* Version */}
        <View style={styles.versionBox}>
          <Text style={styles.versionText}>
            Latest Version: {version}
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.updateButton, { backgroundColor: theme.colors.indicator }]}
            onPress={handleUpdate}
          >
            <Icons.Ionicons name="arrow-down-circle-outline" size={20} color="#fff" />
            <Text style={styles.updateText}>Update Now</Text>
          </TouchableOpacity>

          {!forceUpdate && (
            <TouchableOpacity
              style={styles.laterButton}
              onPress={onLater}
            >
              <Text style={styles.laterText}>Later</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Keeping Yatolla updated ensures better performance and new features.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  content: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: "center",
    alignItems: "center",
  },

  iconContainer: {
    marginBottom: 20,
    backgroundColor: "rgba(79, 142, 247, 0.1)",
    padding: 20,
    borderRadius: 50,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },

  message: {
    fontSize: 15,
    color: "#AAB4C5",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },

  versionBox: {
    backgroundColor: "#121A2B",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 30,
  },

  versionText: {
    color: "#4F8EF7",
    fontWeight: "600",
    fontSize: 13,
  },

  buttonContainer: {
    width: "100%",
    gap: 12,
  },

  updateButton: {
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  updateText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  laterButton: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A3550",
    justifyContent: "center",
    alignItems: "center",
  },

  laterText: {
    color: "#AAB4C5",
    fontSize: 14,
    fontWeight: "500",
  },

  footer: {
    marginTop: 25,
    fontSize: 12,
    color: "#5B6B86",
    textAlign: "center",
    paddingHorizontal: 10,
  },
});