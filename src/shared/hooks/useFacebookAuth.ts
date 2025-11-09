/**
 * React Hook for Facebook Authentication
 * Provides easy-to-use Facebook Sign-In functionality
 * 
 * @deprecated This hook is deprecated. Please use the unified `useOAuth` hook instead.
 * This hook will be removed in a future version.
 */

import { useEffect, useCallback, useState } from 'react';
import { loadFacebookScript, initializeFacebookLogin, promptFacebookLogin } from '@/shared/lib/facebook-auth';

interface UseFacebookAuthOptions {
  onSuccess?: (userId: string, accessToken: string) => void;
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
 *   onSuccess: (userId, accessToken) => {
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

  // Load Facebook script
  useEffect(() => {
    if (!autoLoad) return;

    setIsLoading(true);
    loadFacebookScript()
      .then(() => {
        setIsLoaded(true);
        setIsLoading(false);
        setError(null);
        
        // Initialize Facebook login if callback is provided
        if (onSuccess) {
          try {
            initializeFacebookLogin(onSuccess, onError);
          } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to initialize Facebook Login');
            setError(error);
            onError?.(error);
          }
        }
      })
      .catch((err) => {
        const error = err instanceof Error ? err : new Error('Failed to load Facebook SDK');
        setError(error);
        setIsLoading(false);
        onError?.(error);
      });
  }, [autoLoad, onSuccess, onError]);

  // Sign in function
  const signIn = useCallback(() => {
    if (!isLoaded) {
      const err = new Error('Facebook SDK not loaded yet');
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
      promptFacebookLogin(onSuccess, onError);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to prompt Facebook Login');
      setError(error);
      onError?.(error);
    }
  }, [isLoaded, onSuccess, onError]);

  return {
    isLoaded,
    isLoading,
    error,
    signIn,
  };
};

