import { DefaultTheme } from "styled-components";

export const theme: DefaultTheme = {
  colors: {
    primary: "#6A11CB",
    primaryDark: "#5303ab",
    secondary: "#8428d3",
    secondaryDark: "#6a18b3",
    accent: "#FF416C",
    orange: "#FF4B2B",
    accentSecondary: "#ff8f56",
    white: "#FFFFFF",
    black: "#000000",
    dark: "#222222",
    success: "#28a745",
    danger: "#dc3545",
    warning: "#FFB800",
    info: "#17a2b8",
    background: "#F9FAFB",
    text: {
      primary: "#333333",
      secondary: "#6c757d",
      white: "#FFFFFF"
    },
    gray: {
      light: "#f4f4f6",
      medium: "#ced4da",
      dark: "#6c757d"
    },
    gradients: {
      primary: "linear-gradient(135deg, #6A11CB 0%, #8428d3 100%)",
      secondary: "linear-gradient(135deg, #8428d3 0%, #9b55db 100%)",
      accent: "linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)",
      dark: "linear-gradient(135deg, #222222 0%, #444444 100%)",
      purple: "linear-gradient(135deg, #6A11CB 0%, #DB9DFF 100%)",
      action: "linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)"
    }
  },
  shadows: {
    sm: "0 1px 3px rgba(0, 0, 0, 0.1)",
    md: "0 4px 6px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px rgba(0, 0, 0, 0.1)"
  },
  borderRadius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px"
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  }
}; 