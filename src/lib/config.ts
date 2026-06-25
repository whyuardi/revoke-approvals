import { http, createConfig } from 'wagmi';
import {
  mainnet,
  bsc,
  polygon,
  arbitrum,
  optimism,
  base,
} from 'wagmi/chains';

export const SUPPORTED_CHAINS = [
  mainnet,
  bsc,
  polygon,
  arbitrum,
  optimism,
  base,
] as const;

export const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  56: 'BSC',
  137: 'Polygon',
  42161: 'Arbitrum',
  10: 'Optimism',
  8453: 'Base',
};

export const CHAIN_COLORS: Record<number, string> = {
  1: '#627EEA',
  56: '#F0B90B',
  137: '#8247E5',
  42161: '#28A0F0',
  10: '#FF0420',
  8453: '#0052FF',
};

// Fast free RPCs — PublicNode + Cloudflare fallback
export const CHAIN_RPC: Record<number, string> = {
  1: 'https://ethereum-rpc.publicnode.com',
  56: 'https://bsc-rpc.publicnode.com',
  137: 'https://polygon-bor-rpc.publicnode.com',
  42161: 'https://arbitrum-one-rpc.publicnode.com',
  10: 'https://optimism-rpc.publicnode.com',
  8453: 'https://base-rpc.publicnode.com',
};

export const wagmiConfig = createConfig({
  chains: SUPPORTED_CHAINS,
  transports: {
    [mainnet.id]: http(CHAIN_RPC[1], { timeout: 15000 }),
    [bsc.id]: http(CHAIN_RPC[56], { timeout: 15000 }),
    [polygon.id]: http(CHAIN_RPC[137], { timeout: 15000 }),
    [arbitrum.id]: http(CHAIN_RPC[42161], { timeout: 15000 }),
    [optimism.id]: http(CHAIN_RPC[10], { timeout: 15000 }),
    [base.id]: http(CHAIN_RPC[8453], { timeout: 15000 }),
  },
});
