'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from 'styled-components';
import StyledComponentsRegistry from '../../lib/registry';
import { theme } from '../../styles/theme';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  // Show authenticated content

    return (
      <>
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          limit={5}
          style={{ zIndex: 99999 }}
        />
        <StyledComponentsRegistry>
          <ThemeProvider theme={theme}>
            {children}
          </ThemeProvider>
        </StyledComponentsRegistry>
      </>
    );
  
} 