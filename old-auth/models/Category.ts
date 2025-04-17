import { QueryResult } from 'pg'
import pool from '@/config/database'

export interface Category {
  id: number
  name: string
  created_at: Date
  updated_at: Date
}

export const CategoryModel = {
  async findAll(): Promise<Category[]> {
    const result: QueryResult<Category> = await pool.getPool().query(
      'SELECT * FROM categories ORDER BY created_at DESC'
    )
    return result.rows
  },

  async findById(id: string): Promise<Category | null> {
    const result: QueryResult<Category> = await pool.getPool().query(
      'SELECT * FROM categories WHERE id = $1',
      [id]
    )
    return result.rows[0] || null
  },

  async create(name: string): Promise<Category> {
    try {
      const result = await pool.getPool().query(
        'INSERT INTO categories (name) VALUES ($1) RETURNING *',
        [name]
      );
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') { // PostgreSQL unique violation code
        throw new Error('DUPLICATE_CATEGORY');
      }
      throw new Error('Error creating category: ' + error.message);
    }
  },

  async update(id: string, name: string): Promise<Category | null> {
    try {
      // Check if new name conflicts with existing category
      const existing = await pool.getPool().query(
        'SELECT * FROM categories WHERE LOWER(name) = LOWER($1) AND id != $2',
        [name, id]
      );
      
      if (existing.rows.length > 0) {
        throw new Error('Category name already exists');
      }

      const result: QueryResult<Category> = await pool.getPool().query(
        'UPDATE categories SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [name, id]
      )
      return result.rows[0] || null
    } catch (error: any) {
      if (error.message === 'Category name already exists') {
        throw error;
      }
      throw new Error('Error updating category');
    }
  },

  async delete(id: string): Promise<void> {
    const result = await pool.getPool().query(
      'DELETE FROM categories WHERE id = $1 AND NOT EXISTS (SELECT 1 FROM posts WHERE category_id = $1)',
      [id]
    );
    if (result.rowCount === 0) {
      throw new Error('CATEGORY_IN_USE');
    }
  },

  async findByName(name: string): Promise<Category | null> {
    const result = await pool.getPool().query(
      'SELECT * FROM categories WHERE name = $1', 
      [name]
    );
    return result.rows[0] || null;
  }
} 