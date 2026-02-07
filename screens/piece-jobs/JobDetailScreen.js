import {
    View, Text, StyleSheet, ScrollView, Image, Modal, Alert, ActivityIndicator,
    TouchableOpacity, StatusBar, Platform, Linking, TextInput, Dimensions, Share
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import React, { useState } from 'react'
import Carousel from 'react-native-reanimated-carousel'
import * as DocumentPicker from 'expo-document-picker'
import SecondaryNav from "../../components/SecondaryNav"
import { CustomToast } from "../../components/customToast"
import { AuthContext } from "../../context/authProvider"
import { applyForGig } from "../../service/Supabase-Fuctions"
import { AppContext } from "../../context/appContext"

const JobDetailScreen = ({ route, navigation }) => {
    const { theme, isDarkMode } = React.useContext(AppContext)
    const { user } = React.useContext(AuthContext)
    const { job } = route.params

    const [modalVisible, setModalVisible] = useState(false);
    const [phone, setPhone] = useState('');
    const [expertiseInput, setExpertiseInput] = useState('');
    const [expertises, setExpertises] = useState([]);
    const [attachments, setAttachments] = useState([]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const { width } = Dimensions.get('window');

    const handleCall = () => {
        Linking.openURL(`tel:${job?.postedBy?.phone}`);
    };

    const handleEmail = () => {
        Linking.openURL(`mailto:${job?.postedBy?.email}`);
    };

    const handleSMS = async () => {
        shareMessage = `Hello ${job?.postedBy?.name}!\n\n`;
        const smsUrl = Platform.OS === "ios"
            ? `sms:${job?.postedBy?.phone}&body=${encodeURIComponent(shareMessage)}` // iOS uses semicolon
            : `smsto:${job?.postedBy?.phone}?body=${encodeURIComponent(shareMessage)}`;
        if (await Linking.canOpenURL(smsUrl)) {
            await Linking.openURL(smsUrl);
        }
        else {
            console.log('SMS client not available for URL:', smsUrl);
            throw new Error('SMS client not available');
        }
        console.log('After sending SMS');
    };

    const pickDocuments = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
            });
            if (result) {
                setAttachments([...attachments, result?.assets[0]]);
                // console.log('Picked document:', result);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const validateForm = () => {
        let isValid = false
        if (phone.trim() !== '' && expertises.length > 0)
            isValid = true

        return isValid
    }

    const handleSubmit = async () => {
        if (!validateForm()) return CustomToast("Incomplete!", "Please fill in all required fields.")

        if (job.id == null || job.id == undefined)
            return Alert.alert("Job ID is missing")

        try {
            setIsSubmitting(true)
            // map info
            const applicationData = {
                jobId: job.id,
                user: { name: user.displayName, email: user.email, phone: phone?.trim() },
                skillSet: expertises,
                status: 'pending',
                attachments: attachments,
            }
            const response = await applyForGig(applicationData)

            if (response.success)
                CustomToast("Success!👍", "Your application has been successfully submitted.")
            else
                throw new Error("Application submission failed")

        } catch (err) {
            console.log(err)
            CustomToast("Failed!", err.message)
            throw err
        } finally {
            setIsSubmitting(false)
            setModalVisible(false)
            setPhone('')
            setExpertises([])
            setAttachments([])
        }
    }

    const handleShareJob = () => {
        const shareMessage = `Check out this quick-job:\n 
        ${job.title} for R${job.price}.
        \n\nDescription: ${job.description}
        \n\nContact: ${job.postedBy?.name}, Phone: ${job.postedBy?.phone}
        \n\nFind more gigs on Business Link app!`;

        Share.share({
            message: shareMessage,
        })
            .then((result) => console.log('Share result:', result))
            .catch((error) => console.log('Error sharing:', error));
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
            <SecondaryNav
                title="Job Details"
                rightIcon="share-social-outline"
                onRightPress={handleShareJob}
                onBackPress={() => navigation.goBack()}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Carousel
                    loop
                    width={width}
                    height={300}
                    autoPlay={true}
                    data={job.images}
                    scrollAnimationDuration={1000}
                    renderItem={({ item }) => (
                        <Image source={{ uri: item }} style={styles.image} />
                    )}
                />

                <View style={styles.detailsContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{job.title}</Text>
                        <Text style={styles.price}>R{job.price}</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{job.category}</Text>
                        </View>

                        {user.email === job.postedBy.email &&
                            <Text style={styles.metaText}>Candidates Applied: <Text style={styles.locationText}>{job?.applications}</Text></Text>
                        }
                    </View>

                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Ionicons name="person-outline" size={16} color="#666" />
                            <Text style={styles.metaText}>Posted by {job.postedBy?.name}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={16} color="#666" />
                            <Text style={styles.metaText}>{job.postedTime}</Text>
                        </View>
                    </View>

                    <View style={styles.locationRow}>
                        <Ionicons name="location" size={20} color="#ef4444" />
                        <Text style={styles.locationText}>{job.location}</Text>
                        {job.distance && <Text style={styles.distanceText}>({job.distance.toFixed(1)} km away)</Text>}
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{job.description}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Requirements</Text>
                        {job.requirements?.length > 0
                            ?
                            job.requirements.map((requirement, index) => (
                                <View key={index} style={styles.requirementItem}>
                                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                    <Text style={styles.requirementText}>{requirement}</Text>
                                </View>
                            ))
                            :
                            <View style={styles.requirementEmpty}>
                                <Ionicons name="alert-circle" size={20} color="#ef4444" />
                                <Text style={styles.requirementText}>No specific requirements listed.</Text>
                            </View>
                        }
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contact Information</Text>

                        <TouchableOpacity onPress={handleCall} style={[styles.contactButton, { backgroundColor: theme.colors.indicator }]}>
                            <Ionicons name="call-outline" size={20} color="#fff" />
                            <Text style={styles.contactButtonText}>Call {job.postedBy?.name}</Text>
                        </TouchableOpacity>

                        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                            <TouchableOpacity onPress={handleSMS}
                                style={[styles.contactButtonSecondary, { borderColor: theme.colors.disabled, flex: 1 }]}>
                                <Ionicons name="chatbubble-outline" size={20} color="#4381f3ff" />
                                <Text style={styles.contactButtonTextSecondary}>Send Message</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleEmail} style={[styles.contactButtonSecondary, { borderColor: theme.colors.disabled, flex: 1 }]}>
                                <Ionicons name="mail-outline" size={20} color="#fb2121ff" />
                                <Text style={styles.contactButtonTextSecondary}>Send Email</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
                <TouchableOpacity style={[styles.applyButton, { backgroundColor: theme.colors.primary }]} onPress={() => setModalVisible(true)}>
                    <Text style={styles.applyButtonText}>Apply for this Gig</Text>
                </TouchableOpacity>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Apply for this Gig</Text>
                        <TextInput
                            placeholder="Phone Number"
                            value={phone}
                            onChangeText={setPhone}
                            style={styles.input}
                            keyboardType="phone-pad"
                        />

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <TextInput
                                placeholder="Add Expertise"
                                value={expertiseInput}
                                onChangeText={setExpertiseInput}
                                style={[styles.input, { flex: 2 }]}
                            />
                            <TouchableOpacity onPress={() => {
                                if (expertiseInput.trim()) {
                                    setExpertises([...expertises, expertiseInput.trim()])
                                    setExpertiseInput('')
                                }
                            }} style={[styles.addButton, { flex: 1 }]}>
                                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.expertisesList}>
                            {expertises.map((exp, index) => (
                                <Text key={index} style={styles.expertiseItem}>✔️{exp}</Text>
                            ))}
                        </ScrollView>

                        <TouchableOpacity onPress={pickDocuments} style={styles.attachButton}>
                            <Text style={styles.attachButtonText}>Attach Documents</Text>
                        </TouchableOpacity>
                        <ScrollView style={styles.attachmentsList}>
                            {attachments.map((att, index) => (
                                <View key={index} style={styles.attachmentItem}>
                                    {att.mimeType && att.mimeType.startsWith('image/') ? (
                                        <Image source={{ uri: att.uri }} style={styles.attachmentImage} />
                                    ) : (
                                        <View style={styles.attachmentFile}>
                                            <Text style={styles.attachmentName}>{att.name}</Text>
                                            <Text style={styles.attachmentSize}>{att.size ? (att.size / 1024).toFixed(1) + ' KB' : ''}</Text>
                                        </View>
                                    )}
                                    <TouchableOpacity onPress={() => setAttachments(attachments.filter((_, i) => i !== index))}>
                                        <Ionicons name="close" size={20} color="red" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>

                        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                            <Text style={styles.submitButtonText}>Submit Application</Text>
                            {isSubmitting && <ActivityIndicator size={15} color="#fff" style={{ marginLeft: 10 }} />}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 30,
    },
    content: {
        flex: 1,
    },
    image: {
        width: "100%",
        height: 300,
        backgroundColor: "#f0f0f0",
    },
    detailsContainer: {
        padding: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#000",
        flex: 1,
        marginRight: 12,
    },
    price: {
        fontSize: 24,
        fontWeight: "700",
        color: "#10b981",
    },
    categoryBadge: {
        alignSelf: "flex-start",
        backgroundColor: "#f0f0f0",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginBottom: 16,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#666",
    },
    metaRow: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 12,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    metaText: {
        fontSize: 14,
        color: "#666",
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 24,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    locationText: {
        fontSize: 14,
        color: "#000",
        fontWeight: "500",
    },
    distanceText: {
        fontSize: 12,
        color: "#10b981",
        fontWeight: "600",
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: "#666",
        lineHeight: 22,
        marginBottom: 12,
    },
    requirementItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    requirementText: {
        fontSize: 14,
        color: "#666",
    },
    requirementEmpty: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginBottom: 8,
    },
    contactButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
        marginBottom: 12,
    },
    contactButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    contactButtonSecondary: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
    },
    contactButtonTextSecondary: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
    },
    footer: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderTopWidth: 1,
        marginBottom: 40
    },
    applyButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalBackdrop: {
        flex: 1,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    addButton: {
        backgroundColor: '#10b981',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    expertisesList: {
        maxHeight: 100,
        marginBottom: 10,
    },
    expertiseItem: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    attachButton: {
        backgroundColor: '#4381f3ff',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    attachButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    attachmentsList: {
        maxHeight: 150,
        marginBottom: 10,
    },
    attachmentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 5,
    },
    attachmentImage: {
        width: 50,
        height: 50,
        marginRight: 10,
    },
    attachmentFile: {
        flex: 1,
        marginRight: 10,
    },
    attachmentName: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    attachmentSize: {
        fontSize: 12,
        color: '#666',
    },
    submitButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: '#000',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
})

export default JobDetailScreen
