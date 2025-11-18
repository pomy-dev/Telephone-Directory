import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const { width } = Dimensions.get("window")
const CARD_WIDTH = width - 32

export default function FeaturedPropertyCard({ property, onPress }) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
            {/* Image with Info Container Positioned Inside */}
            <View style={styles.imageContainer}>
                <Image
                    source={{
                        uri:
                            property.images?.[0] ||
                            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLDpcPFt0jl-ONT0pV-5nx2nQvsm7KO34MXw&s",
                    }}
                    style={styles.image}
                />

                {/* 360 Badge */}
                <View style={styles.badgeContainer}>
                    <Ionicons name="checkmark" size={14} color="#1a1a1a" />
                    <Text style={styles.badgeText}>Estate Company</Text>
                </View>

                <View style={styles.bottomSection}>
                    <View style={styles.leftContent}>
                        <Text style={styles.title} numberOfLines={1}>
                            {property.title}
                        </Text>
                        <View style={styles.specs}>
                            <Ionicons name="home-outline" size={12} color="#999" />
                            <Text style={styles.specsText}>
                                {property.beds || 0}bd {property.baths || 0}ba {property.sqm || 1493}m²
                            </Text>
                        </View>
                    </View>

                    <View style={styles.rightContent}>
                        <Text style={styles.price}>E{property.price}</Text>
                        <Text style={styles.period}>{property.rentalPeriod}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        marginRight: 8,
        marginLeft: 4,
        marginVertical: 4,
        backgroundColor: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },
    imageContainer: {
        position: "relative",
        height: 260,
        backgroundColor: "#f0f0f0",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    badgeContainer: {
        position: "absolute",
        top: 12,
        right: 12,
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    badgeText: {
        color: "#1a1a1a",
        fontSize: 11,
        fontWeight: "600",
    },
    bottomSection: {
        position: "absolute",
        bottom: "2%",
        left: 12,
        right: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        paddingVertical: 12,
        paddingHorizontal: 12,
        gap: 12,
        backgroundColor: "#fff",
        borderRadius: 12,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
    },
    leftContent: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 6,
    },
    specs: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    specsText: {
        fontSize: 12,
        color: "#999",
        fontWeight: "500",
    },
    rightContent: {
        alignItems: "flex-end",
    },
    price: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1a1a1a",
    },
    period: {
        fontSize: 11,
        color: "#999",
        marginTop: 2,
    },
})
