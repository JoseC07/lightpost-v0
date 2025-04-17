import pool from '@/config/database';
import { QueryResult, QueryResultRow } from 'pg';

export default class BaseModel {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  protected async executeQuery<T extends QueryResultRow>(query: string, params?: unknown[]): Promise<QueryResult<T>> {
    const client = await pool.getPool().connect();
    try {
      return await client.query<T>(query, params);
    } finally {
      client.release();
    }
  }

  async findById<T extends QueryResultRow>(id: number): Promise<T | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    const result = await this.executeQuery<T>(query, [id]);
    return result.rows[0] || null;
  }

  async findAll<T extends QueryResultRow>(conditions?: Record<string, any>): Promise<T[]> {
    let query = `SELECT * FROM ${this.tableName}`;
    const params: any[] = [];

    if (conditions && Object.keys(conditions).length > 0) {
      const whereClauses = Object.entries(conditions).map(([key, _], index) => {
        return `${key} = $${index + 1}`;
      });
      query += ` WHERE ${whereClauses.join(' AND ')}`;
      params.push(...Object.values(conditions));
    }

    const result = await this.executeQuery<T>(query, params);
    return result.rows;
  }
} 