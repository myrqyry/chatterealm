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
import cors from 'cors';
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
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 8081;

const gameStateManager = new GameStateManager();
const emojiService = new EmojiService();
const webSocketServer = new WebSocketServer(httpServer);
const handDrawnBuildingService = new HandDrawnBuildingService();

// Lower-level services instantiated and wired for compatibility
const playerMovementService = new PlayerMovementService(gameStateManager.getGameWorld());
const combatService = new CombatService();

// Conditionally instantiate the Twitch service
let twitchService: StreamOptimizedTwitchService | null = null;
const twitchClientId = process.env.TWITCH_CLIENT_ID;
const twitchClientSecret = process.env.TWITCH_CLIENT_SECRET;
const twitchChannelName = process.env.TWITCH_CHANNEL_NAME;

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

// Instantiate remaining services
// Services
const streamCommentaryService = new StreamCommentaryService();
const autoWanderService = new AutoWanderService(gameStateManager);
const lootService = new LootService(gameStateManager);

// Wire cross-service references back into the GameStateManager so older APIs still work
gameStateManager.setServices({
  playerMovementService,
  combatService,
  lootService,
});

// Middleware
// CORS Configuration
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
const allowedOrigins = allowedOriginsEnv 
  ? allowedOriginsEnv.split(',').map(origin => origin.trim())
  : process.env.NODE_ENV === 'production'
    ? ['https://chatterrealm.com']
    : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl, etc.)
    if (!origin) {
      // In production, be more strict
      if (process.env.NODE_ENV === 'production') {
        callback(new Error('Origin header is required in production'));
      } else {
        callback(null, true);
      }
      return;
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;

  res.send = function(data) {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    return originalSend.call(this, data);
  };

  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting with configurable values
const rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 minutes default
const rateLimitMaxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10); // 100 requests default

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
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ChatterRealm Backend running on http://localhost:${PORT}`);
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
  const EMOJI_REGEX = /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+$/u;
  try {
    const q = req.query.char as string | undefined;

    // Input validation
    if (!q || typeof q !== 'string' || q.length === 0) {
      return res.status(400).json({
        error: 'Missing required parameter: char',
        message: 'Please provide an emoji character via the "char" query parameter'
      });
    }

    let emoji: string;
    try {
      emoji = decodeURIComponent(q);
    } catch (decodeError) {
      return res.status(400).json({
        error: 'Invalid parameter: char',
        message: 'The "char" parameter contains invalid URL encoding'
      });
    }

    if (!EMOJI_REGEX.test(emoji)) {
      return res.status(400).json({
        error: 'Invalid emoji character',
        message: 'Only valid Unicode emoji characters are allowed'
      });
    }

    // Validate emoji is a single character or valid emoji sequence
    if (emoji.length > 10) {
      return res.status(400).json({
        error: 'Invalid parameter: char',
        message: 'Emoji character is too long (max 10 characters)'
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