// This file is required by jest.config.js
// Add any global test setup here
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { readFileSync } from 'fs';
import { pool } from '@/config/database';
import path from 'path';

// Global setup: this function will run once before all tests.
export default async function globalSetup() {
  try {
    // Simple connection check
    await pool.query('SELECT 1'); 
    // Run database initialization SQL (e.g. create tables, seed data)
    const setupSql = readFileSync(
      path.join(__dirname, '../db/schema.sql'),
      'utf8'
    );
    await pool.query(setupSql);
  } catch (error) {
    console.error('Global database initialization failed:', error);
    process.exit(1);
  }
} 