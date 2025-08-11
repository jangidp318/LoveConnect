// Settings Service
// Handle app preferences, privacy settings, account settings, and configuration management

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppSettings {
  // Display settings
  theme: 'light' | 'dark' | 'auto';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  
  // Notification preferences
  notifications: {
    push: boolean;
    sound: boolean;
    vibration: boolean;
    newMatches: boolean;
    newMessages: boolean;
    likes: boolean;
    superLikes: boolean;
    calls: boolean;
    marketing: boolean;
    quietHours: {
      enabled: boolean;
      startTime: string; // HH:MM format
      endTime: string; // HH:MM format
    };
  };
  
  // Privacy settings
  privacy: {
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    showReadReceipts: boolean;
    showTypingIndicator: boolean;
    showDistance: boolean;
    profileVisibility: 'everyone' | 'matches' | 'premium';
    searchVisibility: boolean;
    allowProfileScreenshots: boolean;
    dataCollection: boolean;
    analytics: boolean;
  };
  
  // Discovery settings
  discovery: {
    ageRange: { min: number; max: number };
    maxDistance: number;
    showVerifiedOnly: boolean;
    showPremiumOnly: boolean;
    showOnlineOnly: boolean;
    recentlyActiveOnly: boolean;
    globalMode: boolean; // Show users worldwide
  };
  
  // Media settings
  media: {
    autoDownloadImages: 'always' | 'wifi' | 'never';
    autoDownloadVideos: 'always' | 'wifi' | 'never';
    autoPlayVideos: boolean;
    highQualityMedia: boolean;
    dataSaver: boolean;
  };
  
  // Safety settings
  safety: {
    blockScreenshots: boolean;
    hideFromContacts: boolean;
    requirePremiumToMessage: boolean;
    filterExplicitContent: boolean;
    reportAndBlock: boolean;
  };
  
  // Accessibility settings
  accessibility: {
    reduceMotion: boolean;
    highContrast: boolean;
    largeText: boolean;
    voiceOver: boolean;
    screenReader: boolean;
  };
  
  // Advanced settings
  advanced: {
    clearCacheOnExit: boolean;
    backgroundAppRefresh: boolean;
    crashReporting: boolean;
    debugMode: boolean;
  };
}

export interface AccountSettings {
  email: string;
  phoneNumber: string;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  linkedAccounts: {
    instagram: boolean;
    spotify: boolean;
    facebook: boolean;
    google: boolean;
  };
  subscription: {
    type: 'free' | 'premium' | 'premium_plus';
    validUntil?: Date;
    autoRenew: boolean;
  };
}

export interface BlockedUser {
  id: string;
  name: string;
  photo: string;
  blockedAt: Date;
  reason?: string;
}

export interface ReportedUser {
  id: string;
  name: string;
  photo: string;
  reportedAt: Date;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

class SettingsService {
  private settings: AppSettings;
  private accountSettings: AccountSettings;
  private blockedUsers: BlockedUser[] = [];
  private reportedUsers: ReportedUser[] = [];
  private listeners: ((settings: AppSettings) => void)[] = [];

  constructor() {
    // Default settings
    this.settings = this.getDefaultSettings();
    this.accountSettings = this.getDefaultAccountSettings();
  }

  // Initialize service
  async initialize(): Promise<void> {
    try {
      await this.loadSettings();
      await this.loadAccountSettings();
      await this.loadBlockedUsers();
      await this.loadReportedUsers();
    } catch (error) {
      console.error('Failed to initialize settings service:', error);
    }
  }

  // Get current app settings
  getSettings(): AppSettings {
    return { ...this.settings };
  }

  // Update app settings
  async updateSettings(updates: Partial<AppSettings>): Promise<boolean> {
    try {
      this.settings = this.deepMerge(this.settings, updates);
      await this.saveSettings();
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to update settings:', error);
      return false;
    }
  }

  // Update specific setting category
  async updateNotificationSettings(notifications: Partial<AppSettings['notifications']>): Promise<boolean> {
    return await this.updateSettings({ notifications: { ...this.settings.notifications, ...notifications } });
  }

  async updatePrivacySettings(privacy: Partial<AppSettings['privacy']>): Promise<boolean> {
    return await this.updateSettings({ privacy: { ...this.settings.privacy, ...privacy } });
  }

  async updateDiscoverySettings(discovery: Partial<AppSettings['discovery']>): Promise<boolean> {
    return await this.updateSettings({ discovery: { ...this.settings.discovery, ...discovery } });
  }

