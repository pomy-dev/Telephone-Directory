import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Icons } from '../../constants/Icons';
import { AppContext } from '../../context/appContext';
import { AuthContext } from '../../context/authProvider';

export default function CreateStokfelaScreen() {
  const { theme, isDarkMode } = useContext(AppContext)
  const { user } = useContext(AuthContext)
  const [groupName, setGroupName] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');
  const [duration, setDuration] = useState('');
  const [maxMembers, setMaxMembers] = useState('');
  const [groupType, setGroupType] = useState('savings');
  const [interestRate, setInterestRate] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateGroup = () => {
    if (!groupName || !monthlyContribution || !duration || !maxMembers) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    Alert.alert(
      'Group Created!',
      `Your group "${groupName}" has been created successfully. You can now invite members to join.`,
      [{ text: 'OK' }]
    );

    // Reset form
    setGroupName('');
    setMonthlyContribution('');
    setDuration('');
    setMaxMembers('');
    setInterestRate('');
    setDescription('');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text type="title" style={styles.headerTitle}>
            Create New Group
          </Text>
          <Text style={styles.headerSubtitle}>
            Start your traditional money scheme
          </Text>
        </View>
        <View style={styles.headerIcon}>
          <Icons.Ionicons name="plus" size={32} color="#4CAF50" />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressStep}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <Text style={styles.progressLabel}>Basic Info</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <View style={styles.progressDot} />
            <Text style={styles.progressLabel}>Settings</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={styles.progressStep}>
            <View style={styles.progressDot} />
            <Text style={styles.progressLabel}>Review</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          {/* Section 1: Basic Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icons.AntDesign name="info-circle" size={20} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Basic Information</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Group Name *</Text>
              <TextInput
                style={[
                  styles.textInput
                ]}
                value={groupName}
                onChangeText={setGroupName}
                placeholder="e.g., Christmas Savings 2024"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[
                  styles.textArea,
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the purpose of this group..."
                multiline
                numberOfLines={3}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Section 2: Group Type */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icons.EvilIcons name="gear" size={20} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Group Type</Text>
            </View>

            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  groupType === 'savings' && styles.typeOptionSelected,
                ]}
                onPress={() => setGroupType('savings')}
              >
                <View style={styles.typeOptionHeader}>
                  <View style={styles.typeIconContainer}>
                    <Icons.FontAwesome
                      name="money"
                      size={24}
                      color={groupType === 'savings' ? '#fff' : '#4CAF50'}
                    />
                  </View>
                  <Text
                    style={[
                      styles.typeOptionText,
                      groupType === 'savings' && styles.typeOptionTextSelected,
                    ]}
                  >
                    Savings Only
                  </Text>
                </View>
                <Text
                  style={[
                    styles.typeOptionSubtext,
                    groupType === 'savings' && styles.typeOptionSubtextSelected,
                  ]}
                >
                  Members save together and share at the end
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeOption,
                  groupType === 'lending' && styles.typeOptionSelected,
                ]}
                onPress={() => setGroupType('lending')}
              >
                <View style={styles.typeOptionHeader}>
                  <View style={styles.typeIconContainer}>
                    <Icons.Entypo
                      name="hand"
                      size={24}
                      color={groupType === 'lending' ? '#fff' : '#FF9800'}
                    />
                  </View>
                  <Text
                    style={[
                      styles.typeOptionText,
                      groupType === 'lending' && styles.typeOptionTextSelected,
                    ]}
                  >
                    Lending Circle
                  </Text>
                </View>
                <Text
                  style={[
                    styles.typeOptionSubtext,
                    groupType === 'lending' && styles.typeOptionSubtextSelected,
                  ]}
                >
                  Members can borrow with interest
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section 3: Financial Settings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icons.FontAwesome name="dollar" size={20} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Financial Settings</Text>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroupHalf}>
                <Text style={styles.inputLabel}>Monthly Contribution (E) *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                  ]}
                  value={monthlyContribution}
                  onChangeText={setMonthlyContribution}
                  placeholder="500"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.inputGroupHalf}>
                <Text style={styles.inputLabel}>Duration (months) *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                  ]}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="12"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Maximum Members *</Text>
              <TextInput
                style={[
                  styles.textInput,
                ]}
                value={maxMembers}
                onChangeText={setMaxMembers}
                placeholder="10"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            {/* Interest Rate (only for lending groups) */}
            {groupType === 'lending' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Interest Rate (%)</Text>
                <TextInput
                  style={[
                    styles.textInput,
                  ]}
                  value={interestRate}
                  onChangeText={setInterestRate}
                  placeholder="5"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            )}
          </View>

          {/* Section 4: Payment Method */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icons.Entypo name="credit-card" size={20} color="#4CAF50" />
              <Text style={styles.sectionTitle}>Payment Method</Text>
            </View>

            <View style={styles.accountSelector}>
              <TouchableOpacity style={styles.accountOption}>
                <View style={styles.accountIconContainer}>
                  <Icons.Feather name="phone.fill" size={20} color="#2196F3" />
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountOptionText}>MoMo Stofella</Text>
                  <Text style={styles.accountOptionSubtext}>Mobile Money</Text>
                </View>
                <View style={styles.accountCheck}>
                  <Icons.Feather name="check-circle" size={20} color="#4CAF50" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.accountOption}>
                <View style={styles.accountIconContainer}>
                  <Icons.Entypo name="credit-card" size={20} color="#4CAF50" />
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountOptionText}>InstaCash</Text>
                  <Text style={styles.accountOptionSubtext}>Digital Wallet</Text>
                </View>
                <View style={styles.accountCheck}>
                  <Icons.Feather name="circle" size={20} color="#ccc" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Create Button */}
          <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
            <Text style={styles.createButtonText}>Create Group</Text>
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  headerIcon: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e9ecef',
    marginBottom: 8,
  },
  progressDotActive: {
    backgroundColor: '#4CAF50',
  },
  progressLine: {
    height: 2,
    backgroundColor: '#e9ecef',
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  formContainer: {
    gap: 20,
    paddingBottom: 40,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputGroupHalf: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#212529',
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
    color: '#212529',
  },
  typeSelector: {
    gap: 12,
  },
  typeOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  typeOptionSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  typeOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  typeOptionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
  },
  typeOptionTextSelected: {
    color: '#fff',
  },
  typeOptionSubtext: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  typeOptionSubtextSelected: {
    color: '#fff',
  },
  accountSelector: {
    gap: 12,
  },
  accountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  accountIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  accountOptionSubtext: {
    fontSize: 14,
    color: '#6c757d',
  },
  accountCheck: {
    padding: 4,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
});
