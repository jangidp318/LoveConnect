// Store Index - Export all Zustand stores
// Centralized exports for all app stores

export { useAuthStore, useAuth, type User } from './authStore';
export { useThemeStore, useTheme, setupThemeListener } from './themeStore';

// TODO: Add more stores as they are created
// export { useChatStore } from './chatStore';
// export { useCallStore } from './callStore';
