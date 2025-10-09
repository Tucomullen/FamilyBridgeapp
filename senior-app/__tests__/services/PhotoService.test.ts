import { photoService, Photo } from '../../src/app/services/PhotoService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

describe('PhotoService', () => {
  beforeEach(async () => {
    await photoService.clearAllPhotos();
  });

  afterEach(async () => {
    await photoService.clearAllPhotos();
  });

  it('should initialize successfully', async () => {
    await photoService.initialize();
    expect(photoService.getPhotosCount()).toBe(0);
  });

  it('should add and retrieve photos', async () => {
    await photoService.initialize();
    
    const mockPhoto: Photo = {
      id: 'test-photo-1',
      uri: 'mock://photo1',
      title: 'Test Photo',
      timestamp: Date.now(),
      size: 1000,
      width: 300,
      height: 300,
      isLocal: true,
    };

    await photoService.addPhoto(mockPhoto);
    
    const photos = photoService.getAllPhotos();
    expect(photos).toHaveLength(1);
    expect(photos[0]).toEqual(mockPhoto);
  });

  it('should remove photos', async () => {
    await photoService.initialize();
    
    const mockPhoto: Photo = {
      id: 'test-photo-1',
      uri: 'mock://photo1',
      title: 'Test Photo',
      timestamp: Date.now(),
      size: 1000,
      width: 300,
      height: 300,
      isLocal: true,
    };

    await photoService.addPhoto(mockPhoto);
    expect(photoService.getPhotosCount()).toBe(1);

    const success = await photoService.removePhoto('test-photo-1');
    expect(success).toBe(true);
    expect(photoService.getPhotosCount()).toBe(0);
  });

  it('should get photo by id', async () => {
    await photoService.initialize();
    
    const mockPhoto: Photo = {
      id: 'test-photo-1',
      uri: 'mock://photo1',
      title: 'Test Photo',
      timestamp: Date.now(),
      size: 1000,
      width: 300,
      height: 300,
      isLocal: true,
    };

    await photoService.addPhoto(mockPhoto);
    
    const retrievedPhoto = photoService.getPhotoById('test-photo-1');
    expect(retrievedPhoto).toEqual(mockPhoto);
  });

  it('should return undefined for non-existent photo', async () => {
    await photoService.initialize();
    
    const retrievedPhoto = photoService.getPhotoById('non-existent');
    expect(retrievedPhoto).toBeUndefined();
  });

  it('should get storage stats', async () => {
    await photoService.initialize();
    
    const mockPhoto1: Photo = {
      id: 'test-photo-1',
      uri: 'mock://photo1',
      title: 'Test Photo 1',
      timestamp: Date.now(),
      size: 1000,
      width: 300,
      height: 300,
      isLocal: true,
    };

    const mockPhoto2: Photo = {
      id: 'test-photo-2',
      uri: 'mock://photo2',
      title: 'Test Photo 2',
      timestamp: Date.now(),
      size: 2000,
      width: 400,
      height: 400,
      isLocal: false,
    };

    await photoService.addPhoto(mockPhoto1);
    await photoService.addPhoto(mockPhoto2);
    
    const stats = await photoService.getStorageStats();
    expect(stats.totalPhotos).toBe(2);
    expect(stats.totalSize).toBe(3000);
    expect(stats.localPhotos).toBe(1);
    expect(stats.galleryPhotos).toBe(1);
  });

  it('should clear all photos', async () => {
    await photoService.initialize();
    
    const mockPhoto: Photo = {
      id: 'test-photo-1',
      uri: 'mock://photo1',
      title: 'Test Photo',
      timestamp: Date.now(),
      size: 1000,
      width: 300,
      height: 300,
      isLocal: true,
    };

    await photoService.addPhoto(mockPhoto);
    expect(photoService.getPhotosCount()).toBe(1);

    await photoService.clearAllPhotos();
    expect(photoService.getPhotosCount()).toBe(0);
  });

  it('should handle camera permission request', async () => {
    await photoService.initialize();
    
    const permission = await photoService.requestCameraPermission();
    expect(['granted', 'denied', 'unavailable']).toContain(permission);
  });

  it('should handle media library permission request', async () => {
    await photoService.initialize();
    
    const permission = await photoService.requestMediaLibraryPermission();
    expect(['granted', 'denied', 'unavailable']).toContain(permission);
  });
});
