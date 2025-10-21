import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  StatusBar
} from 'react-native';
import {
  Button,
  Card,
  Checkbox,
  Chip,
  RadioButton,
  Text,
} from 'react-native-paper';
import CustomLoader from '../../components/customLoader';
import { mockAreas, mockCategories } from '../../utils/mockData';
import { Icons } from '../../constants/Icons';
import MapPickerModal from '../../components/mapPicker';
import { AppContext } from '../../context/appContext';
import { AuthContext } from '../../context/authProvider';
import { addVendor } from '../../service/getApi';

export default function VendorRegistrationScreen({ navigation }) {
  const { theme, isDarkMode } = React.useContext(AppContext);
  const { user } = React.useContext(AuthContext);
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: user?.email || '',
    phone: '',
    whatsApp: '',
    businessType: 'street_vendor',
    category: '',
    area: '',
    address: '',
    description: '',
    workingHours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: '',
    },
    location: {
      latitude: null,
      longitude: null
    },
    deliveryRadius: 5,
    acceptsBulkOrders: false,
    hasLicense: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showMapPicker, setShowMapPicker] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWorkingHoursChange = (day, value) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: value
      }
    }));
  };

  const validateStep1 = () => {
    const { businessName, ownerName, email, phone, businessType, category, area } = formData;
    if (!businessName || !ownerName || !email || !phone || !businessType || !category || !area) {
      Alert.alert('Error', 'Please fill in all required fields');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await addVendor(formData);
      if (response)
        Alert.alert('Success', 'Vendor registration submitted successfully');
      else
        Alert.alert('Error', response.message || 'Failed to submit registration');

    } catch (error) {
      Alert.alert('Error', 'An error occurred while submitting your registration');
    } finally {
      setFormData({
        businessName: '',
        ownerName: '',
        email: user?.email || '',
        phone: '',
        businessType: 'street_vendor',
        category: '',
        area: '',
        address: '',
        location: {
          latitude: '',
          longitude: ''
        },
        description: '',
        workingHours: {
          monday: '',
          tuesday: '',
          wednesday: '',
          thursday: '',
          friday: '',
          saturday: '',
          sunday: '',
        },
        deliveryRadius: 5,
        acceptsBulkOrders: false,
        hasLicense: false,
      });
      setStep(1);
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <View>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Business Information</Text>
      <Text style={[styles.stepSubtitle, { color: theme.colors.placeholder }]}>
        Tell us about your business
      </Text>

      <View style={styles.field}>
        <TextInput
          placeholder="Business Name *"
          value={formData.businessName}
          onChangeText={(value) => handleInputChange('businessName', value)}
          style={styles.textInput}
        />
      </View>

      <View style={styles.field}>
        <TextInput
          placeholder="Owner/Manager Name *"
          value={formData.ownerName}
          onChangeText={(value) => handleInputChange('ownerName', value)}
          style={styles.textInput}
        />
      </View>

      <View style={styles.field}>
        <TextInput
          placeholder="Email Address *"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          // editable={!!user?.email ? false : true}
          keyboardType="email-address"
          style={styles.textInput}
        />
      </View>

      <View style={styles.field}>
        <TextInput
          placeholder="Phone Number *"
          value={formData.phone}
          onChangeText={(value) => handleInputChange('phone', value)}
          mode="outlined"
          keyboardType="phone-pad"
          style={styles.textInput}
        />
      </View>

      <View style={styles.field}>
        <TextInput
          placeholder="WhatsApp Number"
          value={formData.whatsApp}
          onChangeText={(value) => handleInputChange('whatsApp', value)}
          mode="outlined"
          keyboardType="phone-pad"
          style={styles.textInput}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Business Type *</Text>
      <RadioButton.Group
        onValueChange={(value) => handleInputChange('businessType', value)}
        value={formData.businessType}
      >
        <View style={styles.radioOption}>
          <RadioButton value="street_vendor" />
          <Text style={styles.radioLabel}>Street Vendor</Text>
        </View>
        <View style={styles.radioOption}>
          <RadioButton value="small_shop" />
          <Text style={styles.radioLabel}>Small Shop</Text>
        </View>
        <View style={styles.radioOption}>
          <RadioButton value="mobile_vendor" />
          <Text style={styles.radioLabel}>Mobile Vendor</Text>
        </View>
      </RadioButton.Group>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Category *</Text>
      <View style={styles.chipContainer}>
        {mockCategories?.map((category) => (
          <Chip
            key={category.id}
            selected={formData.category === category.name}
            onPress={() => handleInputChange('category', category.name)}
            style={[
              styles.chip,
              formData.category === category.name && styles.selectedChip
            ]}
            textStyle={styles.chipText}
          >
            {category.icon} {category.name}
          </Chip>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Service Area *</Text>
      <View style={styles.chipContainer}>
        {mockAreas?.map((area) => (
          <Chip
            key={area}
            selected={formData.area === area}
            onPress={() => handleInputChange('area', area)}
            style={[
              styles.chip,
              formData.area === area && styles.selectedChip
            ]}
            textStyle={styles.chipText}
          >
            {area}
          </Chip>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Business Details</Text>
      <Text style={[styles.stepSubtitle, { color: theme.colors.placeholder }]}>
        Additional information about your business
      </Text>

      <View style={styles.field}>
        <TextInput
          placeholder="Business Description"
          value={formData.description}
          onChangeText={(value) => handleInputChange('description', value)}
          multiline
          style={[styles.textInput, styles.textArea]}
        />
      </View>

      <Text style={styles.sectionTitle}>Business Location</Text>
      <View style={styles.field}>
        <Button
          mode="outlined"
          onPress={() => setShowMapPicker(true)}
          style={styles.textInput}
        >
          {formData.location.latitude && formData.location.longitude
            ? `Update Location (Lat ${formData.location.latitude.toFixed(4)}, Lng ${formData.location.longitude.toFixed(4)})`
            : 'Pick Location on Map'}
        </Button>
      </View>

      <View style={styles.field}>
        <TextInput
          placeholder="Business Address"
          value={formData.address}
          onChangeText={(value) => handleInputChange('address', value)}
          multiline
          style={styles.textInput}
        />
      </View>

      <Text style={styles.sectionTitle}>Working Hours</Text>
      {Object.keys(formData.workingHours)?.map((day) => (
        <View key={day} style={styles.workingHoursRow}>
          <Text style={styles.dayLabel}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
          <View style={styles.field}>
            <TextInput
              value={formData.workingHours[day]}
              onChangeText={(value) => handleWorkingHoursChange(day, value)}
              mode="outlined"
              style={styles.hoursInput}
              placeholder="Closed or 08:00-17:00"
            />
          </View>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Delivery Radius (km)</Text>
      <View style={styles.field}>
        <TextInput
          value={formData.deliveryRadius.toString()}
          onChangeText={(value) => handleInputChange('deliveryRadius', parseInt(value) || 0)}
          keyboardType="numeric"
          style={styles.textInput}
        />
      </View>

      <View style={styles.checkboxContainer}>
        <Checkbox
          status={formData.acceptsBulkOrders ? 'checked' : 'unchecked'}
          onPress={() => handleInputChange('acceptsBulkOrders', !formData.acceptsBulkOrders)}
        />
        <Text style={styles.checkboxLabel}>
          I can accept bulk orders and participate in group buying
        </Text>
      </View>

      <View style={styles.checkboxContainer}>
        <Checkbox
          status={formData.hasLicense ? 'checked' : 'unchecked'}
          onPress={() => handleInputChange('hasLicense', !formData.hasLicense)}
        />
        <Text style={styles.checkboxLabel}>
          I have a valid business license (recommended)
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      {/* header */}
      <View style={[styles.header, { borderColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { color: theme.colors.text }]}>
          <Icons.Ionicons name='arrow-back' style={{ color: theme.colors.text, fontSize: 24 }} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Join Local Market</Text>
          <Text style={[styles.stepIndicator, { color: theme.colors.sub_text }]}>Step {step} of 2</Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('VendorHome')} style={[styles.backNav, { color: theme.colors.text, marginLeft: '15%' }]}>
          <Icons.MaterialIcons name='store' style={{ color: theme.colors.text, fontSize: 24 }} />
        </TouchableOpacity>
      </View>

      {/* loader */}
      {isLoading && <CustomLoader />}

      {/* Map picker modal */}
      <MapPickerModal
        visible={showMapPicker}
        initialCoords={formData.location.latitude ? formData.location : null}
        onPick={(coord) => {
          setFormData(prev => ({
            ...prev,
            location: { latitude: coord.latitude, longitude: coord.longitude },
          }));
        }}
        onClose={() => setShowMapPicker(false)}
      />

      <ScrollView>
        <Card style={styles.card}>
          <Card.Content>
            {/* business info */}
            {step === 1 ? renderStep1() : renderStep2()}

            {/* buttons */}
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => setStep(1)}
                disabled={step === 1}
                style={styles.backNav}
              >
                Back
              </Button>

              <Button
                mode="contained"
                onPress={handleNext}
                style={{ backgroundColor: theme.colors.indicator }}
                contentStyle={styles.buttonContent}
              >
                {step === 1 ? 'Next' : 'Submit'}
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Benefits outline */}
        <Card style={[styles.benefitsCard, { backgroundColor: theme.colors.card }]}>
          <Card.Content>
            <Text style={[styles.benefitsTitle, { color: theme.colors.primary }]}>Benefits of Joining</Text>

            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>📈</Text>
              <Text style={[styles.benefitText, { color: theme.colors.text }]}>Increase your customer reach</Text>
            </View>

            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>💰</Text>
              <Text style={[styles.benefitText, { color: theme.colors.text }]}>Join bulk buying groups for better prices</Text>
            </View>

            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🚚</Text>
              <Text style={[styles.benefitText, { color: theme.colors.text }]}>Manage deliveries efficiently</Text>
            </View>

            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>📱</Text>
              <Text style={[styles.benefitText, { color: theme.colors.text }]}>Update stock in real-time</Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 10,
    borderBottomWidth: 1,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: '15%',
  },
  backNav: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  backButton: {
    position: 'absolute',
    left: 20
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  stepIndicator: {
    color: 'white',
    opacity: 0.8,
    marginTop: 5,
  },
  card: {
    margin: 20,
    elevation: 4,
  },
  stepTitle: {
    marginBottom: 8,
  },
  stepSubtitle: {
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    color: '#6b7280',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  field: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  selectedChip: {
    backgroundColor: '#003366'
  },
  chipText: {
    fontSize: 12,
  },
  workingHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayLabel: {
    width: 80,
    fontSize: 14,
    fontWeight: '500',
  },
  hoursInput: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    color: '#6b7280',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkboxLabel: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  benefitsCard: {
    marginHorizontal: 20,
    marginBottom: 60,
    elevation: 2,
  },
  benefitsTitle: {
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
  },
});