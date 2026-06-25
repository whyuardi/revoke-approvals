'use client';

import { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { SUPPORTED_CHAINS, CHAIN_COLORS, CHAIN_NAMES } from '@/lib/config';
import { Shield, ChevronDown, LogOut, Wallet } from 'lucide-react';

export default function Header() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const [showChains, setShowChains] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
            <Shield className="h-4 w-4 text-amber-400" />
          </div>
          <span className="font-semibold text-white">Revoke</span>
          <span className="text-xs text-white/30">.eth</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isConnected && chain && (
            <div className="relative">
              <button
                onClick={() => setShowChains(!showChains)}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 transition-colors"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: CHAIN_COLORS[chain.id] || '#888' }}
                />
                {CHAIN_NAMES[chain.id] || chain.name}
                <ChevronDown className="h-3 w-3" />
              </button>
              
              {showChains && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-white/10 bg-[#141415] p-1 shadow-2xl">
                  {SUPPORTED_CHAINS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        switchChain({ chainId: c.id });
                        setShowChains(false);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                        chain.id === c.id
                          ? 'bg-white/10 text-white'
                          : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: CHAIN_COLORS[c.id] }}
                      />
                      {CHAIN_NAMES[c.id]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {isConnected ? (
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-white/5 px-3 py-1.5 font-mono text-xs text-white/50">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <button
                onClick={() => disconnect()}
                className="rounded-lg border border-white/10 p-1.5 text-white/40 hover:bg-white/5 hover:text-white transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 transition-colors"
            >
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
