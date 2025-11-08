import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Platform,
    Image,
    Linking,
    Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SecondaryNav from '../../components/SecondaryNav';
import { mockTenders } from '../../utils/mockData';

export default function TenderDetailsScreen({ navigation, route }) {
    const { tenderId } = route.params;
    const tender = mockTenders.find(t => t.id === tenderId);

    const [isBookmarked, setIsBookmarked] = useState(false);

    if (!tender) {
        return (
            <View style={styles.container}>
                <SecondaryNav title="Tender Details" />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Tender not found</Text>
                </View>
            </View>
        );
    }

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this tender: ${tender.title}\nBudget: ${tender.budget}\nDeadline: ${tender.deadline}`,
                title: tender.title,
            });
        } catch (error) {
            console.log('Error sharing:', error);
        }
    };

    const handleEmail = () => {
        if (tender.enquiryEmail) {
            Linking.openURL(`mailto:${tender.enquiryEmail}`);
        }
    };

    const handlePhone = () => {
        if (tender.enquiryPhone) {
            Linking.openURL(`tel:${tender.enquiryPhone}`);
        }
    };

    const handleBid = () => {
        navigation.navigate('BidTenderScreen', { tenderId: tender.id });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SecondaryNav title="Tender Details" />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Poster Image */}
                {tender.hasPoster && tender.posterUrl && (
                    <View style={styles.posterContainer}>
                        <Image source={tender.posterUrl} style={styles.posterImage} resizeMode="cover" />
                    </View>
                )}

                {/* Header Info */}
                <View style={styles.contentContainer}>
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.title}>{tender.title}</Text>
                            <View style={styles.organizationRow}>
                                <Ionicons name="business-outline" size={16} color="#64748b" />
                                <Text style={styles.organization}>{tender.organization}</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.bookmarkButton}
                            onPress={() => setIsBookmarked(!isBookmarked)}
                        >
                            <Ionicons
                                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                                size={24}
                                color={isBookmarked ? '#2563eb' : '#64748b'}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Status Badges */}
                    <View style={styles.badgesRow}>
                        {tender.urgent && (
                            <View style={styles.urgentBadge}>
                                <Ionicons name="alert-circle" size={14} color="#fff" />
                                <Text style={styles.urgentText}>Urgent</Text>
                            </View>
                        )}
                        <View style={styles.industryBadge}>
                            <Text style={styles.industryText}>{tender.industry}</Text>
                        </View>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{tender.category}</Text>
                        </View>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{tender.status}</Text>
                        </View>
                    </View>

                    {/* Key Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Ionicons name="cash-outline" size={20} color="#10b981" />
                            <View style={styles.statContent}>
                                <Text style={styles.statLabel}>Budget</Text>
                                <Text style={styles.statValue}>{tender.budget}</Text>
                            </View>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="calendar-outline" size={20} color="#f59e0b" />
                            <View style={styles.statContent}>
                                <Text style={styles.statLabel}>Deadline</Text>
                                <Text style={styles.statValue}>{tender.deadline}</Text>
                            </View>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="location-outline" size={20} color="#3b82f6" />
                            <View style={styles.statContent}>
                                <Text style={styles.statLabel}>Location</Text>
                                <Text style={styles.statValue}>{tender.location}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{tender.description}</Text>
                    </View>

                    {/* Detailed Description */}
                    {tender.detailedDescription && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Detailed Description</Text>
                            <Text style={styles.detailedDescription}>
                                {tender.detailedDescription.split('\n').map((line, index) => (
                                    <Text key={index}>
                                        {line}
                                        {index < tender.detailedDescription.split('\n').length - 1 && '\n'}
                                    </Text>
                                ))}
                            </Text>
                        </View>
                    )}

                    {/* Requirements */}
                    {tender.requirements && tender.requirements.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Requirements</Text>
                            {tender.requirements.map((req, index) => (
                                <View key={index} style={styles.requirementItem}>
                                    <View style={styles.requirementDot} />
                                    <Text style={styles.requirementText}>{req}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Contact Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contact Information</Text>
                        {tender.enquiryEmail && (
                            <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
                                <Ionicons name="mail-outline" size={20} color="#2563eb" />
                                <Text style={styles.contactText}>{tender.enquiryEmail}</Text>
                                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                            </TouchableOpacity>
                        )}
                        {tender.enquiryPhone && (
                            <TouchableOpacity style={styles.contactItem} onPress={handlePhone}>
                                <Ionicons name="call-outline" size={20} color="#2563eb" />
                                <Text style={styles.contactText}>{tender.enquiryPhone}</Text>
                                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Bid Info */}
                    <View style={styles.section}>
                        <View style={styles.bidInfoRow}>
                            <View>
                                <Text style={styles.bidInfoLabel}>Number of Bids</Text>
                                <Text style={styles.bidInfoValue}>{tender.numberOfBids} submitted</Text>
                            </View>
                            <View>
                                <Text style={styles.bidInfoLabel}>Days Left</Text>
                                <Text style={styles.bidInfoValue}>{tender.daysLeft} days</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.bottomPadding} />
                </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                    <Ionicons name="share-outline" size={20} color="#2563eb" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.bidButton} onPress={handleBid}>
                    <Text style={styles.bidButtonText}>Submit Bid</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#64748b',
    },
    posterContainer: {
        width: '100%',
        height: 250,
        backgroundColor: '#000',
    },
    posterImage: {
        width: '100%',
        height: '100%',
    },
    contentContainer: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    headerLeft: {
        flex: 1,
        marginRight: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#000',
        marginBottom: 8,
        lineHeight: 30,
    },
    organizationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    organization: {
        fontSize: 14,
        color: '#64748b',
    },
    bookmarkButton: {
        padding: 8,
    },
    badgesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },
    urgentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ef4444',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    urgentText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    industryBadge: {
        backgroundColor: '#f0f9ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    industryText: {
        color: '#0284c7',
        fontSize: 12,
        fontWeight: '600',
    },
    categoryBadge: {
        backgroundColor: '#eff6ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    categoryText: {
        color: '#2563eb',
        fontSize: 12,
        fontWeight: '600',
    },
    statusBadge: {
        backgroundColor: '#f0fdf4',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        color: '#16a34a',
        fontSize: 12,
        fontWeight: '600',
    },
    statsContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    statContent: {
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 2,
    },
    statValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: '#475569',
        lineHeight: 24,
    },
    detailedDescription: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        gap: 12,
    },
    requirementDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#2563eb',
        marginTop: 6,
    },
    requirementText: {
        flex: 1,
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 10,
        marginBottom: 12,
        gap: 12,
    },
    contactText: {
        flex: 1,
        fontSize: 14,
        color: '#475569',
    },
    bidInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    bidInfoLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 4,
    },
    bidInfoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        gap: 12,
    },
    shareButton: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bidButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2563eb',
        borderRadius: 12,
        padding: 16,
        gap: 8,
    },
    bidButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    bottomPadding: {
        height: 20,
    },
});

