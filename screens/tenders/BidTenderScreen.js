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
import { mockTenders } from '../../utils/mockData';

export default function BidTenderScreen({ navigation, route }) {
    const { tenderId } = route.params;
    const tender = mockTenders.find(t => t.id === tenderId);

    const [formData, setFormData] = useState({
        companyName: '',
        companyRegistration: '',
        bidAmount: '',
        technicalProposal: '',
        financialProposal: '',
        notes: '',
    });

    const [documents, setDocuments] = useState({
        companyRegistration: null,
        taxClearance: null,
        financialStatements: null,
        insuranceCertificate: null,
        experienceCertificate: null,
        technicalProposal: null,
        financialProposal: null,
        bankGuarantee: null,
    });

    const [acknowledgments, setAcknowledgments] = useState({
        termsAccepted: false,
        informationAccurate: false,
    });

    const [errors, setErrors] = useState({});

    if (!tender) {
        return (
            <View style={styles.container}>
                <SecondaryNav title="Submit Bid" />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Tender not found</Text>
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

        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.companyRegistration.trim()) newErrors.companyRegistration = 'Company registration is required';
        if (!formData.bidAmount.trim()) newErrors.bidAmount = 'Bid amount is required';

        // Validate required documents based on tender requirements
        if (tender.bidRequirements.companyRegistration && !documents.companyRegistration) {
            newErrors.documents = 'Company registration document is required';
        }
        if (tender.bidRequirements.taxClearance && !documents.taxClearance) {
            newErrors.documents = 'Tax clearance certificate is required';
        }
        if (tender.bidRequirements.financialStatements && !documents.financialStatements) {
            newErrors.documents = 'Financial statements are required';
        }
        if (tender.bidRequirements.technicalProposal && !documents.technicalProposal) {
            newErrors.documents = 'Technical proposal is required';
        }
        if (tender.bidRequirements.financialProposal && !documents.financialProposal) {
            newErrors.documents = 'Financial proposal is required';
        }
        if (tender.bidRequirements.insuranceCertificate && !documents.insuranceCertificate) {
            newErrors.documents = 'Insurance certificate is required';
        }
        if (tender.bidRequirements.bankGuarantee && !documents.bankGuarantee) {
            newErrors.documents = 'Bank guarantee is required';
        }

        if (!acknowledgments.termsAccepted) {
            newErrors.terms = 'You must accept the terms and conditions';
        }
        if (!acknowledgments.informationAccurate) {
            newErrors.terms = 'You must confirm that information is accurate';
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
            'Bid Submitted',
            'Your bid has been submitted successfully. You will be notified of the outcome.',
            [
                {
                    text: 'OK',
                    onPress: () => navigation.navigate('MyBidsScreen'),
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
                                <Text style={styles.documentName} numberOfLines={1}>
                                    {hasDocument.name}
                                </Text>
                                <Text style={styles.documentSize}>
                                    {(hasDocument.size / 1024).toFixed(2)} KB
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => removeDocument(documentType)}
                        >
                            <Ionicons name="close-circle" size={24} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={() => pickDocument(documentType)}
                    >
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
            <SecondaryNav title="Submit Bid" />

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                {/* Tender Info */}
                <View style={styles.tenderInfoCard}>
                    <Text style={styles.tenderInfoTitle}>{tender.title}</Text>
                    <Text style={styles.tenderInfoOrg}>{tender.organization}</Text>
                    <View style={styles.tenderInfoRow}>
                        <Text style={styles.tenderInfoLabel}>Budget:</Text>
                        <Text style={styles.tenderInfoValue}>{tender.budget}</Text>
                    </View>
                    <View style={styles.tenderInfoRow}>
                        <Text style={styles.tenderInfoLabel}>Deadline:</Text>
                        <Text style={styles.tenderInfoValue}>{tender.deadline}</Text>
                    </View>
                </View>

                {/* Company Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Company Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Company Name <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, errors.companyName && styles.inputError]}
                            placeholder="Enter company name"
                            value={formData.companyName}
                            onChangeText={(value) => handleInputChange('companyName', value)}
                            placeholderTextColor="#94a3b8"
                        />
                        {errors.companyName && <Text style={styles.errorText}>{errors.companyName}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Company Registration Number <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, errors.companyRegistration && styles.inputError]}
                            placeholder="Enter registration number"
                            value={formData.companyRegistration}
                            onChangeText={(value) => handleInputChange('companyRegistration', value)}
                            placeholderTextColor="#94a3b8"
                        />
                        {errors.companyRegistration && (
                            <Text style={styles.errorText}>{errors.companyRegistration}</Text>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Bid Amount <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, errors.bidAmount && styles.inputError]}
                            placeholder="E.g., E 2,450,000"
                            value={formData.bidAmount}
                            onChangeText={(value) => handleInputChange('bidAmount', value)}
                            placeholderTextColor="#94a3b8"
                            keyboardType="numeric"
                        />
                        {errors.bidAmount && <Text style={styles.errorText}>{errors.bidAmount}</Text>}
                    </View>
                </View>

                {/* Required Documents */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Required Documents</Text>
                    <Text style={styles.sectionSubtitle}>Upload all required documents in PDF format</Text>

                    {tender.bidRequirements.companyRegistration &&
                        renderDocumentField('Company Registration', 'companyRegistration', true)}
                    {tender.bidRequirements.taxClearance &&
                        renderDocumentField('Tax Clearance Certificate', 'taxClearance', true)}
                    {tender.bidRequirements.financialStatements &&
                        renderDocumentField('Financial Statements', 'financialStatements', true)}
                    {tender.bidRequirements.insuranceCertificate &&
                        renderDocumentField('Insurance Certificate', 'insuranceCertificate', true)}
                    {tender.bidRequirements.experienceCertificate &&
                        renderDocumentField('Experience Certificate', 'experienceCertificate', true)}
                    {tender.bidRequirements.technicalProposal &&
                        renderDocumentField('Technical Proposal', 'technicalProposal', true)}
                    {tender.bidRequirements.financialProposal &&
                        renderDocumentField('Financial Proposal', 'financialProposal', true)}
                    {tender.bidRequirements.bankGuarantee &&
                        renderDocumentField('Bank Guarantee', 'bankGuarantee', true)}
                </View>

                {/* Additional Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Additional Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Notes (Optional)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Add any additional notes or comments"
                            value={formData.notes}
                            onChangeText={(value) => handleInputChange('notes', value)}
                            multiline
                            numberOfLines={4}
                            placeholderTextColor="#94a3b8"
                        />
                    </View>
                </View>

                {/* Acknowledgments */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Acknowledgments</Text>

                    <View style={styles.acknowledgmentItem}>
                        <Switch
                            value={acknowledgments.termsAccepted}
                            onValueChange={(value) =>
                                setAcknowledgments(prev => ({ ...prev, termsAccepted: value }))
                            }
                            trackColor={{ false: '#e2e8f0', true: '#2563eb' }}
                            thumbColor="#fff"
                        />
                        <View style={styles.acknowledgmentContent}>
                            <Text style={styles.acknowledgmentText}>
                                I accept the terms and conditions of this tender
                            </Text>
                        </View>
                    </View>

                    <View style={styles.acknowledgmentItem}>
                        <Switch
                            value={acknowledgments.informationAccurate}
                            onValueChange={(value) =>
                                setAcknowledgments(prev => ({ ...prev, informationAccurate: value }))
                            }
                            trackColor={{ false: '#e2e8f0', true: '#2563eb' }}
                            thumbColor="#fff"
                        />
                        <View style={styles.acknowledgmentContent}>
                            <Text style={styles.acknowledgmentText}>
                                I confirm that all information provided is accurate and complete
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
                    <Text style={styles.submitButtonText}>Submit Bid</Text>
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
    tenderInfoCard: {
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
    tenderInfoTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 8,
    },
    tenderInfoOrg: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 12,
    },
    tenderInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    tenderInfoLabel: {
        fontSize: 14,
        color: '#64748b',
    },
    tenderInfoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
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

