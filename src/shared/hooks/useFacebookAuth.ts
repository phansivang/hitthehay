/**
 * React Hook for Facebook Authentication
 * Provides easy-to-use Facebook Sign-In functionality
 */

import { useEffect, useCallback, useState, useRef } from 'react';
import { loadFacebookScript, promptFacebookLogin } from '@/shared/lib/facebook-auth';
import type { OAuthCredentials } from '@/shared/types/oauth';

interface UseFacebookAuthOptions {
  onSuccess?: (credentials: OAuthCredentials) => void;
  onError?: (error: Error) => void;
  autoLoad?: boolean;
}

interface UseFacebookAuthReturn {
  isLoaded: boolean;
  isLoading: boolean;
  error: Error | null;
  signIn: () => void;
}

/**
 * Hook for Facebook Authentication
 * 
 * @example
 * ```tsx
 * const { isLoaded, signIn, error } = useFacebookAuth({
 *   onSuccess: (credentials) => {
 *     // Handle successful authentication
 *   },
 *   onError: (error) => {
 *     console.error('Facebook auth error:', error);
 *   }
 * });
 * 
 * return (
 *   <button onClick={signIn} disabled={!isLoaded}>
 *     Sign in with Facebook
 *   </button>
 * );
 * ```
 */
export const useFacebookAuth = (options: UseFacebookAuthOptions = {}): UseFacebookAuthReturn => {
  const { onSuccess, onError, autoLoad = true } = options;
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  useEffect(() => {
    if (!autoLoad) return;

    let isMounted = true;
    setIsLoading(true);

    loadFacebookScript()
      .then(() => {
        if (!isMounted) return;
        setIsLoaded(true);
        setIsLoading(false);
        setError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        const error = err instanceof Error ? err : new Error('Failed to load Facebook SDK');
        setError(error);
        setIsLoading(false);
        onErrorRef.current?.(error);
      });

    return () => {
      isMounted = false;
    };
  }, [autoLoad]);

  const signIn = useCallback(() => {
    if (!isLoaded) {
      const err = new Error('Facebook SDK not loaded yet');
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
      promptFacebookLogin(
        (userId, accessToken) => {
          const credentials: OAuthCredentials = {
            provider: 'facebook',
            accessToken,
            userId,
          };
          onSuccessRef.current?.(credentials);
        },
        (error) => {
          setError(error);
          onErrorRef.current?.(error);
        }
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to prompt Facebook Login');
      setError(error);
      onErrorRef.current?.(error);
    }
  }, [isLoaded]);

  return {
    isLoaded,
    isLoading,
    error,
    signIn,
  };
};

