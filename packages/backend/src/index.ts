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
    res.json(gameStateManager.getGameWorld());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch world data' });
  }
});

app.get('/api/players', (req, res) => {
  try {
    res.json(gameStateManager.getGameWorld().players);
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

  // Try svgmoji if available
  try {
    // Load @svgmoji/noto at runtime only to avoid static TypeScript
    // resolution errors in environments where types aren't available.
    let mod: any = null;
    try {
      // Use eval('require') to avoid static analysis by TypeScript.
      // eslint-disable-next-line no-eval
      const runtimeRequire: any = eval('require');
      mod = runtimeRequire('@svgmoji/noto');
    } catch (e) {
      try {
        // If require failed (e.g., ESM-only), try dynamic import as a last resort
        // wrapped in a try/catch to avoid compile-time module checks.
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        // @ts-ignore
        mod = await (globalThis as any).import?.('@svgmoji/noto');
      } catch (err) {
        mod = null;
      }
    }

    const buildCandidates = (emojiStr: string) => {
      const cps = Array.from(emojiStr).map(c => c.codePointAt(0)!.toString(16).toLowerCase());
      const candidates: string[] = [];
      candidates.push(`u${cps.join('_')}`);
      candidates.push(cps.join('_'));
      if (cps.length > 1) candidates.push(`u${cps[0]}`);
      candidates.push(cps.join('-'));
      const collapsed = cps.filter(cp => cp !== '200d').join('_');
      if (collapsed) candidates.push(`u${collapsed}`);
      return Array.from(new Set(candidates));
    };

    const tryResolveFromModule = (moduleAny: any, emojiStr: string): string | null => {
      const candidates = buildCandidates(emojiStr);
      if (typeof moduleAny.get === 'function') {
        try { const out = moduleAny.get(emojiStr); if (out) return out; } catch {}
      }
      if (typeof moduleAny.toSvg === 'function') {
        try { const out = moduleAny.toSvg(emojiStr); if (out) return out; } catch {}
      }
      const def = moduleAny.default || moduleAny;
      if (def && typeof def === 'object') {
        for (const k of candidates) {
          if (def[k]) return def[k];
        }
      }
      for (const k of candidates) {
        if (moduleAny[k]) return moduleAny[k];
      }
      return null;
    };

    const resolved = tryResolveFromModule(mod, emoji);
    if (resolved) {
      emojiCache.set(cacheKey, { svg: resolved, fetchedAt: Date.now() });
      return resolved;
    }
    if (mod && (mod as any).svgmoji) {
      const nested = tryResolveFromModule((mod as any).svgmoji, emoji);
      if (nested) {
        emojiCache.set(cacheKey, { svg: nested, fetchedAt: Date.now() });
        return nested;
      }
    }

    // If we couldn't resolve via package, fall through to fetch fallback
  } catch (err) {
    // continue to fetch from remote as a fallback
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
    const safeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="100%" height="100%" fill="transparent"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="72">${emoji}</text></svg>`;
    emojiCache.set(cacheKey, { svg: safeSvg, fetchedAt: Date.now() });
    return safeSvg;
  } catch (err) {
    throw new Error(`Failed to resolve emoji SVG (and fallback failed): ${emoji}`);
  }
}

// Endpoint to fetch emoji SVG (query param: char)
app.get('/api/emoji', async (req, res) => {
  try {
    const q = req.query.char as string | undefined;
    if (!q) return res.status(400).json({ error: 'Missing `char` query parameter' });
    const emoji = decodeURIComponent(q);
    const wantRough = String(req.query.rough || '').toLowerCase() === 'true';

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
      const svgElement = svgDoc.documentElement as unknown as SVGSVGElement;

      const container = document.createElement('div');
      // svg2roughjs expects a container target (we'll use SVG output)
      const converter = new Svg2Roughjs(container, OutputType.SVG);
      converter.svg = svgElement;

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

      convertedCache.set(convertedCacheKey, { svg: resultSvg, fetchedAt: Date.now() });

      res.type('image/svg+xml').send(resultSvg);
      return;
    } catch (err) {
      console.error('Server-side rough conversion failed:', err);
      // fall back to raw svg
      res.type('image/svg+xml').send(svg);
      return;
    }
  } catch (error) {
    console.error('Error in /api/emoji:', error);
    res.status(500).json({ error: 'Failed to resolve emoji SVG' });
  }
});
