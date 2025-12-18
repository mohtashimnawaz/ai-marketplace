import { Router, Request, Response } from 'express';
import { PublicKey } from '@solana/web3.js';
import { connection, PROGRAM_ID } from '../index';
import { generateDownloadUrl } from '../services/storage';

const router = Router();

// Check if user has access to a model
router.get('/check/:userPubkey/:modelId', async (req: Request, res: Response) => {
  try {
    const { userPubkey, modelId } = req.params;
    const user = new PublicKey(userPubkey);
    const model = new PublicKey(modelId);

    const [accessPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('access'), user.toBuffer(), model.toBuffer()],
      PROGRAM_ID
    );

    const accountInfo = await connection.getAccountInfo(accessPda);
    
    if (!accountInfo) {
      return res.json({ 
        hasAccess: false,
        message: 'No access record found' 
      });
    }

    // Parse access data
    // Check if active and not expired

    res.json({
      hasAccess: true,
      accessPda: accessPda.toBase58(),
      // Add parsed access details
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

    const accessRecords = accounts.map((account) => ({
      pubkey: account.pubkey.toBase58(),
      // Parse access data
    }));

    res.json({ 
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
    const [accessPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('access'), user.toBuffer(), model.toBuffer()],
      PROGRAM_ID
    );

    const accountInfo = await connection.getAccountInfo(accessPda);
    
    if (!accountInfo) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Generate time-limited signed URL
    const downloadUrl = await generateDownloadUrl(modelId, userPubkey, 3600); // 1 hour

    res.json({
      success: true,
      downloadUrl,
      expiresIn: 3600,
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
