import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Images } from '../constants/Images';
import { Icons } from '../constants/Icons';
import { AppContext } from '../context/appContext';
import { AuthContext } from '../context/authProvider';
import { CustomLoader } from '../components/customLoader';
import { TextInput } from 'react-native-paper';

export default function LoginScreen({ navigation }) {
  const { theme } = useContext(AppContext);
  const { socialLogin, emailLogin, user, logout, loading } = useContext(AuthContext);

  const [isConnecting, setIsConnecting] = useState(false);
  const [loginMode, setLoginMode] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation
  const validate = () => {
    const newErrors = {};
    if (loginMode === 'email' && !email.includes('@')) newErrors.email = 'Valid email required';
    if (loginMode === 'phone' && phone.length < 8) newErrors.phone = 'Valid phone number required';
    if (!password || password.length < 6) newErrors.password = 'Password must be 6+ characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSocialLogin = async (connection) => {
    setIsConnecting(true);
    try {
      await socialLogin(connection);
    } catch (err) {
      Alert.alert('Login Failed', err.message || 'Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleEmailOrPhoneLogin = async () => {
    if (!validate()) return;

    setIsConnecting(true);
    try {
      const identifier = loginMode === 'email' ? email : phone;
      await emailLogin(identifier, password, loginMode);
    } catch (err) {
      Alert.alert('Login Failed', err.message || 'Invalid credentials.');
    } finally {
      setIsConnecting(false);
    }
  };

  if (user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.loggedInCard}>
            <Icons.Ionicons name="checkmark-circle" size={80} color={theme.colors.primary} />
            <Text style={[styles.welcomeTitle, { color: theme.colors.text }]}>
              Welcome back!
            </Text>
            <Text style={[styles.welcomeEmail, { color: theme.colors.textSecondary }]}>
              {user.email || user.phone}
            </Text>

            <TouchableOpacity
              style={[styles.logoutBtn, { backgroundColor: theme.colors.error }]}
              onPress={logout}
            >
              <Icons.AntDesign name="logout" size={20} color="#fff" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image source={Images.logo} style={styles.logo} resizeMode="contain" />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.colors.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Sign in to continue to <Text style={{ fontWeight: '700' }}>Busines Link</Text>
          </Text>

          {/* Google Login */}
          <TouchableOpacity
            style={[styles.googleBtn, { borderColor: theme.colors.border }]}
            onPress={() => handleSocialLogin('google-oauth2')}
            disabled={isConnecting}
          >
            <Image source={Images.google} style={styles.googleIcon} />
            <Text style={[styles.googleText, { color: theme.colors.text }]}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.orText, { color: theme.colors.textSecondary }]}>OR</Text>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          </View>

          {/* Login Mode Switch */}
          <View style={styles.modeSwitch}>
            <TouchableOpacity
              style={[styles.modeBtn, loginMode === 'email' && styles.modeBtnActive]}
              onPress={() => setLoginMode('email')}
            >
              <Text style={[styles.modeText, loginMode === 'email' && styles.modeTextActive]}>
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, loginMode === 'phone' && styles.modeBtnActive]}
              onPress={() => setLoginMode('phone')}
            >
              <Text style={[styles.modeText, loginMode === 'phone' && styles.modeTextActive]}>
                Phone
              </Text>
            </TouchableOpacity>
          </View>

          {/* Inputs */}
          {loginMode === 'email' ? (
            <TextInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              error={!!errors.email}
              style={styles.input}
              theme={{ roundness: 12 }}
              left={<TextInput.Icon icon="email" />}
            />
          ) : (
            <TextInput
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              keyboardType="phone-pad"
              error={!!errors.phone}
              style={styles.input}
              theme={{ roundness: 12 }}
              left={<TextInput.Icon icon="phone" />}
            />
          )}

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            mode="outlined"
            error={!!errors.password}
            style={styles.input}
            theme={{ roundness: 12 }}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.signInBtn, { backgroundColor: theme.colors.primary }]}
            onPress={handleEmailOrPhoneLogin}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <CustomLoader size="small" color="#fff" />
            ) : (
              <Text style={styles.signInText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <TouchableOpacity
            style={styles.signupLink}
            onPress={() => navigation?.navigate('Signup')}
          >
            <Text style={[styles.signupText, { color: theme.colors.textSecondary }]}>
              Don't have an account?{' '}
              <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ────────────────────────────── Styles ──────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    flexGrow: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  orText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  modeText: {
    fontSize: 15,
    color: '#64748b',
  },
  modeTextActive: {
    color: '#1e293b',
    fontWeight: '600',
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 4,
  },
  signInBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signInText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  signupLink: {
    marginTop: 24,
    alignItems: 'center',
    marginBottom: 80,
  },
  signupText: {
    fontSize: 15,
  },
  loggedInCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginTop: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeEmail: {
    fontSize: 16,
    marginBottom: 32,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});