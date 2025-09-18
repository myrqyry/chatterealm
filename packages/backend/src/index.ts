import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { WebSocketServer } from './services/webSocketServer';
import { GameStateManager } from './services/gameStateManager';
import { GAME_CONFIG } from 'shared';
import { JSDOM } from 'jsdom';
import { Svg2Roughjs, OutputType } from 'svg2roughjs';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

const gameStateManager = new GameStateManager();
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
      players: gameStateManager.getGameWorld().players.length,
      npcs: gameStateManager.getGameWorld().npcs.length,
      items: gameStateManager.getGameWorld().items.length,
      phase: gameStateManager.getGameWorld().phase
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
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
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

// Simple in-memory cache for emoji SVGs (raw fetched)
const emojiCache = new Map<string, { svg: string; fetchedAt: number }>();
// Cache for converted (rough) SVGs keyed by emoji + options
const convertedCache = new Map<string, { svg: string; fetchedAt: number }>();

/**
 * Resolve an emoji to SVG string. Prefer @svgmoji/noto if available, else fetch Noto raw SVG.
 */
async function resolveEmojiSvg(emoji: string): Promise<string> {
  // Check cache first
  const cacheKey = emoji;
  const cached = emojiCache.get(cacheKey);
  if (cached && (Date.now() - cached.fetchedAt) < 1000 * 60 * 60) { // 1h cache
    return cached.svg;
  }

  const codepoints = Array.from(emoji).map(c => c.codePointAt(0)!.toString(16).toLowerCase());
  const filename = `emoji_u${codepoints.join('_')}.svg`;

  // Try @svgmoji/noto CDN URLs
  try {
    const codepoints = Array.from(emoji).map(c => c.codePointAt(0)!.toString(16).padStart(4, '0').toLowerCase());
    const hexCode = codepoints.join('-');
    const cdnUrl = `https://cdn.jsdelivr.net/npm/@svgmoji/noto@latest/svg/${hexCode}.svg`;
    
    console.log(`Backend: Trying CDN URL for ${emoji}: ${cdnUrl}`);
    const response = await fetch(cdnUrl);
    if (response.ok) {
      const svgText = await response.text();
      console.log(`Backend: Successfully fetched emoji ${emoji} from CDN`);
      emojiCache.set(cacheKey, { svg: svgText, fetchedAt: Date.now() });
      return svgText;
    } else {
      console.warn(`Backend: CDN fetch failed for ${emoji}: ${response.status} ${response.statusText}`);
    }
  } catch (cdnError) {
    console.warn('Backend: CDN fetch error:', cdnError);
  }

  // Try fetching raw Noto Emoji SVGs from the GoogleFonts noto-emoji repo
  try {
    // Build a few candidate filenames based on codepoints
    const codepoints = Array.from(emoji).map(c => c.codePointAt(0)!.toString(16).toLowerCase());
    const candidates = [
      `emoji_u${codepoints.join('_')}.svg`,
      `emoji_u${codepoints.join('-')}.svg`,
      `emoji_${codepoints.join('_')}.svg`,
    ];

    for (const candidate of candidates) {
      const url = `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/svg/${candidate}`;
      try {
        const resp = await fetch(url);
        if (resp.ok) {
          const svgText = await resp.text();
          emojiCache.set(cacheKey, { svg: svgText, fetchedAt: Date.now() });
          return svgText;
        }
      } catch (e) {
        // try next candidate
      }
    }
  } catch (err) {
    // network fetch failed or not available; continue to fallback
  }

  // Last-resort fallback: return a minimal SVG that renders the emoji character as text.
  // This guarantees the API never fails and provides a visible avatar.
  try {
    console.log(`All fetch methods failed for ${emoji}, using fallback SVG`);
    const safeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="100%" height="100%" fill="transparent"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="72">${emoji}</text></svg>`;
    emojiCache.set(cacheKey, { svg: safeSvg, fetchedAt: Date.now() });
    return safeSvg;
  } catch (err) {
    console.error(`Failed to create fallback SVG for ${emoji}:`, err);
    // Emergency fallback
    const emergencyFallback = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="100%" height="100%" fill="transparent"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="72">❓</text></svg>`;
    emojiCache.set(cacheKey, { svg: emergencyFallback, fetchedAt: Date.now() });
    return emergencyFallback;
  }
}

