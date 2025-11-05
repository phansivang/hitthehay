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
// Get Facebook App ID from environment variable or use empty string
// Using type assertion to access Vite env variables
const getEnvVar = (key: string, defaultValue: string): string => {
  try {
    // @ts-ignore - Vite env variables are available at runtime
    return import.meta.env[key] || defaultValue;
  } catch {
    return defaultValue;
  }
};

const FACEBOOK_APP_ID = getEnvVar('VITE_FACEBOOK_APP_ID', '');

/**
 * Load Facebook SDK script
 */
export const loadFacebookScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded and initialized
    if (window.FB) {
      resolve();
      return;
    }

    if (!FACEBOOK_APP_ID) {
      reject(new Error('Facebook App ID not configured. Set VITE_FACEBOOK_APP_ID in your environment variables.'));
      return;
    }

    // Check if script is already in the DOM
    const existingScript = document.querySelector('script[src*="connect.facebook.net"]');
    if (existingScript) {
      // Wait for it to load
      const checkInterval = setInterval(() => {
        if (window.FB) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.FB) {
          reject(new Error('Facebook SDK script failed to load'));
        }
      }, 10000);
      return;
    }

    // Set up initialization callback
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

    // Create and load script
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

/**
 * Initialize Facebook Login
 * Note: We don't check login status here to avoid errors on HTTP pages.
 * Login status will be checked when user actually clicks the login button.
 */
export const initializeFacebookLogin = (onSuccess: (userId: string, accessToken: string) => void, onError?: (error: Error) => void): void => {
  if (!window.FB) {
    throw new Error('Facebook SDK not loaded. Call loadFacebookScript() first.');
  }

  if (!FACEBOOK_APP_ID) {
    throw new Error('Facebook App ID not configured. Set VITE_FACEBOOK_APP_ID in your environment variables.');
  }

  // Just initialize - don't check login status automatically
  // This prevents errors on HTTP pages and is only needed when user clicks login
};

/**
 * Trigger Facebook Login prompt
 */
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

