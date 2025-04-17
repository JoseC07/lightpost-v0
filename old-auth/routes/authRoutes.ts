import express from 'express';
import { generateTokens, verifyRefreshToken } from '@/utils/auth';
import { createSuccessResponse, createErrorResponse } from '@/utils/apiResponse';
import findUserByEmail  from '@/models/User';
import bcrypt from 'bcryptjs';
import UserModel from '@/models/User';
import { authLimiter } from '@/middleware/rateLimiter';

const router = express.Router();

/**
 * Authentication Routes
 * Purpose: Handle login/logout/token refresh
 * Endpoints:
 * - POST /login
 * - POST /refresh
 * - POST /logout
 * Dependencies: User model, bcrypt, token utils
 */
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await UserModel.validateLogin(email, password);
    if (!user) {
      return res.status(401).json(
        createErrorResponse('Invalid credentials', 'INVALID_CREDENTIALS')
      );
    }

    const tokens = generateTokens(String(user.id));
    
    // Set secure cookies
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 900000 // 15 minutes
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 604800000 // 7 days
    });

    return res.json(createSuccessResponse({ message: 'Logged in successfully' }));
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json(
      createErrorResponse('Internal server error', 'SERVER_ERROR')
    );
  }
});

router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);
    
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'strict' });
    res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });
    res.sendStatus(204);
  } catch (error) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(401).json({ code: 'INVALID_REFRESH_TOKEN' });
  }
});

export default router; 