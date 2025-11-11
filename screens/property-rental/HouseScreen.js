"use client"

import { useState, useEffect } from "react"
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Platform,
    StatusBar,
    ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import PropertyCard from "../../components/PropertyCard"
import FilterDrawer from "../../components/FilterDrawer"
import PersonalizedAdsSection from "../../components/PersonalizedAdsSection"
import SecondaryNav from "../../components/SecondaryNav"

const HouseScreen = () => {
    const [selectedTab, setSelectedTab] = useState("Houses")
    const [properties, setProperties] = useState([])
    const [filteredProperties, setFilteredProperties] = useState([])
    const [favorites, setFavorites] = useState([])
    const [filterVisible, setFilterVisible] = useState(false)
    const [filters, setFilters] = useState({})
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [userLocation, setUserLocation] = useState(null)

    const tabs = ["Houses", "Apartments", "Flats", "Rooms"]
    const ITEMS_PER_PAGE = 10

    // Sample localized ads (non-housing ads for House section)
    const sampleAds = [
        {
            id: "ad1",
            imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
            brandName: "Swazi Movers",
            brandLogo: "https://via.placeholder.com/50",
            title: "Need Help Moving? Hire a Reliable Truck Today!",
            category: "moving-services",
        },
        {
            id: "ad2",
            imageUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e",
            brandName: "CleanSpace Eswatini",
            brandLogo: "https://via.placeholder.com/50",
            title: "Professional Home Cleaning in Mbabane & Manzini",
            category: "cleaning-services",
        },
        {
            id: "ad3",
            imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
            brandName: "Swazi Furniture Hub",
            brandLogo: "https://via.placeholder.com/50",
            title: "Affordable Furniture for Your New Home",
            category: "home-furniture",
        },
    ]

    useEffect(() => {
        loadUserLocation()
        loadFavorites()
        fetchProperties()
    }, [])

    useEffect(() => {
        applyFilters()
    }, [properties, filters])

    const loadUserLocation = async () => {
        try {
            const location = await AsyncStorage.getItem("userLocation")
            if (location) {
                setUserLocation(JSON.parse(location))
            }
        } catch (error) {
            console.error("Error loading location:", error)
        }
    }

    const loadFavorites = async () => {
        try {
            const stored = await AsyncStorage.getItem("favorites")
            if (stored) {
                setFavorites(JSON.parse(stored))
            }
        } catch (error) {
            console.error("Error loading favorites:", error)
        }
    }

    const saveFavorites = async (newFavorites) => {
        try {
            await AsyncStorage.setItem("favoriteHouses", JSON.stringify(newFavorites))
        } catch (error) {
            console.error("Error saving favorites:", error)
        }
    }

    const fetchProperties = async (pageNum = 1) => {
        if (loading) return

        setLoading(true)
        try {
            const mockData = generateMockProperties(pageNum)

            if (pageNum === 1) {
                setProperties(mockData)
            } else {
                setProperties((prev) => [...prev, ...mockData])
            }

            setHasMore(mockData.length === ITEMS_PER_PAGE)
        } catch (error) {
            console.error("Error fetching properties:", error)
        } finally {
            setLoading(false)
        }
    }

    // Eswatini-based mock data
    const generateMockProperties = (pageNum) => {
        const startId = (pageNum - 1) * ITEMS_PER_PAGE
        const mockProperties = []

        const cities = ["Mbabane", "Manzini", "Ezulwini", "Nhlangano", "Siteki"]
        const streets = ["Somhlolo Street", "Gables Road", "Hilltop Avenue", "Lusutfu Way", "Zulwini Drive"]

        for (let i = 0; i < ITEMS_PER_PAGE; i++) {
            const id = startId + i + 1
            const hasImage = Math.random() > 0.2

            mockProperties.push({
                id: `prop-${id}`,
                image: hasImage ? `https://images.unsplash.com/photo-${1560518883 + id}?w=400` : "",
                bedrooms: Math.floor(Math.random() * 4) + 1,
                bathrooms: Math.floor(Math.random() * 3) + 1,
                sqft: Math.floor(Math.random() * 200) + 60, // in square meters for realism
                price: Math.floor(Math.random() * 350000) + 25000, // SZL range
                address: `${Math.floor(Math.random() * 50) + 1} ${streets[Math.floor(Math.random() * streets.length)]}, ${cities[Math.floor(Math.random() * cities.length)]}, Eswatini`,
                tag: i % 5 === 0 ? "Popular" : null,
                type: tabs[Math.floor(Math.random() * tabs.length)].toLowerCase(),
            })
        }

        return mockProperties
    }

    const applyFilters = () => {
        let filtered = [...properties]

        if (filters.propertyType && filters.propertyType !== "all") {
            filtered = filtered.filter((p) => p.type === filters.propertyType)
        }

        if (filters.priceMin) {
            filtered = filtered.filter((p) => p.price >= Number.parseInt(filters.priceMin))
        }

        if (filters.priceMax) {
            filtered = filtered.filter((p) => p.price <= Number.parseInt(filters.priceMax))
        }

        if (filters.bedrooms) {
            filtered = filtered.filter((p) => p.bedrooms >= Number.parseInt(filters.bedrooms))
        }

        if (filters.bathrooms) {
            filtered = filtered.filter((p) => p.bathrooms >= Number.parseInt(filters.bathrooms))
        }

        if (filters.sqftMin) {
            filtered = filtered.filter((p) => p.sqft >= Number.parseInt(filters.sqftMin))
        }

        if (filters.sqftMax) {
            filtered = filtered.filter((p) => p.sqft <= Number.parseInt(filters.sqftMax))
        }

        setFilteredProperties(filtered)
    }

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1
            setPage(nextPage)
            fetchProperties(nextPage)
        }
    }

    const toggleFavorite = (propertyId) => {
        const newFavorites = favorites.includes(propertyId)
            ? favorites.filter((id) => id !== propertyId)
            : [...favorites, propertyId]

        setFavorites(newFavorites)
        saveFavorites(newFavorites)
    }

    const handlePropertyPress = (property) => {
        console.log("Property pressed:", property)
    }

    const getFeaturedProperties = () => filteredProperties.slice(0, 3)
    const getNearbyProperties = () => filteredProperties.slice(3, 8)
    const getPopularProperties = () => filteredProperties.filter((p) => p.tag === "Popular")

    const renderPropertySection = (title, properties, showSeeAll = true) => {
        if (properties.length === 0) return null

        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{title}</Text>
                    {showSeeAll && (
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>See all</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {properties.map((property) => (
                    <PropertyCard
                        key={property.id}
                        property={property}
                        onPress={handlePropertyPress}
                        onToggleFavorite={toggleFavorite}
                        isFavorite={favorites.includes(property.id)}
                    />
                ))}
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SecondaryNav title="House Hunting" rightIcon="options-outline" onRightPress={() => setFilterVisible(true)} />

            <View style={styles.header}>
                <View style={styles.tabsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
                        {tabs.map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.tab, selectedTab === tab && styles.tabActive]}
                                onPress={() => setSelectedTab(tab)}
                            >
                                <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>{tab}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                onScroll={({ nativeEvent }) => {
                    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent
                    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20
                    if (isCloseToBottom) handleLoadMore()
                }}
                scrollEventThrottle={400}
            >
                {renderPropertySection("Homes For You", getFeaturedProperties())}
                <PersonalizedAdsSection ads={sampleAds} maxAdsToShow={5} />
                {renderPropertySection("Nearby Homes", getNearbyProperties())}
                {getPopularProperties().length > 0 && renderPropertySection("Popular Listings", getPopularProperties(), false)}

                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0f172a" />
                    </View>
                )}

                {!hasMore && filteredProperties.length > 0 && <Text style={styles.endText}>No more properties to load</Text>}
            </ScrollView>

            <FilterDrawer
                visible={filterVisible}
                onClose={() => setFilterVisible(false)}
                onApplyFilters={setFilters}
                initialFilters={filters}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 50,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    tabsContainer: {
        flex: 1,
    },
    tabs: {
        gap: 20,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    tabActive: {
        borderBottomWidth: 2,
        borderBottomColor: "#0f172a",
    },
    tabText: {
        fontSize: 15,
        fontWeight: "500",
        color: "#64748b",
    },
    tabTextActive: {
        color: "#0f172a",
        fontWeight: "600",
    },
    content: {
        flex: 1,
    },
    section: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0f172a",
    },
    seeAllText: {
        fontSize: 15,
        fontWeight: "500",
        color: "#3b82f6",
    },
    loadingContainer: {
        paddingVertical: 20,
        alignItems: "center",
    },
    endText: {
        textAlign: "center",
        paddingVertical: 20,
        color: "#64748b",
        fontSize: 14,
    },
})

export default HouseScreen
