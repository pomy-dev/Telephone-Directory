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

// screens
import HomeScreen from "./screens/HomeScreen"
import VendorHomeScreen from './screens/VendorHome'
import StockFelaHome from "./screens/Stokfela-Home"
import NewsScreen from "./screens/NewsScreen"
import SettingsScreen from "./screens/SettingsScreen"
import MapScreen from "./screens/MapScreen"

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

// houses
import PropertyScreen from "./screens/houses/PropertyScreen"
import RentalHousesScreen from "./screens/houses/RentalHousesScreen"
import RentalHouseDetailsScreen from "./screens/houses/RentalHouseDetailsScreen"
import PostRentalHouseScreen from "./screens/houses/PostRentalHouseScreen"
import ApplyRentalScreen from "./screens/houses/ApplyRentalScreen"
import MyRentalApplicationsScreen from "./screens/houses/MyRentalApplicationsScreen"
import LeaseItemsScreen from "./screens/houses/LeaseItemsScreen"
import PostLeaseItemScreen from "./screens/houses/PostLeaseItemScreen"
import LeaseItemDetailsScreen from "./screens/houses/LeaseItemDetailsScreen"

// forehires (transportation)
import TransportationListScreen from "./screens/forehires/TransportationListScreen"
import TransportationDetailsScreen from "./screens/forehires/TransportationDetailsScreen"
import PostTransportationScreen from "./screens/forehires/PostTransportationScreen"
import BookTransportationScreen from "./screens/forehires/BookTransportationScreen"

// stokfella
import CreateStokfelaScreen from "./screens/stokfella/Create-Stokfela"
import MakeContributionScreen from "./screens/stokfella/Commit-Contributions"
import GroupDetailsScreen from "./screens/stokfella/Groups-Details"
import LoanRequestScreen from "./screens/stokfella/Loan-Details"
import MemberProfile from "./screens/stokfella/Member-Profile"
import TransactionsScreen from "./screens/stokfella/Member-Transactions"

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
                      <Stack.Screen name="RentalHousesScreen" component={RentalHousesScreen} />
                      <Stack.Screen name="RentalHouseDetailsScreen" component={RentalHouseDetailsScreen} />
                      <Stack.Screen name="PostRentalHouseScreen" component={PostRentalHouseScreen} />
                      <Stack.Screen name="ApplyRentalScreen" component={ApplyRentalScreen} />
                      <Stack.Screen name="MyRentalApplicationsScreen" component={MyRentalApplicationsScreen} />

                      {/* lease items */}
                      <Stack.Screen name="LeaseItemsScreen" component={LeaseItemsScreen} />
                      <Stack.Screen name="PostLeaseItemScreen" component={PostLeaseItemScreen} />
                      <Stack.Screen name="LeaseItemDetailsScreen" component={LeaseItemDetailsScreen} />

                      {/* transportation for hire */}
                      <Stack.Screen name="TransportationListScreen" component={TransportationListScreen} />
                      <Stack.Screen name="TransportationDetailsScreen" component={TransportationDetailsScreen} />
                      <Stack.Screen name="PostTransportationScreen" component={PostTransportationScreen} />
                      <Stack.Screen name="BookTransportationScreen" component={BookTransportationScreen} />

                      {/* stokfella */}
                      <Stack.Screen name="StokFellaGroups" component={StockFelaHome} />
                      <Stack.Screen name="CreateStokfellaGroup" component={CreateStokfelaScreen} />
                      <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
                      <Stack.Screen name="PaySubscription" component={MakeContributionScreen} />
                      <Stack.Screen name="MyProfile" component={MemberProfile} />
                      <Stack.Screen name="MakeLoan" component={LoanRequestScreen} />
                      <Stack.Screen name="MyTransactions" component={TransactionsScreen} />

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
