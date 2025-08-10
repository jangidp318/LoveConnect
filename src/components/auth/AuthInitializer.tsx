// AuthInitializer Component
// Handles authentication initialization on app startup

import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../../store/authStore';
import { useTheme } from '../../store/themeStore';

interface AuthInitializerProps {
  children: React.ReactNode;
}

const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const { theme } = useTheme();
  const { isLoading, initializeAuth } = useAuth();

  useEffect(() => {
    // Initialize authentication when app starts
    initializeAuth();
  }, []);

  // Show loading screen while initializing auth
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator 
          size="large" 
          color={theme.colors.love} 
        />
      </View>
    );
  }

  // Render children once auth is initialized
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AuthInitializer;
