import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    StatusBar,
    RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icons } from '../constants/Icons';
import { CustomModal } from '../components/customModal';
import { useCallFunction } from '../components/customCallAlert';
import { AppContext } from '../context/appContext';
import { handleBusinessPress, handleEmail, handleWhatsapp, handleLocation } from '../utils/callFunctions';

export default function FavoritesScreen({ navigation }) {
    const { theme, isDarkMode } = React.useContext(AppContext);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
    const [selectedBronzeBusiness, setSelectedBronzeBusiness] = useState(null);
    const { handleCall, AlertUI } = useCallFunction();

    // Load favorites from AsyncStorage
    const loadFavorites = async () => {
        try {
            setLoading(true);
            setError(null);

            const storedFavorites = await AsyncStorage.getItem('favorites');
            if (storedFavorites) {
                setFavorites(JSON.parse(storedFavorites));
            } else {
                // Initialize empty array if no favorites exist
                setFavorites([]);
            }
        } catch (err) {
            console.error('Error loading favorites:', err);
            setError('Could not load your favorites. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Remove a favorite
    const removeFavorite = async (businessId) => {
        try {
            // Filter out the business to remove
            const updatedFavorites = favorites.filter(business => business._id !== businessId);

            // Update state
            setFavorites(updatedFavorites);

            // Save to AsyncStorage
            await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));

            // Show success message
            Alert.alert('Success', 'Business removed from favorites');
        } catch (err) {
            console.error('Error removing favorite:', err);
            Alert.alert('Error', 'Could not remove from favorites. Please try again.');

            // Reload favorites to ensure UI is in sync with storage
            loadFavorites();
        }
    };

    // Handle refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await loadFavorites();
        setRefreshing(false);
    };

    const onRefresh = useCallback(() => {
        handleRefresh();
    }, []);

    // Load favorites on component mount
    useEffect(() => {
        loadFavorites();

        // Add a listener for when the screen comes into focus
        const unsubscribe = navigation.addListener('focus', () => {
            loadFavorites();
        });

        // Clean up the listener
        return unsubscribe;
    }, [navigation]);

    // Render each favorite business item
    const renderFavoriteItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => onBusinessPress(item)}>
            <View style={[styles.favoriteCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <View style={styles.favoriteHeader}>
                    <View style={styles.businessImageContainer}>
                        {item.logo ? (
                            <Image source={{ uri: item.logo }} style={styles.businessImage} resizeMode="cover" />
                        ) : (
                            <View style={[styles.businessInitialContainer, { color: theme.colors.background }]}>
                                <Text style={styles.businessInitial}>{item.company_name.charAt(0)}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.businessInfo}>
                        <Text style={[styles.businessName, { color: theme.colors.text }]} numberOfLines={1} ellipsizeMode="tail">{item.company_name}</Text>
                        <Text style={[styles.businessCategory, { color: theme.colors.text }]} numberOfLines={1} ellipsizeMode="tail">{item.company_type}</Text>
                        <Text style={[styles.businessAddress, { color: theme.colors.text }]} numberOfLines={1} ellipsizeMode="tail">{item.address}</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => {
                            Alert.alert(
                                "Remove Favorite",
                                `Are you sure you want to remove ${item.company_name} from favorites?`,
                                [
                                    { text: "Cancel", style: "cancel" },
                                    { text: "Remove", onPress: () => removeFavorite(item._id) }
                                ]
                            );
                        }}
                    >
                        <Icons.Ionicons name="heart" size={22} color="#003366" />
                    </TouchableOpacity>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.secondary }]} />

                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
                        onPress={(e) => handleCall(item.phone, e)}
                    >
                        <Icons.Ionicons name="call-outline" size={18} color="#003366" />
                        <Text style={[styles.actionButtonText, { color: theme.colors.light }]}>Call</Text>
                    </TouchableOpacity>

                    {item.phone && item.phone.some(p => p.phone_type === 'whatsApp') && (
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
                            onPress={(e) => {
                                e.stopPropagation();
                                handleWhatsapp(item.phone);
                            }}
                        >
                            <Icons.Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                            <Text style={[styles.actionButtonText, { color: theme.colors.light }]}>WhatsApp</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.actionButton, , { backgroundColor: theme.colors.secondary }]}
                        onPress={(e) => handleEmail(item.email, e)}
                    >
                        <Icons.Ionicons name="mail-outline" size={18} color="#FF9500" />
                        <Text style={[styles.actionButtonText, { color: theme.colors.light }]}>Email</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
                        onPress={(e) => handleLocation(item.address, e)}
                    >
                        <Icons.Ionicons name="location-outline" size={18} color="#5856D6" />
                        <Text style={[styles.actionButtonText, { color: theme.colors.light }]}>Map</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.viewDetailsButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => onBusinessPress(item)}
                >
                    <Text style={[styles.viewDetailsText, { color: "#FFFF" }]}>View Details</Text>
                    <Icons.Ionicons name="chevron-forward" size={16} color="#FFFF" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const onBusinessPress = (business) => {
        handleBusinessPress(
            business,
            navigation,
            setSelectedBronzeBusiness,
            setUpgradeModalVisible
        );
    };

    // Render empty state
    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Icons.Ionicons name="heart-outline" size={80} color="#DDDDDD" />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Favorites Yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.secondary }]}>
                Add businesses to your favorites for quick access
            </Text>
            <TouchableOpacity
                style={styles.browseButton}
                onPress={() => navigation.navigate("DirectoryScreen")}
            >
                <Text style={[styles.browseButtonText, { color: '#fff' }]}>Browse Businesses</Text>
            </TouchableOpacity>
        </View>
    );

    // Render error state
    const renderErrorState = () => (
        <View style={styles.emptyContainer}>
            <Icons.Ionicons name="alert-circle-outline" size={80} color="#FF3B30" />
            <Text style={styles.errorTitle}>Something Went Wrong</Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.secondary }]}>{error}</Text>
            <TouchableOpacity
                style={styles.retryButton}
                onPress={loadFavorites}
            >
                <Text style={[styles.retryButtonText, { color: theme.colors.light }]}>Try Again</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

            <AlertUI />

            {/* Upgrade Modal for Bronze Businesses */}
            <CustomModal
                isModalVisible={upgradeModalVisible}
                selectedBronzeBusiness={selectedBronzeBusiness}
                onClose={() => setUpgradeModalVisible(false)}
            />

            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Favorite Businesses</Text>
                {favorites.length > 0 && (
                    <Text style={[styles.favoriteCount, { color: theme.colors.text }]}>{favorites.length} {favorites.length === 1 ? 'business' : 'businesses'}</Text>
                )}
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.indicator} />
                    <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading your favorites...</Text>
                </View>
            ) : error ? (
                renderErrorState()
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={(item, index) => `${item._id}-${index}`}
                    renderItem={renderFavoriteItem}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[theme.colors.primary]}
                            tintColor="transparent"
                            progressBackgroundColor={theme.colors.card}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    favoriteCount: {
        fontSize: 14,
        marginTop: 2,
    },
    listContainer: {
        paddingTop: 16,
        paddingHorizontal: 8,
        paddingBottom: 40,
    },
    favoriteCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 5,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#F0F0F0',
    },
    favoriteHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    businessImageContainer: {
        marginRight: 16,
    },
    businessImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
    },
    businessInitialContainer: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: '#003366',
        justifyContent: 'center',
        alignItems: 'center',
    },
    businessInitial: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    businessInfo: {
        flex: 1,
        paddingRight: 30, // Make room for the heart icon
    },
    businessName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 4,
    },
    businessCategory: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 2,
    },
    businessAddress: {
        fontSize: 13,
        color: '#999999',
    },
    removeButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 4,
        zIndex: 1,
    },
    divider: {
        height: 1,
        marginVertical: 16,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        flexWrap: 'wrap',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    actionButtonText: {
        fontSize: 13,
        marginLeft: 6,
        fontWeight: '500',
    },
    viewDetailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
    },
    viewDetailsText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#003366',
        marginRight: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingBottom: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 24,
        marginBottom: 8,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FF3B30',
        marginTop: 24,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
    },
    browseButton: {
        backgroundColor: '#003366',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    browseButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    retryButton: {
        backgroundColor: '#FF3B30',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        marginTop: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    upgradeModalContent: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        overflow: "hidden",
        maxHeight: "80%",
    },
    upgradeModalHeader: {
        backgroundColor: "#003366",
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    upgradeModalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
        textAlign: "center",
    },
    closeButton: {
        position: "absolute",
        top: 16,
        right: 16,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    upgradeModalBody: {
        padding: 20,
    },
    businessBranding: {
        alignItems: "center",
        marginBottom: 20,
    },
    businessLogoContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#F8F8F8",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    businessLogo: {
        width: 50,
        height: 50,
    },
    businessInitialContainer: {
        width: "100%",
        height: "100%",
        backgroundColor: "#003366",
        justifyContent: "center",
        alignItems: "center",
    },
    businessInitial: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    upgradeBusinessName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333333",
        marginBottom: 4,
        textAlign: "center",
    },
    businessType: {
        fontSize: 14,
        color: "#666666",
        marginBottom: 8,
    },
    basicInfoContainer: {
        backgroundColor: "#F8F9FA",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    basicInfoItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        paddingVertical: 4,
    },
    basicInfoText: {
        fontSize: 15,
        color: "#333333",
        marginLeft: 12,
        flex: 1,
        flexWrap: "wrap",
    },
    actionButtonsContainer: {
        gap: 16,
    },
    primaryActionButton: {
        backgroundColor: "#003366",
        paddingVertical: 14,
        borderRadius: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    primaryActionText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
        marginLeft: 8,
    },
    secondaryActionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    secondaryActionButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 4,
        backgroundColor: "#F8F8F8",
    },
    secondaryActionText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#333333",
        marginTop: 4,
    },
});