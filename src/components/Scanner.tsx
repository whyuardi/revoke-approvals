'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { isAddress } from 'viem';
import { scanApprovals, type Approval } from '@/lib/scanner';
import { SUPPORTED_CHAINS, CHAIN_NAMES, CHAIN_COLORS } from '@/lib/config';
import ApprovalList from './ApprovalList';
import { motion } from 'framer-motion';
import { Search, Loader2, Shield, Zap, AlertTriangle, ArrowRight } from 'lucide-react';

export default function Scanner() {
  const { address: connectedAddress } = useAccount();
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
    <div className="space-y-5">
      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { label: 'Approvals Found', value: scanned ? String(approvals.length) : '—', color: 'text-white' },
          { label: 'Critical Risk', value: scanned ? String(approvals.filter(a => a.risk.level === 'critical').length) : '—', color: 'text-red-400' },
          { label: 'High Risk', value: scanned ? String(approvals.filter(a => a.risk.level === 'high').length) : '—', color: 'text-orange-400' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-3.5">
            <div className="text-[10px] uppercase tracking-widest text-white/25 mb-1">{stat.label}</div>
            <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </motion.div>

      {/* Scan Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10">
            <Search className="h-3 w-3 text-amber-400" />
          </div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">Scan Wallet</h2>
        </div>

        <div className="space-y-3">
          {/* Address Input */}
          <div className="relative">
            <input
              type="text"
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              placeholder={connectedAddress || '0x... paste wallet address'}
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 font-mono text-sm text-white placeholder:text-white/15 focus:border-amber-500/30 focus:bg-white/[0.03] focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all"
            />
            {connectedAddress && !inputAddress && (
              <p className="mt-1.5 text-[11px] text-white/20">
                Using connected wallet
              </p>
            )}
          </div>

          {/* Chain Pills */}
          <div className="flex flex-wrap gap-1.5">
            {SUPPORTED_CHAINS.map((c) => (
              <button
                key={c.id}
                onClick={() => setScanChain(c.id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all ${
                  scanChain === c.id
                    ? 'bg-white/[0.08] text-white border border-white/[0.1]'
                    : 'bg-white/[0.02] text-white/30 border border-transparent hover:bg-white/[0.04] hover:text-white/50'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CHAIN_COLORS[c.id] }} />
                {CHAIN_NAMES[c.id]}
              </button>
            ))}
          </div>

          {/* Scan Button */}
          <button
            onClick={handleScan}
            disabled={!isValidAddress || loading}
            className="group w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-black transition-all hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-black/70">{progress || 'Scanning...'}</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" />
                Scan Approvals
                <ArrowRight className="h-3.5 w-3.5 opacity-50 group-hover:translate-x-0.5 transition-transform" />
              </span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-400 flex items-center gap-2"
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Results */}
      {scanned && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ApprovalList
            approvals={approvals}
            onRevoke={(id) => setApprovals((prev) => prev.filter((a) => a.id !== id))}
          />
        </motion.div>
      )}

      {/* Feature Cards (pre-scan) */}
      {!scanned && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {[
            { icon: Zap, title: 'Fast Scanning', desc: 'Scans ~1M blocks in under 30 seconds via Approval event logs.', accent: 'amber' },
            { icon: Shield, title: 'Risk Scoring', desc: 'Unlimited approvals, unknown spenders, and old approvals flagged.', accent: 'blue' },
            { icon: AlertTriangle, title: 'One-Click Revoke', desc: 'Revoke with a single transaction. Costs gas, saves assets.', accent: 'orange' },
          ].map(({ icon: Icon, title, desc, accent }) => (
            <div key={title} className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-4 hover:bg-white/[0.025] hover:border-white/[0.06] transition-all group">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-${accent}-500/10 mb-3`}>
                <Icon className={`h-4 w-4 text-${accent}-400`} />
              </div>
              <h3 className="text-sm font-semibold text-white/80 mb-1">{title}</h3>
              <p className="text-[11px] leading-relaxed text-white/30">{desc}</p>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
