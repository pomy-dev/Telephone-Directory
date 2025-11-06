import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  StatusBar,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import { Icons } from '../../constants/Icons';
import { AppContext } from '../../context/appContext';
import { AuthContext } from '../../context/authProvider';
import { Images } from '../../constants/Images';

const PAYMENT_METHODS = [
  {
    id: 'momo',
    name: 'MoMo Stofella',
    logo: Images.momo,
    account: 'Mobile Money',
  },
  {
    id: 'instacash',
    name: 'InstaCash',
    logo: Images.instacash,
    account: 'Digital Wallet',
  },
  {
    id: 'bank',
    name: 'Building Society',
    logo: Images.buildingSociety,
    account: 'Direct Wallet',
  },
  {
    id: 'cash',
    name: 'Cash',
    logo: Images.cash,
    account: 'Cash Deposit',
  },
];

export default function CreateStokfelaScreen({ navigation }) {
  const { theme, isDarkMode } = useContext(AppContext);
  const { user } = useContext(AuthContext);

  // === Form State ===
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [groupType, setGroupType] = useState('savings');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [duration, setDuration] = useState('');
  const [maxMembers, setMaxMembers] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0]);

  // === Step & Modal ===
  const [step, setStep] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);

  // === Validation ===
  const validateStep = (s) => {
    if (s === 1) return groupName.trim() !== '';
    if (s === 2)
      return (
        monthlyContribution && duration && maxMembers &&
        (groupType !== 'lending' || interestRate)
      );
    return true;
  };

  const goNext = () => {
    if (validateStep(step)) setStep(step + 1);
    else Alert.alert('Missing Fields', 'Please complete all required fields.');
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
    else navigation.goBack();
  };

  const handleCreateGroup = () => {
    Alert.alert(
      'Group Created!',
      `"${groupName}" has been created successfully.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  /* ---------------------------------------------------- */
  /*   Progress bar with lines between every step        */
  /* ---------------------------------------------------- */
  const renderProgress = () => {
    const steps = [1, 2, 3];
    return (
      <View style={styles.progressContainer}>
        {steps.map((s, idx) => (
          <React.Fragment key={s}>
            <View style={styles.progressStep}>
              <View
                style={[
                  styles.progressDot,
                  step >= s && styles.progressDotActive,
                ]}
              />
              <Text
                style={[
                  styles.progressLabel,
                  step >= s && styles.progressLabelActive,
                ]}
              >
                {s === 1 ? 'Basic' : s === 2 ? 'Settings' : 'Review'}
              </Text>
            </View>

            {idx < steps.length - 1 && (
              <View
                style={[
                  styles.progressLine,
                  step > s && styles.progressLineActive,
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack}>
          <Icons.Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Group</Text>
        <Icons.FontAwesome6 name="group-arrows-rotate" size={32} color="#4CAF50" />
      </View>

      {/* Progress Indicator */}
      {renderProgress()}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* ================== STEP 1: Basic Info ================== */}
          {step === 1 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icons.AntDesign name="info-circle" size={20} color="#4CAF50" />
                <Text style={styles.sectionTitle}>Basic Information</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Group Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={groupName}
                  onChangeText={setGroupName}
                  placeholder="e.g., Christmas Savings 2024"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={styles.textArea}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe the purpose..."
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          )}

          {/* ================== STEP 2: Settings ================== */}
          {step === 2 && (
            <>
              {/* Group Type */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icons.EvilIcons name="gear" size={20} color="#4CAF50" />
                  <Text style={styles.sectionTitle}>Group Type</Text>
                </View>

                <View style={styles.typeSelector}>
                  {['savings', 'lending'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeOption,
                        groupType === type && styles.typeOptionSelected,
                      ]}
                      onPress={() => setGroupType(type)}
                    >
                      <View style={styles.typeOptionHeader}>
                        <View style={styles.typeIconContainer}>
                          <Icons.FontAwesome
                            name={type === 'savings' ? 'money' : 'hand-holding-usd'}
                            size={24}
                            color={groupType === type ? '#fff' : '#4CAF50'}
                          />
                        </View>
                        <Text
                          style={[
                            styles.typeOptionText,
                            groupType === type && styles.typeOptionTextSelected,
                          ]}
                        >
                          {type === 'savings' ? 'Savings Only' : 'Lending Circle'}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.typeOptionSubtext,
                          groupType === type && styles.typeOptionSubtextSelected,
                        ]}
                      >
                        {type === 'savings'
                          ? 'Members save and share at end'
                          : 'Members can borrow with interest'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Financial Settings */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icons.FontAwesome name="dollar" size={20} color="#4CAF50" />
                  <Text style={styles.sectionTitle}>Financial Settings</Text>
                </View>

                <View style={styles.inputRow}>
                  <View style={styles.inputGroupHalf}>
                    <Text style={styles.inputLabel}>Monthly (E) *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={monthlyContribution}
                      onChangeText={setMonthlyContribution}
                      placeholder="500"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.inputGroupHalf}>
                    <Text style={styles.inputLabel}>Duration (mo) *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={duration}
                      onChangeText={setDuration}
                      placeholder="12"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Max Members *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={maxMembers}
                    onChangeText={setMaxMembers}
                    placeholder="10"
                    keyboardType="numeric"
                  />
                </View>

                {groupType === 'lending' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Interest Rate (%)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={interestRate}
                      onChangeText={setInterestRate}
                      placeholder="5"
                      keyboardType="numeric"
                    />
                  </View>
                )}
              </View>

              {/* Payment Method */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icons.Entypo name="credit-card" size={20} color="#4CAF50" />
                  <Text style={styles.sectionTitle}>Payment Method</Text>
                </View>

                <TouchableOpacity
                  style={styles.accountOption}
                  onPress={() => setModalVisible(true)}
                >
                  <Image source={selectedPayment.logo} style={styles.paymentLogo} />
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountOptionText}>{selectedPayment.name}</Text>
                    <Text style={styles.accountOptionSubtext}>{selectedPayment.account}</Text>
                  </View>
                  <Icons.Feather name="chevron-right" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ================== STEP 3: REVIEW (Full UI) ================== */}
          {step === 3 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icons.Feather name="check-square" size={20} color="#4CAF50" />
                <Text style={styles.sectionTitle}>Review & Confirm</Text>
              </View>

              {/* Group Info */}
              <View style={styles.reviewGroup}>
                <Text style={styles.reviewGroupTitle}>Group Details</Text>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Name</Text>
                  <Text style={styles.reviewValue}>{groupName}</Text>
                </View>
                {description ? (
                  <View style={styles.reviewItem}>
                    <Text style={styles.reviewLabel}>Description</Text>
                    <Text style={styles.reviewValue}>{description}</Text>
                  </View>
                ) : null}
              </View>

              {/* Type */}
              <View style={styles.reviewGroup}>
                <Text style={styles.reviewGroupTitle}>Group Type</Text>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Type</Text>
                  <Text style={styles.reviewValue}>
                    {groupType === 'savings' ? 'Savings Only' : 'Lending Circle'}
                  </Text>
                </View>
                {groupType === 'lending' && (
                  <View style={styles.reviewItem}>
                    <Text style={styles.reviewLabel}>Interest Rate</Text>
                    <Text style={styles.reviewValue}>{interestRate}%</Text>
                  </View>
                )}
              </View>

              {/* Financials */}
              <View style={styles.reviewGroup}>
                <Text style={styles.reviewGroupTitle}>Financial Settings</Text>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Monthly Contribution</Text>
                  <Text style={styles.reviewValue}>E{monthlyContribution}</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Duration</Text>
                  <Text style={styles.reviewValue}>{duration} months</Text>
                </View>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Max Members</Text>
                  <Text style={styles.reviewValue}>{maxMembers}</Text>
                </View>
              </View>

              {/* Payment */}
              <View style={styles.reviewGroup}>
                <Text style={styles.reviewGroupTitle}>Payment Method</Text>
                <View style={styles.reviewItem}>
                  <Text style={styles.reviewLabel}>Selected</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={selectedPayment.logo} style={styles.reviewLogo} />
                    <Text style={styles.reviewValue}>{selectedPayment.name}</Text>
                  </View>
                </View>
              </View>

              {/* Final Confirmation */}
              <View style={styles.confirmBox}>
                <Icons.Feather name="shield" size={20} color="#4CAF50" />
                <Text style={styles.confirmText}>
                  By creating this group, you agree to the Stokfella terms and conditions.
                </Text>
              </View>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonRow}>
            {step > 1 && (
              <TouchableOpacity style={styles.backButton} onPress={goBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            {step < 3 ? (
              <TouchableOpacity style={styles.nextButton} onPress={goNext}>
                <Text style={styles.nextButtonText}>Next</Text>
                <Icons.Feather name="arrow-right" size={20} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
                <Text style={styles.createButtonText}>Create Group</Text>
                <Icons.Feather name="check" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* ================== CENTERED MODAL ================== */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Payment Method</Text>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedPayment(method);
                  setModalVisible(false);
                }}
              >
                <Image source={method.logo} style={styles.paymentLogo} />
                <View style={styles.modalOptionText}>
                  <Text style={styles.modalOptionTitle}>{method.name}</Text>
                  <Text style={styles.modalOptionSub}>{method.account}</Text>
                </View>
                {selectedPayment.id === method.id && (
                  <Icons.Feather name="check-circle" size={24} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ===================================================== */
/*                       STYLES                          */
/* ===================================================== */
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#212529' },

  /* Progress */
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  progressStep: { alignItems: 'center', flex: 1 },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e9ecef',
    marginBottom: 8,
  },
  progressDotActive: { backgroundColor: '#4CAF50' },
  progressLine: {
    height: 2,
    backgroundColor: '#e9ecef',
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 6,
  },
  progressLineActive: { backgroundColor: '#4CAF50' },
  progressLabel: { fontSize: 12, color: '#6c757d', fontWeight: '500' },
  progressLabelActive: { color: '#4CAF50', fontWeight: '600' },

  scrollView: { flex: 1, paddingHorizontal: 10 },
  formContainer: {
    gap: 20, paddingBottom: 40,
    paddingTop: 20
  },

  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#212529', marginLeft: 8 },

  inputGroup: { marginBottom: 16 },
  inputRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  inputGroupHalf: { flex: 1 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#495057', marginBottom: 8 },
  textInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    height: 80,
    textAlignVertical: 'top',
  },

  /* Group Type */
  typeSelector: { gap: 12 },
  typeOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  typeOptionSelected: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  typeOptionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  typeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  typeOptionText: { fontSize: 16, fontWeight: '700', color: '#212529' },
  typeOptionTextSelected: { color: '#fff' },
  typeOptionSubtext: { fontSize: 14, color: '#6c757d', lineHeight: 20 },
  typeOptionSubtextSelected: { color: '#fff' },

  /* Payment */
  accountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  paymentLogo: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  accountInfo: { flex: 1 },
  accountOptionText: { fontSize: 16, fontWeight: '600', color: '#212529' },
  accountOptionSubtext: { fontSize: 14, color: '#6c757d' },

  /* Review Section */
  reviewGroup: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reviewGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 12,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  reviewLabel: { fontSize: 15, color: '#666' },
  reviewValue: { fontSize: 15, fontWeight: '600', color: '#212529', flexShrink: 1, textAlign: 'right' },
  reviewLogo: { width: 24, height: 24, marginRight: 8 },

  confirmBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  confirmText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },

  /* Buttons */
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  backButtonText: { color: '#666', fontWeight: '600' },
  nextButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: { color: '#fff', fontWeight: '700', marginRight: 8 },
  createButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: { color: '#fff', fontSize: 18, fontWeight: '700', marginRight: 8 },

  /* Centered Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#212529',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
  },
  modalOptionText: { flex: 1, marginLeft: 12 },
  modalOptionTitle: { fontSize: 16, fontWeight: '600' },
  modalOptionSub: { fontSize: 14, color: '#666' },
  modalClose: {
    padding: 12,
    alignItems: 'center',
  },
  modalCloseText: { color: '#666', fontWeight: '600' },
});