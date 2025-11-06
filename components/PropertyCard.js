import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const PropertyCard = ({ property, onPress, onToggleFavorite, isFavorite, style }) => {
    const hasImage = property.image && property.image.trim() !== ""

    return (
        <TouchableOpacity style={[styles.card, style]} onPress={() => onPress(property)} activeOpacity={0.9}>
            <View style={styles.imageContainer}>
                {hasImage ? (
                    <Image source={{ uri: property.image }} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Ionicons name="home-outline" size={48} color="#ccc" />
                        <Text style={styles.placeholderText}>No Image</Text>
                    </View>
                )}

                {property.tag && (
                    <View style={styles.tagContainer}>
                        <Text style={styles.tagText}>{property.tag}</Text>
                    </View>
                )}

                <TouchableOpacity style={styles.favoriteButton} onPress={() => onToggleFavorite(property.id)}>
                    <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? "#FF385C" : "#fff"} />
                </TouchableOpacity>
            </View>

            <View style={styles.details}>
                <View style={styles.features}>
                    <View style={styles.feature}>
                        <Ionicons name="bed-outline" size={16} color="#64748b" />
                        <Text style={styles.featureText}>{property.bedrooms} beds</Text>
                    </View>
                    <View style={styles.feature}>
                        <Ionicons name="water-outline" size={16} color="#64748b" />
                        <Text style={styles.featureText}>{property.bathrooms} baths</Text>
                    </View>
                    <View style={styles.feature}>
                        <Ionicons name="expand-outline" size={16} color="#64748b" />
                        <Text style={styles.featureText}>{property.sqft} sqft</Text>
                    </View>
                </View>

                <Text style={styles.price}>${property.price.toLocaleString()}</Text>
                <Text style={styles.address} numberOfLines={1}>
                    {property.address}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    imageContainer: {
        position: "relative",
        width: "100%",
        height: 200,
    },
    image: {
        width: "100%",
        height: "100%",
    },
    placeholderImage: {
        width: "100%",
        height: "100%",
        backgroundColor: "#f1f5f9",
        justifyContent: "center",
        alignItems: "center",
    },
    placeholderText: {
        marginTop: 8,
        fontSize: 14,
        color: "#94a3b8",
    },
    tagContainer: {
        position: "absolute",
        top: 12,
        left: 12,
        backgroundColor: "rgba(100, 116, 139, 0.9)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    tagText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    favoriteButton: {
        position: "absolute",
        top: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    details: {
        padding: 12,
    },
    features: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        gap: 12,
    },
    feature: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    featureText: {
        fontSize: 13,
        color: "#64748b",
    },
    price: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 4,
    },
    address: {
        fontSize: 13,
        color: "#64748b",
    },
})

export default PropertyCard
