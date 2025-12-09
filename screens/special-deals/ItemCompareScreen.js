import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  StatusBar,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import BottomSheet, { useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';
import { searchAllFlyerItems } from '../../service/Supabase-Fuctions';
import { LoaderKitView } from 'react-native-loader-kit';
import { useBasket } from '../../context/basketContext';
import { AppContext } from '../../context/appContext';
import { Icons } from '../../constants/Icons';
import { Images } from '../../constants/Images';

export default function ItemCompareScreen({ navigation }) {
  const { theme, isDarkMode } = React.useContext(AppContext)
  const { basket, addToBasket, picked, budget, setBudget, spent = 0 } = useBasket();
  const [viewMode, setViewMode] = useState('table');
  const [selectedDealMap, setSelectedDealMap] = useState({});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [tempBudget, setTempBudget] = useState('');

  // Bottom Sheet
  const bottomSheetRef = React.useRef(null);
  const snapPoints = useMemo(() => ['25%', '50%', '70%'], []);
  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 80,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
    stiffness: 500,
  });

  const remaining = budget ? (budget - spent).toFixed(2) : null;

  const openBudgetSheet = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(1);
  }, []);

  const confirmBudget = () => {
    const value = parseFloat(tempBudget);
    if (!isNaN(value) && value > 0) {
      setBudget(value);
      setTempBudget(''); // clear input
    }
    closeBudgetSheet();
  };

  const closeBudgetSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  useEffect(() => {
    const findAllItems = async () => {
      try {
        setLoading(true);
        const allItems = await searchAllFlyerItems();
        setItems(allItems);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
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
          const priceA = parseFloat(a.price.replace((/[$,]/g || /[R,]/g || /[E,]/g), '')) || Infinity;
          const priceB = parseFloat(b.price.replace((/[$,]/g || /[R,]/g || /[E,]/g), '')) || Infinity;
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

  const renderBottomSheet = () => (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      animationConfigs={animationConfigs}
      animateOnMount={true}
      enableHandlePanningGesture={true}
      enableDynamicSizing={false}
      containerStyle={{ borderColor: theme.colors.border }}
      backgroundStyle={{ backgroundColor: theme.colors.card }}
    >
      <View style={{ flex: 1, padding: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 }}>
          Set Shopping Budget
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
          <Text style={{ fontSize: 28, marginRight: 10 }}>SZL</Text>
          <TextInput
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              borderBottomWidth: 3,
              borderColor: '#E61F46',
              width: 200,
              textAlign: 'center',
            }}
            keyboardType="numeric"
            placeholder="0.00"
            value={tempBudget}
            onChangeText={setTempBudget}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 16 }}>
          <TouchableOpacity
            onPress={closeBudgetSheet}
            style={{
              flex: 1,
              padding: 16,
              backgroundColor: '#eee',
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontWeight: 'bold', color: '#333' }}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={confirmBudget}
            style={{
              flex: 1,
              padding: 16,
              backgroundColor: '#E61F46',
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );

  return (
    <>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

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

          <TouchableOpacity onPress={() => { budget === null && openBudgetSheet() }} style={{ borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: 'rgba(255,255,255,0.2)' }}>
            {budget !== null ? (
              <View style={{ alignItems: 'flex-start' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: 140 }}>
                  <Text style={{ color: '#fff', fontSize: 14, opacity: 0.9 }}>
                    💵: SZL {budget.toFixed(2)}
                  </Text>
                  <TouchableOpacity onPress={() => setBudget(null)} style={{ paddingHorizontal: 2, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.3)' }}>
                    <Icons.FontAwesome name="remove" size={20} />
                  </TouchableOpacity>
                </View>
                <Text style={{ color: remaining >= 0 ? '#5c50fbff' : '#ff6b6b', fontWeight: 'bold' }}>
                  Remaining: SZL {remaining}
                </Text>
              </View>
            ) : (<Text style={styles.title}>Set Budget</Text>)}
          </TouchableOpacity>
        </View>

        {loading ?
          (
            <LoaderKitView
              style={{ width: 70, height: 70, alignSelf: 'center', marginTop: '50%' }}
              name="BallGridPulse"
              color={theme.colors.indicator}
              animationSpeedMultiplier={1.0}
            />
          ) :
          (viewMode === 'table'
            ? (<ScrollView>
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
                                SZL {parseFloat(String(deal.price)?.replace(/[^0-9.,]/g, '') || '0.00').toFixed(2) || 'NaN'}
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
            </ScrollView>)
            :
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
                              if (isInBasket) {
                                addToBasket(deal, deal.store);
                              } else {
                                addToBasket(deal, deal.store);
                              }
                              setSelectedDealMap(prev => ({
                                ...prev,
                                [group.itemKey]: deal.id
                              }));
                            }}
                          >
                            <Text style={styles.cardStore}>{deal.store}</Text>
                            <Text style={styles.cardPrice}>
                              SZL {parseFloat(deal.price?.replace(/[^0-9.,]/g, '') || '0.00')?.toFixed(2) || 'NaN'}
                            </Text>
                            <Text style={styles.cardUnit}>
                              {deal.unit || 'each'}
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
            </ScrollView>)
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

      {/* ====================== BUDGET BOTTOM SHEET ====================== */}
      {renderBottomSheet()}
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
