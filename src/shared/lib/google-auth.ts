/**
 * Google OAuth Integration
 * Handles Google Sign-In using Google Identity Services
 */

interface GoogleAuthResponse {
  credential: string; // id_token
  clientId: string;
  select_by: string;
}

interface GoogleAuthError {
  type: string;
  message: string;
}

interface GooglePromptNotification {}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleAuthResponse) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (notification?: (notification: GooglePromptNotification) => void) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              type: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: string | number;
              locale?: string;
            }
          ) => void;
          disableAutoSelect: () => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token: string; error?: string }) => void;
            error_callback?: (error: GoogleAuthError) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

/**
 * Google OAuth configuration
 * Note: You'll need to set up a Google OAuth client ID in your Google Cloud Console
 * and add it to your environment variables
 */
import {getEnvironmentVariable} from './utils/environment';

const GOOGLE_CLIENT_ID = getEnvironmentVariable('VITE_GOOGLE_CLIENT_ID', '');

/**
 * Load Google Identity Services script
 */
export const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts) {
      resolve();
      return;
    }

    const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (existingScript) {
      const checkInterval = setInterval(() => {
        if (window.google?.accounts) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.google?.accounts) {
          reject(new Error('Google Identity Services script failed to load'));
        }
      }, 10000);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setTimeout(() => {
        if (window.google?.accounts) {
          resolve();
        } else {
          reject(new Error('Google Identity Services not available after script load'));
        }
      }, 100);
    };
    script.onerror = () => {
      reject(new Error('Failed to load Google Identity Services script'));
    };
    document.head.appendChild(script);
  });
};

export const initializeGoogleSignIn = (onSuccess: (idToken: string, accessToken: string) => void): void => {
  if (!window.google?.accounts) {
    throw new Error('Google Identity Services not loaded. Call loadGoogleScript() first.');
  }

  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google Client ID not configured. Set VITE_GOOGLE_CLIENT_ID in your environment variables.');
  }

  let pendingIdToken: string | null = null;
  let accessTokenReceived = false;

  const tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: 'openid email profile',
    callback: (tokenResponse) => {
      if (tokenResponse.error) {
        console.error('Error getting access token:', tokenResponse.error);
        return;
      }

      const accessToken = tokenResponse.access_token;
      accessTokenReceived = true;

      if (accessToken && pendingIdToken) {
        const idToken = pendingIdToken;
        pendingIdToken = null;
        onSuccess(idToken, accessToken);
      }
    },
    error_callback: (error) => {
      console.error('OAuth2 error:', error);
      if (pendingIdToken) {
        const idToken = pendingIdToken;
        pendingIdToken = null;
        onSuccess(idToken, '');
      }
    },
  });

  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: async (response: GoogleAuthResponse) => {
      pendingIdToken = response.credential;
      accessTokenReceived = false;

      try {
        tokenClient.requestAccessToken({ prompt: '' });
        
        setTimeout(() => {
          if (pendingIdToken && !accessTokenReceived) {
            try {
              tokenClient.requestAccessToken({ prompt: 'consent' });
            } catch (err) {
              if (pendingIdToken) {
                const idToken = pendingIdToken;
                pendingIdToken = null;
                onSuccess(idToken, '');
              }
            }
          }
        }, 2000);
      } catch (error) {
        console.error('Error requesting access token:', error);
        if (pendingIdToken) {
          const idToken = pendingIdToken;
          pendingIdToken = null;
          onSuccess(idToken, '');
        }
      }
    },
    auto_select: false,
    cancel_on_tap_outside: true,
  });
};

export const promptGoogleSignIn = (): void => {
  if (!window.google?.accounts) {
    throw new Error('Google Identity Services not loaded');
  }

  window.google.accounts.id.prompt();
};