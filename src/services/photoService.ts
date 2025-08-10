// Photo Service
// Handle camera integration, photo selection, and image management

import { Alert } from 'react-native';

export interface PhotoAsset {
  id: string;
  uri: string;
  width: number;
  height: number;
  filename: string;
  type: string;
  fileSize?: number;
  timestamp?: Date;
}

export interface PhotoUploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  includeBase64?: boolean;
  mediaType?: 'photo' | 'video' | 'mixed';
}

export interface CameraOptions extends PhotoUploadOptions {
  useFrontCamera?: boolean;
  allowsEditing?: boolean;
}

export interface GalleryOptions extends PhotoUploadOptions {
  selectionLimit?: number;
  includeBase64?: boolean;
}

class PhotoService {
  private defaultOptions: PhotoUploadOptions = {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8,
    includeBase64: false,
    mediaType: 'photo',
  };

  // Request camera permissions
  async requestCameraPermissions(): Promise<boolean> {
    try {
      const { check, request, PERMISSIONS, RESULTS } = require('react-native-permissions');
      const { Platform } = require('react-native');
      
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA;
      
      let result = await check(permission);
      
      if (result === RESULTS.DENIED) {
        result = await request(permission);
      }
      
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Failed to request camera permissions:', error);
      // Fallback for development
      return true;
    }
  }

  // Request photo library permissions
  async requestPhotoLibraryPermissions(): Promise<boolean> {
    try {
      // This would integrate with react-native-permissions
      // For now, return true as placeholder
      return true;
    } catch (error) {
      console.error('Failed to request photo library permissions:', error);
      return false;
    }
  }

  // Take photo with camera
  async takePhoto(options?: CameraOptions): Promise<PhotoAsset | null> {
    try {
      const hasPermission = await this.requestCameraPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access in your device settings to take photos.',
          [{ text: 'OK' }]
        );
        return null;
      }

      const finalOptions = { ...this.defaultOptions, ...options };

      // This would integrate with react-native-image-picker
      // For now, return mock data
      const mockPhoto: PhotoAsset = {
        id: this.generateId(),
        uri: 'file://mock-camera-photo.jpg',
        width: finalOptions.maxWidth || 1200,
        height: finalOptions.maxHeight || 1200,
        filename: `camera_${Date.now()}.jpg`,
        type: 'image/jpeg',
        fileSize: 500000,
        timestamp: new Date(),
      };

