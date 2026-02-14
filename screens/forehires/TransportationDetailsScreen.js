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
import { Icons } from '../../constants/Icons';
import { AppContext } from '../../context/appContext';
import SecondaryNav from '../../components/SecondaryNav';
import App from '../../App';

const { width } = Dimensions.get('window');

export default function TransportationDetailsScreen({ navigation, route }) {
    const { vehicle } = route.params;
    const { theme, isDarkMode } = React.useContext(AppContext)
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isBookmarked, setIsBookmarked] = useState(false);

    if (!vehicle) {
        return (
            <View style={styles.container}>
                <SecondaryNav title="Vehicle Details" />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Vehicle not found</Text>
                </View>
            </View>
        );
    }

    const handleCall = () => {
        Linking.openURL(`tel:${vehicle.owner_info.phone}`);
    };

    const handleWhatsApp = () => {
        Linking.openURL(`whatsapp://send?phone=${vehicle.owner_info.whatsapp.replace(/[^0-9]/g, '')}`);
    };

    const handleEmail = () => {
        Linking.openURL(`mailto:${vehicle.owner_info.email}`);
    };

    const handleSMS = async () => {
        shareMessage = `Hello ${vehicle?.owner_info?.name}!\n\n`;
        const smsUrl = Platform.OS === "ios"
            ? `sms:${vehicle?.owner_info?.phone}&body=${encodeURIComponent(shareMessage)}` // iOS uses semicolon
            : `smsto:${vehicle?.owner_info?.phone}?body=${encodeURIComponent(shareMessage)}`;
        if (await Linking.canOpenURL(smsUrl))
            await Linking.openURL(smsUrl);
        else
            throw new Error('SMS client not available');
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this vehicle for hire: ${vehicle.vehicle_category}\nLocation: ${vehicle.location.address}`,
                title: vehicle.vehicle_type,
            });
        } catch (error) {
            console.log('Error sharing:', error);
        }
    };

    const handleBook = () => {
        Alert.alert('Booking', 'Choose booking methods.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Call', onPress: () => handleCall() },
            { text: 'Fill From', onPress: () => navigation.navigate('BookTransportationScreen', { vehicle: vehicle }) },
        ]);
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
            <SecondaryNav title="Fore-Hire Details" />

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
                        {vehicle.vehicle_images.map((image, index) => (
                            <Image key={index} source={{ uri: image?.url }} style={styles.vehicleImage} resizeMode="cover" />
                        ))}
                    </ScrollView>
                    <View style={styles.imageIndicator}>
                        {vehicle.vehicle_images.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.indicatorDot,
                                    index === currentImageIndex && styles.indicatorDotActive,
                                ]}
                            />
                        ))}
                    </View>
                    {vehicle.boarder_crossing && (
                        <View style={styles.borderBadge}>
                            <Ionicons name="globe" size={16} color="#fff" />
                            <Text style={styles.borderBadgeText}>Cross Border</Text>
                        </View>
                    )}
                    <TouchableOpacity style={styles.bookmarkButton} onPress={() => setIsBookmarked(!isBookmarked)}>
                        <Ionicons
                            name={isBookmarked ? 'heart' : 'heart-outline'}
                            size={24}
                            color={isBookmarked ? '#2563eb' : '#fff'}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.contentContainer}>
                    {/* Header Info */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={[styles.title, { color: theme.colors.text }]}>
                                {
                                    vehicle.vehicle_category.replace(/_/g, ' ')
                                        .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                        .join(' ')
                                }
                            </Text>
                            <View style={styles.vehicleInfoRow}>
                                <Text style={[styles.makeModel, { color: theme.colors.text }]}>{vehicle.vehicle_make} {vehicle.model}</Text>
                                <Text style={[styles.registration, { color: theme.colors.sub_text }]}>• {vehicle.registration}</Text>
                            </View>
                            <View style={styles.locationRow}>
                                <Ionicons name="location" size={16} color={theme.colors.sub_text} />
                                <Text style={[styles.address, { color: theme.colors.sub_text }]}>{vehicle.location.city}</Text>
                                <Icons.FontAwesome name="drivers-license-o" size={16} color={theme.colors.sub_text} />
                                <Text style={[styles.address, { color: theme.colors.sub_text }]}>{vehicle.owner_info.driver || 'Unknown'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Key Details */}
                    <View style={styles.detailsGrid}>
                        {vehicle.vehicle_capacity && (
                            <View style={[styles.detailBox, { backgroundColor: theme.colors.card }]}>
                                <Ionicons name="people" size={24} color={theme.colors.indicator} />
                                <Text style={[styles.detailValue, { color: theme.colors.text }]}>{vehicle.vehicle_capacity}</Text>
                                <Text style={[styles.detailLabel, { color: theme.colors.sub_text }]}>Seats</Text>
                            </View>
                        )}
                        <View style={[styles.detailBox, { backgroundColor: theme.colors.card }]}>
                            <Ionicons name="time" size={24} color={theme.colors.indicator} />
                            <Text style={[styles.detailValue, { color: theme.colors.text }]}>{vehicle.operating_start}</Text>
                            <Text style={[styles.detailLabel, { color: theme.colors.sub_text }]}>Start Time</Text>
                        </View>
                        <View style={[styles.detailBox, { backgroundColor: theme.colors.card }]}>
                            <Ionicons name="time-outline" size={24} color={theme.colors.indicator} />
                            <Text style={[styles.detailValue, { color: theme.colors.text }]}>{vehicle.operating_end}</Text>
                            <Text style={[styles.detailLabel, { color: theme.colors.sub_text }]}>End Time</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Description</Text>
                        <Text style={[styles.description, { color: theme.colors.sub_text }]}>{vehicle.description}</Text>
                    </View>

                    {/* Routes (if available) */}
                    {vehicle.routes.length > 0 && (
                        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Available Routes</Text>
                            {vehicle.routes.map((route, index) => (
                                <View key={index} style={styles.routeCard}>
                                    <View style={styles.routeHeader}>
                                        <View style={styles.routeOrigin}>
                                            <Ionicons name="location" size={20} color="#2563eb" />
                                            <Text style={styles.routeLocation}>{route.origin}</Text>
                                        </View>
                                        <Ionicons name="arrow-forward" size={20} color="#64748b" />
                                        <View style={styles.routeDestination}>
                                            <Ionicons name="location" size={20} color="#10b981" />
                                            <Text style={styles.routeLocation}>{route.destination}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.routeDetails}>
                                        <View style={styles.routeDetailItem}>
                                            <Ionicons name="resize" size={16} color="#64748b" />
                                            <Text style={styles.routeDetailText}>{route.distance}</Text>
                                        </View>
                                        <View style={styles.routeDetailItem}>
                                            <Ionicons name="time" size={16} color="#64748b" />
                                            <Text style={styles.routeDetailText}>{route.duration}</Text>
                                        </View>
                                        <View style={styles.routeDetailItem}>
                                            <Ionicons name="pricetag" size={16} color="#64748b" />
                                            <Text style={styles.routeDetailText}>E {route.price.toLocaleString() || 'Unknown'}</Text>
                                        </View>
                                    </View>
                                    {route.boarder_crossing && (
                                        <View style={styles.borderRouteBadge}>
                                            <Ionicons name="globe" size={14} color="#10b981" />
                                            <Text style={styles.borderRouteText}>Cross Border Route</Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Operating Schedule */}
                    <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Operating Schedule</Text>
                        <View style={styles.scheduleContainer}>
                            <View style={styles.scheduleRow}>
                                <Text style={[styles.scheduleLabel, { color: theme.colors.text }]}>Days:</Text>
                                <Text style={[styles.scheduleValue, { color: theme.colors.sub_text }]}>{vehicle.operating_days.join(', ')}</Text>
                            </View>
                            <View style={styles.scheduleRow}>
                                <Text style={[styles.scheduleLabel, { color: theme.colors.text }]}>Hours:</Text>
                                <Text style={[styles.scheduleValue, { color: theme.colors.sub_text }]}>{vehicle.operating_start} - {vehicle.operating_end}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Features */}
                    <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Features</Text>
                        <View style={styles.featuresGrid}>
                            {vehicle.vehicle_features.map((feature, index) => (
                                <View key={index} style={styles.featureItem}>
                                    <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                                    <Text style={[styles.featureText, { color: theme.colors.sub_text }]}>{feature}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Owner Info */}
                    <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Owner Information</Text>
                        <View style={[styles.ownerCard, { backgroundColor: theme.colors.sub_card }]}>
                            <View style={styles.ownerHeader}>
                                <View style={styles.ownerInfo}>
                                    <Text style={[styles.ownerName, { color: theme.colors.sub_text }]}>{vehicle.owner_info.name}</Text>
                                    {vehicle.vehicle_certifications.license && (
                                        <View style={styles.verifiedBadge}>
                                            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                                            <Text style={styles.verifiedText}>Verified</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.ratingContainer}>
                                    <Ionicons name="star" size={16} color="#fbbf24" />
                                    <Text style={[styles.rating, { color: theme.colors.sub_text }]}>{vehicle.rating}</Text>
                                </View>
                            </View>
                            <Text style={[styles.responseTime, { color: theme.colors.text }]}>Response Time: {vehicle.owner_info.responsetime}</Text>
                            <View style={styles.contactButtons}>
                                <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
                                    <Ionicons name="call-outline" size={30} color="#2563eb" />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.contactButton} onPress={handleWhatsApp}>
                                    <Ionicons name="logo-whatsapp" size={30} color="#25D366" />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
                                    <Ionicons name="mail-outline" size={30} color="#eb2550ff" />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.contactButton} onPress={handleSMS}>
                                    <Icons.MaterialIcons name="message" size={30} color="#2563eb" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Certifications */}
                    <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Certifications</Text>
                        <View style={styles.certificationsContainer}>
                            {vehicle.vehicle_certifications?.insurance && (
                                <View style={styles.certificationItem}>
                                    <Ionicons name="shield-checkmark" size={20} color="#10b981" />
                                    <Text style={[styles.certificationText, { color: theme.colors.text }]}>Fully Insured</Text>
                                </View>
                            )}
                            {vehicle.vehicle_certifications?.license && (
                                <View style={styles.certificationItem}>
                                    <Ionicons name="document-text" size={20} color="#10b981" />
                                    <Text style={[styles.certificationText, { color: theme.colors.text }]}>Licensed</Text>
                                </View>
                            )}
                            {vehicle.boarder_crossing && (
                                <View style={styles.certificationItem}>
                                    <Ionicons name="globe" size={20} color="#10b981" />
                                    <Text style={[styles.certificationText, { color: theme.colors.text }]}>Border Crossing Approved</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={[styles.footer, { backgroundColor: theme.colors.card }]}>
                <TouchableOpacity style={[styles.shareButton, { backgroundColor: theme.colors.primary }]} onPress={handleShare}>
                    <Icons.Feather name="share-2" size={20} color="#2563eb" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.bookButton, { backgroundColor: theme.colors.primary }]} onPress={handleBook}>
                    <Text style={styles.bookButtonText}>Request Service</Text>
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
    vehicleImage: {
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
    borderBadge: {
        position: 'absolute',
        top: 16,
        right: 60,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10b981',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    borderBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
    },
    bookmarkButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 33,
        height: 33,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        paddingHorizontal: 10,
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
    vehicleInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        flexWrap: 'wrap',
    },
    makeModel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#475569',
    },
    year: {
        fontSize: 16,
        color: '#94a3b8',
        marginLeft: 4,
    },
    registration: {
        fontSize: 16,
        color: '#94a3b8',
        marginLeft: 4,
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
    categoryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: '#eff6ff',
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#2563eb',
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
        padding: 5,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    detailValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginTop: 8,
        marginBottom: 4,
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
    routeCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    routeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    routeOrigin: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    routeDestination: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
        justifyContent: 'flex-end',
    },
    routeLocation: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    routeDetails: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 8,
    },
    routeDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    routeDetailText: {
        fontSize: 13,
        color: '#64748b',
    },
    borderRouteBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#f0fdf4',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
        marginTop: 4,
    },
    borderRouteText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#10b981',
    },
    scheduleContainer: {
        gap: 12,
    },
    scheduleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    scheduleLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    scheduleValue: {
        fontSize: 14,
        color: '#64748b',
        flex: 1,
        textAlign: 'right',
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        gap: 8,
    },
    featureText: {
        fontSize: 14,
        color: '#475569',
        flex: 1,
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
    experience: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 4,
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
        backgroundColor: '#F8F4FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 50,
        gap: 6,
        borderColor: '#e3e3e3ff',
    },
    contactButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
    certificationsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    certificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    certificationText: {
        fontSize: 14,
        color: '#475569',
        fontWeight: '500',
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
        paddingBottom: 50,
        paddingTop: 10,
        paddingHorizontal: 10,
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
    bookButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2563eb',
        borderRadius: 12,
        padding: 16,
        gap: 8,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    bottomPadding: {
        height: 20,
    },
});



