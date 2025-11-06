"use client"

import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Alert, ScrollView, Animated } from "react-native"
import { useState, useEffect, useRef } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps"
import * as Location from "expo-location"
import { Ionicons } from "@expo/vector-icons"

const { width, height } = Dimensions.get("window")
const ASPECT_RATIO = width / height
const LATITUDE_DELTA = 0.015
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO

// Simulated nearby drivers
const generateNearbyDrivers = (centerLat, centerLng) => [
    { id: 1, latitude: centerLat + 0.003, longitude: centerLng + 0.002, heading: 45 },
    { id: 2, latitude: centerLat - 0.002, longitude: centerLng + 0.004, heading: 180 },
    { id: 3, latitude: centerLat + 0.004, longitude: centerLng - 0.003, heading: 270 },
    { id: 4, latitude: centerLat - 0.001, longitude: centerLng - 0.002, heading: 90 },
]

const RIDE_TYPES = [
    { id: "economy", name: "Economy", icon: "🚗", subtitle: "Affordable rides", price: 8.5, time: "3 min" },
    { id: "comfort", name: "Comfort", icon: "🚙", subtitle: "Newer cars, extra space", price: 12.0, time: "5 min" },
    { id: "premium", name: "Premium", icon: "🚘", subtitle: "Luxury vehicles", price: 18.5, time: "8 min" },
]

