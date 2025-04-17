import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { createErrorResponse } from '../utils/apiResponse';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  handler: (req: Request, res: Response) => {
    res.status(429).json(
      createErrorResponse('Too many requests, please try again later', 'RATE_LIMIT_EXCEEDED')
    );
  }
});

// Stricter auth endpoint limiter
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  handler: (req: Request, res: Response) => {
    res.status(429).json(
      createErrorResponse('Too many login attempts, please try again later', 'AUTH_RATE_LIMIT_EXCEEDED')
    );
  },
  skipSuccessfulRequests: true // Don't count successful logins
});