import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Images } from '../constants/Images';
import { AppContext } from '../context/appContext';
import { AuthContext } from '../context/authProvider';
import CustomLoader from '../components/customLoader';
import { TextInput } from 'react-native-paper';

export default function SignupScreen({ navigation }) {
  const { theme, isDarkMode } = useContext(AppContext);
  const { emailSignUp, user, loading } = useContext(AuthContext);

  const [isConnecting, setIsConnecting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.includes('@') || !email.includes('.')) newErrors.email = 'Valid email required';
    if (!phone || phone.replace(/\D/g, '').length < 8) newErrors.phone = 'Valid phone number required';
    if (!password || password.length < 6) newErrors.password = 'Password must be 6+ characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    setIsConnecting(true);
    try {
      await emailSignUp(name.trim(), email.trim(), password, phone.trim());

      Alert.alert('Success', 'Account created! You can now sign in.', [
        {
          text: 'Close', onPress: () => {
            setConfirmPassword('');
            setEmail('');
            setName('');
            setPassword('');
          }
        },
      ]);
    } catch (err) {
      let message = err.message;
      if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already registered.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email format.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password is too weak.';
      }
      Alert.alert('Sign Up Failed', message);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
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
          <Text style={[styles.title, { color: theme.colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Join <Text style={{ fontWeight: '700' }}>Business Link</Text> today
          </Text>

          {/* Inputs */}
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            error={!!errors.name}
            style={styles.input}
            theme={{ roundness: 12 }}
            left={<TextInput.Icon icon="account" />}
          />

          <TextInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            error={!!errors.email}
            style={styles.input}
            theme={{ roundness: 12 }}
            left={<TextInput.Icon icon="email" />}
          />

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

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            mode="outlined"
            error={!!errors.confirmPassword}
            style={styles.input}
            theme={{ roundness: 12 }}
            left={<TextInput.Icon icon="lock-check" />}
            right={
              <TextInput.Icon
                icon={showConfirmPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
          />

          {/* Error messages */}
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signUpBtn, { backgroundColor: theme.colors.primary }]}
            onPress={handleSignup}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <CustomLoader size="small" color="#fff" />
            ) : (
              <Text style={styles.signUpText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Sign In Link */}
          <TouchableOpacity
            style={styles.signInLink}
            onPress={() => navigation?.navigate('Login')}
          >
            <Text style={[styles.signInText, { color: theme.colors.textSecondary }]}>
              Already have an account?{' '}
              <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ────────────────────────────── Styles ──────────────────────────────
// Almost identical to LoginScreen – only minor text/button name changes
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
  signUpBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signUpText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  signInLink: {
    marginTop: 24,
    alignItems: 'center',
    marginBottom: 80,
  },
  signInText: {
    fontSize: 15,
  },
});