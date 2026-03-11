import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Platform,
    Linking,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Icons } from '../../constants/Icons';
import { AppContext } from '../../context/appContext';
import { AuthContext } from '../../context/authProvider';
import SecondaryNav from '../../components/SecondaryNav';

// ────── Date Picker Helper ──────
const useDatePicker = () => {
    const [show, setShow] = useState(false);
    const [date, setDate] = useState(new Date());

    const showDatePicker = () => {
        setShow(true);
    };

    const handleDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShow(false);
        }
        if (selectedDate) {
            setDate(selectedDate);
            return selectedDate.toISOString().split('T')[0]; // Returns YYYY-MM-DD
        }
    };

    const hideDatePicker = () => {
        setShow(false);
    };

    return { show, date, showDatePicker, handleDateChange, hideDatePicker };
};

export default function BookTransportationScreen({ navigation, route }) {
    const { theme, isDarkMode } = useContext(AppContext)
    const { user } = useContext(AuthContext)
    const { vehicle } = route.params;
    const datePicker = useDatePicker();

    const [formData, setFormData] = useState({
        bookingDate: '',
        bookingTime: '',
        pickupLocation: '',
        dropoffLocation: '',
        numberOfPassengers: '',
        specialRequests: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
    });

    const [selectedRoute, setSelectedRoute] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!vehicle) {
        return (
            <View style={styles.container}>
                <SecondaryNav title="Book Vehicle" />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Vehicle not found</Text>
                </View>
            </View>
        );
    }

    const handleDateSelect = (selectedDate) => {
        const dateString = selectedDate.toISOString().split('T')[0];
        handleInputChange('bookingDate', dateString);
        datePicker.hideDatePicker();
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.bookingDate.trim()) newErrors.bookingDate = 'Booking date is required';
        if (!formData.bookingTime.trim()) newErrors.bookingTime = 'Booking time is required';
        if (!formData.pickupLocation.trim()) newErrors.pickupLocation = 'Pickup location is required';
        if (!formData.dropoffLocation.trim()) newErrors.dropoffLocation = 'Dropoff location is required';
        // if (!formData.contactName.trim()) newErrors.contactName = 'Contact name is required';
        if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Contact phone is required';
        // if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Email is required';
        if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
            newErrors.contactEmail = 'Invalid email format';
        }

        // Validate booking time is within operating hours
        if (formData.bookingTime) {
            const bookingTime = formData.bookingTime;
            const startTime = vehicle?.operating_start;
            const endTime = vehicle?.operating_end;
            if (bookingTime < startTime || bookingTime > endTime) {
                newErrors.bookingTime = `Booking time must be between ${startTime} and ${endTime}`;
            }
        }

        // Validate booking date is on an operating day
        if (formData.bookingDate) {
            const date = new Date(formData.bookingDate);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            if (!vehicle.operating_days.includes(dayName)) {
                newErrors.bookingDate = `Vehicle not available on ${dayName}. Available days: ${vehicle.operating_days.join(', ')}`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
            return;
        }

        try {
            setIsSubmitting(true);

            const messageLines = [
                `Hello, I would like to book the following vehicle:`,
                ``,
                `Vehicle: ${vehicle.vehicle_category.replace(/_/g, ' ')
                    .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')
                } 
                (${vehicle.vehicle_make} ${vehicle.vehicle_model})`,
                `No.: ${vehicle.id || '-'}`,
            ];
            if (selectedRoute !== null && vehicle.routes[selectedRoute]) {
                const route = vehicle.routes[selectedRoute];
                messageLines.push(`Route: ${route.origin} to ${route.destination} (${route.distance}, ${route.duration}) - E ${route.price}`);
            }
            messageLines.push(`Need service on: ${formData.bookingDate}`);
            messageLines.push(`By this Time: ${formData.bookingTime}`);
            messageLines.push(`Pickup Location: ${formData.pickupLocation}`);
            messageLines.push(`Dropoff Location: ${formData.dropoffLocation}`);
            if (formData.numberOfPassengers) {
                messageLines.push(`Number of Passengers: ${formData.numberOfPassengers}`);
            }
            if (formData.specialRequests) {
                messageLines.push(`Special Requests: ${formData.specialRequests}`);
            }
            messageLines.push(``);
            messageLines.push(`Contact Information:`);
            messageLines.push(`Name: ${user?.displayName}`);
            messageLines.push(`Phone: ${formData.contactPhone}`);
            messageLines.push(`Email: ${user?.email}`);
            const message = messageLines.join('\n');

            let smsUrl = Platform.OS === "ios"
                ? `sms:${vehicle?.agent_phone}&body=${encodeURIComponent(message)}`
                : `smsto:${vehicle?.agent_phone}?body=${encodeURIComponent(message)}`;

            if ((vehicle.vehicle_type === 'minibus'
                || vehicle.vehicle_type === 'bus'
                || vehicle.vehicle_type === 'sprinter'
                || vehicle.vehicle_type === 'schoolbus'
                || vehicle.vehicle_type === 'staffbus')
                && vehicle.vehicle_category === 'public_transport'
            ) {
                await Linking.openURL(smsUrl)
            } else {
                smsUrl = Platform.OS === "ios"
                    ? `sms:${vehicle?.owner_info?.phone}&body=${encodeURIComponent(message)}`
                    : `smsto:${vehicle?.owner_info?.phone}?body=${encodeURIComponent(message)}`;
                await Linking.openURL(smsUrl);
            }
        } catch (error) {
            Alert.alert('⚠️', error);
        } finally {
            setIsSubmitting(false);
            setFormData({
                bookingDate: '',
                bookingTime: '',
                pickupLocation: '',
                dropoffLocation: '',
                numberOfPassengers: '',
                specialRequests: '',
                contactName: '',
                contactPhone: '',
                contactEmail: '',
            });
            setSelectedRoute(null);
            setErrors({});
        }

    };

    const getVehicleTypeIcon = (type) => {
        switch (type) {
            case 'suv':
                return { IconComponent: Icons.Ionicons, iconName: 'car' };
            case 'minibus':
                return { IconComponent: Icons.FontAwesome6, iconName: 'van-shuttle' };
            case 'bus':
                return { IconComponent: Icons.Ionicons, iconName: 'bus' };
            case 'truck':
                return { IconComponent: Icons.MaterialCommunityIcons, iconName: 'truck-flatbed' };
            case 'motorcycle':
                return { IconComponent: Icons.FontAwesome6, iconName: 'motorcycle' };
            case 'van':
                return { IconComponent: Icons.FontAwesome5, iconName: 'truck-pickup' };
            case 'sprinter':
                return { IconComponent: Icons.FontAwesome5, iconName: 'shuttle-van' };
            case 'cargo':
                return { IconComponent: Icons.FontAwesome6, iconName: 'truck-ramp-box' };
            default:
                return { IconComponent: Icons.Ionicons, iconName: 'car' };
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
            <SecondaryNav title={`Book ${vehicle.vehicle_type.toUpperCase()} ${vehicle.vehicle_make} ${vehicle.vehicle_model}`} />

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
                {/* Vehicle Info */}
                <View style={[styles.vehicleInfoCard, { backgroundColor: theme.colors.card }]}>
                    <View style={{ alignItems: 'center' }}>
                        {(() => {
                            const { IconComponent, iconName } = getVehicleTypeIcon(vehicle.vehicle_type);
                            return <IconComponent name={iconName} size={68} color={theme.colors.indicator} />;
                        })()}
                    </View>
                    <Text style={[styles.vehicleInfoTitle, { color: theme.colors.text }]}>
                        {
                            vehicle.vehicle_category.replace(/_/g, ' ')
                                .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ')
                        }
                    </Text>
                    <Text style={[styles.vehicleInfoSubtitle, { color: theme.colors.text }]}>{vehicle.vehicle_make} {vehicle.vehicle_model} • {vehicle.owner_info?.name}</Text>
                    {vehicle.vehicle_capacity && (
                        <View style={styles.vehicleInfoRow}>
                            <Text style={[styles.vehicleInfoLabel, { color: theme.colors.sub_text }]}>Capacity:</Text>
                            <Text style={[styles.vehicleInfoValue, { color: theme.colors.success }]}>{vehicle.vehicle_capacity} seats</Text>
                        </View>
                    )}
                </View>

                {/* Routes Selection (if available) */}
                {vehicle.routes.length > 0 && (
                    <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Select Route (Optional)</Text>
                        {vehicle.routes.map((route, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.routeOption, { backgroundColor: theme.colors.highlight },
                                selectedRoute === index && styles.routeOptionActive]}
                                onPress={() => setSelectedRoute(index)}
                            >
                                <View style={styles.routeOptionContent}>
                                    <View style={styles.routeOptionHeader}>
                                        <Icons.Ionicons name="location" size={18} color={theme.colors.indicator} />
                                        <Text style={[styles.routeOptionOrigin, { color: theme.colors.indicator }]}>{route.origin}</Text>
                                        <Icons.Ionicons name="arrow-forward" size={16} color="#cccc" />
                                        <Icons.Ionicons name="location" size={18} color="#b94e10ff" />
                                        <Text style={styles.routeOptionDestination}>{route.destination}</Text>
                                    </View>
                                    <View style={styles.routeOptionDetails}>
                                        <Text style={styles.routeOptionDetail}>{route.distance}</Text>
                                        <Text style={styles.routeOptionDetail}>•</Text>
                                        <Text style={styles.routeOptionDetail}>{route.duration}</Text>
                                        <Text style={styles.routeOptionDetail}>•</Text>
                                        <Text style={[styles.routeOptionPrice, { color: theme.colors.success, }]}>E {route.price}</Text>
                                    </View>
                                </View>
                                {selectedRoute === index && (
                                    <Icons.Ionicons name="checkmark-circle" size={24} color="#003366" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Booking Details */}
                <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Booking Details</Text>

                    <View style={styles.detailsRow}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={[styles.label, { color: theme.colors.sub_text }]}>
                                Retrieval Date * <Text style={styles.required}>({vehicle.operating_days?.join(', ')})</Text>
                            </Text>
                            <TouchableOpacity
                                style={[styles.input, { backgroundColor: isDarkMode ? '#666' : '#fff', borderWidth: 1, borderColor: '#dddd', padding: 12 }, errors.bookingDate && styles.inputError]}
                                onPress={datePicker.showDatePicker}
                            >
                                <Text style={{ color: formData.bookingDate ? theme.colors.sub_text : '#94a3b8', fontSize: 15 }}>
                                    {formData.bookingDate || 'YYYY-MM-DD'}
                                </Text>
                            </TouchableOpacity>
                            {errors.bookingDate && <Text style={styles.errorText}>{errors.bookingDate}</Text>}
                        </View>

                        {/* Date Picker Modal */}
                        {datePicker.show && (
                            <DateTimePicker
                                value={datePicker.date}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) handleDateSelect(selectedDate);
                                    if (Platform.OS === 'android') datePicker.hideDatePicker();
                                }}
                            />
                        )}

                        {/* iOS Date Picker Done Button */}
                        {Platform.OS === 'ios' && datePicker.show && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 16 }}>
                                <TouchableOpacity onPress={datePicker.hideDatePicker}>
                                    <Text style={{ color: '#2563eb', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDateSelect(datePicker.date)}>
                                    <Text style={{ color: '#2563eb', fontSize: 16, fontWeight: '600' }}>Done</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={[styles.label, { color: theme.colors.sub_text }]}>
                                Retrieval Time * <Text style={styles.required}>({vehicle.operating_start} - {vehicle.operating_end})</Text>
                            </Text>
                            <TextInput
                                style={[styles.input, { color: theme.colors.sub_text, backgroundColor: isDarkMode ? '#666' : '#fff' }, errors.bookingTime && styles.inputError]}
                                label="HH:MM" mode='outlined' theme={{ roundness: 12 }}
                                value={formData.bookingTime}
                                onChangeText={(value) => handleInputChange('bookingTime', value)}
                            />
                            {errors.bookingTime && <Text style={styles.errorText}>{errors.bookingTime}</Text>}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.colors.sub_text }]}>Pickup Location *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDarkMode ? '#666' : '#fff' }, errors.pickupLocation && styles.inputError]}
                            label="Enter pickup address" mode='outlined' theme={{ roundness: 12 }}
                            value={formData.pickupLocation}
                            onChangeText={(value) => handleInputChange('pickupLocation', value)}
                            placeholderTextColor="#94a3b8"
                        />
                        {errors.pickupLocation && <Text style={styles.errorText}>{errors.pickupLocation}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.colors.sub_text }]}>Dropoff Location *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDarkMode ? '#666' : '#fff' }, errors.dropoffLocation && styles.inputError]}
                            label="Enter dropoff address" mode='outlined' theme={{ roundness: 12 }}
                            value={formData.dropoffLocation}
                            onChangeText={(value) => handleInputChange('dropoffLocation', value)}
                            placeholderTextColor="#94a3b8"
                        />
                        {errors.dropoffLocation && <Text style={styles.errorText}>{errors.dropoffLocation}</Text>}
                    </View>

                    {vehicle?.vehicle_capacity && (
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: theme.colors.sub_text }]}>Number of Passengers</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDarkMode ? '#666' : '#fff' }]}
                                label={`Max ${vehicle?.vehicle_capacity} passengers`}
                                mode='outlined' theme={{ roundness: 12 }}
                                value={formData.numberOfPassengers}
                                onChangeText={(value) => handleInputChange('numberOfPassengers', value)}
                                keyboardType="numeric"
                            />
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.colors.sub_text }]}>Special Requests</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDarkMode ? '#666' : '#fff' }, styles.textArea]}
                            label="Any special requirements or requests..."
                            mode='outlined' theme={{ roundness: 12 }}
                            value={formData.specialRequests}
                            onChangeText={(value) => handleInputChange('specialRequests', value)}
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                </View>

                {/* Contact Information */}
                <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.sub_text }]}>Your Contact Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.colors.sub_text }]}>Phone *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: isDarkMode ? '#666' : '#fff' }, errors.contactPhone && styles.inputError]}
                            label="+268 2404 1234" mode='outlined' theme={{ roundness: 12 }}
                            value={formData.contactPhone}
                            onChangeText={(value) => handleInputChange('contactPhone', value)}
                            keyboardType="phone-pad"
                        />
                        {errors.contactPhone && <Text style={styles.errorText}>{errors.contactPhone}</Text>}
                    </View>
                </View>

                {/* Booking Summary */}
                <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.sub_text }]}>Booking Summary</Text>
                    <View style={[styles.summaryContainer, { backgroundColor: isDarkMode ? '#666' : '#fff' }]}>
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: theme.colors.sub_text }]}>Vehicle:</Text>
                            <Text style={[styles.summaryValue, { color: theme.colors.sub_text }]}>
                                {
                                    vehicle.vehicle_category.replace(/_/g, ' ')
                                        .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                        .join(' ')
                                }
                            </Text>
                        </View>
                        {selectedRoute !== null && vehicle.routes[selectedRoute] && (
                            <View style={styles.summaryRow}>
                                <Text style={[styles.summaryLabel, { color: theme.colors.sub_text }]}>Route:</Text>
                                <Text style={[styles.summaryValue, { color: theme.colors.sub_text }]}>
                                    {vehicle.routes[selectedRoute].origin} → {vehicle.routes[selectedRoute].destination}
                                </Text>
                            </View>
                        )}
                        {formData.bookingDate && (
                            <View style={styles.summaryRow}>
                                <Text style={[styles.summaryLabel, { color: theme.colors.sub_text }]}>Date:</Text>
                                <Text style={[styles.summaryValue, { color: theme.colors.sub_text }]}>{formData.bookingDate}</Text>
                            </View>
                        )}
                        {formData.bookingTime && (
                            <View style={styles.summaryRow}>
                                <Text style={[styles.summaryLabel, { color: theme.colors.sub_text }]}>Time:</Text>
                                <Text style={[styles.summaryValue, { color: theme.colors.sub_text }]}>{formData.bookingTime}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Submit Button */}
            <View style={[styles.footer]}>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>
                    <Text style={styles.submitButtonText}>Send via SMS</Text>
                    {isSubmitting ?
                        <ActivityIndicator color={'#fff'} size={20} />
                        : <Icons.Ionicons name="checkmark-circle" size={20} color="#fff" />
                    }
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    vehicleInfoCard: {
        padding: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    vehicleInfoTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    vehicleInfoSubtitle: {
        fontSize: 14,
        marginBottom: 12,
    },
    vehicleInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 8,
    },
    vehicleInfoLabel: {
        fontSize: 14,
        color: '#64748b',
    },
    vehicleInfoValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    section: {
        marginHorizontal: 10,
        marginTop: 20,
        paddingVertical: 20,
        paddingHorizontal: 10,
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
        marginBottom: 16,
    },
    routeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        gap: 12,
    },
    routeOptionActive: {
        borderColor: '#003366',
        backgroundColor: '#666',
    },
    routeOptionContent: {
        flex: 1,
    },
    routeOptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    routeOptionOrigin: {
        fontSize: 14,
        fontWeight: '600'
    },
    routeOptionDestination: {
        fontSize: 14,
        fontWeight: '600',
        color: '#b4683dff',
    },
    routeOptionDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    routeOptionDetail: {
        fontSize: 12,
        color: '#cccc',
    },
    routeOptionPrice: {
        fontSize: 13,
        fontWeight: '600',
    },
    detailsRow: {
        flexDirection: 'row',
        gap: 6,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    required: {
        fontSize: 12,
        fontWeight: '400',
        color: '#64748b',
    },
    input: {
        borderRadius: 10,
        fontSize: 15,
    },
    inputError: {
        borderColor: '#ef4444',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    errorText: {
        marginTop: 4,
        fontSize: 12,
        color: '#ef4444',
    },
    summaryContainer: {
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    summaryValue: {
        fontSize: 14,
        color: '#000',
        fontWeight: '500',
        flex: 1,
        textAlign: 'right',
    },
    footer: {
        paddingVertical: 10,
        marginBottom: 40,
        marginHorizontal: 10,
        borderTopWidth: 1
    },
    submitButton: {
        backgroundColor: '#003366',
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



