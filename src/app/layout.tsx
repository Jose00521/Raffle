import 'reflect-metadata';
import type { Metadata } from "next";
import { Poppins } from 'next/font/google';
import './globals.css';
import { GoogleTagManager } from '@next/third-parties/google'
import ClientProviders from '@/components/common/ClientProviders';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "RifaApp - Concorra a prêmios incríveis",
  description: "Compre rifas online e concorra a prêmios como carros, motos, eletrônicos e dinheiro. Sorteios 100% auditados e transparentes.",
};

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
        <ClientProviders>
          {children}
        </ClientProviders>
        
        <GoogleTagManager gtmId="GTM-WDG4RH3C" />
      </body>
    </html>
  );
}
