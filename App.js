// App.js
import "react-native-gesture-handler";
import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, StatusBar, Platform, Modal } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider as PaperProvider } from "react-native-paper";
import * as Notifications from "expo-notifications";
import { NavigationBar } from "expo-navigation-bar";
import { RealmProvider } from "@realm/react";
import { configureGoogleSignin } from "./utils/callFunctions";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { checkForAppUpdates } from './service/appUpdateChecker';
import UpdateScreen from "./components/appUpdateScreen";

// this is feed back form for the app for data collection
import { FeedbackSystem } from "./components/FeedbackSystem";
// Basket Provider
import { BasketProvider } from "./context/basketContext";

// loan assist
import LoanAssist from "./screens/loans/LoanAssist";
import Chatbot from "./screens/loans/Chatbot";
import LoanDetails from "./screens/loans/LoanDetails";
import LoanCompare from "./screens/loans/LoanCompare";
import LoanCalculator from "./screens/loans/LoanCalculator";

// screens
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/Login";
import SignupScreen from "./screens/SignUp";
import SettingsScreen from "./screens/SettingsScreen";

// gigs
import GigsScreen from "./screens/piece-jobs/GigsScreen";
import PostJobScreen from "./screens/piece-jobs/PostJobScreen";

// jobs
import JobDetailScreen from "./screens/piece-jobs/JobDetailScreen";
import WorkerRegistrationScreen from "./screens/piece-jobs/WorkerRegistration";
import WorkerProfileScreen from "./screens/piece-jobs/WorkerProfileScreen";
import MyPostedGigsScreen from "./screens/piece-jobs/MyPostedGigsScreen";
import JobInboxScreen from "./screens/piece-jobs/JobInboxScreen";

// forehires (transportation)
import TransportationListScreen from "./screens/forehires/TransportationListScreen";
import TransportationDetailsScreen from "./screens/forehires/TransportationDetailsScreen";
import PostTransportationScreen from "./screens/forehires/PostTransportationScreen";
import BookTransportationScreen from "./screens/forehires/BookTransportationScreen";

// Splash Screen
import SplashScreen from "./screens/SplashScreen";

// Notification screen
import NotificationListScreen from "./screens/notifications/NotificationList";

// App Context
import { AppContext, AppProvider } from "./context/appContext";
import { AuthProvider, AuthContext } from "./context/authProvider";

// Directory Model
import {
  Entity,
  PhoneObject,
  SocialMediaObject,
  WorkingHoursObject,
  TeamMember,
  GeoPoint,
  Review,
} from "./models/Entity";
import { set } from "date-fns";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Request notification permissions
async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowSound: true,
      allowBadge: false,
    },
  });
  if (status !== "granted") {
    console.log("Notification permissions not granted");
    return false;
  }
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      enableLights: true,
      enableVibrate: true,
    });
  }
  return true;
}

