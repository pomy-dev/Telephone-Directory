import React, { useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import GigsScreen from "./GigsScreen";
import WorkerRegistration from "./WorkerRegistration";
import WorkerDirectoryScreen from './WorkerDirectoryScreen';
import MyPostedGigsScreen from "./MyPostedGigsScreen";
import JobInboxScreen from "./JobInboxScreen";

// Resources
import { Icons } from "../../constants/Icons";
import { AuthContext } from "../../context/authProvider";

const Drawer = createDrawerNavigator();

// Custom Drawer Content to add the Header matching GigsScreen feel
function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ paddingTop: 0 }}
    >
      <View style={styles.drawerHeader}>
        <Text style={styles.brandText}>
          POMY<Text style={{ color: "#10b981" }}>.</Text>
        </Text>
        <Text style={styles.subtitleText}>Gig Economy Eswatini</Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function GigDrawerNavigator() {
    const { isWorker } = useContext(AuthContext);


  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 280,
          backgroundColor: "#fff",
        },
        // Black and White look
        drawerActiveBackgroundColor: "#000", // Matches GigsScreen active category
        drawerActiveTintColor: "#fff", // White text on black background
        drawerInactiveTintColor: "#666", // Grey for inactive
        drawerLabelStyle: {
          fontSize: 15,
          fontWeight: "600",
          marginLeft: -10,
        },
        drawerItemStyle: {
          borderRadius: 12,
          paddingHorizontal: 10,
          marginVertical: 4,
        },
      }}
    >
      <Drawer.Screen
        name="ExploreGigs"
        component={GigsScreen}
        options={{
          title: "Find Work",
          drawerIcon: ({ color }) => (
            <Icons.Ionicons name="search-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="WorkerDirectory" 
        component={WorkerDirectoryScreen} 
        options={{
          title: ' Hire Workers',
          drawerIcon: ({color}) => <Icons.Ionicons name="people-outline" size={22} color={color} />
        }}
      />
      <Drawer.Screen
        name="MyPostedGigs"
        component={MyPostedGigsScreen}
        options={{
          title: " My Job Posts",
          drawerIcon: ({ color }) => (
            <Icons.Ionicons name="briefcase-outline" size={22} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name=" JobInbox"
        component={JobInboxScreen}
        options={{
          title: " Applications",
          drawerIcon: ({ color }) => (
            <Icons.Ionicons
              name="mail-unread-outline"
              size={22}
              color={color}
            />
          ),
        }}
      />
   
      {/* DYNAMIC WORKER SCREEN */}
      <Drawer.Screen
        name="WorkerRegistration"
        component={WorkerRegistration}
        options={{
          // Toggles label and icon based on worker status
          title: isWorker ? "My Worker Profile" : "Become a Worker",
          drawerIcon: ({ color }) => (
            <Icons.Ionicons 
              name={isWorker ? "person-circle-outline" : "construct-outline"} 
              size={22} 
              color={color} 
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 10,
  },
  brandText: {
    fontSize: 24,
    fontWeight: "900",
    color: "#000",
    letterSpacing: -1,
  },
  subtitleText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    fontWeight: "500",
    textTransform: "uppercase",
  },
});