  // Get account settings
  getAccountSettings(): AccountSettings {
    return { ...this.accountSettings };
  }

  // Update account settings
  async updateAccountSettings(updates: Partial<AccountSettings>): Promise<boolean> {
    try {
      this.accountSettings = { ...this.accountSettings, ...updates };
      await this.saveAccountSettings();
      return true;
    } catch (error) {
      console.error('Failed to update account settings:', error);
      return false;
    }
  }

  // Reset settings to default
  async resetToDefaults(): Promise<boolean> {
    try {
      this.settings = this.getDefaultSettings();
      await this.saveSettings();
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to reset settings:', error);
      return false;
    }
  }

  // Export settings for backup
  exportSettings(): string {
    return JSON.stringify({
      settings: this.settings,
      accountSettings: this.accountSettings,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }, null, 2);
  }

  // Import settings from backup
  async importSettings(settingsJson: string): Promise<boolean> {
    try {
      const imported = JSON.parse(settingsJson);
      
      if (imported.settings) {
        this.settings = this.validateSettings(imported.settings);
        await this.saveSettings();
        this.notifyListeners();
      }
      
      if (imported.accountSettings) {
        this.accountSettings = { ...this.accountSettings, ...imported.accountSettings };
        await this.saveAccountSettings();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }

  // Blocked users management
  async blockUser(userId: string, name: string, photo: string, reason?: string): Promise<boolean> {
    try {
      // Check if already blocked
      if (this.blockedUsers.some(u => u.id === userId)) {
        return true;
      }

      const blockedUser: BlockedUser = {
        id: userId,
        name,
        photo,
        blockedAt: new Date(),
        reason,
      };

      this.blockedUsers.push(blockedUser);
      await this.saveBlockedUsers();
      return true;
    } catch (error) {
      console.error('Failed to block user:', error);
      return false;
    }
  }

  async unblockUser(userId: string): Promise<boolean> {
    try {
      const index = this.blockedUsers.findIndex(u => u.id === userId);
      if (index === -1) return false;

      this.blockedUsers.splice(index, 1);
      await this.saveBlockedUsers();
      return true;
    } catch (error) {
      console.error('Failed to unblock user:', error);
      return false;
    }
  }

  getBlockedUsers(): BlockedUser[] {
    return [...this.blockedUsers];
  }

  isUserBlocked(userId: string): boolean {
    return this.blockedUsers.some(u => u.id === userId);
  }

  // Reported users management
  async reportUser(userId: string, name: string, photo: string, reason: string): Promise<boolean> {
    try {
      const reportedUser: ReportedUser = {
        id: this.generateId(),
        name,
        photo,
        reportedAt: new Date(),
        reason,
        status: 'pending',
      };

      this.reportedUsers.push(reportedUser);
      await this.saveReportedUsers();
      
      // Also block the user automatically
      await this.blockUser(userId, name, photo, `Reported: ${reason}`);
      
      return true;
    } catch (error) {
      console.error('Failed to report user:', error);
      return false;
    }
  }

  getReportedUsers(): ReportedUser[] {
    return [...this.reportedUsers];
  }

  // Data management
  async clearAllData(): Promise<boolean> {
    try {
      // Clear all stored data
      await AsyncStorage.multiRemove([
        'love_connect_settings',
        'love_connect_account_settings',
        'love_connect_blocked_users',
        'love_connect_reported_users',
        'love_connect_chat_messages',
        'love_connect_matches',
        'love_connect_notifications',
        'love_connect_reels',
        'love_connect_voice_recordings',
      ]);
      
      // Reset to defaults
      this.settings = this.getDefaultSettings();
      this.accountSettings = this.getDefaultAccountSettings();
      this.blockedUsers = [];
      this.reportedUsers = [];
      
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to clear all data:', error);
      return false;
    }
  }

  async clearCache(): Promise<boolean> {
    try {
      // Clear cache data but keep user settings
      await AsyncStorage.multiRemove([
        'love_connect_cached_profiles',
        'love_connect_image_cache',
        'love_connect_temporary_data',
      ]);
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }

  // Get app info
  getAppInfo(): { version: string; buildNumber: string; platform: string } {
    return {
      version: '1.0.0',
      buildNumber: '100',
      platform: 'React Native',
    };
  }

  // Privacy compliance
  async generateDataReport(): Promise<string> {
    try {
      const report = {
        generatedAt: new Date().toISOString(),
        settings: this.settings,
        accountInfo: {
          email: this.accountSettings.email,
          joinDate: 'N/A', // Would come from auth service
          subscriptionType: this.accountSettings.subscription.type,
        },
        blockedUsers: this.blockedUsers.length,
        reportedUsers: this.reportedUsers.length,
        dataTypes: [
          'Profile information',
          'Chat messages',
          'Match history',
          'Settings and preferences',
          'Usage analytics',
          'Media files',
        ],
      };
      
      return JSON.stringify(report, null, 2);
    } catch (error) {
      console.error('Failed to generate data report:', error);
      return '';
    }
  }

  // Subscribe to settings changes
  subscribe(listener: (settings: AppSettings) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Private methods
  private getDefaultSettings(): AppSettings {
    return {
      theme: 'auto',
      language: 'en',
      fontSize: 'medium',
      notifications: {
        push: true,
        sound: true,
        vibration: true,
        newMatches: true,
        newMessages: true,
        likes: true,
        superLikes: true,
        calls: true,
        marketing: false,
        quietHours: {
          enabled: false,
          startTime: '22:00',
          endTime: '08:00',
        },
      },
      privacy: {
        showOnlineStatus: true,
        showLastSeen: true,
        showReadReceipts: true,
        showTypingIndicator: true,
        showDistance: true,
        profileVisibility: 'everyone',
        searchVisibility: true,
        allowProfileScreenshots: true,
        dataCollection: true,
        analytics: true,
      },
      discovery: {
        ageRange: { min: 18, max: 35 },
        maxDistance: 50,
        showVerifiedOnly: false,
        showPremiumOnly: false,
        showOnlineOnly: false,
        recentlyActiveOnly: false,
        globalMode: false,
      },
      media: {
        autoDownloadImages: 'wifi',
        autoDownloadVideos: 'never',
        autoPlayVideos: false,
        highQualityMedia: true,
        dataSaver: false,
      },
      safety: {
        blockScreenshots: false,
        hideFromContacts: false,
        requirePremiumToMessage: false,
        filterExplicitContent: true,
        reportAndBlock: true,
      },
      accessibility: {
        reduceMotion: false,
        highContrast: false,
        largeText: false,
        voiceOver: false,
        screenReader: false,
      },
      advanced: {
        clearCacheOnExit: false,
        backgroundAppRefresh: true,
        crashReporting: true,
        debugMode: false,
      },
    };
  }

  private getDefaultAccountSettings(): AccountSettings {
    return {
      email: '',
      phoneNumber: '',
      twoFactorEnabled: false,
      emailVerified: false,
      phoneVerified: false,
      linkedAccounts: {
        instagram: false,
        spotify: false,
        facebook: false,
        google: false,
      },
      subscription: {
        type: 'free',
        autoRenew: false,
      },
    };
  }

  private validateSettings(settings: any): AppSettings {
    // Validate and sanitize imported settings
    const defaultSettings = this.getDefaultSettings();
    return this.deepMerge(defaultSettings, settings);
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener({ ...this.settings });
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private async loadSettings(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('love_connect_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.settings = this.deepMerge(this.getDefaultSettings(), parsed);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem('love_connect_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  private async loadAccountSettings(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('love_connect_account_settings');
      if (stored) {
        this.accountSettings = { ...this.getDefaultAccountSettings(), ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load account settings:', error);
    }
  }

  private async saveAccountSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem('love_connect_account_settings', JSON.stringify(this.accountSettings));
    } catch (error) {
      console.error('Failed to save account settings:', error);
    }
  }

  private async loadBlockedUsers(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('love_connect_blocked_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.blockedUsers = parsed.map((user: any) => ({
          ...user,
          blockedAt: new Date(user.blockedAt),
        }));
      }
    } catch (error) {
      console.error('Failed to load blocked users:', error);
    }
  }

  private async saveBlockedUsers(): Promise<void> {
    try {
      await AsyncStorage.setItem('love_connect_blocked_users', JSON.stringify(this.blockedUsers));
    } catch (error) {
      console.error('Failed to save blocked users:', error);
    }
  }

  private async loadReportedUsers(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('love_connect_reported_users');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.reportedUsers = parsed.map((user: any) => ({
          ...user,
          reportedAt: new Date(user.reportedAt),
        }));
      }
    } catch (error) {
      console.error('Failed to load reported users:', error);
    }
  }

  private async saveReportedUsers(): Promise<void> {
    try {
      await AsyncStorage.setItem('love_connect_reported_users', JSON.stringify(this.reportedUsers));
    } catch (error) {
      console.error('Failed to save reported users:', error);
    }
  }
}

// Export singleton instance
export const settingsService = new SettingsService();
