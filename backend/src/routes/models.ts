import { Router, Request, Response } from 'express';
import { PublicKey } from '@solana/web3.js';
import { connection, PROGRAM_ID } from '../index';
import { verifyAccess } from '../middleware/auth';

const router = Router();

// Get all models
router.get('/', async (req: Request, res: Response) => {
  try {
    const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
      filters: [
        {
          dataSize: 1024, // Adjust based on Model account size
        },
      ],
    });

    const models = accounts.map((account) => ({
      pubkey: account.pubkey.toBase58(),
      // Parse account data here based on your Model structure
      data: account.account,
    }));

    res.json({ models, count: models.length });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

// Get model by ID
router.get('/:modelId', async (req: Request, res: Response) => {
  try {
    const { modelId } = req.params;
    const modelPubkey = new PublicKey(modelId);

    const accountInfo = await connection.getAccountInfo(modelPubkey);
    
    if (!accountInfo) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // Parse model data
    // Implement proper deserialization based on your Model struct

    res.json({
      pubkey: modelId,
      data: accountInfo.data,
      owner: accountInfo.owner.toBase58(),
    });
  } catch (error) {
    console.error('Error fetching model:', error);
    res.status(500).json({ error: 'Failed to fetch model' });
  }
});

// Get models by creator
router.get('/creator/:creatorPubkey', async (req: Request, res: Response) => {
  try {
    const { creatorPubkey } = req.params;
    const creator = new PublicKey(creatorPubkey);

    const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 8, // After discriminator
            bytes: creator.toBase58(),
          },
        },
      ],
    });

    const models = accounts.map((account) => ({
      pubkey: account.pubkey.toBase58(),
      data: account.account,
    }));

    res.json({ models, count: models.length });
  } catch (error) {
    console.error('Error fetching creator models:', error);
    res.status(500).json({ error: 'Failed to fetch creator models' });
  }
});

// Get model stats
router.get('/:modelId/stats', async (req: Request, res: Response) => {
  try {
    const { modelId } = req.params;
    const modelPubkey = new PublicKey(modelId);

    const accountInfo = await connection.getAccountInfo(modelPubkey);
    
    if (!accountInfo) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // Parse and return stats
    // total_inferences, total_downloads, total_revenue

    res.json({
      totalInferences: 0, // Parse from account data
      totalDownloads: 0,
      totalRevenue: 0,
    });
  } catch (error) {
    console.error('Error fetching model stats:', error);
    res.status(500).json({ error: 'Failed to fetch model stats' });
  }
});

export default router;
