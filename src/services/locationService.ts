// Location Service
// Handle GPS location, distance calculation, and location-based features

import { Alert, Platform } from 'react-native';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp?: Date;
}

export interface LocationAddress {
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
  fullAddress?: string;
}

export interface LocationPreferences {
  enableLocationSharing: boolean;
  showExactLocation: boolean;
  showDistanceInProfile: boolean;
  maxDistance: number; // in kilometers
  locationAccuracy: 'high' | 'medium' | 'low';
  updateFrequency: number; // in minutes
}

class LocationService {
  private currentLocation: Location | null = null;
  private watchId: number | null = null;
  private locationListeners: ((location: Location | null) => void)[] = [];
  private preferences: LocationPreferences = {
    enableLocationSharing: true,
    showExactLocation: false,
    showDistanceInProfile: true,
    maxDistance: 50,
    locationAccuracy: 'medium',
    updateFrequency: 30,
  };

  // Initialize location service
  async initialize(): Promise<void> {
    try {
      await this.loadPreferences();
      
      if (this.preferences.enableLocationSharing) {
        await this.requestLocationPermission();
        this.startLocationTracking();
      }
    } catch (error) {
      console.error('Failed to initialize location service:', error);
    }
  }

  // Request location permissions
  async requestLocationPermission(): Promise<boolean> {
    try {
      // Import permissions here to avoid module import issues
      const { check, request, PERMISSIONS, RESULTS } = require('react-native-permissions');
      
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
      
      let result = await check(permission);
      
      if (result === RESULTS.DENIED) {
        result = await request(permission);
      }
      
      if (result === RESULTS.GRANTED || result === RESULTS.LIMITED) {
        console.log('Location permission granted');
        return true;
      } else {
        console.log('Location permission denied:', result);
        this.showLocationPermissionAlert();
        return false;
      }
    } catch (error) {
      console.error('Failed to request location permission:', error);
      // Fallback to mock location for development
      return true;
    }
  }
  
