import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { Icons } from '../../constants/Icons';
import { AppContext } from '../../context/appContext';
import { AuthContext } from '../../context/authProvider';

// Mock data for transactions
const mockTransactions = [
  {
    id: '1',
    type: 'contribution',
    amount: 500,
    member: 'Thabo Mthembu',
    group: 'Christmas Savings 2024',
    date: '2024-06-15',
    status: 'completed',
    proof: 'momo_receipt_001.jpg',
  },
  {
    id: '2',
    type: 'loan',
    amount: 2000,
    member: 'Sipho Dlamini',
    group: 'Emergency Fund Circle',
    date: '2024-06-10',
    status: 'pending',
    interestRate: 5,
    repaymentDate: '2024-09-10',
  },
  {
    id: '3',
    type: 'repayment',
    amount: 2100,
    member: 'Sipho Dlamini',
    group: 'Emergency Fund Circle',
    date: '2024-06-12',
    status: 'completed',
    interestPaid: 100,
  },
  {
    id: '4',
    type: 'contribution',
    amount: 800,
    member: 'Nomsa Khumalo',
    group: 'Wedding Fund Group',
    date: '2024-06-08',
    status: 'completed',
    proof: 'instacash_receipt_002.jpg',
  },
  {
    id: '5',
    type: 'loan',
    amount: 5000,
    member: 'Mandla Nkosi',
    group: 'Wedding Fund Group',
    date: '2024-06-05',
    status: 'approved',
    interestRate: 3,
    repaymentDate: '2024-12-05',
  },
];

