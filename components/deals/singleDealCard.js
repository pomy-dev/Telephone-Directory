import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useBasket } from '../../context/basketContext';
import { Images } from '../../constants/Images';
import { Icons } from '../../constants/Icons';

const SingleDealCard = ({ deal }) => {
  const { addToBasket, basket, picked, pickItem } = useBasket();
  const isSelected = picked.some(i => i.id === deal.id);

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.selected]}
      onPress={() => {
        requestAnimationFrame(() => pickItem({ ...deal }, deal.store));
      }}
    >
      <Image
        source={Images.product}
        style={styles.image}
        defaultSource={Images.item}
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{deal.name}</Text>
        <Text style={styles.store}>{deal.store}</Text>
        <Text style={styles.price}>SZL {deal.price.toFixed(2)}</Text>
      </View>
      {isSelected && <View style={styles.check}><Icons.Feather name='check-circle' color={'#fff'} size={30} /></View>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { width: '46%', backgroundColor: '#fff', borderRadius: 16, margin: '2%', elevation: 4, overflow: 'hidden' },
  selected: { borderColor: '#4CAF50', borderWidth: 3 },
  image: { width: '100%', height: 100 },
  content: { padding: 12 },
  name: { fontSize: 14, fontWeight: '600', color: '#333' },
  store: { fontSize: 12, color: '#E61F46', marginTop: 4 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#E61F46', marginTop: 8 },
  check: { position: 'absolute', top: 8, right: 8, backgroundColor: '#4CAF50', borderRadius: 20, padding: 4 },
  checkText: { color: '#fff', fontSize: 16 },
});

export default React.memo(SingleDealCard)