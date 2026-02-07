import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Images } from '../constants/Images';
import { AppContext } from '../context/appContext';
import { AuthContext } from '../context/authProvider';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { Icons } from '../constants/Icons';

export default function LoginScreen({ navigation }) {
  const { theme, isDarkMode } = useContext(AppContext);
  const { googleLogin, emailLogin, phoneLogin, verifyOTP } = useContext(AuthContext);

  const [isConnecting, setIsConnecting] = useState(false);
  const [loginMode, setLoginMode] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // OTP verification states
  const [showOTPSheet, setShowOTPSheet] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [waitingForOTP, setWaitingForOTP] = useState(true);

  // Validation
  const validate = () => {
    const newErrors = {};
    if (loginMode === 'email' && !email.includes('@')) newErrors.email = 'Valid email required';
    if (loginMode === 'phone' && phone.length < 8) newErrors.phone = 'Valid phone number required';
    if (loginMode === 'email' && (!password || password.length < 6)) newErrors.password = 'Password must be 6+ characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSocialLogin = async (connection) => {
    setIsConnecting(true);
    try {
      await googleLogin(connection);
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
      if (loginMode === 'email') {
        await emailLogin(email.trim(), password);
      } else {
        // Send OTP for phone
        const confirmation = await phoneLogin(phone.trim());
        if (confirmation) {
          setConfirmationResult(confirmation);
          setShowOTPSheet(true);
          setWaitingForOTP(true);
          setOtp(['', '', '', '', '', '']);
          console.log('OTP sent to:', phone.trim());
        } else {
          Alert.alert('Failed', 'Could not send OTP. Please try again.');
        }
      }
    } catch (err) {
      let message = err.message || 'Invalid credentials.';
      if (err.code === 'auth/user-not-found') {
        message = 'No account found with this email/phone.';
      } else if (err.code === 'auth/wrong-password') {
        message = 'Incorrect password.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email format.';
      }
      Alert.alert('Login Failed', message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleOTPChange = (index, value) => {
    // Only allow digits
    const numericValue = value.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);

    // Check if all fields are filled
    const isComplete = newOtp.every(digit => digit !== '');
    if (isComplete) {
      setWaitingForOTP(false);
    } else {
      setWaitingForOTP(true);
    }

    // Auto-move to next field
    if (numericValue && index < 5) {
      // Automatically focus next input by storing refs
      const nextInput = document.getElementById(`otpInput${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleConfirmOTP = async () => {
    if (!confirmationResult || otp.some(digit => digit === '')) {
      Alert.alert('Invalid', 'Please enter all 6 digits.');
      return;
    }

    setIsVerifying(true);
    try {
      const otpCode = otp.join('');
      await verifyOTP(confirmationResult, otpCode);
      setShowOTPSheet(false);
      setOtp(['', '', '', '', '', '']);
      setConfirmationResult(null);
    } catch (err) {
      Alert.alert('Verification Failed', err.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsVerifying(false);
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
            <>
              <PaperTextInput
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType='email-address'
                mode="outlined"
                error={!!errors.email}
                style={styles.input}
                theme={{ roundness: 12 }}
                left={<PaperTextInput.Icon icon="email" />}
              />

              <PaperTextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                mode="outlined"
                error={!!errors.password}
                style={styles.input}
                theme={{ roundness: 12 }}
                left={<PaperTextInput.Icon icon="lock" />}
                right={
                  <PaperTextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />
            </>
          ) : (
            <PaperTextInput
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              keyboardType="phone-pad"
              error={!!errors.phone}
              style={styles.input}
              theme={{ roundness: 12 }}
              left={<PaperTextInput.Icon icon="phone" />}
            />
          )}

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
              <ActivityIndicator size={20} color="#fff" />
            ) : (
              <Text style={styles.signInText}>{loginMode === 'email' ? 'Sign In' : 'Send OTP'}</Text>
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

      {/* OTP Bottom Sheet Modal */}
      <Modal
        visible={showOTPSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => !isVerifying && setShowOTPSheet(false)}
      >
        <View style={styles.otpModalOverlay}>
          <View style={[styles.otpBottomSheet, { backgroundColor: theme.colors.background }]}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeOTPBtn}
              onPress={() => !isVerifying && setShowOTPSheet(false)}
              disabled={isVerifying}
            >
              <Icons.Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            {/* Title */}
            <Text style={[styles.otpTitle, { color: theme.colors.text }]}>Enter OTP</Text>
            <Text style={[styles.otpSubtitle, { color: theme.colors.textSecondary }]}>
              We've sent a 6-digit code to {phone}
            </Text>

            {/* OTP Input Squares */}
            <View style={styles.otpInputContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  style={[
                    styles.otpInput,
                    { borderColor: digit ? theme.colors.primary : theme.colors.border },
                  ]}
                  maxLength={1}
                  keyboardType="number-pad"
                  value={digit}
                  onChangeText={(value) => handleOTPChange(index, value)}
                  editable={!isVerifying}
                  placeholderTextColor={theme.colors.textSecondary}
                />
              ))}
            </View>

            {/* Waiting for OTP Spinner */}
            {waitingForOTP && (
              <View style={styles.spinnerContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.waitingText, { color: theme.colors.textSecondary }]}>
                  Waiting for code...
                </Text>
              </View>
            )}

            {/* Confirm Button */}
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                {
                  backgroundColor: !waitingForOTP && !isVerifying ? theme.colors.primary : '#ccc',
                },
              ]}
              onPress={handleConfirmOTP}
              disabled={waitingForOTP || isVerifying || otp.some(d => d === '')}
            >
              {isVerifying ? (
                <ActivityIndicator size={20} color="#fff" />
              ) : (
                <Text style={styles.confirmText}>Confirm</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  otpModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  otpBottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingBottom: Platform.OS === 'ios' ? 40 : 32,
  },
  closeOTPBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  otpTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  otpSubtitle: {
    fontSize: 14,
    marginBottom: 32,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
  },
  spinnerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  waitingText: {
    marginTop: 12,
    fontSize: 14,
  },
  confirmBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});