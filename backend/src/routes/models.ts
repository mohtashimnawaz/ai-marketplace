import { Router, Request, Response } from 'express';
import { PublicKey } from '@solana/web3.js';
import { 
  fetchAllModels, 
  fetchModelByPubkey, 
  fetchModelsByCreator,
  getMarketplaceInfo 
} from '../services/blockchain';

const router = Router();

// Get all models
router.get('/', async (req: Request, res: Response) => {
  try {
    const models = await fetchAllModels();
    
    res.json({ 
      models, 
      count: models.length,
      success: true 
    });
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

    const model = await fetchModelByPubkey(modelPubkey);
    
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    res.json({
      pubkey: modelId,
      data: model,
      success: true
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

    const models = await fetchModelsByCreator(creator);

    res.json({ 
      models, 
      count: models.length,
      success: true 
    });
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

    const model = await fetchModelByPubkey(modelPubkey);
    
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    res.json({
      success: true,
      stats: {
        totalInferences: model.totalInferences,
        totalDownloads: model.totalDownloads,
        totalRevenue: model.totalRevenue,
        inferencePrice: model.inferencePrice,
        downloadPrice: model.downloadPrice,
        isActive: model.isActive,
        createdAt: model.createdAt,
      }
    });
  } catch (error) {
    console.error('Error fetching model stats:', error);
    res.status(500).json({ error: 'Failed to fetch model stats' });
  }
});

// Get marketplace info
router.get('/info/marketplace', async (req: Request, res: Response) => {
  try {
    const marketplace = await getMarketplaceInfo();
    
    if (!marketplace) {
      return res.status(404).json({ error: 'Marketplace not initialized' });
    }

    res.json({
      success: true,
      marketplace
    });
  } catch (error) {
    console.error('Error fetching marketplace info:', error);
    res.status(500).json({ error: 'Failed to fetch marketplace info' });
  }
});

export default router;
