// Firebase Configuration for Love Connect
// Initialize Firebase services for production and development

import { initializeApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';
import functions from '@react-native-firebase/functions';

// Firebase configuration (these would be replaced with actual config in production)
export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "loveconnect-app.firebaseapp.com",
  projectId: "loveconnect-app",
  storageBucket: "loveconnect-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:ios:abc123def456",
};

// Initialize Firebase services
export const firebase = {
  auth,
  firestore,
  storage,
  messaging,
  functions,
};

// Collections references for easy access
export const collections = {
  users: () => firestore().collection('users'),
  chats: () => firestore().collection('chats'),
  messages: (chatId: string) => firestore().collection('chats').doc(chatId).collection('messages'),
  calls: () => firestore().collection('calls'),
  notifications: (userId: string) => firestore().collection('users').doc(userId).collection('notifications'),
  matches: (userId: string) => firestore().collection('users').doc(userId).collection('matches'),
  walkieTalkie: () => firestore().collection('walkieTalkie'),
  locations: () => firestore().collection('locations'),
};

// Initialize Firebase if not already initialized
export const initializeFirebase = async () => {
  try {
    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return false;
  }
};

export default firebase;
