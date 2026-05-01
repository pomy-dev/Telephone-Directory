"use client"

import {
  StyleSheet, Text, View, TouchableOpacity, TextInput, StatusBar,
  Keyboard, Platform
} from "react-native"
import React, { useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Location from "expo-location"
import { Icons } from '../constants/Icons'
import { AppContext } from "../context/appContext"
import { Badge } from 'react-native-paper';
import { LoaderKitView } from 'react-native-loader-kit';
import CustomBottomSheet from './customBottomSheet'

export default function TopNav({ onCartPress, onSearch, onNotificationPress, onLogout, notificationCount = 0 }) {
  const { theme, isDarkMode } = React.useContext(AppContext)
  const [location, setLocation] = useState("Fetching location...")
  const [modalVisible, setModalVisible] = useState(false)
  const [tempLocation, setTempLocation] = useState("")
  const [isFindingLocation, setIsFindingLocation] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, [])

  const getCurrentLocation = async () => {
    try {
      setIsFindingLocation(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocation("Permission denied");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync(currentLocation.coords);

      // Better location formatting
      let formattedAddress =
        address.street ||
        address.name ||
        address.district ||
        address.city ||
        address.subregion ||
        address.region;

      if (!formattedAddress) {
        // Fallback: show only country name when nothing more specific is available
        formattedAddress = address.country || "Unknown Country";
      }
      else if (address.country && !formattedAddress.includes(address.country)) {
        // Append country if it's not already part of the address
        formattedAddress = `${formattedAddress}, ${address.country}`;
      }

      setLocation(formattedAddress);
    } catch (error) {
      console.log("Error fetching location:", error);
      setLocation("Unable to get location");
    } finally {
      setIsFindingLocation(false);
    }
  };

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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      {/* Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.locationButton} onPress={handleLocationPress} activeOpacity={0.7}>
          <Icons.Ionicons name="location" size={20} color={theme.colors.text} style={{ marginRight: 8 }} />
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>Current Location</Text>
            <View style={styles.locationRow}>
              <Text style={[styles.locationText, { color: theme.colors.text }]} numberOfLines={1}>
                {location}
              </Text>
              <Icons.Ionicons name="chevron-down" size={16} color={theme.colors.text} style={{ marginLeft: 4 }} />
            </View>
          </View>
        </TouchableOpacity>

        <>
          <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton} activeOpacity={0.7}>
            {/* badge for notifications count */}
            {notificationCount > 0 &&
              <Badge size={16} style={{ position: 'absolute', top: 2, right: 3, zIndex: 1 }}>{notificationCount}</Badge>
            }
            <Icons.Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={onLogout} style={styles.iconButton} activeOpacity={0.7}>
            <Icons.Ionicons name="settings-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </>
      </View>

      <CustomBottomSheet
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        snapPoints={[45]}                    // or [35, 65, 90] if you want multiple snaps
        backgroundColor={isDarkMode ? "#666" : "#fff"}
        handleColor={isDarkMode ? "#888" : "#E6E7EA"}
      >
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Update Location</Text>
        </View>

        <View style={[styles.inputContainer, { borderColor: theme.colors.border || '#E5E5EA' }]}>
          <Icons.Ionicons name="location-outline" size={20} color={theme.colors.sub_text} style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.modalInput, { color: theme.colors.sub_text }]}
            placeholder="Enter your address"
            value={tempLocation}
            onChangeText={setTempLocation}
            placeholderTextColor="#8E8E93"
            // autoFocus
            returnKeyType="done"
            onSubmitEditing={() => saveLocation(tempLocation)}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.currentLocationButton,
            { backgroundColor: theme.colors.surface || '#f0f4ff' },
          ]}
          onPress={getCurrentLocation}
          disabled={isFindingLocation}
        >
          <Icons.Ionicons name="navigate" size={20} color={theme.colors.indicator} style={{ marginRight: 8 }} />
          {isFindingLocation ? (
            <LoaderKitView
              style={{ width: 50, height: 30 }}
              name={'BallBeat'}
              animationSpeedMultiplier={1.0}
              color={theme.colors.indicator}
            />
          ) : (
            <Text style={[styles.currentLocationText, { color: theme.colors.indicator }]}>
              Get current location
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            // onPress={() => { }}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: theme.colors.indicator }]}
            onPress={() => saveLocation(tempLocation)}
          >
            <Text style={[styles.saveText, { color: '#fff' }]}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </CustomBottomSheet>
    </View >
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
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
    justifyContent: "space-between"
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
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 10,
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
  sheetHandle: {
    width: 40,
    height: 6,
    backgroundColor: "#E6E7EA",
    borderRadius: 6,
    alignSelf: "center",
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
    paddingVertical: 5,
    marginBottom: 16,
  },
  modalInput: {
    flex: 1,
    fontSize: 16
  },
  currentLocationButton: {
    backgroundColor: '#f0f4ff',
    borderRadius: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    marginBottom: 24,
  },
  currentLocationText: {
    fontSize: 16,
    fontWeight: "600",
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
  cancelText: {
    color: "#1A1A1A",
    fontWeight: "600",
    fontSize: 16,
  },
  saveText: {
    fontWeight: "600",
    fontSize: 16,
  },
})