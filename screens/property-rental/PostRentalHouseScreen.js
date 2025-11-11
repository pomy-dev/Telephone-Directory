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
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import SecondaryNav from '../../components/SecondaryNav';
import { mockAreas } from '../../utils/mockData';

export default function PostRentalHouseScreen({ navigation }) {
    const [formData, setFormData] = useState({
        title: '',
        type: '',
        price: '',
        area: '',
        city: '',
        village: '',
        township: '',
        address: '',
        bedrooms: '',
        bathrooms: '',
        size: '',
        availableDate: '',
        description: '',
    });
    const [images, setImages] = useState([]);
    const [amenities, setAmenities] = useState([]);
    const [rules, setRules] = useState([]);
    const [requirements, setRequirements] = useState([]);
    const [landlordInfo, setLandlordInfo] = useState({
        name: '',
        phone: '',
        email: '',
        whatsapp: '',
    });
    const [currentRule, setCurrentRule] = useState('');
    const [currentRequirement, setCurrentRequirement] = useState('');
    const [errors, setErrors] = useState({});

    const types = ['house', 'apartment', 'room', 'flat'];
    const cities = ['Mbabane', 'Manzini', 'Ezulwini', 'Nhlangano', 'Siteki'];
    const villages = ['Ezulwini Valley', 'Malkerns', 'Matsapha'];
    const townships = ['Hilltop', 'Fairview', 'The Gables', 'Town Center', 'Industrial Area'];
    const commonAmenities = [
        'Fully Furnished', 'Semi-Furnished', 'Parking Space', 'Garden', 'Security System',
        'Water & Electricity', 'WiFi Ready', 'WiFi Included', 'Near Schools', 'Shopping Nearby',
        'Gym Access', 'Swimming Pool', 'Balcony', 'Security Guard',
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
            setImages(prev => [...prev, ...newImages].slice(0, 10)); // Max 10 images
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const toggleAmenity = (amenity) => {
        setAmenities(prev =>
            prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
        );
    };

    const addRule = () => {
        if (currentRule.trim()) {
            setRules(prev => [...prev, currentRule.trim()]);
            setCurrentRule('');
        }
    };

    const removeRule = (index) => {
        setRules(prev => prev.filter((_, i) => i !== index));
    };

    const addRequirement = () => {
        if (currentRequirement.trim()) {
            setRequirements(prev => [...prev, currentRequirement.trim()]);
            setCurrentRequirement('');
        }
    };

    const removeRequirement = (index) => {
        setRequirements(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.type) newErrors.type = 'Property type is required';
        if (!formData.price.trim()) newErrors.price = 'Price is required';
        if (!formData.area) newErrors.area = 'Area is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.bedrooms.trim()) newErrors.bedrooms = 'Number of bedrooms is required';
        if (!formData.bathrooms.trim()) newErrors.bathrooms = 'Number of bathrooms is required';
        if (!formData.size.trim()) newErrors.size = 'Size is required';
        if (!formData.availableDate.trim()) newErrors.availableDate = 'Available date is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (images.length === 0) newErrors.images = 'At least one image is required';
        if (!landlordInfo.name.trim()) newErrors.landlordName = 'Landlord name is required';
        if (!landlordInfo.phone.trim()) newErrors.landlordPhone = 'Landlord phone is required';
        if (!landlordInfo.email.trim()) newErrors.landlordEmail = 'Landlord email is required';
        if (landlordInfo.email && !/\S+@\S+\.\S+/.test(landlordInfo.email)) {
            newErrors.landlordEmail = 'Invalid email format';
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
            'Rental house posted successfully!',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SecondaryNav title="Post House To Let" />

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                {/* Images Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>House Images *</Text>
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
                    <Text style={styles.sectionTitle}>Basic Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Title *</Text>
                        <TextInput
                            style={[styles.input, errors.title && styles.inputError]}
                            placeholder="e.g., Spacious 3-Bedroom House"
                            value={formData.title}
                            onChangeText={(value) => handleInputChange('title', value)}
                            placeholderTextColor="#94a3b8"
                        />
                        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Property Type *</Text>
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
                        <Text style={styles.label}>Monthly Rent (SZL) *</Text>
                        <TextInput
                            style={[styles.input, errors.price && styles.inputError]}
                            placeholder="e.g., 4500"
                            value={formData.price}
                            onChangeText={(value) => handleInputChange('price', value)}
                            keyboardType="numeric"
                            placeholderTextColor="#94a3b8"
                        />
                        {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
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
                                    style={[styles.locationChip, formData.area === area && styles.locationChipActive]}
                                    onPress={() => handleInputChange('area', area)}
                                >
                                    <Text style={[styles.locationText, formData.area === area && styles.locationTextActive]}>
                                        {area}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {errors.area && <Text style={styles.errorText}>{errors.area}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>City</Text>
                        <View style={styles.locationContainer}>
                            {cities.map((city) => (
                                <TouchableOpacity
                                    key={city}
                                    style={[styles.locationChip, formData.city === city && styles.locationChipActive]}
                                    onPress={() => handleInputChange('city', city)}
                                >
                                    <Text style={[styles.locationText, formData.city === city && styles.locationTextActive]}>
                                        {city}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Village</Text>
                        <View style={styles.locationContainer}>
                            {villages.map((village) => (
                                <TouchableOpacity
                                    key={village}
                                    style={[styles.locationChip, formData.village === village && styles.locationChipActive]}
                                    onPress={() => handleInputChange('village', village)}
                                >
                                    <Text style={[styles.locationText, formData.village === village && styles.locationTextActive]}>
                                        {village}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Township</Text>
                        <View style={styles.locationContainer}>
                            {townships.map((township) => (
                                <TouchableOpacity
                                    key={township}
                                    style={[styles.locationChip, formData.township === township && styles.locationChipActive]}
                                    onPress={() => handleInputChange('township', township)}
                                >
                                    <Text style={[styles.locationText, formData.township === township && styles.locationTextActive]}>
                                        {township}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Address *</Text>
                        <TextInput
                            style={[styles.input, errors.address && styles.inputError]}
                            placeholder="Street address"
                            value={formData.address}
                            onChangeText={(value) => handleInputChange('address', value)}
                            placeholderTextColor="#94a3b8"
                        />
                        {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
                    </View>
                </View>

                {/* Property Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Property Details</Text>

                    <View style={styles.detailsRow}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>Bedrooms *</Text>
                            <TextInput
                                style={[styles.input, errors.bedrooms && styles.inputError]}
                                placeholder="3"
                                value={formData.bedrooms}
                                onChangeText={(value) => handleInputChange('bedrooms', value)}
                                keyboardType="numeric"
                                placeholderTextColor="#94a3b8"
                            />
                            {errors.bedrooms && <Text style={styles.errorText}>{errors.bedrooms}</Text>}
                        </View>

                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Bathrooms *</Text>
                            <TextInput
                                style={[styles.input, errors.bathrooms && styles.inputError]}
                                placeholder="2"
                                value={formData.bathrooms}
                                onChangeText={(value) => handleInputChange('bathrooms', value)}
                                keyboardType="numeric"
                                placeholderTextColor="#94a3b8"
                            />
                            {errors.bathrooms && <Text style={styles.errorText}>{errors.bathrooms}</Text>}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Size (m²) *</Text>
                        <TextInput
                            style={[styles.input, errors.size && styles.inputError]}
                            placeholder="120"
                            value={formData.size}
                            onChangeText={(value) => handleInputChange('size', value)}
                            keyboardType="numeric"
                            placeholderTextColor="#94a3b8"
                        />
                        {errors.size && <Text style={styles.errorText}>{errors.size}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Available Date *</Text>
                        <TextInput
                            style={[styles.input, errors.availableDate && styles.inputError]}
                            placeholder="YYYY-MM-DD"
                            value={formData.availableDate}
                            onChangeText={(value) => handleInputChange('availableDate', value)}
                            placeholderTextColor="#94a3b8"
                        />
                        {errors.availableDate && <Text style={styles.errorText}>{errors.availableDate}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                            placeholder="Describe the property..."
                            value={formData.description}
                            onChangeText={(value) => handleInputChange('description', value)}
                            multiline
                            numberOfLines={4}
                            placeholderTextColor="#94a3b8"
                        />
                        {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
                    </View>
                </View>

                {/* Amenities */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Amenities</Text>
                    <View style={styles.amenitiesContainer}>
                        {commonAmenities.map((amenity) => (
                            <TouchableOpacity
                                key={amenity}
                                style={[styles.amenityChip, amenities.includes(amenity) && styles.amenityChipActive]}
                                onPress={() => toggleAmenity(amenity)}
                            >
                                <Text style={[styles.amenityText, amenities.includes(amenity) && styles.amenityTextActive]}>
                                    {amenity}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Rules */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>House Rules</Text>
                    <View style={styles.addItemContainer}>
                        <TextInput
                            style={styles.addItemInput}
                            placeholder="Add a rule..."
                            value={currentRule}
                            onChangeText={setCurrentRule}
                            placeholderTextColor="#94a3b8"
                        />
                        <TouchableOpacity style={styles.addItemButton} onPress={addRule}>
                            <Ionicons name="add-circle" size={24} color="#2563eb" />
                        </TouchableOpacity>
                    </View>
                    {rules.map((rule, index) => (
                        <View key={index} style={styles.listItem}>
                            <Text style={styles.listItemText}>{rule}</Text>
                            <TouchableOpacity onPress={() => removeRule(index)}>
                                <Ionicons name="close-circle" size={20} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Requirements */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Requirements</Text>
                    <View style={styles.addItemContainer}>
                        <TextInput
                            style={styles.addItemInput}
                            placeholder="Add a requirement..."
                            value={currentRequirement}
                            onChangeText={setCurrentRequirement}
                            placeholderTextColor="#94a3b8"
                        />
                        <TouchableOpacity style={styles.addItemButton} onPress={addRequirement}>
                            <Ionicons name="add-circle" size={24} color="#2563eb" />
                        </TouchableOpacity>
                    </View>
                    {requirements.map((req, index) => (
                        <View key={index} style={styles.listItem}>
                            <Text style={styles.listItemText}>{req}</Text>
                            <TouchableOpacity onPress={() => removeRequirement(index)}>
                                <Ionicons name="close-circle" size={20} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Landlord Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Landlord Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name *</Text>
                        <TextInput
                            style={[styles.input, errors.landlordName && styles.inputError]}
                            placeholder="Landlord name"
                            value={landlordInfo.name}
                            onChangeText={(value) => setLandlordInfo(prev => ({ ...prev, name: value }))}
                            placeholderTextColor="#94a3b8"
                        />
                        {errors.landlordName && <Text style={styles.errorText}>{errors.landlordName}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone *</Text>
                        <TextInput
                            style={[styles.input, errors.landlordPhone && styles.inputError]}
                            placeholder="+268 2404 1234"
                            value={landlordInfo.phone}
                            onChangeText={(value) => setLandlordInfo(prev => ({ ...prev, phone: value }))}
                            keyboardType="phone-pad"
                            placeholderTextColor="#94a3b8"
                        />
                        {errors.landlordPhone && <Text style={styles.errorText}>{errors.landlordPhone}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email *</Text>
                        <TextInput
                            style={[styles.input, errors.landlordEmail && styles.inputError]}
                            placeholder="landlord@email.com"
                            value={landlordInfo.email}
                            onChangeText={(value) => setLandlordInfo(prev => ({ ...prev, email: value }))}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#94a3b8"
                        />
                        {errors.landlordEmail && <Text style={styles.errorText}>{errors.landlordEmail}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>WhatsApp</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="+268 2404 1234"
                            value={landlordInfo.whatsapp}
                            onChangeText={(value) => setLandlordInfo(prev => ({ ...prev, whatsapp: value }))}
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
                    <Text style={styles.submitButtonText}>Post House</Text>
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
        marginHorizontal: 10,
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
    detailsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    amenitiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    amenityChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    amenityChipActive: {
        backgroundColor: '#eff6ff',
        borderColor: '#2563eb',
    },
    amenityText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
    amenityTextActive: {
        color: '#2563eb',
    },
    addItemContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    addItemInput: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        color: '#000',
    },
    addItemButton: {
        padding: 8,
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    listItemText: {
        flex: 1,
        fontSize: 14,
        color: '#475569',
    },
    footer: {
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        marginBottom: 40
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


