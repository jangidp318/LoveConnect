// Walkie-Talkie Service for Love Connect
// Handles press-to-talk audio streaming with 24-hour auto-delete

import AsyncStorage from '@react-native-async-storage/async-storage';
// Mock Firebase imports - replace with actual imports when Firebase is configured
const firestore = {
  FieldValue: {
    serverTimestamp: () => new Date()
  }
};
const storage = () => ({
  ref: (path: string) => ({
    putFile: async (filePath: string) => console.log('Mock walkie upload:', filePath),
    getDownloadURL: async () => `https://mock-storage.com/walkie/${Date.now()}.m4a`
  })
});
// Mock collections helper
const collections = {
  walkieTalkie: () => ({
    doc: (id: string) => ({
      set: async (data: any) => console.log('Mock walkie set:', id, data),
      update: async (data: any) => console.log('Mock walkie update:', id, data),
      delete: async () => console.log('Mock walkie delete:', id)
    }),
    where: () => ({
      orderBy: () => ({ onSnapshot: () => () => {} })
    })
  })
};

export interface WalkieMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  recipientName: string;
  audioUrl?: string;
  audioPath?: string;
  duration: number; // in seconds
  isPlaying?: boolean;
  isUploading?: boolean;
  timestamp: Date;
  expiresAt: Date; // 24 hours after creation
  isRead?: boolean;
  isPinned?: boolean;
  waveform?: number[]; // Audio waveform data for visualization
}

export interface WalkieContact {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: Date;
  lastMessage?: WalkieMessage;
  unreadCount: number;
}

export interface RecordingState {
  isRecording: boolean;
  duration: number;
  filePath?: string;
  waveform: number[];
}

class WalkieTalkieService {
  private static instance: WalkieTalkieService;
  private messages: { [contactId: string]: WalkieMessage[] } = {};
  private contacts: WalkieContact[] = [];
  private recordingState: RecordingState = {
    isRecording: false,
    duration: 0,
    waveform: []
  };
  private audioRecorder: any = null;
  private audioPlayer: any = null;
  private currentPlayingId: string | null = null;
  
  // Listeners
  private messageListeners: { [contactId: string]: ((messages: WalkieMessage[]) => void)[] } = {};
  private contactListeners: ((contacts: WalkieContact[]) => void)[] = [];
  private recordingListeners: ((state: RecordingState) => void)[] = [];
  
  // Auto-cleanup interval
  private cleanupInterval: NodeJS.Timeout | null = null;
  
  private constructor() {
    this.initializeAudioRecorder();
    this.initializeAudioPlayer();
    this.loadData();
    this.startAutoCleanup();
  }

  static getInstance(): WalkieTalkieService {
    if (!WalkieTalkieService.instance) {
      WalkieTalkieService.instance = new WalkieTalkieService();
    }
    return WalkieTalkieService.instance;
  }

  // Initialize audio recorder
  private async initializeAudioRecorder() {
    try {
      // This would use react-native-audio-recorder-player or similar
      // For now, create a mock recorder
      this.audioRecorder = {
        startRecorder: async (path: string) => {
          console.log('Starting recording to:', path);
          this.recordingState.isRecording = true;
          this.recordingState.filePath = path;
          this.recordingState.duration = 0;
          this.recordingState.waveform = [];
          this.notifyRecordingListeners();
          
          // Simulate recording progress
          const progressInterval = setInterval(() => {
            if (!this.recordingState.isRecording) {
              clearInterval(progressInterval);
              return;
            }
            
            this.recordingState.duration += 0.1;
            // Simulate waveform data
            this.recordingState.waveform.push(Math.random() * 100);
            
            if (this.recordingState.waveform.length > 50) {
              this.recordingState.waveform.shift(); // Keep only last 50 values
            }
            
            this.notifyRecordingListeners();
          }, 100);
          
          return path;
        },
        
        stopRecorder: async () => {
          console.log('Stopping recording');
          this.recordingState.isRecording = false;
          this.notifyRecordingListeners();
          return this.recordingState.filePath;
        },
        
        pauseRecorder: async () => {
          console.log('Pausing recording');
          return 'paused';
        }
      };
    } catch (error) {
      console.error('Failed to initialize audio recorder:', error);
    }
  }

