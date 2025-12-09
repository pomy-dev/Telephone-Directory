import React from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useBasket } from '../../context/basketContext';
import { Icons } from '../../constants/Icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getRandomImages } from '../../utils/randomDealImages';

const { width } = Dimensions.get('window');

export default function ComboCard({ deal }) {
  const { picked, pickItem } = useBasket();
  const isSelected = picked.some(i => i.id === deal.id);

  // This will give each ComboCard a different background
  const backgroundImage = getRandomImages();

  return (
    <TouchableOpacity onPress={() => {
      requestAnimationFrame(() => pickItem({ ...deal }, deal.store));
    }}>
      <ImageBackground
        source={backgroundImage}
        style={styles.card}
        imageStyle={styles.bgImage}
      >
        {/* Diagonal Gradient Overlay */}
        <LinearGradient
          colors={[
            'rgba(220, 20, 60, 0.48)',    // Crimson – very subtle
            'rgba(138, 43, 226, 0.42)',   // Purple
            'rgba(30, 144, 255, 0.45)',   // Dodger Blue
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {deal?.description || 'Amazing Combo Deal'}
          </Text>
          <Text style={styles.items}>{deal?.item?.join(' + ')}</Text>

          <View style={styles.bottomRow}>
            <Text style={styles.price} numberOfLines={1}>SZL {deal?.price?.replace(/[^0-9.,]/g, '') || 'NaN'}</Text>

            <Icons.Feather
              name={isSelected ? 'check-circle' : 'plus-circle'}
              size={36}
              color={isSelected ? '#FFD700' : '#FFFFFF'}
            />
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 180,
    width: width * 0.9,
    marginHorizontal: 8,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 12,
  },
  bgImage: { opacity: 0.9 },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  title: {
    color: '#FFF',
    fontSize: 23,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  items: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 6,
    opacity: 0.95,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  price: {
    flex: 2,
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
});