import { execSync } from 'child_process';
import fs from 'fs';

export const resetTestDatabase = () => {
  try {
    execSync('pnpm db:reset', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to reset test database:', error);
    process.exit(1);
  }
};

export const generateTestFile = (sizeMB: number, path: string) => {
  execSync(`dd if=/dev/urandom of=${path} bs=1M count=${sizeMB} status=none`);
};

export const setupTestFiles = () => {
  beforeAll(() => {
    if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
  });

  afterAll(() => {
    fs.rmSync('uploads', { recursive: true, force: true });
  });
};

export const withRetry = (fn: () => Promise<any>, retries = 3) => {
  return async () => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await fn();
      } catch (err) {
        attempt++;
        if (attempt >= retries) throw err;
        await new Promise(res => setTimeout(res, 1000 * attempt));
      }
    }
  };
}; 