// Chat Service
// Handles all chat-related operations with mock data and local storage

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Chat, 
  Message, 
  User, 
  ChatListItem, 
  MessageType, 
  MessageStatus, 
  ChatType,
  TypingIndicator
} from '../types/chat';

class ChatService {
  private static instance: ChatService;
  private chats: Chat[] = [];
  private messages: { [chatId: string]: Message[] } = {};
  private users: User[] = [];
  private authStateListeners: Array<(chats: Chat[]) => void> = [];
  private messageListeners: { [chatId: string]: Array<(messages: Message[]) => void> } = {};
  private typingListeners: { [chatId: string]: Array<(typing: TypingIndicator[]) => void> } = {};
  private typingIndicators: { [chatId: string]: TypingIndicator[] } = {};

  private constructor() {
    this.initializeMockData();
    this.loadChatsFromStorage();
  }

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  private initializeMockData() {
    // Mock users
    this.users = [
      {
        uid: 'user1',
        displayName: 'Emma Johnson',
        email: 'emma@example.com',
        photoURL: 'https://randomuser.me/api/portraits/women/1.jpg',
        isOnline: true,
        status: 'Available for chat 💕',
      },
      {
        uid: 'user2',
        displayName: 'Alex Smith',
        email: 'alex@example.com',
        photoURL: 'https://randomuser.me/api/portraits/men/1.jpg',
        isOnline: false,
        lastSeen: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        status: 'Busy with work',
      },
      {
        uid: 'user3',
        displayName: 'Sarah Wilson',
        email: 'sarah@example.com',
        photoURL: 'https://randomuser.me/api/portraits/women/2.jpg',
        isOnline: true,
        status: 'Feeling great today! ✨',
      },
      {
        uid: 'user4',
        displayName: 'Mike Davis',
        email: 'mike@example.com',
        photoURL: 'https://randomuser.me/api/portraits/men/2.jpg',
        isOnline: false,
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        uid: 'group1',
        displayName: 'Family Group',
        email: '',
        isOnline: false,
        photoURL: 'https://randomuser.me/api/portraits/lego/1.jpg',
      },
    ];

    // Mock chats
    this.chats = [
      {
        id: 'chat1',
        type: ChatType.DIRECT,
        participants: ['currentUser', 'user1'],
        participantDetails: [this.users[0]],
        lastActivity: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        createdBy: 'currentUser',
        isArchived: false,
        isMuted: false,
        isPinned: true,
        unreadCount: 2,
      },
      {
        id: 'chat2',
        type: ChatType.DIRECT,
        participants: ['currentUser', 'user2'],
        participantDetails: [this.users[1]],
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        createdBy: 'user2',
        isArchived: false,
        isMuted: false,
        isPinned: false,
        unreadCount: 0,
      },
      {
        id: 'chat3',
        type: ChatType.GROUP,
        name: 'Love Connect Team',
        participants: ['currentUser', 'user1', 'user3', 'user4'],
        participantDetails: [this.users[0], this.users[2], this.users[3]],
        lastActivity: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
        createdBy: 'currentUser',
        isArchived: false,
        isMuted: false,
        isPinned: false,
        unreadCount: 5,
        avatar: 'https://randomuser.me/api/portraits/lego/2.jpg',
        description: 'Official team chat for Love Connect app development',
        adminIds: ['currentUser', 'user1'],
      },
    ];

    // Mock messages
    this.messages = {
      chat1: [
        {
          id: 'msg1',
          chatId: 'chat1',
          senderId: 'user1',
          senderName: 'Emma Johnson',
          senderAvatar: this.users[0].photoURL,
          text: 'Hey! How are you doing today? 😊',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          type: MessageType.TEXT,
          status: MessageStatus.READ,
        },
        {
          id: 'msg2',
          chatId: 'chat1',
          senderId: 'currentUser',
          senderName: 'You',
          text: 'Hi Emma! I\'m doing great, thanks for asking! Just working on some exciting new features for our app 💻',
          timestamp: new Date(Date.now() - 90 * 60 * 1000),
          type: MessageType.TEXT,
          status: MessageStatus.READ,
        },
        {
          id: 'msg10',
          chatId: 'chat1',
          senderId: 'currentUser',
          senderName: 'You',
          text: '📷 Image: app_screenshot.png||https://picsum.photos/400/300?random=123',
          timestamp: new Date(Date.now() - 75 * 60 * 1000),
          type: MessageType.IMAGE,
          status: MessageStatus.READ,
        },
        {
          id: 'msg3',
          chatId: 'chat1',
          senderId: 'user1',
          senderName: 'Emma Johnson',
          senderAvatar: this.users[0].photoURL,
          text: 'That sounds amazing! Can\'t wait to see what you\'ve been working on 🎉',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          type: MessageType.TEXT,
          status: MessageStatus.DELIVERED,
        },
        {
          id: 'msg11',
          chatId: 'chat1',
          senderId: 'user1',
          senderName: 'Emma Johnson',
          senderAvatar: this.users[0].photoURL,
          text: '📄 project_proposal.pdf||file:///documents/project_proposal.pdf',
          timestamp: new Date(Date.now() - 20 * 60 * 1000),
          type: MessageType.DOCUMENT,
          status: MessageStatus.DELIVERED,
        },
        {
          id: 'msg4',
          chatId: 'chat1',
          senderId: 'user1',
          senderName: 'Emma Johnson',
          senderAvatar: this.users[0].photoURL,
          text: 'Are we still on for lunch tomorrow?',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          type: MessageType.TEXT,
          status: MessageStatus.DELIVERED,
        },
      ],
      chat2: [
        {
          id: 'msg5',
          chatId: 'chat2',
          senderId: 'user2',
          senderName: 'Alex Smith',
          senderAvatar: this.users[1].photoURL,
          text: 'Good morning! Hope you have a wonderful day ahead ☀️',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          type: MessageType.TEXT,
          status: MessageStatus.READ,
        },
        {
          id: 'msg6',
          chatId: 'chat2',
          senderId: 'currentUser',
          senderName: 'You',
          text: 'Good morning Alex! You too! Thanks for the positive vibes 😊',
          timestamp: new Date(Date.now() - 90 * 60 * 1000),
          type: MessageType.TEXT,
          status: MessageStatus.READ,
        },
        {
          id: 'msg7',
          chatId: 'chat2',
          senderId: 'user2',
          senderName: 'Alex Smith',
          senderAvatar: this.users[1].photoURL,
          text: '📷 Image: beautiful_sunset.jpg||https://picsum.photos/400/300?random=456',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          type: MessageType.IMAGE,
          status: MessageStatus.READ,
        },
        {
          id: 'msg8',
          chatId: 'chat2',
          senderId: 'currentUser',
          senderName: 'You',
          text: '📍 Location: 12.963783, 77.723612||Bengaluru, Karnataka, India',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          type: MessageType.LOCATION,
          status: MessageStatus.DELIVERED,
        },
        {
          id: 'msg9',
          chatId: 'chat2',
          senderId: 'user2',
          senderName: 'Alex Smith',
          senderAvatar: this.users[1].photoURL,
          text: 'Wow, that location looks amazing! 📍',
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
          type: MessageType.TEXT,
          status: MessageStatus.READ,
        },
      ],
      chat3: [
        {
          id: 'msg7',
          chatId: 'chat3',
          senderId: 'user3',
          senderName: 'Sarah Wilson',
          senderAvatar: this.users[2].photoURL,
          text: 'Team meeting in 30 minutes! Don\'t forget to bring your laptops 💻',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          type: MessageType.TEXT,
          status: MessageStatus.READ,
        },
        {
          id: 'msg8',
          chatId: 'chat3',
          senderId: 'user1',
          senderName: 'Emma Johnson',
          senderAvatar: this.users[0].photoURL,
          text: 'I\'ll be there! Should I prepare the presentation slides?',
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
          type: MessageType.TEXT,
          status: MessageStatus.READ,
        },
        {
          id: 'msg9',
          chatId: 'chat3',
          senderId: 'user4',
          senderName: 'Mike Davis',
          senderAvatar: this.users[3].photoURL,
          text: 'Yes please! Also, I\'ve uploaded the latest design mockups to our shared folder 📁',
          timestamp: new Date(Date.now() - 20 * 60 * 1000),
          type: MessageType.TEXT,
          status: MessageStatus.READ,
        },
        {
          id: 'msg10',
          chatId: 'chat3',
          senderId: 'currentUser',
          senderName: 'You',
          text: 'Awesome! I\'ll review them before the meeting. Great work everyone! 🚀',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          type: MessageType.TEXT,
          status: MessageStatus.READ,
        },
        {
          id: 'msg11',
          chatId: 'chat3',
          senderId: 'user3',
          senderName: 'Sarah Wilson',
          senderAvatar: this.users[2].photoURL,
          text: 'Perfect! See you all in the conference room 👋',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          type: MessageType.TEXT,
          status: MessageStatus.DELIVERED,
        },
      ],
    };

    // Update last messages
    this.updateLastMessages();
  }

