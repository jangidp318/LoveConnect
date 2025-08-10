// ReplyBar
// Component to show reply context when replying to a message

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from '../icons/IconRegistry';
import { useTheme } from '../../store/themeStore';
import { Message } from '../../types/chat';

interface ReplyBarProps {
  replyToMessage: Message | null;
  onCancel: () => void;
  animatedValue?: Animated.Value;
}

const ReplyBar: React.FC<ReplyBarProps> = ({
  replyToMessage,
  onCancel,
  animatedValue,
}) => {
  const theme = useTheme();

  if (!replyToMessage) return null;

  const getMessagePreview = (message: Message): string => {
    const maxLength = 50;
    
    // Handle different message types
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
      case 'voice_message':
        return '🎤 Voice message';
      default:
        const text = message.text;
        // Remove image/document prefixes from text
        const cleanText = text
          .replace(/^📷 Image:.*?\|\|/, '')
          .replace(/^📄 .*?\|\|/, '')
          .replace(/^📍 Location:.*?\|\|/, '')
          .trim();
        
        if (cleanText.length <= maxLength) {
          return cleanText;
        }
        return cleanText.substring(0, maxLength) + '...';
    }
  };

  const replyBarStyle = animatedValue
    ? {
        transform: [
          {
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          },
        ],
        opacity: animatedValue,
      }
    : {};

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
        },
        replyBarStyle,
      ]}
    >
      <View style={styles.content}>
        <View style={[styles.replyIndicator, { backgroundColor: theme.colors.love }]} />
        
        <View style={styles.replyContent}>
          <Text
            style={[
              styles.replyToLabel,
              {
                color: theme.colors.love,
                fontSize: theme.typography.caption + 1,
              },
            ]}
          >
            Replying to {replyToMessage.senderId === 'currentUser' ? 'yourself' : replyToMessage.senderName}
          </Text>
          
          <Text
            style={[
              styles.replyPreview,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.typography.body - 1,
              },
            ]}
            numberOfLines={2}
          >
            {getMessagePreview(replyToMessage)}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon
            name="close"
            size={18}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyIndicator: {
    width: 3,
    height: 36,
    borderRadius: 1.5,
    marginRight: 12,
  },
  replyContent: {
    flex: 1,
  },
  replyToLabel: {
    fontWeight: '600',
    marginBottom: 2,
  },
  replyPreview: {
    lineHeight: 18,
  },
  cancelButton: {
    padding: 4,
    marginLeft: 12,
  },
});

export default ReplyBar;
