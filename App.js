// App.js
import "react-native-gesture-handler";
import React, { useContext, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Images } from './constants/Images';
import Toast from "react-native-toast-message";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import * as Notifications from "expo-notifications";
import { RealmProvider } from '@realm/react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

// Publications
import PublicationsStackNavigator from "./navigator/PublicationsStack";
import CorporateStackNavigator from "./navigator/CorporateStack";
import EventsStackNavigator from "./navigator/EventsStack";

// Local Market
import LocalMarketStackNavigator from "./navigator/LocalMarketStack";

// screens
import HomeScreen from "./screens/HomeScreen"
import VendorHomeScreen from './screens/VendorHome'
import StockFelaHome from "./screens/Stokfela-Home"
import NewsScreen from "./screens/NewsScreen"
import SettingsScreen from "./screens/SettingsScreen"
import MapScreen from "./screens/MapScreen"

// ride screen
import RideRequestScreen from "./screens/ride/RideRequestScreen"
// business directory
import DirectoryScreen from "./screens/directory/DirectoryHome"
// Food ordering
import FoodOrderingScreen from "./screens/ordering/FoodOrderingScreen"
// news
import NewsroomScreen from "./screens/news/NewsroomScreen"
import NewsDetailsScreen from "./screens/news/NewsDetailsScreen"

// business tenders
import BusinessTendersScreen from "./screens/tenders/BusinessTendersScreen"
// vancancies screens
import VacanciesScreen from "./screens/vacancies/VacanciesScreen"

// gigs
import GigsScreen from "./screens/piece-jobs/GigsScreen"
import PostJobScreen from "./screens/piece-jobs/PostJobScreen"
// jobs
import JobDetailScreen from "./screens/piece-jobs/JobDetailScreen"

// houses
import HouseScreen from "./screens/houses/HouseScreen"
import HouseDetailsScreen from "./screens/houses/HouseDetailsScreen"

// stokfella
import CreateStokfelaScreen from "./screens/stokfella/Create-Stokfela"
import MakeContributionScreen from "./screens/stokfella/Commit-Contributions"
import GroupDetailsScreen from "./screens/stokfella/Groups-Details"
import LoanRequestScreen from "./screens/stokfella/Loan-Details"
import MemberProfile from "./screens/stokfella/Member-Profile"
import TransactionsScreen from "./screens/stokfella/Member-Transactions"

// vendor chain
import BulkGroupsScreen from './screens/vendor-chain/BulkGroupScreen'
import GroupManagementScreen from './screens/vendor-chain/GroupManagementScreen'
import SearchScreen from './screens/vendor-chain/SearchScreen'
import VendorInventoryScreen from './screens/vendor-chain/VendorInventoryScreen'
import SupplyChainScreen from './screens/vendor-chain/SupplyChain'
import OrdersScreen from './screens/vendor-chain/OrderScreen'
import VendorProfileScreen from './screens/vendor-chain/ProfileScreen'
import CustomerStoreScreen from './screens/vendor-chain/CustomerStoreScreen'
import DiscussionThreadScreen from './screens/vendor-chain/DiscussionThread'
import VendorRegistrationScreen from './screens/vendor-chain/AddVendor'
import CreateVendorGroup from './components/createVendorGroup'


import TabNavigator from "./components/TabNavigator";

// Splash Screen 
import SplashScreen from "./screens/directory/SplashScreen";

// drawer content
import CustomDrawerContent from "./components/Drawer";
import { Icons } from "./constants/Icons";

// App Context
import { AppContext, AppProvider } from "./context/appContext";
import { AuthProvider } from "./context/authProvider";

// Directory Model
import { Entity, PhoneObject, SocialMediaObject, WorkingHoursObject, TeamMember, GeoPoint, Review } from './models/Entity';

