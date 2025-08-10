// Video Call Screen with WebRTC Integration
// Full-screen video calling interface with real WebRTC functionality

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RTCView } from 'react-native-webrtc';
import Icon from '../../components/icons/IconRegistry';
import { useTheme } from '../../store/themeStore';
import callManager from '../../services/callManager';
import webrtcService, { CallSession, CallState } from '../../services/WebRTCService';
import { AppStackParamList } from '../../navigation/AppStack';

type VideoCallRouteProp = RouteProp<AppStackParamList, 'VideoCall'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const VideoCallScreenWebRTC: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<VideoCallRouteProp>();
  const { theme } = useTheme();
  
  const [currentCall, setCurrentCall] = useState<CallSession | null>(null);
  const [callState, setCallState] = useState<CallState>('idle');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  
  const callStartTime = useRef<Date | null>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const controlsTimer = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Hide status bar for immersive experience
    StatusBar.setHidden(true, 'slide');
    
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
      } else if (state === 'ended' || state === 'declined') {
        stopCallTimer();
        navigation.goBack();
      }
    });

    // Auto-hide controls after 3 seconds
    startControlsTimer();

    return () => {
      StatusBar.setHidden(false, 'slide');
      unsubscribe();
      stopCallTimer();
      clearControlsTimer();
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

  const startControlsTimer = () => {
    clearControlsTimer();
    controlsTimer.current = setTimeout(() => {
      hideControls();
    }, 3000);
  };

  const clearControlsTimer = () => {
    if (controlsTimer.current) {
      clearTimeout(controlsTimer.current);
      controlsTimer.current = null;
    }
  };

  const hideControls = () => {
    setIsControlsVisible(false);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const showControls = () => {
    setIsControlsVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      startControlsTimer();
    });
  };

  const toggleControls = () => {
    if (isControlsVisible) {
      hideControls();
    } else {
      showControls();
    }
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
    showControls();
  };

  const handleToggleVideo = () => {
    const muted = callManager.toggleVideoMute();
    setIsVideoMuted(muted);
    showControls();
  };

  const handleSwitchCamera = async () => {
    try {
      await callManager.switchCamera();
      showControls();
    } catch (error) {
      console.error('Failed to switch camera:', error);
    }
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

  const renderRemoteVideo = () => {
    const remoteStream = currentCall?.participants[0]?.stream;
    
    if (remoteStream && callState === 'connected') {
      return (
        <RTCView
          style={styles.remoteVideo}
          streamURL={remoteStream.toURL()}
          objectFit="cover"
        />
      );
    }
    
    // Show avatar and name while connecting or when video is off
    const avatar = getParticipantAvatar();
    return (
      <View style={[styles.remoteVideo, { backgroundColor: '#1a1a1a' }]}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.participantAvatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.love + '40' }]}>
            <Icon name="person" size={60} color={theme.colors.love} />
          </View>
        )}
        
        <Text style={styles.participantName}>
          {getParticipantName()}
        </Text>
        
        <Text style={styles.callStatus}>
          {callState === 'connecting' && 'Connecting...'}
          {callState === 'calling' && 'Calling...'}
          {callState === 'ringing' && 'Ringing...'}
          {callState === 'connected' && formatDuration(callDuration)}
        </Text>
      </View>
    );
  };

  const renderLocalVideo = () => {
    const localStream = currentCall?.localParticipant?.stream;
    
    if (localStream && !isVideoMuted) {
      return (
        <RTCView
          style={styles.localVideo}
          streamURL={localStream.toURL()}
          objectFit="cover"
          mirror={true}
        />
      );
    }
    
    // Show muted video placeholder
    return (
      <View style={[styles.localVideo, { backgroundColor: '#2a2a2a' }]}>
        <Icon name="videocam-off" size={24} color="white" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      
      {/* Video Container */}
      <TouchableOpacity 
        style={styles.videoContainer} 
        activeOpacity={1}
        onPress={toggleControls}
      >
        {renderRemoteVideo()}
        {renderLocalVideo()}
      </TouchableOpacity>
      
      {/* Call Controls */}
      <Animated.View 
        style={[styles.controlsContainer, { opacity: fadeAnim }]}
        pointerEvents={isControlsVisible ? 'auto' : 'none'}
      >
        <View style={styles.topControls}>
          <TouchableOpacity 
            style={styles.topControlButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.bottomControls}>
          <TouchableOpacity 
            style={[styles.controlButton, isAudioMuted && styles.mutedButton]} 
            onPress={handleToggleAudio}
          >
            <Icon 
              name={isAudioMuted ? "mic-off" : "mic"} 
              size={28} 
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
            style={[styles.controlButton, isVideoMuted && styles.mutedButton]} 
            onPress={handleToggleVideo}
          >
            <Icon 
              name={isVideoMuted ? "videocam-off" : "videocam"} 
              size={28} 
              color="white" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={handleSwitchCamera}
          >
            <Icon name="flip-camera-ios" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  remoteVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideo: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  participantAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  participantName: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  callStatus: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  controlsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  topControlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
    paddingHorizontal: 20,
    gap: 30,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mutedButton: {
    backgroundColor: 'rgba(255,68,68,0.8)',
  },
  endCallButton: {
    backgroundColor: '#ff4444',
    width: 70,
    height: 70,
    borderRadius: 35,
  },
});

export default VideoCallScreenWebRTC;
