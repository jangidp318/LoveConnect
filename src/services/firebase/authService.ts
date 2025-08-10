// Mock Authentication Service (Firebase temporarily disabled)
// Handles all authentication operations for Love Connect

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../../store/authStore';

export interface AuthCredentials {
  email?: string;
  password?: string;
  phoneNumber?: string;
  displayName?: string;
}

export interface OTPVerification {
  verificationId: string;
  code: string;
}

class AuthService {
  private currentUser: User | null = null;
  private listeners: Array<(user: User | null) => void> = [];

  /**
   * Sign up with email and password (MOCK)
   */
  async signUpWithEmail(credentials: AuthCredentials): Promise<User> {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user: User = {
        uid: 'mock-user-' + Date.now(),
        email: credentials.email,
        displayName: credentials.displayName || credentials.email.split('@')[0],
        photoURL: null,
        phoneNumber: null,
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.currentUser = user;
      await AsyncStorage.setItem('userLoggedIn', 'true');
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      
      this.notifyListeners();
      return user;
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in with email and password (MOCK)
   */
  async signInWithEmail(credentials: AuthCredentials): Promise<User> {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user: User = {
        uid: 'mock-user-' + Date.now(),
        email: credentials.email,
        displayName: credentials.email.split('@')[0],
        photoURL: null,
        phoneNumber: null,
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.currentUser = user;
      await AsyncStorage.setItem('userLoggedIn', 'true');
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      
      this.notifyListeners();
      return user;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Send OTP to phone number (MOCK)
   */
  async sendPhoneOTP(phoneNumber: string): Promise<string> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return 'mock-verification-id-' + Date.now();
    } catch (error: any) {
      console.error('Phone OTP error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Verify phone OTP and sign in (MOCK)
   */
  async verifyPhoneOTP(verification: OTPVerification): Promise<User> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user: User = {
        uid: 'mock-phone-user-' + Date.now(),
        email: null,
        displayName: 'Phone User',
        photoURL: null,
        phoneNumber: null, // Would be the actual phone number
        isOnline: true,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.currentUser = user;
      await AsyncStorage.setItem('userLoggedIn', 'true');
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      
      this.notifyListeners();
      return user;
    } catch (error: any) {
      console.error('Phone verification error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Send password reset email (MOCK)
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Mock: Password reset email sent to', email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      this.currentUser = null;
      await AsyncStorage.removeItem('userLoggedIn');
      await AsyncStorage.removeItem('currentUser');
      this.notifyListeners();
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Listen to authentication state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.listeners.push(callback);
    // Call immediately with current state
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Restore user session from AsyncStorage
   */
  async restoreSession(): Promise<void> {
    try {
      const userLoggedIn = await AsyncStorage.getItem('userLoggedIn');
      const userData = await AsyncStorage.getItem('currentUser');
      
      if (userLoggedIn === 'true' && userData) {
        this.currentUser = JSON.parse(userData);
        this.notifyListeners();
      }
    } catch (error) {
      console.log('Error restoring session:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentUser));
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: any): Error {
    let message = 'An authentication error occurred';

    // Mock error handling
    if (error.message?.includes('email-already-in-use')) {
      message = 'This email address is already registered';
    } else if (error.message?.includes('invalid-email')) {
      message = 'Invalid email address';
    } else if (error.message?.includes('weak-password')) {
      message = 'Password is too weak. Please choose a stronger password';
    } else if (error.message?.includes('user-not-found')) {
      message = 'No account found with this email';
    } else if (error.message?.includes('wrong-password')) {
      message = 'Incorrect password';
    } else {
      message = error.message || 'Authentication failed';
    }

    return new Error(message);
  }
}

export default new AuthService();
