// Chat Types
// Core types and interfaces for the messaging system

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phoneNumber?: string;
  isOnline: boolean;
  lastSeen?: Date;
  status?: string; // Custom status message
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: Date;
  type: MessageType;
  status: MessageStatus;
  replyTo?: string; // ID of message being replied to
  replyToMessage?: Message; // Full message object being replied to
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  isEdited?: boolean;
  editedAt?: Date;
  isForwarded?: boolean;
  forwardedFrom?: string; // Original sender info
  isDeleted?: boolean;
  deletedAt?: Date;
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  LOCATION = 'location',
  CONTACT = 'contact',
  VOICE_MESSAGE = 'voice_message',
  SYSTEM = 'system', // System messages like "User joined", etc.
}

export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  thumbnailUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number; // For audio/video files
  width?: number; // For images/videos
  height?: number; // For images/videos
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  type: ChatType;
  name?: string; // For group chats
  participants: string[]; // User IDs
  participantDetails: User[]; // Full user details
  lastMessage?: Message;
  lastActivity: Date;
  createdAt: Date;
  createdBy: string;
  isArchived: boolean;
  isMuted: boolean;
  isPinned: boolean;
  unreadCount: number;
  avatar?: string; // For group chats
  description?: string; // For group chats
  adminIds?: string[]; // For group chats
}

export enum ChatType {
  DIRECT = 'direct',
  GROUP = 'group',
  CHANNEL = 'channel',
}

export interface ChatListItem {
  chat: Chat;
  lastMessage?: Message;
  unreadCount: number;
  isOnline?: boolean; // For direct chats
  lastSeen?: Date; // For direct chats
}

// Typing indicator
export interface TypingIndicator {
  chatId: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

// Call-related types for integration
export interface CallInfo {
  id: string;
  type: 'audio' | 'video';
  participants: string[];
  startedAt: Date;
  endedAt?: Date;
  duration?: number;
  status: 'ringing' | 'active' | 'ended' | 'missed' | 'declined';
  initiatedBy: string;
}

// Search and filter types
export interface ChatSearchResult {
  chat: Chat;
  messages: Message[];
  matchCount: number;
}

export interface MessageSearchResult {
  message: Message;
  chat: Chat;
  context: Message[]; // Surrounding messages for context
}

// Notification preferences
export interface ChatNotificationSettings {
  chatId: string;
  isMuted: boolean;
  muteUntil?: Date;
  customTone?: string;
  showPreview: boolean;
}

// Message Actions
export interface MessageAction {
  id: string;
  label: string;
  icon: string;
  color?: string;
  destructive?: boolean;
  requiresConfirmation?: boolean;
}

export enum MessageActionType {
  REPLY = 'reply',
  FORWARD = 'forward',
  COPY = 'copy',
  EDIT = 'edit',
  DELETE = 'delete',
  INFO = 'info',
  REACT = 'react',
  QUOTE = 'quote',
  PIN = 'pin',
  STAR = 'star',
  TRANSLATE = 'translate',
  SAVE = 'save',
}

export interface MessageContextMenuProps {
  message: Message;
  isCurrentUser: boolean;
  isVisible: boolean;
  onClose: () => void;
  onAction: (action: MessageActionType, message: Message) => void;
  position: { x: number; y: number };
}

// Export utility type for component props
export type ChatNavigationProp = {
  chatId: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
};
