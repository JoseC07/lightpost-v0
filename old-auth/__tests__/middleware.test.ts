import request from 'supertest';
import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { authenticateJWT } from '@/middleware/jwtAuth';
import { requireRole } from '@/middleware/rbac';
import { UserRole } from '@/types/roles';

describe('Authentication & Authorization Middleware', () => {
  let app: Express;
  const ACCESS_SECRET = 'test-secret';

  beforeEach(() => {
    process.env.ACCESS_SECRET = ACCESS_SECRET;
    app = express();
    app.use(cookieParser());

    // Create test routes with different role requirements
    app.get('/protected/admin',
      authenticateJWT,
      requireRole([UserRole.ADMIN]),
      (req, res) => res.json({ success: true })
    );

    app.get('/protected/user',
      authenticateJWT,
      requireRole([UserRole.USER, UserRole.ADMIN]),
      (req, res) => res.json({ success: true })
    );
  });

  describe('JWT Authentication', () => {
    it('should reject requests without a token', async () => {
      const response = await request(app).get('/protected/admin');
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTH_NO_TOKEN');
    });

    it('should reject expired tokens', async () => {
      // Create an expired token by setting a past expiration
      const token = jwt.sign(
        { id: '123', role: UserRole.ADMIN },
        ACCESS_SECRET,
        { expiresIn: '-1s' }
      );

      const response = await request(app)
        .get('/protected/admin')
        .set('Cookie', [`accessToken=${token}`]);

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTH_TOKEN_EXPIRED');
    });

    it('should reject malformed tokens', async () => {
      const response = await request(app)
        .get('/protected/admin')
        .set('Cookie', ['accessToken=not.a.valid.token']);

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTH_INVALID_TOKEN');
    });
  });

  describe('RBAC Authorization', () => {
    it('should allow admin access to admin routes', async () => {
      const token = jwt.sign(
        { id: '123', role: UserRole.ADMIN },
        ACCESS_SECRET,
        { expiresIn: '15m' }
      );

      const response = await request(app)
        .get('/protected/admin')
        .set('Cookie', [`accessToken=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject user role on admin routes', async () => {
      const token = jwt.sign(
        { id: '123', role: UserRole.USER },
        ACCESS_SECRET,
        { expiresIn: '15m' }
      );

      const response = await request(app)
        .get('/protected/admin')
        .set('Cookie', [`accessToken=${token}`]);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('AUTH_INSUFFICIENT_ROLE');
    });

    it('should allow both admin and user roles on user routes', async () => {
      // Test with user role
      const userToken = jwt.sign(
        { id: '123', role: UserRole.USER },
        ACCESS_SECRET,
        { expiresIn: '15m' }
      );

      const userResponse = await request(app)
        .get('/protected/user')
        .set('Cookie', [`accessToken=${userToken}`]);

      expect(userResponse.status).toBe(200);

      // Test with admin role
      const adminToken = jwt.sign(
        { id: '123', role: UserRole.ADMIN },
        ACCESS_SECRET,
        { expiresIn: '15m' }
      );

      const adminResponse = await request(app)
        .get('/protected/user')
        .set('Cookie', [`accessToken=${adminToken}`]);

      expect(adminResponse.status).toBe(200);
    });
  });
}); 