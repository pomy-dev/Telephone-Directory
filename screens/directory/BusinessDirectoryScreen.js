import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Linking,
    StatusBar,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SecondaryNav from '../../components/SecondaryNav'

export default function BusinessDirectoryScreen({ navigation }) {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        { id: 'all', name: 'All', icon: 'apps' },
        { id: 'retail', name: 'Retail', icon: 'cart' },
        { id: 'food', name: 'Food', icon: 'restaurant' },
        { id: 'services', name: 'Services', icon: 'construct' },
        { id: 'health', name: 'Health', icon: 'medical' },
        { id: 'tech', name: 'Tech', icon: 'laptop' },
    ];

    const businesses = [
        {
            id: 1,
            name: 'Swazi Plaza',
            category: 'Retail',
            description: 'Premier shopping destination with over 50 stores',
            phone: '+268 2404 2345',
            email: 'info@swaziplaza.co.sz',
            website: 'www.swaziplaza.co.sz',
            location: 'Mbabane, Eswatini',
            hours: 'Mon-Sat: 9AM-6PM',
            rating: 4.5,
            reviews: 234,
            image: '/placeholder.svg?height=100&width=100',
            services: ['Shopping', 'Parking', 'Food Court'],
            verified: true,
        },
        {
            id: 2,
            name: 'Nando\'s Eswatini',
            category: 'Food',
            description: 'Flame-grilled PERi-PERi chicken restaurant',
            phone: '+268 2416 1234',
            email: 'nandos@eswatini.co.sz',
            website: 'www.nandos.co.sz',
            location: 'Manzini, Eswatini',
            hours: 'Daily: 11AM-10PM',
            rating: 4.7,
            reviews: 567,
            image: '/placeholder.svg?height=100&width=100',
            services: ['Dine-in', 'Takeaway', 'Delivery'],
            verified: true,
        },
        {
            id: 3,
            name: 'MTN Eswatini',
            category: 'Tech',
            description: 'Leading telecommunications provider',
            phone: '+268 2408 5000',
            email: 'support@mtn.co.sz',
            website: 'www.mtn.co.sz',
            location: 'Mbabane, Eswatini',
            hours: 'Mon-Fri: 8AM-5PM',
            rating: 4.2,
            reviews: 890,
            image: '/placeholder.svg?height=100&width=100',
            services: ['Mobile', 'Internet', 'Business Solutions'],
            verified: true,
        },
        {
            id: 4,
            name: 'Clicks Pharmacy',
            category: 'Health',
            description: 'Healthcare and beauty retail store',
            phone: '+268 2505 1234',
            email: 'info@clicks.co.sz',
            website: 'www.clicks.co.sz',
            location: 'Mbabane, Eswatini',
            hours: 'Mon-Sat: 8AM-7PM, Sun: 9AM-5PM',
            rating: 4.6,
            reviews: 432,
            image: '/placeholder.svg?height=100&width=100',
            services: ['Pharmacy', 'Beauty', 'Health Products'],
            verified: true,
        },
    ];

    const handleCall = (phone) => {
        Linking.openURL(`tel:${phone}`);
    };

    const handleEmail = (email) => {
        Linking.openURL(`mailto:${email}`);
    };

    const handleWebsite = (website) => {
        Linking.openURL(`https://${website}`);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <SecondaryNav title="Business Directory" rightIcon="filter-outline" onRightPress={() => alert("Notifications!")} />


            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search businesses..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Categories */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContainer}
                >
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.categoryChip,
                                selectedCategory === category.name && styles.categoryChipActive,
                            ]}
                            onPress={() => setSelectedCategory(category.name)}
                        >
                            <Ionicons
                                name={category.icon}
                                size={18}
                                color={selectedCategory === category.name ? '#FFF' : '#666'}
                            />
                            <Text
                                style={[
                                    styles.categoryText,
                                    selectedCategory === category.name && styles.categoryTextActive,
                                ]}
                            >
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Businesses List */}
                <View style={styles.businessesContainer}>
                    {businesses.map((business) => (
                        <View key={business.id} style={styles.businessCard}>
                            <View style={styles.businessHeader}>
                                <Image source={{ uri: business.image }} style={styles.businessImage} />
                                <View style={styles.businessHeaderInfo}>
                                    <View style={styles.businessTitleRow}>
                                        <Text style={styles.businessName}>{business.name}</Text>
                                        {business.verified && (
                                            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                                        )}
                                    </View>
                                    <Text style={styles.businessCategory}>{business.category}</Text>
                                    <View style={styles.ratingContainer}>
                                        <Ionicons name="star" size={16} color="#FFB800" />
                                        <Text style={styles.ratingText}>{business.rating}</Text>
                                        <Text style={styles.reviewsText}>({business.reviews} reviews)</Text>
                                    </View>
                                </View>
                            </View>

                            <Text style={styles.businessDescription}>{business.description}</Text>

                            {/* Services Tags */}
                            <View style={styles.servicesContainer}>
                                {business.services.map((service, index) => (
                                    <View key={index} style={styles.serviceTag}>
                                        <Text style={styles.serviceTagText}>{service}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Contact Info */}
                            <View style={styles.contactContainer}>
                                <View style={styles.contactRow}>
                                    <Ionicons name="location" size={16} color="#666" />
                                    <Text style={styles.contactText}>{business.location}</Text>
                                </View>
                                <View style={styles.contactRow}>
                                    <Ionicons name="time" size={16} color="#666" />
                                    <Text style={styles.contactText}>{business.hours}</Text>
                                </View>
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => handleCall(business.phone)}
                                >
                                    <Ionicons name="call" size={20} color="#4CAF50" />
                                    <Text style={styles.actionButtonText}>Call</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => handleEmail(business.email)}
                                >
                                    <Ionicons name="mail" size={20} color="#2196F3" />
                                    <Text style={styles.actionButtonText}>Email</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => handleWebsite(business.website)}
                                >
                                    <Ionicons name="globe" size={20} color="#FF6B35" />
                                    <Text style={styles.actionButtonText}>Website</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#FFF',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
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
        backgroundColor: '#F5F5F5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
        backgroundColor: '#FFF',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#000',
    },
    scrollContent: {
        paddingBottom: 30,
    },
    categoriesContainer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 12,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        backgroundColor: '#FFF',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    categoryChipActive: {
        backgroundColor: '#2196F3',
    },
    categoryText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666',
    },
    categoryTextActive: {
        color: '#FFF',
    },
    businessesContainer: {
        paddingHorizontal: 20,
        gap: 16,
    },
    businessCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    businessHeader: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    businessImage: {
        width: 80,
        height: 80,
        borderRadius: 16,
        marginRight: 16,
    },
    businessHeaderInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    businessTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    businessName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    businessCategory: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    reviewsText: {
        fontSize: 13,
        color: '#999',
    },
    businessDescription: {
        fontSize: 15,
        color: '#666',
        lineHeight: 22,
        marginBottom: 16,
    },
    servicesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    serviceTag: {
        backgroundColor: '#F0F7FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    serviceTagText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2196F3',
    },
    contactContainer: {
        gap: 12,
        marginBottom: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    contactText: {
        fontSize: 14,
        color: '#666',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
});