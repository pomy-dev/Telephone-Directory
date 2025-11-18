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
import CustomLoader from '../../components/customLoader';
import SecondaryNav from '../../components/SecondaryNav';
import { mockTransportationVehicles } from '../../utils/mockData';

// ──────────────────────────────────────────────────────────────
// Haversine distance
// ──────────────────────────────────────────────────────────────
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const CommentBottomSheet = React.forwardRef(
    (
        {
            vehicleId,
            commentText,
            setCommentText,
            suggestion,
            setSuggestion,
            onSubmit,
            onDismiss,
            renderBackdrop,
        },
        ref
    ) => {
        return (
            <BottomSheetModal
                ref={ref}
                index={0}
                snapPoints={['60%', '80%', '90%']}
                backdropComponent={renderBackdrop}
                onDismiss={onDismiss}
                keyboardBehavior="extend"
                android_keyboardInputMode="adjustResize"
                enablePanDownToClose
            >
                <BottomSheetView style={sheetStyles.content}>
                    <Text style={sheetStyles.title}>Write a Review</Text>

                    {/* Comment input */}
                    <TextInput
                        style={[sheetStyles.input, { minHeight: 50 }]}
                        placeholder="Share your experience..."
                        value={commentText}
                        onChangeText={setCommentText}
                        multiline
                        autoFocus
                    />

                    {/* suggestion input */}
                    <TextInput
                        style={[sheetStyles.input, { minHeight: 100 }]}
                        placeholder="We value your suggestion..."
                        value={suggestion}
                        onChangeText={setSuggestion}
                        multiline
                        autoFocus
                    />

                    {/* Submit */}
                    <TouchableOpacity style={sheetStyles.submitBtn} onPress={onSubmit}>
                        <Text style={sheetStyles.submitTxt}>Submit Review</Text>
                    </TouchableOpacity>
                </BottomSheetView>
            </BottomSheetModal>
        );
    }
);
CommentBottomSheet.displayName = 'CommentBottomSheet';

// ────── Rating Bottom Sheet (new) ──────
const RatingBottomSheet = React.forwardRef(({ onSubmit, onDismiss, renderBackdrop }, ref) => {
    const [value, setValue] = useState(5);
    return (
        <BottomSheetModal
            ref={ref}
            index={0}
            snapPoints={['30%', '40%']}
            backdropComponent={renderBackdrop}
            onDismiss={onDismiss}
            enablePanDownToClose
        >
            <BottomSheetView style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Rate Vehicle</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                        <TouchableOpacity key={n} onPress={() => setValue(n)}>
                            <Ionicons name={n <= value ? 'star' : 'star-outline'} size={36} color="#fbbf24" />
                        </TouchableOpacity>
                    ))}
                </View>
                <TouchableOpacity
                    onPress={() => {
                        onSubmit(value);
                        ref.current?.close();
                    }}
                    style={{ backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 }}
                >
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Submit Rating</Text>
                </TouchableOpacity>
            </BottomSheetView>
        </BottomSheetModal>
    );
});
RatingBottomSheet.displayName = 'RatingBottomSheet';

