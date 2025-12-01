/**
 * Theme configuration for not-env frontend
 * Modularized for easy switching between light and dark modes
 */

export const lightTheme = {
  background: {
    primary: '#FEFCF8', // Ivory/bone
    secondary: '#FFFFFF',
    tertiary: '#FAF8F3',
  },
  text: {
    primary: '#2C2C2C',
    secondary: '#6B6B6B',
    tertiary: '#9A9A9A',
  },
  border: {
    primary: '#E8E6E1',
    secondary: '#D4D2CD',
  },
  blue: {
    primary: '#5B8DB8', // Softer blue
    hover: '#4A7BA5',
    light: '#E8F0F7',
    dark: '#3D6B94',
  },
  red: {
    primary: '#C85A5A',
    hover: '#B54848',
    light: '#F5E8E8',
  },
  green: {
    primary: '#6B9B7A',
    hover: '#5A8A69',
    light: '#E8F3EC',
  },
  yellow: {
    primary: '#D4A574',
    hover: '#C49564',
    light: '#F5EDE3',
  },
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
};

export const darkTheme = {
  background: {
    primary: '#1A1A1A',
    secondary: '#242424',
    tertiary: '#2C2C2C',
  },
  text: {
    primary: '#F5F5F5',
    secondary: '#B8B8B8',
    tertiary: '#8A8A8A',
  },
  border: {
    primary: '#3A3A3A',
    secondary: '#4A4A4A',
  },
  blue: {
    primary: '#6BA3D1',
    hover: '#7BB3E1',
    light: '#2A3A4A',
    dark: '#5B93C1',
  },
  red: {
    primary: '#D87070',
    hover: '#E88080',
    light: '#3A2A2A',
  },
  green: {
    primary: '#7BAB8A',
    hover: '#8BBB9A',
    light: '#2A3A2A',
  },
  yellow: {
    primary: '#E4B584',
    hover: '#F4C594',
    light: '#3A2A1A',
  },
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
  },
};

// Current theme (will be switchable later)
export const theme = lightTheme;

