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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SecondaryNav from '../../components/SecondaryNav';

export default function BusinessTendersScreen({ navigation }) {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['All', 'Construction', 'IT Services', 'Supplies', 'Consulting'];

    const tenders = [
        {
            id: 1,
            title: 'Road Construction Project',
            organization: 'Ministry of Public Works',
            category: 'Construction',
            budget: 'E 2,500,000',
            deadline: '2025-11-15',
            daysLeft: 12,
            description: 'Construction and rehabilitation of 15km rural road network in Manzini region.',
            requirements: ['Valid contractor license', 'Minimum 5 years experience', 'Equipment list'],
            status: 'Open',
            urgent: true,
        },
        {
            id: 2,
            title: 'IT Infrastructure Upgrade',
            organization: 'Eswatini Revenue Authority',
            category: 'IT Services',
            budget: 'E 850,000',
            deadline: '2025-11-30',
            daysLeft: 27,
            description: 'Supply and installation of network infrastructure and server equipment.',
            requirements: ['ISO certification', 'Technical proposal', 'Financial statements'],
            status: 'Open',
            urgent: false,
        },
        {
            id: 3,
            title: 'Medical Supplies Procurement',
            organization: 'Ministry of Health',
            category: 'Supplies',
            budget: 'E 1,200,000',
            deadline: '2025-11-08',
            daysLeft: 5,
            description: 'Supply of essential medical equipment and pharmaceutical supplies.',
            requirements: ['Valid pharmacy license', 'Quality certificates', 'Delivery timeline'],
            status: 'Open',
            urgent: true,
        },
        {
            id: 4,
            title: 'Financial Audit Services',
            organization: 'Eswatini Water Services',
            category: 'Consulting',
            budget: 'E 450,000',
            deadline: '2025-12-15',
            daysLeft: 42,
            description: 'External audit services for fiscal year 2024/2025.',
            requirements: ['Registered audit firm', 'Relevant experience', 'Team qualifications'],
            status: 'Open',
            urgent: false,
        },
    ];

    const filteredTenders = tenders.filter(tender => {
        const matchesCategory = selectedCategory === 'All' || tender.category === selectedCategory;
        const matchesSearch = tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tender.organization.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <SecondaryNav title="Business Tenders" rightIcon="options-outline" onRightPress={() => alert("Notifications!")} />

            {/* Header */}
            {/* <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Business Tenders</Text>
                <TouchableOpacity style={styles.filterButton}>
                    <Ionicons name="options-outline" size={24} color="#000" />
                </TouchableOpacity>
            </View> */}

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

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Categories */}
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
                        <TouchableOpacity key={tender.id} style={styles.tenderCard}>
                            {tender.urgent && (
                                <View style={styles.urgentBadge}>
                                    <Ionicons name="alert-circle" size={14} color="#fff" />
                                    <Text style={styles.urgentText}>Urgent</Text>
                                </View>
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
                                <TouchableOpacity style={styles.bookmarkButton}>
                                    <Ionicons name="bookmark-outline" size={22} color="#666" />
                                </TouchableOpacity>
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

                            <View style={styles.tenderFooter}>
                                <View style={styles.categoryTag}>
                                    <Text style={styles.categoryTagText}>{tender.category}</Text>
                                </View>
                                <TouchableOpacity style={styles.viewButton}>
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
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 50,
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
    categoriesContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
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
    categoryTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
    },
    categoryTagText: {
        fontSize: 12,
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