const sheetStyles = StyleSheet.create({
    content: { padding: 20, flex: 1 },
    title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
    starRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20, gap: 8 },
    starBtn: { padding: 4 },
    input: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        backgroundColor: '#f8fafc',
        fontSize: 15,
        textAlignVertical: 'top',
        marginBottom: 16,
    },
    submitBtn: {
        backgroundColor: '#2563eb',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

// ──────────────────────────────────────────────────────────────
// MAIN SCREEN
// ──────────────────────────────────────────────────────────────
export default function TransportationListScreen({ navigation }) {
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
    const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);

    // Comments & Bottom Sheet
    const [comments, setComments] = useState({});
    const [commentText, setCommentText] = useState('');
    const [commentSuggestion, setSuggestion] = useState('');
    const [modalVehicleId, setModalVehicleId] = useState(null);
    const bottomSheetModalRef = useRef(null);

    // Rating Bottom Sheet
    const ratingSheetRef = useRef(null);
    const [ratingVehicleId, setRatingVehicleId] = useState(null);

    const NEARBY_THRESHOLD_KM = 10;
    const types = ['All', 'Minibus', 'Bus', 'Van', 'Truck', 'Lory', 'SUV', 'Sedan'];
    const categories = ['All', 'Public Transport', 'Cargo', 'Passenger', 'Luxury'];

    // ────── Location ──────
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setIsLoadingVehicles(true);
                setLocationStatus('requesting');
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setLocationStatus('denied');
                    return;
                }
                setLocationStatus('granted');
                const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                if (!mounted) return;
                setCurrentLocation({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                });
            } catch (err) {
                console.warn('Location error', err);
                setLocationStatus('error');
            } finally {
                setIsLoadingVehicles(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    // ────── Vehicle Processing ──────
    const processedVehicles = useMemo(() => {

        let filtered = mockTransportationVehicles.filter(vehicle => {
            const matchesType =
                selectedType === 'All' ||
                (selectedType === 'Minibus' && vehicle.type === 'minibus') ||
                (selectedType !== 'All' && vehicle.type === selectedType.toLowerCase());

            const matchesCategory =
                sortByCategory === 'All' ||
                (sortByCategory === 'Public Transport' && vehicle.category === 'public_transport') ||
                (sortByCategory === 'Cargo' && vehicle.category === 'cargo') ||
                (sortByCategory === 'Passenger' && vehicle.category === 'passenger') ||
                (sortByCategory === 'Luxury' && vehicle.category === 'luxury');

            const matchesBorder =
                sortByBorderCrossing === 'All' ||
                (sortByBorderCrossing === 'Yes' && vehicle.borderCrossing) ||
                (sortByBorderCrossing === 'No' && !vehicle.borderCrossing);

            const q = searchQuery.trim().toLowerCase();
            const matchesSearch =
                q.length === 0 ||
                vehicle.title.toLowerCase().includes(q) ||
                (vehicle.description || '').toLowerCase().includes(q) ||
                (vehicle.make || '').toLowerCase().includes(q) ||
                (vehicle.model || '').toLowerCase().includes(q);

            return matchesType && matchesCategory && matchesBorder && matchesSearch;
        });

        filtered = filtered.map(vehicle => {
            let distance = null;
            if (
                currentLocation &&
                vehicle.location?.coordinates?.latitude != null &&
                vehicle.location?.coordinates?.longitude != null
            ) {
                distance = calculateDistance(
                    currentLocation.latitude,
                    currentLocation.longitude,
                    vehicle.location.coordinates.latitude,
                    vehicle.location.coordinates.longitude
                );
            }
            return { ...vehicle, distance };
        });

        filtered.sort((a, b) => {
            const aHas = a.distance !== null;
            const bHas = b.distance !== null;
            if (aHas && bHas) return a.distance - b.distance;
            if (aHas && !bHas) return -1;
            if (!aHas && bHas) return 1;
            return 0;
        });

        return filtered;
    }, [selectedType, sortByCategory, sortByBorderCrossing, searchQuery, currentLocation]);

    const nearByVehicles = useMemo(
        () => processedVehicles.filter(v => v.distance !== null && v.distance <= NEARBY_THRESHOLD_KM),
        [processedVehicles]
    );

    const otherVehicles = useMemo(
        () => processedVehicles.filter(v => v.distance !== null && v.distance > NEARBY_THRESHOLD_KM),
        [processedVehicles]
    );

    // ────── Interactions ──────
    const toggleLike = (vehicleId) => {
        setLikedVehicles(prev => {
            const newSet = new Set(prev);
            newSet.has(vehicleId) ? newSet.delete(vehicleId) : newSet.add(vehicleId);
            return newSet;
        });
    };

    // Replace handleRate with cross-platform bottom-sheet approach
    const handleRate = useCallback((vehicleId) => {
        setRatingVehicleId(vehicleId);
        // present rating bottom sheet
        ratingSheetRef.current?.present();
    }, []);

    const submitRating = useCallback((value) => {
        if (!ratingVehicleId) return;
        setVehicleRatings(p => ({ ...p, [ratingVehicleId]: value }));
        Alert.alert('Thanks', 'Your rating has been saved.');
        setRatingVehicleId(null);
    }, [ratingVehicleId]);

    // ────── Comment Sheet ──────
    const openCommentSheet = useCallback((vehicleId) => {
        setModalVehicleId(vehicleId);
        setCommentText('');
        setSuggestion('');
        bottomSheetModalRef.current?.present();
    }, []);

    const submitComment = useCallback(() => {
        if (!modalVehicleId || !commentText.trim()) {
            Alert.alert('Error', 'Please write a comment');
            return;
        }
        setComments(prev => ({
            ...prev,
            [modalVehicleId]: [
                ...(prev[modalVehicleId] ?? []),
                { comment: commentText.trim(), suggestion: commentSuggestion },
            ],
        }));
        bottomSheetModalRef.current?.close();
        Alert.alert('Success', 'Your review has been added!');
    }, [modalVehicleId, commentText, commentSuggestion]);

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
            />
        ),
        []
    );

    // ────── Helpers ──────
    const getTypeLabel = (type) => {
        const map = {
            minibus: 'Minibus',
            bus: 'Bus',
            van: 'Van',
            truck: 'Truck',
            suv: 'SUV',
            sedan: 'Sedan',
        };
        return map[type] ?? type;
    };

    const getPriceLabel = (priceType) => {
        const map = {
            per_trip: '/trip',
            per_day: '/day',
            per_hour: '/hour',
            per_km: '/km',
        };
        return map[priceType] ?? '';
    };

    // ────── Render Vehicle Card ──────
    const renderVehicleCard = (vehicle) => {
        const isLiked = likedVehicles.has(vehicle.id);
        const userRating = vehicleRatings[vehicle.id];
        const displayRating = userRating || vehicle.rating || 0;
        const displayLikes = isLiked ? (vehicle.likes || 0) + 1 : vehicle.likes || 0;
        const vehicleComments = comments[vehicle.id] ?? [];
        const latestComment = vehicleComments[vehicleComments.length - 1];

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
                    {/* Header */}
                    <View style={styles.vehicleHeader}>
                        <View style={styles.vehicleHeaderLeft}>
                            <Text style={styles.vehicleTitle} numberOfLines={2}>
                                {vehicle.title}
                            </Text>
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

                    {/* Details */}
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
                            <Text style={styles.detailText}>
                                {vehicle.operatingHours.start} - {vehicle.operatingHours.end}
                            </Text>
                        </View>
                    </View>

                    {/* Price & Type */}
                    <View style={styles.vehicleFooter}>
                        <View>
                            <Text style={styles.price}>E {vehicle.price.toLocaleString()}</Text>
                            <Text style={styles.pricePeriod}>{getPriceLabel(vehicle.priceType)}</Text>
                        </View>
                        <View style={styles.typeBadge}>
                            <Text style={styles.typeBadgeText}>{getTypeLabel(vehicle.type).toUpperCase()}</Text>
                        </View>
                    </View>

                    {/* Stats Row */}
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

                        {/* Add Comment */}
                        <TouchableOpacity
                            style={styles.statItem}
                            onPress={(e) => {
                                e.stopPropagation();
                                openCommentSheet(vehicle.id);
                            }}
                        >
                            <Ionicons name="chatbubble-outline" size={16} color="#2563eb" />
                            <Text style={styles.statText}>{vehicleComments.length}</Text>
                        </TouchableOpacity>

                        {vehicle.routes.length > 0 && (
                            <View style={styles.statItem}>
                                <Ionicons name="map-outline" size={16} color="#94a3b8" />
                                <Text style={styles.statText}>{vehicle.routes.length} routes</Text>
                            </View>
                        )}
                    </View>

                    {/* Latest Comment Preview */}
                    {latestComment && (
                        <View style={styles.commentPreview}>
                            <View style={styles.commentSuggestion}>
                                {[...Array(5)].map((_, i) => (
                                    <Ionicons
                                        key={i}
                                        name="star"
                                        size={12}
                                        color={i < latestComment.stars ? '#fbbf24' : '#e2e8f0'}
                                    />
                                ))}
                            </View>
                            <Text style={styles.commentText} numberOfLines={2}>
                                "{latestComment.text}"
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    // ────── JSX ──────
    return (
        <BottomSheetModalProvider>
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <SecondaryNav
                    title="Transport For-Hire"
                    rightIcon="options-outline"
                    onRightPress={() => setShowSortOptions(!showSortOptions)}
                />

                {/* Location status hint */}
                {locationStatus === 'requesting' && (
                    <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
                        <Text style={{ color: '#64748b', fontSize: 13 }}>Locating you… distances will appear when ready.</Text>
                    </View>
                )}
                {locationStatus === 'denied' && (
                    <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
                        <Text style={{ color: '#ef4444', fontSize: 13 }}>Location permission denied — distances unavailable.</Text>
                    </View>
                )}

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

                {/* ── SORT POPUP (restored) ── */}
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

                {isLoadingVehicles ? (
                    <View style={styles.loaderContainer}>
                        <CustomLoader />
                        <Text style={styles.loaderText}>Loading vehicles...</Text>
                    </View>
                ) : (
                    // {/* ── MAIN LIST ── */ }
                    < ScrollView showsVerticalScrollIndicator={false}>
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
                                    <Text style={styles.sectionTitle}>Near By ({nearByVehicles.length})</Text>
                                    {nearByVehicles.length > showNearByLimit ? (
                                        <TouchableOpacity onPress={() => setShowNearByLimit(nearByVehicles.length)}>
                                            <Text style={styles.viewAllText}>View All</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        nearByVehicles.length > 0 && showNearByLimit > 3 && (
                                            <TouchableOpacity onPress={() => setShowNearByLimit(3)}>
                                                <Text style={[styles.viewAllText, { color: '#64748b' }]}>Show Less</Text>
                                            </TouchableOpacity>
                                        )
                                    )}
                                </View>
                                <View style={styles.vehiclesContainer}>
                                    {nearByVehicles.slice(0, showNearByLimit).map(renderVehicleCard)}
                                </View>
                            </View>
                        )}

                        {/* Other Vehicles Section */}
                        {otherVehicles.length > 0 && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Other Vehicles ({otherVehicles.length})</Text>
                                    {otherVehicles.length > showOtherLimit ? (
                                        <TouchableOpacity onPress={() => setShowOtherLimit(otherVehicles.length)}>
                                            <Text style={styles.viewAllText}>View All</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        otherVehicles.length > 0 && showOtherLimit > 3 && (
                                            <TouchableOpacity onPress={() => setShowOtherLimit(3)}>
                                                <Text style={[styles.viewAllText, { color: '#64748b' }]}>Show Less</Text>
                                            </TouchableOpacity>
                                        )
                                    )}
                                </View>
                                <View style={styles.vehiclesContainer}>
                                    {otherVehicles.slice(0, showOtherLimit).map(renderVehicleCard)}
                                </View>
                            </View>
                        )}

                        <View style={styles.bottomPadding} />
                    </ScrollView>
                )}


                {/* ── COMMENT BOTTOM SHEET (outside ScrollView) ── */}
                <CommentBottomSheet
                    ref={bottomSheetModalRef}
                    vehicleId={modalVehicleId}
                    commentText={commentText}
                    setCommentText={setCommentText}
                    commentSuggestion={commentSuggestion}
                    setSuggestion={setSuggestion}
                    onSubmit={submitComment}
                    onDismiss={() => setModalVehicleId(null)}
                    renderBackdrop={renderBackdrop}
                />

                {/* ── RATING BOTTOM SHEET (new) ── */}
                <RatingBottomSheet
                    ref={ratingSheetRef}
                    onSubmit={submitRating}
                    onDismiss={() => setRatingVehicleId(null)}
                    renderBackdrop={renderBackdrop}
                />
            </View>
        </BottomSheetModalProvider >
    );
}

