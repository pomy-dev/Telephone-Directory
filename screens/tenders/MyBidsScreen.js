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
import { mockUserBids } from '../../utils/mockData';

export default function MyBidsScreen({ navigation }) {
    const [selectedFilter, setSelectedFilter] = useState('All'); // 'All', 'Submitted', 'Under Review', 'Accepted', 'Rejected'

    const filters = ['All', 'Submitted', 'Under Review', 'Accepted', 'Rejected'];

    const filteredBids = mockUserBids.filter(bid => {
        if (selectedFilter === 'All') return true;
        return bid.status === selectedFilter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Submitted':
                return '#3b82f6';
            case 'Under Review':
                return '#f59e0b';
            case 'Accepted':
                return '#10b981';
            case 'Rejected':
                return '#ef4444';
            default:
                return '#64748b';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Submitted':
                return 'checkmark-circle-outline';
            case 'Under Review':
                return 'time-outline';
            case 'Accepted':
                return 'checkmark-circle';
            case 'Rejected':
                return 'close-circle';
            default:
                return 'ellipse-outline';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SecondaryNav title="My Bids" />

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
                            style={[
                                styles.filterChip,
                                selectedFilter === filter && styles.filterChipActive,
                            ]}
                            onPress={() => setSelectedFilter(filter)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    selectedFilter === filter && styles.filterTextActive,
                                ]}
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
                    <Text style={styles.statNumber}>{mockUserBids.length}</Text>
                    <Text style={styles.statLabel}>Total Bids</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                        {mockUserBids.filter(b => b.status === 'Under Review').length}
                    </Text>
                    <Text style={styles.statLabel}>Under Review</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>
                        {mockUserBids.filter(b => b.status === 'Accepted').length}
                    </Text>
                    <Text style={styles.statLabel}>Accepted</Text>
                </View>
            </View>

            {/* Bids List */}
            <ScrollView showsVerticalScrollIndicator={false}>
                {filteredBids.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No bids found</Text>
                        <Text style={styles.emptySubtext}>
                            {selectedFilter === 'All'
                                ? 'You haven\'t submitted any bids yet'
                                : `You don't have any ${selectedFilter.toLowerCase()} bids`}
                        </Text>
                        <TouchableOpacity
                            style={styles.browseButton}
                            onPress={() => navigation.navigate('PublishedTendersScreen')}
                        >
                            <Text style={styles.browseButtonText}>Browse Tenders</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.bidsContainer}>
                        {filteredBids.map((bid) => (
                            <TouchableOpacity
                                key={bid.id}
                                style={styles.bidCard}
                                onPress={() =>
                                    navigation.navigate('TenderDetailsScreen', { tenderId: bid.tenderId })
                                }
                            >
                                <Image source={bid.imageUrl} style={styles.bidImage} resizeMode="cover" />
                                <View style={styles.bidContent}>
                                    <View style={styles.bidHeader}>
                                        <View style={styles.bidHeaderLeft}>
                                            <Text style={styles.bidTitle} numberOfLines={2}>
                                                {bid.tenderTitle}
                                            </Text>
                                            <Text style={styles.bidOrganization}>{bid.organization}</Text>
                                        </View>
                                        <View
                                            style={[
                                                styles.statusBadge,
                                                { backgroundColor: getStatusColor(bid.status) + '20' },
                                            ]}
                                        >
                                            <Ionicons
                                                name={getStatusIcon(bid.status)}
                                                size={16}
                                                color={getStatusColor(bid.status)}
                                            />
                                            <Text
                                                style={[
                                                    styles.statusText,
                                                    { color: getStatusColor(bid.status) },
                                                ]}
                                            >
                                                {bid.status}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.bidDetails}>
                                        <View style={styles.bidDetailItem}>
                                            <Ionicons name="cash-outline" size={16} color="#10b981" />
                                            <Text style={styles.bidDetailLabel}>Bid Amount:</Text>
                                            <Text style={styles.bidDetailValue}>{bid.bidAmount}</Text>
                                        </View>
                                        <View style={styles.bidDetailItem}>
                                            <Ionicons name="calendar-outline" size={16} color="#f59e0b" />
                                            <Text style={styles.bidDetailLabel}>Submitted:</Text>
                                            <Text style={styles.bidDetailValue}>{formatDate(bid.submittedDate)}</Text>
                                        </View>
                                        <View style={styles.bidDetailItem}>
                                            <Ionicons name="time-outline" size={16} color="#3b82f6" />
                                            <Text style={styles.bidDetailLabel}>Deadline:</Text>
                                            <Text style={styles.bidDetailValue}>{formatDate(bid.deadline)}</Text>
                                        </View>
                                    </View>

                                    {bid.rejectionReason && (
                                        <View style={styles.rejectionContainer}>
                                            <Ionicons name="information-circle" size={16} color="#ef4444" />
                                            <Text style={styles.rejectionText}>{bid.rejectionReason}</Text>
                                        </View>
                                    )}

                                    <View style={styles.bidFooter}>
                                        <View style={styles.categoryTag}>
                                            <Text style={styles.categoryTagText}>{bid.category}</Text>
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
    bidsContainer: {
        padding: 20,
    },
    bidCard: {
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
    bidImage: {
        width: '100%',
        height: 160,
    },
    bidContent: {
        padding: 16,
    },
    bidHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        gap: 12,
    },
    bidHeaderLeft: {
        flex: 1,
    },
    bidTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    bidOrganization: {
        fontSize: 13,
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
        fontSize: 12,
        fontWeight: '600',
    },
    bidDetails: {
        marginBottom: 12,
        gap: 8,
    },
    bidDetailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    bidDetailLabel: {
        fontSize: 13,
        color: '#64748b',
    },
    bidDetailValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#000',
        marginLeft: 'auto',
    },
    rejectionContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fef2f2',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        gap: 8,
    },
    rejectionText: {
        flex: 1,
        fontSize: 13,
        color: '#991b1b',
        lineHeight: 18,
    },
    bidFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
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



