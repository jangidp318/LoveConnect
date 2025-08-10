// Theme Store - Zustand with AsyncStorage persistence
// Manages Light/Dark mode switching and persistence

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ColorSchemeName } from 'react-native';
import { Theme, lightTheme, darkTheme } from '../theme';

interface ThemeState {
  // State
  theme: Theme;
  isDarkMode: boolean;
  isSystemTheme: boolean;
  
  // Actions
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  enableSystemTheme: () => void;
  disableSystemTheme: () => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: lightTheme,
      isDarkMode: false,
      isSystemTheme: true,

      // Toggle between light and dark theme
      toggleTheme: () => {
        const { isDarkMode } = get();
        set({
          isDarkMode: !isDarkMode,
          theme: !isDarkMode ? darkTheme : lightTheme,
          isSystemTheme: false, // Disable system theme when manually toggling
        });
      },

      // Set specific theme
      setTheme: (isDark: boolean) => {
        set({
          isDarkMode: isDark,
          theme: isDark ? darkTheme : lightTheme,
        });
      },

      // Enable system theme following
      enableSystemTheme: () => {
        const systemColorScheme = Appearance.getColorScheme();
        const isDark = systemColorScheme === 'dark';
        
        set({
          isSystemTheme: true,
          isDarkMode: isDark,
          theme: isDark ? darkTheme : lightTheme,
        });
      },

      // Disable system theme following
      disableSystemTheme: () => {
        set({
          isSystemTheme: false,
        });
      },

      // Initialize theme on app startup
      initializeTheme: () => {
        const { isSystemTheme, isDarkMode } = get();
        
        if (isSystemTheme) {
          const systemColorScheme = Appearance.getColorScheme();
          const isDark = systemColorScheme === 'dark';
          
          set({
            isDarkMode: isDark,
            theme: isDark ? darkTheme : lightTheme,
          });
        } else {
          // Use persisted theme preference
          set({
            theme: isDarkMode ? darkTheme : lightTheme,
          });
        }
      },
    }),
    {
      name: 'love-connect-theme-storage', // Storage key
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist theme preference, not the actual theme object
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        isSystemTheme: state.isSystemTheme,
      }),
    }
  )
);

// System appearance change listener
export const setupThemeListener = () => {
  const listener = (preferences: { colorScheme: ColorSchemeName }) => {
    const { isSystemTheme, setTheme } = useThemeStore.getState();
    
    if (isSystemTheme) {
      const isDark = preferences.colorScheme === 'dark';
      setTheme(isDark);
    }
  };

  // Listen for system theme changes
  const subscription = Appearance.addChangeListener(listener);
  
  return subscription;
};

// Theme hook for components
export const useTheme = () => {
  const { theme, isDarkMode, isSystemTheme, toggleTheme, enableSystemTheme, disableSystemTheme } = useThemeStore();
  
  return {
    theme,
    isDarkMode,
    isSystemTheme,
    toggleTheme,
    enableSystemTheme,
    disableSystemTheme,
    colors: theme.colors,
    spacing: theme.spacing,
    typography: theme.typography,
    borderRadius: theme.borderRadius,
    elevation: theme.elevation,
  };
};

export default useThemeStore;
