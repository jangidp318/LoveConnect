import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from '../icons/IconRegistry';
import { useTheme } from '../../store/themeStore';
import voiceRecordingService, { 
  VoiceRecording, 
  RecordingState, 
  PlaybackState 
} from '../../services/voiceRecordingService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VoiceMessageComponentProps {
  recording?: VoiceRecording;
  isRecording?: boolean;
  showRecordingControls?: boolean;
  onRecordingComplete?: (recording: VoiceRecording) => void;
  onPlaybackStateChange?: (isPlaying: boolean) => void;
  style?: any;
}

const VoiceMessageComponent: React.FC<VoiceMessageComponentProps> = ({
  recording,
  isRecording: externalIsRecording,
  showRecordingControls = true,
  onRecordingComplete,
  onPlaybackStateChange,
  style,
}) => {
  const { theme } = useTheme();
  const [recordingState, setRecordingState] = useState<RecordingState>(
    voiceRecordingService.getRecordingState()
  );
  const [playbackState, setPlaybackState] = useState<PlaybackState>(
    voiceRecordingService.getPlaybackState()
  );

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const recordingUnsubscribe = voiceRecordingService.addRecordingListener(setRecordingState);
    const playbackUnsubscribe = voiceRecordingService.addPlaybackListener((state) => {
      setPlaybackState(state);
      onPlaybackStateChange?.(state.isPlaying);
    });

    return () => {
      recordingUnsubscribe();
      playbackUnsubscribe();
    };
  }, [onPlaybackStateChange]);

  // Handle recording animations
  useEffect(() => {
    const isRecording = externalIsRecording || recordingState.isRecording;
    
    if (isRecording && !recordingState.isPaused) {
      // Pulse animation
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
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
      const wave = Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      );

      pulse.start();
      wave.start();

      return () => {
        pulse.stop();
        wave.stop();
      };
    } else {
      pulseAnim.setValue(1);
      waveAnim.setValue(0);
    }
  }, [externalIsRecording, recordingState.isRecording, recordingState.isPaused]);

  // Handle playback progress animation
  useEffect(() => {
    if (recording && playbackState.isPlaying && playbackState.duration > 0) {
      const progress = playbackState.currentTime / playbackState.duration;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 100,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(0);
    }
  }, [playbackState.currentTime, playbackState.duration, playbackState.isPlaying, recording]);

  // Recording functions
  const startRecording = async () => {
    const success = await voiceRecordingService.startRecording();
    if (!success) {
      Alert.alert('Recording Failed', 'Could not start recording. Please check permissions.');
    }
  };

  const pauseRecording = async () => {
    if (recordingState.isPaused) {
      await voiceRecordingService.resumeRecording();
    } else {
      await voiceRecordingService.pauseRecording();
    }
  };

  const stopRecording = async () => {
    const recording = await voiceRecordingService.stopRecording();
    if (recording && onRecordingComplete) {
      onRecordingComplete(recording);
    }
  };

  const cancelRecording = async () => {
    await voiceRecordingService.cancelRecording();
  };

  // Playback functions
  const togglePlayback = async () => {
    if (!recording) return;

    if (playbackState.isPlaying) {
      if (playbackState.isPaused) {
        await voiceRecordingService.resumePlayback();
      } else {
        await voiceRecordingService.pausePlayback();
      }
    } else {
      await voiceRecordingService.startPlayback(recording.filePath);
    }
  };

  const stopPlayback = async () => {
    await voiceRecordingService.stopPlayback();
  };

  // Seek functionality
  const createSeekPanResponder = () => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt) => {
        if (!recording || playbackState.duration === 0) return;
        
        const waveformWidth = SCREEN_WIDTH - 120; // Adjust based on your layout
        const touchX = evt.nativeEvent.locationX;
        const progress = Math.max(0, Math.min(1, touchX / waveformWidth));
        const seekPosition = progress * playbackState.duration;
        
        voiceRecordingService.seekTo(seekPosition);
      },
    });
  };

  const seekPanResponder = createSeekPanResponder();

  // Format time for display
  const formatTime = (milliseconds: number): string => {
    return voiceRecordingService.formatDuration(milliseconds);
  };

  // Render waveform visualization
  const renderWaveform = (waveform: number[], isAnimated: boolean = false) => {
    const maxHeight = 40;
    const barWidth = 3;
    const barSpacing = 1;
    
    return (
      <View style={styles.waveformContainer} {...seekPanResponder.panHandlers}>
        {waveform.map((amplitude, index) => {
          const height = Math.max(4, (amplitude / 100) * maxHeight);
          const isActive = recording && playbackState.isPlaying && 
            (index / waveform.length) <= (playbackState.currentTime / playbackState.duration);
          
          return (
            <View
              key={index}
              style={[
                styles.waveformBar,
                {
                  width: barWidth,
                  height: height,
                  backgroundColor: isActive ? theme.colors.love : theme.colors.textSecondary,
                  marginHorizontal: barSpacing / 2,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  // Render recording controls
  const renderRecordingControls = () => {
    const isRecording = externalIsRecording || recordingState.isRecording;
    
    if (!showRecordingControls && !isRecording) {
      return null;
    }

    if (isRecording) {
      return (
        <View style={[styles.recordingContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.recordingTitle, { color: theme.colors.text }]}>
            Recording Voice Message
          </Text>
          
          <View style={styles.recordingTimeContainer}>
            <Text style={[styles.recordingTime, { color: theme.colors.love }]}>
              {formatTime(recordingState.currentTime)}
            </Text>
            {/* Amplitude visualization */}
            <View style={styles.amplitudeContainer}>
              {Array.from({ length: 20 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.amplitudeBar,
                    {
                      height: Math.max(2, (recordingState.amplitude + Math.random() * 30) / 2),
                      backgroundColor: theme.colors.love,
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.recordingButtons}>
            <TouchableOpacity
              style={[styles.recordingButton, { backgroundColor: theme.colors.textSecondary }]}
              onPress={cancelRecording}
            >
              <Icon name="close" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.recordingButton, { backgroundColor: theme.colors.warning }]}
              onPress={pauseRecording}
            >
              <Icon name={recordingState.isPaused ? "play-arrow" : "pause"} size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.recordingButton, { backgroundColor: theme.colors.success }]}
              onPress={stopRecording}
            >
              <Icon name="check" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.recordButtonContainer}>
        <TouchableOpacity
          style={[styles.recordButton, { backgroundColor: theme.colors.love }]}
          onPress={startRecording}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              styles.recordButtonInner,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Icon name="mic" size={24} color="#fff" />
          </Animated.View>
        </TouchableOpacity>
        <Text style={[styles.recordButtonLabel, { color: theme.colors.textSecondary }]}>
          Tap to record
        </Text>
      </View>
    );
  };

  // Render playback controls for existing recording
  const renderPlaybackControls = () => {
    if (!recording) {
      return null;
    }

    return (
      <View style={[styles.playbackContainer, { backgroundColor: theme.colors.card }, style]}>
        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: theme.colors.love }]}
          onPress={togglePlayback}
          activeOpacity={0.8}
        >
          <Icon
            name={
              playbackState.isPlaying && !playbackState.isPaused
                ? "pause"
                : "play-arrow"
            }
            size={20}
            color="#fff"
          />
        </TouchableOpacity>

        <View style={styles.waveformSection}>
          {recording.waveform && renderWaveform(recording.waveform)}
          
          {/* Progress indicator */}
          <Animated.View
            style={[
              styles.progressIndicator,
              {
                backgroundColor: theme.colors.love,
                left: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, SCREEN_WIDTH - 160], // Adjust based on layout
                }),
              },
            ]}
          />
        </View>

        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
            {playbackState.isPlaying
              ? formatTime(playbackState.currentTime)
              : formatTime(recording.duration * 1000)
            }
          </Text>
          
          {/* Speed control */}
          <TouchableOpacity
            style={styles.speedButton}
            onPress={() => {
              const speeds = [1.0, 1.25, 1.5, 2.0];
              const currentIndex = speeds.indexOf(playbackState.playbackRate);
              const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
              voiceRecordingService.setPlaybackSpeed(nextSpeed);
            }}
          >
            <Text style={[styles.speedText, { color: theme.colors.love }]}>
              {playbackState.playbackRate}x
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderRecordingControls()}
      {renderPlaybackControls()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  recordButtonContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  recordButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  recordButtonInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonLabel: {
    fontSize: 12,
    marginTop: 8,
  },
  recordingContainer: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recordingTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  recordingTimeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  recordingTime: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  amplitudeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 40,
    justifyContent: 'center',
  },
  amplitudeBar: {
    width: 3,
    marginHorizontal: 1,
    borderRadius: 1.5,
    minHeight: 2,
  },
  recordingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
  },
  recordingButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  playbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  waveformSection: {
    flex: 1,
    position: 'relative',
    marginRight: 12,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: 4,
  },
  waveformBar: {
    borderRadius: 1.5,
  },
  progressIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    borderRadius: 1,
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  speedButton: {
    marginTop: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  speedText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default VoiceMessageComponent;
