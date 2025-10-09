// Conditional imports for Expo Go compatibility
let ImagePicker: any = null;
let FileSystem: any = null;
let Camera: any = null;

try {
  ImagePicker = require('expo-image-picker');
} catch (error) {
  console.log('📷 expo-image-picker not available in Expo Go');
}

try {
  FileSystem = require('expo-file-system');
} catch (error) {
  console.log('📁 expo-file-system not available in Expo Go');
}

try {
  Camera = require('expo-camera');
} catch (error) {
  console.log('📷 expo-camera not available in Expo Go');
}

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export type PhotoPermissionStatus = 'granted' | 'denied' | 'unavailable';

export interface Photo {
  id: string;
  uri: string;
  title: string;
  timestamp: number;
  size: number;
  width: number;
  height: number;
  isLocal: boolean; // true if stored locally, false if from gallery
  thumbnailUri?: string;
}

export interface PhotoStorageStats {
  totalPhotos: number;
  totalSize: number;
  localPhotos: number;
  galleryPhotos: number;
}

class PhotoService {
  private photos: Photo[] = [];
  private isInitialized = false;
  private readonly STORAGE_KEY = 'familybridge_photos';
  private readonly PHOTOS_DIR = 'familybridge_photos';

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Load stored photos
      await this.loadPhotos();
      
      // Create photos directory if it doesn't exist
      if (FileSystem) {
        const photosDir = `${FileSystem.documentDirectory}${this.PHOTOS_DIR}`;
        const dirInfo = await FileSystem.getInfoAsync(photosDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(photosDir, { intermediates: true });
          console.log('📁 Created photos directory:', photosDir);
        }
      }
      
