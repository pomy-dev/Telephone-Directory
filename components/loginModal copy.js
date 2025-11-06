import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  StyleSheet
} from 'react-native';
import { Images } from '../constants/Images';
import { Icons } from '../constants/Icons';
import { AppContext } from '../context/appContext';
import { CustomLoader } from '../components/customLoader';
import { AuthContext } from '../context/authProvider';

export default function LoginScreen({ isLoginVisible, onClose }) {
  const { socialLogin, user, logout, loading } = useContext(AuthContext);
  const [isConnecting, setIsConnecting] = useState(false);
  const { theme } = useContext(AppContext);

  const handleSocialLogin = (connection) => {
    console.log(`Initiating ${connection} login...`);
    try {
      setIsConnecting(true);
      socialLogin(connection);
      // onClose(); 
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isLoginVisible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text ellipsizeMode='tail' width={'90%'} numberOfLines={1} style={[styles.title, { color: theme.colors.text }]}>
              {user ? `Hello, ${user.name || user.email}` : 'Sign In'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icons.AntDesign name="close" size={24} color={theme.colors.notification} />
            </TouchableOpacity>
          </View>

          {/* Loading State */}
          {isConnecting && (
            <View style={styles.loadingContainer}>
              <CustomLoader />
              <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                connecting...
              </Text>
            </View>
          )}

          {/* Content */}
          {!loading && (
            <View style={styles.content}>
              {user ? (
                <View style={styles.loggedInContainer}>
                  <Text style={[styles.welcomeText, { color: theme.colors.text }]}>
                    You are signed in as {user.email}.
                  </Text>
                  <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: theme.colors.notification }]}
                    onPress={logout}
                  >
                    <Icons.AntDesign name="logout" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Sign Out</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.loginContainer}>
                  <Text style={[styles.subtitle, { color: theme.colors.text }]}>
                    Sign in with your preferred account
                  </Text>

                  <TouchableOpacity
                    style={[styles.socialButton, { borderColor: theme.colors.border }]}
                    onPress={() => handleSocialLogin('google-oauth2')}
                  >
                    <Image source={Images.google} style={styles.socialIcon} />
                    <Text style={[styles.socialButtonText, { color: theme.colors.text }]}>
                      Sign in with Google
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.socialButton, { borderColor: theme.colors.border }]}
                    onPress={() => handleSocialLogin('facebook')}
                  >
                    <Image source={Images.facebook} style={styles.socialIcon} />
                    <Text style={[styles.socialButtonText, { color: theme.colors.text }]}>
                      Sign in with Facebook
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay for contrast
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Helvetica Neue', // Classic sans-serif font
  },
  closeButton: {
    padding: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Helvetica Neue',
  },
  content: {
    alignItems: 'center',
  },
  loggedInContainer: {
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Helvetica Neue',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    maxWidth: 200,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Helvetica Neue',
  },
  loginContainer: {
    width: '100%',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Helvetica Neue',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 8,
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    borderRadius: 4,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Helvetica Neue',
  },
});