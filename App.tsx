/**
 * Love Connect - React Native App
 * A beautiful messaging app with real-time features
 * 
 * @format
 */

import React, { useEffect } from 'react';
import { LogBox, View, Text, StyleSheet, SafeAreaView } from 'react-native';
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

// Simple test component to debug loading issues
const SimpleTestApp: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Love Connect</Text>
        <Text style={styles.subtitle}>App is loading successfully!</Text>
      </View>
    </SafeAreaView>
  );
};

const App: React.FC = () => {
  const initializeTheme = useThemeStore(state => state.initializeTheme);

  useEffect(() => {
    console.log('App: Starting initialization...');
    try {
      // Initialize theme on app startup
      initializeTheme();
      console.log('App: Theme initialized');
      
      // Setup system theme listener
      const themeSubscription = setupThemeListener();
      console.log('App: Theme listener setup');
      
      return () => {
        themeSubscription?.remove();
      };
    } catch (error) {
      console.error('App: Initialization error:', error);
    }
  }, [initializeTheme]);

  // For debugging: return simple component first
  // return <SimpleTestApp />;

  try {
    return (
      <AuthInitializer>
        <RootNavigator />
      </AuthInitializer>
    );
  } catch (error) {
    console.error('App: Render error:', error);
    return <SimpleTestApp />;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E91E63',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default App;
