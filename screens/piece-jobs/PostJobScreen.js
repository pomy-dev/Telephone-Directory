"use client"

import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    Image,
    Platform,
    StatusBar,
    ActivityIndicator,
} from "react-native"
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from "@expo/vector-icons"
import * as Location from "expo-location"
import { CustomToast } from "../../components/customToast";
import SecondaryNav from "../../components/SecondaryNav"
import { AuthContext } from "../../context/authProvider";
import { uploadImages } from '../../service/uploadFiles';
import { submitGig } from "../../service/Supabase-Fuctions";
import { supabase } from '../../service/Supabase-Client';

const CATEGORIES = ["Moving", "Cleaning", "Groundsman", "LandScaping", "Delivery", "Gardening", "Pet Care", "Tech"]
const STEPS = ["Job Details", "Description", "Photos", "Contacts"]

const PostGigScreen = ({ navigation }) => {
    const { user } = React.useContext(AuthContext)
    const [step, setStep] = useState(0)

    // Form fields
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("")
    const [price, setPrice] = useState("")
    const [phone, setPhone] = useState("")
    const [location, setLocation] = useState({
        address: "",
        latitude: "",
        longitude: "",
    })
    const [locationLoading, setLocationLoading] = useState(false)
    const [requirements, setRequirements] = useState([])
    const [newRequirement, setNewRequirement] = useState("")
    const [images, setImages] = useState([])
    const [uploading, setUploading] = useState(false)

    // Errors
    const [errors, setErrors] = useState({})

    const validateCurrentStep = () => {
        const newErrors = {}
        if (!user || user === null) {
            Alert.alert("Not Logged In", "It seems you are not logged in. Please log in to post a gig.")
        }
        if (step === 0) {
            if (!title.trim()) newErrors.title = "Job title is required"
        }
        if (step === 1) {
            if (!description.trim()) newErrors.description = "Description is required"
            if (!category) newErrors.category = "Please select a category"
            if (!price.trim() || isNaN(Number(price))) newErrors.price = "Valid budget (R) is required"
        }
        if (step === 3) {
            if (!phone.trim()) newErrors.phone = "Phone number is required"
            if (!location.address.trim()) newErrors.location = "Local address is required"
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const nextStep = () => {
        if (validateCurrentStep()) {
            if (step < STEPS.length - 1) setStep(step + 1)
            else handlePostGig()
        }
    }

    const prevStep = () => {
        if (step > 0) setStep(step - 1)
    }

    const addRequirement = () => {
        if (newRequirement.trim() === "") return
        setRequirements([...requirements, newRequirement.trim()])
        setNewRequirement("")
    }

    const removeRequirement = (index) => {
        setRequirements(requirements.filter((_, i) => i !== index))
    }

    const pickImages = async () => {
        try {
            setUploading(true)
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsMultipleSelection: true,
                quality: 0.8,
                mediaTypes: ['videos', 'images'],
            });
            if (!result.canceled) {
                const newImgs = result.assets.map(asset => ({
                    id: asset.assetId || Date.now(),
                    uri: asset.uri,
                }));
                if ((newImgs.length + images.length) > 8) {
                    Alert.alert("Limit Exceeded", "You can only upload up to 8 photos.")
                } else {
                    setImages([...images, ...newImgs]);
                }
            }
        } catch (e) {
            console.log(e.message)
        } finally {
            setUploading(false)
        }
    }

    const removeImage = (id) => {
        setImages(images.filter(img => img.id !== id))
    }

    const fetchCurrentLocation = async () => {
        setLocationLoading(true)
        try {
            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== "granted") {
                Alert.alert("Permission Denied", "Location access is required to auto-fill your location.")
                return
            }

            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            })

            setLocation({
                ...location,
                latitude: loc.coords.latitude.toFixed(6),
                longitude: loc.coords.longitude.toFixed(6),
            })
        } catch (error) {
            console.error(error)
            Alert.alert("Error", "Could not fetch location. Please try again or enter manually.")
        } finally {
            setLocationLoading(false)
        }
    }

    useEffect(() => {
        if (step === 3 && !location) {
            fetchCurrentLocation()
        }
    }, [step])

    const handlePostGig = async () => {
        if (!validateCurrentStep()) return

        try {
            setUploading(true)
            const imagesUpload = await uploadImages('piece-jobs', 'gig-images', images)
            const imageUrls = imagesUpload.map(img => img.url)

            const jobData = {
                title,
                description,
                category,
                price: Number(price),
                postedBy: { name: user?.displayName.trim(), phone: phone?.trim(), email: user?.email.trim() },
                locationSpot: location || { latitude: "", longitude: "" },
                requirements,
                photos: imageUrls,
                status: "open"
            }

            const { success, data } = await submitGig(jobData);

            if (success)
                CustomToast("Success👍", "Your gig has been posted!")
            else
                throw new Error("Failed to post gig")
            
        } catch (err) {
            console.error("Error posting job:", err)
            Alert.alert("Error", "There was an error posting your gig. Please try again.")
        } finally {
            setStep(0)
            setTitle("")
            setDescription("")
            setCategory("")
            setPrice("")
            setPhone("")
            setLocation({ address: "", latitude: "", longitude: "" })
            setRequirements([])
            setImages([])
            setErrors({})
            setUploading(false)
        }
    }

    const renderStepContent = () => {
        switch (step) {
            case 0:
                return (
                    <>
                        <Text style={styles.label}>Job Title *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Help Moving Furniture"
                            value={title}
                            onChangeText={setTitle}
                            placeholderTextColor="#999"
                        />
                        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

                        {/* add and remove requirements */}
                        <Text style={[styles.label, { marginTop: 28 }]}>Requirements (optional)</Text>
                        <Text style={styles.helperText}>
                            List specific needs (e.g., "Need own bakkie", "Must arrive before 10am", "2 strong helpers")
                        </Text>

                        <View style={styles.requirementInputRow}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginRight: 12 }]}
                                placeholder="Add a requirement..."
                                value={newRequirement}
                                onChangeText={setNewRequirement}
                                onSubmitEditing={addRequirement}
                                returnKeyType="done"
                                placeholderTextColor="#999"
                            />
                            <TouchableOpacity
                                style={[
                                    styles.addRequirementButton,
                                    newRequirement.trim() === "" && styles.addRequirementButtonDisabled,
                                ]}
                                onPress={addRequirement}
                                disabled={newRequirement.trim() === ""}
                            >
                                <Text style={styles.addRequirementButtonText}>Add</Text>
                            </TouchableOpacity>
                        </View>

                        {requirements.length > 0 && (
                            <View style={styles.requirementsList}>
                                {requirements.map((req, index) => (
                                    <View key={index} style={styles.requirementChip}>
                                        <Text style={styles.requirementChipText}>{req}</Text>
                                        <TouchableOpacity
                                            onPress={() => removeRequirement(index)}
                                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                                        >
                                            <Ionicons name="close-circle" size={20} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}
                    </>
                )

            case 1:
                return (
                    <>
                        <Text style={styles.label}>Description *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Describe what you need help with, include details..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            placeholderTextColor="#999"
                        />
                        {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

                        <Text style={[styles.label, { marginTop: 24 }]}>Category *</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                            {CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                                    onPress={() => setCategory(cat)}
                                >
                                    <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

                        <Text style={[styles.label, { marginTop: 16 }]}>Budget (R) *</Text>
                        <View style={styles.priceInputContainer}>
                            <Text style={styles.currencySymbol}>R</Text>
                            <TextInput
                                style={styles.priceInput}
                                placeholder="0"
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="numeric"
                                placeholderTextColor="#999"
                            />
                        </View>
                        {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
                    </>
                )

            case 2:
                return (
                    <>
                        <Text style={styles.label}>Add Photos (optional, up to 8)</Text>
                        <Text style={styles.helperText}>
                            This may help bring clear view about the nature of the gig to potential helpers.
                        </Text>
                        {images.length > 0 ? (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.imagePreviewScroll}
                                contentContainerStyle={styles.imagePreviewContainer}
                            >
                                {images.map((img, index) => (
                                    <View key={index} style={styles.imagePreviewWrapper}>
                                        <Image
                                            source={{ uri: img.uri }}
                                            style={styles.imagePreview}
                                            resizeMode="cover"
                                        />
                                        <TouchableOpacity
                                            style={styles.removeImageButton}
                                            onPress={() => removeImage(img.id)}
                                        >
                                            <Ionicons name="close-circle" size={28} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                ))}

                                {/* Add more button inside scroll when < 8 */}
                                {images.length < 8 && (
                                    <TouchableOpacity
                                        style={styles.addMoreButton}
                                        onPress={pickImages}
                                        disabled={uploading}
                                    >
                                        {uploading ? (
                                            <ActivityIndicator color="#000" />
                                        ) : (
                                            <>
                                                <Ionicons name="add" size={32} color="#666" />
                                                <Text style={styles.addMoreText}>Add</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                )}
                            </ScrollView>
                        ) : (
                            /* Empty state */
                            <TouchableOpacity
                                style={styles.imageUploadPlaceholder}
                                onPress={pickImages}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <ActivityIndicator size="large" color="#000" />
                                ) : (
                                    <>
                                        <Ionicons name="images-outline" size={48} color="#999" />
                                        <Text style={styles.placeholderText}>Tap to add photos</Text>
                                        <Text style={styles.placeholderSubText}>Up to 8 photos • Max 10MB each</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}

                        {/* Always show "Add more" button below when we have images but < 8 */}
                        {images.length > 0 && images.length < 8 && (
                            <TouchableOpacity
                                style={[styles.addMoreSmallButton, { marginTop: 16 }]}
                                onPress={pickImages}
                                disabled={uploading}
                            >
                                <Ionicons name="add-circle-outline" size={20} color="#000" />
                                <Text style={styles.addMoreSmallText}>Add more photos</Text>
                            </TouchableOpacity>
                        )}
                    </>
                )

            case 3:
                return (
                    <>
                        <Text style={styles.label}>Phone Number *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. +268 1234 5678"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            placeholderTextColor="#999"
                        />
                        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

                        <Text style={[styles.label, { marginTop: 24 }]}>Local Address *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Manzini nearby"
                            value={location.address}
                            onChangeText={(text) => setLocation(prev => ({ ...prev, address: text }))}
                            keyboardType="default"
                            placeholderTextColor="#999"
                        />
                        {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}

                        <View style={styles.locationSection}>
                            <Text style={styles.label}>Location</Text>
                            {locationLoading ? (
                                <ActivityIndicator size="small" color="#000" />
                            ) : location ? (
                                <Text style={styles.locationText}>
                                    {location.latitude}, {location.longitude}
                                </Text>
                            ) : (
                                <Text style={styles.locationText}>Not fetched yet</Text>
                            )}
                            <TouchableOpacity onPress={fetchCurrentLocation} disabled={locationLoading}>
                                <Text style={styles.retryText}>Refresh location</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle" size={20} color="#3b82f6" />
                            <Text style={styles.infoText}>
                                Your location helps service providers find you easier. It's automatically added when permitted.
                            </Text>
                        </View>
                    </>
                )

            default:
                return null
        }
    }

    return (
        <View style={styles.container}>
            <SecondaryNav title="Post a Gig" onBackPress={() => navigation.goBack()} />

            {/* Progress Stepper */}
            <View style={styles.stepper}>
                {STEPS.map((s, index) => (
                    <View key={s} style={styles.stepItem}>
                        <View style={[styles.stepCircle, index <= step && styles.stepCircleActive]}>
                            <Text style={[styles.stepNumber, index <= step && styles.stepNumberActive]}>
                                {index + 1}
                            </Text>
                        </View>
                        <Text style={[styles.stepLabel, index <= step && styles.stepLabelActive]}>{s}</Text>
                    </View>
                ))}
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.form}>
                    {renderStepContent()}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.buttonRow}>
                    {step > 0 && (
                        <TouchableOpacity style={styles.backButton} onPress={prevStep}>
                            <Text style={styles.backButtonText}>Back</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                        <Text style={styles.nextButtonText}>
                            {step === STEPS.length - 1 ? "Post Gig" : "Next"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 30 },
    content: { flex: 1 },
    form: { padding: 20 },

    stepper: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    stepItem: { alignItems: "center", flex: 1 },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#e0e0e0",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 6,
    },
    stepCircleActive: { backgroundColor: "#000" },
    stepNumber: { color: "#666", fontWeight: "600" },
    stepNumberActive: { color: "#fff" },
    stepLabel: { fontSize: 12, color: "#666", textAlign: "center" },
    stepLabelActive: { color: "#000", fontWeight: "600" },

    label: { fontSize: 16, fontWeight: "600", color: "#000", marginBottom: 8 },
    input: {
        borderWidth: 1,
        borderColor: "#d0d0d0",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        backgroundColor: "#fafafa",
    },
    textArea: { height: 140, paddingTop: 14 },
    categoriesScroll: { marginTop: 8 },
    categoryChip: {
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 24,
        backgroundColor: "#f5f5f5",
        marginRight: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    categoryChipActive: { backgroundColor: "#000", borderColor: "#000" },
    categoryChipText: { fontSize: 15, fontWeight: "500", color: "#555" },
    categoryChipTextActive: { color: "#fff" },

    priceInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#d0d0d0",
        borderRadius: 12,
        paddingHorizontal: 16,
        backgroundColor: "#fafafa",
    },
    currencySymbol: { fontSize: 20, fontWeight: "700", color: "#000", marginRight: 10 },
    priceInput: { flex: 1, paddingVertical: 14, fontSize: 18 },

    imageButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#d0d0d0",
        borderStyle: "dashed",
        borderRadius: 12,
        paddingVertical: 24,
        marginTop: 24,
        gap: 10,
    },
    imageButtonText: { fontSize: 16, fontWeight: "500", color: "#555" },

    locationSection: { marginTop: 20, marginBottom: 16 },
    locationText: { fontSize: 16, color: "#333", marginVertical: 8 },
    retryText: { color: "#3b82f6", fontWeight: "500", marginTop: 4 },

    infoBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f0f7ff",
        padding: 14,
        borderRadius: 12,
        gap: 12,
        marginTop: 16,
    },
    infoText: { flex: 1, fontSize: 14, color: "#2563eb", lineHeight: 20 },

    helperText: {
        fontSize: 13,
        color: "#666",
        marginBottom: 12,
        lineHeight: 18,
    },
    requirementInputRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    addRequirementButton: {
        backgroundColor: "#000",
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 12,
    },
    addRequirementButtonDisabled: {
        backgroundColor: "#d0d0d0",
    },
    addRequirementButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 15,
    },
    requirementsList: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 8,
        gap: 10,
    },
    requirementChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f1f1f1",
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    requirementChipText: {
        fontSize: 14,
        color: "#333",
        maxWidth: 220, // prevents very long items from breaking layout
    },

    imageUploadPlaceholder: {
        height: 160,
        borderWidth: 2,
        borderColor: "#d0d0d0",
        borderStyle: "dashed",
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        marginTop: 12,
    },
    placeholderText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#555",
        marginTop: 12,
    },
    placeholderSubText: {
        fontSize: 13,
        color: "#888",
        marginTop: 4,
    },

    imagePreviewScroll: {
        marginTop: 16,
        height: 140,
    },
    imagePreviewContainer: {
        paddingTop: 6,
        paddingRight: 16,
    },
    imagePreviewWrapper: {
        marginRight: 12,
        position: "relative",
    },
    imagePreview: {
        width: 120,
        height: 120,
        borderRadius: 12,
        backgroundColor: "#eee",
    },
    removeImageButton: {
        position: "absolute",
        top: -8,
        right: -8,
        backgroundColor: "white",
        borderRadius: 14,
    },

    addMoreButton: {
        width: 120,
        height: 120,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#d0d0d0",
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
    },
    addMoreText: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
    },

    addMoreSmallButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: "#000",
        borderRadius: 12,
        alignSelf: "flex-start",
        gap: 8,
    },
    addMoreSmallText: {
        fontSize: 15,
        fontWeight: "500",
        color: "#000",
    },

    footer: {
        paddingHorizontal: 16,
        paddingVertical: 5,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
        backgroundColor: "#fff",
        marginBottom: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 0,
    },
    buttonRow: { flexDirection: "row", gap: 12 },
    backButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#d0d0d0",
        alignItems: "center",
    },
    backButtonText: { fontSize: 16, fontWeight: "600", color: "#333" },
    nextButton: {
        flex: 2,
        backgroundColor: "#000",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    nextButtonText: { fontSize: 16, fontWeight: "600", color: "#fff" },

    errorText: { color: "#ef4444", fontSize: 14, marginTop: 6 },
})

export default PostGigScreen