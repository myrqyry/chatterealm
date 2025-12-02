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
import helmet from 'helmet';
import { body, query, validationResult } from 'express-validator';
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
import { GAME_CONFIG } from '@chatterealm/shared';
import { validateEnv } from './config/env';
import AIProxyService from './services/aiProxyService';
import swaggerUi from 'swagger-ui-express';
import { generateOpenApiSchema } from './api/schemas';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import {
  GameCommandRequestSchema,
  CreatePlayerRequestSchema,
  UpdatePlayerRequestSchema,
  AIProxyRequestSchema
} from './api/schemas';

const app = express();
const env = validateEnv();
const httpServer = createServer(app);

let gameStateManager: GameStateManager;
const emojiService = new EmojiService();
let webSocketServer: WebSocketServer;
const handDrawnBuildingService = new HandDrawnBuildingService();
let twitchService: StreamOptimizedTwitchService | null = null;

// The remaining services are instantiated within GameStateManager or are not used.

// All services are now injected into GameStateManager via its constructor.

// Middleware
// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  }
}));

// CORS Configuration
const allowedOriginsEnv = env.ALLOWED_ORIGINS;
const allowedOrigins = allowedOriginsEnv 
  ? allowedOriginsEnv.split(',').map(origin => origin.trim())
  : process.env.NODE_ENV === 'production'
    ? ['https://chatterrealm.com']
    : ['http://localhost:3000', 'http://localhost:5173'];

