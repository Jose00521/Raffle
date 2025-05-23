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
  data,
  message,
});

export const createErrorResponse = (message = 'Error', statusCode = 400): ApiResponse<null> => ({
  statusCode,
  success: false,
  message,
  data: null
}); 