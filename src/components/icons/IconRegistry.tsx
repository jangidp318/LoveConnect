// Icon Registry
// Centralized icon management with modern icons from multiple libraries

import React from 'react';
import { ViewStyle } from 'react-native';

// Import icon libraries
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AntDesign from 'react-native-vector-icons/AntDesign';

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

// Icon mapping with the best icons from different libraries
export const ICON_REGISTRY = {
  // Navigation Icons
  'heart-filled': { library: 'MaterialIcons', name: 'favorite' },
  'heart-outline': { library: 'MaterialIcons', name: 'favorite-border' },
  'users': { library: 'Feather', name: 'users' },
  'message-circle': { library: 'Feather', name: 'message-circle' },
  'phone': { library: 'Feather', name: 'phone' },
  'user': { library: 'Feather', name: 'user' },
  
  // Action Icons
  'send': { library: 'Feather', name: 'send' },
  'camera': { library: 'Feather', name: 'camera' },
  'image': { library: 'Feather', name: 'image' },
  'paperclip': { library: 'Feather', name: 'paperclip' },
  'mic': { library: 'Feather', name: 'mic' },
  'mic-off': { library: 'Feather', name: 'mic-off' },
  'video': { library: 'Feather', name: 'video' },
  'video-off': { library: 'Feather', name: 'video-off' },
  'volume-up': { library: 'Feather', name: 'volume-2' },
  'volume-down': { library: 'Feather', name: 'volume-1' },
  'phone-call': { library: 'Feather', name: 'phone-call' },
  'phone-off': { library: 'Feather', name: 'phone-off' },
  
  // Additional call icons
  'videocam': { library: 'MaterialIcons', name: 'videocam' },
  'videocam-off': { library: 'MaterialIcons', name: 'videocam-off' },
  'call-end': { library: 'MaterialIcons', name: 'call-end' },
  'call-received': { library: 'MaterialIcons', name: 'call-received' },
  'call-made': { library: 'MaterialIcons', name: 'call-made' },
  'call-missed': { library: 'MaterialIcons', name: 'call-missed' },
  'flip-camera-ios': { library: 'MaterialIcons', name: 'flip-camera-ios' },
  
  // Interface Icons
  'arrow-back': { library: 'Feather', name: 'arrow-left' },
  'arrow-forward': { library: 'Feather', name: 'arrow-right' },
  'close': { library: 'Feather', name: 'x' },
  'check': { library: 'Feather', name: 'check' },
  'plus': { library: 'Feather', name: 'plus' },
  'minus': { library: 'Feather', name: 'minus' },
  'edit': { library: 'Feather', name: 'edit-2' },
  'delete': { library: 'Feather', name: 'trash-2' },
  'search': { library: 'Feather', name: 'search' },
  'filter': { library: 'Feather', name: 'filter' },
  'settings': { library: 'Feather', name: 'settings' },
  'more-vertical': { library: 'Feather', name: 'more-vertical' },
  'more-horizontal': { library: 'Feather', name: 'more-horizontal' },
  
  // Social & Dating Icons
  'star': { library: 'AntDesign', name: 'star' },
  'star-outline': { library: 'AntDesign', name: 'staro' },
  'thumbs-up': { library: 'Feather', name: 'thumbs-up' },
  'thumbs-down': { library: 'Feather', name: 'thumbs-down' },
  'gift': { library: 'Feather', name: 'gift' },
  'coffee': { library: 'Feather', name: 'coffee' },
  'music': { library: 'Feather', name: 'music' },
  'map-pin': { library: 'Feather', name: 'map-pin' },
  'calendar': { library: 'Feather', name: 'calendar' },
  'clock': { library: 'Feather', name: 'clock' },
  
  // Notification Icons
  'bell': { library: 'Feather', name: 'bell' },
  'bell-off': { library: 'Feather', name: 'bell-off' },
  'notifications-off': { library: 'Feather', name: 'bell-off' },
  'alert-circle': { library: 'Feather', name: 'alert-circle' },
  'info': { library: 'Feather', name: 'info' },
  
  // Profile & Account Icons
  'user-check': { library: 'Feather', name: 'user-check' },
  'user-plus': { library: 'Feather', name: 'user-plus' },
  'user-minus': { library: 'Feather', name: 'user-minus' },
  'user-x': { library: 'Feather', name: 'user-x' },
  'shield': { library: 'Feather', name: 'shield' },
  'lock': { library: 'Feather', name: 'lock' },
  'unlock': { library: 'Feather', name: 'unlock' },
  'eye': { library: 'Feather', name: 'eye' },
  'eye-off': { library: 'Feather', name: 'eye-off' },
  
  // Media & File Icons
  'file': { library: 'Feather', name: 'file' },
  'file-text': { library: 'Feather', name: 'file-text' },
  'download': { library: 'Feather', name: 'download' },
  'upload': { library: 'Feather', name: 'upload' },
  'share': { library: 'Feather', name: 'share-2' },
  'link': { library: 'Feather', name: 'link' },
  
  // Status & Connection Icons
  'wifi': { library: 'Feather', name: 'wifi' },
  'wifi-off': { library: 'Feather', name: 'wifi-off' },
  'signal': { library: 'Feather', name: 'bar-chart-2' },
  'battery': { library: 'Feather', name: 'battery' },
  'refresh': { library: 'Feather', name: 'refresh-cw' },
  'loader': { library: 'Feather', name: 'loader' },
  
  // Navigation & Movement
  'chevron-left': { library: 'Feather', name: 'chevron-left' },
  'chevron-right': { library: 'Feather', name: 'chevron-right' },
  'chevron-up': { library: 'Feather', name: 'chevron-up' },
  'chevron-down': { library: 'Feather', name: 'chevron-down' },
  'expand-more': { library: 'MaterialIcons', name: 'expand-more' },
  'expand-less': { library: 'MaterialIcons', name: 'expand-less' },
  
  // Activity & Lifestyle Icons
  'activity': { library: 'Feather', name: 'activity' },
  'zap': { library: 'Feather', name: 'zap' },
  'trending-up': { library: 'Feather', name: 'trending-up' },
  'award': { library: 'Feather', name: 'award' },
  'target': { library: 'Feather', name: 'target' },
  'compass': { library: 'Feather', name: 'compass' },
  
  // Communication Enhanced
  'message-square': { library: 'Feather', name: 'message-square' },
  'mail': { library: 'Feather', name: 'mail' },
  'at-sign': { library: 'Feather', name: 'at-sign' },
  'hash': { library: 'Feather', name: 'hash' },
  
  // Dating Specific
  'flame': { library: 'MaterialCommunityIcons', name: 'fire' },
  'diamond': { library: 'MaterialCommunityIcons', name: 'diamond-stone' },
  'crown': { library: 'MaterialCommunityIcons', name: 'crown' },
  'lightning': { library: 'MaterialCommunityIcons', name: 'lightning-bolt' },
  'sparkle': { library: 'MaterialCommunityIcons', name: 'sparkles' },
  
  // Specialty Icons
  'toggle-left': { library: 'Feather', name: 'toggle-left' },
  'toggle-right': { library: 'Feather', name: 'toggle-right' },
  'slider': { library: 'Feather', name: 'sliders' },
  'layers': { library: 'Feather', name: 'layers' },
  'grid': { library: 'Feather', name: 'grid' },
  'list': { library: 'Feather', name: 'list' },
  
  // Emergency & Support
  'help-circle': { library: 'Feather', name: 'help-circle' },
  'life-buoy': { library: 'Feather', name: 'life-buoy' },
  'flag': { library: 'Feather', name: 'flag' },
  'alert-triangle': { library: 'Feather', name: 'alert-triangle' },
  
  // Additional UI Icons
  'verified': { library: 'MaterialIcons', name: 'verified' },
  'tune': { library: 'MaterialIcons', name: 'tune' },
  'favorite': { library: 'MaterialIcons', name: 'favorite' },
  'chat-bubble-outline': { library: 'MaterialIcons', name: 'chat-bubble-outline' },
  
  // Message Status Icons
  'schedule': { library: 'MaterialIcons', name: 'schedule' },
  'done-all': { library: 'MaterialIcons', name: 'done-all' },
  'error': { library: 'MaterialIcons', name: 'error' },
  'person': { library: 'MaterialIcons', name: 'person' },
  'call': { library: 'MaterialIcons', name: 'call' },
  'attach-file': { library: 'MaterialIcons', name: 'attach-file' },
  'arrow-back': { library: 'MaterialIcons', name: 'arrow-back' },
  
  // Settings Icons
  'notifications': { library: 'MaterialIcons', name: 'notifications' },
  'message': { library: 'MaterialIcons', name: 'message' },
  'thumb-up': { library: 'MaterialIcons', name: 'thumb-up' },
  'email': { library: 'MaterialIcons', name: 'email' },
  'visibility': { library: 'MaterialIcons', name: 'visibility' },
  'location-on': { library: 'MaterialIcons', name: 'location-on' },
  'play-circle-outline': { library: 'MaterialIcons', name: 'play-circle-outline' },
  'play-circle': { library: 'MaterialIcons', name: 'play-circle' },
  'vibration': { library: 'MaterialIcons', name: 'vibration' },
  'star-rate': { library: 'MaterialIcons', name: 'star-rate' },
  'help-outline': { library: 'MaterialIcons', name: 'help-outline' },
  'privacy-tip': { library: 'MaterialIcons', name: 'privacy-tip' },
  'description': { library: 'MaterialIcons', name: 'description' },
  'delete-forever': { library: 'MaterialIcons', name: 'delete-forever' },
  
  // Group and additional UI icons
  'group': { library: 'MaterialIcons', name: 'group' },
  'volume-off': { library: 'MaterialIcons', name: 'volume-off' },
  'push-pin': { library: 'MaterialIcons', name: 'push-pin' },
  'clear': { library: 'MaterialIcons', name: 'clear' },
  'add': { library: 'MaterialIcons', name: 'add' },
  'chat-bubble-outline': { library: 'MaterialIcons', name: 'chat-bubble-outline' },
  
  // Document and file icons
  'picture-as-pdf': { library: 'MaterialIcons', name: 'picture-as-pdf' },
  'table-chart': { library: 'MaterialIcons', name: 'table-chart' },
  'slideshow': { library: 'MaterialIcons', name: 'slideshow' },
  'archive': { library: 'MaterialIcons', name: 'archive' },
  'insert-drive-file': { library: 'MaterialIcons', name: 'insert-drive-file' },
  'more-vert': { library: 'MaterialIcons', name: 'more-vert' },
  'reply': { library: 'MaterialIcons', name: 'reply' },
  'forward': { library: 'MaterialIcons', name: 'forward' },
  'content-copy': { library: 'MaterialIcons', name: 'content-copy' },
  'brightness-auto': { library: 'MaterialIcons', name: 'brightness-auto' },
  
  // Profile screen icons
  'camera-alt': { library: 'MaterialIcons', name: 'camera-alt' },
  'dark-mode': { library: 'MaterialIcons', name: 'dark-mode' },
  'security': { library: 'MaterialIcons', name: 'security' },
  'help': { library: 'MaterialIcons', name: 'help' },
  'add-a-photo': { library: 'MaterialIcons', name: 'add-a-photo' },
  
  // Reels specific icons
  'play-arrow': { library: 'MaterialIcons', name: 'play-arrow' },
  'more-horiz': { library: 'MaterialIcons', name: 'more-horiz' },
  'favorite-outline': { library: 'MaterialIcons', name: 'favorite-border' },
  
  // Voice and audio icons
  'pause': { library: 'MaterialIcons', name: 'pause' },
  'stop': { library: 'MaterialIcons', name: 'stop' },
  'volume-mute': { library: 'MaterialIcons', name: 'volume-mute' },
  'volume-up': { library: 'MaterialIcons', name: 'volume-up' },
  'fast-forward': { library: 'MaterialIcons', name: 'fast-forward' },
  'fast-rewind': { library: 'MaterialIcons', name: 'fast-rewind' },
  'skip-next': { library: 'MaterialIcons', name: 'skip-next' },
  'skip-previous': { library: 'MaterialIcons', name: 'skip-previous' },
  'repeat': { library: 'MaterialIcons', name: 'repeat' },
  'shuffle': { library: 'MaterialIcons', name: 'shuffle' },
};

// Icon component libraries
const ICON_LIBRARIES = {
  MaterialIcons,
  MaterialCommunityIcons,
  Ionicons,
  Feather,
  FontAwesome5,
  AntDesign,
};

// Main Icon component
const Icon: React.FC<IconProps> = ({ name, size = 24, color = '#000', style }) => {
  const iconConfig = ICON_REGISTRY[name as keyof typeof ICON_REGISTRY];
  
  if (!iconConfig) {
    console.warn(`Icon '${name}' not found in registry`);
    // Fallback to a default icon
    return <Feather name="help-circle" size={size} color={color} style={style} />;
  }
  
  const IconComponent = ICON_LIBRARIES[iconConfig.library as keyof typeof ICON_LIBRARIES];
  
  if (!IconComponent) {
    console.warn(`Icon library '${iconConfig.library}' not found`);
    return <Feather name="help-circle" size={size} color={color} style={style} />;
  }
  
  return (
    <IconComponent 
      name={iconConfig.name} 
      size={size} 
      color={color} 
      style={style} 
    />
  );
};

export default Icon;
