/**
 * Auth Utilities
 * Purpose: Token generation/validation primitives
 * Key Features:
 * - JWT token creation
 * - Refresh token verification  
 * - Cryptographic operations
 * Used By: Middleware, Auth Routes, Services
 */
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export const generateTokens = (userId: string) => ({
  accessToken: jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '15m' }),
  refreshToken: jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' })
});

export const verifyRefreshToken = (token: string) => 
  jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

export const refreshTokenRotation = async (oldRefreshToken: string) => {
  // Verify token against Redis store
  // Issue new token pair
  // Implement automatic revocation
}; 