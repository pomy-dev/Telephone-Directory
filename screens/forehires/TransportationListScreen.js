import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Platform,
    Image,
    TextInput,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SecondaryNav from '../../components/SecondaryNav';
import { mockTransportationVehicles } from '../../utils/mockData';

// Mock user location (in a real app, this would come from GPS)
const USER_LOCATION = {
    latitude: -26.3167,
    longitude: 31.1333,
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export default function TransportationListScreen({ navigation }) {
    const [selectedType, setSelectedType] = useState('All');
    const [sortByCategory, setSortByCategory] = useState('All');
    const [sortByBorderCrossing, setSortByBorderCrossing] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSortOptions, setShowSortOptions] = useState(false);
    const [likedVehicles, setLikedVehicles] = useState(new Set());
    const [vehicleRatings, setVehicleRatings] = useState({});
    const [showNearByLimit, setShowNearByLimit] = useState(3);
    const [showOtherLimit, setShowOtherLimit] = useState(3);

    const types = ['All', 'Minibus', 'Bus', 'Van', 'Truck', 'Lory', 'SUV', 'Sedan'];
    const categories = ['All', 'Public Transport', 'Cargo', 'Passenger', 'Luxury'];

    // Filter and sort vehicles
    const processedVehicles = useMemo(() => {
        let filtered = mockTransportationVehicles.filter(vehicle => {
            const matchesType = selectedType === 'All' ||
                (selectedType === 'Minibus' && vehicle.type === 'minibus') ||
                (selectedType !== 'All' && vehicle.type === selectedType.toLowerCase());
            const matchesCategory = sortByCategory === 'All' ||
                (sortByCategory === 'Public Transport' && vehicle.category === 'public_transport') ||
                (sortByCategory === 'Cargo' && vehicle.category === 'cargo') ||
                (sortByCategory === 'Passenger' && vehicle.category === 'passenger') ||
                (sortByCategory === 'Luxury' && vehicle.category === 'luxury');
            const matchesBorder = sortByBorderCrossing === 'All' ||
                (sortByBorderCrossing === 'Yes' && vehicle.borderCrossing) ||
                (sortByBorderCrossing === 'No' && !vehicle.borderCrossing);
            const matchesSearch = vehicle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                vehicle.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
                vehicle.model.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesType && matchesCategory && matchesBorder && matchesSearch;
        });

        // Calculate distances and add to vehicles
        filtered = filtered.map(vehicle => {
            let distance = null;
            if (vehicle.location?.coordinates) {
                distance = calculateDistance(
                    USER_LOCATION.latitude,
                    USER_LOCATION.longitude,
                    vehicle.location.coordinates.latitude,
                    vehicle.location.coordinates.longitude
                );
            }
            return { ...vehicle, distance };
        });

        // Sort by distance (nearby first)
        filtered.sort((a, b) => {
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
        });

        return filtered;
    }, [selectedType, sortByCategory, sortByBorderCrossing, searchQuery]);

    // Separate into Near By and Other Further
    const nearByVehicles = useMemo(() => {
        return processedVehicles.filter(v => v.distance !== null && v.distance <= 50);
    }, [processedVehicles]);

    const otherVehicles = useMemo(() => {
        return processedVehicles.filter(v => v.distance === null || v.distance > 50);
    }, [processedVehicles]);

    const toggleLike = (vehicleId) => {
        setLikedVehicles(prev => {
            const newSet = new Set(prev);
            if (newSet.has(vehicleId)) {
                newSet.delete(vehicleId);
            } else {
                newSet.add(vehicleId);
            }
            return newSet;
        });
    };

    const handleRate = (vehicleId) => {
        Alert.prompt(
            'Rate Vehicle',
            'Please rate this vehicle from 1 to 5:',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Submit',
                    onPress: (rating) => {
                        const numRating = parseInt(rating);
                        if (numRating >= 1 && numRating <= 5) {
                            setVehicleRatings(prev => ({
                                ...prev,
                                [vehicleId]: numRating,
                            }));
                            Alert.alert('Success', 'Thank you for your rating!');
                        } else {
                            Alert.alert('Error', 'Please enter a rating between 1 and 5');
                        }
                    },
                },
            ],
            'plain-text',
            '',
            'numeric'
        );
    };

    const getTypeLabel = (type) => {
        const labels = {
            minibus: 'Minibus',
            bus: 'Bus',
            van: 'Van',
            truck: 'Truck',
            suv: 'SUV',
            sedan: 'Sedan',
        };
        return labels[type] || type;
    };

    const getPriceLabel = (priceType) => {
        const labels = {
            per_trip: '/trip',
            per_day: '/day',
            per_hour: '/hour',
            per_km: '/km',
        };
        return labels[priceType] || '';
    };

    const renderVehicleCard = (vehicle) => {
        const isLiked = likedVehicles.has(vehicle.id);
        const userRating = vehicleRatings[vehicle.id];
        const displayRating = userRating || vehicle.rating || 0;
        const displayLikes = isLiked ? (vehicle.likes || 0) + 1 : (vehicle.likes || 0);

        return (
            <TouchableOpacity
                key={vehicle.id}
                style={styles.vehicleCard}
                onPress={() => navigation.navigate('TransportationDetailsScreen', { vehicleId: vehicle.id })}
            >
                <Image source={{ uri: vehicle.images[0] }} style={styles.vehicleImage} resizeMode="cover" />
                {vehicle.borderCrossing && (
                    <View style={styles.borderBadge}>
                        <Ionicons name="globe-outline" size={14} color="#fff" />
                        <Text style={styles.borderBadgeText}>Cross Border</Text>
                    </View>
                )}
                <View style={styles.vehicleContent}>
                    <View style={styles.vehicleHeader}>
                        <View style={styles.vehicleHeaderLeft}>
                            <Text style={styles.vehicleTitle} numberOfLines={2}>{vehicle.title}</Text>
                            <View style={styles.vehicleInfoRow}>
                                <Text style={styles.vehicleMakeModel}>{vehicle.make} {vehicle.model}</Text>
                                <Text style={styles.vehicleYear}>• {vehicle.year}</Text>
                            </View>
                            <View style={styles.locationRow}>
                                <Ionicons name="location-outline" size={14} color="#64748b" />
                                <Text style={styles.vehicleLocation} numberOfLines={1}>
                                    {vehicle.location.city || vehicle.location.area}
                                    {vehicle.distance !== null && ` • ${vehicle.distance.toFixed(1)} km`}
                                </Text>
                            </View>
                        </View>
                        {vehicle.owner.verified && (
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                            </View>
                        )}
                    </View>

                    <View style={styles.vehicleDetails}>
                        {vehicle.capacity && (
                            <View style={styles.detailItem}>
                                <Ionicons name="people-outline" size={16} color="#64748b" />
                                <Text style={styles.detailText}>{vehicle.capacity} Seats</Text>
                            </View>
                        )}
                        {vehicle.cargoCapacity && (
                            <View style={styles.detailItem}>
                                <Ionicons name="cube-outline" size={16} color="#64748b" />
                                <Text style={styles.detailText}>{vehicle.cargoCapacity} Tons</Text>
                            </View>
                        )}
                        <View style={styles.detailItem}>
                            <Ionicons name="time-outline" size={16} color="#64748b" />
                            <Text style={styles.detailText}>{vehicle.operatingHours.start} - {vehicle.operatingHours.end}</Text>
                        </View>
                    </View>

                    <View style={styles.vehicleFooter}>
                        <View>
                            <Text style={styles.price}>E {vehicle.price.toLocaleString()}</Text>
                            <Text style={styles.pricePeriod}>{getPriceLabel(vehicle.priceType)}</Text>
                        </View>
                        <View style={styles.typeBadge}>
                            <Text style={styles.typeBadgeText}>{getTypeLabel(vehicle.type).toUpperCase()}</Text>
                        </View>
                    </View>

                    <View style={styles.vehicleStats}>
                        <TouchableOpacity
                            style={styles.statItem}
                            onPress={(e) => {
                                e.stopPropagation();
                                toggleLike(vehicle.id);
                            }}
                        >
                            <Ionicons
                                name={isLiked ? 'heart' : 'heart-outline'}
                                size={16}
                                color={isLiked ? '#ef4444' : '#94a3b8'}
                            />
                            <Text style={[styles.statText, isLiked && styles.statTextLiked]}>
                                {displayLikes}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.statItem}
                            onPress={(e) => {
                                e.stopPropagation();
                                handleRate(vehicle.id);
                            }}
                        >
                            <Ionicons name="star" size={16} color="#fbbf24" />
                            <Text style={styles.statText}>
                                {displayRating.toFixed(1)} ({vehicle.totalRatings || 0})
                            </Text>
                        </TouchableOpacity>
                        {vehicle.routes.length > 0 && (
                            <View style={styles.statItem}>
                                <Ionicons name="map-outline" size={16} color="#94a3b8" />
                                <Text style={styles.statText}>{vehicle.routes.length} routes</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SecondaryNav
                title="Transport For-Hire"
                rightIcon="options-outline"
                onRightPress={() => setShowSortOptions(!showSortOptions)}
            />

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search vehicles..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />
                {(sortByCategory !== 'All' || sortByBorderCrossing !== 'All') && !showSortOptions && (
                    <TouchableOpacity
                        style={styles.activeFiltersIndicator}
                        onPress={() => setShowSortOptions(true)}
                    >
                        <Ionicons name="options" size={16} color="#2563eb" />
                        <Text style={styles.activeFiltersIndicatorText}>Sort</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Type Tabs */}
            <View style={styles.typeContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeScroll}>
                    {types.map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[styles.typeChip, selectedType === type && styles.typeChipActive]}
                            onPress={() => setSelectedType(type)}
                        >
                            <Text style={[styles.typeText, selectedType === type && styles.typeTextActive]}>
                                {type}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Sort Popup */}
            {showSortOptions && (
                <>
                    <TouchableOpacity
                        style={styles.popupOverlay}
                        activeOpacity={1}
                        onPress={() => setShowSortOptions(false)}
                    />
                    <View style={styles.sortPopup}>
                        <View style={styles.popupHeader}>
                            <Text style={styles.popupTitle}>Sort Options</Text>
                            <TouchableOpacity onPress={() => setShowSortOptions(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.popupContent}>
                            <View style={styles.sortSection}>
                                <Text style={styles.sortSectionTitle}>Category</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScroll}>
                                    {categories.map((category) => (
                                        <TouchableOpacity
                                            key={category}
                                            style={[styles.sortChip, sortByCategory === category && styles.sortChipActive]}
                                            onPress={() => setSortByCategory(category)}
                                        >
                                            <Text style={[styles.sortChipText, sortByCategory === category && styles.sortChipTextActive]}>
                                                {category}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            <View style={styles.sortSection}>
                                <Text style={styles.sortSectionTitle}>Border Crossing</Text>
                                <View style={styles.borderSortRow}>
                                    {['All', 'Yes', 'No'].map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            style={[styles.borderSortChip, sortByBorderCrossing === option && styles.borderSortChipActive]}
                                            onPress={() => setSortByBorderCrossing(option)}
                                        >
                                            <Text style={[styles.borderSortText, sortByBorderCrossing === option && styles.borderSortTextActive]}>
                                                {option}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </View>
                </>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Results Count */}
                <View style={styles.resultsContainer}>
                    <Text style={styles.resultsText}>{processedVehicles.length} vehicles found</Text>
                    <TouchableOpacity
                        style={styles.postButton}
                        onPress={() => navigation.navigate('PostTransportationScreen')}
                    >
                        <Ionicons name="add-circle" size={18} color="#2563eb" />
                        <Text style={styles.postButtonText}>Post Vehicle</Text>
                    </TouchableOpacity>
                </View>

                {/* Near By Section */}
                {nearByVehicles.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Near By</Text>
                            {nearByVehicles.length > showNearByLimit && (
                                <TouchableOpacity
                                    onPress={() => setShowNearByLimit(nearByVehicles.length)}
                                >
                                    <Text style={styles.viewAllText}>View All</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={styles.vehiclesContainer}>
                            {nearByVehicles.slice(0, showNearByLimit).map((vehicle) => renderVehicleCard(vehicle))}
                        </View>
                    </View>
                )}

                {/* Other Further Section */}
                {otherVehicles.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Other Further</Text>
                            {otherVehicles.length > showOtherLimit && (
                                <TouchableOpacity
                                    onPress={() => setShowOtherLimit(otherVehicles.length)}
                                >
                                    <Text style={styles.viewAllText}>View All</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={styles.vehiclesContainer}>
                            {otherVehicles.slice(0, showOtherLimit).map((vehicle) => renderVehicleCard(vehicle))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 10,
        marginTop: 20,
        marginBottom: 16,
        paddingHorizontal: 10,
        borderRadius: 12,
        height: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#000',
    },
    activeFiltersIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eff6ff',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
        marginLeft: 8,
    },
    activeFiltersIndicatorText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2563eb',
    },
    typeContainer: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    typeScroll: {
        paddingHorizontal: 20,
        gap: 12,
    },
    typeChip: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        marginRight: 8,
    },
    typeChipActive: {
        backgroundColor: '#2563eb',
    },
    typeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    typeTextActive: {
        color: '#fff',
    },
    popupOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 999,
    },
    sortPopup: {
        position: 'absolute',
        top: Platform.OS === 'android' ? StatusBar.currentHeight + 140 : 140,
        left: 20,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 1000,
        maxHeight: 400,
    },
    popupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    popupTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    popupContent: {
        padding: 16,
    },
    sortSection: {
        marginBottom: 16,
    },
    sortSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 12,
    },
    sortScroll: {
        gap: 8,
    },
    sortChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    sortChipActive: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    sortChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
    },
    sortChipTextActive: {
        color: '#fff',
    },
    borderSortRow: {
        flexDirection: 'row',
        gap: 8,
    },
    borderSortChip: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    borderSortChipActive: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    borderSortText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
    },
    borderSortTextActive: {
        color: '#fff',
    },
    resultsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    resultsText: {
        fontSize: 14,
        color: '#64748b',
    },
    postButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eff6ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    postButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2563eb',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2563eb',
    },
    vehiclesContainer: {
        paddingHorizontal: 10,
    },
    vehicleCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        position: 'relative',
    },
    vehicleImage: {
        width: '100%',
        height: 200,
    },
    borderBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10b981',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    borderBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#fff',
    },
    vehicleContent: {
        padding: 16,
    },
    vehicleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    vehicleHeaderLeft: {
        flex: 1,
        marginRight: 8,
    },
    vehicleTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 6,
    },
    vehicleInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    vehicleMakeModel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
    vehicleYear: {
        fontSize: 13,
        color: '#94a3b8',
        marginLeft: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    vehicleLocation: {
        fontSize: 13,
        color: '#64748b',
        flex: 1,
    },
    verifiedBadge: {
        padding: 4,
    },
    vehicleDetails: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: 13,
        color: '#475569',
        fontWeight: '500',
    },
    vehicleFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    price: {
        fontSize: 20,
        fontWeight: '700',
        color: '#10b981',
    },
    pricePeriod: {
        fontSize: 12,
        color: '#64748b',
    },
    typeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: '#eff6ff',
    },
    typeBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#2563eb',
    },
    vehicleStats: {
        flexDirection: 'row',
        gap: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 12,
        color: '#94a3b8',
    },
    statTextLiked: {
        color: '#ef4444',
        fontWeight: '600',
    },
    bottomPadding: {
        height: 20,
    },
});
