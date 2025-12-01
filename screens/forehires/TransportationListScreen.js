import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
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
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetView,
    BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { AppContext } from "../../context/appContext"
import CustomLoader from '../../components/customLoader';
import SecondaryNav from '../../components/SecondaryNav';
import { mockTransportationVehicles } from '../../utils/mockData';

// ──────────────────────────────────────────────────────────────
// Haversine Distance Calculator
// ──────────────────────────────────────────────────────────────
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// ────── Reusable Active Filter Chip (with clear button) ──────
const ActiveFilterChip = ({ label, onClear }) => (
    <View style={styles.activeFilterChip}>
        <Text style={styles.activeFilterText}>{label}</Text>
        <TouchableOpacity onPress={onClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={18} color="#64748b" />
        </TouchableOpacity>
    </View>
);

// ────── Comment Bottom Sheet ──────
const CommentBottomSheet = React.forwardRef(
    ({ vehicleId, commentText, setCommentText, suggestion, setSuggestion, onSubmit, onDismiss, renderBackdrop }, ref) => (
        <BottomSheetModal
            ref={ref}
            index={0}
            snapPoints={['65%', '85%']}
            backdropComponent={renderBackdrop}
            onDismiss={onDismiss}
            enablePanDownToClose
            keyboardBehavior="extend"
            android_keyboardInputMode="adjustResize"
        >
            <BottomSheetView style={sheetStyles.container}>
                <Text style={sheetStyles.title}>Write a Review</Text>
                <TextInput
                    style={sheetStyles.textArea}
                    placeholder="Share your experience with this vehicle..."
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                    textAlignVertical="top"
                />
                <TextInput
                    style={[sheetStyles.textArea, { height: 100 }]}
                    placeholder="Any suggestions for improvement? (Optional)"
                    value={suggestion}
                    onChangeText={setSuggestion}
                    multiline
                    textAlignVertical="top"
                />
                <TouchableOpacity style={sheetStyles.submitButton} onPress={onSubmit}>
                    <Text style={sheetStyles.submitButtonText}>Submit Review</Text>
                </TouchableOpacity>
            </BottomSheetView>
        </BottomSheetModal>
    )
);
CommentBottomSheet.displayName = 'CommentBottomSheet';

// ────── Rating Bottom Sheet ──────
const RatingBottomSheet = React.forwardRef(({ onSubmit, onDismiss, renderBackdrop }, ref) => {
    const [rating, setRating] = useState(5);
    return (
        <BottomSheetModal
            ref={ref}
            index={0}
            snapPoints={['38%']}
            backdropComponent={renderBackdrop}
            onDismiss={onDismiss}
            enablePanDownToClose
        >
            <BottomSheetView style={ratingSheetStyles.container}>
                <Text style={ratingSheetStyles.title}>Rate This Vehicle</Text>
                <View style={ratingSheetStyles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity key={star} onPress={() => setRating(star)}>
                            <Ionicons
                                name={star <= rating ? 'star' : 'star-outline'}
                                size={44}
                                color="#fbbf24"
                            />
                        </TouchableOpacity>
                    ))}
                </View>
                <TouchableOpacity
                    style={ratingSheetStyles.submitButton}
                    onPress={() => {
                        onSubmit(rating);
                        ref.current?.close();
                    }}
                >
                    <Text style={ratingSheetStyles.submitButtonText}>Submit Rating</Text>
                </TouchableOpacity>
            </BottomSheetView>
        </BottomSheetModal>
    );
});
RatingBottomSheet.displayName = 'RatingBottomSheet';

const sheetStyles = StyleSheet.create({
    container: { flex: 1, padding: 24 },
    title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 24, color: '#1e293b' },
    textArea: {
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        borderRadius: 16,
        padding: 16,
        backgroundColor: '#fff',
        fontSize: 16,
        marginBottom: 16,
        height: 120,
    },
    submitButton: {
        backgroundColor: '#2563eb',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    submitButtonText: { color: '#fff', fontSize: 17, fontWeight: '600' },
});

