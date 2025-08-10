// ForwardMessageModal
// Modal for selecting chats to forward a message to

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import Icon from '../icons/IconRegistry';
import { useTheme } from '../../store/themeStore';
import { Message, Chat, ChatListItem } from '../../types/chat';
import chatService from '../../services/chatService';

interface ForwardMessageModalProps {
  isVisible: boolean;
  message: Message | null;
  onClose: () => void;
  onForward: (chatIds: string[], message: Message) => void;
}

interface SelectableChat extends ChatListItem {
  selected: boolean;
}

const ForwardMessageModal: React.FC<ForwardMessageModalProps> = ({
  isVisible,
  message,
  onClose,
  onForward,
}) => {
  const theme = useTheme();
  const [chats, setChats] = useState<SelectableChat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState<SelectableChat[]>([]);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);

  useEffect(() => {
    if (isVisible) {
      loadChats();
      setSearchQuery('');
      setSelectedChats([]);
    }
  }, [isVisible]);

  useEffect(() => {
    filterChats();
  }, [searchQuery, chats]);

  const loadChats = async () => {
    try {
      const chatList = await chatService.getChats();
      // Exclude the current chat where the message was sent
      const availableChats = chatList
        .filter(chat => chat.chat.id !== message?.chatId)
        .map(chat => ({
          ...chat,
          selected: false,
        }));
      
      setChats(availableChats);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const filterChats = () => {
    if (!searchQuery.trim()) {
      setFilteredChats(chats);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = chats.filter(chatItem => {
      const chat = chatItem.chat;
      const chatName = chat.name || 
        chat.participantDetails.map(p => p.displayName).join(', ');
      
      return chatName.toLowerCase().includes(query);
    });

    setFilteredChats(filtered);
  };

  const toggleChatSelection = (chatId: string) => {
    const updatedChats = chats.map(chat => {
      if (chat.chat.id === chatId) {
        const newSelected = !chat.selected;
        return { ...chat, selected: newSelected };
      }
      return chat;
    });

    setChats(updatedChats);
    
    const newSelectedChats = updatedChats
      .filter(chat => chat.selected)
      .map(chat => chat.chat.id);
    
    setSelectedChats(newSelectedChats);
  };

  const handleForward = () => {
    if (selectedChats.length === 0) {
      Alert.alert('No Selection', 'Please select at least one chat to forward to.');
      return;
    }

    if (message) {
      onForward(selectedChats, message);
      onClose();
    }
  };

  const getMessagePreview = (message: Message): string => {
    switch (message.type) {
      case 'image':
        return '📷 Photo';
      case 'video':
        return '🎥 Video';
      case 'audio':
        return '🎵 Audio';
      case 'document':
        return '📄 Document';
      case 'location':
        return '📍 Location';
      default:
        const maxLength = 50;
        const text = message.text;
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
  };

  const getChatDisplayName = (chat: Chat): string => {
    if (chat.name) return chat.name;
    return chat.participantDetails.map(p => p.displayName).join(', ');
  };

  const getChatAvatar = (chat: Chat): string | undefined => {
    if (chat.avatar) return chat.avatar;
    if (chat.participantDetails.length > 0) {
      return chat.participantDetails[0].photoURL;
    }
    return undefined;
  };

  const renderChatItem = ({ item }: { item: SelectableChat }) => {
    const chatName = getChatDisplayName(item.chat);
    const avatar = getChatAvatar(item.chat);

    return (
      <TouchableOpacity
        style={[
          styles.chatItem,
          {
            backgroundColor: item.selected ? theme.colors.love + '10' : 'transparent',
            borderColor: item.selected ? theme.colors.love : 'transparent',
          },
        ]}
        onPress={() => toggleChatSelection(item.chat.id)}
        activeOpacity={0.7}
      >
        <View style={styles.chatInfo}>
          {avatar ? (
            <Image
              source={{ uri: avatar }}
              style={[styles.avatar, { borderColor: theme.colors.border }]}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.border }]}>
              <Icon name="person" size={20} color={theme.colors.textSecondary} />
            </View>
          )}

          <View style={styles.chatDetails}>
            <Text
              style={[
                styles.chatName,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.body,
                },
              ]}
              numberOfLines={1}
            >
              {chatName}
            </Text>

            {item.lastMessage && (
              <Text
                style={[
                  styles.lastMessage,
                  {
                    color: theme.colors.textSecondary,
                    fontSize: theme.typography.caption,
                  },
                ]}
                numberOfLines={1}
              >
                {getMessagePreview(item.lastMessage)}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.selectionContainer}>
          {item.selected ? (
            <Icon name="check-circle" size={24} color={theme.colors.love} />
          ) : (
            <View style={[styles.selectionCircle, { borderColor: theme.colors.border }]} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <TouchableOpacity style={styles.headerButton} onPress={onClose}>
            <Icon name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Forward Message
          </Text>

          <TouchableOpacity
            style={[
              styles.headerButton,
              styles.forwardButton,
              {
                backgroundColor: selectedChats.length > 0 ? theme.colors.love : theme.colors.border,
              },
            ]}
            onPress={handleForward}
            disabled={selectedChats.length === 0}
          >
            <Icon
              name="send"
              size={20}
              color={selectedChats.length > 0 ? 'white' : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Message Preview */}
        {message && (
          <View style={[styles.messagePreview, { backgroundColor: theme.colors.card }]}>
            <Icon name="forward" size={16} color={theme.colors.love} />
            <Text
              style={[
                styles.messagePreviewText,
                {
                  color: theme.colors.text,
                  fontSize: theme.typography.body,
                },
              ]}
              numberOfLines={2}
            >
              {getMessagePreview(message)}
            </Text>
          </View>
        )}

        {/* Search */}
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
          <Icon name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[
              styles.searchInput,
              {
                color: theme.colors.text,
                fontSize: theme.typography.body,
              },
            ]}
            placeholder="Search chats..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Selection Info */}
        {selectedChats.length > 0 && (
          <View style={[styles.selectionInfo, { backgroundColor: theme.colors.love + '10' }]}>
            <Text style={[styles.selectionText, { color: theme.colors.love }]}>
              {selectedChats.length} chat{selectedChats.length > 1 ? 's' : ''} selected
            </Text>
          </View>
        )}

        {/* Chat List */}
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.chat.id}
          renderItem={renderChatItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.chatList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="chat" size={48} color={theme.colors.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {searchQuery ? 'No chats found' : 'No chats available'}
              </Text>
            </View>
          }
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  forwardButton: {
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  messagePreviewText: {
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    fontSize: 16,
  },
  selectionInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 6,
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chatList: {
    paddingHorizontal: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  chatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatDetails: {
    flex: 1,
  },
  chatName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  lastMessage: {
    opacity: 0.8,
  },
  selectionContainer: {
    marginLeft: 12,
  },
  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default ForwardMessageModal;
