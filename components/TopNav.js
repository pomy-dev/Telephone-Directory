"use client"

import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from "react-native"
import { useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Location from "expo-location"
import { Ionicons } from "@expo/vector-icons"

export default function TopNav({ onCartPress, onSearch, onNotificationPress }) {
  const [location, setLocation] = useState("Fetching location...")
  const [modalVisible, setModalVisible] = useState(false)
  const [tempLocation, setTempLocation] = useState("")

  useEffect(() => {
    loadLocation()
  }, [])

  const loadLocation = async () => {
    try {
      const savedLocation = await AsyncStorage.getItem("userLocation")
      if (savedLocation) setLocation(savedLocation)
      else getCurrentLocation()
    } catch (error) {
      console.log("Error loading location:", error)
    }
  }

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setLocation("Permission denied")
        return
      }
      const currentLocation = await Location.getCurrentPositionAsync({})
      const [address] = await Location.reverseGeocodeAsync(currentLocation.coords)
      const formattedAddress = address.street || address.name || address.district || "Current Location"
      setLocation(formattedAddress)
      await AsyncStorage.setItem("userLocation", formattedAddress)
    } catch (error) {
      console.log("Error fetching location:", error)
      setLocation("Unable to get location")
    }
  }

  const saveLocation = async (newLocation) => {
    if (!newLocation.trim()) return
    await AsyncStorage.setItem("userLocation", newLocation)
    setLocation(newLocation)
    setModalVisible(false)
    setTempLocation("")
    Keyboard.dismiss()
  }

  const handleLocationPress = () => {
    setTempLocation(location)
    setModalVisible(true)
  }

  const handleSearchPress = () => {
    Keyboard.dismiss()
    onSearch?.()
  }

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.locationButton} onPress={handleLocationPress} activeOpacity={0.7}>
          <Ionicons name="location" size={20} color="#1A1A1A" style={{ marginRight: 8 }} />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>Deliver to</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationText} numberOfLines={1}>
                {location}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#1A1A1A" style={{ marginLeft: 4 }} />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton} activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TouchableOpacity style={styles.searchContainer} activeOpacity={0.8} onPress={handleSearchPress}>
        <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        <Text style={styles.searchPlaceholder}>What are you looking for?</Text>
      </TouchableOpacity>

      {/* Modal for Updating Location */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss()
            setModalVisible(false)
          }}
        >
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Update Location</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#8E8E93" />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Ionicons name="location-outline" size={20} color="#8E8E93" style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter your address"
                    value={tempLocation}
                    onChangeText={setTempLocation}
                    placeholderTextColor="#8E8E93"
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={() => saveLocation(tempLocation)}
                  />
                </View>

                <TouchableOpacity style={styles.currentLocationButton} onPress={getCurrentLocation} activeOpacity={0.7}>
                  <Ionicons name="navigate" size={20} color="#007AFF" style={{ marginRight: 8 }} />
                  <Text style={styles.currentLocationText}>Use current location</Text>
                </TouchableOpacity>

                <View style={styles.modalActions}>
                  <Pressable
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                    android_ripple={{ color: "#E5E5EA" }}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={() => saveLocation(tempLocation)}
                    android_ripple={{ color: "#000" }}
                  >
                    <Text style={styles.saveText}>Confirm</Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingVertical: 4,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "600",
    flexShrink: 1,
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    color: "#8E8E93",
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  closeButton: {
    padding: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
  },
  currentLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginBottom: 24,
  },
  currentLocationText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F2F2F7",
  },
  saveButton: {
    backgroundColor: "#1A1A1A",
  },
  cancelText: {
    color: "#1A1A1A",
    fontWeight: "600",
    fontSize: 16,
  },
  saveText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
})
