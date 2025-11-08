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
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SecondaryNav from '../../components/SecondaryNav';
import { mockLeaseItems, mockAreas } from '../../utils/mockData';

export default function LeaseItemsScreen({ navigation }) {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedArea, setSelectedArea] = useState('All');
    const [selectedCity, setSelectedCity] = useState('All');
    const [selectedVillage, setSelectedVillage] = useState('All');
    const [selectedTownship, setSelectedTownship] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const categories = ['All', 'Electronics', 'Tools', 'Fashion', 'Appliances', 'Agriculture'];
    const cities = ['All', 'Mbabane', 'Manzini', 'Ezulwini', 'Nhlangano', 'Siteki'];
    const villages = ['All', 'Ezulwini Valley', 'Malkerns', 'Matsapha'];
    const townships = ['All', 'Hilltop', 'Fairview', 'The Gables', 'Town Center', 'Industrial Area'];

    const filteredItems = mockLeaseItems.filter(item => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesArea = selectedArea === 'All' || item.location.area === selectedArea;
        const matchesCity = selectedCity === 'All' || item.location.city === selectedCity;
        const matchesVillage = selectedVillage === 'All' || item.location.village === selectedVillage;
        const matchesTownship = selectedTownship === 'All' || item.location.township === selectedTownship;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesArea && matchesCity && matchesVillage && matchesTownship && matchesSearch;
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SecondaryNav
                title="Lease & Borrow"
                rightIcon="filter-outline"
                onRightPress={() => setShowFilters(!showFilters)}
            />

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search items to lease..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />
                {(selectedCategory !== 'All' || selectedArea !== 'All' || selectedCity !== 'All' || selectedVillage !== 'All' || selectedTownship !== 'All') && !showFilters && (
                    <TouchableOpacity
                        style={styles.activeFiltersIndicator}
                        onPress={() => setShowFilters(true)}
                    >
                        <Ionicons name="filter" size={16} color="#2563eb" />
                        <Text style={styles.activeFiltersIndicatorText}>Filters</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Category Tabs */}
            <View style={styles.categoryContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category}
                            style={[styles.categoryChip, selectedCategory === category && styles.categoryChipActive]}
                            onPress={() => setSelectedCategory(category)}
                        >
                            <Text style={[styles.categoryText, selectedCategory === category && styles.categoryTextActive]}>
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Filters Section - Toggleable */}
                {showFilters && (
                    <View style={styles.filtersContainer}>
                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>Area</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                                {mockAreas.map((area) => (
                                    <TouchableOpacity
                                        key={area}
                                        style={[styles.filterChip, selectedArea === area && styles.filterChipActive]}
                                        onPress={() => setSelectedArea(area)}
                                    >
                                        <Text style={[styles.filterChipText, selectedArea === area && styles.filterChipTextActive]}>
                                            {area}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>City</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                                {cities.map((city) => (
                                    <TouchableOpacity
                                        key={city}
                                        style={[styles.filterChip, selectedCity === city && styles.filterChipActive]}
                                        onPress={() => setSelectedCity(city)}
                                    >
                                        <Text style={[styles.filterChipText, selectedCity === city && styles.filterChipTextActive]}>
                                            {city}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>Village</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                                {villages.map((village) => (
                                    <TouchableOpacity
                                        key={village}
                                        style={[styles.filterChip, selectedVillage === village && styles.filterChipActive]}
                                        onPress={() => setSelectedVillage(village)}
                                    >
                                        <Text style={[styles.filterChipText, selectedVillage === village && styles.filterChipTextActive]}>
                                            {village}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>Township</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                                {townships.map((township) => (
                                    <TouchableOpacity
                                        key={township}
                                        style={[styles.filterChip, selectedTownship === township && styles.filterChipActive]}
                                        onPress={() => setSelectedTownship(township)}
                                    >
                                        <Text style={[styles.filterChipText, selectedTownship === township && styles.filterChipTextActive]}>
                                            {township}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Active Filters Display */}
                        {(selectedArea !== 'All' || selectedCity !== 'All' || selectedVillage !== 'All' || selectedTownship !== 'All') && (
                            <View style={styles.activeFiltersContainer}>
                                <Text style={styles.activeFiltersLabel}>Active Filters:</Text>
                                <View style={styles.activeFiltersRow}>
                                    {selectedArea !== 'All' && (
                                        <View style={styles.activeFilterBadge}>
                                            <Text style={styles.activeFilterText}>Area: {selectedArea}</Text>
                                            <TouchableOpacity onPress={() => setSelectedArea('All')} style={styles.removeFilterButton}>
                                                <Ionicons name="close-circle" size={16} color="#64748b" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    {selectedCity !== 'All' && (
                                        <View style={styles.activeFilterBadge}>
                                            <Text style={styles.activeFilterText}>City: {selectedCity}</Text>
                                            <TouchableOpacity onPress={() => setSelectedCity('All')} style={styles.removeFilterButton}>
                                                <Ionicons name="close-circle" size={16} color="#64748b" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    {selectedVillage !== 'All' && (
                                        <View style={styles.activeFilterBadge}>
                                            <Text style={styles.activeFilterText}>Village: {selectedVillage}</Text>
                                            <TouchableOpacity onPress={() => setSelectedVillage('All')} style={styles.removeFilterButton}>
                                                <Ionicons name="close-circle" size={16} color="#64748b" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    {selectedTownship !== 'All' && (
                                        <View style={styles.activeFilterBadge}>
                                            <Text style={styles.activeFilterText}>Township: {selectedTownship}</Text>
                                            <TouchableOpacity onPress={() => setSelectedTownship('All')} style={styles.removeFilterButton}>
                                                <Ionicons name="close-circle" size={16} color="#64748b" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {/* Results Count */}
                <View style={styles.resultsContainer}>
                    <Text style={styles.resultsText}>{filteredItems.length} items found</Text>
                    <TouchableOpacity
                        style={styles.postButton}
                        onPress={() => navigation.navigate('PostLeaseItemScreen')}
                    >
                        <Ionicons name="add-circle" size={18} color="#2563eb" />
                        <Text style={styles.postButtonText}>Post Item</Text>
                    </TouchableOpacity>
                </View>

                {/* Items List */}
                <View style={styles.itemsContainer}>
                    {filteredItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.itemCard}
                            onPress={() => navigation.navigate('LeaseItemDetailsScreen', { itemId: item.id })}
                        >
                            <Image source={{ uri: item.images[0] }} style={styles.itemImage} resizeMode="cover" />
                            <View style={styles.itemContent}>
                                <View style={styles.itemHeader}>
                                    <View style={styles.itemHeaderLeft}>
                                        <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                                        <View style={styles.locationRow}>
                                            <Ionicons name="location-outline" size={14} color="#64748b" />
                                            <Text style={styles.itemLocation} numberOfLines={1}>
                                                {item.location.city || item.location.village || item.location.area}
                                                {item.location.township && `, ${item.location.township}`}
                                            </Text>
                                        </View>
                                    </View>
                                    {item.owner.verified && (
                                        <View style={styles.verifiedBadge}>
                                            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                        </View>
                                    )}
                                </View>

                                <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>

                                <View style={styles.itemDetails}>
                                    <View style={styles.detailItem}>
                                        <Ionicons name="pricetag-outline" size={16} color="#64748b" />
                                        <Text style={styles.detailText}>E {item.price}/{item.leaseType}</Text>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <Ionicons name="shield-checkmark-outline" size={16} color="#64748b" />
                                        <Text style={styles.detailText}>Deposit: E {item.deposit.toLocaleString()}</Text>
                                    </View>
                                </View>

                                <View style={styles.itemFooter}>
                                    <View style={styles.categoryBadge}>
                                        <Text style={styles.categoryBadgeText}>{item.category}</Text>
                                    </View>
                                    <View style={styles.conditionBadge}>
                                        <Text style={styles.conditionText}>{item.condition}</Text>
                                    </View>
                                </View>

                                <View style={styles.itemStats}>
                                    <View style={styles.statItem}>
                                        <Ionicons name="eye-outline" size={14} color="#94a3b8" />
                                        <Text style={styles.statText}>{item.views}</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Ionicons name="document-text-outline" size={14} color="#94a3b8" />
                                        <Text style={styles.statText}>{item.applications} applications</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

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
    filtersContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    filterSection: {
        marginBottom: 16,
    },
    filterSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 12,
    },
    filterScroll: {
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    filterChipActive: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
    },
    filterChipTextActive: {
        color: '#fff',
    },
    activeFiltersContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    activeFiltersLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 8,
    },
    activeFiltersRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    activeFilterBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eff6ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    activeFilterText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2563eb',
    },
    removeFilterButton: {
        padding: 2,
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
    itemsContainer: {
        // paddingHorizontal: 10,
    },
    itemCard: {
        backgroundColor: '#fff',
        // borderRadius: 8,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    itemImage: {
        width: '100%',
        height: 200,
    },
    itemContent: {
        padding: 16,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    itemHeaderLeft: {
        flex: 1,
        marginRight: 8,
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 6,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    itemLocation: {
        fontSize: 13,
        color: '#64748b',
        flex: 1,
    },
    verifiedBadge: {
        padding: 4,
    },
    itemDescription: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        marginBottom: 12,
    },
    itemDetails: {
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
    itemFooter: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    categoryBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: '#eff6ff',
    },
    categoryBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#2563eb',
    },
    conditionBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: '#f0fdf4',
    },
    conditionText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#16a34a',
    },
    itemStats: {
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
    bottomPadding: {
        height: 20,
    },
});


