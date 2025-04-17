import fs from 'fs';
import path from 'path';
import pool from '@/config/database';

async function initializeDatabase() {
  const client = await pool.getPool().connect();
  try {
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf8'
    );
    
    await client.query(schemaSQL);
    
    // Insert default categories
    await client.query(`
      INSERT INTO categories (name) VALUES
      ('immigration'),
      ('fire'),
      ('general')
      ON CONFLICT (name) DO NOTHING;
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default initializeDatabase; 