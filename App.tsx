/**
 * Love Connect - React Native App
 * A beautiful messaging app with real-time features
 * 
 * @format
 */

import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import 'react-native-gesture-handler'; // Must be at the top
import RootNavigator from './src/navigation';
import { setupThemeListener, useThemeStore } from './src/store/themeStore';
import AuthInitializer from './src/components/auth/AuthInitializer';

// Disable specific warnings for development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested',
  'Setting a timer for a long period of time',
]);

const App: React.FC = () => {
  const initializeTheme = useThemeStore(state => state.initializeTheme);

  useEffect(() => {
    // Initialize theme on app startup
    initializeTheme();
    
    // Setup system theme listener
    const themeSubscription = setupThemeListener();
    
    return () => {
      themeSubscription?.remove();
    };
  }, [initializeTheme]);

  return (
    <AuthInitializer>
      <RootNavigator />
    </AuthInitializer>
  );
};

export default App;