export default function TransactionsScreen() {
  const [selectedFilter, setSelectedFilter] = useState < 'all' | 'contributions' | 'loans' | 'repayments' > ('all');

  const filteredTransactions = mockTransactions.filter(transaction => {
    if (selectedFilter === 'all') return true;
    return transaction.type === selectedFilter;
  });

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'contribution':
        return (
          <Icons.Feather
            name='plus'
            size={20}
            color="#fff"
          />
        );
      case 'loan':
        return (
          <Icons.Entypo
            name='hand'
            size={20}
            color="#fff"
          />
        );
      case 'repayment':
        return (
          <Icons.Feather
            name='check-circle'
            size={20}
            color="#fff"
          />
        );
      default:
        return (
          <Icons.Entypo
            name='circle'
            size={20}
            color="#fff"
          />
        );
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'contribution':
        return '#4CAF50';
      case 'loan':
        return '#FF9800';
      case 'repayment':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'approved':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  const handleTransactionPress = (transaction) => {
    let message = `${transaction.type.toUpperCase()}\n`;
    message += `Amount: E${transaction.amount}\n`;
    message += `Member: ${transaction.member}\n`;
    message += `Group: ${transaction.group}\n`;
    message += `Date: ${transaction.date}\n`;
    message += `Status: ${transaction.status}`;

    if (transaction.type === 'loan') {
      message += `\nInterest Rate: ${transaction.interestRate}%\n`;
      message += `Repayment Date: ${transaction.repaymentDate}`;
    }

    if (transaction.type === 'repayment' && transaction.interestPaid) {
      message += `\nInterest Paid: E${transaction.interestPaid}`;
    }

    if (transaction.proof) {
      message += `\nProof: ${transaction.proof}`;
    }

    Alert.alert('Transaction Details', message, [{ text: 'OK' }]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text type="title" style={styles.headerTitle}>
            Transactions
          </Text>
          <Text style={styles.headerSubtitle}>
            Track all group activities
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.searchButton}>
            <Icons.Entypo name="magnifying-glass" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Icons.FontAwesome name="sliders" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: 'All', icon: 'list', icon_parent: 'Feather' },
            { key: 'contributions', label: 'Contributions', icon: 'plus', icon_parent: 'Feather' },
            { key: 'loans', label: 'Loans', icon: 'hand', icon_parent: 'Entypo' },
            { key: 'repayments', label: 'Repayments', icon: 'check-circle', icon_parent: 'Feather' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterTab,
                selectedFilter === filter.key && styles.filterTabActive,
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              {filter.key === 'loans'
                ?
                <Icons.Entypo
                  name={filter.icon}
                  size={16}
                  color={selectedFilter === filter.key ? '#fff' : '#6c757d'}
                />
                :
                <Icons.Feather
                  name={filter.icon}
                  size={16}
                  color={selectedFilter === filter.key ? '#fff' : '#6c757d'}
                />
              }
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === filter.key && styles.filterTabTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconContainer}>
            <Icons.Feather name="plus" size={20} color="#fff" />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryValue}>E15,300</Text>
            <Text style={styles.summaryLabel}>Total Contributions</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.summaryIconContainer, { backgroundColor: '#FF9800' }]}>
            <Icons.Entypo name="hand" size={20} color="#fff" />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryValue}>E7,000</Text>
            <Text style={styles.summaryLabel}>Active Loans</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.summaryIconContainer, { backgroundColor: '#2196F3' }]}>
            <Icons.Feather name="check-circle" size={20} color="#fff" />
          </View>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryValue}>E100</Text>
            <Text style={styles.summaryLabel}>Interest Earned</Text>
          </View>
        </View>
      </View>

      {/* Transactions List */}
      <ScrollView style={styles.transactionsList} showsVerticalScrollIndicator={false}>
        {filteredTransactions.map((transaction) => (
          <TouchableOpacity
            key={transaction.id}
            style={[
              styles.transactionCard,
            ]}
            onPress={() => handleTransactionPress(transaction)}
          >
            <View style={styles.transactionHeader}>
              <View style={styles.transactionIconContainer}>
                {getTransactionIcon(transaction.type)}
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionType}>
                  {transaction.type.toUpperCase()}
                </Text>
                <Text style={styles.transactionMember}>
                  {transaction.member}
                </Text>
                <Text style={styles.transactionGroup}>
                  {transaction.group}
                </Text>
              </View>
              <View style={styles.transactionAmount}>
                <Text style={styles.amountText}>
                  E{transaction.amount.toLocaleString()}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(transaction.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {transaction.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.transactionFooter}>
              <View style={styles.transactionDate}>
                <Icons.Ionicons name="calendar-outline" size={14} color="#6c757d" />
                <Text style={styles.dateText}>{transaction.date}</Text>
              </View>

              {transaction.type === 'loan' && (
                <View style={styles.loanDetails}>
                  <Text style={styles.loanDetailText}>
                    {transaction.interestRate}% interest • Due: {transaction.repaymentDate}
                  </Text>
                </View>
              )}

              {transaction.type === 'repayment' && transaction.interestPaid && (
                <View style={styles.repaymentDetails}>
                  <Text style={styles.repaymentDetailText}>
                    Interest: E{transaction.interestPaid}
                  </Text>
                </View>
              )}

              {transaction.proof && (
                <View style={styles.proofContainer}>
                  <Icons.MaterialIcons name="receipt-long" size={14} color="#6c757d" />
                  <Text style={styles.proofText}>
                    Proof attached
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f8f9fa',
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: '#4CAF50',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryContent: {
    flex: 1,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  transactionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 2,
  },
  transactionMember: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  transactionGroup: {
    fontSize: 14,
    color: '#6c757d',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  transactionFooter: {
    gap: 8,
  },
  transactionDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    color: '#6c757d',
  },
  loanDetails: {
    backgroundColor: '#fff3e0',
    padding: 8,
    borderRadius: 6,
  },
  loanDetailText: {
    fontSize: 12,
    color: '#e65100',
    fontWeight: '500',
  },
  repaymentDetails: {
    backgroundColor: '#e3f2fd',
    padding: 8,
    borderRadius: 6,
  },
  repaymentDetailText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
  proofContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  proofText: {
    fontSize: 12,
    color: '#6c757d',
  },
});
