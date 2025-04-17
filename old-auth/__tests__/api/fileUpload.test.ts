import request from 'supertest';
import app from '@/server';
import fs from 'fs';

describe('File Upload API', () => {
  const validFilePath = `${__dirname}/testfiles/valid.jpg`;
  const invalidFilePath = `${__dirname}/testfiles/invalid.txt`;

  beforeAll(() => {
    // Create test directory if not exists
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
  });

  it('should upload a valid file', async () => {
    const response = await request(app)
      .post('/api/upload')
      .attach('file', validFilePath);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('fileName');
  });

  it('should reject invalid file type', async () => {
    const response = await request(app)
      .post('/api/upload')
      .attach('file', invalidFilePath);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should reject files over size limit', async () => {
    const response = await request(app)
      .post('/api/upload')
      .attach('file', fs.createReadStream(validFilePath, { highWaterMark: 6 * 1024 * 1024 }));

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('File too large');
  });
}); 