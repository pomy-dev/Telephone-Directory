import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Icons } from '../../constants/Icons';
import { AppContext } from '../../context/appContext';
import { AuthContext } from '../../context/authProvider';

// Mock user data
const mockUser = {
  id: '1',
  name: 'Thabo Mthembu',
  email: 'thabo.mthembu@email.com',
  phone: '+268 7612 3456',
  profilePicture: null,
  joinedGroups: 3,
  totalContributed: 15000,
  totalBorrowed: 5000,
  totalRepaid: 5000,
  creditScore: 85,
  memberSince: '2023-01-15',
};

export default function MemberProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(mockUser);
  const [tempData, setTempData] = useState(mockUser);

  const handleEdit = () => {
    setIsEditing(true);
    setTempData(userData);
  };

  const handleSave = () => {
    setUserData(tempData);
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleCancel = () => {
    setTempData(userData);
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'Password change functionality would be implemented here with proper authentication.',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => console.log('Logout') },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text type="title" style={styles.headerTitle}>
          Profile
        </Text>
        <Text style={styles.headerSubtitle}>
          Manage your account settings
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          <View style={styles.profilePictureContainer}>
            {userData.profilePicture ? (
              <View style={styles.profilePicture}>
                {/* Profile picture would be displayed here */}
                <Icons.Ionicons name="person-circle-outline" size={60} color="#fff" />
              </View>
            ) : (
              <View style={styles.profilePicturePlaceholder}>
                <Icons.Ionicons name="person-outline" size={60} color="#666" />
              </View>
            )}
            <TouchableOpacity style={styles.changePictureButton}>
              <Icons.AntDesign name='camerao' size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icons.Ionicons name="person-circle-outline" size={24} color="#4CAF50" />
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{userData.joinedGroups}</Text>
              <Text style={styles.statLabel}>Groups Joined</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <Icons.MaterialIcons name="money" size={24} color="#2196F3" />
            <View style={styles.statContent}>
              <Text style={styles.statValue}>E{userData.totalContributed}</Text>
              <Text style={styles.statLabel}>Total Contributed</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <Icons.Entypo name="star-outline" size={24} color="#FF9800" />
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{userData.creditScore}</Text>
              <Text style={styles.statLabel}>Credit Score</Text>
            </View>
          </View>
        </View>

        {/* Profile Information */}
        <View style={styles.infoContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            {!isEditing ? (
              <TouchableOpacity onPress={handleEdit}>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity onPress={handleSave}>
                  <Text style={styles.saveButton}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCancel}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            {isEditing ? (
              <TextInput
                style={[
                  styles.textInput,
                ]}
                value={tempData.name}
                onChangeText={(text) => setTempData({ ...tempData, name: text })}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.inputValue}>{userData.name}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            {isEditing ? (
              <TextInput
                style={[
                  styles.textInput,
                ]}
                value={tempData.email}
                onChangeText={(text) => setTempData({ ...tempData, email: text })}
                placeholder="Enter your email"
                keyboardType="email-address"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.inputValue}>{userData.email}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            {isEditing ? (
              <TextInput
                style={[
                  styles.textInput,
                ]}
                value={tempData.phone}
                onChangeText={(text) => setTempData({ ...tempData, phone: text })}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.inputValue}>{userData.phone}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Member Since</Text>
            <Text style={styles.inputValue}>{userData.memberSince}</Text>
          </View>
        </View>

        {/* Financial Summary */}
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>

          <View style={styles.financialItem}>
            <Icons.Feather name="arrow-up" size={20} color="#4CAF50" />
            <View style={styles.financialContent}>
              <Text style={styles.financialLabel}>Total Contributed</Text>
              <Text style={styles.financialValue}>E{userData.totalContributed}</Text>
            </View>
          </View>

          <View style={styles.financialItem}>
            <Icons.Feather name="arrow-down" size={20} color="#FF9800" />
            <View style={styles.financialContent}>
              <Text style={styles.financialLabel}>Total Borrowed</Text>
              <Text style={styles.financialValue}>E{userData.totalBorrowed}</Text>
            </View>
          </View>

          <View style={styles.financialItem}>
            <Icons.Feather name="check-circle" size={20} color="#2196F3" />
            <View style={styles.financialContent}>
              <Text style={styles.financialLabel}>Total Repaid</Text>
              <Text style={styles.financialValue}>E{userData.totalRepaid}</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <TouchableOpacity style={styles.settingItem} onPress={handleChangePassword}>
            <Icons.Entypo name="key" size={20} color="#666" />
            <Text style={styles.settingLabel}>Change Password</Text>
            <Icons.Feather name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Icons.FontAwesome5 name="bell" size={20} color="#666" />
            <Text style={styles.settingLabel}>Notifications</Text>
            <Icons.Feather name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Icons.MaterialIcons name="security" size={20} color="#666" />
            <Text style={styles.settingLabel}>Privacy & Security</Text>
            <Icons.Feather name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Icons.Entypo name="help" size={20} color="#666" />
            <Text style={styles.settingLabel}>Help & Support</Text>
            <Icons.Feather name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icons.AntDesign name="logout" size={20} color="#fff" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
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
  profilePictureSection: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePicturePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePictureButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statContent: {
    marginLeft: 8,
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputValue: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  financialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  financialContent: {
    flex: 1,
    marginLeft: 12,
  },
  financialLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  financialValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f44336',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
