/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_TIKTOK_AUTH_URL?: string; // e.g. https://www.tiktok.com/v2/auth/authorize/
  readonly VITE_TIKTOK_CLIENT_KEY?: string;
  readonly VITE_TIKTOK_SCOPE?: string; // e.g. user.info.basic,video.publish,video.upload
  readonly VITE_TIKTOK_REDIRECT_URI?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

