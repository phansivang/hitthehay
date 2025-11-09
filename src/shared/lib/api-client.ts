/**
 * Base API Client Configuration
 * Provides a centralized HTTP client for API requests
 */

import { getApiBaseUrl } from './utils/environment';
import { storageService } from './utils/storage';
import { createTypedError, type ErrorType } from './utils/error-handler';

const API_BASE_URL = getApiBaseUrl();

export class ApiClientError extends Error {
  readonly status?: number;
  readonly data?: unknown;
  readonly errorType: ErrorType;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.data = data;
    this.errorType = {
      type: status ? 'api' : 'network',
      message,
      status,
      data,
    };
  }
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Base API client with error handling and request configuration
 */
export class ApiClient {
  private readonly baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Get authentication token from storage
   */
  private getAuthToken(): string | null {
    return storageService.get<string>('app_auth_token');
  }

  /**
   * Build full URL from endpoint using strategy pattern
   */
  private buildURL(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Use nullish coalescing and optional chaining for cleaner code
    const normalizedBase = this.baseURL?.replace(/\/$/, '') ?? '';
    
    return normalizedBase ? `${normalizedBase}${cleanEndpoint}` : cleanEndpoint;
  }

  /**
   * Make HTTP request with error handling
   */
  private async request<T>(endpoint: string,options: RequestOptions = {}): Promise<T> {
    const { skipAuth = false, ...fetchOptions } = options;

    const url = this.buildURL(endpoint);
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    // Add auth token if available and not skipped
    const token = skipAuth ? null : this.getAuthToken();
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
    
    const finalHeaders: HeadersInit = {
      ...headers,
      ...authHeader,
    };

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: finalHeaders,
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');

      // Use type guard pattern instead of if/else
      const parseResponse = async (): Promise<unknown> => {
        return isJson 
          ? response.json().catch(() => null)
          : response.text().then(text => text || null);
      };

      const data = await parseResponse();

      // Type guard for error responses
      const isErrorResponse = !response.ok;
      if (isErrorResponse) {
        const errorMessage = (data as { message?: string })?.message ?? `Request failed with status ${response.status}`;
        throw new ApiClientError(errorMessage, response.status, data);
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }

      // Transform unknown error to typed error
      const typedError = createTypedError(error);
      throw new ApiClientError(
        typedError.message,
        0,
        typedError.originalError
      );
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

