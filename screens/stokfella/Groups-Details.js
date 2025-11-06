import React, { useState } from 'react';
import { StyleSheet, StatusBar, ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Avatar } from 'react-native-paper';
import { Icons } from '../../constants/Icons';
import { Images } from '../../constants/Images';
import { MoreDropdown } from '../../components/moreDropDown';
import { AppContext } from '../../context/appContext';
import { AuthContext } from '../../context/authProvider';

// Mock data for group details
const mockGroupDetails = {
  id: '1',
  name: 'Christmas Savings 2024',
  admin: 'Thabo Mthembu',
  totalMembers: 12,
  monthlyContribution: 500,
  totalSaved: 6000,
  duration: 12,
  currentMonth: 6,
  type: 'savings',
  interestRate: 0,
  nextContribution: '2024-07-15',
  savingsAccount: 'MoMo Stofella',
  description: 'A savings group for Christmas expenses. Members contribute monthly and receive their share at the end of the year.',
  members: [
    {
      id: '1',
      name: 'Thabo Mthembu',
      role: 'admin',
      contributions: 6,
      totalContributed: 3000,
      status: 'active',
      joinDate: '2024-01-15',
    },
    {
      id: '2',
      name: 'Sipho Dlamini',
      role: 'treasurer',
      contributions: 6,
      totalContributed: 3000,
      status: 'active',
      joinDate: '2024-01-20',
    },
    {
      id: '3',
      name: 'Nomsa Khumalo',
      role: 'secretary',
      contributions: 5,
      totalContributed: 2500,
      status: 'active',
      joinDate: '2024-02-01',
    },
    {
      id: '4',
      name: 'Mandla Nkosi',
      role: 'member',
      contributions: 4,
      totalContributed: 2000,
      status: 'pending',
      joinDate: '2024-02-15',
    },
  ],
  recentTransactions: [
    {
      id: '1',
      type: 'contribution',
      member: 'Sipho Dlamini',
      amount: 500,
      date: '2024-06-15',
      status: 'completed',
    },
    {
      id: '2',
      type: 'contribution',
      member: 'Nomsa Khumalo',
      amount: 500,
      date: '2024-06-10',
      status: 'completed',
    },
  ],
};

