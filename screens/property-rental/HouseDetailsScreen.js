"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
  Dimensions,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import SecondaryNav from "../../components/SecondaryNav"

const HouseDetailsScreen = ({ navigation, route }) => {
  const { property } = route?.params || {}
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const { width } = Dimensions.get("window")

  if (!property) {
    return (
      <View style={styles.container}>
        <Text>Property not found.</Text>
      </View>
    )
  }

  const images = property.images || []
  const hasImages = images.length > 0

  const nextImage = () => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))

  const prevImage = () => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))

  const handleContactAgent = () => {
    navigation?.navigate("AgentDetails", { agent: property.agent })
  }

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 50 }]}>
      <ScrollView showsVerticalScrollIndicator={false} scrollEventThrottle={16}>
        {/* HEADER */}
        <SecondaryNav
          title="Property Details"
          rightIcon={isFavorite ? "heart" : "heart-outline"}
          onBackPress={() => navigation?.goBack()}
          onRightPress={() => setIsFavorite(!isFavorite)}
        />

        {/* IMAGE CAROUSEL */}
        <View style={styles.imageContainer}>
          {hasImages ? (
            <>
              <Image source={{ uri: images[currentImageIndex] }} style={styles.image} />

              {/* NAV ARROWS */}
              {images.length > 1 && (
                <>
                  <TouchableOpacity onPress={prevImage} style={styles.arrowLeft}>
                    <Ionicons name="chevron-back" size={26} color="#000" />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={nextImage} style={styles.arrowRight}>
                    <Ionicons name="chevron-forward" size={26} color="#000" />
                  </TouchableOpacity>

                  <View style={styles.imageCounter}>
                    <Text style={styles.imageCounterText}>
                      {currentImageIndex + 1}/{images.length}
                    </Text>
                  </View>
                </>
              )}
            </>
          ) : (
            <View style={styles.noImage}>
              <Ionicons name="image-outline" size={50} color="#aaa" />
              <Text style={styles.noImageText}>No Images Available</Text>
            </View>
          )}
        </View>

        {/* TITLE + LOCATION + PRICE */}
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{property.title}</Text>

            <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
              <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={26} color="#FF6B6B" />
            </TouchableOpacity>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color="#999" />
            <Text style={styles.location}>{property.location}</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>E{property.price.toLocaleString()}</Text>
            <Text style={styles.rentalPeriod}>{property.rentalPeriod}</Text>
          </View>
        </View>

        {/* PROPERTY DETAILS GRID */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Property Details</Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailBox}>
              <View style={styles.detailIconBox}>
                <Ionicons name="home-outline" size={20} color="#000" />
              </View>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>{property.type}</Text>
            </View>

            {property.beds && (
              <View style={styles.detailBox}>
                <View style={styles.detailIconBox}>
                  <Ionicons name="bed-outline" size={20} color="#000" />
                </View>
                <Text style={styles.detailLabel}>Bedrooms</Text>
                <Text style={styles.detailValue}>{property.beds}</Text>
              </View>
            )}

            {property.baths && (
              <View style={styles.detailBox}>
                <View style={styles.detailIconBox}>
                  <Ionicons name="water-outline" size={20} color="#000" />
                </View>
                <Text style={styles.detailLabel}>Bathrooms</Text>
                <Text style={styles.detailValue}>{property.baths}</Text>
              </View>
            )}

            {property.sqm && (
              <View style={styles.detailBox}>
                <View style={styles.detailIconBox}>
                  <Ionicons name="expand-outline" size={20} color="#000" />
                </View>
                <Text style={styles.detailLabel}>Size</Text>
                <Text style={styles.detailValue}>{property.sqm} sqm</Text>
              </View>
            )}
          </View>
        </View>

        {/* DESCRIPTION */}
        {property.description && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{property.description}</Text>
          </View>
        )}

        {/* AMENITIES */}
        {property.amenities?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesContainer}>
              {property.amenities.map((item, i) => (
                <View key={i} style={styles.amenityRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.amenityText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* FINANCIAL DETAILS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Financial Details</Text>

          {property.depositRequired && (
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Deposit Required</Text>
              <Text style={styles.financialValue}>{property.depositPercentage || 100}%</Text>
            </View>
          )}

          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Finder's Fee</Text>
            <Text style={property.findersFee ? styles.financialValue : styles.financialValueGreen}>
              {property.findersFee ? `E${property.findersFee}` : "No Fee Required"}
            </Text>
          </View>
        </View>

        {/* AGENT CARD */}
        {property.agent && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Agent</Text>

            <View style={styles.agentRow}>
              <Image
                source={{
                  uri: property.agent.avatar || "https://via.placeholder.com/50",
                }}
                style={styles.agentAvatar}
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.agentName}>{property.agent.name}</Text>
                <Text style={styles.agentTitle}>{property.agent.title || "Real Estate Agent"}</Text>
              </View>
            </View>

            <View style={styles.agentButtonsRow}>
              <TouchableOpacity style={styles.agentButton}>
                <Ionicons name="call-outline" size={18} color="#000" />
                <Text style={styles.agentButtonText}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.agentButton}>
                <Ionicons name="mail-outline" size={18} color="#000" />
                <Text style={styles.agentButtonText}>Email</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.agentButton} onPress={handleContactAgent}>
                <Ionicons name="person-outline" size={18} color="#000" />
                <Text style={styles.agentButtonText}>Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* BOTTOM CTA */}
      <View style={styles.bottomCTA}>
        <TouchableOpacity style={styles.scheduleButton}>
          <Text style={styles.scheduleButtonText}>Schedule Viewing</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  imageContainer: {
    height: 320,
    backgroundColor: "#eee",
    position: "relative",
  },
  image: { width: "100%", height: "100%" },

  arrowLeft: {
    position: "absolute",
    left: 12,
    top: "45%",
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  arrowRight: {
    position: "absolute",
    right: 12,
    top: "45%",
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  imageCounter: {
    position: "absolute",
    bottom: 14,
    right: 14,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  imageCounterText: { color: "#fff", fontSize: 12, fontWeight: "600" },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: { fontSize: 24, fontWeight: "700", color: "#000", flex: 1, letterSpacing: -0.5 },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  location: { fontSize: 14, color: "#999" },

  priceContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingTop: 8,
  },
  price: { fontSize: 32, fontWeight: "700", color: "#000", letterSpacing: -1 },
  rentalPeriod: { fontSize: 13, color: "#bbb", marginBottom: 4, fontWeight: "500" },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
    color: "#000",
    letterSpacing: -0.3,
  },

  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  detailBox: {
    width: "30%",
    alignItems: "center",
    marginBottom: 16,
  },
  detailIconBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#f0f1f3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: { fontSize: 11, color: "#999", marginBottom: 4, fontWeight: "500" },
  detailValue: { fontSize: 16, fontWeight: "600", color: "#000" },

  descriptionText: { fontSize: 14, color: "#666", lineHeight: 22 },

  amenitiesContainer: {
    gap: 10,
  },
  amenityRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  amenityText: { fontSize: 14, color: "#666" },

  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f1f3",
  },
  financialLabel: { fontSize: 14, color: "#999", fontWeight: "500" },
  financialValue: { fontSize: 14, fontWeight: "700", color: "#000" },
  financialValueGreen: { fontSize: 14, fontWeight: "700", color: "#4CAF50" },

  agentRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 },
  agentAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#f0f1f3" },
  agentName: { fontSize: 16, fontWeight: "700", color: "#000" },
  agentTitle: { fontSize: 13, color: "#999", marginTop: 3, fontWeight: "500" },

  agentButtonsRow: { flexDirection: "row", gap: 10 },
  agentButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 11,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  agentButtonText: { fontSize: 13, fontWeight: "600", color: "#000" },

  bottomSpacer: {
    height: 120,
  },

  bottomCTA: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f1f3",
  },
  scheduleButton: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scheduleButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },

  noImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  noImageText: { color: "#aaa", marginTop: 8 },
})

export default HouseDetailsScreen
