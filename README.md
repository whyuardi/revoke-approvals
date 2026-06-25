# Revoke Approvals 🔐

Scan and revoke dangerous ERC-20 token approvals across 6 EVM chains. Protect your wallet from scam and phishing attacks.

**Live Demo:** [revoke-approvals.vercel.app](https://revoke-approvals.vercel.app)

## What it does

Paste any wallet address → scan for active token approvals → see risk scores → revoke with one click.

| Feature | Description |
|---------|-------------|
| 🔍 **Approval Scanner** | Scans ~1M blocks for Approval events, shows only active (non-zero) allowances |
| ⚠️ **Risk Scoring** | Flags unlimited approvals, unknown spenders, and old/unused approvals |
| 🔴 **One-Click Revoke** | Sends `approve(spender, 0)` to nullify the approval |
| 🌐 **6 Chains** | Ethereum, BSC, Polygon, Arbitrum, Optimism, Base |
| 📊 **Stats Dashboard** | Total approvals, critical risk count, high risk count |

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | Tailwind CSS v4 |
| Wallet | wagmi + viem |
| Animation | Framer Motion |
| Icons | Lucide React |
| Font | Geist |

## Getting Started

```bash
git clone https://github.com/whyuardi/revoke-approvals.git
cd revoke-approvals
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How Risk Scoring Works

| Factor | Score Impact |
|--------|-------------|
| Unlimited approval (max uint256) | +50 |
| Unknown spender contract | +30 |
| Approval older than 365 days | +15 |
| Approval older than 30 days | +5 |
| Known legitimate spender | -10 |

**Risk Levels:** Critical (70+) → High (40+) → Medium (20+) → Low (0-19)

## Supported Chains

| Chain | RPC |
|-------|-----|
| Ethereum | eth.llamarpc.com |
| BSC | bsc.llamarpc.com |
| Polygon | polygon.llamarpc.com |
| Arbitrum | arbitrum.llamarpc.com |
| Optimism | optimism.llamarpc.com |
| Base | base.llamarpc.com |

## License

MIT © 2026 [Ardhiansyah Wahyu Setyadi](https://github.com/whyuardi)
