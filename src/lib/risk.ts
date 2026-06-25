// Risk scoring for approvals
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export interface RiskScore {
  level: RiskLevel;
  score: number; // 0-100
  reasons: string[];
}

// Known high-risk spender categories
const HIGH_RISK_SPENDERS = new Set([
  // Unknown / suspicious contracts
  '0x0000000000000000000000000000000000000000',
]);

// Known legitimate DEX routers (lower risk)
const KNOWN_SPENDERS: Record<string, { name: string; risk: 'low' | 'medium' }> = {
  // Uniswap V2
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': { name: 'Uniswap V2 Router', risk: 'low' },
  // Uniswap V3
  '0xe592427a0aece92de3edee1f18e0157c05861564': { name: 'Uniswap V3 Router', risk: 'low' },
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': { name: 'Uniswap Universal Router', risk: 'low' },
  // 1inch
  '0x1111111254eeb25477b68fb85ed929f73a960582': { name: '1inch Router', risk: 'low' },
  // ParaSwap / 0x (same proxy address)
  '0xdef1c0ded9bec7f1a1670819833240f027b25eff': { name: 'ParaSwap / 0x Proxy', risk: 'low' },
  // OpenSea
  '0x7be8076f4ea4a4ad08044c2a73a4841562ba1429': { name: 'OpenSea (v1)', risk: 'medium' },
  '0x00000000006c3852cbEf3e08E8dF289169EdE581': { name: 'OpenSea (v2)', risk: 'medium' },
  // Aave V3
  '0x2f39d218133afab8f2b819b1066c7e434ad94e9e': { name: 'Aave V3 Pool', risk: 'medium' },
  // WETH
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': { name: 'WETH Contract', risk: 'low' },
};

export function getSpenderInfo(address: string): { name: string; risk: 'low' | 'medium' } | null {
  return KNOWN_SPENDERS[address.toLowerCase()] || null;
}

export function scoreApproval(
  allowance: bigint,
  tokenDecimals: number,
  spenderAddress: string,
  approvalBlockTimestamp: number,
  currentBlockTimestamp: number
): RiskScore {
  const reasons: string[] = [];
  let score = 0;

  // 1. Unlimited approval check
  const maxUint256 = (1n << 256n) - 1n;
  const isUnlimited = allowance >= maxUint256 / 2n;
  if (isUnlimited) {
    score += 50;
    reasons.push('Unlimited approval — can drain entire balance');
  } else if (allowance > 0n) {
    score += 20;
    reasons.push('Limited approval — amount still accessible');
  }

  // 2. Spender reputation
  const spenderInfo = getSpenderInfo(spenderAddress);
  if (!spenderInfo) {
    score += 30;
    reasons.push('Unknown spender — no verified contract');
  } else if (spenderInfo.risk === 'medium') {
    score += 10;
    reasons.push(`Known spender (${spenderInfo.name}) — medium risk category`);
  }

  // 3. Age of approval
  const ageDays = (currentBlockTimestamp - approvalBlockTimestamp) / 86400;
  if (ageDays > 365) {
    score += 15;
    reasons.push(`Approval is ${Math.floor(ageDays)} days old — likely unused`);
  } else if (ageDays > 30) {
    score += 5;
    reasons.push(`Approval is ${Math.floor(ageDays)} days old`);
  }

  // Determine level
  let level: RiskLevel;
  if (score >= 70) level = 'critical';
  else if (score >= 40) level = 'high';
  else if (score >= 20) level = 'medium';
  else level = 'low';

  return { level, score: Math.min(score, 100), reasons };
}

export const RISK_COLORS: Record<RiskLevel, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  low: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
};
