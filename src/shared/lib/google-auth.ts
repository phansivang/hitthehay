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
          prompt: (notification?: () => void) => void;
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
// Get Google Client ID from environment variable or use empty string
// Using type assertion to access Vite env variables
const getEnvVar = (key: string, defaultValue: string): string => {
  try {
    // @ts-ignore - Vite env variables are available at runtime
    return import.meta.env[key] || defaultValue;
  } catch {
    return defaultValue;
  }
};

const GOOGLE_CLIENT_ID = getEnvVar('VITE_GOOGLE_CLIENT_ID', '');

/**
 * Load Google Identity Services script
 */
export const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google?.accounts) {
      resolve();
      return;
    }

    // Check if script is already in the DOM
    const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (existingScript) {
      // Wait for it to load
      const checkInterval = setInterval(() => {
        if (window.google?.accounts) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.google?.accounts) {
          reject(new Error('Google Identity Services script failed to load'));
        }
      }, 10000);
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Wait a bit for initialization
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

/**
 * Initialize Google Sign-In
 * Uses a simpler approach to avoid COOP issues
 */
export const initializeGoogleSignIn = (onSuccess: (idToken: string, accessToken: string) => void): void => {
  if (!window.google?.accounts) {
    throw new Error('Google Identity Services not loaded. Call loadGoogleScript() first.');
  }

  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google Client ID not configured. Set VITE_GOOGLE_CLIENT_ID in your environment variables.');
  }

  // Store success callback globally to access from token client
  (window as any).__googleAuthSuccess = onSuccess;

  // Initialize OAuth2 token client for access token
  // Store token client globally for later use
  (window as any).__googleTokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: 'openid email profile',
    callback: (tokenResponse) => {
      if (tokenResponse.error) {
        console.error('Error getting access token:', tokenResponse.error);
        return;
      }

      const accessToken = tokenResponse.access_token;
      const pendingIdToken = (window as any).__pendingIdToken;
      const successCallback = (window as any).__googleAuthSuccess;

      if (accessToken && pendingIdToken && successCallback) {
        (window as any).__accessTokenReceived = true;
        delete (window as any).__pendingIdToken;
        successCallback(pendingIdToken, accessToken);
      }
    },
    error_callback: (error) => {
      console.error('OAuth2 error:', error);
      // Fallback: try with just ID token
      const pendingIdToken = (window as any).__pendingIdToken;
      const successCallback = (window as any).__googleAuthSuccess;
      if (pendingIdToken && successCallback) {
        delete (window as any).__pendingIdToken;
        successCallback(pendingIdToken, '');
      }
    },
  });

  // Initialize Google Identity Services for ID token
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: async (response: GoogleAuthResponse) => {
      // Get the id_token from the response
      const idToken = response.credential;

      // Store ID token temporarily
      (window as any).__pendingIdToken = idToken;

      // Request access token
      // Use empty prompt to try silent auth first, then fallback to consent if needed
      try {
        const storedTokenClient = (window as any).__googleTokenClient;
        if (storedTokenClient) {
          // Try without prompt first (silent auth)
          storedTokenClient.requestAccessToken({ prompt: '' });
          
          // Fallback: if access token doesn't come within 2 seconds, try with consent
          setTimeout(() => {
            const pendingIdToken = (window as any).__pendingIdToken;
            if (pendingIdToken && !(window as any).__accessTokenReceived) {
              // Try with consent prompt
              try {
                storedTokenClient.requestAccessToken({ prompt: 'consent' });
              } catch (err) {
                // If that also fails, use ID token only
                const successCallback = (window as any).__googleAuthSuccess;
                if (successCallback) {
                  delete (window as any).__pendingIdToken;
                  successCallback(pendingIdToken, '');
                }
              }
            }
          }, 2000);
        } else {
          // Fallback: use ID token only
          const successCallback = (window as any).__googleAuthSuccess;
          if (successCallback) {
            successCallback(idToken, '');
          }
        }
      } catch (error) {
        console.error('Error requesting access token:', error);
        // Fallback: use ID token only
        const successCallback = (window as any).__googleAuthSuccess;
        if (successCallback) {
          successCallback(idToken, '');
        }
      }
    },
    auto_select: false,
    cancel_on_tap_outside: true,
  });
};

/**
 * Trigger Google Sign-In prompt
 */
export const promptGoogleSignIn = (): void => {
  if (!window.google?.accounts) {
    throw new Error('Google Identity Services not loaded');
  }

  window.google.accounts.id.prompt();
};