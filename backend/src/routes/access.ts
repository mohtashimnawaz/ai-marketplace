import { Router, Request, Response } from 'express';
import { PublicKey } from '@solana/web3.js';
import { 
  fetchAccessRecord, 
  fetchUserAccessRecords,
  checkUserAccess,
  getAccessPDA 
} from '../services/blockchain';
import { generateDownloadUrl } from '../services/storage';

const router = Router();

// Check if user has access to a model
router.get('/check/:userPubkey/:modelId', async (req: Request, res: Response) => {
  try {
    const { userPubkey, modelId } = req.params;
    const user = new PublicKey(userPubkey);
    const model = new PublicKey(modelId);

    const hasAccess = await checkUserAccess(user, model);
    const [accessPda] = getAccessPDA(user, model);
    
    if (!hasAccess) {
      return res.json({ 
        hasAccess: false,
        message: 'No active access found',
        accessPda: accessPda.toBase58()
      });
    }

    const accessData = await fetchAccessRecord(user, model);

    res.json({
      success: true,
      hasAccess: true,
      accessPda: accessPda.toBase58(),
      accessData
    });
  } catch (error) {
    console.error('Error checking access:', error);
    res.status(500).json({ error: 'Failed to check access' });
  }
});

// Get all user's access records
router.get('/user/:userPubkey', async (req: Request, res: Response) => {
  try {
    const { userPubkey } = req.params;
    const user = new PublicKey(userPubkey);

    const accessRecords = await fetchUserAccessRecords(user);

    res.json({ 
      success: true,
      accessRecords, 
      count: accessRecords.length 
    });
  } catch (error) {
    console.error('Error fetching access records:', error);
    res.status(500).json({ error: 'Failed to fetch access records' });
  }
});

// Generate signed download URL
router.post('/download/:modelId', async (req: Request, res: Response) => {
  try {
    const { modelId } = req.params;
    const { userPubkey } = req.body;

    if (!userPubkey) {
      return res.status(400).json({ error: 'User pubkey is required' });
    }

    const user = new PublicKey(userPubkey);
    const model = new PublicKey(modelId);

    // Verify access
    const hasAccess = await checkUserAccess(user, model);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied. Please purchase access first.' });
    }

    const accessData = await fetchAccessRecord(user, model);
    
    if (!accessData) {
      return res.status(403).json({ error: 'Access record not found' });
    }

    // Verify access type allows downloads
    if (accessData.accessType === 0) { // 0 = Inference only
      return res.status(403).json({ 
        error: 'This access type does not allow downloads. Please purchase download access.' 
      });
    }

    // Get model data to retrieve storage URI
    const modelData = await fetchAccessRecord(user, model); // This should actually fetch model, will fix
    
    // Generate time-limited signed URL (valid for 1 hour)
    const downloadUrl = await generateDownloadUrl(modelId, userPubkey, 3600);

    res.json({
      success: true,
      downloadUrl,
      expiresIn: 3600,
      message: 'Download URL generated successfully'
    });
  } catch (error: any) {
    console.error('Error generating download URL:', error);
    res.status(500).json({ 
      error: 'Failed to generate download URL',
      message: error.message 
    });
  }
});

export default router;
