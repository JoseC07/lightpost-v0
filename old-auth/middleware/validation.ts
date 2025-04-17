import { Request, Response, NextFunction } from 'express'
import { createErrorResponse } from '@/utils/apiResponse'
import { CategoryModel } from '@/models/Category'
import zxcvbn from 'zxcvbn'

export const validateCategory = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Category name is required and must be a non-empty string' });
  }
  
  next();
}

export const checkDuplicateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await CategoryModel.findByName(req.body.name);
    if (existing) {
      return res.status(409).json(
        createErrorResponse('Category name already exists', 'DUPLICATE_CATEGORY')
      );
    }
    next();
  } catch (error) {
    next(error);
  }
} 

export const validatePassword = (pw: string) => {
  if (pw.length < 8) throw new Error('Password too short');
  if (!/[A-Z]/.test(pw)) throw new Error('Need uppercase letter');
  if (!/\d/.test(pw)) throw new Error('Need number');
  if (zxcvbn(pw).score < 3) throw new Error('Password too weak');
};

export const validatePost = (req: Request, res: Response, next: NextFunction) => {
  const { title, content } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  
  next();
}; 