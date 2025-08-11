// Authentication Storage Service
// Secure storage for user authentication data

import AsyncStorage from '@react-native-async-storage/async-storage';
// Temporarily using AsyncStorage instead of Keychain for development
// import * as Keychain from 'react-native-keychain';

export interface UserCredentials {
  username: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface UserSession {
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    phone?: string;
    bio?: string;
    preferences?: any;
  };
  tokens: AuthTokens;
  isAuthenticated: boolean;
  lastLoginAt: number;
}

class AuthStorageService {
  private readonly KEYCHAIN_SERVICE = 'LoveConnect';
  private readonly KEYCHAIN_USERNAME = 'user_credentials';
  private readonly SESSION_KEY = '@LoveConnect:userSession';
  private readonly REMEMBER_ME_KEY = '@LoveConnect:rememberMe';
  private readonly CREDENTIALS_KEY = '@LoveConnect:credentials';

  // Store user credentials securely (using AsyncStorage for development)
  async storeCredentials(credentials: UserCredentials): Promise<void> {
    try {
      // For development, use AsyncStorage instead of Keychain
      console.log('Mock: Storing credentials to AsyncStorage for development');
      await AsyncStorage.setItem(this.CREDENTIALS_KEY, JSON.stringify(credentials));
    } catch (error) {
      console.error('Error storing credentials:', error);
      throw new Error('Failed to store credentials securely');
    }
  }

  // Retrieve user credentials (using AsyncStorage for development)
  async getCredentials(): Promise<UserCredentials | null> {
    try {
      console.log('Mock: Getting credentials from AsyncStorage for development');
      const credentialsData = await AsyncStorage.getItem(this.CREDENTIALS_KEY);
      
      if (credentialsData) {
        return JSON.parse(credentialsData) as UserCredentials;
      }
      
      return null;
    } catch (error) {
      console.error('Error retrieving credentials:', error);
      return null;
    }
  }

  // Clear stored credentials
  async clearCredentials(): Promise<void> {
    try {
      console.log('Mock: Clearing credentials from AsyncStorage for development');
      await AsyncStorage.removeItem(this.CREDENTIALS_KEY);
    } catch (error) {
      console.error('Error clearing credentials:', error);
    }
  }

  // Store user session data
  async storeSession(session: UserSession): Promise<void> {
    try {
      const sessionData = JSON.stringify({
        ...session,
        lastLoginAt: Date.now(),
      });
      await AsyncStorage.setItem(this.SESSION_KEY, sessionData);
    } catch (error) {
      console.error('Error storing session:', error);
      throw new Error('Failed to store user session');
    }
  }

  // Retrieve user session data
  async getSession(): Promise<UserSession | null> {
    try {
      const sessionData = await AsyncStorage.getItem(this.SESSION_KEY);
      
      if (sessionData) {
        const session: UserSession = JSON.parse(sessionData);
        
        // Check if session is still valid (tokens not expired)
        if (this.isSessionValid(session)) {
          return session;
        } else {
          // Session expired, clear it
          await this.clearSession();
          return null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error retrieving session:', error);
      return null;
    }
  }

  // Clear user session
  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  // Store "Remember Me" preference
  async setRememberMe(remember: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(this.REMEMBER_ME_KEY, JSON.stringify(remember));
    } catch (error) {
      console.error('Error storing remember me preference:', error);
    }
  }

  // Get "Remember Me" preference
  async getRememberMe(): Promise<boolean> {
    try {
      const rememberMe = await AsyncStorage.getItem(this.REMEMBER_ME_KEY);
      return rememberMe ? JSON.parse(rememberMe) : false;
    } catch (error) {
      console.error('Error retrieving remember me preference:', error);
      return false;
    }
  }

  // Update tokens in existing session
  async updateTokens(tokens: AuthTokens): Promise<void> {
    try {
      const session = await this.getSession();
      if (session) {
        session.tokens = tokens;
        await this.storeSession(session);
      }
    } catch (error) {
      console.error('Error updating tokens:', error);
      throw new Error('Failed to update authentication tokens');
    }
  }

  // Check if session is still valid
  private isSessionValid(session: UserSession): boolean {
    const now = Date.now();
    const expirationTime = session.tokens.expiresAt;
    
    // Add 5 minute buffer before expiration
    const bufferTime = 5 * 60 * 1000;
    
    return now < (expirationTime - bufferTime);
  }

  // Check if tokens need refresh (within 30 minutes of expiration)
  async needsTokenRefresh(): Promise<boolean> {
    try {
      const session = await this.getSession();
      if (!session) return false;
      
      const now = Date.now();
      const expirationTime = session.tokens.expiresAt;
      const refreshThreshold = 30 * 60 * 1000; // 30 minutes
      
      return now >= (expirationTime - refreshThreshold);
    } catch (error) {
      console.error('Error checking token refresh need:', error);
      return false;
    }
  }

  // Get current user data
  async getCurrentUser() {
    try {
      const session = await this.getSession();
      return session?.user || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Update user profile in session
  async updateUserProfile(updates: Partial<UserSession['user']>): Promise<void> {
    try {
      const session = await this.getSession();
      if (session) {
        session.user = { ...session.user, ...updates };
        await this.storeSession(session);
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  // Clear all stored data
  async clearAll(): Promise<void> {
    try {
      await Promise.all([
        this.clearCredentials(),
        this.clearSession(),
        AsyncStorage.removeItem(this.REMEMBER_ME_KEY),
      ]);
    } catch (error) {
      console.error('Error clearing all auth data:', error);
    }
  }

  // Check if user has stored credentials
  async hasStoredCredentials(): Promise<boolean> {
    try {
      const credentials = await this.getCredentials();
      return credentials !== null;
    } catch (error) {
      console.error('Error checking stored credentials:', error);
      return false;
    }
  }

  // Check if user is currently authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await this.getSession();
      return session?.isAuthenticated || false;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }

  // Get access token for API requests
  async getAccessToken(): Promise<string | null> {
    try {
      const session = await this.getSession();
      return session?.tokens.accessToken || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  // Check if Keychain is available (for biometric features) - Mock for development
  async isKeychainAvailable(): Promise<boolean> {
    try {
      console.log('Mock: Keychain availability check - returning true for development');
      return true; // Mock response for development
    } catch (error) {
      console.error('Error checking keychain availability:', error);
      return false;
    }
  }

  // Get supported biometry type - Mock for development
  async getSupportedBiometryType(): Promise<string | null> {
    try {
      console.log('Mock: Getting biometry type - returning TouchID for development');
      return 'TouchID'; // Mock response for development
    } catch (error) {
      console.error('Error getting biometry type:', error);
      return null;
    }
  }
}

export default new AuthStorageService();
