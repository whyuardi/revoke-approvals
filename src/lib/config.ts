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

export const CHAIN_RPC: Record<number, string> = {
  1: 'https://eth.llamarpc.com',
  56: 'https://bsc.llamarpc.com',
  137: 'https://polygon.llamarpc.com',
  42161: 'https://arbitrum.llamarpc.com',
  10: 'https://optimism.llamarpc.com',
  8453: 'https://base.llamarpc.com',
};

export const wagmiConfig = createConfig({
  chains: SUPPORTED_CHAINS,
  transports: {
    [mainnet.id]: http(CHAIN_RPC[1]),
    [bsc.id]: http(CHAIN_RPC[56]),
    [polygon.id]: http(CHAIN_RPC[137]),
    [arbitrum.id]: http(CHAIN_RPC[42161]),
    [optimism.id]: http(CHAIN_RPC[10]),
    [base.id]: http(CHAIN_RPC[8453]),
  },
});
