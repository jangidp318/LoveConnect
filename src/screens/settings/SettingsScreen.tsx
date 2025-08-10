import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/icons/IconRegistry';
import { useTheme } from '../../store/themeStore';
import { useNavigation } from '@react-navigation/native';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'toggle' | 'action' | 'navigation';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  rightElement?: React.ReactNode;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

const SettingsScreen: React.FC = () => {
  const { theme, isDarkMode, isSystemTheme, toggleTheme, enableSystemTheme, disableSystemTheme } = useTheme();
  const navigation = useNavigation();
  
  // Settings state
  const [pushNotifications, setPushNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [matchNotifications, setMatchNotifications] = useState(true);
  const [likeNotifications, setLikeNotifications] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showDistance, setShowDistance] = useState(true);
  const [discoverable, setDiscoverable] = useState(true);
  const [autoPlayVideos, setAutoPlayVideos] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Check out Love Connect - the best dating app to find your perfect match! 💕',
        url: 'https://loveconnect.app', // Replace with actual app store URL
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleRateApp = () => {
    // Replace with actual app store URL
    const appStoreUrl = 'https://apps.apple.com/app/love-connect';
    Linking.openURL(appStoreUrl).catch(() => {
      Alert.alert('Error', 'Unable to open App Store');
    });
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Choose how you\'d like to contact us:',
      [
        {
          text: 'Email',
          onPress: () => Linking.openURL('mailto:support@loveconnect.app'),
        },
        {
          text: 'Website',
          onPress: () => Linking.openURL('https://loveconnect.app/support'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://loveconnect.app/privacy').catch(() => {
      Alert.alert('Error', 'Unable to open Privacy Policy');
    });
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://loveconnect.app/terms').catch(() => {
      Alert.alert('Error', 'Unable to open Terms of Service');
    });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone and will remove all your matches, messages, and profile data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Account Deletion',
              'Account deletion feature will be implemented soon. Please contact support for assistance.',
            );
          },
        },
      ]
    );
  };

  const settingSections: SettingSection[] = [
    {
      title: 'Appearance',
      items: [
        {
          id: 'dark_mode',
          title: 'Dark Mode',
          subtitle: isSystemTheme ? 'Following system setting' : (isDarkMode ? 'Dark theme enabled' : 'Light theme enabled'),
          icon: 'dark-mode',
          type: 'toggle',
          value: isDarkMode,
          onToggle: toggleTheme,
        },
        {
          id: 'system_theme',
          title: 'Follow System',
          subtitle: 'Automatically adapt to system appearance',
          icon: 'brightness-auto',
          type: 'toggle',
          value: isSystemTheme,
          onToggle: (value: boolean) => value ? enableSystemTheme() : disableSystemTheme(),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'push_notifications',
          title: 'Push Notifications',
          subtitle: 'Receive notifications on your device',
          icon: 'notifications',
          type: 'toggle',
          value: pushNotifications,
          onToggle: setPushNotifications,
        },
        {
          id: 'message_notifications',
          title: 'New Messages',
          subtitle: 'Get notified about new messages',
          icon: 'message',
          type: 'toggle',
          value: messageNotifications,
          onToggle: setMessageNotifications,
        },
        {
          id: 'match_notifications',
          title: 'New Matches',
          subtitle: 'Get notified about new matches',
          icon: 'favorite',
          type: 'toggle',
          value: matchNotifications,
          onToggle: setMatchNotifications,
        },
        {
          id: 'like_notifications',
          title: 'Likes',
          subtitle: 'Get notified when someone likes you',
          icon: 'thumb-up',
          type: 'toggle',
          value: likeNotifications,
          onToggle: setLikeNotifications,
        },
        {
          id: 'email_notifications',
          title: 'Email Notifications',
          subtitle: 'Receive notifications via email',
          icon: 'email',
          type: 'toggle',
          value: emailNotifications,
          onToggle: setEmailNotifications,
        },
      ],
    },
    {
      title: 'Privacy & Discovery',
      items: [
        {
          id: 'show_online_status',
          title: 'Show Online Status',
          subtitle: 'Let others see when you\'re online',
          icon: 'visibility',
          type: 'toggle',
          value: showOnlineStatus,
          onToggle: setShowOnlineStatus,
        },
        {
          id: 'show_distance',
          title: 'Show Distance',
          subtitle: 'Display your distance to other users',
          icon: 'location-on',
          type: 'toggle',
          value: showDistance,
          onToggle: setShowDistance,
        },
        {
          id: 'discoverable',
          title: 'Discoverable',
          subtitle: 'Allow others to find your profile',
          icon: 'search',
          type: 'toggle',
          value: discoverable,
          onToggle: setDiscoverable,
        },
      ],
    },
    {
      title: 'App Preferences',
      items: [
        {
          id: 'auto_play_videos',
          title: 'Auto-play Videos',
          subtitle: 'Automatically play videos in profiles',
          icon: 'play-circle-outline',
          type: 'toggle',
          value: autoPlayVideos,
          onToggle: setAutoPlayVideos,
        },
        {
          id: 'haptic_feedback',
          title: 'Haptic Feedback',
          subtitle: 'Feel vibrations for app interactions',
          icon: 'vibration',
          type: 'toggle',
          value: hapticFeedback,
          onToggle: setHapticFeedback,
        },
      ],
    },
    {
      title: 'Support & Feedback',
      items: [
        {
          id: 'share_app',
          title: 'Share Love Connect',
          subtitle: 'Invite friends to join the app',
          icon: 'share',
          type: 'action',
          onPress: handleShareApp,
        },
        {
          id: 'rate_app',
          title: 'Rate App',
          subtitle: 'Leave a review on the App Store',
          icon: 'star-rate',
          type: 'action',
          onPress: handleRateApp,
        },
        {
          id: 'contact_support',
          title: 'Contact Support',
          subtitle: 'Get help or report issues',
          icon: 'help-outline',
          type: 'action',
          onPress: handleContactSupport,
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          id: 'privacy_policy',
          title: 'Privacy Policy',
          subtitle: 'Learn how we protect your data',
          icon: 'privacy-tip',
          type: 'action',
          onPress: handlePrivacyPolicy,
        },
        {
          id: 'terms_of_service',
          title: 'Terms of Service',
          subtitle: 'Read our terms and conditions',
          icon: 'description',
          type: 'action',
          onPress: handleTermsOfService,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'delete_account',
          title: 'Delete Account',
          subtitle: 'Permanently delete your account',
          icon: 'delete-forever',
          type: 'action',
          onPress: handleDeleteAccount,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    const rightElement = (() => {
      if (item.type === 'toggle') {
        return (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: theme.colors.border, true: theme.colors.love }}
            thumbColor={item.value ? '#fff' : '#f4f3f4'}
          />
        );
      } else if (item.type === 'action' || item.type === 'navigation') {
        return (
          <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
        );
      }
      return item.rightElement;
    })();

    const iconColor = item.id === 'delete_account' ? '#ff4444' : theme.colors.love;
    const titleColor = item.id === 'delete_account' ? '#ff4444' : theme.colors.text;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.settingItem,
          {
            backgroundColor: theme.colors.card,
            borderBottomColor: theme.colors.border,
          },
        ]}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={styles.settingLeft}>
          <View style={[styles.settingIconContainer, { backgroundColor: iconColor + '20' }]}>
            <Icon name={item.icon} size={22} color={iconColor} />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingTitle, { color: titleColor }]}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
                {item.subtitle}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.settingRight}>
          {rightElement}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSection = (section: SettingSection) => (
    <View key={section.title} style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {section.title}
      </Text>
      <View style={[styles.sectionContainer, { backgroundColor: theme.colors.card }]}>
        {section.items.map((item, index) => (
          <View key={item.id}>
            {renderSettingItem(item)}
            {index < section.items.length - 1 && (
              <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
            )}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Settings
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {settingSections.map(renderSection)}
        
        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>
            Love Connect v1.0.0
          </Text>
          <Text style={[styles.buildText, { color: theme.colors.textSecondary }]}>
            Build 2024.01.10
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginHorizontal: 20,
  },
  sectionContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  settingRight: {
    marginLeft: 12,
  },
  separator: {
    height: 1,
    marginLeft: 68,
  },
  versionContainer: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 10,
  },
  versionText: {
    fontSize: 14,
    marginBottom: 4,
  },
  buildText: {
    fontSize: 12,
  },
});

export default SettingsScreen;
