// Login Screen - Love Connect Authentication
// Handles email/password login with Firebase Auth

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../store/themeStore';
import { useAuth } from '../../store/authStore';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { isValidEmail } from '../../utils';
import authService from '../../services/firebase/authService';
import LoveInput from '../../components/inputs/LoveInput';
import LoveButton from '../../components/buttons/LoveButton';
import Icon from '../../components/icons/IconRegistry';

type LoginScreenProps = StackNavigationProp<AuthStackParamList, 'Login'>;

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenProps>();
  const { colors, spacing, typography } = useTheme();
  const { 
    loginWithCredentials, 
    loginWithBiometrics, 
    isLoading: authLoading, 
    error: authError,
    rememberMe,
    biometricEnabled,
    setRememberMe,
    clearError
  } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [localRememberMe, setLocalRememberMe] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);

  useEffect(() => {
    // Initialize remember me state
    setLocalRememberMe(rememberMe);
    
    // Check if biometric login is available and there are stored credentials
    if (biometricEnabled && rememberMe) {
      setShowBiometric(true);
    }
    
    // Clear any previous auth errors
    if (authError) {
      clearError();
    }
  }, [rememberMe, biometricEnabled, authError]);

  // Update errors when auth error changes
  useEffect(() => {
    if (authError) {
      setErrors({ general: authError });
    }
  }, [authError]);

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission with persistent authentication
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await loginWithCredentials(
        formData.email.trim().toLowerCase(),
        formData.password,
        localRememberMe
      );
      // Navigation will happen automatically due to auth state change
    } catch (error) {
      console.error('Login error:', error);
      // Error is already handled in the auth store
    }
  };

  // Handle biometric login
  const handleBiometricLogin = async () => {
    try {
      await loginWithBiometrics();
      // Navigation will happen automatically due to auth state change
    } catch (error) {
      console.error('Biometric login error:', error);
      // Error is already handled in the auth store
    }
  };

  // Handle remember me toggle
  const handleRememberMeToggle = (value: boolean) => {
    setLocalRememberMe(value);
    setRememberMe(value);
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  // Handle sign up navigation
  const handleSignUp = () => {
    navigation.navigate('Signup');
  };

  // Clear field errors when user starts typing
  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.flex} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.flex} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[
              styles.logoContainer,
              { backgroundColor: colors.love, borderRadius: 30 }
            ]}>
              <Text style={styles.logoEmoji}>❤️</Text>
            </View>
            <Text style={[
              styles.title,
              { color: colors.text, fontSize: typography.h1 }
            ]}>
              Welcome Back
            </Text>
            <Text style={[
              styles.subtitle,
              { color: colors.textSecondary, fontSize: typography.body }
            ]}>
              Sign in to continue your love story
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <LoveInput
              label="Email Address"
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(value) => handleFieldChange('email', value)}
              error={errors.email}
              leftIcon="email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              isValid={formData.email.length > 0 && isValidEmail(formData.email) && !errors.email}
            />

            <LoveInput
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(value) => handleFieldChange('password', value)}
              error={errors.password}
              leftIcon="lock"
              isPassword
              isValid={formData.password.length >= 6 && !errors.password}
            />

            {/* Remember Me & Forgot Password Row */}
            <View style={styles.optionsRow}>
              <View style={styles.rememberMeContainer}>
                <Switch
                  value={localRememberMe}
                  onValueChange={handleRememberMeToggle}
                  trackColor={{ false: colors.border, true: colors.love + '40' }}
                  thumbColor={localRememberMe ? colors.love : colors.textSecondary}
                  ios_backgroundColor={colors.border}
                />
                <Text style={[
                  styles.rememberMeText,
                  { color: colors.text, fontSize: typography.body }
                ]}>
                  Remember me
                </Text>
              </View>
              
              <TouchableOpacity 
                onPress={handleForgotPassword}
                style={styles.forgotPasswordContainer}
              >
                <Text style={[
                  styles.forgotPasswordText,
                  { color: colors.love, fontSize: typography.body }
                ]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <LoveButton
              title="Sign In"
              onPress={handleSubmit}
              loading={authLoading}
              disabled={authLoading}
              variant="primary"
              size="large"
              fullWidth
              style={{ marginTop: spacing.lg }}
            />

            {/* Biometric Login Button */}
            {showBiometric && (
              <LoveButton
                title="Sign In with Biometrics"
                onPress={handleBiometricLogin}
                loading={authLoading}
                disabled={authLoading}
                variant="outline"
                size="large"
                fullWidth
                leftIcon="fingerprint"
                style={{ marginTop: spacing.md }}
              />
            )}

            {/* General Error */}
            {errors.general && (
              <Text style={[
                styles.generalError,
                { color: colors.error, fontSize: typography.caption }
              ]}>
                {errors.general}
              </Text>
            )}
          </View>

          {/* Sign Up Link */}
          <View style={styles.footer}>
            <Text style={[
              styles.footerText,
              { color: colors.textSecondary, fontSize: typography.body }
            ]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={[
                styles.signUpText,
                { color: colors.love, fontSize: typography.body }
              ]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 30,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    flex: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rememberMeText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontWeight: '600',
  },
  generalError: {
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 24,
  },
  footerText: {
    lineHeight: 20,
  },
  signUpText: {
    fontWeight: '600',
    lineHeight: 20,
  },
});

export default LoginScreen;