export default function RideHailingScreen({ navigation }) {
    const [locationPermission, setLocationPermission] = useState(false)
    const [currentLocation, setCurrentLocation] = useState(null)
    const [pickupAddress, setPickupAddress] = useState("Fetching location...")
    const [destinationAddress, setDestinationAddress] = useState("")
    const [selectedRide, setSelectedRide] = useState("comfort")
    const [step, setStep] = useState("pickup") // 'pickup', 'destination', 'confirm'
    const [nearbyDrivers, setNearbyDrivers] = useState([])
    const [isMapReady, setIsMapReady] = useState(false)

    const mapRef = useRef(null)
    const sheetAnimation = useRef(new Animated.Value(0)).current

    // Request location permission and get current location
    useEffect(() => {
        ; (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== "granted") {
                Alert.alert("Permission Denied", "Location access is required for ride booking.")
                return
            }
            setLocationPermission(true)

            try {
                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                })

                const coords = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                }

                setCurrentLocation(coords)
                setNearbyDrivers(generateNearbyDrivers(coords.latitude, coords.longitude))

                // Reverse geocode to get address
                const addresses = await Location.reverseGeocodeAsync({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                })

                if (addresses[0]) {
                    const addr = addresses[0]
                    setPickupAddress(`${addr.street || ""} ${addr.name || ""}, ${addr.city || ""}`)
                }
            } catch (error) {
                console.error("Error fetching location:", error)
                Alert.alert("Location Error", "Could not fetch your location. Please try again.")
            }
        })()
    }, [])

    // Animate bottom sheet
    useEffect(() => {
        Animated.spring(sheetAnimation, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
        }).start()
    }, [])

    const handleDestinationPress = () => {
        setStep("destination")
        // In a real app, navigate to a search screen
        Alert.alert("Set Destination", "In a production app, this would open a location search screen.", [
            {
                text: "Simulate Destination",
                onPress: () => {
                    setDestinationAddress("123 Main Street, Downtown")
                    setStep("confirm")
                },
            },
            { text: "Cancel", style: "cancel" },
        ])
    }

    const handleConfirmRide = () => {
        const ride = RIDE_TYPES.find((r) => r.id === selectedRide)
        Alert.alert(
            "Ride Requested",
            `Your ${ride.name} ride has been requested!\n\nEstimated arrival: ${ride.time}\nEstimated fare: $${ride.price.toFixed(2)}`,
            [
                {
                    text: "Track Ride",
                    onPress: () => {
                        // Navigate to tracking screen
                        console.log("Navigate to tracking screen")
                    },
                },
            ],
        )
    }

    const handleMapRegionChange = (region) => {
        // Update pickup location when map is dragged (center pin concept)
        if (step === "pickup" && isMapReady) {
            setCurrentLocation(region)
        }
    }

    if (!locationPermission || !currentLocation) {
        return (
            <View style={styles.loadingContainer}>
                <Ionicons name="location" size={48} color="#000" />
                <Text style={styles.loadingText}>Getting your location...</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* Map */}
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={currentLocation}
                onRegionChangeComplete={handleMapRegionChange}
                onMapReady={() => setIsMapReady(true)}
                showsUserLocation={true}
                showsMyLocationButton={false}
                showsCompass={false}
                toolbarEnabled={false}
            >
                {/* Nearby drivers */}
                {nearbyDrivers.map((driver) => (
                    <Marker
                        key={driver.id}
                        coordinate={{ latitude: driver.latitude, longitude: driver.longitude }}
                        anchor={{ x: 0.5, y: 0.5 }}
                        flat={true}
                        rotation={driver.heading}
                    >
                        <View style={styles.driverMarker}>
                            <Ionicons name="car" size={20} color="#000" />
                        </View>
                    </Marker>
                ))}
            </MapView>

            {/* Center Pin (Uber-style) */}
            {step === "pickup" && (
                <View style={styles.centerPinContainer}>
                    <View style={styles.centerPin}>
                        <Ionicons name="location-sharp" size={40} color="#000" />
                    </View>
                    <View style={styles.pinShadow} />
                </View>
            )}

            {/* Top Bar */}
            <SafeAreaView style={styles.topBar} edges={["top"]}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
            </SafeAreaView>

            {/* Bottom Sheet */}
            <Animated.View
                style={[
                    styles.bottomSheet,
                    {
                        transform: [
                            {
                                translateY: sheetAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [400, 0],
                                }),
                            },
                        ],
                    },
                ]}
            >
                <View style={styles.sheetHandle} />

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Location Inputs */}
                    <View style={styles.locationSection}>
                        {/* Pickup Location */}
                        <View style={styles.locationRow}>
                            <View style={styles.locationDot} />
                            <View style={styles.locationInput}>
                                <Text style={styles.locationLabel}>Pickup Location</Text>
                                <Text style={styles.locationText} numberOfLines={1}>
                                    {pickupAddress}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.locationLine} />

                        {/* Destination */}
                        <TouchableOpacity style={styles.locationRow} onPress={handleDestinationPress} activeOpacity={0.7}>
                            <View style={[styles.locationDot, styles.destinationDot]} />
                            <View style={styles.locationInput}>
                                <Text style={styles.locationLabel}>Where to?</Text>
                                {destinationAddress ? (
                                    <Text style={styles.locationText} numberOfLines={1}>
                                        {destinationAddress}
                                    </Text>
                                ) : (
                                    <Text style={styles.locationPlaceholder}>Enter destination</Text>
                                )}
                            </View>
                            <Ionicons name="search" size={20} color="#999" />
                        </TouchableOpacity>
                    </View>

                    {/* Ride Selection */}
                    {step === "confirm" && destinationAddress && (
                        <>
                            <View style={styles.divider} />
                            <Text style={styles.sectionTitle}>Choose a ride</Text>

                            {RIDE_TYPES.map((ride) => (
                                <TouchableOpacity
                                    key={ride.id}
                                    style={[styles.rideOption, selectedRide === ride.id && styles.rideOptionSelected]}
                                    onPress={() => setSelectedRide(ride.id)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.rideIcon}>{ride.icon}</Text>
                                    <View style={styles.rideDetails}>
                                        <Text style={styles.rideName}>{ride.name}</Text>
                                        <Text style={styles.rideSubtitle}>{ride.subtitle}</Text>
                                        <Text style={styles.rideTime}>{ride.time} away</Text>
                                    </View>
                                    <Text style={styles.ridePrice}>${ride.price.toFixed(2)}</Text>
                                </TouchableOpacity>
                            ))}
                        </>
                    )}

                    {/* Action Button */}
                    {step === "confirm" && destinationAddress && (
                        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmRide} activeOpacity={0.8}>
                            <Text style={styles.confirmButtonText}>Confirm Ride</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    map: {
        width: width,
        height: height,
        ...StyleSheet.absoluteFillObject,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
    },

    // Top Bar
    topBar: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingTop: 8,
        zIndex: 10,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    // Center Pin (Uber-style)
    centerPinContainer: {
        position: "absolute",
        top: "50%",
        left: "50%",
        marginLeft: -20,
        marginTop: -40,
        zIndex: 5,
    },
    centerPin: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    pinShadow: {
        width: 10,
        height: 4,
        backgroundColor: "rgba(0,0,0,0.3)",
        borderRadius: 5,
        alignSelf: "center",
        marginTop: -5,
    },

    // Driver Markers
    driverMarker: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#000",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },

    // Bottom Sheet
    bottomSheet: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 32,
        maxHeight: height * 0.7,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 10,
    },
    sheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: "#ddd",
        borderRadius: 2,
        alignSelf: "center",
        marginBottom: 20,
    },

    // Location Section
    locationSection: {
        backgroundColor: "#f8f8f8",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    locationDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: "#000",
        marginRight: 12,
    },
    destinationDot: {
        backgroundColor: "#666",
    },
    locationLine: {
        width: 2,
        height: 20,
        backgroundColor: "#ddd",
        marginLeft: 5,
        marginVertical: 4,
    },
    locationInput: {
        flex: 1,
        paddingVertical: 8,
    },
    locationLabel: {
        fontSize: 12,
        color: "#999",
        marginBottom: 2,
    },
    locationText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
    },
    locationPlaceholder: {
        fontSize: 16,
        color: "#999",
    },

    // Ride Selection
    divider: {
        height: 1,
        backgroundColor: "#eee",
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#000",
        marginBottom: 16,
    },
    rideOption: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f8f8f8",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: "transparent",
    },
    rideOptionSelected: {
        backgroundColor: "#fff",
        borderColor: "#000",
    },
    rideIcon: {
        fontSize: 32,
        marginRight: 12,
    },
    rideDetails: {
        flex: 1,
    },
    rideName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#000",
        marginBottom: 2,
    },
    rideSubtitle: {
        fontSize: 13,
        color: "#666",
        marginBottom: 2,
    },
    rideTime: {
        fontSize: 12,
        color: "#999",
    },
    ridePrice: {
        fontSize: 18,
        fontWeight: "700",
        color: "#000",
    },

    // Confirm Button
    confirmButton: {
        backgroundColor: "#000",
        borderRadius: 12,
        padding: 18,
        alignItems: "center",
        marginTop: 16,
    },
    confirmButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },
})
