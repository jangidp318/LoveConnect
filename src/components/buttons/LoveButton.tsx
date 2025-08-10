// Love Button Component
// Themed button component with Love Connect styling

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../store/themeStore';
import { commonStyles } from '../../theme';

interface LoveButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const LoveButton: React.FC<LoveButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  fullWidth = false,
}) => {
  const { theme } = useTheme();
  const { colors, spacing, typography, borderRadius } = theme;

  // Button styles based on variant
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.medium,
      ...getButtonSize(),
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.border : colors.love,
          ...commonStyles.shadow,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.border : colors.surface,
          borderWidth: 1,
          borderColor: disabled ? colors.border : colors.love,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: disabled ? colors.border : colors.love,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      default:
        return baseStyle;
    }
  };

  // Button size
  const getButtonSize = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          height: 40,
          paddingHorizontal: spacing.md,
          minWidth: fullWidth ? '100%' : 120,
        };
      case 'medium':
        return {
          height: 48,
          paddingHorizontal: spacing.lg,
          minWidth: fullWidth ? '100%' : 140,
        };
      case 'large':
        return {
          height: 56,
          paddingHorizontal: spacing.xl,
          minWidth: fullWidth ? '100%' : 160,
        };
      default:
        return {
          height: 48,
          paddingHorizontal: spacing.lg,
          minWidth: fullWidth ? '100%' : 140,
        };
    }
  };

  // Text styles based on variant
  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: typography.button,
      fontWeight: '600',
      textAlign: 'center',
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          color: disabled ? colors.textSecondary : '#FFFFFF',
        };
      case 'secondary':
      case 'outline':
        return {
          ...baseStyle,
          color: disabled ? colors.textSecondary : colors.love,
        };
      case 'ghost':
        return {
          ...baseStyle,
          color: disabled ? colors.textSecondary : colors.text,
        };
      default:
        return baseStyle;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading && (
        <ActivityIndicator
          size={size === 'small' ? 'small' : 'small'}
          color={variant === 'primary' ? '#FFFFFF' : colors.love}
          style={{ marginRight: spacing.sm }}
        />
      )}
      
      {icon && !loading && (
        <>{icon}</>
      )}
      
      <Text style={[getTextStyle(), textStyle]}>
        {loading ? 'Loading...' : title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Additional styles if needed
});

export default LoveButton;
