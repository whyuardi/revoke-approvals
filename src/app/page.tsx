'use client';

import Header from '@/components/Header';
import Scanner from '@/components/Scanner';
import { Shield, ExternalLink, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen relative">
      {/* Subtle ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
      
      <Header />
      
      <main className="relative mx-auto max-w-2xl px-5 pt-24 pb-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 mb-4">
            <div className="h-1 w-1 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] font-medium uppercase tracking-widest text-amber-400/80">Live on 6 chains</span>
          </div>
          
          <h1 className="text-[32px] sm:text-[40px] font-bold leading-[1.1] tracking-tight">
            Revoke dangerous
            <br />
            <span className="text-white/40">token approvals</span>
          </h1>
          
          <p className="mt-3 text-[13px] leading-relaxed text-white/30 max-w-md">
            Scan your wallet for ERC-20 approvals. See which contracts can drain your funds. 
            Revoke in one click.
          </p>

          {/* Trust signals */}
          <div className="mt-5 flex items-center gap-4 text-[11px] text-white/20">
            <span className="flex items-center gap-1.5">
              <Shield className="h-3 w-3" />
              Non-custodial
            </span>
            <span className="flex items-center gap-1.5">
              <Code2 className="h-3 w-3" />
              Open source
            </span>
            <span className="flex items-center gap-1.5">
              No login required
            </span>
          </div>
        </motion.div>

        {/* Scanner */}
        <Scanner />

        {/* Footer */}
        <footer className="mt-16 border-t border-white/[0.04] pt-5">
          <div className="flex items-center justify-between text-[11px] text-white/15">
            <span>© 2026 revoke.eth</span>
            <a
              href="https://github.com/whyuardi/revoke-approvals"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white/30 transition-colors"
            >
              GitHub
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
