// Welcome Screen - First screen users see
// Shows app branding and authentication options

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../store/themeStore';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { commonStyles } from '../../theme';

type WelcomeScreenProps = StackNavigationProp<AuthStackParamList, 'Welcome'>;

const { width, height } = Dimensions.get('window');

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenProps>();
  const { theme, colors, spacing, typography, borderRadius } = useTheme();

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={false}
      />

      {/* Logo and App Name */}
      <View style={styles.logoContainer}>
        <View style={[
          styles.logoCircle,
          { backgroundColor: colors.love, borderRadius: borderRadius.round }
        ]}>
          <Text style={styles.logoEmoji}>❤️</Text>
        </View>
        <Text style={[
          styles.appName,
          { color: colors.text, fontSize: typography.h1 }
        ]}>
          Love Connect
        </Text>
        <Text style={[
          styles.tagline,
          { color: colors.textSecondary, fontSize: typography.body, marginTop: spacing.sm }
        ]}>
          Connect hearts across distances
        </Text>
      </View>

      {/* Feature Highlights */}
      <View style={styles.featuresContainer}>
        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>💬</Text>
          <Text style={[styles.featureText, { color: colors.textSecondary }]}>
            Real-time messaging
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>📞</Text>
          <Text style={[styles.featureText, { color: colors.textSecondary }]}>
            HD video & voice calls
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>📻</Text>
          <Text style={[styles.featureText, { color: colors.textSecondary }]}>
            Walkie-talkie mode
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>📍</Text>
          <Text style={[styles.featureText, { color: colors.textSecondary }]}>
            Location sharing
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: colors.love, borderRadius: borderRadius.medium },
            commonStyles.shadow
          ]}
          onPress={handleSignup}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.primaryButtonText,
            { fontSize: typography.button }
          ]}>
            Create Account
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            { 
              borderColor: colors.love,
              borderRadius: borderRadius.medium,
              marginTop: spacing.md
            }
          ]}
          onPress={handleLogin}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.secondaryButtonText,
            { color: colors.love, fontSize: typography.button }
          ]}>
            Sign In
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[
          styles.footerText,
          { color: colors.textSecondary, fontSize: typography.caption }
        ]}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.1,
  },
  logoCircle: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 50,
  },
  appName: {
    fontWeight: '800',
    textAlign: 'center',
  },
  tagline: {
    textAlign: 'center',
    fontWeight: '400',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  featureItem: {
    alignItems: 'center',
    width: '45%',
    marginBottom: 20,
  },
  featureEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonsContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontWeight: '600',
  },
  footer: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  footerText: {
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default WelcomeScreen;
