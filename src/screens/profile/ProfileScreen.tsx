import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Switch,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/icons/IconRegistry';
import { useTheme } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigation } from '@react-navigation/native';
import LoveButton from '../../components/buttons/LoveButton';

const { width } = Dimensions.get('window');

interface ProfileOption {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  onPress: () => void;
  showArrow?: boolean;
  rightElement?: React.ReactNode;
}

const ProfileScreen: React.FC = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleEditProfile = () => {
    navigation.navigate('ProfileEdit' as never);
  };

  const handleSettings = () => {
    navigation.navigate('Settings' as never);
  };

  const handlePrivacy = () => {
    Alert.alert('Privacy', 'Privacy settings coming soon!');
  };

  const handleHelp = () => {
    Alert.alert('Help & Support', 'Help center coming soon!');
  };

  const handleAbout = () => {
    Alert.alert(
      'About Love Connect',
      'Love Connect v1.0\n\nA modern dating app built with React Native.\n\nMade with ❤️'
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const profileOptions: ProfileOption[] = [
    {
      id: 'edit',
      title: 'Edit Profile',
      subtitle: 'Update your photos and info',
      icon: 'edit',
      onPress: handleEditProfile,
      showArrow: true,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      icon: 'notifications',
      onPress: () => {},
      rightElement: (
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: theme.colors.border, true: theme.colors.love }}
          thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
        />
      ),
    },
    {
      id: 'darkmode',
      title: 'Dark Mode',
      subtitle: 'Switch between light and dark theme',
      icon: 'dark-mode',
      onPress: toggleTheme,
      rightElement: (
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          trackColor={{ false: theme.colors.border, true: theme.colors.love }}
          thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
        />
      ),
    },
    {
      id: 'privacy',
      title: 'Privacy & Safety',
      subtitle: 'Control your privacy settings',
      icon: 'security',
      onPress: handlePrivacy,
      showArrow: true,
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'App preferences and configurations',
      icon: 'settings',
      onPress: handleSettings,
      showArrow: true,
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Get help or contact support',
      icon: 'help',
      onPress: handleHelp,
      showArrow: true,
    },
    {
      id: 'about',
      title: 'About',
      subtitle: 'App version and information',
      icon: 'info',
      onPress: handleAbout,
      showArrow: true,
    },
  ];

  const renderProfileOption = (option: ProfileOption) => (
    <TouchableOpacity
      key={option.id}
      style={[
        styles.optionContainer,
        {
          backgroundColor: theme.colors.card,
          borderBottomColor: theme.colors.border,
        },
      ]}
      onPress={option.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.optionLeft}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.love + '20' }]}>
          <Icon name={option.icon} size={24} color={theme.colors.love} />
        </View>
        <View style={styles.optionTextContainer}>
          <Text style={[styles.optionTitle, { color: theme.colors.text }]}>
            {option.title}
          </Text>
          {option.subtitle && (
            <Text style={[styles.optionSubtitle, { color: theme.colors.textSecondary }]}>
              {option.subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.optionRight}>
        {option.rightElement || (
          option.showArrow && (
            <Icon name="chevron-right" size={24} color={theme.colors.textSecondary} />
          )
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: theme.colors.card }]}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: user?.photoURL ||
                  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
              }}
              style={styles.profileImage}
            />
            <TouchableOpacity
              style={[styles.editImageButton, { backgroundColor: theme.colors.love }]}
              onPress={() => Alert.alert('Photo Upload', 'Photo upload feature coming soon!')}
            >
              <Icon name="camera-alt" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.profileName, { color: theme.colors.text }]}>
            {user?.displayName || 'Love Connect User'}
          </Text>
          <Text style={[styles.profileEmail, { color: theme.colors.textSecondary }]}>
            {user?.email || 'user@loveconnect.com'}
          </Text>
          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.love }]}>127</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Matches</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.love }]}>45</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Chats</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.love }]}>12</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Calls</Text>
            </View>
          </View>
        </View>

        {/* Profile Options */}
        <View style={styles.optionsContainer}>
          {profileOptions.map(renderProfileOption)}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <LoveButton
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            style={[styles.logoutButton, { borderColor: '#ff4444' }]}
            textStyle={{ color: '#ff4444' }}
          />
        </View>

        {/* App Version */}
        <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>
          Love Connect v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    marginBottom: 20,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  optionsContainer: {
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  optionRight: {
    marginLeft: 12,
  },
  logoutContainer: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  logoutButton: {
    backgroundColor: 'transparent',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 20,
    marginBottom: 20,
  },
});

export default ProfileScreen;
