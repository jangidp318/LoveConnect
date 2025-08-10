// Forgot Password Screen - Love Connect
// Handles password reset via email

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
import { AuthStackParamList } from '../../navigation/AuthStack';
import { isValidEmail } from '../../utils';
import authService from '../../services/firebase/authService';
import LoveInput from '../../components/inputs/LoveInput';
import LoveButton from '../../components/buttons/LoveButton';

type ForgotPasswordScreenProps = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenProps>();
  const { colors, spacing, typography } = useTheme();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Validate email
  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    } else if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    setError('');
    return true;
  };

  // Handle password reset
  const handleResetPassword = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);

    try {
      await authService.sendPasswordResetEmail(email.trim().toLowerCase());
      
      setEmailSent(true);
      
      Alert.alert(
        'Reset Email Sent',
        'We\'ve sent a password reset link to your email address. Please check your inbox and follow the instructions.',
        [{ text: 'OK', style: 'default' }]
      );
      
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message);
      
      Alert.alert(
        'Reset Failed',
        error.message,
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle back to login
  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  // Clear error when user starts typing
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) {
      setError('');
    }
  };

  if (emailSent) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.successContainer}>
          {/* Success Icon */}
          <View style={[
            styles.successIcon,
            { backgroundColor: colors.success, borderRadius: 50 }
          ]}>
            <Text style={styles.successEmoji}>✓</Text>
          </View>
          
          <Text style={[
            styles.successTitle,
            { color: colors.text, fontSize: typography.h2 }
          ]}>
            Check Your Email
          </Text>
          
          <Text style={[
            styles.successSubtitle,
            { color: colors.textSecondary, fontSize: typography.body }
          ]}>
            We've sent a password reset link to{' \n'}
            <Text style={{ color: colors.love, fontWeight: '600' }}>{email}</Text>
          </Text>
          
          <Text style={[
            styles.successInstructions,
            { color: colors.textSecondary, fontSize: typography.caption }
          ]}>
            Didn't receive the email? Check your spam folder or try again.
          </Text>
          
          <LoveButton
            title="Back to Sign In"
            onPress={handleBackToLogin}
            variant="primary"
            size="large"
            fullWidth
            style={{ marginTop: spacing.xl }}
          />
          
          <TouchableOpacity
            onPress={() => setEmailSent(false)}
            style={styles.tryAgainContainer}
          >
            <Text style={[
              styles.tryAgainText,
              { color: colors.love, fontSize: typography.body }
            ]}>
              Try Different Email
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
              <Text style={styles.logoEmoji}>🔒</Text>
            </View>
            <Text style={[
              styles.title,
              { color: colors.text, fontSize: typography.h1 }
            ]}>
              Reset Password
            </Text>
            <Text style={[
              styles.subtitle,
              { color: colors.textSecondary, fontSize: typography.body }
            ]}>
              Enter your email address and we'll send you a link to reset your password
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <LoveInput
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={handleEmailChange}
              error={error}
              leftIcon="email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              isValid={email.length > 0 && isValidEmail(email) && !error}
            />

            <LoveButton
              title="Send Reset Link"
              onPress={handleResetPassword}
              loading={isLoading}
              disabled={isLoading || !email.trim()}
              variant="primary"
              size="large"
              fullWidth
              style={{ marginTop: spacing.lg }}
            />
          </View>

          {/* Back to Login */}
          <View style={styles.footer}>
            <Text style={[
              styles.footerText,
              { color: colors.textSecondary, fontSize: typography.body }
            ]}>
              Remember your password?{' '}
            </Text>
            <TouchableOpacity onPress={handleBackToLogin}>
              <Text style={[
                styles.backToLoginText,
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
    lineHeight: 22,
  },
  form: {
    flex: 1,
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
  backToLoginText: {
    fontWeight: '600',
    lineHeight: 20,
  },
  // Success State Styles
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successEmoji: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
  },
  successTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  successSubtitle: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  successInstructions: {
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 32,
  },
  tryAgainContainer: {
    marginTop: 16,
    paddingVertical: 8,
  },
  tryAgainText: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen;
