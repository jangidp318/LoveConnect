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
  const { isLoading, initializeAuth, setLoading } = useAuth();

  useEffect(() => {
    console.log('AuthInitializer: Starting auth initialization...');
    
    // Set a timeout to prevent hanging
    const timeout = setTimeout(() => {
      console.warn('AuthInitializer: Auth initialization timed out, continuing...');
      setLoading(false);
    }, 5000); // 5 second timeout
    
    // Initialize authentication when app starts
    initializeAuth().then(() => {
      console.log('AuthInitializer: Auth initialization completed');
      clearTimeout(timeout);
    }).catch((error) => {
      console.error('AuthInitializer: Auth initialization failed:', error);
      setLoading(false);
      clearTimeout(timeout);
    });
    
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  // Show loading screen while initializing auth
  if (isLoading) {
    console.log('AuthInitializer: Showing loading screen');
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
