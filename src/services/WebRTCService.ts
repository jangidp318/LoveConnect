// Mock WebRTC Service for Development
// This is a temporary mock implementation to test UI without native dependencies

// Mock types for development
type RTCPeerConnection = any;
type MediaStream = any;
type MediaStreamTrack = any;
type RTCOfferOptions = any;
type RTCAnswerOptions = any;
type RTCIceCandidate = any;
type RTCSessionDescription = any;

// Mock InCallManager
const InCallManager = {
  setup: (options: any) => console.log('InCallManager.setup (mock)', options),
  start: (options: any) => console.log('InCallManager.start (mock)', options),
  stop: () => console.log('InCallManager.stop (mock)'),
  startRingtone: (bundleIdentifier: string) => console.log('InCallManager.startRingtone (mock)', bundleIdentifier),
  stopRingtone: () => console.log('InCallManager.stopRingtone (mock)'),
};

// Mock RTCSessionDescription and RTCIceCandidate constructors
const RTCSessionDescription = function(init: any) {
  return { type: init.type, sdp: init.sdp };
};

const RTCIceCandidate = function(init: any) {
  return { candidate: init.candidate, sdpMid: init.sdpMid, sdpMLineIndex: init.sdpMLineIndex };
};

export type CallType = 'audio' | 'video';
export type CallState = 'idle' | 'calling' | 'ringing' | 'connecting' | 'connected' | 'ended' | 'declined' | 'busy';

export interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  isAudioMuted?: boolean;
  isVideoMuted?: boolean;
  stream?: MediaStream;
}

export interface CallSession {
  id: string;
  type: CallType;
  participants: CallParticipant[];
  localParticipant: CallParticipant;
  state: CallState;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  isGroup?: boolean;
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'call-request' | 'call-accept' | 'call-decline' | 'call-end' | 'call-cancel';
  callId: string;
  fromId: string;
  toId: string | string[]; // string for 1-1, array for group
  data?: any;
  timestamp: Date;
}

class WebRTCService {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private currentCall: CallSession | null = null;
  private signalingCallbacks: ((message: SignalingMessage) => void)[] = [];
  private callStateCallbacks: ((state: CallState, session?: CallSession) => void)[] = [];
  // Mock track state persistence
  private mockAudioTrack: any = null;
  private mockVideoTrack: any = null;
  