      this.isInitialized = true;
      console.log('📷 PhotoService initialized with', this.photos.length, 'photos');
    } catch (error) {
      console.error('📷 Failed to initialize PhotoService:', error);
    }
  }

  async requestCameraPermission(): Promise<PhotoPermissionStatus> {
    try {
      console.log('📷 Requesting camera permission...');
      
      if (!Camera) {
        console.log('📷 Camera not available in Expo Go');
        return 'unavailable';
      }
      
      const { status: existingStatus } = await Camera.getCameraPermissionsAsync();
      console.log('📷 Current camera permission status:', existingStatus);
      
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        console.log('📷 Requesting camera permissions...');
        const { status } = await Camera.requestCameraPermissionsAsync();
        finalStatus = status;
        console.log('📷 Camera permission request result:', finalStatus);
      }

      console.log('📷 Final camera permission status:', finalStatus);
      return finalStatus === 'granted' ? 'granted' : 'denied';
    } catch (error) {
      console.error('📷 Camera permission error:', error);
      return 'unavailable';
    }
  }

  async requestMediaLibraryPermission(): Promise<PhotoPermissionStatus> {
    try {
      console.log('📷 Requesting media library permission...');
      
      if (!ImagePicker) {
        console.log('📷 ImagePicker not available in Expo Go');
        return 'unavailable';
      }
      
      const { status: existingStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
      console.log('📷 Current media library permission status:', existingStatus);
      
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        console.log('📷 Requesting media library permissions...');
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        finalStatus = status;
        console.log('📷 Media library permission request result:', finalStatus);
      }

      console.log('📷 Final media library permission status:', finalStatus);
      return finalStatus === 'granted' ? 'granted' : 'denied';
    } catch (error) {
      console.error('📷 Media library permission error:', error);
      return 'unavailable';
    }
  }

  async takePhoto(): Promise<Photo | null> {
    try {
      console.log('📷 Taking photo...');
      
      if (!Camera || !ImagePicker) {
        console.log('📷 Camera/ImagePicker not available in Expo Go - simulating photo');
        return this.createMockPhoto('Nueva foto');
      }

      // Request camera permission first
      const cameraPermission = await this.requestCameraPermission();
      if (cameraPermission !== 'granted') {
        console.log('📷 Camera permission not granted');
        return null;
      }

      // Use ImagePicker to take photo
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for consistency
        quality: 0.8,
        base64: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('📷 Photo capture cancelled');
        return null;
      }

      const asset = result.assets[0];
      const photo = await this.processPhotoAsset(asset, true);
      
      if (photo) {
        await this.addPhoto(photo);
        console.log('📷 Photo taken successfully:', photo.id);
      }

      return photo;
    } catch (error) {
      console.error('📷 Failed to take photo:', error);
      return null;
    }
  }

  async selectFromGallery(): Promise<Photo | null> {
    try {
      console.log('📷 Selecting photo from gallery...');
      
      if (!ImagePicker) {
        console.log('📷 ImagePicker not available in Expo Go - simulating photo');
        return this.createMockPhoto('Foto de la galería');
      }

      // Request media library permission first
      const mediaPermission = await this.requestMediaLibraryPermission();
      if (mediaPermission !== 'granted') {
        console.log('📷 Media library permission not granted');
        return null;
      }

      // Use ImagePicker to select from gallery
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for consistency
        quality: 0.8,
        base64: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('📷 Photo selection cancelled');
        return null;
      }

      const asset = result.assets[0];
      const photo = await this.processPhotoAsset(asset, false);
      
      if (photo) {
        await this.addPhoto(photo);
        console.log('📷 Photo selected successfully:', photo.id);
      }

      return photo;
    } catch (error) {
      console.error('📷 Failed to select photo from gallery:', error);
      return null;
    }
  }

  private async processPhotoAsset(asset: any, isLocal: boolean): Promise<Photo | null> {
    try {
      const photoId = uuidv4();
      const timestamp = Date.now();
      
      // Generate a title based on timestamp
      const date = new Date(timestamp);
      const title = `Foto ${date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      })}`;

      let finalUri = asset.uri;
      let thumbnailUri: string | undefined;

      // If it's a local photo, copy it to our app directory
      if (isLocal && FileSystem) {
        const photosDir = `${FileSystem.documentDirectory}${this.PHOTOS_DIR}`;
        const fileName = `${photoId}.jpg`;
        const destinationUri = `${photosDir}/${fileName}`;
        
        // Copy file to our directory
        await FileSystem.copyAsync({
          from: asset.uri,
          to: destinationUri,
        });
        
        finalUri = destinationUri;
        
        // Create thumbnail
        thumbnailUri = await this.createThumbnail(destinationUri, photoId);
      }

      const photo: Photo = {
        id: photoId,
        uri: finalUri,
        title,
        timestamp,
        size: asset.fileSize || 0,
        width: asset.width || 0,
        height: asset.height || 0,
        isLocal,
        thumbnailUri,
      };

      return photo;
    } catch (error) {
      console.error('📷 Failed to process photo asset:', error);
      return null;
    }
  }

  private async createThumbnail(uri: string, photoId: string): Promise<string | undefined> {
    try {
      if (!FileSystem) return undefined;

      const photosDir = `${FileSystem.documentDirectory}${this.PHOTOS_DIR}`;
      const thumbnailUri = `${photosDir}/thumb_${photoId}.jpg`;
      
      // For now, we'll just copy the original as thumbnail
      // In a real implementation, you'd use an image processing library
      await FileSystem.copyAsync({
        from: uri,
        to: thumbnailUri,
      });
      
      return thumbnailUri;
    } catch (error) {
      console.error('📷 Failed to create thumbnail:', error);
      return undefined;
    }
  }

  private createMockPhoto(title: string): Photo {
    return {
      id: uuidv4(),
      uri: 'mock://photo',
      title,
      timestamp: Date.now(),
      size: 0,
      width: 300,
      height: 300,
      isLocal: true,
    };
  }

  async addPhoto(photo: Photo): Promise<void> {
    try {
      this.photos.unshift(photo); // Add to beginning of array
      await this.savePhotos();
      console.log('📷 Photo added:', photo.id);
    } catch (error) {
      console.error('📷 Failed to add photo:', error);
    }
  }

  async removePhoto(photoId: string): Promise<boolean> {
    try {
      const photoIndex = this.photos.findIndex(p => p.id === photoId);
      if (photoIndex === -1) {
        console.log('📷 Photo not found:', photoId);
        return false;
      }

      const photo = this.photos[photoIndex];
      
      // Delete file if it's local
      if (photo.isLocal && FileSystem) {
        try {
          await FileSystem.deleteAsync(photo.uri);
          if (photo.thumbnailUri) {
            await FileSystem.deleteAsync(photo.thumbnailUri);
          }
        } catch (error) {
          console.log('📷 Failed to delete photo file:', error);
        }
      }

      this.photos.splice(photoIndex, 1);
      await this.savePhotos();
      console.log('📷 Photo removed:', photoId);
      return true;
    } catch (error) {
      console.error('📷 Failed to remove photo:', error);
      return false;
    }
  }

  getAllPhotos(): Photo[] {
    return [...this.photos];
  }

  getPhotoById(id: string): Photo | undefined {
    return this.photos.find(p => p.id === id);
  }

  getPhotosCount(): number {
    return this.photos.length;
  }

  async getStorageStats(): Promise<PhotoStorageStats> {
    const localPhotos = this.photos.filter(p => p.isLocal);
    const galleryPhotos = this.photos.filter(p => !p.isLocal);
    const totalSize = this.photos.reduce((sum, photo) => sum + photo.size, 0);

    return {
      totalPhotos: this.photos.length,
      totalSize,
      localPhotos: localPhotos.length,
      galleryPhotos: galleryPhotos.length,
    };
  }

  private async loadPhotos(): Promise<void> {
    try {
      const storedPhotos = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (storedPhotos) {
        this.photos = JSON.parse(storedPhotos);
        console.log('📷 Loaded', this.photos.length, 'photos from storage');
      }
    } catch (error) {
      console.error('📷 Failed to load photos:', error);
      this.photos = [];
    }
  }

  private async savePhotos(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.photos));
      console.log('📷 Saved', this.photos.length, 'photos to storage');
    } catch (error) {
      console.error('📷 Failed to save photos:', error);
    }
  }

  // For testing - clear all photos
  async clearAllPhotos(): Promise<void> {
    try {
      // Delete all local files
      if (FileSystem) {
        const photosDir = `${FileSystem.documentDirectory}${this.PHOTOS_DIR}`;
        const dirInfo = await FileSystem.getInfoAsync(photosDir);
        if (dirInfo.exists) {
          await FileSystem.deleteAsync(photosDir);
          await FileSystem.makeDirectoryAsync(photosDir, { intermediates: true });
        }
      }

      this.photos = [];
      await this.savePhotos();
      console.log('📷 All photos cleared');
    } catch (error) {
      console.error('📷 Failed to clear photos:', error);
    }
  }
}

// Export singleton instance
export const photoService = new PhotoService();
