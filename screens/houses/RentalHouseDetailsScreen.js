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
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SecondaryNav from '../../components/SecondaryNav';
import { mockRentalHouses } from '../../utils/mockData';

const { width } = Dimensions.get('window');

export default function RentalHouseDetailsScreen({ navigation, route }) {
    const { houseId } = route.params;
    const house = mockRentalHouses.find(h => h.id === houseId);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isBookmarked, setIsBookmarked] = useState(false);

    if (!house) {
        return (
            <View style={styles.container}>
                <SecondaryNav title="House Details" />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>House not found</Text>
                </View>
            </View>
        );
    }

    const handleCall = () => {
        Linking.openURL(`tel:${house.landlord.phone}`);
    };

    const handleWhatsApp = () => {
        Linking.openURL(`whatsapp://send?phone=${house.landlord.whatsapp.replace(/[^0-9]/g, '')}`);
    };

    const handleEmail = () => {
        Linking.openURL(`mailto:${house.landlord.email}`);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this rental: ${house.title}\nPrice: E ${house.price}/month\nLocation: ${house.address}`,
                title: house.title,
            });
        } catch (error) {
            console.log('Error sharing:', error);
        }
    };

    const handleApply = () => {
        navigation.navigate('ApplyRentalScreen', { houseId: house.id });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <SecondaryNav title="House Details" />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image Carousel */}
                <View style={styles.imageContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) => {
                            const index = Math.round(e.nativeEvent.contentOffset.x / width);
                            setCurrentImageIndex(index);
                        }}
                    >
                        {house.images.map((image, index) => (
                            <Image key={index} source={{ uri: image }} style={styles.houseImage} resizeMode="cover" />
                        ))}
                    </ScrollView>
                    <View style={styles.imageIndicator}>
                        {house.images.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.indicatorDot,
                                    index === currentImageIndex && styles.indicatorDotActive,
                                ]}
                            />
                        ))}
                    </View>
                    <TouchableOpacity style={styles.bookmarkButton} onPress={() => setIsBookmarked(!isBookmarked)}>
                        <Ionicons
                            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                            size={24}
                            color={isBookmarked ? '#2563eb' : '#fff'}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.contentContainer}>
                    {/* Header Info */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.title}>{house.title}</Text>
                            <View style={styles.locationRow}>
                                <Ionicons name="location" size={16} color="#64748b" />
                                <Text style={styles.address}>{house.address}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Price */}
                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>E {house.price.toLocaleString()}</Text>
                        <Text style={styles.pricePeriod}>/month</Text>
                    </View>

                    {/* Key Details */}
                    <View style={styles.detailsGrid}>
                        <View style={styles.detailBox}>
                            <Ionicons name="bed-outline" size={24} color="#2563eb" />
                            <Text style={styles.detailValue}>{house.bedrooms}</Text>
                            <Text style={styles.detailLabel}>Bedrooms</Text>
                        </View>
                        <View style={styles.detailBox}>
                            <Ionicons name="water-outline" size={24} color="#2563eb" />
                            <Text style={styles.detailValue}>{house.bathrooms}</Text>
                            <Text style={styles.detailLabel}>Bathrooms</Text>
                        </View>
                        <View style={styles.detailBox}>
                            <Ionicons name="resize-outline" size={24} color="#2563eb" />
                            <Text style={styles.detailValue}>{house.size}m²</Text>
                            <Text style={styles.detailLabel}>Size</Text>
                        </View>
                        <View style={styles.detailBox}>
                            <Ionicons name="calendar-outline" size={24} color="#2563eb" />
                            <Text style={styles.detailValue}>{house.availableDate}</Text>
                            <Text style={styles.detailLabel}>Available</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{house.description}</Text>
                    </View>

                    {/* Amenities */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Amenities</Text>
                        <View style={styles.amenitiesGrid}>
                            {house.amenities.map((amenity, index) => (
                                <View key={index} style={styles.amenityItem}>
                                    <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                                    <Text style={styles.amenityText}>{amenity}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Rules */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>House Rules</Text>
                        {house.rules.map((rule, index) => (
                            <View key={index} style={styles.ruleItem}>
                                <Ionicons name="information-circle-outline" size={18} color="#f59e0b" />
                                <Text style={styles.ruleText}>{rule}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Requirements */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Requirements</Text>
                        {house.requirements.map((req, index) => (
                            <View key={index} style={styles.requirementItem}>
                                <View style={styles.requirementDot} />
                                <Text style={styles.requirementText}>{req}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Landlord Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Landlord Information</Text>
                        <View style={styles.landlordCard}>
                            <View style={styles.landlordHeader}>
                                <View style={styles.landlordInfo}>
                                    <Text style={styles.landlordName}>{house.landlord.name}</Text>
                                    {house.landlord.verified && (
                                        <View style={styles.verifiedBadge}>
                                            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                                            <Text style={styles.verifiedText}>Verified</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.ratingContainer}>
                                    <Ionicons name="star" size={16} color="#fbbf24" />
                                    <Text style={styles.rating}>{house.landlord.rating}</Text>
                                </View>
                            </View>
                            <Text style={styles.responseTime}>Response Time: {house.landlord.responseTime}</Text>
                            <View style={styles.contactButtons}>
                                <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
                                    <Ionicons name="call-outline" size={20} color="#2563eb" />
                                    <Text style={styles.contactButtonText}>Call</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.contactButton} onPress={handleWhatsApp}>
                                    <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                                    <Text style={styles.contactButtonText}>WhatsApp</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
                                    <Ionicons name="mail-outline" size={20} color="#2563eb" />
                                    <Text style={styles.contactButtonText}>Email</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Ionicons name="eye-outline" size={20} color="#64748b" />
                            <Text style={styles.statValue}>{house.views}</Text>
                            <Text style={styles.statLabel}>Views</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="document-text-outline" size={20} color="#64748b" />
                            <Text style={styles.statValue}>{house.applications}</Text>
                            <Text style={styles.statLabel}>Applications</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="calendar-outline" size={20} color="#64748b" />
                            <Text style={styles.statValue}>{house.postedDate}</Text>
                            <Text style={styles.statLabel}>Posted</Text>
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
                <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                    <Text style={styles.applyButtonText}>Apply Now</Text>
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
    imageContainer: {
        width: '100%',
        height: 300,
        position: 'relative',
    },
    houseImage: {
        width: width,
        height: 300,
    },
    imageIndicator: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    indicatorDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    indicatorDotActive: {
        backgroundColor: '#fff',
        width: 24,
    },
    bookmarkButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        padding: 20,
    },
    header: {
        marginBottom: 16,
    },
    headerLeft: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        marginBottom: 8,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    address: {
        fontSize: 14,
        color: '#64748b',
        flex: 1,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 24,
    },
    price: {
        fontSize: 32,
        fontWeight: '700',
        color: '#10b981',
    },
    pricePeriod: {
        fontSize: 16,
        color: '#64748b',
        marginLeft: 8,
    },
    detailsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 12,
    },
    detailBox: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    detailValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginTop: 8,
        marginBottom: 4,
    },
    detailLabel: {
        fontSize: 12,
        color: '#64748b',
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
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    amenityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        gap: 8,
    },
    amenityText: {
        fontSize: 14,
        color: '#475569',
        flex: 1,
    },
    ruleItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        gap: 12,
    },
    ruleText: {
        flex: 1,
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
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
    landlordCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
    },
    landlordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    landlordInfo: {
        flex: 1,
    },
    landlordName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    verifiedText: {
        fontSize: 12,
        color: '#10b981',
        fontWeight: '600',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rating: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    responseTime: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 12,
    },
    contactButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    contactButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 10,
        gap: 6,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    contactButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
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
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginTop: 4,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
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
    applyButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2563eb',
        borderRadius: 12,
        padding: 16,
        gap: 8,
    },
    applyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    bottomPadding: {
        height: 20,
    },
});


