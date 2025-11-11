import React, { useState, useCallback } from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    TextInput,
    Image,
    Alert,
    RefreshControl
} from 'react-native';
import { Icons } from '../../constants/Icons';
import { loadOfflineData } from '../../service/getApi';
import { CustomToast } from '../../components/customToast';
import { Images } from '../../constants/Images';
import { AppContext } from '../../context/appContext';

export default function BusinessScreen({ navigation }) {
    const { theme, selectedState, isDarkMode } = React.useContext(AppContext);
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(false)
    const [businesses, setBusinesses] = useState([]);
    const [refreshing, setRefreshing] = useState(false)

    // Business categories with appropriate icons
    const categories = [
        {
            name: "Logistics",
            icon: "cube-outline",
            color: "#4C6EF5",
        },
        {
            name: "Government",
            icon: "business-outline",
            color: "#12B886",
        },
        {
            name: "Healthcare",
            icon: "medical-outline",
            color: "#FA5252",
        },
        {
            name: "Financial",
            icon: "cash-outline",
            color: "#228BE6",
        },
        {
            name: "Education",
            icon: "school-outline",
            color: "#FD7E14",
        },
        {
            name: "Retail",
            icon: "cart-outline",
            color: "#7950F2",
        },
        {
            name: "Insurance",
            icon: "shield-checkmark-outline",
            color: "#20C997",
        },
        {
            name: "Tourism",
            icon: "airplane-outline",
            color: "#E64980",
        },
        {
            name: "Energy & Water",
            icon: "flash-outline",
            color: "#15AABF",
        },
        {
            name: "Manufacturing",
            icon: "construct-outline",
            color: "#FAB005",
        },
        {
            name: "Motoring",
            icon: "car-outline",
            color: "#BE4BDB",
        },
        {
            name: "NGO",
            icon: "people-outline",
            color: "#40C057",
        },
        {
            name: "Oil Industry",
            icon: "water-outline",
            color: "#FD7E14",
        },
        {
            name: "Professional Services",
            icon: "briefcase-outline",
            color: "#4C6EF5",
        },
        {
            name: "Estate",
            icon: "home-outline",
            color: "#FA5252",
        },
        {
            name: "Transport",
            icon: "bus-outline",
            color: "#15AABF",
        },
        {
            name: "Construction",
            icon: "hammer-outline",
            color: "#FAB005",
        },
        {
            name: "Telecommunication",
            icon: "call-outline",
            color: "#4C6EF5",
        },
        {
            name: "Agriculture",
            icon: "paw-outline",
            color: "#40C057",
        },
        {
            name: "Information Technology",
            icon: "laptop-outline",
            color: "#15AABF",
        },
    ]

    // Featured categories for the top section
    const featuredCategories = [
        {
            name: "Emergency",
            icon: "bandage-outline",
            image: Images.Emergency
        },
        {
            name: "Healthcare",
            icon: "medical-outline",
            image: Images.Healthcare
        },
        {
            name: "Government",
            icon: "business-outline",
            image: Images.Government
        },
        {
            name: "Education",
            icon: "school-outline",
            image: Images.Education
        }
    ]

    const handleCategoryPress = (category) => {
        navigation.navigate('BusinessList', { category: category.name || category })
    }

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    )

    // refresh button
    const handleRefresh = async () => {
        try {
            setLoading(true);
            const companyData = await loadOfflineData();

            // Set state with the refreshed data
            setBusinesses(companyData);

            CustomToast('Refreshed 👍', 'Categories refreshed successfully')

        } catch (err) {
            console.log(err.message);
            Alert.alert("Error", "Failed to refresh business listings");
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        handleRefresh()
        setRefreshing(false);
    }, []);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

            {/* App Title */}
            <View style={styles.titleContainer}>
                <TouchableOpacity style={styles.alphabetButton} onPress={() => { navigation.navigate('AlphabeticalList') }}>
                    <Icons.Ionicons name='arrow-back' size={24} color={theme.colors.text}
                        onPress={() => navigation.goBack()}
                    />
                </TouchableOpacity>
                <Text style={[styles.appTitle, { color: theme.colors.text }]}>Directory</Text>
                <Text style={[styles.appSubTitle, { color: theme.colors.text }]}>{selectedState}</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchWrapper, { backgroundColor: theme.colors.sub_card, borderColor: theme.colors.border }]}>
                    <Icons.Ionicons name="search-outline" size={20} color="#AAAAAA" style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search categories"
                        style={[styles.searchInput, { color: theme.colors.text }]}
                        placeholderTextColor="#AAAAAA"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        numberOfLines={1}
                    />
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.primary]}
                        tintColor="transparent"
                        progressBackgroundColor={theme.colors.card}// Background of the spinner (Android)
                    />
                }
            >
                {/* Featured Categories */}
                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Popular Categories</Text>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.featuredListContent}
                    >
                        {featuredCategories.map((category, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.featuredItem}
                                onPress={() => handleCategoryPress(category)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.featuredImageContainer}>
                                    <Image source={category.image}
                                        style={[styles.featuredImage, { objectFit: 'cover' }]}

                                    />
                                    <View style={styles.featuredOverlay}>
                                        <Icons.Ionicons name={category.icon} size={28} color="#FFFFFF" />
                                    </View>
                                </View>
                                <Text style={[styles.featuredName, { color: theme.colors.text }]}>{category.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* All Categories */}
                <View style={styles.allCategoriesContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>All Categories</Text>
                    </View>

                    <View style={styles.categoriesList}>
                        {filteredCategories.map((category, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.categoryButton}
                                onPress={() => handleCategoryPress(category)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.categoryContent}>
                                    <View style={[styles.categoryIconContainer, { backgroundColor: category.color }]}>
                                        <Icons.Ionicons name={category.icon} size={20} color="#FFFFFF" />
                                    </View>
                                    <View style={styles.categoryTextContainer}>
                                        <Text style={[styles.categoryText, { color: theme.colors.text }]}>{category.name}</Text>
                                    </View>
                                </View>
                                <View style={styles.chevronContainer}>
                                    <Icons.Ionicons name="chevron-forward" size={20} color="#AAAAAA" />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {filteredCategories.length === 0 && (
                        <View style={styles.noResultsContainer}>
                            <Icons.Ionicons name="search" size={48} color="#DDDDDD" />
                            <Text style={styles.noResultsText}>No categories found</Text>
                            <Text style={styles.noResultsSubtext}>Try a different search term</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    titleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 30,
        paddingBottom: 16,
    },
    appTitle: {
        fontSize: 28,
        fontWeight: "bold",
        letterSpacing: -0.5,
    },
    appSubTitle: {
        fontSize: 18,
        fontWeight: "200",
        letterSpacing: -0.5,
    },
    alphabetButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F8F8F8",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    alphabetButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#003366",
    },
    searchContainer: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    searchWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8F8F8",
        borderRadius: 50,
        paddingHorizontal: 16,
        paddingVertical: 5,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#333333",
        fontWeight: "400",
    },
    scrollContent: {
        paddingBottom: 30,
    },
    sectionContainer: {
        marginBottom: 28,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 10,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        letterSpacing: -0.3,
    },
    viewAllText: {
        fontSize: 14,
        color: "#003366",
        fontWeight: "500",
    },
    featuredListContent: {
        paddingLeft: 24,
        paddingRight: 16,
    },
    featuredItem: {
        width: 120,
        marginRight: 16,
    },
    featuredImageContainer: {
        width: 120,
        height: 90,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 10,
        position: 'relative',
    },
    featuredImage: {
        width: '100%',
        height: '100%',
    },
    featuredOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 51, 102, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    featuredName: {
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
    },
    allCategoriesContainer: {
        paddingBottom: 15,
    },
    categoriesList: {
        paddingHorizontal: 10,
    },
    categoryButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    categoryContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    categoryIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    categoryTextContainer: {
        flex: 1,
    },
    categoryText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333333",
        marginBottom: 4,
    },
    categoryCount: {
        fontSize: 13,
        color: "#999999",
    },
    chevronContainer: {
        width: 30,
        alignItems: 'flex-end',
    },
    noResultsContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    noResultsText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#666666",
        marginTop: 16,
    },
    noResultsSubtext: {
        fontSize: 14,
        color: "#999999",
        marginTop: 4,
    },
})
