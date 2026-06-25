'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { type Approval } from '@/lib/scanner';
import { ERC20_ABI } from '@/lib/abi';
import { RISK_COLORS } from '@/lib/risk';
import { CHAIN_NAMES, CHAIN_COLORS } from '@/lib/config';
import { ExternalLink, Loader2, Check, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

export default function ApprovalCard({
  approval,
  onRevoke,
}: {
  approval: Approval;
  onRevoke: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const riskColors = RISK_COLORS[approval.risk.level];

  const handleRevoke = () => {
    writeContract(
      {
        address: approval.tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [approval.spenderAddress as `0x${string}`, BigInt(0)],
      },
      {
        onSuccess: () => {
          // Optimistically remove
          setTimeout(() => onRevoke(approval.id), 2000);
        },
      }
    );
  };

  const isRevoking = isPending || isConfirming;
  const isRevoked = isSuccess;

  const explorerUrls: Record<number, string> = {
    1: 'https://etherscan.io',
    56: 'https://bscscan.com',
    137: 'https://polygonscan.com',
    42161: 'https://arbiscan.io',
    10: 'https://optimistic.etherscan.io',
    8453: 'https://basescan.org',
  };

  const explorer = explorerUrls[approval.chainId] || 'https://etherscan.io';

  return (
    <div
      className={`rounded-xl border bg-white/[0.02] p-4 transition-all ${
        isRevoked ? 'border-green-500/20 opacity-50' : 'border-white/5 hover:border-white/10'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Token Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-xs font-bold text-white/60">
            {approval.tokenSymbol.slice(0, 3)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{approval.tokenSymbol}</span>
              <span
                className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${riskColors.bg} ${riskColors.text} border ${riskColors.border}`}
              >
                {approval.risk.level === 'critical' && <AlertTriangle className="h-2.5 w-2.5" />}
                {approval.risk.level.toUpperCase()}
              </span>
              <span className="text-[10px] text-white/20">
                {CHAIN_NAMES[approval.chainId]}
              </span>
            </div>
            <div className="mt-0.5 text-xs text-white/40 truncate">
              to{' '}
              <a
                href={`${explorer}/address/${approval.spenderAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono hover:text-white/60"
              >
                {approval.spenderAddress.slice(0, 6)}...{approval.spenderAddress.slice(-4)}
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Amount + Revoke */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-sm font-medium text-white">{Number(approval.allowance).toLocaleString()} {approval.tokenSymbol}</div>
            <div className="text-[10px] text-white/30">
              {Math.floor((Date.now() / 1000 - approval.blockTimestamp) / 86400)}d ago
            </div>
          </div>

          {isRevoked ? (
            <div className="flex items-center gap-1 rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400">
              <Check className="h-3 w-3" />
              Revoked
            </div>
          ) : (
            <button
              onClick={handleRevoke}
              disabled={isRevoking}
              className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
            >
              {isRevoking ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                'Revoke'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expand Details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-2 flex items-center gap-1 text-[10px] text-white/30 hover:text-white/50"
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {expanded ? 'Hide details' : 'Risk details'}
      </button>

      {expanded && (
        <div className="mt-2 space-y-1 rounded-lg bg-white/[0.02] p-3">
          {approval.risk.reasons.map((reason, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-white/50">
              <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-white/20" />
              {reason}
            </div>
          ))}
          {txHash && (
            <div className="mt-2 text-xs text-white/30">
              Tx:{' '}
              <a
                href={`${explorer}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono hover:text-white/50"
              >
                {txHash.slice(0, 10)}...{txHash.slice(-6)}
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
