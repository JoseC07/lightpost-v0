import { doubleCsrf } from 'csrf-csrf';
import { RequestHandler } from 'express';

const { generateToken, validateRequest, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET!,
  cookieName: 'csrf',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    httpOnly: true
  }
});

/**
 * CSRF Protection
 * Implements: Double submit cookie pattern
 * Flow:
 * 1. Generate token on page load
 * 2. Validate on POST/PUT/DELETE
 * 3. Reject mismatched tokens
 */
export const csrfMiddleware: RequestHandler = (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return doubleCsrfProtection(req, res, next);
  }
  next();
}; 