// Push Notification Service
// Handle FCM push notifications, local notifications, and notification management

import AsyncStorage from '@react-native-async-storage/async-storage';
// Note: In production, you would install and import these packages:
// import messaging from '@react-native-firebase/messaging';
// import PushNotification from 'react-native-push-notification';
// import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export interface PushNotificationToken {
  token: string;
  platform: 'ios' | 'android';
  updatedAt: Date;
}

export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
  data?: { [key: string]: any };
  imageUrl?: string;
  sound?: string;
  badge?: number;
  category?: string;
  threadId?: string;
}

export interface LocalNotification {
  id: string;
  title: string;
  body: string;
  data?: { [key: string]: any };
  scheduleDate?: Date;
  repeatType?: 'minute' | 'hour' | 'day' | 'week' | 'month';
  soundName?: string;
  playSound?: boolean;
  vibrate?: boolean;
  lights?: boolean;
  category?: string;
}

export interface NotificationAction {
  id: string;
  title: string;
  icon?: string;
  foreground?: boolean;
  destructive?: boolean;
  authenticationRequired?: boolean;
}

export interface NotificationCategory {
  id: string;
  actions: NotificationAction[];
  hiddenPreviewsBodyPlaceholder?: string;
  summaryFormat?: string;
}

export interface NotificationPermissionStatus {
  hasPermission: boolean;
  status: 'granted' | 'denied' | 'not-determined' | 'provisional';
  settings: {
    alert: boolean;
    badge: boolean;
    sound: boolean;
    criticalAlert: boolean;
    provisional: boolean;
    lockScreen: boolean;
    notificationCenter: boolean;
  };
}

class PushNotificationService {
  private token: string | null = null;
  private isInitialized: boolean = false;
  private messageHandlers: ((payload: NotificationPayload) => void)[] = [];
  private tokenHandlers: ((token: string) => void)[] = [];
  private backgroundMessageHandler: ((payload: NotificationPayload) => void) | null = null;
  
