import React from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useBasket } from '../../context/basketContext';
import { Icons } from '../../constants/Icons';
import { Images } from '../../constants/Images';

const { width } = Dimensions.get('window');

export default function ComboCard({ deal }) {
  const { picked, basket, addToBasket, pickItem } = useBasket();
  const isSelected = picked.some(i => i.id === deal.id);

  return (
    <TouchableOpacity onPress={() => {
      requestAnimationFrame(() => pickItem({ ...deal }, deal.store));
    }}>
      <ImageBackground
        source={Images.product} // replace with real combo photos
        style={styles.card}
        imageStyle={styles.bgImage}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>{deal.name}</Text>
          <Text style={styles.items}>{deal.items.join(' + ')}</Text>
          <View style={styles.bottom}>
            <View>
              <Text style={styles.price}>SZL {deal.price.toFixed(2)}</Text>
              {deal.savings && <Text style={styles.savings}>Save SZL {deal.savings}</Text>}
            </View>
            <Icons.Feather
              name={isSelected ? "check-circle" : "plus-circle"}
              size={30}
              color={isSelected ? "#4CAF50" : "#fff"}
            />
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 170,
    width: width * 0.9,
    marginHorizontal: 4,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8
  },
  bgImage: { opacity: 0.9 },
  overlay: { flex: 1, backgroundColor: 'rgba(230,31,70,0.75)', padding: 20, justifyContent: 'space-between' },
  title: { color: '#fff', fontSize: 22, fontWeight: '900' },
  items: { color: '#fff', fontSize: 15, marginTop: 8, fontWeight: '600' },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  price: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  savings: { color: '#FFD700', fontSize: 16, fontWeight: 'bold' },
});