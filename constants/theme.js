// constants/vendorTheme.js (or wherever your theme is)
import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';

// Define Paper-compatible font configuration
const fontConfig = {
  regular: {
    fontFamily: 'System',
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0,
  },
  medium: {
    fontFamily: 'System',
    fontWeight: '500',
    lineHeight: 22,
    letterSpacing: 0.5,
  },
  light: {
    fontFamily: 'System',
    fontWeight: '300',
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  thin: {
    fontFamily: 'System',
    fontWeight: '100',
    lineHeight: 16,
    letterSpacing: 0.1,
  },
};

// Or use default config (recommended for simplicity)
const defaultFontConfig = configureFonts({ config: fontConfig });

// Light Theme (Paper + Your Colors)
export const CustomLightTheme = {
  ...MD3LightTheme,
  dark: false,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#003366',
    background: '#F8FAFC',
    secondary: '#f8f7f7ff',
    card: '#FFFFFF',
    sub_card: '#f0f0f0ff',
    text: '#333333',
    sub_text: '#7d7d7dff',
    placeholder: '#757575',
    disabled: '#BDBDBD',
    error: '#D32F2F',
    success: '#388E3C',
    warning: '#F57C00',
    light: '#3a3a3aff',
    indicator: '#003366',
    border: '#e9e8e8ff',
    notification: '#FF4500',
    highlight: 'rgba(0, 0, 0, 0.5)',
  },
  fonts: defaultFontConfig,
};

// Dark Theme
export const CustomDarkTheme = {
  ...MD3DarkTheme,
  dark: true,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#003366',
    primary2: '#151775ff',
    // background: '#1E293B',
    background: '#000',
    secondary: '#CCCC',
    disabled: '#BDBDBD',
    // card: '#415970ff',
    card: '#1a1a1aff',
    // sub_card: '#415970ff',
    sub_card: '#0f0f0fff',
    text: '#CCC',
    sub_text: '#CCCC',
    light: '#FFFFFF',
    indicator: '#5a85b0ff',
    border: '#272727',
    notification: '#FF4500',
    highlight: 'rgba(0, 0, 0, 0.2)',
  },
  fonts: defaultFontConfig,
};