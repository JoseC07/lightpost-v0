import { Request, Response } from 'express'
import { Category, CategoryModel } from '@/models/Category'
import { createSuccessResponse, createErrorResponse } from '@/utils/apiResponse'
import pool from '@/config/database'

export const CategoryController = {
  async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await CategoryModel.findAll()
      res.json(createSuccessResponse(categories))
    } catch (error) {
      res.status(500).json(createErrorResponse('Error fetching categories'))
    }
  },

  async createCategory(req: Request, res: Response) {
    try {
      const category = await CategoryModel.create(req.body.name)
      res.status(201).json(createSuccessResponse(category))
    } catch (error: any) {
      if (error.message === 'DUPLICATE_CATEGORY') {
        return res.status(409).json(
          createErrorResponse('Category name already exists', 'DUPLICATE_CATEGORY')
        );
      }
      res.status(400).json(createErrorResponse(error.message))
    }
  },

  async getCategoryById(req: Request, res: Response) {
    try {
      const category = await CategoryModel.findById(req.params.id)
      if (!category) {
        return res.status(404).json(createErrorResponse('Category not found'))
      }
      res.json(createSuccessResponse(category))
    } catch (error) {
      res.status(500).json(createErrorResponse('Error fetching category'))
    }
  },

  async updateCategory(req: Request, res: Response) {
    try {
      const category = await CategoryModel.update(req.params.id, req.body.name)
      if (!category) {
        return res.status(404).json(createErrorResponse('Category not found'))
      }
      res.json(createSuccessResponse(category))
    } catch (error: any) {
      if (error.message === 'Category name already exists') {
        return res.status(400).json(createErrorResponse('Category name already exists'));
      }
      res.status(400).json(createErrorResponse('Error updating category'))
    }
  },

  async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params
      // Check for associated posts first
      const posts = await pool.getPool().query('SELECT id FROM posts WHERE category_id = $1', [id])
      if (posts.rows.length > 0) {
        return res.status(400).json(createErrorResponse('Cannot delete category with associated posts'))
      }
      await CategoryModel.delete(id)
      res.status(204).send()
    } catch (error) {
      res.status(400).json(createErrorResponse('Error deleting category'))
    }
  }
} 