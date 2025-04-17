import pkg from 'pg';
import dotenv from 'dotenv';
import pgConnectionString from 'pg-connection-string';
const { parse } = pgConnectionString;

// Properly destructure after default import
const { Pool } = pkg;
type PoolConfig = pkg.PoolConfig;

dotenv.config();

// Validate environment variable early
const dbUrl = process.env.DATABASE_URL ?? (() => {
  throw new Error('DATABASE_URL is not defined');
})();

export const pool = new Pool((() => {
  const isTestEnv = process.env.NODE_ENV === 'test';
  
  return isTestEnv ? {
    host: process.env.DOCKER ? 'db' : 'localhost',
    port: 5432,
    database: new URL(dbUrl).pathname.split('/').pop(),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  } : {
    ...parse(dbUrl),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  } as PoolConfig;
})());

// Singleton database handler
class Database {
  private static instance: Database;
  public readonly pool: pkg.Pool;

  private constructor() {
    this.pool = pool;
  }

  static getInstance() {
    return this.instance || (this.instance = new Database());
  }

  /**
   * Returns the underlying pg.Pool instance.
   *
   * @returns {pkg.Pool} The database connection pool.
   */
  getPool(): pkg.Pool {
    return this.pool;
  }

  async close() {
    await this.pool.end();
  }
}

export default Database.getInstance(); 