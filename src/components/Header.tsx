'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { SUPPORTED_CHAINS, CHAIN_COLORS, CHAIN_NAMES } from '@/lib/config';

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
    <header className="fixed top-0 left-0 right-0 z-50 border-b-2 border-black bg-[var(--bg)]">
      <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-6">
        {/* Logo — pure text, no icon */}
        <a href="/" className="flex items-baseline gap-1 group">
          <span className="font-bold text-sm tracking-tight uppercase">REVOKE</span>
          <span className="text-[10px] text-[var(--text-muted)] tracking-wide">.ETH</span>
        </a>

        {/* Right */}
        <div className="flex items-center gap-2">
          {isConnected && chain && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowChains(!showChains)}
                className="flex items-center gap-2 border border-black px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase hover:bg-black hover:text-white transition-all"
              >
                <span className="h-2 w-2" style={{ backgroundColor: CHAIN_COLORS[chain.id] || '#888' }} />
                {CHAIN_NAMES[chain.id] || chain.name}
                <span className="text-[8px]">▼</span>
              </button>
              
              {showChains && (
                <div className="absolute right-0 top-full mt-1 w-48 border-2 border-black bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  {SUPPORTED_CHAINS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { switchChain({ chainId: c.id }); setShowChains(false); }}
                      className={`flex w-full items-center gap-2.5 px-3 py-2 text-[10px] font-bold tracking-wide uppercase transition-colors ${
                        chain.id === c.id
                          ? 'bg-black text-white'
                          : 'hover:bg-[var(--bg-alt)]'
                      }`}
                    >
                      <span className="h-2 w-2" style={{ backgroundColor: CHAIN_COLORS[c.id] }} />
                      {CHAIN_NAMES[c.id]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {isConnected ? (
            <div className="flex items-center gap-1.5">
              <span className="border border-black px-2.5 py-1 font-mono text-[10px] tracking-wide">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <button
                onClick={() => disconnect()}
                className="border border-black p-1 hover:bg-black hover:text-white transition-all text-[10px]"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="flex items-center gap-2 bg-black px-4 py-1.5 text-[10px] font-bold tracking-wide uppercase text-white hover:bg-[var(--accent)] transition-all"
            >
              CONNECT WALLET
            </button>
          )}
        </div>
      </div>
    </header>
  );
}