// Main Navigation Container
// Manages navigation theme and auth-based routing

import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { useTheme } from '../store/themeStore';
import { useAuth } from '../store/authStore';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

// Custom navigation theme based on our app theme
const createNavigationTheme = (appTheme: any) => ({
  ...(appTheme.dark ? DarkTheme : DefaultTheme),
  colors: {
    ...(appTheme.dark ? DarkTheme.colors : DefaultTheme.colors),
    primary: appTheme.colors.love,
    background: appTheme.colors.background,
    card: appTheme.colors.card,
    text: appTheme.colors.text,
    border: appTheme.colors.border,
    notification: appTheme.colors.notification,
  },
});

const RootNavigator: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const { isAuthenticated } = useAuth();

  // Create navigation theme
  const navigationTheme = createNavigationTheme(theme);

  return (
    <NavigationContainer theme={navigationTheme}>
      {/* Status Bar */}
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
        translucent={false}
      />
      
      {/* Conditional Navigation based on auth state */}
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default RootNavigator;
