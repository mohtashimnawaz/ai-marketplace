import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider } from '@coral-xyz/anchor';

// Import routes
import modelRoutes from './routes/models';
import inferenceRoutes from './routes/inference';
import uploadRoutes from './routes/upload';
import accessRoutes from './routes/access';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Solana connection
export const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

export const PROGRAM_ID = new PublicKey(
  process.env.PROGRAM_ID || '8g37Z8wZR9xMaHQRP8W8FzWqAj1A8VRt2c4t6LnBqAyb'
);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    network: process.env.SOLANA_RPC_URL 
  });
});

// Routes
app.use('/api/models', modelRoutes);
app.use('/api/inference', inferenceRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/access', accessRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

app.listen(port, () => {
  console.log(`🚀 AI Marketplace Backend running on port ${port}`);
  console.log(`📡 Connected to Solana: ${process.env.SOLANA_RPC_URL}`);
  console.log(`🔗 Program ID: ${PROGRAM_ID.toBase58()}`);
});

export default app;
