// Bottom Tabs Navigator
// Main tab navigation with Love Connect features

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/icons/IconRegistry';
import { useTheme } from '../store/themeStore';

// Import tab screens
import ReelsScreen from '../screens/reels/ReelsScreen';
import ChatsListScreen from '../screens/chats/ChatsListScreen';
import CallsListScreen from '../screens/calls/CallsListScreen';
import WalkieTalkieScreen from '../screens/walkietalkie/WalkieTalkieScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

export type BottomTabParamList = {
  Reels: undefined;
  Chats: undefined;
  Calls: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomTabs: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Reels"
      sceneContainerStyle={{
        backgroundColor: theme.colors.background,
        paddingBottom: Platform.OS === 'ios' ? 65 + insets.bottom : 65,
        marginBottom: 0,
      }}
      screenOptions={({ route }) => ({
        headerShown: false, // Disable all default headers
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Reels':
              iconName = focused ? 'play-circle' : 'play-circle-outline';
              break;
            case 'Chats':
              iconName = 'message-circle';
              break;
            case 'Calls':
              iconName = 'phone';
              break;
            case 'Profile':
              iconName = 'user';
              break;
            default:
              iconName = 'help-circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.love,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          borderTopWidth: 0,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
          height: Platform.OS === 'ios' ? 65 + insets.bottom : 65,
          marginTop: 0,
          marginBottom: 0,
          marginLeft: 0,
          marginRight: 0,
          elevation: 0,
          shadowOpacity: 0,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      })}
    >
      {/* Reels Tab */}
      <Tab.Screen
        name="Reels"
        component={ReelsScreen}
        options={{
          tabBarLabel: 'Reels',
        }}
      />

      {/* Chats Tab */}
      <Tab.Screen
        name="Chats"
        component={ChatsListScreen}
        options={{
          tabBarLabel: 'Chats',
          tabBarBadge: undefined, // TODO: Add unread count
        }}
      />

      {/* Calls Tab */}
      <Tab.Screen
        name="Calls"
        component={CallsListScreen}
        options={{
          tabBarLabel: 'Calls',
        }}
      />

      {/* Profile Tab */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;
