import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StatusBar,
    Platform,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SecondaryNav from '../../components/SecondaryNav';
import { mockTenders, allIndustries } from '../../utils/mockData';

export default function BusinessTendersScreen({ navigation }) {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedIndustry, setSelectedIndustry] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const categories = ['All', 'Construction', 'IT Services', 'Supplies', 'Consulting', 'Energy', 'Healthcare'];
    const industries = ['All', ...allIndustries];

    const activeTenders = mockTenders.filter(t => t.status === 'Open');
    const filteredTenders = activeTenders.filter(tender => {
        const matchesCategory = selectedCategory === 'All' || tender.category === selectedCategory;
        const matchesIndustry = selectedIndustry === 'All' || tender.industry === selectedIndustry;
        const matchesSearch = tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tender.organization.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesIndustry && matchesSearch;
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <SecondaryNav 
                title="Business Tenders" 
                rightIcon="filter-outline"
                onRightPress={() => setShowFilters(!showFilters)}
            />

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('AddTenderScreen')}
                >
                    <Ionicons name="add-circle" size={20} color="#2563eb" />
                    <Text style={styles.actionButtonText}>Add Tender</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('PublishedTendersScreen')}
                >
                    <Ionicons name="grid-outline" size={20} color="#2563eb" />
                    <Text style={styles.actionButtonText}>Published</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('MyBidsScreen')}
                >
                    <Ionicons name="document-text-outline" size={20} color="#2563eb" />
                    <Text style={styles.actionButtonText}>My Bids</Text>
                </TouchableOpacity>
            </View>

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
                {(selectedIndustry !== 'All' || selectedCategory !== 'All') && !showFilters && (
                    <TouchableOpacity
                        style={styles.activeFiltersIndicator}
                        onPress={() => setShowFilters(true)}
                    >
                        <Ionicons name="filter" size={16} color="#2563eb" />
                        <Text style={styles.activeFiltersIndicatorText}>Filters</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Filters Section - Toggleable */}
                {showFilters && (
                    <View style={styles.filtersContainer}>
                        {/* Industries */}
                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>Industry</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.categoriesContainer}
                            >
                                {industries.slice(0, 15).map((industry) => (
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
                                                styles.categoryText,
                                                selectedIndustry === industry && styles.categoryTextActive,
                                            ]}
                                        >
                                            {industry}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Categories */}
                        <View style={styles.filterSection}>
                            <Text style={styles.filterSectionTitle}>Category</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.categoriesContainer}
                            >
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
                                                styles.categoryText,
                                                selectedCategory === category && styles.categoryTextActive,
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

                {/* Stats Banner */}
                <View style={styles.statsBanner}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{filteredTenders.length}</Text>
                        <Text style={styles.statLabel}>Active Tenders</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>
                            {filteredTenders.filter(t => t.urgent).length}
                        </Text>
                        <Text style={styles.statLabel}>Urgent</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>
                            E {(filteredTenders.reduce((sum, t) => sum + parseFloat(t.budget.replace(/[E,]/g, '')), 0) / 1000000).toFixed(1)}M
                        </Text>
                        <Text style={styles.statLabel}>Total Value</Text>
                    </View>
                </View>

                {/* Tenders List */}
                <View style={styles.tendersContainer}>
                    {filteredTenders.map((tender) => (
                        <TouchableOpacity
                            key={tender.id}
                            style={styles.tenderCard}
                            onPress={() => navigation.navigate('TenderDetailsScreen', { tenderId: tender.id })}
                        >
                            {tender.urgent && (
                                <View style={styles.urgentBadge}>
                                    <Ionicons name="alert-circle" size={14} color="#fff" />
                                    <Text style={styles.urgentText}>Urgent</Text>
                                </View>
                            )}

                            {tender.hasPoster && tender.posterUrl && (
                                <Image source={tender.posterUrl} style={styles.tenderPoster} resizeMode="cover" />
                            )}

                            <View style={styles.tenderHeader}>
                                <View style={styles.organizationBadge}>
                                    <Ionicons name="business" size={16} color="#2563eb" />
                                </View>
                                <View style={styles.tenderHeaderText}>
                                    <Text style={styles.tenderTitle} numberOfLines={2}>
                                        {tender.title}
                                    </Text>
                                    <Text style={styles.organizationName}>{tender.organization}</Text>
                                </View>
                            </View>

                            <Text style={styles.tenderDescription} numberOfLines={2}>
                                {tender.description}
                            </Text>

                            <View style={styles.tenderDetails}>
                                <View style={styles.detailItem}>
                                    <Ionicons name="cash-outline" size={18} color="#10b981" />
                                    <Text style={styles.detailText}>{tender.budget}</Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Ionicons name="calendar-outline" size={18} color="#f59e0b" />
                                    <Text style={styles.detailText}>{tender.daysLeft} days left</Text>
                                </View>
                            </View>

                            {tender.requirements && tender.requirements.length > 0 && (
                                <View style={styles.requirementsContainer}>
                                    <Text style={styles.requirementsLabel}>Key Requirements:</Text>
                                    <View style={styles.requirementsList}>
                                        {tender.requirements.slice(0, 2).map((req, index) => (
                                            <View key={index} style={styles.requirementItem}>
                                                <View style={styles.requirementDot} />
                                                <Text style={styles.requirementText} numberOfLines={1}>
                                                    {req}
                                                </Text>
                                            </View>
                                        ))}
                                        {tender.requirements.length > 2 && (
                                            <Text style={styles.moreRequirements}>
                                                +{tender.requirements.length - 2} more
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            )}

                            <View style={styles.tenderFooter}>
                                <View style={styles.tagsContainer}>
                                    <View style={styles.industryTag}>
                                        <Text style={styles.industryTagText}>{tender.industry}</Text>
                                    </View>
                                    <View style={styles.categoryTag}>
                                        <Text style={styles.categoryTagText}>{tender.category}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={styles.viewButton}
                                    onPress={() => navigation.navigate('TenderDetailsScreen', { tenderId: tender.id })}
                                >
                                    <Text style={styles.viewButtonText}>View Details</Text>
                                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                                </TouchableOpacity>
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
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2563eb',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#fff',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
    },
    filterButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
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
    categoriesContainer: {
        paddingHorizontal: 20,
        paddingBottom: 12,
        gap: 10,
    },
    categoryChip: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#fff',
        marginRight: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
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
    statsBanner: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#e2e8f0',
        marginHorizontal: 10,
    },
    tendersContainer: {
        paddingHorizontal: 20,
    },
    tenderCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        overflow: 'hidden',
    },
    tenderPoster: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        marginBottom: 12,
    },
    urgentBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ef4444',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    urgentText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    tenderHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    organizationBadge: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#eff6ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    tenderHeaderText: {
        flex: 1,
    },
    tenderTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    organizationName: {
        fontSize: 13,
        color: '#64748b',
    },
    bookmarkButton: {
        padding: 4,
    },
    tenderDescription: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        marginBottom: 16,
    },
    tenderDetails: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
    },
    requirementsContainer: {
        marginBottom: 16,
    },
    requirementsLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 8,
    },
    requirementsList: {
        gap: 6,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    requirementDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#2563eb',
    },
    requirementText: {
        fontSize: 13,
        color: '#475569',
        flex: 1,
    },
    moreRequirements: {
        fontSize: 12,
        color: '#2563eb',
        fontWeight: '600',
        marginLeft: 12,
    },
    tenderFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    tagsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    industryTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: '#f0f9ff',
    },
    industryTagText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#0284c7',
    },
    categoryTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
    },
    categoryTagText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#475569',
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2563eb',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        gap: 6,
    },
    viewButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    bottomPadding: {
        height: 20,
    },
});