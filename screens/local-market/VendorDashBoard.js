import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import {
  Avatar,
  Card,
  Chip,
  IconButton,
  ProgressBar,
  Surface,
  Text,
} from 'react-native-paper';
import { theme } from '../../constants/vendorTheme';

const { width } = Dimensions.get('window');

export default function VendorDashboardScreen({ navigation }) {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeCustomers: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // In real app, load from API
    setStats({
      totalProducts: 25,
      totalOrders: 156,
      totalRevenue: 12500,
      activeCustomers: 45
    });

    setRecentOrders([
      {
        id: '1',
        customerName: 'John Mkhonta',
        items: 'Tomatoes, Onions',
        total: 42,
        status: 'pending',
        time: '2 hours ago'
      },
      {
        id: '2',
        customerName: 'Sarah Ndlovu',
        items: 'Carrots',
        total: 18,
        status: 'completed',
        time: '4 hours ago'
      }
    ]);

    setLowStockItems([
      { name: 'Fresh Tomatoes', currentStock: 5, minStock: 10 },
      { name: 'Organic Onions', currentStock: 8, minStock: 15 }
    ]);

    setNotifications([
      {
        id: '1',
        title: 'New Order Received',
        message: 'John Mkhonta placed an order worth SZL 42',
        time: '2 hours ago',
        type: 'order'
      },
      {
        id: '2',
        title: 'Low Stock Alert',
        message: 'Fresh Tomatoes stock is running low',
        time: '5 hours ago',
        type: 'stock'
      }
    ]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return theme.colors.warning;
      case 'completed': return theme.colors.success;
      case 'cancelled': return theme.colors.error;
      default: return theme.colors.onSurfaceVariant;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order': return 'shopping';
      case 'stock': return 'alert';
      case 'payment': return 'credit-card';
      default: return 'bell';
    }
  };

  const renderQuickAction = ({ item }) => (
    <TouchableOpacity
      style={styles.quickActionCard}
      onPress={() => item.onPress()}
    >
      <IconButton icon={item.icon} size={32} iconColor={theme.colors.primary} />
      <Text variant="bodyMedium" style={styles.quickActionText}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  const renderRecentOrder = ({ item }) => (
    <Card style={styles.orderCard}>
      <Card.Content>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text variant="titleSmall">{item.customerName}</Text>
            <Text variant="bodySmall" style={styles.orderItems}>
              {item.items}
            </Text>
            <Text variant="bodySmall" style={styles.orderTime}>
              {item.time}
            </Text>
          </View>
          <View style={styles.orderMeta}>
            <Text variant="titleMedium" style={styles.orderTotal}>
              SZL {item.total}
            </Text>
            <Chip
              mode="outlined"
              compact
              style={[styles.statusChip, { borderColor: getStatusColor(item.status) }]}
              textStyle={{ color: getStatusColor(item.status) }}
            >
              {item.status}
            </Chip>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderLowStockItem = ({ item }) => (
    <Card style={styles.stockCard}>
      <Card.Content>
        <View style={styles.stockHeader}>
          <Text variant="titleSmall">{item.name}</Text>
          <Text variant="bodyMedium" style={styles.stockText}>
            {item.currentStock} / {item.minStock}
          </Text>
        </View>
        <ProgressBar
          progress={item.currentStock / item.minStock}
          color={item.currentStock < item.minStock ? theme.colors.error : theme.colors.primary}
          style={styles.stockProgress}
        />
      </Card.Content>
    </Card>
  );

  const renderNotification = ({ item }) => (
    <Card style={styles.notificationCard}>
      <Card.Content>
        <View style={styles.notificationHeader}>
          <IconButton
            icon={getNotificationIcon(item.type)}
            size={24}
            iconColor={theme.colors.primary}
          />
          <View style={styles.notificationInfo}>
            <Text variant="titleSmall">{item.title}</Text>
            <Text variant="bodySmall" style={styles.notificationMessage}>
              {item.message}
            </Text>
            <Text variant="bodySmall" style={styles.notificationTime}>
              {item.time}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const quickActions = [
    {
      id: '1',
      title: 'Add Stock',
      icon: 'plus',
      onPress: () => navigation.navigate('EnhancedVendorInventory')
    },
    {
      id: '2',
      title: 'View Orders',
      icon: 'shopping',
      onPress: () => navigation.navigate('Orders')
    },
    {
      id: '3',
      title: 'Analytics',
      icon: 'chart-line',
      onPress: () => navigation.navigate('Analytics')
    },
    {
      id: '4',
      title: 'Groups',
      icon: 'account-group',
      onPress: () => navigation.navigate('GroupManagement')
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header} elevation={4}>
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome back!</Text>
            <Text variant="bodyMedium" style={styles.welcomeSubtitle}>
              Manage your business efficiently
            </Text>
          </View>
          <Avatar.Text size={48} label="JD" />
        </View>
      </Surface>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <IconButton icon="package-variant" size={32} iconColor={theme.colors.primary} />
            <View style={styles.statInfo}>
              <Text variant="titleLarge" style={styles.statNumber}>{stats.totalProducts}</Text>
              <Text variant="bodySmall" style={styles.statLabel}>Products</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <IconButton icon="shopping" size={32} iconColor={theme.colors.success} />
            <View style={styles.statInfo}>
              <Text variant="titleLarge" style={styles.statNumber}>{stats.totalOrders}</Text>
              <Text variant="bodySmall" style={styles.statLabel}>Orders</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <IconButton icon="currency-usd" size={32} iconColor={theme.colors.warning} />
            <View style={styles.statInfo}>
              <Text variant="titleLarge" style={styles.statNumber}>SZL {stats.totalRevenue}</Text>
              <Text variant="bodySmall" style={styles.statLabel}>Revenue</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <IconButton icon="account-group" size={32} iconColor={theme.colors.info} />
            <View style={styles.statInfo}>
              <Text variant="titleLarge" style={styles.statNumber}>{stats.activeCustomers}</Text>
              <Text variant="bodySmall" style={styles.statLabel}>Customers</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <FlatList
          data={quickActions}
          keyExtractor={(item) => item.id}
          renderItem={renderQuickAction}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsContainer}
        />
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <IconButton
            icon="chevron-right"
            onPress={() => navigation.navigate('Orders')}
          />
        </View>
        <FlatList
          data={recentOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderRecentOrder}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>

      {/* Low Stock Items */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Low Stock Alert</Text>
          <IconButton
            icon="chevron-right"
            onPress={() => navigation.navigate('EnhancedVendorInventory')}
          />
        </View>
        <FlatList
          data={lowStockItems}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderLowStockItem}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <IconButton
            icon="bell-outline"
            onPress={() => navigation.navigate('Notifications')}
          />
        </View>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeSubtitle: {
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 44) / 2,
    elevation: 2,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statInfo: {
    flex: 1,
    marginLeft: 12,
  },
  statNumber: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    color: theme.colors.onSurfaceVariant,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
  },
  quickActionCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    elevation: 2,
    minWidth: 100,
  },
  quickActionText: {
    marginTop: 8,
    textAlign: 'center',
  },
  orderCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderInfo: {
    flex: 1,
  },
  orderItems: {
    color: theme.colors.onSurfaceVariant,
    marginVertical: 4,
  },
  orderTime: {
    color: theme.colors.onSurfaceVariant,
  },
  orderMeta: {
    alignItems: 'flex-end',
  },
  orderTotal: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statusChip: {
    marginTop: 8,
  },
  stockCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 2,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockText: {
    color: theme.colors.onSurfaceVariant,
  },
  stockProgress: {
    height: 6,
    borderRadius: 3,
  },
  notificationCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationInfo: {
    flex: 1,
    marginLeft: 8,
  },
  notificationMessage: {
    color: theme.colors.onSurfaceVariant,
    marginVertical: 4,
  },
  notificationTime: {
    color: theme.colors.onSurfaceVariant,
  },
  bottomSpacing: {
    height: 20,
  },
});
