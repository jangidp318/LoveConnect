// Enhanced Video Call Screen
// Handle video calling functionality with advanced controls and UI

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Animated,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from '../../components/icons/IconRegistry';
import { useTheme } from '../../store/themeStore';
import { AppStackParamList } from '../../navigation/AppStack';
import callManager from '../../services/callManager';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const VideoCallScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<AppStackParamList, 'VideoCall'>>();
  const { theme } = useTheme();
  const { userId, userName, userAvatar, isIncoming = false, callType = 'video' } = route.params || {
    userId: '1',
    userName: 'Emma Wilson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b15c6e8e',
    isIncoming: false,
    callType: 'video'
  };

  const [isCallConnected, setIsCallConnected] = useState(!isIncoming);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [callQuality, setCallQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('excellent');
  const [isConnecting, setIsConnecting] = useState(isIncoming ? false : true);
  const [callStatus, setCallStatus] = useState<string>(isIncoming ? 'Incoming call...' : 'Connecting...');
  
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    StatusBar.setHidden(true, 'slide');
    
    return () => {
      StatusBar.setHidden(false, 'slide');
      // Cleanup: End any active call when component unmounts
      if (callManager.isInCall()) {
        callManager.endCall().catch(console.error);
      }
    };
  }, []);

  useEffect(() => {
    // Start call duration timer
    let timer: NodeJS.Timeout;
    if (isCallConnected) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCallConnected]);

  useEffect(() => {
    // Auto-hide controls after 5 seconds
    if (isCallConnected && showControls) {
      const timer = setTimeout(() => {
        if (showControls) {
          hideControls();
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showControls, isCallConnected]);

  useEffect(() => {
    // Pulse animation for incoming call
    if (isIncoming && !isCallConnected) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      
      return () => pulse.stop();
    }
  }, [isIncoming, isCallConnected]);

  useEffect(() => {
    // Simulate connection process
    if (isConnecting) {
      const timer = setTimeout(() => {
        setIsConnecting(false);
        if (!isIncoming) {
          setIsCallConnected(true);
          setCallStatus('Connected');
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isConnecting, isIncoming]);

  const hideControls = () => {
    Animated.timing(controlsOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowControls(false));
  };

  const showControlsHandler = () => {
    setShowControls(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerCall = async () => {
    try {
      // Answer the call through call manager
      const currentCall = callManager.getCurrentCall();
      if (currentCall) {
        await callManager.answerCall(currentCall.id);
      }
      setIsCallConnected(true);
      setCallStatus('Connected');
      pulseAnimation.stopAnimation();
    } catch (error) {
      console.error('Failed to answer call:', error);
    }
  };

  const handleEndCall = async () => {
    try {
      // End the call through call manager
      await callManager.endCall();
    } catch (error) {
      console.error('Failed to end call:', error);
    }
    navigation.goBack();
  };

  const handleDeclineCall = async () => {
    try {
      // Get current call and decline it
      const currentCall = callManager.getCurrentCall();
      if (currentCall) {
        await callManager.declineCall(currentCall.id);
      }
    } catch (error) {
      console.error('Failed to decline call:', error);
    }
    navigation.goBack();
  };

  const toggleMute = () => {
    const newMuteState = callManager.toggleAudioMute();
    setIsMuted(newMuteState);
    console.log('Mute toggled - isMuted:', newMuteState);
  };

  const toggleVideo = () => {
    const newVideoState = callManager.toggleVideoMute();
    setIsVideoEnabled(!newVideoState); // Note: videoMute returns true when muted, so we invert
    console.log('Video toggled - videoMuted:', newVideoState, 'isVideoEnabled:', !newVideoState);
  };

  const toggleSpeaker = () => {
    setIsSpeakerEnabled(!isSpeakerEnabled);
  };

  const switchCamera = async () => {
    try {
      await callManager.switchCamera();
    } catch (error) {
      console.error('Failed to switch camera:', error);
    }
  };

  const minimizeCall = () => {
    setIsMinimized(true);
    // This would implement picture-in-picture mode
  };

  const getCallQualityColor = () => {
    switch (callQuality) {
      case 'excellent': return '#4CAF50'; // green
      case 'good': return '#FF9800'; // orange
      case 'fair': return '#FF9800'; // orange
      case 'poor': return '#f44336'; // red
      default: return '#4CAF50'; // green
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    videoContainer: {
      flex: 1,
      position: 'relative',
    },
    remoteVideo: {
      flex: 1,
      backgroundColor: '#1a1a1a',
    },
    localVideoContainer: {
      position: 'absolute',
      top: 60,
      right: 20,
      width: 120,
      height: 160,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: 'white',
    },
    localVideo: {
      width: '100%',
      height: '100%',
      backgroundColor: '#2a2a2a',
    },
    avatarContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.8)',
    },
    avatar: {
      width: 200,
      height: 200,
      borderRadius: 100,
      marginBottom: 30,
    },
    avatarFallback: {
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: theme.colors.love,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 30,
    },
    avatarText: {
      fontSize: 60,
      fontWeight: '700',
      color: 'white',
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    topControls: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      paddingTop: 60,
      paddingHorizontal: 20,
      paddingBottom: 20,
      backgroundColor: 'rgba(0,0,0,0.6)',
    },
    topControlsGradient: {
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingTop: 60,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    callInfo: {
      alignItems: 'center',
    },
    userName: {
      fontSize: 24,
      fontWeight: '700',
      color: 'white',
      textAlign: 'center',
      marginBottom: 8,
    },
    callStatus: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.8)',
      textAlign: 'center',
    },
    callDuration: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.8)',
      textAlign: 'center',
    },
    qualityIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    qualityDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    qualityText: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.7)',
    },
    bottomControls: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingVertical: 40,
      paddingHorizontal: 20,
      backgroundColor: 'rgba(0,0,0,0.6)',
    },
    controlsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    controlButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    controlButtonActive: {
      backgroundColor: theme.colors.love,
    },
    controlButtonDanger: {
      backgroundColor: '#FF3B30',
    },
    endCallButton: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: '#FF3B30',
      justifyContent: 'center',
      alignItems: 'center',
    },
    incomingCallContainer: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 100,
    },
    incomingCallActions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      paddingHorizontal: 60,
    },
    answerButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#4CAF50',
      justifyContent: 'center',
      alignItems: 'center',
    },
    declineButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#FF3B30',
      justifyContent: 'center',
      alignItems: 'center',
    },
    connectingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    connectingText: {
      fontSize: 18,
      color: 'white',
      marginTop: 20,
    },
    minimizeButton: {
      position: 'absolute',
      top: 60,
      left: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  // Incoming call UI
  if (isIncoming && !isCallConnected) {
    return (
      <View style={styles.container}>
        <View style={styles.incomingCallContainer}>
          <View style={styles.avatarContainer}>
            <Animated.View style={{ transform: [{ scale: pulseAnimation }] }}>
              {userAvatar ? (
                <Image source={{ uri: userAvatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>{userName?.charAt(0) || '?'}</Text>
                </View>
              )}
            </Animated.View>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.callStatus}>Incoming {callType} call</Text>
          </View>
          
          <View style={styles.incomingCallActions}>
            <TouchableOpacity style={styles.declineButton} onPress={handleDeclineCall}>
              <Icon name="phone-off" size={32} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.answerButton} onPress={handleAnswerCall}>
              <Icon name={callType === 'video' ? 'video' : 'phone-call'} size={32} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Connecting state
  if (isConnecting) {
    return (
      <View style={styles.container}>
        <View style={styles.connectingContainer}>
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{userName?.charAt(0) || '?'}</Text>
            </View>
          )}
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.connectingText}>{callStatus}</Text>
        </View>
      </View>
    );
  }

  // Active call UI
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.videoContainer}
        activeOpacity={1}
        onPress={showControlsHandler}
      >
        {/* Remote Video or Avatar */}
        {isVideoEnabled ? (
          <View style={styles.remoteVideo}>
            {/* This would be the remote video stream */}
            <View style={{ flex: 1, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: 'white', fontSize: 16 }}>Remote Video</Text>
            </View>
          </View>
        ) : (
          <View style={styles.avatarContainer}>
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{userName?.charAt(0) || '?'}</Text>
              </View>
            )}
          </View>
        )}

        {/* Local Video */}
        {isVideoEnabled && (
          <View style={styles.localVideoContainer}>
            <View style={styles.localVideo}>
              {/* This would be the local video stream */}
              <View style={{ flex: 1, backgroundColor: '#2a2a2a', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 10 }}>You</Text>
              </View>
            </View>
          </View>
        )}

        {/* Controls Overlay */}
        {showControls && (
          <Animated.View style={[styles.overlay, { opacity: controlsOpacity }]}>
            {/* Top Controls */}
            <View style={styles.topControlsGradient}>
              <View style={styles.callInfo}>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
                <View style={styles.qualityIndicator}>
                  <View style={[styles.qualityDot, { backgroundColor: getCallQualityColor() }]} />
                  <Text style={styles.qualityText}>{callQuality} connection</Text>
                </View>
              </View>
            </View>

            {/* Minimize Button */}
            <TouchableOpacity style={styles.minimizeButton} onPress={minimizeCall}>
              <Icon name="minus" size={20} color="white" />
            </TouchableOpacity>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <View style={styles.controlsContainer}>
                {/* Mute Button */}
                <TouchableOpacity 
                  style={[styles.controlButton, isMuted && styles.controlButtonActive]} 
                  onPress={toggleMute}
                >
                  <Icon 
                    name={isMuted ? 'mic-off' : 'mic'} 
                    size={24} 
                    color="white" 
                  />
                </TouchableOpacity>

                {/* Video Toggle Button */}
                <TouchableOpacity 
                  style={[styles.controlButton, !isVideoEnabled && styles.controlButtonActive]} 
                  onPress={toggleVideo}
                >
                  <Icon 
                    name={isVideoEnabled ? 'videocam' : 'videocam-off'} 
                    size={24} 
                    color="white" 
                  />
                </TouchableOpacity>

                {/* End Call Button */}
                <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
                  <Icon name="call-end" size={32} color="white" />
                </TouchableOpacity>

                {/* Speaker Toggle Button */}
                <TouchableOpacity 
                  style={[styles.controlButton, isSpeakerEnabled && styles.controlButtonActive]} 
                  onPress={toggleSpeaker}
                >
                  <Icon 
                    name={isSpeakerEnabled ? 'volume-up' : 'volume-down'} 
                    size={24} 
                    color="white" 
                  />
                </TouchableOpacity>

                {/* Switch Camera Button */}
                {isVideoEnabled && (
                  <TouchableOpacity style={styles.controlButton} onPress={switchCamera}>
                    <Icon name="flip-camera-ios" size={24} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Animated.View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default VideoCallScreen;
