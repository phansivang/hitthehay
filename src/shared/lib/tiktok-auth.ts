/**
 * TikTok OAuth helper
 * Builds the authorization URL using environment variables and adds CSRF state.
 */

import { getEnvironmentVariable } from './utils/environment';

const TIKTOK_AUTH_URL = getEnvironmentVariable('VITE_TIKTOK_AUTH_URL', 'https://www.tiktok.com/v2/auth/authorize/');
const TIKTOK_CLIENT_KEY = getEnvironmentVariable('VITE_TIKTOK_CLIENT_KEY', '');
const TIKTOK_SCOPE = getEnvironmentVariable('VITE_TIKTOK_SCOPE', 'user.info.basic');
const TIKTOK_REDIRECT_URI = getEnvironmentVariable('VITE_TIKTOK_REDIRECT_URI', '');

export const generateCsrfState = (): string => {
  const array = new Uint8Array(30);
  const randomValues = crypto.getRandomValues(array);
  return Array.from(randomValues, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

export const storeCsrfState = (state: string): void => {
  try {
    sessionStorage.setItem('tiktok_csrf_state', state);
  } catch {
    // ignore
  }
};

export const buildTikTokAuthUrl = (override?: {
  clientKey?: string;
  scope?: string;
  redirectUri?: string;
  state?: string;
}): string => {
  const clientKey = override?.clientKey ?? TIKTOK_CLIENT_KEY;
  const scope = override?.scope ?? TIKTOK_SCOPE;
  const redirectUri = override?.redirectUri ?? TIKTOK_REDIRECT_URI;
  const state = override?.state ?? generateCsrfState();

  if (!clientKey) {
    throw new Error('TikTok client key is missing. Set VITE_TIKTOK_CLIENT_KEY.');
  }
  if (!redirectUri) {
    throw new Error('TikTok redirect URI is missing. Set VITE_TIKTOK_REDIRECT_URI.');
  }
  if (!redirectUri.startsWith('https://')) {
    throw new Error('TikTok redirect URI must start with https://');
  }

  storeCsrfState(state);

  const auth = new URL(TIKTOK_AUTH_URL);
  auth.searchParams.append('client_key', clientKey);
  auth.searchParams.append('scope', scope);
  auth.searchParams.append('response_type', 'code');
  auth.searchParams.append('redirect_uri', redirectUri);
  auth.searchParams.append('state', state);
  auth.searchParams.append('disable_auto_auth', '0');

  return auth.toString();
};

export const openTikTokAuthWindow = (): void => {
  const url = buildTikTokAuthUrl();
  window.open(url, '_blank', 'noopener,noreferrer');
};