// theme
import { theme as VTheme } from './constants/vendorTheme';

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
const Drawer = createDrawerNavigator();

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
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Icons.Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ),
          tabBarActiveTintColor: "#0f172a",
          tabBarInactiveTintColor: "#94a3b8",
        }}
      />
      <Tab.Screen
        name="VendorHome"
        component={VendorHomeScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Icons.MaterialCommunityIcons name={focused ? "storefront" : "storefront-outline"} size={24} color={color} />
          ),
          tabBarActiveTintColor: "#0f172a",
          tabBarInactiveTintColor: "#94a3b8",
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarButton: (props) => (
            <TouchableOpacity {...props} style={styles.fabButtonWrapper} activeOpacity={0.8}>
              <View style={styles.fab}>
                <Icons.Ionicons name="map-outline" size={28} color="#fff" />
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen
        name="Stokfella"
        component={StockFelaHome}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Icons.MaterialCommunityIcons name={focused ? "account-group" : "account-group-outline"} size={28} color={color} />
          ),
          tabBarActiveTintColor: "#0f172a",
          tabBarInactiveTintColor: "#94a3b8",
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Icons.Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
          ),
          tabBarActiveTintColor: "#0f172a",
          tabBarInactiveTintColor: "#94a3b8",
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
                  <NavigationContainer ref={navigationRef} theme={theme}>
                    {/* <Drawer.Navigator
                      drawerContent={(props) => (
                        <CustomDrawerContent
                          {...props}
                          states={[
                            {
                              id: "bs_eswatini",
                              name: "BE",
                              coatOfArmsIcon: Images.bs_eswatini,
                              flagIcon: "flag-outline",
                            },
                            {
                              id: "eptc",
                              name: "E.P.T.C",
                              coatOfArmsIcon: Images.eptc,
                              flagIcon: "flag-outline",
                            },
                          ]}
                          selectedState={selectedState}
                          setSelectedState={setSelectedState}
                          isDarkMode={isDarkMode}
                          notificationsEnabled={notificationsEnabled}
                          isOnline={isOnline}
                          toggleTheme={toggleTheme}
                          toggleNotifications={toggleNotifications}
                          toggleOnlineMode={toggleOnlineMode}
                        />
                      )}
                      screenOptions={{
                        drawerStyle: {
                          width: 250,
                        },
                      }}
                    >
                      <Drawer.Screen
                        name="Tabs"
                        component={TabNavigator}
                        options={{ headerShown: false }}
                      />
                      <Drawer.Screen
                        name="Publications"
                        component={PublicationsStackNavigator}
                        options={{ headerShown: false }}
                        initialParams={{ selectedState, contentType: "Publications" }}
                      />
                      <Drawer.Screen
                        name="Promotions"
                        component={PublicationsStackNavigator}
                        options={{ headerShown: false }}
                        initialParams={{ selectedState, contentType: "Promotions" }}
                      />
                      <Drawer.Screen
                        name="Corporate"
                        component={CorporateStackNavigator}
                        options={{ headerShown: false }}
                      />
                      <Drawer.Screen
                        name="Event"
                        component={EventsStackNavigator}
                        options={{ headerShown: false }}
                      />
                      <Drawer.Screen
                        name="LocalVendor"
                        component={LocalMarketStackNavigator}
                        options={{ headerShown: false }}
                      />
                    </Drawer.Navigator> */}
                    <Stack.Navigator screenOptions={{ headerShown: false }}>
                      {/* Tabs as main screen */}
                      <Stack.Screen name="MainTabs" component={Tabs} />

                      <Stack.Screen name="MapScreen" component={MapScreen} />
                      <Stack.Screen name="NewsScreen" component={NewsScreen} />

                      {/* ride */}
                      <Stack.Screen name="RideRequestScreen" component={RideRequestScreen} />

                      {/* food */}
                      <Stack.Screen name="FoodOrderingScreen" component={FoodOrderingScreen} />

                      {/* business directory */}
                      <Stack.Screen name="DirectoryScreen" component={DirectoryScreen} />

                      {/* news room */}
                      <Stack.Screen name="NewsroomScreen" component={NewsroomScreen} />
                      <Stack.Screen name="NewsDetailsScreen" component={NewsDetailsScreen} />

                      {/* Tenders  */}
                      <Stack.Screen name="BusinessTendersScreen" component={BusinessTendersScreen} />

                      {/* Piece Jobs  */}
                      <Stack.Screen name="GigsScreen" component={GigsScreen} />
                      <Stack.Screen name="JobDetailScreen" component={JobDetailScreen} />
                      <Stack.Screen name="PostJobScreen" component={PostJobScreen} />

                      {/* vacancies */}
                      <Stack.Screen name="VacanciesScreen" component={VacanciesScreen} />

                      {/* houses */}
                      <Stack.Screen name="HouseScreen" component={HouseScreen} />
                      <Stack.Screen name="HouseDetailsScreen" component={HouseDetailsScreen} />

                      {/* stokfella */}
                      <Stack.Screen name="StokFellaGroups" component={StockFelaHome} />
                      <Stack.Screen name="CreateStokfellaGroup" component={CreateStokfelaScreen} />
                      <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
                      <Stack.Screen name="PaySubscription" component={MakeContributionScreen} />
                      <Stack.Screen name="MyProfile" component={MemberProfile} />
                      <Stack.Screen name="MakeLoan" component={LoanRequestScreen} />
                      <Stack.Screen name="MyTransactions" component={TransactionsScreen} />

                      {/* vendor Chain */}
                      <Stack.Screen name="VendorHome" component={VendorHomeScreen} />
                      <Stack.Screen name="BulkGroupsScreen" component={BulkGroupsScreen} />
                      <Stack.Screen name="GroupManagement" component={GroupManagementScreen} />
                      <Stack.Screen name="SearchScreen" component={SearchScreen} />
                      <Stack.Screen name="VendorInventoryScreen" component={VendorInventoryScreen} />
                      <Stack.Screen name="SupplyChainScreen" component={SupplyChainScreen} />
                      <Stack.Screen name="OrdersScreen" component={OrdersScreen} />
                      <Stack.Screen name="VendorProfileScreen" component={VendorProfileScreen} />
                      <Stack.Screen name="CustomerStoreScreen" component={CustomerStoreScreen} />
                      <Stack.Screen name="DiscussionThreadScreen" component={DiscussionThreadScreen} />
                      <Stack.Screen name="AddVendor" component={VendorRegistrationScreen} />
                      <Stack.Screen name="CreateVendorGroup" component={CreateVendorGroup} />

                    </Stack.Navigator>
                    <StatusBar style={isDarkMode ? "light" : "dark"} />
                  </NavigationContainer>
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
    bottom: 30,
    height: 64,
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
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0f172a",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 12,
  },
})