  private updateLastMessages() {
    this.chats.forEach(chat => {
      const chatMessages = this.messages[chat.id];
      if (chatMessages && chatMessages.length > 0) {
        chat.lastMessage = chatMessages[chatMessages.length - 1];
        chat.lastActivity = chat.lastMessage.timestamp;
      }
    });
  }

  private async loadChatsFromStorage() {
    try {
      const savedChats = await AsyncStorage.getItem('@love_connect_chats');
      const savedMessages = await AsyncStorage.getItem('@love_connect_messages');
      
      if (savedChats) {
        const parsedChats = JSON.parse(savedChats);
        this.chats = parsedChats.map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          lastActivity: new Date(chat.lastActivity),
          lastMessage: chat.lastMessage ? {
            ...chat.lastMessage,
            timestamp: new Date(chat.lastMessage.timestamp),
          } : undefined,
        }));
      }

      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        Object.keys(parsedMessages).forEach(chatId => {
          this.messages[chatId] = parsedMessages[chatId].map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
            editedAt: msg.editedAt ? new Date(msg.editedAt) : undefined,
          }));
        });
      }
    } catch (error) {
      console.error('Error loading chats from storage:', error);
    }
  }

  private async saveChatsToStorage() {
    try {
      await AsyncStorage.setItem('@love_connect_chats', JSON.stringify(this.chats));
      await AsyncStorage.setItem('@love_connect_messages', JSON.stringify(this.messages));
    } catch (error) {
      console.error('Error saving chats to storage:', error);
    }
  }

  // Get all chats for the current user
  async getChats(): Promise<ChatListItem[]> {
    // Sort chats by last activity (pinned first, then by time)
    const sortedChats = [...this.chats].sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      return b.lastActivity.getTime() - a.lastActivity.getTime();
    });

    return sortedChats.map(chat => ({
      chat,
      lastMessage: chat.lastMessage,
      unreadCount: chat.unreadCount,
      isOnline: chat.type === ChatType.DIRECT ? 
        chat.participantDetails[0]?.isOnline : undefined,
      lastSeen: chat.type === ChatType.DIRECT ? 
        chat.participantDetails[0]?.lastSeen : undefined,
    }));
  }

  // Get messages for a specific chat
  async getMessages(chatId: string): Promise<Message[]> {
    const chatMessages = this.messages[chatId] || [];
    
    // Mark messages as read
    await this.markMessagesAsRead(chatId);
    
    return chatMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  // Send a new message
  async sendMessage(chatId: string, text: string, type: MessageType = MessageType.TEXT): Promise<Message> {
    const message: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      chatId,
      senderId: 'currentUser',
      senderName: 'You',
      text,
      timestamp: new Date(),
      type,
      status: MessageStatus.SENDING,
    };

    // Add message to the chat
    if (!this.messages[chatId]) {
      this.messages[chatId] = [];
    }
    this.messages[chatId].push(message);

    // Simulate network delay
    setTimeout(() => {
      message.status = MessageStatus.SENT;
      this.notifyMessageListeners(chatId);
      
      // Simulate delivery after another delay
      setTimeout(() => {
        message.status = MessageStatus.DELIVERED;
        this.notifyMessageListeners(chatId);
      }, 500);
    }, 300);

    // Update chat's last message and activity
    const chat = this.chats.find(c => c.id === chatId);
    if (chat) {
      chat.lastMessage = message;
      chat.lastActivity = message.timestamp;
    }

    // Save to storage
    this.saveChatsToStorage();

    // Notify listeners
    this.notifyMessageListeners(chatId);
    this.notifyChatListeners();

    return message;
  }

  // Mark messages as read
  async markMessagesAsRead(chatId: string): Promise<void> {
    const chat = this.chats.find(c => c.id === chatId);
    if (chat) {
      chat.unreadCount = 0;
      
      // Update message status for messages from other users
      const chatMessages = this.messages[chatId] || [];
      chatMessages.forEach(message => {
        if (message.senderId !== 'currentUser' && message.status !== MessageStatus.READ) {
          message.status = MessageStatus.READ;
        }
      });

      this.saveChatsToStorage();
      this.notifyChatListeners();
      this.notifyMessageListeners(chatId);
    }
  }

  // Create a new chat
  async createChat(recipientId: string, recipientName: string): Promise<Chat> {
    const existingChat = this.chats.find(chat => 
      chat.type === ChatType.DIRECT && 
      chat.participants.includes(recipientId)
    );

    if (existingChat) {
      return existingChat;
    }

    const recipient = this.users.find(u => u.uid === recipientId);
    
    const newChat: Chat = {
      id: `chat_${Date.now()}`,
      type: ChatType.DIRECT,
      participants: ['currentUser', recipientId],
      participantDetails: recipient ? [recipient] : [],
      lastActivity: new Date(),
      createdAt: new Date(),
      createdBy: 'currentUser',
      isArchived: false,
      isMuted: false,
      isPinned: false,
      unreadCount: 0,
    };

    this.chats.unshift(newChat);
    this.messages[newChat.id] = [];
    
    this.saveChatsToStorage();
    this.notifyChatListeners();

    return newChat;
  }

  // Get chat by ID
  async getChatById(chatId: string): Promise<Chat | null> {
    return this.chats.find(chat => chat.id === chatId) || null;
  }

  // Search messages
  async searchMessages(query: string): Promise<{ [chatId: string]: Message[] }> {
    const results: { [chatId: string]: Message[] } = {};
    
    Object.keys(this.messages).forEach(chatId => {
      const matchingMessages = this.messages[chatId].filter(message =>
        message.text.toLowerCase().includes(query.toLowerCase()) ||
        message.senderName.toLowerCase().includes(query.toLowerCase())
      );
      
      if (matchingMessages.length > 0) {
        results[chatId] = matchingMessages;
      }
    });

    return results;
  }

  // Typing indicators
  setTypingIndicator(chatId: string, userId: string, userName: string) {
    if (!this.typingIndicators[chatId]) {
      this.typingIndicators[chatId] = [];
    }

    // Remove existing indicator for this user
    this.typingIndicators[chatId] = this.typingIndicators[chatId].filter(
      indicator => indicator.userId !== userId
    );

    // Add new indicator
    this.typingIndicators[chatId].push({
      chatId,
      userId,
      userName,
      timestamp: new Date(),
    });

    // Auto-remove after 3 seconds
    setTimeout(() => {
      this.clearTypingIndicator(chatId, userId);
    }, 3000);

    this.notifyTypingListeners(chatId);
  }

  clearTypingIndicator(chatId: string, userId: string) {
    if (this.typingIndicators[chatId]) {
      this.typingIndicators[chatId] = this.typingIndicators[chatId].filter(
        indicator => indicator.userId !== userId
      );
      this.notifyTypingListeners(chatId);
    }
  }

  getTypingIndicators(chatId: string): TypingIndicator[] {
    return this.typingIndicators[chatId] || [];
  }

  // Event listeners
  onChatsChanged(callback: (chats: Chat[]) => void): () => void {
    this.authStateListeners.push(callback);
    return () => {
      this.authStateListeners = this.authStateListeners.filter(listener => listener !== callback);
    };
  }

  onMessagesChanged(chatId: string, callback: (messages: Message[]) => void): () => void {
    if (!this.messageListeners[chatId]) {
      this.messageListeners[chatId] = [];
    }
    this.messageListeners[chatId].push(callback);
    
    return () => {
      this.messageListeners[chatId] = this.messageListeners[chatId]?.filter(
        listener => listener !== callback
      ) || [];
    };
  }

  onTypingChanged(chatId: string, callback: (typing: TypingIndicator[]) => void): () => void {
    if (!this.typingListeners[chatId]) {
      this.typingListeners[chatId] = [];
    }
    this.typingListeners[chatId].push(callback);
    
    return () => {
      this.typingListeners[chatId] = this.typingListeners[chatId]?.filter(
        listener => listener !== callback
      ) || [];
    };
  }

  private notifyChatListeners() {
    this.authStateListeners.forEach(listener => {
      listener(this.chats);
    });
  }

  private notifyMessageListeners(chatId: string) {
    const listeners = this.messageListeners[chatId];
    if (listeners) {
      const messages = this.messages[chatId] || [];
      listeners.forEach(listener => listener(messages));
    }
  }

  private notifyTypingListeners(chatId: string) {
    const listeners = this.typingListeners[chatId];
    if (listeners) {
      const typing = this.getTypingIndicators(chatId);
      listeners.forEach(listener => listener(typing));
    }
  }

  // Edit message
  async editMessage(chatId: string, messageId: string, newText: string): Promise<void> {
    const chatMessages = this.messages[chatId];
    if (!chatMessages) return;

    const message = chatMessages.find(m => m.id === messageId);
    if (message && message.senderId === 'currentUser') {
      message.text = newText;
      message.isEdited = true;
      message.editedAt = new Date();
      
      await this.saveChatsToStorage();
      this.notifyMessageListeners(chatId);
    }
  }

  // Delete message
  async deleteMessage(chatId: string, messageId: string): Promise<void> {
    const chatMessages = this.messages[chatId];
    if (!chatMessages) return;

    const messageIndex = chatMessages.findIndex(m => m.id === messageId);
    if (messageIndex >= 0) {
      const message = chatMessages[messageIndex];
      if (message.senderId === 'currentUser') {
        // Mark as deleted instead of removing completely
        message.isDeleted = true;
        message.deletedAt = new Date();
        message.text = 'This message was deleted';
        
        await this.saveChatsToStorage();
        this.notifyMessageListeners(chatId);
        this.updateLastMessages();
        this.notifyChatListeners();
      }
    }
  }

  // Forward message to multiple chats
  async forwardMessage(originalMessage: Message, targetChatIds: string[]): Promise<void> {
    for (const chatId of targetChatIds) {
      const forwardedMessage: Message = {
        id: `msg_${Date.now()}_${Math.random()}`,
        chatId,
        senderId: 'currentUser',
        senderName: 'You',
        text: originalMessage.text,
        timestamp: new Date(),
        type: originalMessage.type,
        status: MessageStatus.SENDING,
        isForwarded: true,
        forwardedFrom: originalMessage.senderName,
        attachments: originalMessage.attachments,
      };

      // Add message to the target chat
      if (!this.messages[chatId]) {
        this.messages[chatId] = [];
      }
      this.messages[chatId].push(forwardedMessage);

      // Simulate network delay
      setTimeout(() => {
        forwardedMessage.status = MessageStatus.SENT;
        this.notifyMessageListeners(chatId);
        
        setTimeout(() => {
          forwardedMessage.status = MessageStatus.DELIVERED;
          this.notifyMessageListeners(chatId);
        }, 500);
      }, 300);

      // Update chat's last message and activity
      const chat = this.chats.find(c => c.id === chatId);
      if (chat) {
        chat.lastMessage = forwardedMessage;
        chat.lastActivity = forwardedMessage.timestamp;
      }
    }

    await this.saveChatsToStorage();
    this.notifyChatListeners();
    
    // Notify all affected chats
    targetChatIds.forEach(chatId => {
      this.notifyMessageListeners(chatId);
    });
  }

  // Send reply to message
  async sendReply(chatId: string, text: string, replyToMessage: Message, type: MessageType = MessageType.TEXT): Promise<Message> {
    const message: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      chatId,
      senderId: 'currentUser',
      senderName: 'You',
      text,
      timestamp: new Date(),
      type,
      status: MessageStatus.SENDING,
      replyTo: replyToMessage.id,
      replyToMessage: replyToMessage,
    };

    // Add message to the chat
    if (!this.messages[chatId]) {
      this.messages[chatId] = [];
    }
    this.messages[chatId].push(message);

    // Simulate network delay
    setTimeout(() => {
      message.status = MessageStatus.SENT;
      this.notifyMessageListeners(chatId);
      
      // Simulate delivery after another delay
      setTimeout(() => {
        message.status = MessageStatus.DELIVERED;
        this.notifyMessageListeners(chatId);
      }, 500);
    }, 300);

    // Update chat's last message and activity
    const chat = this.chats.find(c => c.id === chatId);
    if (chat) {
      chat.lastMessage = message;
      chat.lastActivity = message.timestamp;
    }

    // Save to storage
    this.saveChatsToStorage();

    // Notify listeners
    this.notifyMessageListeners(chatId);
    this.notifyChatListeners();

    return message;
  }

  // Copy message text to clipboard (would use clipboard in real implementation)
  async copyMessageText(message: Message): Promise<string> {
    let textToCopy = message.text;
    
    // Clean up formatted text for different message types
    if (message.type === 'image' && message.text.includes('||')) {
      const parts = message.text.split('||');
      textToCopy = parts[0].replace('📷 Image: ', '');
    } else if (message.type === 'document' && message.text.includes('||')) {
      const parts = message.text.split('||');
      textToCopy = parts[0].replace('📄 ', '');
    } else if (message.type === 'location' && message.text.includes('||')) {
      const parts = message.text.split('||');
      if (parts.length > 1) {
        textToCopy = `Location: ${parts[1]}`;
      }
    }
    
    return textToCopy;
  }

  // Get message info
  getMessageInfo(message: Message) {
    return {
      id: message.id,
      sender: message.senderName,
      timestamp: message.timestamp,
      status: message.status,
      type: message.type,
      isEdited: message.isEdited,
      editedAt: message.editedAt,
      isForwarded: message.isForwarded,
      forwardedFrom: message.forwardedFrom,
      replyTo: message.replyToMessage?.senderName,
    };
  }

  // Add reaction to message
  async addReaction(chatId: string, messageId: string, emoji: string): Promise<void> {
    const chatMessages = this.messages[chatId];
    if (!chatMessages) return;

    const message = chatMessages.find(m => m.id === messageId);
    if (message) {
      if (!message.reactions) {
        message.reactions = [];
      }
      
      // Remove existing reaction from current user if any
      message.reactions = message.reactions.filter(r => r.userId !== 'currentUser');
      
      // Add new reaction
      message.reactions.push({
        emoji,
        userId: 'currentUser',
        userName: 'You',
        timestamp: new Date(),
      });
      
      await this.saveChatsToStorage();
      this.notifyMessageListeners(chatId);
    }
  }

  // Get users (for creating new chats)
  async getUsers(): Promise<User[]> {
    return this.users.filter(user => user.uid !== 'currentUser');
  }
}

export default ChatService.getInstance();
