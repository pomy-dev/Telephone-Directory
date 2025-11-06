import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Individual Ad Card Component
const AdCard = ({ ad, onPress, onView }) => {
    const viewedRef = useRef(false);

    useEffect(() => {
        // Track view when component mounts and is visible
        if (!viewedRef.current) {
            viewedRef.current = true;
            onView(ad.id);
        }
    }, []);

    return (
        <TouchableOpacity
            style={styles.adCard}
            onPress={() => onPress(ad)}
            activeOpacity={0.8}
        >
            <Image source={{ uri: ad.imageUrl }} style={styles.adImage} />
            <View style={styles.adContent}>
                <View style={styles.brandHeader}>
                    {ad.brandLogo && (
                        <Image source={{ uri: ad.brandLogo }} style={styles.brandLogo} />
                    )}
                    <Text style={styles.brandName}>{ad.brandName}</Text>
                </View>
                <Text style={styles.adTitle} numberOfLines={2}>
                    {ad.title}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

// Main Personalized Ads Component
const PersonalizedAdsSection = ({ ads = [], maxAdsToShow = 10 }) => {
    const [personalizedAds, setPersonalizedAds] = useState([]);
    const [userBehavior, setUserBehavior] = useState({});
    const [loading, setLoading] = useState(true);

    // Load user behavior data from storage
    useEffect(() => {
        loadUserBehavior();
    }, []);

    // Calculate personalized ads when behavior or ads change
    useEffect(() => {
        if (Object.keys(userBehavior).length > 0) {
            const sortedAds = calculatePersonalizedAds(ads, userBehavior);
            setPersonalizedAds(sortedAds.slice(0, maxAdsToShow));
            setLoading(false);
        } else {
            // Show random ads if no behavior data
            const shuffled = [...ads].sort(() => Math.random() - 0.5);
            setPersonalizedAds(shuffled.slice(0, maxAdsToShow));
            setLoading(false);
        }
    }, [ads, userBehavior, maxAdsToShow]);

    const loadUserBehavior = async () => {
        try {
            const stored = await AsyncStorage.getItem('adUserBehavior');
            if (stored) {
                setUserBehavior(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading user behavior:', error);
        }
    };

    const saveUserBehavior = async (newBehavior) => {
        try {
            await AsyncStorage.setItem('adUserBehavior', JSON.stringify(newBehavior));
        } catch (error) {
            console.error('Error saving user behavior:', error);
        }
    };

    // Track when user views an ad
    const handleAdView = (adId) => {
        setUserBehavior((prev) => {
            const updated = { ...prev };
            if (!updated[adId]) {
                updated[adId] = { views: 0, clicks: 0, lastViewed: null };
            }
            updated[adId].views += 1;
            updated[adId].lastViewed = Date.now();
            saveUserBehavior(updated);
            return updated;
        });
    };

    // Track when user clicks an ad
    const handleAdClick = (ad) => {
        setUserBehavior((prev) => {
            const updated = { ...prev };
            if (!updated[ad.id]) {
                updated[ad.id] = { views: 0, clicks: 0, lastViewed: null };
            }
            updated[ad.id].clicks += 1;
            saveUserBehavior(updated);
            return updated;
        });

        // Handle ad click action (open link, navigate, etc.)
        console.log('Ad clicked:', ad.title);
        // You can add navigation or linking logic here
    };

    // Calculate personalized ad ranking
    const calculatePersonalizedAds = (allAds, behavior) => {
        return allAds
            .map((ad) => {
                const adBehavior = behavior[ad.id] || { views: 0, clicks: 0, lastViewed: null };

                // Calculate engagement score
                const clickRate = adBehavior.views > 0 ? adBehavior.clicks / adBehavior.views : 0;
                const totalEngagement = adBehavior.views + adBehavior.clicks * 3;

                // Calculate recency score (more recent = higher score)
                const recencyScore = adBehavior.lastViewed
                    ? 1 / (1 + (Date.now() - adBehavior.lastViewed) / (1000 * 60 * 60 * 24))
                    : 0;

                // Calculate category affinity
                const categoryScore = calculateCategoryAffinity(ad.category, behavior, allAds);

                // Combined score with weights
                const score =
                    totalEngagement * 0.3 +
                    clickRate * 100 * 0.3 +
                    recencyScore * 10 * 0.2 +
                    categoryScore * 0.2;

                return { ...ad, score };
            })
            .sort((a, b) => b.score - a.score);
    };

    // Calculate user's affinity for ad categories
    const calculateCategoryAffinity = (category, behavior, allAds) => {
        const categoryEngagement = {};

        Object.keys(behavior).forEach((adId) => {
            const ad = allAds.find((a) => a.id === adId);
            if (ad && ad.category) {
                if (!categoryEngagement[ad.category]) {
                    categoryEngagement[ad.category] = 0;
                }
                categoryEngagement[ad.category] += behavior[adId].views + behavior[adId].clicks * 2;
            }
        });

        return categoryEngagement[category] || 0;
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading ads...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Suggested for you</Text>
                {/* <Text style={styles.headerSubtitle}>Sponsored</Text> */}
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {personalizedAds.map((ad) => (
                    <AdCard
                        key={ad.id}
                        ad={ad}
                        onPress={handleAdClick}
                        onView={handleAdView}
                    />
                ))}
            </ScrollView>

            <TouchableOpacity style={styles.seeMoreButton}>
                <Text style={styles.seeMoreText}>See more</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        paddingVertical: 16,
    },
    header: {
        paddingHorizontal: 24,
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#666',
    },
    scrollContent: {
        paddingHorizontal: 24,
    },
    adCard: {
        width: width * 0.45,
        marginHorizontal: 4,
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    adImage: {
        width: '100%',
        height: 160,
        backgroundColor: '#f0f0f0',
    },
    adContent: {
        paddingVertical: 10,
    },
    brandHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    brandLogo: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
    },
    brandName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0f172a',
    },
    adTitle: {
        fontSize: 13,
        color: '#333',
        // lineHeight: 18,
    },
    seeMoreButton: {
        marginHorizontal: 24,
        marginTop: 12,
        paddingVertical: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        alignItems: 'center',
    },
    seeMoreText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
    },
    loadingText: {
        textAlign: 'center',
        padding: 20,
        color: '#666',
    },
});

export default PersonalizedAdsSection;