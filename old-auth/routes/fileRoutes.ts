import { Router } from 'express';
import { fileUploadMiddleware } from '@/middleware/fileUpload';
import * as FileController from '@/controllers/fileController';

const router = Router();

router.post('/upload', 
  fileUploadMiddleware,
  FileController.uploadFile
);

export default router; 