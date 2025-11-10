/**
 * OAuth Types and Interfaces
 * Provides types for OAuth authentication
 */

export type OAuthProvider = 'google' | 'facebook';

export interface OAuthCredentials {
  provider: OAuthProvider;
  idToken?: string;
  accessToken: string;
  userId?: string;
}

