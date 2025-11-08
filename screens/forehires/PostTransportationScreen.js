import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Platform,
    TextInput,
    Image,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import SecondaryNav from '../../components/SecondaryNav';
import { mockAreas } from '../../utils/mockData';

export default function PostTransportationScreen({ navigation }) {
    const [formData, setFormData] = useState({
        title: '',
        type: '',
        category: '',
        make: '',
        model: '',
        year: '',
        registration: '',
        price: '',
        priceType: 'per_day',
        capacity: '',
        cargoCapacity: '',
        description: '',
        operatingStart: '08:00',
        operatingEnd: '18:00',
    });
    const [images, setImages] = useState([]);
    const [features, setFeatures] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [operatingDays, setOperatingDays] = useState([]);
    const [location, setLocation] = useState({
        area: '',
        city: '',
        address: '',
    });
    const [ownerInfo, setOwnerInfo] = useState({
        name: '',
        phone: '',
        email: '',
        whatsapp: '',
    });
    const [currentFeature, setCurrentFeature] = useState('');
    const [currentRoute, setCurrentRoute] = useState({
        origin: '',
        destination: '',
        distance: '',
        duration: '',
        price: '',
    });
    const [certifications, setCertifications] = useState({
        insurance: false,
        license: false,
        borderCrossing: false,
    });
    const [errors, setErrors] = useState({});

    const types = ['minibus', 'bus', 'van', 'truck', 'suv', 'sedan'];
    const categories = ['public_transport', 'cargo', 'passenger', 'luxury'];
    const cities = ['Mbabane', 'Manzini', 'Ezulwini', 'Nhlangano', 'Siteki'];
    const priceTypes = ['per_trip', 'per_day', 'per_hour', 'per_km'];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const commonFeatures = [
        'Air Conditioning', 'Music System', 'GPS Tracking', 'Navigation System',
        'Leather Seats', 'Sunroof', 'WiFi Available', 'Entertainment System',
        'Luggage Space', 'Experienced Driver', 'Insurance Included',
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant camera roll permissions.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
            allowsMultipleSelection: true,
        });

        if (!result.canceled && result.assets) {
            const newImages = result.assets.map(asset => asset.uri);
            setImages(prev => [...prev, ...newImages].slice(0, 10));
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const toggleFeature = (feature) => {
        setFeatures(prev =>
            prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
        );
    };

    const addCustomFeature = () => {
        if (currentFeature.trim()) {
            setFeatures(prev => [...prev, currentFeature.trim()]);
            setCurrentFeature('');
        }
    };

    const removeFeature = (index) => {
        setFeatures(prev => prev.filter((_, i) => i !== index));
    };

    const toggleDay = (day) => {
        setOperatingDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const addRoute = () => {
        if (currentRoute.origin && currentRoute.destination) {
            setRoutes(prev => [...prev, { ...currentRoute }]);
            setCurrentRoute({
                origin: '',
                destination: '',
                distance: '',
                duration: '',
                price: '',
            });
        }
    };

    const removeRoute = (index) => {
        setRoutes(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.type) newErrors.type = 'Vehicle type is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.make.trim()) newErrors.make = 'Make is required';
        if (!formData.model.trim()) newErrors.model = 'Model is required';
        if (!formData.year.trim()) newErrors.year = 'Year is required';
        if (!formData.registration.trim()) newErrors.registration = 'Registration is required';
        if (!formData.price.trim()) newErrors.price = 'Price is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (images.length === 0) newErrors.images = 'At least one image is required';
        if (operatingDays.length === 0) newErrors.operatingDays = 'At least one operating day is required';
        if (!location.area) newErrors.locationArea = 'Area is required';
        if (!ownerInfo.name.trim()) newErrors.ownerName = 'Owner name is required';
        if (!ownerInfo.phone.trim()) newErrors.ownerPhone = 'Owner phone is required';
        if (!ownerInfo.email.trim()) newErrors.ownerEmail = 'Owner email is required';
        if (ownerInfo.email && !/\S+@\S+\.\S+/.test(ownerInfo.email)) {
            newErrors.ownerEmail = 'Invalid email format';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
            return;
        }

        Alert.alert(
            'Success',
            'Transportation vehicle posted successfully!',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SecondaryNav title="Post Vehicle for Hire" />

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                {/* Images Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Vehicle Images *</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
                        {images.map((uri, index) => (
                            <View key={index} style={styles.imageWrapper}>
                                <Image source={{ uri }} style={styles.previewImage} />
                                <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                                    <Ionicons name="close-circle" size={24} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {images.length < 10 && (
                            <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                                <Ionicons name="camera-outline" size={32} color="#64748b" />
                                <Text style={styles.addImageText}>Add Photo</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                    {errors.images && <Text style={styles.errorText}>{errors.images}</Text>}
                </View>

                {/* Basic Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Vehicle Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Title *</Text>
                        <TextInput
                            style={[styles.input, errors.title && styles.inputError]}
                            placeholder="e.g., Comfortable 15-Seater Minibus"
                            value={formData.title}
                            onChangeText={(value) => handleInputChange('title', value)}
                            placeholderTextColor="#94a3b8"
                        />
                        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Vehicle Type *</Text>
                        <View style={styles.typeContainer}>
                            {types.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[styles.typeChip, formData.type === type && styles.typeChipActive]}
                                    onPress={() => handleInputChange('type', type)}
                                >
                                    <Text style={[styles.typeText, formData.type === type && styles.typeTextActive]}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Category *</Text>
                        <View style={styles.categoryContainer}>
                            {categories.map((category) => (
                                <TouchableOpacity
                                    key={category}
                                    style={[styles.categoryChip, formData.category === category && styles.categoryChipActive]}
                                    onPress={() => handleInputChange('category', category)}
                                >
                                    <Text style={[styles.categoryText, formData.category === category && styles.categoryTextActive]}>
                                        {category.replace('_', ' ').toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
                    </View>

                    <View style={styles.detailsRow}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>Make *</Text>
                            <TextInput
                                style={[styles.input, errors.make && styles.inputError]}
                                placeholder="Toyota"
                                value={formData.make}
                                onChangeText={(value) => handleInputChange('make', value)}
                                placeholderTextColor="#94a3b8"
                            />
                            {errors.make && <Text style={styles.errorText}>{errors.make}</Text>}
                        </View>

                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Model *</Text>
                            <TextInput
                                style={[styles.input, errors.model && styles.inputError]}
                                placeholder="Hiace"
                                value={formData.model}
                                onChangeText={(value) => handleInputChange('model', value)}
                                placeholderTextColor="#94a3b8"
                            />
                            {errors.model && <Text style={styles.errorText}>{errors.model}</Text>}
                        </View>
                    </View>

                    <View style={styles.detailsRow}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>Year *</Text>
                            <TextInput
                                style={[styles.input, errors.year && styles.inputError]}
                                placeholder="2020"
                                value={formData.year}
                                onChangeText={(value) => handleInputChange('year', value)}
                                keyboardType="numeric"
                                placeholderTextColor="#94a3b8"
                            />
                            {errors.year && <Text style={styles.errorText}>{errors.year}</Text>}
                        </View>

                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Registration *</Text>
                            <TextInput
                                style={[styles.input, errors.registration && styles.inputError]}
                                placeholder="SD 1234 AB"
                                value={formData.registration}
                                onChangeText={(value) => handleInputChange('registration', value)}
                                placeholderTextColor="#94a3b8"
                            />
                            {errors.registration && <Text style={styles.errorText}>{errors.registration}</Text>}
                        </View>
                    </View>

                    <View style={styles.detailsRow}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>Price (SZL) *</Text>
                            <TextInput
                                style={[styles.input, errors.price && styles.inputError]}
                                placeholder="2500"
                                value={formData.price}
                                onChangeText={(value) => handleInputChange('price', value)}
                                keyboardType="numeric"
                                placeholderTextColor="#94a3b8"
                            />
                            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
                        </View>

                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Price Type</Text>
                            <View style={styles.priceTypeContainer}>
                                {priceTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[styles.priceTypeChip, formData.priceType === type && styles.priceTypeChipActive]}
                                        onPress={() => handleInputChange('priceType', type)}
                                    >
                                        <Text style={[styles.priceTypeText, formData.priceType === type && styles.priceTypeTextActive]}>
                                            {type.replace('_', ' ')}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    <View style={styles.detailsRow}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>Capacity (Seats)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="15"
                                value={formData.capacity}
                                onChangeText={(value) => handleInputChange('capacity', value)}
                                keyboardType="numeric"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>

                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Cargo Capacity (Tons)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="10"
                                value={formData.cargoCapacity}
                                onChangeText={(value) => handleInputChange('cargoCapacity', value)}
                                keyboardType="numeric"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                            placeholder="Describe the vehicle..."
                            value={formData.description}
                            onChangeText={(value) => handleInputChange('description', value)}
                            multiline
                            numberOfLines={4}
                            placeholderTextColor="#94a3b8"
                        />
                        {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
                    </View>
                </View>

                {/* Operating Schedule */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Operating Schedule</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Operating Days *</Text>
                        <View style={styles.daysContainer}>
                            {daysOfWeek.map((day) => (
                                <TouchableOpacity
                                    key={day}
                                    style={[styles.dayChip, operatingDays.includes(day) && styles.dayChipActive]}
                                    onPress={() => toggleDay(day)}
                                >
                                    <Text style={[styles.dayText, operatingDays.includes(day) && styles.dayTextActive]}>
                                        {day.substring(0, 3)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {errors.operatingDays && <Text style={styles.errorText}>{errors.operatingDays}</Text>}
                    </View>

                    <View style={styles.detailsRow}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>Start Time</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="08:00"
                                value={formData.operatingStart}
                                onChangeText={(value) => handleInputChange('operatingStart', value)}
                                placeholderTextColor="#94a3b8"
                            />
                        </View>

                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>End Time</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="18:00"
                                value={formData.operatingEnd}
                                onChangeText={(value) => handleInputChange('operatingEnd', value)}
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                    </View>
                </View>

                {/* Routes (Optional) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Routes (Optional)</Text>
                    <View style={styles.routeForm}>
                        <View style={styles.detailsRow}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.label}>Origin</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Mbabane"
                                    value={currentRoute.origin}
                                    onChangeText={(value) => setCurrentRoute(prev => ({ ...prev, origin: value }))}
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                <Text style={styles.label}>Destination</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Johannesburg"
                                    value={currentRoute.destination}
                                    onChangeText={(value) => setCurrentRoute(prev => ({ ...prev, destination: value }))}
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                        </View>
                        <View style={styles.detailsRow}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.label}>Distance</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="350 km"
                                    value={currentRoute.distance}
                                    onChangeText={(value) => setCurrentRoute(prev => ({ ...prev, distance: value }))}
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                <Text style={styles.label}>Duration</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="4-5 hours"
                                    value={currentRoute.duration}
                                    onChangeText={(value) => setCurrentRoute(prev => ({ ...prev, duration: value }))}
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                        </View>
                        <TouchableOpacity style={styles.addRouteButton} onPress={addRoute}>
                            <Ionicons name="add-circle" size={20} color="#2563eb" />
                            <Text style={styles.addRouteButtonText}>Add Route</Text>
                        </TouchableOpacity>
                    </View>
                    {routes.map((route, index) => (
                        <View key={index} style={styles.routeItem}>
                            <View style={styles.routeItemContent}>
                                <Text style={styles.routeItemText}>{route.origin} → {route.destination}</Text>
                                <Text style={styles.routeItemSubtext}>{route.distance} • {route.duration}</Text>
                            </View>
                            <TouchableOpacity onPress={() => removeRoute(index)}>
                                <Ionicons name="close-circle" size={20} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Features */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Features</Text>
                    <View style={styles.featuresContainer}>
                        {commonFeatures.map((feature) => (
                            <TouchableOpacity
                                key={feature}
                                style={[styles.featureChip, features.includes(feature) && styles.featureChipActive]}
                                onPress={() => toggleFeature(feature)}
                            >
                                <Text style={[styles.featureText, features.includes(feature) && styles.featureTextActive]}>
                                    {feature}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.addFeatureContainer}>
                        <TextInput
                            style={styles.addFeatureInput}
                            placeholder="Add custom feature..."
                            value={currentFeature}
                            onChangeText={setCurrentFeature}
                            placeholderTextColor="#94a3b8"
                        />
                        <TouchableOpacity style={styles.addFeatureButton} onPress={addCustomFeature}>
                            <Ionicons name="add-circle" size={24} color="#2563eb" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Location */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Location</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Area *</Text>
                        <View style={styles.locationContainer}>
                            {mockAreas.map((area) => (
                                <TouchableOpacity
                                    key={area}
                                    style={[styles.locationChip, location.area === area && styles.locationChipActive]}
                                    onPress={() => setLocation(prev => ({ ...prev, area }))}
                                >
                                    <Text style={[styles.locationText, location.area === area && styles.locationTextActive]}>
                                        {area}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {errors.locationArea && <Text style={styles.errorText}>{errors.locationArea}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>City</Text>
                        <View style={styles.locationContainer}>
                            {cities.map((city) => (
                                <TouchableOpacity
                                    key={city}
                                    style={[styles.locationChip, location.city === city && styles.locationChipActive]}
                                    onPress={() => setLocation(prev => ({ ...prev, city }))}
                                >
                                    <Text style={[styles.locationText, location.city === city && styles.locationTextActive]}>
                                        {city}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Street address"
                            value={location.address}
                            onChangeText={(value) => setLocation(prev => ({ ...prev, address: value }))}
                            placeholderTextColor="#94a3b8"
                        />
                    </View>
                </View>

                {/* Certifications */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Certifications</Text>
                    <View style={styles.certificationRow}>
                        <TouchableOpacity
                            style={[styles.certificationChip, certifications.insurance && styles.certificationChipActive]}
                            onPress={() => setCertifications(prev => ({ ...prev, insurance: !prev.insurance }))}
                        >
                            <Ionicons name={certifications.insurance ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={certifications.insurance ? '#10b981' : '#64748b'} />
                            <Text style={[styles.certificationText, certifications.insurance && styles.certificationTextActive]}>
                                Fully Insured
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.certificationChip, certifications.license && styles.certificationChipActive]}
                            onPress={() => setCertifications(prev => ({ ...prev, license: !prev.license }))}
                        >
                            <Ionicons name={certifications.license ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={certifications.license ? '#10b981' : '#64748b'} />
                            <Text style={[styles.certificationText, certifications.license && styles.certificationTextActive]}>
                                Licensed
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.certificationChip, certifications.borderCrossing && styles.certificationChipActive]}
                            onPress={() => setCertifications(prev => ({ ...prev, borderCrossing: !prev.borderCrossing }))}
                        >
                            <Ionicons name={certifications.borderCrossing ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={certifications.borderCrossing ? '#10b981' : '#64748b'} />
                            <Text style={[styles.certificationText, certifications.borderCrossing && styles.certificationTextActive]}>
                                Border Crossing
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Owner Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Contact Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name *</Text>
                        <TextInput
                            style={[styles.input, errors.ownerName && styles.inputError]}
                            placeholder="Your name or company name"
                            value={ownerInfo.name}
                            onChangeText={(value) => setOwnerInfo(prev => ({ ...prev, name: value }))}
                            placeholderTextColor="#94a3b8"
                        />
                        {errors.ownerName && <Text style={styles.errorText}>{errors.ownerName}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone *</Text>
                        <TextInput
                            style={[styles.input, errors.ownerPhone && styles.inputError]}
                            placeholder="+268 2404 1234"
                            value={ownerInfo.phone}
                            onChangeText={(value) => setOwnerInfo(prev => ({ ...prev, phone: value }))}
                            keyboardType="phone-pad"
                            placeholderTextColor="#94a3b8"
                        />
                        {errors.ownerPhone && <Text style={styles.errorText}>{errors.ownerPhone}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email *</Text>
                        <TextInput
                            style={[styles.input, errors.ownerEmail && styles.inputError]}
                            placeholder="your.email@example.com"
                            value={ownerInfo.email}
                            onChangeText={(value) => setOwnerInfo(prev => ({ ...prev, email: value }))}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#94a3b8"
                        />
                        {errors.ownerEmail && <Text style={styles.errorText}>{errors.ownerEmail}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>WhatsApp</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="+268 2404 1234"
                            value={ownerInfo.whatsapp}
                            onChangeText={(value) => setOwnerInfo(prev => ({ ...prev, whatsapp: value }))}
                            keyboardType="phone-pad"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Post Vehicle</Text>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    scrollView: {
        flex: 1,
    },
    section: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 20,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 16,
    },
    imagesContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    imageWrapper: {
        position: 'relative',
    },
    previewImage: {
        width: 120,
        height: 120,
        borderRadius: 12,
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
    },
    addImageButton: {
        width: 120,
        height: 120,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    addImageText: {
        fontSize: 12,
        color: '#64748b',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        padding: 14,
        fontSize: 15,
        color: '#000',
    },
    inputError: {
        borderColor: '#ef4444',
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    errorText: {
        marginTop: 4,
        fontSize: 12,
        color: '#ef4444',
    },
    typeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    typeChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    typeChipActive: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    typeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    typeTextActive: {
        color: '#fff',
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    categoryChipActive: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
    },
    categoryTextActive: {
        color: '#fff',
    },
    detailsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    priceTypeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    priceTypeChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    priceTypeChipActive: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    priceTypeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
    },
    priceTypeTextActive: {
        color: '#fff',
    },
    daysContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    dayChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    dayChipActive: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    dayText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
    },
    dayTextActive: {
        color: '#fff',
    },
    routeForm: {
        marginBottom: 12,
    },
    addRouteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eff6ff',
        padding: 12,
        borderRadius: 10,
        gap: 6,
        marginTop: 8,
    },
    addRouteButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2563eb',
    },
    routeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    routeItemContent: {
        flex: 1,
    },
    routeItemText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 2,
    },
    routeItemSubtext: {
        fontSize: 12,
        color: '#64748b',
    },
    featuresContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    featureChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    featureChipActive: {
        backgroundColor: '#eff6ff',
        borderColor: '#2563eb',
    },
    featureText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
    featureTextActive: {
        color: '#2563eb',
    },
    addFeatureContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    addFeatureInput: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        color: '#000',
    },
    addFeatureButton: {
        padding: 8,
    },
    locationContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    locationChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    locationChipActive: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    locationText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
    locationTextActive: {
        color: '#fff',
    },
    certificationRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    certificationChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 8,
    },
    certificationChipActive: {
        backgroundColor: '#f0fdf4',
        borderColor: '#10b981',
    },
    certificationText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
    certificationTextActive: {
        color: '#10b981',
    },
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    submitButton: {
        backgroundColor: '#2563eb',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    bottomPadding: {
        height: 20,
    },
});
