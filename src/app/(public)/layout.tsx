'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from 'styled-components';
import StyledComponentsRegistry from '../../lib/registry';
import { theme } from '../../styles/theme';

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
      <StyledComponentsRegistry>
        <ThemeProvider theme={theme}>
          {children}
        </ThemeProvider>
      </StyledComponentsRegistry>
    );
  
} 