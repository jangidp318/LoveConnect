// Love Input Component
// Themed input component for Love Connect forms

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../store/themeStore';

interface LoveInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  isPassword?: boolean;
  isValid?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  onRightIconPress?: () => void;
}

const LoveInput: React.FC<LoveInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  isPassword = false,
  isValid,
  containerStyle,
  inputStyle,
  labelStyle,
  onRightIconPress,
  ...props
}) => {
  const { theme } = useTheme();
  const { colors, spacing, typography, borderRadius } = theme;
  const [isSecure, setIsSecure] = useState(isPassword);
  const [isFocused, setIsFocused] = useState(false);

  const handleRightIconPress = () => {
    if (isPassword) {
      setIsSecure(!isSecure);
    } else if (onRightIconPress) {
      onRightIconPress();
    }
  };

  const getBorderColor = () => {
    if (error) return colors.error;
    if (isValid) return colors.success;
    if (isFocused) return colors.love;
    return colors.border;
  };

  const getIconColor = () => {
    if (error) return colors.error;
    if (isValid) return colors.success;
    return isFocused ? colors.love : colors.textSecondary;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: colors.text, fontSize: typography.body },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            backgroundColor: colors.surface,
            borderRadius: borderRadius.medium,
          },
        ]}
      >
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={20}
            color={getIconColor()}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              fontSize: typography.body,
              flex: 1,
            },
            inputStyle,
          ]}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isSecure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {(rightIcon || isPassword) && (
          <TouchableOpacity
            onPress={handleRightIconPress}
            style={styles.rightIconContainer}
          >
            <Icon
              name={
                isPassword
                  ? isSecure
                    ? 'visibility'
                    : 'visibility-off'
                  : rightIcon || 'help'
              }
              size={20}
              color={getIconColor()}
            />
          </TouchableOpacity>
        )}

        {isValid && !rightIcon && !isPassword && (
          <Icon
            name="check-circle"
            size={20}
            color={colors.success}
            style={styles.validIcon}
          />
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Icon name="error" size={14} color={colors.error} />
          <Text
            style={[
              styles.errorText,
              { color: colors.error, fontSize: typography.caption },
            ]}
          >
            {error}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    paddingVertical: 0, // Remove default padding on Android
  },
  leftIcon: {
    marginRight: 12,
  },
  rightIconContainer: {
    marginLeft: 12,
    padding: 4,
  },
  validIcon: {
    marginLeft: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    marginLeft: 4,
    flex: 1,
  },
});

export default LoveInput;