// ──────────────────────────────────────────────────────────────
// Styles (keep all original + new comment preview)
// ──────────────────────────────────────────────────────────────
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
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 15, color: '#000' },
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
    activeFiltersIndicatorText: { fontSize: 12, fontWeight: '600', color: '#2563eb' },
    typeContainer: { backgroundColor: '#fff', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    typeScroll: { paddingHorizontal: 20, gap: 12 },
    typeChip: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', marginRight: 8 },
    typeChipActive: { backgroundColor: '#2563eb' },
    typeText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
    typeTextActive: { color: '#fff' },

    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    loaderText: {
        marginTop: 16,
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },

    // ── SORT POPUP (restored) ──
    popupOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
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
    popupTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
    popupContent: { padding: 16 },
    sortSection: { marginBottom: 16 },
    sortSectionTitle: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 12 },
    sortScroll: { gap: 8 },
    sortChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    sortChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
    sortChipText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    sortChipTextActive: { color: '#fff' },
    borderSortRow: { flexDirection: 'row', gap: 8 },
    borderSortChip: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    borderSortChipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
    borderSortText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
    borderSortTextActive: { color: '#fff' },

    resultsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    resultsText: { fontSize: 14, color: '#64748b' },
    postButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eff6ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    postButtonText: { fontSize: 13, fontWeight: '600', color: '#2563eb' },

    section: { marginBottom: 24 },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
    viewAllText: { fontSize: 14, fontWeight: '600', color: '#2563eb' },
    vehiclesContainer: { paddingHorizontal: 10 },

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
    vehicleImage: { width: '100%', height: 200 },
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
    borderBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
    vehicleContent: { padding: 16 },
    vehicleHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    vehicleHeaderLeft: { flex: 1, marginRight: 8 },
    vehicleTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 6 },
    vehicleInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    vehicleMakeModel: { fontSize: 13, fontWeight: '600', color: '#475569' },
    vehicleYear: { fontSize: 13, color: '#94a3b8', marginLeft: 4 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    vehicleLocation: { fontSize: 13, color: '#64748b', flex: 1 },
    verifiedBadge: { padding: 4 },
    vehicleDetails: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    detailText: { fontSize: 13, color: '#475569', fontWeight: '500' },
    vehicleFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    price: { fontSize: 20, fontWeight: '700', color: '#10b981' },
    pricePeriod: { fontSize: 12, color: '#64748b' },
    typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: '#eff6ff' },
    typeBadgeText: { fontSize: 11, fontWeight: '600', color: '#2563eb' },
    vehicleStats: { flexDirection: 'row', gap: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statText: { fontSize: 12, color: '#94a3b8' },
    statTextLiked: { color: '#ef4444', fontWeight: '600' },

    // Comment preview
    commentPreview: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    commentStars: { flexDirection: 'row', marginBottom: 4 },
    commentText: { fontSize: 13, color: '#475569', fontStyle: 'italic' },

    bottomPadding: { height: 20 },
});