'use client';

import Header from '@/components/Header';
import Scanner from '@/components/Scanner';
import { useState, useEffect } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen relative z-10">
      <Header />
      
      <main className="mx-auto max-w-3xl px-6 pt-28 pb-24">
        {/* Hero — raw brutalist */}
        <div className={`mb-12 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
          <div className="inline-block border border-black px-3 py-1 mb-6 text-[10px] font-bold tracking-[0.2em] uppercase">
            LIVE ON 6 CHAINS
          </div>
          
          <h1 className="text-[36px] sm:text-[48px] font-bold leading-[1.05] tracking-tight uppercase">
            REVOKE
            <br />
            <span className="text-[20px] sm:text-[26px] font-normal text-[var(--text-muted)] tracking-normal normal-case">
              dangerous token approvals
            </span>
          </h1>
          
          <p className="mt-4 text-[13px] leading-relaxed text-[var(--text-muted)] max-w-md font-normal">
            Scan your wallet for ERC-20 approvals. See which contracts can drain your funds. 
            Revoke in one click.
          </p>

          {/* Trust signals — no icons, pure text */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-medium tracking-wide uppercase text-[var(--text-muted)]">
            <span>[NON-CUSTODIAL]</span>
            <span>[OPEN SOURCE]</span>
            <span>[NO LOGIN]</span>
          </div>
        </div>

        <Scanner />

        {/* Footer — monospace, raw */}
        <footer className="mt-20 border-t-2 border-black pt-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-[var(--text-muted)]">
            <span className="font-medium">© 2026 REVOKE.ETH</span>
            <a
              href="https://github.com/whyuardi/revoke-approvals"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-black transition-colors border-b border-transparent hover:border-black"
            >
              GITHUB →
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}