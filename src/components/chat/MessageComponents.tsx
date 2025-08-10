// Enhanced Message Components
// Specialized components for different message types: images, location, etc.

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Linking,
} from 'react-native';
import Icon from '../icons/IconRegistry';
import { Message } from '../../types/chat';
import SimpleImageViewer from '../modals/SimpleImageViewer';

const { width: screenWidth } = Dimensions.get('window');
const MAX_IMAGE_WIDTH = screenWidth * 0.65;
const MAX_IMAGE_HEIGHT = 300;
const MAP_HEIGHT = 150;

interface MessageComponentProps {
  message: Message;
  isCurrentUser: boolean;
  theme: any;
  onPress?: () => void;
  onLongPress?: (event: any) => void;
}

// Image Message Component
export const ImageMessageBubble: React.FC<MessageComponentProps> = ({
  message,
  isCurrentUser,
  theme,
  onPress,
  onLongPress,
}) => {
  const [showImageViewer, setShowImageViewer] = useState(false);
  // Extract image URL from message text (format: "📷 Image: filename.jpg||file:///path/to/image")
  const extractImageInfo = () => {
    const parts = message.text.split('||');
    if (parts.length >= 2) {
      // Extract filename from the first part
      const imageMatch = parts[0].match(/📷 Image(?:: (.+))?/);
      const filename = imageMatch?.[1] || 'image.jpg';
      // Use the actual URI from the second part
      const uri = parts[1];
      return {
        uri,
        filename,
      };
    }
    
    // Fallback for old format or demo messages
    const imageMatch = message.text.match(/📷 Image(?:: (.+))?/);
    if (imageMatch) {
      const filename = imageMatch[1] || 'image.jpg';
      // Use a placeholder for demo messages
      return {
        uri: `https://picsum.photos/400/300?random=${message.id}`,
        filename,
      };
    }
    return null;
  };

  const imageInfo = extractImageInfo();
  
  if (!imageInfo) {
    // Fallback to regular text bubble if image info not found
    return (
      <View style={[styles.messageBubble, {
        backgroundColor: isCurrentUser ? theme.colors.love : theme.colors.card,
        borderColor: theme.colors.border,
      }]}>
        <Text style={[styles.messageText, {
          color: isCurrentUser ? 'white' : theme.colors.text,
        }]}>
          {message.text}
        </Text>
      </View>
    );
  }

  const handleImagePress = () => {
    if (onPress) {
      onPress();
    } else {
      setShowImageViewer(true);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.imageBubble, {
          borderColor: theme.colors.border,
        }]}
        onPress={handleImagePress}
        onLongPress={onLongPress}
        activeOpacity={0.8}
      >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageInfo.uri }}
          style={styles.messageImage}
          resizeMode="cover"
        />
        
        {/* Image overlay with info */}
        <View style={[styles.imageOverlay, {
          backgroundColor: isCurrentUser ? theme.colors.love + '90' : theme.colors.background + '90',
        }]}>
          <View style={styles.imageInfo}>
            <Icon name="camera" size={16} color="white" />
            <Text style={styles.imageFilename} numberOfLines={1}>
              {imageInfo.filename}
            </Text>
          </View>
          
          <Text style={[styles.messageTime, {
            color: 'white',
          }]}>
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </View>
      </TouchableOpacity>
      
      {/* Full-screen Image Viewer */}
      <SimpleImageViewer
        visible={showImageViewer}
        imageUri={imageInfo.uri}
        message={message}
        onClose={() => setShowImageViewer(false)}
      />
    </>
  );
};

