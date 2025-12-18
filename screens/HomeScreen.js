"use client"

import { StyleSheet, Platform, StatusBar, Text, View, Image, TouchableOpacity, FlatList, ScrollView } from "react-native"
import React, { useEffect, useState } from "react"
import TopNav from "../components/TopNav"
import { AppContext } from "../context/appContext"
import { Images } from '../constants/Images'
import PersonalizedAdsSection from "../components/PersonalizedAdsSection"

export default function HomeScreen({ navigation }) {
  const { theme, isDarkMode, selectedState, isOnline, notificationsEnabled, notifications } = React.useContext(AppContext)
  const [greetingText, setGreetingText] = useState("");
  const [startingText, setStartingText] = useState("");

  const sampleAds = [
    {
      id: "1",
      brandName: "Hungry Lion",
      brandLogo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpya4HK6j17V34ZvxPLYknyc4xLgDEZt5wAA&s",
      title: "Big Boss Cheese Meal - Only R50",
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDmje78j3KWDjwzNhJliz-bH5khVfJli1EMw&s",
      category: "food",
    },
    {
      id: "2",
      brandName: "MTN Eswatini",
      brandLogo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9GiO2ctjyihVwKel9jQuEK4hf5YDo92q_jA&s",
      title: "It's a Makoya Tuesday - E10 for 2GB",
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLnkDWQ_uX5lm9o1adi6mfjN73Ohxm2-ExRA&s",
      category: "telecom",
    },
    {
      id: "3",
      brandName: "FNB",
      brandLogo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRosUIa-ejr5HS_vIbnNpVgaOUUpQD3p7cnbg&s",
      title: "Zero fees on debit orders",
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKvH6VnhgXitQgyBD2ro_04Cvbanh2Wobpgw&s",
      category: "finance",
    },
    {
      id: "4",
      brandName: "Eswatini Telecom",
      brandLogo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHvcUUqf4x1GzNMn5vbZ95uhxNIIqkFIaAqw&s",
      title: "Massive data drop",
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYMDAWLG_u75RgvwzaQbIKDP-BZJ26iMY-gg&s",
      category: "telecom",
    },
  ]

  const services = [
    { id: "1", screen: "GigsScreen", name: "Quick Jobs", image: Images.piecejob },
    { id: "2", screen: "TransportationListScreen", name: "For-Hires", image: Images.forhire },
    { id: "3", screen: "LoanAssist", name: "Loan Assist", image: Images.Loans },
    { id: "4", screen: "PropertyScreen", name: "Property Rental", image: Images.houses },
    { id: "5", screen: "SpecialDeals", name: "Special Deals", image: Images.deals },
    { id: "6", screen: "VacanciesScreen", name: "Vacancies", image: Images.vacancies },
    { id: "7", screen: "PublishedTendersScreen", name: "Tenders", image: Images.tender },
    { id: "8", screen: "DirectoryScreen", name: "Phonebook", image: Images.Phonebook },
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

  const renderService = ({ item }) => (
    <TouchableOpacity style={styles.serviceItem} activeOpacity={0.7} onPress={() => { navigation.navigate(item.screen) }}>
      <View style={styles.serviceIconContainer}>
        <Image source={item.image} style={styles.serviceIcon} resizeMode="contain" />
      </View>
      <Text style={styles.serviceText} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  )

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      <TopNav
        onCartPress={() => console.log("Cart pressed")}
        onNotificationPress={() => console.log("Notifications pressed")}
        onSearch={() => console.log("Search tapped")}
      />

      <View style={styles.greetingSection}>
        <Text style={styles.greetingText}>Good {greetingText} 👋</Text>
        <Text style={styles.startingText}>{startingText}</Text>
      </View>

      <View style={styles.servicesSection}>
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

      <PersonalizedAdsSection ads={sampleAds} maxAdsToShow={10} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 50,
  },
  greetingSection: {
    paddingHorizontal: 10,
    paddingTop: 24,
    paddingBottom: 20,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: "200",
    color: "#0f172a",
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
    backgroundColor: "#fff",
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
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
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
