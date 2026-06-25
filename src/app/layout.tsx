import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'REVOKE — ERC-20 APPROVAL SCANNER',
  description: 'Scan and revoke dangerous ERC-20 token approvals across 6 chains. Protect your wallet from scam and phishing attacks.',
  keywords: ['revoke', 'approvals', 'ERC-20', 'ethereum', 'wallet', 'security', 'crypto'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable}`}>
      <body className="font-mono bg-white text-black antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}