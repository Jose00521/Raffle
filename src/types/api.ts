export interface ApiResponse<T = any> {
  statusCode: number;
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export const createSuccessResponse = <T>(data: T, message?: string, statusCode = 200): ApiResponse<T> => ({
  statusCode,
  success: true,
  message,
  data,
  errors: []
});

export const createErrorResponse = (errors: string[] | string, message = 'Error', statusCode = 400): ApiResponse<null> => ({
  statusCode,
  success: false,
  message,
  errors: Array.isArray(errors) ? errors : [errors],
  data: null
}); 