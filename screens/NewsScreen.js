import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export default function NewsScreen() {
  const newsArticles = [
    {
      id: 1,
      title: "Breaking: New Features Released",
      category: "Product Updates",
      time: "2 hours ago",
      image: "/technology-news-abstract.jpg",
      excerpt: "We are excited to announce the launch of several new features that will enhance your experience...",
    },
    {
      id: 2,
      title: "Industry Trends for 2025",
      category: "Analysis",
      time: "5 hours ago",
      image: "/business-trends-graph.png",
      excerpt: "Explore the top trends shaping the industry this year and how they impact your business...",
    },
    {
      id: 3,
      title: "Team Spotlight: Meet Our Engineers",
      category: "Company News",
      time: "1 day ago",
      image: "/team-collaboration-office.png",
      excerpt: "Get to know the talented engineers behind our innovative solutions and their inspiring stories...",
    },
    {
      id: 4,
      title: "Security Update: What You Need to Know",
      category: "Security",
      time: "2 days ago",
      image: "/cybersecurity-digital-lock.png",
      excerpt: "Important security updates have been implemented to keep your data safe and secure...",
    },
  ]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Latest News</Text>
        <Text style={styles.subtitle}>Stay updated with the latest stories</Text>
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={[styles.categoryChip, styles.categoryChipActive]}>
            <Text style={styles.categoryChipTextActive}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>Product</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>Company</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>Security</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>Analysis</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.articlesContainer}>
        {newsArticles.map((article) => (
          <TouchableOpacity key={article.id} style={styles.articleCard}>
            <Image source={{ uri: article.image }} style={styles.articleImage} />
            <View style={styles.articleContent}>
              <View style={styles.articleHeader}>
                <Text style={styles.articleCategory}>{article.category}</Text>
                <Text style={styles.articleTime}>{article.time}</Text>
              </View>
              <Text style={styles.articleTitle}>{article.title}</Text>
              <Text style={styles.articleExcerpt}>{article.excerpt}</Text>
              <View style={styles.articleFooter}>
                <TouchableOpacity style={styles.readMoreButton}>
                  <Text style={styles.readMoreText}>Read More</Text>
                  <Ionicons name="arrow-forward" size={16} color="#e8d5b7" />
                </TouchableOpacity>
                <View style={styles.articleActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="bookmark-outline" size={20} color="#a0a0a0" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="share-outline" size={20} color="#a0a0a0" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#1a1a2e",
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    // color: "#a0a0a0",
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryChip: {
    // backgroundColor: "#2d2d44",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: "#fff",
  },
  categoryChipText: {
    color: "#a0a0a0",
    fontSize: 14,
    fontWeight: "500",
  },
  categoryChipTextActive: {
    // color: "#1a1a2e",
    fontSize: 14,
    fontWeight: "600",
  },
  articlesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  articleCard: {
    backgroundColor: "#2d2d44",
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
  },
  articleImage: {
    width: "100%",
    height: 180,
  },
  articleContent: {
    padding: 16,
  },
  articleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  articleCategory: {
    fontSize: 12,
    fontWeight: "600",
    color: "#e8d5b7",
    textTransform: "uppercase",
  },
  articleTime: {
    fontSize: 12,
    color: "#a0a0a0",
  },
  articleTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#e8d5b7",
    marginBottom: 8,
  },
  articleExcerpt: {
    fontSize: 14,
    color: "#d0d0d0",
    lineHeight: 20,
    marginBottom: 16,
  },
  articleFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  readMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e8d5b7",
  },
  articleActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
})
