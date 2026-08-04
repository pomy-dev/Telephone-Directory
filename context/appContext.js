// AppContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScreenOrientation from 'expo-screen-orientation';

import { CustomDarkTheme, CustomLightTheme } from '../constants/theme';
import { fetchNotifications } from '../service/getApi';
import { getMyAppliedGigsThatApproved } from '../service/Supabase-Fuctions';
import { AuthContext } from './authProvider';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==================== NEW: Orientation State ====================
  const [orientation, setOrientation] = useState('PORTRAIT'); // PORTRAIT or LANDSCAPE
  // ============================================================

  // Load persisted state + fetch fresh notifications and user data
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const theme = await AsyncStorage.getItem('theme');
        const online = await AsyncStorage.getItem('isOnline');
        const state = await AsyncStorage.getItem('selectedState');
        const notifEnabled = await AsyncStorage.getItem('notificationsEnabled');

        if (state && state !== "" && state !== "undefined" && state !== "null") {
          setSelectedState(JSON.parse(state))
        } else {
          // console.log('No state found in storage, setting to Business eSwatini')
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

  // ==================== ORIENTATION SETUP ====================
  useEffect(() => {
    let subscription;

    const setupOrientation = async () => {
      try {
        // Allow the app to rotate freely
        await ScreenOrientation.unlockAsync();

        // Get initial orientation
        const initial = await ScreenOrientation.getOrientationAsync();
        setOrientation(getOrientationLabel(initial));

        // Listen for orientation changes
        subscription = ScreenOrientation.addOrientationChangeListener((event) => {
          const newOrientation = getOrientationLabel(event.orientationInfo.orientation);
          setOrientation(newOrientation);
        });
      } catch (error) {
        console.log('Orientation setup error:', error);
      }
    };

    setupOrientation();

    // Cleanup
    return () => {
      if (subscription) {
        subscription.remove();
      }
      // Optional: Lock back to portrait when app is closed
      // ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };
  }, []);

  const getOrientationLabel = (ori) => {
    // Group portrait-up and portrait-down as PORTRAIT
    if (
      ori === ScreenOrientation.Orientation.PORTRAIT_UP ||
      ori === ScreenOrientation.Orientation.PORTRAIT_DOWN
    ) {
      return 'PORTRAIT';
    }
    return 'LANDSCAPE';
  };

  // Optional: Helper function to lock orientation for specific screens
  const lockOrientation = async (lockType) => {
    try {
      await ScreenOrientation.lockAsync(lockType);
    } catch (error) {
      console.log('Failed to lock orientation:', error);
    }
  };

  // Fetch and merge notifications whenever relevant state changes
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        let merged = [];

        if (isOnline && notificationsEnabled) {
          // 1. Company / system notifications from the API
          const fresh = await fetchNotifications();
          if (Array.isArray(fresh)) {
            merged.push(
              ...fresh.map((n) => ({
                ...n,
                _type: n._type || 'company',
              }))
            );
          }

          // 2. User-specific gig notifications (applications & approvals)
          if (user?.email) {
            const userNots = await getMyAppliedGigsThatApproved(user?.email);
            if (userNots?.success && Array.isArray(userNots.data)) {
              merged.push(
                ...userNots.data.map((n) => {
                  // if the notification record includes information about who posted the gig,
                  // and it matches the current user, treat it as an employer alert
                  let type = 'application';
                  try {
                    if (
                      user &&
                      n.posted_by &&
                      (n.posted_by.email === user?.email || n.posted_by.id === user?.uid)
                    ) {
                      type = 'employer';
                    }
                  } catch (e) {
                    /* ignore */
                  }

                  return {
                    ...n,
                    _type: n._type || type,
                  };
                })
              );
            }

            //   // sort merged notifications by timestamp desc (newest first)
            merged.sort((a, b) => {
              const ta = new Date(a.created_at || a.startDate || a.applied_at).getTime();
              const tb = new Date(b.created_at || b.startDate || b.applied_at).getTime();
              return tb - ta;
            });
          }

          // Future: you could fetch employer notifications here and tag _type:'employer'
        }

        setNotifications(merged);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    loadNotifications();
  }, [isOnline, notificationsEnabled, user]);

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
    // ensure we tag the incoming object with a type if not already
    let tagged = { ...notification };
    if (!tagged._type) {
      // if notification includes posted_by and it matches current user, treat as employer
      if (
        user &&
        tagged.posted_by &&
        (tagged.posted_by.email === user?.email || tagged.posted_by.id === user?.uid)
      ) {
        tagged._type = 'employer';
      } else if (tagged.job_title || tagged.title?.toLowerCase().includes('gig')) {
        tagged._type = 'application';
      } else if (tagged.company || tagged.category) {
        tagged._type = 'company';
      } else {
        tagged._type = 'company';
      }
    }

    setNotifications((prev) => {
      // Check if the notification already exists
      const exists = prev.some((item) => item.id === tagged.id || item._id === tagged._id);
      if (!exists) {
        // If it doesn't exist, add it to the list
        return [tagged, ...prev];
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
        orientation,
        isLandscape: orientation === 'LANDSCAPE',
        lockOrientation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
