import { locationService } from '../../src/app/services/location';

// Mock Expo Location
jest.mock('expo-location', () => ({
  hasServicesEnabledAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: {
    Balanced: 3,
  },
}));

describe('LocationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestPermission', () => {
    it('should return granted when permission is granted', async () => {
      const { hasServicesEnabledAsync, getForegroundPermissionsAsync } = require('expo-location');
      
      hasServicesEnabledAsync.mockResolvedValue(true);
      getForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      
      const result = await locationService.requestPermission();
      
      expect(result).toBe('granted');
      expect(hasServicesEnabledAsync).toHaveBeenCalled();
      expect(getForegroundPermissionsAsync).toHaveBeenCalled();
    });

    it('should request permission when not granted', async () => {
      const { 
        hasServicesEnabledAsync, 
        getForegroundPermissionsAsync, 
        requestForegroundPermissionsAsync 
      } = require('expo-location');
      
      hasServicesEnabledAsync.mockResolvedValue(true);
      getForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
      requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      
      const result = await locationService.requestPermission();
      
      expect(result).toBe('granted');
      expect(hasServicesEnabledAsync).toHaveBeenCalled();
      expect(getForegroundPermissionsAsync).toHaveBeenCalled();
      expect(requestForegroundPermissionsAsync).toHaveBeenCalled();
    });

    it('should return unavailable when location services are disabled', async () => {
      const { hasServicesEnabledAsync } = require('expo-location');
      
      hasServicesEnabledAsync.mockResolvedValue(false);
      
      const result = await locationService.requestPermission();
      
      expect(result).toBe('unavailable');
      expect(hasServicesEnabledAsync).toHaveBeenCalled();
    });

    it('should return denied when permission is denied', async () => {
      const { 
        hasServicesEnabledAsync, 
        getForegroundPermissionsAsync, 
        requestForegroundPermissionsAsync 
      } = require('expo-location');
      
      hasServicesEnabledAsync.mockResolvedValue(true);
      getForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
      requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
      
      const result = await locationService.requestPermission();
      
      expect(result).toBe('denied');
    });

    it('should return unavailable on error', async () => {
      const { hasServicesEnabledAsync } = require('expo-location');
      
      hasServicesEnabledAsync.mockRejectedValue(new Error('Location error'));
      
      const result = await locationService.requestPermission();
      
      expect(result).toBe('unavailable');
    });
  });

  describe('getLastKnownLocation', () => {
    it('should return location when available', async () => {
      const { 
        hasServicesEnabledAsync, 
        getForegroundPermissionsAsync, 
        getLastKnownPositionAsync 
      } = require('expo-location');
      
      hasServicesEnabledAsync.mockResolvedValue(true);
      getForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      getLastKnownPositionAsync.mockResolvedValue({
        coords: {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 10,
        },
        timestamp: Date.now(),
      });
      
      const result = await locationService.getLastKnownLocation();
      
      expect(result).toEqual({
        lat: 37.7749,
        lon: -122.4194,
        accuracy: 10,
        timestamp: expect.any(Number),
      });
    });

    it('should return null when permission is denied', async () => {
      const { 
        hasServicesEnabledAsync, 
        getForegroundPermissionsAsync 
      } = require('expo-location');
      
      hasServicesEnabledAsync.mockResolvedValue(true);
      getForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
      
      const result = await locationService.getLastKnownLocation();
      
      expect(result).toBe(null);
    });

    it('should return null when location services are disabled', async () => {
      const { hasServicesEnabledAsync } = require('expo-location');
      
      hasServicesEnabledAsync.mockResolvedValue(false);
      
      const result = await locationService.getLastKnownLocation();
      
      expect(result).toBe(null);
    });

    it('should return cached location on error', async () => {
      const { 
        hasServicesEnabledAsync, 
        getForegroundPermissionsAsync, 
        getLastKnownPositionAsync 
      } = require('expo-location');
      
      hasServicesEnabledAsync.mockResolvedValue(true);
      getForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      getLastKnownPositionAsync.mockRejectedValue(new Error('Location error'));
      
      // Set cached location
      const cachedLocation = {
        lat: 37.7749,
        lon: -122.4194,
        accuracy: 10,
        timestamp: Date.now() - 1000,
      };
      (locationService as any).lastKnownLocation = cachedLocation;
      
      const result = await locationService.getLastKnownLocation();
      
      expect(result).toEqual(cachedLocation);
    });

    it('should handle timeout', async () => {
      const { 
        hasServicesEnabledAsync, 
        getForegroundPermissionsAsync, 
        getLastKnownPositionAsync 
      } = require('expo-location');
      
      hasServicesEnabledAsync.mockResolvedValue(true);
      getForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
      
      // Mock a slow response that will timeout
      getLastKnownPositionAsync.mockImplementation(
        () => new Promise<void>(resolve => setTimeout(resolve, 6000))
      );
      
      const result = await locationService.getLastKnownLocation();
      
      expect(result).toBe(null);
    });
  });

  describe('formatLocationForDisplay', () => {
    it('should format location correctly', () => {
      const location = {
        lat: 37.7749,
        lon: -122.4194,
        accuracy: 10,
        timestamp: Date.now(),
      };
      
      const result = locationService.formatLocationForDisplay(location);
      
      expect(result).toBe('Location: 37.7749, -122.4194 (±10m)');
    });

    it('should handle null location', () => {
      const result = locationService.formatLocationForDisplay(null);
      
      expect(result).toBe('No location available');
    });
  });

  describe('isLocationRecent', () => {
    it('should return true for recent location', () => {
      const location = {
        lat: 37.7749,
        lon: -122.4194,
        accuracy: 10,
        timestamp: Date.now() - 60000, // 1 minute ago
      };
      
      const result = locationService.isLocationRecent(location);
      
      expect(result).toBe(true);
    });

    it('should return false for old location', () => {
      const location = {
        lat: 37.7749,
        lon: -122.4194,
        accuracy: 10,
        timestamp: Date.now() - 10 * 60 * 1000, // 10 minutes ago
      };
      
      const result = locationService.isLocationRecent(location);
      
      expect(result).toBe(false);
    });

    it('should return false for null location', () => {
      const result = locationService.isLocationRecent(null);
      
      expect(result).toBe(false);
    });
  });
});
