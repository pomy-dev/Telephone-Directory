import React, { useState, useEffect } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  Image, Alert, Share, TextInput, Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBasket } from '../../context/basketContext';
import { Icons } from '../../constants/Icons';
import { Images } from '../../constants/Images';

export default function BasketScreen({ navigation }) {
  const { basket, removeFromBasket, clearBasket } = useBasket();
  const [basketItems, setBasketItems] = useState(basket);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [listName, setListName] = useState('');

  useEffect(() => {
    if (basket.length > 0) {
      setBasketItems(basket);
    }
  }, [basket]);

  const removeItem = (id) => {
    setBasketItems(prev => prev.filter(item => item.id !== id));
    removeFromBasket(id)
  };

  const clearAll = () => {
    Alert.alert(
      "Clear Basket",
      "Remove all items?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes", onPress: () => {
            clearBasket()
            setBasketItems([])
          }
        }
      ]
    );
  };

  const total = basketItems.reduce((sum, item) => {
    const priceStr = String(item.price || '0').replace(/[$,]/g, '').trim();
    const priceNum = parseFloat(priceStr) || 0;
    return sum + priceNum;
  }, 0).toFixed(2);

  const shareList = async () => {
    const itemsText = basketItems.map(item => {
      const name = Array.isArray(item.item) ? item.item.join(' + ') : String(item.item || '');
      return `• ${name} @ ${item.store} — SZL ${String(item.price || '0').replace(/[$,]/g, '')}`;
    }).join('\n');

    const message = `My Shopping List${listName ? ` - ${listName}` : ''}\nTotal: SZL ${total}\n\n${itemsText}\n\nDownload Business Link App from Play Store`;

    try {
      await Share.share({ message, title: 'My Shopping List' });
    } catch (error) {
      Alert.alert("Error", "Could not share list");
    }
  };

  const saveList = async () => {
    if (!listName.trim()) {
      Alert.alert("Name Required", "Please enter a name for your list");
      return;
    }

    try {
      const savedList = {
        id: Date.now().toString(),
        name: listName.trim(),
        items: basketItems,
        total: basketItems.reduce((sum, item) => {
          const priceStr = String(item.price || '0.00').replace(/[^0-9.,]/g, '');
          return sum + (parseFloat(priceStr) || 0);
        }, 0),
        savedAt: new Date().toISOString(),
      };

      // Get existing lists
      const existing = await AsyncStorage.getItem('saved_shopping_lists');
      const lists = existing ? JSON.parse(existing) : [];

      // Add new list
      lists.push(savedList);

      // Save back
      await AsyncStorage.setItem('saved_shopping_lists', JSON.stringify(lists));

      Alert.alert(
        "List Saved!",
        `"${listName}" has been saved successfully.`,
        [{
          text: "OK", onPress: () => {
            setSaveModalVisible(false);
            setListName('');
          }
        }]
      );
    } catch (error) {
      console.error("Save failed:", error);
      Alert.alert("Error", "Could not save list. Try again.");
    }
  };

  if (basketItems.length === 0) {
    return (
      <View style={styles.empty}>
        <Icons.Ionicons name="cart-outline" size={90} color="#ddd" />
        <Text style={styles.emptyText}>Your basket is empty</Text>
        <Text style={styles.sub}>Go compare and add items!</Text>
        <TouchableOpacity style={styles.goBackBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.goBackText}>← Back to Compare</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <TouchableOpacity
            onPress={() => setSaveModalVisible(true)}
            style={styles.headerBtn}
          >
            <Icons.Ionicons name='save-outline' color={'#fff'} size={24} />
            <Text style={styles.headerBtnText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={clearAll} style={styles.headerBtn}>
            <Icons.MaterialIcons name='cancel' color={'#fff'} size={24} />
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {basketItems.map((item, index) => (
          <View key={index} style={styles.itemCard}>
            <Image
              source={Images.tagdeals}
              style={styles.itemImage}
              resizeMode="cover"
              defaultSource={Images.combo}
            />

            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>{item.item}</Text>
              <View style={styles.storeRow}>
                <Icons.Ionicons name="storefront" size={16} color="#E61F46" />
                <Text style={styles.storeName}>{item.store}</Text>
              </View>
              <Text style={styles.price}>SZL {parseFloat(String(item.price)?.replace(/[^0-9.,]/g, '') || '0.00').toFixed(2) || 'NaN'}</Text>
            </View>

            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeItem(item.id)}
            >
              <Icons.Ionicons name="trash" size={24} color="#E61F46" />
            </TouchableOpacity>
          </View>
        ))}
        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>SZL {total}</Text>
        </View>

        <TouchableOpacity style={styles.shareBtn} onPress={shareList}>
          <Icons.Ionicons name="share-social" size={24} color="#fff" />
          <Text style={styles.shareText}>Share List</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={saveModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save Shopping List</Text>
            <Text style={styles.modalSubtitle}>Give your list a name</Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Monthly Groceries, Tools Combo"
              value={listName}
              onChangeText={setListName}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => {
                  setSaveModalVisible(false);
                  setListName('');
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={saveList}
              >
                <Text style={styles.saveBtnText}>Save List</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E61F46',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  headerBtnText: { color: '#fff', fontWeight: '600' },
  clearText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  scroll: { flex: 1 },

  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  itemInfo: { flex: 1 },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    lineHeight: 20,
  },
  storeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  storeName: { marginLeft: 6, color: '#E61F46', fontWeight: '600' },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E61F46',
    marginTop: 8,
  },
  removeBtn: {
    height: 45,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#ffebee',
    borderRadius: 30,
  },

  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    marginBottom: 40,
    borderColor: '#eee',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: { fontSize: 20, fontWeight: '600', color: '#333' },
  totalPrice: { fontSize: 28, fontWeight: 'bold', color: '#E61F46' },

  shareBtn: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  shareText: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginLeft: 10 },

  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: { fontSize: 22, fontWeight: 'bold', color: '#999', marginTop: 20 },
  sub: { fontSize: 16, color: '#aaa', marginTop: 10 },
  goBackBtn: {
    marginTop: 30,
    backgroundColor: '#E61F46',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 30,
  },
  goBackText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 20,
    padding: 24,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  modalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  cancelBtn: {
    backgroundColor: '#eee',
  },
  saveBtn: {
    backgroundColor: '#E61F46',
  },
  cancelText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#666',
  },
  saveBtnText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 16,
  },
});