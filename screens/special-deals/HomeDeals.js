// src/screens/HomeDealScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  withDelay,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Images } from '../../constants/Images';
import { Icons } from '../../constants/Icons';
import { mockDeals } from '../../utils/mockData';
import ComboCard from '../../components/deals/comboCard';
import SingleDealCard from '../../components/deals/singleDealCard';
import FloatingCompareBtn from '../../components/deals/floatingCompareBtn';

const { width, height } = Dimensions.get('window');

// Floating icons (you can replace with your own PNGs with transparent background)
const floatingUpIcons = [
  Images.deal,
  Images.specialoffer,
  Images.specialtimeout,
  Images.computer,
  Images.hotdeal,
];

const floatingDownIcons = [
  Images.tagdeals,
  Images.handshake,
  Images.offerbag,
  Images.travel,
];

const FloatingUpItem = ({ delay }) => {
  const translateY = useSharedValue(height + 100); // start below screen
  const rotate = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-height - 100, {
          duration: 20000 + Math.random() * 10000,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );

    rotate.value = withRepeat(
      withTiming(360, { duration: 12000 + Math.random() * 8000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      translateY.value,
      [-height - 100, height + 100],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity: interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]), // visible almost entire journey
      transform: [
        { translateY: translateY.value },
        { translateX: Math.sin(Date.now() / 1000 + delay) * 35 },
        { rotate: `${rotate.value}deg` },
        { scale: 0.8 + Math.random() * 0.4 },
      ],
    };
  });

  const icon = floatingUpIcons[Math.floor(Math.random() * floatingUpIcons.length)];
  const left = Math.random() > 0.5;

  return (
    <Animated.Image
      source={icon}
      style={[
        styles.floatingIconUp,
        animatedStyle,
        left ? styles.leftSide : styles.rightSide,
      ]}
      resizeMode="contain"
    />
  );
};

// FALLING FROM TOP
const FloatingDownItem = ({ delay }) => {
  const translateY = useSharedValue(-150);

  React.useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(height + 150, {
          duration: 18000 + Math.random() * 12000,
          easing: Easing.out(Easing.quad),
        }),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      translateY.value,
      [-150, height + 150],
      [0, 1]
    );

    return {
      opacity: interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]),
      transform: [
        { translateY: translateY.value },
        { translateX: Math.sin(Date.now() / 1200 + delay) * 45 },
        { rotate: `${Math.sin(Date.now() / 2000) * 15}deg` },
      ],
    };
  });

  const icon = floatingDownIcons[Math.floor(Math.random() * floatingDownIcons.length)];

  return (
    <Animated.Image
      source={icon}
      style={[styles.floatingIconDown, animatedStyle]}
      resizeMode="contain"
    />
  );
};

function getCurrentMonth(format = 'long') {
  const now = new Date();
  const monthIndex = now.getMonth(); // 0-11

  if (format === 'number') return monthIndex + 1;
  if (format === 'short') return now.toLocaleString(undefined, { month: 'short' });
  return now.toLocaleString(undefined, { month: 'long' });
}

export default function HomeDealScreen({ navigation }) {
  const combos = mockDeals.deals.filter(d => d.type === 'combo');
  const singles = mockDeals.deals.filter(d => d.type === 'single').slice(0, 8);

  return (
    <View style={styles.container}>
      {/* Animated Hero Section */}
      <View style={styles.heroContainer}>
        <ImageBackground
          source={Images.specialAlert} // optional subtle pattern
          style={styles.hero}
          resizeMode="cover"
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', top: 40, left: 15, zIndex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: 20, padding: 5 }}>
            <Icons.Ionicons name='arrow-back' size={24} color={'#FFF'} />
          </TouchableOpacity>

          {/* Rising from bottom */}
          {[...Array(5)].map((_, i) => (
            <FloatingUpItem key={`up-${i}`} delay={i * 2500} />
          ))}

          {/* Falling from top */}
          {[...Array(4)].map((_, i) => (
            <FloatingDownItem key={`down-${i}`} delay={i * 3000} />
          ))}

          <View style={styles.heroTextContainer}>
            <Text style={styles.heroText}>{getCurrentMonth('long')} Specials</Text>
            <Text style={styles.sub}>Find → Compare → Save Big!</Text>
          </View>
        </ImageBackground>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, gap: 10 }}>
        {/* Pressable Search Trigger */}
        <TouchableOpacity
          style={styles.searchTrigger}
          onPress={() => navigation.navigate('SearchDeal')}
        >
          <Icons.Ionicons name="search" size={24} color="#666" />
          <Text style={styles.searchText}>Search...</Text>
          <Icons.Feather name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        {/* Add deal */}
        <TouchableOpacity
          style={styles.publishDeal}
          onPress={() => navigation.navigate('ScanDealScreen')}
        >
          <Icons.Entypo name="megaphone" size={24} color="#666" />
          <Text style={styles.searchText}>Post</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Combo Deals - Horizontal Scroll */}
        <Text style={styles.section}>Combo Deals</Text>
        <FlatList
          data={combos}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => <ComboCard deal={item} />}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={{ paddingHorizontal: 8 }}
        />

        {/* Single Items - 2 Column Grid */}
        <Text style={styles.section}>Items</Text>
        <View style={{ paddingBottom: 120, justifyContent: 'space-between', flexDirection: 'row', flexWrap: 'wrap' }}>
          {singles?.map((item, index) =>
            <SingleDealCard deal={item} key={index} />
          )}
        </View>
      </ScrollView>

      {/* Floating Compare Button */}
      <FloatingCompareBtn />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  heroContainer: {
    height: 200,
    overflow: 'hidden',
  },
  hero: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E61F46',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTextContainer: {
    position: 'absolute',
    top: 80,
    alignItems: 'center',
    zIndex: 10,
  },
  heroText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  sub: {
    color: '#fff',
    fontSize: 18,
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  floatingIconUp: {
    position: 'absolute',
    width: 60,
    height: 60,
    bottom: -80,
    opacity: 0.8,
  },
  floatingIconDown: {
    position: 'absolute',
    width: 50,
    height: 50,
    top: -100,
    opacity: 0.9,
  },
  searchTrigger: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginLeft: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 4,
  },
  publishDeal: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginRight: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 4,
  },
  searchText: { flex: 1, marginLeft: 12, fontSize: 16, color: '#666' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    elevation: 6,
  },
  input: { flex: 1, padding: 16, fontSize: 16 },
  section: { fontSize: 22, fontWeight: 'bold', marginLeft: 16, marginTop: 20, marginBottom: 8, color: '#333' },
});