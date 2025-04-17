import BaseModel from '@/models/BaseModel';
import { Post } from '@/types';

interface CreatePostData {
  title: string;
  content: string;
  user_id: number;
  category_id: number;
  tags?: string[];
  location?: string;
  attachment?: string;
}

interface UpdatePostData extends Partial<CreatePostData> {
  status?: 'pending' | 'verified' | 'flagged';
}

export class PostModel extends BaseModel {
  constructor() {
    super('posts');
  }

  async create(data: CreatePostData): Promise<Post> {
    const query = `
      INSERT INTO posts (title, content, user_id, category_id, tags, location, attachment)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await this.executeQuery<Post>(
      query,
      [
        data.title,
        data.content,
        data.user_id,
        data.category_id,
        data.tags,
        data.location,
        data.attachment
      ]
    );
    return result.rows[0];
  }

  async update(id: number, data: UpdatePostData): Promise<Post | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Build dynamic update query
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (updates.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE posts
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await this.executeQuery<Post>(query, values);
    return result.rows[0] || null;
  }

  async delete(id: number, soft: boolean = true): Promise<boolean> {
    if (soft) {
      const query = `
        UPDATE posts
        SET status = 'flagged', updated_at = NOW()
        WHERE id = $1
        RETURNING id
      `;
      const result = await this.executeQuery<{ id: number }>(query, [id]);
      return (result.rowCount ?? 0) > 0;
    } else {
      const query = `DELETE FROM posts WHERE id = $1 RETURNING id`;
      const result = await this.executeQuery<{ id: number }>(query, [id]);
      return (result.rowCount ?? 0) > 0;
    }
  }

  async findAllWithFilters(filters: {
    category_id?: number;
    tags?: string[];
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ posts: Post[]; total: number }> {
    const conditions: string[] = ["status != 'flagged'"];
    const values: any[] = [];
    let paramCount = 1;

    if (filters.category_id) {
      conditions.push(`category_id = $${paramCount}`);
      values.push(filters.category_id);
      paramCount++;
    }

    if (filters.tags && filters.tags.length > 0) {
      conditions.push(`tags && $${paramCount}`);
      values.push(filters.tags);
      paramCount++;
    }

    const countQuery = `
      SELECT COUNT(*) 
      FROM posts 
      WHERE ${conditions.join(' AND ')}
    `;

    const query = `
      SELECT p.*, c.name as category_name
      FROM posts p
      JOIN categories c ON p.category_id = c.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY p.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    values.push(filters.limit || 10, filters.offset || 0);

    const [countResult, postsResult] = await Promise.all([
      this.executeQuery(countQuery, values.slice(0, -2)),
      this.executeQuery<Post>(query, values)
    ]);

    return {
      posts: postsResult.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  async findByCategory(categoryId: number): Promise<Post[]> {
    const query = `
      SELECT p.*, c.name as category_name
      FROM posts p
      JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = $1
      ORDER BY p.created_at DESC
    `;
    const result = await this.executeQuery<Post>(query, [categoryId]);
    return result.rows;
  }

  async updateVotes(id: number, upvotes: number, downvotes: number): Promise<Post> {
    const query = `
      UPDATE posts
      SET upvotes = $2, downvotes = $3, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    const result = await this.executeQuery<Post>(query, [id, upvotes, downvotes]);
    return result.rows[0];
  }

  async findByIdWithCategory(id: number): Promise<Post | null> {
    const query = `
      SELECT p.*, c.name as category_name
      FROM posts p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1 AND p.status != 'flagged'
    `;
    const result = await this.executeQuery<Post>(query, [id]);
    return result.rows[0] || null;
  }

  async findTrendingPosts(regionId: number) {
    // Use EXPLAIN ANALYZE in tests
    // Consider covering indexes
  }
}

export default new PostModel(); 