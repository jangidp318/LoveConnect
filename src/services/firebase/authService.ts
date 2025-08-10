// Firebase Authentication Service for Love Connect
// Handles all authentication operations with real Firebase integration

import AsyncStorage from '@react-native-async-storage/async-storage';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
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
  private authUnsubscribe: (() => void) | null = null;

  constructor() {
    // Listen to Firebase auth state changes
    this.setupAuthListener();
  }

  private setupAuthListener() {
    this.authUnsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Convert Firebase user to our User interface
        const user = await this.convertFirebaseUser(firebaseUser);
        this.currentUser = user;
        await AsyncStorage.setItem('userLoggedIn', 'true');
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        this.currentUser = null;
        await AsyncStorage.removeItem('userLoggedIn');
        await AsyncStorage.removeItem('currentUser');
      }
      this.notifyListeners();
    });
  }

  private async convertFirebaseUser(firebaseUser: FirebaseAuthTypes.User): Promise<User> {
    // Get or create user document in Firestore
    const userDoc = await firestore().collection('users').doc(firebaseUser.uid).get();
    
    let userData: any = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      phoneNumber: firebaseUser.phoneNumber,
      isOnline: true,
      lastSeen: new Date(),
      createdAt: firebaseUser.metadata.creationTime ? new Date(firebaseUser.metadata.creationTime) : new Date(),
      updatedAt: new Date(),
    };

    if (userDoc.exists) {
      // Update existing user data
      const existingData = userDoc.data();
      userData = { ...existingData, ...userData, updatedAt: new Date() };
      await firestore().collection('users').doc(firebaseUser.uid).update({
        isOnline: true,
        lastSeen: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } else {
      // Create new user document
      userData.createdAt = firestore.FieldValue.serverTimestamp();
      userData.updatedAt = firestore.FieldValue.serverTimestamp();
      userData.lastSeen = firestore.FieldValue.serverTimestamp();
      await firestore().collection('users').doc(firebaseUser.uid).set(userData);
    }

    return userData as User;
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(credentials: AuthCredentials): Promise<User> {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await auth().createUserWithEmailAndPassword(
        credentials.email,
        credentials.password
      );
      
      // Update profile if displayName is provided
      if (credentials.displayName) {
        await userCredential.user.updateProfile({
          displayName: credentials.displayName,
        });
      }

      // Firebase Auth listener will handle updating currentUser
      // Wait for the Firebase Auth listener to update the user
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get the user from our service state
      const user = this.currentUser;
      if (!user) {
        throw new Error('Failed to create user account');
      }
      
      return user;
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(credentials: AuthCredentials): Promise<User> {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    try {
      // Sign in with Firebase Auth
      await auth().signInWithEmailAndPassword(
        credentials.email,
        credentials.password
      );
      
      // Firebase Auth listener will handle updating currentUser
      // Wait for the Firebase Auth listener to update the user
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const user = this.currentUser;
      if (!user) {
        throw new Error('Failed to sign in');
      }
      
      return user;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Send OTP to phone number
   */
  async sendPhoneOTP(phoneNumber: string): Promise<string> {
    try {
      // Format phone number if needed (ensure it has country code)
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      // Send verification code
      const confirmation = await auth().signInWithPhoneNumber(formattedNumber);
      return confirmation.verificationId;
    } catch (error: any) {
      console.error('Phone OTP error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Verify phone OTP and sign in
   */
  async verifyPhoneOTP(verification: OTPVerification): Promise<User> {
    try {
      // Create credential
      const credential = auth.PhoneAuthProvider.credential(
        verification.verificationId,
        verification.code
      );
      
      // Sign in with credential
      await auth().signInWithCredential(credential);
      
      // Firebase Auth listener will handle updating currentUser
      // Wait for the Firebase Auth listener to update the user
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const user = this.currentUser;
      if (!user) {
        throw new Error('Failed to verify phone number');
      }
      
      return user;
    } catch (error: any) {
      console.error('Phone verification error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await auth().sendPasswordResetEmail(email);
      console.log('Password reset email sent to', email);
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
      // Update user status in Firestore first
      if (this.currentUser) {
        await firestore().collection('users').doc(this.currentUser.uid).update({
          isOnline: false,
          lastSeen: firestore.FieldValue.serverTimestamp(),
        });
      }
      
      // Sign out from Firebase Auth
      await auth().signOut();
      
      // Firebase Auth listener will handle clearing currentUser
      // and removing from AsyncStorage
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
      // This will be handled by Firebase Auth's own persistence mechanism
      // but we'll still check our AsyncStorage as a fallback
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

    // Firebase Auth error handling
    const errorCode = error.code;
    switch (errorCode) {
      case 'auth/email-already-in-use':
        message = 'This email address is already registered';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak. Please choose a stronger password';
        break;
      case 'auth/user-not-found':
        message = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/invalid-verification-code':
        message = 'The verification code is invalid';
        break;
      case 'auth/invalid-verification-id':
        message = 'The verification ID is invalid';
        break;
      case 'auth/too-many-requests':
        message = 'Too many sign-in attempts. Please try again later';
        break;
      default:
        message = error.message || 'Authentication failed';
    }

    return new Error(message);
  }
}

export default new AuthService();
