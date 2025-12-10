// App.js
import "react-native-gesture-handler";
import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, StatusBar, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { Icons } from "./constants/Icons";
import Toast from "react-native-toast-message";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import * as Notifications from "expo-notifications";
import { RealmProvider } from '@realm/react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

// Basket Provider

import { BasketProvider } from './context/basketContext';

// loan assist
import LoanDetails from "./screens/loans/LoanDetails"
import LoanCompare from "./screens/loans/LoanCompare"
import LoanCalculator from "./screens/loans/LoanCalculator"
import LoanAssist from "./screens/loans/LoanAssist"
import AIAgentChat from "./screens/loans/AIAgent"

// screens
import HomeScreen from "./screens/HomeScreen"
import SavedListsScreen from './screens/SavedListItems'
import FavoritesScreen from "./screens/FavoritesScreen"
import PeopleScreen from "./screens/people/PeopleProfiles"
import SettingsScreen from "./screens/SettingsScreen"

// business directory screens
import DirectoryScreen from "./screens/directory/DirectoryHome"
import BusinessDetailScreen from "./screens/directory/BusinessDetailsScreen"
import BusinessScreen from "./screens/directory/BusinessesScreen"
import FeaturedScreen from "./screens/directory/FeaturedScreen"
import BusinessList from "./screens/directory/BusinessListScreen"

// business tenders
import AddTenderScreen from "./screens/tenders/AddTenderScreen"
import TenderDetailsScreen from "./screens/tenders/TenderDetailsScreen"
import PublishedTendersScreen from "./screens/tenders/PublishedTendersScreen"
import BidTenderScreen from "./screens/tenders/BidTenderScreen"
import MyBidsScreen from "./screens/tenders/MyBidsScreen"

// vancancies screens
import VacanciesScreen from "./screens/vacancies/VacanciesScreen"

// gigs
import GigsScreen from "./screens/piece-jobs/GigsScreen"
import PostJobScreen from "./screens/piece-jobs/PostJobScreen"
// jobs
import JobDetailScreen from "./screens/piece-jobs/JobDetailScreen"

// Property Rental
import PropertyScreen from "./screens/property-rental/PropertyScreen"
// import RentalHousesScreen from "./screens/property-rental/RentalHousesScreen"
import MoreHouses from "./screens/property-rental/MoreHouses"
import HouseDetailsScreen from "./screens/property-rental/HouseDetailsScreen"
import HouseMapScreen from "./screens/property-rental/HouseMapScreen"
import RentalHouseDetailsScreen from "./screens/property-rental/RentalHouseDetailsScreen"
import PostRentalHouseScreen from "./screens/property-rental/PostRentalHouseScreen"
import ApplyRentalScreen from "./screens/property-rental/ApplyRentalScreen"
import MyRentalApplicationsScreen from "./screens/property-rental/MyRentalApplicationsScreen"
import LeaseItemsScreen from "./screens/property-rental/LeaseItemsScreen"
import PostLeaseItemScreen from "./screens/property-rental/PostLeaseItemScreen"
import LeaseItemDetailsScreen from "./screens/property-rental/LeaseItemDetailsScreen"

import AgentDetailsScreen from "./screens/property-rental/AgentDetailsScreen"

// forehires (transportation)
import TransportationListScreen from "./screens/forehires/TransportationListScreen"
import TransportationDetailsScreen from "./screens/forehires/TransportationDetailsScreen"
import PostTransportationScreen from "./screens/forehires/PostTransportationScreen"
import BookTransportationScreen from "./screens/forehires/BookTransportationScreen"

import HomeDealScreen from './screens/special-deals/HomeDeals'
import SearchDealScreen from './screens/special-deals/SearchScreen'
import ItemCompareScreen from './screens/special-deals/ItemCompareScreen'
import BasketScreen from './screens/special-deals/BasketScreen'
import PamphletScanner from './screens/special-deals/PamphletScanner'

// Splash Screen 
import SplashScreen from "./screens/SplashScreen";

