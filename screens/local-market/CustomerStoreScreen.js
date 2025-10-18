import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Linking,
  Share,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Button,
  Divider,
  IconButton,
  Modal,
  Portal,
  Searchbar,
  List,
  Text,
  Avatar
} from 'react-native-paper';
import { Icons } from '../../constants/Icons';
import { AppContext } from '../../context/appContext';
import { handleWhatsapp, handleEmail } from '../../utils/callFunctions';
import { AuthContext } from '../../context/authProvider';

const { width } = Dimensions.get('window');

export default function CustomerStoreScreen({ navigation, route }) {
  const { user } = React.useContext(AuthContext)
  const { vendor } = route.params
  const { theme, isDarkMode } = React.useContext(AppContext)

  const [products, setProducts] = useState(route?.params?.products || [
    { id: '1', name: 'Fresh Tomatoes', price: 15, unit: 'kg', stock: 50, description: 'Locally grown fresh tomatoes', images: [], category: 'Vegetables' },
    { id: '2', name: 'Organic Onions', price: 12, unit: 'kg', stock: 30, description: 'Fresh organic onions', images: [], category: 'Vegetables' },
    { id: '3', name: 'Carrots', price: 18, unit: 'kg', stock: 25, description: 'Sweet local carrots', images: [], category: 'Vegetables' }
  ]);

  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCartModal, setShowCartModal] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState({
    address: '',
    phone: '',
    notes: ''
  });

  const withDays = vendor.stock.map(item => {
    const diffTime = new Date() - new Date(item.purchasedAt);
    const daysSincePurchase = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return { ...item._id, daysSincePurchase };
  });

  const filteredProducts = vendor.stock?.filter(product => {
    const matchesSearch = product.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    // const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && product.quantity > 0;
  });

  console.log('Stock in #:', filteredProducts.length)

  const addToCart = (product) => {
    const existingItem = cart.find(item => item._id === product._id);

    if (existingItem) {
      if (existingItem.quantity < product.quantity) {
        setCart(cart.map(item =>
          item._id === product._id
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
    setCart(cart.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = vendor.stock?.find(p => p._id === productId);
    if (newQuantity > product.quantity) {
      Alert.alert('Out of Stock', 'Maximum available quantity reached');
      return;
    }

    setCart(cart.map(item =>
      item._id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item?.quantity, 0);
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

    return `ORDER REQUEST

    Vendor: ${vendor.name}
    Total Items: ${getTotalItems()}
    Total Amount: SZL ${getTotalPrice().toFixed(2)}

    Items:
    ${orderItems}${deliveryInfo}${phoneInfo}${notesInfo}

    Please confirm availability and delivery time. Payment will be made upon delivery.

    Thank you!`;
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

    if (!vendor.whatsapp) {
      Alert.alert('Error', 'Vendor WhatsApp number not available');
      return;
    }

    const message = generateOrderMessage();
    const encodedMessage = encodeURIComponent(message);

    try {
      await Linking.openURL(`whatsapp://send?phone=${vendor.whatsapp}&text=${encodedMessage}`);
    } catch (error) {
      Alert.alert('Error', 'Could not open WhatsApp');
    }
  };

  const makeCall = async () => {
    if (!vendor.phone) {
      Alert.alert('Error', 'Vendor phone number not available');
      return;
    }

    try {
      await Linking.openURL(`tel:${vendor.phone}`);
    } catch (error) {
      Alert.alert('Error', 'Could not make phone call');
    }
  };

  const shareVendor = async () => {
    try {
      await Share.share({
        message: `Check out ${vendor.ownerName} on the vendor marketplace! They have great products and are located at ${vendor.location.address}. Contact: ${vendor.contact.phone}`,
        title: `${vendor.ownerName} - Vendor Marketplace`
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share vendor information');
    }
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity style={styles.productItemContainer} onPress={() => { }}>
      <View style={styles.productInfo}>
        <View style={styles.priceRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            {item.images.length > 0
              ? <Icons.Feather name='shopping-bag' size={30} color={theme.colors.indicator} />
              : <Avatar.Image size={40} source={{ uri: item.images[0] }} style={styles.itemAvatar} />
            }
            <Text variant="titleMedium" style={styles.productName}>{item.itemName}</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text variant="titleLarge" style={{ color: theme.colors.primary }}>{`SZL ${item.price}`}/</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>per {item.unit}</Text>
          </View>
        </View>

        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={2}>
          {item.description}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Stock: {item.quantity} {item.unit}
        </Text>
      </View>

      <View style={styles.productActions}>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Days On Display: {item.daysSincePurchase}
        </Text>

        <TouchableOpacity onPress={() => addToCart(item)} disabled={item.stock === 0}>
          <Text>➕Cart</Text>
        </TouchableOpacity>
      </View>
      <Divider />
    </TouchableOpacity>
  );

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text variant="titleSmall">{item.name}</Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => { navigation.goBack() }}>
            <Icons.Ionicons name='arrow-back' size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.headerActions}>
            {vendor.whatsapp &&
              <TouchableOpacity style={[styles.vendorContact, { backgroundColor: '#93f497ff' }]} onPress={handleWhatsapp}>
                <Icons.FontAwesome
                  name="whatsapp"
                  size={20}
                  color="#FFFFFF"
                  onPress={shareVendor}
                />
              </TouchableOpacity>
            }

            <TouchableOpacity style={[styles.vendorContact, { backgroundColor: theme.colors.indicator }]} onPress={makeCall}>
              <Icons.Feather
                name="phone"
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            {vendor.email &&
              <TouchableOpacity style={[styles.vendorContact, { backgroundColor: '#f27373ff' }]} onPress={handleEmail}>
                <Icons.Ionicons
                  name="mail-outline"
                  size={20}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            }

            <TouchableOpacity style={[styles.vendorContact, { backgroundColor: '#f67ddbff' }]} onPress={shareVendor}>
              <Icons.Feather
                name="share-2"
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.vendorName, { color: theme.colors.text }]}>{vendor.businessName}</Text>

        <View style={styles.vendorMeta}>
          <View style={styles.ratingContainer}>
            <IconButton icon="star" size={16} iconColor="#FFD700" />
            <Text variant="bodySmall" style={[styles.rating, { color: theme.colors.sub_text }]}>
              {vendor.rating} ({vendor.reviewCount} reviews)
            </Text>
          </View>

          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: vendor.isOnline ? '#4CAF50' : '#F44336' }]} />
            <Text variant="bodySmall" style={[styles.statusText, { color: theme.colors.sub_text }]}>
              {vendor.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icons.Entypo name='location-pin' size={16} color={theme.colors.notification} />
            <Text variant="bodySmall" style={{ color: theme.colors.sub_text }}>
              {vendor.area}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icons.MaterialIcons name='delivery-dining' size={16} color={theme.colors.indicator} />
            <Text variant="bodySmall" style={{ color: theme.colors.sub_text }}>
              {vendor.deliveryRadius} km
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search products..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          iconColor={theme.colors.sub_text}
          style={[styles.searchbar, { backgroundColor: theme.colors.sub_card }]}
        />
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item, index) => `${item._id}-${index}`}
        renderItem={renderProduct}
        contentContainerStyle={styles.productsContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text variant="titleLarge" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No products found</Text>
            <Text variant="bodyMedium" style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
              {searchQuery ? 'Try adjusting your search' : 'No products available in this category'}
            </Text>
          </View>
        )}
      />

      {cart.length > 0 && (
        <TouchableOpacity style={[styles.cart, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <List.Item
            title={`SZL ${getTotalPrice().toFixed(2)}`}
            titleStyle={{ fontSize: 15, color: theme.colors.notification }}
            description={`${getTotalItems()} items`}
            onPress={() => setShowCartModal(true)}
            left={props => <List.Icon color={theme.colors.indicator} icon="basket" />}
          />
        </TouchableOpacity>
      )}

      <Portal>
        <Modal
          visible={showCartModal}
          onDismiss={() => setShowCartModal(false)}
          contentContainerStyle={[styles.cartModal, { backgroundColor: theme.colors.background }]}
        >
          <View style={styles.cartModalContent}>
            <Text style={styles.cartModalTitle}>Your Order</Text>

            <FlatList
              data={cart}
              keyExtractor={(item, index) => `${item._id}-${index}`}
              renderItem={renderCartItem}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <Divider />}
              ListFooterComponent={() => (
                <>
                  <View style={styles.deliverySection}>
                    <Text variant="titleMedium" style={styles.sectionTitle}>Delivery Details</Text>

                    <TextInput
                      value={deliveryDetails.address}
                      onChangeText={(text) => setDeliveryDetails(prev => ({ ...prev, address: text }))}
                      multiline
                      numberOfLines={3}
                      style={styles.input}
                      placeholder="Enter your delivery address"
                      // Prevent focus loss
                      autoFocus={false}
                      submitBehavior='blurAndSubmit'
                      returnKeyType="next"
                    />

                    <TextInput
                      value={deliveryDetails.phone}
                      onChangeText={(text) => setDeliveryDetails(prev => ({ ...prev, phone: text }))}
                      keyboardType="phone-pad"
                      style={styles.input}
                      placeholder="Your contact number"
                      autoFocus={false}
                      submitBehavior='blurAndSubmit'
                      returnKeyType="next"
                    />

                    <TextInput
                      value={deliveryDetails.notes}
                      onChangeText={(text) => setDeliveryDetails(prev => ({ ...prev, notes: text }))}
                      multiline
                      numberOfLines={2}
                      style={styles.input}
                      placeholder="Any special instructions or notes"
                      autoFocus={false}
                      submitBehavior='blurAndSubmit'
                      returnKeyType="done"
                    />
                  </View>

                  <View style={[styles.orderSummary, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <View style={styles.summaryRow}>
                      <Text variant="bodyMedium">Total Items:</Text>
                      <Text variant="bodyMedium">{getTotalItems()}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text variant="titleMedium">Total Amount:</Text>
                      <Text variant="titleMedium" style={[styles.totalAmount, { color: theme.colors.primary }]}>
                        SZL {getTotalPrice().toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.orderActions}>
                    <TouchableOpacity
                      onPress={() => setShowCartModal(false)}
                      style={[styles.actionButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.sub_card }]}
                    >
                      <Text style={{ textAlign: 'center', color: theme.colors.text }}>Continue Shopping</Text>
                    </TouchableOpacity>

                    <View style={styles.communicationButtons}>
                      <TouchableOpacity
                        onPress={sendSMS}
                        style={[styles.communicationButton, { backgroundColor: '#465be5ff' }]}
                      >
                        <Icons.Ionicons name='chatbox' size={20} color='#FFFFFF' />
                        <Text style={{ textAlign: 'center', color: "#FFFFFF" }}>SMS Order</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={sendWhatsApp}
                        icon="chat"
                        style={[styles.communicationButton, styles.whatsappButton]}
                      >
                        <Icons.FontAwesome name='whatsapp' size={20} color='#FFFFFF' />
                        <Text style={{ textAlign: 'center', color: "#FFFFFF" }}>WhatsApp</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
            />
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    paddingTop: 30,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  vendorContact: {
    borderRadius: 30,
    height: 40,
    width: 40,
    paddingHorizontal: 5,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  vendorName: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  vendorMeta: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
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
  headerActions: {
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  searchContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  searchbar: {
    elevation: 2,
  },
  productsContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  productItemContainer: {
    marginBottom: 12,
  },
  itemAvatar: {
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: 'bold',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  unit: {
    marginLeft: 4,
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
  },
  categoryChip: {
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
  },
  cartFooter: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
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
  cartItemControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    minWidth: 30,
    textAlign: 'center',
  },
  cart: {
    position: 'absolute',
    right: 16,
    bottom: '8%',
    borderWidth: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5
  },
  deliverySection: {
    marginTop: 10,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    color: '#6b7280',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  orderSummary: {
    padding: 16,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  totalAmount: {
    fontWeight: 'bold',
  },
  orderActions: {
    marginVertical: 5,
    gap: 12,
  },
  actionButton: {
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 8,
    paddingVertical: 10,
  },
  communicationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  communicationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 5,
    flex: 1,
    gap: 5
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
});