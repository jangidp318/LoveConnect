// MessageContextMenu
// Context menu for message interactions (reply, forward, delete, etc.)

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  Alert,
  Platform,
} from 'react-native';
import Icon from '../icons/IconRegistry';
import { useTheme } from '../../store/themeStore';
import {
  MessageContextMenuProps,
  MessageActionType,
  Message,
} from '../../types/chat';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ActionItem {
  type: MessageActionType;
  label: string;
  icon: string;
  color?: string;
  destructive?: boolean;
  requiresConfirmation?: boolean;
}

const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  message,
  isCurrentUser,
  isVisible,
  onClose,
  onAction,
  position,
}) => {
  const theme = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const getActionsForMessage = (): ActionItem[] => {
    const baseActions: ActionItem[] = [
      {
        type: MessageActionType.REPLY,
        label: 'Reply',
        icon: 'reply',
        color: theme.colors.love,
      },
      {
        type: MessageActionType.FORWARD,
        label: 'Forward',
        icon: 'forward',
        color: theme.colors.love,
      },
      {
        type: MessageActionType.COPY,
        label: 'Copy',
        icon: 'content-copy',
        color: theme.colors.text,
      },
      {
        type: MessageActionType.INFO,
        label: 'Info',
        icon: 'info',
        color: theme.colors.text,
      },
    ];

    // Add actions specific to current user's messages
    if (isCurrentUser) {
      baseActions.splice(2, 0, {
        type: MessageActionType.EDIT,
        label: 'Edit',
        icon: 'edit',
        color: theme.colors.text,
      });

      baseActions.push({
        type: MessageActionType.DELETE,
        label: 'Delete',
        icon: 'delete',
        color: theme.colors.error,
        destructive: true,
        requiresConfirmation: true,
      });
    }

    // Add reaction for non-current user messages
    if (!isCurrentUser) {
      baseActions.splice(1, 0, {
        type: MessageActionType.REACT,
        label: 'React',
        icon: 'favorite',
        color: theme.colors.love,
      });
    }

    // Add additional actions based on message type
    if (message && message.type === 'text' && message.text.length > 50) {
      baseActions.splice(-1, 0, {
        type: MessageActionType.QUOTE,
        label: 'Quote',
        icon: 'format-quote',
        color: theme.colors.text,
      });
    }

    // Add star/save action
    baseActions.splice(-1, 0, {
      type: MessageActionType.STAR,
      label: 'Star',
      icon: 'star',
      color: theme.colors.warning || '#FFA500',
    });

    return baseActions;
  };

  const handleActionPress = (actionType: MessageActionType) => {
    const action = getActionsForMessage().find(a => a.type === actionType);
    
    if (action?.requiresConfirmation) {
      Alert.alert(
        'Confirm Action',
        `Are you sure you want to ${action.label.toLowerCase()} this message?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: action.label,
            style: action.destructive ? 'destructive' : 'default',
            onPress: () => {
              onClose();
              onAction(actionType, message);
            },
          },
        ]
      );
    } else {
      onClose();
      onAction(actionType, message);
    }
  };

  const calculateMenuPosition = () => {
    const menuWidth = 200;
    const menuHeight = Math.min(getActionsForMessage().length * 50, 400);
    
    let x = position.x;
    let y = position.y;

    // Adjust horizontal position
    if (x + menuWidth > screenWidth - 20) {
      x = screenWidth - menuWidth - 20;
    }
    if (x < 20) {
      x = 20;
    }

    // Adjust vertical position
    if (y + menuHeight > screenHeight - 100) {
      y = position.y - menuHeight - 20;
    }

    return { x, y, width: menuWidth, height: menuHeight };
  };

  const menuPosition = calculateMenuPosition();

  if (!isVisible || !message) return null;

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: animatedValue,
            },
          ]}
        />
        
        <Animated.View
          style={[
            styles.menu,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              left: menuPosition.x,
              top: menuPosition.y,
              transform: [
                { scale: scaleValue },
                { translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 0],
                }) },
              ],
              opacity: animatedValue,
              shadowColor: theme.colors.shadow || '#000',
            },
          ]}
        >
          {/* Menu Arrow */}
          <View
            style={[
              styles.menuArrow,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
                left: Math.max(20, Math.min(position.x - menuPosition.x - 10, menuPosition.width - 40)),
              },
            ]}
          />

          {/* Actions List */}
          <View style={styles.menuContent}>
            {getActionsForMessage().map((action, index) => (
              <TouchableOpacity
                key={action.type}
                style={[
                  styles.actionItem,
                  {
                    borderBottomColor: theme.colors.border,
                    borderBottomWidth: index < getActionsForMessage().length - 1 ? StyleSheet.hairlineWidth : 0,
                  },
                ]}
                onPress={() => handleActionPress(action.type)}
                activeOpacity={0.7}
              >
                <Icon
                  name={action.icon}
                  size={20}
                  color={action.color || theme.colors.text}
                />
                <Text
                  style={[
                    styles.actionLabel,
                    {
                      color: action.destructive ? theme.colors.error : theme.colors.text,
                      fontSize: theme.typography.body,
                    },
                  ]}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menu: {
    position: 'absolute',
    minWidth: 180,
    maxWidth: 220,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  menuArrow: {
    position: 'absolute',
    top: -6,
    width: 12,
    height: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    transform: [{ rotate: '45deg' }],
    borderTopLeftRadius: 2,
  },
  menuContent: {
    paddingVertical: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  actionLabel: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
});

export default MessageContextMenu;
