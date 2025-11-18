import { useState } from "react"
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    Modal,
    Linking,
    Pressable,
    FlatList,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"

const { width } = Dimensions.get("window")

const MiniPropertyCard = ({ property }) => {
    const [showDetails, setShowDetails] = useState(false)

    const getAmenityIcon = (name) => {
        const lower = name.toLowerCase()
        if (lower.includes("water")) return "water-outline"
        if (lower.includes("electric")) return "flash-outline"
        if (lower.includes("fence")) return "shield-checkmark-outline"
        if (lower.includes("kids")) return "happy-outline"
        if (lower.includes("gate")) return "lock-closed-outline"
        if (lower.includes("pool")) return "water-outline"
        if (lower.includes("garden")) return "leaf-outline"
        if (lower.includes("gym")) return "barbell-outline"
        if (lower.includes("deposit")) return "cash-outline"
        if (lower.includes("security")) return "shield-outline"
        if (lower.includes("kitchen")) return "restaurant-outline"
        return "checkmark-circle-outline"
    }

    const limitedAmenities = property.amenities ? property.amenities.slice(0, 3) : []

    const callNow = () => {
        Linking.openURL(`tel:${property.agent?.phone}`)
    }

    const formatDistance = (meters) => {
        if (meters < 1000) return `${Math.round(meters)} m`
        return `${(meters / 1000).toFixed(1)} km`
    }

    const distance = property.distance ? formatDistance(property.distance * 1000) : "893 m"

    return (
        <>
            {/* CARD */}
            <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => setShowDetails(true)}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{
                            uri:
                                property.images && property.images.length > 0
                                    ? property.images[0]
                                    : "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?w=500&h=400&fit=crop",
                        }}
                        style={styles.image}
                    />
                    <View style={styles.distanceBadge}>
                        <Ionicons name="location-outline" size={14} color="#1a1a1a" />
                        <Text style={styles.distanceText}>{distance}</Text>
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.title}>{property.title}</Text>
                        <View style={styles.locationRow}>
                            <Ionicons name="pin-outline" size={12} color="#666" />
                            <Text style={styles.location}>{property.location}</Text>
                        </View>
                        <Text style={styles.rating}>
                            <Ionicons name="star" size={12} color="#FFA500" /> 4.8 Rating ({property.agent?.reviews || 0} Reviews)
                        </Text>

                        <View style={styles.amenitiesRow}>
                            {limitedAmenities.map((a, i) => (
                                <View style={styles.amenityItem} key={i}>
                                    <Ionicons name={getAmenityIcon(a)} size={13} color="#666" />
                                    <Text style={styles.amenityText}>{a}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Price */}
                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>E{property.price}</Text>
                        <Text style={styles.period}>/{property.rentalPeriod}</Text>
                    </View>
                </View>
            </TouchableOpacity>

            <Modal visible={showDetails} transparent animationType="slide" onRequestClose={() => setShowDetails(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setShowDetails(false)}>
                    <Pressable style={styles.drawer} onPress={() => { }}>
                        <View style={styles.handleBar} />
                        <TouchableOpacity style={styles.closeButton} onPress={() => setShowDetails(false)}>
                            <Ionicons name="close" size={24} color="#1a1a1a" />
                        </TouchableOpacity>

                        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent} scrollEventThrottle={16}>
                            {/* Image Section */}
                            <Image
                                source={{
                                    uri:
                                        property.images && property.images.length > 0
                                            ? property.images[0]
                                            : "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?w=500&h=400&fit=crop",
                                }}
                                style={styles.drawerImage}
                            />

                            {/* Header Info */}
                            <View style={styles.headerSection}>
                                <View>
                                    <Text style={styles.drawerTitle}>{property.title}</Text>
                                    <View style={styles.locationRowDrawer}>
                                        <Ionicons name="pin-outline" size={14} color="#666" />
                                        <Text style={styles.drawerLocation}>{property.location}</Text>
                                    </View>
                                </View>
                                <View style={styles.priceTag}>
                                    <Text style={styles.priceTagValue}>E{property.price}</Text>
                                    <Text style={styles.priceTagPeriod}>{property.rentalPeriod}</Text>
                                </View>
                            </View>

                            {/* Description Section */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Description</Text>
                                <Text style={styles.descriptionText}>{property.description}</Text>
                                {property.type && (
                                    <View style={styles.typeTag}>
                                        <Text style={styles.typeTagText}>{property.type}</Text>
                                    </View>
                                )}
                            </View>

                            {/* Photos Section */}
                            {property.images && property.images.length > 0 && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Photos</Text>
                                    <FlatList
                                        data={property.images}
                                        renderItem={({ item }) => <Image source={{ uri: item }} style={styles.photoThumbnail} />}
                                        keyExtractor={(_, i) => i.toString()}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        scrollEnabled={true}
                                        nestedScrollEnabled={true}
                                        contentContainerStyle={styles.photosScroll}
                                    />
                                </View>
                            )}

                            {/* Amenities Section */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Amenities</Text>
                                <View style={styles.amenitiesGrid}>
                                    {property.amenities?.map((a, i) => (
                                        <View key={i} style={styles.amenityItemDrawer}>
                                            <View style={styles.amenityIconBox}>
                                                <Ionicons name={getAmenityIcon(a)} size={18} color="#1a1a1a" />
                                            </View>
                                            <Text style={styles.amenityItemTextDrawer}>{a}</Text>
                                        </View>
                                    ))}
                                    {property.depositRequired && (
                                        <View style={styles.amenityItemDrawer}>
                                            <View style={styles.amenityIconBox}>
                                                <Ionicons name="cash-outline" size={18} color="#1a1a1a" />
                                            </View>
                                            <Text style={styles.amenityItemTextDrawer}>Deposit {property.depositPercentage}%</Text>
                                        </View>
                                    )}
                                    {property.findersFee && (
                                        <View style={styles.amenityItemDrawer}>
                                            <View style={styles.amenityIconBox}>
                                                <Ionicons name="receipt-outline" size={18} color="#1a1a1a" />
                                            </View>
                                            <Text style={styles.amenityItemTextDrawer}>Fee: E{property.findersFee}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Agent Section */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Agent</Text>
                                <View style={styles.agentCard}>
                                    <Image source={{ uri: property.agent?.avatar }} style={styles.agentAvatar} />
                                    <View style={styles.agentInfo}>
                                        <Text style={styles.agentName}>{property.agent?.name}</Text>
                                        <Text style={styles.agentTitle}>{property.agent?.title}</Text>
                                        <View style={styles.agentStats}>
                                            <Ionicons name="star" size={12} color="#FFA500" />
                                            <Text style={styles.agentRating}>
                                                {property.agent?.rating} ({property.agent?.reviews} reviews)
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Call Button */}
                            <TouchableOpacity style={styles.callButton} onPress={callNow}>
                                <Ionicons name="call-outline" size={18} color="#fff" />
                                <Text style={styles.callText}>Call {property.agent?.name?.split(" ")[0]}</Text>
                            </TouchableOpacity>

                            {/* Bottom Spacing */}
                            <View style={styles.bottomSpacing} />
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        overflow: "hidden",
        marginVertical: 8,
        marginHorizontal: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    imageContainer: { position: "relative" },
    image: { width: "100%", height: 300 },
    distanceBadge: {
        position: "absolute",
        top: 8,
        left: 8,
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingHorizontal: 8,
        paddingVertical: 4,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    distanceText: { fontSize: 11, color: "#1a1a1a", fontWeight: "500" },
    infoContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 12,
        position: "absolute",
        backgroundColor: '#FFF',
        width: "93%",
        bottom: 10,
        left: 13,
        borderRadius: 16,
    },
    title: { fontSize: 15, fontWeight: "700", color: "#1a1a1a", lineHeight: 20 },
    locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
    location: { fontSize: 11, color: "#666" },
    rating: { fontSize: 10, color: "#888", marginTop: 6 },
    amenitiesRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 8,
        gap: 8,
    },
    amenityItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    amenityText: { color: "#666", fontSize: 10 },
    priceContainer: { alignItems: "flex-end", justifyContent: "center" },
    price: { fontSize: 16, fontWeight: "700", color: "#1a1a1a" },
    period: { fontSize: 11, color: "#999" },

    // Modal / Drawer
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "flex-end",
    },
    drawer: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "90%",
    },
    handleBar: {
        width: 50,
        height: 4,
        backgroundColor: "#ddd",
        borderRadius: 2,
        alignSelf: "center",
        marginTop: 8,
        marginBottom: 12,
    },
    closeButton: {
        position: "absolute",
        top: 12,
        right: 14,
        zIndex: 10,
        padding: 8,
    },
    scrollContent: {
        paddingTop: 36,
    },
    drawerImage: {
        width: "100%",
        height: 220,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },

    // Header Section
    headerSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: 16,
        gap: 12,
    },
    drawerTitle: { fontSize: 18, fontWeight: "700", color: "#1a1a1a", marginBottom: 6 },
    locationRowDrawer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    drawerLocation: { fontSize: 12, color: "#666", fontWeight: "500" },
    priceTag: {
        backgroundColor: "#f5f5f5",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        alignItems: "flex-end",
    },
    priceTagValue: { fontSize: 16, fontWeight: "700", color: "#1a1a1a" },
    priceTagPeriod: { fontSize: 10, color: "#999", marginTop: 2 },

    // Sections
    section: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 12,
    },

    // Description
    descriptionText: {
        fontSize: 13,
        color: "#555",
        lineHeight: 20,
        marginBottom: 10,
    },
    typeTag: {
        alignSelf: "flex-start",
        backgroundColor: "#f0f0f0",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    typeTagText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#1a1a1a",
    },

    // Photos
    photosScroll: {
        gap: 8,
        paddingRight: 16,
    },
    photoThumbnail: {
        width: 100,
        height: 100,
        borderRadius: 10,
        backgroundColor: "#f0f0f0",
    },

    // Amenities Grid
    amenitiesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    amenityItemDrawer: {
        width: "48%",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        paddingVertical: 12,
        borderRadius: 10,
    },
    amenityIconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 6,
    },
    amenityItemTextDrawer: {
        fontSize: 11,
        color: "#555",
        textAlign: "center",
        fontWeight: "500",
    },

    // Agent Card
    agentCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        padding: 12,
        borderRadius: 12,
        gap: 12,
    },
    agentAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#e0e0e0",
    },
    agentInfo: {
        flex: 1,
    },
    agentName: { fontWeight: "700", fontSize: 13, color: "#1a1a1a" },
    agentTitle: { color: "#666", fontSize: 11, marginTop: 2 },
    agentStats: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 4,
    },
    agentRating: { color: "#888", fontSize: 10 },

    // Call Button
    callButton: {
        backgroundColor: "#1a1a1a",
        borderRadius: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 14,
        marginHorizontal: 16,
        gap: 8,
        marginBottom: 16,
    },
    callText: { color: "#fff", fontSize: 14, fontWeight: "600" },
    bottomSpacing: {
        height: 20,
    },
})

export default MiniPropertyCard
