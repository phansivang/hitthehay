/**
 * OAuth Provider Registry
 * Centralized configuration and handler registration for OAuth providers
 */

import type { OAuthProvider, OAuthProviderHandler, OAuthProviderConfig } from '@/shared/types/oauth';
import { loadGoogleScript, initializeGoogleSignIn, promptGoogleSignIn } from '@/shared/lib/google-auth';
import { loadFacebookScript, initializeFacebookLogin, promptFacebookLogin } from '@/shared/lib/facebook-auth';
import { Facebook } from 'lucide-react';

// Google Provider Handler
const googleHandler: OAuthProviderHandler = {
  async loadScript() {
    await loadGoogleScript();
  },

  initialize(onSuccess, onError) {
    try {
      initializeGoogleSignIn((idToken, accessToken) => {
        onSuccess({
          provider: 'google',
          idToken,
          accessToken,
        });
      });
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Failed to initialize Google Sign-In'));
    }
  },

  promptLogin(onSuccess, onError) {
    try {
      initializeGoogleSignIn((idToken, accessToken) => {
        onSuccess({
          provider: 'google',
          idToken,
          accessToken,
        });
      });
      promptGoogleSignIn();
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Failed to prompt Google Sign-In'));
    }
  },

  isLoaded() {
    return typeof window !== 'undefined' && !!window.google?.accounts;
  },
};

// Facebook Provider Handler
const facebookHandler: OAuthProviderHandler = {
  async loadScript() {
    await loadFacebookScript();
  },

  initialize(onSuccess, onError) {
    try {
      initializeFacebookLogin(
        (userId, accessToken) => {
          onSuccess({
            provider: 'facebook',
            accessToken,
            userId,
          });
        },
        onError
      );
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Failed to initialize Facebook Login'));
    }
  },

  promptLogin(onSuccess, onError) {
    try {
      promptFacebookLogin(
        (userId, accessToken) => {
          onSuccess({
            provider: 'facebook',
            accessToken,
            userId,
          });
        },
        onError
      );
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Failed to prompt Facebook Login'));
    }
  },

  isLoaded() {
    return typeof window !== 'undefined' && !!window.FB;
  },
};

/**
 * Provider Registry
 * Maps provider names to their handlers and configurations
 */
export const oauthProviders: Record<OAuthProvider, OAuthProviderHandler> = {
  google: googleHandler,
  facebook: facebookHandler,
};

/**
 * Provider Configurations
 * UI metadata for each provider
 */
export const oauthProviderConfigs: Record<OAuthProvider, OAuthProviderConfig> = {
  google: {
    name: 'google',
    displayName: 'Google',
    color: '#4285F4',
  },
  facebook: {
    name: 'facebook',
    displayName: 'Facebook',
    icon: Facebook,
    color: '#1877F2',
  },
};

/**
 * Get handler for a specific provider
 */
export const getOAuthHandler = (provider: OAuthProvider): OAuthProviderHandler => {
  const handler = oauthProviders[provider];
  if (!handler) {
    throw new Error(`OAuth provider "${provider}" is not supported`);
  }
  return handler;
};

/**
 * Get configuration for a specific provider
 */
export const getOAuthConfig = (provider: OAuthProvider): OAuthProviderConfig => {
  return oauthProviderConfigs[provider];
};

