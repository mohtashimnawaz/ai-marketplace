# Deployment Guide

## Smart Contract Deployed
- **Program ID**: `8g37Z8wZR9xMaHQRP8W8FzWqAj1A8VRt2c4t6LnBqAyb`
- **Network**: Devnet
- **IDL Account**: `FL4NTtVHGk9WL4mi53uL7SYMMmDvAX37r7zJwGPBwqqG`

## Frontend Deployment (Vercel)

### Environment Variables to Set on Vercel:
```
NEXT_PUBLIC_PROGRAM_ID=8g37Z8wZR9xMaHQRP8W8FzWqAj1A8VRt2c4t6LnBqAyb
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
```

### Steps:
1. Push code to GitHub repository
2. Import project in Vercel
3. Set environment variables above
4. Deploy

### Important Files for Deployment:
- `/frontend/src/lib/idl.json` - Smart contract IDL (copied from target/idl)
- `/frontend/src/lib/types.ts` - TypeScript types (copied from target/types)
- `/frontend/src/lib/anchor.ts` - Program integration
- `/frontend/.env.production` - Production environment template

## Backend Deployment (Vercel/Railway)

### Environment Variables:
```
PORT=3001
SOLANA_RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=8g37Z8wZR9xMaHQRP8W8FzWqAj1A8VRt2c4t6LnBqAyb
ARWEAVE_WALLET_PATH=/path/to/wallet.json
IPFS_API_URL=https://ipfs.infura.io:5001
JWT_SECRET=your-production-secret-key
RATE_LIMIT_PER_HOUR=100
MODEL_STORAGE_PATH=./models
MAX_MODEL_SIZE_MB=500
```

### Steps:
1. Upload Arweave wallet securely
2. Set all environment variables
3. Deploy backend
4. Update NEXT_PUBLIC_API_URL in frontend with backend URL
5. Redeploy frontend

## Post-Deployment:
1. Test wallet connection on devnet
2. Test model upload functionality
3. Verify smart contract interactions
4. Monitor RPC rate limits

## Network Info:
- **Solana Explorer**: https://explorer.solana.com/address/8g37Z8wZR9xMaHQRP8W8FzWqAj1A8VRt2c4t6LnBqAyb?cluster=devnet
- **Devnet Faucet**: https://faucet.solana.com
