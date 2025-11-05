/**
 * Reusable OAuth Button Component
 * Provides a consistent UI for OAuth provider buttons
 */

import React from 'react';
import { useOAuth } from '@/shared/hooks/useOAuth';
import type { OAuthProvider, OAuthCredentials } from '@/shared/types/oauth';
import { getOAuthConfig } from '@/shared/lib/oauth/providers';

interface OAuthButtonProps {
  provider: OAuthProvider;
  onSuccess: (credentials: OAuthCredentials) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Reusable OAuth Button Component
 * 
 * @example
 * ```tsx
 * <OAuthButton
 *   provider="google"
 *   onSuccess={(credentials) => {
 *     // Handle successful authentication
 *   }}
 *   onError={(error) => {
 *     console.error('OAuth error:', error);
 *   }}
 * />
 * ```
 */
export const OAuthButton: React.FC<OAuthButtonProps> = ({
  provider,
  onSuccess,
  onError,
  disabled = false,
  className = '',
  children,
}) => {
  const { isLoaded, isLoading, error, signIn } = useOAuth({
    provider,
    onSuccess,
    onError,
    autoLoad: true,
  });

  const config = getOAuthConfig(provider);
  const Icon = config.icon;
  const isDisabled = disabled || !isLoaded || isLoading;

  const handleClick = () => {
    if (!isLoaded) {
      onError?.(new Error(`${config.displayName} authentication is not ready yet. Please try again in a moment.`));
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
              style={{ borderTopColor: config.color }}
            ></div>
            Signing in...
          </>
        ) : (
          <>
            {Icon ? (
              <Icon className="w-5 h-5 mr-3" style={{ color: config.color }} />
            ) : (
              <span className="w-5 h-5 mr-3" style={{ color: config.color }}>
                {config.displayName[0]}
              </span>
            )}
            {children || `Sign in with ${config.displayName}`}
          </>
        )}
      </button>
      {error && (
        <p className="text-sm text-red-600 text-center mt-1">{error.message}</p>
      )}
    </>
  );
};

