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
  TextInput,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import {
  Button,
  Card,
  Chip,
  FAB,
  IconButton,
  Menu,
  Searchbar,
  Text,
  SegmentedButtons,
  Divider,
  Badge,
  Avatar,
  List,
  Switch,
  HelperText,
  ActivityIndicator,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Icons } from '../../constants/Icons';
import { AuthContext } from '../../context/authProvider';
import { AppContext } from '../../context/appContext';
import LoginScreen from '../../components/loginModal';
import { insertVendorStock } from '../../service/Supabase-Fuctions';
import { CustomToast } from '../../components/customToast';
import CustomLoader from '../../components/customLoader';

const { width, height: screenHeight } = Dimensions.get('window');

// Define category groups
const inventoryCategories = ['Vegetables', 'Fruits', 'Grains', 'Meat', 'Dairy', 'Beverages', 'Snacks', 'General'];
const serviceCategories = ['Cleaning', 'Repair', 'Consulting', 'Delivery', 'Tutoring', 'Beauty', 'Events', 'General'];

export default function VendorInventoryScreen({ navigation, route }) {
  const { theme, isDarkMode } = React.useContext(AppContext);
  const { user } = React.useContext(AuthContext);
  const { vendor, vendorId } = route.params;
  const [mode, setMode] = useState('inventory'); // 'inventory' or 'services'
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [durationMenuVisible, setDurationMenuVisible] = useState(false);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false); // For form category selector
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
    barcode: '',
    duration: '1',
    durationUnit: 'hours',
    availability: true,
    bookingSlots: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTakePhoto, setIsTakePhoto] = useState(false);
  const [isPickImage, setIsPickImage] = useState(false);
  const sheetAnim = useRef(new Animated.Value(0)).current;

  // Handler for expiry date change
  const onExpiryDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData(prev => ({ ...prev, expiryDate: selectedDate.toISOString() }));
    }
  };

  // Dynamic categories based on mode
  const categories = ['All', ...(mode === 'inventory' ? inventoryCategories : serviceCategories)];
  const durationUnits = ['minutes', 'hours', 'days', 'sessions'];

  useEffect(() => {
    loadItems();
    setSelectedCategory('All');
    if (modalVisible) {
      setFormData(prev => ({ ...prev, category: 'General' }));
    }
  }, [mode]);

  useEffect(() => {
    const toValue = modalVisible ? 1 : 0;
    Animated.timing(sheetAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [modalVisible]);

  const sheetHeight = Math.min(screenHeight * 0.92, 800);
  const sheetTranslateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [sheetHeight, 0],
  });

  const loadItems = async () => {
    setItems(vendor.stock);
  };

  const handleImagePicker = async () => {
    try {
      setIsPickImage(true)
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Access to media library is needed!');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        addImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsPickImage(false)
    }
  };

  const handleCamera = async () => {
    try {
      setIsTakePhoto(true);
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Access to camera is needed!');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        addImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsTakePhoto(false)
    }
  };

  const addImage = (uri) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, uri].slice(0, 5), // Limit to 5 images
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      itemName: '',
      description: '',
      price: '',
      costPrice: '',
      quantity: mode === 'inventory' ? '' : undefined,
      unit: 'pieces',
      category: 'General',
      images: [],
      tags: '',
      minOrder: '1',
      maxOrder: '100',
      discount: '0',
      expiryDate: '',
      barcode: '',
      duration: '1',
      durationUnit: 'hours',
      availability: true,
      bookingSlots: '',
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
    if (!formData.itemName?.trim()) return falseAlert('Product/Service name is required');
    if (!formData.price || parseFloat(formData.price) <= 0) return falseAlert('Valid price is required');
    if (mode === 'inventory' && (!formData.quantity || parseInt(formData.quantity) < 0)) return falseAlert('Valid quantity is required');
    return true;
  };

  const falseAlert = (msg) => {
    Alert.alert('Error', msg);
    return false;
  };

  const imagesToBase64 = async (images = []) => {
    const results = [];
    const getMime = (uri) => {
      const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const map = { jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', heic: 'image/heic' };
      return map[ext] || 'image/jpeg';
    };
    for (const uri of images) {
      if (!uri) continue;
      if (uri.startsWith('data:')) {
        results.push(uri);
        continue;
      }
      try {
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        results.push(`data:${getMime(uri)};base64,${base64}`);
      } catch (err) {
        console.warn('Image conversion failed', err);
      }
    }
    return results;
  };

  const saveItems = async (itemsToSave) => {
    if (itemsToSave?.length === 0) return;
    setIsLoading(true);
    // console.log('==============\n', itemsToSave)
    try {
      const converted = await Promise.all(itemsToSave.map(async (it) => {
        const copy = { ...it };
        if (copy.expiryDate === '' && mode === 'services') copy.expiryDate = new Date();
        if (copy.images?.length) copy.images = await imagesToBase64(copy.images);
        return copy;
      }));

      // API call placeholder
      const newStock = await insertVendorStock(converted[0]);
      if (!newStock)
        return;

      setItems(converted);
      CustomToast('Success', `${mode === 'inventory' ? 'Item' : 'Service'} added successfully.`);
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save. Try again.');
    } finally {
      setIsLoading(false);
      // closeModal();
    }
  };

  const handleSave = () => {
    if (!user?.email) {
      Alert.alert('Login Required', 'Verify your email by logging in.', [
        { text: 'Cancel' },
        { text: 'Login', onPress: () => setShowLogin(true) }
      ]);
      return;
    }
    if (!validateForm()) return;

    const baseItem = {
      ...formData,
      id: editingItem?.id || Date.now().toString(),
      price: parseFloat(formData.price),
      costPrice: parseFloat(formData.costPrice) || 0,
      discount: parseFloat(formData.discount) || 0,
      minOrder: parseInt(formData.minOrder) || 1,
      maxOrder: parseInt(formData.maxOrder) || 100,
      lastUpdated: new Date().toISOString(),
      vendorId: vendorId,
      type: mode,
    };

    if (mode === 'inventory') {
      baseItem.quantity = parseInt(formData.quantity);
      baseItem.dateAdded = editingItem?.dateAdded || baseItem.lastUpdated;
      baseItem.totalSold = editingItem?.totalSold || 0;
    } else {
      baseItem.duration = parseFloat(formData.duration);
      baseItem.durationUnit = formData.durationUnit;
      baseItem.availability = formData.availability;
      baseItem.bookingSlots = formData.bookingSlots;
      baseItem.totalBookings = editingItem?.totalBookings || 0;
    }

    const currentItems = Array.isArray(items) ? items : [];

    const updatedItems = editingItem
      ? currentItems?.map(i => i.id === editingItem.id ? baseItem : i)
      : [...currentItems, baseItem];

    console.log(updatedItems.length)

    saveItems([baseItem]);
  };

  const handleDelete = (itemId) => {
    Alert.alert('Delete', `Delete this ${mode === 'inventory' ? 'item' : 'service'}?`, [
      { text: 'Cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: () => {
          const updated = items.filter(i => i.id !== itemId);
          setItems(updated);
          // Persist deletion if needed
        }
      }
    ]);
  };

  const filteredItems = items?.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = item.itemName?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.tags?.toLowerCase().includes(searchLower);
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formCategories = mode === 'inventory' ? inventoryCategories : serviceCategories;

  const renderCategoryCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryTouchable, selectedCategory === item && styles.selectedCategory, { borderColor: theme.colors.border }]}
      onPress={() => setSelectedCategory(item)}>
      <Text style={[styles.categoryText, selectedCategory === item && { color: "#cccccc" }]}>
        {item}
      </Text>
      {selectedCategory === item && (
        <Icons.MaterialIcons name="check" size={16} color={'#cccccc'} style={styles.checkIcon} />
      )}
    </TouchableOpacity>
  );

  const renderOverview = () => (
    <View style={[styles.overviewCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.statRow}>
        <View style={styles.statItem}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Total</Text>
          <Text variant="headlineSmall">{items?.length}</Text>
        </View>
        <Divider style={{ height: '100%' }} vertical />
        <View style={styles.statItem}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Low Stock</Text>
          <Text variant="headlineSmall">{mode === 'inventory' ? items?.filter(i => i.quantity < 10)?.length : 'N/A'}</Text>
        </View>
        <Divider style={{ height: '100%' }} vertical />
        <View style={styles.statItem}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{mode === 'inventory' ? 'Sold' : 'Booked'}</Text>
          <Text variant="headlineSmall">{items.reduce((sum, i) => sum + (i.totalSold || i.totalBookings || 0), 0)}</Text>
        </View>
      </View>
    </View>
  );

  const renderItemCard = ({ item, index }) => (
    <View key={index}
      style={[styles.itemWrapper, { backgroundColor: index % 2 === 0 ? theme.colors.card : theme.colors.sub_card, elevation: 2 }]}>
      <Card mode="elevated" style={[styles.itemCard, { backgroundColor: theme.colors.card }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.itemHeader}>
            {item.images?.[0] ? (
              <Image source={{ uri: item.images[0] }} style={styles.itemImage} />
            ) : (
              <Avatar.Icon size={60} icon={mode === 'inventory' ? 'package' : 'tools'} style={{ backgroundColor: theme.colors.surfaceVariant }} />
            )}
            <View style={styles.itemInfo}>
              <Text variant="titleMedium" numberOfLines={1} ellipsizeMode='tail'>{item.itemName}</Text>
              <Text variant="bodyMedium" numberOfLines={2} ellipsizeMode='tail' style={{ color: theme.colors.onSurfaceVariant }}>{item.description}</Text>
              <View style={styles.priceRow}>
                <Text variant="titleSmall" style={{ color: theme.colors.primary }}>SZL {item.price.toFixed(2)}</Text>
                {item.discount > 0 && <Badge style={{ backgroundColor: theme.colors.errorContainer, marginLeft: 8 }}>{item.discount}% off</Badge>}
              </View>
              {mode === 'inventory' ? (
                <Text variant="bodySmall" style={{ color: item.quantity < 10 ? theme.colors.error : theme.colors.onSurfaceVariant }}>
                  Stock: {item.quantity} {item.unit}
                </Text>
              ) : (
                <Text variant="bodySmall" style={{ color: item.availability ? theme.colors.primary : theme.colors.error }}>
                  {item.duration} {item.durationUnit} • {item.availability ? 'Available' : 'Unavailable'}
                </Text>
              )}
            </View>
          </View>
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Chip compact icon={mode === 'inventory' ? 'shopping' : 'calendar'}>{mode === 'inventory' ? item.totalSold : item.totalBookings || 0}</Chip>
          <View style={{ flexDirection: 'row' }}>
            <IconButton icon="pencil" onPress={() => openModal(item)} />
            <IconButton icon="delete" iconColor={theme.colors.error} onPress={() => handleDelete(item.id)} />
          </View>
        </Card.Actions>
      </Card>
    </View >
  );

  return (
    <View style={[styles.container]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <LoginScreen isLoginVisible={showLogin} onClose={() => setShowLogin(false)} />
      {isLoading && <CustomLoader />}

      <View style={[styles.header, { borderColor: theme.colors.border }]}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <View style={{ flex: 1 }}>
          {user ?
            <Image source={{ uri: vendor.avatar }} style={styles.userImage} />
            :
            <Icons.Ionicons name='person-circle-outline' size={30} color={theme.colors.indicator} />}
        </View>

        <SegmentedButtons
          value={mode}
          onValueChange={setMode}
          buttons={[
            { value: 'inventory', label: 'Inventory', icon: 'package' },
            { value: 'services', label: 'Services', icon: 'tools' },
          ]}
          style={[styles.modeSwitcher]}
        />
      </View>

      <View style={{ paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="bodyLarge" style={{ textAlign: 'center', paddingHorizontal: 10 }}>{vendor.businessName}</Text>
        <Text variant="bodyMedium" style={{ textAlign: 'center' }}>{items?.length} {mode === 'inventory' ? 'stock items' : 'services counting'}</Text>
      </View>

      <Searchbar
        placeholder={`Search ${mode}...`}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchbar, { backgroundColor: theme.colors.sub_card, borderColor: theme.colors.border }]}
        iconColor={theme.colors.text}
      />

      <View>
        <FlatList
          data={categories}
          renderItem={renderCategoryCard}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        />
      </View>

      {filteredItems?.length > 0 ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
          <View style={styles.listContainer}>
            {renderOverview()}
            {filteredItems.map((item, index) => renderItemCard({ item, index }))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Avatar.Icon size={64} icon="alert-circle" style={{ backgroundColor: theme.colors.placeholder }} />
          <Text variant="titleMedium" style={{ marginTop: 16, color: theme.colors.text }}>No {mode} found</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>Add your first {mode === 'inventory' ? 'product' : 'service'} to get started</Text>
        </View>
      )}

      <FAB
        icon="plus"
        iconColor={theme.colors.text}
        style={[styles.fab, { backgroundColor: theme.colors.card }]}
        onPress={() => openModal()}
      />

      {modalVisible && (
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }], backgroundColor: theme.colors.background }]}>
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: theme.colors.card }}>
            <View style={styles.sheetHeader}>
              <View style={styles.dragHandle} />
              <Text variant="titleLarge">{editingItem ? 'Edit' : 'Add'} {mode === 'inventory' ? 'Inventory' : 'Service'}</Text>
              <TouchableOpacity onPress={closeModal}>
                <Icons.FontAwesome name="remove" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <TextInput
                placeholder={`${mode === 'inventory' ? 'Product' : 'Service'} Name *`}
                value={formData.itemName}
                onChangeText={text => setFormData(prev => ({ ...prev, itemName: text }))}
                style={[styles.inputMargin]}
              />
              <TextInput
                placeholder="Description"
                value={formData.description}
                onChangeText={text => setFormData(prev => ({ ...prev, description: text }))}
                multiline
                style={[styles.inputMargin, {
                  minHeight: 80,
                  textAlignVertical: 'top'
                }]}
              />

              <View style={styles.row}>
                <TextInput
                  placeholder="Price (SZL) *"
                  value={formData.price}
                  onChangeText={text => setFormData(prev => ({ ...prev, price: text }))}
                  keyboardType="numeric"
                  style={[styles.flexInput, styles.inputMarginRight]}

                />
                <TextInput
                  placeholder="Cost Price"
                  value={formData.costPrice}
                  onChangeText={text => setFormData(prev => ({ ...prev, costPrice: text }))}
                  keyboardType="numeric"
                  style={[styles.flexInput]}

                />
              </View>

              {mode === 'inventory' ? (
                <>
                  <View style={styles.row}>
                    <TextInput
                      placeholder="Quantity *"
                      value={formData.quantity}
                      onChangeText={text => setFormData(prev => ({ ...prev, quantity: text }))}
                      style={[styles.flexInput, styles.inputMarginRight]}
                    />
                    <TextInput
                      placeholder="Discount (%)"
                      value={formData.discount}
                      onChangeText={text => setFormData(prev => ({ ...prev, discount: text }))}
                      keyboardType="numeric"
                      style={[styles.flexInput]}
                    />
                  </View>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)}
                    style={[styles.datePickerBtn, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                    <Text style={{ color: '#6b7280' }}>{formData.expiryDate ? new Date(formData.expiryDate).toLocaleDateString() : 'Set Expiry'}</Text>
                    <Icons.Ionicons name='calendar' size={20} color='#cccc' />
                  </TouchableOpacity>
                  {showDatePicker && <DateTimePicker value={formData.expiryDate ? new Date(formData.expiryDate) : new Date()} mode="date" onChange={onExpiryDateChange} />}
                </>
              ) : (
                <>
                  <View style={styles.row}>
                    <TextInput
                      placeholder="Duration *"
                      value={formData.duration}
                      onChangeText={text => setFormData(prev => ({ ...prev, duration: text }))}
                      keyboardType="numeric"
                      style={[styles.flexInput, styles.inputMarginRight]}
                    />

                    <Menu
                      visible={durationMenuVisible}
                      onDismiss={() => setDurationMenuVisible(false)}
                      anchorPosition="bottom"
                      contentStyle={{
                        backgroundColor: theme.colors.card,
                        borderRadius: 8,
                        elevation: 4,
                      }}
                      anchor={
                        <TouchableOpacity
                          style={[
                            styles.menuAnchor, styles.menu,
                            {
                              width: 160,
                              backgroundColor: '#f9fafb',
                              borderWidth: 1,
                              borderRadius: 8,
                              color: '#6b7280',
                              borderColor: '#e5e7eb',
                            }
                          ]}
                          onPress={() => setDurationMenuVisible(true)}
                          accessibilityLabel="Select duration unit"
                        >
                          <Text style={{ color: formData.durationUnit ? theme.colors.primary : theme.colors.onSurfaceVariant }}>
                            {formData.durationUnit || 'Select Unit'}
                          </Text>
                          <IconButton icon="chevron-down" size={20} />
                        </TouchableOpacity>
                      }
                    >
                      {/* Custom Header */}
                      <View style={{ padding: 12, backgroundColor: theme.colors.primaryContainer }}>
                        <Text variant="labelLarge" style={{ color: theme.colors.primary }}>Duration Units</Text>
                      </View>
                      <Divider />

                      {/* Custom Items with Radio Icons */}
                      {durationUnits?.map((u, index) => (
                        <React.Fragment key={`${u}-${index}`}>
                          <Menu.Item
                            key={u}
                            leadingIcon={formData.durationUnit === u ? 'check-circle' : 'circle-outline'} // Use your Icons constant
                            onPress={() => {
                              setFormData(prev => ({ ...prev, durationUnit: u }));
                              setDurationMenuVisible(false);
                            }}
                            title={u}
                            titleStyle={{ fontWeight: formData.durationUnit === u ? 'bold' : 'normal' }}
                          />
                          {index < durationUnits?.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}

                      {/* Custom Footer */}
                      <Divider />
                      <View style={{ padding: 8, alignItems: 'flex-end' }}>
                        <Button compact onPress={() => setDurationMenuVisible(false)}>Cancel</Button>
                      </View>
                    </Menu>
                  </View>

                  <List.Item
                    title="Is Available"
                    right={() => <Switch
                      style={styles.switch}
                      value={formData.availability}
                      trackColor={{ false: '#D1D5DB', true: '#60A5FA' }}
                      thumbColor={formData.availability ? '#FBBF24' : '#FFFFFF'}
                      onValueChange={val => setFormData(prev => ({ ...prev, availability: val }))}
                    />}
                  />
                  <TextInput
                    placeholder="Booking Slots (e.g., Mon-Fri 9-5)"
                    value={formData.bookingSlots}
                    onChangeText={text => setFormData(prev => ({ ...prev, bookingSlots: text }))}
                    style={[styles.inputMargin]}
                  />
                </>
              )}

              {/* Category Selector in Form */}
              <Menu
                visible={categoryMenuVisible}
                onDismiss={() => setCategoryMenuVisible(false)}
                anchorPosition="bottom"
                contentStyle={{
                  backgroundColor: theme.colors.card,
                  borderRadius: 8,
                  elevation: 4,
                }}
                anchor={
                  <TouchableOpacity
                    style={[
                      styles.menuAnchor, styles.menu,
                      {
                        backgroundColor: '#f9fafb',
                        borderWidth: 1,
                        borderRadius: 8,
                        color: '#6b7280',
                        borderColor: '#e5e7eb',
                      }
                    ]}
                    onPress={() => setCategoryMenuVisible(true)}
                    accessibilityLabel="Select category"
                  >
                    <Text style={{ color: formData.category ? theme.colors.primary : theme.colors.onSurfaceVariant }}>
                      {formData.category || 'Select Category'}
                    </Text>
                    <IconButton icon="chevron-down" size={20} />
                  </TouchableOpacity>
                }
              >
                {/* Custom Header */}
                <View style={{ padding: 12, backgroundColor: theme.colors.primaryContainer }}>
                  <Text variant="labelLarge" style={{ color: theme.colors.primary }}>Product Category</Text>
                </View>
                <Divider />

                {/* Custom Items with Radio Icons */}
                {formCategories.map((cat, index) => (
                  <React.Fragment key={`${cat}-${index}`}>
                    <Menu.Item
                      key={cat}
                      leadingIcon={formData.category === cat ? 'check-circle' : 'circle-outline'}
                      onPress={() => {
                        setFormData(prev => ({ ...prev, category: cat }));
                        setCategoryMenuVisible(false);
                      }}
                      titleStyle={{ fontWeight: formData.category === cat ? 'bold' : 'normal' }}
                      title={cat} />
                    {index < formCategories?.length - 1 && <Divider />}
                  </React.Fragment>
                ))}

                {/* Custom Footer */}
                <Divider />
                <View style={{ padding: 8, alignItems: 'flex-end' }}>
                  <Button compact onPress={() => setCategoryMenuVisible(false)}>Cancel</Button>
                </View>
              </Menu>

              <View style={styles.field}>
                <TextInput
                  placeholder="Tags (Local, Organic)"
                  value={formData.tags}
                  onChangeText={text => setFormData(prev => ({ ...prev, tags: text }))}
                  style={[styles.inputMargin, { marginTop: 12 }]}
                />
              </View>

              <View style={styles.row}>
                <TextInput
                  placeholder="Min Order/Book"
                  value={formData.minOrder}
                  onChangeText={text => setFormData(prev => ({ ...prev, minOrder: text }))}
                  keyboardType="numeric"
                  style={[styles.flexInput, styles.inputMarginRight]}
                />
                <TextInput
                  label="Max Order/Book"
                  value={formData.maxOrder}
                  onChangeText={text => setFormData(prev => ({ ...prev, maxOrder: text }))}
                  keyboardType="numeric"
                  style={[styles.flexInput]}
                />
              </View>

              {mode === 'inventory' && (
                <TextInput
                  placeholder="Barcode/ID"
                  value={formData.barcode}
                  onChangeText={text => setFormData(prev => ({ ...prev, barcode: text }))}
                  style={[styles.inputMargin]}
                />
              )}

              <View style={styles.imageSection}>
                <Text variant="titleMedium">Images (up to 5)</Text>
                <View style={[styles.row, { gap: 10, justifyContent: 'space-between' }]}>
                  <TouchableOpacity style={styles.imageOption} onPress={handleCamera}>
                    {isTakePhoto
                      ? <ActivityIndicator animating={true} color='#4F46E5' />
                      : <Icons.AntDesign name='camerao' size={24} color="#4F46E5" />
                    }
                    <Text style={styles.imageOptionText}>Take Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.imageOption} onPress={handleImagePicker}>
                    {isPickImage
                      ? <ActivityIndicator animating={true} color='#4F46E5' />
                      : <Icons.Ionicons name='images-outline' size={24} color="#4F46E5" />
                    }
                    <Text style={styles.imageOptionText}>Gallery</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal>
                  {formData.images.map((uri, idx) => (
                    <View key={idx} style={styles.thumbContainer}>
                      <Image source={{ uri }} style={styles.thumb} />
                      <View style={[styles.removeThumb, {
                        backgroundColor: theme.colors.notification
                      }]}>
                        <Icons.FontAwesome name="remove" size={20} color={theme.colors.primary} onPress={() => removeImage(idx)} /></View>
                    </View>
                  ))}
                </ScrollView>
                <HelperText type="info">First image is primary thumbnail</HelperText>
              </View>

              <View style={styles.modalActions}>
                {/* cancel button */}
                <TouchableOpacity
                  style={[styles.editButton, { borderColor: theme.colors.border }]}
                  onPress={closeModal}
                >
                  <Icons.FontAwesome name='remove' size={16} color={theme.colors.text} />
                  <Text style={[styles.buttonText, { color: theme.colors.text }]}>Cancel</Text>
                </TouchableOpacity>

                {/* saved button */}
                <TouchableOpacity
                  style={[styles.editButton, !editingItem && styles.saveButton, { borderColor: theme.colors.border }]}
                  onPress={editingItem ? () => setEditingItem(true) : handleSave}
                >
                  {editingItem ? (
                    <>
                      <Icons.FontAwesome name='edit' size={16} color={theme.colors.text} />
                      <Text style={[styles.editButtonText, { color: theme.colors.sub_text }]}>Edit</Text>
                    </>
                  ) : (
                    <>
                      <Icons.Ionicons name='save-outline' size={16} color='#ffff' />
                      <Text style={[styles.buttonText]}>Save</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingTop: 40,
  },
  userImage: {
    width: 40, height: 40,
    borderRadius: 20, marginRight: 12
  },
  modeSwitcher: {
    width: 200
  },
  searchbar: {
    paddingVertical: 2,
    elevation: 4,
    margin: 10
  },
  categoryScroll: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    justifyContent: 'center',
  },
  categoryTouchable: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 50,
    marginRight: 8,
    backgroundColor: '#F4F0FF',
    borderColor: 'transparent',
  },
  selectedCategory: {
    backgroundColor: '#003366', // Light blue tint for selection, adapt to theme if needed
    borderColor: '#2196f3',
  },
  categoryText: {
    color: '#7d7d7dff',
    marginRight: 4,
  },
  checkIcon: {
    marginLeft: 4,
  },
  listContainer: { padding: 16 },
  overviewCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  statItem: { alignItems: 'center' },
  itemWrapper: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  itemCard: {
    backgroundColor: 'transparent', // Inherit from wrapper
  },
  cardContent: { paddingBottom: 8 },
  itemHeader: { flexDirection: 'row' },
  itemImage: {
    width: 60, height: 60,
    borderRadius: 8, marginRight: 12
  },
  itemInfo: {},
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center', marginVertical: 4
  },
  cardActions: { justifyContent: 'space-between' },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: '10%'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: screenHeight * 0.92,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderColor: '#ccc',
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  dragHandle: {
    position: 'absolute',
    left: '50%',
    top: 8,
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ccc',
    marginLeft: -20
  },
  modalScroll: { padding: 16 },
  menu: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 2,
    marginTop: 5
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 16,
    marginBottom: 12
  },
  flexInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderRadius: 8,
    color: '#6b7280',
    borderColor: '#e5e7eb',
    flex: 1,
  },
  inputMargin: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    color: '#6b7280',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12
  },
  inputMarginRight: { marginRight: 6 },
  menuAnchor: {
    padding: 16,
    justifyContent: 'center'
  },
  datePickerBtn: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderRadius: 8,
    color: '#6b7280',
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 12
  },
  switch: {
    transform: [{ scale: 0.85 }], // Slightly smaller switch
  },
  imageSection: { marginVertical: 3 },
  imageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 8,
    flex: 0.48,
  },
  imageOptionText: {
    marginLeft: 8,
    color: '#4F46E5',
    fontWeight: '500',
  },
  thumbContainer: {
    position: 'relative',
    marginRight: 12,
    paddingVertical: 5
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: 8
  },
  removeThumb: {
    position: 'absolute',
    top: 0,
    right: -5,
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 20,

  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 2,
    marginBottom: 75,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1
  },
  saveButton: {
    backgroundColor: '#003366',
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  }
});
