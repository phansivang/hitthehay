/**
 * Error Handling Utilities
 * Type-safe error handling with discriminated unions
 */

export type ErrorType = 
  | { type: 'network'; message: string; originalError?: unknown }
  | { type: 'api'; message: string; status?: number; data?: unknown; originalError?: unknown }
  | { type: 'validation'; message: string; field?: string; originalError?: unknown }
  | { type: 'unknown'; message: string; originalError?: unknown };

/**
 * Create a typed error from unknown error
 */
export const createTypedError = (error: unknown, defaultMessage = 'An unexpected error occurred'): ErrorType => {
  if (error instanceof Error) {
    return {
      type: 'unknown',
      message: error.message || defaultMessage,
      originalError: error,
    };
  }

  if (typeof error === 'string') {
    return {
      type: 'unknown',
      message: error,
    };
  }

  return {
    type: 'unknown',
    message: defaultMessage,
    originalError: error,
  };
};

/**
 * Check if error is of specific type
 */
export const isErrorType = <T extends ErrorType['type']>(
  error: ErrorType,
  type: T
): error is Extract<ErrorType, { type: T }> => {
  return error.type === type;
};

/**
 * Extract error message from error type
 */
export const getErrorMessage = (error: ErrorType): string => {
  return error.message;
};

