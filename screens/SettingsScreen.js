import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Platform, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icons } from '../constants/Icons';
import { LinearGradient } from 'expo-linear-gradient'; // Optional: install expo-linear-gradient

// Reusable Menu Item Component
const MenuItem = ({ item, hideCount = false }) => (
  <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
    <View style={styles.menuItemLeft}>
      <View style={styles.menuIconContainer}>
        <Icons.Ionicons name={item.icon} size={20} color="#1a1a1a" />
      </View>
      <Text style={styles.menuItemTitle}>{item.title}</Text>
    </View>
    <View style={styles.menuItemRight}>
      {!hideCount && item.count && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{item.count}</Text>
        </View>
      )}
      <Icons.Feather name="chevron-right" size={20} color="#94a3b8" />
    </View>
  </TouchableOpacity>
);

const PreferenceItem = ({ item, darkMode, isDarkMode, isOnline, isNotifications, onToggleDarkMode, onToggleOnline, onToggleNotifications }) => {
  const isToggle = item.toggle;

  return (
    <View style={styles.menuItem}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIconContainer, darkMode && styles.iconContainerDark]}>
          <Icons.Feather name={isToggle ? item.icon1 : item.icon2} size={20} color={darkMode ? '#e2e8f0' : '#1a1a1a'} />
        </View>
        <Text style={[styles.menuItemTitle, darkMode && styles.textDark]}>{item.title}</Text>
      </View>

      {isToggle ? (
        <Switch
          value={item.title === 'Dark Mode' ? isDarkMode : isNotifications}
          onValueChange={(value) =>
            item.title === 'Dark Mode' ? onToggleDarkMode(value) : isOnline ? onToggleOnline : onToggleNotifications(value)
          }
          trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
          thumbColor={item.title === 'Dark Mode' && isDarkMode ? '#1e40af' : '#f1f5f9'}
          ios_backgroundColor="#e2e8f0"
        />
      ) : (
        <Icons.Feather name="chevron-right" size={20} color="#94a3b8" />
      )}
    </View>
  );
};

const menuItems = [
  { id: '1', title: 'My House Applications', icon: 'bookmarks-outline', count: '5' },
  { id: '2', title: 'My Tender Bids Progress', icon: 'albums-outline', count: '12' },
  { id: '3', title: 'My Vacancy Applications', icon: 'person-circle-outline', count: '8' },
];

const preferencesItems = [
  { id: '4', title: 'Dark Mode', icon1: 'sun', icon2: 'moon', toggle: true },
  { id: '5', title: 'Is Online', icon1: 'wifi', icon2: 'wifi-off', toggle: true },
  { id: '6', title: 'Notifications', icon1: 'bell', icon2: 'bell-off', toggle: true },
];

const supportItems = [
  { id: '6', title: 'Help & Support', icon: 'help-circle-outline' },
  { id: '7', title: 'Privacy Policy', icon: 'shield-outline' },
  { id: '8', title: 'Terms of Service', icon: 'list-outline' },
];

export default function ProfileScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton}>
            <Icons.AntDesign name="logout" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Profile Card with Gradient */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1506784983877-45594f17c721?w=800&q=80' }}
          style={styles.heroCard}
          imageStyle={{ borderRadius: 20, opacity: 0.15 }}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.9)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroContent}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Icons.Ionicons name="person" size={48} color="#fff" />
              </View>
              <View style={styles.onlineIndicator} />
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.name}>John Doe</Text>
              <Text style={styles.email}>john.doe@example.com</Text>
              <View style={styles.verifiedBadge}>
                <Icons.Feather name="check-circle" size={16} color="#10b981" />
                <Text style={styles.verifiedText}>Verified Account</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.editButton}>
              <Icons.Feather name="edit-2" size={18} color="#fff" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* Menu Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <View key={item.id}>
                <MenuItem item={item} />
                {index < menuItems.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>Preferences</Text>
          <View style={[styles.menuCard, darkMode && styles.cardDark]}>
            {preferencesItems.map((item, index) => (
              <View key={item.id}>
                <PreferenceItem
                  item={item}
                  darkMode={darkMode}
                  isDarkMode={item.title === 'Dark Mode' && darkMode}
                  isOnline={item.title === 'Is Online' && isOnline}
                  isNotifications={item.title === 'Notifications' && notifications}
                  onToggleDarkMode={setDarkMode}
                  onToggleNotifications={setNotifications}
                />
                {index < preferencesItems.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuCard}>
            {supportItems.map((item, index) => (
              <View key={item.id}>
                <MenuItem item={item} hideCount />
                {index < supportItems.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  settingsBtn: {
    padding: 8,
  },
  heroCard: {
    marginVertical: 16,
    marginHorizontal: 10,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 84,
    height: 84,
    backgroundColor: '#1e293b',
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 4,
    width: 16,
    height: 16,
    backgroundColor: '#10b981',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 6,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 8,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    marginVertical: 6,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: 'center',
  },
  countText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3b82f6',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 76, // Align with title
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#fef2f2',
    gap: 10,
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  cardDark: {
    backgroundColor: '#1e293b',
  },
  iconContainerDark: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  textDark: {
    color: '#e2e8f0',
  },

  // Update section title in dark mode
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});