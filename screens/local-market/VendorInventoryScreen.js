import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import React, { useEffect, useState, useRef } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Animated,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
  TouchableOpacity,
  View,
  StatusBar,
  SafeAreaView
} from 'react-native';
import {
  Button,
  Card,
  Chip,
  FAB,
  IconButton,
  Menu,
  Portal,
  Searchbar,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Icons } from '../../constants/Icons';
import { AuthContext } from '../../context/authProvider';
import { AppContext } from '../../context/appContext';
import LoginScreen from '../../components/loginModal';
import { addVendorStock } from '../../service/getApi';

const { width, height: screenHeight } = Dimensions.get('window');

export default function VendorInventoryScreen({ navigation }) {
  const { theme, isDarkMode } = React.useContext(AppContext);
  const { user } = React.useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [unitMenuVisible, setUnitMenuVisible] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    price: '',
    costPrice: '',
    quantity: '',
    unit: 'pieces',
    category: 'General',
    images: [],
    tags: '',
    minOrder: '1',
    maxOrder: '100',
    discount: '0',
    expiryDate: '',
    barcode: ''
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const sheetAnim = useRef(new Animated.Value(0)).current;

  // handler for expiry date change from native picker
  const onExpiryDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); // keep open on iOS if needed
    if (selectedDate) {
      setFormData(prev => ({ ...prev, expiryDate: selectedDate.toISOString() }));
    }
  };

  const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Meat', 'Dairy', 'Beverages', 'Snacks', 'General'];
  const units = ['pieces', 'kg', 'liters', 'boxes', 'packets', 'bottles'];

  useEffect(() => {
    // Load saved items from storage
    loadItems();
  }, []);

  useEffect(() => {
    const toValue = modalVisible ? 1 : 0;
    Animated.timing(sheetAnim, {
      toValue,
      duration: 280,
      useNativeDriver: true,
    }).start(() => {
      if (!modalVisible) {
        // reset editing state only after hide if needed
      }
    });
  }, [modalVisible, sheetAnim]);

  const sheetHeight = Math.min(screenHeight * 0.86, 760);
  const sheetTranslateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [sheetHeight + 20, 0],
  });

  const loadItems = async () => {
    // In a real app, load from AsyncStorage or API
    setItems([]);
  };

  const handleImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Permission to access camera roll is required!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, result.assets[0].uri]
      }));
    }
  };

  const handleCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, result.assets[0].uri]
      }));
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      costPrice: '',
      quantity: '',
      unit: 'pieces',
      category: 'General',
      images: [],
      tags: '',
      minOrder: '1',
      maxOrder: '100',
      discount: '0',
      expiryDate: '',
      barcode: ''
    });
    setEditingItem(null);
  };

  const openModal = (item = null) => {
    if (item) {
      setFormData({ ...item });
      setEditingItem(item);
    } else {
      resetForm();
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const validateForm = () => {
    if (!formData.itemName?.trim()) {
      Alert.alert('Error', 'Product name is required');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Error', 'Valid price is required');
      return false;
    }
    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      Alert.alert('Error', 'Valid quantity is required');
      return false;
    }
    return true;
  };

  // convert images to Base64
  const imagesToBase64 = async (images = []) => {
    const results = [];
    const getMime = (uri) => {
      const ext = (uri.split('.').pop() || '').toLowerCase();
      switch (ext) {
        case 'jpg':
        case 'jpeg':
          return 'image/jpeg';
        case 'png':
          return 'image/png';
        case 'gif':
          return 'image/gif';
        case 'webp':
          return 'image/webp';
        case 'heic':
          return 'image/heic';
        default:
          return 'image/jpeg';
      }
    };

    for (const uri of images) {
      try {
        if (!uri) continue;
        // if already a data URI, keep as-is
        if (typeof uri === 'string' && uri.startsWith('data:')) {
          results.push(uri);
          continue;
        }

        // some URIs may be objects (asset), normalize to string
        const uriStr = typeof uri === 'string' ? uri : uri.uri || '';

        // read file to base64
        const base64 = await FileSystem.readAsStringAsync(uriStr, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const mime = getMime(uriStr);
        results.push(`data:${mime};base64,${base64}`);
      } catch (err) {
        console.warn('Failed to convert image to base64 for', uri, err);
        // push null or skip depending on needs — here we push null to preserve index
        results.push(null);
      }
    }

    return results;
  };

  const saveItems = async (itemsToSave) => {
    if (!Array.isArray(itemsToSave) || itemsToSave.length === 0) {
      return;
    }

    try {
      // convert images for each item in parallel
      const converted = await Promise.all(
        itemsToSave.map(async (it) => {
          const itemCopy = { ...it };
          if (itemCopy.images && itemCopy.images.length > 0) {
            const base64List = await imagesToBase64(itemCopy.images);
            itemCopy.imagesBase64 = base64List.filter(Boolean); // remove nulls
          } else {
            itemCopy.imagesBase64 = [];
          }
          return itemCopy;
        })
      );

      // persist/set state
      const newStock = addVendorStock(converted[0])
      setItems(converted);

      // TODO: persist to AsyncStorage or upload to server here if required
      // console.log('Saved details', converted);
    } catch (error) {
      console.error('Error saving items and converting images:', error);
      // fallback: set original items
      setItems(itemsToSave);
    }
  };

  const handleSave = () => {
    if (!user && !user?.email) {
      Alert.alert(
        'Warning',
        'Your vendor email was not verified.\nTry Login and come back',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => setShowLogin(true) }
        ]
      )
      return;
    }

    if (!validateForm()) return;

    const newItem = {
      ...formData,
      id: editingItem ? editingItem.id : Date.now().toString(),
      price: parseFloat(formData.price),
      costPrice: parseFloat(formData.costPrice) || 0,
      quantity: parseInt(formData.quantity),
      minOrder: parseInt(formData.minOrder),
      maxOrder: parseInt(formData.maxOrder),
      discount: parseFloat(formData.discount),
      dateAdded: editingItem ? editingItem.dateAdded : new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      totalSold: editingItem ? editingItem.totalSold : 0,
      vendorEmail: user.email
    };

    console.log(newItem)

    let updatedItems;
    if (editingItem) {
      updatedItems = items.map(item =>
        item.id === editingItem.id ? newItem : item
      );
    } else {
      updatedItems = [...items, newItem];
    }


    saveItems(updatedItems);
    closeModal();
    Alert.alert('Success', `Product ${editingItem ? 'updated' : 'added'} successfully!`);
  };

  const handleDelete = (itemId) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedItems = items.filter(item => item.id !== itemId);
            saveItems(updatedItems);
          }
        }
      ]
    );
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderItem = ({ item }) => (
    <Card style={styles.itemCard}>
      <View style={styles.itemHeader}>
        {item.images.length > 0 && (
          <Image source={{ uri: item.images[0] }} style={[styles.itemImage, { backgroundColor: theme.colors.surfaceVariant }]} />
        )}
        <View style={styles.itemInfo}>
          <Text variant="titleMedium" style={styles.itemName}>{item.name}</Text>
          <Text variant="bodyMedium" style={[styles.itemDescription, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.priceRow}>
            <Text variant="titleMedium" style={[styles.price, { color: theme.colors.primary }]}>
              SZL {item.price.toFixed(2)}
            </Text>
            {item.discount > 0 && (
              <Chip mode="outlined" compact style={[styles.discountChip, { backgroundColor: theme.colors.errorContainer }]}>
                {item.discount}% OFF
              </Chip>
            )}
          </View>
          <Text variant="bodySmall" style={[styles.stockInfo, { color: theme.colors.onSurfaceVariant }]}>
            Stock: {item.quantity} {item.unit}
          </Text>
        </View>
      </View>

      <Card.Actions style={styles.cardActions}>
        <View style={styles.statsRow}>
          <Text variant="bodySmall">Sold: {item.totalSold}</Text>
          <Text variant="bodySmall">Category: {item.category}</Text>
        </View>
        <View style={styles.actionButtons}>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => openModal(item)}
          />
          <IconButton
            icon="delete"
            size={20}
            iconColor={theme.colors.error}
            onPress={() => handleDelete(item.id)}
          />
        </View>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      <LoginScreen isLoginVisible={showLogin} onClose={() => setShowLogin(false)} />

      <View style={[styles.header, { borderColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icons.Ionicons name='arrow-back' size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Inventory</Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          {items.length} products in stock
        </Text>
      </View>

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
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text variant="titleLarge" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>No products found</Text>
            <Text variant="bodyMedium" style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
              {searchQuery ? 'Try adjusting your search' : 'Add your first product to get started'}
            </Text>
          </View>
        )}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => openModal()}
        label="Add Product"
      />
      {modalVisible && (
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View
        pointerEvents={modalVisible ? 'auto' : 'none'}
        style={[
          styles.sheet,
          {
            height: sheetHeight,
            transform: [{ translateY: sheetTranslateY }],
            backgroundColor: theme.colors.background,
          }
        ]}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
            style={{ flex: 1 }}
          >
            <View style={[styles.sheetHeader, {
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: theme.colors.surfaceVariant
            }]}>
              <View style={[styles.sheetHandle, { backgroundColor: theme.colors.onSurfaceVariant }]} />
              <Text style={styles.modalTitle}>
                {editingItem ? 'Edit Product' : 'Add New Product'}
              </Text>
              <IconButton icon="close" size={20} onPress={closeModal} />
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
              <TextInput
                label="Product Name *"
                value={formData.itemName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, itemName: text }))}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Description"
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
              />

              <View style={styles.rowInputs}>
                <TextInput
                  label="Selling Price (SZL) *"
                  value={formData.price}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                  mode="outlined"
                  keyboardType="numeric"
                  style={[styles.input, styles.halfInput]}
                />
                <TextInput
                  label="Cost Price (SZL)"
                  value={formData.costPrice}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, costPrice: text }))}
                  mode="outlined"
                  keyboardType="numeric"
                  style={[styles.input, styles.halfInput]}
                />
              </View>

              <View style={styles.rowInputs}>
                <TextInput
                  label="Quantity in Stock *"
                  value={formData.quantity}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, quantity: text }))}
                  mode="outlined"
                  keyboardType="numeric"
                  style={[styles.input, styles.halfInput]}
                />

                {/* unit menu */}
                <View style={[styles.input, styles.halfInput]}>
                  <Menu
                    visible={unitMenuVisible}
                    onDismiss={() => setUnitMenuVisible(false)}
                    anchor={
                      <TouchableOpacity onPress={() => setUnitMenuVisible(true)} style={[styles.unitSelector, { borderColor: theme.colors.outline }]}>
                        <Text>{formData.unit}</Text>
                      </TouchableOpacity>
                    }
                  // style={{ height: 5 }}
                  >
                    {units.map((u) => (
                      <Menu.Item
                        key={u}
                        onPress={() => {
                          setFormData(prev => ({ ...prev, unit: u }));
                          setUnitMenuVisible(false);
                        }}
                        title={u}

                      />
                    ))}
                  </Menu>
                </View>
              </View>

              <TextInput
                label="Category"
                value={formData.category}
                onChangeText={(text) => setFormData(prev => ({ ...prev, category: text }))}
                mode="outlined"
                style={styles.input}
              />

              <TextInput
                label="Tags (comma separated)"
                value={formData.tags}
                onChangeText={(text) => setFormData(prev => ({ ...prev, tags: text }))}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., organic, fresh, local"
              />

              <View style={styles.rowInputs}>
                <TextInput
                  label="Min Order"
                  value={formData.minOrder}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, minOrder: text }))}
                  mode="outlined"
                  keyboardType="numeric"
                  style={[styles.input, styles.halfInput]}
                />
                <TextInput
                  label="Max Order"
                  value={formData.maxOrder}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, maxOrder: text }))}
                  mode="outlined"
                  keyboardType="numeric"
                  style={[styles.input, styles.halfInput]}
                />
              </View>

              {/* expiry date picker */}
              <View style={styles.rowInputs}>
                <TouchableOpacity
                  style={[styles.dateButton, {
                    borderColor: theme.colors.outline,
                    backgroundColor: theme.colors.surface
                  }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text>
                    {formData.expiryDate
                      ? `Expiry: ${new Date(formData.expiryDate).toLocaleDateString()}`
                      : 'Set expiry date'}
                  </Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={formData.expiryDate ? new Date(formData.expiryDate) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onExpiryDateChange}
                />
              )}

              <TextInput
                label="Discount (%)"
                value={formData.discount}
                onChangeText={(text) => setFormData(prev => ({ ...prev, discount: text }))}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
              />

              <TextInput
                label="Barcode/ID"
                value={formData.barcode}
                onChangeText={(text) => setFormData(prev => ({ ...prev, barcode: text }))}
                mode="outlined"
                style={styles.input}
              />

              <View style={styles.imageSection}>
                <Text variant="titleMedium" style={styles.sectionTitle}>Product Images</Text>
                <View style={styles.imageButtons}>
                  <Button
                    mode="outlined"
                    onPress={handleCamera}
                    icon="camera"
                    style={styles.imageButton}
                  >
                    Camera
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={handleImagePicker}
                    icon="image"
                    style={styles.imageButton}
                  >
                    Gallery
                  </Button>
                </View>

                <ScrollView horizontal style={styles.imagePreview}>
                  {formData.images.map((uri, index) => (
                    <View key={index} style={styles.imageContainer}>
                      <Image source={{ uri }} style={styles.previewImage} />
                      <IconButton
                        icon="close"
                        size={16}
                        style={[styles.removeImageButton, { backgroundColor: theme.colors.error }]}
                        onPress={() => removeImage(index)}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.modalActions}>
                <Button mode="outlined" onPress={closeModal} style={styles.actionButton}>
                  Cancel
                </Button>
                <Button mode="contained" onPress={handleSave} style={styles.actionButton}>
                  {editingItem ? 'Update' : 'Save'}
                </Button>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 30,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    top: 35
  },
  headerTitle: {
    marginLeft: '30%',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    opacity: 0.9,
    marginTop: 4,
    marginLeft: '15%',
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
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  itemCard: {
    marginBottom: 12,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemDescription: {
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  stockInfo: {
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButtons: {
    flexDirection: 'row',
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 60,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    overflow: 'hidden',
    elevation: 10,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    justifyContent: 'space-between',
  },
  sheetHandle: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -18 }],
    top: 8,
    width: 36,
    height: 4,
    borderRadius: 3,
    opacity: 0.5,
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    maxHeight: '90%',
  },
  modalContent: {
    padding: 16,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 44,
  },
  input: {
    marginBottom: 12,
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  unitSelector: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 16,
    justifyContent: 'center',
    height: 56,
  },
  imageSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  imageButton: {
    flex: 1,
  },
  imagePreview: {
    flexDirection: 'row',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
  },
});
