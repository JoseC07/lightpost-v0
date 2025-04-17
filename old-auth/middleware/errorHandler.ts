import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  
  if (err.message.includes('Invalid file type')) {
    err.statusCode = 415; // Unsupported Media Type
  } else if (err.message.includes('File too large')) {
    err.statusCode = 413; // Payload Too Large
  }
  
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}; 