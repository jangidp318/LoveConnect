import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from '../../components/icons/IconRegistry';
import { useTheme } from '../../store/themeStore';
import callManager, { CallRecord } from '../../services/callManager';
import { CallType } from '../../services/WebRTCService';

const CallsListScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCalls();
    
    // Listen for call ended events to update history
    const unsubscribe = callManager.onCallEnded(() => {
      loadCalls(); // Reload call history when a call ends
    });

    return () => unsubscribe();
  }, []);

  const loadCalls = async () => {
    try {
      setRefreshing(true);
      await callManager.loadCallHistory();
      const history = callManager.getCallHistory();
      setCalls(history);
    } catch (error) {
      console.error('Failed to load call history:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCalls();
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCallIcon = (call: CallRecord) => {
    if (call.type === 'missed') {
      return { name: 'call-missed', color: '#ff4444' };
    } else if (call.type === 'incoming') {
      return { name: 'call-received', color: '#4CAF50' };
    } else {
      return { name: 'call-made', color: theme.colors.textSecondary };
    }
  };

  const handleCallPress = (call: CallRecord) => {
    Alert.alert(
      'Make Call',
      `Call ${call.contactName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Audio Call',
          onPress: () => startCall(call, 'audio'),
        },
        {
          text: 'Video Call',
          onPress: () => startCall(call, 'video'),
        },
      ]
    );
  };

  const handleCallBack = (call: CallRecord) => {
    startCall(call, call.callType);
  };

  const startCall = async (call: CallRecord, type: CallType) => {
    try {
      // Check if already in a call
      if (callManager.isInCall()) {
        Alert.alert(
          'Call in Progress', 
          'Please end the current call before starting a new one.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Force End Current Call', 
              style: 'destructive',
              onPress: async () => {
                try {
                  await callManager.forceCleanup();
                  // Retry starting the call
                  setTimeout(() => startCall(call, type), 500);
                } catch (error) {
                  console.error('Failed to force cleanup:', error);
                  Alert.alert('Error', 'Unable to clear call state. Please restart the app.');
                }
              }
            }
          ]
        );
        return;
      }

      // Start the call
      await callManager.startCall(
        [call.contactId],
        type,
        [{
          id: call.contactId,
          name: call.contactName,
          avatar: call.contactAvatar,
        }]
      );

      // Navigate to the appropriate call screen
      if (type === 'video') {
        navigation.navigate('VideoCall', {
          callId: 'temp_call_id',
          isIncoming: false,
          userId: call.contactId,
          userName: call.contactName,
          userAvatar: call.contactAvatar,
          callType: type,
        });
      } else {
        navigation.navigate('AudioCall', {
          callId: 'temp_call_id',
          isIncoming: false,
          userId: call.contactId,
          userName: call.contactName,
          userAvatar: call.contactAvatar,
          callType: type,
        });
      }
    } catch (error) {
      console.error('Failed to start call:', error);
      Alert.alert('Call Failed', 'Unable to start the call. Please try again.');
    }
  };

  const renderCallItem = ({ item: call }: { item: CallRecord }) => {
    const callIcon = getCallIcon(call);

    return (
      <TouchableOpacity
        style={[
          styles.callItem,
          {
            backgroundColor: theme.colors.card,
            borderBottomColor: theme.colors.border,
          },
        ]}
        onPress={() => handleCallPress(call)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: call.contactAvatar }} style={styles.avatar} />
        
        <View style={styles.callInfo}>
          <View style={styles.callHeader}>
            <Text style={[styles.contactName, { color: theme.colors.text }]}>
              {call.contactName}
            </Text>
            <View style={styles.callMeta}>
              <Icon
                name={callIcon.name}
                size={16}
                color={callIcon.color}
                style={styles.callDirectionIcon}
              />
              <Icon
                name={call.callType === 'video' ? 'videocam' : 'phone'}
                size={14}
                color={theme.colors.textSecondary}
              />
            </View>
          </View>
          
          <View style={styles.callDetails}>
            <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
              {formatTime(call.timestamp)}
            </Text>
            {call.duration && (
              <Text style={[styles.duration, { color: theme.colors.textSecondary }]}>
                • {formatDuration(call.duration)}
              </Text>
            )}
            {call.type === 'missed' && (
              <Text style={[styles.missedLabel, { color: '#ff4444' }]}>
                • Missed
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.callButton, { backgroundColor: theme.colors.love }]}
          onPress={() => handleCallBack(call)}
        >
          <Icon
            name={call.callType === 'video' ? 'videocam' : 'phone'}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="call" size={64} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No calls yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        Your call history will appear here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={calls}
        keyExtractor={(item) => item.id}
        renderItem={renderCallItem}
        contentContainerStyle={calls.length === 0 ? styles.emptyContainer : undefined}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.love}
            colors={[theme.colors.love]}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  callItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  callInfo: {
    flex: 1,
  },
  callHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  callMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callDirectionIcon: {
    marginRight: 4,
  },
  callDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 14,
  },
  duration: {
    fontSize: 14,
    marginLeft: 4,
  },
  missedLabel: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default CallsListScreen;
