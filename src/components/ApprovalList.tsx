'use client';

import { useState } from 'react';
import { type Approval } from '@/lib/scanner';
import ApprovalCard from './ApprovalCard';

type FilterLevel = 'all' | 'critical' | 'high' | 'medium' | 'low';

export default function ApprovalList({
  approvals,
  onRevoke,
}: {
  approvals: Approval[];
  onRevoke: (id: string) => void;
}) {
  const [filter, setFilter] = useState<FilterLevel>('all');
  const [sortBy, setSortBy] = useState<'risk' | 'amount'>('risk');

  const filtered = approvals.filter(
    (a) => filter === 'all' || a.risk.level === filter
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'risk') return b.risk.score - a.risk.score;
    return Number(b.allowanceRaw > a.allowanceRaw) - Number(a.allowanceRaw > b.allowanceRaw);
  });

  const counts = {
    all: approvals.length,
    critical: approvals.filter((a) => a.risk.level === 'critical').length,
    high: approvals.filter((a) => a.risk.level === 'high').length,
    medium: approvals.filter((a) => a.risk.level === 'medium').length,
    low: approvals.filter((a) => a.risk.level === 'low').length,
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'critical', 'high', 'medium', 'low'] as FilterLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`flex items-center gap-1 border px-3 py-1.5 text-[10px] font-bold tracking-wide uppercase transition-all ${
                filter === level
                  ? 'border-black bg-black text-white'
                  : 'border-[var(--border-light)] bg-white text-[var(--text-muted)] hover:border-black hover:bg-[var(--bg-alt)]'
              }`}
            >
              {level === 'critical' && <span className="text-[var(--danger)]">!</span>}
              {level === 'high' && <span className="text-[var(--warning)]">!</span>}
              {level === 'medium' && <span>—</span>}
              {level === 'low' && <span>✓</span>}
              {level === 'all' ? 'ALL' : level.toUpperCase()}
              <span className="opacity-50">({counts[level]})</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setSortBy(sortBy === 'risk' ? 'amount' : 'risk')}
          className="border border-[var(--border-light)] bg-white px-3 py-1.5 text-[10px] font-bold tracking-wide uppercase text-[var(--text-muted)] hover:border-black hover:bg-[var(--bg-alt)] transition-colors"
        >
          ↕ {sortBy === 'risk' ? 'BY RISK' : 'BY AMOUNT'}
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {sorted.length === 0 ? (
          <div className="border-2 border-black bg-white p-8 text-center">
            <div className="text-2xl mb-2">✓</div>
            <p className="text-sm font-bold uppercase tracking-wide">
              {approvals.length === 0 ? 'NO APPROVALS FOUND' : 'NO MATCHES FOR THIS FILTER'}
            </p>
          </div>
        ) : (
          sorted.map((approval) => (
            <ApprovalCard key={approval.id} approval={approval} onRevoke={onRevoke} />
          ))
        )}
      </div>
    </div>
  );
}