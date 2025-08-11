// Notification Service
// Handle push notifications, in-app notifications, and notification preferences

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notification {
  id: string;
  type: 'match' | 'message' | 'like' | 'super_like' | 'call' | 'system';
  title: string;
  message: string;
  userId?: string;
  data?: any;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export interface NotificationPreferences {
  pushNotifications: boolean;
  newMatches: boolean;
  newMessages: boolean;
  likes: boolean;
  superLikes: boolean;
  calls: boolean;
  marketing: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

class NotificationService {
  private notifications: Notification[] = [];
  private preferences: NotificationPreferences = {
    pushNotifications: true,
    newMatches: true,
    newMessages: true,
    likes: true,
    superLikes: true,
    calls: true,
    marketing: false,
    soundEnabled: true,
    vibrationEnabled: true,
  };

  private listeners: ((notifications: Notification[]) => void)[] = [];

  // Initialize notification service
  async initialize(): Promise<void> {
    try {
      // Load saved notifications and preferences
      await this.loadNotifications();
      await this.loadPreferences();
      
      // Set up push notification handlers
      this.setupPushNotifications();
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    try {
      // This would integrate with react-native-permissions or similar
      // For now, return true as placeholder
      return true;
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }

  // Add a new notification
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false,
    };

    this.notifications.unshift(newNotification);
    this.notifyListeners();
    this.saveNotifications();

    // Show push notification if enabled
    if (this.shouldShowNotification(notification.type)) {
      this.showPushNotification(newNotification);
    }
  }

  // Mark notification as read
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
      this.saveNotifications();
    }
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.notifyListeners();
    this.saveNotifications();
  }

  // Remove notification
  removeNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.notifyListeners();
    this.saveNotifications();
  }

  // Clear all notifications
  clearAll(): void {
    this.notifications = [];
    this.notifyListeners();
    this.saveNotifications();
  }

  // Get all notifications
  getNotifications(): Notification[] {
    return this.notifications;
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // Get notifications by type
  getNotificationsByType(type: Notification['type']): Notification[] {
    return this.notifications.filter(n => n.type === type);
  }

  // Subscribe to notification changes
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Update notification preferences
  updatePreferences(newPreferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...newPreferences };
    this.savePreferences();
  }

  // Get notification preferences
  getPreferences(): NotificationPreferences {
    return this.preferences;
  }

  // Private methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      listener([...this.notifications]);
    });
  }

  private shouldShowNotification(type: Notification['type']): boolean {
    if (!this.preferences.pushNotifications) return false;

    switch (type) {
      case 'match':
        return this.preferences.newMatches;
      case 'message':
        return this.preferences.newMessages;
      case 'like':
        return this.preferences.likes;
      case 'super_like':
        return this.preferences.superLikes;
      case 'call':
        return this.preferences.calls;
      case 'system':
        return true;
      default:
        return false;
    }
  }

  private async showPushNotification(notification: Notification): Promise<void> {
    try {
      // This would integrate with react-native-push-notification or similar
      // For now, just log to console
      console.log('Push notification:', notification);
    } catch (error) {
      console.error('Failed to show push notification:', error);
    }
  }

  private setupPushNotifications(): void {
    // This would set up push notification handlers
    // Integration with FCM, APNs, etc.
  }

  private async loadNotifications(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('love_connect_notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert dates back to Date objects
        this.notifications = parsed.map((notification: any) => ({
          ...notification,
          timestamp: new Date(notification.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }

  private async saveNotifications(): Promise<void> {
    try {
      await AsyncStorage.setItem('love_connect_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  private async loadPreferences(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('love_connect_notification_preferences');
      if (stored) {
        this.preferences = { ...this.preferences, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  }

  private async savePreferences(): Promise<void> {
    try {
      await AsyncStorage.setItem('love_connect_notification_preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Helper functions for creating common notifications
export const createMatchNotification = (userName: string, userId: string): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
  type: 'match',
  title: '💖 New Match!',
  message: `You and ${userName} liked each other!`,
  userId,
  actionUrl: `/matches/${userId}`,
});

export const createMessageNotification = (userName: string, message: string, userId: string): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
  type: 'message',
  title: `💬 ${userName}`,
  message: message.length > 50 ? `${message.substring(0, 50)}...` : message,
  userId,
  actionUrl: `/chat/${userId}`,
});

export const createLikeNotification = (userName: string, userId: string): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
  type: 'like',
  title: '👍 Someone likes you!',
  message: `${userName} liked your profile`,
  userId,
  actionUrl: '/discovery',
});

export const createSuperLikeNotification = (userName: string, userId: string): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
  type: 'super_like',
  title: '⭐ Super Like!',
  message: `${userName} super liked you!`,
  userId,
  actionUrl: '/discovery',
});

export const createCallNotification = (userName: string, callType: 'audio' | 'video', userId: string): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
  type: 'call',
  title: `📞 ${callType === 'video' ? 'Video' : 'Voice'} Call`,
  message: `${userName} is calling you`,
  userId,
  data: { callType },
  actionUrl: `/call/${userId}`,
});
