// screens/SavedListsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, Share, Image, FlatList, Animated, Modal, TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icons } from '../constants/Icons';
import { Images } from '../constants/Images';

export default function SavedListsScreen({ navigation }) {
  const [savedLists, setSavedLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = new Animated.Value(0);

  // Load saved lists on mount
  useEffect(() => {
    loadSavedLists();
  }, []);

  const loadSavedLists = async () => {
    try {
      const data = await AsyncStorage.getItem('saved_shopping_lists');
      if (data) {
        const lists = JSON.parse(data);
        setSavedLists(lists.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)));
      }
    } catch (error) {
      console.error("Failed to load lists:", error);
    }
  };

  const deleteList = (id) => {
    Alert.alert(
      "Delete List",
      "Are you sure you want to delete this list?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updated = savedLists.filter(l => l.id !== id);
            setSavedLists(updated);
            await AsyncStorage.setItem('saved_shopping_lists', JSON.stringify(updated));
          }
        }
      ]
    );
  };

  const clearAllLists = () => {
    Alert.alert(
      "Clear All Lists",
      "This will delete ALL saved shopping lists permanently.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            setSavedLists([]);
            await AsyncStorage.removeItem('saved_shopping_lists');
            Alert.alert("Cleared", "All saved lists have been removed.");
          }
        }
      ]
    );
  };

  const shareList = async (list) => {
    const itemsText = list.items.map(item => {
      const name = Array.isArray(item.item) ? item.item.join(' + ') : String(item.item || '');
      return `• ${name} @ ${item.store} — SZL ${String(item.price || '').replace(/[$,]/g, '')}`;
    }).join('\n');

    const message = `${list.name}\nSaved on: ${new Date(list.savedAt).toLocaleDateString()}\nTotal: SZL ${list.total.toFixed(2)}\n\n${itemsText}\n\nShared via Business Link App`;

    try {
      await Share.share({ message, title: list.name });
    } catch (error) {
      Alert.alert("Error", "Could not share list");
    }
  };

  const openList = (list) => {
    setSelectedList(list);
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedList(null);
    });
  };

  const formatDate = (iso) => {
    const date = new Date(iso);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const getPriceNumber = (price) => {
    const cleaned = String(price || '0').replace(/[$,R\s]/g, '').trim();
    return parseFloat(cleaned) || 0;
  };

  if (savedLists.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icons.Ionicons name="bookmark-outline" size={80} color="#ccc" />
        <Text style={styles.emptyTitle}>No Saved Lists</Text>
        <Text style={styles.emptySubtitle}>Your saved shopping lists will appear here</Text>
        <TouchableOpacity
          style={styles.goBackBtn}
          onPress={() => navigation.navigate('BasketScreen')}
        >
          <Text style={styles.goBackText}>Go to Basket</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Lists</Text>
        {savedLists.length > 0 && (
          <TouchableOpacity onPress={clearAllLists}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={savedLists}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listCard}
            onPress={() => openList(item)}
            activeOpacity={0.8}
          >
            <View style={styles.cardLeft}>
              <Icons.Ionicons name="bookmark" size={32} color="#E61F46" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.listName}>{item.name}</Text>
                <Text style={styles.listInfo}>
                  {item.items.length} items • {formatDate(item.savedAt)}
                </Text>
              </View>
            </View>

            <View style={styles.cardRight}>
              <Text style={styles.listTotal}>SZL {item.total.toFixed(2)}</Text>
              <Icons.Ionicons name="chevron-forward" size={24} color="#999" />
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Detail Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedList && (
              <>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={closeModal}>
                    <Icons.Ionicons name="close" size={28} color="#666" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle} numberOfLines={1}>
                    {selectedList.name}
                  </Text>
                  <TouchableOpacity onPress={() => shareList(selectedList)}>
                    <Icons.Ionicons name="share-social" size={24} color="#E61F46" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.savedDate}>
                  Saved {formatDate(selectedList.savedAt)}
                </Text>

                <ScrollView
                  style={{ flex: 1, maxHeight: 500 }}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  {selectedList.items.map((item, idx) => (
                    <View key={idx} style={styles.modalItem}>
                      <Image
                        source={{ uri: item.image }}
                        style={styles.modalImage}
                        defaultSource={Images.combo}
                        resizeMode="cover"
                      />
                      <View style={styles.modalItemInfo}>
                        <Text style={styles.modalItemName} numberOfLines={2}>
                          {Array.isArray(item.item)
                            ? item.item.join(' + ')
                            : String(item.item || 'Unknown Item')
                          }
                        </Text>
                        <Text style={styles.modalStore}>{item.store}</Text>
                        <Text style={styles.modalPrice}>
                          SZL {getPriceNumber(item.price).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.modalFooter}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalAmount}>
                      SZL {selectedList.total.toFixed(2)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => {
                      closeModal();
                      deleteList(selectedList.id);
                    }}
                  >
                    <Icons.Ionicons name="trash" size={20} color="#fff" />
                    <Text style={styles.deleteText}>Delete List</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  clearAllText: { color: '#fff', fontWeight: '600', fontSize: 16 },

  listCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center' },
  listName: { fontSize: 18, fontWeight: '600', color: '#333' },
  listInfo: { fontSize: 14, color: '#888', marginTop: 4 },
  cardRight: { alignItems: 'flex-end' },
  listTotal: { fontSize: 20, fontWeight: 'bold', color: '#E61F46' },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: '#999', marginTop: 20 },
  emptySubtitle: { fontSize: 16, color: '#aaa', marginTop: 8, textAlign: 'center' },
  goBackBtn: {
    marginTop: 30,
    backgroundColor: '#E61F46',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
  },
  goBackText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  modalContent: {
    backgroundColor: '#fff',
    width: '92%',
    height: '85%',           // ← Fixed height
    maxHeight: 700,
    borderRadius: 20,
    padding: 20,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 16,
    textAlign: 'center',
  },
  savedDate: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 16 },

  modalItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  modalImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
  },
  modalItemInfo: { flex: 1 },
  modalItemName: { fontSize: 15, fontWeight: '600', color: '#333' },
  modalStore: { fontSize: 14, color: '#E61F46', marginTop: 4 },
  modalPrice: { fontSize: 18, fontWeight: 'bold', color: '#E61F46', marginTop: 6 },

  modalFooter: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  totalLabel: { fontSize: 20, fontWeight: '600', color: '#333' },
  totalAmount: { fontSize: 28, fontWeight: 'bold', color: '#E61F46' },

  modalActions: { alignItems: 'center' },
  deleteBtn: {
    flexDirection: 'row',
    backgroundColor: '#E61F46',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    gap: 8,
  },
  deleteText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});