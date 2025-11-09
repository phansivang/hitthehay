/**
 * Environment Configuration Utilities
 * Centralized environment variable access with type safety
 */

type EnvironmentMode = 'development' | 'production' | 'test';

interface EnvironmentConfig {
  readonly mode: EnvironmentMode;
  readonly isDevelopment: boolean;
  readonly isProduction: boolean;
  readonly isTest: boolean;
}

/**
 * Get environment variable with type-safe fallback
 */
export const getEnvironmentVariable = <T extends string = string>(
  key: string,
  defaultValue: T
): T => {
  try {
    // @ts-expect-error - Vite env variables are available at runtime
    const value = import.meta.env[key];
    return (value ?? defaultValue) as T;
  } catch {
    return defaultValue;
  }
};

/**
 * Get environment configuration
 */
export const getEnvironmentConfig = (): EnvironmentConfig => {
  const mode = getEnvironmentVariable<'development' | 'production' | 'test'>(
    'MODE',
    'development'
  ) as EnvironmentMode;

  return {
    mode,
    isDevelopment: mode === 'development',
    isProduction: mode === 'production',
    isTest: mode === 'test',
  } as const;
};

/**
 * Get API base URL with strategy pattern
 */
type UrlStrategy = 'relative' | 'absolute';

interface UrlStrategyConfig {
  strategy: UrlStrategy;
  url: string;
}

const createUrlStrategy = (envUrl: string, isDev: boolean): UrlStrategyConfig => {
  const defaultBackendUrl = 'http://localhost:8080';
  
  // Development mode: use relative URL if pointing to default backend
  if (isDev) {
    const shouldUseRelative = !envUrl || 
      envUrl === defaultBackendUrl || 
      envUrl.includes('localhost:8080');
    
    return {
      strategy: shouldUseRelative ? 'relative' : 'absolute',
      url: shouldUseRelative ? '' : envUrl,
    };
  }
  
  // Production: use env URL or fallback
  return {
    strategy: 'absolute',
    url: envUrl || defaultBackendUrl,
  };
};

export const getApiBaseUrl = (): string => {
  const env = getEnvironmentConfig();
  const envUrl = getEnvironmentVariable('VITE_API_BASE_URL', '');
  const { url } = createUrlStrategy(envUrl, env.isDevelopment);
  return url;
};

