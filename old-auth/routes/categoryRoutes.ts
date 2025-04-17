import express from 'express'
import { CategoryController } from '@/controllers/categoryController'
import { validateCategory } from '@/middleware/validation'

const router = express.Router()

router.get('/', CategoryController.getAllCategories)
router.post('/', validateCategory, CategoryController.createCategory)
router.get('/:id', CategoryController.getCategoryById)
router.put('/:id', validateCategory, CategoryController.updateCategory)
router.delete('/:id', CategoryController.deleteCategory)

export default router 