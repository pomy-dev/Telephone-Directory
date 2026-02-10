import React from 'react';
import { StyleSheet, Image, View } from 'react-native';
import { Banner, Text } from 'react-native-paper';
import { Icons } from '../constants/Icons';
import { AppContext } from '../context/appContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function FinancialBanner({ companyProfile, visible, category, productName, onDismiss, onLearnMore }) {
  const { theme: appTheme } = React.useContext(AppContext);

  const getGradient = () => {
    switch (category) {
      case 'loan':
        return ['#b8860b', '#6b21a8'];     // gold → purple
      case 'investment':
        return ['#1e40af', '#10b981'];     // deep blue → emerald green
      case 'insurance':
        return ['#475569', '#ca8a04'];     // slate gray → mustard yellow
      default:
        return ['#374151', '#6b7280'];
    }
  };

  const getIconName = () => {
    switch (category) {
      case 'loan': return 'cash-fast';
      case 'investment': return 'trending-up';
      case 'insurance': return 'shield-check';
      default: return 'bank';
    }
  };

  const getLuringMessage = () => {
    switch (category) {
      case 'loan':
        return `Get approved fast • Low monthly payments • Funds in your account in as little as 24 hours`;
      case 'investment':
        return `Start small or go big • Compound growth • Expert-managed options`;
      case 'insurance':
        return `Peace of mind for your family • Comprehensive coverage • Flexible plans`;
      default:
        return `Secure your future • Trusted solutions • Tailored for you`;
    }
  };

  const gradientColors = getGradient();
  const iconName = getIconName();
  const luringText = getLuringMessage();

  return (
    <Banner
      visible={visible}
      actions={[
        {
          label: 'Learn More',
          onPress: onLearnMore,
          textColor: '#D4AF37', // gold accent
          labelStyle: { fontWeight: 'bold' },
        },
      ]}
      icon={({ size }) =>
        companyProfile ? (
          <Image
            source={companyProfile}
            style={{ width: size, height: size, borderRadius: 10 }}
          />) : (
          <Icons.MaterialCommunityIcons
            name={iconName}
            size={size + 4}
            color="#fff"
          />
        )}
      style={[styles.banner]}
      contentStyle={[styles.content, { backgroundColor: appTheme.colors.primary }]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.contentWrapper}>
        <Text style={styles.categoryLabel}>
          {category?.toUpperCase()}
        </Text>

        <Text style={styles.productName}>
          {productName}
        </Text>

        <Text style={styles.benefits}>
          {luringText}
        </Text>
      </View>
    </Banner>
  );
}

const styles = StyleSheet.create({
  banner: {
    overflow: 'hidden',
    elevation: 4,
  },
  contentWrapper: {
    paddingHorizontal: 16,          // give space for action buttons
  },
  categoryLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.1,
    marginBottom: 2,
  },
  productName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  benefits: {
    color: 'rgba(255,255,255,0.90)',
    fontSize: 14,
    lineHeight: 20,
  },
});