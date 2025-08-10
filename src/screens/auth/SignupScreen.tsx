// Signup Screen - Love Connect Registration
// Handles email/password registration with Firebase Auth

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
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

type SignupScreenProps = StackNavigationProp<AuthStackParamList, 'Signup'>;

interface FormData {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  displayName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<SignupScreenProps>();
  const { theme } = useTheme();
  const { login, setLoading, setError } = useAuth();
  const { colors, spacing, typography } = theme;

  const [formData, setFormData] = useState<FormData>({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Name is required';
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = 'Name must be at least 2 characters';
    }

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
    } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase and lowercase letters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setLoading(true);
    setError(null);

    try {
      const user = await authService.signUpWithEmail({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        displayName: formData.displayName.trim(),
      });

      // Registration successful - update auth store
      login(user);
      
      // Show success message
      Alert.alert(
        'Welcome to Love Connect! ❤️',
        'Your account has been created successfully.',
        [{ text: 'Continue', style: 'default' }]
      );
      
      // Navigation will happen automatically due to auth state change
      
    } catch (error: any) {
      console.error('Signup error:', error);
      setErrors({ general: error.message });
      setError(error.message);
      
      Alert.alert(
        'Registration Failed',
        error.message,
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  // Handle sign in navigation
  const handleSignIn = () => {
    navigation.navigate('Login');
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
              Create Account
            </Text>
            <Text style={[
              styles.subtitle,
              { color: colors.textSecondary, fontSize: typography.body }
            ]}>
              Join Love Connect and start your journey
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <LoveInput
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.displayName}
              onChangeText={(value) => handleFieldChange('displayName', value)}
              error={errors.displayName}
              leftIcon="person"
              autoCapitalize="words"
              isValid={formData.displayName.trim().length >= 2 && !errors.displayName}
            />

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
              placeholder="Create a strong password"
              value={formData.password}
              onChangeText={(value) => handleFieldChange('password', value)}
              error={errors.password}
              leftIcon="lock"
              isPassword
              isValid={formData.password.length >= 6 && /(?=.*[a-z])(?=.*[A-Z])/.test(formData.password) && !errors.password}
            />

            <LoveInput
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(value) => handleFieldChange('confirmPassword', value)}
              error={errors.confirmPassword}
              leftIcon="lock"
              isPassword
              isValid={formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword && !errors.confirmPassword}
            />

            {/* Submit Button */}
            <LoveButton
              title="Create Account"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              variant="primary"
              size="large"
              fullWidth
              style={{ marginTop: spacing.lg }}
            />

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

          {/* Terms */}
          <Text style={[
            styles.termsText,
            { color: colors.textSecondary, fontSize: typography.caption }
          ]}>
            By creating an account, you agree to our{' '}
            <Text style={{ color: colors.love, fontWeight: '600' }}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={{ color: colors.love, fontWeight: '600' }}>Privacy Policy</Text>
          </Text>

          {/* Sign In Link */}
          <View style={styles.footer}>
            <Text style={[
              styles.footerText,
              { color: colors.textSecondary, fontSize: typography.body }
            ]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={handleSignIn}>
              <Text style={[
                styles.signInText,
                { color: colors.love, fontSize: typography.body }
              ]}>
                Sign In
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
  generalError: {
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  termsText: {
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 16,
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    lineHeight: 20,
  },
  signInText: {
    fontWeight: '600',
    lineHeight: 20,
  },
});

export default SignupScreen;
