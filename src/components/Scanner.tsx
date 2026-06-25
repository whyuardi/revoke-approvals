'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { isAddress } from 'viem';
import { scanApprovals, type Approval } from '@/lib/scanner';
import { SUPPORTED_CHAINS, CHAIN_NAMES, CHAIN_COLORS } from '@/lib/config';
import ApprovalList from './ApprovalList';
import { Search, Loader2, Shield, Zap, AlertTriangle } from 'lucide-react';

export default function Scanner() {
  const { address: connectedAddress, chain } = useAccount();
  const [inputAddress, setInputAddress] = useState('');
  const [scanChain, setScanChain] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState('');

  const targetAddress = inputAddress || connectedAddress;
  const isValidAddress = targetAddress && isAddress(targetAddress);

  const handleScan = async () => {
    if (!isValidAddress) return;
    setLoading(true);
    setError('');
    setApprovals([]);
    setScanned(false);
    setProgress('Starting scan...');

    try {
      const results = await scanApprovals(scanChain, targetAddress as `0x${string}`, (msg) => {
        setProgress(msg);
      });
      setApprovals(results);
      setScanned(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-xs text-white/40 mb-1">Approvals Found</div>
          <div className="text-2xl font-bold text-white">{scanned ? approvals.length : '—'}</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-xs text-white/40 mb-1">Critical Risk</div>
          <div className="text-2xl font-bold text-red-400">
            {scanned ? approvals.filter((a) => a.risk.level === 'critical').length : '—'}
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-xs text-white/40 mb-1">High Risk</div>
          <div className="text-2xl font-bold text-orange-400">
            {scanned ? approvals.filter((a) => a.risk.level === 'high').length : '—'}
          </div>
        </div>
      </div>

      {/* Scan Input */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-medium text-white">Scan Wallet</h2>
        </div>

        <div className="space-y-3">
          {/* Address Input */}
          <div>
            <input
              type="text"
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
              placeholder={connectedAddress || '0x... paste wallet address'}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white placeholder:text-white/20 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
            {connectedAddress && !inputAddress && (
              <p className="mt-1.5 text-xs text-white/30">
                Using connected wallet: {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
              </p>
            )}
          </div>

          {/* Chain Selector */}
          <div className="flex flex-wrap gap-2">
            {SUPPORTED_CHAINS.map((c) => (
              <button
                key={c.id}
                onClick={() => setScanChain(c.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  scanChain === c.id
                    ? 'bg-white/10 text-white ring-1 ring-white/20'
                    : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
                }`}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: CHAIN_COLORS[c.id] }}
                />
                {CHAIN_NAMES[c.id]}
              </button>
            ))}
          </div>

          {/* Scan Button */}
          <button
            onClick={handleScan}
            disabled={!isValidAddress || loading}
            className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-black transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {progress || 'Scanning...'}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" />
                Scan Approvals
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          <AlertTriangle className="mb-1 inline h-4 w-4" /> {error}
        </div>
      )}

      {/* Results */}
      {scanned && (
        <ApprovalList
          approvals={approvals}
          onRevoke={(id) => setApprovals((prev) => prev.filter((a) => a.id !== id))}
        />
      )}

      {/* Info */}
      {!scanned && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <Zap className="h-5 w-5 text-amber-400 mb-3" />
            <h3 className="text-sm font-medium text-white mb-1">Fast Scanning</h3>
            <p className="text-xs text-white/40">
              Scans Approval events across the last ~1M blocks. Usually completes in under 30 seconds.
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <Shield className="h-5 w-5 text-amber-400 mb-3" />
            <h3 className="text-sm font-medium text-white mb-1">Risk Scoring</h3>
            <p className="text-xs text-white/40">
              Each approval is scored: unlimited amounts, unknown spenders, and old approvals get flagged.
            </p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <AlertTriangle className="h-5 w-5 text-amber-400 mb-3" />
            <h3 className="text-sm font-medium text-white mb-1">One-Click Revoke</h3>
            <p className="text-xs text-white/40">
              Revoke any approval with a single transaction. Costs gas but protects your assets.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
