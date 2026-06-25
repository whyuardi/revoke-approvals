import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Revoke Approvals — Revoke ERC-20 Token Approvals',
  description: 'Scan and revoke dangerous ERC-20 token approvals across Ethereum, BSC, Polygon, Arbitrum, Optimism, and Base. Protect your wallet from scam and phishing approvals.',
  keywords: ['revoke', 'approvals', 'ERC-20', 'ethereum', 'wallet', 'security', 'crypto'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-[#08080A] font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
