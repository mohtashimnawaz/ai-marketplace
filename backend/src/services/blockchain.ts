import { Connection, PublicKey, AccountInfo } from '@solana/web3.js';
import { connection, PROGRAM_ID } from '../index';
import { BorshCoder, Idl } from '@coral-xyz/anchor';
import idl from '../../../target/idl/ai_marketplace.json';

const coder = new BorshCoder(idl as Idl);

// Account discriminators (first 8 bytes)
const DISCRIMINATORS = {
  marketplace: 'marketplace',
  model: 'model',
  access: 'access',
  usage: 'usage',
};

export interface Model {
  creator: string;
  name: string;
  description: string;
  modelHash: string;
  storageUri: string;
  modelSize: number;
  inferencePrice: number;
  downloadPrice: number;
  paymentToken: number;
  totalInferences: number;
  totalDownloads: number;
  totalRevenue: number;
  isActive: boolean;
  createdAt: number;
  modelId: number;
  bump: number;
}

export interface Access {
  user: string;
  model: string;
  accessType: number;
  purchasedAt: number;
  expiresAt: number | null;
  inferenceCount: number;
  isActive: boolean;
  bump: number;
}

export interface Marketplace {
  authority: string;
  treasury: string;
  protocolFeeBps: number;
  totalModels: number;
  bump: number;
}

// PDAs
export function getMarketplacePDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('marketplace')],
    PROGRAM_ID
  );
}

export function getModelPDA(creator: PublicKey, modelId: number): [PublicKey, number] {
  const modelIdBuffer = Buffer.alloc(8);
  modelIdBuffer.writeBigUInt64LE(BigInt(modelId));
  
  return PublicKey.findProgramAddressSync(
    [Buffer.from('model'), creator.toBuffer(), modelIdBuffer],
    PROGRAM_ID
  );
}

export function getAccessPDA(user: PublicKey, model: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('access'), user.toBuffer(), model.toBuffer()],
    PROGRAM_ID
  );
}

export function getUsagePDA(user: PublicKey, inferenceHash: string): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('usage'), user.toBuffer(), Buffer.from(inferenceHash)],
    PROGRAM_ID
  );
}

// Parse account data
export function parseModelAccount(data: Buffer): Model | null {
  try {
    const decoded = coder.accounts.decode('model', data);
    return {
      creator: decoded.creator.toBase58(),
      name: decoded.name,
      description: decoded.description,
      modelHash: decoded.modelHash,
      storageUri: decoded.storageUri,
      modelSize: decoded.modelSize.toNumber(),
      inferencePrice: decoded.inferencePrice.toNumber(),
      downloadPrice: decoded.downloadPrice.toNumber(),
      paymentToken: decoded.paymentToken,
      totalInferences: decoded.totalInferences.toNumber(),
      totalDownloads: decoded.totalDownloads.toNumber(),
      totalRevenue: decoded.totalRevenue.toNumber(),
      isActive: decoded.isActive,
      createdAt: decoded.createdAt.toNumber(),
      modelId: decoded.modelId.toNumber(),
      bump: decoded.bump,
    };
  } catch (error) {
    console.error('Error parsing model account:', error);
    return null;
  }
}

export function parseAccessAccount(data: Buffer): Access | null {
  try {
    const decoded = coder.accounts.decode('access', data);
    return {
      user: decoded.user.toBase58(),
      model: decoded.model.toBase58(),
      accessType: decoded.accessType,
      purchasedAt: decoded.purchasedAt.toNumber(),
      expiresAt: decoded.expiresAt ? decoded.expiresAt.toNumber() : null,
      inferenceCount: decoded.inferenceCount.toNumber(),
      isActive: decoded.isActive,
      bump: decoded.bump,
    };
  } catch (error) {
    console.error('Error parsing access account:', error);
    return null;
  }
}

export function parseMarketplaceAccount(data: Buffer): Marketplace | null {
  try {
    const decoded = coder.accounts.decode('marketplace', data);
    return {
      authority: decoded.authority.toBase58(),
      treasury: decoded.treasury.toBase58(),
      protocolFeeBps: decoded.protocolFeeBps.toNumber(),
      totalModels: decoded.totalModels.toNumber(),
      bump: decoded.bump,
    };
  } catch (error) {
    console.error('Error parsing marketplace account:', error);
    return null;
  }
}

// Fetch functions
export async function fetchAllModels(): Promise<Array<{ pubkey: string; data: Model }>> {
  try {
    const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: coder.accounts.accountDiscriminator('model'),
          },
        },
      ],
    });

    return accounts
      .map((account) => {
        const data = parseModelAccount(account.account.data);
        return data ? { pubkey: account.pubkey.toBase58(), data } : null;
      })
      .filter((item): item is { pubkey: string; data: Model } => item !== null);
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
}

export async function fetchModelByPubkey(pubkey: PublicKey): Promise<Model | null> {
  try {
    const accountInfo = await connection.getAccountInfo(pubkey);
    if (!accountInfo) return null;
    
    return parseModelAccount(accountInfo.data);
  } catch (error) {
    console.error('Error fetching model:', error);
    return null;
  }
}

export async function fetchModelsByCreator(creator: PublicKey): Promise<Array<{ pubkey: string; data: Model }>> {
  try {
    const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: coder.accounts.accountDiscriminator('model'),
          },
        },
        {
          memcmp: {
            offset: 8, // After discriminator
            bytes: creator.toBase58(),
          },
        },
      ],
    });

    return accounts
      .map((account) => {
        const data = parseModelAccount(account.account.data);
        return data ? { pubkey: account.pubkey.toBase58(), data } : null;
      })
      .filter((item): item is { pubkey: string; data: Model } => item !== null);
  } catch (error) {
    console.error('Error fetching creator models:', error);
    return [];
  }
}

export async function fetchAccessRecord(user: PublicKey, model: PublicKey): Promise<Access | null> {
  try {
    const [accessPda] = getAccessPDA(user, model);
    const accountInfo = await connection.getAccountInfo(accessPda);
    
    if (!accountInfo) return null;
    
    return parseAccessAccount(accountInfo.data);
  } catch (error) {
    console.error('Error fetching access record:', error);
    return null;
  }
}

export async function fetchUserAccessRecords(user: PublicKey): Promise<Array<{ pubkey: string; data: Access }>> {
  try {
    const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: coder.accounts.accountDiscriminator('access'),
          },
        },
        {
          memcmp: {
            offset: 8, // After discriminator
            bytes: user.toBase58(),
          },
        },
      ],
    });

    return accounts
      .map((account) => {
        const data = parseAccessAccount(account.account.data);
        return data ? { pubkey: account.pubkey.toBase58(), data } : null;
      })
      .filter((item): item is { pubkey: string; data: Access } => item !== null);
  } catch (error) {
    console.error('Error fetching user access records:', error);
    return [];
  }
}

export async function checkUserAccess(user: PublicKey, model: PublicKey): Promise<boolean> {
  try {
    const access = await fetchAccessRecord(user, model);
    
    if (!access || !access.isActive) return false;
    
    // Check expiration
    if (access.expiresAt && Date.now() / 1000 > access.expiresAt) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking user access:', error);
    return false;
  }
}

export async function getMarketplaceInfo(): Promise<Marketplace | null> {
  try {
    const [marketplacePda] = getMarketplacePDA();
    const accountInfo = await connection.getAccountInfo(marketplacePda);
    
    if (!accountInfo) return null;
    
    return parseMarketplaceAccount(accountInfo.data);
  } catch (error) {
    console.error('Error fetching marketplace:', error);
    return null;
  }
}
