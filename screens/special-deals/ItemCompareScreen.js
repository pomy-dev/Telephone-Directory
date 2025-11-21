import React, { useState, useMemo } from 'react';
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
import { useBasket } from '../../context/basketContext';
import { mockDeals } from '../../utils/mockData';
import { Icons } from '../../constants/Icons';
import { Images } from '../../constants/Images';

export default function ItemCompareScreen({ navigation, route }) {
  const { basket, addToBasket, picked } = useBasket();
  const [viewMode, setViewMode] = useState('table');
  const [selectedDealMap, setSelectedDealMap] = useState({});

  // Group deals by item name
  const groupedItems = useMemo(() => {
    return picked.map(item => {
      const matches = mockDeals.deals
        .filter(d =>
          d.name.toLowerCase().includes(item.name.toLowerCase()) ||
          d.items?.some(i => i.toLowerCase().includes(item.name.toLowerCase()))
        )
        .sort((a, b) => a.price - b.price);

      const cheapest = matches[0];
      const itemKey = item.name;

      if (cheapest && !selectedDealMap[itemKey]) {
        setSelectedDealMap(prev => ({ ...prev, [itemKey]: cheapest.id }));
      }

      return {
        itemName: item.name,
        deals: matches
      };
    });
  }, [picked]);

  const toggleSelect = (deal) => {
    addToBasket(deal, deal.store)
  };

  const goToBasket = () => {
    navigation.navigate("BasketScreen");
  };

  return (
    <>
      <View style={styles.container}>
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
                  <Image source={Images.item} style={{ height: 50, width: 50, objectFit: 'cover', borderRadius: 10 }} />
                  <Text style={styles.itemTitle}>{group.itemName}</Text>
                </View>

                {/* TABLE */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.table}>
                    {/* TABLE HEADER */}
                    <View style={styles.row}>
                      <Text style={[styles.cellHeader, { width: 50 }]}></Text>
                      <Text style={[styles.cellHeader, { width: 150 }]}>Store</Text>
                      <Text style={[styles.cellHeader, { width: 120 }]}>Price</Text>
                      <Text style={[styles.cellHeader, { width: 120 }]}>Unit</Text>
                      <Text style={[styles.cellHeader, { width: 150 }]}>Valid Until</Text>
                    </View>

                    {/* TABLE ROWS */}
                    {group.deals.map((deal) => {
                      const isSelected = basket.find(i => i.id === deal.id);
                      return (
                        <View key={deal.id} style={styles.row}>
                          {/* CHECKBOX */}
                          <TouchableOpacity
                            onPress={() => toggleSelect(deal)}
                            style={styles.checkboxContainer}
                          >
                            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                              {isSelected && (
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
                            {deal.unit || deal.perKg ? `${deal.unit || deal.perKg + "/kg"}` : "-"}
                          </Text>

                          <Text style={[styles.cell, { width: 150 }]}>
                            {deal.validUntil}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            ))}
          </ScrollView>
        ) : (
          groupedItems.map((group, index) => (
            <View key={index} style={{ marginBottom: 25 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={Images.item} style={{ height: 50, width: 50, objectFit: 'cover', borderRadius: 10 }} />
                <Text style={styles.itemTitle}>{group.itemName}</Text>
              </View>
              <FlatList
                data={group.deals}
                numColumns={2}
                renderItem={({ item: deal }) => {
                  const isSelected = selectedDealMap[group.itemName] === deal.id;
                  return (
                    <TouchableOpacity
                      style={[styles.card, isSelected && styles.selectedCard]}
                      onPress={() => addToBasket(group.itemName, deal.id)}
                    >
                      <Text style={styles.cardStore}>{deal.store}</Text>
                      <Text style={styles.cardPrice}>SZL {deal.price.toFixed(2)}</Text>
                      <Text style={styles.cardUnit}>
                        {deal.perKg ? `${deal.perKg}/kg` : deal.unit || ''}
                      </Text>
                      {isSelected && (
                        <View style={styles.cardRadio}>
                          <View style={styles.cardRadioInner} />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                }}
                keyExtractor={item => item.id}
              />
            </View>))
        )}
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
  container: { flex: 1, backgroundColor: "#f8f8f8" },

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
    fontSize: 20,
    fontWeight: "bold",
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

  card: { flex: 1, backgroundColor: '#fff', margin: 8, padding: 16, borderRadius: 16, elevation: 4, alignItems: 'center' },
  selectedCard: { borderColor: '#4CAF50', borderWidth: 3 },
  cardStore: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardPrice: { fontSize: 20, fontWeight: 'bold', color: '#E61F46', marginVertical: 8 },
  cardUnit: { color: '#666', fontSize: 12 },
  cardRadio: { position: 'absolute', top: 12, right: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center' },
  cardRadioInner: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff' },

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
