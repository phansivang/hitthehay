/**
 * Unified OAuth Hook
 * Provides a single hook interface for all OAuth providers
 */

import { useEffect, useCallback, useState, useMemo, useRef } from 'react';
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

  // Memoize handler to prevent unnecessary re-renders
  const handler = useMemo(() => getOAuthHandler(provider), [provider]);
  
  // Use refs for callbacks to avoid dependency issues and prevent memory leaks
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  
  // Update refs when callbacks change
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  // Load provider script
  useEffect(() => {
    if (!autoLoad) return;

    let isMounted = true;
    setIsLoading(true);

    handler
      .loadScript()
      .then(() => {
        // Check if component is still mounted before updating state
        if (!isMounted) return;
        
        setIsLoaded(true);
        setIsLoading(false);
        setError(null);

        // Don't initialize automatically - only initialize when user clicks login
        // This prevents errors from calling getLoginStatus on HTTP pages
      })
      .catch((err) => {
        // Check if component is still mounted before updating state
        if (!isMounted) return;
        
        const error = err instanceof Error ? err : new Error(`Failed to load ${provider} SDK`);
        setError(error);
        setIsLoading(false);
        onErrorRef.current?.(error);
      });

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [provider, autoLoad, handler]);

  // Sign in function
  const signIn = useCallback(() => {
    if (!isLoaded) {
      const err = new Error(`${provider} SDK not loaded yet`);
      setError(err);
      onErrorRef.current?.(err);
      return;
    }

    if (!onSuccessRef.current) {
      const err = new Error('onSuccess callback is required');
      setError(err);
      onErrorRef.current?.(err);
      return;
    }

    try {
      handler.promptLogin(onSuccessRef.current, onErrorRef.current);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to prompt ${provider} login`);
      setError(error);
      onErrorRef.current?.(error);
    }
  }, [isLoaded, provider, handler]);

  return {
    isLoaded,
    isLoading,
    error,
    signIn,
  };
};

