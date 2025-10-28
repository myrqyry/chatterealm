const { validateEnv } = require('../dist/config/env');

try {
  console.log('🧪 Testing environment variable validation...');
  const env = validateEnv();
  console.log('✅ Environment validation passed:', {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    rateLimitWindow: env.RATE_LIMIT_WINDOW_MS
  });
} catch (error) {
  console.error('❌ Environment validation failed:', error.message);
  process.exit(1);
}
