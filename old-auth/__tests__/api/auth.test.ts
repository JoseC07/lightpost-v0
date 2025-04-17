import request from 'supertest'
import app from '@/server'
import pool from '@/db'
import bcrypt from 'bcryptjs'

describe('Authentication API', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'ValidPass123!'
  }

  beforeEach(async () => {
    // Setup test user
    await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2)',
      [testUser.email, bcrypt.hashSync(testUser.password, 8)]
    )
  })

  afterEach(async () => {
    await pool.query('DELETE FROM users')
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send(testUser)
      
      expect(res.status).toBe(200)
      expect(res.body.data).toHaveProperty('message', 'Logged in')
      expect(res.headers['set-cookie']).toEqual(
        expect.arrayContaining([
          expect.stringContaining('accessToken='),
          expect.stringContaining('refreshToken=')
        ])
      )
    })

    it('should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({...testUser, password: 'wrong'})
      
      expect(res.status).toBe(401)
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS')
    })
  })

  describe('POST /auth/refresh', () => {
    it('should refresh access token', async () => {
      // First login
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send(testUser)
      
      // Refresh with cookie
      const refreshRes = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', loginRes.headers['set-cookie'])
      
      expect(refreshRes.status).toBe(204)
      expect(refreshRes.headers['set-cookie']).toEqual(
        expect.arrayContaining([
          expect.stringContaining('accessToken='),
          expect.stringContaining('refreshToken=')
        ])
      )
    })
  })

  describe('POST /auth/logout', () => {
    it('should clear authentication cookies', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
      
      expect(res.status).toBe(200)
      expect(res.headers['set-cookie']).toEqual(
        expect.arrayContaining([
          expect.stringContaining('accessToken=;'),
          expect.stringContaining('refreshToken=;')
        ])
      )
    })
  })
}) 