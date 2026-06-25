// @ts-nocheck
import { createPublicClient, formatUnits, http, parseAbiItem, encodeFunctionData } from 'viem';
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

// Fast free RPCs — PublicNode
const CHAIN_CLIENTS: Record<number, PublicClient> = {
  1: createPublicClient({ chain: mainnet, transport: http('https://ethereum-rpc.publicnode.com', { timeout: 15000 }) }),
  56: createPublicClient({ chain: bsc, transport: http('https://bsc-rpc.publicnode.com', { timeout: 15000 }) }),
  137: createPublicClient({ chain: polygon, transport: http('https://polygon-bor-rpc.publicnode.com', { timeout: 15000 }) }),
  42161: createPublicClient({ chain: arbitrum, transport: http('https://arbitrum-one-rpc.publicnode.com', { timeout: 15000 }) }),
  10: createPublicClient({ chain: optimism, transport: http('https://optimism-rpc.publicnode.com', { timeout: 15000 }) }),
  8453: createPublicClient({ chain: base, transport: http('https://base-rpc.publicnode.com', { timeout: 15000 }) }),
};

// Popular ERC-20 tokens per chain (top tokens by usage)
const POPULAR_TOKENS: Record<number, { address: string; name: string; symbol: string; decimals: number }[]> = {
  1: [ // Ethereum
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', name: 'Tether USD', symbol: 'USDT', decimals: 6 },
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
    { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18 },
    { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', name: 'Wrapped Ether', symbol: 'WETH', decimals: 18 },
    { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', name: 'Wrapped BTC', symbol: 'WBTC', decimals: 8 },
    { address: '0xae78736Cd615f374D3085123A210448E74Fc6393', name: 'Rocket Pool ETH', symbol: 'rETH', decimals: 18 },
    { address: '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704', name: 'Coinbase Wrapped Staked ETH', symbol: 'cbETH', decimals: 18 },
    { address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', name: 'Wrapped Liquid Staked Ether', symbol: 'wstETH', decimals: 18 },
    { address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', name: 'Chainlink', symbol: 'LINK', decimals: 18 },
    { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', name: 'Uniswap', symbol: 'UNI', decimals: 18 },
    { address: '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2', name: 'SushiToken', symbol: 'SUSHI', decimals: 18 },
    { address: '0xD533a949740bb3306d119CC777fa900bA034cd52', name: 'Curve DAO Token', symbol: 'CRV', decimals: 18 },
    { address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', name: 'Meta', symbol: 'MKR', decimals: 18 },
    { address: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F', name: 'Synthetix Network Token', symbol: 'SNX', decimals: 18 },
    { address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e', name: 'Yearn.finance', symbol: 'YFI', decimals: 18 },
  ],
  56: [ // BSC
    { address: '0x55d398326f99059fF775485246999027B3197955', name: 'Tether USD', symbol: 'USDT', decimals: 18 },
    { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', name: 'USD Coin', symbol: 'USDC', decimals: 18 },
    { address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', name: 'Binance-Peg BSC-USD', symbol: 'BUSD', decimals: 18 },
    { address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', name: 'Wrapped BNB', symbol: 'WBNB', decimals: 18 },
    { address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', name: 'Binance Coin', symbol: 'BNB', decimals: 18 },
    { address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', name: 'Dai Token', symbol: 'DAI', decimals: 18 },
    { address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', name: 'Ether', symbol: 'ETH', decimals: 18 },
    { address: '0x708396f17127c42383E3b9014072679662F8b3b2', name: 'PancakeSwap', symbol: 'CAKE', decimals: 18 },
  ],
  137: [ // Polygon
    { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', name: 'Tether USD', symbol: 'USDT', decimals: 6 },
    { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
    { address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18 },
    { address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', name: 'Wrapped Matic', symbol: 'WMATIC', decimals: 18 },
    { address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', name: 'Ether', symbol: 'ETH', decimals: 18 },
    { address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', name: 'Wrapped BTC', symbol: 'WBTC', decimals: 8 },
    { address: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B', name: 'Aave', symbol: 'AAVE', decimals: 18 },
  ],
  42161: [ // Arbitrum
    { address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', name: 'Tether USD', symbol: 'USDT', decimals: 6 },
    { address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
    { address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18 },
    { address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', name: 'Wrapped Ether', symbol: 'WETH', decimals: 18 },
    { address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', name: 'Wrapped BTC', symbol: 'WBTC', decimals: 8 },
    { address: '0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a', name: 'GMX', symbol: 'GMX', decimals: 18 },
  ],
  10: [ // Optimism
    { address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', name: 'Tether USD', symbol: 'USDT', decimals: 6 },
    { address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
    { address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18 },
    { address: '0x4200000000000000000000000000000000000006', name: 'Wrapped Ether', symbol: 'WETH', decimals: 18 },
    { address: '0x68f180fcCe6836688e9084f035309E29Bf0A2095', name: 'Wrapped BTC', symbol: 'WBTC', decimals: 8 },
    { address: '0x4200000000000000000000000000000000000042', name: 'OP', symbol: 'OP', decimals: 18 },
  ],
  8453: [ // Base
    { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', name: 'USD Coin', symbol: 'USDC', decimals: 6 },
    { address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', name: 'Tether USD', symbol: 'USDT', decimals: 6 },
    { address: '0x4200000000000000000000000000000000000006', name: 'Wrapped Ether', symbol: 'WETH', decimals: 18 },
    { address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', name: 'Wrapped Base', symbol: 'cbETH', decimals: 18 },
    { address: '0xcBB8E1aE6b9219e1d2F93c5aE7b5a39e6c4B49d3', name: 'Brett', symbol: 'BRETT', decimals: 18 },
  ],
};

// Known spenders (DEXes, bridges, etc.)
const KNOWN_SPENDERS: Record<string, string> = {
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': 'Uniswap Universal Router',
  '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad': 'Uniswap Universal Router v2',
  '0xe592427a0aece92de3edee1f18e0157c05861564': 'Uniswap V3 Router',
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': 'Uniswap Router',
  '0x1111111254eeb25477b68fb85ed929f73a960582': '1inch Router',
  '0x1111111254fb6c44bac0eed2854e76f90643097d': '1inch AggregationRouter v5',
  '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f': 'SushiSwap Router',
  '0xba12222222228d8ba445958a75a0704d366be2da': 'Balancer Vault',
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': 'Uniswap V2 Router',
  '0xdef171fe48cf0115b1d80b88dc8eab59176fee57': '0x Exchange Proxy',
  '0x363e0e26ee31b5aab0e9a4f39601db6f2790332b': 'Bungee',
  '0xb55c5cac561d01d13d07816c18d5691f8ff577d2': 'Socket',
  '0x3e29131d1b190ad200dd64088f348c09d3d47c4d': 'Hop Protocol',
  '0x8731d54e9d02c286767d56ac03e8037c07e01e98': 'Stargate Router',
  '0x5c0bc3774bfb360e7ae86e0073b0e303d4d3af71': 'Across Bridge',
  '0x6352a56caadc4f1e25cd6c75965a3585a0d04dcb': 'MetaMask Swaps',
  '0x1111111254fb6c44bac0eed2854e76f90643097d': '1inch',
  '0x363e0e26ee31b5aab0e9a4f39601db6f2790332b': 'Bungee',
};

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

// Check a known spender address - look up in known list or return null
function getSpenderName(address: string): string | null {
  return KNOWN_SPENDERS[address.toLowerCase()] || null;
}

export async function scanApprovals(
  chainId: number,
  walletAddress: `0x${string}`,
  onProgress?: (message: string) => void
): Promise<Approval[]> {
  const client = CHAIN_CLIENTS[chainId];
  if (!client) throw new Error(`Chain ${chainId} not supported`);

  const tokens = POPULAR_TOKENS[chainId];
  if (!tokens) throw new Error(`No token list for chain ${chainId}`);

  onProgress?.(`Checking ${tokens.length} popular tokens...`);

  const currentBlock = await client.getBlock();
  const currentTimestamp = Number(currentBlock.timestamp);
  const approvals: Approval[] = [];

  // Check each known token for approvals
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    onProgress?.(`Checking ${token.symbol} (${i + 1}/${tokens.length})...`);

    try {
      // Use multicall to check allowance for common spenders
      const allowanceData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [walletAddress, '0x0000000000000000000000000000000000000000' as `0x${string}`],
      });

      // Check against known popular spenders
      for (const [spenderAddr, spenderName] of Object.entries(KNOWN_SPENDERS)) {
        try {
          const allowance = await client.readContract({
            address: token.address as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'allowance',
            args: [walletAddress, spenderAddr as `0x${string}`],
          });

          if (allowance > BigInt(0)) {
            const risk = scoreApproval(
              allowance,
              token.decimals,
              spenderAddr,
              currentTimestamp - 86400, // Assume recent (we don't have exact block)
              currentTimestamp
            );

            approvals.push({
              id: `${chainId}-${token.address}-${spenderAddr}`,
              chainId,
              tokenAddress: token.address,
              tokenName: token.name,
              tokenSymbol: token.symbol,
              tokenDecimals: token.decimals,
              tokenLogo: '',
              spenderAddress: spenderAddr,
              spenderName,
              allowance: formatUnits(allowance, token.decimals),
              allowanceRaw: allowance,
              risk,
              blockTimestamp: currentTimestamp - 86400,
              txHash: '',
            });
          }
        } catch {
          // Skip if call fails (token might not exist on this chain)
          continue;
        }
      }
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