const ratingSheetStyles = StyleSheet.create({
    container: { padding: 32, alignItems: 'center' },
    title: { fontSize: 20, fontWeight: '700', marginBottom: 24, color: '#1e293b' },
    stars: { flexDirection: 'row', gap: 12, marginBottom: 32 },
    submitButton: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 16,
    },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

// ──────────────────────────────────────────────────────────────
// MAIN SCREEN
// ──────────────────────────────────────────────────────────────
export default function TransportationListScreen({ navigation }) {
    const { theme, isDarkMode } = React.useContext(AppContext)
    // ────── State ──────
    const [selectedType, setSelectedType] = useState('All');
    const [sortByCategory, setSortByCategory] = useState('All');
    const [sortByBorderCrossing, setSortByBorderCrossing] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSortOptions, setShowSortOptions] = useState(false);
    const [likedVehicles, setLikedVehicles] = useState(new Set());
    const [vehicleRatings, setVehicleRatings] = useState({});
    const [showNearByLimit, setShowNearByLimit] = useState(3);
    const [showOtherLimit, setShowOtherLimit] = useState(3);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState('idle');

    // Bottom sheets
    const commentSheetRef = useRef(null);
    const ratingSheetRef = useRef(null);
    const [modalVehicleId, setModalVehicleId] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [commentSuggestion, setCommentSuggestion] = useState('');
    const [ratingVehicleId, setRatingVehicleId] = useState(null);
    const [comments, setComments] = useState({});

    const NEARBY_THRESHOLD_KM = 10;
    const types = ['All', 'Minibus', 'Bus', 'Van', 'Truck', 'Lory', 'SUV', 'Sedan'];
    const categories = ['All', 'Public Transport', 'Cargo', 'Passenger', 'Luxury'];

    // ────── Location Permission & Fetch ──────
    useEffect(() => {
        let mounted = true;
        (async () => {
            setLocationStatus('requesting');
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationStatus('denied');
                return;
            }
            setLocationStatus('granted');
            const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            if (mounted) {
                setCurrentLocation({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                });
            }
        })();
        return () => { mounted = false; };
    }, []);

    // ────── Process & Sort Vehicles ──────
    const processedVehicles = useMemo(() => {
        let filtered = mockTransportationVehicles.filter(vehicle => {
            const matchesType = selectedType === 'All' ||
                vehicle.type.toLowerCase() === selectedType.toLowerCase() ||
                (selectedType === 'Minibus' && vehicle.type === 'minibus');

            const matchesCategory = sortByCategory === 'All' ||
                (sortByCategory === 'Public Transport' && vehicle.category === 'public_transport') ||
                (sortByCategory === 'Cargo' && vehicle.category === 'cargo') ||
                (sortByCategory === 'Passenger' && vehicle.category === 'passenger') ||
                (sortByCategory === 'Luxury' && vehicle.category === 'luxury');

            const matchesBorder = sortByBorderCrossing === 'All' ||
                (sortByBorderCrossing === 'Yes' && vehicle.borderCrossing) ||
                (sortByBorderCrossing === 'No' && !vehicle.borderCrossing);

            const q = searchQuery.toLowerCase().trim();
            const matchesSearch = !q ||
                vehicle.title.toLowerCase().includes(q) ||
                vehicle.make?.toLowerCase().includes(q) ||
                vehicle.model?.toLowerCase().includes(q) ||
                vehicle.description?.toLowerCase().includes(q);

            return matchesType && matchesCategory && matchesBorder && matchesSearch;
        });

        // Add distance
        filtered = filtered.map(v => ({
            ...v,
            distance: currentLocation && v.location?.coordinates
                ? calculateDistance(
                    currentLocation.latitude,
                    currentLocation.longitude,
                    v.location.coordinates.latitude,
                    v.location.coordinates.longitude
                )
                : null,
        }));

        // Primary sort: nearest first
        filtered.sort((a, b) => {
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
        });

        return filtered;
    }, [selectedType, sortByCategory, sortByBorderCrossing, searchQuery, currentLocation]);

    const nearByVehicles = useMemo(() => processedVehicles.filter(v => v.distance !== null && v.distance <= NEARBY_THRESHOLD_KM), [processedVehicles]);
    const otherVehicles = useMemo(() => processedVehicles.filter(v => !v.distance || v.distance > NEARBY_THRESHOLD_KM), [processedVehicles]);

    // ────── Interactions ──────
    const toggleLike = (id) => {
        setLikedVehicles(prev => {
            const copy = new Set(prev);
            copy.has(id) ? copy.delete(id) : copy.add(id);
            return copy;
        });
    };

    const handleRate = (id) => {
        setRatingVehicleId(id);
        ratingSheetRef.current?.present();
    };

    const submitRating = (value) => {
        setVehicleRatings(prev => ({ ...prev, [ratingVehicleId]: value }));
        Alert.alert('Thank You!', 'Your rating has been recorded.');
        setRatingVehicleId(null);
    };

    const openCommentSheet = (id) => {
        setModalVehicleId(id);
        setCommentText('');
        setCommentSuggestion('');
        commentSheetRef.current?.present();
    };

    const submitComment = () => {
        if (!commentText.trim()) {
            Alert.alert('Missing Comment', 'Please write something before submitting.');
            return;
        }
        setComments(prev => ({
            ...prev,
            [modalVehicleId]: [
                ...(prev[modalVehicleId] || []),
                { text: commentText.trim(), suggestion: commentSuggestion.trim(), date: new Date() }
            ]
        }));
        commentSheetRef.current?.close();
        Alert.alert('Success', 'Review submitted successfully!');
    };

    const renderBackdrop = useCallback(props => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ), []);

    // ────── Helper Labels ──────
    const getTypeLabel = (type) => ({ minibus: 'Minibus', bus: 'Bus', van: 'Van', truck: 'Truck', suv: 'SUV', sedan: 'Sedan' })[type] || type;
    const getPriceLabel = (type) => ({ per_trip: '/trip', per_day: '/day', per_hour: '/hour', per_km: '/km' })[type] || '';

    // ────── RENDER VEHICLE CARD – Modern Overlay Style ──────
    const renderVehicleCard = (vehicle) => {
        const isLiked = likedVehicles.has(vehicle.id);
        const userRating = vehicleRatings[vehicle.id];
        const rating = userRating || vehicle.rating || 0;
        const likes = isLiked ? (vehicle.likes || 0) + 1 : vehicle.likes || 0;
        const vehicleComments = comments[vehicle.id] || [];
        const latestComment = vehicleComments[vehicleComments.length - 1];

        return (
            <TouchableOpacity
                key={vehicle.id}
                style={styles.vehicleCard}
                activeOpacity={0.92}
                onPress={() => navigation.navigate('TransportationDetailsScreen', { vehicleId: vehicle.id })}
            >
                {/* Background Image */}
                <Image source={{ uri: vehicle.images[0] }} style={styles.vehicleImage} />

                {/* Overlay Content */}
                <View style={styles.overlayContent}>
                    {/* Top Badges */}
                    <View style={styles.topBadges}>
                        {vehicle.borderCrossing && (
                            <View style={styles.borderBadge}>
                                <Ionicons name="globe" size={13} color="#fff" />
                                <Text style={styles.borderBadgeText}>Cross-Border</Text>
                            </View>
                        )}
                        {vehicle.owner.verified && (
                            <Ionicons name="checkmark-circle" size={20} color="#10b981" style={{ marginLeft: 8 }} />
                        )}
                    </View>

                    {/* Main Info */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.vehicleTitle} numberOfLines={1}>
                            {vehicle.title}
                        </Text>
                        <Text style={styles.vehicleSubtitle} numberOfLines={1}>
                            {vehicle.make} {vehicle.model} • {vehicle.year}
                        </Text>

                        {/* Location + Distance */}
                        <View style={styles.locationRow}>
                            <Ionicons name="location" size={14} color="#fff" />
                            <Text style={styles.locationText}>
                                {vehicle.location.city || vehicle.location.area}
                                {vehicle.distance !== null && ` • ${vehicle.distance.toFixed(1)} km`}
                            </Text>
                        </View>

                        {/* Quick Specs */}
                        <View style={styles.specsRow}>
                            {vehicle.capacity && (
                                <View style={styles.specPill}>
                                    <Text style={styles.specText}>{vehicle.capacity} seats</Text>
                                </View>
                            )}
                            {vehicle.cargoCapacity && (
                                <View style={styles.specPill}>
                                    <Text style={styles.specText}>{vehicle.cargoCapacity}t cargo</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Stats Bar */}
                    <View style={styles.statsOverlay}>
                        <TouchableOpacity style={styles.stat} onPress={(e) => { e.stopPropagation(); toggleLike(vehicle.id); }}>
                            <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={19} color={isLiked ? "#ff4444" : "#fff"} />
                            <Text style={styles.statText}>{likes}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.stat} onPress={(e) => { e.stopPropagation(); handleRate(vehicle.id); }}>
                            <Ionicons name="star" size={19} color="#fbbf24" />
                            <Text style={styles.statText}>{rating.toFixed(1)}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.stat} onPress={(e) => { e.stopPropagation(); openCommentSheet(vehicle.id); }}>
                            <Ionicons name="chatbubble" size={18} color="#fff" />
                            <Text style={styles.statText}>{vehicleComments.length}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer Below Image */}
                <View style={styles.cardFooter}>
                    <View>
                        <Text style={styles.priceText}>E {vehicle.price?.toLocaleString() || '—'}</Text>
                        <Text style={styles.priceSubtext}>{getPriceLabel(vehicle.priceType)}</Text>
                    </View>
                    <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText}>{getTypeLabel(vehicle.type)}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // ────── JSX ──────
    return (
        <BottomSheetModalProvider>
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
                <View style={{ height: 20 }} />
                <SecondaryNav
                    title="Transport For Hire"
                    rightIcon="options-outline"
                    onRightPress={() => setShowSortOptions(true)}
                />

                {/* Active Filters Bar – Premium & Always Visible When Filters Applied */}
                {(sortByCategory !== 'All' || sortByBorderCrossing !== 'All') && (
                    <View style={styles.activeFiltersBar}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                        >
                            {sortByBorderCrossing !== 'All' && (
                                <View style={styles.activeFilterChip}>
                                    <Ionicons name="globe-outline" size={15} color="#1e40af" />
                                    <Text style={styles.activeFilterText}>Border: {sortByBorderCrossing}</Text>
                                    <TouchableOpacity
                                        onPress={() => setSortByBorderCrossing('All')}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <Ionicons name="close-circle" size={18} color="#1e40af" />
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Clear All */}
                            <TouchableOpacity
                                style={styles.clearAllButton}
                                onPress={() => {
                                    setSortByCategory('All');
                                    setSortByBorderCrossing('All');
                                }}
                            >
                                <Text style={styles.clearAllText}>Clear</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                )}

                {/* Search Bar */}
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search make, model, or location..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#94a3b8"
                    />
                    {(sortByCategory !== 'All' || sortByBorderCrossing !== 'All') && (
                        <TouchableOpacity onPress={() => setShowSortOptions(true)}>
                            <Ionicons name="options" size={24} color="#2563eb" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Type Tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeTabs}>
                    {types.map(type => (
                        <TouchableOpacity
                            key={type}
                            style={[styles.typeTab, selectedType === type && styles.typeTabActive]}
                            onPress={() => setSelectedType(type)}
                        >
                            <Text style={[styles.typeTabText, selectedType === type && styles.typeTabTextActive]}>
                                {type}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Sort Modal */}
                {showSortOptions && (
                    <>
                        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={() => setShowSortOptions(false)} />
                        <View style={styles.sortModal}>
                            <View style={styles.sortHeader}>
                                <Text style={styles.sortTitle}>Filter & Sort</Text>
                                <TouchableOpacity onPress={() => setShowSortOptions(false)}>
                                    <Ionicons name="close" size={28} color="#1e293b" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.sortSection}>
                                <Text style={styles.sortLabel}>Category</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
                                    {categories.map(cat => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[styles.filterChip, sortByCategory === cat && styles.filterChipActive]}
                                            onPress={() => setSortByCategory(cat)}
                                        >
                                            <Text style={[styles.filterChipText, sortByCategory === cat && styles.filterChipTextActive]}>
                                                {cat}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            <View style={styles.sortSection}>
                                <Text style={styles.sortLabel}>Border Crossing</Text>
                                <View style={styles.borderOptions}>
                                    {['All', 'Yes', 'No'].map(opt => (
                                        <TouchableOpacity
                                            key={opt}
                                            style={[styles.borderChip, sortByBorderCrossing === opt && styles.borderChipActive]}
                                            onPress={() => setSortByBorderCrossing(opt)}
                                        >
                                            <Text style={[styles.borderChipText, sortByBorderCrossing === opt && styles.borderChipTextActive]}>
                                                {opt}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </>
                )}

                {/* Main Content */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                    <View style={styles.resultsHeader}>
                        <Text style={styles.resultsCount}>{processedVehicles.length} vehicles available</Text>
                        <TouchableOpacity
                            style={styles.postBtn}
                            onPress={() => navigation.navigate('PostTransportationScreen')}
                        >
                            <Ionicons name="add-circle-outline" size={20} color="#2563eb" />
                            <Text style={styles.postBtnText}>Post Vehicle</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Nearby Section */}
                    {nearByVehicles.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Nearby ({nearByVehicles.length})</Text>
                                {nearByVehicles.length > showNearByLimit && (
                                    <TouchableOpacity onPress={() => setShowNearByLimit(nearByVehicles.length)}>
                                        <Text style={styles.seeAllText}>See all</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            {nearByVehicles.slice(0, showNearByLimit).map(renderVehicleCard)}
                        </View>
                    )}

                    {/* Other Vehicles */}
                    {otherVehicles.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>All Vehicles ({otherVehicles.length})</Text>
                                {otherVehicles.length > showOtherLimit && (
                                    <TouchableOpacity onPress={() => setShowOtherLimit(otherVehicles.length)}>
                                        <Text style={styles.seeAllText}>See all</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            {otherVehicles.slice(0, showOtherLimit).map(renderVehicleCard)}
                        </View>
                    )}
                </ScrollView>

                {/* Bottom Sheets */}
                <CommentBottomSheet
                    ref={commentSheetRef}
                    vehicleId={modalVehicleId}
                    commentText={commentText}
                    setCommentText={setCommentText}
                    suggestion={commentSuggestion}
                    setSuggestion={setCommentSuggestion}
                    onSubmit={submitComment}
                    onDismiss={() => setModalVehicleId(null)}
                    renderBackdrop={renderBackdrop}
                />

                <RatingBottomSheet
                    ref={ratingSheetRef}
                    onSubmit={submitRating}
                    onDismiss={() => setRatingVehicleId(null)}
                    renderBackdrop={renderBackdrop}
                />
            </View>
        </BottomSheetModalProvider>
    );
}

// ──────────────────────────────────────────────────────────────
// STYLES – Premium & Clean
// ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1 },

    // Active Filters Bar
    activeFiltersBar: {
        paddingHorizontal: 10,
        backgroundColor: '#eff6ff',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#dbeafe',
    },
    activeFilterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#dbeafe',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        gap: 6,
    },
    activeFilterText: { fontSize: 13, fontWeight: '600', color: '#1e40af' },
    clearAllBtn: { marginLeft: 10 },
    clearAllText: { fontSize: 13, color: '#64748b', fontWeight: '500' },

    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginVertical: 16,
        backgroundColor: '#F2F2F7',
        borderRadius: 50,
        paddingHorizontal: 16,
        height: 45,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
        gap: 12,
    },
    searchInput: { flex: 1, fontSize: 16, color: '#1e293b' },

    typeTabs: { height: 60, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 25 },
    typeTab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 30,
        alignItems: 'center',
        backgroundColor: '#f3f0faff',
        marginRight: 10,
    },
    typeTabActive: { backgroundColor: '#2563eb' },
    typeTabText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
    typeTabTextActive: { color: '#fff' },

    // ──────────────────────────────
    // SORT / FILTER MODAL (popup)
    // ──────────────────────────────
    sortModal: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 140 : 120,
        left: 24,
        right: 24,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 20,
        zIndex: 1000,
    },
    sortHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    sortTitle: {
        fontSize: 21,
        fontWeight: '800',
        color: '#1e293b',
    },

    sortSection: {
        marginBottom: 28,
    },
    sortLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 12,
    },

    // Category chips inside modal
    filterChip: {
        paddingHorizontal: 20,
        paddingVertical: 11,
        borderRadius: 30,
        backgroundColor: '#f1f5f9',
        marginRight: 12,
    },
    filterChipActive: {
        backgroundColor: '#2563eb',
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    filterChipTextActive: {
        color: '#fff',
    },

    // Border Crossing chips (Yes/No/All)
    borderOptions: {
        flexDirection: 'row',
        gap: 12,
    },
    borderChip: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 16,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
    },
    borderChipActive: {
        backgroundColor: '#2563eb',
    },
    borderChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    borderChipTextActive: {
        color: '#fff',
    },

    // CARD – Modern Overlay Design
    vehicleCard: {
        marginHorizontal: 5,
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 12,
        height: 340, // Compact height
    },
    vehicleImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    overlayContent: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    topBadges: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
    },
    borderBadge: {
        backgroundColor: 'rgba(16, 185, 129, 0.9)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 4,
    },
    borderBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

    infoContainer: {
        backgroundColor: 'rgba(0,0,0,0.45)',
        padding: 12,
        borderRadius: 14,
        alignSelf: 'flex-start',
        maxWidth: '80%',
    },
    vehicleTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
    vehicleSubtitle: { fontSize: 13, color: '#e2e8f0', marginTop: 2 },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 },
    locationText: { fontSize: 13, color: '#fff', fontWeight: '500' },
    specsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
    specPill: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    specText: { color: '#fff', fontSize: 12, fontWeight: '600' },

    statsOverlay: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 12,
        borderRadius: 14,
        marginTop: 10,
    },
    stat: { alignItems: 'center', gap: 4 },
    statText: { color: '#fff', fontSize: 13, fontWeight: '600' },

    // Footer Below Image
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    priceText: { fontSize: 22, fontWeight: '800', color: '#10b981' },
    priceSubtext: { fontSize: 12, color: '#64748b', marginTop: 2 },
    typeBadge: {
        backgroundColor: '#eff6ff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 30,
    },
    typeBadgeText: { color: '#2563eb', fontSize: 12, fontWeight: '700' },

    // Rest of your existing styles (search, filters, etc.) stay the same
    resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 10 },
    resultsCount: { fontSize: 15, color: '#64748b' },
    postBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 30, gap: 6 },
    postBtnText: { color: '#2563eb', fontWeight: '600' },
    section: { marginTop: 8 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
    seeAllText: { color: '#2563eb', fontWeight: '600' }
});