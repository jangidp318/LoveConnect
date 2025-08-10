import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { launchCamera, launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
// import DocumentPicker from 'react-native-document-picker';
import Geolocation from '@react-native-community/geolocation';
import Icon from '../icons/IconRegistry';
import { useTheme } from '../../store/themeStore';

const { width } = Dimensions.get('window');

interface MediaOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  onPress: () => void;
}

export interface MediaFile {
  uri: string;
  type: 'image' | 'video' | 'document' | 'audio' | 'location' | 'contact';
  name?: string;
  size?: number;
  mimeType?: string;
  duration?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
}

interface MediaPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onMediaSelected?: (media: MediaFile) => void;
}

const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  visible,
  onClose,
  onMediaSelected,
}) => {
  const { theme } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);

  // Request camera permission (Android)
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to camera to take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Request location permission
  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to location to share your current position.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleCameraPress = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        return;
      }

      setIsProcessing(true);
      launchCamera(
        {
          mediaType: 'mixed' as MediaType,
          quality: 0.8,
          maxWidth: 2000,
          maxHeight: 2000,
          includeBase64: false,
          saveToPhotos: false,
        },
        (response: ImagePickerResponse) => {
          setIsProcessing(false);
          
          if (response.didCancel || response.errorMessage) {
            return;
          }

          if (response.assets && response.assets[0]) {
            const asset = response.assets[0];
            const mediaFile: MediaFile = {
              uri: asset.uri!,
              type: asset.type?.startsWith('video') ? 'video' : 'image',
              name: asset.fileName,
              size: asset.fileSize,
              mimeType: asset.type,
              duration: asset.duration,
            };
            onMediaSelected?.(mediaFile);
            onClose();
          }
        }
      );
    } catch (error) {
      setIsProcessing(false);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const handleGalleryPress = () => {
    try {
      setIsProcessing(true);
      launchImageLibrary(
        {
          mediaType: 'mixed' as MediaType,
          quality: 0.8,
          maxWidth: 2000,
          maxHeight: 2000,
          includeBase64: false,
          selectionLimit: 1,
        },
        (response: ImagePickerResponse) => {
          setIsProcessing(false);
          
          if (response.didCancel || response.errorMessage) {
            return;
          }

          if (response.assets && response.assets[0]) {
            const asset = response.assets[0];
            const mediaFile: MediaFile = {
              uri: asset.uri!,
              type: asset.type?.startsWith('video') ? 'video' : 'image',
              name: asset.fileName,
              size: asset.fileSize,
              mimeType: asset.type,
              duration: asset.duration,
            };
            onMediaSelected?.(mediaFile);
            onClose();
          }
        }
      );
    } catch (error) {
      setIsProcessing(false);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    }
  };

  const handleDocumentPress = async () => {
    // Temporarily disabled for Android compatibility
    Alert.alert('Coming Soon', 'Document sharing will be available in a future update.');
    // try {
    //   setIsProcessing(true);
    //   const result = await DocumentPicker.pick({
    //     type: [DocumentPicker.types.allFiles],
    //     allowMultiSelection: false,
    //   });

    //   if (result && result[0]) {
    //     const doc = result[0];
    //     const mediaFile: MediaFile = {
    //       uri: doc.uri,
    //       type: 'document',
    //       name: doc.name,
    //       size: doc.size || undefined,
    //       mimeType: doc.type,
    //     };
    //     onMediaSelected?.(mediaFile);
    //     onClose();
    //   }
    // } catch (error) {
    //   if (DocumentPicker.isCancel(error)) {
    //     // User cancelled the picker
    //   } else {
    //     Alert.alert('Error', 'Failed to pick document. Please try again.');
    //   }
    // } finally {
    //   setIsProcessing(false);
    // }
  };

  const handleLocationPress = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Location permission is required to share your location.');
        return;
      }

      setIsProcessing(true);
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Try to get address from coordinates (reverse geocoding)
          // For now, we'll use a simple format
          const address = `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          
          const locationFile: MediaFile = {
            uri: `geo:${latitude},${longitude}`,
            type: 'location',
            name: 'Current Location',
            latitude,
            longitude,
            address,
          };
          
          onMediaSelected?.(locationFile);
          setIsProcessing(false);
          onClose();
        },
        (error) => {
          setIsProcessing(false);
          Alert.alert('Error', 'Failed to get your location. Please check your GPS settings.');
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    } catch (error) {
      setIsProcessing(false);
      Alert.alert('Error', 'Failed to get location. Please try again.');
    }
  };

  const handleContactPress = () => {
    // For now, show coming soon alert
    // In a real app, you'd integrate with react-native-contacts
    Alert.alert('Coming Soon', 'Contact sharing will be available in a future update.');
  };

  const handleAudioPress = () => {
    // For now, show coming soon alert
    // In a real app, you'd integrate with react-native-audio-recorder-player
    Alert.alert('Coming Soon', 'Voice messages will be available in a future update.');
  };

  const mediaOptions: MediaOption[] = [
    {
      id: 'camera',
      title: 'Camera',
      subtitle: 'Take a photo',
      icon: 'camera-alt',
      color: '#4CAF50',
      onPress: handleCameraPress,
    },
    {
      id: 'gallery',
      title: 'Gallery',
      subtitle: 'Choose from gallery',
      icon: 'photo-library',
      color: '#2196F3',
      onPress: handleGalleryPress,
    },
    {
      id: 'document',
      title: 'Document',
      subtitle: 'Share a file',
      icon: 'description',
      color: '#FF9800',
      onPress: handleDocumentPress,
    },
    {
      id: 'location',
      title: 'Location',
      subtitle: 'Share your location',
      icon: 'location-on',
      color: '#f44336',
      onPress: handleLocationPress,
    },
    {
      id: 'contact',
      title: 'Contact',
      subtitle: 'Share a contact',
      icon: 'contacts',
      color: '#9C27B0',
      onPress: handleContactPress,
    },
    {
      id: 'audio',
      title: 'Audio',
      subtitle: 'Record voice message',
      icon: 'mic',
      color: theme.colors.love,
      onPress: handleAudioPress,
    },
  ];

  const renderMediaOption = (option: MediaOption) => (
    <TouchableOpacity
      key={option.id}
      style={[
        styles.optionButton,
        { 
          backgroundColor: theme.colors.card,
          opacity: isProcessing ? 0.5 : 1
        }
      ]}
      onPress={option.onPress}
      activeOpacity={0.7}
      disabled={isProcessing}
    >
      <View style={[styles.optionIcon, { backgroundColor: option.color + '20' }]}>
        <Icon name={option.icon} size={28} color={option.color} />
      </View>
      <Text style={[styles.optionTitle, { color: theme.colors.text }]}>
        {option.title}
      </Text>
      <Text style={[styles.optionSubtitle, { color: theme.colors.textSecondary }]}>
        {option.subtitle}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Share Media
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Options Grid */}
          <View style={styles.optionsGrid}>
            {mediaOptions.map(renderMediaOption)}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  optionButton: {
    width: (width - 48) / 2,
    aspectRatio: 1.2,
    margin: 4,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  optionSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default MediaPickerModal;
