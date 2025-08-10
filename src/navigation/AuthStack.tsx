// Authentication Stack Navigator
// Manages authentication flow screens

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../store/themeStore';

// Import auth screens (we'll create these next)
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  OTPVerification: {
    phoneNumber?: string;
    email?: string;
    verificationId?: string;
  };
  ForgotPassword: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthStack: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontSize: theme.typography.h3,
          fontWeight: '600',
          color: theme.colors.text,
        },
        headerBackTitleVisible: false,
        cardStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ 
          title: 'Welcome Back',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{ 
          title: 'Create Account',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="OTPVerification"
        component={OTPVerificationScreen}
        options={{ 
          title: 'Verification',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ 
          title: 'Reset Password',
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
