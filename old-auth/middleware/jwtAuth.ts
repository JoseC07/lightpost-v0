import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createErrorResponse } from '@/utils/apiResponse';
import { logAuthEvent, AuthLogLevel } from '@/utils/authLogger';
import rateLimit from 'express-rate-limit';

// Define interface for our JWT payload
interface JWTPayload {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Extend Express Request type to include our user property
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// Get JWT secret from environment variables with fallback (for development only)
const ACCESS_SECRET = process.env.ACCESS_SECRET || 'your-secret-key';

// Apply rate limiting to all authenticated routes
export const authRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

/**
 * Middleware to validate JWT tokens from HTTP-only cookies
 * Extracts token, verifies it, and attaches decoded user info to request
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;

  if (!token) {
    logAuthEvent(AuthLogLevel.WARN, 'Missing access token', req);
    return res.status(401).json(
      createErrorResponse('No access token provided', 'AUTH_NO_TOKEN')
    );
  }

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as JWTPayload;
    req.user = decoded;
    
    // Log successful authentication
    logAuthEvent(AuthLogLevel.INFO, 'Successfully authenticated', req, {
      userId: decoded.id
    });
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logAuthEvent(AuthLogLevel.WARN, 'Token expired', req);
      return res.status(401).json(
        createErrorResponse('Token has expired', 'AUTH_TOKEN_EXPIRED')
      );
    }
    
    logAuthEvent(AuthLogLevel.ERROR, 'Invalid token', req, { error });
    return res.status(401).json(
      createErrorResponse('Invalid access token', 'AUTH_INVALID_TOKEN')
    );
  }
}; 