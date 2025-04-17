import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET!;

// Remove or comment out the following block to prevent duplicate declarations
// declare global {
//   namespace Express {
//     interface Request {
//       user?: { id: string };
//     }
//   }
// }

// export const refreshTokenRotation = async (oldToken: string) => {
//   const decoded = verifyRefreshToken(oldToken);
//   await redisClient.get(decoded.jti); // Check revocation
//   if (!valid) throw new Error('REVOKED_TOKEN');
//   const { accessToken, refreshToken } = generateTokens(decoded.sub);
//   await redisClient.setEx(decoded.jti, 'REVOKED', REFRESH_TOKEN_TTL);
//   return { accessToken, refreshToken };
//   };

// Token generation middleware
export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ sub: userId }, JWT_SECRET, { 
    expiresIn: '15m' 
  });
  
  const refreshToken = jwt.sign({ sub: userId }, JWT_SECRET, { 
    expiresIn: '7d' 
  });

  return { accessToken, refreshToken };
};

/**
 * Authentication Middleware
 * Purpose: Verify access tokens on protected routes
 * Key Features:
 * - Extracts JWT from cookies
 * - Validates token signature
 * - Attaches user context to requests
 * Used By: All protected API routes
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    req.user = { id: decoded.sub! };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}; 