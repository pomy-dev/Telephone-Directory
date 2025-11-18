"use client"

import { useState, useMemo } from "react"
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, Platform, StatusBar } from "react-native"
import PropertyCard from "../../components/houses/PropertyCard"
import FilterDrawer from "../../components/FilterDrawer"
import NativeAd from "../../components/NativeAd"
import SecondaryNav from "../../components/SecondaryNav"

const MoreHouses = ({ navigation }) => {
    const [filterDrawerVisible, setFilterDrawerVisible] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [filters, setFilters] = useState({
        priceMin: null,
        priceMax: null,
        sqmMin: null,
        sqmMax: null,
        hectaresMin: null,
        hectaresMax: null,
        propertyType: null,
        location: null,
        hasFindersFee: null,
        requiresDeposit: null,
    })

    const categories = ["All", "Rooms/Bedsitters", "Houses", "Flats", "Villas", "Farms"]

    const sampleAds = [
        {
            id: 1,
            title: "Premium Real Estate Services",
            description: "Get the best deals on properties",
            imageUrl: "https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?w=400&h=300&fit=crop",
            brandName: "RealEstate Pro",
            cta: "Learn More",
            category: "real-estate",
        },
        {
            id: 2,
            title: "Jumbo Khumalo",
            description: "E250 general early-bird",
            imageUrl: "https://kulture.co.sz/wp-content/uploads/2024/11/464006962_1107220101407512_3480094717842543124_n-894x1024.jpg",
            brandName: "Jumbo Khumalo",
            cta: "Buy Now",
            category: "Event",
        },
    ]

    const properties = [
        {
            id: 1,
            title: "Spacious Bedsitter near Mhlaleni",
            location: "Manzini, Mhlaleni",
            price: "1080",
            rentalPeriod: "Monthly",
            findersFee: 450,
            depositRequired: true,
            depositPercentage: 100,
            description: "Large one-bedroom room near Siphumelele primary school",
            images: [],
            type: "Bedsitter",
            amenities: ["Water & Electricity Included", "Kids Allowed", "Fenced Property", "Own Gate Keys"],
            agent: {
                id: 1,
                name: "Abel Buthelezi",
                title: "Property Agent",
                avatar: "https://via.placeholder.com/50",
                phone: "76604450",
                email: "abel@realestate.sz",
                whatsapp: "76604450",
                license: "RES-2024-001",
                bio: "Experienced property agent with over 5 years in real estate. Specializing in residential properties in Manzini.",
                experience: 5,
                specializations: ["Residential", "Bedsitters", "Quick Sales"],
                rating: 4.8,
                reviews: 24,
                propertiesCount: 12,
                soldCount: 8,
            },
        },
        {
            id: 2,
            title: "Comfortable Room in Manzini",
            location: "Manzini, Central",
            price: "900",
            rentalPeriod: "Monthly",
            findersFee: null,
            depositRequired: true,
            depositPercentage: 50,
            description: "Standalone room with basic amenities",
            images: [],
            type: "Room",
            amenities: ["Water & Electricity", "Fenced"],
            agent: {
                id: 2,
                name: "Nomcebo Dlamini",
                title: "Senior Real Estate Agent",
                avatar: "https://via.placeholder.com/50",
                phone: "76123456",
                email: "nomcebo@realestate.sz",
                whatsapp: "76123456",
                license: "RES-2023-045",
                bio: "Professional real estate agent with 8 years of experience in property management and sales.",
                experience: 8,
                specializations: ["Residential", "Commercial", "Property Management"],
                rating: 4.9,
                reviews: 42,
                propertiesCount: 28,
                soldCount: 15,
            },
        },
        {
            id: 3,
            title: "Thalassa Residences",
            location: "New York, NY 10022",
            price: "530,250",
            rentalPeriod: "Annually",
            findersFee: 2250,
            depositRequired: true,
            depositPercentage: 100,
            description: "370 sqft, 2 Beds, Luxury Living",
            images: [
                "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?w=500&h=400&fit=crop",
                "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?w=500&h=400&fit=crop",
            ],
            type: "Apartment",
            sqm: 120,
            beds: 4,
            baths: 2,
            amenities: ["Smart Lock", "Panoramic Views"],
            agent: {
                id: 3,
                name: "Thabo Nkosi",
                title: "Luxury Properties Specialist",
                avatar: "https://via.placeholder.com/50",
                phone: "74555555",
                email: "thabo@luxuryrealestate.sz",
                whatsapp: "74555555",
                license: "RES-2022-089",
                bio: "Expert in luxury real estate and high-end properties with international market experience.",
                experience: 12,
                specializations: ["Luxury", "Commercial", "Investment"],
                rating: 4.7,
                reviews: 38,
                propertiesCount: 45,
                soldCount: 22,
            },
        },
        {
            id: 4,
            title: "Villa in Santorini",
            location: "Santa Rosa, CA",
            price: "534,220",
            rentalPeriod: "Annually",
            findersFee: 1400,
            depositRequired: true,
            depositPercentage: 100,
            description: "2024 Luxury Island Home",
            images: ["https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?w=500&h=400&fit=crop"],
            type: "Villa",
            sqm: 310,
            beds: 3,
            baths: 2,
            amenities: ["Swimming Pool", "Braai Area", "Garden"],
            agent: {
                id: 4,
                name: "Lindiwe Ngubane",
                title: "International Properties Agent",
                avatar: "https://via.placeholder.com/50",
                phone: "74888888",
                email: "lindiwe@intlrealestate.sz",
                whatsapp: "74888888",
                license: "RES-2021-056",
                bio: "International property specialist with experience in overseas investments and relocations.",
                experience: 10,
                specializations: ["International", "Villas", "Resort Properties"],
                rating: 4.6,
                reviews: 31,
                propertiesCount: 33,
                soldCount: 19,
            },
        },
        {
            id: 5,
            title: "Modern Apartment",
            location: "Downtown",
            price: "450,000",
            rentalPeriod: "Annually",
            findersFee: 150,
            depositRequired: false,
            description: "Contemporary living with premium finishes",
            images: ["https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?w=500&h=400&fit=crop"],
            type: "Flat",
            sqm: 150,
            beds: 2,
            baths: 2,
            amenities: ["Modern Kitchen", "Gym Access"],
            agent: {
                id: 5,
                name: "Sipho Ndaba",
                title: "Urban Properties Agent",
                avatar: "https://via.placeholder.com/50",
                phone: "74222222",
                email: "sipho@realestate.sz",
                whatsapp: "74222222",
                license: "RES-2023-078",
                bio: "Focused on modern urban properties with an eye for contemporary design and smart living.",
                experience: 6,
                specializations: ["Urban", "Apartments", "Young Professionals"],
                rating: 4.5,
                reviews: 18,
                propertiesCount: 16,
                soldCount: 9,
            },
        },
        {
            id: 6,
            title: "Luxury Penthouse",
            location: "City Center",
            price: "650,000",
            rentalPeriod: "Annually",
            findersFee: 1900,
            depositRequired: true,
            depositPercentage: 100,
            description: "Exclusive high-rise living space",
            images: [
                "https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?w=500&h=400&fit=crop",
                "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?w=500&h=400&fit=crop",
            ],
            type: "Apartment",
            sqm: 250,
            beds: 3,
            baths: 3,
            amenities: ["Private Balcony", "Concierge", "Security"],
            agent: {
                id: 6,
                name: "Naledi Khumalo",
                title: "Premium Properties Director",
                avatar: "https://via.placeholder.com/50",
                phone: "74999999",
                email: "naledi@premiumrealestate.sz",
                whatsapp: "74999999",
                license: "RES-2020-012",
                bio: "Director of premium property sales with a track record of closing high-value deals.",
                experience: 15,
                specializations: ["Premium", "Penthouses", "Executive"],
                rating: 4.9,
                reviews: 52,
                propertiesCount: 67,
                soldCount: 38,
            },
        },
        {
            id: 7,
            title: "Beachfront House",
            location: "Coastal Area",
            price: "750,000",
            rentalPeriod: "Annually",
            findersFee: 2500,
            depositRequired: true,
            depositPercentage: 50,
            description: "Stunning ocean views and private beach access",
            images: [
                "https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?w=500&h=400&fit=crop",
                "https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?w=500&h=400&fit=crop",
            ],
            type: "House",
            sqm: 400,
            beds: 4,
            baths: 3,
            amenities: ["Private Beach", "Pool", "Braai Area", "Cottage"],
            agent: {
                id: 7,
                name: "Mpho Sifiso",
                title: "Coastal Properties Specialist",
                avatar: "https://via.placeholder.com/50",
                phone: "76777777",
                email: "mpho@coastalrealestate.sz",
                whatsapp: "76777777",
                license: "RES-2022-034",
                bio: "Expert in beachfront and coastal properties with extensive market knowledge.",
                experience: 9,
                specializations: ["Coastal", "Beachfront", "Vacation Rentals"],
                rating: 4.8,
                reviews: 35,
                propertiesCount: 21,
                soldCount: 12,
            },
        },
        {
            id: 8,
            title: "Agricultural Farm",
            location: "Rural Area",
            price: "2500000",
            rentalPeriod: "Annually",
            findersFee: null,
            depositRequired: false,
            description: "Productive farmland with irrigation",
            images: [],
            type: "Farm",
            hectares: 15,
            amenities: ["Irrigation", "Well Water", "Fenced"],
            agent: {
                id: 8,
                name: "Tsogo Shabalala",
                title: "Agricultural Properties Expert",
                avatar: "https://via.placeholder.com/50",
                phone: "76333333",
                email: "tsogo@farmrealestate.sz",
                whatsapp: "76333333",
                license: "RES-2021-067",
                bio: "Specialized in agricultural and rural properties with expertise in farm management.",
                experience: 11,
                specializations: ["Agriculture", "Rural", "Farm Management"],
                rating: 4.7,
                reviews: 22,
                propertiesCount: 14,
                soldCount: 7,
            },
        },
    ]

    const filteredProperties = useMemo(() => {
        return properties.filter((prop) => {
            const matchesCategory =
                selectedCategory === "All" ||
                (selectedCategory === "Rooms/Bedsitters" && (prop.type === "Room" || prop.type === "Bedsitter")) ||
                (selectedCategory === "Houses" && prop.type === "House") ||
                (selectedCategory === "Flats" && prop.type === "Apartment") ||
                prop.type === "Flat" ||
                (selectedCategory === "Villas" && prop.type === "Villa") ||
                (selectedCategory === "Farms" && prop.type === "Farm")

            const price = Number.parseInt(prop.price.replace(/[^0-9]/g, ""))
            const matchesPrice =
                (!filters.priceMin || price >= filters.priceMin) && (!filters.priceMax || price <= filters.priceMax)

            const matchesSqm =
                (!filters.sqmMin || prop.sqm >= filters.sqmMin) && (!filters.sqmMax || prop.sqm <= filters.sqmMax)

            const matchesHectares =
                (!filters.hectaresMin || prop.hectares >= filters.hectaresMin) &&
                (!filters.hectaresMax || prop.hectares <= filters.hectaresMax)

            const matchesType = !filters.propertyType || prop.type === filters.propertyType

            const matchesLocation = !filters.location || prop.location === filters.location

            const matchesFindersFee =
                filters.hasFindersFee === null ||
                (filters.hasFindersFee && prop.findersFee) ||
                (!filters.hasFindersFee && !prop.findersFee)

            const matchesDeposit = filters.requiresDeposit === null || filters.requiresDeposit === prop.depositRequired

            return (
                matchesCategory &&
                matchesPrice &&
                matchesSqm &&
                matchesHectares &&
                matchesType &&
                matchesLocation &&
                matchesFindersFee &&
                matchesDeposit
            )
        })
    }, [selectedCategory, filters])

    const renderListItem = ({ item, index }) => {
        if (index > 0 && index % 3 === 0) {
            return <NativeAd ads={sampleAds} maxAdsToShow={1} />
        }
        return (
            <PropertyCard
                property={item}
                onPress={() => navigation?.navigate("HouseDetailsScreen", { property: item })}
                onMapPress={() => navigation?.navigate("HouseMapScreen", { properties: filteredProperties })}
                onAgentPress={(agent) => navigation?.navigate("AgentDetailsScreen", { agent })}
            />
        )
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
                <SecondaryNav
                    title="Estate"
                    rightIcon="options-outline"
                    onRightPress={() => setFilterDrawerVisible(true)}
                    onBackPress={() => navigation?.goBack()}
                />
            </View>

            <View style={styles.categoriesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category}
                            style={[styles.categoryChip, selectedCategory === category && styles.categoryChipActive]}
                            onPress={() => setSelectedCategory(category)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.categoryChipText, selectedCategory === category && styles.categoryChipTextActive]}>
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Properties</Text>
                <Text style={styles.resultCount}>{filteredProperties.length} results</Text>
            </View>

            <FlatList
                data={filteredProperties}
                renderItem={renderListItem}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <FilterDrawer
                visible={filterDrawerVisible}
                onClose={() => setFilterDrawerVisible(false)}
                onApplyFilters={(newFilters) => {
                    setFilters(newFilters)
                    setFilterDrawerVisible(false)
                }}
                currentFilters={filters}
            />
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
    categoriesContainer: {
        paddingVertical: 12,
    },
    categoriesContent: {
        paddingHorizontal: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    categoryChip: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 20, // more rounded for modern look
        marginRight: 10,
        marginBottom: 10, // spacing for multi-line wrap
        backgroundColor: "#F5F5F5", // light neutral
        borderWidth: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2, // subtle Android shadow
    },
    categoryChipActive: {
        backgroundColor: "#000", // modern blue
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    categoryChipText: {
        color: "#333333",
        fontSize: 14,
        fontWeight: "600",
    },
    categoryChipTextActive: {
        color: "#FFFFFF",
    },

    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: "600",
        color: "#000000",
    },
    resultCount: {
        fontSize: 12,
        fontWeight: "400",
        color: "#8A8A8A",
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 16,
    },
})

export default MoreHouses
