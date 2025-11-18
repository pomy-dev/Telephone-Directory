"use client"

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, StatusBar, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import SecondaryNav from "../../components/SecondaryNav"

const AgentDetailsScreen = ({ navigation, route }) => {
    const { agent } = route?.params || {}

    if (!agent) {
        return (
            <View style={styles.container}>
                <Text>Agent not found</Text>
            </View>
        )
    }

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
                },
            ]}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <SecondaryNav title="Agent Profile" onBackPress={() => navigation?.goBack()} />
                </View>

                {/* Agent Profile Section */}
                <View style={styles.profileSection}>
                    <Image source={{ uri: agent.avatar || "https://via.placeholder.com/120" }} style={styles.profileImage} />
                    <Text style={styles.agentName}>{agent.name}</Text>
                    <Text style={styles.agentTitle}>{agent.title || "Real Estate Agent"}</Text>

                    {agent.license && <Text style={styles.license}>License: {agent.license}</Text>}
                </View>

                {/* Rating Section */}
                {agent.rating && (
                    <View style={styles.ratingSection}>
                        <View style={styles.ratingRow}>
                            <View style={styles.starRow}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Ionicons
                                        key={star}
                                        name={star <= Math.round(agent.rating) ? "star" : "star-outline"}
                                        size={16}
                                        color="#FFB800"
                                    />
                                ))}
                            </View>
                            <Text style={styles.ratingScore}>{agent.rating}/5</Text>
                        </View>
                        {agent.reviews && <Text style={styles.reviewCount}>({agent.reviews} reviews)</Text>}
                    </View>
                )}

                {/* About Section */}
                {agent.bio && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.sectionContent}>{agent.bio}</Text>
                    </View>
                )}

                {/* Experience Section */}
                {agent.experience && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Experience</Text>
                        <Text style={styles.sectionContent}>{agent.experience} years in real estate</Text>
                    </View>
                )}

                {/* Specializations */}
                {agent.specializations && agent.specializations.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Specializations</Text>
                        <View style={styles.tagsContainer}>
                            {agent.specializations.map((spec, index) => (
                                <View key={index} style={styles.tag}>
                                    <Text style={styles.tagText}>{spec}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Contact Information */}
                <View style={styles.contactSection}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>

                    {agent.phone && (
                        <TouchableOpacity style={styles.contactItem}>
                            <View style={styles.contactIcon}>
                                <Ionicons name="call-outline" size={20} color="#000" />
                            </View>
                            <View>
                                <Text style={styles.contactLabel}>Phone</Text>
                                <Text style={styles.contactValue}>{agent.phone}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#ccc" />
                        </TouchableOpacity>
                    )}

                    {agent.email && (
                        <TouchableOpacity style={styles.contactItem}>
                            <View style={styles.contactIcon}>
                                <Ionicons name="mail-outline" size={20} color="#000" />
                            </View>
                            <View>
                                <Text style={styles.contactLabel}>Email</Text>
                                <Text style={styles.contactValue}>{agent.email}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#ccc" />
                        </TouchableOpacity>
                    )}

                    {agent.whatsapp && (
                        <TouchableOpacity style={styles.contactItem}>
                            <View style={styles.contactIcon}>
                                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                            </View>
                            <View>
                                <Text style={styles.contactLabel}>WhatsApp</Text>
                                <Text style={styles.contactValue}>{agent.whatsapp}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#ccc" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Properties Listed */}
                {agent.propertiesCount && (
                    <View style={styles.statsSection}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{agent.propertiesCount}</Text>
                            <Text style={styles.statLabel}>Properties Listed</Text>
                        </View>
                        {agent.soldCount && (
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{agent.soldCount}</Text>
                                <Text style={styles.statLabel}>Sold This Year</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.primaryButton}>
                        <Ionicons name="call" size={20} color="#fff" />
                        <Text style={styles.primaryButtonText}>Call Agent</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryButton}>
                        <Ionicons name="mail" size={20} color="#000" />
                        <Text style={styles.secondaryButtonText}>Send Message</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        paddingBottom: 8,
        paddingHorizontal: 16,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    },
    profileSection: {
        alignItems: "center",
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 12,
    },
    agentName: {
        fontSize: 22,
        fontWeight: "700",
        color: "#000",
    },
    agentTitle: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
    },
    license: {
        fontSize: 12,
        color: "#999",
        marginTop: 8,
    },
    ratingSection: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 4,
    },
    starRow: {
        flexDirection: "row",
        gap: 4,
    },
    ratingScore: {
        fontSize: 16,
        fontWeight: "700",
        color: "#000",
    },
    reviewCount: {
        fontSize: 12,
        color: "#999",
    },
    section: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#000",
        marginBottom: 8,
    },
    sectionContent: {
        fontSize: 13,
        color: "#666",
        lineHeight: 18,
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    tag: {
        backgroundColor: "#F5F5F5",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    tagText: {
        fontSize: 12,
        color: "#555",
    },
    contactSection: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    },
    contactItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
    },
    contactIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: "#F5F5F5",
        justifyContent: "center",
        alignItems: "center",
    },
    contactLabel: {
        fontSize: 12,
        color: "#999",
    },
    contactValue: {
        fontSize: 13,
        fontWeight: "600",
        color: "#000",
        marginTop: 2,
    },
    statsSection: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    },
    statItem: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 12,
        backgroundColor: "#F9F9F9",
        borderRadius: 8,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: "700",
        color: "#000",
    },
    statLabel: {
        fontSize: 12,
        color: "#999",
        marginTop: 4,
    },
    actionButtons: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 10,
    },
    primaryButton: {
        backgroundColor: "#000",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 8,
    },
    primaryButtonText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#fff",
    },
    secondaryButton: {
        backgroundColor: "#F5F5F5",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#000",
    },
})

export default AgentDetailsScreen
