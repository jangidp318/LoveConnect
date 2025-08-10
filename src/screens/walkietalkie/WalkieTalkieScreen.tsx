import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  FlatList,
  Image,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/icons/IconRegistry';
import { useTheme } from '../../store/themeStore';
import VoiceMessageComponent from '../../components/voice/VoiceMessageComponent';
import voiceRecordingService, { VoiceRecording } from '../../services/voiceRecordingService';

const { width, height } = Dimensions.get('window');

interface Channel {
  id: string;
  name: string;
  users: number;
  isActive: boolean;
}

interface VoiceMessage {
  id: string;
  userName: string;
  userAvatar: string;
  duration: number;
  timestamp: Date;
  recording?: VoiceRecording;
  isCurrentUser: boolean;
}

interface VoiceSettings {
  pushToTalk: boolean;
  noiseReduction: boolean;
  autoGainControl: boolean;
  echoSuppression: boolean;
  voiceActivationThreshold: number;
}

const WalkieTalkieScreen: React.FC = () => {
  const { theme } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [voiceMessages, setVoiceMessages] = useState<VoiceMessage[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    pushToTalk: true,
    noiseReduction: true,
    autoGainControl: true,
    echoSuppression: true,
    voiceActivationThreshold: 0.3,
  });
  const [pulseAnim] = useState(new Animated.Value(1));
  const [waveAnim] = useState(new Animated.Value(0));
  const [currentRecording, setCurrentRecording] = useState<VoiceRecording | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Mock channels
  const channels: Channel[] = [
    { id: '1', name: 'General', users: 12, isActive: true },
    { id: '2', name: 'Love Birds', users: 8, isActive: false },
    { id: '3', name: 'Date Night', users: 15, isActive: true },
    { id: '4', name: 'Coffee Talk', users: 23, isActive: true },
  ];

  // Mock voice messages
  const mockMessages: VoiceMessage[] = [
    {
      id: '1',
      userName: 'Sarah',
      userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      duration: 12,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isCurrentUser: false,
    },
    {
      id: '2',
      userName: 'Emily',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      duration: 8,
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      isCurrentUser: false,
    },
    {
      id: '3',
      userName: 'You',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      duration: 15,
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      isCurrentUser: true,
    },
    {
      id: '4',
      userName: 'Jessica',
      userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      duration: 25,
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isCurrentUser: false,
    },
  ];

  useEffect(() => {
    setSelectedChannel(channels[0]);
    setVoiceMessages(mockMessages);
  }, []);

  useEffect(() => {
    if (isRecording) {
      // Pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      
      // Wave animation
      const waveAnimation = Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      );
      
      pulseAnimation.start();
      waveAnimation.start();
      
      return () => {
        pulseAnimation.stop();
        waveAnimation.stop();
      };
    } else {
      pulseAnim.setValue(1);
      waveAnim.setValue(0);
    }
  }, [isRecording]);

  const handlePressIn = () => {
    if (voiceSettings.pushToTalk) {
      startRecording();
    }
  };

  const handlePressOut = () => {
    if (voiceSettings.pushToTalk && isRecording) {
      stopRecording();
    }
  };

  const handleTap = () => {
    if (!voiceSettings.pushToTalk) {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  };

  const handleLongPress = () => {
    if (!voiceSettings.pushToTalk) {
      longPressTimer.current = setTimeout(() => {
        startRecording();
      }, 500);
    }
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!voiceSettings.pushToTalk && isRecording) {
      stopRecording();
    }
  };

  const startRecording = async () => {
    setIsRecording(true);
    const success = await voiceRecordingService.startRecording();
    if (!success) {
      setIsRecording(false);
      Alert.alert('Recording Failed', 'Could not start recording. Please check permissions.');
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    const recording = await voiceRecordingService.stopRecording();
    if (recording) {
      // Add the recording to messages
      const newMessage: VoiceMessage = {
        id: `msg_${Date.now()}`,
        userName: 'You',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        duration: recording.duration,
        timestamp: new Date(),
        recording,
        isCurrentUser: true,
      };
      setVoiceMessages(prev => [newMessage, ...prev]);
      Alert.alert('Voice Message Sent', 'Your message has been sent to the channel! 📻');
    }
  };

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    Alert.alert('Channel Changed', `Switched to ${channel.name} channel`);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (minutes < 1440) {
      return `${Math.floor(minutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderChannel = ({ item: channel }: { item: Channel }) => (
    <TouchableOpacity
      style={[
        styles.channelItem,
        {
          backgroundColor: selectedChannel?.id === channel.id 
            ? theme.colors.love + '20' 
            : theme.colors.card,
          borderColor: selectedChannel?.id === channel.id 
            ? theme.colors.love 
            : theme.colors.border,
        },
      ]}
      onPress={() => handleChannelSelect(channel)}
    >
      <View style={styles.channelInfo}>
        <View style={styles.channelHeader}>
          <Text style={[
            styles.channelName, 
            { 
              color: selectedChannel?.id === channel.id 
                ? theme.colors.love 
                : theme.colors.text 
            }
          ]}>
            #{channel.name}
          </Text>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: channel.isActive ? '#4CAF50' : '#ff4444' }
          ]} />
        </View>
        <Text style={[styles.channelUsers, { color: theme.colors.textSecondary }]}>
          {channel.users} users online
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderVoiceMessage = ({ item: message }: { item: VoiceMessage }) => (
    <View style={[
      styles.voiceMessageItem,
      { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border },
      message.isCurrentUser && styles.currentUserMessage
    ]}>
      <View style={[
        styles.messageContainer,
        message.isCurrentUser && styles.currentUserContainer
      ]}>
        {!message.isCurrentUser && (
          <Image source={{ uri: message.userAvatar }} style={styles.messageAvatar} />
        )}
        
        <View style={[styles.messageContent, message.isCurrentUser && styles.currentUserContent]}>
          <View style={styles.messageHeader}>
            <Text style={[
              styles.messageUser, 
              { color: message.isCurrentUser ? '#fff' : theme.colors.text }
            ]}>
              {message.userName}
            </Text>
            <Text style={[
              styles.messageTime, 
              { color: message.isCurrentUser ? 'rgba(255,255,255,0.7)' : theme.colors.textSecondary }
            ]}>
              {formatTime(message.timestamp)}
            </Text>
          </View>
          
          {message.recording ? (
            <VoiceMessageComponent
              recording={message.recording}
              showRecordingControls={false}
              style={{
                backgroundColor: 'transparent',
                marginHorizontal: 0,
                elevation: 0,
                shadowOpacity: 0,
              }}
            />
          ) : (
            <View style={styles.legacyVoiceMessage}>
              <Icon 
                name="play-arrow" 
                size={16} 
                color={message.isCurrentUser ? '#fff' : theme.colors.love} 
              />
              <View style={[
                styles.waveform, 
                { backgroundColor: message.isCurrentUser ? 'rgba(255,255,255,0.2)' : theme.colors.love + '20' }
              ]}>
                {[...Array(8)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.waveBar,
                      { 
                        backgroundColor: message.isCurrentUser ? '#fff' : theme.colors.love,
                        height: Math.random() * 20 + 5
                      }
                    ]}
                  />
                ))}
              </View>
              <Text style={[
                styles.messageDuration, 
                { color: message.isCurrentUser ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary }
              ]}>
                {formatDuration(message.duration)}
              </Text>
            </View>
          )}
        </View>
        
        {message.isCurrentUser && (
          <Image source={{ uri: message.userAvatar }} style={styles.messageAvatar} />
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>📻 Walkie-Talkie</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Press and hold to talk
        </Text>
      </View>

      {/* Channels */}
      <View style={styles.channelsSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Channels</Text>
        <FlatList
          horizontal
          data={channels}
          keyExtractor={(item) => item.id}
          renderItem={renderChannel}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.channelsList}
        />
      </View>

      {/* Voice Messages */}
      <View style={styles.messagesSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Messages</Text>
        <FlatList
          data={voiceMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderVoiceMessage}
          showsVerticalScrollIndicator={false}
          style={styles.messagesList}
        />
      </View>

      {/* Push-to-Talk Button */}
      <View style={styles.pttSection}>
        <View style={styles.pttContainer}>
          {/* Wave Effect */}
          {isRecording && (
            <Animated.View
              style={[
                styles.waveEffect,
                {
                  opacity: waveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0],
                  }),
                  transform: [{
                    scale: waveAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 2],
                    }),
                  }],
                },
              ]}
            />
          )}
          
          <Animated.View
            style={[
              styles.pttButton,
              {
                backgroundColor: isRecording ? '#ff4444' : theme.colors.love,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
        <TouchableOpacity
          style={styles.pttTouchable}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleTap}
          onLongPress={handleLongPress}
          delayLongPress={500}
          activeOpacity={0.8}
        >
          <Icon
            name={isRecording ? 'stop' : 'mic'}
            size={48}
            color="#fff"
          />
        </TouchableOpacity>
          </Animated.View>
        </View>
        
        <Text style={[
          styles.pttLabel,
          { 
            color: isRecording ? '#ff4444' : theme.colors.textSecondary,
            fontWeight: isRecording ? '600' : 'normal'
          }
        ]}>
          {isRecording 
            ? 'Recording...' 
            : voiceSettings.pushToTalk 
              ? 'Hold to Talk' 
              : 'Tap to Talk'
          }
        </Text>
        
        {/* Voice Settings Button */}
        <TouchableOpacity
          style={[styles.settingsButton, { backgroundColor: theme.colors.card }]}
          onPress={() => setShowSettings(!showSettings)}
        >
          <Icon name="settings" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      {/* Voice Settings Panel */}
      {showSettings && (
        <View style={[styles.settingsPanel, { backgroundColor: theme.colors.card }]}>
          <ScrollView style={styles.settingsScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.settingsTitle, { color: theme.colors.text }]}>Voice Settings</Text>
            
            <View style={styles.settingItem}>
              <View>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Push to Talk</Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Hold button to record, release to send
                </Text>
              </View>
              <Switch
                value={voiceSettings.pushToTalk}
                onValueChange={(value) => setVoiceSettings(prev => ({ ...prev, pushToTalk: value }))}
                trackColor={{ false: theme.colors.border, true: theme.colors.love + '80' }}
                thumbColor={voiceSettings.pushToTalk ? theme.colors.love : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Noise Reduction</Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Reduce background noise during recording
                </Text>
              </View>
              <Switch
                value={voiceSettings.noiseReduction}
                onValueChange={(value) => setVoiceSettings(prev => ({ ...prev, noiseReduction: value }))}
                trackColor={{ false: theme.colors.border, true: theme.colors.love + '80' }}
                thumbColor={voiceSettings.noiseReduction ? theme.colors.love : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Auto Gain Control</Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Automatically adjust microphone sensitivity
                </Text>
              </View>
              <Switch
                value={voiceSettings.autoGainControl}
                onValueChange={(value) => setVoiceSettings(prev => ({ ...prev, autoGainControl: value }))}
                trackColor={{ false: theme.colors.border, true: theme.colors.love + '80' }}
                thumbColor={voiceSettings.autoGainControl ? theme.colors.love : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View>
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Echo Suppression</Text>
                <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
                  Reduce echo and feedback
                </Text>
              </View>
              <Switch
                value={voiceSettings.echoSuppression}
                onValueChange={(value) => setVoiceSettings(prev => ({ ...prev, echoSuppression: value }))}
                trackColor={{ false: theme.colors.border, true: theme.colors.love + '80' }}
                thumbColor={voiceSettings.echoSuppression ? theme.colors.love : '#f4f3f4'}
              />
            </View>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  channelsSection: {
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  channelsList: {
    paddingHorizontal: 16,
  },
  channelItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 120,
  },
  channelInfo: {
    alignItems: 'center',
  },
  channelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  channelName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 6,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  channelUsers: {
    fontSize: 12,
  },
  messagesSection: {
    flex: 1,
    paddingTop: 20,
  },
  messagesList: {
    flex: 1,
  },
  voiceMessageItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  messageAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  messageInfo: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  messageUser: {
    fontSize: 16,
    fontWeight: '600',
  },
  messageTime: {
    fontSize: 12,
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    marginRight: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flex: 1,
  },
  waveBar: {
    width: 2,
    marginHorizontal: 1,
    borderRadius: 1,
  },
  messageDuration: {
    fontSize: 12,
    minWidth: 30,
  },
  pttSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingBottom: 50,
  },
  pttContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  waveEffect: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#ff4444',
    top: -50,
    left: -50,
  },
  pttButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  pttTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pttLabel: {
    fontSize: 16,
    textAlign: 'center',
  },
  settingsButton: {
    position: 'absolute',
    top: -20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: height * 0.4,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingsScroll: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    maxWidth: width * 0.6,
  },
  currentUserMessage: {
    backgroundColor: 'transparent',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
  },
  currentUserContainer: {
    flexDirection: 'row-reverse',
  },
  currentUserContent: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 8,
  },
  legacyVoiceMessage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default WalkieTalkieScreen;
