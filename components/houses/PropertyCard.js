"use client"

import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"

const PropertyCard = ({ property, onPress, onMapPress, onAgentPress }) => {
  const { width } = Dimensions.get("window")
  const cardWidth = width - 1
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const images = property.images || []
  const hasImages = images.length > 0

  const goToPreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const getDepositText = () => {
    if (!property.depositRequired) return null
    return `${property.depositPercentage || 100}% deposit required`
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Image Section */}
      <View style={[styles.imageContainer, { width: cardWidth }]}>
        {hasImages ? (
          <>
            <Image source={{ uri: images[currentImageIndex] }} style={styles.image} resizeMode="cover" />
            {images.length > 1 && (
              <>
                <TouchableOpacity style={styles.arrowLeft} onPress={goToPreviousImage}>
                  <Ionicons name="chevron-back" size={20} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.arrowRight} onPress={goToNextImage}>
                  <Ionicons name="chevron-forward" size={20} color="#000" />
                </TouchableOpacity>
              </>
            )}
            {images.length > 1 && (
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {currentImageIndex + 1}/{images.length}
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.noImage}>
            <Ionicons name="image-outline" size={42} color="#aaa" />
            <Text style={styles.noImageText}>No Image Available</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.heartButton}
          onPress={(e) => {
            e.stopPropagation()
            setIsFavorite(!isFavorite)
          }}
        >
          <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={22} color="#FF6B6B" />
        </TouchableOpacity>

        {property.type && (
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{property.type}</Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {property.title || "Unnamed Property"}
        </Text>
        <Text style={styles.location}>{property.location || "Location not specified"}</Text>

        {property.rentalPeriod && <Text style={styles.rentalPeriod}>{property.rentalPeriod}</Text>}

        <Text style={styles.price}>{property.price ? `E${property.price.toLocaleString()}` : "Price on request"}</Text>

        {property.depositRequired && <Text style={styles.deposit}>{getDepositText()}</Text>}

        {property.findersFee ? (
          <Text style={styles.findersFee}>
            Finder's Fee: <Text style={{ fontWeight: "700" }}>E{property.findersFee}</Text>
          </Text>
        ) : (
          <Text style={styles.noFindersFee}>No Finder's Fee Required</Text>
        )}

        {property.description && (
          <Text style={styles.description} numberOfLines={2}>
            {property.description}
          </Text>
        )}

        <View style={styles.specRow}>
          {property.beds && (
            <View style={styles.specItem}>
              <Ionicons name="bed-outline" size={14} color="#555" />
              <Text style={styles.specText}>{property.beds} Beds</Text>
            </View>
          )}
          {property.baths && (
            <View style={styles.specItem}>
              <Ionicons name="water-outline" size={14} color="#555" />
              <Text style={styles.specText}>{property.baths} Baths</Text>
            </View>
          )}
          {property.sqm && (
            <View style={styles.specItem}>
              <Ionicons name="home-outline" size={14} color="#555" />
              <Text style={styles.specText}>{property.sqm} sqm</Text>
            </View>
          )}
          {property.hectares && (
            <View style={styles.specItem}>
              <Ionicons name="leaf-outline" size={14} color="#555" />
              <Text style={styles.specText}>{property.hectares} ha</Text>
            </View>
          )}
        </View>

        {property.amenities && property.amenities.length > 0 && (
          <View style={styles.amenitiesSection}>
            <Text style={styles.amenitiesLabel}>Amenities:</Text>
            <View style={styles.amenitiesList}>
              {property.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityTag}>
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {property.agent && (
          <View style={styles.agentSection}>
            <TouchableOpacity style={styles.agentProfile} onPress={() => onAgentPress?.(property.agent)}>
              <Image
                source={{ uri: property.agent.avatar || "https://via.placeholder.com/36" }}
                style={styles.agentAvatar}
              />
              <View style={styles.agentInfo}>
                <Text style={styles.agentName}>{property.agent.name}</Text>
                <Text style={styles.agentRole}>{property.agent.title || "Agent"}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#ccc" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.mapButton} onPress={onMapPress}>
            <Ionicons name="map-outline" size={16} color="#000" />
            <Text style={styles.mapButtonText}>Map</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.callButton} onPress={onPress}>
            <Ionicons name="call-outline" size={16} color="#fff" />
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    overflow: "hidden",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  imageContainer: {
    position: "relative",
    height: 200,
    backgroundColor: "#f2f2f2",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  noImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
  },
  heartButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#fff",
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  typeBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#000",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  imageCounter: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  imageCounterText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  arrowLeft: {
    position: "absolute",
    left: 10,
    top: "45%",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 6,
  },
  arrowRight: {
    position: "absolute",
    right: 10,
    top: "45%",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 16,
    padding: 6,
  },
  content: {
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  location: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  rentalPeriod: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  deposit: {
    fontSize: 12,
    color: "#E8643E",
    fontWeight: "600",
    marginBottom: 4,
  },
  findersFee: {
    fontSize: 12,
    color: "#8a7f5f",
    marginBottom: 8,
  },
  noFindersFee: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: "#555",
    marginBottom: 10,
  },
  specRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  specText: {
    fontSize: 12,
    color: "#555",
  },
  amenitiesSection: {
    marginBottom: 12,
  },
  amenitiesLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  amenitiesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  amenityTag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  amenityText: {
    fontSize: 11,
    color: "#555",
  },
  agentSection: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  agentProfile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
  },
  agentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000",
  },
  agentRole: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  mapButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f7f7f7",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  mapButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
  },
  callButton: {
    flex: 1.2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#000",
    paddingVertical: 10,
    borderRadius: 8,
  },
  callButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
})

export default PropertyCard
