import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Revoke — Revoke ERC-20 Token Approvals',
  description: 'Scan and revoke dangerous ERC-20 token approvals across 6 chains. Protect your wallet from scam and phishing attacks.',
  keywords: ['revoke', 'approvals', 'ERC-20', 'ethereum', 'wallet', 'security', 'crypto'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} bg-[#050505] font-sans antialiased text-white`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
