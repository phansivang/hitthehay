/**
 * React Hook for Google Authentication
 * Provides easy-to-use Google Sign-In functionality
 */

import { useEffect, useCallback, useState, useRef } from 'react';
import { loadGoogleScript, initializeGoogleSignIn, promptGoogleSignIn } from '@/shared/lib/google-auth';
import type { OAuthCredentials } from '@/shared/types/oauth';

interface UseGoogleAuthOptions {
  onSuccess?: (credentials: OAuthCredentials) => void;
  onError?: (error: Error) => void;
  autoLoad?: boolean;
}

interface UseGoogleAuthReturn {
  isLoaded: boolean;
  isLoading: boolean;
  error: Error | null;
  signIn: () => void;
}

/**
 * Hook for Google Authentication
 * 
 * @example
 * ```tsx
 * const { isLoaded, signIn, error } = useGoogleAuth({
 *   onSuccess: (credentials) => {
 *     // Handle successful authentication
 *   },
 *   onError: (error) => {
 *     console.error('Google auth error:', error);
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
export const useGoogleAuth = (options: UseGoogleAuthOptions = {}): UseGoogleAuthReturn => {
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

    loadGoogleScript()
      .then(() => {
        if (!isMounted) return;
        setIsLoaded(true);
        setIsLoading(false);
        setError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        const error = err instanceof Error ? err : new Error('Failed to load Google Identity Services');
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
      const err = new Error('Google Identity Services not loaded yet');
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
      initializeGoogleSignIn((idToken, accessToken) => {
        const credentials: OAuthCredentials = {
          provider: 'google',
          idToken,
          accessToken,
        };
        onSuccessRef.current?.(credentials);
      });
      promptGoogleSignIn();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to prompt Google Sign-In');
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

