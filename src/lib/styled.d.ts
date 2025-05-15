import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      primaryDark?: string;
      secondary: string;
      secondaryDark?: string;
      accent?: string;
      orange?: string;
      accentSecondary?: string;
      text: {
        primary: string;
        secondary: string;
        white: string;
        light?: string;
        gold?: string;
      };
      white: string;
      background: string;
      backgroundDark?: string;
      black?: string;
      gray: {
        light: string;
        dark: string;
        medium?: string;
      };
      gradients: {
        purple: string;
        action: string;
        dark: string;
        gold?: string;
      };
      success: string;
      error?: string;
      warning?: string;
      info?: string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
      gold: string;
      xl?: string;
    };
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      xl?: string;
      full?: string;
    };
    fontSizes: {
      small?: string;
      medium?: string;
      large?: string;
      xs?: string;
      sm?: string;
      md?: string;
      lg?: string;
      xl?: string;
      '2xl'?: string;
      '3xl'?: string;
      '4xl'?: string;
      '5xl'?: string;
    };
    spacing: {
      small?: string;
      medium?: string;
      large?: string;
      xs?: string;
      sm?: string;
      md?: string;
      lg?: string;
      xl?: string;
      '2xl'?: string;
      '3xl'?: string;
    };
    breakpoints: {
      mobile?: string;
      tablet?: string;
      desktop?: string;
      sm?: string;
      md?: string;
      lg?: string;
      xl?: string;
      '2xl'?: string;
    };
  }
} 