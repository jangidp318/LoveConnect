// Simplified Image Viewer Modal
// Stable version without complex gestures or nested modals

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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../icons/IconRegistry';
import { useTheme } from '../../store/themeStore';
import { Message } from '../../types/chat';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SimpleImageViewerProps {
  visible: boolean;
  imageUri: string;
  message?: Message;
  onClose: () => void;
}

const SimpleImageViewer: React.FC<SimpleImageViewerProps> = ({
  visible,
  imageUri,
  message,
  onClose,
}) => {
  const { theme } = useTheme();
  const [showControls, setShowControls] = useState(true);

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

  const imageInfo = getImageInfo();

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share functionality will be added soon!');
  };

  const handleSave = () => {
    Alert.alert('Save', 'Save functionality will be added soon!');
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      
      <View style={styles.container}>
        {/* Header */}
        {showControls && (
          <View style={styles.header}>
            <SafeAreaView edges={['top']} style={styles.safeArea}>
              <View style={styles.headerContent}>
                <TouchableOpacity
                  style={styles.closeButton}
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
                
                <View style={styles.headerActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleShare}
                    activeOpacity={0.7}
                  >
                    <Icon name="share" size={24} color="white" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleSave}
                    activeOpacity={0.7}
                  >
                    <Icon name="download" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </View>
        )}

        {/* Image */}
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={toggleControls}
          activeOpacity={1}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            maximumZoomScale={3}
            minimumZoomScale={1}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            centerContent
          >
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="contain"
            />
          </ScrollView>
        </TouchableOpacity>

        {/* Footer */}
        {showControls && (
          <View style={styles.footer}>
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
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
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
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
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
  },
  scrollContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: screenHeight,
    minWidth: screenWidth,
  },
  image: {
    width: screenWidth,
    height: screenHeight * 0.8,
    maxWidth: screenWidth,
    maxHeight: screenHeight * 0.8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.7)',
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
});

export default SimpleImageViewer;
