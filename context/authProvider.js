import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Auth0 from 'react-native-auth0';
import { getAuth, createUserWithEmailAndPassword, signOut } from '@react-native-firebase/auth';
import { jwtDecode } from 'jwt-decode';
import { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_REDIRECT_URI, AUTH0_LOGOUT_REDIRECT_URI } from '../config/env';

const auth0 = new Auth0({
  domain: AUTH0_DOMAIN,
  clientId: AUTH0_CLIENT_ID,
});

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session
  useEffect(() => {
    const loadSession = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      const userInfo = await AsyncStorage.getItem('user');
      if (token && userInfo) {
        setAccessToken(token);
        setUser(JSON.parse(userInfo));
      }
      setLoading(false);
    };
    loadSession();
  }, []);

  const googleLogin = async (connection) => {
    try {
      const credentials = await auth0.webAuth.authorize({
        scope: 'openid profile email',
        connection,
        redirectUri: AUTH0_REDIRECT_URI,
      });

      // Decode the JWT to get user info
      const decodedUser = jwtDecode(credentials.idToken);

      // Store tokens & user info
      setAccessToken(credentials.accessToken);
      setUser(decodedUser);
      await AsyncStorage.setItem('accessToken', credentials.accessToken);
      await AsyncStorage.setItem('user', JSON.stringify(decodedUser));

      return credentials;
    } catch (error) {
      console.error(`Social login (${connection}) failed:`, error);
      throw error;
    }
  };

  const emailSignIn = async (name, email, password) => {
    await createUserWithEmailAndPassword(getAuth(), email, password).then(async (userCredential) => {
      var user = userCredential.user;
      console.log('Registered with:', user.email);
      await user.updateProfile({ displayName: name.trim() });
    }).catch((error) => {
      setIsConnecting(false);
      console.log('Sign Up Failed', error.message || 'Please try again.');
    });
  }

  const emailLogin = async (email, password) => {
    auth.createUserWithEmailAndPassword(email, password).then((userCredential) => {
      var user = userCredential.user;
      console.log('Registered with:', user.email);
    }).catch((error) => {
      setIsConnecting(false);
      Alert.alert('Login Failed', error.message || 'Please try again.');
    });
  }

  const logout = async () => {
    try {
      await auth0.webAuth.clearSession({
        federated: true,
        returnTo: AUTH0_LOGOUT_REDIRECT_URI,
      });

      await signOut(getAuth()).then(() => console.log('User signed out from firebase!'));

      setAccessToken(null);
      setUser(null);
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };


  const value = { googleLogin, emailSignIn, emailLogin, logout, accessToken, user, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};