'use client';

import { useState } from 'react';
import { type Approval } from '@/lib/scanner';
import ApprovalCard from './ApprovalCard';
import { Filter, CheckCircle2, AlertTriangle, Shield, ArrowUpDown } from 'lucide-react';

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'critical', 'high', 'medium', 'low'] as FilterLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filter === level
                  ? 'bg-white/10 text-white'
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
              }`}
            >
              {level === 'critical' && <AlertTriangle className="h-3 w-3" />}
              {level === 'high' && <AlertTriangle className="h-3 w-3" />}
              {level === 'medium' && <Shield className="h-3 w-3" />}
              {level === 'low' && <CheckCircle2 className="h-3 w-3" />}
              {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
              <span className="text-white/30">({counts[level]})</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setSortBy(sortBy === 'risk' ? 'amount' : 'risk')}
          className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/40 hover:bg-white/10 hover:text-white/60 transition-colors"
        >
          <ArrowUpDown className="h-3 w-3" />
          {sortBy === 'risk' ? 'By Risk' : 'By Amount'}
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {sorted.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-green-400" />
            <p className="text-sm text-white/60">
              {approvals.length === 0 ? 'No approvals found' : 'No approvals match this filter'}
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
