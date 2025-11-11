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
import { Icons } from '../../constants/Icons';
import { Ionicons } from '@expo/vector-icons';
import SecondaryNav from '../../components/SecondaryNav';
import { mockTenders, allIndustries } from '../../utils/mockData';

export default function PublishedTendersScreen({ navigation }) {
    const [layout, setLayout] = useState('list'); // 'list', 'grid', 'compact'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedIndustry, setSelectedIndustry] = useState('All');
    const [showFilters, setShowFilters] = useState(false);

    const categories = ['All', 'Construction', 'IT Services', 'Supplies', 'Consulting', 'Energy', 'Healthcare'];
    const industries = ['All', ...allIndustries];
    const publishedTenders = mockTenders.filter(t => t.isPublished);

    const filteredTenders = publishedTenders.filter(tender => {
        const matchesSearch = tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tender.organization.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || tender.category === selectedCategory;
        const matchesIndustry = selectedIndustry === 'All' || tender.industry === selectedIndustry;
        return matchesSearch && matchesCategory && matchesIndustry;
    });

    const renderListLayout = () => (
        <View style={styles.tendersContainer}>
            {filteredTenders.map((tender) => (
                <TouchableOpacity
                    key={tender.id}
                    style={styles.tenderCard}
                    onPress={() => navigation.navigate('TenderDetailsScreen', { tenderId: tender.id })}
                >
                    {tender.hasPoster && tender.posterUrl && (
                        <Image source={tender.posterUrl} style={styles.cardImage} resizeMode="cover" />
                    )}
                    <View style={styles.cardContent}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardHeaderLeft}>
                                <Text style={styles.cardTitle} numberOfLines={2}>{tender.title}</Text>
                                <Text style={styles.cardOrganization}>{tender.organization}</Text>
                            </View>
                            {tender.urgent && (
                                <View style={styles.urgentBadgeSmall}>
                                    <Ionicons name="alert-circle" size={12} color="#fff" />
                                </View>
                            )}
                        </View>
                        <Text style={styles.cardDescription} numberOfLines={2}>{tender.description}</Text>
                        <View style={styles.cardFooter}>
                            <View style={styles.cardStats}>
                                <View style={styles.cardStatItem}>
                                    <Ionicons name="cash-outline" size={14} color="#10b981" />
                                    <Text style={styles.cardStatText}>{tender.budget}</Text>
                                </View>
                                <View style={styles.cardStatItem}>
                                    <Ionicons name="calendar-outline" size={14} color="#f59e0b" />
                                    <Text style={styles.cardStatText}>{tender.daysLeft}d left</Text>
                                </View>
                            </View>
                            <View style={styles.cardTagsContainer}>
                                <View style={styles.industryTag}>
                                    <Text style={styles.industryTagText}>{tender.industry}</Text>
                                </View>
                                <View style={styles.categoryTag}>
                                    <Text style={styles.categoryTagText}>{tender.category}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderGridLayout = () => (
        <View style={styles.gridContainer}>
            {filteredTenders.map((tender) => (
                <TouchableOpacity
                    key={tender.id}
                    style={styles.gridCard}
                    onPress={() => navigation.navigate('TenderDetailsScreen', { tenderId: tender.id })}
                >
                    {tender.hasPoster && tender.posterUrl ? (
                        <Image source={tender.posterUrl} style={styles.gridImage} resizeMode="cover" />
                    ) : (
                        <View style={styles.gridImagePlaceholder}>
                            <Ionicons name="document-text-outline" size={32} color="#94a3b8" />
                        </View>
                    )}
                    <View style={styles.gridContent}>
                        <Text style={styles.gridTitle} numberOfLines={2}>{tender.title}</Text>
                        <Text style={styles.gridOrganization} numberOfLines={1}>{tender.organization}</Text>
                        <View style={styles.gridFooter}>
                            <View style={styles.gridFooterLeft}>
                                <Text style={styles.gridBudget}>{tender.budget}</Text>
                                <View style={styles.gridIndustryTag}>
                                    <Text style={styles.gridIndustryText}>{tender.industry}</Text>
                                </View>
                            </View>
                            {tender.urgent && (
                                <View style={styles.urgentDot} />
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderCompactLayout = () => (
        <View style={styles.compactContainer}>
            {filteredTenders.map((tender) => (
                <TouchableOpacity
                    key={tender.id}
                    style={styles.compactCard}
                    onPress={() => navigation.navigate('TenderDetailsScreen', { tenderId: tender.id })}
                >
                    <View style={styles.compactLeft}>
                        <View style={styles.compactIcon}>
                            <Ionicons name="document-text" size={20} color="#2563eb" />
                        </View>
                        <View style={styles.compactInfo}>
                            <Text style={styles.compactTitle} numberOfLines={1}>{tender.title}</Text>
                            <Text style={styles.compactOrganization} numberOfLines={1}>{tender.organization}</Text>
                        </View>
                    </View>
                    <View style={styles.compactRight}>
                        <View style={styles.compactRightInfo}>
                            <Text style={styles.compactBudget}>{tender.budget}</Text>
                            <View style={styles.compactIndustryTag}>
                                <Text style={styles.compactIndustryText}>{tender.industry}</Text>
                            </View>
                        </View>
                        {tender.urgent && (
                            <View style={styles.urgentDotSmall} />
                        )}
                        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SecondaryNav
                title="Published Tenders"
                rightIcon={'add-circle-outline'}
                onRightPress={() => navigation.navigate('AddTenderScreen')}
            />

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search tenders..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />
            </View>

            {/* Layout Toggle */}
            <View style={styles.controlsContainer}>
                <TouchableOpacity
                    style={styles.sortBy}
                    onPress={() => setShowFilters(!showFilters)}
                >
                    <Text style={{ color: '#64748b', fontSize: 20, fontWeight: 400 }}>Sort By:</Text>
                    <Ionicons name="options-outline" size={20} color='#31373eff' />
                </TouchableOpacity>
                <View style={styles.layoutToggle}>
                    <TouchableOpacity
                        style={[styles.layoutButton, layout === 'list' && styles.layoutButtonActive]}
                        onPress={() => setLayout('list')}
                    >
                        <Ionicons name="list" size={20} color={layout === 'list' ? '#2563eb' : '#64748b'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.layoutButton, layout === 'grid' && styles.layoutButtonActive]}
                        onPress={() => setLayout('grid')}
                    >
                        <Ionicons name="grid" size={20} color={layout === 'grid' ? '#2563eb' : '#64748b'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.layoutButton, layout === 'compact' && styles.layoutButtonActive]}
                        onPress={() => setLayout('compact')}
                    >
                        <Ionicons name="reorder-three" size={20} color={layout === 'compact' ? '#2563eb' : '#64748b'} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filters Section - Toggleable */}
            {showFilters && (
                <View style={styles.filtersContainer}>
                    <View style={styles.filterRow}>
                        <Text style={styles.filterLabel}>Industry:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
                            {industries.slice(0, 12).map((industry) => (
                                <TouchableOpacity
                                    key={industry}
                                    style={[
                                        styles.categoryChip,
                                        selectedIndustry === industry && styles.categoryChipActive,
                                    ]}
                                    onPress={() => setSelectedIndustry(industry)}
                                >
                                    <Text
                                        style={[
                                            styles.categoryChipText,
                                            selectedIndustry === industry && styles.categoryChipTextActive,
                                        ]}
                                    >
                                        {industry}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                    <View style={styles.filterRow}>
                        <Text style={styles.filterLabel}>Category:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
                            {categories.map((category) => (
                                <TouchableOpacity
                                    key={category}
                                    style={[
                                        styles.categoryChip,
                                        selectedCategory === category && styles.categoryChipActive,
                                    ]}
                                    onPress={() => setSelectedCategory(category)}
                                >
                                    <Text
                                        style={[
                                            styles.categoryChipText,
                                            selectedCategory === category && styles.categoryChipTextActive,
                                        ]}
                                    >
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Active Filters Display */}
                    {(selectedIndustry !== 'All' || selectedCategory !== 'All') && (
                        <View style={styles.activeFiltersContainer}>
                            <Text style={styles.activeFiltersLabel}>Active Filters:</Text>
                            <View style={styles.activeFiltersRow}>
                                {selectedIndustry !== 'All' && (
                                    <View style={styles.activeFilterBadge}>
                                        <Text style={styles.activeFilterText}>Industry: {selectedIndustry}</Text>
                                        <TouchableOpacity
                                            onPress={() => setSelectedIndustry('All')}
                                            style={styles.removeFilterButton}
                                        >
                                            <Ionicons name="close-circle" size={16} color="#64748b" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                                {selectedCategory !== 'All' && (
                                    <View style={styles.activeFilterBadge}>
                                        <Text style={styles.activeFilterText}>Category: {selectedCategory}</Text>
                                        <TouchableOpacity
                                            onPress={() => setSelectedCategory('All')}
                                            style={styles.removeFilterButton}
                                        >
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
                <Text style={styles.resultsText}>{filteredTenders.length} tenders found</Text>
                {(selectedIndustry !== 'All' || selectedCategory !== 'All') && !showFilters && (
                    <TouchableOpacity
                        style={styles.activeFiltersIndicator}
                        onPress={() => setShowFilters(true)}
                    >
                        <Ionicons name="filter" size={14} color="#2563eb" />
                        <Text style={styles.activeFiltersIndicatorText}>Filters Active</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Tenders List */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 10 }}>
                {layout === 'list' && renderListLayout()}
                {layout === 'grid' && renderGridLayout()}
                {layout === 'compact' && renderCompactLayout()}
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
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 12,
    },
    filtersContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        gap: 12,
    },
    filterRow: {
        gap: 8,
    },
    filterLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 4,
    },
    categoriesScroll: {
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    categoryChipActive: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    categoryChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
    },
    categoryChipTextActive: {
        color: '#fff',
    },
    layoutToggle: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 4,
        gap: 4,
    },
    sortBy: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
    },
    layoutButton: {
        padding: 8,
        borderRadius: 6,
    },
    layoutButtonActive: {
        backgroundColor: '#eff6ff',
    },
    resultsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    resultsText: {
        fontSize: 14,
        color: '#64748b',
    },
    activeFiltersIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eff6ff',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    activeFiltersIndicatorText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2563eb',
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
    tendersContainer: {
        paddingHorizontal: 10,
    },
    tenderCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    cardImage: {
        width: '100%',
        height: 180,
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    cardHeaderLeft: {
        flex: 1,
        marginRight: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    cardOrganization: {
        fontSize: 13,
        color: '#64748b',
    },
    urgentBadgeSmall: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardDescription: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    cardStats: {
        flexDirection: 'row',
        gap: 16,
    },
    cardStatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    cardStatText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
    },
    cardTagsContainer: {
        flexDirection: 'row',
        gap: 6,
    },
    industryTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: '#f0f9ff',
    },
    industryTagText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#0284c7',
    },
    categoryTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: '#f1f5f9',
    },
    categoryTagText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#475569',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        gap: 12,
    },
    gridCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    gridImage: {
        width: '100%',
        height: 120,
    },
    gridImagePlaceholder: {
        width: '100%',
        height: 120,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gridContent: {
        padding: 12,
    },
    gridTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
        minHeight: 40,
    },
    gridOrganization: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 8,
    },
    gridFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    gridFooterLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    gridBudget: {
        fontSize: 13,
        fontWeight: '600',
        color: '#10b981',
    },
    gridIndustryTag: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: '#f0f9ff',
    },
    gridIndustryText: {
        fontSize: 9,
        fontWeight: '600',
        color: '#0284c7',
    },
    urgentDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
    },
    compactContainer: {
        paddingHorizontal: 20,
    },
    compactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    compactLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    compactIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#eff6ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    compactInfo: {
        flex: 1,
    },
    compactTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 2,
    },
    compactOrganization: {
        fontSize: 12,
        color: '#64748b',
    },
    compactRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    compactRightInfo: {
        alignItems: 'flex-end',
        gap: 4,
    },
    compactBudget: {
        fontSize: 13,
        fontWeight: '600',
        color: '#10b981',
    },
    compactIndustryTag: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: '#f0f9ff',
    },
    compactIndustryText: {
        fontSize: 9,
        fontWeight: '600',
        color: '#0284c7',
    },
    urgentDotSmall: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#ef4444',
    },
    bottomPadding: {
        height: 40,
    },
});

