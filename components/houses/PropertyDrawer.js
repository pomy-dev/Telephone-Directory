import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList,
    TouchableOpacity,
    Dimensions,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, MessageCircle, MapPin, Bed, Bath, Maximize } from 'lucide-react-native';
import Animated, {
    FadeInDown,
    FadeInUp,
    SlideInRight,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function PropertyDrawer({ property }) {
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    if (!property) return null;

    const images =
        property.images && property.images.length > 0
            ? property.images
            : [
                'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?w=500&h=400&fit=crop',
            ];

    const handleScroll = (event) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / width);
        setActiveImageIndex(index);
    };

    return (
        <View style={styles.container}>
            <View style={styles.handle} />

            <Animated.View entering={FadeInUp.duration(300)}>
                <View style={styles.imageContainer}>
                    <FlatList
                        data={images}
                        keyExtractor={(_, index) => index.toString()}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        renderItem={({ item }) => (
                            <View style={styles.imageWrapper}>
                                <Image
                                    source={{ uri: item }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.4)']}
                                    style={styles.imageGradient}
                                />
                            </View>
                        )}
                    />

                    <View style={styles.paginationContainer}>
                        {images.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.paginationDot,
                                    index === activeImageIndex && styles.paginationDotActive,
                                ]}
                            />
                        ))}
                    </View>
                </View>
            </Animated.View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                    <Text style={styles.price}>
                        E{property.price.toLocaleString()}
                        <Text style={styles.period}> / {property.rentalPeriod}</Text>
                    </Text>
                    <Text style={styles.title}>{property.title}</Text>

                    <View style={styles.locationRow}>
                        <MapPin size={16} color="#6B7280" strokeWidth={2} />
                        <Text style={styles.location}>{property.location}</Text>
                    </View>
                </Animated.View>

                {(property.bedrooms || property.bathrooms || property.area) && (
                    <Animated.View
                        entering={SlideInRight.delay(200).duration(400)}
                        style={styles.featuresContainer}
                    >
                        {property.bedrooms && (
                            <View style={styles.featureItem}>
                                <View style={styles.featureIcon}>
                                    <Bed size={18} color="#1F2937" strokeWidth={2} />
                                </View>
                                <Text style={styles.featureText}>{property.bedrooms} Beds</Text>
                            </View>
                        )}

                        {property.bathrooms && (
                            <View style={styles.featureItem}>
                                <View style={styles.featureIcon}>
                                    <Bath size={18} color="#1F2937" strokeWidth={2} />
                                </View>
                                <Text style={styles.featureText}>
                                    {property.bathrooms} Baths
                                </Text>
                            </View>
                        )}

                        {property.area && (
                            <View style={styles.featureItem}>
                                <View style={styles.featureIcon}>
                                    <Maximize size={18} color="#1F2937" strokeWidth={2} />
                                </View>
                                <Text style={styles.featureText}>{property.area} m²</Text>
                            </View>
                        )}
                    </Animated.View>
                )}

                <View style={styles.divider} />

                <Animated.View entering={FadeInDown.delay(300).duration(400)}>
                    <Text style={styles.sectionTitle}>About this place</Text>
                    <Text style={styles.description}>{property.description}</Text>
                </Animated.View>

                <View style={styles.spacer} />
            </ScrollView>

            <Animated.View
                entering={FadeInUp.delay(400).duration(400)}
                style={styles.footer}
            >
                <LinearGradient
                    colors={['rgba(255,255,255,0)', 'rgba(255,255,255,1)']}
                    style={styles.footerGradient}
                />
                <View style={styles.contactContainer}>
                    <TouchableOpacity style={styles.callButton}>
                        <Phone size={20} color="#fff" strokeWidth={2.5} />
                        <Text style={styles.callButtonText}>Call</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.whatsappButton}>
                        <MessageCircle size={20} color="#fff" strokeWidth={2.5} />
                        <Text style={styles.whatsappButtonText}>WhatsApp</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: '92%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 8,
    },
    imageContainer: {
        position: 'relative',
    },
    imageWrapper: {
        width,
        height: 280,
    },
    image: {
        width,
        height: 280,
    },
    imageGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 100,
    },
    paginationContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 16,
        alignSelf: 'center',
        gap: 6,
    },
    paginationDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    paginationDotActive: {
        width: 20,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    price: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1F2937',
        marginTop: 20,
        marginBottom: 4,
    },
    period: {
        fontSize: 16,
        fontWeight: '400',
        color: '#6B7280',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 20,
    },
    location: {
        fontSize: 15,
        color: '#6B7280',
        fontWeight: '500',
    },
    featuresContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    featureItem: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    featureIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: '#6B7280',
        lineHeight: 24,
    },
    spacer: {
        height: 120,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 20,
    },
    footerGradient: {
        position: 'absolute',
        top: -40,
        left: 0,
        right: 0,
        height: 40,
    },
    contactContainer: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
    },
    callButton: {
        flex: 1,
        backgroundColor: '#1F2937',
        paddingVertical: 16,
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    callButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    whatsappButton: {
        flex: 1,
        backgroundColor: '#25D366',
        paddingVertical: 16,
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#25D366',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    whatsappButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
