import AudioRecorderPlayer, {
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  RecordBackType,
  PlayBackType,
} from 'react-native-audio-recorder-player';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import RNFS from 'react-native-fs';

export interface VoiceRecording {
  id: string;
  filePath: string;
  fileName: string;
  duration: number;
  timestamp: Date;
  fileSize: number;
  waveform?: number[];
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  currentTime: number;
  amplitude: number;
  filePath: string | null;
}

export interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
}

class VoiceRecordingService {
  private audioRecorderPlayer: AudioRecorderPlayer;
  private recordingState: RecordingState = {
    isRecording: false,
    isPaused: false,
    currentTime: 0,
    amplitude: 0,
    filePath: null,
  };
  private playbackState: PlaybackState = {
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1.0,
  };

  private recordingListeners: ((state: RecordingState) => void)[] = [];
  private playbackListeners: ((state: PlaybackState) => void)[] = [];

  constructor() {
    this.audioRecorderPlayer = new AudioRecorderPlayer();
    this.setupAudioRecorderPlayer();
  }

  private setupAudioRecorderPlayer() {
    this.audioRecorderPlayer.setSubscriptionDuration(0.1); // Update every 100ms
  }

  // Permission handling
  async requestAudioPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          return true;
        } else {
          Alert.alert('Permission denied', 'Audio recording requires microphone and storage permissions.');
          return false;
        }
      } catch (err) {
        console.error('Permission request error:', err);
        return false;
      }
    } else {
      return true; // iOS permissions are handled in Info.plist
    }
  }

  // Recording functions
  async startRecording(): Promise<boolean> {
    try {
      const hasPermission = await this.requestAudioPermission();
      if (!hasPermission) {
        return false;
      }

      const timestamp = new Date().getTime();
      const fileName = `voice_${timestamp}.m4a`;
      const path = Platform.select({
        ios: `${RNFS.DocumentDirectoryPath}/${fileName}`,
        android: `${RNFS.CachesDirectoryPath}/${fileName}`,
      });

      if (!path) {
        throw new Error('Could not determine file path for recording');
      }

      const audioSet = {
        AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
        AudioSourceAndroid: AudioSourceAndroidType.MIC,
        AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
        AVNumberOfChannelsKeyIOS: 2,
        AVFormatIDKeyIOS: AVEncodingOption.aac,
      };

      await this.audioRecorderPlayer.startRecorder(path, audioSet);

      this.recordingState = {
        isRecording: true,
        isPaused: false,
        currentTime: 0,
        amplitude: 0,
        filePath: path,
      };

      this.audioRecorderPlayer.addRecordBackListener((e: RecordBackType) => {
        this.recordingState = {
          ...this.recordingState,
          currentTime: e.currentPosition,
          amplitude: e.currentMetering || 0,
        };
        this.notifyRecordingListeners();
      });

      this.notifyRecordingListeners();
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
      return false;
    }
  }

  async pauseRecording(): Promise<boolean> {
    try {
      await this.audioRecorderPlayer.pauseRecorder();
      this.recordingState = {
        ...this.recordingState,
        isPaused: true,
      };
      this.notifyRecordingListeners();
      return true;
    } catch (error) {
      console.error('Error pausing recording:', error);
      return false;
    }
  }

  async resumeRecording(): Promise<boolean> {
    try {
      await this.audioRecorderPlayer.resumeRecorder();
      this.recordingState = {
        ...this.recordingState,
        isPaused: false,
      };
      this.notifyRecordingListeners();
      return true;
    } catch (error) {
      console.error('Error resuming recording:', error);
      return false;
    }
  }

  async stopRecording(): Promise<VoiceRecording | null> {
    try {
      const result = await this.audioRecorderPlayer.stopRecorder();
      this.audioRecorderPlayer.removeRecordBackListener();

      const finalState = { ...this.recordingState };
      this.recordingState = {
        isRecording: false,
        isPaused: false,
        currentTime: 0,
        amplitude: 0,
        filePath: null,
      };
      this.notifyRecordingListeners();

      if (finalState.filePath && finalState.currentTime > 1000) { // At least 1 second
        const fileInfo = await RNFS.stat(finalState.filePath);
        const fileName = finalState.filePath.split('/').pop() || 'voice_recording.m4a';
        
        const recording: VoiceRecording = {
          id: `voice_${Date.now()}`,
          filePath: finalState.filePath,
          fileName,
          duration: Math.floor(finalState.currentTime / 1000),
          timestamp: new Date(),
          fileSize: fileInfo.size,
          waveform: await this.generateWaveform(finalState.filePath),
        };

        return recording;
      } else {
        // Delete short recordings
        if (finalState.filePath) {
          await RNFS.unlink(finalState.filePath).catch(() => {});
        }
        Alert.alert('Recording Too Short', 'Please record for at least 1 second.');
        return null;
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Recording Error', 'Failed to stop recording. Please try again.');
      return null;
    }
  }

  async cancelRecording(): Promise<void> {
    try {
      await this.audioRecorderPlayer.stopRecorder();
      this.audioRecorderPlayer.removeRecordBackListener();

      const filePath = this.recordingState.filePath;
      this.recordingState = {
        isRecording: false,
        isPaused: false,
        currentTime: 0,
        amplitude: 0,
        filePath: null,
      };
      this.notifyRecordingListeners();

      // Delete the recording file
      if (filePath) {
        await RNFS.unlink(filePath).catch(() => {});
      }
    } catch (error) {
      console.error('Error canceling recording:', error);
    }
  }

  // Playback functions
  async startPlayback(filePath: string, playbackRate: number = 1.0): Promise<boolean> {
    try {
      await this.stopPlayback(); // Stop any current playback

      await this.audioRecorderPlayer.startPlayer(filePath);
      await this.audioRecorderPlayer.setSpeed(playbackRate);

      this.playbackState = {
        isPlaying: true,
        isPaused: false,
        currentTime: 0,
        duration: 0,
        playbackRate,
      };

      this.audioRecorderPlayer.addPlayBackListener((e: PlayBackType) => {
        this.playbackState = {
          ...this.playbackState,
          currentTime: e.currentPosition,
          duration: e.duration,
        };
        
        // Auto-stop when finished
        if (e.currentPosition >= e.duration) {
          this.stopPlayback();
        }
        
        this.notifyPlaybackListeners();
      });

      this.notifyPlaybackListeners();
      return true;
    } catch (error) {
      console.error('Error starting playback:', error);
      Alert.alert('Playback Error', 'Failed to play audio. Please try again.');
      return false;
    }
  }

  async pausePlayback(): Promise<boolean> {
    try {
      await this.audioRecorderPlayer.pausePlayer();
      this.playbackState = {
        ...this.playbackState,
        isPaused: true,
      };
      this.notifyPlaybackListeners();
      return true;
    } catch (error) {
      console.error('Error pausing playback:', error);
      return false;
    }
  }

  async resumePlayback(): Promise<boolean> {
    try {
      await this.audioRecorderPlayer.resumePlayer();
      this.playbackState = {
        ...this.playbackState,
        isPaused: false,
      };
      this.notifyPlaybackListeners();
      return true;
    } catch (error) {
      console.error('Error resuming playback:', error);
      return false;
    }
  }

  async stopPlayback(): Promise<void> {
    try {
      await this.audioRecorderPlayer.stopPlayer();
      this.audioRecorderPlayer.removePlayBackListener();
      
      this.playbackState = {
        isPlaying: false,
        isPaused: false,
        currentTime: 0,
        duration: 0,
        playbackRate: 1.0,
      };
      this.notifyPlaybackListeners();
    } catch (error) {
      console.error('Error stopping playback:', error);
    }
  }

  async seekTo(position: number): Promise<boolean> {
    try {
      await this.audioRecorderPlayer.seekToPlayer(position);
      this.playbackState = {
        ...this.playbackState,
        currentTime: position,
      };
      this.notifyPlaybackListeners();
      return true;
    } catch (error) {
      console.error('Error seeking:', error);
      return false;
    }
  }

  async setPlaybackSpeed(rate: number): Promise<boolean> {
    try {
      await this.audioRecorderPlayer.setSpeed(rate);
      this.playbackState = {
        ...this.playbackState,
        playbackRate: rate,
      };
      this.notifyPlaybackListeners();
      return true;
    } catch (error) {
      console.error('Error setting playback speed:', error);
      return false;
    }
  }

  // Utility functions
  private async generateWaveform(filePath: string): Promise<number[]> {
    // Simple waveform generation - in a real app, you'd use audio analysis
    const waveformPoints = 50;
    const waveform: number[] = [];
    
    for (let i = 0; i < waveformPoints; i++) {
      waveform.push(Math.random() * 100);
    }
    
    return waveform;
  }

  formatDuration(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  async getRecordingInfo(filePath: string): Promise<{ size: number; exists: boolean }> {
    try {
      const fileInfo = await RNFS.stat(filePath);
      return {
        size: fileInfo.size,
        exists: true,
      };
    } catch {
      return {
        size: 0,
        exists: false,
      };
    }
  }

  async deleteRecording(filePath: string): Promise<boolean> {
    try {
      await RNFS.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting recording:', error);
      return false;
    }
  }

  // Listener management
  addRecordingListener(listener: (state: RecordingState) => void): () => void {
    this.recordingListeners.push(listener);
    return () => {
      const index = this.recordingListeners.indexOf(listener);
      if (index > -1) {
        this.recordingListeners.splice(index, 1);
      }
    };
  }

  addPlaybackListener(listener: (state: PlaybackState) => void): () => void {
    this.playbackListeners.push(listener);
    return () => {
      const index = this.playbackListeners.indexOf(listener);
      if (index > -1) {
        this.playbackListeners.splice(index, 1);
      }
    };
  }

  private notifyRecordingListeners(): void {
    this.recordingListeners.forEach(listener => listener(this.recordingState));
  }

  private notifyPlaybackListeners(): void {
    this.playbackListeners.forEach(listener => listener(this.playbackState));
  }

  // Getters for current states
  getRecordingState(): RecordingState {
    return { ...this.recordingState };
  }

  getPlaybackState(): PlaybackState {
    return { ...this.playbackState };
  }

  // Cleanup
  cleanup(): void {
    this.stopRecording();
    this.stopPlayback();
    this.recordingListeners = [];
    this.playbackListeners = [];
  }
}

// Export singleton instance
export const voiceRecordingService = new VoiceRecordingService();
export default voiceRecordingService;