  // Initialize audio player
  private async initializeAudioPlayer() {
    try {
      // This would use react-native-audio-recorder-player or similar
      this.audioPlayer = {
        startPlayer: async (path: string) => {
          console.log('Starting playback of:', path);
          return path;
        },
        
        stopPlayer: async () => {
          console.log('Stopping playback');
          this.currentPlayingId = null;
          this.updatePlayingState();
        },
        
        pausePlayer: async () => {
          console.log('Pausing playback');
        }
      };
    } catch (error) {
      console.error('Failed to initialize audio player:', error);
    }
  }

  // Start recording audio message
  async startRecording(): Promise<void> {
    try {
      if (this.recordingState.isRecording) {
        console.log('Already recording');
        return;
      }

      // Request audio recording permission
      const hasPermission = await this.requestAudioPermission();
      if (!hasPermission) {
        throw new Error('Audio recording permission not granted');
      }

      // Generate unique file path
      const fileName = `walkie_${Date.now()}.m4a`;
      const filePath = `${AsyncStorage}/audio/${fileName}`;
      
      await this.audioRecorder.startRecorder(filePath);
      
      console.log('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  // Stop recording audio message
  async stopRecording(): Promise<string | null> {
    try {
      if (!this.recordingState.isRecording) {
        console.log('Not recording');
        return null;
      }

      const filePath = await this.audioRecorder.stopRecorder();
      console.log('Recording stopped, file saved to:', filePath);
      
      return filePath;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }

  // Send walkie-talkie message
  async sendMessage(recipientId: string, recipientName: string, audioPath: string): Promise<WalkieMessage> {
    try {
      const message: WalkieMessage = {
        id: `walkie_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        senderId: this.getCurrentUserId(),
        senderName: this.getCurrentUserName(),
        senderAvatar: this.getCurrentUserAvatar(),
        recipientId,
        recipientName,
        audioPath,
        duration: this.recordingState.duration,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        isRead: false,
        isPinned: false,
        isUploading: true,
        waveform: [...this.recordingState.waveform]
      };

      // Add to local storage immediately
      if (!this.messages[recipientId]) {
        this.messages[recipientId] = [];
      }
      this.messages[recipientId].push(message);
      this.notifyMessageListeners(recipientId);
      
      // Update contact's last message
      this.updateContactLastMessage(recipientId, recipientName, message);

      // Upload to Firebase Storage
      try {
        const audioUrl = await this.uploadAudioToFirebase(audioPath);
        message.audioUrl = audioUrl;
        message.isUploading = false;
        
        // Save to Firestore
        await this.saveMessageToFirestore(message);
        
        this.notifyMessageListeners(recipientId);
      } catch (uploadError) {
        console.error('Failed to upload audio:', uploadError);
        message.isUploading = false;
        this.notifyMessageListeners(recipientId);
      }

      await this.saveToLocalStorage();
      return message;
    } catch (error) {
      console.error('Failed to send walkie message:', error);
      throw error;
    }
  }

  // Play walkie-talkie message
  async playMessage(messageId: string, contactId: string): Promise<void> {
    try {
      const message = this.findMessage(messageId, contactId);
      if (!message) {
        throw new Error('Message not found');
      }

      // Stop any currently playing message
      if (this.currentPlayingId) {
        await this.stopPlaying();
      }

      const audioPath = message.audioUrl || message.audioPath;
      if (!audioPath) {
        throw new Error('No audio file available');
      }

      // Start playing
      await this.audioPlayer.startPlayer(audioPath);
      this.currentPlayingId = messageId;
      message.isPlaying = true;
      message.isRead = true;
      
      this.updatePlayingState();
      this.notifyMessageListeners(contactId);
      
      // Auto-stop after duration
      setTimeout(async () => {
        if (this.currentPlayingId === messageId) {
          await this.stopPlaying();
        }
      }, message.duration * 1000);

    } catch (error) {
      console.error('Failed to play message:', error);
      throw error;
    }
  }

  // Stop playing current message
  async stopPlaying(): Promise<void> {
    try {
      await this.audioPlayer.stopPlayer();
      this.currentPlayingId = null;
      this.updatePlayingState();
    } catch (error) {
      console.error('Failed to stop playing:', error);
    }
  }

  // Delete message
  async deleteMessage(messageId: string, contactId: string): Promise<void> {
    try {
      if (this.messages[contactId]) {
        const messageIndex = this.messages[contactId].findIndex(m => m.id === messageId);
        if (messageIndex >= 0) {
          const message = this.messages[contactId][messageIndex];
          
          // Delete from Firebase
          if (message.audioUrl) {
            await this.deleteAudioFromFirebase(message.audioUrl);
          }
          
          // Remove from Firestore
          await this.deleteMessageFromFirestore(messageId);
          
          // Remove locally
          this.messages[contactId].splice(messageIndex, 1);
          this.notifyMessageListeners(contactId);
          
          // Update contact's last message if this was the last one
          this.updateContactAfterDeletion(contactId);
          
          await this.saveToLocalStorage();
        }
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  }

  // Pin/unpin message
  async togglePinMessage(messageId: string, contactId: string): Promise<void> {
    try {
      const message = this.findMessage(messageId, contactId);
      if (message) {
        message.isPinned = !message.isPinned;
        
        // Update in Firestore
        await collections.walkieTalkie().doc(messageId).update({
          isPinned: message.isPinned
        });
        
        this.notifyMessageListeners(contactId);
        await this.saveToLocalStorage();
      }
    } catch (error) {
      console.error('Failed to toggle pin message:', error);
    }
  }

  // Get messages for a contact
  getMessages(contactId: string): WalkieMessage[] {
    const messages = this.messages[contactId] || [];
    return messages.filter(message => new Date() < message.expiresAt);
  }

  // Get all contacts
  getContacts(): WalkieContact[] {
    return this.contacts.sort((a, b) => {
      if (a.lastMessage && b.lastMessage) {
        return b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime();
      }
      return 0;
    });
  }

  // Get recording state
  getRecordingState(): RecordingState {
    return { ...this.recordingState };
  }

  // Subscribe to message updates
  subscribeToMessages(contactId: string, callback: (messages: WalkieMessage[]) => void): () => void {
    if (!this.messageListeners[contactId]) {
      this.messageListeners[contactId] = [];
    }
    this.messageListeners[contactId].push(callback);
    
    // Send current messages
    callback(this.getMessages(contactId));
    
    return () => {
      this.messageListeners[contactId] = this.messageListeners[contactId]?.filter(
        listener => listener !== callback
      ) || [];
    };
  }

  // Subscribe to contact updates
  subscribeToContacts(callback: (contacts: WalkieContact[]) => void): () => void {
    this.contactListeners.push(callback);
    
    // Send current contacts
    callback(this.getContacts());
    
    return () => {
      this.contactListeners = this.contactListeners.filter(listener => listener !== callback);
    };
  }

  // Subscribe to recording state updates
  subscribeToRecording(callback: (state: RecordingState) => void): () => void {
    this.recordingListeners.push(callback);
    
    // Send current state
    callback(this.getRecordingState());
    
    return () => {
      this.recordingListeners = this.recordingListeners.filter(listener => listener !== callback);
    };
  }

  // Private helper methods
  private async requestAudioPermission(): Promise<boolean> {
    try {
      // This would use react-native-permissions
      // For now, return true for development
      return true;
    } catch (error) {
      console.error('Failed to request audio permission:', error);
      return false;
    }
  }

  private async uploadAudioToFirebase(filePath: string): Promise<string> {
    try {
      const fileName = `walkie-talkie/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.m4a`;
      const storageRef = storage().ref(fileName);
      
      // In a real implementation, this would upload the actual file
      await storageRef.putFile(filePath);
      return await storageRef.getDownloadURL();
    } catch (error) {
      console.error('Failed to upload audio to Firebase:', error);
      throw error;
    }
  }

  private async saveMessageToFirestore(message: WalkieMessage): Promise<void> {
    try {
      await collections.walkieTalkie().doc(message.id).set({
        ...message,
        timestamp: firestore.FieldValue.serverTimestamp(),
        expiresAt: firestore.FieldValue.serverTimestamp() // Will be updated with 24h expiry
      });
    } catch (error) {
      console.error('Failed to save message to Firestore:', error);
    }
  }

  private async deleteAudioFromFirebase(audioUrl: string): Promise<void> {
    try {
      const storageRef = storage().refFromURL(audioUrl);
      await storageRef.delete();
    } catch (error) {
      console.error('Failed to delete audio from Firebase:', error);
    }
  }

  private async deleteMessageFromFirestore(messageId: string): Promise<void> {
    try {
      await collections.walkieTalkie().doc(messageId).delete();
    } catch (error) {
      console.error('Failed to delete message from Firestore:', error);
    }
  }

  private findMessage(messageId: string, contactId: string): WalkieMessage | undefined {
    return this.messages[contactId]?.find(m => m.id === messageId);
  }

  private updatePlayingState(): void {
    // Update all messages playing state
    Object.keys(this.messages).forEach(contactId => {
      this.messages[contactId].forEach(message => {
        message.isPlaying = message.id === this.currentPlayingId;
      });
      this.notifyMessageListeners(contactId);
    });
  }

  private updateContactLastMessage(contactId: string, contactName: string, message: WalkieMessage): void {
    let contact = this.contacts.find(c => c.id === contactId);
    if (!contact) {
      contact = {
        id: contactId,
        name: contactName,
        unreadCount: 0
      };
      this.contacts.push(contact);
    }
    
    contact.lastMessage = message;
    contact.unreadCount += 1;
    this.notifyContactListeners();
  }

  private updateContactAfterDeletion(contactId: string): void {
    const contact = this.contacts.find(c => c.id === contactId);
    if (contact) {
      const messages = this.messages[contactId] || [];
      contact.lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;
      this.notifyContactListeners();
    }
  }

  private notifyMessageListeners(contactId: string): void {
    const listeners = this.messageListeners[contactId] || [];
    const messages = this.getMessages(contactId);
    listeners.forEach(callback => callback(messages));
  }

  private notifyContactListeners(): void {
    const contacts = this.getContacts();
    this.contactListeners.forEach(callback => callback(contacts));
  }

  private notifyRecordingListeners(): void {
    const state = this.getRecordingState();
    this.recordingListeners.forEach(callback => callback(state));
  }

  private startAutoCleanup(): void {
    // Clean up expired messages every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredMessages();
    }, 60 * 60 * 1000);
  }

  private async cleanupExpiredMessages(): Promise<void> {
    try {
      const now = new Date();
      let hasChanges = false;
      
      Object.keys(this.messages).forEach(contactId => {
        const originalLength = this.messages[contactId].length;
        this.messages[contactId] = this.messages[contactId].filter(message => 
          now < message.expiresAt
        );
        
        if (this.messages[contactId].length !== originalLength) {
          hasChanges = true;
          this.notifyMessageListeners(contactId);
          
          // Update contact's last message
          this.updateContactAfterDeletion(contactId);
        }
      });
      
      if (hasChanges) {
        await this.saveToLocalStorage();
        console.log('Cleaned up expired walkie-talkie messages');
      }
    } catch (error) {
      console.error('Failed to cleanup expired messages:', error);
    }
  }

  private async loadData(): Promise<void> {
    try {
      const savedMessages = await AsyncStorage.getItem('@walkie_messages');
      const savedContacts = await AsyncStorage.getItem('@walkie_contacts');
      
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        Object.keys(parsedMessages).forEach(contactId => {
          this.messages[contactId] = parsedMessages[contactId].map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
            expiresAt: new Date(msg.expiresAt)
          }));
        });
      }
      
      if (savedContacts) {
        this.contacts = JSON.parse(savedContacts).map((contact: any) => ({
          ...contact,
          lastMessage: contact.lastMessage ? {
            ...contact.lastMessage,
            timestamp: new Date(contact.lastMessage.timestamp),
            expiresAt: new Date(contact.lastMessage.expiresAt)
          } : undefined
        }));
      }
    } catch (error) {
      console.error('Failed to load walkie-talkie data:', error);
    }
  }

  private async saveToLocalStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem('@walkie_messages', JSON.stringify(this.messages));
      await AsyncStorage.setItem('@walkie_contacts', JSON.stringify(this.contacts));
    } catch (error) {
      console.error('Failed to save walkie-talkie data:', error);
    }
  }

  private getCurrentUserId(): string {
    // Get from auth store
    return 'current_user_id';
  }

  private getCurrentUserName(): string {
    // Get from auth store
    return 'Current User';
  }

  private getCurrentUserAvatar(): string | undefined {
    // Get from auth store
    return undefined;
  }

  // Cleanup resources
  cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.stopPlaying();
    this.messageListeners = {};
    this.contactListeners = [];
    this.recordingListeners = [];
  }
}

export default WalkieTalkieService.getInstance();
