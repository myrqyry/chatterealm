import express from 'express';
import { createServer } from 'http';

// Graceful shutdown and error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // In production, you might want to exit gracefully
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // In production, you might want to exit gracefully
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});
import compression from 'compression';
import cors from 'cors';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { WebSocketServer } from './services/webSocketServer';
import { GameStateManager } from './services/gameStateManager';
import { EmojiService } from './services/EmojiService';
import { StreamOptimizedTwitchService } from './services/StreamOptimizedTwitchService';
import { StreamCommentaryService } from './services/StreamCommentaryService';
import { AutoWanderService } from './services/AutoWanderService';
import { LootService } from './services/LootService';
import { PlayerMovementService } from './services/PlayerMovementService';
import { CombatService } from './services/CombatService';
import { HandDrawnBuildingService } from './services/HandDrawnBuildingService';
import { GAME_CONFIG } from 'shared';
import { validateEnv } from './config/env';

const app = express();
const env = validateEnv();
const httpServer = createServer(app);

const gameStateManager = new GameStateManager();
const emojiService = new EmojiService();
const webSocketServer = new WebSocketServer(httpServer);
const handDrawnBuildingService = new HandDrawnBuildingService();

// No longer needed, as services are instantiated within GameStateManager

// Conditionally instantiate the Twitch service
let twitchService: StreamOptimizedTwitchService | null = null;
const twitchClientId = env.TWITCH_CLIENT_ID;
const twitchClientSecret = env.TWITCH_CLIENT_SECRET;
const twitchChannelName = env.TWITCH_CHANNEL_NAME;

if (twitchClientId && twitchClientSecret && twitchChannelName) {
  twitchService = new StreamOptimizedTwitchService(
    webSocketServer.getIO(),
    twitchClientId,
    twitchClientSecret,
    twitchChannelName,
    gameStateManager,
  );

  // Connect to Twitch
  twitchService.connect().catch(err => {
      console.error("Failed to connect to Twitch:", err);
  });
  console.log('🔌 Twitch integration enabled.');
} else {
  console.warn('⚠️ Twitch credentials not provided in environment variables (TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_CHANNEL_NAME). Twitch integration is disabled.');
}

// The remaining services are instantiated within GameStateManager or are not used.

// All services are now injected into GameStateManager via its constructor.

// Middleware
// CORS Configuration
const allowedOriginsEnv = env.ALLOWED_ORIGINS;
const allowedOrigins = allowedOriginsEnv 
  ? allowedOriginsEnv.split(',').map(origin => origin.trim())
  : process.env.NODE_ENV === 'production'
    ? ['https://chatterrealm.com']
    : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // Stricter origin validation for all environments
    if (!origin) {
      callback(new Error('Origin header is required'));
      return;
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked request from unauthorized origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST'], // Remove unnecessary methods
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // Cache preflight responses
}));

app.use((req: any, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
});

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024
}));

