// App Stack Navigator
// Main app navigation after authentication

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../store/themeStore';
import BottomTabs from './BottomTabs';

// Import additional screens that are not in tabs
import ChatRoomScreen from '../screens/chats/ChatRoomScreen';
import VideoCallScreen from '../screens/calls/VideoCallScreen';
import AudioCallScreen from '../screens/calls/AudioCallScreen';
import ProfileEditScreen from '../screens/profile/ProfileEditScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import SearchScreen from '../screens/search/SearchScreen';

export type AppStackParamList = {
  MainTabs: undefined;
  ChatRoom: {
    chatId: string;
    recipientId: string;
    recipientName: string;
    recipientAvatar?: string;
  };
  VideoCall: {
    callId: string;
    isIncoming?: boolean;
    recipientId: string;
    recipientName: string;
    recipientAvatar?: string;
  };
  AudioCall: {
    callId: string;
    isIncoming?: boolean;
    recipientId: string;
    recipientName: string;
    recipientAvatar?: string;
  };
  ProfileEdit: undefined;
  Settings: undefined;
  Notifications: undefined;
  Search: undefined;
};

const Stack = createStackNavigator<AppStackParamList>();

const AppStack: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false, // Disable all default headers
        cardStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      {/* Bottom Tabs Navigator */}
      <Stack.Screen
        name="MainTabs"
        component={BottomTabs}
      />

      {/* Chat Room */}
      <Stack.Screen
        name="ChatRoom"
        component={ChatRoomScreen}
      />

      {/* Video Call */}
      <Stack.Screen
        name="VideoCall"
        component={VideoCallScreen}
        options={{
          presentation: 'modal',
          gestureEnabled: false,
        }}
      />

      {/* Audio Call */}
      <Stack.Screen
        name="AudioCall"
        component={AudioCallScreen}
        options={{
          presentation: 'modal',
          gestureEnabled: false,
        }}
      />

      {/* Profile Edit */}
      <Stack.Screen
        name="ProfileEdit"
        component={ProfileEditScreen}
        options={{
          presentation: 'modal',
        }}
      />

      {/* Settings */}
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
      />

      {/* Notifications */}
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
      />

      {/* Search & Filters */}
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

export default AppStack;
