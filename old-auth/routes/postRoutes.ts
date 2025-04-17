import { Router } from 'express';
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost
} from '@/controllers/postController';

const router = Router();

// Get all posts with filtering
router.get('/', getPosts);

// Get single post
router.get('/:id', getPost);

// Create new post
router.post('/', createPost);

// Update post
router.put('/:id', updatePost);

// Delete post (supports both soft and hard delete)
router.delete('/:id', deletePost);

export default router; 