export default function GroupDetailsScreen({ navigation }) {
  const { theme, isDarkMode } = React.useContext(AppContext)
  const { user } = React.useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('overview');

  const handleMemberPress = (member) => {
    Alert.alert(
      member.name,
      `Role: ${member.role}\n
       Contributions: ${member.contributions}/${mockGroupDetails.currentMonth}\n
       Total Contributed: E${member.totalContributed}\n
       Status: ${member.status}\n
       Joined: ${member.joinDate}
      `,
      [{ text: 'OK' }]
    );
  };

  const handleVoteForRole = (memberId, role) => {
    Alert.alert(
      'Vote for Role',
      `Vote for ${mockGroupDetails.members.find(m => m.id === memberId)?.name} as ${role}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Vote', onPress: () => console.log(`Voted for ${memberId} as ${role}`) },
      ]
    );
  };

  const handleAddMember = () => {
    Alert.alert(
      'Add Member',
      'Member invitation functionality would be implemented here.',
      [{ text: 'OK' }]
    );
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Group Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icons.FontAwesome6 name="people-group" size={24} color="#4CAF50" />
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{mockGroupDetails.totalMembers}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <Icons.MaterialIcons name="money" size={24} color="#2196F3" />
          <View style={styles.statContent}>
            <Text style={styles.statValue}>E{mockGroupDetails.totalSaved}</Text>
            <Text style={styles.statLabel}>Total Saved</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <Icons.Ionicons name="calendar-outline" size={24} color="#FF9800" />
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{mockGroupDetails.currentMonth}/{mockGroupDetails.duration}</Text>
            <Text style={styles.statLabel}>Months</Text>
          </View>
        </View>
      </View>

      {/* Group Accruals */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icons.MaterialCommunityIcons name="cash-refund" size={24} color="#2908bdff" />
          <View style={styles.statContent}>
            <Text style={styles.statValue}>E9000</Text>
            <Text style={styles.statLabel}>Accruals</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <Icons.AntDesign name="aim" size={24} color="#ba097fff" />
          <View style={styles.statContent}>
            <Text style={styles.statValue}>E24000</Text>
            <Text style={styles.statLabel}>Targeted Amount</Text>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Group Progress</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(mockGroupDetails.currentMonth / mockGroupDetails.duration) * 100}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round((mockGroupDetails.currentMonth / mockGroupDetails.duration) * 100)}% Complete
        </Text>
      </View>

      {/* Group Info */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Group Information</Text>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Monthly Contribution</Text>
          <Text style={styles.infoValue}>E{mockGroupDetails.monthlyContribution}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Savings Account</Text>
          <Text style={styles.infoValue}>{mockGroupDetails.savingsAccount}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Is Account Transferable</Text>
          <Text style={styles.infoValue}>Yes/No</Text>
        </View>

        <View style={[styles.cardDescription, { backgroundColor: theme.colors.sub_card }]}>
          <Text style={[{ textAlign: 'center', color: theme.colors.text, fontSize: 20 }]}>Description</Text>
          <Text style={styles.infoDescription}>{mockGroupDetails.description}</Text>
        </View>

      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#ce701dff' }]} onPress={() => navigation.navigate('MakeLoan', { mode: 'request' })}>
            <Icons.Entypo name="hand" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Request Loan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#954cafff' }]} onPress={() => navigation.navigate('MakeLoan', { mode: 'repay', loadId: 2 })}>
            <Icons.MaterialCommunityIcons name="cash-refund" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Manage Loan</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.actionButtonSecondary} onPress={() => navigation.navigate('PaySubscription')}>
          <Icons.Feather name="plus" size={20} color="#4CAF50" />
          <Text style={styles.actionButtonTextSecondary}>Make Subscription</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMembers = () => (
    <View style={styles.tabContent}>
      <View style={styles.membersHeader}>
        <Text style={styles.sectionTitle}>Group Members</Text>
        <TouchableOpacity style={styles.addMemberButton} onPress={handleAddMember}>
          <Icons.Feather name="plus" size={16} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {mockGroupDetails.members.map((member) => (
        <TouchableOpacity
          key={member.id}
          style={[
            styles.memberCard,
          ]}
          onPress={() => handleMemberPress(member)}
        >
          <View style={styles.memberInfo}>
            <View style={styles.memberAvatar}>
              <Icons.FontAwesome6 name="person" size={24} color="#666" />
            </View>
            <View style={styles.memberDetails}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberRole}>{member.role}</Text>
            </View>
          </View>
          <View style={styles.memberActions}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: member.status === 'active' ? '#4CAF50' : '#FF9800' },
              ]}
            >
              <Text style={styles.statusText}>{member.status}</Text>
            </View>
            {member.role === 'member' && (
              <TouchableOpacity
                style={styles.voteButton}
                onPress={() => handleVoteForRole(member.id, 'treasurer')}
              >
                <Icons.Entypo name="thumbs-up" size={16} color="#4CAF50" />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTransactions = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      {mockGroupDetails.recentTransactions.map((transaction) => (
        <View
          key={transaction.id}
          style={[
            styles.transactionCard,
          ]}
        >
          <View style={styles.transactionInfo}>
            <Icons.Feather name="plus" size={20} color="#4CAF50" />
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionMember}>{transaction.member}</Text>
              <Text style={styles.transactionType}>Contribution</Text>
            </View>
          </View>
          <View style={styles.transactionAmount}>
            <Text style={styles.amountText}>E{transaction.amount}</Text>
            <Text style={styles.dateText}>{transaction.date}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.Ionicons name='arrow-back' size={24} color='#0000' />
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: '10', alignItems: 'center' }}>
          <Avatar.Image source={Images.stokfela} width={40} size={40} />
          <Text type="title" style={styles.headerTitle}>
            {mockGroupDetails.name}
          </Text>
        </View>

        <MoreDropdown
          items={[
            {
              title: 'Group Account',
              icon: 'Entypo',
              iconName: 'credit-card',
              onPress: () => console.log('Group Account'),
            },
            {
              title: 'Set Conditions',
              icon: 'MaterialIcons',
              iconName: 'display-settings',
              onPress: () => console.log('Set Rules'),
            },
            {
              title: 'Admin Outline',
              icon: 'MaterialCommunityIcons',
              iconName: 'account-cog-outline',
              onPress: () => console.log('Admin Outline'),
            },
            {
              title: 'Add Member',
              icon: 'AntDesign',
              iconName: 'user-add',
              onPress: () => console.log('Add user')
            },
            {
              title: 'Leave Group',
              icon: 'AntDesign',
              iconName: 'logout',
              onPress: () =>
                Alert.alert(
                  'Leave Group',
                  'Are you sure you want to leave this group?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Leave', style: 'destructive' },
                  ]
                ),
            },
          ]}
        />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'members', label: 'Members' },
          { key: 'transactions', label: 'Transactions' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === tab.key && styles.tabButtonTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'members' && renderMembers()}
        {activeTab === 'transactions' && renderTransactions()}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 200,
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#4CAF50',
  },
  tabButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  scrollView: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 20
  },
  tabContent: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
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
  progressSection: {
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  infoSection: {
    padding: 5,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d0ceceff',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  cardDescription: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
    padding: 6
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 8,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 60,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  actionButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtonTextSecondary: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addMemberButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberCard: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: '#c3c1c1ff',
    borderBottomWidth: 1,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dbdbdbff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  memberStats: {
    fontSize: 12,
    color: '#999',
  },
  memberActions: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  voteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionDetails: {
    marginLeft: 12,
  },
  transactionMember: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  transactionType: {
    fontSize: 14,
    color: '#666',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
});
