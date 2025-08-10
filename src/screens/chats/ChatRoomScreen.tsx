// ChatRoomScreen
// Beautiful real-time chat interface with message bubbles and animations

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
  Clipboard,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import Icon from '../../components/icons/IconRegistry';
import CustomHeader from '../../components/headers/CustomHeader';
import { useTheme } from '../../store/themeStore';
import { 
  Message, 
  MessageStatus, 
  TypingIndicator, 
  Chat, 
  MessageType,
  MessageActionType,
} from '../../types/chat';
import { AppStackParamList } from '../../navigation/AppStack';
import chatService from '../../services/chatService';
import callManager from '../../services/callManager';
import { CallType } from '../../services/WebRTCService';
import {
  formatMessageTime,
  formatDateSeparator,
  shouldShowDateSeparator,
  isSameDay,
} from '../../utils/dateHelper';
import MediaPickerModal, { MediaFile } from '../../components/modals/MediaPickerModal';
import {
  ImageMessageBubble,
  LocationMessageBubble,
  DocumentMessageBubble,
} from '../../components/chat/MessageComponents';
import MessageContextMenu from '../../components/chat/MessageContextMenu';
import ReplyBar from '../../components/chat/ReplyBar';
import ForwardMessageModal from '../../components/modals/ForwardMessageModal';

type ChatRoomRouteProp = RouteProp<AppStackParamList, 'ChatRoom'>;

const { width: screenWidth } = Dimensions.get('window');
const MAX_MESSAGE_WIDTH = screenWidth * 0.75;

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  showDateSeparator: boolean;
  theme: any;
  onMessagePress?: (message: Message) => void;
  onMessageLongPress?: (message: Message, event: any) => void;
  onReplyPress?: (message: Message) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  showDateSeparator,
  theme,
  onMessagePress,
}) => {
  const getStatusIcon = () => {
    if (!isCurrentUser) return null;
    
    switch (message.status) {
      case MessageStatus.SENDING:
        return <Icon name="schedule" size={12} color={theme.colors.textSecondary} />;
      case MessageStatus.SENT:
        return <Icon name="check" size={12} color={theme.colors.textSecondary} />;
      case MessageStatus.DELIVERED:
        return <Icon name="done-all" size={12} color={theme.colors.textSecondary} />;
      case MessageStatus.READ:
        return <Icon name="done-all" size={12} color={theme.colors.love} />;
      case MessageStatus.FAILED:
        return <Icon name="error" size={12} color={theme.colors.error} />;
      default:
        return null;
    }
  };

  // Determine message type based on content
  const getMessageType = () => {
    if (message.text.startsWith('📷 Image')) {
      return 'image';
    } else if (message.text.startsWith('📍 Location:')) {
      return 'location';
    } else if (message.text.startsWith('📄 ')) {
      return 'document';
    }
    return 'text';
  };

  const messageType = getMessageType();

  // Render specialized message components
  const renderMessageContent = () => {
    switch (messageType) {
      case 'image':
        return (
          <ImageMessageBubble
            message={message}
            isCurrentUser={isCurrentUser}
            theme={theme}
            // Don't pass onPress so it uses default full-screen viewer behavior
          />
        );
      case 'location':
        return (
          <LocationMessageBubble
            message={message}
            isCurrentUser={isCurrentUser}
            theme={theme}
            onPress={() => onMessagePress?.(message)}
          />
        );
      case 'document':
        return (
          <DocumentMessageBubble
            message={message}
            isCurrentUser={isCurrentUser}
            theme={theme}
            onPress={() => onMessagePress?.(message)}
          />
        );
      default:
        return (
          <TouchableOpacity
            style={[styles.messageBubble, {
              backgroundColor: isCurrentUser ? theme.colors.love : theme.colors.card,
              marginLeft: isCurrentUser ? 50 : (message.senderAvatar ? 8 : 0),
              marginRight: isCurrentUser ? 0 : 50,
              borderColor: theme.colors.border,
            }]}
            onPress={() => onMessagePress?.(message)}
            activeOpacity={0.8}
          >
            {!isCurrentUser && !message.senderAvatar && (
              <Text style={[styles.senderName, {
                color: theme.colors.love,
                fontSize: theme.typography.caption,
              }]}>
                {message.senderName}
              </Text>
            )}
            
            <Text style={[styles.messageText, {
              color: isCurrentUser ? 'white' : theme.colors.text,
              fontSize: theme.typography.body,
            }]}>
              {message.text}
            </Text>
            
            <View style={styles.messageFooter}>
              <Text style={[styles.messageTime, {
                color: isCurrentUser ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary,
                fontSize: theme.typography.caption - 1,
              }]}>
                {formatMessageTime(message.timestamp)}
              </Text>
              
              {getStatusIcon()}
            </View>
          </TouchableOpacity>
        );
    }
  };

  return (
    <View style={styles.messageContainer}>
      {showDateSeparator && (
        <View style={[styles.dateSeparator, { backgroundColor: theme.colors.border }]}>
          <Text style={[styles.dateSeparatorText, {
            color: theme.colors.textSecondary,
            fontSize: theme.typography.caption,
          }]}>
            {formatDateSeparator(message.timestamp)}
          </Text>
        </View>
      )}
      
      <View style={[styles.messageRow, isCurrentUser && styles.messageRowReverse]}>
        {!isCurrentUser && message.senderAvatar && (
          <Image
            source={{ uri: message.senderAvatar }}
            style={[styles.messageAvatar, { borderColor: theme.colors.border }]}
          />
        )}
        
        {renderMessageContent()}
      </View>
    </View>
  );
};