// Bottom Tabs
// function Tabs() {
//   const { theme } = useContext(AppContext);
//   const insets = useSafeAreaInsets();
//   return (
//     <Tab.Navigator
//       initialRouteName="Home"
//       screenOptions={{
//         headerShown: false,
//         tabBarShowLabel: false,
//         tabBarStyle: [
//           styles.tabBar,
//           {
//             backgroundColor: theme.colors.card,
//             borderTopColor: theme.colors.border,
//             bottom: insets.bottom,
//           },
//         ],
//         tabBarActiveTintColor: "#003366",
//         tabBarInactiveTintColor: "#94a3b8",
//       }}
//     >
//       {/* <Tab.Screen
//         name="SavedListScreen"
//         component={SavedListsScreen}
//         options={{
//           tabBarIcon: ({ focused, color }) => (
//             <Icons.Ionicons name={focused ? "list" : "list-outline"} size={28} color={color} />
//           )
//         }}
//       /> */}
//       {/* <Tab.Screen
//         name="Favorites"
//         component={FavoritesScreen}
//         options={{
//           tabBarIcon: ({ focused, color }) => (
//             <Icons.MaterialCommunityIcons
//               name={focused ? "notebook-check" : "notebook-check-outline"}
//               size={24}
//               color={color}
//             />
//           ),
//         }}
//       /> */}
//       {/* <Tab.Screen
//         name="Home"
//         component={HomeScreen}
//         options={{
//           tabBarIcon: ({ focused }) => {
//             // console.log(props.accessibilityState?.selected)
//             return (
//               <View
//                 // {...props}
//                 style={styles.fabButtonWrapper}
//                 activeOpacity={0.8}
//               >
//                 <View
//                   style={[
//                     styles.fab,
//                     {
//                       backgroundColor: focused ? "#0f172a" : "#94a3b8",
//                     },
//                   ]}
//                 >
//                   <Icons.Ionicons
//                     name="home"
//                     size={28}
//                     color={focused ? "#fff" : "#ddd"}
//                   />
//                 </View>
//               </View>
//             );
//           },
//         }}
//       /> */}
//       {/* <Tab.Screen
//         name="PeopleScreen"
//         component={PeopleScreen}
//         options={{
//           tabBarIcon: ({ focused, color }) => (
//             <Icons.MaterialCommunityIcons name={focused ? "account-cog" : "account-cog-outline"} size={28} color={color} />
//           )
//         }}
//       /> */}
//       {/* <Tab.Screen
//         name="Settings"
//         component={SettingsScreen}
//         options={{
//           tabBarIcon: ({ focused, color }) => (
//             <Icons.Ionicons
//               name={focused ? "settings" : "settings-outline"}
//               size={24}
//               color={color}
//             />
//           ),
//         }}
//       /> */}
//     </Tab.Navigator>
//   );
// }

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { isDarkMode, theme, notificationsEnabled, addNotification } = useContext(AppContext);
  const { user } = useContext(AuthContext);
  const [isAppReady, setIsAppReady] = useState(false);
  const navigationRef = useNavigationContainerRef();
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);

  // Notification observer logic
  useEffect(() => {
    let isMounted = true;

    // In App.js, update the handleNotification function
    const handleNotification = (notification) => {
      if (!notificationsEnabled) return;
      const notificationData = {
        id:
          notification.request.content.data?.notificationId ||
          notification._id ||
          Date.now().toString(),
        title: notification.request.content.title,
        body: notification.request.content.body,
        data: notification.request.content.data,
        timestamp: new Date().toISOString(),
      };

      // console.log('Notification ID ', notificationData.id)
      // addNotification(notificationData);

      navigationRef.navigate("Nots", {
        screen: "Notifications",
        params: { notificationId: notificationData.id }, // Directly pass notificationId
      });
    };

    // Check for notifications that launched the app
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!isMounted || !response?.notification) return;
      handleNotification(response.notification);
    });

    // Listen for notification taps while the app is running
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        handleNotification(response.notification);
      },
    );

    // Request permissions on mount
    requestNotificationPermissions();

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [navigationRef, notificationsEnabled, addNotification]);

  useEffect(() => {
    // if (Platform.OS === "android") {
    // NavigationBar.setBackgroundColorAsync("#000000"); // Dark background
    // NavigationBar.setButtonStyleAsync("light");      // White buttons
    //   <NavigationBar style="auto" />;
    // }

    configureGoogleSignin();
  }, []);

  useEffect(() => {
    const appUpdateCheck = (async () => {
      const appStatus = await checkForAppUpdates();

      if (!appStatus) return;

      if (appStatus.forceUpdate) {
        setUpdateInfo({
          latestVersion: appStatus.latestVersion,
          playStoreUrl: appStatus.playStoreUrl,
          forceUpdate: true,
        });
        setShowUpdate(true);
        return;
      }

      if (appStatus.optionalUpdate) {
        setUpdateInfo({
          latestVersion: appStatus.latestVersion,
          playStoreUrl: appStatus.playStoreUrl,
          forceUpdate: false,
        });
        setShowUpdate(true);
      }
    });

    appUpdateCheck();
  }, []);

  const toastConfig = {
    success: ({ text1, text2 }) => (
      <View
        style={{
          height: 60,
          width: "90%",
          backgroundColor: theme.colors.background,
          borderRadius: 10,
          padding: 10,
          justifyContent: "center",
          borderWidth: 1,
          borderLeftColor: theme.colors.indicator,
          borderTopColor: theme.colors.secondary,
          borderRightColor: theme.colors.secondary,
          borderBottomColor: theme.colors.secondary,
          borderLeftWidth: 4,
          zIndex: 9999,
          elevation: 9999,
        }}
      >
        <Text style={{ color: theme.colors.text, fontWeight: "bold" }}>
          {text1}
        </Text>
        <Text style={{ color: theme.colors.text }}>{text2}</Text>
      </View>
    ),
  };

  return (
    <SafeAreaProvider>
      <Modal
        visible={showUpdate && !!updateInfo}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          if (!updateInfo?.forceUpdate) setShowUpdate(false);
        }}
      >
        <UpdateScreen
          version={updateInfo?.latestVersion}
          playStoreUrl={updateInfo?.playStoreUrl}
          forceUpdate={updateInfo?.forceUpdate}
          onLater={updateInfo?.forceUpdate ? undefined : () => setShowUpdate(false)}
        />
      </Modal>
      <RealmProvider
        schemaVersion={2}
        schema={[
          Entity,
          PhoneObject,
          SocialMediaObject,
          WorkingHoursObject,
          TeamMember,
          GeoPoint,
          Review,
        ]}
      >
        {!isAppReady ? (
          <SplashScreen onConnectionSuccess={() => setIsAppReady(true)} />
        ) : (
          <GestureHandlerRootView style={{ flex: 1 }}>
            <BottomSheetModalProvider>
              <PaperProvider theme={theme}>
                <BasketProvider>
                  <NavigationContainer ref={navigationRef} theme={theme}>
                    <Stack.Navigator
                      screenOptions={{ headerShown: false }}
                      initialRouteName={
                        // user ? "MainTabs" : "Login"
                        user ? "Home" : "Login"
                        // loading ? "SplashLoading" : user ? "MainTabs" : "Login"
                      }
                    >
                      {/* Auth Screens */}
                      {!user ? (
                        <>
                          <Stack.Screen name="Login" component={LoginScreen} options={{ animationEnabled: false }} />
                          <Stack.Screen name="Signup" component={SignupScreen} />
                        </>
                      ) : (
                        <>
                          {/* Main App Screens */}
                          {/* <Stack.Screen
                            name="MainTabs"
                            component={Tabs}
                            options={{ animationEnabled: false }}
                          /> */}

                          {/* Home Screen */}
                          <Stack.Screen name="Home" component={HomeScreen} />

                          <Stack.Screen name="Settings" component={SettingsScreen} />

                          {/* Notifications */}
                          <Stack.Screen name="Nots" component={NotificationListScreen} />

                          {/* Business Directory */}
                          {/* <Stack.Screen
                            name="DirectoryScreen"
                            component={DirectoryScreen}
                          />
                          <Stack.Screen
                            name="BusinessList"
                            component={BusinessList}
                          />
                          <Stack.Screen
                            name="BusinessesScreen"
                            component={BusinessScreen}
                          />
                          <Stack.Screen
                            name="FeaturedList"
                            component={FeaturedScreen}
                          />
                          <Stack.Screen
                            name="BusinessDetails"
                            component={BusinessDetailScreen}
                          /> */}

                          {/* Liked Businesses */}
                          {/* <Stack.Screen
                            name="Favorites"
                            component={FavoritesScreen}
                          /> */}

                          {/* list items screen */}
                          {/* <Stack.Screen
                            name="SavedListScreen"
                            component={SavedListsScreen}
                          /> */}

                          {/* Piece Jobs  */}
                          <Stack.Screen name="GigsScreen" component={GigsScreen} />
                          <Stack.Screen name="JobDetailScreen" component={JobDetailScreen} />
                          <Stack.Screen name="PostJobScreen" component={PostJobScreen} />
                          <Stack.Screen name="WorkerRegistration" component={WorkerRegistrationScreen} />

                          <Stack.Screen name="WorkerProfileScreen" component={WorkerProfileScreen} />
                          <Stack.Screen name="MyPostedGigs" component={MyPostedGigsScreen} />
                          <Stack.Screen name="JobInbox" component={JobInboxScreen} />

                          {/* transport for hire */}
                          <Stack.Screen name="TransportationListScreen" component={TransportationListScreen} />
                          <Stack.Screen name="TransDetailsScreen" component={TransportationDetailsScreen} />
                          <Stack.Screen name="PostTransportationScreen" component={PostTransportationScreen} />
                          <Stack.Screen name="BookTransportationScreen" component={BookTransportationScreen} />

                          {/* loan assist */}
                          <Stack.Screen name="LoanAssist" component={LoanAssist} />
                          <Stack.Screen name="Chatbot" component={Chatbot} />
                          <Stack.Screen name="LoanDetails" component={LoanDetails} />
                          <Stack.Screen name="LoanCompare" component={LoanCompare} />
                          <Stack.Screen name="LoanCalculator" component={LoanCalculator} />
                        </>
                      )}
                    </Stack.Navigator>
                    <StatusBar style={isDarkMode ? "light" : "dark"} />

                    {/*this is the feed back form to collect data from the user */}
                    <FeedbackSystem />
                  </NavigationContainer>
                </BasketProvider>
              </PaperProvider>
              <Toast config={toastConfig} />
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        )}
      </RealmProvider>
      <NavigationBar style="auto" />;
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 16,
    right: 16,
    height: 60,
    // bottom: height * 0.06,
    // height: height * 0.08,
    // marginHorizontal: 10,
    // borderRadius: 70,
    backgroundColor: "#fff",
    borderTopWidth: 0,
    shadowColor: "#0f172a",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 12,
    paddingHorizontal: 12,
    paddingVertical: 0,
    paddingTop: 10,
  },
  fabButtonWrapper: {
    top: -10,
    justifyContent: "center",
    alignItems: "center",
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0f172a",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 12,
  },
});
