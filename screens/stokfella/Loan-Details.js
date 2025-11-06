import React, { useState, useEffect } from 'react';
import {
  StatusBar,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Slider from '@react-native-community/slider';
import { Icons } from '../../constants/Icons';
import { AppContext } from '../../context/appContext';
import { AuthContext } from '../../context/authProvider';

export default function LoanRequestScreen({ navigation, route }) {
  const { theme, isDarkMode } = React.useContext(AppContext);
  // Detect mode
  const { mode, loanId } = route.params;
  const { user } = React.useContext(AuthContext);

  // === REQUEST MODE STATES ===
  const [loanAmount, setLoanAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [repaymentPeriod, setRepaymentPeriod] = useState(null);
  const [urgency, setUrgency] = useState('medium');
  const [collateral, setCollateral] = useState('');
  const [guarantor, setGuarantor] = useState('');

  // === REPAY MODE STATES (mock data) ===
  const [outstandingBalance] = useState(2750); // E2,750
  const [repayAmount, setRepayAmount] = useState(0);
  const [remainingAfterPay] = useState(outstandingBalance);

  useEffect(() => {
    if (mode === 'repay') {
      setRepayAmount(0);
    }
  }, [mode]);

  const handleSubmitLoan = () => {
    if (mode === 'request') {
      if (!loanAmount || !purpose || !repaymentPeriod) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      Alert.alert(
        'Loan Request Submitted',
        `Your loan request for E${loanAmount} has been submitted.`,
        [{ text: 'OK' }]
      );

      // Reset
      setLoanAmount('');
      setPurpose('');
      setRepaymentPeriod(null);
      setUrgency('medium');
      setCollateral('');
      setGuarantor('');
    } else {
      // REPAY MODE
      if (repayAmount <= 0) {
        Alert.alert('Error', 'Please select an amount to repay');
        return;
      }

      Alert.alert(
        'Repayment Confirmed',
        `You are repaying E${repayAmount.toFixed(2)}. Remaining balance: E${(outstandingBalance - repayAmount).toFixed(2)}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: () => {
              Alert.alert('Success', 'Repayment recorded!');
              navigation.goBack();
            },
          },
        ]
      );
    }
  };

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#f44336';
      default: return '#666';
    }
  };

  // === REPAYMENT SCHEDULE MOCK ===
  const repaymentSchedule = [
    { month: 'Aug 2025', due: 500 },
    { month: 'Sep 2025', due: 500 },
    { month: 'Oct 2025', due: 500 },
  ];

  const months = [
    { label: 'January', value: '1' },
    { label: 'February', value: '2' },
    { label: 'March', value: '3' },
    { label: 'April', value: '4' },
    { label: 'May', value: '5' },
    { label: 'June', value: '6' },
    { label: 'July', value: '7' },
    { label: 'August', value: '8' },
    { label: 'September', value: '9' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' }
  ];

  const renderItem = item => {
    return (
      <View style={styles.item}>
        <Text style={styles.textItem}>{item.label}</Text>
        {item.repaymentPeriod === repaymentPeriod && (
          <Icons.EvilIcons
            style={styles.icon}
            color="black"
            name="clock"
            size={24}
          />
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      <View style={[styles.header, { backgroundColor: mode === 'request' ? '#ce701dff' : '#954cafff' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icons.Ionicons name='arrow-back' size={24} color='#fff' />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: '#fff' }]}>
            {mode === 'repay' ? 'Repay Loan' : 'Christmas Savings 2024'}
          </Text>
          <TouchableOpacity onPress={() => { }}>
            <Icons.Ionicons name='person-circle-outline' size={24} color='#fff' />
          </TouchableOpacity>
        </View>
        {mode === 'request' ? (
          <>
            <Text style={styles.headerSubtitle}>Credit Limit: E6,000</Text>
            <Text style={styles.headerSubtitleSmall}>Interest Rate: 5%</Text>
          </>
        ) : (
          <Text style={styles.headerSubtitle}>Outstanding: E{outstandingBalance.toFixed(2)}</Text>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* ================== REQUEST MODE ================== */}
        {mode === 'request' && (
          <View style={[styles.formContainer, { backgroundColor: theme.colors.card }]}>
            {/* Loan Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Loan Amount (E) *</Text>
              <TextInput
                style={styles.textInput}
                value={loanAmount}
                onChangeText={setLoanAmount}
                placeholder="Enter amount"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
              <Text style={styles.inputHint}>Max: E3,000 (50% of group funds)</Text>
            </View>

            {/* Purpose */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Purpose of Loan *</Text>
              <TextInput
                style={styles.textArea}
                value={purpose}
                onChangeText={setPurpose}
                placeholder="Describe what you need the loan for..."
                multiline
                numberOfLines={3}
                placeholderTextColor="#999"
              />
            </View>

            {/* Repayment Period */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Repayment Period (months) *</Text>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                iconStyle={styles.iconStyle}
                data={months}
                search
                maxHeight={300}
                labelField="label"
                valueField="repaymentPeriod"
                placeholder="Select month"
                searchPlaceholder="Type month..."
                value={repaymentPeriod}
                onChange={item => {
                  setRepaymentPeriod(item.repaymentPeriod)
                }}
                renderLeftIcon={() => (
                  <Icons.MaterialCommunityIcons style={styles.icon} color={theme.colors.text} name="cash-refund" size={20} />
                )}
                renderItem={renderItem}
              />
              <Text style={styles.inputHint}>Max: 11 months</Text>
            </View>

            {/* Urgency */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Urgency Level</Text>
              <View style={styles.urgencySelector}>
                {['low', 'medium', 'high'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.urgencyOption,
                      urgency === level && styles.urgencyOptionSelected,
                      { borderColor: getUrgencyColor(level) },
                    ]}
                    onPress={() => setUrgency(level)}
                  >
                    <View style={[styles.urgencyIndicator, { backgroundColor: getUrgencyColor(level) }]} />
                    <Text style={[styles.urgencyLabel, urgency === level && { color: getUrgencyColor(level) }]}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Collateral & Guarantor */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Collateral (Optional)</Text>
              <TextInput style={styles.textInput} value={collateral} onChangeText={setCollateral} placeholder="e.g., Property deed" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Guarantor (Optional)</Text>
              <TextInput style={styles.textInput} value={guarantor} onChangeText={setGuarantor} placeholder="Group member name" />
            </View>
          </View>
        )}

        {/* ================== REPAY MODE ================== */}
        {mode === 'repay' && (
          <View style={[styles.formContainer, { backgroundColor: theme.colors.card }]}>
            {/* Outstanding Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Loan Repayment</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Outstanding Balance</Text>
                <Text style={styles.summaryValue}>E{outstandingBalance.toFixed(2)}</Text>
              </View>
            </View>

            {/* Repay Amount Slider */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Amount to Repay</Text>
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderValue}>E{repayAmount.toFixed(2)}</Text>
                <Slider
                  minimumValue={0}
                  maximumValue={outstandingBalance}
                  step={50}
                  value={repayAmount}
                  onValueChange={setRepayAmount}
                  minimumTrackTintColor="#4CAF50"
                  maximumTrackTintColor="#e0e0e0"
                  thumbTintColor="#4CAF50"
                />
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderMin}>E0</Text>
                  <Text style={styles.sliderMax}>E{outstandingBalance.toFixed(0)}</Text>
                </View>
              </View>
              {repayAmount > 0 && (
                <Text style={styles.remainingText}>
                  Remaining after payment: <Text style={{ fontWeight: '600' }}>
                    E{(outstandingBalance - repayAmount).toFixed(2)}
                  </Text>
                </Text>
              )}
            </View>

            {/* Repayment Schedule Preview */}
            <View style={styles.scheduleCard}>
              <Text style={styles.scheduleTitle}>Upcoming Payments</Text>
              {repaymentSchedule.map((item, idx) => (
                <View key={idx} style={styles.scheduleItem}>
                  <Text style={styles.scheduleMonth}>{item.month}</Text>
                  <Text style={styles.scheduleAmount}>E{item.due}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Terms Summary (shared) */}
        <View style={[styles.termsCard, { backgroundColor: theme.colors.card }]}>
          <Text style={styles.termsTitle}>Loan Terms</Text>
          <View style={styles.termsItem}>
            <Text style={styles.termsLabel}>Interest Rate</Text>
            <Text style={styles.termsValue}>5% after loan-period</Text>
          </View>
          <View style={styles.termsItem}>
            <Text style={styles.termsLabel}>Penalty Fee</Text>
            <Text style={styles.termsValue}>E100</Text>
          </View>
          <View style={styles.termsItem}>
            <Text style={styles.termsLabel}>Approval Time</Text>
            <Text style={styles.termsValue}>{mode === 'repay' ? 'Instant' : '24-48 hours'}</Text>
          </View>
        </View>

        {/* Submit / Pay Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitLoan}>
          <Text style={styles.submitButtonText}>
            {mode === 'repay' ? 'Pay Now' : 'Send Request'}
          </Text>
          <Icons.Feather name="arrow-right" size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// === STYLES ===
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { textAlign: 'center', fontSize: 16, color: '#fff', marginTop: 4 },
  headerSubtitleSmall: { textAlign: 'center', fontSize: 14, color: '#ddd' },
  scrollView: { flex: 1, paddingTop: 20 },
  formContainer: {
    marginHorizontal: 10,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    height: 80,
    textAlignVertical: 'top',
  },
  inputHint: { fontSize: 12, color: '#666', marginTop: 4 },

  // Dropdown
  dropdown: {
    height: 55,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  icon: {
    marginRight: 5,
  },
  item: {
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textItem: {
    flex: 1,
    fontSize: 16,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },

  // Urgency
  urgencySelector: { flexDirection: 'row', gap: 8 },
  urgencyOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  urgencyOptionSelected: { backgroundColor: '#f0f0f0' },
  urgencyIndicator: { width: 12, height: 12, borderRadius: 6, marginBottom: 8 },
  urgencyLabel: { fontSize: 14, fontWeight: '600', color: '#333' },

  // Repay Mode
  summaryCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  summaryTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 15, color: '#666' },
  summaryValue: { fontSize: 15, fontWeight: '600', color: '#ce701dff' },

  sliderContainer: { paddingHorizontal: 8 },
  sliderValue: { fontSize: 20, fontWeight: '600', textAlign: 'center', marginBottom: 8, color: '#4CAF50' },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  sliderMin: { fontSize: 12, color: '#666' },
  sliderMax: { fontSize: 12, color: '#666' },
  remainingText: { marginTop: 8, fontSize: 14, color: '#333', textAlign: 'center' },

  scheduleCard: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  scheduleTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  scheduleItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  scheduleMonth: { fontSize: 14, color: '#666' },
  scheduleAmount: { fontSize: 14, fontWeight: '600', color: '#4CAF50' },

  // Shared
  termsCard: { marginHorizontal: 16, marginBottom: 16, padding: 16, borderRadius: 12 },
  termsTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  termsItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  termsLabel: { fontSize: 14, color: '#666' },
  termsValue: { fontSize: 14, fontWeight: '500', color: '#333' },

  submitButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 60,
  },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: '600', marginRight: 8 },
});