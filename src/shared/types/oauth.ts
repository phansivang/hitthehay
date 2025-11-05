/**
 * Unified OAuth Types and Interfaces
 * Provides a consistent interface for all OAuth providers
 */

export type OAuthProvider = 'google' | 'facebook';

export interface OAuthCredentials {
  provider: OAuthProvider;
  idToken?: string;
  accessToken: string;
  userId?: string;
}

export interface OAuthProviderConfig {
  name: string;
  displayName: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
}

export interface OAuthProviderHandler {
  /**
   * Load the provider SDK script
   */
  loadScript(): Promise<void>;

  /**
   * Initialize the provider SDK
   */
  initialize(onSuccess: (credentials: OAuthCredentials) => void, onError?: (error: Error) => void): void;

  /**
   * Trigger the login prompt
   */
  promptLogin(onSuccess: (credentials: OAuthCredentials) => void, onError?: (error: Error) => void): void;

  /**
   * Check if the provider SDK is loaded
   */
  isLoaded(): boolean;
}

export interface UseOAuthOptions {
  provider: OAuthProvider;
  onSuccess?: (credentials: OAuthCredentials) => void;
  onError?: (error: Error) => void;
  autoLoad?: boolean;
}

export interface UseOAuthReturn {
  isLoaded: boolean;
  isLoading: boolean;
  error: Error | null;
  signIn: () => void;
}

