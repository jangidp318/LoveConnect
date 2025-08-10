// Theme Configuration for Love Connect
// Supports Light/Dark mode with Love Red accent color

export interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  notification: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  love: string; // Love Red accent
  onlineDot: string;
  shadow: string;
}

export interface Theme {
  dark: boolean;
  colors: ThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  typography: {
    h1: number;
    h2: number;
    h3: number;
    body: number;
    caption: number;
    button: number;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
    round: number;
  };
  elevation: {
    small: number;
    medium: number;
    large: number;
  };
}

// Love Red Theme Colors
const LOVE_RED = '#E91E63';
const LOVE_RED_LIGHT = '#F8BBD9';
const LOVE_RED_DARK = '#AD1457';

// Light Theme
export const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: LOVE_RED,
    background: '#FFFFFF',
    surface: '#F8F9FA',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    border: '#E0E0E0',
    notification: LOVE_RED,
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
    love: LOVE_RED,
    onlineDot: '#4CAF50',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    h1: 28,
    h2: 24,
    h3: 20,
    body: 16,
    caption: 12,
    button: 16,
  },
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    round: 50,
  },
  elevation: {
    small: 2,
    medium: 4,
    large: 8,
  },
};

// Dark Theme
export const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: LOVE_RED,
    background: '#000000',
    surface: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    border: '#333333',
    notification: LOVE_RED,
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
    love: LOVE_RED,
    onlineDot: '#4CAF50',
    shadow: 'rgba(255, 255, 255, 0.1)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    h1: 28,
    h2: 24,
    h3: 20,
    body: 16,
    caption: 12,
    button: 16,
  },
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    round: 50,
  },
  elevation: {
    small: 2,
    medium: 4,
    large: 8,
  },
};

// Common styles that work with both themes
export const commonStyles = {
  shadow: {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardShadow: {
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2.22,
    elevation: 3,
  },
};

export default { lightTheme, darkTheme, commonStyles };
