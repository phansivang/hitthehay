/**
 * Unified OAuth Hook
 * Provides a single hook interface for all OAuth providers
 */

import { useEffect, useCallback, useState } from 'react';
import type { UseOAuthOptions, UseOAuthReturn, OAuthCredentials } from '@/shared/types/oauth';
import { getOAuthHandler } from '@/shared/lib/oauth/providers';

/**
 * Unified OAuth hook for all providers
 * 
 * @example
 * ```tsx
 * const { isLoaded, signIn, error } = useOAuth({
 *   provider: 'google',
 *   onSuccess: (credentials) => {
 *     // Handle successful authentication
 *   },
 *   onError: (error) => {
 *     console.error('OAuth error:', error);
 *   }
 * });
 * 
 * return (
 *   <button onClick={signIn} disabled={!isLoaded}>
 *     Sign in with Google
 *   </button>
 * );
 * ```
 */
export const useOAuth = (options: UseOAuthOptions): UseOAuthReturn => {
  const { provider, onSuccess, onError, autoLoad = true } = options;
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handler = getOAuthHandler(provider);

  // Load provider script
  useEffect(() => {
    if (!autoLoad) return;

    setIsLoading(true);
    handler
      .loadScript()
      .then(() => {
        setIsLoaded(true);
        setIsLoading(false);
        setError(null);

        // Don't initialize automatically - only initialize when user clicks login
        // This prevents errors from calling getLoginStatus on HTTP pages
      })
      .catch((err) => {
        const error = err instanceof Error ? err : new Error(`Failed to load ${provider} SDK`);
        setError(error);
        setIsLoading(false);
        onError?.(error);
      });
  }, [provider, autoLoad, onSuccess, onError, handler]);

  // Sign in function
  const signIn = useCallback(() => {
    if (!isLoaded) {
      const err = new Error(`${provider} SDK not loaded yet`);
      setError(err);
      onError?.(err);
      return;
    }

    if (!onSuccess) {
      const err = new Error('onSuccess callback is required');
      setError(err);
      onError?.(err);
      return;
    }

    try {
      handler.promptLogin(onSuccess, onError);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to prompt ${provider} login`);
      setError(error);
      onError?.(error);
    }
  }, [isLoaded, provider, onSuccess, onError, handler]);

  return {
    isLoaded,
    isLoading,
    error,
    signIn,
  };
};

