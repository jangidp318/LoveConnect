// Call Manager Service
// Coordinates WebRTC calls with signaling and call history

import webrtcService, { 
  CallSession, 
  CallState, 
  CallType, 
  SignalingMessage, 
  CallParticipant 
} from './WebRTCService';
import { useAuthStore } from '../store/authStore';

export interface CallRecord {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar?: string;
  type: 'incoming' | 'outgoing' | 'missed';
  callType: CallType;
  timestamp: Date;
  duration?: number;
  participants?: CallParticipant[];
  isGroup?: boolean;
}

export interface IncomingCall {
  id: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  type: CallType;
  isGroup?: boolean;
  participants?: CallParticipant[];
  timestamp: Date;
}

class CallManager {
  private callHistory: CallRecord[] = [];
  private incomingCallCallbacks: ((call: IncomingCall) => void)[] = [];
  private callEndedCallbacks: ((record: CallRecord) => void)[] = [];
  
  // Mock signaling server connection (replace with real WebSocket/Socket.IO connection)
  private signalingConnected = false;

  constructor() {
    this.initializeCallManager();
  }

  private initializeCallManager() {
    // Listen to WebRTC service events
    webrtcService.onSignalingMessage(this.handleSignalingMessage.bind(this));
    webrtcService.onCallStateChange(this.handleCallStateChange.bind(this));
    
    // Initialize signaling connection
    this.connectSignaling();
  }

  // Initialize signaling connection (mock implementation)
  private async connectSignaling(): Promise<void> {
    try {
      // In a real app, this would connect to your signaling server
      // For now, we'll simulate with a mock connection
      console.log('Connecting to signaling server...');
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.signalingConnected = true;
      console.log('Signaling server connected');
      
      // Register user for incoming calls
      this.registerForIncomingCalls();
      
    } catch (error) {
      console.error('Failed to connect to signaling server:', error);
      // Retry connection after 5 seconds
      setTimeout(() => this.connectSignaling(), 5000);
    }
  }

