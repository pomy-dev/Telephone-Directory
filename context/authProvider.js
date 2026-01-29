import React, { createContext, useState, useEffect } from 'react';
import Auth0 from 'react-native-auth0';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, signInWithPhoneNumber } from '@react-native-firebase/auth';
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
  const firebaseAuth = getAuth();

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };
        setUser(userData);
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseAuth]);

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

      return credentials;
    } catch (error) {
      console.error(`Social login (${connection}) failed:`, error);
      throw error;
    }
  };

  const emailSignUp = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;
      await user.updateProfile({ displayName: name.trim() });
      console.log('Registered with:', user.email);
      return user;
    } catch (error) {
      console.error('Sign Up Failed:', error.message);
      throw error;
    }
  };

  const emailLogin = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;
      console.log('Logged in with:', user.email);
      return user;
    } catch (error) {
      console.error('Login Failed:', error.message);
      throw error;
    }
  };

  const phoneLogin = async (phoneNumber) => {
    try {
      const confirmationResult = await signInWithPhoneNumber(firebaseAuth, phoneNumber);
      return confirmationResult;
    } catch (error) {
      console.error('Phone Login Failed:', error.message);
      throw error;
    }
  };

  const verifyOTP = async (confirmationResult, otp) => {
    try {
      const userCredential = await confirmationResult.confirm(otp);
      const user = userCredential.user;
      console.log('Verified phone:', user.phoneNumber);
      return user;
    } catch (error) {
      console.error('OTP Verification Failed:', error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (accessToken && user)
        await auth0.webAuth.clearSession({
          federated: true,
          returnTo: AUTH0_LOGOUT_REDIRECT_URI,
        });

      await signOut(firebaseAuth);

      setAccessToken(null);
      setUser(null);
      console.log('User signed out successfully!');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const value = { googleLogin, emailSignUp, emailLogin, phoneLogin, verifyOTP, logout, accessToken, user, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};