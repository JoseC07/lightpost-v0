import { Request, Response, NextFunction } from 'express';
import { Post } from '@/types';
import PostModel from '@/models/Post';
import { createSuccessResponse, createErrorResponse } from '@/utils/apiResponse';

export const getPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      categoryId,
      tags,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    
    const result = await PostModel.findAllWithFilters({
      category_id: categoryId ? Number(categoryId) : undefined,
      tags: typeof tags === 'string' ? tags.split(',') : undefined,
      limit: Number(limit),
      offset
    });
    
    res.json(createSuccessResponse({
      posts: result.posts,
      pagination: {
        total: result.total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(result.total / Number(limit))
      }
    }));
  } catch (error) {
    next(error);
  }
};

export const getPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await PostModel.findById(Number(req.params.id));
    if (!post) {
      return res.status(404).json(createErrorResponse('Post not found'));
    }
    res.json(createSuccessResponse(post));
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, category_id, tags, location } = req.body;
    
    if (!title || !content || !category_id) {
      return res.status(400).json(
        createErrorResponse('Title, content, and category are required')
      );
    }

    // Get user_id from authenticated request or fallback to req.body.user_id
    const user_id = (req as any).user?.id || req.body.user_id;
    if (!user_id) {
      return res.status(401).json(createErrorResponse('User not authenticated'));
    }

    // If a file has been uploaded by the file upload middleware, capture its path
    const attachment: string | undefined = req.file ? req.file.path : undefined;

    // Create the new post, including the user_id and optional attachment
    const post = await PostModel.create({
      title,
      content,
      user_id,
      category_id,
      tags,
      location,
      attachment
    });

    res.status(201).json(createSuccessResponse(post));
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = Number(req.params.id);
    const updates = req.body;

    const post = await PostModel.update(postId, updates);
    if (!post) {
      return res.status(404).json(createErrorResponse('Post not found'));
    }

    res.json(createSuccessResponse(post));
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const postId = Number(req.params.id);
    const hardDelete = req.query.hard === 'true';

    const success = await PostModel.delete(postId, !hardDelete);
    if (!success) {
      return res.status(404).json(createErrorResponse('Post not found'));
    }

    res.json(createSuccessResponse({ message: 'Post deleted successfully' }));
  } catch (error) {
    next(error);
  }
}; 