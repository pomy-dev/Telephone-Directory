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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SecondaryNav from '../../components/SecondaryNav';
import { mockRentalApplications, mockRentalHouses } from '../../utils/mockData';

export default function MyRentalApplicationsScreen({ navigation }) {
    const [selectedFilter, setSelectedFilter] = useState('All');

    const filters = ['All', 'Pending', 'Under Review', 'Approved', 'Rejected'];

    const filteredApplications = mockRentalApplications.filter(app => {
        if (selectedFilter === 'All') return true;
        return app.status === selectedFilter.toLowerCase().replace(' ', '_');
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return '#3b82f6';
            case 'under_review':
                return '#f59e0b';
            case 'approved':
                return '#10b981';
            case 'rejected':
                return '#ef4444';
            default:
                return '#64748b';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return 'time-outline';
            case 'under_review':
                return 'eye-outline';
            case 'approved':
                return 'checkmark-circle';
            case 'rejected':
                return 'close-circle';
            default:
                return 'ellipse-outline';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getHouseImage = (houseId) => {
        const house = mockRentalHouses.find(h => h.id === houseId);
        return house ? house.images[0] : 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800';
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SecondaryNav title="My Applications" />

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                >
                    {filters.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
                            onPress={() => setSelectedFilter(filter)}
                        >
                            <Text
                                style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}
                            >
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Stats Summary */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{mockRentalApplications.length}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                        {mockRentalApplications.filter(a => a.status === 'under_review').length}
                    </Text>
                    <Text style={styles.statLabel}>Under Review</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                        {mockRentalApplications.filter(a => a.status === 'approved').length}
                    </Text>
                    <Text style={styles.statLabel}>Approved</Text>
                </View>
            </View>

            {/* Applications List */}
            <ScrollView showsVerticalScrollIndicator={false}>
                {filteredApplications.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No applications found</Text>
                        <Text style={styles.emptySubtext}>
                            {selectedFilter === 'All'
                                ? 'You haven\'t submitted any applications yet'
                                : `You don't have any ${selectedFilter.toLowerCase()} applications`}
                        </Text>
                        <TouchableOpacity
                            style={styles.browseButton}
                            onPress={() => navigation.navigate('PropertyScreen')}
                        >
                            <Text style={styles.browseButtonText}>Browse Houses</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.applicationsContainer}>
                        {filteredApplications.map((app) => (
                            <TouchableOpacity
                                key={app.id}
                                style={styles.applicationCard}
                                onPress={() =>
                                    navigation.navigate('RentalHouseDetailsScreen', { houseId: app.houseId })
                                }
                            >
                                <Image
                                    source={{ uri: getHouseImage(app.houseId) }}
                                    style={styles.applicationImage}
                                    resizeMode="cover"
                                />
                                <View style={styles.applicationContent}>
                                    <View style={styles.applicationHeader}>
                                        <View style={styles.applicationHeaderLeft}>
                                            <Text style={styles.applicationTitle} numberOfLines={2}>
                                                {app.houseTitle}
                                            </Text>
                                            <Text style={styles.applicationDate}>
                                                Applied: {formatDate(app.appliedDate)}
                                            </Text>
                                        </View>
                                        <View
                                            style={[
                                                styles.statusBadge,
                                                { backgroundColor: getStatusColor(app.status) + '20' },
                                            ]}
                                        >
                                            <Ionicons
                                                name={getStatusIcon(app.status)}
                                                size={16}
                                                color={getStatusColor(app.status)}
                                            />
                                            <Text
                                                style={[styles.statusText, { color: getStatusColor(app.status) }]}
                                            >
                                                {app.status.replace('_', ' ').toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.applicationDetails}>
                                        <View style={styles.detailRow}>
                                            <Ionicons name="calendar-outline" size={16} color="#f59e0b" />
                                            <Text style={styles.detailLabel}>Move-in:</Text>
                                            <Text style={styles.detailValue}>{formatDate(app.moveInDate)}</Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <Ionicons name="time-outline" size={16} color="#3b82f6" />
                                            <Text style={styles.detailLabel}>Duration:</Text>
                                            <Text style={styles.detailValue}>{app.duration}</Text>
                                        </View>
                                    </View>

                                    {app.notes && (
                                        <View style={styles.notesContainer}>
                                            <Text style={styles.notesLabel}>Your Notes:</Text>
                                            <Text style={styles.notesText}>{app.notes}</Text>
                                        </View>
                                    )}

                                    <View style={styles.applicationFooter}>
                                        <View style={styles.documentsStatus}>
                                            <Ionicons name="document-text-outline" size={14} color="#64748b" />
                                            <Text style={styles.documentsText}>
                                                {Object.values(app.documents).filter(Boolean).length} documents uploaded
                                            </Text>
                                        </View>
                                        <TouchableOpacity style={styles.viewButton}>
                                            <Text style={styles.viewButtonText}>View Details</Text>
                                            <Ionicons name="chevron-forward" size={16} color="#2563eb" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
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
    filterContainer: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    filterScroll: {
        paddingHorizontal: 20,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: '#2563eb',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    filterTextActive: {
        color: '#fff',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
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
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#475569',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 24,
    },
    browseButton: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
    },
    browseButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    applicationsContainer: {
        padding: 20,
    },
    applicationCard: {
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
    applicationImage: {
        width: '100%',
        height: 180,
    },
    applicationContent: {
        padding: 16,
    },
    applicationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        gap: 12,
    },
    applicationHeaderLeft: {
        flex: 1,
    },
    applicationTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    applicationDate: {
        fontSize: 12,
        color: '#64748b',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    applicationDetails: {
        marginBottom: 12,
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailLabel: {
        fontSize: 13,
        color: '#64748b',
    },
    detailValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#000',
        marginLeft: 'auto',
    },
    notesContainer: {
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    notesLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 4,
    },
    notesText: {
        fontSize: 13,
        color: '#475569',
        lineHeight: 18,
    },
    applicationFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    documentsStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    documentsText: {
        fontSize: 12,
        color: '#64748b',
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2563eb',
    },
    bottomPadding: {
        height: 20,
    },
});

