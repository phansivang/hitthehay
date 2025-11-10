/**
 * Authentication Service
 * Handles authentication-related API calls
 */

import { apiClient } from '@/shared/lib/api-client';
import { storageService } from '@/shared/lib/utils/storage';
import type { AuthUser } from '@/shared/auth/AuthContext';
import type { OAuthCredentials } from '@/shared/types/oauth';

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

/**
 * Backend API response format
 */
interface BackendResponse<T> {
  data: T;
  message: string;
}

interface BackendOAuthLoginData {
  access_token: string;
  user_id: number;
  is_super_admin: boolean;
}

type BackendOAuthLoginResponse = BackendResponse<BackendOAuthLoginData>;

export interface OAuthLoginResponse {
  user: AuthUser;
  token?: string;
  refreshToken?: string;
}

/**
 * Transform backend OAuth response to frontend format
 */
const transformOAuthResponse = (data: BackendOAuthLoginData): OAuthLoginResponse => {
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
 * Store auth token using storage service
 */
const storeAuthToken = (token: string): void => {
  storageService.set('app_auth_token', token);
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
    const backendResponse = await apiClient.post<BackendResponse<LoginResponse>>(
      '/client/auths/login',
      credentials
    );

    const response = backendResponse.data;
    response.token && storeAuthToken(response.token);

    return response;
  },

  /**
   * Sign up with username, email, and password
   * POST /client/auths/signup
   */
  async signup(credentials: SignupRequest): Promise<SignupResponse> {
    const backendResponse = await apiClient.post<BackendResponse<SignupResponse>>(
      '/client/auths/signup',
      credentials
    );

    const response = backendResponse.data;
    response.token && storeAuthToken(response.token);

    return response;
  },

  /**
   * Login with OAuth provider (Google, Facebook, etc.)
   * POST /client/auths/{provider}
   */
  async loginWithOAuth(credentials: OAuthCredentials): Promise<OAuthLoginResponse> {
    const { provider } = credentials;
    
    // Use discriminated union pattern for provider-specific payloads
    type OAuthPayload = 
      | { provider: 'google'; id_token: string; access_token: string }
      | { provider: 'facebook'; user_id: string; access_token: string };
    
    const createPayload = (): OAuthPayload => {
      return provider === 'google'
        ? {
            provider: 'google',
            id_token: credentials.idToken ?? '',
            access_token: credentials.accessToken,
          }
        : {
            provider: 'facebook',
            user_id: credentials.userId ?? '',
            access_token: credentials.accessToken,
          };
    };

    const backendPayload = createPayload();
    // Remove provider from payload before sending (backend doesn't need it)
    const { provider: _, ...payload } = backendPayload;

    const backendResponse = await apiClient.post<BackendOAuthLoginResponse>(
      `/client/auths/${provider}`,
      payload
    );

    const response = transformOAuthResponse(backendResponse.data);

    // Use optional chaining for cleaner code
    response.token && storeAuthToken(response.token);

    return response;
  },

  /**
   * Logout - clear stored tokens
   */
  logout(): void {
    storageService.remove('app_auth_token');
  },
};
