import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Icons } from '../../constants/Icons';
import { AppContext } from '../../context/appContext';
import { AuthContext } from '../../context/authProvider';

export default function MakeContributionScreen() {
  const { theme, isDarkMode } = React.useContext(AppContext)
  const { user } = React.useContext(AuthContext)
  const [contributionAmount, setContributionAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState < 'momo' | 'instacash' | 'cash' > ('momo');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const handleMakeContribution = () => {
    if (!contributionAmount || !reference) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    Alert.alert(
      'Contribution Submitted',
      `Your contribution of E${contributionAmount} has been submitted. Please upload your payment proof to complete the transaction.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upload Proof', onPress: () => console.log('Upload proof') },
      ]
    );

    // Reset form
    setContributionAmount('');
    setReference('');
    setNotes('');
  };

  const handleUploadProof = () => {
    Alert.alert(
      'Upload Payment Proof',
      'Payment proof upload functionality would be implemented here. You can take a photo of your receipt or upload from gallery.',
      [
        { text: 'Take Photo', onPress: () => console.log('Take photo') },
        { text: 'Choose from Gallery', onPress: () => console.log('Choose from gallery') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text type="title" style={styles.headerTitle}>
          Make Contribution
        </Text>
        <Text style={styles.headerSubtitle}>
          Contribute to your group savings
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
                Monthly Contribution: E500 | Next Due: 2024-07-15
              </Text>
            </View>
          </View>

          {/* Contribution Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contribution Amount (E) *</Text>
            <TextInput
              style={[
                styles.textInput
              ]}
              value={contributionAmount}
              onChangeText={setContributionAmount}
              placeholder="500"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            <Text style={styles.inputHint}>
              Standard monthly contribution: E500
            </Text>
          </View>

          {/* Payment Method */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Payment Method *</Text>
            <View style={styles.paymentMethodSelector}>
              <TouchableOpacity
                style={[
                  styles.paymentMethodOption,
                  paymentMethod === 'momo' && styles.paymentMethodOptionSelected,
                ]}
                onPress={() => setPaymentMethod('momo')}
              >
                <Icons.Feather name="phone" size={20} color={paymentMethod === 'momo' ? '#fff' : '#2196F3'} />
                <Text
                  style={[
                    styles.paymentMethodText,
                    paymentMethod === 'momo' && styles.paymentMethodTextSelected,
                  ]}
                >
                  MoMo Stofella
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentMethodOption,
                  paymentMethod === 'instacash' && styles.paymentMethodOptionSelected,
                ]}
                onPress={() => setPaymentMethod('instacash')}
              >
                <Icons.Entypo name="credit-card" size={20} color={paymentMethod === 'instacash' ? '#fff' : '#4CAF50'} />
                <Text
                  style={[
                    styles.paymentMethodText,
                    paymentMethod === 'instacash' && styles.paymentMethodTextSelected,
                  ]}
                >
                  InstaCash
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentMethodOption,
                  paymentMethod === 'cash' && styles.paymentMethodOptionSelected,
                ]}
                onPress={() => setPaymentMethod('cash')}
              >
                <Icons.FontAwesome name="money" size={20} color={paymentMethod === 'cash' ? '#fff' : '#FF9800'} />
                <Text
                  style={[
                    styles.paymentMethodText,
                    paymentMethod === 'cash' && styles.paymentMethodTextSelected,
                  ]}
                >
                  Cash
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Reference Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Transaction Reference *</Text>
            <TextInput
              style={[
                styles.textInput,
              ]}
              value={reference}
              onChangeText={setReference}
              placeholder="Enter transaction reference number"
              placeholderTextColor="#999"
            />
            <Text style={styles.inputHint}>
              This is the reference number from your payment receipt
            </Text>
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notes (Optional)</Text>
            <TextInput
              style={[
                styles.textArea,
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any additional notes..."
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
            />
          </View>

          {/* Payment Instructions */}
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>Payment Instructions</Text>
            {paymentMethod === 'momo' && (
              <View style={styles.instructionsContent}>
                <Text style={styles.instructionStep}>1. Open MoMo Stofella app</Text>
                <Text style={styles.instructionStep}>2. Select "Send Money"</Text>
                <Text style={styles.instructionStep}>3. Enter group account: +268 7612 3456</Text>
                <Text style={styles.instructionStep}>4. Enter amount: E{contributionAmount || '500'}</Text>
                <Text style={styles.instructionStep}>5. Add reference: {reference || 'Your reference'}</Text>
                <Text style={styles.instructionStep}>6. Complete transaction</Text>
              </View>
            )}
            {paymentMethod === 'instacash' && (
              <View style={styles.instructionsContent}>
                <Text style={styles.instructionStep}>1. Open InstaCash app</Text>
                <Text style={styles.instructionStep}>2. Select "Transfer"</Text>
                <Text style={styles.instructionStep}>3. Enter group account: 1234567890</Text>
                <Text style={styles.instructionStep}>4. Enter amount: E{contributionAmount || '500'}</Text>
                <Text style={styles.instructionStep}>5. Add reference: {reference || 'Your reference'}</Text>
                <Text style={styles.instructionStep}>6. Complete transaction</Text>
              </View>
            )}
            {paymentMethod === 'cash' && (
              <View style={styles.instructionsContent}>
                <Text style={styles.instructionStep}>1. Contact group treasurer</Text>
                <Text style={styles.instructionStep}>2. Arrange cash handover</Text>
                <Text style={styles.instructionStep}>3. Get receipt with reference number</Text>
                <Text style={styles.instructionStep}>4. Upload receipt as proof</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.contributeButton} onPress={handleMakeContribution}>
              <Text style={styles.contributeButtonText}>Submit Contribution</Text>
              <Icons.MaterialIcons name="keyboard-arrow-right" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadButton} onPress={handleUploadProof}>
              <Icons.AntDesign name="camerao" size={20} color="#4CAF50" />
              <Text style={styles.uploadButtonText}>Upload Payment Proof</Text>
            </TouchableOpacity>
          </View>
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
  paymentMethodSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentMethodOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  paymentMethodOptionSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
    color: '#333',
  },
  paymentMethodTextSelected: {
    color: '#fff',
  },
  instructionsCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  instructionsContent: {
    gap: 6,
  },
  instructionStep: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButtons: {
    gap: 12,
  },
  contributeButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  contributeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  uploadButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