// Request logging middleware
app.use((req: any, res, next) => {
  const start = Date.now();
  const originalSend = res.send;

  res.send = function(data) {
    try {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
      return originalSend.call(this, data);
    } catch (error) {
      console.error('Error in response logging:', error);
      // Ensure response is still sent
      return originalSend.call(this, data);
    }
  };

  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting with configurable values
const rateLimitWindowMs = env.RATE_LIMIT_WINDOW_MS;
const rateLimitMaxRequests = env.RATE_LIMIT_MAX_REQUESTS;

const apiLimiter = rateLimit({
  windowMs: rateLimitWindowMs,
  max: rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/', (req, res) => {
  const uptime = process.uptime();
  const memUsage = process.memoryUsage();

  res.json({
    status: 'ok',
    message: 'ChatterRealm Backend API',
    version: '1.0.0',
    uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
    memory: {
      used: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
    },
    world: {
      players: gameStateManager.getGameWorld().players.length,
      npcs: gameStateManager.getGameWorld().npcs.length,
      items: gameStateManager.getGameWorld().items.length,
      phase: gameStateManager.getGameWorld().phase
    },
    websocket: {
      connections: webSocketServer.getPlayerCount()
    }
  });
});

// API Routes
app.get('/api/world', (req, res) => {
  try {
    const world = gameStateManager.getGameWorld();
    if (!world) {
      return res.status(404).json({ error: 'Game world not initialized' });
    }
    res.json(world);
  } catch (error) {
    console.error('Error fetching world data:', error);
    res.status(500).json({ error: 'Failed to fetch world data' });
  }
});

app.get('/api/players', (req, res) => {
  try {
    const world = gameStateManager.getGameWorld();
    if (!world) {
      return res.status(404).json({ error: 'Game world not initialized' });
    }
    res.json(world.players || []);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// Global error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Express error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  if (twitchService) {
    twitchService.destroy();
  }
  webSocketServer.shutdown();
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  if (twitchService) {
    twitchService.destroy();
  }
  webSocketServer.shutdown();
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

// Start the server only if this file is run directly
if (require.main === module) {
  httpServer.listen(env.PORT, '0.0.0.0', () => {
    console.log(`🚀 ChatterRealm Backend running on http://localhost:${env.PORT}`);
    console.log(`📊 Game World: ${GAME_CONFIG.gridWidth}x${GAME_CONFIG.gridHeight} grid`);
    console.log(`👥 Max Players: ${GAME_CONFIG.maxPlayers}`);
    console.log(`🎮 Enhanced WebSocket server with continuous game loop active`);
    console.log(`🌍 Full game state management and cataclysm mechanics enabled`);
    console.log(`🔒 CORS enabled for: ${allowedOrigins.join(', ')}`);
    console.log(`⏱️  Rate limit: ${rateLimitMaxRequests} requests per ${rateLimitWindowMs / 60000} minutes`);
  });
}

// Endpoint to fetch emoji SVG (query param: char)
app.get('/api/emoji', async (req, res) => {
  // Enhanced validation with stricter controls
  const SAFE_EMOJI_REGEX = /^[\p{Emoji_Presentation}\p{Emoji}\uFE0F]{1,4}$/u;
  try {
    const q = req.query.char as string | undefined;

    // Input validation
    if (!q || typeof q !== 'string' || q.length > 20) {
      return res.status(400).json({
        error: 'Invalid emoji parameter',
        message: 'Please provide a valid, URL-encoded emoji character via the "char" query parameter.'
      });
    }

    let emoji: string;
    try {
      emoji = decodeURIComponent(q);
      // Additional validation after decoding
      if (!SAFE_EMOJI_REGEX.test(emoji)) {
        throw new Error('Invalid emoji format');
      }
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid emoji encoding or format',
        message: 'The provided emoji is either not a valid emoji or is improperly encoded.'
      });
    }

    const wantRough = String(req.query.rough || '').toLowerCase() === 'true';

    // Validate rough conversion parameters if rough=true
    if (wantRough) {
      const roughness = req.query.roughness !== undefined ? Number(req.query.roughness) : undefined;
      const bowing = req.query.bowing !== undefined ? Number(req.query.bowing) : undefined;
      const seed = req.query.seed !== undefined ? Number(req.query.seed) : undefined;

      if (roughness !== undefined && (isNaN(roughness) || roughness < 0 || roughness > 10)) {
        return res.status(400).json({
          error: 'Invalid parameter: roughness',
          message: 'Roughness must be a number between 0 and 10'
        });
      }

      if (bowing !== undefined && (isNaN(bowing) || bowing < 0 || bowing > 10)) {
        return res.status(400).json({
          error: 'Invalid parameter: bowing',
          message: 'Bowing must be a number between 0 and 10'
        });
      }

      if (seed !== undefined && (isNaN(seed) || seed < 0 || seed > 1000000)) {
        return res.status(400).json({
          error: 'Invalid parameter: seed',
          message: 'Seed must be a number between 0 and 1000000'
        });
      }
    }

    const svg = await emojiService.resolveEmojiSvg(emoji);

    if (!wantRough) {
      res.type('image/svg+xml').send(svg);
      return;
    }

    // Parse conversion options from query params
    const roughness = req.query.roughness !== undefined ? Number(req.query.roughness) : undefined;
    const bowing = req.query.bowing !== undefined ? Number(req.query.bowing) : undefined;
    const seed = req.query.seed !== undefined ? Number(req.query.seed) : undefined;
    const randomize = req.query.randomize !== undefined ? String(req.query.randomize) === 'true' : undefined;
    const pencilFilter = req.query.pencilFilter !== undefined ? String(req.query.pencilFilter) === 'true' : undefined;
    const sketchPatterns = req.query.sketchPatterns !== undefined ? String(req.query.sketchPatterns) === 'true' : undefined;

    const options = {
      roughness,
      bowing,
      seed,
      randomize,
      pencilFilter,
      sketchPatterns
    };

    const roughSvg = await emojiService.convertToRoughSvg(svg, options, emoji);

    res.type('image/svg+xml').send(roughSvg);
  } catch (error) {
    console.error('Unexpected error in /api/emoji:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process emoji request'
    });
  }
});

// Export the app and server for testing purposes
export { app, httpServer };