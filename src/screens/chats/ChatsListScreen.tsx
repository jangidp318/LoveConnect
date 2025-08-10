// ChatsListScreen
// Beautiful and modern chat list with search functionality

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from '../../components/icons/IconRegistry';
import CustomHeader from '../../components/headers/CustomHeader';
import { useTheme } from '../../store/themeStore';
import { ChatListItem, ChatType } from '../../types/chat';
import { AppStackParamList } from '../../navigation/AppStack';
import chatService from '../../services/chatService';
import { formatMessageTime, formatLastSeen } from '../../utils/dateHelper';

type ChatsListNavigationProp = StackNavigationProp<AppStackParamList>;

const ChatsListScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<ChatsListNavigationProp>();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState<ChatListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadChats();
    
    // Listen for chat updates
    const unsubscribe = chatService.onChatsChanged(() => {
      loadChats();
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Filter chats based on search query
    if (searchQuery.trim() === '') {
      setFilteredChats(chats);
    } else {
      const filtered = chats.filter(item => {
        const chat = item.chat;
        const searchLower = searchQuery.toLowerCase();
        
        // Search in chat name (for groups) or participant names (for direct chats)
        if (chat.type === ChatType.GROUP && chat.name) {
          return chat.name.toLowerCase().includes(searchLower);
        } else if (chat.type === ChatType.DIRECT) {
          return chat.participantDetails.some(user => 
            user.displayName.toLowerCase().includes(searchLower)
          );
        }
        
        // Search in last message
        if (item.lastMessage) {
          return item.lastMessage.text.toLowerCase().includes(searchLower) ||
                 item.lastMessage.senderName.toLowerCase().includes(searchLower);
        }
        
        return false;
      });
      setFilteredChats(filtered);
    }
  }, [chats, searchQuery]);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const chatList = await chatService.getChats();
      setChats(chatList);
    } catch (error) {
      console.error('Error loading chats:', error);
      Alert.alert('Error', 'Failed to load chats. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  };

  const handleChatPress = (item: ChatListItem) => {
    const chat = item.chat;
    
    if (chat.type === ChatType.DIRECT) {
      const recipient = chat.participantDetails[0];
      if (recipient) {
        navigation.navigate('ChatRoom', {
          chatId: chat.id,
          recipientId: recipient.uid,
          recipientName: recipient.displayName,
          recipientAvatar: recipient.photoURL,
        });
      }
    } else {
      // Group chat
      navigation.navigate('ChatRoom', {
        chatId: chat.id,
        recipientId: '', // Not applicable for groups
        recipientName: chat.name || 'Group Chat',
        recipientAvatar: chat.avatar,
      });
    }
  };

  const renderChatItem = ({ item }: { item: ChatListItem }) => {
    const { chat, lastMessage, unreadCount, isOnline } = item;
    
    // Get display info based on chat type
    let displayName = '';
    let displayAvatar = '';
    let onlineStatus = false;
    
    if (chat.type === ChatType.DIRECT) {
      const participant = chat.participantDetails[0];
      if (participant) {
        displayName = participant.displayName;
        displayAvatar = participant.photoURL || '';
        onlineStatus = participant.isOnline;
      }
    } else {
      displayName = chat.name || 'Group Chat';
      displayAvatar = chat.avatar || '';
    }

    const formatLastMessage = () => {
      if (!lastMessage) return 'No messages yet';
      
      let prefix = '';
      if (lastMessage.senderId === 'currentUser') {
        prefix = 'You: ';
      } else if (chat.type === ChatType.GROUP) {
        prefix = `${lastMessage.senderName.split(' ')[0]}: `;
      }
      
      return `${prefix}${lastMessage.text}`;
    };

    return (
      <TouchableOpacity
        style={[styles.chatItem, {
          backgroundColor: theme.colors.card,
          borderBottomColor: theme.colors.border,
        }]}
        onPress={() => handleChatPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {displayAvatar ? (
            <Image source={{ uri: displayAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, {
              backgroundColor: theme.colors.love + '20',
            }]}>
              <Icon
                name={chat.type === ChatType.GROUP ? 'group' : 'person'}
                size={24}
                color={theme.colors.love}
              />
            </View>
          )}
          
          {/* Online indicator for direct chats */}
          {chat.type === ChatType.DIRECT && onlineStatus && (
            <View style={[styles.onlineIndicator, {
              backgroundColor: theme.colors.success,
              borderColor: theme.colors.card,
            }]} />
          )}
          
          {/* Pin indicator */}
          {chat.isPinned && (
            <View style={[styles.pinIndicator, {
              backgroundColor: theme.colors.warning,
            }]}>
              <Icon name="push-pin" size={10} color="white" />
            </View>
          )}
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={[styles.chatName, {
              color: theme.colors.text,
              fontSize: theme.typography.body,
            }]} numberOfLines={1}>
              {displayName}
            </Text>
            
            <View style={styles.headerRight}>
              {lastMessage && (
                <Text style={[styles.timestamp, {
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.caption,
                }]}>
                  {formatMessageTime(lastMessage.timestamp)}
                </Text>
              )}
              
              {chat.isMuted && (
                <Icon
                  name="volume-off"
                  size={14}
                  color={theme.colors.textSecondary}
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
          </View>

          <View style={styles.messagePreview}>
            <Text style={[styles.lastMessage, {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.caption,
            }]} numberOfLines={1}>
              {formatLastMessage()}
            </Text>
            
            {unreadCount > 0 && (
              <View style={[styles.unreadBadge, {
                backgroundColor: theme.colors.love,
              }]}>
                <Text style={[styles.unreadCount, {
                  color: 'white',
                  fontSize: theme.typography.caption - 2,
                }]}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="chat-bubble-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyTitle, {
        color: theme.colors.text,
        fontSize: theme.typography.h3,
      }]}>
        No chats yet
      </Text>
      <Text style={[styles.emptyMessage, {
        color: theme.colors.textSecondary,
        fontSize: theme.typography.body,
      }]}>
        Start a conversation to see your chats here
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={[styles.searchContainer, {
      backgroundColor: theme.colors.background,
      borderBottomColor: theme.colors.border,
    }]}>
      <View style={[styles.searchInput, {
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
      }]}>
        <Icon name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchText, {
            color: theme.colors.text,
            fontSize: theme.typography.body,
          }]}
          placeholder="Search chats..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="clear" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const handleNewChatPress = () => {
    Alert.alert(
      'Start New Chat',
      'Choose how to start a new conversation',
      [
        {
          text: 'Search Users',
          onPress: () => Alert.alert('Feature Coming Soon', 'User search functionality will be available in the next update! 🚀'),
        },
        {
          text: 'Create Group',
          onPress: () => Alert.alert('Feature Coming Soon', 'Group creation will be available soon! 👥'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <>
      <CustomHeader
        title="💬 Love Connect"
        rightActions={[
          {
            icon: 'search',
            onPress: () => Alert.alert('Search', 'Search functionality coming soon!'),
          },
          {
            icon: 'more-vertical',
            onPress: () => Alert.alert('Menu', 'More options coming soon!'),
          },
        ]}
      />
      <View style={[styles.container, {
        backgroundColor: theme.colors.background,
      }]}>
        {renderHeader()}
        
        <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.chat.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.love}
            colors={[theme.colors.love]}
          />
        }
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        contentContainerStyle={filteredChats.length === 0 ? styles.emptyContainer : undefined}
      />
      
      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, {
          backgroundColor: theme.colors.love,
          shadowColor: theme.colors.love,
        }]}
        onPress={handleNewChatPress}
        activeOpacity={0.8}
      >
        <Icon name="add" size={24} color="white" />
      </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  searchText: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  pinIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatName: {
    fontWeight: '600',
    flex: 1,
  },
  timestamp: {
    fontWeight: '400',
  },
  messagePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontWeight: '400',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadCount: {
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});

export default ChatsListScreen;
