'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { isAddress } from 'viem';
import { scanApprovals, type Approval } from '@/lib/scanner';
import { SUPPORTED_CHAINS, CHAIN_NAMES, CHAIN_COLORS } from '@/lib/config';
import ApprovalList from './ApprovalList';

export default function Scanner() {
  const { address: connectedAddress } = useAccount();
  const [inputAddress, setInputAddress] = useState('');
  const [scanChain, setScanChain] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const targetAddress = inputAddress || connectedAddress;
  const isValidAddress = targetAddress && isAddress(targetAddress);

  const handleScan = async () => {
    if (!isValidAddress) return;
    setLoading(true);
    setError('');
    setApprovals([]);
    setScanned(false);
    setProgress('Initializing scanner...');

    try {
      const results = await scanApprovals(scanChain, targetAddress as `0x${string}`, (msg) => {
        setProgress(msg);
      });
      setApprovals(results);
      setScanned(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed. Check the address and try again.');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Row — raw monospace numbers */}
      <div className={`grid grid-cols-3 gap-3 transition-all duration-500 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        {[
          { label: 'APPROVALS', value: scanned ? String(approvals.length) : '—', danger: false },
          { label: 'CRITICAL', value: scanned ? String(approvals.filter(a => a.risk.level === 'critical').length) : '—', danger: true },
          { label: 'HIGH RISK', value: scanned ? String(approvals.filter(a => a.risk.level === 'high').length) : '—', danger: true },
        ].map((stat) => (
          <div key={stat.label} className="border-2 border-black bg-white p-4">
            <div className="text-[9px] font-bold tracking-[0.15em] uppercase text-[var(--text-muted)] mb-1">{stat.label}</div>
            <div className={`text-2xl font-bold ${stat.danger && stat.value !== '0' && stat.value !== '—' ? 'text-[var(--danger)]' : ''}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Scan Card */}
      <div className={`border-2 border-black bg-white p-5 transition-all duration-500 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 bg-black flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">⬤</span>
          </div>
          <h2 className="text-[11px] font-bold tracking-[0.15em] uppercase">SCAN WALLET</h2>
        </div>

        <div className="space-y-3">
          {/* Address Input */}
          <div>
            <input
              type="text"
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              placeholder={connectedAddress || '0x... paste wallet address'}
              className="w-full border-2 border-black bg-white px-4 py-3 font-mono text-sm placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none transition-colors"
            />
            {connectedAddress && !inputAddress && (
              <p className="mt-1.5 text-[10px] text-[var(--text-muted)] tracking-wide uppercase">
                Using connected wallet
              </p>
            )}
          </div>

          {/* Chain Selector — pill buttons */}
          <div className="flex flex-wrap gap-1.5">
            {SUPPORTED_CHAINS.map((c) => (
              <button
                key={c.id}
                onClick={() => setScanChain(c.id)}
                className={`flex items-center gap-1.5 border px-3 py-1.5 text-[10px] font-bold tracking-wide uppercase transition-all ${
                  scanChain === c.id
                    ? 'border-black bg-black text-white'
                    : 'border-[var(--border-light)] bg-white text-[var(--text-muted)] hover:border-black hover:bg-[var(--bg-alt)]'
                }`}
              >
                <span className="h-1.5 w-1.5" style={{ backgroundColor: CHAIN_COLORS[c.id] }} />
                {CHAIN_NAMES[c.id]}
              </button>
            ))}
          </div>

          {/* Scan Button */}
          <button
            onClick={handleScan}
            disabled={!isValidAddress || loading}
            className="group w-full bg-black px-4 py-3 text-sm font-bold tracking-wide uppercase text-white transition-all hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-30"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white animate-spin" />
                {progress || 'SCANNING...'}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                SCAN APPROVALS
                <span className="opacity-50 group-hover:translate-x-1 transition-transform">→</span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="border-2 border-[var(--danger)] bg-[var(--danger-bg)] px-4 py-3 text-xs text-[var(--danger)] font-bold uppercase tracking-wide">
          ✕ {error}
        </div>
      )}

      {/* Results */}
      {scanned && (
        <div>
          <ApprovalList
            approvals={approvals}
            onRevoke={(id) => setApprovals((prev) => prev.filter((a) => a.id !== id))}
          />
        </div>
      )}

      {/* Feature Cards — pre-scan, brutalist */}
      {!scanned && !loading && (
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 transition-all duration-500 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
          {[
            { num: '01', title: 'FAST SCAN', desc: 'Scans ~1M blocks in under 30 seconds via Approval event logs.' },
            { num: '02', title: 'RISK SCORE', desc: 'Unlimited approvals, unknown spenders, and old approvals flagged.' },
            { num: '03', title: 'ONE-CLICK', desc: 'Revoke with a single transaction. Costs gas, saves assets.' },
          ].map(({ num, title, desc }) => (
            <div key={num} className="border-2 border-black bg-white p-4 hover:bg-[var(--bg-alt)] transition-colors">
              <div className="text-[10px] font-bold text-[var(--text-muted)] mb-2">[{num}]</div>
              <h3 className="text-xs font-bold tracking-wide uppercase mb-1">{title}</h3>
              <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">{desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}