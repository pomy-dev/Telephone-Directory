"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import SecondaryNav from "../../components/SecondaryNav"

const HouseMapScreen = ({ navigation, route }) => {
  const { properties = [] } = route?.params || {}
  const [selectedProperty, setSelectedProperty] = useState(null)

  // Mock map data - in a real app, you'd use react-native-maps
  const handlePropertySelect = (property) => {
    setSelectedProperty(property)
  }

  const handleViewDetails = () => {
    if (selectedProperty) {
      navigation?.navigate("HouseDetails", { property: selectedProperty })
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 50,
        },
      ]}
    >
      <View style={styles.header}>
        <SecondaryNav title="Property Map" onBackPress={() => navigation?.goBack()} />
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={48} color="#ccc" />
          <Text style={styles.mapPlaceholderText}>Map View</Text>
          <Text style={styles.mapPlaceholderSubtext}>{properties.length} properties in area</Text>
        </View>
      </View>

      {/* Property Markers Display */}
      <View style={styles.markersContainer}>
        {properties.map((prop) => (
          <TouchableOpacity
            key={prop.id}
            style={[styles.marker, selectedProperty?.id === prop.id && styles.markerActive]}
            onPress={() => handlePropertySelect(prop)}
          >
            <View style={styles.markerInner}>
              <Text style={styles.markerPrice}>E{prop.price}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Selected Property Preview */}
      {selectedProperty && (
        <View style={styles.propertyPreview}>
          <View style={styles.previewHeader}>
            <View>
              <Text style={styles.previewTitle}>{selectedProperty.title}</Text>
              <Text style={styles.previewLocation}>{selectedProperty.location}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedProperty(null)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <Text style={styles.previewPrice}>E{selectedProperty.price}/month</Text>
          <Text style={styles.previewDescription} numberOfLines={2}>
            {selectedProperty.description}
          </Text>

          <TouchableOpacity style={styles.viewDetailsButton} onPress={handleViewDetails}>
            <Text style={styles.viewDetailsButtonText}>View Details</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingBottom: 8,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  mapContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  mapPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginTop: 12,
  },
  mapPlaceholderSubtext: {
    fontSize: 13,
    color: "#bbb",
    marginTop: 4,
  },
  markersContainer: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    bottom: 200,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  marker: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ddd",
  },
  markerActive: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  markerInner: {
    justifyContent: "center",
    alignItems: "center",
  },
  markerPrice: {
    fontSize: 10,
    fontWeight: "700",
    color: "#000",
  },
  propertyPreview: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  previewLocation: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  previewPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
    lineHeight: 18,
  },
  viewDetailsButton: {
    backgroundColor: "#000",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 40
  },
  viewDetailsButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
})

export default HouseMapScreen
