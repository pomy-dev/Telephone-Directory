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

export default function PostLeaseItemScreen({ navigation }) {
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        subcategory: '',
        price: '',
        deposit: '',
        leaseType: 'daily',
        condition: 'Excellent',
        description: '',
        availableFrom: '',
        availableTo: '',
    });
    const [images, setImages] = useState([]);
    const [rules, setRules] = useState([]);
    const [requirements, setRequirements] = useState([]);
    const [location, setLocation] = useState({
        area: '',
        city: '',
        village: '',
        township: '',
        address: '',
    });
    const [ownerInfo, setOwnerInfo] = useState({
        name: '',
        phone: '',
        email: '',
        whatsapp: '',
    });
    const [currentRule, setCurrentRule] = useState('');
    const [currentRequirement, setCurrentRequirement] = useState('');
    const [errors, setErrors] = useState({});

    const categories = ['Electronics', 'Tools', 'Fashion', 'Appliances', 'Agriculture', 'Other'];
    const cities = ['Mbabane', 'Manzini', 'Ezulwini', 'Nhlangano', 'Siteki'];
    const villages = ['Ezulwini Valley', 'Malkerns', 'Matsapha'];
    const townships = ['Hilltop', 'Fairview', 'The Gables', 'Town Center', 'Industrial Area'];
    const leaseTypes = ['daily', 'weekly', 'monthly'];
    const conditions = ['Excellent', 'Good', 'Fair', 'Used'];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleLocationChange = (field, value) => {
        setLocation(prev => ({ ...prev, [field]: value }));
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant camera roll permissions.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.price.trim()) newErrors.price = 'Price is required';
        if (!formData.deposit.trim()) newErrors.deposit = 'Deposit is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.availableFrom.trim()) newErrors.availableFrom = 'Available from date is required';
        if (images.length === 0) newErrors.images = 'At least one image is required';
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
            'Item posted successfully!',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SecondaryNav title="Post Item for Lease" />

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                {/* Images Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Item Images *</Text>
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
                    <Text style={styles.sectionTitle}>Item Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Title *</Text>
                        <TextInput
                            style={[styles.input, errors.title && styles.inputError]}
                            placeholder="e.g., Professional Camera Equipment Set"
                            value={formData.title}
                            onChangeText={(value) => handleInputChange('title', value)}
                            placeholderTextColor="#94a3b8"
                        />
                        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Category *</Text>
                        <View style={styles.categoryContainer}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[styles.categoryChip, formData.category === cat && styles.categoryChipActive]}
                                    onPress={() => handleInputChange('category', cat)}
                                >
                                    <Text style={[styles.categoryText, formData.category === cat && styles.categoryTextActive]}>
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Subcategory</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Photography, Construction, Wedding"
                            value={formData.subcategory}
                            onChangeText={(value) => handleInputChange('subcategory', value)}
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    <View style={styles.detailsRow}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>Price (SZL) *</Text>
                            <TextInput
                                style={[styles.input, errors.price && styles.inputError]}
                                placeholder="500"
                                value={formData.price}
                                onChangeText={(value) => handleInputChange('price', value)}
                                keyboardType="numeric"
                                placeholderTextColor="#94a3b8"
                            />
                            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
                        </View>

                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Deposit (SZL) *</Text>
                            <TextInput
                                style={[styles.input, errors.deposit && styles.inputError]}
                                placeholder="2000"
                                value={formData.deposit}
                                onChangeText={(value) => handleInputChange('deposit', value)}
                                keyboardType="numeric"
                                placeholderTextColor="#94a3b8"
                            />
                            {errors.deposit && <Text style={styles.errorText}>{errors.deposit}</Text>}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Lease Type</Text>
                        <View style={styles.leaseTypeContainer}>
                            {leaseTypes.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[styles.leaseTypeChip, formData.leaseType === type && styles.leaseTypeChipActive]}
                                    onPress={() => handleInputChange('leaseType', type)}
                                >
                                    <Text style={[styles.leaseTypeText, formData.leaseType === type && styles.leaseTypeTextActive]}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Condition</Text>
                        <View style={styles.conditionContainer}>
                            {conditions.map((condition) => (
                                <TouchableOpacity
                                    key={condition}
                                    style={[styles.conditionChip, formData.condition === condition && styles.conditionChipActive]}
                                    onPress={() => handleInputChange('condition', condition)}
                                >
                                    <Text style={[styles.conditionText, formData.condition === condition && styles.conditionTextActive]}>
                                        {condition}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                            placeholder="Describe the item..."
                            value={formData.description}
                            onChangeText={(value) => handleInputChange('description', value)}
                            multiline
                            numberOfLines={4}
                            placeholderTextColor="#94a3b8"
                        />
                        {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
                    </View>

                    <View style={styles.detailsRow}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>Available From *</Text>
                            <TextInput
                                style={[styles.input, errors.availableFrom && styles.inputError]}
                                placeholder="YYYY-MM-DD"
                                value={formData.availableFrom}
                                onChangeText={(value) => handleInputChange('availableFrom', value)}
                                placeholderTextColor="#94a3b8"
                            />
                            {errors.availableFrom && <Text style={styles.errorText}>{errors.availableFrom}</Text>}
                        </View>

                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Available To</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="YYYY-MM-DD (optional)"
                                value={formData.availableTo}
                                onChangeText={(value) => handleInputChange('availableTo', value)}
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
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
                                    onPress={() => handleLocationChange('area', area)}
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
                                    onPress={() => handleLocationChange('city', city)}
                                >
                                    <Text style={[styles.locationText, location.city === city && styles.locationTextActive]}>
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
                                    style={[styles.locationChip, location.village === village && styles.locationChipActive]}
                                    onPress={() => handleLocationChange('village', village)}
                                >
                                    <Text style={[styles.locationText, location.village === village && styles.locationTextActive]}>
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
                                    style={[styles.locationChip, location.township === township && styles.locationChipActive]}
                                    onPress={() => handleLocationChange('township', township)}
                                >
                                    <Text style={[styles.locationText, location.township === township && styles.locationTextActive]}>
                                        {township}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Rules */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Rules</Text>
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

                {/* Owner Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Contact Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name *</Text>
                        <TextInput
                            style={[styles.input, errors.ownerName && styles.inputError]}
                            placeholder="Your name"
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
                    <Text style={styles.submitButtonText}>Post Item</Text>
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
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
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
        fontSize: 14,
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
    leaseTypeContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    leaseTypeChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    leaseTypeChipActive: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    leaseTypeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    leaseTypeTextActive: {
        color: '#fff',
    },
    conditionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    conditionChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    conditionChipActive: {
        backgroundColor: '#10b981',
        borderColor: '#10b981',
    },
    conditionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    conditionTextActive: {
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


