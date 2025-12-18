# AI Marketplace - Deployment & Setup Guide

## 🚀 Complete Decentralized AI Model Marketplace on Solana

This guide provides step-by-step instructions for deploying and running the AI Marketplace platform.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Setup Instructions](#setup-instructions)
5. [Deployment Guide](#deployment-guide)
6. [Testing](#testing)
7. [API Documentation](#api-documentation)
8. [Frontend Setup](#frontend-setup)
9. [Security Considerations](#security-considerations)
10. [Scaling & Production](#scaling--production)

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Creator    │  │     User     │  │  Marketplace │     │
│  │  Dashboard   │  │  Dashboard   │  │   Browser    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│  Solana Smart  │  │    Backend     │  │   Storage      │
│    Contracts   │  │   API Server   │  │ (IPFS/Arweave) │
│   (Anchor)     │  │  (Node.js)     │  │                │
└────────────────┘  └────────────────┘  └────────────────┘
```

### Key Features

- **On-Chain**: Model registration, access control, payment settlement
- **Off-Chain**: Model storage, inference execution, file serving
- **Payment Models**: Pay-per-inference, pay-per-download, subscriptions
- **Access Control**: NFT-gated, token-based, time-bound subscriptions
- **Multi-Token Support**: SOL and SPL tokens

---

## Prerequisites

### Required Software

- **Node.js**: v18+ ([Download](https://nodejs.org/))
- **Rust**: Latest stable ([Install](https://rustup.rs/))
- **Solana CLI**: v1.17+ ([Install](https://docs.solana.com/cli/install-solana-cli-tools))
- **Anchor**: v0.32+ ([Install](https://www.anchor-lang.com/docs/installation))
- **Yarn**: Latest ([Install](https://yarnpkg.com/getting-started/install))

### Installation Commands

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Verify installations
solana --version
anchor --version
cargo --version
node --version
```

---

## Project Structure

```
ai-marketplace/
├── programs/
│   └── ai-marketplace/
│       ├── src/
│       │   └── lib.rs           # Anchor smart contract
│       └── Cargo.toml
├── tests/
│   └── ai-marketplace.ts        # Integration tests
├── backend/
│   ├── src/
│   │   ├── index.ts            # Express server
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   └── middleware/         # Auth & rate limiting
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/              # Next.js pages
│   │   ├── components/         # React components
│   │   ├── contexts/           # Wallet context
│   │   └── lib/                # Utilities & API
│   └── package.json
├── Anchor.toml                  # Anchor configuration
└── package.json                 # Root package
```

---

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Clone repository
git clone <your-repo-url>
cd ai-marketplace

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Configure Solana Wallet

```bash
# Generate a new wallet (or use existing)
solana-keygen new --outfile ~/.config/solana/id.json

# Get your public key
solana address

# Request airdrop (devnet)
solana airdrop 2

# Check balance
solana balance
```

### 3. Update Configuration Files

#### Update `Anchor.toml`

```toml
[programs.localnet]
ai_marketplace = "<YOUR_PROGRAM_ID>"

[programs.devnet]
ai_marketplace = "<YOUR_PROGRAM_ID>"
```

#### Create `backend/.env`

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
PORT=3001
SOLANA_RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=<YOUR_PROGRAM_ID>
JWT_SECRET=your-super-secret-key-change-me
ARWEAVE_WALLET_PATH=./arweave-wallet.json
IPFS_API_URL=https://ipfs.infura.io:5001
MODEL_STORAGE_PATH=./models
MAX_MODEL_SIZE_MB=500
RATE_LIMIT_PER_HOUR=100
```

#### Create `frontend/.env.local`

```bash
cp frontend/.env.local.example frontend/.env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_PROGRAM_ID=<YOUR_PROGRAM_ID>
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

---

## Deployment Guide

### Step 1: Build Smart Contract

```bash
# Build the Anchor program
anchor build

# Get the program ID
solana address -k target/deploy/ai_marketplace-keypair.json

# Update program ID in lib.rs and Anchor.toml
```

### Step 2: Deploy to Devnet

```bash
# Configure Solana CLI for devnet
solana config set --url devnet

# Airdrop SOL for deployment
solana airdrop 2

# Deploy the program
anchor deploy

# Verify deployment
solana program show <YOUR_PROGRAM_ID>
```

### Step 3: Initialize Marketplace

```bash
# Run initialization script
anchor run initialize
```

Or manually via TypeScript:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const program = anchor.workspace.AiMarketplace;

const [marketplacePDA] = anchor.web3.PublicKey.findProgramAddressSync(
  [Buffer.from("marketplace")],
  program.programId
);

await program.methods
  .initializeMarketplace(new anchor.BN(250)) // 2.5% fee
  .accounts({
    marketplace: marketplacePDA,
    treasury: provider.wallet.publicKey,
    authority: provider.wallet.publicKey,
  })
  .rpc();
```

### Step 4: Start Backend API

```bash
cd backend

# Install dependencies
npm install

# Start development server
npm run dev

# Or build and start production
npm run build
npm start
```

Backend will run on `http://localhost:3001`

### Step 5: Start Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Or build and start production
npm run build
npm start
```

Frontend will run on `http://localhost:3000`

---

## Testing

### Run Smart Contract Tests

```bash
# Run all tests with local validator
anchor test

# Run tests against devnet
anchor test --skip-local-validator

# Run specific test
anchor test --skip-build
```

### Test Coverage

The test suite includes:

1. ✅ Marketplace initialization
2. ✅ Model registration
3. ✅ Access purchase (SOL payment)
4. ✅ Inference recording
5. ✅ Download tracking
6. ✅ Model status updates
7. ✅ Pricing updates
8. ✅ Query operations

### Manual Testing Flow

1. **Creator Workflow**:
   ```bash
   # 1. Connect wallet
   # 2. Navigate to /creator
   # 3. Upload model file (.onnx)
   # 4. Set pricing
   # 5. Register on-chain
   ```

2. **User Workflow**:
   ```bash
   # 1. Connect wallet
   # 2. Browse models at /explore
   # 3. Purchase access
   # 4. Run inference or download
   ```

---

## API Documentation

### Models API

#### GET `/api/models`
Get all models
```bash
curl http://localhost:3001/api/models
```

#### GET `/api/models/:modelId`
Get specific model
```bash
curl http://localhost:3001/api/models/<MODEL_PUBKEY>
```

#### GET `/api/models/creator/:creatorPubkey`
Get models by creator
```bash
curl http://localhost:3001/api/models/creator/<CREATOR_PUBKEY>
```

### Inference API

#### POST `/api/inference/:modelId`
Run inference
```bash
curl -X POST http://localhost:3001/api/inference/<MODEL_ID> \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": {"input": [1, 2, 3, 4]},
    "userPubkey": "<USER_PUBKEY>"
  }'
```

### Upload API

#### POST `/api/upload/model`
Upload model file
```bash
curl -X POST http://localhost:3001/api/upload/model \
  -F "model=@path/to/model.onnx" \
  -F "creatorPubkey=<CREATOR_PUBKEY>" \
  -F "storageType=ipfs"
```

### Access API

#### GET `/api/access/check/:userPubkey/:modelId`
Check user access
```bash
curl http://localhost:3001/api/access/check/<USER_PUBKEY>/<MODEL_ID>
```

---

## Frontend Setup

### Wallet Adapters Supported

- Phantom
- Solflare
- Backpack
- Glow

### Key Pages

- `/` - Homepage with featured models
- `/explore` - Browse all models
- `/creator` - Upload and register models
- `/dashboard` - User dashboard
- `/my-models` - Creator's models
- `/models/[id]` - Model details

### Using the Wallet

```typescript
import { useWallet } from '@solana/wallet-adapter-react';

function MyComponent() {
  const { publicKey, connected, sendTransaction } = useWallet();
  
  // Use wallet functionality
}
```

---

## Security Considerations

### Smart Contract Security

1. **Access Control**: Only creators can modify their models
2. **Payment Verification**: Payments verified before access grant
3. **Reentrancy Protection**: Anchor's built-in protections
4. **Input Validation**: Length limits on strings, hash verification

### Backend Security

1. **Rate Limiting**: 100 requests/hour per IP
2. **JWT Authentication**: Token-based access
3. **File Validation**: Model format and size checks
4. **CORS Configuration**: Whitelist allowed origins

### Best Practices

- Never commit private keys
- Use environment variables for secrets
- Validate all inputs on-chain and off-chain
- Implement request signing for API calls
- Regular security audits

---

## Scaling & Production

### Optimization Strategies

#### 1. Model Caching
```typescript
// Cache models in memory
const modelCache = new Map();

function getModel(modelId) {
  if (!modelCache.has(modelId)) {
    modelCache.set(modelId, loadModel(modelId));
  }
  return modelCache.get(modelId);
}
```

#### 2. CDN for Static Assets
- Use Cloudflare or AWS CloudFront
- Cache IPFS content
- Serve models from edge locations

#### 3. Database Integration
- Add PostgreSQL for indexing
- Cache on-chain data
- Store analytics

#### 4. Load Balancing
- Use NGINX or AWS ALB
- Distribute inference workload
- Horizontal scaling

### Production Deployment

#### Docker Setup

```dockerfile
# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

#### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-marketplace-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ai-marketplace-backend
  template:
    metadata:
      labels:
        app: ai-marketplace-backend
    spec:
      containers:
      - name: backend
        image: ai-marketplace-backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: SOLANA_RPC_URL
          value: "https://api.mainnet-beta.solana.com"
```

### Monitoring

- **Solana RPC**: Monitor transaction success rates
- **API Performance**: Track response times
- **Error Tracking**: Use Sentry or similar
- **Analytics**: Track model usage, revenue

### Mainnet Deployment Checklist

- [ ] Audit smart contract code
- [ ] Test on devnet thoroughly
- [ ] Configure mainnet RPC (Helius, QuickNode)
- [ ] Update all environment variables
- [ ] Deploy with sufficient SOL for rent
- [ ] Monitor initial transactions
- [ ] Set up alerts and logging
- [ ] Document emergency procedures

---

## Troubleshooting

### Common Issues

**Issue**: Anchor build fails
```bash
# Solution: Update dependencies
cargo update
anchor build
```

**Issue**: Insufficient SOL for transaction
```bash
# Solution: Airdrop more SOL
solana airdrop 2
```

**Issue**: RPC rate limits
```bash
# Solution: Use dedicated RPC
# Get free RPC from:
# - Helius (https://helius.dev/)
# - QuickNode (https://quicknode.com/)
```

**Issue**: Frontend can't connect to wallet
```bash
# Solution: Check wallet adapter versions
npm update @solana/wallet-adapter-react
```

---

## Resources

- [Solana Documentation](https://docs.solana.com/)
- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [Arweave Documentation](https://docs.arweave.org/)

---

## License

MIT License - See LICENSE file for details

---

## Support

For issues and questions:
- GitHub Issues: [Your Repo Issues]
- Discord: [Your Discord]
- Twitter: [Your Twitter]

---

**Built with ❤️ on Solana**
