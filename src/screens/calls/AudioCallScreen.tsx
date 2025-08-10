// Audio Call Screen with WebRTC Integration
// Audio-only calling interface with real WebRTC functionality

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from '../../components/icons/IconRegistry';
import { useTheme } from '../../store/themeStore';
import callManager from '../../services/callManager';
import webrtcService, { CallSession, CallState } from '../../services/WebRTCService';
import { AppStackParamList } from '../../navigation/AppStack';

type AudioCallRouteProp = RouteProp<AppStackParamList, 'AudioCall'>;

const AudioCallScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AudioCallRouteProp>();
  const { theme } = useTheme();
  
  const [currentCall, setCurrentCall] = useState<CallSession | null>(null);
  const [callState, setCallState] = useState<CallState>('idle');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showKeypad, setShowKeypad] = useState(false);
  
  const callStartTime = useRef<Date | null>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Get current call session
    const call = callManager.getCurrentCall();
    setCurrentCall(call);
    
    if (call) {
      setCallState(call.state);
      if (call.state === 'connected') {
        startCallTimer();
      }
    }

    // Listen for call state changes
    const unsubscribe = webrtcService.onCallStateChange((state, session) => {
      setCallState(state);
      setCurrentCall(session || null);
      
      if (state === 'connected') {
        startCallTimer();
        startPulseAnimation();
      } else if (state === 'ended' || state === 'declined') {
        stopCallTimer();
        stopPulseAnimation();
        navigation.goBack();
      } else if (state === 'calling' || state === 'ringing') {
        startPulseAnimation();
      }
    });

    return () => {
      unsubscribe();
      stopCallTimer();
      stopPulseAnimation();
    };
  }, []);

  const startCallTimer = () => {
    callStartTime.current = new Date();
    durationInterval.current = setInterval(() => {
      if (callStartTime.current) {
        const duration = Math.floor((Date.now() - callStartTime.current.getTime()) / 1000);
        setCallDuration(duration);
      }
    }, 1000);
  };

  const stopCallTimer = () => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
  };

  const startPulseAnimation = () => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const handleEndCall = () => {
    Alert.alert(
      'End Call',
      'Are you sure you want to end the call?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End Call', 
          style: 'destructive', 
          onPress: async () => {
            await callManager.endCall();
            navigation.goBack();
          }
        },
      ]
    );
  };

  const handleToggleAudio = () => {
    const muted = callManager.toggleAudioMute();
    setIsAudioMuted(muted);
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerEnabled(!isSpeakerEnabled);
    // In a real implementation, this would toggle the audio route
  };

  const handleUpgradeToVideo = () => {
    Alert.alert(
      'Upgrade to Video Call',
      'Would you like to turn on your video for this call?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Turn On Video',
          onPress: () => {
            // In a real implementation, this would upgrade to video call
            navigation.replace('VideoCall', { 
              participant: currentCall?.participants[0] 
            });
          }
        },
      ]
    );
  };

  const handleToggleKeypad = () => {
    setShowKeypad(!showKeypad);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getParticipantName = (): string => {
    if (!currentCall || currentCall.participants.length === 0) {
      return 'Unknown';
    }
    
    if (currentCall.isGroup) {
      return `Group Call (${currentCall.participants.length})`;
    }
    
    return currentCall.participants[0].name;
  };

  const getParticipantAvatar = (): string | undefined => {
    if (!currentCall || currentCall.participants.length === 0) {
      return undefined;
    }
    
    return currentCall.participants[0].avatar;
  };

  const getCallStatus = (): string => {
    switch (callState) {
      case 'calling':
        return 'Calling...';
      case 'ringing':
        return 'Ringing...';
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return `Connected • ${formatDuration(callDuration)}`;
      case 'ended':
        return 'Call Ended';
      case 'declined':
        return 'Call Declined';
      default:
        return 'Unknown';
    }
  };

  const renderAvatar = () => {
    const avatar = getParticipantAvatar();
    const name = getParticipantName();
    
    return (
      <Animated.View style={[styles.avatarContainer, { transform: [{ scale: pulseAnim }] }]}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.love }]}>
            <Icon name="person" size={80} color="white" />
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Call Info */}
      <View style={styles.callInfo}>
        {renderAvatar()}
        
        <Text style={[styles.contactName, { color: theme.colors.text }]}>
          {getParticipantName()}
        </Text>
        
        <Text style={[styles.callStatus, { color: theme.colors.textSecondary }]}>
          {getCallStatus()}
        </Text>
        
        {callState === 'connected' && (
          <View style={styles.callIndicators}>
            {isAudioMuted && (
              <View style={[styles.indicator, { backgroundColor: '#f44336' }]}>
                <Icon name="mic-off" size={16} color="white" />
                <Text style={styles.indicatorText}>Muted</Text>
              </View>
            )}
            
            {isSpeakerEnabled && (
              <View style={[styles.indicator, { backgroundColor: theme.colors.love }]}>
                <Icon name="volume-up" size={16} color="white" />
                <Text style={styles.indicatorText}>Speaker</Text>
              </View>
            )}
          </View>
        )}
      </View>
      
      {/* Secondary Actions - only show when connected */}
      {callState === 'connected' && (
        <View style={styles.secondaryActions}>
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={handleUpgradeToVideo}
          >
            <Icon name="videocam" size={24} color={theme.colors.love} />
            <Text style={[styles.secondaryButtonText, { color: theme.colors.love }]}>Video</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.secondaryButton, showKeypad && styles.activeSecondaryButton]} 
            onPress={handleToggleKeypad}
          >
            <Icon name="dialpad" size={24} color={showKeypad ? 'white' : theme.colors.love} />
            <Text style={[styles.secondaryButtonText, { color: showKeypad ? 'white' : theme.colors.love }]}>Keypad</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Main Call Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.controlButton, isAudioMuted && styles.mutedButton]} 
          onPress={handleToggleAudio}
        >
          <Icon 
            name={isAudioMuted ? "mic-off" : "mic"} 
            size={32} 
            color="white" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, styles.endCallButton]} 
          onPress={handleEndCall}
        >
          <Icon name="call-end" size={32} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, isSpeakerEnabled && styles.speakerButton]} 
          onPress={handleToggleSpeaker}
        >
          <Icon 
            name={isSpeakerEnabled ? "volume-up" : "volume-down"} 
            size={32} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 100,
  },
  callInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 40,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  avatarPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactName: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  callStatus: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  callIndicators: {
    flexDirection: 'row',
    gap: 12,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  indicatorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  controlButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  mutedButton: {
    backgroundColor: 'rgba(255,68,68,0.8)',
  },
  speakerButton: {
    backgroundColor: 'rgba(52,152,219,0.8)',
  },
  endCallButton: {
    backgroundColor: '#ff4444',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 60,
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    minWidth: 80,
  },
  activeSecondaryButton: {
    backgroundColor: 'rgba(255,68,68,0.8)',
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default AudioCallScreen;
