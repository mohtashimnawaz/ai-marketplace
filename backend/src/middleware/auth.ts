import { Request, Response, NextFunction } from 'express';
import { SignJWT, jwtVerify } from 'jose';
import { PublicKey } from '@solana/web3.js';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-me'
);

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function verifyAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Attach user info to request
    (req as any).user = payload;
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const identifier = (req as any).user?.pubkey || req.ip;
  const limit = parseInt(process.env.RATE_LIMIT_PER_HOUR || '100');
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour

  let rateLimit = rateLimitStore.get(identifier);

  if (!rateLimit || now > rateLimit.resetTime) {
    rateLimit = {
      count: 0,
      resetTime: now + windowMs,
    };
  }

  rateLimit.count += 1;
  rateLimitStore.set(identifier, rateLimit);

  if (rateLimit.count > limit) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      resetIn: Math.ceil((rateLimit.resetTime - now) / 1000),
    });
  }

  res.setHeader('X-RateLimit-Limit', limit.toString());
  res.setHeader('X-RateLimit-Remaining', (limit - rateLimit.count).toString());
  res.setHeader(
    'X-RateLimit-Reset',
    Math.ceil(rateLimit.resetTime / 1000).toString()
  );

  next();
}

export async function generateToken(pubkey: string): Promise<string> {
  const token = await new SignJWT({ pubkey })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  return token;
}
