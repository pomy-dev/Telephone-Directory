// screens/SearchCompareScreen.tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet,
  ScrollView, Image, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Icons } from '../../constants/Icons';
import Animated, { useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { fetchFlyerItems } from '../../service/Supabase-Fuctions';
import { supabase } from '../../service/Supabase-Client';
import { Images } from '../../constants/Images';
import { useBasket } from '../../context/basketContext';
import CustomLoader from '../../components/customLoader';

export default function SearchCompareScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [productMode, setProductMode] = useState('single'); // 'single' or 'combo'
  const { basket, addToBasket } = useBasket();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);

  // SAFE PRICE HELPER — DEFINED EARLY
  const safePrice = (price) => {
    const num = parseFloat(String(price || '0').replace(/[$,R\s]/g, '')) || 0;
    return num.toFixed(2);
  };

  const safePriceNumber = (price) => {
    return parseFloat(String(price || '0').replace(/[$,R\s]/g, '')) || 0;
  };

  // FETCH + REALTIME
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetchFlyerItems(1);
        if (isMounted) setDeals(res.items || []);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    const channel = supabase
      .channel('flyer-items')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pomy_flyer_items' },
        (payload) => {
          const { eventType, new: newItem, old: oldItem } = payload;

          setDeals((prev) => {
            let updated = [...prev];

            if (eventType === 'INSERT' && newItem) {
              updated = [newItem, ...updated];
            }
            if (eventType === 'UPDATE' && newItem) {
              updated = updated.map((i) => (i.id === newItem.id ? newItem : i));
            }
            if (eventType === 'DELETE' && oldItem) {
              updated = updated.filter((i) => i.id !== oldItem.id);
            }

            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // SEARCH LOGIC — BULLETPROOF
  const results = useMemo(() => {
    if (query.length < 2) return [];

    const lowerQuery = query.toLowerCase().trim();

    return deals
      .filter((deal) => {
        if (!deal.type) return true;
        const type = deal.type.toLowerCase();
        if (productMode === 'single') return type.includes('single');
        if (productMode === 'combo') return type.includes('combo');
        return true;
      })
      .filter((deal) => {
        const itemText = Array.isArray(deal.item)
          ? deal.item.join(' ').toLowerCase()
          : String(deal.item || '').toLowerCase();

        const searchFields = [
          itemText,
          (deal.store || '').toLowerCase(),
          (deal.type || '').toLowerCase(),
          [deal.unit, deal.perKg, deal.perL, deal.description].filter(Boolean).join(' ').toLowerCase(),
          String(deal.price || '').toLowerCase(),
        ].join(' ');

        return searchFields.includes(lowerQuery);
      })
      .sort((a, b) => safePriceNumber(a.price) - safePriceNumber(b.price));
  }, [query, deals, productMode]);

  const isInBasket = (deal) => basket.some((i) => i.id === deal.id);
  const selectedCount = results.filter(isInBasket).length;
  const totalPrice = results
    .filter(isInBasket)
    .reduce((sum, deal) => sum + safePriceNumber(deal.price), 0)
    .toFixed(2);

  const animatedFab = useAnimatedStyle(() => ({
    transform: [{ scale: withRepeat(withTiming(selectedCount > 0 ? 1.08 : 1, { duration: 1000 }), -1, true) }],
  }));

  const toggleSelect = (deal) => {
    addToBasket(deal, deal.store);
  };

  return (
    <View style={[styles.container, { backgroundColor: '#f8f8f8' }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, productMode === 'single' && styles.activeToggle]}
            onPress={() => setProductMode('single')}
          >
            <Text style={productMode === 'single' ? styles.activeText : styles.inactiveText}>Loose</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, productMode === 'combo' && styles.activeToggle]}
            onPress={() => setProductMode('combo')}
          >
            <Text style={productMode === 'combo' ? styles.activeText : styles.inactiveText}>Combo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={24} color="#666" style={{ marginLeft: 12 }} />
        <TextInput
          placeholder="Search rice, oil, pampers, Shoprite..."
          value={query}
          onChangeText={setQuery}
          style={styles.input}
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={24} color="#999" style={{ marginRight: 12 }} />
          </TouchableOpacity>
        )}
      </View>

      {loading && <CustomLoader />}

      {/* View Mode Toggle */}
      {results.length > 0 && (
        <View style={styles.toggleBar}>
          <Text style={styles.resultText}>Found {results.length} deal{results.length > 1 ? 's' : ''}</Text>
          <View style={{
            flexDirection: 'row',
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: 20,
            padding: 4
          }}>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'table' && styles.activeToggle]}
              onPress={() => setViewMode('table')}
            >
              <Ionicons name="list" size={22} color={viewMode === 'table' ? '#000' : '#dddd'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'grid' && styles.activeToggle]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons name="grid" size={22} color={viewMode === 'grid' ? '#000' : '#dddd'} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Results */}
      {results.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={80} color="#ddd" />
          <Text style={styles.emptyText}>
            {query.length < 2 ? 'Type to search everything' : 'No deals found'}
          </Text>
        </View>
      ) : viewMode === 'table' ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ marginBottom: 25 }}>
            <View style={styles.row}>
              <Text style={[styles.cellHeader, { width: 50 }]}>✔️</Text>
              <Text style={[styles.cellHeader, { width: 150 }]}>Store</Text>
              <Text style={[styles.cellHeader, { width: 120 }]}>Price</Text>
              <Text style={[styles.cellHeader, { width: 180 }]}>Item</Text>
              <Text style={[styles.cellHeader, { width: 100 }]}>Unit</Text>
              <Text style={[styles.cellHeader, { width: 100 }]}>Type</Text>
            </View>

            {results.map((deal) => {
              const selected = isInBasket(deal);
              return (
                <View key={deal.id} style={styles.row}>
                  <TouchableOpacity onPress={() => toggleSelect(deal)} style={styles.checkboxContainer}>
                    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                      {selected && <Icons.Ionicons name="checkmark" size={16} color="#fff" />}
                    </View>
                  </TouchableOpacity>

                  <Text style={[styles.cell, { width: 150 }]}>{deal.store}</Text>
                  <Text style={[styles.cell, { width: 120, fontWeight: 'bold', color: '#E61F46' }]}>
                    SZL {safePrice(deal.price)}
                  </Text>
                  <Text style={[styles.cell, { width: 180 }]} numberOfLines={2}>
                    {Array.isArray(deal.item) ? deal.item.join(' + ') : String(deal.item || 'N/A')}
                  </Text>
                  <Text style={[styles.cell, { width: 100 }]}>
                    {deal.unit || deal.perKg || '-'}
                  </Text>
                  <Text style={[styles.cell, { width: 100 }]}>{deal.type || 'N/A'}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={results}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item: deal }) => {
            const selected = isInBasket(deal);
            return (
              <TouchableOpacity
                style={[styles.gridCard, selected && styles.selectedCard]}
                onPress={() => toggleSelect(deal)}
              >
                <Image
                  source={deal.type?.includes('combo') ? Images.combo : Images.single}
                  style={styles.gridImage}
                  resizeMode="cover"
                />
                <Text style={styles.gridName} numberOfLines={2}>
                  {Array.isArray(deal.item) ? deal.item.join(' + ') : String(deal.item || 'Item')}
                </Text>
                <Text style={styles.gridStore}>{deal.store}</Text>
                <Text style={styles.gridPrice}>SZL {safePrice(deal.price)}</Text>
                {selected ? (
                  <Ionicons name="checkmark-circle" size={36} color="#4CAF50" style={styles.check} />
                ) : (
                  <Ionicons name="add-circle-outline" size={36} color="#E61F46" style={styles.check} />
                )}
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 8, paddingBottom: 120 }}
        />
      )}

      {/* FAB */}
      {selectedCount > 0 && (
        <Animated.View style={[styles.fab, animatedFab]}>
          <TouchableOpacity
            style={styles.fabInner}
            onPress={() => navigation.navigate('BasketScreen')}
          >
            <Ionicons name="bag-check" size={28} color="#fff" />
            <Text style={styles.fabText}>SZL {totalPrice}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

// Updated Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E61F46',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 4,
  },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  activeToggle: { backgroundColor: '#fff' },
  activeText: { color: '#000', fontWeight: 'bold' },
  inactiveText: { color: '#ddd' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 30,
    elevation: 6,
  },
  input: { flex: 1, paddingVertical: 16, paddingHorizontal: 12, fontSize: 17 },

  toggleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultText: { fontSize: 16, fontWeight: '600', color: '#333' },

  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  cellHeader: {
    padding: 12,
    backgroundColor: '#E61F46',
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cell: {
    padding: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  checkboxContainer: { width: 50, justifyContent: 'center', alignItems: 'center' },
  checkbox: {
    height: 22,
    width: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E61F46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: { backgroundColor: '#E61F46' },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 20, fontSize: 18, color: '#999' },

  gridCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 6,
    padding: 12,
    maxWidth: '48%',
  },
  selectedCard: { borderWidth: 4, borderColor: '#4CAF50' },
  gridImage: { width: '100%', height: 100, borderRadius: 12, marginBottom: 8 },
  gridName: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  gridStore: { fontSize: 13, color: '#E61F46', textAlign: 'center', marginTop: 4 },
  gridPrice: { fontSize: 18, fontWeight: 'bold', color: '#E61F46', textAlign: 'center', marginTop: 6 },
  check: { position: 'absolute', top: 8, right: 8 },

  fab: { position: 'absolute', bottom: 80, right: 20 },
  fabInner: {
    backgroundColor: '#E61F46',
    padding: 18,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
});