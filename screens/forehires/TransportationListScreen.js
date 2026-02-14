import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Platform,
    Linking,
    Image,
    TextInput,
    RefreshControl,
    Alert,
    Modal,
    Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icons } from '../../constants/Icons';
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetView,
    BottomSheetBackdrop
} from '@gorhom/bottom-sheet';
import { CustomToast } from '../../components/customToast';
import { AppContext } from "../../context/appContext"
import { getForHireTransport, updateVehicleLike, submitVehicleRating, submitVehicleComment } from '../../service/Supabase-Fuctions';
import { checkNetworkConnectivity } from '../../service/checkNetwork';
import CustomLoader from '../../components/customLoader';
import SecondaryNav from '../../components/SecondaryNav';

// ────── Comment Bottom Sheet ──────
const CommentBottomSheet = React.forwardRef(
    ({ vehicleId, theme, commentText, setCommentText, suggestion, setSuggestion, userNumber, setUserNumber, onSubmit, onDismiss, renderBackdrop }, ref) => (
        <BottomSheetModal
            ref={ref}
            index={0}
            snapPoints={['65%', '75%']}
            backdropComponent={renderBackdrop}
            onDismiss={onDismiss}
            enablePanDownToClose
            keyboardBehavior="extend"
            android_keyboardInputMode="adjustResize"
        >
            <BottomSheetView style={[sheetStyles.container, { backgroundColor: theme.colors.card }]}>
                <Text style={[sheetStyles.title, { color: theme.colors.text }]}>Write a Review</Text>
                <TextInput
                    style={[sheetStyles.textArea, { height: 100 }]}
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
                <TextInput
                    style={[sheetStyles.input]}
                    placeholder="+268 7612 3456 (Your Contact Number)"
                    keyboardType='numeric'
                    value={userNumber}
                    onChangeText={setUserNumber}
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
const RatingBottomSheet = React.forwardRef(({ theme, onSubmit, onDismiss, renderBackdrop }, ref) => {
    const [rating, setRating] = useState(0);
    return (
        <BottomSheetModal
            ref={ref}
            index={0}
            snapPoints={['40%']}
            backdropComponent={renderBackdrop}
            onDismiss={onDismiss}
            backgroundStyle={theme.colors.card}
            // backgroundComponent={theme.colors.card}
            enablePanDownToClose
        >
            <BottomSheetView style={[ratingSheetStyles.container, { backgroundColor: theme.colors.card }]}>
                <Text style={[ratingSheetStyles.title, { color: theme.colors.text }]}>Rate This Vehicle</Text>
                <View style={ratingSheetStyles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity key={star} onPress={() => setRating(star)}>
                            <Icons.Ionicons
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

// ────── Sort/Filter Bottom Sheet Modal ──────
const SortFilterBottomSheet = React.forwardRef(
    ({ theme, sortByCategory, setSortByCategory, sortByBorderCrossing, setSortByBorderCrossing, isVisible, onClose }, ref) => {
        const slideAnim = useRef(new Animated.Value(400)).current;
        const categories = ['All', 'Public Transport', 'Cargo', 'Passenger', 'Luxury'];

        useEffect(() => {
            if (isVisible) {
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            } else {
                Animated.timing(slideAnim, {
                    toValue: 400,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            }
        }, [isVisible]);

        return (
            <Modal
                visible={isVisible}
                transparent
                animationType="none"
                onRequestClose={onClose}
            >
                {/* Backdrop */}
                <TouchableOpacity
                    style={[sortFilterModalStyles.backdrop, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                    activeOpacity={1}
                    onPress={onClose}
                />

                {/* Animated Bottom Sheet */}
                <Animated.View
                    style={[
                        sortFilterModalStyles.container,
                        { transform: [{ translateY: slideAnim }], backgroundColor: theme.colors.card }
                    ]}
                >
                    {/* Drag Handle */}
                    <View style={sortFilterModalStyles.dragHandleContainer}>
                        <View style={sortFilterModalStyles.dragHandle} />
                    </View>

                    {/* Header */}
                    <View style={sortFilterModalStyles.header}>
                        <Text style={[sortFilterModalStyles.title, { color: theme.colors.text }]}>Filter & Sort</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={[sortFilterModalStyles.closeButton, { color: theme.colors.text }]}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View style={sortFilterModalStyles.divider} />

                    {/* Scrollable Content */}
                    <ScrollView
                        style={sortFilterModalStyles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={true}
                    >
                        {/* Category Section */}
                        <View style={sortFilterModalStyles.section}>
                            <Text style={sortFilterModalStyles.sectionTitle}>Category</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={sortFilterModalStyles.chipContainer}
                                bounces={true}
                                nestedScrollEnabled={true}
                            >
                                {categories.map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            sortFilterModalStyles.chip,
                                            sortByCategory === cat && sortFilterModalStyles.chipActive
                                        ]}
                                        onPress={() => setSortByCategory(cat)}
                                    >
                                        <Text style={[
                                            sortFilterModalStyles.chipText,
                                            sortByCategory === cat && sortFilterModalStyles.chipTextActive
                                        ]}>
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Border Crossing Section */}
                        <View style={sortFilterModalStyles.section}>
                            <Text style={sortFilterModalStyles.sectionTitle}>Border Crossing</Text>
                            <View style={sortFilterModalStyles.borderOptions}>
                                {['All', 'Yes', 'No'].map(opt => (
                                    <TouchableOpacity
                                        key={opt}
                                        style={[
                                            sortFilterModalStyles.borderChip,
                                            sortByBorderCrossing === opt && sortFilterModalStyles.borderChipActive
                                        ]}
                                        onPress={() => setSortByBorderCrossing(opt)}
                                    >
                                        <Text style={[
                                            sortFilterModalStyles.borderChipText,
                                            sortByBorderCrossing === opt && sortFilterModalStyles.borderChipTextActive
                                        ]}>
                                            {opt}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer Action */}
                    <View style={sortFilterModalStyles.footer}>
                        <TouchableOpacity
                            style={sortFilterModalStyles.applyButton}
                            onPress={onClose}
                        >
                            <Text style={sortFilterModalStyles.applyButtonText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Modal>
        );
    }
);
SortFilterBottomSheet.displayName = 'SortFilterBottomSheet';

const sheetStyles = StyleSheet.create({
    container: { flex: 1, paddingVertical: 24, paddingHorizontal: 12 },
    title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 24, color: '#1e293b' },
    textArea: {
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        borderRadius: 16,
        padding: 16,
        backgroundColor: '#fff',
        fontSize: 16,
        marginBottom: 10,
        height: 120,
    },
    input: {
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        borderRadius: 16,
        padding: 16,
        backgroundColor: '#fff',
        fontSize: 16,
        marginBottom: 10,
        height: 60,
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

const sortFilterModalStyles = StyleSheet.create({
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    dragHandleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    dragHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#cbd5e1',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1e293b',
    },
    closeButton: {
        fontSize: 28,
        color: '#64748b',
        fontWeight: '300',
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
    },
    scrollContainer: {
        flexGrow: 0,
        maxHeight: 300,
    },
    section: {
        paddingHorizontal: 12,
        paddingVertical: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 14,
        letterSpacing: 0.3,
    },
    chipContainer: {
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 25,
        backgroundColor: '#f1f5f9',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
    },
    chipActive: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    chipTextActive: {
        color: '#fff',
    },
    borderOptions: {
        flexDirection: 'row',
        gap: 12,
    },
    borderChip: {
        flex: 1,
        paddingVertical: 13,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
    },
    borderChipActive: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    borderChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    borderChipTextActive: {
        color: '#fff',
    },
    footer: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    applyButton: {
        backgroundColor: '#2563eb',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
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
    const [likedVehicles, setLikedVehicles] = useState(new Set());
    const [vehicleRatings, setVehicleRatings] = useState({});
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Vehicle state
    const [vehicles, setVehicles] = useState([]);
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(null);

    // Bottom sheets
    const commentSheetRef = useRef(null);
    const ratingSheetRef = useRef(null);
    const scrollViewRef = useRef(null);
    const [sortFilterModalVisible, setSortFilterModalVisible] = useState(false);
    const [modalVehicleId, setModalVehicleId] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [commentSuggestion, setCommentSuggestion] = useState('');
    const [userNumber, setUserNumber] = useState('');
    const [ratingVehicleId, setRatingVehicleId] = useState(null);
    const [comments, setComments] = useState({});

    const types = ['All', 'Minibus', 'Bus',
        'Van', 'Truck', 'Motorcycle',
        'Car', 'SUV', 'Sprinter', 'Tractor',
        'Tower', 'School-Bus', 'Staff-Bus',
        'Trailer'
    ];

    // ────── Fetch vehicles onmount ──────
    useEffect(() => {
        const checkAndFetch = async () => {
            const connected = await checkNetworkConnectivity();
            setIsConnected(connected);
            // Load liked vehicles from AsyncStorage
            await loadLikedVehicles();
            if (connected) {
                getAllForeHire();
            }
        };
        checkAndFetch();
    }, []);

    // Load liked vehicles from AsyncStorage
    const loadLikedVehicles = async () => {
        try {
            const stored = await AsyncStorage.getItem('likedVehicles');
            if (stored) {
                setLikedVehicles(new Set(JSON.parse(stored)));
            }
        } catch (err) {
            console.error('Error loading liked vehicles:', err);
        }
    };

    // Save liked vehicles to AsyncStorage
    const saveLikedVehicles = async (likedSet) => {
        try {
            await AsyncStorage.setItem('likedVehicles', JSON.stringify([...likedSet]));
        } catch (err) {
            console.error('Error saving liked vehicles:', err.message);
        }
    };

    useEffect(() => {
        const filtered_v = filterVehicles(vehicles);
        setFilteredVehicles(filtered_v)
    }, [vehicles, selectedType, sortByCategory, sortByBorderCrossing, searchQuery])

    const getAllForeHire = async () => {
        try {
            setLoading(true);
            const data = await getForHireTransport();
            const vehiclesData = Array.isArray(data) ? data : [];
            // set raw vehicles and synchronously compute filtered list so UI shows loader
            setVehicles(vehiclesData);
            const filtered_v = filterVehicles(vehiclesData);
            setFilteredVehicles(filtered_v);
        } catch (err) {
            console.error('Error fetching vehicles:', err);
            setVehicles([]);
            setFilteredVehicles([]);
        } finally {
            setLoading(false);
        }
    };

    // ────── Process & Sort Vehicles ──────
    const filterVehicles = (data = vehicles) => {
        let filtered = data?.filter(vehicle => {
            const matchesType = selectedType === 'All' ||
                vehicle.vehicle_type.toLowerCase().trim() === selectedType.toLowerCase() ||
                (selectedType === 'Minibus' && vehicle.vehicle_type.trim() === 'minibus') ||
                (selectedType === 'Bus' && vehicle.vehicle_type.trim() === 'bus') ||
                (selectedType === 'Van' && vehicle.vehicle_type.trim() === 'van') ||
                (selectedType === 'Truck' && vehicle.vehicle_type.trim() === 'truck') ||
                (selectedType === 'SUV' && vehicle.vehicle_type.trim() === 'suv') ||
                (selectedType === 'Car' && vehicle.vehicle_type.trim() === 'car') ||
                (selectedType === 'Sprinter' && vehicle.vehicle_type.trim() === 'sprinter');

            const matchesCategory = sortByCategory === 'All' ||
                (sortByCategory === 'Public Transport' && vehicle.vehicle_category.trim() === 'public_transport') ||
                (sortByCategory === 'Cargo' && vehicle.vehicle_category.trim() === 'cargo') ||
                (sortByCategory === 'Passenger' && vehicle.vehicle_category.trim() === 'passenger') ||
                (sortByCategory === 'Luxury' && vehicle.vehicle_category.trim() === 'luxury');

            const matchesBorder = sortByBorderCrossing === 'All' ||
                (sortByBorderCrossing === 'Yes' && vehicle.boarder_crossing) ||
                (sortByBorderCrossing === 'No' && !vehicle.boarder_crossing);

            const q = searchQuery.toLowerCase().trim();
            const matchesSearch = !q ||
                vehicle.vehicle_make?.toLowerCase().trim().includes(q) ||
                vehicle.vehicle_type?.toLowerCase().trim().includes(q) ||
                vehicle.vehicle_model?.toLowerCase().trim().includes(q) ||
                vehicle.description?.toLowerCase().trim().includes(q);

            return matchesType && matchesCategory && matchesBorder && matchesSearch;
        });
        return filtered?.sort(() => Math.random() - 0.5);
    };

    // ────── Interactions ──────
    const toggleLike = async (id) => {
        const isCurrentlyLiked = likedVehicles.has(id);

        try {
            // Update UI first (optimistic update)
            setLikedVehicles(prev => {
                const copy = new Set(prev);
                if (copy.has(id)) {
                    copy.delete(id);
                } else {
                    copy.add(id);
                }
                saveLikedVehicles(copy);
                return copy;
            });

            // Then update backend
            const result = await updateVehicleLike(id, !isCurrentlyLiked);

            if (!result.success) {
                // Revert if failed
                throw new Error(result.error);
            }

        } catch (err) {
            console.error('Error toggling like:', err);
            // Revert the optimistic update
            setLikedVehicles(prev => {
                const copy = new Set(prev);
                if (isCurrentlyLiked) {
                    copy.add(id);
                } else {
                    copy.delete(id);
                }
                saveLikedVehicles(copy);
                return copy;
            });
        }
    };

    // Open rating bottom sheet
    const handleRate = (id) => {
        setRatingVehicleId(id);
        ratingSheetRef.current?.present();
    };

    // Submit ratings
    const submitRating = async (value) => {
        try {
            const result = await submitVehicleRating(ratingVehicleId, value);

            if (result.success) {
                setVehicleRatings(prev => ({ ...prev, [ratingVehicleId]: value }));
                CustomToast('Rating Submitted! ⭐', `Your ${value}-star rating has been saved`);
                setRatingVehicleId(null);
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error('Error submitting rating:', err);
            CustomToast('Error', 'Failed to submit rating');
        }
    };

    // Open comment bottom sheet
    const openCommentSheet = (id) => {
        setModalVehicleId(id);
        setCommentText('');
        setCommentSuggestion('');
        commentSheetRef.current?.present();
    };

    // Save comment
    const submitComment = async () => {
        if (!commentText.trim() && !userNumber.trim()) {
            Alert.alert('Missing Details', 'Fill all none optional spaces.');
            return;
        }

        try {
            // Submit to database
            const result = await submitVehicleComment(modalVehicleId, commentText, commentSuggestion, userNumber);

            if (result.success) {
                // Update local state
                const newComment = {
                    text: commentText.trim(),
                    suggestion: commentSuggestion.trim(),
                    date: new Date()
                };

                setComments(prev => ({
                    ...prev,
                    [modalVehicleId]: [
                        ...(prev[modalVehicleId] || []),
                        newComment
                    ]
                }));

                commentSheetRef.current?.close();
                CustomToast('Thank You! 🙏🏾', 'Your review is valuable');
            } else {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error('Error submitting comment:', err);
            CustomToast('Error', 'Failed to submit review');
        } finally {
            setCommentText('');
            setCommentSuggestion('');
            setUserNumber('');
        }
    };

    const renderBackdrop = useCallback(props => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ), []);

    const scrollToVehicles = () => {
        if (filteredVehicles.length > 0) {
            scrollViewRef.current?.scrollTo({ y: 450, animated: true });
        }
    };

    const ActiveFilterChip = ({ label, icon, onClear }) => {
        return (
            <View style={styles.activeFilterChip}>
                {icon && <Icons.Ionicons name={icon} size={15} color="#1e40af" style={{ marginRight: 6 }} />}
                <Text style={styles.activeFilterText}>{label}</Text>
                <TouchableOpacity
                    onPress={onClear}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Icons.Ionicons name="close-circle" size={18} color="#1e40af" />
                </TouchableOpacity>
            </View>
        );
    };

    const handleCall = (vehicle) => {
        Linking.openURL(`tel:${vehicle.owner_info.phone}`);
    };

    const handleWhatsApp = (vehicle) => {
        Linking.openURL(`whatsapp://send?phone=${vehicle.owner_info.whatsapp.replace(/[^0-9]/g, '')}`);
    };

    const handleEmail = (vehicle) => {
        Linking.openURL(`mailto:${vehicle.owner_info.email}`);
    };

    const handleSMS = async (vehicle) => {
        console.log('Preparing to send SMS to:', vehicle?.owner_info?.phone);
        shareMessage = `Hello ${vehicle?.owner_info.name}!\n\n`;
        const smsUrl = Platform.OS === "ios"
            ? `sms:${vehicle?.owner_info?.phone}&body=${encodeURIComponent(shareMessage)}` // iOS uses semicolon
            : `smsto:${vehicle?.owner_info?.phone}?body=${encodeURIComponent(shareMessage)}`;
        if (await Linking.canOpenURL(smsUrl)) {
            await Linking.openURL(smsUrl);
            console.log('Preparing to send SMS to:', vehicle?.owner_info?.phone);
        }
        else {
            console.log('SMS client not available for URL:', smsUrl);
            throw new Error('SMS client not available');
        }
        console.log('After sending SMS');
    };

    // ────── Helper Labels ──────
    const getTypeLabel = (type) => (
        {
            minibus: 'Minibus', bus: 'Bus', van: 'Van',
            truck: 'Truck', suv: 'SUV', sedan: 'Sedan',
            motorcycle: 'Motor Cycle', car: 'Car', sprinter: 'Sprinter',
            tractor: 'Tractor', tower: 'Tower',
            schoolbus: 'School Bus',
            staffbus: 'Staff Bus',
            trailer: 'Trailer'
        }
    )[type] || type;

    // ────── RENDER VEHICLE CARD – Modern Overlay Style ──────
    const renderVehicleCard = (vehicle) => {
        const isLiked = likedVehicles.has(vehicle.id);
        const userRating = vehicleRatings[vehicle.id];
        const rating = userRating || vehicle.rating_average || 0;
        const likes = vehicle.likes || 0;  // Trust backend count, don't add +1 here
        const vehicleComments = comments[vehicle.id] || [];
        const latestComment = vehicleComments[vehicleComments.length - 1];

        return (
            <TouchableOpacity
                key={vehicle.id}
                style={[styles.vehicleCard, { backgroundColor: theme.colors.card }]}
                activeOpacity={0.92}
                onPress={() => navigation.navigate('TransportationDetailsScreen', { vehicle: vehicle })}
            >
                {/* Background Image */}
                <Image source={{ uri: vehicle?.vehicle_images[0]?.url }} style={styles.vehicleImage} />

                {/* Overlay Content */}
                <View style={styles.overlayContent}>
                    {/* Top Badges */}
                    <View style={styles.topBadges}>
                        <View style={styles.typeBadge}>
                            <Text style={styles.typeBadgeText}>{getTypeLabel(vehicle.vehicle_type)}</Text>
                        </View>
                        {vehicle.boarder_crossing && (
                            <View style={styles.borderBadge}>
                                <Icons.Ionicons name="globe" size={13} color="#fff" />
                                <Text style={styles.borderBadgeText}>Cross-Border</Text>
                            </View>
                        )}
                        {vehicle?.vehicle_certifications?.license && (
                            <Icons.Ionicons name="checkmark-circle" size={20} color="#10b981" style={{ marginLeft: 8 }} />
                        )}
                    </View>

                    {/* Main Info */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.vehicleTitle} numberOfLines={1}>
                            {vehicle.vehicle_category.replace(/_/g, ' ')
                                .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ')
                            }
                        </Text>
                        <Text style={styles.vehicleSubtitle} numberOfLines={1}>
                            {vehicle.vehicle_make} {vehicle.vehicle_model}
                        </Text>

                        {/* Location + Distance */}
                        <View style={styles.locationRow}>
                            <Icons.Ionicons name="location" size={14} color="#fff" />
                            <Text style={styles.locationText}>
                                {vehicle?.location?.city || vehicle.location.area} 🔵 {vehicle?.owner_info?.name || 'Unknown'}
                            </Text>
                        </View>

                        {/* Quick Specs */}
                        <View style={styles.specsRow}>
                            {vehicle.capacity && (
                                <View style={styles.specPill}>
                                    <Text style={styles.specText}>{vehicle.vehicle_capacity} seats</Text>
                                </View>
                            )}
                            {vehicle.cargoCapacity && (
                                <View style={styles.specPill}>
                                    <Text style={styles.specText}>{vehicle.cargo_capacity}t cargo</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Stats Bar */}
                    <View style={styles.statsOverlay}>
                        <TouchableOpacity style={styles.stat} onPress={(e) => { e.stopPropagation(); toggleLike(vehicle.id); }}>
                            <Icons.Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={19} color={isLiked ? "#ff4444" : "#fff"} />
                            <Text style={styles.statText}>{likes}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.stat} onPress={(e) => { e.stopPropagation(); handleRate(vehicle.id); }}>
                            <Icons.Ionicons name="star" size={19} color="#fbbf24" />
                            <Text style={styles.statText}>{rating.toFixed(1)}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.stat} onPress={(e) => { e.stopPropagation(); openCommentSheet(vehicle.id); }}>
                            <Icons.Ionicons name="chatbubble" size={18} color="#fff" />
                            <Text style={styles.statText}>{vehicleComments.length}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer Below Image */}
                <View style={[styles.cardFooter, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.contactButtons}>
                        <TouchableOpacity style={styles.contactButton} onPress={() => handleCall(vehicle)}>
                            <Icons.Ionicons name="call-outline" size={20} color="#2563eb" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.contactButton} onPress={() => handleWhatsApp(vehicle)}>
                            <Icons.Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.contactButton} onPress={() => handleEmail(vehicle)}>
                            <Icons.Ionicons name="mail-outline" size={20} color="#eb2560ff" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.contactButton} onPress={() => handleSMS(vehicle)}>
                            <Icons.MaterialIcons name="message" size={20} color="#2563eb" />
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const handleRefresh = async () => {
        try {
            setIsRefreshing(true);
            const connected = await checkNetworkConnectivity();
            if (!connected) {
                CustomToast('No Internet', 'Please check your connection and try again.');
                return;
            }
            await getAllForeHire();
            CustomToast('Refreshed 👍', 'Fore-Hire vehicles refreshed successfully');

        } catch (err) {
            console.log('General Error:', err.message);
            err &&
                CustomToast('Error', 'An error occurred.');
        } finally {
            setIsRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        handleRefresh();
    }, []);

    // ────── JSX ──────
    return (
        <BottomSheetModalProvider>
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
                <View style={{ height: 20 }} />
                <SecondaryNav
                    title="Transport For Hire"
                    rightIcon="options-outline"
                    onRightPress={() => setSortFilterModalVisible(true)}
                />

                {(sortByCategory !== 'All' || sortByBorderCrossing !== 'All') && (
                    <View style={styles.activeFiltersBar}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.activeFiltersContent}
                        >
                            {/* Category Chip */}
                            {sortByCategory !== 'All' && (
                                <ActiveFilterChip
                                    label={`Category: ${sortByCategory}`}
                                    onClear={() => setSortByCategory('All')}
                                />
                            )}

                            {/* Border Crossing Chip */}
                            {sortByBorderCrossing !== 'All' && (
                                <ActiveFilterChip
                                    label={`Border: ${sortByBorderCrossing}`}
                                    icon="globe-outline"
                                    onClear={() => setSortByBorderCrossing('All')}
                                />
                            )}

                            {/* Spacer to push "Clear All" to the right */}
                            <View style={{ flex: 1 }} />

                            {/* Clear All Button */}
                            <TouchableOpacity
                                style={styles.clearAllButton}
                                onPress={() => {
                                    setSortByCategory('All');
                                    setSortByBorderCrossing('All');
                                }}
                            >
                                <Icons.Ionicons name="close" size={16} color="#64748b" />
                                <Text style={styles.clearAllText}>Clear All</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                )}

                {/* Search Bar */}
                <View style={styles.searchBar}>
                    <Icons.Ionicons name="search" size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search make, model, or location..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#94a3b8"
                    />
                    {(sortByCategory !== 'All' || sortByBorderCrossing !== 'All') && (
                        <TouchableOpacity onPress={() => setSortFilterModalVisible(true)}>
                            <Icons.Ionicons name="options" size={24} color="#2563eb" />
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

                <TouchableOpacity
                    style={styles.postBtn}
                    onPress={() => navigation.navigate('PostTransportationScreen')}
                >
                    <Icons.Ionicons name="add-circle-outline" size={20} color="#2563eb" />
                    <Text style={styles.postBtnText}>Post Vehicle</Text>
                </TouchableOpacity>

                {isConnected === null || loading ? (
                    <CustomLoader />
                ) : !isConnected ? (
                    <View style={styles.center}>
                        <Icons.Feather name="wifi-off" size={50} color="#94a3b8" />
                        <Text style={{ color: '#94a3b8', fontSize: 16, marginTop: 10 }}>No internet connection</Text>
                    </View>
                ) : filteredVehicles.length === 0 ? (
                    <View style={styles.center}>
                        <Icons.Ionicons name="search-outline" size={50} color="#94a3b8" />
                        <Text style={{ color: '#94a3b8', fontSize: 16, marginTop: 10 }}>No vehicles found</Text>
                    </View>
                ) : (
                    <>
                        {/* Main Content */}
                        <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}
                            refreshControl={
                                <RefreshControl
                                    refreshing={isRefreshing}
                                    onRefresh={onRefresh}
                                    colors={[theme.colors.primary]}
                                    progressBackgroundColor={theme.colors.card}
                                />
                            }
                        >

                            {/* Vehicle Counting */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>All Vehicles ({filteredVehicles?.length})</Text>
                                    {/* scroll down */}
                                    <TouchableOpacity onPress={scrollToVehicles}>
                                        <Text style={styles.seeAllText}>See all</Text>
                                    </TouchableOpacity>
                                </View>
                                {filteredVehicles.map(renderVehicleCard)}
                            </View>
                        </ScrollView>
                    </>
                )}

                {/* Bottom Sheets */}
                <CommentBottomSheet
                    ref={commentSheetRef}
                    theme={theme}
                    vehicleId={modalVehicleId}
                    commentText={commentText}
                    setCommentText={setCommentText}
                    suggestion={commentSuggestion}
                    setSuggestion={setCommentSuggestion}
                    userNumber={userNumber}
                    setUserNumber={setUserNumber}
                    onSubmit={submitComment}
                    onDismiss={() => setModalVehicleId(null)}
                    renderBackdrop={renderBackdrop}
                />

                <RatingBottomSheet
                    ref={ratingSheetRef}
                    theme={theme}
                    onSubmit={submitRating}
                    onDismiss={() => setRatingVehicleId(null)}
                    renderBackdrop={renderBackdrop}
                />

                <SortFilterBottomSheet
                    theme={theme}
                    sortByCategory={sortByCategory}
                    setSortByCategory={setSortByCategory}
                    sortByBorderCrossing={sortByBorderCrossing}
                    setSortByBorderCrossing={setSortByBorderCrossing}
                    isVisible={sortFilterModalVisible}
                    onClose={() => setSortFilterModalVisible(false)}
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#eff6ff',
        borderBottomWidth: 1,
        borderBottomColor: '#dbeafe',
    },

    activeFiltersContent: {
        alignItems: 'center',
        gap: 10,
        paddingRight: 20, // gives space for Clear All
    },

    activeFilterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#dbeafe',
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 30,
        gap: 8,
    },

    activeFilterText: {
        fontSize: 13.5,
        fontWeight: '600',
        color: '#1e40af',
    },

    clearAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 30,
        gap: 6,
    },

    clearAllText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
    },

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

    // CARD – Modern Overlay Design
    vehicleCard: {
        marginHorizontal: 5,
        marginBottom: 20,
        borderRadius: 20,
        overflow: 'hidden',
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

    contactButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    contactButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eff6ff',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 50,
        gap: 6,
        borderColor: '#e3e3e3ff',
    },
    contactButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },

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
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    typeBadgeText: { color: '#2563eb', fontSize: 12, fontWeight: '700' },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },

    postBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eff6ff',
        paddingHorizontal: 16,
        marginHorizontal: 16,
        marginBottom: 10,
        paddingVertical: 10,
        borderRadius: 30,
        gap: 6
    },
    postBtnText: { color: '#2563eb', fontWeight: '600' },
    section: { marginTop: 8 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
    seeAllText: { color: '#2563eb', fontWeight: '600' }
});