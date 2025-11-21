// screens/BasketScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  ScrollView, View, Text, StyleSheet, TouchableOpacity,
  Image, Alert, Share
} from 'react-native';
import { useBasket } from '../../context/basketContext';
import { Icons } from '../../constants/Icons';
import { Images } from '../../constants/Images';

export default function BasketScreen({ navigation }) {
  const { basket, removeFromBasket, clearBasket } = useBasket();
  const [basketItems, setBasketItems] = useState(basket);

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

  const total = basketItems.reduce((sum, item) => sum + item.price, 0)?.toFixed(2);

  const shareList = async () => {
    const itemsText = basketItems.map(item =>
      `• ${item.name} @ ${item.store} — SZL ${item.price?.toFixed(2)}`
    ).join('\n');

    const message = `My Shopping List (Total: SZL ${total})\n\n${itemsText}\n\nShared via Expo App`;

    try {
      await Share.share({
        message,
        title: 'My Basket'
      });
    } catch (error) {
      Alert.alert("Error", "Could not share");
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

        <TouchableOpacity onPress={() => { }} style={{ borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: 'rgba(255,255,255,0.2)' }}>
          <Icons.Ionicons name='save-outline' color={'#fff'} size={24} />
        </TouchableOpacity>

        <TouchableOpacity onPress={clearAll} style={{ borderRadius: 20, paddingHorizontal: 20, paddingVertical: 5, backgroundColor: 'rgba(255,255,255,0.2)' }}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {basketItems.map((item, index) => (
          <View key={item.id + index} style={styles.itemCard}>
            <Image
              source={Images.product}
              style={styles.itemImage}
              resizeMode="cover"
              defaultSource={Images.item}
            />

            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.name}
              </Text>
              <View style={styles.storeRow}>
                <Icons.Ionicons name="storefront" size={16} color="#E61F46" />
                <Text style={styles.storeName}>{item.store}</Text>
              </View>
              <Text style={styles.price}>SZL {item.price?.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeItem(item.id)}
            >
              <Icons.Ionicons name="trash" size={24} color="#E61F46" />
            </TouchableOpacity>
          </View>
        ))}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalPrice}>SZL {total}</Text>
        </View>

        <TouchableOpacity style={styles.shareBtn} onPress={shareList}>
          <Icons.Ionicons name="share-social" size={24} color="#fff" />
          <Text style={styles.shareText}>Share List via WhatsApp</Text>
        </TouchableOpacity>
      </View>
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
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  clearText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  scroll: { flex: 1 },

  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 12,
    elevation: 5,
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  itemInfo: { flex: 1 },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    lineHeight: 22,
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
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 30,
  },

  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    borderTopWidth: 1,
    marginBottom: 55,
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
});