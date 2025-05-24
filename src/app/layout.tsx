'use client';

import type { Metadata } from "next";
import StyledComponentsRegistry from '../lib/registry';
import { SessionProvider } from 'next-auth/react';
import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
});

// export const metadata: Metadata = {
//   title: "RifaApp - Concorra a prêmios incríveis",
//   description: "Compre rifas online e concorra a prêmios como carros, motos, eletrônicos e dinheiro. Sorteios 100% auditados e transparentes.",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className={poppins.className} suppressHydrationWarning>
        <SessionProvider>
          <StyledComponentsRegistry>
            {children}
          </StyledComponentsRegistry>
        </SessionProvider>
        {/* <StyledComponentsRegistry>
          <AuthProvider>
            {children}
          </AuthProvider>
        </StyledComponentsRegistry> */}
      </body>
    </html>
  );
}