  // Initialize the push notification service
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('Push notification permissions denied');
        return false;
      }

      // Initialize local notifications
      this.initializeLocalNotifications();

      // Initialize FCM (Firebase Cloud Messaging)
      await this.initializeFCM();

      // Set up notification categories
      await this.setupNotificationCategories();

      // Load saved token
      await this.loadSavedToken();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize push notification service:', error);
      return false;
    }
  }

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    try {
      // Mock implementation - in production use react-native-permissions
      // const result = await request(Platform.OS === 'ios' ? PERMISSIONS.IOS.NOTIFICATIONS : PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
      // return result === RESULTS.GRANTED;
      
      // For now, simulate permission granted
      return true;
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return false;
    }
  }

  // Get current permission status
  async getPermissionStatus(): Promise<NotificationPermissionStatus> {
    try {
      // Mock implementation - in production use messaging().hasPermission() and getNotificationSettings()
      return {
        hasPermission: true,
        status: 'granted',
        settings: {
          alert: true,
          badge: true,
          sound: true,
          criticalAlert: false,
          provisional: false,
          lockScreen: true,
          notificationCenter: true,
        },
      };
    } catch (error) {
      console.error('Failed to get permission status:', error);
      return {
        hasPermission: false,
        status: 'denied',
        settings: {
          alert: false,
          badge: false,
          sound: false,
          criticalAlert: false,
          provisional: false,
          lockScreen: false,
          notificationCenter: false,
        },
      };
    }
  }

  // Get FCM token
  async getToken(): Promise<string | null> {
    try {
      if (this.token) return this.token;

      // Mock implementation - in production use messaging().getToken()
      // const token = await messaging().getToken();
      const token = `mock_fcm_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.token = token;
      await this.saveToken(token);
      
      // Notify token handlers
      this.tokenHandlers.forEach(handler => handler(token));
      
      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  // Register for token updates
  onTokenRefresh(handler: (token: string) => void): () => void {
    this.tokenHandlers.push(handler);
    
    // Mock token refresh - in production use messaging().onTokenRefresh()
    setTimeout(() => {
      if (this.token) {
        handler(this.token);
      }
    }, 1000);
    
    return () => {
      this.tokenHandlers = this.tokenHandlers.filter(h => h !== handler);
    };
  }

  // Handle foreground messages
  onMessage(handler: (payload: NotificationPayload) => void): () => void {
    this.messageHandlers.push(handler);
    
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  // Handle background messages
  setBackgroundMessageHandler(handler: (payload: NotificationPayload) => void): void {
    this.backgroundMessageHandler = handler;
    
    // Mock implementation - in production use messaging().setBackgroundMessageHandler()
    console.log('Background message handler set');
  }

  // Send local notification
  async sendLocalNotification(notification: LocalNotification): Promise<boolean> {
    try {
      // Mock implementation - in production use PushNotification.localNotification()
      console.log('Sending local notification:', notification);
      
      // Simulate notification display
      setTimeout(() => {
        const payload: NotificationPayload = {
          id: notification.id,
          title: notification.title,
          body: notification.body,
          data: notification.data,
        };
        
        this.messageHandlers.forEach(handler => handler(payload));
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Failed to send local notification:', error);
      return false;
    }
  }

  // Schedule local notification
  async scheduleLocalNotification(notification: LocalNotification): Promise<boolean> {
    try {
      if (!notification.scheduleDate) {
        throw new Error('Schedule date is required for scheduled notifications');
      }

      // Mock implementation - in production use PushNotification.localNotificationSchedule()
      console.log('Scheduling local notification:', notification);
      
      // Store scheduled notification
      await this.saveScheduledNotification(notification);
      
      return true;
    } catch (error) {
      console.error('Failed to schedule local notification:', error);
      return false;
    }
  }

  // Cancel local notification
  async cancelLocalNotification(notificationId: string): Promise<boolean> {
    try {
      // Mock implementation - in production use PushNotification.cancelLocalNotifications()
      console.log('Cancelling local notification:', notificationId);
      
      await this.removeScheduledNotification(notificationId);
      
      return true;
    } catch (error) {
      console.error('Failed to cancel local notification:', error);
      return false;
    }
  }

  // Cancel all local notifications
  async cancelAllLocalNotifications(): Promise<boolean> {
    try {
      // Mock implementation - in production use PushNotification.cancelAllLocalNotifications()
      console.log('Cancelling all local notifications');
      
      await AsyncStorage.removeItem('love_connect_scheduled_notifications');
      
      return true;
    } catch (error) {
      console.error('Failed to cancel all local notifications:', error);
      return false;
    }
  }

  // Get delivered notifications (iOS only)
  async getDeliveredNotifications(): Promise<NotificationPayload[]> {
    try {
      // Mock implementation - in production use PushNotification.getDeliveredNotifications() for iOS
      return [];
    } catch (error) {
      console.error('Failed to get delivered notifications:', error);
      return [];
    }
  }

  // Remove delivered notifications
  async removeDeliveredNotifications(notificationIds: string[]): Promise<boolean> {
    try {
      // Mock implementation - in production use PushNotification.removeDeliveredNotifications()
      console.log('Removing delivered notifications:', notificationIds);
      return true;
    } catch (error) {
      console.error('Failed to remove delivered notifications:', error);
      return false;
    }
  }

  // Set badge count (iOS only)
  async setBadgeCount(count: number): Promise<boolean> {
    try {
      // Mock implementation - in production use PushNotification.setApplicationIconBadgeNumber()
      console.log('Setting badge count:', count);
      return true;
    } catch (error) {
      console.error('Failed to set badge count:', error);
      return false;
    }
  }

  // Get badge count (iOS only)
  async getBadgeCount(): Promise<number> {
    try {
      // Mock implementation - in production use PushNotification.getApplicationIconBadgeNumber()
      return 0;
    } catch (error) {
      console.error('Failed to get badge count:', error);
      return 0;
    }
  }

  // Create notification channel (Android only)
  async createNotificationChannel(channelId: string, channelName: string, options?: {
    description?: string;
    importance?: 'default' | 'high' | 'low' | 'min';
    enableLights?: boolean;
    enableVibration?: boolean;
    soundName?: string;
    showBadge?: boolean;
  }): Promise<boolean> {
    try {
      // Mock implementation - in production use PushNotification.createChannel()
      console.log('Creating notification channel:', channelId, channelName, options);
      return true;
    } catch (error) {
      console.error('Failed to create notification channel:', error);
      return false;
    }
  }

  // Subscribe to topic
  async subscribeToTopic(topic: string): Promise<boolean> {
    try {
      // Mock implementation - in production use messaging().subscribeToTopic()
      console.log('Subscribing to topic:', topic);
      return true;
    } catch (error) {
      console.error('Failed to subscribe to topic:', error);
      return false;
    }
  }

  // Unsubscribe from topic
  async unsubscribeFromTopic(topic: string): Promise<boolean> {
    try {
      // Mock implementation - in production use messaging().unsubscribeFromTopic()
      console.log('Unsubscribing from topic:', topic);
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from topic:', error);
      return false;
    }
  }

  // Handle notification action (iOS/Android)
  onNotificationAction(handler: (action: string, notification: NotificationPayload) => void): () => void {
    // Mock implementation - in production use appropriate handlers for notification actions
    console.log('Notification action handler registered');
    
    return () => {
      console.log('Notification action handler unregistered');
    };
  }

  // Private methods
  private async initializeFCM(): Promise<void> {
    try {
      // Mock implementation - in production:
      // await messaging().registerDeviceForRemoteMessages();
      // this.token = await messaging().getToken();
      
      console.log('FCM initialized');
    } catch (error) {
      console.error('Failed to initialize FCM:', error);
    }
  }

  private initializeLocalNotifications(): void {
    try {
      // Mock implementation - in production use PushNotification.configure()
      console.log('Local notifications initialized');
    } catch (error) {
      console.error('Failed to initialize local notifications:', error);
    }
  }

  private async setupNotificationCategories(): Promise<void> {
    try {
      const categories: NotificationCategory[] = [
        {
          id: 'MATCH_CATEGORY',
          actions: [
            {
              id: 'VIEW_MATCH',
              title: 'View Match',
              foreground: true,
            },
            {
              id: 'SEND_MESSAGE',
              title: 'Send Message',
              foreground: true,
            },
          ],
        },
        {
          id: 'MESSAGE_CATEGORY',
          actions: [
            {
              id: 'REPLY',
              title: 'Reply',
              foreground: true,
            },
            {
              id: 'MARK_READ',
              title: 'Mark as Read',
              foreground: false,
            },
          ],
        },
        {
          id: 'CALL_CATEGORY',
          actions: [
            {
              id: 'ACCEPT',
              title: 'Accept',
              foreground: true,
            },
            {
              id: 'DECLINE',
              title: 'Decline',
              foreground: false,
              destructive: true,
            },
          ],
        },
      ];

      // Mock implementation - in production use PushNotification.setNotificationCategories()
      console.log('Notification categories set up:', categories);
    } catch (error) {
      console.error('Failed to setup notification categories:', error);
    }
  }

  private async loadSavedToken(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('love_connect_fcm_token');
      if (stored) {
        const tokenData: PushNotificationToken = JSON.parse(stored);
        this.token = tokenData.token;
      }
    } catch (error) {
      console.error('Failed to load saved token:', error);
    }
  }

  private async saveToken(token: string): Promise<void> {
    try {
      const tokenData: PushNotificationToken = {
        token,
        platform: 'android', // Would detect platform in production
        updatedAt: new Date(),
      };
      
      await AsyncStorage.setItem('love_connect_fcm_token', JSON.stringify(tokenData));
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  }

  private async saveScheduledNotification(notification: LocalNotification): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('love_connect_scheduled_notifications');
      const notifications = stored ? JSON.parse(stored) : [];
      
      notifications.push(notification);
      
      await AsyncStorage.setItem('love_connect_scheduled_notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to save scheduled notification:', error);
    }
  }

  private async removeScheduledNotification(notificationId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('love_connect_scheduled_notifications');
      if (!stored) return;
      
      const notifications = JSON.parse(stored);
      const filtered = notifications.filter((n: LocalNotification) => n.id !== notificationId);
      
      await AsyncStorage.setItem('love_connect_scheduled_notifications', JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove scheduled notification:', error);
    }
  }

  // Utility methods for common notification types
  async sendMatchNotification(matchName: string, matchPhoto: string): Promise<boolean> {
    return await this.sendLocalNotification({
      id: `match_${Date.now()}`,
      title: '💖 New Match!',
      body: `You and ${matchName} liked each other!`,
      data: { type: 'match', matchName, matchPhoto },
      category: 'MATCH_CATEGORY',
      playSound: true,
      vibrate: true,
    });
  }

  async sendMessageNotification(senderName: string, message: string, chatId: string): Promise<boolean> {
    return await this.sendLocalNotification({
      id: `message_${Date.now()}`,
      title: `💬 ${senderName}`,
      body: message.length > 50 ? `${message.substring(0, 50)}...` : message,
      data: { type: 'message', senderName, chatId },
      category: 'MESSAGE_CATEGORY',
      playSound: true,
      vibrate: true,
    });
  }

  async sendCallNotification(callerName: string, callType: 'audio' | 'video', callId: string): Promise<boolean> {
    return await this.sendLocalNotification({
      id: `call_${Date.now()}`,
      title: `📞 ${callType === 'video' ? 'Video' : 'Voice'} Call`,
      body: `${callerName} is calling you`,
      data: { type: 'call', callerName, callType, callId },
      category: 'CALL_CATEGORY',
      playSound: true,
      vibrate: true,
    });
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();
