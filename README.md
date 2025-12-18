# AI Marketplace on Solana

A decentralized marketplace for AI models where creators can monetize their models and users can pay per inference or download, with access control enforced on-chain.

## 🌟 Features

- **Model Registration**: Upload and register AI models on-chain
- **Flexible Payments**: Pay-per-inference or pay-per-download
- **Access Control**: NFT-gated and token-based access
- **Multi-Token Support**: SOL and SPL token payments
- **Decentralized Storage**: IPFS and Arweave integration
- **Off-Chain Inference**: Fast model execution with on-chain verification
- **Revenue Splits**: Automatic distribution between creators and protocol

## 🏗️ Architecture

```
Frontend (Next.js) ↔️ Backend API (Node.js) ↔️ Solana Smart Contract (Anchor)
                    ↕️
              IPFS/Arweave Storage
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Rust & Cargo
- Solana CLI
- Anchor Framework

### Installation

```bash
# Install dependencies
npm install

# Build smart contract
anchor build

# Run tests
anchor test

# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev
```

## 📚 Documentation

- [Full Deployment Guide](./DEPLOYMENT.md)
- [API Documentation](./backend/README.md)
- [Smart Contract Spec](./programs/ai-marketplace/README.md)

## 🧪 Testing

All smart contract tests passed successfully! ✅

```bash
✔ Initializes the marketplace
✔ Registers a new model
✔ Purchases access to a model
✔ Records an inference execution
✔ Records a model download
✔ Updates model status
✔ Updates model pricing
✔ Fetches all models
✔ Fetches models by creator

9 passing (4s)
```

## 🛠️ Tech Stack

**Blockchain:**
- Solana
- Anchor Framework
- SPL Token Program

**Backend:**
- Node.js + TypeScript
- Express.js
- ONNX Runtime
- IPFS & Arweave SDKs

**Frontend:**
- Next.js 14
- React 18
- Solana Wallet Adapter
- TailwindCSS

## 📋 Project Structure

```
ai-marketplace/
├── programs/ai-marketplace/    # Anchor smart contract
├── tests/                      # Integration tests
├── backend/                    # API server
│   ├── src/routes/            # API endpoints
│   ├── src/services/          # Business logic
│   └── src/middleware/        # Auth & rate limiting
├── frontend/                   # Next.js app
│   ├── src/pages/             # App pages
│   ├── src/components/        # React components
│   └── src/lib/               # Utilities
└── DEPLOYMENT.md              # Deployment guide
```

## 🔐 Security Features

- On-chain access verification
- Payment validation before execution
- Rate limiting (100 req/hour)
- File format validation
- Hash verification for model integrity
- JWT-based authentication

## 📊 Smart Contract Accounts

**Marketplace PDA**
- Authority & treasury
- Protocol fee configuration
- Total models counter

**Model PDA**
- Creator, metadata, pricing
- Storage URI, hash
- Usage statistics

**Access PDA**
- User permissions
- Access type & expiration
- Inference counter

**Usage PDA**
- Inference tracking
- Timestamp & hash
- Audit trail

## 💰 Payment Models

1. **Pay-per-Inference**: Users pay for each model execution
2. **Pay-per-Download**: One-time payment for full model access
3. **Subscriptions**: Time-bound access with multiple inferences

## 🌐 Deployment

### Devnet

```bash
solana config set --url devnet
anchor deploy
```

### Mainnet

```bash
solana config set --url mainnet-beta
anchor deploy
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines and submit PRs.

## 📜 License

MIT License

## 🔗 Links

- [Solana Docs](https://docs.solana.com/)
- [Anchor Docs](https://www.anchor-lang.com/)
- [Project Demo](#)

## ✨ Built With

- [Anchor](https://www.anchor-lang.com/)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Next.js](https://nextjs.org/)
- [ONNX Runtime](https://onnxruntime.ai/)

---

**Made with ❤️ on Solana**
