import Arweave from 'arweave';
import fs from 'fs';
// import { create } from 'ipfs-http-client';
import crypto from 'crypto';
import { SignJWT } from 'jose';
import axios from 'axios';

// Initialize Arweave
const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
});

// IPFS client using Infura HTTP API directly
const IPFS_API_URL = process.env.IPFS_API_URL || 'https://ipfs.infura.io:5001';

export async function uploadToArweave(filePath: string): Promise<string> {
  try {
    // Load Arweave wallet
    const walletPath = process.env.ARWEAVE_WALLET_PATH;
    if (!walletPath || !fs.existsSync(walletPath)) {
      throw new Error('Arweave wallet not configured');
    }

    const wallet = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
    const data = fs.readFileSync(filePath);

    // Create transaction
    const transaction = await arweave.createTransaction({ data }, wallet);
    
    // Add tags
    transaction.addTag('Content-Type', 'application/octet-stream');
    transaction.addTag('App-Name', 'AI-Marketplace');
    transaction.addTag('App-Version', '1.0');

    // Sign and submit
    await arweave.transactions.sign(transaction, wallet);
    await arweave.transactions.post(transaction);

    const txId = transaction.id;
    return `https://arweave.net/${txId}`;
  } catch (error) {
    console.error('Arweave upload error:', error);
    throw error;
  }
}

export async function uploadToIPFS(input: string | Buffer): Promise<string> {
  try {
    let buffer: Buffer;

    if (typeof input === 'string') {
      buffer = fs.readFileSync(input);
    } else {
      buffer = input;
    }

    // Use Infura HTTP API directly or local IPFS
    // For now, store locally and return a mock CID
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const mockCid = `Qm${hash.substring(0, 44)}`; // Create a mock IPFS CID
    
    console.log('Note: Using mock IPFS CID. Configure real IPFS for production.');
    return `ipfs://${mockCid}`;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw error;
  }
}

export async function downloadFromIPFS(cid: string): Promise<Buffer> {
  try {
    // For production, use a proper IPFS gateway
    const gateway = 'https://ipfs.io/ipfs/';
    const response = await axios.get(`${gateway}${cid}`, {
      responseType: 'arraybuffer',
    });
    return Buffer.from(response.data);
  } catch (error) {
    console.error('IPFS download error:', error);
    throw error;
  }
}

export async function generateDownloadUrl(
  modelId: string,
  userPubkey: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    // Generate signed token for download
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
    
    const token = await new SignJWT({ modelId, userPubkey })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${expiresIn}s`)
      .sign(secret);

    // Return signed URL
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    return `${baseUrl}/api/download/${modelId}?token=${token}`;
  } catch (error) {
    console.error('Download URL generation error:', error);
    throw error;
  }
}

export function calculateFileHash(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}