interface TypingIndicatorProps {
  typing: TypingIndicator[];
  theme: any;
}

const TypingIndicatorComponent: React.FC<TypingIndicatorProps> = ({ typing, theme }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (typing.length > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      animatedValue.setValue(0);
    }
  }, [typing.length]);

  if (typing.length === 0) return null;

  const typingText = typing.length === 1 
    ? `${typing[0].userName} is typing...`
    : `${typing.length} people are typing...`;

  return (
    <View style={[styles.typingContainer, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.typingBubble, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.typingText, {
          color: theme.colors.textSecondary,
          fontSize: theme.typography.caption,
        }]}>
          {typingText}
        </Text>
        
        <View style={styles.typingDots}>
          {[0, 1, 2].map(index => (
            <Animated.View
              key={index}
              style={[
                styles.typingDot,
                {
                  backgroundColor: theme.colors.love,
                  opacity: animatedValue,
                  transform: [{
                    scale: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    }),
                  }],
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const ChatRoomScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<ChatRoomRouteProp>();
  const { chatId, recipientId, recipientName, recipientAvatar } = route.params;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState<TypingIndicator[]>([]);
  const [messageText, setMessageText] = useState('');
  const [chat, setChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  
  // Message interaction states
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    message: Message | null;
    position: { x: number; y: number };
  }>({ visible: false, message: null, position: { x: 0, y: 0 } });
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [forwardModal, setForwardModal] = useState<{
    visible: boolean;
    message: Message | null;
  }>({ visible: false, message: null });
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    loadChatData();
    loadMessages();
    
    // Listen for new messages
    const unsubscribeMessages = chatService.onMessagesChanged(chatId, (newMessages) => {
      setMessages(newMessages);
      // Auto scroll to bottom when new message arrives
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    
    // Listen for typing indicators
    const unsubscribeTyping = chatService.onTypingChanged(chatId, (typingUsers) => {
      setTyping(typingUsers.filter(t => t.userId !== 'currentUser'));
    });
    
    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [chatId]);
  
  const loadChatData = async () => {
    try {
      const chatData = await chatService.getChatById(chatId);
      setChat(chatData);
    } catch (error) {
      console.error('Error loading chat data:', error);
    }
  };
  
  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const chatMessages = await chatService.getMessages(chatId);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const sendMessage = async () => {
    if (!messageText.trim()) return;
    
    const text = messageText.trim();
    setMessageText('');
    
    // Clear typing indicator
    chatService.clearTypingIndicator(chatId, 'currentUser');
    
    try {
      if (replyToMessage) {
        // Send as reply
        await chatService.sendReply(chatId, text, replyToMessage);
        setReplyToMessage(null);
      } else if (editingMessage) {
        // Edit existing message
        await chatService.editMessage(chatId, editingMessage.id, text);
        setEditingMessage(null);
      } else {
        // Send new message
        await chatService.sendMessage(chatId, text);
      }
      
      // Auto scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };
  
  const handleTextChange = (text: string) => {
    setMessageText(text);
    
    // Handle typing indicator
    if (text.length > 0) {
      chatService.setTypingIndicator(chatId, 'currentUser', 'You');
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to clear typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        chatService.clearTypingIndicator(chatId, 'currentUser');
      }, 2000);
    } else {
      chatService.clearTypingIndicator(chatId, 'currentUser');
    }
  };

  const handleMediaSelected = async (media: MediaFile) => {
    try {
      // Create a message with media content including the actual URI
      let messageText = '';
      let messageType = '';
      
      switch (media.type) {
        case 'image':
          // Include the actual image URI in the message text for proper display
          messageText = `📷 Image${media.name ? `: ${media.name}` : ''}||${media.uri}`;
          messageType = 'IMAGE';
          break;
        case 'video':
          messageText = `🎥 Video${media.name ? `: ${media.name}` : ''}||${media.uri}`;
          messageType = 'VIDEO';
          break;
        case 'document':
          messageText = `📄 ${media.name || 'Document'}||${media.uri}`;
          messageType = 'DOCUMENT';
          break;
        case 'location':
          messageText = `📍 Location: ${media.latitude}, ${media.longitude}||${media.address || 'Current Location'}`;
          messageType = 'LOCATION';
          break;
        case 'audio':
          messageText = `🎵 Voice Message||${media.uri}`;
          messageType = 'VOICE_MESSAGE';
          break;
        default:
          messageText = `📎 ${media.name || 'File'}||${media.uri}`;
          messageType = 'DOCUMENT';
      }

      // Send the media message with actual URI embedded
      await chatService.sendMessage(chatId, messageText, messageType as any);
      
      // Auto scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      console.log('Media selected and sent:', media);
      
      // Show success message for certain media types
      if (media.type === 'location') {
        Alert.alert('Location Shared', 'Your current location has been shared successfully.');
      } else if (media.type === 'image') {
        Alert.alert('Image Shared', 'Your image has been sent successfully.');
      }
      
    } catch (error) {
      console.error('Error sending media:', error);
      Alert.alert('Error', 'Failed to send media. Please try again.');
    }
  };

  const handleMessageLongPress = (message: Message, event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    
    // Add haptic feedback
    if (Platform.OS === 'ios') {
      Vibration.vibrate(50);
    } else {
      Vibration.vibrate([0, 50]);
    }
    
    setContextMenu({
      visible: true,
      message,
      position: { x: pageX, y: pageY },
    });
  };
  
  const handleMessageAction = async (action: MessageActionType, message: Message) => {
    try {
      switch (action) {
        case MessageActionType.REPLY:
          setReplyToMessage(message);
          break;
          
        case MessageActionType.FORWARD:
          setForwardModal({ visible: true, message });
          break;
          
        case MessageActionType.COPY:
          const textToCopy = await chatService.copyMessageText(message);
          await Clipboard.setString(textToCopy);
          Alert.alert('Copied', 'Message copied to clipboard');
          break;
          
        case MessageActionType.EDIT:
          if (message.senderId === 'currentUser' && !message.isDeleted) {
            setEditingMessage(message);
            setMessageText(message.text);
          }
          break;
          
        case MessageActionType.DELETE:
          Alert.alert(
            'Delete Message',
            'Are you sure you want to delete this message?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                  await chatService.deleteMessage(chatId, message.id);
                }
              }
            ]
          );
          break;
          
        case MessageActionType.INFO:
          const info = chatService.getMessageInfo(message);
          Alert.alert(
            'Message Info',
            `Sent: ${info.timestamp.toLocaleString()}\n` +
            `Status: ${info.status}\n` +
            `Type: ${info.type}\n` +
            (info.isEdited ? `Edited: ${info.editedAt?.toLocaleString()}\n` : '') +
            (info.isForwarded ? `Forwarded from: ${info.forwardedFrom}\n` : '') +
            (info.replyTo ? `Reply to: ${info.replyTo}\n` : '')
          );
          break;
          
        case MessageActionType.REACT:
          // Add a heart reaction for now - in a real app, you'd show emoji picker
          await chatService.addReaction(chatId, message.id, '❤️');
          break;
          
        case MessageActionType.STAR:
          Alert.alert('Coming Soon', 'Star message feature will be available soon!');
          break;
          
        default:
          console.log('Unhandled action:', action);
      }
    } catch (error) {
      console.error('Error handling message action:', error);
      Alert.alert('Error', 'Failed to perform action. Please try again.');
    }
  };
  
  const handleForwardMessage = async (targetChatIds: string[], message: Message) => {
    try {
      await chatService.forwardMessage(message, targetChatIds);
      Alert.alert(
        'Message Forwarded',
        `Message forwarded to ${targetChatIds.length} chat${targetChatIds.length > 1 ? 's' : ''}`
      );
      setForwardModal({ visible: false, message: null });
    } catch (error) {
      console.error('Error forwarding message:', error);
      Alert.alert('Error', 'Failed to forward message. Please try again.');
    }
  };
  
  const cancelReply = () => {
    setReplyToMessage(null);
  };
  
  const cancelEdit = () => {
    setEditingMessage(null);
    setMessageText('');
  };

  const startCall = async (type: CallType) => {
    try {
      // Check if already in a call
      if (callManager.isInCall()) {
        Alert.alert('Call in Progress', 'Please end the current call before starting a new one.');
        return;
      }

      // Start the call
      await callManager.startCall(
        [recipientId],
        type,
        [{
          id: recipientId,
          name: recipientName,
          avatar: recipientAvatar,
        }]
      );

      // Navigate to the appropriate call screen
      if (type === 'video') {
        navigation.navigate('VideoCall', {
          callId: 'temp_call_id',
          isIncoming: false,
          recipientId,
          recipientName,
          recipientAvatar,
        });
      } else {
        navigation.navigate('AudioCall', {
          callId: 'temp_call_id',
          isIncoming: false,
          recipientId,
          recipientName,
          recipientAvatar,
        });
      }
    } catch (error) {
      console.error('Failed to start call:', error);
      Alert.alert('Call Failed', 'Unable to start the call. Please try again.');
    }
  };
  
  const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => {
    const previousMessage = index > 0 ? messages[index - 1] : undefined;
    const showDateSeparator = false; // Remove date separators
    const isCurrentUser = item.senderId === 'currentUser';
    
    const MessageComponent = () => {
      // Show reply context if this message is a reply
      const replySection = item.replyToMessage && (
        <View style={[
          styles.replySection,
          {
            backgroundColor: isCurrentUser ? 'rgba(255,255,255,0.1)' : theme.colors.border,
            borderLeftColor: theme.colors.love,
          }
        ]}>
          <Text style={[
            styles.replySender,
            {
              color: isCurrentUser ? 'rgba(255,255,255,0.8)' : theme.colors.love,
              fontSize: theme.typography.caption,
            }
          ]}>
            {item.replyToMessage.senderId === 'currentUser' ? 'You' : item.replyToMessage.senderName}
          </Text>
          <Text style={[
            styles.replyText,
            {
              color: isCurrentUser ? 'rgba(255,255,255,0.6)' : theme.colors.textSecondary,
              fontSize: theme.typography.caption,
            }
          ]} numberOfLines={1}>
            {item.replyToMessage.text}
          </Text>
        </View>
      );

      // Show forward indicator if message is forwarded
      const forwardSection = item.isForwarded && (
        <View style={styles.forwardSection}>
          <Icon name="forward" size={14} color={isCurrentUser ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary} />
          <Text style={[
            styles.forwardText,
            {
              color: isCurrentUser ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary,
              fontSize: theme.typography.caption,
            }
          ]}>
            Forwarded from {item.forwardedFrom}
          </Text>
        </View>
      );

      // Show deleted message placeholder
      if (item.isDeleted) {
        return (
          <View style={[
            styles.deletedMessage,
            {
              backgroundColor: isCurrentUser ? theme.colors.border : theme.colors.card,
              borderColor: theme.colors.border,
            }
          ]}>
            <Icon name="block" size={16} color={theme.colors.textSecondary} />
            <Text style={[
              styles.deletedText,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.body - 1,
              }
            ]}>This message was deleted</Text>
          </View>
        );
      }

      // Determine message type based on content
      const getMessageType = () => {
        if (item.text.startsWith('📷 Image')) {
          return 'image';
        } else if (item.text.startsWith('📍 Location:')) {
          return 'location';
        } else if (item.text.startsWith('📄 ')) {
          return 'document';
        }
        return 'text';
      };

      const messageType = getMessageType();

      // Render specialized message components with long press support
      const renderMessageContent = () => {
        const commonProps = {
          onLongPress: (event: any) => handleMessageLongPress(item, event),
        };

        switch (messageType) {
          case 'image':
            return (
              <ImageMessageBubble
                message={item}
                isCurrentUser={isCurrentUser}
                theme={theme}
                onLongPress={(event) => handleMessageLongPress(item, event)}
              />
            );
          case 'location':
            return (
              <LocationMessageBubble
                message={item}
                isCurrentUser={isCurrentUser}
                theme={theme}
                onPress={() => {}}
                onLongPress={(event) => handleMessageLongPress(item, event)}
              />
            );
          case 'document':
            return (
              <DocumentMessageBubble
                message={item}
                isCurrentUser={isCurrentUser}
                theme={theme}
                onPress={() => {}}
                onLongPress={(event) => handleMessageLongPress(item, event)}
              />
            );
          default:
            return (
              <TouchableOpacity
                style={[
                  styles.messageBubble,
                  {
                    backgroundColor: isCurrentUser ? theme.colors.love : theme.colors.card,
                    marginLeft: isCurrentUser ? 50 : (item.senderAvatar ? 8 : 0),
                    marginRight: isCurrentUser ? 0 : 50,
                    borderColor: theme.colors.border,
                  }
                ]}
                onPress={() => {}}
                onLongPress={(event) => handleMessageLongPress(item, event)}
                activeOpacity={0.8}
              >
                {!isCurrentUser && !item.senderAvatar && (
                  <Text style={[
                    styles.senderName,
                    {
                      color: theme.colors.love,
                      fontSize: theme.typography.caption,
                    }
                  ]}>
                    {item.senderName}
                  </Text>
                )}
                
                {forwardSection}
                {replySection}
                
                <Text style={[
                  styles.messageText,
                  {
                    color: isCurrentUser ? 'white' : theme.colors.text,
                    fontSize: theme.typography.body,
                  }
                ]}>
                  {item.text}
                </Text>
                
                {/* Show reactions if any */}
                {item.reactions && item.reactions.length > 0 && (
                  <View style={styles.reactionsContainer}>
                    {item.reactions.map((reaction, idx) => (
                      <View key={idx} style={[
                        styles.reaction,
                        { backgroundColor: isCurrentUser ? 'rgba(255,255,255,0.2)' : theme.colors.love + '20' }
                      ]}>
                        <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                      </View>
                    ))}
                  </View>
                )}
                
                <View style={styles.messageFooter}>
                  <Text style={[
                    styles.messageTime,
                    {
                      color: isCurrentUser ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary,
                      fontSize: theme.typography.caption - 1,
                    }
                  ]}>
                    {formatMessageTime(item.timestamp)}
                    {item.isEdited && ' (edited)'}
                  </Text>
                  
                  {/* Message status icons for current user */}
                  {isCurrentUser && (() => {
                    switch (item.status) {
                      case MessageStatus.SENDING:
                        return <Icon name="schedule" size={12} color="rgba(255,255,255,0.8)" />;
                      case MessageStatus.SENT:
                        return <Icon name="check" size={12} color="rgba(255,255,255,0.8)" />;
                      case MessageStatus.DELIVERED:
                        return <Icon name="done-all" size={12} color="rgba(255,255,255,0.8)" />;
                      case MessageStatus.READ:
                        return <Icon name="done-all" size={12} color={theme.colors.love} />;
                      case MessageStatus.FAILED:
                        return <Icon name="error" size={12} color={theme.colors.error} />;
                      default:
                        return null;
                    }
                  })()}
                </View>
              </TouchableOpacity>
            );
        }
      };

      return (
        <View>
          {forwardSection}
          {replySection}
          {renderMessageContent()}
        </View>
      );
    };
    
    return (
      <View style={styles.messageContainer}>
        {showDateSeparator && (
          <View style={[styles.dateSeparator, { backgroundColor: theme.colors.border }]}>
            <Text style={[
              styles.dateSeparatorText,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.caption,
              }
            ]}>
              {formatDateSeparator(item.timestamp)}
            </Text>
          </View>
        )}
        
        <View style={[styles.messageRow, isCurrentUser && styles.messageRowReverse]}>
          {!isCurrentUser && item.senderAvatar && (
            <Image
              source={{ uri: item.senderAvatar }}
              style={[styles.messageAvatar, { borderColor: theme.colors.border }]}
            />
          )}
          
          <MessageComponent />
        </View>
      </View>
    );
  }, [messages, theme]);
  
  const renderHeader = () => (
    <View style={[styles.header, {
      backgroundColor: theme.colors.background,
      borderBottomColor: theme.colors.border,
    }]}>
      <TouchableOpacity
        style={styles.headerLeft}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      
      <View style={styles.headerCenter}>
        {recipientAvatar ? (
          <Image source={{ uri: recipientAvatar }} style={styles.headerAvatar} />
        ) : (
          <View style={[styles.headerAvatarPlaceholder, {
            backgroundColor: theme.colors.love + '20',
          }]}>
            <Icon name="person" size={20} color={theme.colors.love} />
          </View>
        )}
        
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, {
            color: theme.colors.text,
            fontSize: theme.typography.body,
          }]}>
            {recipientName}
          </Text>
          
          <Text style={[styles.headerStatus, {
            color: theme.colors.textSecondary,
            fontSize: theme.typography.caption,
          }]}>
            {typing.length > 0 
              ? typing.length === 1 
                ? `${typing[0].userName} is typing...`
                : `${typing.length} people typing...`
              : 'Active now'
            }
          </Text>
        </View>
      </View>
      
      <View style={styles.headerRight}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => startCall('video')}
        >
          <Icon name="videocam" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.headerButton, { marginLeft: 8 }]}
          onPress={() => startCall('audio')}
        >
          <Icon name="call" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  const renderInputArea = () => (
    <View>
      {/* Reply Bar */}
      {replyToMessage && (
        <ReplyBar
          replyToMessage={replyToMessage}
          onCancel={cancelReply}
        />
      )}
      
      {/* Edit Bar */}
      {editingMessage && (
        <View style={[
          styles.editBar,
          {
            backgroundColor: theme.colors.warning + '20',
            borderTopColor: theme.colors.border,
          }
        ]}>
          <Icon name="edit" size={16} color={theme.colors.warning} />
          <Text style={[
            styles.editText,
            {
              color: theme.colors.warning,
              fontSize: theme.typography.body - 1,
            }
          ]}>Editing message</Text>
          <TouchableOpacity onPress={cancelEdit}>
            <Icon name="close" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}
      
      <View style={[styles.inputArea, {
        backgroundColor: theme.colors.background,
        borderTopColor: theme.colors.border,
      }]}>
        <View style={[styles.inputContainer, {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        }]}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={() => setShowMediaPicker(true)}
          >
            <Icon name="attach-file" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.voiceButton}
            onPress={() => setShowVoiceRecorder(!showVoiceRecorder)}
          >
            <Icon name="mic" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          
          <TextInput
            style={[styles.textInput, {
              color: theme.colors.text,
              fontSize: theme.typography.body,
            }]}
            placeholder={editingMessage ? "Edit message..." : "Type a message..."}
            placeholderTextColor={theme.colors.textSecondary}
            value={messageText}
            onChangeText={handleTextChange}
            multiline
            maxLength={1000}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
          
          <TouchableOpacity
            style={[styles.sendButton, {
              backgroundColor: messageText.trim() ? theme.colors.love : theme.colors.textSecondary,
            }]}
            onPress={sendMessage}
            disabled={!messageText.trim()}
          >
            <Icon 
              name={editingMessage ? "check" : "send"} 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
  
  // Create custom center element for chat header
  const renderCenterElement = () => (
    <View style={styles.headerCenter}>
      {recipientAvatar ? (
        <Image source={{ uri: recipientAvatar }} style={styles.headerAvatar} />
      ) : (
        <View style={[styles.headerAvatarPlaceholder, {
          backgroundColor: theme.colors.love + '20',
        }]}>
          <Icon name="person" size={20} color={theme.colors.love} />
        </View>
      )}
      
      <View style={styles.headerInfo}>
        <Text style={[styles.headerName, {
          color: theme.colors.text,
          fontSize: theme.typography.body,
        }]}>
          {recipientName}
        </Text>
        
        <Text style={[styles.headerStatus, {
          color: theme.colors.textSecondary,
          fontSize: theme.typography.caption,
        }]}>
          {typing.length > 0 
            ? typing.length === 1 
              ? `${typing[0].userName} is typing...`
              : `${typing.length} people typing...`
            : 'Active now'
          }
        </Text>
      </View>
    </View>
  );

  return (
    <>
      <CustomHeader
        showBackButton={true}
        centerElement={renderCenterElement()}
        rightActions={[
          {
            icon: 'videocam',
            onPress: () => startCall('video'),
          },
          {
            icon: 'call',
            onPress: () => startCall('audio'),
          },
        ]}
      />
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.messagesContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            // Auto scroll to bottom when content size changes
            if (!isLoading && messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
          onLayout={() => {
            // Auto scroll to bottom when component mounts
            if (messages.length > 0) {
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: false });
              }, 100);
            }
          }}
        />
        
        <TypingIndicatorComponent typing={typing} theme={theme} />
      </View>
      
      {renderInputArea()}
      
      <MediaPickerModal
        visible={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onMediaSelected={handleMediaSelected}
      />
      
      {/* Message Context Menu */}
      {contextMenu.message && (
        <MessageContextMenu
          isVisible={contextMenu.visible}
          message={contextMenu.message}
          isCurrentUser={contextMenu.message.senderId === 'currentUser'}
          position={contextMenu.position}
          onClose={() => setContextMenu({ visible: false, message: null, position: { x: 0, y: 0 } })}
          onAction={handleMessageAction}
        />
      )}
      
      {/* Forward Message Modal */}
      <ForwardMessageModal
        isVisible={forwardModal.visible}
        message={forwardModal.message}
        onClose={() => setForwardModal({ visible: false, message: null })}
        onForward={handleForwardMessage}
      />
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    marginRight: 16,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  headerAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  headerStatus: {
    fontWeight: '400',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messageContainer: {
    marginBottom: 2,
  },
  dateSeparator: {
    alignItems: 'center',
    paddingVertical: 12,
    marginVertical: 8,
  },
  dateSeparatorText: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  messageRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  messageRowReverse: {
    flexDirection: 'row-reverse',
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
  },
  messageBubble: {
    maxWidth: MAX_MESSAGE_WIDTH,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  senderName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  messageText: {
    lineHeight: 20,
    marginBottom: 4,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  messageTime: {
    fontWeight: '400',
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    alignSelf: 'flex-start',
  },
  typingText: {
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 3,
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  inputArea: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  attachButton: {
    padding: 8,
  },
  voiceButton: {
    padding: 8,
    marginLeft: 4,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  // Reply styles
  replySection: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderRadius: 6,
  },
  replySender: {
    fontWeight: '600',
    marginBottom: 2,
  },
  replyText: {
    fontStyle: 'italic',
  },
  // Forward styles
  forwardSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  forwardText: {
    marginLeft: 4,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  // Deleted message styles
  deletedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    opacity: 0.7,
    maxWidth: MAX_MESSAGE_WIDTH,
  },
  deletedText: {
    marginLeft: 6,
    fontStyle: 'italic',
  },
  // Reactions styles
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 4,
  },
  reaction: {
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  // Edit bar styles
  editBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  editText: {
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
  },
});

export default ChatRoomScreen;
