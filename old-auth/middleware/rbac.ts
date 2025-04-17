import { Request, Response, NextFunction } from 'express';
import { createErrorResponse } from '@/utils/apiResponse';
import { UserRole } from '@/types/roles';

/**
 * Middleware factory that creates role-based access control
 * @param allowedRoles - Array of roles that are permitted to access the route
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // First check if we have a user (JWT middleware should run first)
    if (!req.user) {
      return res.status(401).json(
        createErrorResponse('Authentication required', 'AUTH_REQUIRED')
      );
    }

    // Check if user's role is in the allowed roles list
    if (!allowedRoles.includes(req.user.role as UserRole)) {
      return res.status(403).json(
        createErrorResponse('Insufficient permissions', 'AUTH_INSUFFICIENT_ROLE')
      );
    }

    next();
  };
}; 