// AppContext.js
import { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomDarkTheme, CustomLightTheme } from '../constants/theme';
import { fetchNotifications } from '../service/getApi'; // <-- your API call

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load persisted state + fetch fresh notifications
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const theme = await AsyncStorage.getItem('theme');
        const online = await AsyncStorage.getItem('isOnline');
        const state = await AsyncStorage.getItem('selectedState');
        const notifEnabled = await AsyncStorage.getItem('notificationsEnabled');

        if (state && state !== "" && state !== "undefined" && state !== "null") {
          console.log('State from storage:', JSON.parse(state))
          setSelectedState(JSON.parse(state))
        } else {
          console.log('No state found in storage, setting to Business eSwatini')
          setSelectedState('BE');
        }

        if (theme !== null) setIsDarkMode(JSON.parse(theme));
        if (online !== null) setIsOnline(JSON.parse(online));
        if (notifEnabled !== null) setNotificationsEnabled(JSON.parse(notifEnabled));

      } catch (error) {
        console.log('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  // Fetch new notifications when online
  useEffect(() => {
    const loadApiNotifications = async () => {
      try {
        if (isOnline && notificationsEnabled) {
          const fresh = await fetchNotifications();
          setNotifications(fresh); // overwrite with fresh ones
        }
      } catch (err) {
        console.log('Error fetching notifications:', err);
      }
    };
    loadApiNotifications();
  }, [isOnline, notificationsEnabled]);

  // =================================Persist values when they change===================================

  // Persist selectedState
  useEffect(() => {
    if (selectedState) {
      AsyncStorage.setItem('selectedState', JSON.stringify(selectedState));
    }
  }, [selectedState]);

  // Persist theme
  useEffect(() => {
    AsyncStorage.setItem('theme', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Persist isOnline
  useEffect(() => {
    AsyncStorage.setItem('isOnline', JSON.stringify(isOnline));
  }, [isOnline]);

  // Persist notificationsEnabled
  useEffect(() => {
    AsyncStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabled));
  }, [notificationsEnabled]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleNotifications = () => setNotificationsEnabled(!notificationsEnabled);
  const toggleOnlineMode = () => setIsOnline(!isOnline);

  const theme = isDarkMode ? CustomDarkTheme : CustomLightTheme;

  const addNotification = (notification) => {
    setNotifications((prev) => {
      // Check if the notification already exists
      const exists = prev.some((item) => item._id === notification._id);
      if (!exists) {
        // If it doesn't exist, add it to the list
        return [notification, ...prev];
      }
      // If it exists, return the previous state unchanged
      return prev;
    });
  };

  if (loading) return null;

  return (
    <AppContext.Provider
      value={{
        isDarkMode,
        setIsDarkMode,
        selectedState,
        setSelectedState,
        notificationsEnabled,
        setNotificationsEnabled,
        isOnline,
        setIsOnline,
        toggleTheme,
        toggleNotifications,
        toggleOnlineMode,
        theme,
        notifications,
        addNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
