'use client';

import 'reflect-metadata';
import type { Metadata } from "next";
import StyledComponentsRegistry from '../lib/registry';
import { SessionProvider } from 'next-auth/react';
import { Poppins } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

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
        <Script id="google-tag-manager-head" strategy="beforeInteractive">
          {`
          <!-- Google Tag Manager -->
            <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WDG4RH3C');</script>
            <!-- End Google Tag Manager -->
          `}
        </Script>
      </head>
      <body className={poppins.className} suppressHydrationWarning>
      <Script id="google-tag-manager-body" strategy="afterInteractive">
          {`
            <!-- Google Tag Manager (noscript) -->
            <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WDG4RH3C"
            height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
            <!-- End Google Tag Manager (noscript) -->
          `}
        </Script>
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
