import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Modal, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { AppContext } from '../context/appContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const FinancialPromotion = (props) => {
  const [isSheetVisible, setSheetVisible] = useState(false);

  const toggleSheet = () => setSheetVisible(!isSheetVisible);

  return (
    <>
      <FinancialBanner {...props} onPress={toggleSheet} />
      <FinancialDetailsSheet
        {...props}
        visible={isSheetVisible}
        onClose={toggleSheet}
      />
    </>
  );
};

/**
 * Theme Logic
 */
const getTheme = (category) => {
  switch (category?.toLowerCase()) {
    case 'loans':
      return {
        primary: '#1A365D', // Deep Navy
        accent: '#C5A059',  // Muted Gold
        gradient: ['#1A365D', '#2A4365'],
        icon: 'bank-transfer'
      };
    case 'investments':
      return {
        primary: '#064E3B', // Deep Emerald
        accent: '#D4AF37',  // Classic Gold
        gradient: ['#064E3B', '#065F46'],
        icon: 'trending-up'
      };
    case 'savings':
      return {
        primary: '#1E3A8A', // Royal Blue
        accent: '#60A5FA',  // Soft Blue
        gradient: ['#1E3A8A', '#1E40AF'],
        icon: 'piggy-bank-outline'
      };
    case 'insurance':
      return {
        primary: '#451A03', // Deep Umber/Burgundy
        accent: '#F59E0B',  // Amber
        gradient: ['#451A03', '#78350F'],
        icon: 'shield-check-outline'
      };
    default:
      return {
        primary: '#1F2937', // Slate Gray
        accent: '#9CA3AF',
        gradient: ['#1F2937', '#374151'],
        icon: 'finance'
      };
  }
};

/**
 * 1. FinancialBanner (Height: 190)
 */
