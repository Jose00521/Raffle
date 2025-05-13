'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from 'styled-components';
import StyledComponentsRegistry from '../../lib/registry';
import { theme } from '../../styles/theme';

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    // This would be replaced with a real authentication check
    const checkAuth = () => {
      // For development purposes, we'll assume the user is authenticated
      // In production, you would check for session/token validity
      const isUserLoggedIn = true; // Replace with actual auth check
      
      setIsAuthenticated(isUserLoggedIn);
      setIsLoading(false);
      
      if (!isUserLoggedIn) {
        // Redirect to login if not authenticated
        router.push('/login');
      }
    };
    
    checkAuth();
  }, [router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundColor: '#f5f7fa' 
      }}>
        <p>Carregando...</p>
      </div>
    );
  }

  // Show authenticated content
  if (isAuthenticated) {
    return (
      <StyledComponentsRegistry>
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      </StyledComponentsRegistry>
    );
  }

  // This should not render if redirect works correctly
  return null;
} 