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
    Alert,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import SecondaryNav from '../../components/SecondaryNav';
import { mockRentalHouses } from '../../utils/mockData';

export default function ApplyRentalScreen({ navigation, route }) {
    const { houseId } = route.params;
    const house = mockRentalHouses.find(h => h.id === houseId);

    const [formData, setFormData] = useState({
        applicantName: '',
        applicantEmail: '',
        applicantPhone: '',
        moveInDate: '',
        duration: '',
        notes: '',
    });

    const [documents, setDocuments] = useState({
        employmentLetter: null,
        idCopy: null,
        references: null,
        creditCheck: null,
    });

    const [acknowledgments, setAcknowledgments] = useState({
        termsAccepted: false,
        informationAccurate: false,
    });

    const [errors, setErrors] = useState({});

    if (!house) {
        return (
            <View style={styles.container}>
                <SecondaryNav title="Apply for Rental" />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>House not found</Text>
                </View>
            </View>
        );
    }

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const pickDocument = async (documentType) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            if (result.assets && result.assets.length > 0) {
                setDocuments(prev => ({
                    ...prev,
                    [documentType]: {
                        uri: result.assets[0].uri,
                        name: result.assets[0].name,
                        size: result.assets[0].size,
                    },
                }));
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const removeDocument = (documentType) => {
        setDocuments(prev => ({ ...prev, [documentType]: null }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.applicantName.trim()) newErrors.applicantName = 'Name is required';
        if (!formData.applicantEmail.trim()) newErrors.applicantEmail = 'Email is required';
        if (formData.applicantEmail && !/\S+@\S+\.\S+/.test(formData.applicantEmail)) {
            newErrors.applicantEmail = 'Invalid email format';
        }
        if (!formData.applicantPhone.trim()) newErrors.applicantPhone = 'Phone is required';
        if (!formData.moveInDate.trim()) newErrors.moveInDate = 'Move-in date is required';
        if (!formData.duration.trim()) newErrors.duration = 'Duration is required';

        // Check required documents
        if (house.requirements.some(r => r.toLowerCase().includes('employment')) && !documents.employmentLetter) {
            newErrors.documents = 'Employment letter is required';
        }
        if (house.requirements.some(r => r.toLowerCase().includes('id')) && !documents.idCopy) {
            newErrors.documents = 'ID copy is required';
        }

        if (!acknowledgments.termsAccepted) {
            newErrors.terms = 'You must accept the terms';
        }
        if (!acknowledgments.informationAccurate) {
            newErrors.terms = 'You must confirm information is accurate';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            Alert.alert('Validation Error', 'Please fill in all required fields and upload required documents.');
            return;
        }

        Alert.alert(
            'Application Submitted',
            'Your application has been submitted successfully. The landlord will review it and contact you soon.',
            [
                {
                    text: 'OK',
                    onPress: () => navigation.navigate('MyRentalApplicationsScreen'),
                },
            ]
        );
    };

    const renderDocumentField = (label, documentType, isRequired = false) => {
        const hasDocument = documents[documentType];
        return (
            <View style={styles.documentField}>
                <View style={styles.documentLabelRow}>
                    <Text style={styles.documentLabel}>
                        {label} {isRequired && <Text style={styles.required}>*</Text>}
                    </Text>
                </View>
                {hasDocument ? (
                    <View style={styles.documentItem}>
                        <View style={styles.documentInfo}>
                            <Ionicons name="document-text" size={20} color="#2563eb" />
                            <View style={styles.documentDetails}>
                                <Text style={styles.documentName} numberOfLines={1}>{hasDocument.name}</Text>
                                <Text style={styles.documentSize}>{(hasDocument.size / 1024).toFixed(2)} KB</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.removeButton} onPress={() => removeDocument(documentType)}>
                            <Ionicons name="close-circle" size={24} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.uploadButton} onPress={() => pickDocument(documentType)}>
                        <Ionicons name="cloud-upload-outline" size={20} color="#2563eb" />
                        <Text style={styles.uploadButtonText}>Upload PDF</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SecondaryNav title="Apply for Rental" />

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                {/* House Info */}
                <View style={styles.houseInfoCard}>
                    <Text style={styles.houseInfoTitle}>{house.title}</Text>
                    <Text style={styles.houseInfoAddress}>{house.address}</Text>
                    <View style={styles.houseInfoRow}>
                        <Text style={styles.houseInfoLabel}>Rent:</Text>
                        <Text style={styles.houseInfoValue}>E {house.price.toLocaleString()}/month</Text>
                    </View>
                </View>

                {/* Applicant Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Full Name <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, errors.applicantName && styles.inputError]}
                            placeholder="Enter your full name"
                            value={formData.applicantName}
                            onChangeText={(value) => handleInputChange('applicantName', value)}
                            placeholderTextColor="#94a3b8"
                        />
                        {errors.applicantName && <Text style={styles.errorText}>{errors.applicantName}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Email <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, errors.applicantEmail && styles.inputError]}
                            placeholder="your.email@example.com"
                            value={formData.applicantEmail}
                            onChangeText={(value) => handleInputChange('applicantEmail', value)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#94a3b8"
                        />
                        {errors.applicantEmail && <Text style={styles.errorText}>{errors.applicantEmail}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Phone <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, errors.applicantPhone && styles.inputError]}
                            placeholder="+268 2404 1234"
                            value={formData.applicantPhone}
                            onChangeText={(value) => handleInputChange('applicantPhone', value)}
                            keyboardType="phone-pad"
                            placeholderTextColor="#94a3b8"
                        />
                        {errors.applicantPhone && <Text style={styles.errorText}>{errors.applicantPhone}</Text>}
                    </View>
                </View>

                {/* Application Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Application Details</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Desired Move-in Date <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, errors.moveInDate && styles.inputError]}
                            placeholder="YYYY-MM-DD"
                            value={formData.moveInDate}
                            onChangeText={(value) => handleInputChange('moveInDate', value)}
                            placeholderTextColor="#94a3b8"
                        />
                        {errors.moveInDate && <Text style={styles.errorText}>{errors.moveInDate}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Lease Duration <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, errors.duration && styles.inputError]}
                            placeholder="e.g., 12 months"
                            value={formData.duration}
                            onChangeText={(value) => handleInputChange('duration', value)}
                            placeholderTextColor="#94a3b8"
                        />
                        {errors.duration && <Text style={styles.errorText}>{errors.duration}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Additional Notes</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Tell the landlord about yourself, your family, or any special requirements..."
                            value={formData.notes}
                            onChangeText={(value) => handleInputChange('notes', value)}
                            multiline
                            numberOfLines={4}
                            placeholderTextColor="#94a3b8"
                        />
                    </View>
                </View>

                {/* Required Documents */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Required Documents</Text>
                    <Text style={styles.sectionSubtitle}>Upload documents as requested by the landlord</Text>

                    {house.requirements.some(r => r.toLowerCase().includes('employment')) &&
                        renderDocumentField('Employment Letter / Proof of Income', 'employmentLetter', true)}
                    {house.requirements.some(r => r.toLowerCase().includes('id')) &&
                        renderDocumentField('ID Copy', 'idCopy', true)}
                    {house.requirements.some(r => r.toLowerCase().includes('reference')) &&
                        renderDocumentField('References', 'references', false)}
                    {house.requirements.some(r => r.toLowerCase().includes('credit')) &&
                        renderDocumentField('Credit Check', 'creditCheck', false)}
                </View>

                {/* Acknowledgments */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Acknowledgments</Text>

                    <View style={styles.acknowledgmentItem}>
                        <Switch
                            value={acknowledgments.termsAccepted}
                            onValueChange={(value) => setAcknowledgments(prev => ({ ...prev, termsAccepted: value }))}
                            trackColor={{ false: '#e2e8f0', true: '#2563eb' }}
                            thumbColor="#fff"
                        />
                        <View style={styles.acknowledgmentContent}>
                            <Text style={styles.acknowledgmentText}>
                                I accept the rental terms and conditions
                            </Text>
                        </View>
                    </View>

                    <View style={styles.acknowledgmentItem}>
                        <Switch
                            value={acknowledgments.informationAccurate}
                            onValueChange={(value) => setAcknowledgments(prev => ({ ...prev, informationAccurate: value }))}
                            trackColor={{ false: '#e2e8f0', true: '#2563eb' }}
                            thumbColor="#fff"
                        />
                        <View style={styles.acknowledgmentContent}>
                            <Text style={styles.acknowledgmentText}>
                                I confirm that all information provided is accurate
                            </Text>
                        </View>
                    </View>

                    {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}
                    {errors.documents && <Text style={styles.errorText}>{errors.documents}</Text>}
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Submit Application</Text>
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#64748b',
    },
    houseInfoCard: {
        backgroundColor: '#fff',
        margin: 20,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    houseInfoTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 8,
    },
    houseInfoAddress: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 12,
    },
    houseInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    houseInfoLabel: {
        fontSize: 14,
        color: '#64748b',
    },
    houseInfoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#10b981',
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
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 16,
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
    required: {
        color: '#ef4444',
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
    documentField: {
        marginBottom: 16,
    },
    documentLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    documentLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
    },
    documentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        padding: 12,
    },
    documentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    documentDetails: {
        marginLeft: 12,
        flex: 1,
    },
    documentName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 2,
    },
    documentSize: {
        fontSize: 12,
        color: '#64748b',
    },
    removeButton: {
        padding: 4,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#2563eb',
        borderStyle: 'dashed',
        borderRadius: 10,
        padding: 16,
        gap: 8,
    },
    uploadButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2563eb',
    },
    acknowledgmentItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
        gap: 12,
    },
    acknowledgmentContent: {
        flex: 1,
        marginTop: 2,
    },
    acknowledgmentText: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
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


