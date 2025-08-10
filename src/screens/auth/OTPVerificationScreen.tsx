// OTPVerificationScreen Placeholder
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../store/themeStore';

const OTPVerificationScreen: React.FC = () => {
  const { colors, typography } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text, fontSize: typography.h2 }]}>
        OTPVerificationScreen
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Coming soon in Step 2 - Authentication 🔐
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
  },
});

export default OTPVerificationScreen;
