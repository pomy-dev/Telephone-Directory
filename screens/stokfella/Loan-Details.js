import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Icons } from '../../constants/Icons';
import { AppContext } from '../../context/appContext';
import { AuthContext } from '../../context/authProvider';

export default function LoanRequestScreen() {
  const [loanAmount, setLoanAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [repaymentPeriod, setRepaymentPeriod] = useState('');
  const [urgency, setUrgency] = useState < 'low' | 'medium' | 'high' > ('medium');
  const [collateral, setCollateral] = useState('');
  const [guarantor, setGuarantor] = useState('');

  const handleSubmitLoan = () => {
    if (!loanAmount || !purpose || !repaymentPeriod) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    Alert.alert(
      'Loan Request Submitted',
      `Your loan request for E${loanAmount} has been submitted to the group admin for review. You will be notified of the decision within 24 hours.`,
      [{ text: 'OK' }]
    );

    // Reset form
    setLoanAmount('');
    setPurpose('');
    setRepaymentPeriod('');
    setUrgency('medium');
    setCollateral('');
    setGuarantor('');
  };

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'low':
        return '#4CAF50';
      case 'medium':
        return '#FF9800';
      case 'high':
        return '#f44336';
      default:
        return '#666';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text type="title" style={styles.headerTitle}>
          Request Loan
        </Text>
        <Text style={styles.headerSubtitle}>
          Apply for a loan from your group funds
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Group Info */}
          <View style={styles.groupInfoCard}>
            <Icons.Ionicons name="person-circle-outline" size={24} color="#4CAF50" />
            <View style={styles.groupInfoContent}>
              <Text style={styles.groupName}>Christmas Savings 2024</Text>
              <Text style={styles.groupDetails}>
                Available Funds: E6,000 | Interest Rate: 5% | Members: 12
              </Text>
            </View>
          </View>

          {/* Loan Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Loan Amount (E) *</Text>
            <TextInput
              style={[
                styles.textInput,
              ]}
              value={loanAmount}
              onChangeText={setLoanAmount}
              placeholder="Enter amount you want to borrow"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            <Text style={styles.inputHint}>
              Maximum loan amount: E3,000 (50% of group funds)
            </Text>
          </View>

          {/* Purpose */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Purpose of Loan *</Text>
            <TextInput
              style={[
                styles.textArea,
              ]}
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
            <TextInput
              style={[
                styles.textInput,
              ]}
              value={repaymentPeriod}
              onChangeText={setRepaymentPeriod}
              placeholder="6"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            <Text style={styles.inputHint}>
              Maximum repayment period: 12 months
            </Text>
          </View>

          {/* Urgency Level */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Urgency Level</Text>
            <View style={styles.urgencySelector}>
              {[
                { key: 'low', label: 'Low', description: 'Can wait' },
                { key: 'medium', label: 'Medium', description: 'Needed soon' },
                { key: 'high', label: 'High', description: 'Urgent' },
              ].map((level) => (
                <TouchableOpacity
                  key={level.key}
                  style={[
                    styles.urgencyOption,
                    urgency === level.key && styles.urgencyOptionSelected,
                    { borderColor: getUrgencyColor(level.key) },
                  ]}
                  onPress={() => setUrgency(level.key)}
                >
                  <View
                    style={[
                      styles.urgencyIndicator,
                      { backgroundColor: getUrgencyColor(level.key) },
                    ]}
                  />
                  <Text
                    style={[
                      styles.urgencyLabel,
                      urgency === level.key && styles.urgencyLabelSelected,
                    ]}
                  >
                    {level.label}
                  </Text>
                  <Text
                    style={[
                      styles.urgencyDescription,
                      urgency === level.key && styles.urgencyDescriptionSelected,
                    ]}
                  >
                    {level.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Collateral */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Collateral (Optional)</Text>
            <TextInput
              style={[
                styles.textInput,
              ]}
              value={collateral}
              onChangeText={setCollateral}
              placeholder="e.g., Property deed, Vehicle title"
              placeholderTextColor="#999"
            />
            <Text style={styles.inputHint}>
              Providing collateral may increase your chances of approval
            </Text>
          </View>

          {/* Guarantor */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Guarantor (Optional)</Text>
            <TextInput
              style={[
                styles.textInput,
              ]}
              value={guarantor}
              onChangeText={setGuarantor}
              placeholder="Name of group member who will guarantee"
              placeholderTextColor="#999"
            />
            <Text style={styles.inputHint}>
              A guarantor from the group can help secure your loan
            </Text>
          </View>

          {/* Loan Terms Summary */}
          <View style={styles.termsCard}>
            <Text style={styles.termsTitle}>Loan Terms Summary</Text>
            <View style={styles.termsItem}>
              <Text style={styles.termsLabel}>Interest Rate</Text>
              <Text style={styles.termsValue}>5% per month</Text>
            </View>
            <View style={styles.termsItem}>
              <Text style={styles.termsLabel}>Processing Fee</Text>
              <Text style={styles.termsValue}>E50</Text>
            </View>
            <View style={styles.termsItem}>
              <Text style={styles.termsLabel}>Late Payment Fee</Text>
              <Text style={styles.termsValue}>E100</Text>
            </View>
            <View style={styles.termsItem}>
              <Text style={styles.termsLabel}>Approval Time</Text>
              <Text style={styles.termsValue}>24-48 hours</Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitLoan}>
            <Text style={styles.submitButtonText}>Submit Loan Request</Text>
            <Icons.Feather name="arrow-right" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  groupInfoContent: {
    marginLeft: 12,
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  groupDetails: {
    fontSize: 14,
    color: '#666',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
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
  inputHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  urgencySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  urgencyOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  urgencyOptionSelected: {
    backgroundColor: '#f0f0f0',
  },
  urgencyIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  urgencyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  urgencyLabelSelected: {
    color: '#333',
  },
  urgencyDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  urgencyDescriptionSelected: {
    color: '#666',
  },
  termsCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  termsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  termsLabel: {
    fontSize: 14,
    color: '#666',
  },
  termsValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});