      return mockPhoto;
    } catch (error) {
      console.error('Failed to take photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      return null;
    }
  }

  // Select photos from gallery
  async selectPhotosFromGallery(options?: GalleryOptions): Promise<PhotoAsset[]> {
    try {
      const hasPermission = await this.requestPhotoLibraryPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Photo Library Permission Required',
          'Please allow photo library access in your device settings to select photos.',
          [{ text: 'OK' }]
        );
        return [];
      }

      const finalOptions = { ...this.defaultOptions, ...options };

      // This would integrate with react-native-image-picker
      // For now, return mock data
      const mockPhotos: PhotoAsset[] = [
        {
          id: this.generateId(),
          uri: 'file://mock-gallery-photo-1.jpg',
          width: finalOptions.maxWidth || 1200,
          height: finalOptions.maxHeight || 1200,
          filename: `gallery_${Date.now()}_1.jpg`,
          type: 'image/jpeg',
          fileSize: 400000,
          timestamp: new Date(),
        },
      ];

      return mockPhotos.slice(0, finalOptions.selectionLimit || 1);
    } catch (error) {
      console.error('Failed to select photos from gallery:', error);
      Alert.alert('Error', 'Failed to select photos. Please try again.');
      return [];
    }
  }

  // Show photo selection options (camera or gallery)
  async showPhotoSelectionOptions(options?: {
    camera?: CameraOptions;
    gallery?: GalleryOptions;
    title?: string;
    message?: string;
  }): Promise<PhotoAsset[]> {
    return new Promise((resolve) => {
      const title = options?.title || 'Select Photo';
      const message = options?.message || 'Choose how you want to add a photo';

      Alert.alert(
        title,
        message,
        [
          {
            text: 'Camera',
            onPress: async () => {
              const photo = await this.takePhoto(options?.camera);
              resolve(photo ? [photo] : []);
            },
          },
          {
            text: 'Gallery',
            onPress: async () => {
              const photos = await this.selectPhotosFromGallery(options?.gallery);
              resolve(photos);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve([]),
          },
        ]
      );
    });
  }

  // Upload photo to Firebase Storage
  async uploadPhoto(photo: PhotoAsset, folder: string = 'photos'): Promise<string | null> {
    try {
      // Import Firebase Storage
      const storage = require('@react-native-firebase/storage').default;
      
      // Create unique filename
      const timestamp = Date.now();
      const filename = `${folder}/${timestamp}_${photo.filename}`;
      
      // Create storage reference
      const storageRef = storage().ref(filename);
      
      // Upload file
      console.log('Uploading photo to Firebase Storage:', filename);
      await storageRef.putFile(photo.uri);
      
      // Get download URL
      const downloadURL = await storageRef.getDownloadURL();
      console.log('Photo uploaded successfully:', downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error('Failed to upload photo to Firebase:', error);
      
      // Fallback to mock URL for development
      const mockUploadedUrl = `https://firebasestorage.googleapis.com/v0/b/loveconnect-app.appspot.com/o/photos%2F${photo.id}.jpg?alt=media`;
      console.log('Using mock URL for development:', mockUploadedUrl);
      
      // Simulate upload delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return mockUploadedUrl;
    }
  }

  // Upload multiple photos
  async uploadPhotos(photos: PhotoAsset[], onProgress?: (progress: number) => void): Promise<string[]> {
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const url = await this.uploadPhoto(photo);
      
      if (url) {
        uploadedUrls.push(url);
      }
      
      // Report progress
      if (onProgress) {
        const progress = ((i + 1) / photos.length) * 100;
        onProgress(progress);
      }
    }
    
    return uploadedUrls;
  }

  // Compress image
  async compressImage(photo: PhotoAsset, options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  }): Promise<PhotoAsset> {
    try {
      // This would integrate with react-native-image-resizer or similar
      // For now, return the original photo
      return {
        ...photo,
        width: options?.maxWidth || photo.width,
        height: options?.maxHeight || photo.height,
      };
    } catch (error) {
      console.error('Failed to compress image:', error);
      return photo;
    }
  }

  // Generate thumbnail
  async generateThumbnail(photo: PhotoAsset, size: number = 200): Promise<PhotoAsset> {
    try {
      // This would generate a smaller thumbnail version
      // For now, return a modified version of the original
      return {
        ...photo,
        id: `${photo.id}_thumb`,
        width: size,
        height: size,
        filename: `thumb_${photo.filename}`,
      };
    } catch (error) {
      console.error('Failed to generate thumbnail:', error);
      return photo;
    }
  }

  // Delete local photo
  async deleteLocalPhoto(uri: string): Promise<boolean> {
    try {
      // This would delete the local file
      // For now, just return true
      return true;
    } catch (error) {
      console.error('Failed to delete local photo:', error);
      return false;
    }
  }

  // Get image dimensions
  async getImageDimensions(uri: string): Promise<{ width: number; height: number } | null> {
    try {
      // This would get actual image dimensions
      // For now, return mock dimensions
      return { width: 1200, height: 1200 };
    } catch (error) {
      console.error('Failed to get image dimensions:', error);
      return null;
    }
  }

  // Validate image
  validateImage(photo: PhotoAsset, options?: {
    maxFileSize?: number; // in bytes
    allowedTypes?: string[];
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
  }): { isValid: boolean; error?: string } {
    const {
      maxFileSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
      minWidth = 100,
      minHeight = 100,
      maxWidth = 4000,
      maxHeight = 4000,
    } = options || {};

    // Check file size
    if (photo.fileSize && photo.fileSize > maxFileSize) {
      return {
        isValid: false,
        error: `Image file size must be less than ${Math.round(maxFileSize / (1024 * 1024))}MB`,
      };
    }

    // Check file type
    if (!allowedTypes.includes(photo.type)) {
      return {
        isValid: false,
        error: 'Invalid image format. Please use JPEG, PNG, or WebP.',
      };
    }

    // Check dimensions
    if (photo.width < minWidth || photo.height < minHeight) {
      return {
        isValid: false,
        error: `Image must be at least ${minWidth}x${minHeight} pixels`,
      };
    }

    if (photo.width > maxWidth || photo.height > maxHeight) {
      return {
        isValid: false,
        error: `Image must be no larger than ${maxWidth}x${maxHeight} pixels`,
      };
    }

    return { isValid: true };
  }

  // Private methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Export singleton instance
export const photoService = new PhotoService();

// Helper functions for common photo operations
export const selectSinglePhoto = async (options?: PhotoUploadOptions): Promise<PhotoAsset | null> => {
  const photos = await photoService.showPhotoSelectionOptions({
    gallery: { ...options, selectionLimit: 1 },
    camera: options,
  });
  return photos.length > 0 ? photos[0] : null;
};

export const selectMultiplePhotos = async (
  maxCount: number = 5,
  options?: PhotoUploadOptions
): Promise<PhotoAsset[]> => {
  return await photoService.selectPhotosFromGallery({
    ...options,
    selectionLimit: maxCount,
  });
};

export const takePhotoWithCamera = async (options?: CameraOptions): Promise<PhotoAsset | null> => {
  return await photoService.takePhoto(options);
};
