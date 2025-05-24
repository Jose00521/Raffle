'use client';

import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import Header from './Header';
import Footer from './Footer';
import { theme } from '../../styles/theme';

const Main = styled.main`
  min-height: calc(100vh - 70px - 300px);
  background-color: ${({ theme }) => theme.colors.background};
`;

interface LayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children,
  hideHeader = false,
  hideFooter = false
}) => {
  return (
    <ThemeProvider theme={theme}>
      {!hideHeader && <Header />}
      <Main>{children}</Main>
      {!hideFooter && <Footer />}
    </ThemeProvider>
  );
};

export default Layout; 