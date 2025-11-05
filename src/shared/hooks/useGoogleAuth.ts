/**
 * React Hook for Google Authentication
 * Provides easy-to-use Google Sign-In functionality
 */

import { useEffect, useCallback, useState } from 'react';
import { loadGoogleScript, initializeGoogleSignIn, promptGoogleSignIn } from '@/shared/lib/google-auth';

interface UseGoogleAuthOptions {
  onSuccess?: (idToken: string, accessToken: string) => void;
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
 *   onSuccess: (idToken, accessToken) => {
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

  // Load Google script
  useEffect(() => {
    if (!autoLoad) return;

    setIsLoading(true);
    loadGoogleScript()
      .then(() => {
        setIsLoaded(true);
        setIsLoading(false);
        setError(null);
      })
      .catch((err) => {
        const error = err instanceof Error ? err : new Error('Failed to load Google Identity Services');
        setError(error);
        setIsLoading(false);
        onError?.(error);
      });
  }, [autoLoad, onError]);

  // Initialize Google Sign-In when loaded
  useEffect(() => {
    if (!isLoaded || !onSuccess) return;

    try {
      initializeGoogleSignIn(onSuccess);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize Google Sign-In');
      setError(error);
      onError?.(error);
    }
  }, [isLoaded, onSuccess, onError]);

  // Sign in function
  const signIn = useCallback(() => {
    if (!isLoaded) {
      const err = new Error('Google Identity Services not loaded yet');
      setError(err);
      onError?.(err);
      return;
    }

    try {
      promptGoogleSignIn();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to prompt Google Sign-In');
      setError(error);
      onError?.(error);
    }
  }, [isLoaded, onError]);

  return {
    isLoaded,
    isLoading,
    error,
    signIn,
  };
};


