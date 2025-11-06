"use client"

import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, TextInput } from "react-native"
import { useState } from "react"
import SecondaryNav from "../../components/SecondaryNav"

export default function NewsroomScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState("For You")

  const categories = ["For You", "Swazi Politics", "Tech Cos", "Celebrity", "Sports", "Business", "Entertainment"]

  const newsArticles = [
    {
      id: "1",
      source: "Times of Eswatini",
      sourceLogo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXmPo5zbVOCFf3_45ioy7iO-DupgzgFhCpUA&s",
      time: "11h",
      headline: "ERS to audit churches over suspected tax evasion",
      reads: "1503 reads",
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOFmhF1J278mXqkMZIeyaIg_uzevqa-ea9Xw&s",
      featured: true,
      category: "Popular",
    },
    {
      id: "2",
      source: "Eswatini Positive News",
      sourceLogo: "https://eswatinipositivenews.online/storage/2025/01/epn-header-01-1536x114.png",
      time: "9h",
      headline: "Parliamentarians concerned about Eswatini 'Stagnant' population growth",
      reads: "1286 reads",
      imageUrl: "https://eswatinipositivenews.online/storage/2025/04/20250412_132502.jpg",
      featured: false,
      category: "Swazi Politics",
    },
    {
      id: "3",
      source: "Eswatini Observer",
      sourceLogo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThFwQvyzgh9QAoY7FY6Z2AZp-cB2mI_vkzIg&s",
      time: "1w",
      headline: "SALARY REVIEW FINAL DRAFT: Doctors, prosecutors' roles downgraded",
      reads: "892 reads",
      imageUrl: "https://eswatiniobserver.com/wp-content/uploads/2025/09/Sa2.jpg",
      featured: false,
      category: "Business",
    },
    {
      id: "4",
      source: "TechCrunch",
      sourceLogo: "https://logo.clearbit.com/techcrunch.com",
      time: "5h",
      headline: "Apple announces new AI features coming to iOS 18 this fall",
      reads: "2341 reads",
      imageUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80",
      featured: false,
      category: "Tech Cos",
    },
    {
      id: "5",
      source: "Eswatini Observer",
      sourceLogo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThFwQvyzgh9QAoY7FY6Z2AZp-cB2mI_vkzIg&s",
      time: "3h",
      headline: "OPEC Fund, Saudi Fund keen to assist Eswatini – Minister",
      reads: "1567 reads",
      imageUrl: "https://eswatiniobserver.com/wp-content/uploads/2025/10/550853392_682128411572994_5317176196764315531_n-1068x743.jpg",
      featured: false,
      category: "Business",
    },
    {
      id: "6",
      source: "ESPN",
      sourceLogo: "https://logo.clearbit.com/espn.com",
      time: "2h",
      headline: "NBA Finals: Lakers dominate in Game 5 to take series lead",
      reads: "3421 reads",
      imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&q=80",
      featured: false,
      category: "Sports",
    },
    {
      id: "7",
      source: "Bloomberg",
      sourceLogo: "https://logo.clearbit.com/bloomberg.com",
      time: "4h",
      headline: "Stock market reaches new highs as tech sector rallies",
      reads: "1876 reads",
      imageUrl: "https://images.unsplash.com/photo-1611974789855-e1a2ed48a620?w=400&q=80",
      featured: false,
      category: "Business",
    },
    {
      id: "8",
      source: "Politico",
      sourceLogo: "https://logo.clearbit.com/politico.com",
      time: "6h",
      headline: "Senate passes landmark infrastructure bill with bipartisan support",
      reads: "2134 reads",
      imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&q=80",
      featured: false,
      category: "U.S. Politics",
    },
  ]

  const filteredArticles =
    selectedCategory === "For You"
      ? newsArticles
      : newsArticles.filter((article) => article.category === selectedCategory)

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryTab, selectedCategory === item && styles.categoryTabActive]}
      onPress={() => setSelectedCategory(item)}
      activeOpacity={0.7}
    >
      <Text style={[styles.categoryText, selectedCategory === item && styles.categoryTextActive]}>{item}</Text>
    </TouchableOpacity>
  )

  const renderNewsArticle = ({ item }) => {
    if (item.featured) {
      return (
        <TouchableOpacity
          style={styles.featuredArticle}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("NewsDetailsScreen", { article: item })}
        >
          <Image source={{ uri: item.imageUrl }} style={styles.featuredImage} />
          <View style={styles.articleContent}>
            <View style={styles.sourceRow}>
              <Image
                source={{ uri: item.sourceLogo }}
                style={styles.sourceLogoImage}
                defaultSource={require("../../assets/placeholder-logo.png")}
              />
              <Text style={styles.sourceName}>{item.source}</Text>
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
            <Text style={styles.featuredHeadline}>{item.headline}</Text>
            <Text style={styles.readsText}>{item.reads}</Text>
          </View>
        </TouchableOpacity>
      )
    }

    return (
      <TouchableOpacity
        style={styles.regularArticle}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("NewsDetailsScreen", { article: item })}
      >
        <View style={styles.articleLeft}>
          <View style={styles.sourceRow}>
            <Image
              source={{ uri: item.sourceLogo }}
              style={styles.sourceLogoImageSmall}
              defaultSource={require("../../assets/placeholder-logo.png")}
            />
            <Text style={styles.sourceName}>{item.source}</Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
          <Text style={styles.regularHeadline}>{item.headline}</Text>
          <Text style={styles.readsText}>{item.reads}</Text>
        </View>
        <Image source={{ uri: item.imageUrl }} style={styles.thumbnailImage} />
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <SecondaryNav title="News" rightIcon="notifications-outline" onRightPress={() => alert("Notifications!")} />


      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <FlatList
        data={filteredArticles}
        renderItem={renderNewsArticle}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.newsList}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#cbd5e1",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#0f172a",
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  notificationIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#cbd5e1",
  },
  categoriesContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  categoriesList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  categoryTab: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  categoryTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#0f172a",
  },
  categoryText: {
    fontSize: 15,
    color: "#94a3b8",
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "#0f172a",
    fontWeight: "700",
  },
  newsList: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 100,
  },
  featuredArticle: {
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: "#fff",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  featuredImage: {
    width: "100%",
    height: 240,
    backgroundColor: "#f1f5f9",
  },
  articleContent: {
    padding: 16,
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sourceLogoImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
  },
  sourceLogoImageSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
  },
  sourceName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  timeText: {
    fontSize: 13,
    color: "#94a3b8",
  },
  featuredHeadline: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 26,
    marginBottom: 12,
  },
  readsText: {
    fontSize: 13,
    color: "#94a3b8",
  },
  regularArticle: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 16,
  },
  articleLeft: {
    flex: 1,
  },
  regularHeadline: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    lineHeight: 22,
    marginBottom: 8,
    marginTop: 8,
  },
  thumbnailImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
  },
})
