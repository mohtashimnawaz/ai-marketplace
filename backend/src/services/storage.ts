import Arweave from 'arweave';
import fs from 'fs';
import { create } from 'ipfs-http-client';
import crypto from 'crypto';
import { SignJWT } from 'jose';

// Initialize Arweave
const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
});

// Initialize IPFS client
const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
});

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

    const result = await ipfs.add(buffer);
    return `ipfs://${result.cid.toString()}`;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw error;
  }
}

export async function downloadFromIPFS(cid: string): Promise<Buffer> {
  try {
    const chunks = [];
    for await (const chunk of ipfs.cat(cid)) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
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
