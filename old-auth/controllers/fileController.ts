import { Request, Response, NextFunction } from 'express';
import { createSuccessResponse, createErrorResponse } from '@/utils/apiResponse';

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json(createErrorResponse('No file uploaded'));
    }

    const fileDetails = {
      originalName: req.file.originalname,
      fileName: req.file.filename,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`,
      mimetype: req.file.mimetype
    };

    res.status(201).json(createSuccessResponse(fileDetails));
  } catch (error) {
    next(error);
  }
}; 