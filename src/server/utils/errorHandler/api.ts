import { z } from "zod";

export interface ApiResponse<T = any> {
  statusCode: number;
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export interface ApiErrorValidationResponse<T = any> {
  type: 'validation_error';
  statusCode: number;
  success: false;
  message: string;
  data: null;
  errors: z.ZodIssue[];
}

export interface ApiConflictResponse<T = any> {
  type: 'conflict';
  statusCode: number;
  success: false;
  message: string;
  issues: {field: string, message: string}[];
} 

export const createSuccessResponse = <T>(data: T, message?: string, statusCode = 200): ApiResponse<T> => ({
  statusCode,
  success: true,
  data,
  message,
});

export const createErrorResponse = ( message = 'Error', statusCode = 400): ApiResponse<null> => ({
  statusCode,
  success: false,
  message,
  data: null,
}); 

export const createValidationErrorObject = (object: z.ZodError | null,message = 'Validation error', statusCode = 422): ApiErrorValidationResponse<any> => ({
  type: 'validation_error',
  statusCode,
  success: false,
  message,
  data: null,
  errors: object?.errors || [],
});

export const createConflictResponse = (message = 'Conflict', data: {field: string, message: string}[], statusCode = 409): ApiConflictResponse<any> => ({
  type: 'conflict',
  statusCode,
  success: false,
  message,
  issues: data,
});


