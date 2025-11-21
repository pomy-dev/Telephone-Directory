// screens/SearchCompareScreen.tsx
import React, { useState, useMemo } from 'react';
import {
  View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet,
  ScrollView, Image, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Icons } from '../../constants/Icons'
import Animated, { useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { mockDeals } from '../../utils/mockData';
import { Images } from '../../constants/Images';
import { useBasket } from '../../context/basketContext';

export default function SearchCompareScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [productMode, setProductMode] = useState('single');
  const { basket, addToBasket } = useBasket();

  const results = useMemo(() => {
    if (query.length < 2) return [];

    const typeItems = mockDeals.deals
      .filter(deal => {
        return deal = deal.type === productMode?.toLowerCase()
      }) || [];

    const lower = query.toLowerCase();

    return typeItems.filter(deal => {
      const name = deal.name.toLowerCase();
      const items = deal.items ? deal.items.join(' ').toLowerCase() : '';
      const category = deal.category?.toLowerCase() || '';
      const type = deal.type?.toLowerCase() || '';
      const store = deal.store.toLowerCase();
      const unit = (deal.unit || deal.perKg || deal.perL || '').toString().toLowerCase();
      const price = deal.price.toString();

      return (
        name.includes(lower) ||
        items.includes(lower) ||
        category.includes(lower) ||
        type.includes(lower) ||
        store.includes(lower) ||
        unit.includes(lower) ||
        price.includes(lower)
      );
    })
      .sort((a, b) => a.price - b.price);
  }, [query, productMode]);

  const isInBasket = (deal) => basket.some(i => i.id === deal.id);
  const selectedCount = results.filter(deal => isInBasket(deal)).length;
  const totalPrice = results
    .filter(deal => isInBasket(deal))
    .reduce((sum, deal) => sum + deal.price, 0)
    .toFixed(2);

  const animatedFab = useAnimatedStyle(() => ({
    transform: [{ scale: withRepeat(withTiming(selectedCount > 0 ? 1.08 : 1, { duration: 1000 }), -1, true) }],
  }));

  const toggleSelect = (deal) => {
    addToBasket(deal, deal.store)
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        {/* View Toggle */}
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, productMode === 'single' && styles.activeToggle]}
            onPress={() => setProductMode('single')}
          >
            <Text style={{ size: 20, color: productMode === 'single' ? '#000000' : '#999' }}>
              Loose
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, productMode === 'combo' && styles.activeToggle]}
            onPress={() => setProductMode('combo')}
          >
            <Text style={{ size: 20, color: productMode === 'combo' ? '#000000' : '#999' }}>
              Combo
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={24} color="#666" style={{ marginLeft: 12 }} />
        <TextInput
          placeholder="Search rice, oil, pampers, Shoprite, 100..."
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

      {/* Toggle View Mode */}
      {results.length > 0 && (
        <View style={styles.toggleBar}>
          <Text style={styles.resultText}>Found {results.length} deal{results.length > 1 ? 's' : ''}</Text>
          <View style={styles.toggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'table' && styles.active]}
              onPress={() => setViewMode('table')}
            >
              <Ionicons name="grid" size={22} color={viewMode === 'table' ? '#fff' : '#666'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'grid' && styles.active]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons name="list" size={22} color={viewMode === 'grid' ? '#fff' : '#666'} />
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
            {/* TABLE HEADER */}
            <View style={styles.row}>
              <Text style={[styles.cellHeader, { width: 50 }]}>✔️</Text>
              <Text style={[styles.cellHeader, { width: 150 }]}>Store</Text>
              <Text style={[styles.cellHeader, { width: 120 }]}>Price</Text>
              <Text style={[styles.cellHeader, { width: 120 }]}>Item</Text>
              <Text style={[styles.cellHeader, { width: 120 }]}>Unit</Text>
              <Text style={[styles.cellHeader, { width: 120 }]}>Type</Text>
              <Text style={[styles.cellHeader, { width: 150 }]}>Valid Until</Text>
            </View>

            {/* TABLE ROWS */}
            {results?.map((deal, index) => {
              // const isSelected = basket.find(i => i.id === deal.id);
              const selected = isInBasket(deal);
              return (
                <View key={`${deal.id}-${index}`} style={styles.row}>
                  {/* CHECKBOX */}
                  <TouchableOpacity
                    onPress={() => toggleSelect(deal)}
                    style={styles.checkboxContainer}
                  >
                    <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                      {selected && (
                        <Icons.Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                  </TouchableOpacity>

                  <Text style={[styles.cell, { width: 150 }]}>
                    {deal.store}
                  </Text>

                  <Text style={[styles.cell, { width: 120, fontWeight: "bold", color: "#E61F46" }]}>
                    SZL {deal.price.toFixed(2)}
                  </Text>

                  <Text style={[styles.cell, { width: 120 }]}>
                    {deal.name}
                  </Text>

                  <Text style={[styles.cell, { width: 120 }]}>
                    {deal.unit || deal.perKg ? `${deal.unit || deal.perKg + "/kg"}` : "-"}
                  </Text>

                  <Text style={[styles.cell, { width: 120 }]}>
                    {deal.type}
                  </Text>

                  <Text style={[styles.cell, { width: 150 }]}>
                    {deal.validUntil}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={results}
          numColumns={2}
          renderItem={({ item: deal }) => {
            const selected = isInBasket(deal);

            return (
              <TouchableOpacity
                style={[styles.gridCard, selected && styles.selectedCard]}
                onPress={() => addToBasket(deal, deal.store)}
              >
                <Image source={Images.product} style={styles.gridImage} resizeMode="cover" />
                <Text style={styles.gridName} numberOfLines={2}>{deal.name}</Text>
                <Text style={styles.gridStore}>{deal.store}</Text>
                <Text style={styles.gridPrice}>SZL {deal.price.toFixed(2)}</Text>
                {selected ? (
                  <Ionicons name="checkmark-circle" size={36} color="#4CAF50" style={styles.check} />
                ) : (
                  <Ionicons name="add-circle-outline" size={36} color="#E61F46" style={styles.check} />
                )}
              </TouchableOpacity>
            );
          }}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}

      {/* Floating Action Button */}
      {selectedCount > 0 && (
        <Animated.View style={[styles.fab, animatedFab]}>
          <TouchableOpacity
            style={styles.fabInner}
            onPress={() => navigation.navigate('BasketScreen')}
          >
            <Ionicons name="bag-check" size={28} color="#fff" />
            <Text style={styles.fabText}>
              SZL {totalPrice}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E61F46",
    marginTop: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10
  },

  toggle: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 4 },
  toggleBtn: { padding: 8, borderRadius: 16 },
  activeToggle: { backgroundColor: '#fff', borderRadius: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderRadius: 30,
    elevation: 6,
    marginTop: 20
  },
  input: { flex: 1, paddingVertical: 16, paddingHorizontal: 5, fontSize: 17 },
  toggleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },

  resultText: { fontSize: 16, fontWeight: '600', color: '#333' },
  toggle: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 20, padding: 4 },
  toggleBtn: { padding: 8 },
  active: { backgroundColor: '#E61F46', borderRadius: 16 },

  table: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    marginLeft: 16,
    marginRight: 16
  },

  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center"
  },

  cellHeader: {
    padding: 12,
    backgroundColor: "#E61F46",
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center"
  },

  cell: {
    padding: 12,
    fontSize: 14,
    textAlign: "center"
  },

  checkboxContainer: {
    width: 50,
    justifyContent: "center",
    alignItems: "center"
  },

  checkbox: {
    height: 22,
    width: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#E61F46",
    justifyContent: "center",
    alignItems: "center"
  },

  checkboxSelected: {
    backgroundColor: "#E61F46"
  },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 20, fontSize: 18, color: '#999' },

  // Table View
  table: { margin: 16, backgroundColor: '#fff', borderRadius: 16, elevation: 6, overflow: 'hidden' },
  tableRow: { flexDirection: 'row', padding: 14, alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' },
  selectedRow: { backgroundColor: '#FFF3E0' },
  tableImage: { width: 70, height: 70, borderRadius: 12, marginRight: 14 },
  tableInfo: { flex: 1 },
  tableName: { fontSize: 15, fontWeight: '600', color: '#333' },
  tableStore: { fontSize: 14, color: '#E61F46', marginTop: 4 },
  tablePrice: { fontSize: 18, fontWeight: 'bold', color: '#E61F46', marginTop: 6 },
  bestPrice: { color: '#4CAF50', fontSize: 19 },
  tableUnit: { fontSize: 13, color: '#666', marginTop: 2 },
  radioOuter: { width: 32, height: 32, borderRadius: 16, borderWidth: 3, borderColor: '#E61F46', justifyContent: 'center', alignItems: 'center' },
  radioFilled: { backgroundColor: '#E61F46' },
  radioInner: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff' },

  // Grid View
  gridCard: { flex: 1, margin: 8, backgroundColor: '#fff', borderRadius: 16, elevation: 5 },
  selectedCard: { borderWidth: 4, borderColor: '#4CAF50' },
  gridImage: { width: '100%', height: 100, borderRadius: 12, marginBottom: 8 },
  gridName: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  gridStore: { fontSize: 13, color: '#E61F46', textAlign: 'center', marginTop: 4 },
  gridPrice: { fontSize: 18, fontWeight: 'bold', color: '#E61F46', textAlign: 'center', marginTop: 6 },
  check: { position: 'absolute', top: 8, right: 8 },

  // FAB
  fab: { position: 'absolute', bottom: 70, right: 20 },
  fabInner: { backgroundColor: '#E61F46', padding: 18, borderRadius: 30, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 12 },
  fabText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 12 },
});