  // STUN/TURN servers configuration
  private readonly rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      // Add your TURN servers for production
      // { urls: 'turn:your-turn-server.com', username: 'user', credential: 'pass' }
    ],
  };

  constructor() {
    this.setupInCallManager();
  }

  // Setup InCall Manager for better call experience
  private setupInCallManager() {
    // InCallManager.setup({
    //   media: 'audio',
    //   auto: false,
    //   ringback: '',
    // });
    console.log('InCallManager setup (mocked)');
  }

  // Initialize local media stream (mocked)
  async initializeMediaStream(type: CallType): Promise<MediaStream> {
    try {
      console.log('Initializing media stream for:', type);
      
      // Create persistent mock tracks
      this.mockAudioTrack = { id: 'audio-track', kind: 'audio', enabled: true, stop: () => console.log('Audio track stopped') };
      this.mockVideoTrack = { id: 'video-track', kind: 'video', enabled: true, stop: () => console.log('Video track stopped') };
      
      // Mock media stream for now
      this.localStream = { 
        id: 'mock-stream',
        getTracks: () => {
          const tracks = [this.mockAudioTrack];
          if (type === 'video') tracks.push(this.mockVideoTrack);
          return tracks;
        },
        getAudioTracks: () => [this.mockAudioTrack],
        getVideoTracks: () => type === 'video' ? [this.mockVideoTrack] : []
      } as any;
      
      // Mock call management start
      console.log('Starting call management (mocked)');

      return this.localStream;
    } catch (error) {
      console.error('Error initializing media stream:', error);
      throw new Error('Failed to access camera/microphone');
    }
  }

  // Create new peer connection (mocked)
  private createPeerConnection(participantId: string): RTCPeerConnection {
    console.log('Creating mock peer connection for:', participantId);
    
    const peerConnection = {
      createOffer: async (options: any) => ({ type: 'offer', sdp: 'mock-offer-sdp' }),
      createAnswer: async (options: any) => ({ type: 'answer', sdp: 'mock-answer-sdp' }),
      setLocalDescription: async (desc: any) => console.log('Set local description (mock)'),
      setRemoteDescription: async (desc: any) => console.log('Set remote description (mock)'),
      addTrack: (track: any, stream: any) => console.log('Add track (mock)'),
      addIceCandidate: async (candidate: any) => console.log('Add ICE candidate (mock)'),
      close: () => console.log('Close peer connection (mock)'),
      connectionState: 'connected',
      onicecandidate: null,
      ontrack: null,
      onconnectionstatechange: null
    };

    this.peerConnections.set(participantId, peerConnection);
    return peerConnection;
  }

  // Start outgoing call
  async startCall(
    participantIds: string[],
    type: CallType,
    callData: {
      callerName: string;
      callerAvatar?: string;
      participants: { id: string; name: string; avatar?: string }[];
    }
  ): Promise<CallSession> {
    try {
      // Initialize media stream
      await this.initializeMediaStream(type);

      // Create call session
      const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.currentCall = {
        id: callId,
        type,
        participants: callData.participants,
        localParticipant: {
          id: this.getCurrentUserId(),
          name: callData.callerName,
          avatar: callData.callerAvatar,
          stream: this.localStream!,
        },
        state: 'calling',
        startTime: new Date(),
        isGroup: participantIds.length > 1,
      };

      // Send call request to participants
      this.sendSignalingMessage({
        type: 'call-request',
        callId,
        fromId: this.getCurrentUserId(),
        toId: participantIds,
        data: {
          type,
          callerName: callData.callerName,
          callerAvatar: callData.callerAvatar,
          isGroup: participantIds.length > 1,
        },
        timestamp: new Date(),
      });

      // Start ringtone
      InCallManager.startRingtone('_BUNDLE_');

      this.notifyCallStateChange('calling', this.currentCall);
      return this.currentCall;

    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  }

  // Answer incoming call
  async answerCall(callId: string): Promise<void> {
    if (!this.currentCall || this.currentCall.id !== callId) {
      throw new Error('No active call to answer');
    }

    try {
      // Initialize media stream if not already done
      if (!this.localStream) {
        await this.initializeMediaStream(this.currentCall.type);
        this.currentCall.localParticipant.stream = this.localStream;
      }

      // Stop ringtone and start call audio
      InCallManager.stopRingtone();
      InCallManager.start({
        media: this.currentCall.type,
        auto: false,
      });

      // Send accept message
      this.sendSignalingMessage({
        type: 'call-accept',
        callId,
        fromId: this.getCurrentUserId(),
        toId: this.currentCall.participants[0].id, // For now, assume 1-1 call
        data: {},
        timestamp: new Date(),
      });

      // Create peer connections for all participants
      for (const participant of this.currentCall.participants) {
        if (participant.id !== this.getCurrentUserId()) {
          await this.createOfferForParticipant(participant.id);
        }
      }

      this.updateCallState('connected');

    } catch (error) {
      console.error('Error answering call:', error);
      await this.endCall();
      throw error;
    }
  }

  // Decline incoming call
  async declineCall(callId: string): Promise<void> {
    if (!this.currentCall || this.currentCall.id !== callId) {
      console.log('No matching call to decline');
      return;
    }

    console.log('Declining call:', callId);

    // Send decline message
    this.sendSignalingMessage({
      type: 'call-decline',
      callId,
      fromId: this.getCurrentUserId(),
      toId: this.currentCall.participants[0].id,
      data: {},
      timestamp: new Date(),
    });

    // Stop ringtone
    try {
      InCallManager.stopRingtone();
    } catch (error) {
      console.error('Error stopping ringtone:', error);
    }
    
    // Update state before cleanup
    this.updateCallState('declined');
    await this.cleanup();
    
    console.log('Call declined successfully');
  }

  // End active call
  async endCall(): Promise<void> {
    if (!this.currentCall) {
      console.log('No active call to end');
      return;
    }

    console.log('Ending call:', this.currentCall.id);
    const callId = this.currentCall.id;
    const currentCall = this.currentCall; // Keep reference before cleanup

    // Send end call message to all participants
    for (const participant of this.currentCall.participants) {
      if (participant.id !== this.getCurrentUserId()) {
        this.sendSignalingMessage({
          type: 'call-end',
          callId,
          fromId: this.getCurrentUserId(),
          toId: participant.id,
          data: {},
          timestamp: new Date(),
        });
      }
    }

    // Update state before cleanup
    this.updateCallState('ended');
    await this.cleanup();
    
    console.log('Call ended successfully');
  }

  // Create offer for participant
  private async createOfferForParticipant(participantId: string): Promise<void> {
    const peerConnection = this.createPeerConnection(participantId);
    
    try {
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: this.currentCall?.type === 'video',
      } as RTCOfferOptions);

      await peerConnection.setLocalDescription(offer);

      this.sendSignalingMessage({
        type: 'offer',
        callId: this.currentCall?.id || '',
        fromId: this.getCurrentUserId(),
        toId: participantId,
        data: offer,
        timestamp: new Date(),
      });

    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  // Handle incoming signaling messages
  async handleSignalingMessage(message: SignalingMessage): Promise<void> {
    console.log('Received signaling message:', message.type);

    switch (message.type) {
      case 'call-request':
        await this.handleIncomingCallRequest(message);
        break;
      
      case 'call-accept':
        await this.handleCallAccepted(message);
        break;
      
      case 'call-decline':
        await this.handleCallDeclined(message);
        break;
      
      case 'call-end':
        await this.handleCallEnded(message);
        break;
      
      case 'offer':
        await this.handleOffer(message);
        break;
      
      case 'answer':
        await this.handleAnswer(message);
        break;
      
      case 'ice-candidate':
        await this.handleIceCandidate(message);
        break;
    }
  }

  // Handle incoming call request
  private async handleIncomingCallRequest(message: SignalingMessage): Promise<void> {
    if (this.currentCall) {
      // Already in a call, send busy
      this.sendSignalingMessage({
        type: 'call-decline',
        callId: message.callId,
        fromId: this.getCurrentUserId(),
        toId: message.fromId,
        data: { reason: 'busy' },
        timestamp: new Date(),
      });
      return;
    }

    // Create incoming call session
    this.currentCall = {
      id: message.callId,
      type: message.data.type,
      participants: [{
        id: message.fromId,
        name: message.data.callerName,
        avatar: message.data.callerAvatar,
      }],
      localParticipant: {
        id: this.getCurrentUserId(),
        name: 'You', // Will be filled from user data
      },
      state: 'ringing',
      startTime: new Date(),
      isGroup: message.data.isGroup,
    };

    // Start ringtone
    InCallManager.startRingtone('_BUNDLE_');
    
    this.notifyCallStateChange('ringing', this.currentCall);
  }

  // Toggle audio mute
  toggleAudioMute(): boolean {
    if (!this.localStream || !this.mockAudioTrack) {
      console.log('No local stream or audio track available');
      return false;
    }

    // Toggle the mock audio track
    this.mockAudioTrack.enabled = !this.mockAudioTrack.enabled;
    const isNowMuted = !this.mockAudioTrack.enabled;
    
    console.log('Audio mute toggled:', isNowMuted);

    if (this.currentCall) {
      this.currentCall.localParticipant.isAudioMuted = isNowMuted;
      this.notifyCallStateChange(this.currentCall.state, this.currentCall);
    }

    return isNowMuted;
  }

  // Toggle video mute
  toggleVideoMute(): boolean {
    if (!this.localStream || !this.mockVideoTrack) {
      console.log('No local stream or video track available');
      return false;
    }

    // Toggle the mock video track
    this.mockVideoTrack.enabled = !this.mockVideoTrack.enabled;
    const isNowMuted = !this.mockVideoTrack.enabled;
    
    console.log('Video mute toggled:', isNowMuted);

    if (this.currentCall) {
      this.currentCall.localParticipant.isVideoMuted = isNowMuted;
      this.notifyCallStateChange(this.currentCall.state, this.currentCall);
    }

    return isNowMuted;
  }

  // Switch camera (front/back)
  async switchCamera(): Promise<void> {
    if (!this.localStream) return;

    const videoTracks = this.localStream.getVideoTracks();
    if (videoTracks.length > 0) {
      const videoTrack = videoTracks[0];
      // @ts-ignore
      if (videoTrack._switchCamera) {
        // @ts-ignore
        videoTrack._switchCamera();
      }
    }
  }

  // Get current call session
  getCurrentCall(): CallSession | null {
    return this.currentCall;
  }

  // Check if currently in a call
  isInCall(): boolean {
    const inCall = this.currentCall !== null && this.currentCall.state !== 'idle' && this.currentCall.state !== 'ended' && this.currentCall.state !== 'declined';
    console.log('isInCall check:', {
      hasCurrentCall: this.currentCall !== null,
      currentState: this.currentCall?.state,
      result: inCall
    });
    return inCall;
  }

  // Force cleanup - useful for ensuring clean state
  async forceCleanup(): Promise<void> {
    console.log('Force cleanup called');
    await this.cleanup();
    console.log('Force cleanup completed');
  }

  // Subscribe to signaling messages
  onSignalingMessage(callback: (message: SignalingMessage) => void): () => void {
    this.signalingCallbacks.push(callback);
    return () => {
      const index = this.signalingCallbacks.indexOf(callback);
      if (index > -1) {
        this.signalingCallbacks.splice(index, 1);
      }
    };
  }

  // Subscribe to call state changes
  onCallStateChange(callback: (state: CallState, session?: CallSession) => void): () => void {
    this.callStateCallbacks.push(callback);
    return () => {
      const index = this.callStateCallbacks.indexOf(callback);
      if (index > -1) {
        this.callStateCallbacks.splice(index, 1);
      }
    };
  }

  // Private helper methods
  private sendSignalingMessage(message: SignalingMessage): void {
    this.signalingCallbacks.forEach(callback => callback(message));
  }

  private notifyCallStateChange(state: CallState, session?: CallSession): void {
    this.callStateCallbacks.forEach(callback => callback(state, session));
  }

  private updateCallState(state: CallState): void {
    if (this.currentCall) {
      this.currentCall.state = state;
      if (state === 'ended' || state === 'declined') {
        this.currentCall.endTime = new Date();
        if (this.currentCall.startTime) {
          this.currentCall.duration = this.currentCall.endTime.getTime() - this.currentCall.startTime.getTime();
        }
      }
      this.notifyCallStateChange(state, this.currentCall);
    }
  }

  private async cleanup(): Promise<void> {
    console.log('Cleaning up WebRTC resources');
    
    // Stop ringtones and call manager
    try {
      InCallManager.stopRingtone();
      InCallManager.stop();
    } catch (error) {
      console.error('Error stopping InCallManager:', error);
    }

    // Close all peer connections
    this.peerConnections.forEach(pc => {
      try {
        pc.close();
      } catch (error) {
        console.error('Error closing peer connection:', error);
      }
    });
    this.peerConnections.clear();

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        try {
          if (track && typeof track.stop === 'function') {
            track.stop();
          }
        } catch (error) {
          console.error('Error stopping track:', error);
        }
      });
      this.localStream = null;
    }

    // Reset mock tracks
    this.mockAudioTrack = null;
    this.mockVideoTrack = null;
    this.currentCall = null;
    console.log('WebRTC cleanup completed');
  }

  private getCurrentUserId(): string {
    // Get current user ID from auth store or storage
    return 'current_user_id'; // Replace with actual implementation
  }

  // Handle other signaling message types
  private async handleCallAccepted(message: SignalingMessage): Promise<void> {
    if (this.currentCall?.id === message.callId) {
      InCallManager.stopRingtone();
      this.updateCallState('connected');
    }
  }

  private async handleCallDeclined(message: SignalingMessage): Promise<void> {
    if (this.currentCall?.id === message.callId) {
      await this.cleanup();
      this.updateCallState('declined');
    }
  }

  private async handleCallEnded(message: SignalingMessage): Promise<void> {
    if (this.currentCall?.id === message.callId) {
      await this.cleanup();
      this.updateCallState('ended');
    }
  }

  private async handleOffer(message: SignalingMessage): Promise<void> {
    const peerConnection = this.createPeerConnection(message.fromId);
    
    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(message.data));
      
      const answer = await peerConnection.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: this.currentCall?.type === 'video',
      } as RTCAnswerOptions);
      
      await peerConnection.setLocalDescription(answer);

      this.sendSignalingMessage({
        type: 'answer',
        callId: message.callId,
        fromId: this.getCurrentUserId(),
        toId: message.fromId,
        data: answer,
        timestamp: new Date(),
      });

    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  private async handleAnswer(message: SignalingMessage): Promise<void> {
    const peerConnection = this.peerConnections.get(message.fromId);
    if (peerConnection) {
      try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(message.data));
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    }
  }

  private async handleIceCandidate(message: SignalingMessage): Promise<void> {
    const peerConnection = this.peerConnections.get(message.fromId);
    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(message.data));
      } catch (error) {
        console.error('Error handling ICE candidate:', error);
      }
    }
  }

  private handleParticipantDisconnected(participantId: string): void {
    if (this.currentCall) {
      this.currentCall.participants = this.currentCall.participants.filter(p => p.id !== participantId);
      
      // If no participants left, end call
      if (this.currentCall.participants.length === 0) {
        this.endCall();
      } else {
        this.notifyCallStateChange(this.currentCall.state, this.currentCall);
      }
    }
  }
}

export default new WebRTCService();
