import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Platform, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icons } from '../constants/Icons';
import { AppContext } from '../context/appContext';
import { AuthContext } from '../context/authProvider';
import { LinearGradient } from 'expo-linear-gradient'; // Optional: install expo-linear-gradient

// Reusable Menu Item Component
const MenuItem = ({ item, theme, darkMode }) => (
  <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
    <View style={styles.menuItemLeft}>
      <View style={[styles.menuIconContainer, darkMode && styles.iconContainerDark]}>
        <Icons.Ionicons name={item.icon} size={20} color={theme.colors.text} />
      </View>
      <Text style={[styles.menuItemTitle, darkMode && { color: theme.colors.text }]}>{item.title}</Text>
    </View>
    <View style={styles.menuItemRight}>
      <Icons.Feather name="chevron-right" size={20} color={theme.colors.sub_text} />
    </View>
  </TouchableOpacity>
);

const PreferenceItem = ({ item, theme, darkMode, isDarkMode, isOnline, isNotifications, onToggleDarkMode, onToggleOnline, onToggleNotifications }) => {
  const isToggle = item.toggle;

  return (
    <View style={styles.menuItem}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIconContainer, darkMode && styles.iconContainerDark]}>
          <Icons.Feather name={isDarkMode ? item.icon1 : isOnline ? item.icon1 : isNotifications ? item.icon1 : item.icon2} size={20} color={darkMode ? '#e2e8f0' : '#1a1a1a'} />
        </View>
        <Text style={[styles.menuItemTitle, darkMode && { color: theme.colors.text }]}>{item.title}</Text>
      </View>

      {isToggle ? (
        <Switch
          value={item.title === 'Dark Mode' ? isDarkMode : item.title === 'Is Online' ? isOnline : isNotifications}
          onValueChange={(value) =>
            item.title === 'Dark Mode' ? onToggleDarkMode(value) : item.title === 'Is Online' ? onToggleOnline(value) : onToggleNotifications(value)
          }
          trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
          thumbColor={(item.title === 'Dark Mode' && isDarkMode) || (item.title === 'Is Online' && isOnline) || (item.title === 'Notifications' && isNotifications) ? '#1e40af' : '#f1f5f9'}
          ios_backgroundColor="#e2e8f0"
        />
      ) : (
        <Icons.Feather name="chevron-right" size={20} color="#94a3b8" />
      )}
    </View>
  );
};

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
  const { theme, isDarkMode, notificationsEnabled, isOnline, toggleTheme, toggleNotifications, toggleOnlineMode } = React.useContext(AppContext);
  const { user, logout } = React.useContext(AuthContext);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        {/* Profile text */}
        <Text style={[styles.title, { color: theme.colors.text }]}>Profile</Text>

        {/* Logout Button */}
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Icons.AntDesign name="logout" size={20} color="#ef4444" />
          <Text style={[styles.logoutText, { color: '#ef4444' }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Profile Card with Gradient */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1506784983877-45594f17c721?w=800&q=80' }}
        style={styles.heroCard}
        imageStyle={{ borderRadius: 20, opacity: 0.15 }}
      >
        <LinearGradient
          colors={[theme.colors.background, 'rgba(250, 210, 247, 0.9)']}
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
            <Text style={[styles.name, { color: theme.colors.text }]}>{user.displayName}</Text>
            <Text style={[styles.email, { color: theme.colors.sub_text }]}>{user.email}</Text>
            {user.uid &&
              <View style={styles.verifiedBadge}>
                <Icons.Feather name="check-circle" size={16} color={theme.colors.primary} />
                <Text style={[styles.verifiedText, { color: theme.colors.primary }]}>Verified Account</Text>
              </View>
            }
          </View>
        </View>

        <TouchableOpacity style={[styles.editButton, { backgroundColor: theme.colors.indicator }]} activeOpacity={0.8}>
          <Icons.Feather name="edit-2" size={18} color="#fff" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </ImageBackground>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Preferences</Text>
          <View style={[styles.menuCard, { backgroundColor: theme.colors.card }]}>
            {preferencesItems.map((item, index) => (
              <View key={item.id}>
                <PreferenceItem
                  item={item}
                  theme={theme}
                  darkMode={isDarkMode}
                  isDarkMode={item.title === 'Dark Mode' && isDarkMode}
                  isOnline={item.title === 'Is Online' && isOnline}
                  isNotifications={item.title === 'Notifications' && notificationsEnabled}
                  onToggleDarkMode={toggleTheme}
                  onToggleOnline={toggleOnlineMode}
                  onToggleNotifications={toggleNotifications}
                />
                {index < preferencesItems.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, { marginBottom: 60 }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Support</Text>
          <View style={[styles.menuCard, { backgroundColor: theme.colors.card }]}>
            {supportItems.map((item, index) => (
              <View key={item.id}>
                <MenuItem item={item} theme={theme} darkMode={isDarkMode} />
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: '200',
    letterSpacing: -0.5,
  },
  settingsBtn: {
    padding: 8,
  },
  heroCard: {
    marginBottom: 1,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
        elevation: 0,
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
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 6,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: '600',
  },
  editButton: {
    position: 'absolute',
    bottom: 10,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
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
        elevation: 1,
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
  approvalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#f5f2feff',
    gap: 10,
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  iconContainerDark: {
    backgroundColor: '#334155',
    borderColor: '#475569',
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
    fontWeight: '600'
  },
});