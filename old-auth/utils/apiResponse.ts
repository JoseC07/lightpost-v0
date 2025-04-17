import { ApiResponse } from '../types';

export const createSuccessResponse = <T>(data: T) => ({
  success: true,
  data
});

export const createErrorResponse = (error: string, code?: string) => ({
  success: false,
  error: {
    message: error,
    code: code || 'UNKNOWN_ERROR'
  }
}); 