const FinancialBanner = ({
  companyName,
  productName,
  highlights = [],
  headline,
  category,
  companyLogo,
  onPress
}) => {
  const theme = getTheme(category);

  return (
    <TouchableOpacity
      style={styles.bannerContainer}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={theme.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.bannerContent}>
        {/* Header: Logo & Category */}
        <View style={styles.bannerHeader}>
          <View style={styles.brandContainer}>
            {companyLogo ? (
              <Image source={{ uri: companyLogo }} style={styles.logoSmall} resizeMode="contain" />
            ) : (
              <View style={[styles.logoPlaceholderSmall, { borderColor: theme.accent }]}>
                <MaterialCommunityIcons name={theme.icon} size={16} color={theme.accent} />
              </View>
            )}
            <Text style={styles.companyNameSmall}>{companyName?.toUpperCase()}</Text>
          </View>
          <View style={styles.categoryBadgeSmall}>
            <Text style={styles.categoryTextSmall}>{category?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Body: Highlights & Headline */}
        <View style={styles.bannerBody}>
          {highlights.length > 0 && (
            <View style={styles.highlightsRowSmall}>
              {highlights.slice(0, 2).map((text, idx) => (
                <View key={idx} style={[styles.highlightBadgeSmall, { borderColor: theme.accent }]}>
                  <Text style={[styles.highlightTextSmall, { color: theme.accent }]}>{text.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          )}
          <Text style={[styles.productNameSmall, { color: theme.accent }]}>{productName}</Text>
          <Text style={styles.headlineSmall} numberOfLines={2}>{headline}</Text>
        </View>

        {/* Tap Indicator */}
        <View style={styles.tapIndicator}>
          <Text style={styles.tapText}>Tap for details</Text>
          <MaterialCommunityIcons name="chevron-up" size={16} color="rgba(255,255,255,0.6)" />
        </View>
      </View>

      <View style={[styles.accentBorder, { backgroundColor: theme.accent }]} />
    </TouchableOpacity>
  );
};

/**
 * 2. FinancialDetailsSheet (Full Details)
 */
const FinancialDetailsSheet = ({
  visible,
  onClose,
  companyName,
  productName,
  highlights = [],
  headline,
  description,
  callToAction,
  validUntil,
  specialties = [],
  category,
  companyLogo,
  onAction
}) => {
  const nativeTheme = getTheme(category);
  const { theme, isDarkMode } = useContext(AppContext);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalDismissArea} onPress={onClose} />

        <View style={[styles.sheetContainer, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}>
          {/* Handle bar */}
          <View style={styles.sheetHandle} />

          <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <View style={styles.brandContainer}>
                {companyLogo ? (
                  <Image source={{ uri: companyLogo }} style={styles.logoLarge} resizeMode="contain" />
                ) : (
                  <View style={[styles.logoPlaceholderLarge, { borderColor: nativeTheme.accent }]}>
                    <MaterialCommunityIcons name={nativeTheme.icon} size={24} color={nativeTheme.accent} />
                  </View>
                )}
                <View style={styles.brandTextContainer}>
                  <Text style={styles.companyNameLarge}>{companyName?.toUpperCase()}</Text>
                  <Text style={[styles.productNameLarge, { color: nativeTheme.accent }]}>{productName}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Highlights */}
            {highlights.length > 0 && (
              <View style={styles.highlightsRowLarge}>
                {highlights.map((text, idx) => (
                  <View key={idx} style={[styles.highlightBadgeLarge, { backgroundColor: nativeTheme.primary }]}>
                    <Text style={[styles.highlightTextLarge, { color: nativeTheme.accent }]}>{text.toUpperCase()}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Main Content */}
            <Text style={[styles.headlineLarge, { color: theme.colors.text }]}>{headline}</Text>
            <Text style={[styles.descriptionLarge, { color: isDarkMode ? '#9CA3AF' : '#4B5563' }]}>{description}</Text>

            {/* Specialties */}
            {specialties.length > 0 && (
              <View style={styles.specialtiesContainerLarge}>
                <Text style={styles.sectionTitle}>KEY HIGHLIGHTS</Text>
                {specialties.map((item, index) => (
                  <View key={index} style={styles.specialtyItemLarge}>
                    <MaterialCommunityIcons name="check-circle" size={20} color={nativeTheme.primary} />
                    <Text style={styles.specialtyTextLarge}>{item}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Validity */}
            {validUntil && (
              <View style={styles.validityContainerLarge}>
                <MaterialCommunityIcons name="clock-outline" size={16} color="#6B7280" />
                <Text style={styles.validTextLarge}>Offer valid until: <Text style={[styles.validDateBold, { color: isDarkMode ? '#cccc' : '#374151', }]}>{format(validUntil, 'PPP')}</Text></Text>
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Footer CTA */}
          <View style={[styles.sheetFooter, { borderTopColor: isDarkMode ? '#374151' : '#F3F4F6' }]}>
            <TouchableOpacity
              style={[styles.ctaButtonLarge, { backgroundColor: nativeTheme.primary }]}
              onPress={() => {
                onAction?.();
                onClose();
              }}
            >
              <Text style={[styles.ctaTextLarge, { color: nativeTheme.accent }]}>{callToAction || 'Learn More'}</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color={nativeTheme.accent} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Banner Styles
  bannerContainer: {
    height: 190,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    position: 'relative',
    marginVertical: 8,
  },
  bannerContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoSmall: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  logoPlaceholderSmall: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyNameSmall: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  categoryBadgeSmall: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryTextSmall: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  bannerBody: {
    marginTop: 8,
  },
  highlightsRowSmall: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  highlightBadgeSmall: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 3,
    marginRight: 6,
  },
  highlightTextSmall: {
    fontSize: 8,
    fontWeight: '800',
  },
  productNameSmall: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  headlineSmall: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  tapIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  tapText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '600',
    marginRight: 4,
  },
  accentBorder: {
    position: 'absolute',
    left: 0,
    top: '30%',
    bottom: '30%',
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },

  // Sheet Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingBottom: 20,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sheetScroll: {
    paddingHorizontal: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 16,
    marginBottom: 20,
  },
  brandTextContainer: {
    marginLeft: 12,
  },
  logoLarge: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  logoPlaceholderLarge: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyNameLarge: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  productNameLarge: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  highlightsRowLarge: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  highlightBadgeLarge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  highlightTextLarge: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headlineLarge: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 36,
    marginBottom: 16,
  },
  descriptionLarge: {
    color: '#4B5563',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  specialtiesContainerLarge: {
    marginBottom: 24,
  },
  specialtyItemLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
  },
  specialtyTextLarge: {
    color: '#1F2937',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
  },
  validityContainerLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  validTextLarge: {
    color: '#6B7280',
    fontSize: 13,
    marginLeft: 6,
  },
  validDateBold: {
    fontWeight: '700',
  },
  sheetFooter: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  ctaButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ctaTextLarge: {
    fontSize: 17,
    fontWeight: '800',
    marginRight: 10,
  }
});

export default FinancialPromotion;