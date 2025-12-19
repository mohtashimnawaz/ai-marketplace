import { Router, Request, Response } from 'express';
import { PublicKey } from '@solana/web3.js';
import { checkUserAccess } from '../services/blockchain';
import { rateLimiter } from '../middleware/auth';
import { runInference } from '../services/inference';
import crypto from 'crypto';

const router = Router();

// Run inference on a model
router.post('/:modelId', rateLimiter, async (req: Request, res: Response) => {
  try {
    const { modelId } = req.params;
    const { inputs, userPubkey } = req.body;

    if (!inputs || !userPubkey) {
      return res.status(400).json({ error: 'Missing required fields: inputs, userPubkey' });
    }

    const modelPubkey = new PublicKey(modelId);
    const user = new PublicKey(userPubkey);

    // Verify user has access to the model
    const hasAccess = await checkUserAccess(user, modelPubkey);
    if (!hasAccess) {
      return res.status(403).json({ 
        error: 'Access denied. Please purchase access first.',
        modelId,
        userPubkey
      });
    }

    // Generate inference hash
    const inferenceHash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ modelId, inputs, timestamp: Date.now() }))
      .digest('hex');

    // Load model and run inference
    const result = await runInference(modelId, inputs);

    // Note: In production, you would call record_inference on-chain here
    // This requires a transaction signed by the backend or user

    res.json({
      success: true,
      inferenceHash,
      result,
      timestamp: new Date().toISOString(),
      modelId,
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

    // In a production system, you'd fetch usage PDAs
    // For now, return empty array as usage tracking is on-chain
    
    res.json({ 
      success: true,
      history: [], 
      count: 0,
      message: 'Inference history is tracked on-chain via usage PDAs'
    });
  } catch (error) {
    console.error('Error fetching inference history:', error);
    res.status(500).json({ error: 'Failed to fetch inference history' });
  }
});

export default router;
