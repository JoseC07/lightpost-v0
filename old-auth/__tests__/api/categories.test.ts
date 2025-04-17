import request from 'supertest'
import app from '@/server'
import pool from '@/config/database'

describe('Category API Endpoints', () => {
  const testCategory = {
    name: 'Test Category'
  };

  beforeEach(async () => {
    await pool.getPool().query('DELETE FROM posts');
    await pool.getPool().query('DELETE FROM categories');
  })

  afterAll(async () => {
    await pool.close()
  })

  describe('POST /api/categories', () => {
    it('should create a new category', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send(testCategory);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.name).toBe(testCategory.name);
    });

    it('should not create duplicate category', async () => {
      // First creation
      await request(app)
        .post('/api/categories')
        .send(testCategory);

      // Attempt duplicate
      const res = await request(app)
        .post('/api/categories')
        .send(testCategory);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toBe('Category name already exists');
    });

    it('should return 400 if name is missing', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeTruthy();
    });
  })

  describe('GET /api/categories', () => {
    it('should return all categories', async () => {
      // First create test data
      await request(app)
        .post('/api/categories')
        .send({ name: 'Test Category 1' });
      await request(app)
        .post('/api/categories')
        .send({ name: 'Test Category 2' });

      const res = await request(app)
        .get('/api/categories')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  })

  describe('GET /api/categories/:id', () => {
    it('should return a single category', async () => {
      // Create test category
      const createRes = await request(app)
        .post('/api/categories')
        .send(testCategory);

      const categoryId = createRes.body.data.id;

      const res = await request(app).get(`/api/categories/${categoryId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(categoryId);
      expect(res.body.data.name).toBe(testCategory.name);
    });

    it('should return 404 for non-existent category', async () => {
      const res = await request(app).get('/api/categories/9999');
      expect(res.status).toBe(404);
    });
  })

  describe('PUT /api/categories/:id', () => {
    it('should update an existing category', async () => {
      // Create a category first
      const category = await request(app)
        .post('/api/categories')
        .send({ name: 'Old Name' });

      const response = await request(app)
        .put(`/api/categories/${category.body.data.id}`)
        .send({ name: 'New Name' });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('New Name');
    });
  })

  describe('DELETE /api/categories/:id', () => {
    it('should delete a category', async () => {
      // Create a category first
      const category = await request(app)
        .post('/api/categories')
        .send({ name: 'To Delete' })

      const response = await request(app)
        .delete(`/api/categories/${category.body.data.id}`)

      expect(response.status).toBe(204)

      // Verify deletion
      const getResponse = await request(app)
        .get(`/api/categories/${category.body.data.id}`)
      expect(getResponse.status).toBe(404)
    })
  })

  describe('Category Validation', () => {
    it('should prevent duplicate category names', async () => {
      // Create first category
      await request(app)
        .post('/api/categories')
        .send({ name: 'Unique Category' });

      // Attempt duplicate
      const response = await request(app)
        .post('/api/categories')
        .send({ name: 'Unique Category' });

      expect(response.status).toBe(409);
      expect(response.body.error.message).toMatch(/already exists/i);
      expect(response.body.error.code).toBe('DUPLICATE_CATEGORY');
    });

    it('should validate category name length', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({ name: 'A' })
      
      expect(response.status).toBe(400)
    })
  })

  describe('Category-Post Integration', () => {
    it('should prevent category deletion with associated posts', async () => {
      const category = await request(app)
        .post('/api/categories')
        .send({ name: 'Protected Category' });
      
      // Create post with this category
      await request(app).post('/api/posts').send({
        title: 'Test Post',
        content: 'Test Content',
        category_id: category.body.data.id
      });

      const deleteResponse = await request(app)
        .delete(`/api/categories/${category.body.data.id}`);
      
      expect(deleteResponse.status).toBe(400);
    });
  })
}) 