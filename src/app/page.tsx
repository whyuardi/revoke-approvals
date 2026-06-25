'use client';

import Header from '@/components/Header';
import Scanner from '@/components/Scanner';
import { Shield, ExternalLink } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Hero */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-xs text-amber-400">
            <Shield className="h-3 w-3" />
            Protect your wallet
          </div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Revoke Token Approvals
          </h1>
          <p className="mt-3 text-sm text-white/40 max-w-lg mx-auto">
            Scan your wallet for ERC-20 token approvals. Revoke dangerous or unused 
            approvals to protect your assets from scam and phishing attacks.
          </p>
        </div>

        {/* Scanner */}
        <Scanner />

        {/* Footer */}
        <footer className="mt-16 border-t border-white/5 py-6">
          <div className="flex items-center justify-between text-xs text-white/30">
            <span>© 2026 Revoke.eth</span>
            <a
              href="https://github.com/whyuardi"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white/50"
            >
              GitHub <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
