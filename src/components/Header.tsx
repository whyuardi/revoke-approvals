'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { SUPPORTED_CHAINS, CHAIN_COLORS, CHAIN_NAMES } from '@/lib/config';
import { Shield, ChevronDown, LogOut, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [showChains, setShowChains] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowChains(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04] bg-[#050505]/70 backdrop-blur-2xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 group-hover:bg-amber-500/15 transition-colors">
            <Shield className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-white">revoke</span>
          <span className="text-[11px] font-medium text-white/20 tracking-wide">.eth</span>
        </a>

        {/* Right */}
        <div className="flex items-center gap-2">
          {isConnected && chain && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowChains(!showChains)}
                className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-white/50 hover:text-white/70 hover:bg-white/[0.06] transition-all"
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CHAIN_COLORS[chain.id] || '#888' }} />
                {CHAIN_NAMES[chain.id] || chain.name}
                <ChevronDown className="h-3 w-3 opacity-50" />
              </button>
              
              <AnimatePresence>
                {showChains && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-white/[0.06] bg-[#0C0C0C] p-1 shadow-2xl shadow-black/50"
                  >
                    {SUPPORTED_CHAINS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { switchChain({ chainId: c.id }); setShowChains(false); }}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-colors ${
                          chain.id === c.id
                            ? 'bg-white/[0.06] text-white'
                            : 'text-white/40 hover:bg-white/[0.04] hover:text-white/60'
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CHAIN_COLORS[c.id] }} />
                        {CHAIN_NAMES[c.id]}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {isConnected ? (
            <div className="flex items-center gap-1.5">
              <span className="rounded-lg bg-white/[0.04] border border-white/[0.04] px-2.5 py-1.5 font-mono text-[11px] text-white/40 tracking-wide">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <button
                onClick={() => disconnect()}
                className="rounded-lg border border-white/[0.06] p-1.5 text-white/25 hover:text-white/50 hover:bg-white/[0.04] transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="flex items-center gap-2 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-amber-400 active:bg-amber-600 transition-all"
            >
              <Wallet className="h-3.5 w-3.5" />
              Connect
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