// Enhanced CORS with additional security
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, postman, etc.)
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    if (!origin) {
      return callback(new Error('Origin header required'), false);
    }

    // Validate origin format
    try {
      const url = new URL(origin);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`Blocked unauthorized origin: ${origin}`);
        callback(new Error('Origin not allowed'), false);
      }
    } catch (error) {
      callback(new Error('Invalid origin format'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400,
  optionsSuccessStatus: 200
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

// Enhanced async request logging with structured logging
app.use((req: any, res, next) => {
  const start = process.hrtime.bigint();
  req.id = req.id || crypto.randomUUID();

  const originalSend = res.send;
  res.send = function(data) {
    const duration = Number(process.hrtime.bigint() - start) / 1000000; // Convert to ms

    // Async logging to prevent blocking
    setImmediate(() => {
      const logData = {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration.toFixed(2)}ms`,
        requestId: req.id,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      };

      if (duration > 1000) { // Log slow requests
        console.warn('Slow request detected:', logData);
      } else {
        console.log(JSON.stringify(logData));
      }
    });

    return originalSend.call(this, data);
  };

  next();
});

// Memory monitoring middleware
app.use((req, res, next) => {
  const memUsage = process.memoryUsage();
  const memUsedMB = memUsage.heapUsed / 1024 / 1024;

  if (memUsedMB > 500) { // Alert at 500MB
    console.warn(`High memory usage: ${memUsedMB.toFixed(2)}MB`);
  }

  res.setHeader('X-Memory-Usage', `${memUsedMB.toFixed(2)}MB`);
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

// OpenAPI specification endpoint
app.get('/api/openapi.json', (req, res) => {
  try {
    const openApiSpec = generateOpenApiSchema();
    res.json(openApiSpec);
  } catch (error) {
    console.error('Error generating OpenAPI specification:', error);
    res.status(500).json({ error: 'Failed to generate OpenAPI specification' });
  }
});

// Swagger UI endpoint
const swaggerUiOptions = {
  explorer: true,
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { font-size: 2rem; }
  `,
  customSiteTitle: 'ChatterRealm API Documentation',
};

app.use('/api/docs',
  swaggerUi.setup(null, swaggerUiOptions),
  (req, res, next) => {
    try {
      const openApiSpec = generateOpenApiSchema();
      req.swaggerDoc = openApiSpec;
      swaggerUi.setup(req.swaggerDoc, swaggerUiOptions)(req, res, next);
    } catch (error) {
      console.error('Error setting up Swagger UI:', error);
      res.status(500).send('Failed to load API documentation');
    }
  }
);

// Serve the generated OpenAPI JSON file
app.get('/api/spec', (req, res) => {
  try {
    const openApiSpec = generateOpenApiSchema();
    res.json(openApiSpec);
  } catch (error) {
    console.error('Error serving OpenAPI spec:', error);
    res.status(500).json({ error: 'Failed to serve OpenAPI specification' });
  }
});

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
app.post('/api/ai-proxy', AIProxyService.validateRequest, (req, res) => {
  AIProxyService.handleRequest(req, res);
});

app.post('/api/game/command', async (req, res) => {
  try {
    // Validate request body using Zod schema
    const validatedData = GameCommandRequestSchema.parse(req.body);

    // Process the game command
    const result = await gameStateManager.handleGameCommand(
      validatedData.playerId,
      validatedData.command,
      validatedData.args || []
    );

    res.json({
      success: true,
      message: result.message || 'Command executed successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle Zod validation errors
      res.status(400).json({
        error: 'Validation failed',
        details: error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      });
    } else {
      console.error('Error processing game command:', error);
      res.status(500).json({
        error: 'Failed to process game command',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
});

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

// Create new player endpoint with Zod validation
app.post('/api/players', async (req, res) => {
  try {
    // Validate request body using Zod schema
    const validatedData = CreatePlayerRequestSchema.parse(req.body);

    // Create new player
    const newPlayer = await gameStateManager.createPlayer({
      name: validatedData.name,
      emoji: validatedData.emoji,
      characterClass: validatedData.class,
      color: validatedData.color,
      isHandDrawn: validatedData.isHandDrawn || false,
    });

    res.status(201).json({
      success: true,
      data: newPlayer,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle Zod validation errors
      res.status(400).json({
        error: 'Validation failed',
        details: error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      });
    } else {
      console.error('Error creating player:', error);
      res.status(500).json({
        error: 'Failed to create player',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
});

// Get specific player endpoint
app.get('/api/players/:playerId', (req, res) => {
  try {
    const { playerId } = req.params;
    const world = gameStateManager.getGameWorld();

    if (!world) {
      return res.status(404).json({ error: 'Game world not initialized' });
    }

    const player = world.players.find(p => p.id === playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(player);
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({
      error: 'Failed to fetch player',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update player endpoint with Zod validation
app.put('/api/players/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;

    // Validate request body using Zod schema
    const validatedData = UpdatePlayerRequestSchema.parse(req.body);

    // Ensure the player ID matches
    if (validatedData.id && validatedData.id !== playerId) {
      return res.status(400).json({
        error: 'Player ID mismatch',
        message: 'Request body ID does not match URL parameter'
      });
    }

    // Update player
    const updatedPlayer = await gameStateManager.updatePlayer(playerId, {
      name: validatedData.name,
      emoji: validatedData.emoji,
      characterClass: validatedData.class,
      color: validatedData.color,
      isHandDrawn: validatedData.isHandDrawn,
    });

    if (!updatedPlayer) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json({
      success: true,
      data: updatedPlayer,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle Zod validation errors
      res.status(400).json({
        error: 'Validation failed',
        details: error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      });
    } else {
      console.error('Error updating player:', error);
      res.status(500).json({
        error: 'Failed to update player',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
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

// Initialize and start the server
async function startServer() {
  try {
    gameStateManager = await GameStateManager.create();
    // Conditionally instantiate WebSocketServer based on test environment
    if (process.env.NODE_ENV !== 'test') {
      webSocketServer = new WebSocketServer(httpServer, gameStateManager);
    } else {
      webSocketServer = new WebSocketServer(httpServer);
    }

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
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Enhanced emoji endpoint with comprehensive validation
const emojiValidation = [
  query('char')
    .isLength({ min: 1, max: 10 })
    .matches(/^[\p{Emoji_Presentation}\p{Emoji}\uFE0F]{1,4}$/u)
    .withMessage('Invalid emoji character'),
  query('roughness')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Roughness must be between 0 and 10'),
  query('bowing')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Bowing must be between 0 and 10'),
];

app.get('/api/emoji', emojiValidation, async (req: express.Request, res: express.Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  try {
    const emoji = req.query.char as string;
    const wantRough = req.query.rough === 'true';

    const svg = await emojiService.resolveEmojiSvg(emoji);

    if (!wantRough) {
      res.type('image/svg+xml');
      res.set('Cache-Control', 'public, max-age=86400'); // 24 hours
      return res.send(svg);
    }

    const options = {
      roughness: req.query.roughness ? Number(req.query.roughness) : undefined,
      bowing: req.query.bowing ? Number(req.query.bowing) : undefined,
    };

    const roughSvg = await emojiService.convertToRoughSvg(svg, options, emoji);

    res.type('image/svg+xml');
    res.set('Cache-Control', 'public, max-age=3600'); // 1 hour for processed content
    res.send(roughSvg);

  } catch (error: any) {
    console.error(`Emoji processing error for ${req.query.char}:`, error);
    res.status(500).json({
      error: 'Processing failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
    });
  }
});

// Export the app and server for testing purposes
export { app, httpServer };