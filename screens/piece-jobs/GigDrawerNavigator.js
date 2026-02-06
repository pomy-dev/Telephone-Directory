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
    const { user, isWorker } = useContext(AuthContext);

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ paddingTop: 0 }}
    >
      <View style={styles.drawerHeader}>
        {/* User Info Section */}
        <View style={styles.userSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}
            </Text>
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.brandText}>
              {user?.displayName || "User Account"}
              <Text style={{ color: "#10b981" }}>.</Text>
            </Text>
            
            <View style={styles.statusBadgeRow}>
                <Text style={styles.subtitleText}>{user?.email || "Welcome to Pomy"}</Text>
                {isWorker && (
                    <View style={styles.workerBadge}>
                        <Text style={styles.workerBadgeText}>WORKER</Text>
                    </View>
                )}
            </View>
          </View>
        </View>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function GigDrawerNavigator() {
    const { user, isWorker } = useContext(AuthContext);


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
          title: isWorker ? " My Worker Profile" : " Become a Worker",
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
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 10,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarLetter: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
  },
  brandText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#000",
    letterSpacing: -0.5,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  subtitleText: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  workerBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  workerBadgeText: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: '800',
  },
});