  // Register user to receive incoming calls
  private registerForIncomingCalls(): void {
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      console.log(`Registered user ${currentUser.uid} for incoming calls`);
      // In a real app, you would register with your signaling server here
    }
  }

  // Start a new call
  async startCall(
    recipientIds: string[],
    type: CallType,
    recipients: { id: string; name: string; avatar?: string }[]
  ): Promise<CallSession> {
    try {
      const currentUser = useAuthStore.getState().user;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      if (!this.signalingConnected) {
        throw new Error('Signaling server not connected');
      }

      // Start the call through WebRTC service
      const callSession = await webrtcService.startCall(recipientIds, type, {
        callerName: currentUser.displayName || 'Unknown',
        callerAvatar: currentUser.photoURL,
        participants: recipients,
      });

      // Create call record for outgoing call
      const callRecord: CallRecord = {
        id: callSession.id,
        contactId: recipients[0].id, // Primary recipient for 1-1 calls
        contactName: recipients.length === 1 ? recipients[0].name : `Group Call (${recipients.length})`,
        contactAvatar: recipients[0].avatar,
        type: 'outgoing',
        callType: type,
        timestamp: new Date(),
        participants: recipients,
        isGroup: recipients.length > 1,
      };

      // Don't add to history yet - wait for call to connect or end
      return callSession;

    } catch (error) {
      console.error('Failed to start call:', error);
      throw error;
    }
  }

  // Answer an incoming call
  async answerCall(callId: string): Promise<void> {
    try {
      await webrtcService.answerCall(callId);
    } catch (error) {
      console.error('Failed to answer call:', error);
      throw error;
    }
  }

  // Decline an incoming call
  async declineCall(callId: string): Promise<void> {
    try {
      await webrtcService.declineCall(callId);
    } catch (error) {
      console.error('Failed to decline call:', error);
      throw error;
    }
  }

  // End current call
  async endCall(): Promise<void> {
    try {
      await webrtcService.endCall();
    } catch (error) {
      console.error('Failed to end call:', error);
      throw error;
    }
  }

  // Force cleanup - useful for ensuring clean state
  async forceCleanup(): Promise<void> {
    try {
      await webrtcService.forceCleanup();
    } catch (error) {
      console.error('Failed to force cleanup:', error);
      throw error;
    }
  }

  // Toggle audio mute
  toggleAudioMute(): boolean {
    return webrtcService.toggleAudioMute();
  }

  // Toggle video mute  
  toggleVideoMute(): boolean {
    return webrtcService.toggleVideoMute();
  }

  // Switch camera
  async switchCamera(): Promise<void> {
    await webrtcService.switchCamera();
  }

  // Get current call session
  getCurrentCall(): CallSession | null {
    return webrtcService.getCurrentCall();
  }

  // Check if currently in call
  isInCall(): boolean {
    return webrtcService.isInCall();
  }

  // Get call history
  getCallHistory(): CallRecord[] {
    return [...this.callHistory].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Clear call history
  clearCallHistory(): void {
    this.callHistory = [];
  }

  // Subscribe to incoming calls
  onIncomingCall(callback: (call: IncomingCall) => void): () => void {
    this.incomingCallCallbacks.push(callback);
    return () => {
      const index = this.incomingCallCallbacks.indexOf(callback);
      if (index > -1) {
        this.incomingCallCallbacks.splice(index, 1);
      }
    };
  }

  // Subscribe to call ended events
  onCallEnded(callback: (record: CallRecord) => void): () => void {
    this.callEndedCallbacks.push(callback);
    return () => {
      const index = this.callEndedCallbacks.indexOf(callback);
      if (index > -1) {
        this.callEndedCallbacks.splice(index, 1);
      }
    };
  }

  // Handle signaling messages from WebRTC service
  private handleSignalingMessage(message: SignalingMessage): void {
    // In a real app, this would send the message to your signaling server
    console.log('Sending signaling message:', message.type);
    
    // Mock signaling - in reality, this would go through WebSocket/Socket.IO
    this.mockSignalingRelay(message);
  }

  // Mock signaling relay (replace with real signaling server)
  private async mockSignalingRelay(message: SignalingMessage): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // For testing purposes, simulate call acceptance after a few seconds
    if (message.type === 'call-request') {
      setTimeout(() => {
        // Mock auto-accept for testing
        const acceptMessage: SignalingMessage = {
          type: 'call-accept',
          callId: message.callId,
          fromId: Array.isArray(message.toId) ? message.toId[0] : message.toId,
          toId: message.fromId,
          data: {},
          timestamp: new Date(),
        };
        webrtcService.handleSignalingMessage(acceptMessage);
      }, 3000); // Auto accept after 3 seconds for testing
    }
  }

  // Handle call state changes from WebRTC service
  private handleCallStateChange(state: CallState, session?: CallSession): void {
    console.log('Call state changed:', state);

    if (!session) return;

    switch (state) {
      case 'ringing':
        this.handleIncomingCall(session);
        break;
      
      case 'connected':
        // Call connected - no history update needed yet
        break;
      
      case 'ended':
      case 'declined':
        this.handleCallEnded(session, state);
        break;
      
      case 'busy':
        this.handleCallEnded(session, 'missed');
        break;
    }
  }

  // Handle incoming call
  private handleIncomingCall(session: CallSession): void {
    const caller = session.participants[0];
    
    const incomingCall: IncomingCall = {
      id: session.id,
      callerId: caller.id,
      callerName: caller.name,
      callerAvatar: caller.avatar,
      type: session.type,
      isGroup: session.isGroup,
      participants: session.participants,
      timestamp: new Date(),
    };

    // Notify listeners
    this.incomingCallCallbacks.forEach(callback => callback(incomingCall));
  }

  // Handle call ended
  private handleCallEnded(session: CallSession, endReason: CallState): void {
    const callRecord: CallRecord = {
      id: session.id,
      contactId: session.participants[0]?.id || 'unknown',
      contactName: session.isGroup 
        ? `Group Call (${session.participants.length})` 
        : (session.participants[0]?.name || 'Unknown'),
      contactAvatar: session.participants[0]?.avatar,
      type: this.getCallRecordType(session, endReason),
      callType: session.type,
      timestamp: session.startTime || new Date(),
      duration: session.duration,
      participants: session.participants,
      isGroup: session.isGroup,
    };

    // Add to call history
    this.callHistory.push(callRecord);

    // Notify listeners
    this.callEndedCallbacks.forEach(callback => callback(callRecord));

    // Save to persistent storage
    this.saveCallHistory();
  }

  // Determine call record type based on session and end reason
  private getCallRecordType(session: CallSession, endReason: CallState): 'incoming' | 'outgoing' | 'missed' {
    const currentUserId = useAuthStore.getState().user?.uid;
    
    if (endReason === 'declined' || endReason === 'busy') {
      return 'missed';
    }

    // Check if this was an outgoing call (local user started it)
    if (session.localParticipant.id === currentUserId) {
      return 'outgoing';
    } else {
      return 'incoming';
    }
  }

  // Save call history to persistent storage
  private async saveCallHistory(): Promise<void> {
    try {
      // In a real app, save to AsyncStorage or secure storage
      console.log('Call history saved:', this.callHistory.length, 'records');
    } catch (error) {
      console.error('Failed to save call history:', error);
    }
  }

  // Load call history from persistent storage
  async loadCallHistory(): Promise<void> {
    try {
      // In a real app, load from AsyncStorage or secure storage
      // For now, use mock data
      this.callHistory = this.generateMockCallHistory();
      console.log('Call history loaded:', this.callHistory.length, 'records');
    } catch (error) {
      console.error('Failed to load call history:', error);
    }
  }

  // Generate mock call history for testing
  private generateMockCallHistory(): CallRecord[] {
    const mockHistory: CallRecord[] = [
      {
        id: '1',
        contactId: '101',
        contactName: 'Emma Johnson',
        contactAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        type: 'incoming',
        callType: 'video',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        duration: 1847, // 30 minutes 47 seconds
      },
      {
        id: '2',
        contactId: '102',
        contactName: 'Sophia Williams',
        contactAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        type: 'outgoing',
        callType: 'audio',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        duration: 623, // 10 minutes 23 seconds
      },
      {
        id: '3',
        contactId: '103',
        contactName: 'Isabella Brown',
        contactAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        type: 'missed',
        callType: 'video',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      },
      {
        id: '4',
        contactId: '104',
        contactName: 'Olivia Davis',
        contactAvatar: 'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=150&h=150&fit=crop&crop=face',
        type: 'outgoing',
        callType: 'audio',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        duration: 2847, // 47 minutes 27 seconds
      },
      {
        id: '5',
        contactId: '105',
        contactName: 'Ava Miller',
        contactAvatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=face',
        type: 'incoming',
        callType: 'video',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        duration: 1654, // 27 minutes 34 seconds
      },
    ];

    return mockHistory;
  }

  // Test methods for development
  async simulateIncomingCall(
    callerId: string,
    callerName: string,
    type: CallType,
    callerAvatar?: string
  ): Promise<void> {
    const callMessage: SignalingMessage = {
      type: 'call-request',
      callId: `test_call_${Date.now()}`,
      fromId: callerId,
      toId: useAuthStore.getState().user?.uid || 'current_user',
      data: {
        type,
        callerName,
        callerAvatar,
        isGroup: false,
      },
      timestamp: new Date(),
    };

    await webrtcService.handleSignalingMessage(callMessage);
  }

  // Cleanup method
  cleanup(): void {
    this.incomingCallCallbacks = [];
    this.callEndedCallbacks = [];
    // Close signaling connection
    this.signalingConnected = false;
  }
}

export default new CallManager();
