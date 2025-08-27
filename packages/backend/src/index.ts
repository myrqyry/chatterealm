import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { WebSocketServer } from './services/webSocketServer';
import { GameStateManager } from './services/gameStateManager';
import { GameWorld, TerrainType } from 'shared/src/types/game';
import { GAME_CONFIG } from 'shared/src/constants/gameConstants';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Initialize game world and state manager
const gameWorld: GameWorld = {
  id: 'main_world',
  grid: [],
  players: [],
  npcs: [],
  items: [],
  cataclysmCircle: {
    center: { x: Math.floor(GAME_CONFIG.gridWidth / 2), y: Math.floor(GAME_CONFIG.gridHeight / 2) },
    radius: Math.max(GAME_CONFIG.gridWidth, GAME_CONFIG.gridHeight),
    isActive: false,
    shrinkRate: 1,
    nextShrinkTime: 0
  },
  worldAge: 0,
  lastResetTime: Date.now(),
  phase: 'exploration'
};

// Initialize terrain grid
for (let y = 0; y < GAME_CONFIG.gridHeight; y++) {
  gameWorld.grid[y] = [];
  for (let x = 0; x < GAME_CONFIG.gridWidth; x++) {
    // Simple terrain generation - mostly grass with some forests and mountains
    let terrainType = TerrainType.PLAIN;
    const rand = Math.random();

    if (rand < 0.1) {
      terrainType = TerrainType.FOREST;
    } else if (rand < 0.15) {
      terrainType = TerrainType.MOUNTAIN;
    }

    gameWorld.grid[y][x] = {
      type: terrainType,
      position: { x, y },
      movementCost: terrainType === TerrainType.MOUNTAIN ? 2 : 1,
      defenseBonus: terrainType === TerrainType.FOREST ? 1 : 0,
      visibilityModifier: terrainType === TerrainType.FOREST ? 0.8 : 1
    };
  }
}

const gameStateManager = new GameStateManager(gameWorld);
const webSocketServer = new WebSocketServer(httpServer, gameStateManager);

// Middleware
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Chat Grid Chronicles Backend API',
    version: '1.0.0',
    world: {
      players: gameWorld.players.length,
      npcs: gameWorld.npcs.length,
      items: gameWorld.items.length,
      phase: gameWorld.phase
    }
  });
});

// API Routes
app.get('/api/world', (req, res) => {
  try {
    res.json(gameWorld);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch world data' });
  }
});

app.get('/api/players', (req, res) => {
  try {
    res.json(gameWorld.players);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  webSocketServer.shutdown();
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  webSocketServer.shutdown();
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Chat Grid Chronicles Backend running on http://localhost:${PORT}`);
  console.log(`📊 Game World: ${GAME_CONFIG.gridWidth}x${GAME_CONFIG.gridHeight} grid`);
  console.log(`👥 Max Players: ${GAME_CONFIG.maxPlayers}`);
  console.log(`🎮 Enhanced WebSocket server with continuous game loop active`);
  console.log(`🌍 Full game state management and cataclysm mechanics enabled`);
});
