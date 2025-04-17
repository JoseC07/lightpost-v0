import express from 'express';
import { authenticateJWT } from '@/middleware/jwtAuth';
import { requireRole } from '@/middleware/rbac';
import { UserRole } from '@/types/roles';
import { createSuccessResponse } from '@/utils/apiResponse';

const router = express.Router();

/**
 * @route GET /api/admin/dashboard
 * @desc Protected admin dashboard endpoint
 * @access Private (Admin only)
 */
router.get(
  '/dashboard',
  authenticateJWT,  // First verify the JWT
  requireRole([Roles.ADMIN]),  // Then check if user has admin role
  (req, res) => {
    res.json(createSuccessResponse({
      message: 'Welcome to admin dashboard',
      user: req.user
    }));
  }
);

export default router; 