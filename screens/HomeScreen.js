"use client";

import {
  StyleSheet,
  StatusBar,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import React, { useEffect, useState, useCallback, useRef } from "react";
import * as Notifications from "expo-notifications";
import { Badge } from "react-native-paper";
import TopNav from "../components/TopNav";
import { AppContext } from "../context/appContext";
import { AuthContext } from "../context/authProvider";
import { CustomToast } from "../components/customToast";
import { Images } from "../constants/Images";
import CustomLoader from "../components/customLoader";
import PersonalizedAdsSection from "../components/PersonalizedAdsSection";
import { Icons } from "../constants/Icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  fetchOpenGigsCount, subscribeToGigs
} from "../service/Supabase-Fuctions";
import NetInfo from "@react-native-community/netinfo";
import { triggerFeedbackManual } from "../components/FeedbackSystem";

export default function HomeScreen({ navigation }) {
  const [isOffline, setIsOffline] = useState(false);
  const { theme, isDarkMode, notifications, notificationsEnabled } =
    React.useContext(AppContext);
  const { logout } = React.useContext(AuthContext);
  const [nots, setNots] = useState(null);
  const [greetingText, setGreetingText] = useState("");
  const [gigsCount, setGigsCount] = useState(0);
  const [startingText, setStartingText] = useState("");
  const [islogingOut, setIsLoggingOut] = useState(false);
  const adsRef = useRef(null);

  // network listener (To tell user to connect to a network)
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

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
    console.log("Notifications No.: ", notifications.length);
    // console.log('Notifications : ', notifications)
    if (!notificationsEnabled && notifications.length === 0) return;

    notifications.forEach((notif, index) => {
      setTimeout(() => {
        // Notification title & body
        const title = `${notif._type === "employer"
          ? "New Application Received"
          : notif._type === "application"
            ? "👍Your Candidature succeeded!"
            : notif.title
          }`;
        const body = `${notif._type === "employer"
          ? notif.applicant_details?.name +
          " applied for " +
          notif.job_title +
          "job. Check his credentials for approval."
          : notif._type === "application"
            ? "Your application for " +
            notif.job_title +
            " posted by " +
            notif.posted_by?.name +
            " was successful. Connect with him/her via" +
            notif.posted_by?.phone
            : notif.message
          }`;

        // Extra data for deep linking or later use
        const data = {
          notificationId: notif._id || notif.application_id,
          category: notif.category || notif.job_category,
          startDate:
            notif.startDate || new Date(notif.applied_at)?.toLocaleDateString(),
          endDate: notif.endDate || "N/A",
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

  const services = [
    {
      id: "1",
      screen: "GigsScreen",
      name: "Quick Jobs",
      image: Images.piecejob,
    },
    {
      id: "2",
      screen: "TransportationListScreen",
      name: "For-Hires",
      image: Images.forhire,
    },
    // {
    //   id: "3",
    //   screen: "LoanAssist",
    //   name: "Smart Financing",
    //   image: Images.loans,
    // },
  ];

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    let greeting = "";

    if (hour >= 5 && hour < 12) greeting = "Morning 👋";
    else if (hour >= 12 && hour < 17) greeting = "Afternoon 🙃";
    else if (hour >= 17 && hour < 21) greeting = "Evening 🥱";
    else greeting = "Night 😏";

    setGreetingText(greeting);
    setNots(notifications);

    switch (greeting) {
      case "Morning":
        setStartingText("Let's start the day with some new plans");
        break;
      case "Afternoon":
        setStartingText("Keep going strong this afternoon");
        break;
      case "Evening":
        setStartingText("Time to relax and enjoy your evening");
        break;
      default:
        setStartingText("What are we doing today?");
        break;
    }
  }, [notifications]);

  // fetch count once on mount (or whenever you want to refresh explicitly)
  useEffect(() => {
    let mounted = true;

    const loadCount = async () => {
      try {
        const count = await fetchOpenGigsCount();
        if (mounted) {
          setGigsCount(count);
        }
      } catch (err) {
        console.log("Error fetching gigs count", err);
      }
    };

    // initial fetch
    loadCount();

    // subscribe to realtime updates on gigs table and refresh count when changes arrive
    const channel = subscribeToGigs(() => {
      // callback from supabase print
      if (mounted) {
        loadCount();
      }
    });

    return () => {
      mounted = false;
      if (channel && channel.unsubscribe) {
        channel.unsubscribe();
      }
    };
  }, []);

  // This runs every time the user navigates TO this screen
  useFocusEffect(
    useCallback(() => {
      // Trigger the refresh in the child component
      if (adsRef.current) {
        adsRef.current.refreshRecommendations();
      }

      // You can also refresh your gig counts here if needed
      return () => { };
    }, []),
  );

  const renderService = ({ item }) => (
    <TouchableOpacity
      style={[styles.serviceItem]}
      activeOpacity={0.7}
      onPress={() => {
        navigation.navigate(item.screen);
      }}
    >
      <View
        style={[
          styles.serviceIconContainer,
          {
            backgroundColor: theme.colors.sub_card,
            borderColor: theme.colors.sub_card,
          },
        ]}
      >
        <Image
          source={item.image}
          style={styles.serviceIcon}
          resizeMode="contain"
        />
        {item.name === "Quick Jobs" && (
          <Badge style={{ position: "absolute", top: -4, right: -2 }}>
            {gigsCount}
          </Badge>
        )}
      </View>
      <Text
        style={[styles.serviceText, { color: theme.colors.text }]}
        numberOfLines={2}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const handleLogout = () => {
    try {
      setIsLoggingOut(true);
      logout();
      CustomToast("Logged out 🚶🏾‍♂️‍➡️", "Sign In to start again");
    } catch (error) {
      console.log("Logout error:", error.message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSettings = () => {
    navigation.navigate("Settings");
  };

  const handleNotificationPress = () => {
    if (nots?.length > 0) {
      navigation.navigate("Nots", { params: null });
    } else {
      CustomToast(
        "No notifications",
        "You have no new notifications at the moment.",
      );
      return;
    }
  };

  if (isOffline) {
    return (
      <View
        style={[
          styles.offlineContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Icons.Ionicons
          name="cloud-offline-outline"
          size={64}
          color={theme.colors.sub_text}
        />
        <Text style={[styles.offlineTitle, { color: theme.colors.sub_text }]}>
          No Internet Connection
        </Text>
        <Text
          style={[styles.offlineText, { color: theme.colors.sub_text }]}
        >
          Check your network settings to see the latest gigs on Pomy.
        </Text>
        {/* <TouchableOpacity style={styles.retryButton} onPress={loadGigs}> */}
        <TouchableOpacity
          style={[
            styles.retryButton,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text style={[styles.retryText, { color: theme.colors.sub_text }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />

      {islogingOut && <CustomLoader />}

      <TopNav
        onCartPress={() => console.log("Cart pressed")}
        onNotificationPress={handleNotificationPress}
        notificationCount={nots?.length}
        onSearch={() => console.log("Search tapped")}
        onLogout={handleSettings}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.greetingSection}>
          <Text style={[styles.greetingText, { color: theme.colors.text }]}>
            Good {greetingText}
          </Text>
          <Text style={styles.startingText}>{startingText}</Text>
        </View>

        <View
          style={[
            styles.servicesSection,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <FlatList
            data={services}
            renderItem={renderService}
            keyExtractor={(item) => item.id}
            numColumns={4}
            columnWrapperStyle={styles.gridRow}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <PersonalizedAdsSection ref={adsRef} />
        {/* Manual Feedback Trigger Section */}
        <View style={styles.feedbackSection}>
          <TouchableOpacity
            style={[
              styles.feedbackCard,
              { backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9" },
            ]}
            onPress={() => triggerFeedbackManual()}
          >
            <View style={styles.feedbackIconCircle}>
              <Icons.Ionicons
                name="chatbubble-ellipses"
                size={24}
                color={isDarkMode ? '#fff' : theme.colors.primary}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text
                style={[styles.feedbackTitle, { color: theme.colors.text }]}
              >
                Give Feedback About service
              </Text>
              <Text style={styles.feedbackSubtitle}>
                Tap to share your thoughts with the team
              </Text>
            </View>
            <Icons.Ionicons name="chevron-forward" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
        {<View style={{ height: 30 }} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  greetingSection: {
    paddingHorizontal: 10,
    paddingTop: 24,
    paddingBottom: 20,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: "200",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  startingText: {
    fontSize: 20,
    color: "#64748b",
    fontWeight: "700",
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  servicesSection: {
    paddingHorizontal: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 8,
  },
  gridRow: {
    justifyContent: "space-evenly",
  },
  serviceItem: {
    alignItems: "center",
    // width: 76,
    marginVertical: 8,
  },
  serviceIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    // elevation: 3,
  },
  serviceIcon: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  serviceText: {
    fontSize: 12,
    color: "#334155",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 16,
  },
  bottomSpacer: {
    height: 100,
  },
  feedbackSection: {
    paddingHorizontal: 15,
    marginTop: 20,
    marginBottom: 10,
  },
  feedbackCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  feedbackIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "rgba(99, 102, 241, 0.1)", // Light tint of primary
    justifyContent: "center",
    alignItems: "center",
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  feedbackSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  // Add these to your existing styles object
  offlineContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  offlineContent: {
    alignItems: "center",
    width: "100%",
  },
  offlineTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 20,
    marginBottom: 10,
  },
  offlineText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
