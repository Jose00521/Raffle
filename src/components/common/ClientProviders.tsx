'use client';

import { SessionProvider } from 'next-auth/react';
import StyledComponentsRegistry from '@/lib/registry';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <StyledComponentsRegistry>
        {children}
      </StyledComponentsRegistry>
    </SessionProvider>
  );
} 