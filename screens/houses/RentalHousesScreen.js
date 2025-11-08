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
import { mockRentalHouses, mockAreas } from '../../utils/mockData';

export default function RentalHousesScreen({ navigation }) {
    const [selectedType, setSelectedType] = useState('All'); // 'All', 'house', 'apartment', 'room', 'flat'
    const [selectedArea, setSelectedArea] = useState('All');
    const [selectedCity, setSelectedCity] = useState('All');
    const [selectedVillage, setSelectedVillage] = useState('All');
    const [selectedTownship, setSelectedTownship] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const types = ['All', 'House', 'Apartment', 'Room', 'Flat'];
    const areas = ['All', ...mockAreas];
    const cities = ['All', 'Mbabane', 'Manzini', 'Ezulwini', 'Nhlangano', 'Siteki'];
    const villages = ['All', 'Ezulwini Valley', 'Malkerns', 'Matsapha'];
    const townships = ['All', 'Hilltop', 'Fairview', 'The Gables', 'Town Center', 'Industrial Area'];

    const filteredHouses = mockRentalHouses.filter(house => {
        const matchesType = selectedType === 'All' || house.type === selectedType.toLowerCase();
        const matchesArea = selectedArea === 'All' || house.area === selectedArea;
        const matchesCity = selectedCity === 'All' || house.city === selectedCity;
        const matchesVillage = selectedVillage === 'All' || house.village === selectedVillage;
        const matchesTownship = selectedTownship === 'All' || house.township === selectedTownship;
        const matchesSearch = house.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            house.address.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesArea && matchesCity && matchesVillage && matchesTownship && matchesSearch;
    });

    const getUniqueValues = (key) => {
        const values = mockRentalHouses.map(h => h[key]).filter(Boolean);
        return ['All', ...Array.from(new Set(values))];
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SecondaryNav
                title="Rental Houses"
                rightIcon="filter-outline"
                onRightPress={() => setShowFilters(!showFilters)}
            />

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search houses..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />
                {(selectedType !== 'All' || selectedArea !== 'All' || selectedCity !== 'All' || selectedVillage !== 'All' || selectedTownship !== 'All') && !showFilters && (
                    <TouchableOpacity
                        style={styles.activeFiltersIndicator}
                        onPress={() => setShowFilters(true)}
                    >
                        <Ionicons name="filter" size={16} color="#2563eb" />
                        <Text style={styles.activeFiltersIndicatorText}>Filters</Text>
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

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Filters Section - Toggleable */}
                {showFilters && (
                    <View style={styles.filtersContainer}>
                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>Area</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                                {areas.map((area) => (
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
                    <Text style={styles.resultsText}>{filteredHouses.length} houses found</Text>
                    <TouchableOpacity
                        style={styles.postButton}
                        onPress={() => navigation.navigate('PostRentalHouseScreen')}
                    >
                        <Ionicons name="add-circle" size={18} color="#2563eb" />
                        <Text style={styles.postButtonText}>Post House</Text>
                    </TouchableOpacity>
                </View>

                {/* Houses List */}
                <View style={styles.housesContainer}>
                    {filteredHouses.map((house) => (
                        <TouchableOpacity
                            key={house.id}
                            style={styles.houseCard}
                            onPress={() => navigation.navigate('RentalHouseDetailsScreen', { houseId: house.id })}
                        >
                            <Image source={{ uri: house.images[0] }} style={styles.houseImage} resizeMode="cover" />
                            <View style={styles.houseContent}>
                                <View style={styles.houseHeader}>
                                    <View style={styles.houseHeaderLeft}>
                                        <Text style={styles.houseTitle} numberOfLines={2}>{house.title}</Text>
                                        <View style={styles.locationRow}>
                                            <Ionicons name="location-outline" size={14} color="#64748b" />
                                            <Text style={styles.houseLocation} numberOfLines={1}>
                                                {house.city || house.village || house.area}
                                                {house.township && `, ${house.township}`}
                                            </Text>
                                        </View>
                                    </View>
                                    {house.landlord.verified && (
                                        <View style={styles.verifiedBadge}>
                                            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                        </View>
                                    )}
                                </View>

                                <View style={styles.houseDetails}>
                                    <View style={styles.detailItem}>
                                        <Ionicons name="bed-outline" size={16} color="#64748b" />
                                        <Text style={styles.detailText}>{house.bedrooms} Bed</Text>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <Ionicons name="water-outline" size={16} color="#64748b" />
                                        <Text style={styles.detailText}>{house.bathrooms} Bath</Text>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <Ionicons name="resize-outline" size={16} color="#64748b" />
                                        <Text style={styles.detailText}>{house.size}m²</Text>
                                    </View>
                                </View>

                                <View style={styles.houseFooter}>
                                    <View>
                                        <Text style={styles.price}>E {house.price.toLocaleString()}</Text>
                                        <Text style={styles.pricePeriod}>/month</Text>
                                    </View>
                                    <View style={styles.typeBadge}>
                                        <Text style={styles.typeBadgeText}>{house.type.toUpperCase()}</Text>
                                    </View>
                                </View>

                                <View style={styles.houseStats}>
                                    <View style={styles.statItem}>
                                        <Ionicons name="eye-outline" size={14} color="#94a3b8" />
                                        <Text style={styles.statText}>{house.views}</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Ionicons name="document-text-outline" size={14} color="#94a3b8" />
                                        <Text style={styles.statText}>{house.applications} applications</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                                        <Text style={styles.statText}>Available: {house.availableDate}</Text>
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
        marginHorizontal: 10,
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
    housesContainer: {
        // paddingHorizontal: 20,
    },
    houseCard: {
        backgroundColor: '#fff',
        // borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    houseImage: {
        width: '100%',
        height: 200,
    },
    houseContent: {
        padding: 16,
    },
    houseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    houseHeaderLeft: {
        flex: 1,
        marginRight: 8,
    },
    houseTitle: {
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
    houseLocation: {
        fontSize: 13,
        color: '#64748b',
        flex: 1,
    },
    verifiedBadge: {
        padding: 4,
    },
    houseDetails: {
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
    houseFooter: {
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
    houseStats: {
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


