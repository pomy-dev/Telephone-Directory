import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, StatusBar, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import SecondaryNav from "../../components/SecondaryNav"

const JobDetailScreen = ({ route, navigation }) => {
    const { job } = route.params

    return (
        <View style={styles.container}>
            <SecondaryNav
                title="Job Details"
                rightIcon="share-social-outline"
                onRightPress={() => console.log("Share job")}
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Image source={{ uri: job.image }} style={styles.image} />

                <View style={styles.detailsContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{job.title}</Text>
                        <Text style={styles.price}>R{job.price}</Text>
                    </View>

                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{job.category}</Text>
                    </View>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Ionicons name="person-outline" size={16} color="#666" />
                            <Text style={styles.metaText}>Posted by {job.postedBy}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={16} color="#666" />
                            <Text style={styles.metaText}>{job.postedTime}</Text>
                        </View>
                    </View>

                    <View style={styles.locationRow}>
                        <Ionicons name="location" size={20} color="#ef4444" />
                        <Text style={styles.locationText}>{job.location}</Text>
                        {job.distance && <Text style={styles.distanceText}>({job.distance.toFixed(1)} km away)</Text>}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{job.description}</Text>
                        <Text style={styles.description}>
                            This is a great opportunity to earn some extra income. The job requires attention to detail and good
                            communication skills. Please ensure you have the necessary tools and experience before applying.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Requirements</Text>
                        <View style={styles.requirementItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                            <Text style={styles.requirementText}>Own transport preferred</Text>
                        </View>
                        <View style={styles.requirementItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                            <Text style={styles.requirementText}>Experience in {job.category.toLowerCase()}</Text>
                        </View>
                        <View style={styles.requirementItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                            <Text style={styles.requirementText}>Available on short notice</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contact Information</Text>
                        
                        <TouchableOpacity style={styles.contactButton}>
                            <Ionicons name="call-outline" size={20} color="#fff" />
                            <Text style={styles.contactButtonText}>Call {job.postedBy}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.contactButtonSecondary}>
                            <Ionicons name="chatbubble-outline" size={20} color="#000" />
                            <Text style={styles.contactButtonTextSecondary}>Send Message</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.applyButton}>
                    <Text style={styles.applyButtonText}>Apply for this Gig</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 30,
    },
    content: {
        flex: 1,
    },
    image: {
        width: "100%",
        height: 300,
        backgroundColor: "#f0f0f0",
    },
    detailsContainer: {
        padding: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#000",
        flex: 1,
        marginRight: 12,
    },
    price: {
        fontSize: 24,
        fontWeight: "700",
        color: "#10b981",
    },
    categoryBadge: {
        alignSelf: "flex-start",
        backgroundColor: "#f0f0f0",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginBottom: 16,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#666",
    },
    metaRow: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 12,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    metaText: {
        fontSize: 14,
        color: "#666",
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 24,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    locationText: {
        fontSize: 14,
        color: "#000",
        fontWeight: "500",
    },
    distanceText: {
        fontSize: 12,
        color: "#10b981",
        fontWeight: "600",
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: "#666",
        lineHeight: 22,
        marginBottom: 12,
    },
    requirementItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    requirementText: {
        fontSize: 14,
        color: "#666",
    },
    contactButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#10b981",
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
        marginBottom: 12,
    },
    contactButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    contactButtonSecondary: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    contactButtonTextSecondary: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
    },
    footer: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
        backgroundColor: "#fff",
        marginBottom: 40
    },
    applyButton: {
        backgroundColor: "#000",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
})

export default JobDetailScreen
