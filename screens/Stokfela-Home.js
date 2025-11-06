import React from 'react';
import { StyleSheet, StatusBar, ScrollView, View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { Avatar } from 'react-native-paper';
import { MoreDropdown } from '../components/moreDropDown';
import { Icons } from '../constants/Icons';
import { Images } from '../constants/Images';
import { AppContext } from '../context/appContext';
import { AuthContext } from '../context/authProvider';

// Mock data for groups
const mockGroups = [
  {
    id: '1',
    name: 'Christmas Savings 2024',
    totalMembers: 12,
    monthlyContribution: 500,
    totalSaved: 6000,
    duration: 12,
    currentMonth: 6,
    type: 'savings',
    admin: 'Thabo Mthembu',
    nextContribution: '2024-07-15',
  },
  {
    id: '2',
    name: 'Emergency Fund Circle',
    totalMembers: 8,
    monthlyContribution: 300,
    totalSaved: 2400,
    duration: 8,
    currentMonth: 3,
    type: 'lending',
    admin: 'Sipho Dlamini',
    nextContribution: '2024-07-20',
  },
  {
    id: '3',
    name: 'Wedding Fund Group',
    totalMembers: 15,
    monthlyContribution: 800,
    totalSaved: 12000,
    duration: 15,
    currentMonth: 8,
    type: 'savings',
    admin: 'Nomsa Khumalo',
    nextContribution: '2024-07-10',
  },
];

export default function StockFelaHome({ navigation }) {
  const { theme, isDarkMode } = React.useContext(AppContext);

  const handleGroupPress = (group) => {
    navigation.navigate(group);
  };

  const getGroupTypeColor = (type) => {
    return type === 'savings' ? '#4CAF50' : '#FF9800';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      {/* Header with Welcome Message */}
      <View style={styles.header}>
        <View style={styles.welcomeSection}>
          <Avatar.Image source={Images.default_user} size={50} />
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.notificationButton}>
            <Icons.FontAwesome6 name="bell" size={24} color={theme.colors.text} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.addGroup, { backgroundColor: theme.colors.highlight }]}
            onPress={() => navigation.navigate('CreateStokfellaGroup')}
          >
            <Icons.Feather name="plus" size={20} color='#fff' />
            <Text style={{ fontSize: 14, color: '#fff' }}>Create Stockfella</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Icons.FontAwesome6 name="group-arrows-rotate" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Active Groups</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#4CAF50' }]}>
            <Icons.MaterialIcons name="pending-actions" size={20} color="#fff" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>Payment Pending</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, { backgroundColor: '#FF9800' }]}>
            <Icons.Ionicons name="calendar" size={20} color="#fff" />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>Due Soon</Text>
          </View>
        </View>
      </View>

      {/* Groups Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Money Schemes</Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
          <Icons.Feather name="chevron-right" size={16} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>
        {mockGroups.length > 0
          ?
          mockGroups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={[
                styles.groupCard,
              ]}
              onPress={() => handleGroupPress('GroupDetails')}
            >
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.groupTitleSection}>
                  <View style={styles.groupIconContainer}>
                    {group.type === 'savings'
                      ? <Icons.MaterialIcons name='money' size={20} color="#fff" />
                      : <Icons.Entypo name='hand' size={20} color="#fff" />
                    }
                  </View>
                  <View style={styles.groupTitleInfo}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupAdmin}>by {group.admin}</Text>
                  </View>
                </View>
                <View style={styles.groupStatus}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Active</Text>
                </View>
              </View>

              {/* Financial Summary */}
              <View style={styles.financialSummary}>
                <View style={styles.financialItem}>
                  <Text style={styles.financialLabel}>Total Pool</Text>
                  <Text style={styles.financialValue}>E{group.totalSaved.toLocaleString()}</Text>
                </View>
                <View style={styles.financialItem}>
                  <Text style={styles.financialLabel}>Monthly</Text>
                  <Text style={styles.financialValue}>E{group.monthlyContribution}</Text>
                </View>
                <View style={styles.financialItem}>
                  <Text style={styles.financialLabel}>Members</Text>
                  <Text style={styles.financialValue}>{group.totalMembers}</Text>
                </View>
              </View>

              {/* Progress Section */}
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Group Progress</Text>
                  <Text style={styles.progressPercentage}>
                    {Math.round((group.currentMonth / group.duration) * 100)}%
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${(group.currentMonth / group.duration) * 100}%`,
                          backgroundColor: getGroupTypeColor(group.type),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {group.currentMonth} of {group.duration} months
                  </Text>
                </View>
              </View>

              {/* Card Footer */}
              <View style={styles.cardFooter}>
                <View style={styles.nextPayment}>
                  <Icons.EvilIcons name="clock" size={16} color="#666" />
                  <Text style={styles.nextPaymentText}>
                    Next payment: {group.nextContribution}
                  </Text>
                </View>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>View Details</Text>
                  <Icons.Feather name="chevron-right" size={16} color="#4CAF50" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
          :
          // Empty State
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Icons.Ionicons name="person-circle-outline" size={48} color="#ccc" />
            </View>
            <Text style={styles.emptyStateTitle}>No Groups Yet</Text>
            <Text style={styles.emptyStateText}>
              Join or create your first money scheme to start saving together
            </Text>
            <TouchableOpacity style={styles.emptyStateButton}>
              <Text style={styles.emptyStateButtonText}>Create Group</Text>
            </TouchableOpacity>
          </View>
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 5,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    justifyContent: 'space-between'
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dc3545',
  },
  addGroup: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 60
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 6,
  },
  statCard: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginRight: 4,
  },
  scrollView: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    paddingBottom: 80
  },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 16,
  },
  groupTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  groupTitleInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },
  groupAdmin: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  groupStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#28a745',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600',
  },
  financialSummary: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 16,
  },
  financialItem: {
    flex: 1,
    alignItems: 'center',
  },
  financialLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
    marginBottom: 4,
  },
  financialValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '700',
  },
  progressBarContainer: {
    gap: 6,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f8f9fa',
  },
  nextPayment: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nextPaymentText: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 6,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
