import * as Location from 'expo-location';
import { Platform } from 'react-native';

export type LocationPermissionStatus = 'granted' | 'denied' | 'unavailable';

export interface LocationData {
  lat: number;
  lon: number;
  accuracy: number;
  timestamp: number;
}

class LocationService {
  private isInitialized = false;
  private lastKnownLocation: LocationData | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Check if location services are enabled
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        console.log('📍 Location services are disabled');
        return;
      }

      this.isInitialized = true;
      console.log('📍 LocationService initialized');
    } catch (error) {
      console.error('📍 Failed to initialize LocationService:', error);
    }
  }

  async requestPermission(): Promise<LocationPermissionStatus> {
    try {
      console.log('📍 Requesting location permission...');
      
      // Check if location services are enabled
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        console.log('📍 Location services are disabled');
        return 'unavailable';
      }

      // Check current permission status
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        // Request permission for while-in-use location
        const { status } = await Location.requestForegroundPermissionsAsync();
        finalStatus = status;
      }

      console.log('📍 Location permission result:', finalStatus);
      return finalStatus === 'granted' ? 'granted' : 'denied';
    } catch (error) {
      console.error('📍 Location permission error:', error);
      return 'unavailable';
    }
  }

  async getLastKnownLocation(): Promise<LocationData | null> {
    try {
      console.log('📍 Getting last known location...');
      
      // Check if we have permission
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('📍 Location permission not granted');
        return null;
      }

      // Check if location services are enabled
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        console.log('📍 Location services are disabled');
        return null;
      }

      // Get last known position with timeout
      const location = await Promise.race([
        Location.getLastKnownPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          maxAge: 60000, // 1 minute max age
        }),
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Location timeout')), 5000)
        )
      ]);

      if (!location) {
        console.log('📍 No last known location available');
        return null;
      }

      const locationData: LocationData = {
        lat: location.coords.latitude,
        lon: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        timestamp: location.timestamp,
      };

      // Cache the location
      this.lastKnownLocation = locationData;
      
      console.log('📍 Last known location retrieved:', {
        lat: locationData.lat,
        lon: locationData.lon,
        accuracy: locationData.accuracy,
        timestamp: new Date(locationData.timestamp).toISOString()
      });

      return locationData;
    } catch (error) {
      console.error('📍 Failed to get last known location:', error);
      
      // Return cached location if available
      if (this.lastKnownLocation) {
        console.log('📍 Using cached location due to error');
        return this.lastKnownLocation;
      }
      
      return null;
    }
  }

  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      console.log('📍 Getting current location...');
      
      // Check if we have permission
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('📍 Location permission not granted');
        return null;
      }

      // Check if location services are enabled
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        console.log('📍 Location services are disabled');
        return null;
      }

      // Get current position with timeout
      const location = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000, // 10 seconds timeout
        }),
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Location timeout')), 10000)
        )
      ]);

      if (!location) {
        console.log('📍 No current location available');
        return null;
      }

      const locationData: LocationData = {
        lat: location.coords.latitude,
        lon: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        timestamp: location.timestamp,
      };

      // Cache the location
      this.lastKnownLocation = locationData;
      
      console.log('📍 Current location retrieved:', {
        lat: locationData.lat,
        lon: locationData.lon,
        accuracy: locationData.accuracy,
        timestamp: new Date(locationData.timestamp).toISOString()
      });

      return locationData;
    } catch (error) {
      console.error('📍 Failed to get current location:', error);
      
      // Fallback to last known location
      return this.getLastKnownLocation();
    }
  }

  getCachedLocation(): LocationData | null {
    return this.lastKnownLocation;
  }

  clearCache(): void {
    this.lastKnownLocation = null;
    console.log('📍 Location cache cleared');
  }

  // Format location for display (without exposing exact coordinates in logs)
  formatLocationForDisplay(location: LocationData | null): string {
    if (!location) return 'No location available';
    
    return `Location: ${location.lat.toFixed(4)}, ${location.lon.toFixed(4)} (±${Math.round(location.accuracy)}m)`;
  }

  // Check if location is recent (within 5 minutes)
  isLocationRecent(location: LocationData | null): boolean {
    if (!location) return false;
    
    const now = Date.now();
    const locationAge = now - location.timestamp;
    const fiveMinutes = 5 * 60 * 1000;
    
    return locationAge < fiveMinutes;
  }
}

// Export singleton instance
export const locationService = new LocationService();
