import React, { useState, useMemo, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  FlatList,
  StatusBar,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { searchAllFlyerItems } from '../../service/Supabase-Fuctions';
import { useBasket } from '../../context/basketContext';
import { AppContext } from '../../context/appContext';
import { Icons } from '../../constants/Icons';
import { Images } from '../../constants/Images';

export default function ItemCompareScreen({ navigation }) {
  const { theme, isDarkMode } = React.useContext(AppContext)
  const { basket, addToBasket, picked } = useBasket();
  const [viewMode, setViewMode] = useState('table');
  const [selectedDealMap, setSelectedDealMap] = useState({});
  const [items, setItems] = useState([]);

  useEffect(() => {
    const findAllItems = async () => {
      const allItems = await searchAllFlyerItems();
      setItems(allItems);
    };

    findAllItems();
  }, [])

  const getItemKey = (item) => {
    const arr = Array.isArray(item) ? item : [item];
    return arr.map(s => s.trim().toLowerCase()).sort().join(' ||| ');
  };

  const normalizeItem = (item) => {
    if (Array.isArray(item)) return item;
    if (typeof item === 'string') return [item];
    return [];
  };

  // Safe string conversion – never crashes
  const safeStr = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'object') {
      // common patterns from your DB
      if (value.value !== undefined) return String(value.value);
      if (value.amount !== undefined) return String(value.amount);
      return ''; // fallback
    }
    return String(value);
  };

  // Group deals by item name
  const groupedItems = useMemo(() => {
    if (!items?.items || !Array.isArray(picked) || picked.length === 0) return [];

    const allDeals = items.items;
    const result = [];
    const seenKeys = new Set();

    // Helper: normalize and split items
    const parseItemArray = (itemField) => {
      if (!itemField) return [];
      if (Array.isArray(itemField)) {
        if (itemField.length === 1 && typeof itemField[0] === 'string' && itemField[0].includes(',')) {
          return itemField[0].split(',').map(s => s.trim()).filter(Boolean);
        }
        return itemField.map(s => s.trim()).filter(Boolean);
      }
      if (typeof itemField === 'string' && itemField.includes(',')) {
        return itemField.split(',').map(s => s.trim()).filter(Boolean);
      }
      return [String(itemField).trim()].filter(Boolean);
    };

    picked.forEach((pickedDeal) => {
      const pickedItems = parseItemArray(pickedDeal.item);
      const isCombo = pickedItems.length > 1 || pickedDeal.type === 'combo';

      const sortedLowerItems = pickedItems
        .map(s => s.toLowerCase())
        .sort()
        .join(' ||| ');

      if (seenKeys.has(sortedLowerItems)) return;
      seenKeys.add(sortedLowerItems);

      // STRICT COMBO MATCHING
      const matches = allDeals
        .filter((deal) => {
          // Always include the originally picked deal
          if (deal.id === pickedDeal.id) return true;

          const dealItems = parseItemArray(deal.item);
          const dealLower = dealItems.map(s => s.toLowerCase());

          if (isCombo) {
            const hasAll = pickedItems.every(term =>
              dealLower.some(name => name.includes(term.toLowerCase()))
            );

            const extraItemsAllowed = 1;
            const hasTooManyExtras = dealItems.length > pickedItems.length + extraItemsAllowed;

            if (hasTooManyExtras) return false;
            return hasAll && dealItems.length > 1; // must be a combo
          } else {
            return dealLower.some(name =>
              name.includes(pickedItems[0].toLowerCase())
            );
          }
        })
        // DEDUPLICATION: Remove duplicates by store + items + price
        .reduce((unique, deal) => {
          const dealItems = parseItemArray(deal.item);
          const normalizedItems = dealItems.join(' || ').toLowerCase();
          const price = String(deal.price || '').replace(/[$,]/g, '').trim();
          const type = (deal.type || '').toLowerCase();
          const unit = (deal.unit || '').toLowerCase();

          const key = `${deal.store}|${normalizedItems}|${price}|${type}|${unit}`;

          // If this exact combo hasn't been seen, keep it
          if (!unique.seen.has(key)) {
            unique.seen.add(key);
            unique.list.push(deal);
          }

          return unique;
        }, { list: [], seen: new Set() })
        .list;

      matches.sort((a, b) => {
        const pa = parseFloat(String(a.price).replace(/[$,]/g, '')) || 999999;
        const pb = parseFloat(String(b.price).replace(/[$,]/g, '')) || 999999;
        return pa - pb;
      });

      result.push({
        itemKey: sortedLowerItems,
        itemName: pickedDeal.item,
        displayName: pickedItems.join(' + '),
        isCombo,
        pickedDealId: pickedDeal.id,
        deals: matches,
        cheapestDeal: matches[0] || null,
      });
    });

    return result;
  }, [items?.items, picked]);

  useEffect(() => {
    if (!items?.items || !Array.isArray(picked)) return;

    const newSelections = {};

    picked.forEach(pickedItem => {
      const pickedItemName = pickedItem?.item;
      const key = getItemKey(pickedItemName);

      if (!key || selectedDealMap[key]) return;

      const searchTerms = Array.isArray(pickedItemName)
        ? pickedItemName.map(s => s.toLowerCase())
        : [pickedItemName.toLowerCase()];

      const matches = items.items
        .filter(deal => {
          const dealNames = Array.isArray(deal.item)
            ? deal.item.map(i => i.toLowerCase())
            : deal.item ? [deal.item.toLowerCase()] : [];

          return searchTerms.some(term =>
            dealNames.some(name => name.includes(term))
          );
        })
        .sort((a, b) => {
          const priceA = parseFloat(a.price.replace(/[$,]/g, '')) || Infinity;
          const priceB = parseFloat(b.price.replace(/[$,]/g, '')) || Infinity;
          return priceA - priceB;
        });

      if (matches[0]) {
        newSelections[key] = matches[0].id;
      }
    });

    if (Object.keys(newSelections).length > 0) {
      setSelectedDealMap(prev => ({ ...prev, ...newSelections }));
    }
  }, [items?.items, picked, selectedDealMap]);

  const goToBasket = () => {
    navigation.navigate("BasketScreen");
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle="dark-content" />
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icons.Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          {/* View Toggle */}
          <View style={styles.toggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'table' && styles.activeToggle]}
              onPress={() => setViewMode('table')}
            >
              <Icons.Ionicons name="grid" size={20} color={viewMode === 'table' ? '#000000' : '#999'} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'grid' && styles.activeToggle]}
              onPress={() => setViewMode('grid')}
            >
              <Icons.FontAwesome6 name="table" size={20} color={viewMode === 'grid' ? '#000000' : '#999'} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => { }} style={{ borderRadius: 20, paddingHorizontal: 10, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <Text style={styles.title}>Set Budget</Text>
          </TouchableOpacity>
        </View>


        {viewMode === 'table' ? (
          <ScrollView>
            {groupedItems.map((group, index) => (
              <View key={index} style={{ marginBottom: 25 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image source={Images.tagdeals} style={{ height: 50, width: 50, objectFit: 'cover', borderRadius: 10 }} />
                  <Text style={{ fontSize: 14, color: '#666' }}>
                    {normalizeItem(group.itemName).join(' + ')}
                  </Text>
                </View>

                {/* TABLE */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.table}>
                    {/* TABLE HEADER */}
                    <View style={styles.row}>
                      <Text style={[styles.cellHeader, { width: 50 }]}>✔️</Text>
                      <Text style={[styles.cellHeader, { width: 150 }]}>Store</Text>
                      <Text style={[styles.cellHeader, { width: 120 }]}>Price</Text>
                      <Text style={[styles.cellHeader, { width: 120 }]}>Unit</Text>
                      <Text style={[styles.cellHeader, { width: 150 }]}>Type</Text>
                    </View>

                    {group.deals.length > 0 ? (
                      group.deals.map((deal) => {
                        const isSelected = basket.some(i => i.id === deal.id);

                        return (
                          <View key={deal.id} style={styles.row}>
                            <TouchableOpacity
                              onPress={() => addToBasket(deal, deal.store)}
                              style={styles.checkboxContainer}
                            >
                              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                {isSelected && <Icons.Ionicons name="checkmark" size={16} color="#fff" />}
                              </View>
                            </TouchableOpacity>

                            <View style={[styles.cell, { width: 150 }]}>
                              <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>{deal.store}</Text>
                            </View>

                            <Text style={[styles.cell, { width: 120, fontWeight: "bold", color: "#E61F46" }]}>
                              SZL {parseFloat(String(deal.price).replace(/[$,]/g, '') || 0).toFixed(2)}
                            </Text>

                            <Text style={[styles.cell, { width: 120 }]}>
                              {group.isCombo ? 'Combo' : (deal.unit || 'each')}
                            </Text>

                            <Text style={[styles.cell, { width: 150, fontSize: 11, color: '#555' }]}>
                              {group.isCombo
                                ? `${group.deals[0].item.length} items`
                                : (deal.type || 'each')}
                            </Text>
                          </View>
                        );
                      })
                    ) : (
                      <View style={[styles.row, { justifyContent: 'center' }]}>
                        <Text style={{ padding: 20, color: '#999' }}>No deals found</Text>
                      </View>
                    )}
                  </View>
                </ScrollView>
              </View>
            ))}
          </ScrollView>
        ) :
          <ScrollView style={{ flex: 1 }}>
            {groupedItems.map((group, index) => (
              <View key={index} style={{ marginBottom: 32, paddingHorizontal: 16 }}>
                {/* Group Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Image
                    source={Images.tagdeals}
                    style={{ height: 50, width: 50, borderRadius: 10 }}
                  />
                  <Text style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
                    {group.displayName}
                  </Text>
                </View>

                {/* Horizontal Scrollable Deals */}
                <ScrollView horizontal contentContainerStyle={{ alignItems: 'center', gap: 3, paddingHorizontal: 12 }}
                  showsHorizontalScrollIndicator={false}
                >
                  {group.deals.length > 0 ? (
                    group.deals.map((deal) => {
                      const isSelected = selectedDealMap[group.itemKey] === deal.id;
                      const isInBasket = basket.some(i => i.id === deal.id);

                      return (
                        <TouchableOpacity
                          key={deal.id}
                          style={[
                            styles.gridCard,
                            (isSelected || isInBasket) && styles.selectedCard
                          ]}
                          onPress={() => {
                            // In grid mode: toggle selection via context
                            if (isInBasket) {
                              // Optional: remove from basket if already added
                              // Or just select the cheapest — your choice
                              addToBasket(deal, deal.store);
                            } else {
                              addToBasket(deal, deal.store);
                            }
                            // Also update selectedDealMap for visual feedback
                            setSelectedDealMap(prev => ({
                              ...prev,
                              [group.itemKey]: deal.id
                            }));
                          }}
                        >
                          <Text style={styles.cardStore}>{deal.store}</Text>
                          <Text style={styles.cardPrice}>
                            SZL {parseFloat(deal.price?.replace(/[$,]/g, '') || 0).toFixed(2)}
                          </Text>
                          <Text style={styles.cardUnit}>
                            {safeStr(deal.unit) || 'each'}
                          </Text>
                          {(isSelected || isInBasket) && (
                            <View style={styles.cardCheck}>
                              <Icons.Ionicons name="checkmark" size={20} color="#fff" />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                      <Text style={{ color: '#999' }}>No deals found</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            ))}
          </ScrollView>
        }
        <View style={{ height: 40 }} />
      </View>

      {/* FLOATING SHOPPING BAG BUTTON */}
      {basket.length > 0 && (
        <TouchableOpacity style={styles.floatingBtn} onPress={goToBasket}>
          <Icons.Ionicons name="bag-handle" size={26} color="#fff" />
          <Text style={styles.floatingText}>{basket.length}</Text>
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

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
  activeToggle: { backgroundColor: '#fff' },

  title: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  itemTitle: {
    fontSize: 16,
    fontWeight: "400",
    marginLeft: 16,
    marginBottom: 8,
    color: "#333"
  },

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

  gridCard: {
    backgroundColor: '#fff',
    width: 160,
    minHeight: 140,
    marginLeft: 12,
    padding: 16,
    borderRadius: 16,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  selectedCard: {
    borderColor: '#E61F46',
    borderWidth: 3,
    elevation: 8,
  },

  cardStore: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },

  cardPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E61F46',
    marginVertical: 8,
  },

  cardUnit: {
    fontSize: 13,
    color: '#666',
  },

  cardCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#E61F46',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // card: { flex: 1, backgroundColor: '#fff', margin: 8, padding: 16, borderRadius: 16, elevation: 4, alignItems: 'center' },
  // selectedCard: { borderColor: '#4CAF50', borderWidth: 3 },
  // cardStore: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  // cardPrice: { fontSize: 20, fontWeight: 'bold', color: '#E61F46', marginVertical: 8 },
  // cardUnit: { color: '#666', fontSize: 12 },
  // cardRadio: { position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' },
  // cardRadioInner: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff' },

  floatingBtn: {
    position: "absolute",
    bottom: 60,
    right: 20,
    backgroundColor: "#E61F46",
    padding: 16,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    elevation: 5
  },

  floatingText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16
  }
});
