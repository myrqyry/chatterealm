export interface EnvConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  ALLOWED_ORIGINS?: string;
  TWITCH_CLIENT_ID?: string;
  TWITCH_CLIENT_SECRET?: string;
  TWITCH_CHANNEL_NAME?: string;
}

export function validateEnv(): EnvConfig {
  const config: EnvConfig = {
    PORT: parseInt(process.env.PORT || '8081', 10),
    NODE_ENV: (process.env.NODE_ENV as any) || 'development',
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
    TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID,
    TWITCH_CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET,
    TWITCH_CHANNEL_NAME: process.env.TWITCH_CHANNEL_NAME,
  };

  // Validate required fields
  if (config.PORT < 1 || config.PORT > 65535) {
    throw new Error('Invalid PORT configuration');
  }

  if (!['development', 'production', 'test'].includes(config.NODE_ENV)) {
    throw new Error('Invalid NODE_ENV configuration');
  }

  return config;
}