// App Context
import { AppContext, AppProvider } from "./context/appContext";
import { AuthProvider } from "./context/authProvider";

// Directory Model
import { Entity, PhoneObject, SocialMediaObject, WorkingHoursObject, TeamMember, GeoPoint, Review } from './models/Entity';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()

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
function Tabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#0f172a",
        tabBarInactiveTintColor: "#94a3b8",
      }}
    >
      <Tab.Screen
        name="SavedListScreen"
        component={SavedListsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Icons.Ionicons name={focused ? "list" : "list-outline"} size={28} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Icons.MaterialCommunityIcons name={focused ? "notebook-check" : "notebook-check-outline"} size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => {
            // console.log(props.accessibilityState?.selected)
            return (
              <View
                // {...props}
                style={styles.fabButtonWrapper}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.fab,
                    {
                      backgroundColor: focused ? "#0f172a" : "#94a3b8",
                    },
                  ]}
                >
                  <Icons.Ionicons
                    name="home"
                    size={28}
                    color={focused ? "#fff" : "#ddd"}
                  />
                </View>
              </View>
            );
          },
        }}
      />
      <Tab.Screen
        name="PeopleScreen"
        component={PeopleScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Icons.MaterialCommunityIcons name={focused ? "account-group" : "account-group-outline"} size={28} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Icons.Ionicons name={focused ? "settings" : "settings-outline"} size={24} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

function AppContent() {
  const {
    isDarkMode,
    theme,
    selectedState,
    setSelectedState,
    notificationsEnabled,
    addNotification,
    isOnline,
    toggleTheme,
    toggleNotifications,
    toggleOnlineMode,
  } = useContext(AppContext);
  const [isAppReady, setIsAppReady] = useState(false);
  const navigationRef = useNavigationContainerRef();

  // useEffect(() => {
  //   if (Platform.OS !== "android") return;

  //   (async () => {
  //     try {
  //       // 1. Enable edge-to-edge (transparent system bars)
  //       await NavigationBar.setPositionAsync("absolute");
  //       await NavigationBar.setBackgroundColorAsync("#000000"); // transparent
  //       await NavigationBar.setButtonStyleAsync("light");
  //     } catch (e) {
  //       console.warn("Edge-to-edge setup failed:", e);
  //     }
  //   })();
  // }, []);

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
      }
    );

    // Request permissions on mount
    requestNotificationPermissions();

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [navigationRef, notificationsEnabled, addNotification]);

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
      <RealmProvider
        schemaVersion={2}
        schema={[Entity, PhoneObject, SocialMediaObject, WorkingHoursObject, TeamMember, GeoPoint, Review]}
      >
        {!isAppReady ? (
          <SplashScreen onConnectionSuccess={() => setIsAppReady(true)} />
        ) : (
          <AuthProvider>
            <>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <PaperProvider theme={theme}>
                  <BasketProvider>
                    <NavigationContainer ref={navigationRef} theme={theme}>
                      <Stack.Navigator screenOptions={{ headerShown: false }}>
                        {/* Tabs as main screen */}
                        <Stack.Screen name="MainTabs" component={Tabs} />

                        {/* Business Directory */}
                        <Stack.Screen name="DirectoryScreen" component={DirectoryScreen} />
                        <Stack.Screen name="BusinessList" component={BusinessList} />
                        <Stack.Screen name="BusinessesScreen" component={BusinessScreen} />
                        <Stack.Screen name="FeaturedList" component={FeaturedScreen} />
                        <Stack.Screen name="BusinessDetails" component={BusinessDetailScreen} />

                        {/* Liked Businesses */}
                        <Stack.Screen name="Favorites" component={FavoritesScreen} />

                        {/* People */}
                        <Stack.Screen name="PeopleScreen" component={PeopleScreen} />

                        {/* list items screen */}
                        <Stack.Screen name="SavedListScreen" component={SavedListsScreen} />

                        {/* Tenders  */}
                        <Stack.Screen name="AddTenderScreen" component={AddTenderScreen} />
                        <Stack.Screen name="TenderDetailsScreen" component={TenderDetailsScreen} />
                        <Stack.Screen name="PublishedTendersScreen" component={PublishedTendersScreen} />
                        <Stack.Screen name="BidTenderScreen" component={BidTenderScreen} />
                        <Stack.Screen name="MyBidsScreen" component={MyBidsScreen} />

                        {/* Piece Jobs  */}
                        <Stack.Screen name="GigsScreen" component={GigsScreen} />
                        <Stack.Screen name="JobDetailScreen" component={JobDetailScreen} />
                        <Stack.Screen name="PostJobScreen" component={PostJobScreen} />

                        {/* vacancies */}
                        <Stack.Screen name="VacanciesScreen" component={VacanciesScreen} />

                        {/* rental houses */}
                        <Stack.Screen name="PropertyScreen" component={PropertyScreen} />
                        {/* <Stack.Screen name="RentalHousesScreen" component={RentalHousesScreen} /> */}
                        <Stack.Screen name="MoreHouses" component={MoreHouses} />
                        <Stack.Screen name="HouseDetailsScreen" component={HouseDetailsScreen} />
                        <Stack.Screen name="HouseMapScreen" component={HouseMapScreen} />
                        <Stack.Screen name="AgentDetailsScreen" component={AgentDetailsScreen} />
                        {/* <Stack.Screen name="RentalHouseDetailsScreen" component={RentalHouseDetailsScreen} /> */}
                        <Stack.Screen name="PostRentalHouseScreen" component={PostRentalHouseScreen} />
                        <Stack.Screen name="ApplyRentalScreen" component={ApplyRentalScreen} />
                        <Stack.Screen name="MyRentalApplicationsScreen" component={MyRentalApplicationsScreen} />

                        {/* lease items */}
                        <Stack.Screen name="LeaseItemsScreen" component={LeaseItemsScreen} />
                        <Stack.Screen name="PostLeaseItemScreen" component={PostLeaseItemScreen} />
                        <Stack.Screen name="LeaseItemDetailsScreen" component={LeaseItemDetailsScreen} />

                        {/* transport for hire */}
                        <Stack.Screen name="TransportationListScreen" component={TransportationListScreen} />
                        <Stack.Screen name="TransportationDetailsScreen" component={TransportationDetailsScreen} />
                        <Stack.Screen name="PostTransportationScreen" component={PostTransportationScreen} />
                        <Stack.Screen name="BookTransportationScreen" component={BookTransportationScreen} />

                        {/* loan assist */}
                        <Stack.Screen name="LoanDetails" component={LoanDetails} />
                        <Stack.Screen name="LoanCompare" component={LoanCompare} />
                        <Stack.Screen name="LoanCalculator" component={LoanCalculator} />
                        <Stack.Screen name="LoanAssist" component={LoanAssist} />
                        <Stack.Screen name="AIAgentChat" component={AIAgentChat} />

                        {/* deals assist */}
                        <Stack.Screen name="SpecialDeals" component={HomeDealScreen} />
                        <Stack.Screen name="SearchDeal" component={SearchDealScreen} />
                        <Stack.Screen name="ItemComparison" component={ItemCompareScreen} />
                        <Stack.Screen name="BasketScreen" component={BasketScreen} />
                        <Stack.Screen name="ScanDealScreen" component={PamphletScanner} />
                      </Stack.Navigator>
                      <StatusBar style={isDarkMode ? "light" : "dark"} />
                    </NavigationContainer>
                  </BasketProvider>
                </PaperProvider>
                <Toast config={toastConfig} />
              </GestureHandlerRootView>
            </>
          </AuthProvider>
        )}
      </RealmProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 50,
    height: 64,
    marginHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderTopWidth: 0,
    shadowColor: "#0f172a",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 12,
    paddingHorizontal: 12,
    paddingVertical: 0,
    paddingTop: 10
  },
  fabButtonWrapper: {
    top: -28,
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
})
