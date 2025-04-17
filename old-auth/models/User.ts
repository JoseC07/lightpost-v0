import BaseModel from './BaseModel';
import bcrypt from 'bcryptjs';
import { UserRole, roleSchema } from '../types/roles';
import { validatePassword } from '../middleware/validation';

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: UserRole;
  verified_location: boolean;
  is_active: boolean;
  failed_attempts: number;
  last_failed_attempt: Date | null;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export type CreateUserDTO = {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
};

class UserModel extends BaseModel {
  constructor() {
    super('users');
  }

  async createUser(data: CreateUserDTO): Promise<Omit<User, 'password_hash'>> {
    // Validate role if provided
    const role = roleSchema.parse(data.role || UserRole.USER);
    
    // Validate password strength
    validatePassword(data.password);
    
    const password_hash = await bcrypt.hash(data.password, 12);
    
    const query = `
      INSERT INTO users (
        username, email, password_hash, role, 
        is_active, email_verified
      )
      VALUES ($1, $2, $3, $4, true, false)
      RETURNING id, username, email, role, verified_location, 
                is_active, email_verified, created_at, updated_at
    `;
    
    const result = await this.executeQuery<Omit<User, 'password_hash'>>(
      query,
      [data.username, data.email, password_hash, role]
    );
    
    return result.rows[0];
  }

  async deactivateUser(id: number): Promise<boolean> {
    const query = `
      UPDATE users 
      SET is_active = false, updated_at = NOW() 
      WHERE id = $1 
      RETURNING id
    `;
    const result = await this.executeQuery(query, [id]);
    return result.rowCount === 1;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await this.executeQuery<User>(query, [email]);
    return result.rows[0] || null;
  }

  async validateLogin(email: string, password: string): Promise<User | null> {
    const user = await this.findUserByEmail(email);
    
    if (!user || !user.is_active) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      await this.incrementFailedAttempts(user.id);
      return null;
    }

    // Reset failed attempts on successful login
    if (user.failed_attempts > 0) {
      await this.resetFailedAttempts(user.id);
    }

    return user;
  }

  private async incrementFailedAttempts(userId: number): Promise<void> {
    const query = `
      UPDATE users 
      SET failed_attempts = failed_attempts + 1,
          last_failed_attempt = NOW()
      WHERE id = $1
    `;
    await this.executeQuery(query, [userId]);
  }

  private async resetFailedAttempts(userId: number): Promise<void> {
    const query = `
      UPDATE users 
      SET failed_attempts = 0,
          last_failed_attempt = NULL
      WHERE id = $1
    `;
    await this.executeQuery(query, [userId]);
  }

  // Existing methods remain the same...
  // Reference to findUserByEmail:
//   ```typescript:src/models/User.ts
//   startLine: 49
//   endLine: 53
//   ```
}

export default new UserModel(); 