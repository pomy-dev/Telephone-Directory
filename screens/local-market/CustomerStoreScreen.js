import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import {
  Badge,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Modal,
  Portal,
  Searchbar,
  Surface,
  Text,
  TextInput
} from 'react-native-paper';
import { theme } from '../../constants/vendorTheme';

const { width } = Dimensions.get('window');

export default function CustomerStoreScreen({ route }) {
  const vendor = route?.params?.vendor || {
    id: '1',
    name: 'Thabo\'s Fresh Vegetables',
    contact: { phone: '+268 2400 1234', whatsapp: '+268 2400 1234' },
    location: { address: 'Mbabane Market Square' },
    rating: 4.5,
    reviewCount: 23,
    isOnline: true
  };

  const [products, setProducts] = useState(route?.params?.products || [
    { id: '1', name: 'Fresh Tomatoes', price: 15, unit: 'kg', stock: 50, description: 'Locally grown fresh tomatoes', images: [], category: 'Vegetables' },
    { id: '2', name: 'Organic Onions', price: 12, unit: 'kg', stock: 30, description: 'Fresh organic onions', images: [], category: 'Vegetables' },
    { id: '3', name: 'Carrots', price: 18, unit: 'kg', stock: 25, description: 'Sweet local carrots', images: [], category: 'Vegetables' }
  ]);

  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCartModal, setShowCartModal] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState({
    address: '',
    phone: '',
    notes: ''
  });

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.stock > 0;
  });

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        Alert.alert('Out of Stock', 'Maximum available quantity reached');
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (newQuantity > product.stock) {
      Alert.alert('Out of Stock', 'Maximum available quantity reached');
      return;
    }

    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const generateOrderMessage = () => {
    const orderItems = cart.map(item =>
      `${item.name} x${item.quantity} ${item.unit} - SZL ${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const deliveryInfo = deliveryDetails.address ?
      `\n\nDelivery Address: ${deliveryDetails.address}` : '';

    const phoneInfo = deliveryDetails.phone ?
      `\nContact Phone: ${deliveryDetails.phone}` : '';

    const notesInfo = deliveryDetails.notes ?
      `\nSpecial Notes: ${deliveryDetails.notes}` : '';

    return `🛒 ORDER REQUEST

Vendor: ${vendor.name}
Total Items: ${getTotalItems()}
Total Amount: SZL ${getTotalPrice().toFixed(2)}

Items:
${orderItems}${deliveryInfo}${phoneInfo}${notesInfo}

Please confirm availability and delivery time. Payment will be made upon delivery.

Thank you! 🙏`;
  };

  const sendSMS = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart first');
      return;
    }

    if (!vendor.contact.phone) {
      Alert.alert('Error', 'Vendor phone number not available');
      return;
    }

    const message = generateOrderMessage();
    const encodedMessage = encodeURIComponent(message);

    try {
      await Linking.openURL(`sms:${vendor.contact.phone}?body=${encodedMessage}`);
    } catch (error) {
      Alert.alert('Error', 'Could not open SMS app');
    }
  };

  const sendWhatsApp = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart first');
      return;
    }

    if (!vendor.contact.whatsapp) {
      Alert.alert('Error', 'Vendor WhatsApp number not available');
      return;
    }

    const message = generateOrderMessage();
    const encodedMessage = encodeURIComponent(message);

    try {
      await Linking.openURL(`whatsapp://send?phone=${vendor.contact.whatsapp}&text=${encodedMessage}`);
    } catch (error) {
      Alert.alert('Error', 'Could not open WhatsApp');
    }
  };

  const makeCall = async () => {
    if (!vendor.contact.phone) {
      Alert.alert('Error', 'Vendor phone number not available');
      return;
    }

    try {
      await Linking.openURL(`tel:${vendor.contact.phone}`);
    } catch (error) {
      Alert.alert('Error', 'Could not make phone call');
    }
  };

  const shareVendor = async () => {
    try {
      await Share.share({
        message: `Check out ${vendor.name} on the vendor marketplace! They have great products and are located at ${vendor.location.address}. Contact: ${vendor.contact.phone}`,
        title: `${vendor.name} - Vendor Marketplace`
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share vendor information');
    }
  };

  const renderProduct = ({ item }) => (
    <Card style={styles.productCard}>
      <Card.Content style={styles.productContent}>
        <View style={styles.productHeader}>
          <View style={styles.productInfo}>
            <Text variant="titleMedium" style={styles.productName}>{item.name}</Text>
            <Text variant="bodyMedium" style={styles.productDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.priceRow}>
              <Text variant="titleLarge" style={styles.price}>SZL {item.price}</Text>
              <Text variant="bodyMedium" style={styles.unit}>per {item.unit}</Text>
            </View>
            <Text variant="bodySmall" style={styles.stockInfo}>
              Stock: {item.stock} {item.unit}
            </Text>
          </View>
        </View>
      </Card.Content>

      <Card.Actions style={styles.productActions}>
        <Chip mode="outlined" compact style={styles.categoryChip}>
          {item.category}
        </Chip>
        <Button
          mode="contained"
          onPress={() => addToCart(item)}
          disabled={item.stock === 0}
          compact
        >
          Add to Cart
        </Button>
      </Card.Actions>
    </Card>
  );

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text variant="titleSmall">{item.name}</Text>
        <Text variant="bodySmall" style={styles.cartItemPrice}>
          SZL {item.price} per {item.unit}
        </Text>
      </View>
      <View style={styles.cartItemControls}>
        <IconButton
          icon="minus"
          size={20}
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
        />
        <Text variant="bodyMedium" style={styles.quantityText}>
          {item.quantity}
        </Text>
        <IconButton
          icon="plus"
          size={20}
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
        />
        <IconButton
          icon="delete"
          size={20}
          iconColor={theme.colors.error}
          onPress={() => removeFromCart(item.id)}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={4}>
        <View style={styles.vendorInfo}>
          <Text style={styles.vendorName}>{vendor.name}</Text>
          <View style={styles.vendorMeta}>
            <View style={styles.ratingContainer}>
              <IconButton icon="star" size={16} iconColor="#FFD700" />
              <Text variant="bodySmall" style={styles.rating}>
                {vendor.rating} ({vendor.reviewCount} reviews)
              </Text>
            </View>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: vendor.isOnline ? '#4CAF50' : '#F44336' }]} />
              <Text variant="bodySmall" style={styles.statusText}>
                {vendor.isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
          <Text variant="bodySmall" style={styles.vendorAddress}>
            📍 {vendor.location.address}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <IconButton
            icon="share"
            size={20}
            iconColor="white"
            onPress={shareVendor}
          />
          <IconButton
            icon="phone"
            size={20}
            iconColor="white"
            onPress={makeCall}
          />
        </View>
      </Surface>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search products..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {categories.map((category) => (
          <Chip
            key={category}
            selected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
            style={styles.categoryChip}
          >
            {category}
          </Chip>
        ))}
      </ScrollView>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.productsContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text variant="titleLarge" style={styles.emptyText}>No products found</Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search' : 'No products available in this category'}
            </Text>
          </View>
        )}
      />

      {cart.length > 0 && (
        <Surface style={styles.cartFooter} elevation={8}>
          <TouchableOpacity
            style={styles.cartSummary}
            onPress={() => setShowCartModal(true)}
          >
            <View style={styles.cartInfo}>
              <Text variant="titleMedium" style={styles.cartTitle}>
                Cart ({getTotalItems()} items)
              </Text>
              <Text variant="titleLarge" style={styles.cartTotal}>
                SZL {getTotalPrice().toFixed(2)}
              </Text>
            </View>
            <Badge style={styles.cartBadge}>{getTotalItems()}</Badge>
            <IconButton icon="chevron-up" size={24} iconColor="white" />
          </TouchableOpacity>
        </Surface>
      )}

      <Portal>
        <Modal
          visible={showCartModal}
          onDismiss={() => setShowCartModal(false)}
          contentContainerStyle={styles.cartModal}
        >
          <ScrollView style={styles.cartModalContent}>
            <Text style={styles.cartModalTitle}>Your Order</Text>

            <FlatList
              data={cart}
              keyExtractor={(item) => item.id}
              renderItem={renderCartItem}
              ItemSeparatorComponent={() => <Divider />}
            />

            <View style={styles.deliverySection}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Delivery Details</Text>

              <TextInput
                label="Delivery Address"
                value={deliveryDetails.address}
                onChangeText={(text) => setDeliveryDetails(prev => ({ ...prev, address: text }))}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
                placeholder="Enter your delivery address"
              />

              <TextInput
                label="Contact Phone"
                value={deliveryDetails.phone}
                onChangeText={(text) => setDeliveryDetails(prev => ({ ...prev, phone: text }))}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
                placeholder="Your contact number"
              />

              <TextInput
                label="Special Notes"
                value={deliveryDetails.notes}
                onChangeText={(text) => setDeliveryDetails(prev => ({ ...prev, notes: text }))}
                mode="outlined"
                multiline
                numberOfLines={2}
                style={styles.input}
                placeholder="Any special instructions or notes"
              />
            </View>

            <View style={styles.orderSummary}>
              <View style={styles.summaryRow}>
                <Text variant="bodyMedium">Total Items:</Text>
                <Text variant="bodyMedium">{getTotalItems()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text variant="titleMedium">Total Amount:</Text>
                <Text variant="titleMedium" style={styles.totalAmount}>
                  SZL {getTotalPrice().toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.orderActions}>
              <Button
                mode="outlined"
                onPress={() => setShowCartModal(false)}
                style={styles.actionButton}
              >
                Continue Shopping
              </Button>

              <View style={styles.communicationButtons}>
                <Button
                  mode="contained"
                  onPress={sendSMS}
                  icon="message"
                  style={styles.communicationButton}
                >
                  SMS Order
                </Button>

                <Button
                  mode="contained"
                  onPress={sendWhatsApp}
                  icon="chat"
                  style={[styles.communicationButton, styles.whatsappButton]}
                >
                  WhatsApp
                </Button>
              </View>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
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
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  vendorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: 'white',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: 'white',
  },
  vendorAddress: {
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchbar: {
    elevation: 2,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  categoryChip: {
    marginRight: 8,
  },
  productsContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  productCard: {
    marginBottom: 12,
    elevation: 2,
  },
  productContent: {
    paddingBottom: 8,
  },
  productHeader: {
    flexDirection: 'row',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productDescription: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  price: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  unit: {
    color: theme.colors.onSurfaceVariant,
    marginLeft: 4,
  },
  stockInfo: {
    color: theme.colors.onSurfaceVariant,
  },
  productActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: 8,
  },
  emptySubtext: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  cartFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
  },
  cartSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cartInfo: {
    flex: 1,
  },
  cartTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  cartTotal: {
    color: 'white',
    fontWeight: 'bold',
  },
  cartBadge: {
    backgroundColor: theme.colors.error,
    marginRight: 8,
  },
  cartModal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    maxHeight: '90%',
  },
  cartModalContent: {
    padding: 20,
  },
  cartModalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemPrice: {
    color: theme.colors.onSurfaceVariant,
  },
  cartItemControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    minWidth: 30,
    textAlign: 'center',
  },
  deliverySection: {
    marginTop: 20,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  input: {
    marginBottom: 16,
  },
  orderSummary: {
    backgroundColor: theme.colors.surfaceVariant,
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalAmount: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  orderActions: {
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  communicationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  communicationButton: {
    flex: 1,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
});
