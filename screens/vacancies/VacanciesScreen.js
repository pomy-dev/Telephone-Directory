import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StatusBar,
    Linking,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SecondaryNav from '../../components/SecondaryNav';

export default function VacanciesScreen({ navigation }) {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = ['All', 'Design', 'Technology', 'Finance', 'Marketing'];

    const vacancies = [
        {
            id: 1,
            title: 'UI/UX Designer',
            company: 'Ngwane Tech Solutions',
            logo: '🟢',
            location: 'Mbabane, Eswatini',
            salary: 'E 18,000 - E 25,000',
            period: '/month',
            type: 'Full-Time',
            mode: 'Hybrid',
            category: 'Design',
            posted: '2 days ago',
            expires: '2025-11-20',
            daysLeft: 17,
            description:
                'We are looking for a talented UI/UX Designer to create clean, user-friendly interfaces for our clients across Eswatini.',
            requirements: ['3+ years experience', 'Figma or Adobe XD', 'Portfolio required'],
            responsibilities: ['Design user interfaces', 'Create prototypes', 'Conduct user testing'],
            applyLink: 'https://ngwanetech.co.sz/careers',
            featured: true,
        },
        {
            id: 2,
            title: 'Senior Software Engineer',
            company: 'Lourie Technologies',
            logo: '💻',
            location: 'Manzini, Eswatini',
            salary: 'E 30,000 - E 45,000',
            period: '/month',
            type: 'Full-Time',
            mode: 'Remote',
            category: 'Technology',
            posted: '1 week ago',
            expires: '2025-11-15',
            daysLeft: 12,
            description:
                'Join our local engineering team to build modern web and mobile applications for municipalities and enterprises in Eswatini.',
            requirements: ['5+ years experience', 'React or React Native', 'Node.js and MongoDB'],
            responsibilities: ['Develop scalable apps', 'API integrations', 'Mentor junior developers'],
            applyLink: 'https://lourietechnologies.co.sz/apply',
            featured: false,
        },
        {
            id: 3,
            title: 'Financial Analyst',
            company: 'EswatiniBank',
            logo: '💰',
            location: 'Mbabane, Eswatini',
            salary: 'E 20,000 - E 30,000',
            period: '/month',
            type: 'Full-Time',
            mode: 'Onsite',
            category: 'Finance',
            posted: '3 days ago',
            expires: '2025-11-25',
            daysLeft: 22,
            description:
                'We are seeking a Financial Analyst to evaluate financial data and provide insights for decision-making.',
            requirements: ['Bachelor in Finance or Accounting', 'Strong Excel skills', '2+ years experience'],
            responsibilities: ['Prepare reports', 'Analyze budgets', 'Assess risks'],
            applyLink: 'https://eswatinibank.co.sz/careers',
            featured: false,
        },
        {
            id: 4,
            title: 'Digital Marketing Manager',
            company: 'MTN Eswatini',
            logo: '🟡',
            location: 'Mbabane, Eswatini',
            salary: 'E 25,000 - E 40,000',
            period: '/month',
            type: 'Full-Time',
            mode: 'Hybrid',
            category: 'Marketing',
            posted: '5 days ago',
            expires: '2025-11-10',
            daysLeft: 7,
            description:
                'Lead MTN Eswatini’s digital marketing campaigns and grow our online presence through data-driven strategies.',
            requirements: ['Marketing degree', 'SEO/SEM experience', 'Analytics skills'],
            responsibilities: ['Manage campaigns', 'Oversee social media', 'Track performance metrics'],
            applyLink: 'https://mtn.co.sz/careers',
            featured: true,
        },
        {
            id: 5,
            title: 'Graphic Designer',
            company: 'PromoConnect Eswatini',
            logo: '🎨',
            location: 'Manzini, Eswatini',
            salary: 'E 12,000 - E 18,000',
            period: '/month',
            type: 'Full-Time',
            mode: 'Onsite',
            category: 'Design',
            posted: '4 days ago',
            expires: '2025-11-18',
            daysLeft: 15,
            description:
                'We’re seeking a creative graphic designer to work on marketing materials, social media posts, and brand visuals.',
            requirements: ['2+ years experience', 'Proficiency in Photoshop or Illustrator', 'Creative portfolio'],
            responsibilities: ['Design marketing visuals', 'Edit product images', 'Collaborate with marketing team'],
            applyLink: 'https://promoconnect.co.sz/apply',
            featured: false,
        },
    ];


    const filteredVacancies = vacancies.filter(vacancy => {
        const matchesCategory = selectedCategory === 'All' || vacancy.category === selectedCategory;
        const matchesSearch = vacancy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vacancy.company.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleApply = (url) => {
        Linking.openURL(url);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SecondaryNav title="Job Vacancies" rightIcon="options-outline" onRightPress={() => alert("Notifications!")} />


            {/* Header
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Job Vacancies</Text>
                <TouchableOpacity style={styles.filterButton}>
                    <Ionicons name="options-outline" size={24} color="#000" />
                </TouchableOpacity>
            </View> */}

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search for a job or company"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Featured Banner */}
                <View style={styles.featuredBanner}>
                    <View style={styles.bannerContent}>
                        <Text style={styles.bannerTitle}>See how you can{'\n'}find a job quickly!</Text>
                        <TouchableOpacity style={styles.readMoreButton}>
                            <Text style={styles.readMoreText}>Read more</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.bannerImage}>
                        <Text style={styles.bannerEmoji}>👩‍💼</Text>
                    </View>
                </View>

                {/* Categories */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recommendation</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                </View>

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

                {/* Vacancies List */}
                <View style={styles.vacanciesContainer}>
                    {filteredVacancies.map((vacancy) => (
                        <TouchableOpacity key={vacancy.id} style={styles.vacancyCard}>
                            <View style={styles.vacancyHeader}>
                                <View style={styles.companyLogo}>
                                    <Text style={styles.logoText}>{vacancy.logo}</Text>
                                </View>
                                <View style={styles.vacancyHeaderText}>
                                    <Text style={styles.vacancyTitle}>{vacancy.title}</Text>
                                    <Text style={styles.companyName}>{vacancy.company}</Text>
                                </View>
                                <TouchableOpacity style={styles.bookmarkButton}>
                                    <Ionicons name="bookmark-outline" size={22} color="#2563eb" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.locationContainer}>
                                <Ionicons name="location-outline" size={16} color="#64748b" />
                                <Text style={styles.locationText}>{vacancy.location}</Text>
                            </View>

                            <View style={styles.salaryContainer}>
                                <Text style={styles.salaryAmount}>{vacancy.salary}</Text>
                                <Text style={styles.salaryPeriod}>{vacancy.period}</Text>
                            </View>

                            <View style={styles.tagsContainer}>
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>{vacancy.type}</Text>
                                </View>
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>{vacancy.mode}</Text>
                                </View>
                                {vacancy.daysLeft <= 7 && (
                                    <View style={[styles.tag, styles.urgentTag]}>
                                        <Ionicons name="time-outline" size={12} color="#ef4444" />
                                        <Text style={styles.urgentTagText}>{vacancy.daysLeft} days left</Text>
                                    </View>
                                )}
                            </View>

                            <Text style={styles.vacancyDescription} numberOfLines={2}>
                                {vacancy.description}
                            </Text>

                            <View style={styles.vacancyFooter}>
                                <View style={styles.postedInfo}>
                                    <Ionicons name="time-outline" size={14} color="#94a3b8" />
                                    <Text style={styles.postedText}>{vacancy.posted}</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.applyButton}
                                    onPress={() => handleApply(vacancy.applyLink)}
                                >
                                    <Text style={styles.applyButtonText}>Apply Now</Text>
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
    featuredBanner: {
        flexDirection: 'row',
        backgroundColor: '#3b82f6',
        marginHorizontal: 20,
        marginBottom: 24,
        padding: 20,
        borderRadius: 16,
        overflow: 'hidden',
    },
    bannerContent: {
        flex: 1,
        justifyContent: 'center',
    },
    bannerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 12,
        lineHeight: 24,
    },
    readMoreButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    readMoreText: {
        color: '#3b82f6',
        fontSize: 14,
        fontWeight: '600',
    },
    bannerImage: {
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bannerEmoji: {
        fontSize: 60,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3b82f6',
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
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    categoryChipActive: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    categoryTextActive: {
        color: '#fff',
    },
    vacanciesContainer: {
        paddingHorizontal: 20,
    },
    vacancyCard: {
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
    vacancyHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    companyLogo: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    logoText: {
        fontSize: 28,
    },
    vacancyHeaderText: {
        flex: 1,
        justifyContent: 'center',
    },
    vacancyTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    companyName: {
        fontSize: 14,
        color: '#64748b',
    },
    bookmarkButton: {
        padding: 4,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 6,
    },
    locationText: {
        fontSize: 14,
        color: '#64748b',
    },
    salaryContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    salaryAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#3b82f6',
    },
    salaryPeriod: {
        fontSize: 14,
        color: '#64748b',
        marginLeft: 4,
    },
    tagsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#eff6ff',
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#3b82f6',
    },
    urgentTag: {
        backgroundColor: '#fef2f2',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    urgentTagText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ef4444',
    },
    vacancyDescription: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        marginBottom: 16,
    },
    vacancyFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    postedInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    postedText: {
        fontSize: 13,
        color: '#94a3b8',
    },
    applyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3b82f6',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        gap: 6,
    },
    applyButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    bottomPadding: {
        height: 20,
    },
});