import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      primaryDark: string;
      secondary: string;
      secondaryDark: string;
      accent: string;
      orange: string;
      accentSecondary: string;
      background: string;
      backgroundDark?: string;
      white: string;
      black: string;
      dark: string;
      success: string;
      error?: string;
      warning: string;
      info: string;
      text: {
        primary: string;
        secondary: string;
        white: string;
        light?: string;
        gold?: string;
      };
      gray: {
        light: string;
        medium: string;
        dark: string;
      };
      gradients: {
        primary: string;
        secondary: string;
        accent: string;
        dark: string;
        purple: string;
        action: string;
        gold?: string;
      };
    };
    fontSizes: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
      '5xl': string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      full?: string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      gold?: string;
    };
    breakpoints: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
  }
} 