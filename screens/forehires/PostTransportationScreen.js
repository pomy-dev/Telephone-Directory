import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, StatusBar, Platform, Image,
    Dimensions, Alert, ActivityIndicator, KeyboardAvoidingView
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { CustomToast } from '../../components/customToast';
import { addForhire } from '../../service/Supabase-Fuctions';
import { AppContext } from "../../context/appContext"
import * as ImagePicker from 'expo-image-picker';
import SecondaryNav from '../../components/SecondaryNav';
import { mockAreas } from '../../utils/mockData';

const TOTAL_STEPS = 6;

const { height, width } = Dimensions.get('window');

export default function PostTransportationScreen({ navigation }) {
    const { theme, isDarkMode } = React.useContext(AppContext)
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        type: '',
        category: '',
        make: '',
        model: '',
        registration: '',
        capacity: '',
        description: '',
        crossingBoarder: false,
        operatingStart: '08:00',
        operatingEnd: '18:00',
        operatingDays: [],
        routes: [],
        features: [],
        location: { area: '', city: '', address: '' },
        certifications: { insurance: false, license: false, borderCrossing: false },
        ownerInfo: { name: '', driver: '', phone: '', email: '', whatsapp: '', responsetime: '' },
        images: [],
    });

    const [currentRoute, setCurrentRoute] = useState({ origin: '', destination: '', distance: '', duration: '', price: '' });
    const [errors, setErrors] = useState({});
    const [isPickingImg, setIsPickingImg] = useState(false);
    const [isSubmiting, setIsSubmiting] = useState(false);

    const types = ['minibus', 'bus', 'van', 'truck', 'suv', 'motorcycle', 'car', 'sprinter', 'tractor', 'tower', 'schoolbus', 'staffbus', 'trailer'];
    const categories = ['public_transport', 'cargo', 'passenger', 'luxury'];
    const cities = [
        'Mbabane', 'Manzini', 'Ezulwini', 'Nhlangano', 'Siteki', 'Big Bend',
        'Malkerns', 'Mhlume', 'Hluti', 'Simunye', 'Piggs Peak', 'Lobamba', 'Lavumisa'
    ];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const commonFeatures = [
        'Air Conditioning', 'Music System', 'GPS Tracking', 'WiFi Available',
        'Leather Seats', 'Sunroof', 'Entertainment System', 'Luggage Space', 'Chair-Desk',
        'Experienced Driver', 'Insurance Included', 'Freezer', 'Toilet', 'Device-Charging'
    ];

    // Helper to update nested state
    const updateForm = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        setErrors(prev => ({ ...prev, [key]: null }));
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Needed', 'Please allow access to your photos.');
            return;
        }

        try {
            setIsPickingImg(true)
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsMultipleSelection: true,
                selectionLimit: 5,
                aspect: [4, 3],
                quality: 0.8
            });


            if (!result.canceled) {
                const newImages = result.assets.map(a => a.uri);
                updateForm('images', [...formData.images, ...newImages].slice(0, 10));
            }
        } catch (err) {
            Alert.alert('Error', err.message)
        } finally {
            setIsPickingImg(false)
        }
    };

    const removeImage = (index) => {
        updateForm('images', formData.images.filter((_, i) => i !== index));
    };

    const addRoute = () => {
        if (currentRoute.origin && currentRoute.destination) {
            updateForm('routes', [...formData.routes, { ...currentRoute }]);
            setCurrentRoute({ origin: '', destination: '', distance: '', duration: '', price: '' });
        }
    };

    const validateStep = () => {
        const newErrors = {};

        if (currentStep === 1) {
            if (formData.images.length === 0) newErrors.images = 'At least 1 photo required';
            if (!formData.type) newErrors.type = 'Vehicle type required';
            if (!formData.category) newErrors.category = 'Category required';
        }

        if (currentStep === 2) {
            if (!formData.make.trim()) newErrors.make = 'Make required';
            if (!formData.model.trim()) newErrors.model = 'Model required';
            if (!formData.registration.trim()) newErrors.registration = 'Registration required';
        }

        if (currentStep === 3) {
            if (!formData.description.trim()) newErrors.description = 'Description required';
        }

        if (currentStep === 5) {
            if (!formData.location.area) newErrors.locationArea = 'Area required';
            if (!formData.ownerInfo.name.trim()) newErrors.ownerName = 'Company name required';
            if (!formData.ownerInfo.phone.trim()) newErrors.ownerPhone = 'Phone required';
            if (!formData.ownerInfo.email.trim()) newErrors.ownerEmail = 'Email required';
            if (formData.ownerInfo.email && !/\S+@\S+\.\S+/.test(formData.ownerInfo.email))
                newErrors.ownerEmail = 'Invalid email';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const goNext = () => {
        if (validateStep()) {
            if (currentStep < TOTAL_STEPS) {
                setCurrentStep(prev => prev + 1);
                setErrors({});
            }
        }
    };

    const goBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
            setErrors({});
        } else {
            navigation.goBack();
        }
    };

    const handleSubmit = async () => {
        try {
            setIsSubmiting(true)
            const result = await addForhire(formData)
            result && CustomToast('Saved', 'Vehicle Details saved successfully.')
        } catch (err) {
            Alert.alert('Error!', err.message);
        } finally {
            setIsSubmiting(false)
            setFormData({
                type: '', category: '', make: '', model: '', registration: '', capacity: '', description: '',
                certifications: { insurance: false, license: false, borderCrossing: false }, features: [],
                location: { address: '', area: '', city: '' }, operatingDays: [], operatingEnd: '18:00',
                operatingStart: '08:00', routes: [], ownerInfo: {}, images: [],
            })
            setCurrentStep(1)
        }
    };

    const getStepTitle = () => {
        const titles = [
            'Photos & Basics',
            'Vehicle Details',
            'Schedule & Features',
            'Routes & Stations',
            'Location & Contact',
            'Review & Post'
        ];
        return titles[currentStep - 1];
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -80} // tweak if needed
        >
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
                <View style={{ height: 20 }} />
                <SecondaryNav
                    title="For Hires"
                    rightIcon='train-outline'
                />

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${(currentStep / TOTAL_STEPS) * 100}%` }]} />
                    </View>
                    <Text style={styles.progressText}>Step {currentStep} of {TOTAL_STEPS}</Text>
                </View>

                <Text style={[styles.stepTitle, { color: theme.colors.sub_text }]}>{getStepTitle()}</Text>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* ==================== STEP 1: Photos & Basics ==================== */}
                    {currentStep === 1 && (
                        <View style={styles.step}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Vehicle Photos *</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ marginBottom: 16, paddingHorizontal: 10 }}>
                                {formData.images.map((uri, i) => (
                                    <View key={i} style={styles.imageWrapper}>
                                        <Image source={{ uri }} style={styles.previewImage} />
                                        <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(i)}>
                                            <Ionicons name="close-circle" size={26} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {formData.images.length < 10 && (
                                    <TouchableOpacity style={[styles.addImageBtn, { backgroundColor: theme.colors.card }]} onPress={pickImage}>
                                        {isPickingImg ? <ActivityIndicator color={theme.colors.indicator} size={36} /> : <Ionicons name="camera-outline" size={36} color="#64748b" />}
                                        <Text style={styles.addImageText}>Add Photos</Text>
                                    </TouchableOpacity>
                                )}
                            </ScrollView>
                            {errors.images && <Text style={styles.error}>{errors.images}</Text>}

                            <Text style={[styles.label, { color: theme.colors.sub_text }]}>Vehicle Type *</Text>
                            <View style={styles.chipsRow}>
                                {types.map(t => (
                                    <TouchableOpacity
                                        key={t}
                                        style={[styles.chip, formData.type === t && styles.chipActive]}
                                        onPress={() => updateForm('type', t)}
                                    >
                                        <Text style={[styles.chipText, formData.type === t && styles.chipTextActive]}>
                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {errors.type && <Text style={styles.error}>{errors.type}</Text>}

                            <Text style={[styles.label, { color: theme.colors.sub_text }]}>Category *</Text>
                            <View style={styles.chipsRow}>
                                {categories.map(c => (
                                    <TouchableOpacity
                                        key={c}
                                        style={[styles.chip, formData.category === c && styles.chipActive]}
                                        onPress={() => updateForm('category', c)}
                                    >
                                        <Text style={[styles.chipText, formData.category === c && styles.chipTextActive]}>
                                            {c.replace('_', ' ').toUpperCase()}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {errors.category && <Text style={styles.error}>{errors.category}</Text>}

                            <Text style={[styles.label, { color: theme.colors.sub_text }]}>Is Boarder Crossing</Text>
                            <View style={styles.certificationGrid}>
                                <TouchableOpacity
                                    style={[
                                        styles.certBox,
                                        formData.crossingBoarder && styles.certBoxActive
                                    ]}
                                    onPress={() => updateForm('crossingBoarder', !formData.crossingBoarder)}
                                >
                                    <Ionicons
                                        name={formData.crossingBoarder ? 'checkmark-circle' : 'ellipse-outline'}
                                        size={28}
                                        color={formData.crossingBoarder ? theme.colors.indicator : '#94a3b8'}
                                    />
                                    <View style={{ marginLeft: 12 }}>
                                        <Text style={[
                                            styles.certLabel,
                                            formData.crossingBoarder && (styles.certLabelActive, { color: theme.colors.indicator })
                                        ]}>
                                            Is vehicle or fore hire crossing boarders?
                                        </Text>
                                        <Ionicons name='globe-outline' size={18} color={formData.crossingBoarder ? theme.colors.indicator : '#64748b'} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* ==================== STEP 2: Vehicle Details ==================== */}
                    {currentStep === 2 && (
                        <View style={styles.step}>
                            <View style={styles.row}>
                                <View style={styles.half}>
                                    <TextInput style={[styles.input, errors.make && styles.inputError, { backgroundColor: isDarkMode ? '#666' : '#fff' }]} label="Car Make *"
                                        mode='outlined' theme={{ roundness: 12 }}
                                        value={formData.make} onChangeText={v => updateForm('make', v)} />
                                    {errors.make && <Text style={styles.error}>{errors.make}</Text>}
                                </View>
                                <View style={styles.half}>
                                    <TextInput style={[styles.input, errors.model && styles.inputError, { backgroundColor: isDarkMode ? '#666' : '#fff' }]} label="Model *"
                                        mode='outlined' theme={{ roundness: 12 }} value={formData.model} onChangeText={v => updateForm('model', v)} />
                                    {errors.model && <Text style={styles.error}>{errors.model}</Text>}
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={styles.half}>
                                    <TextInput style={[styles.input, errors.registration && styles.inputError,
                                    { backgroundColor: isDarkMode ? '#666' : '#fff' }]}
                                        mode='outlined' theme={{ roundness: 12 }}
                                        label="Registration No." value={formData.registration} onChangeText={v => updateForm('registration', v)} />
                                    {errors.registration && <Text style={styles.error}>{errors.registration}</Text>}
                                </View>
                                <View style={styles.half}>
                                    <TextInput style={[styles.input, { backgroundColor: isDarkMode ? '#666' : '#fff' }]}
                                        mode='outlined' theme={{ roundness: 12 }}
                                        label="Capacity (Seats)" value={formData.capacity} keyboardType="numeric" onChangeText={v => updateForm('capacity', v)} />
                                </View>
                            </View>
                        </View>
                    )}

                    {/* ==================== STEP 3: Description & Features ==================== */}
                    {currentStep === 3 && (
                        <View style={styles.step}>
                            <TextInput
                                style={[styles.input, styles.textArea, errors.description && styles.inputError, { backgroundColor: isDarkMode ? '#666' : '#fff' }]}
                                label="Describe your vehicle & services..."
                                mode='outlined' theme={{ roundness: 12 }}
                                value={formData.description}
                                onChangeText={v => updateForm('description', v)}
                                multiline
                            />
                            {errors.description && <Text style={styles.error}>{errors.description}</Text>}

                            <Text style={[styles.label, { color: theme.colors.sub_text }]}>Operating Days *</Text>
                            <View style={styles.chipsRow}>
                                {daysOfWeek.map(day => (
                                    <TouchableOpacity
                                        key={day}
                                        style={[styles.chip, formData.operatingDays.includes(day) && styles.chipActive]}
                                        onPress={() => updateForm('operatingDays', formData.operatingDays.includes(day)
                                            ? formData.operatingDays.filter(d => d !== day)
                                            : [...formData.operatingDays, day]
                                        )}
                                    >
                                        <Text style={[styles.chipText, formData.operatingDays.includes(day) && styles.chipTextActive]}>
                                            {day.slice(0, 3)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {errors.operatingDays && <Text style={styles.error}>{errors.operatingDays}</Text>}

                            <View style={styles.row}>
                                <View style={styles.half}>
                                    <TextInput style={[styles.input, { backgroundColor: isDarkMode ? '#666' : '#fff' }]} label="Start Time"
                                        mode='outlined' theme={{ roundness: 12 }}
                                        value={formData.operatingStart} onChangeText={v => updateForm('operatingStart', v)} />
                                </View>
                                <View style={styles.half}>
                                    <TextInput style={[styles.input, { backgroundColor: isDarkMode ? '#666' : '#fff' }]} label="End Time"
                                        mode='outlined' theme={{ roundness: 12 }} value={formData.operatingEnd} onChangeText={v => updateForm('operatingEnd', v)} />
                                </View>
                            </View>

                            <Text style={[styles.label, { color: theme.colors.sub_text }]}>Features (Tap to select)</Text>
                            <View style={styles.featuresGrid}>
                                {commonFeatures.map(f => (
                                    <TouchableOpacity
                                        key={f}
                                        style={[styles.featureChip, formData.features.includes(f) && styles.featureActive]}
                                        onPress={() => updateForm('features', formData.features.includes(f)
                                            ? formData.features.filter(x => x !== f)
                                            : [...formData.features, f]
                                        )}
                                    >
                                        <Text style={[styles.featureText, formData.features.includes(f) && styles.featureTextActive]}>{f}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* ==================== STEP 4: Routes & Schedule ==================== */}
                    {currentStep === 4 && (
                        <View style={styles.step}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Fixed Routes (Optional)</Text>
                            <Text style={styles.subtitle}>Great for regular trips like Mbabane → Manzini</Text>

                            <View style={styles.routeForm}>
                                <View style={styles.row}>
                                    <TextInput style={[styles.input, { flex: 1, backgroundColor: isDarkMode ? '#666' : '#fff' }]} label="Origin (e.g. Mbabane)" value={currentRoute.origin}
                                        mode='outlined' theme={{ roundness: 12 }} onChangeText={t => setCurrentRoute(p => ({ ...p, origin: t }))} />
                                    <TextInput style={[styles.input, { flex: 1, marginLeft: 6, backgroundColor: isDarkMode ? '#666' : '#fff' }]} label="Destination (e.g. Johannesburg)"
                                        mode='outlined' theme={{ roundness: 12 }} value={currentRoute.destination} onChangeText={t => setCurrentRoute(p => ({ ...p, destination: t }))} />
                                </View>
                                <View style={styles.row}>
                                    <TextInput style={[styles.input, { flex: 1, backgroundColor: isDarkMode ? '#666' : '#fff' }]} label="Distance (e.g. 350 km)" value={currentRoute.distance}
                                        mode='outlined' theme={{ roundness: 12 }} onChangeText={t => setCurrentRoute(p => ({ ...p, distance: t }))} />
                                    <TextInput style={[styles.input, { flex: 1, marginLeft: 12, backgroundColor: isDarkMode ? '#666' : '#fff' }]} placeholder="Duration (4-5 hrs)"
                                        mode='outlined' theme={{ roundness: 12 }} value={currentRoute.duration} onChangeText={t => setCurrentRoute(p => ({ ...p, duration: t }))} />
                                </View>
                                <TextInput style={[styles.input, { backgroundColor: isDarkMode ? '#666' : '#fff' }]} label="Price (optional)" mode='outlined' theme={{ roundness: 12 }}
                                    value={currentRoute.price} onChangeText={t => setCurrentRoute(p => ({ ...p, price: t }))}
                                    keyboardType="numeric" />

                                <TouchableOpacity style={styles.addBtn} onPress={addRoute}>
                                    <Ionicons name="add-circle" size={22} color="#fff" />
                                    <Text style={styles.addBtnText}>Add Route</Text>
                                </TouchableOpacity>
                            </View>

                            {formData.routes.map((route, i) => (
                                <View key={i} style={styles.routeCard}>
                                    <View>
                                        <Text style={styles.routeMain}>{route.origin} → {route.destination}</Text>
                                        <Text style={styles.routeSub}>{route.distance} • {route.duration} {route.price ? `• E${route.price}` : ''}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => removeRoute(i)}>
                                        <Ionicons name="trash-outline" size={22} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {/* Certifications */}
                            <Text style={[styles.sectionTitle, { marginTop: 32, color: theme.colors.text }]}>Certifications & Safety</Text>
                            <Text style={styles.subtitle}>Boost trust — show customers you're verified</Text>

                            <View style={styles.certificationGrid}>
                                {[
                                    { key: 'insurance', label: 'Fully Insured', icon: 'shield-checkmark' },
                                    { key: 'license', label: 'Licensed Operator', icon: 'card' },
                                    { key: 'borderCrossing', label: 'Cross-Border Permitted', icon: 'globe' },
                                ].map(item => (
                                    <TouchableOpacity
                                        key={item.key}
                                        style={[
                                            styles.certBox,
                                            formData.certifications[item.key] && styles.certBoxActive
                                        ]}
                                        onPress={() => updateForm('certifications', {
                                            ...formData.certifications,
                                            [item.key]: !formData.certifications[item.key]
                                        })}
                                    >
                                        <Ionicons
                                            name={formData.certifications[item.key] ? 'checkmark-circle' : 'ellipse-outline'}
                                            size={28}
                                            color={formData.certifications[item.key] ? theme.colors.indicator : '#94a3b8'}
                                        />
                                        <View style={{ marginLeft: 12 }}>
                                            <Text style={[
                                                styles.certLabel,
                                                formData.certifications[item.key] && (styles.certLabelActive, { color: theme.colors.indicator })
                                            ]}>
                                                {item.label}
                                            </Text>
                                            <Ionicons name={item.icon} size={18} color={formData.certifications[item.key] ? theme.colors.indicator : '#64748b'} />
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* ==================== STEP 4: Location & Contact ==================== */}
                    {currentStep === 5 && (
                        <View style={styles.step}>
                            <Text style={[styles.label, { color: theme.colors.text }]}>Region *</Text>
                            <View style={styles.chipsRow}>
                                {mockAreas.map(area => (
                                    <TouchableOpacity
                                        key={area}
                                        style={[styles.chip, formData.location.area === area && styles.chipActive]}
                                        onPress={() => updateForm('location', { ...formData.location, area })}
                                    >
                                        <Text style={[styles.chipText, formData.location.area === area && styles.chipTextActive]}>{area}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {errors.locationArea && <Text style={styles.error}>{errors.locationArea}</Text>}

                            <Text style={[styles.label, { color: theme.colors.text }]}>City</Text>
                            <View style={[styles.chipsRow, { marginBottom: 20 }]}>
                                {cities.map(city => (
                                    <TouchableOpacity
                                        key={city}
                                        style={[styles.chip, formData.location.city === city && styles.chipActive]}
                                        onPress={() => updateForm('location', { ...formData.location, city })}
                                    >
                                        <Text style={[styles.chipText, formData.location.city === city && styles.chipTextActive]}>{city}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TextInput
                                style={[styles.input, { backgroundColor: isDarkMode ? '#666' : '#fff' }]}
                                mode='outlined' theme={{ roundness: 12 }}
                                label="Location/Address"
                                value={formData.location.address}
                                onChangeText={v => updateForm('location', { ...formData.location, address: v })}
                            />

                            <TextInput style={[styles.input, errors.ownerName && styles.inputError, { backgroundColor: isDarkMode ? '#666' : '#fff' }]}
                                label="Name or Company *" mode='outlined' theme={{ roundness: 12 }}
                                value={formData.ownerInfo.name} onChangeText={v => updateForm('ownerInfo', { ...formData.ownerInfo, name: v })} />
                            {errors.ownerName && <Text style={styles.error}>{errors.ownerName}</Text>}

                            <TextInput style={[styles.input, errors.ownerDriver && styles.inputError, { backgroundColor: isDarkMode ? '#666' : '#fff' }]} label="Driver/Operator Name (optional)"
                                mode='outlined' theme={{ roundness: 12 }} value={formData.ownerInfo.driver} onChangeText={v => updateForm('ownerInfo', { ...formData.ownerInfo, driver: v })} />
                            {/* {errors.ownerDriver && <Text style={styles.error}>{errors.ownerDriver}</Text>} */}

                            <TextInput style={[styles.input, errors.ownerPhone && styles.inputError, { backgroundColor: isDarkMode ? '#666' : '#fff' }]}
                                mode='outlined' theme={{ roundness: 12 }} label="Phone Number *" value={formData.ownerInfo.phone} keyboardType="phone-pad"
                                onChangeText={v => updateForm('ownerInfo', { ...formData.ownerInfo, phone: v })} />
                            {errors.ownerPhone && <Text style={styles.error}>{errors.ownerPhone}</Text>}

                            <TextInput style={[styles.input, errors.ownerEmail && styles.inputError, { backgroundColor: isDarkMode ? '#666' : '#fff' }]}
                                mode='outlined' theme={{ roundness: 12 }} label="Email Address *" value={formData.ownerInfo.email} keyboardType="email-address" autoCapitalize="none" onChangeText={v => updateForm('ownerInfo', { ...formData.ownerInfo, email: v })} />
                            {errors.ownerEmail && <Text style={styles.error}>{errors.ownerEmail}</Text>}

                            <TextInput style={[styles.input, { backgroundColor: isDarkMode ? '#666' : '#fff' }]}
                                mode='outlined' theme={{ roundness: 12 }} label="WhatsApp (Optional)" value={formData.ownerInfo.whatsapp}
                                keyboardType="phone-pad" onChangeText={v => updateForm('ownerInfo', { ...formData.ownerInfo, whatsapp: v })} />

                            <TextInput style={[styles.input, { backgroundColor: isDarkMode ? '#666' : '#fff' }]} label="Response Time (Within 2 hrs)"
                                mode='outlined' theme={{ roundness: 12 }} value={formData.ownerInfo.responsetime} keyboardType="default" onChangeText={v => updateForm('ownerInfo', { ...formData.ownerInfo, responsetime: v })} />
                        </View>
                    )}

                    {/* ==================== STEP 5: Review & Post ==================== */}
                    {currentStep === 6 && (
                        <View style={styles.step}>
                            <View style={styles.reviewCard}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                                    {formData.images.map((uri, i) => (
                                        <Image key={i} source={{ uri }} style={styles.reviewImage} />
                                    ))}
                                </ScrollView>

                                <Text style={styles.reviewText}><Text style={styles.bold}>Type:</Text> {formData.type?.toUpperCase()} • {formData.category.replace('_', ' ')}</Text>
                                <Text style={styles.reviewText}><Text style={styles.bold}>Vehicle:</Text> {formData.make} {formData.model}</Text>
                                <Text style={styles.reviewText}><Text style={styles.bold}>Is Crossing Boarder:</Text>{formData.crossingBoarder ? 'Yes' : 'No'}</Text>
                                <Text style={styles.reviewText}><Text style={styles.bold}>Location:</Text> {formData.location.area}, {formData.location.city || 'Eswatini'}</Text>
                                <Text style={styles.reviewText}><Text style={styles.bold}>Company:</Text> {formData.ownerInfo.name} • {formData.ownerInfo.driver}</Text>
                                <Text style={styles.reviewText}><Text style={styles.bold}>Contact:</Text> 📞{formData.ownerInfo.phone} • 🤳🏾{formData.ownerInfo.whatsapp}</Text>
                            </View>

                            <TouchableOpacity style={[styles.finalSubmitBtn, { backgroundColor: theme.colors.indicator }]} onPress={handleSubmit} disabled={isSubmiting}>
                                <Text style={styles.finalSubmitText}>Post Vehicle Now</Text>
                                {isSubmiting ?
                                    <ActivityIndicator color='#fff' size={22} /> :
                                    <Ionicons name="send" size={22} color="#fff" />
                                }
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>

                {/* Bottom Navigation Buttons */}
                {currentStep < 6 ? (
                    <View style={[styles.footer, { backgroundColor: theme.colors.card }]}>
                        <TouchableOpacity style={styles.backBtn} onPress={goBack}>
                            <Text style={styles.backText}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.nextBtn, { backgroundColor: theme.colors.primary }]} onPress={goNext}>
                            <Text style={styles.nextText}>Next</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                ) : null}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    progressContainer: { paddingHorizontal: 20, paddingTop: 16 },
    progressBar: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: '#2563eb', borderRadius: 3 },
    progressText: { textAlign: 'center', marginTop: 8, color: '#64748b', fontSize: 13 },
    stepTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginVertical: 12 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 10 },
    step: { flex: 1 },

    sectionTitle: { fontSize: 17, fontWeight: '700', marginVertical: 16 },
    label: { fontSize: 15, fontWeight: '600', marginTop: 12, marginBottom: 8 },
    input: { fontSize: 16, marginVertical: 5 },
    inputError: { borderColor: '#ef4444' },
    textArea: { height: 80, textAlignVertical: 'top' },
    error: { color: '#ef4444', fontSize: 13, marginTop: 6 },

    row: { flexDirection: 'row', gap: 6, marginBottom: 12 },
    half: { flex: 1 },

    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
    chip: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#f1f5f9', borderRadius: 30, borderWidth: 1, borderColor: '#e2e8f0' },
    chipActive: { backgroundColor: '#003366', borderColor: '#003366' },
    chipText: { fontSize: 14, fontWeight: '600', color: '#475569' },
    chipTextActive: { color: '#fff' },
    smallChip: { paddingHorizontal: 12, paddingVertical: 6 },
    smallChipText: { fontSize: 12 },

    featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
    featureChip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#f8fafc', borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
    featureActive: { backgroundColor: '#eff6ff', borderColor: '#003366' },
    featureTextActive: { color: '#003366', fontWeight: '600' },

    imageWrapper: { position: 'relative', marginRight: 12, paddingTop: 10 },
    previewImage: { width: 140, height: 140, borderRadius: 16 },
    removeBtn: { position: 'absolute', top: -3, right: -5 },
    addImageBtn: { marginTop: 10, width: 140, height: 140, borderRadius: 16, borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
    addImageText: { marginTop: 8, color: '#64748b', fontSize: 13 },

    reviewTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
    reviewCard: { backgroundColor: '#f8fafc', padding: 20, borderRadius: 20, marginBottom: 20 },
    reviewImage: { width: 100, height: 100, borderRadius: 12, marginRight: 10 },
    reviewText: { fontSize: 15, marginVertical: 4, color: '#1e293b' },
    bold: { fontWeight: '700' },

    subtitle: { fontSize: 13, color: '#888', marginTop: 4 },
    routeForm: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, marginVertical: 16 },
    addBtn: {
        flexDirection: 'row',
        backgroundColor: '#003366',
        padding: 14,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
    },
    addBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
    routeCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    routeMain: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    routeSub: { fontSize: 13, color: '#64748b', marginTop: 4 },

    certificationGrid: {
        gap: 16,
        marginVertical: 16,
    },
    certBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
    },
    certBoxActive: {
        backgroundColor: '#f0fdf4',
        borderColor: '#003366',
    },
    certLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#475569',
    },
    certLabelActive: {
        fontWeight: '700',
    },
    emptyText: {
        textAlign: 'center',
        color: '#64748b',
        fontStyle: 'italic',
        marginTop: 20,
        fontSize: 14,
    },

    footer: {
        flexDirection: 'row', gap: 10, paddingHorizontal: 16,
        paddingVertical: 10,
        borderTopWidth: 1, borderColor: '#e2e8f0',
        marginBottom: height * 0.07
    },
    backBtn: { flex: 1, padding: 16, backgroundColor: '#f1f5f9', borderRadius: 12, alignItems: 'center' },
    backText: { color: '#64748b', fontWeight: '600' },
    nextBtn: { flex: 1, flexDirection: 'row', padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },
    nextText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    finalSubmitBtn: { flexDirection: 'row', padding: 18, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 10 },
    finalSubmitText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});