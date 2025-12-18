import { Router, Request, Response } from 'express';
import { PublicKey } from '@solana/web3.js';
import { connection, PROGRAM_ID } from '../index';
import { verifyAccess, rateLimiter } from '../middleware/auth';
import { runInference } from '../services/inference';
import crypto from 'crypto';

const router = Router();

// Run inference on a model
router.post('/:modelId', verifyAccess, rateLimiter, async (req: Request, res: Response) => {
  try {
    const { modelId } = req.params;
    const { inputs, userPubkey } = req.body;

    if (!inputs || !userPubkey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const modelPubkey = new PublicKey(modelId);
    const user = new PublicKey(userPubkey);

    // Verify user has access to the model
    const hasAccess = await verifyUserAccess(user, modelPubkey);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied. Please purchase access first.' });
    }

    // Load model and run inference
    const result = await runInference(modelId, inputs);

    // Generate inference hash
    const inferenceHash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ modelId, inputs, timestamp: Date.now() }))
      .digest('hex');

    // Note: In production, you would call record_inference on-chain here
    // This requires a transaction signed by the backend or user

    res.json({
      success: true,
      inferenceHash,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error running inference:', error);
    res.status(500).json({ 
      error: 'Inference failed',
      message: error.message 
    });
  }
});

// Get inference history for a user
router.get('/history/:userPubkey', async (req: Request, res: Response) => {
  try {
    const { userPubkey } = req.params;
    const user = new PublicKey(userPubkey);

    // Fetch usage PDAs for this user
    const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 8, // After discriminator
            bytes: user.toBase58(),
          },
        },
      ],
    });

    const history = accounts.map((account) => ({
      pubkey: account.pubkey.toBase58(),
      // Parse usage data
    }));

    res.json({ history, count: history.length });
  } catch (error) {
    console.error('Error fetching inference history:', error);
    res.status(500).json({ error: 'Failed to fetch inference history' });
  }
});

// Helper function to verify user access
async function verifyUserAccess(
  user: PublicKey,
  model: PublicKey
): Promise<boolean> {
  try {
    const [accessPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('access'), user.toBuffer(), model.toBuffer()],
      PROGRAM_ID
    );

    const accountInfo = await connection.getAccountInfo(accessPda);
    
    if (!accountInfo) {
      return false;
    }

    // Parse access account and check if active and not expired
    // This is a simplified check
    return true;
  } catch (error) {
    console.error('Error verifying access:', error);
    return false;
  }
}

export default router;
