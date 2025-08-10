// Authentication Store - Zustand
// Manages user authentication state and user profile with persistent secure storage

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authStorageService, { UserSession, AuthTokens, UserCredentials } from '../services/authStorageService';

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;
  biometricEnabled: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  clearError: () => void;
  
  // Persistent authentication methods
  loginWithCredentials: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  loginWithBiometrics: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  secureLogout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  setRememberMe: (remember: boolean) => void;
  setBiometricEnabled: (enabled: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      rememberMe: false,
      biometricEnabled: false,

      // Set user data
      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Set error message
      setError: (error: string | null) => {
        set({ error });
      },

      // Login user
      login: (user: User) => {
        set({
          user: {
            ...user,
            isOnline: true,
            lastSeen: new Date(),
            updatedAt: new Date(),
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      // Logout user
      logout: () => {
        const { user } = get();
        
        // Update online status before logout
        if (user) {
          set({
            user: {
              ...user,
              isOnline: false,
              lastSeen: new Date(),
              updatedAt: new Date(),
            },
          });
        }
        
        // Clear auth state
        setTimeout(() => {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }, 100);
      },

      // Update user profile
      updateUser: (updates: Partial<User>) => {
        const { user } = get();
        
        if (user) {
          set({
            user: {
              ...user,
              ...updates,
              updatedAt: new Date(),
            },
          });
        }
      },

      // Set online/offline status
      setOnlineStatus: (isOnline: boolean) => {
        const { user } = get();
        
        if (user) {
          set({
            user: {
              ...user,
              isOnline,
              lastSeen: new Date(),
              updatedAt: new Date(),
            },
          });
        }
      },

      // Clear error message
      clearError: () => {
        set({ error: null });
      },

      // Login with email/password and optional persistence
      loginWithCredentials: async (email: string, password: string, rememberMe = false) => {
        try {
          set({ isLoading: true, error: null });

          // Simulate API call (replace with actual authentication service)
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock user data (replace with actual API response)
          const mockUser: User = {
            uid: 'user_' + Date.now(),
            email,
            displayName: email.split('@')[0],
            photoURL: null,
            phoneNumber: null,
            isOnline: true,
            lastSeen: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Mock tokens (replace with actual tokens from API)
          const mockTokens: AuthTokens = {
            accessToken: 'mock_access_token_' + Date.now(),
            refreshToken: 'mock_refresh_token_' + Date.now(),
            expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
          };

          // Create user session
          const session: UserSession = {
            user: {
              id: mockUser.uid,
              email: mockUser.email,
              name: mockUser.displayName || '',
              avatar: mockUser.photoURL,
              phone: mockUser.phoneNumber,
            },
            tokens: mockTokens,
            isAuthenticated: true,
            lastLoginAt: Date.now(),
          };

          // Store session
          await authStorageService.storeSession(session);
          
          // Store credentials if remember me is enabled
          if (rememberMe) {
            await authStorageService.storeCredentials({ username: email, password });
            await authStorageService.setRememberMe(true);
            set({ rememberMe: true });
          } else {
            await authStorageService.setRememberMe(false);
          }

          // Update auth state
          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

        } catch (error) {
          console.error('Login failed:', error);
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
        }
      },

      // Login with biometrics using stored credentials
      loginWithBiometrics: async () => {
        try {
          set({ isLoading: true, error: null });

          // Check if biometrics are available
          const isKeychainAvailable = await authStorageService.isKeychainAvailable();
          if (!isKeychainAvailable) {
            throw new Error('Biometric authentication is not available');
          }

          // Get stored credentials
          const credentials = await authStorageService.getCredentials();
          if (!credentials) {
            throw new Error('No stored credentials found');
          }

          // Authenticate with stored credentials
          await get().loginWithCredentials(credentials.username, credentials.password, true);

        } catch (error) {
          console.error('Biometric login failed:', error);
          set({
            error: error instanceof Error ? error.message : 'Biometric authentication failed',
            isLoading: false,
          });
        }
      },

      // Initialize authentication on app start
      initializeAuth: async () => {
        try {
          set({ isLoading: true, error: null });

          // Check for existing session
          const session = await authStorageService.getSession();
          if (session && session.isAuthenticated) {
            // Convert session user to User type
            const user: User = {
              uid: session.user.id,
              email: session.user.email,
              displayName: session.user.name,
              photoURL: session.user.avatar || null,
              phoneNumber: session.user.phone || null,
              isOnline: true,
              lastSeen: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            // Restore authenticated state
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            // Check if tokens need refresh
            const needsRefresh = await authStorageService.needsTokenRefresh();
            if (needsRefresh) {
              await get().refreshTokens();
            }

          } else {
            // No valid session found
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }

          // Get remember me preference
          const rememberMe = await authStorageService.getRememberMe();
          const biometricEnabled = await authStorageService.isKeychainAvailable();
          
          set({ rememberMe, biometricEnabled });

        } catch (error) {
          console.error('Auth initialization failed:', error);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Secure logout - clear all stored data
      secureLogout: async () => {
        try {
          set({ isLoading: true });

          // Clear all stored authentication data
          await authStorageService.clearAll();

          // Update state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            rememberMe: false,
          });

        } catch (error) {
          console.error('Secure logout failed:', error);
          // Still clear local state even if storage clear fails
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            rememberMe: false,
          });
        }
      },

      // Refresh authentication tokens
      refreshTokens: async () => {
        try {
          const session = await authStorageService.getSession();
          if (!session) return;

          // Simulate token refresh API call (replace with actual service)
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Mock new tokens (replace with actual API response)
          const newTokens: AuthTokens = {
            accessToken: 'refreshed_access_token_' + Date.now(),
            refreshToken: session.tokens.refreshToken,
            expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
          };

          // Update stored tokens
          await authStorageService.updateTokens(newTokens);

        } catch (error) {
          console.error('Token refresh failed:', error);
          // If token refresh fails, force logout
          await get().secureLogout();
        }
      },

      // Set remember me preference
      setRememberMe: (remember: boolean) => {
        set({ rememberMe: remember });
        authStorageService.setRememberMe(remember);
      },

      // Set biometric authentication enabled
      setBiometricEnabled: (enabled: boolean) => {
        set({ biometricEnabled: enabled });
      },
    }),
    {
      name: 'love-connect-auth-storage', // Storage key
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user data and auth status
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Handle date serialization/deserialization
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          // Convert string dates back to Date objects
          state.user.lastSeen = new Date(state.user.lastSeen);
          state.user.createdAt = new Date(state.user.createdAt);
          state.user.updatedAt = new Date(state.user.updatedAt);
        }
      },
    }
  )
);

// Auth hook for components
export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    rememberMe,
    biometricEnabled,
    setUser,
    setLoading,
    setError,
    login,
    logout,
    updateUser,
    setOnlineStatus,
    clearError,
    loginWithCredentials,
    loginWithBiometrics,
    initializeAuth,
    secureLogout,
    refreshTokens,
    setRememberMe,
    setBiometricEnabled,
  } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    rememberMe,
    biometricEnabled,
    setUser,
    setLoading,
    setError,
    login,
    logout,
    updateUser,
    setOnlineStatus,
    clearError,
    loginWithCredentials,
    loginWithBiometrics,
    initializeAuth,
    secureLogout,
    refreshTokens,
    setRememberMe,
    setBiometricEnabled,
  };
};

export default useAuthStore;
