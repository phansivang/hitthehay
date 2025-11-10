/**
 * Facebook OAuth Integration
 * Handles Facebook Login using Facebook SDK for JavaScript
 */

interface FacebookAuthResponse {
  authResponse?: {
    accessToken: string;
    userID: string;
    expiresIn: number;
    signedRequest: string;
    graphDomain: string;
    data_access_expiration_time: number;
  };
  status: string;
}

interface FacebookAuthError {
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

declare global {
  interface Window {
    FB?: {
      init: (config: {
        appId: string;
        cookie?: boolean;
        xfbml?: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: FacebookAuthResponse) => void,
        options?: {
          scope?: string;
          return_scopes?: boolean;
          auth_type?: string;
        }
      ) => void;
      getLoginStatus: (
        callback: (response: FacebookAuthResponse) => void
      ) => void;
      logout: (callback?: (response: FacebookAuthResponse) => void) => void;
      api: (
        path: string,
        callback: (response: unknown) => void,
        params?: { access_token?: string }
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

/**
 * Facebook OAuth configuration
 * Note: You'll need to set up a Facebook App ID in your Facebook Developers Console
 * and add it to your environment variables
 */
import { getEnvironmentVariable } from './utils/environment';

const FACEBOOK_APP_ID = getEnvironmentVariable('VITE_FACEBOOK_APP_ID', '');

/**
 * Load Facebook SDK script
 */
export const loadFacebookScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.FB) {
      resolve();
      return;
    }

    if (!FACEBOOK_APP_ID) {
      reject(new Error('Facebook App ID not configured. Set VITE_FACEBOOK_APP_ID in your environment variables.'));
      return;
    }

    const existingScript = document.querySelector('script[src*="connect.facebook.net"]');
    if (existingScript) {
      const checkInterval = setInterval(() => {
        if (window.FB) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.FB) {
          reject(new Error('Facebook SDK script failed to load'));
        }
      }, 10000);
      return;
    }

    window.fbAsyncInit = () => {
      if (!FACEBOOK_APP_ID) {
        reject(new Error('Facebook App ID not configured. Set VITE_FACEBOOK_APP_ID in your environment variables.'));
        return;
      }

      window.FB!.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v21.0',
      });

      resolve();
    };

    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.onerror = () => {
      reject(new Error('Failed to load Facebook SDK script'));
    };
    document.head.appendChild(script);
  });
};

export const initializeFacebookLogin = (onSuccess: (userId: string, accessToken: string) => void, onError?: (error: Error) => void): void => {
  if (!window.FB) {
    throw new Error('Facebook SDK not loaded. Call loadFacebookScript() first.');
  }

  if (!FACEBOOK_APP_ID) {
    throw new Error('Facebook App ID not configured. Set VITE_FACEBOOK_APP_ID in your environment variables.');
  }
};

export const promptFacebookLogin = (
  onSuccess: (userId: string, accessToken: string) => void,
  onError?: (error: Error) => void
): void => {
  if (!window.FB) {
    throw new Error('Facebook SDK not loaded');
  }

  window.FB.login(
    (response: FacebookAuthResponse) => {
      if (response.authResponse) {
        const { userID, accessToken } = response.authResponse;
        onSuccess(userID, accessToken);
      } else {
        const error = new Error('Facebook login failed: No auth response');
        onError?.(error);
      }
    },
    {
      scope: 'public_profile',
      return_scopes: true,
    }
  );
};

