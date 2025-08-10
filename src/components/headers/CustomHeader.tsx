// Custom Header Component
// Reusable dynamic header with customizable elements

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from '../icons/IconRegistry';
import { useTheme } from '../../store/themeStore';

export interface HeaderAction {
  icon: string;
  onPress: () => void;
  badge?: number;
  color?: string;
  size?: number;
}

export interface CustomHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  leftActions?: HeaderAction[];
  rightActions?: HeaderAction[];
  centerElement?: React.ReactNode;
  backgroundColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  elevation?: boolean;
  transparent?: boolean;
  statusBarStyle?: 'default' | 'light-content' | 'dark-content';
  onBackPress?: () => void;
  customLeft?: React.ReactNode;
  customRight?: React.ReactNode;
  style?: any;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  leftActions = [],
  rightActions = [],
  centerElement,
  backgroundColor,
  titleColor,
  subtitleColor,
  elevation = true,
  transparent = false,
  statusBarStyle = 'dark-content',
  onBackPress,
  customLeft,
  customRight,
  style,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const renderAction = (action: HeaderAction, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.actionButton}
      onPress={action.onPress}
      activeOpacity={0.7}
    >
      <View>
        <Icon
          name={action.icon}
          size={action.size || 24}
          color={action.color || theme.colors.text}
        />
        {action.badge !== undefined && action.badge > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.colors.love }]}>
            <Text style={styles.badgeText}>
              {action.badge > 99 ? '99+' : action.badge}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const headerBackgroundColor = transparent 
    ? 'transparent' 
    : backgroundColor || theme.colors.background;

  const headerStyle = [
    styles.header,
    {
      backgroundColor: headerBackgroundColor,
      borderBottomColor: theme.colors.border,
      borderBottomWidth: elevation && !transparent ? 1 : 0,
      elevation: elevation ? (Platform.OS === 'android' ? 4 : 0) : 0,
      shadowOpacity: elevation ? 0.1 : 0,
    },
    style,
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: headerBackgroundColor }]} edges={['top']}>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={headerBackgroundColor}
        translucent={transparent}
      />
      <View style={headerStyle}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          {customLeft || (
            <>
              {showBackButton && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBackPress}
                  activeOpacity={0.7}
                >
                  <Icon
                    name="arrow-back"
                    size={24}
                    color={theme.colors.text}
                  />
                </TouchableOpacity>
              )}
              {leftActions.map((action, index) => renderAction(action, index))}
            </>
          )}
        </View>

        {/* Center Section */}
        <View style={styles.centerSection}>
          {centerElement || (
            <View style={styles.titleContainer}>
              {title && (
                <Text
                  style={[
                    styles.title,
                    {
                      color: titleColor || theme.colors.text,
                      fontSize: theme.typography.h3,
                    },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text
                  style={[
                    styles.subtitle,
                    {
                      color: subtitleColor || theme.colors.textSecondary,
                      fontSize: theme.typography.caption,
                    },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {subtitle}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          {customRight || (
            <>
              {rightActions.map((action, index) => renderAction(action, index))}
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  actionButton: {
    padding: 8,
    marginHorizontal: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  subtitle: {
    fontWeight: '400',
    textAlign: 'center',
  },
});

export default CustomHeader;