// Endpoint to fetch emoji SVG (query param: char)
app.get('/api/emoji', async (req, res) => {
  try {
    const q = req.query.char as string | undefined;

    // Input validation
    if (!q) {
      return res.status(400).json({
        error: 'Missing required parameter: char',
        message: 'Please provide an emoji character via the "char" query parameter'
      });
    }

    if (typeof q !== 'string' || q.length === 0) {
      return res.status(400).json({
        error: 'Invalid parameter: char',
        message: 'The "char" parameter must be a non-empty string'
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

    const svg = await resolveEmojiSvg(emoji);

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

    const optKey = JSON.stringify(options);
    const convertedCacheKey = `${emoji}::${optKey}`;
    const cachedConverted = convertedCache.get(convertedCacheKey);
    if (cachedConverted && (Date.now() - cachedConverted.fetchedAt) < 1000 * 60 * 60) {
      res.type('image/svg+xml').send(cachedConverted.svg);
      return;
    }

    // Convert to rough SVG on the server using jsdom + svg2roughjs
    try {
      const dom = new JSDOM(`<!doctype html><html><body></body></html>`);
      // Provide necessary globals for svg2roughjs which expects browser-like globals
      (global as any).window = dom.window;
      (global as any).document = dom.window.document;
      (global as any).DOMParser = dom.window.DOMParser;
      (global as any).XMLSerializer = dom.window.XMLSerializer;
      (global as any).SVGElement = (dom.window as any).SVGElement;
      (global as any).SVGSVGElement = (dom.window as any).SVGSVGElement;

      const document = dom.window.document as unknown as Document;
      const parser = new dom.window.DOMParser();
      const svgDoc = parser.parseFromString(svg, 'image/svg+xml');

      if (!svgDoc || svgDoc.getElementsByTagName('parsererror').length > 0) {
        console.error('Failed to parse SVG document');
        res.type('image/svg+xml').send(svg); // fallback to original
        return;
      }

      const svgElement = svgDoc.documentElement as unknown as SVGSVGElement;

      const container = document.createElement('div');
      // svg2roughjs expects a container target (we'll use SVG output)
      // Try to create converter, but if it fails, just return original SVG
      let converter: any;
      try {
        const Svg2Roughjs = require('svg2roughjs').Svg2Roughjs || require('svg2roughjs').default;
        if (!Svg2Roughjs) {
          throw new Error('Svg2Roughjs not found in library');
        }
        converter = new Svg2Roughjs(container);
        converter.svg = svgElement;
      } catch (converterError) {
        console.warn('SVG converter initialization failed, using original SVG:', (converterError as Error).message);
        res.type('image/svg+xml').send(svg);
        return;
      }

      // Apply options if provided
      if (roughness !== undefined) converter.roughConfig.roughness = roughness as any;
      if (bowing !== undefined) converter.roughConfig.bowing = bowing as any;
      if (seed !== undefined) converter.seed = seed as any;
      if (randomize !== undefined) converter.randomize = randomize as any;
      if (pencilFilter !== undefined) converter.pencilFilter = pencilFilter as any;
      if (sketchPatterns !== undefined) converter.sketchPatterns = sketchPatterns as any;

      const result = await converter.sketch();
      let resultSvg = '';
      if (result && result instanceof dom.window.SVGSVGElement) {
        resultSvg = new dom.window.XMLSerializer().serializeToString(result);
      } else if (container.innerHTML) {
        resultSvg = container.innerHTML;
      }

      if (!resultSvg) {
        console.warn('SVG conversion produced no output, using original SVG');
        res.type('image/svg+xml').send(svg);
        return;
      }

      convertedCache.set(convertedCacheKey, { svg: resultSvg, fetchedAt: Date.now() });

      res.type('image/svg+xml').send(resultSvg);
      return;
    } catch (conversionError) {
      console.error('Server-side rough conversion failed:', conversionError);
      // fall back to raw svg
      res.type('image/svg+xml').send(svg);
      return;
    }
  } catch (error) {
    console.error('Unexpected error in /api/emoji:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process emoji request'
    });
  }
});
