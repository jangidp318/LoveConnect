// Full-Screen Image Viewer Modal
// Beautiful image viewer with zoom, pan, and sharing capabilities

import React, { useState } from 'react';
import {
  View,
  Modal,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  Share,
  Platform,
  ScrollView,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../icons/IconRegistry';
import { useTheme } from '../../store/themeStore';
import { Message } from '../../types/chat';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ImageViewerModalProps {
  visible: boolean;
  imageUri: string;
  message?: Message;
  onClose: () => void;
  onSave?: () => void;
  onShare?: () => void;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  visible,
  imageUri,
  message,
  onClose,
  onSave,
  onShare,
}) => {
  const { theme } = useTheme();
  const [showControls, setShowControls] = useState(true);
  const [showActionMenu, setShowActionMenu] = useState(false);
  
  // Reset state when modal visibility changes
  React.useEffect(() => {
    if (visible) {
      setShowControls(true);
      setShowActionMenu(false);
    }
  }, [visible]);
  
  // Toggle controls visibility
  const toggleControls = () => {
    setShowControls(!showControls);
  };

  // Handle share
  const handleShare = async () => {
    try {
      if (onShare) {
        onShare();
        return;
      }

      const result = await Share.share({
        url: imageUri,
        message: message ? `Shared from LoveConnect chat with ${message.senderName}` : 'Shared from LoveConnect',
      });
      
      if (result.action === Share.sharedAction) {
        Alert.alert('Success', 'Image shared successfully!');
      }
    } catch (error) {
      console.error('Error sharing image:', error);
      Alert.alert('Error', 'Failed to share image');
    }
  };

  // Handle save
  const handleSave = () => {
    if (onSave) {
      onSave();
    } else {
      Alert.alert('Save Image', 'Save functionality will be implemented in the next version!');
    }
  };

  // Get image info
  const getImageInfo = () => {
    if (!message) return { filename: 'image.jpg', timestamp: new Date() };
    
    const parts = message.text.split('||');
    const imageMatch = parts[0].match(/📷 Image(?:: (.+))?/);
    const filename = imageMatch?.[1] || 'image.jpg';
    
    return {
      filename,
      timestamp: message.timestamp,
      senderName: message.senderName,
    };
  };

  // Handle copy link
  const handleCopyLink = async () => {
    try {
      await Clipboard.setString(imageUri);
      Alert.alert('Copied', 'Image link copied to clipboard!');
    } catch (error) {
      console.error('Error copying link:', error);
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  // Handle reply
  const handleReply = () => {
    Alert.alert('Reply', 'Reply functionality will be implemented soon!');
    onClose();
  };

  // Handle edit
  const handleEdit = () => {
    Alert.alert('Edit Caption', 'Edit functionality will be implemented soon!');
  };

  // Handle delete
  const handleDelete = () => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Deleted', 'Delete functionality will be implemented soon!');
          },
        },
      ]
    );
  };

  const imageInfo = getImageInfo();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      
      <View style={[styles.container, { backgroundColor: 'rgba(0, 0, 0, 0.9)' }]}>
        {/* Header Controls */}
        {showControls && (
          <View style={[styles.header, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
            <SafeAreaView edges={['top']} style={styles.safeArea}>
              <View style={styles.headerContent}>
                <TouchableOpacity
                  style={[styles.headerButton, styles.headerButtonWithBg]}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Icon name="close" size={24} color="white" />
                </TouchableOpacity>
                
                <View style={styles.headerInfo}>
                  <Text style={styles.imageTitle} numberOfLines={1}>
                    {imageInfo.filename}
                  </Text>
                  <Text style={styles.imageSubtitle}>
                    {message ? `From ${imageInfo.senderName}` : 'Image'}
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={[styles.headerButton, styles.headerButtonWithBg]}
                  onPress={() => setShowActionMenu(true)}
                  activeOpacity={0.7}
                >
                  <Icon name="more-vert" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        )}

        {/* Image Container with ScrollView for zoom */}
        <View style={styles.imageContainer}>
          <TouchableOpacity
            style={styles.imageWrapper}
            onPress={toggleControls}
            activeOpacity={1}
          >
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContainer}
              maximumZoomScale={3}
              minimumZoomScale={1}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              centerContent={true}
              bounces={false}
            >
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                resizeMode="contain"
              />
            </ScrollView>
          </TouchableOpacity>
        </View>

        {/* Footer Controls */}
        {showControls && (
          <View style={[styles.footer, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
            <SafeAreaView edges={['bottom']} style={styles.safeArea}>
              <View style={styles.footerContent}>
                <Text style={styles.footerText}>
                  {new Date(imageInfo.timestamp).toLocaleString()}
                </Text>
                <Text style={styles.gestureHint}>
                  Tap to toggle controls • Pinch to zoom • Double tap to fit
                </Text>
              </View>
            </SafeAreaView>
          </View>
        )}
        
        {/* Action Menu Modal */}
        {showActionMenu && (
          <Modal
            visible={showActionMenu}
            transparent
            animationType="slide"
            onRequestClose={() => setShowActionMenu(false)}
          >
            <TouchableOpacity
              style={styles.actionMenuOverlay}
              onPress={() => setShowActionMenu(false)}
              activeOpacity={1}
            >
              <TouchableOpacity activeOpacity={1}>
                <View style={[styles.actionMenu, { backgroundColor: theme.colors.card }]}>
                  <Text style={[styles.actionMenuTitle, { color: theme.colors.text }]}>
                    Image Actions
                  </Text>
              
              <TouchableOpacity
                style={styles.actionMenuItem}
                onPress={() => {
                  setShowActionMenu(false);
                  handleShare();
                }}
              >
                <Icon name="share" size={24} color={theme.colors.text} />
                <Text style={[styles.actionMenuText, { color: theme.colors.text }]}>Share</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionMenuItem}
                onPress={() => {
                  setShowActionMenu(false);
                  handleSave();
                }}
              >
                <Icon name="download" size={24} color={theme.colors.text} />
                <Text style={[styles.actionMenuText, { color: theme.colors.text }]}>Save to Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionMenuItem}
                onPress={() => {
                  setShowActionMenu(false);
                  handleCopyLink();
                }}
              >
                <Icon name="link" size={24} color={theme.colors.text} />
                <Text style={[styles.actionMenuText, { color: theme.colors.text }]}>Copy Link</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionMenuItem}
                onPress={() => {
                  setShowActionMenu(false);
                  handleReply();
                }}
              >
                <Icon name="reply" size={24} color={theme.colors.text} />
                <Text style={[styles.actionMenuText, { color: theme.colors.text }]}>Reply</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionMenuItem}
                onPress={() => {
                  setShowActionMenu(false);
                  handleEdit();
                }}
              >
                <Icon name="edit" size={24} color={theme.colors.text} />
                <Text style={[styles.actionMenuText, { color: theme.colors.text }]}>Edit Caption</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionMenuItem, styles.actionMenuItemDanger]}
                onPress={() => {
                  setShowActionMenu(false);
                  handleDelete();
                }}
              >
                <Icon name="delete" size={24} color={theme.colors.error} />
                <Text style={[styles.actionMenuText, { color: theme.colors.error }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
  },
  imageTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  imageSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  imageWrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: screenWidth,
    minHeight: screenHeight,
  },
  image: {
    width: screenWidth,
    height: screenHeight - 160,
    maxWidth: screenWidth,
    maxHeight: screenHeight - 160,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  footerContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  footerText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 4,
  },
  gestureHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
  headerButtonWithBg: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  actionMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  actionMenu: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    minWidth: 280,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  actionMenuTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  actionMenuItemDanger: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,0,0,0.1)',
    paddingTop: 16,
  },
  actionMenuText: {
    fontSize: 16,
    marginLeft: 16,
    fontWeight: '500',
  },
});

export default ImageViewerModal;
