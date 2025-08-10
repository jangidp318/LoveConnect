// Notifications Screen
// Display and manage user notifications

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/icons/IconRegistry';
import { useTheme } from '../../store/themeStore';
import { 
  notificationService, 
  Notification,
  NotificationPreferences 
} from '../../services/notificationService';

interface NotificationsScreenProps {
  navigation: any;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Initialize notification service and load data
    const init = async () => {
      await notificationService.initialize();
      setNotifications(notificationService.getNotifications());
      setPreferences(notificationService.getPreferences());
    };

    init();

    // Subscribe to notification changes
    const unsubscribe = notificationService.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications);
    });

    return unsubscribe;
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call to fetch new notifications
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    notificationService.markAsRead(notification.id);

    // Navigate based on notification type
    switch (notification.type) {
      case 'match':
        navigation.navigate('Matches');
        break;
      case 'message':
        if (notification.userId) {
          navigation.navigate('ChatRoom', { userId: notification.userId });
        }
        break;
      case 'like':
      case 'super_like':
        navigation.navigate('Discovery');
        break;
      case 'call':
        navigation.navigate('Calls');
        break;
      default:
        break;
    }
  };

  const handleDeleteNotification = (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => notificationService.removeNotification(notificationId),
        },
      ]
    );
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => notificationService.clearAll(),
        },
      ]
    );
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'match':
        return { name: 'heart-filled', color: theme.colors.love };
      case 'message':
        return { name: 'message-circle', color: theme.colors.primary };
      case 'like':
        return { name: 'thumbs-up', color: theme.colors.success };
      case 'super_like':
        return { name: 'star', color: '#FFD700' };
      case 'call':
        return { name: 'phone', color: theme.colors.primary };
      case 'system':
        return { name: 'info', color: theme.colors.textSecondary };
      default:
        return { name: 'bell', color: theme.colors.textSecondary };
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return timestamp.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    headerTitle: {
      fontSize: theme.typography.h2,
      fontWeight: '700',
      color: theme.colors.text,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerButton: {
      marginLeft: theme.spacing.sm,
      padding: theme.spacing.xs,
    },
    headerButtonText: {
      fontSize: theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    unreadBadge: {
      backgroundColor: theme.colors.love,
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginLeft: theme.spacing.xs,
    },
    unreadBadgeText: {
      color: 'white',
      fontSize: theme.typography.caption,
      fontWeight: '600',
    },
    scrollContent: {
      flexGrow: 1,
    },
    notificationItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    notificationItemUnread: {
      backgroundColor: theme.colors.cardSecondary,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
    },
    notificationContent: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    notificationTitle: {
      fontSize: theme.typography.body,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    notificationMessage: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    notificationTime: {
      fontSize: theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    notificationActions: {
      justifyContent: 'center',
    },
    deleteButton: {
      padding: theme.spacing.xs,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    emptyIcon: {
      marginBottom: theme.spacing.lg,
    },
    emptyTitle: {
      fontSize: theme.typography.h3,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    emptyMessage: {
      fontSize: theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    unreadDot: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.love,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>  Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.headerButton} onPress={handleMarkAllAsRead}>
              <Text style={styles.headerButtonText}>Mark All Read</Text>
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity style={styles.headerButton} onPress={handleClearAll}>
              <Text style={styles.headerButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon
              name="notifications-off"
              size={64}
              color={theme.colors.textSecondary}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyMessage}>
              When you get notifications about matches, messages, and likes, they'll appear here.
            </Text>
          </View>
        ) : (
          notifications.map((notification) => {
            const iconConfig = getNotificationIcon(notification.type);
            
            return (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.read && styles.notificationItemUnread,
                ]}
                onPress={() => handleNotificationPress(notification)}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  <Icon
                    name={iconConfig.name}
                    size={20}
                    color={iconConfig.color}
                  />
                  {!notification.read && <View style={styles.unreadDot} />}
                </View>

                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationMessage}>
                    {notification.message}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {formatTimestamp(notification.timestamp)}
                  </Text>
                </View>

                <View style={styles.notificationActions}>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteNotification(notification.id)}
                  >
                    <Icon
                      name="close"
                      size={18}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationsScreen;