// Location Message Component  
export const LocationMessageBubble: React.FC<MessageComponentProps> = ({
  message,
  isCurrentUser,
  theme,
  onPress,
  onLongPress,
}) => {
  // Extract location info from message text (format: "📍 Location: lat, lng||address")
  const extractLocationInfo = () => {
    const parts = message.text.split('||');
    
    if (parts.length >= 2) {
      // New format with embedded address
      const locationMatch = parts[0].match(/📍 Location: ([-+]?[0-9]*\.?[0-9]+), ([-+]?[0-9]*\.?[0-9]+)/);
      if (locationMatch) {
        return {
          latitude: parseFloat(locationMatch[1]),
          longitude: parseFloat(locationMatch[2]),
          address: parts[1] || `${parseFloat(locationMatch[1]).toFixed(4)}, ${parseFloat(locationMatch[2]).toFixed(4)}`,
        };
      }
    }
    
    // Fallback for old format
    const locationMatch = message.text.match(/📍 Location: ([-+]?[0-9]*\.?[0-9]+), ([-+]?[0-9]*\.?[0-9]+)/);
    if (locationMatch) {
      return {
        latitude: parseFloat(locationMatch[1]),
        longitude: parseFloat(locationMatch[2]),
        address: `${parseFloat(locationMatch[1]).toFixed(4)}, ${parseFloat(locationMatch[2]).toFixed(4)}`,
      };
    }
    return null;
  };

  const locationInfo = extractLocationInfo();
  
  if (!locationInfo) {
    // Fallback to regular text bubble if location info not found
    return (
      <View style={[styles.messageBubble, {
        backgroundColor: isCurrentUser ? theme.colors.love : theme.colors.card,
        borderColor: theme.colors.border,
      }]}>
        <Text style={[styles.messageText, {
          color: isCurrentUser ? 'white' : theme.colors.text,
        }]}>
          {message.text}
        </Text>
      </View>
    );
  }

  const openInMaps = () => {
    const { latitude, longitude } = locationInfo;
    const url = `https://maps.google.com/?q=${latitude},${longitude}`;
    
    Alert.alert(
      'Open Location',
      'Do you want to open this location in Maps?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Maps',
          onPress: () => Linking.openURL(url),
        },
      ]
    );
  };

  // Generate static map image URL (using a mapping service)
  const mapImageUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${locationInfo.longitude},${locationInfo.latitude})/${locationInfo.longitude},${locationInfo.latitude},15,0/400x${MAP_HEIGHT}@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA`;

  return (
    <TouchableOpacity
      style={[styles.locationBubble, {
        borderColor: theme.colors.border,
      }]}
      onPress={onPress || openInMaps}
      onLongPress={onLongPress}
      activeOpacity={0.8}
    >
      <View style={styles.locationContainer}>
        {/* Map Preview */}
        <View style={styles.mapContainer}>
          <Image
            source={{ uri: mapImageUrl }}
            style={styles.mapImage}
            resizeMode="cover"
          />
          
          {/* Location pin overlay */}
          <View style={styles.mapOverlay}>
            <Icon name="map-pin" size={24} color={theme.colors.error} />
          </View>
        </View>
        
        {/* Location Details */}
        <View style={[styles.locationDetails, {
          backgroundColor: isCurrentUser ? theme.colors.love : theme.colors.card,
        }]}>
          <View style={styles.locationHeader}>
            <Icon name="location-on" size={18} color={isCurrentUser ? 'white' : theme.colors.love} />
            <Text style={[styles.locationTitle, {
              color: isCurrentUser ? 'white' : theme.colors.text,
            }]}>
              Current Location
            </Text>
          </View>
          
          <Text style={[styles.locationAddress, {
            color: isCurrentUser ? 'rgba(255,255,255,0.9)' : theme.colors.textSecondary,
          }]} numberOfLines={2}>
            {locationInfo.address}
          </Text>
          
          <View style={styles.locationFooter}>
            <Text style={[styles.locationAction, {
              color: isCurrentUser ? 'rgba(255,255,255,0.8)' : theme.colors.love,
            }]}>
              Tap to open in Maps
            </Text>
            
            <Text style={[styles.messageTime, {
              color: isCurrentUser ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary,
            }]}>
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Document/File Message Component
export const DocumentMessageBubble: React.FC<MessageComponentProps> = ({
  message,
  isCurrentUser,
  theme,
  onPress,
  onLongPress,
}) => {
  // Extract document info from message text (format: "📄 filename.ext||file:///path")
  const extractDocumentInfo = () => {
    const parts = message.text.split('||');
    
    if (parts.length >= 2) {
      // New format with URI
      const docMatch = parts[0].match(/📄 (.+)/);
      if (docMatch) {
        const filename = docMatch[1];
        const extension = filename.split('.').pop()?.toLowerCase() || '';
        return {
          filename,
          extension,
          uri: parts[1],
        };
      }
    }
    
    // Fallback for old format
    const docMatch = message.text.match(/📄 (.+)/);
    if (docMatch) {
      const filename = docMatch[1];
      const extension = filename.split('.').pop()?.toLowerCase() || '';
      return {
        filename,
        extension,
      };
    }
    return null;
  };

  const documentInfo = extractDocumentInfo();
  
  if (!documentInfo) {
    // Fallback to regular text bubble
    return (
      <View style={[styles.messageBubble, {
        backgroundColor: isCurrentUser ? theme.colors.love : theme.colors.card,
        borderColor: theme.colors.border,
      }]}>
        <Text style={[styles.messageText, {
          color: isCurrentUser ? 'white' : theme.colors.text,
        }]}>
          {message.text}
        </Text>
      </View>
    );
  }

  const getFileIcon = (extension: string) => {
    switch (extension) {
      case 'pdf':
        return 'picture-as-pdf';
      case 'doc':
      case 'docx':
        return 'description';
      case 'xls':
      case 'xlsx':
        return 'table-chart';
      case 'ppt':
      case 'pptx':
        return 'slideshow';
      case 'zip':
      case 'rar':
        return 'archive';
      default:
        return 'insert-drive-file';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.documentBubble, {
        backgroundColor: isCurrentUser ? theme.colors.love : theme.colors.card,
        borderColor: theme.colors.border,
      }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
    >
      <View style={styles.documentContainer}>
        <View style={[styles.documentIcon, {
          backgroundColor: isCurrentUser ? 'rgba(255,255,255,0.2)' : theme.colors.love + '20',
        }]}>
          <Icon
            name={getFileIcon(documentInfo.extension)}
            size={24}
            color={isCurrentUser ? 'white' : theme.colors.love}
          />
        </View>
        
        <View style={styles.documentInfo}>
          <Text style={[styles.documentName, {
            color: isCurrentUser ? 'white' : theme.colors.text,
          }]} numberOfLines={2}>
            {documentInfo.filename}
          </Text>
          
          <Text style={[styles.documentType, {
            color: isCurrentUser ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary,
          }]}>
            {documentInfo.extension.toUpperCase()} Document
          </Text>
        </View>
        
        <Icon
          name="download"
          size={20}
          color={isCurrentUser ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary}
        />
      </View>
      
      <Text style={[styles.messageTime, {
        color: isCurrentUser ? 'rgba(255,255,255,0.8)' : theme.colors.textSecondary,
        alignSelf: 'flex-end',
        marginTop: 4,
      }]}>
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Common bubble styles
  messageBubble: {
    maxWidth: MAX_IMAGE_WIDTH,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },

  // Image message styles
  imageBubble: {
    maxWidth: MAX_IMAGE_WIDTH,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  messageImage: {
    width: MAX_IMAGE_WIDTH,
    height: MAX_IMAGE_HEIGHT,
    borderRadius: 18,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  imageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  imageFilename: {
    color: 'white',
    fontSize: 14,
    marginLeft: 6,
    flex: 1,
  },

  // Location message styles
  locationBubble: {
    maxWidth: MAX_IMAGE_WIDTH,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  locationContainer: {
    backgroundColor: 'transparent',
  },
  mapContainer: {
    position: 'relative',
    height: MAP_HEIGHT,
  },
  mapImage: {
    width: '100%',
    height: MAP_HEIGHT,
  },
  mapOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  locationDetails: {
    padding: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  locationAddress: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  locationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationAction: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Document message styles
  documentBubble: {
    maxWidth: MAX_IMAGE_WIDTH,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  documentType: {
    fontSize: 12,
  },
});
