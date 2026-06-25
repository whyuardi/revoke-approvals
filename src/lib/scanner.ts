// @ts-nocheck
import { createPublicClient, formatUnits, http, parseAbiItem } from 'viem';
import { mainnet, bsc, polygon, arbitrum, optimism, base } from 'viem/chains';
import { ERC20_ABI, APPROVAL_TOPIC } from './abi';
import { scoreApproval, type RiskScore } from './risk';

export interface Approval {
  id: string;
  chainId: number;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenLogo: string;
  spenderAddress: string;
  spenderName: string | null;
  allowance: string;
  allowanceRaw: bigint;
  risk: RiskScore;
  blockTimestamp: number;
  txHash: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// Fast free RPCs — PublicNode
const CHAIN_CLIENTS: Record<number, PublicClient> = {
  1: createPublicClient({ chain: mainnet, transport: http('https://ethereum-rpc.publicnode.com', { timeout: 15000 }) }),
  56: createPublicClient({ chain: bsc, transport: http('https://bsc-rpc.publicnode.com', { timeout: 15000 }) }),
  137: createPublicClient({ chain: polygon, transport: http('https://polygon-bor-rpc.publicnode.com', { timeout: 15000 }) }),
  42161: createPublicClient({ chain: arbitrum, transport: http('https://arbitrum-one-rpc.publicnode.com', { timeout: 15000 }) }),
  10: createPublicClient({ chain: optimism, transport: http('https://optimism-rpc.publicnode.com', { timeout: 15000 }) }),
  8453: createPublicClient({ chain: base, transport: http('https://base-rpc.publicnode.com', { timeout: 15000 }) }),
};

const APPROVAL_EVENT = parseAbiItem(
  'event Approval(address indexed owner, address indexed spender, uint256 value)'
);

async function getTokenInfo(
  client: PublicClient,
  tokenAddress: string
): Promise<{ name: string; symbol: string; decimals: number } | null> {
  try {
    const [name, symbol, decimals] = await Promise.all([
      client.readContract({ address: tokenAddress as `0x${string}`, abi: ERC20_ABI, functionName: 'name' }),
      client.readContract({ address: tokenAddress as `0x${string}`, abi: ERC20_ABI, functionName: 'symbol' }),
      client.readContract({ address: tokenAddress as `0x${string}`, abi: ERC20_ABI, functionName: 'decimals' }),
    ]);
    return { name, symbol, decimals };
  } catch {
    return null;
  }
}

export async function scanApprovals(
  chainId: number,
  walletAddress: `0x${string}`,
  onProgress?: (message: string) => void
): Promise<Approval[]> {
  const client = CHAIN_CLIENTS[chainId];
  if (!client) throw new Error(`Chain ${chainId} not supported`);

  onProgress?.('Fetching latest block...');

  const latestBlock = await client.getBlockNumber();
  // 200K blocks (~3 days on ETH, ~1 day on L2s) — works on free public RPCs (no archive needed)
  const SCAN_RANGE = 200_000n;
  const fromBlock = latestBlock > SCAN_RANGE ? latestBlock - SCAN_RANGE : BigInt(0);

  onProgress?.(`Scanning last ${SCAN_RANGE} blocks (${fromBlock} → ${latestBlock})...`);

  // Fetch Approval events for this wallet
  const approvalLogs = await client.getLogs({
    address: undefined,
    event: APPROVAL_EVENT,
    args: { owner: walletAddress },
    fromBlock,
    toBlock: latestBlock,
  });

  onProgress?.(`Found ${approvalLogs.length} raw approvals, checking active ones...`);

  // Group by token+spender and keep only latest
  const approvalMap = new Map<string, (typeof approvalLogs)[0]>();
  for (const log of approvalLogs) {
    const tokenKey = log.address.toLowerCase();
    const spenderKey = (log.args.spender as string).toLowerCase();
    const mapKey = `${tokenKey}-${spenderKey}`;
    
    const existing = approvalMap.get(mapKey);
    if (!existing || (log.blockNumber && log.blockNumber > (existing.blockNumber || BigInt(0)))) {
      approvalMap.set(mapKey, log);
    }
  }

  onProgress?.(`Checking ${approvalMap.size} unique token-spender pairs...`);

  const currentBlock = await client.getBlock();
  const currentTimestamp = Number(currentBlock.timestamp);
  const approvals: Approval[] = [];

  for (const [mapKey, log] of approvalMap) {
    const tokenAddress = log.address;
    const spenderAddress = log.args.spender as string;

    try {
      // Check current allowance
      const allowance = await client.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [walletAddress, spenderAddress],
      });

      // Skip zero allowances
      if (allowance === BigInt(0)) continue;

      // Get token info
      const tokenInfo = await getTokenInfo(client, tokenAddress);
      if (!tokenInfo) continue;

      const approvalBlock = log.blockNumber ? await client.getBlock({ blockNumber: log.blockNumber }) : currentBlock;
      const risk = scoreApproval(
        allowance,
        tokenInfo.decimals,
        spenderAddress,
        Number(approvalBlock.timestamp),
        currentTimestamp
      );

      approvals.push({
        id: `${chainId}-${tokenAddress}-${spenderAddress}`,
        chainId,
        tokenAddress,
        tokenName: tokenInfo.name,
        tokenSymbol: tokenInfo.symbol,
        tokenDecimals: tokenInfo.decimals,
        tokenLogo: '',
        spenderAddress,
        spenderName: null,
        allowance: formatUnits(allowance, tokenInfo.decimals),
        allowanceRaw: allowance,
        risk,
        blockTimestamp: Number(approvalBlock.timestamp),
        txHash: log.transactionHash || '',
      });
    } catch {
      continue;
    }
  }

  // Sort by risk score descending
  approvals.sort((a, b) => b.risk.score - a.risk.score);

  onProgress?.(`Found ${approvals.length} active approvals`);

  return approvals;
}

export function getChainClient(chainId: number) {
  return CHAIN_CLIENTS[chainId];
}
