import React from 'react';
import {
  View, Text, ImageBackground, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useBasket } from '../../context/basketContext';
import { Icons } from '../../constants/Icons';
import { Images } from '../../constants/Images';
import Animated, { ZoomIn } from 'react-native-reanimated';

const SingleDealCard = ({ deal }) => {
  const { picked, pickItem } = useBasket();
  const isSelected = picked.some(i => i.id === deal.id);

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      style={styles.cardContainer}
      onPress={() => {
        requestAnimationFrame(() => pickItem({ ...deal }, deal.store));
      }}
    >
      <ImageBackground
        source={Images.single}
        style={styles.imageBackground}
        imageStyle={styles.imageStyle}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        {/* Content on top of image */}
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={2}>
            {deal?.item}
          </Text>

          <Text style={styles.store}>{deal?.store}</Text>

          <Text style={styles.price}>SZL {deal?.price}</Text>
        </View>

        {/* Selected Checkmark with animation */}
        {isSelected && (
          <Animated.View
            entering={ZoomIn.duration(300)}
            style={styles.selectedBadge}
          >
            <Icons.Feather name="check" size={28} color="#fff" />
          </Animated.View>
        )}

        {/* Optional: Glow border when selected */}
        {isSelected && <View style={styles.glowBorder} />}
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '46%',
    margin: '2%',
    height: 150,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    position: 'relative',
  },

  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },

  imageStyle: {
    borderRadius: 20,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(108, 107, 107, 0.75)',
    borderRadius: 20,
  },

  content: {
    padding: 10,
  },

  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  store: {
    fontSize: 12,
    color: '#FFD700',
    marginTop: 4,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  price: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    marginTop: 8,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },

  selectedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },

  glowBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#4CAF50',
    opacity: 0.6,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 15,
  },
});

export default React.memo(SingleDealCard);