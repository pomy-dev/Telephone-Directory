import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"

const NativeAd = ({ ads, maxAdsToShow = 1 }) => {
    if (!ads || ads.length === 0) {
        return null
    }

    const displayAds = ads.slice(0, maxAdsToShow)

    return (
        <>
            {displayAds.map((ad) => (
                <TouchableOpacity key={ad.id} style={styles.adContainer} activeOpacity={0.9}>
                    <View style={styles.adContent}>
                        {ad.imageUrl && <Image source={{ uri: ad.imageUrl }} style={styles.adImage} resizeMode="cover" />}
                        <View style={styles.adText}>
                            <Text style={styles.adBrand}>{ad.brandName}</Text>
                            <Text style={styles.adTitle} numberOfLines={2}>
                                {ad.title}
                            </Text>
                            <Text style={styles.adDescription} numberOfLines={1}>
                                {ad.description}
                            </Text>
                            <TouchableOpacity style={styles.adCTA}>
                                <Text style={styles.adCTAText}>{ad.cta}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}
        </>
    )
}

const styles = StyleSheet.create({
    adContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        overflow: "hidden",
        marginVertical: 8,
        marginHorizontal: 12,
        borderWidth: 1,
        borderColor: "#E5E5E5",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    adContent: {
        flexDirection: "row",
        padding: 12,
    },
    adImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 12,
    },
    adText: {
        flex: 1,
        justifyContent: "space-between",
    },
    adBrand: {
        fontSize: 10,
        fontWeight: "600",
        color: "#8A8A8A",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    adTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#000000",
        marginVertical: 4,
    },
    adDescription: {
        fontSize: 12,
        color: "#555555",
        marginBottom: 6,
    },
    adCTA: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: "#000000",
        borderRadius: 4,
        alignSelf: "flex-start",
    },
    adCTAText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#FFFFFF",
    },
})

export default NativeAd
