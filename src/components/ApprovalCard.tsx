'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { type Approval } from '@/lib/scanner';
import { ERC20_ABI } from '@/lib/abi';
import { RISK_COLORS } from '@/lib/risk';
import { CHAIN_NAMES, CHAIN_COLORS } from '@/lib/config';

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

  const riskBg: Record<string, string> = {
    critical: 'bg-[var(--danger-bg)] border-[var(--danger)] text-[var(--danger)]',
    high: 'bg-[var(--warning-bg)] border-[var(--warning)] text-[var(--warning)]',
    medium: 'bg-[var(--info-bg)] border-[var(--info)] text-[var(--info)]',
    low: 'bg-[var(--success-bg)] border-[var(--success)] text-[var(--success)]',
  };

  return (
    <div
      className={`border-2 border-black bg-white p-4 transition-all ${
        isRevoked ? 'border-[var(--success)] opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Token Info */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Token avatar — monogram box */}
          <div className="h-10 w-10 shrink-0 border-2 border-black bg-[var(--bg)] flex items-center justify-center text-[10px] font-bold">
            {approval.tokenSymbol.slice(0, 3)}
          </div>
          
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold uppercase">{approval.tokenSymbol}</span>
              <span className={`inline-flex items-center border px-1.5 py-0.5 text-[9px] font-bold tracking-wide uppercase ${riskBg[approval.risk.level] || ''}`}>
                {approval.risk.level === 'critical' && '! '}
                {approval.risk.level.toUpperCase()}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-bold tracking-wide">
                {CHAIN_NAMES[approval.chainId]}
              </span>
            </div>
            <div className="mt-0.5 text-[11px] text-[var(--text-muted)] font-mono truncate">
              →{' '}
              <a
                href={`${explorer}/address/${approval.spenderAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black border-b border-transparent hover:border-black"
              >
                {approval.spenderAddress.slice(0, 6)}...{approval.spenderAddress.slice(-4)}
              </a>
            </div>
          </div>
        </div>

        {/* Amount + Revoke */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-sm font-bold font-mono">{Number(approval.allowance).toLocaleString()}</div>
            <div className="text-[10px] text-[var(--text-muted)] font-mono">
              {Math.floor((Date.now() / 1000 - approval.blockTimestamp) / 86400)}d ago
            </div>
          </div>

          {isRevoked ? (
            <div className="border-2 border-[var(--success)] bg-[var(--success-bg)] px-3 py-1.5 text-[10px] font-bold tracking-wide uppercase text-[var(--success)]">
              ✓ REVOKED
            </div>
          ) : (
            <button
              onClick={handleRevoke}
              disabled={isRevoking}
              className="border-2 border-[var(--danger)] bg-white px-3 py-1.5 text-[10px] font-bold tracking-wide uppercase text-[var(--danger)] transition-all hover:bg-[var(--danger)] hover:text-white disabled:opacity-30"
            >
              {isRevoking ? (
                <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent animate-spin" />
              ) : (
                'REVOKE'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expand Details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-2 text-[10px] font-bold tracking-wide uppercase text-[var(--text-muted)] hover:text-black border-b border-dashed border-[var(--text-muted)] hover:border-black transition-colors"
      >
        {expanded ? '▲ HIDE DETAILS' : '▼ RISK DETAILS'}
      </button>

      {expanded && (
        <div className="mt-3 space-y-1.5 border-l-2 border-black pl-3">
          {approval.risk.reasons.map((reason, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-[var(--text-muted)]">
              <span className="mt-1.5 h-1 w-1 shrink-0 bg-black" />
              {reason}
            </div>
          ))}
          {txHash && (
            <div className="mt-2 text-[10px] text-[var(--text-muted)] font-mono">
              TX:{' '}
              <a
                href={`${explorer}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black border-b border-dashed border-[var(--text-muted)] hover:border-black"
              >
                {txHash.slice(0, 10)}...{txHash.slice(-6)}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}