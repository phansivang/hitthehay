/**
 * Authentication Service
 * Handles authentication-related API calls
 */

import { apiClient } from '@/shared/lib/api-client';
import type { AuthUser } from '@/shared/auth/AuthContext';

export interface LoginRequest {
  username_or_email: string;
  password: string;
}

export interface GoogleLoginRequest {
  id_token: string;
  access_token: string;
}

export interface LoginResponse {
  user: AuthUser;
  token?: string;
  refreshToken?: string;
}

interface BackendGoogleLoginResponse {
  data?: {
    access_token: string;
    user_id: number;
    is_super_admin: boolean;
  };
  message?: string;
}

export interface GoogleLoginResponse {
  user: AuthUser;
  token?: string;
  refreshToken?: string;
}

export interface ApiErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
}

/**
 * Authentication service for API calls
 */
export const authService = {
  /**
   * Login with username/password
   * POST /client/auths/login
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        '/client/auths/login',
        credentials,
        { skipAuth: true }
      );

      // Store auth token if provided
      if (response.token) {
        try {
          localStorage.setItem('app_auth_token', JSON.stringify(response.token));
        } catch (error) {
          console.warn('Failed to store auth token:', error);
        }
      }

      return response;
    } catch (error) {
      // Re-throw with better error handling
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to login');
    }
  },

  /**
   * Login with Google OAuth
   * POST /auths/google
   */
  async loginWithGoogle(credentials: GoogleLoginRequest): Promise<GoogleLoginResponse> {
    try {
      const backendResponse = await apiClient.post<BackendGoogleLoginResponse>(
        '/client/auths/google',
        credentials,
        { skipAuth: true }
      );

      // Transform backend response to frontend format
      // Handle both uppercase and lowercase field names (Go JSON marshaling)
      const data = backendResponse.data;
      
      if (!data) {
        throw new Error('Invalid response from server: missing data');
      }
      
      // Map is_superadmin to role
      const role: 'admin' | 'user' = data.is_super_admin ? 'admin' : 'user';
      
      // Create AuthUser object
      // Note: Backend doesn't return username, so we use a placeholder
      // You may want to fetch full user details after login
      const user: AuthUser = {
        username: `user_${data.user_id}`, // Placeholder - you may want to fetch actual username
        role,
      };

      // Store auth token
      const token = data.access_token;
      if (token) {
        try {
          localStorage.setItem('app_auth_token', JSON.stringify(token));
        } catch (error) {
          console.warn('Failed to store auth token:', error);
        }
      }

      // Return frontend-expected format
      return {
        user,
        token,
      };
    } catch (error) {
      // Re-throw with better error handling
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to login with Google');
    }
  },

  /**
   * Logout - clear stored tokens
   */
  logout(): void {
    try {
      localStorage.removeItem('app_auth_token');
    } catch (error) {
      console.warn('Failed to remove auth token:', error);
    }
  },
};

