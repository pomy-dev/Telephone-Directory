import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { useBasket } from '../../context/basketContext';
import { Icons } from '../../constants/Icons';
import { useNavigation } from '@react-navigation/native';

export default function FloatingCompareBtn() {
  const navigation = useNavigation();
  const { basket, picked } = useBasket();
  const count = picked.length;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withRepeat(withTiming(1.15, { duration: 800 }), -1, true) },
    ],
  }));

  if (count === 0) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate('ItemComparison', { selectedItems: picked })}
      >
        <Icons.Ionicons name="git-compare" size={28} color="#fff" />
        <Text style={styles.text}>Compare</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 60, right: 20, zIndex: 100 },
  btn: { backgroundColor: '#E61F46', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 30, elevation: 10 },
  text: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
  badge: { backgroundColor: '#FFD700', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  badgeText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
});