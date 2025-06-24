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
        
        {/* Meta Pixel Code - Facebook */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', 'SEU_PIXEL_ID_AQUI'); 
            fbq('track', 'PageView');
          `}
        </Script>

                {/* Meta Pixel Code - Google */}
                <Script id="google-pixel" strategy="afterInteractive">
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
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=SEU_PIXEL_ID_AQUI&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
        
        {/* Preload do som de moeda para uso na página de sucesso */}
        <link rel="preload" as="audio" href="/sounds/coin-success.mp3" type="audio/mpeg" />
      </head>
      <body className={poppins.className} suppressHydrationWarning>

        {/* Meta Pixel Code - Google */}
        <Script id="google-pixel" strategy="beforeInteractive">
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
