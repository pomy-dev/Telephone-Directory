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
    Dimensions,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import SecondaryNav from '../../components/SecondaryNav';
import { mockRentalHouses, mockLeaseItems } from '../../utils/mockData';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

// Combine all properties into a unified structure
const getAllProperties = () => {
    const properties = [];

    // Add rental houses with category 'Houses'
    mockRentalHouses.forEach(house => {
        properties.push({
            ...house,
            propertyCategory: 'Houses',
            propertyType: house.type, // house, apartment, room, flat
        });
    });

    // Add lease items and categorize them
    mockLeaseItems.forEach(item => {
        let category = 'Other';
        if (item.category === 'Agriculture' || item.subcategory === 'Farm Equipment') {
            category = 'Farms';
        } else if (item.category === 'Tools' || item.subcategory === 'Tools' ||
            item.title.toLowerCase().includes('tool')) {
            category = 'Tools';
        }

        properties.push({
            ...item,
            propertyCategory: category,
            propertyType: item.category || item.subcategory || 'item',
        });
    });

    return properties;
};

export default function PropertyScreen({ navigation }) {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['All', 'Houses', 'Farms', 'Tools', 'Other'];
    const allProperties = useMemo(() => getAllProperties(), []);

    // Filter properties based on category and search
    const filteredProperties = useMemo(() => {
        return allProperties.filter(property => {
            const matchesCategory = selectedCategory === 'All'
                ? true
                : selectedCategory === 'Other'
                    ? !['Houses', 'Farms', 'Tools'].includes(property.propertyCategory)
                    : property.propertyCategory === selectedCategory;

            const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (property.description && property.description.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchQuery, allProperties]);

    // Group properties by category
    const groupedProperties = useMemo(() => {
        const groups = {
            Houses: [],
            Farms: [],
            Tools: [],
            Other: [],
        };

        filteredProperties.forEach(property => {
            if (groups[property.propertyCategory]) {
                groups[property.propertyCategory].push(property);
            } else {
                groups.Other.push(property);
            }
        });

        return groups;
    }, [filteredProperties]);

    const handleViewAll = (catogory) => {
        if (catogory !== 'Houses') {
            navigation.navigate('LeaseItemsScreen');
        } else {
            navigation.navigate('RentalHousesScreen');
        }
    }

    const renderPropertyCard = (property) => {
        const isHouse = property.propertyCategory === 'Houses';
        const isFarm = property.propertyCategory === 'Farms';
        const isTool = property.propertyCategory === 'Tools';

        return (
            <TouchableOpacity
                key={property.id}
                style={styles.propertyCard}
                onPress={() => {
                    if (isHouse) {
                        navigation.navigate('RentalHouseDetailsScreen', { houseId: property.id });
                    } else {
                        navigation.navigate('LeaseItemDetailsScreen', { itemId: property.id });
                    }
                }}
            >
                <Image
                    source={{ uri: property.images[0] }}
                    style={styles.propertyImage}
                    resizeMode="cover"
                />
                <View style={styles.propertyContent}>
                    <Text style={styles.propertyTitle} numberOfLines={2}>
                        {property.title}
                    </Text>

                    <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={12} color="#64748b" />
                        <Text style={styles.propertyLocation} numberOfLines={1}>
                            {property.city || property.village || property.area ||
                                (property.location && (property.location.city || property.location.area))}
                        </Text>
                    </View>

                    {isHouse && (
                        <View style={styles.houseDetails}>
                            {property.bedrooms && (
                                <View style={styles.detailItem}>
                                    <Ionicons name="bed-outline" size={14} color="#64748b" />
                                    <Text style={styles.detailText}>{property.bedrooms} Bed</Text>
                                </View>
                            )}
                            {property.bathrooms && (
                                <View style={styles.detailItem}>
                                    <Ionicons name="water-outline" size={14} color="#64748b" />
                                    <Text style={styles.detailText}>{property.bathrooms} Bath</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {(isFarm || isTool) && (
                        <View style={styles.itemDetails}>
                            <Text style={styles.itemCategory}>
                                {property.category || property.subcategory || 'Item'}
                            </Text>
                            {property.condition && (
                                <Text style={styles.itemCondition}>Condition: {property.condition}</Text>
                            )}
                        </View>
                    )}

                    <View style={styles.propertyFooter}>
                        <View>
                            <Text style={styles.price}>
                                E {property.price.toLocaleString()}
                            </Text>
                            <Text style={styles.pricePeriod}>
                                {isHouse ? '/month' : property.leaseType ? `/${property.leaseType}` : '/day'}
                            </Text>
                        </View>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>
                                {property.propertyCategory.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderOtherCard = (property) => {
        const isHouse = property.propertyCategory === 'Houses';

        return (
            <TouchableOpacity
                key={property.id}
                style={[styles.propertyCard, { marginBottom: 10 }]}
                onPress={() => {
                    if (isHouse) {
                        navigation.navigate('RentalHouseDetailsScreen', { houseId: property.id });
                    } else {
                        navigation.navigate('LeaseItemDetailsScreen', { itemId: property.id });
                    }
                }}
            >
                <Image
                    source={{ uri: property.images[0] }}
                    style={styles.propertyImage}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.propertyOverlay}
                >
                    <View style={styles.propertyOtherContent}>
                        <Text style={styles.propertyCardTitle} numberOfLines={2}>
                            {property.title}
                        </Text>

                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={12} color="#fff" />
                            <Text style={styles.propertyLocationOverlay} numberOfLines={1}>
                                {property.city || property.village || property.area ||
                                    (property.location && (property.location.city || property.location.area))}
                            </Text>
                        </View>

                        <View style={styles.propertyFooter}>
                            <View>
                                <Text style={styles.priceOverlay}>
                                    E {property.price.toLocaleString()}
                                    <Text style={styles.pricePeriodOverlay}>
                                        {isHouse ? '/month' : property.leaseType ? `/${property.leaseType}` : '/day'}
                                    </Text>
                                </Text>
                            </View>
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryBadgeText}>
                                    {property.propertyCategory.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    const renderCategorySection = (categoryName, properties) => {
        if (selectedCategory !== 'All' && selectedCategory !== categoryName) {
            return null;
        }

        if (properties.length === 0) {
            return null;
        }

        return (
            <View style={styles.categorySection} key={categoryName}>
                <View style={styles.sectionHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.sectionTitle}>{(categoryName === 'Houses' || categoryName === 'Farms') ? categoryName + ' To Let' : categoryName + ' For Lease'}</Text>
                        <Text style={styles.sectionCount}>({properties.length})</Text>
                    </View>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}
                        onPress={() => handleViewAll(categoryName)}
                    >
                        <Text style={styles.viewAllText}>View All</Text>
                        <Ionicons name="chevron-forward" size={16} color="#2563eb" />
                    </TouchableOpacity>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScroll}
                >
                    {properties.map(property => categoryName !== 'Other' ? renderPropertyCard(property) : renderOtherCard(property))}
                </ScrollView>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SecondaryNav
                title="Properties"
                rightIcon="add-circle-outline"
                onRightPress={() => {
                    Alert.alert(
                        "Make a Post",
                        "Choose the type of property you want to post.",
                        [
                            {
                                text: "Rental House",
                                onPress: () => navigation.navigate('PostRentalHouseScreen'),
                            },
                            {
                                text: "Lease Item",
                                onPress: () => navigation.navigate('PostLeaseItemScreen'),
                            },
                            {
                                text: "Cancel",
                                style: "cancel"
                            }
                        ],
                        { cancelable: true }
                    );
                }}
            />

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search properties..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />
            </View>

            {/* Category Tabs */}
            <View style={styles.categoryContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScroll}
                >
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.categoryChip,
                                selectedCategory === category && styles.categoryChipActive
                            ]}
                            onPress={() => setSelectedCategory(category)}
                        >
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === category && styles.categoryTextActive
                            ]}>
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Results Count */}
                <View style={styles.resultsContainer}>
                    <Text style={styles.resultsText}>
                        {filteredProperties.length} {selectedCategory === 'All' ? 'properties' : selectedCategory.toLowerCase()} found
                    </Text>
                </View>

                {/* Category Sections */}
                {selectedCategory === 'All' ? (
                    <>
                        {renderCategorySection('Houses', groupedProperties.Houses)}
                        {renderCategorySection('Farms', groupedProperties.Farms)}
                        {renderCategorySection('Tools', groupedProperties.Tools)}
                        {renderCategorySection('Other', groupedProperties.Other)}
                    </>
                ) : (
                    <View style={styles.categorySection}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalScroll}
                        >
                            {filteredProperties.map(property => renderPropertyCard(property))}
                        </ScrollView>
                    </View>
                )}

                <View style={styles.bottomPadding} />
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
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 16,
        paddingHorizontal: 16,
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
    categoryContainer: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    categoryScroll: {
        paddingHorizontal: 20,
        gap: 12,
    },
    categoryChip: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        marginRight: 8,
    },
    categoryChipActive: {
        backgroundColor: '#2563eb',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    categoryTextActive: {
        color: '#fff',
    },
    resultsContainer: {
        paddingHorizontal: 10,
        marginTop: 16,
        marginBottom: 16,
    },
    resultsText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
    },
    categorySection: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    sectionCount: {
        fontSize: 14,
        color: '#64748b',
        marginLeft: 8,
    },
    horizontalScroll: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        gap: 16,
    },
    propertyCard: {
        width: CARD_WIDTH,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    propertyImage: {
        width: '100%',
        height: 180,
    },
    propertyContent: {
        padding: 16,
    },
    propertyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        marginBottom: 8,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 12,
    },
    propertyLocation: {
        fontSize: 12,
        color: '#64748b',
        flex: 1,
    },
    houseDetails: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '500',
    },
    itemDetails: {
        marginBottom: 12,
    },
    itemCategory: {
        fontSize: 12,
        color: '#2563eb',
        fontWeight: '600',
        marginBottom: 4,
    },
    itemCondition: {
        fontSize: 12,
        color: '#64748b',
    },
    propertyFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    price: {
        fontSize: 18,
        fontWeight: '700',
        color: '#10b981',
    },
    pricePeriod: {
        fontSize: 11,
        color: '#64748b',
    },
    categoryBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: '#eff6ff',
    },
    categoryBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#2563eb',
    },
    bottomPadding: {
        height: 20,
    },

    // other card
    propertyOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
    },
    propertyOtherContent: {
        gap: 8,
    },
    propertyCardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    propertyLocationOverlay: {
        fontSize: 12,
        color: '#fff',
        flex: 1,
    },
    priceOverlay: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    pricePeriodOverlay: {
        fontSize: 12,
        color: '#e2e8f0',
        marginLeft: 4,
    },
    sectionHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewAllText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2563eb',
    },
});
