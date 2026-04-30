import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../context/authProvider";
import { AppContext } from "../context/appContext";
import { supabase } from "../service/Supabase-Client";
import { Icons } from "../constants/Icons";
import NetInfo from "@react-native-community/netinfo";

const FEEDBACK_STORAGE_KEY = "@pomy_feedback_timer";
let manualOpenTrigger = null;

export const triggerFeedbackManual = () => {
  if (manualOpenTrigger) manualOpenTrigger();
};

export const FeedbackSystem = () => {
  const { user } = useContext(AuthContext);
  const { theme, isDarkMode } = useContext(AppContext);
  const [isVisible, setIsVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Define the manual trigger
  useEffect(() => {
    manualOpenTrigger = async () => {
      const state = await NetInfo.fetch();
      if (state.isConnected) {
        setIsVisible(true);
      } else {
        // Optional: Show a toast or alert saying "Internet required for feedback"
        console.log("Feedback blocked: No internet");
      }
    };
    return () => {
      manualOpenTrigger = null;
    };
  }, []);

  // useEffect(() => {
  //   const checkShouldShow = async () => {
  //     const network = await NetInfo.fetch();
  //     if (!network.isConnected) {
  //       console.log("Feedback Timer: Skipping check, user is offline.");
  //       return;
  //     }

  //     // Only prompt if a user is logged in
  //     if (!user) return;

  //     const lastPrompt = await AsyncStorage.getItem(FEEDBACK_STORAGE_KEY);
  //     const now = Date.now();

  //     // Show every 30 days if they haven't submitted yet
  //     const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

  //     if (lastPrompt > THIRTY_DAYS) {
  //       // Delay the popup so it doesn't hit them immediately on splash
  //       setTimeout(() => setIsVisible(true), 5000);
  //     }

  //     //   // To this (Temporary for testing):
  //     //   if (true) {
  //     //     setTimeout(() => setIsVisible(true), 2000); // Pops up after 2 seconds
  //     //   }
  //   };

  //   // Delay the auto-popup so it doesn't hit them immediately on app open
  //   const timer = setTimeout(checkShouldShow, 60000);
  //   return () => clearTimeout(timer);
  // }, [user]);


  useEffect(() => {
  const checkShouldShow = async () => {
    const network = await NetInfo.fetch();
    if (!network.isConnected || !user) return;

    const lastPrompt = await AsyncStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!lastPrompt) {
      // First time user? Wait 5 seconds and show it.
      setTimeout(() => setIsVisible(true), 5000);
      return;
    }

    const now = Date.now();
    const timeSinceLastPrompt = now - parseInt(lastPrompt);
    
    // Define your wait periods
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

    // Only show if the gap is larger than 30 days
    if (timeSinceLastPrompt > THIRTY_DAYS) {
      setTimeout(() => setIsVisible(true), 5000);
    }
  };

  const timer = setTimeout(checkShouldShow, 60000); // Check 1 minute after app start
  return () => clearTimeout(timer);
}, [user]);


  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert(
        "Rating Required",
        "Please tap a star to rate your experience.",
      );
      return;
    }

    // Check network before trying to hit Supabase
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      Alert.alert(
        "Offline",
        "Please check your internet connection and try again.",
      );
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("app_feedback").insert([
        {
          user_id: user.uid, // Firebase UID
          rating,
          message,
          created_at: new Date(),
        },
      ]);

      if (error) throw error;

      // Set timer so we don't ask again for a long time
      await AsyncStorage.setItem(FEEDBACK_STORAGE_KEY, Date.now().toString());
      Alert.alert("Thank You!", "Your feedback will helps us make the service better.");
      setIsVisible(false);
    } catch (error) {
      console.error("Feedback retry later");
      Alert.alert(
        "Error",
        "We couldn't save your feedback. Please try again later.",
      );
      setIsVisible(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    // If they dismiss, wait 7 days before asking again
    // const sevenDaysAgo = Date.now()* 24 * 60 * 60 * 1000;
    // await AsyncStorage.setItem(FEEDBACK_STORAGE_KEY, sevenDaysAgo.toString());

    await AsyncStorage.setItem(FEEDBACK_STORAGE_KEY, Date.now().toString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            { backgroundColor: isDarkMode ? "#1e293b" : "#fff" },
          ]}
        >
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Enjoying Service?
          </Text>
          <Text style={styles.subtitle}>Help us improve your experience!</Text>

          <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Icons.Ionicons
                  name={rating >= star ? "star" : "star-outline"}
                  size={38}
                  color={rating >= star ? "#fbbf24" : "#94a3b8"}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.text,
                borderColor: isDarkMode ? "#334155" : "#e2e8f0",
                backgroundColor: isDarkMode ? "#0f172a" : "#f8fafc",
              },
            ]}
            placeholder="What's on your mind?"
            placeholderTextColor="#64748b"
            multiline
            value={message}
            onChangeText={setMessage}
          />

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleDismiss}
              style={styles.btnSecondary}
            >
              <Text style={{ color: "#64748b", fontWeight: "600" }}>
                Maybe Later
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              style={[
                styles.btnPrimary,
                { backgroundColor: theme.colors.primary },
              ]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Send Feedback</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: { fontSize: 22, fontWeight: "900", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#64748b", marginBottom: 24 },
  starContainer: { flexDirection: "row", gap: 8, marginBottom: 24 },
  input: {
    width: "100%",
    height: 100,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    textAlignVertical: "top",
    marginBottom: 24,
    fontSize: 15,
  },
  actions: { flexDirection: "row", gap: 12, width: "100%" },
  btnPrimary: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondary: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