  private showLocationPermissionAlert(): void {
    Alert.alert(
      'Location Permission Required',
      'Please enable location access to find matches near you and share your location with friends.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Settings', onPress: this.openLocationSettings },
      ]
    );
  }

  // Start location tracking
  startLocationTracking(): void {
    if (this.watchId !== null) {
      this.stopLocationTracking();
    }

    // This would integrate with @react-native-geolocation/geolocation or similar
    // For now, simulate location updates
    this.watchId = setInterval(() => {
      this.simulateLocationUpdate();
    }, this.preferences.updateFrequency * 60 * 1000) as unknown as number;

    // Get initial location
    this.getCurrentLocation();
  }

  // Stop location tracking
  stopLocationTracking(): void {
    if (this.watchId !== null) {
      clearInterval(this.watchId);
      this.watchId = null;
    }
  }

  // Get current location once
  async getCurrentLocation(): Promise<Location | null> {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) return null;

      // This would use actual geolocation
      // For now, return mock location (San Francisco)
      const mockLocation: Location = {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 10,
        timestamp: new Date(),
      };

      this.updateLocation(mockLocation);
      return mockLocation;
    } catch (error) {
      console.error('Failed to get current location:', error);
      return null;
    }
  }

  // Update location and notify listeners
  private updateLocation(location: Location): void {
    this.currentLocation = location;
    this.notifyLocationListeners();
    this.saveLocationToStorage();
  }

  // Simulate location updates for demo
  private simulateLocationUpdate(): void {
    if (this.currentLocation) {
      // Simulate small movements
      const newLocation: Location = {
        ...this.currentLocation,
        latitude: this.currentLocation.latitude + (Math.random() - 0.5) * 0.001,
        longitude: this.currentLocation.longitude + (Math.random() - 0.5) * 0.001,
        timestamp: new Date(),
      };
      this.updateLocation(newLocation);
    }
  }

  // Calculate distance between two points
  calculateDistance(point1: Location, point2: Location): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.latitude)) * 
      Math.cos(this.toRadians(point2.latitude)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  // Convert degrees to radians
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Format distance for display
  formatDistance(distance: number, unit: 'km' | 'mi' = 'km'): string {
    const convertedDistance = unit === 'mi' ? distance * 0.621371 : distance;
    
    if (convertedDistance < 1) {
      return unit === 'km' 
        ? `${Math.round(convertedDistance * 1000)}m away`
        : `${Math.round(convertedDistance * 5280)}ft away`;
    } else if (convertedDistance < 100) {
      return `${convertedDistance.toFixed(1)}${unit} away`;
    } else {
      return `${Math.round(convertedDistance)}${unit} away`;
    }
  }

  // Get address from coordinates (reverse geocoding)
  async getAddressFromCoordinates(location: Location): Promise<LocationAddress | null> {
    try {
      // This would integrate with a geocoding service
      // For now, return mock address
      const mockAddress: LocationAddress = {
        city: 'San Francisco',
        region: 'California',
        country: 'United States',
        fullAddress: 'San Francisco, CA, United States',
      };
      
      return mockAddress;
    } catch (error) {
      console.error('Failed to get address from coordinates:', error);
      return null;
    }
  }

  // Get coordinates from address (geocoding)
  async getCoordinatesFromAddress(address: string): Promise<Location | null> {
    try {
      // This would integrate with a geocoding service
      // For now, return mock coordinates
      const mockLocation: Location = {
        latitude: 37.7749,
        longitude: -122.4194,
        timestamp: new Date(),
      };
      
      return mockLocation;
    } catch (error) {
      console.error('Failed to get coordinates from address:', error);
      return null;
    }
  }

  // Check if user is within specified radius of a location
  isWithinRadius(targetLocation: Location, radius: number): boolean {
    if (!this.currentLocation) return false;
    
    const distance = this.calculateDistance(this.currentLocation, targetLocation);
    return distance <= radius;
  }

  // Get nearby users (mock implementation)
  async getNearbyUsers(radius: number = this.preferences.maxDistance): Promise<any[]> {
    try {
      if (!this.currentLocation) {
        await this.getCurrentLocation();
      }
      
      if (!this.currentLocation) return [];

      // This would query the backend for nearby users
      // For now, return mock data
      const mockNearbyUsers = [
        {
          id: '1',
          name: 'Emma',
          location: {
            latitude: this.currentLocation.latitude + 0.01,
            longitude: this.currentLocation.longitude + 0.01,
          },
        },
        {
          id: '2',
          name: 'Sarah',
          location: {
            latitude: this.currentLocation.latitude - 0.005,
            longitude: this.currentLocation.longitude + 0.008,
          },
        },
      ];

      // Calculate distances and filter by radius
      const usersWithDistance = mockNearbyUsers.map(user => ({
        ...user,
        distance: this.calculateDistance(this.currentLocation!, user.location),
      })).filter(user => user.distance <= radius);

      return usersWithDistance.sort((a, b) => a.distance - b.distance);
    } catch (error) {
      console.error('Failed to get nearby users:', error);
      return [];
    }
  }

  // Subscribe to location updates
  subscribe(listener: (location: Location | null) => void): () => void {
    this.locationListeners.push(listener);
    
    // Send current location immediately
    listener(this.currentLocation);
    
    // Return unsubscribe function
    return () => {
      this.locationListeners = this.locationListeners.filter(l => l !== listener);
    };
  }

  // Update location preferences
  updatePreferences(newPreferences: Partial<LocationPreferences>): void {
    this.preferences = { ...this.preferences, ...newPreferences };
    this.savePreferences();
    
    // Restart tracking if location sharing was enabled/disabled
    if ('enableLocationSharing' in newPreferences) {
      if (newPreferences.enableLocationSharing) {
        this.startLocationTracking();
      } else {
        this.stopLocationTracking();
      }
    }
    
    // Update tracking frequency
    if ('updateFrequency' in newPreferences && this.preferences.enableLocationSharing) {
      this.startLocationTracking();
    }
  }

  // Get current preferences
  getPreferences(): LocationPreferences {
    return this.preferences;
  }

  // Get current location
  getLocation(): Location | null {
    return this.currentLocation;
  }

  // Open device location settings
  private openLocationSettings(): void {
    // This would open device settings
    console.log('Opening location settings...');
  }

  // Private methods
  private notifyLocationListeners(): void {
    this.locationListeners.forEach(listener => {
      listener(this.currentLocation);
    });
  }

  private async saveLocationToStorage(): Promise<void> {
    try {
      // Save to AsyncStorage or similar
      // await AsyncStorage.setItem('love_connect_location', JSON.stringify(this.currentLocation));
    } catch (error) {
      console.error('Failed to save location:', error);
    }
  }

  private async loadLocationFromStorage(): Promise<void> {
    try {
      // Load from AsyncStorage or similar
      // const stored = await AsyncStorage.getItem('love_connect_location');
      // if (stored) {
      //   this.currentLocation = JSON.parse(stored);
      // }
    } catch (error) {
      console.error('Failed to load location:', error);
    }
  }

  private async savePreferences(): Promise<void> {
    try {
      // Save to AsyncStorage or similar
      // await AsyncStorage.setItem('love_connect_location_preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Failed to save location preferences:', error);
    }
  }

  private async loadPreferences(): Promise<void> {
    try {
      // Load from AsyncStorage or similar
      // const stored = await AsyncStorage.getItem('love_connect_location_preferences');
      // if (stored) {
      //   this.preferences = { ...this.preferences, ...JSON.parse(stored) };
      // }
    } catch (error) {
      console.error('Failed to load location preferences:', error);
    }
  }

  // Cleanup
  cleanup(): void {
    this.stopLocationTracking();
    this.locationListeners = [];
    this.currentLocation = null;
  }
}

// Export singleton instance
export const locationService = new LocationService();

// Helper functions
export const calculateDistanceBetweenUsers = (user1Location: Location, user2Location: Location): number => {
  return locationService.calculateDistance(user1Location, user2Location);
};

export const formatUserDistance = (userLocation: Location, unit: 'km' | 'mi' = 'km'): string => {
  const currentLocation = locationService.getLocation();
  if (!currentLocation) return 'Distance unknown';
  
  const distance = locationService.calculateDistance(currentLocation, userLocation);
  return locationService.formatDistance(distance, unit);
};
