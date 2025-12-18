import { Router, Request, Response } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { uploadToArweave, uploadToIPFS } from '../services/storage';

const router = Router();

// Configure multer for model uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.MODEL_STORAGE_PATH || './models';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: (parseInt(process.env.MAX_MODEL_SIZE_MB || '500')) * 1024 * 1024, // 500MB default
  },
  fileFilter: (req, file, cb) => {
    // Accept common ML model formats
    const allowedExtensions = ['.onnx', '.pkl', '.pt', '.pth', '.h5', '.pb', '.tflite'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`));
    }
  },
});

// Upload model file
router.post('/model', upload.single('model'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { creatorPubkey, storageType = 'ipfs' } = req.body;

    if (!creatorPubkey) {
      return res.status(400).json({ error: 'Creator pubkey is required' });
    }

    // Calculate file hash
    const fileBuffer = fs.readFileSync(req.file.path);
    const modelHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Upload to decentralized storage
    let storageUri = '';
    
    if (storageType === 'arweave') {
      storageUri = await uploadToArweave(req.file.path);
    } else {
      storageUri = await uploadToIPFS(req.file.path);
    }

    // Clean up local file (optional, keep for caching)
    // fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      modelHash,
      storageUri,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      localPath: req.file.path,
    });
  } catch (error: any) {
    console.error('Error uploading model:', error);
    res.status(500).json({ 
      error: 'Upload failed',
      message: error.message 
    });
  }
});

// Upload model metadata
router.post('/metadata', async (req: Request, res: Response) => {
  try {
    const { name, description, tags, framework, inputShape, outputShape } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    const metadata = {
      name,
      description,
      tags: tags || [],
      framework,
      inputShape,
      outputShape,
      createdAt: new Date().toISOString(),
    };

    // Upload metadata to IPFS/Arweave
    const metadataUri = await uploadToIPFS(
      Buffer.from(JSON.stringify(metadata, null, 2))
    );

    res.json({
      success: true,
      metadataUri,
      metadata,
    });
  } catch (error: any) {
    console.error('Error uploading metadata:', error);
    res.status(500).json({ 
      error: 'Metadata upload failed',
      message: error.message 
    });
  }
});

export default router;
