import React from 'react';
import {
  View, Text, ImageBackground, TouchableOpacity, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useBasket } from '../../context/basketContext';
import { Icons } from '../../constants/Icons';
import { getRandomImages } from '../../utils/randomDealImages';
import Animated, { ZoomIn } from 'react-native-reanimated';

const SingleDealCard = ({ deal }) => {
  const { picked, pickItem } = useBasket();
  const isSelected = picked.some(i => i.id === deal.id);

  const backgroundImage = getRandomImages();

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      style={styles.cardContainer}
      onPress={() => {
        requestAnimationFrame(() => pickItem({ ...deal }, deal.store));
      }}
    >
      <ImageBackground
        source={backgroundImage}
        style={styles.imageBackground}
        imageStyle={styles.imageStyle}
        resizeMode="cover"
      >
        {/* Same Diagonal Gradient */}
        <LinearGradient
          colors={[
            'rgba(220, 20, 60, 0.5)',
            'rgba(138, 43, 226, 0.5)',
            'rgba(30, 144, 255, 0.5)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={2}>
            {deal?.item}
          </Text>
          <Text style={styles.store}>{deal?.store}</Text>
          <Text style={styles.price}>SZL {deal?.price}</Text>
        </View>

        {/* Selected Badge */}
        {isSelected && (
          <Animated.View entering={ZoomIn.duration(350)} style={styles.selectedBadge}>
            <Icons.Feather name="check" size={28} color="#fff" />
          </Animated.View>
        )}

        {isSelected && <View style={styles.glowBorder} />}
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '46%',
    margin: '2%',
    height: 160,
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 10,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  imageStyle: { borderRadius: 22 },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  store: {
    fontSize: 12.5,
    color: '#FFD700',
    marginTop: 4,
    fontWeight: '700',
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginTop: 6,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
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
    elevation: 12,
  },
  glowBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOpacity: 0.9,
    shadowRadius: 16,
    elevation: 20,
  },
});

export default React.memo(SingleDealCard);