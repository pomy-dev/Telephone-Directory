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
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SecondaryNav from '../../components/SecondaryNav';
import { mockLeaseItems } from '../../utils/mockData';

const { width } = Dimensions.get('window');

export default function LeaseItemDetailsScreen({ navigation, route }) {
    const { itemId } = route.params;
    const item = mockLeaseItems.find(i => i.id === itemId);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isBookmarked, setIsBookmarked] = useState(false);

    if (!item) {
        return (
            <View style={styles.container}>
                <SecondaryNav title="Item Details" />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Item not found</Text>
                </View>
            </View>
        );
    }

    const handleCall = () => {
        Linking.openURL(`tel:${item.owner.phone}`);
    };

    const handleWhatsApp = () => {
        Linking.openURL(`whatsapp://send?phone=${item.owner.whatsapp.replace(/[^0-9]/g, '')}`);
    };

    const handleEmail = () => {
        Linking.openURL(`mailto:${item.owner.email}`);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this item for lease: ${item.title}\nPrice: E ${item.price}/${item.leaseType}\nDeposit: E ${item.deposit}`,
                title: item.title,
            });
        } catch (error) {
            console.log('Error sharing:', error);
        }
    };

    const handleApply = () => {
        // Navigate to application screen or show contact options
        Alert.alert(
            'Contact Owner',
            'Would you like to contact the owner to lease this item?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call', onPress: handleCall },
                { text: 'WhatsApp', onPress: handleWhatsApp },
                { text: 'Email', onPress: handleEmail },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <SecondaryNav title="Item Details" />

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
                        {item.images.map((image, index) => (
                            <Image key={index} source={{ uri: image }} style={styles.itemImage} resizeMode="cover" />
                        ))}
                    </ScrollView>
                    <View style={styles.imageIndicator}>
                        {item.images.map((_, index) => (
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
                            <Text style={styles.title}>{item.title}</Text>
                            <View style={styles.locationRow}>
                                <Ionicons name="location" size={16} color="#64748b" />
                                <Text style={styles.address}>
                                    {item.location.city || item.location.village || item.location.area}
                                    {item.location.township && `, ${item.location.township}`}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Price */}
                    <View style={styles.priceContainer}>
                        <View>
                            <Text style={styles.price}>E {item.price.toLocaleString()}</Text>
                            <Text style={styles.pricePeriod}>/{item.leaseType}</Text>
                        </View>
                        <View style={styles.depositContainer}>
                            <Text style={styles.depositLabel}>Deposit:</Text>
                            <Text style={styles.depositAmount}>E {item.deposit.toLocaleString()}</Text>
                        </View>
                    </View>

                    {/* Key Details */}
                    <View style={styles.detailsGrid}>
                        <View style={styles.detailBox}>
                            <Ionicons name="pricetag-outline" size={24} color="#2563eb" />
                            <Text style={styles.detailValue}>{item.category}</Text>
                            <Text style={styles.detailLabel}>Category</Text>
                        </View>
                        <View style={styles.detailBox}>
                            <Ionicons name="shield-checkmark-outline" size={24} color="#2563eb" />
                            <Text style={styles.detailValue}>{item.condition}</Text>
                            <Text style={styles.detailLabel}>Condition</Text>
                        </View>
                        <View style={styles.detailBox}>
                            <Ionicons name="calendar-outline" size={24} color="#2563eb" />
                            <Text style={styles.detailValue}>{item.availableFrom}</Text>
                            <Text style={styles.detailLabel}>Available</Text>
                        </View>
                        <View style={styles.detailBox}>
                            <Ionicons name="time-outline" size={24} color="#2563eb" />
                            <Text style={styles.detailValue}>{item.leaseType}</Text>
                            <Text style={styles.detailLabel}>Lease Type</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{item.description}</Text>
                    </View>

                    {/* Rules */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Rules</Text>
                        {item.rules.map((rule, index) => (
                            <View key={index} style={styles.ruleItem}>
                                <Ionicons name="information-circle-outline" size={18} color="#f59e0b" />
                                <Text style={styles.ruleText}>{rule}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Requirements */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Requirements</Text>
                        {item.requirements.map((req, index) => (
                            <View key={index} style={styles.requirementItem}>
                                <View style={styles.requirementDot} />
                                <Text style={styles.requirementText}>{req}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Owner Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Owner Information</Text>
                        <View style={styles.ownerCard}>
                            <View style={styles.ownerHeader}>
                                <View style={styles.ownerInfo}>
                                    <Text style={styles.ownerName}>{item.owner.name}</Text>
                                    {item.owner.verified && (
                                        <View style={styles.verifiedBadge}>
                                            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                                            <Text style={styles.verifiedText}>Verified</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.ratingContainer}>
                                    <Ionicons name="star" size={16} color="#fbbf24" />
                                    <Text style={styles.rating}>{item.owner.rating}</Text>
                                </View>
                            </View>
                            <Text style={styles.responseTime}>Response Time: {item.owner.responseTime}</Text>
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
                            <Text style={styles.statValue}>{item.views}</Text>
                            <Text style={styles.statLabel}>Views</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="document-text-outline" size={20} color="#64748b" />
                            <Text style={styles.statValue}>{item.applications}</Text>
                            <Text style={styles.statLabel}>Applications</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="calendar-outline" size={20} color="#64748b" />
                            <Text style={styles.statValue}>{item.postedDate}</Text>
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
                <TouchableOpacity style={styles.contactButton} onPress={handleApply}>
                    <Text style={styles.contactButtonText}>Contact Owner</Text>
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
    itemImage: {
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
        justifyContent: 'space-between',
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
    depositContainer: {
        alignItems: 'flex-end',
    },
    depositLabel: {
        fontSize: 12,
        color: '#64748b',
    },
    depositAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#f59e0b',
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
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
        marginTop: 8,
        marginBottom: 4,
        textAlign: 'center',
    },
    detailLabel: {
        fontSize: 11,
        color: '#64748b',
        textAlign: 'center',
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
    ownerCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
    },
    ownerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    ownerInfo: {
        flex: 1,
    },
    ownerName: {
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
    bottomPadding: {
        height: 20,
    },
});

