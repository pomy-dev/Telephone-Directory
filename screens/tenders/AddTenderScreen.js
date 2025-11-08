import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StatusBar,
    Platform,
    Image,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import SecondaryNav from '../../components/SecondaryNav';
import { allIndustries } from '../../utils/mockData';

export default function AddTenderScreen({ navigation }) {
    const [tenderType, setTenderType] = useState('both'); // 'poster', 'details', 'both'
    const [formData, setFormData] = useState({
        title: '',
        organization: '',
        industry: '',
        industrySearch: '',
        category: '',
        description: '',
        detailedDescription: '',
        budget: '',
        deadline: '',
        deadlineTime: '',
        location: '',
        enquiryEmail: '',
        enquiryPhone: '',
        requirements: '',
    });
    const [posterImage, setPosterImage] = useState(null);
    const [errors, setErrors] = useState({});

    const categories = ['Construction', 'IT Services', 'Supplies', 'Consulting', 'Energy', 'Healthcare', 'Education', 'Transportation'];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setPosterImage(result.assets[0].uri);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (tenderType === 'poster' && !posterImage) {
            newErrors.poster = 'Please upload a poster image';
        }

        if (tenderType === 'details' || tenderType === 'both') {
            if (!formData.title.trim()) newErrors.title = 'Title is required';
            if (!formData.organization.trim()) newErrors.organization = 'Organization is required';
            if (!formData.industry) newErrors.industry = 'Industry is required';
            if (!formData.category) newErrors.category = 'Category is required';
            if (!formData.description.trim()) newErrors.description = 'Description is required';
            if (!formData.budget.trim()) newErrors.budget = 'Budget is required';
            if (!formData.deadline.trim()) newErrors.deadline = 'Deadline is required';
            if (!formData.location.trim()) newErrors.location = 'Location is required';
            if (!formData.enquiryEmail.trim()) newErrors.enquiryEmail = 'Enquiry email is required';
            if (formData.enquiryEmail && !/\S+@\S+\.\S+/.test(formData.enquiryEmail)) {
                newErrors.enquiryEmail = 'Invalid email format';
            }
        }

        if (tenderType === 'both' && !posterImage) {
            newErrors.poster = 'Please upload a poster image';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
            return;
        }

        // Here you would submit to your backend
        Alert.alert(
            'Success',
            'Tender submitted successfully!',
            [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SecondaryNav title="Add New Tender" />

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                {/* Tender Type Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tender Type</Text>
                    <View style={styles.typeContainer}>
                        <TouchableOpacity
                            style={[styles.typeOption, tenderType === 'poster' && styles.typeOptionActive]}
                            onPress={() => setTenderType('poster')}
                        >
                            <Ionicons
                                name="image-outline"
                                size={24}
                                color={tenderType === 'poster' ? '#2563eb' : '#64748b'}
                            />
                            <Text style={[styles.typeText, tenderType === 'poster' && styles.typeTextActive]}>
                                Poster Only
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.typeOption, tenderType === 'details' && styles.typeOptionActive]}
                            onPress={() => setTenderType('details')}
                        >
                            <Ionicons
                                name="document-text-outline"
                                size={24}
                                color={tenderType === 'details' ? '#2563eb' : '#64748b'}
                            />
                            <Text style={[styles.typeText, tenderType === 'details' && styles.typeTextActive]}>
                                Details Only
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.typeOption, tenderType === 'both' && styles.typeOptionActive]}
                            onPress={() => setTenderType('both')}
                        >
                            <Ionicons
                                name="images-outline"
                                size={24}
                                color={tenderType === 'both' ? '#2563eb' : '#64748b'}
                            />
                            <Text style={[styles.typeText, tenderType === 'both' && styles.typeTextActive]}>
                                Both
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Poster Upload Section */}
                {(tenderType === 'poster' || tenderType === 'both') && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Tender Poster</Text>
                        <TouchableOpacity style={styles.imageUploadContainer} onPress={pickImage}>
                            {posterImage ? (
                                <Image source={{ uri: posterImage }} style={styles.previewImage} />
                            ) : (
                                <View style={styles.uploadPlaceholder}>
                                    <Ionicons name="image-outline" size={48} color="#94a3b8" />
                                    <Text style={styles.uploadText}>Tap to upload poster</Text>
                                    <Text style={styles.uploadSubtext}>Recommended: 16:9 ratio</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        {errors.poster && <Text style={styles.errorText}>{errors.poster}</Text>}
                    </View>
                )}

                {/* Details Form Section */}
                {(tenderType === 'details' || tenderType === 'both') && (
                    <>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Basic Information</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Title *</Text>
                                <TextInput
                                    style={[styles.input, errors.title && styles.inputError]}
                                    placeholder="Enter tender title"
                                    value={formData.title}
                                    onChangeText={(value) => handleInputChange('title', value)}
                                    placeholderTextColor="#94a3b8"
                                />
                                {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Organization *</Text>
                                <TextInput
                                    style={[styles.input, errors.organization && styles.inputError]}
                                    placeholder="Enter organization name"
                                    value={formData.organization}
                                    onChangeText={(value) => handleInputChange('organization', value)}
                                    placeholderTextColor="#94a3b8"
                                />
                                {errors.organization && <Text style={styles.errorText}>{errors.organization}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Industry *</Text>
                                <View style={styles.industrySearchContainer}>
                                    <Ionicons name="search" size={18} color="#94a3b8" style={styles.industrySearchIcon} />
                                    <TextInput
                                        style={styles.industrySearchInput}
                                        placeholder="Search industries..."
                                        placeholderTextColor="#94a3b8"
                                        onChangeText={(text) => {
                                            // Filter industries based on search
                                            handleInputChange('industrySearch', text);
                                        }}
                                    />
                                </View>
                                <View style={styles.industryContainer}>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={true}
                                        contentContainerStyle={styles.industryScroll}
                                    >
                                        {allIndustries
                                            .filter((industry) =>
                                                !formData.industrySearch ||
                                                industry.toLowerCase().includes(formData.industrySearch.toLowerCase())
                                            )
                                            .map((industry) => (
                                                <TouchableOpacity
                                                    key={industry}
                                                    style={[
                                                        styles.industryChip,
                                                        formData.industry === industry && styles.industryChipActive,
                                                    ]}
                                                    onPress={() => handleInputChange('industry', industry)}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.industryText,
                                                            formData.industry === industry && styles.industryTextActive,
                                                        ]}
                                                    >
                                                        {industry}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                    </ScrollView>
                                </View>
                                {formData.industry && (
                                    <View style={styles.selectedIndustryContainer}>
                                        <Text style={styles.selectedIndustryLabel}>Selected:</Text>
                                        <View style={styles.selectedIndustryBadge}>
                                            <Text style={styles.selectedIndustryText}>{formData.industry}</Text>
                                            <TouchableOpacity
                                                onPress={() => handleInputChange('industry', '')}
                                                style={styles.removeIndustryButton}
                                            >
                                                <Ionicons name="close-circle" size={18} color="#64748b" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                                {errors.industry && <Text style={styles.errorText}>{errors.industry}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Category *</Text>
                                <View style={styles.categoryContainer}>
                                    {categories.map((cat) => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[
                                                styles.categoryChip,
                                                formData.category === cat && styles.categoryChipActive,
                                            ]}
                                            onPress={() => handleInputChange('category', cat)}
                                        >
                                            <Text
                                                style={[
                                                    styles.categoryText,
                                                    formData.category === cat && styles.categoryTextActive,
                                                ]}
                                            >
                                                {cat}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Location *</Text>
                                <TextInput
                                    style={[styles.input, errors.location && styles.inputError]}
                                    placeholder="Enter location"
                                    value={formData.location}
                                    onChangeText={(value) => handleInputChange('location', value)}
                                    placeholderTextColor="#94a3b8"
                                />
                                {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Project Details</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Description *</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                                    placeholder="Enter brief description"
                                    value={formData.description}
                                    onChangeText={(value) => handleInputChange('description', value)}
                                    multiline
                                    numberOfLines={3}
                                    placeholderTextColor="#94a3b8"
                                />
                                {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Detailed Description</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Enter detailed description (optional)"
                                    value={formData.detailedDescription}
                                    onChangeText={(value) => handleInputChange('detailedDescription', value)}
                                    multiline
                                    numberOfLines={5}
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Budget *</Text>
                                <TextInput
                                    style={[styles.input, errors.budget && styles.inputError]}
                                    placeholder="E.g., E 2,500,000"
                                    value={formData.budget}
                                    onChangeText={(value) => handleInputChange('budget', value)}
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="numeric"
                                />
                                {errors.budget && <Text style={styles.errorText}>{errors.budget}</Text>}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Deadline & Contact</Text>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Deadline Date *</Text>
                                <TextInput
                                    style={[styles.input, errors.deadline && styles.inputError]}
                                    placeholder="YYYY-MM-DD"
                                    value={formData.deadline}
                                    onChangeText={(value) => handleInputChange('deadline', value)}
                                    placeholderTextColor="#94a3b8"
                                />
                                {errors.deadline && <Text style={styles.errorText}>{errors.deadline}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Deadline Time</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="HH:MM (e.g., 17:00)"
                                    value={formData.deadlineTime}
                                    onChangeText={(value) => handleInputChange('deadlineTime', value)}
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Enquiry Email *</Text>
                                <TextInput
                                    style={[styles.input, errors.enquiryEmail && styles.inputError]}
                                    placeholder="tenders@organization.com"
                                    value={formData.enquiryEmail}
                                    onChangeText={(value) => handleInputChange('enquiryEmail', value)}
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                {errors.enquiryEmail && <Text style={styles.errorText}>{errors.enquiryEmail}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Enquiry Phone</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="+268 2404 1234"
                                    value={formData.enquiryPhone}
                                    onChangeText={(value) => handleInputChange('enquiryPhone', value)}
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Requirements</Text>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Key Requirements</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Enter requirements (one per line)"
                                    value={formData.requirements}
                                    onChangeText={(value) => handleInputChange('requirements', value)}
                                    multiline
                                    numberOfLines={4}
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                        </View>
                    </>
                )}

                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Submit Tender</Text>
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
    typeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    typeOption: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    typeOptionActive: {
        backgroundColor: '#eff6ff',
        borderColor: '#2563eb',
    },
    typeText: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        textAlign: 'center',
    },
    typeTextActive: {
        color: '#2563eb',
    },
    imageUploadContainer: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f1f5f9',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    uploadPlaceholder: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadText: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: '600',
        color: '#475569',
    },
    uploadSubtext: {
        marginTop: 4,
        fontSize: 12,
        color: '#94a3b8',
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
    industrySearchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 12,
        height: 44,
    },
    industrySearchIcon: {
        marginRight: 8,
    },
    industrySearchInput: {
        flex: 1,
        fontSize: 14,
        color: '#000',
    },
    industryContainer: {
        marginBottom: 8,
        maxHeight: 120,
    },
    industryScroll: {
        paddingVertical: 4,
        gap: 8,
        paddingRight: 20,
    },
    industryChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginRight: 8,
    },
    industryChipActive: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    industryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    industryTextActive: {
        color: '#fff',
    },
    selectedIndustryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        gap: 8,
    },
    selectedIndustryLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
    },
    selectedIndustryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eff6ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    selectedIndustryText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2563eb',
    },
    removeIndustryButton: {
        padding: 2,
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
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
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
    categoryTextActive: {
        color: '#fff',
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

