/**
 * Authentication Service
 * Handles authentication-related API calls
 */

import { apiClient } from '@/shared/lib/api-client';
import type { AuthUser } from '@/shared/auth/AuthContext';
import type { OAuthProvider, OAuthCredentials } from '@/shared/types/oauth';

export interface LoginRequest {
  username_or_email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  token?: string;
  refreshToken?: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  user: AuthUser;
  token?: string;
  refreshToken?: string;
}

interface BackendOAuthLoginResponse {
  data?: {
    access_token: string;
    user_id: number;
    is_super_admin: boolean;
  };
  message?: string;
}

export interface OAuthLoginResponse {
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
 * Transform backend OAuth response to frontend format
 */
const transformOAuthResponse = (data: BackendOAuthLoginResponse['data']): OAuthLoginResponse => {
  if (!data) {
    throw new Error('Invalid response from server: missing data');
  }

  const role: 'admin' | 'user' = data.is_super_admin ? 'admin' : 'user';
  const user: AuthUser = {
    username: `user_${data.user_id}`,
    role,
  };

  return {
    user,
    token: data.access_token,
  };
};

/**
 * Store auth token in localStorage
 */
const storeAuthToken = (token: string): void => {
  try {
    localStorage.setItem('app_auth_token', JSON.stringify(token));
  } catch (error) {
    console.warn('Failed to store auth token:', error);
  }
};

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

      if (response.token) {
        storeAuthToken(response.token);
      }

      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to login');
    }
  },

  /**
   * Sign up with username, email, and password
   * POST /client/auths/signup
   */
  async signup(credentials: SignupRequest): Promise<SignupResponse> {
    try {
      const response = await apiClient.post<SignupResponse>(
        '/client/auths/signup',
        credentials,
        { skipAuth: true }
      );

      if (response.token) {
        storeAuthToken(response.token);
      }

      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to sign up');
    }
  },

  /**
   * Login with OAuth provider (Google, Facebook, etc.)
   * POST /client/auths/{provider}
   */
  async loginWithOAuth(credentials: OAuthCredentials): Promise<OAuthLoginResponse> {
    try {
      const { provider } = credentials;
      
      // Map credentials to backend format based on provider
      const backendPayload = provider === 'google'
        ? { id_token: credentials.idToken, access_token: credentials.accessToken }
        : { user_id: credentials.userId!, access_token: credentials.accessToken };

      console.log(backendPayload);

      const backendResponse = await apiClient.post<BackendOAuthLoginResponse>(
        `/client/auths/${provider}`,
        backendPayload,
        { skipAuth: true }
      );

      const response = transformOAuthResponse(backendResponse.data);

      if (response.token) {
        storeAuthToken(response.token);
      }

      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to login with ${credentials.provider}`);
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
