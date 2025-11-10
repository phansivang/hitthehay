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

interface RequestOptions extends RequestInit {}

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

  private buildURL(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const normalizedBase = this.baseURL?.replace(/\/$/, '') ?? '';
    return normalizedBase ? `${normalizedBase}${cleanEndpoint}` : cleanEndpoint;
  }

  private async request<T>(endpoint: string,options: RequestOptions = {}): Promise<T> {
    const url = this.buildURL(endpoint);
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getAuthToken();
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
    
    const finalHeaders: HeadersInit = {
      ...headers,
      ...authHeader,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: finalHeaders,
      });

      let data: unknown;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new ApiClientError(
          `Failed to parse response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
          response.status,
          null
        );
      }

      if (!response.ok) {
        const errorMessage = (data as { message?: string })?.message ?? `Request failed with status ${response.status}`;
        throw new ApiClientError(errorMessage, response.status, data);
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }

      const typedError = createTypedError(error);
      throw new ApiClientError(
        typedError.message,
        0,
        typedError.originalError
      );
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  async postFile<T>(endpoint: string, file: File, options?: RequestOptions): Promise<T> {
    const url = this.buildURL(endpoint);
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    
    if (options?.headers) {
      const headerEntries = options.headers instanceof Headers 
        ? Array.from(options.headers.entries())
        : options.headers instanceof Array
        ? options.headers
        : Object.entries(options.headers);
      
      for (const [key, value] of headerEntries) {
        if (key.toLowerCase() !== 'content-type') {
          headers[key] = typeof value === 'string' ? value : String(value);
        }
      }
    }

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        method: 'POST',
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        body: formData,
      });

      let data: unknown;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new ApiClientError(
          `Failed to parse response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
          response.status,
          null
        );
      }

      if (!response.ok) {
        const errorMessage = (data as { message?: string })?.message ?? `Request failed with status ${response.status}`;
        throw new ApiClientError(errorMessage, response.status, data);
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }

      const typedError = createTypedError(error);
      throw new ApiClientError(
        typedError.message,
        0,
        typedError.originalError
      );
    }
  }
}

export const apiClient = new ApiClient();

