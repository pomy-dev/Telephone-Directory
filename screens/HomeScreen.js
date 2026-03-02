"use client"

import {
  StyleSheet, Platform, StatusBar, Text, View, Image, TouchableOpacity,
  FlatList, ScrollView, Dimensions
} from "react-native"
import React, { useEffect, useState } from "react";
import { Badge } from "react-native-paper";
import TopNav from "../components/TopNav"
import { AppContext } from "../context/appContext"
import { AuthContext } from "../context/authProvider"
import { CustomToast } from "../components/customToast"
import { Images } from '../constants/Images'
import CustomLoader from "../components/customLoader"
import PersonalizedAdsSection from "../components/PersonalizedAdsSection"
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchOpenGigsCount, subscribeToGigs } from "../service/Supabase-Fuctions"

const { height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { theme, isDarkMode, notifications } = React.useContext(AppContext)
  const { logout } = React.useContext(AuthContext)
  const [greetingText, setGreetingText] = useState("");
  const [gigsCount, setGigsCount] = useState(0);
  const [startingText, setStartingText] = useState("");
  const [islogingOut, setIsLoggingOut] = useState(false)

  const services = [
    { id: "1", screen: "GigsScreen", count: { gigsCount }, name: "Quick Jobs", image: Images.piecejob },
    { id: "2", screen: "TransportationListScreen", count: 0, name: "For-Hires", image: Images.forhire },
    { id: "3", screen: "LoanAssist", count: 0, name: "Smart Financing", image: Images.Loans },
    { id: "8", screen: "DirectoryScreen", count: 0, name: "Telephone Directory", image: Images.bs_eswatini },
  ]

  useEffect(() => {
    const now = new Date()
    const hour = now.getHours()
    let greeting = ""

    if (hour >= 5 && hour < 12) greeting = "Morning"
    else if (hour >= 12 && hour < 17) greeting = "Afternoon"
    else if (hour >= 17 && hour < 21) greeting = "Evening"
    else greeting = "Night"

    setGreetingText(greeting)

    switch (greeting) {
      case "Morning":
        setStartingText("Let's start the day with some new plans")
        break
      case "Afternoon":
        setStartingText("Keep going strong this afternoon")
        break
      case "Evening":
        setStartingText("Time to relax and enjoy your evening")
        break
      default:
        setStartingText("What are we doing today?")
        break
    }

  }, [])

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
        console.log('Error fetching gigs count', err);
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

  const renderService = ({ item }) => (
    <TouchableOpacity style={[styles.serviceItem]} activeOpacity={0.7} onPress={() => { navigation.navigate(item.screen) }}>
      <View style={[styles.serviceIconContainer, { backgroundColor: theme.colors.sub_card, borderColor :theme.colors.sub_card }]}>
        <Image source={item.image} style={styles.serviceIcon} resizeMode="contain" />
        {item.name === "Quick Jobs" && <Badge style={{ position: 'absolute', top: -4, right: -2 }}>{gigsCount}</Badge>}
      </View>
      <Text style={[styles.serviceText, { color: theme.colors.text }]} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  )

  const handleLogout = () => {
    try {
      setIsLoggingOut(true)
      logout()
      CustomToast("Logged out 🚶🏾‍♂️‍➡️", "Sign In to start again")
    } catch (error) {
      console.log("Logout error:", error.message)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleNotificationPress = () => {
    if (notifications.length > 0) {
      navigation.navigate("Nots")
    } else {
      CustomToast("No notifications", "You have no new notifications at the moment.")
      return
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      {islogingOut && <CustomLoader />}

      <TopNav
        onCartPress={() => console.log("Cart pressed")}
        onNotificationPress={handleNotificationPress}
        notificationCount={notifications.length}
        onSearch={() => console.log("Search tapped")}
        onLogout={() => handleLogout()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.greetingSection}>
          <Text style={[styles.greetingText, { color: theme.colors.text }]}>Good {greetingText} 👋</Text>
          <Text style={styles.startingText}>{startingText}</Text>
        </View>

        <View style={[styles.servicesSection, { backgroundColor: theme.colors.card }]}>
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

        <PersonalizedAdsSection />
        {<View style={{ height: 100 }} />}
      </ScrollView>
    </SafeAreaView>
  )
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
    justifyContent: "space-between",
  },
  serviceItem: {
    alignItems: "center",
    width: 76,
    marginVertical: 8,
  },
  serviceIconContainer: {
    width: 65,
    height: 65,
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
    width: '100%',
    height: '100%',
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
})
