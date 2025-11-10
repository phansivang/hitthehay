/**
 * Facebook OAuth Button Component
 * Provides a button for Facebook Sign-In
 */

import React from 'react';
import { Facebook } from 'lucide-react';
import { useFacebookAuth } from '@/shared/hooks/useFacebookAuth';
import type { OAuthCredentials } from '@/shared/types/oauth';

interface FacebookButtonProps {
  onSuccess: (credentials: OAuthCredentials) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Facebook OAuth Button Component
 * 
 * @example
 * ```tsx
 * <FacebookButton
 *   onSuccess={(credentials) => {
 *     // Handle successful authentication
 *   }}
 *   onError={(error) => {
 *     console.error('Facebook auth error:', error);
 *   }}
 * />
 * ```
 */
export const FacebookButton: React.FC<FacebookButtonProps> = ({
  onSuccess,
  onError,
  disabled = false,
  className = '',
  children,
}) => {
  const { isLoaded, isLoading, error, signIn } = useFacebookAuth({
    onSuccess,
    onError,
    autoLoad: true,
  });

  const isDisabled = disabled || !isLoaded || isLoading;

  const handleClick = () => {
    if (!isLoaded) {
      onError?.(new Error('Facebook authentication is not ready yet. Please try again in a moment.'));
      return;
    }
    signIn();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        className={`w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isLoading ? (
          <>
            <div
              className="w-5 h-5 mr-3 border-2 border-gray-300 rounded-full animate-spin"
              style={{ borderTopColor: '#1877F2' }}
            ></div>
            Signing in...
          </>
        ) : (
          <>
            {children || (
              <>
                <Facebook className="w-5 h-5 mr-3" style={{ color: '#1877F2' }} />
                Sign in with Facebook
              </>
            )}
          </>
        )}
      </button>
      {error && (
        <p className="text-sm text-red-600 text-center mt-1">{error.message}</p>
      )}
    </>
  );
};

