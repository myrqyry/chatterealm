import type { Building } from 'shared';
import { assetConverter } from '../../../services/assetConverter';

// Cache for building emoji SVGs
const buildingEmojiCache = new Map<string, { svg: string; lastUsed: number }>();

// Render a building with animated emoji
export const drawAnimatedBuilding = async (rc: any, x: number, y: number, gridSize: number, building: Building, time: number, seed?: number) => {
  const centerX = x * gridSize + gridSize / 2;
  const centerY = y * gridSize + gridSize / 2;
  const ctx = (rc as any).ctx;

  // Priority 1: Use pre-generated roughSvg if available
  if (building.roughSvg) {
    try {
      const converted = await assetConverter.convertSvgToCanvas(building.roughSvg, {
        roughness: 1.0 + Math.sin(time * 0.02) * 0.2,
        bowing: 1.3 + Math.sin(time * 0.03) * 0.3,
        randomize: true,
        seed: seed || Math.floor(time * 1000) % 1000
      });

      if (converted.canvas) {
        const scaleX = (building.size.width * gridSize) / 32;
        const scaleY = (building.size.height * gridSize) / 32;
        const scale = Math.min(scaleX, scaleY) * 0.8;

        const svgX = centerX - (32 * scale) / 2;
        const svgY = centerY - (32 * scale) / 2;

        ctx.save();
        ctx.drawImage(converted.canvas, svgX, svgY, 32 * scale, 32 * scale);
        ctx.restore();
      }
    } catch (error) {
      console.warn('Failed to render pre-generated building SVG:', error);
      drawFallbackBuilding(rc, centerX, centerY, gridSize, building, time);
    }
  } else if (building.emoji) { // Priority 2: Fallback to emoji rendering
    try {
      // Check cache first
      const cacheKey = building.emoji;
      let emojiSvg = buildingEmojiCache.get(cacheKey);

      // If not in cache or older than 5 minutes, fetch it
      if (!emojiSvg || (Date.now() - emojiSvg.lastUsed) > 300000) {
        const fetchedSvg = await assetConverter.fetchEmojiSvg(building.emoji, 'svgmoji', {
          rough: true,
          preset: 'sketch',
          options: {
            roughness: 1.0 + Math.sin(time * 0.02) * 0.2, // Animate roughness
            bowing: 1.3 + Math.sin(time * 0.03) * 0.3,   // Animate bowing
            randomize: true,
            seed: seed || Math.floor(time * 1000) % 1000
          }
        });
        emojiSvg = { svg: fetchedSvg, lastUsed: Date.now() };
        buildingEmojiCache.set(cacheKey, emojiSvg);
      }

      if (emojiSvg.svg) {
        // Convert SVG to rough.js canvas and draw it
        const converted = await assetConverter.convertSvgToCanvas(emojiSvg.svg, {
          roughness: 1.0 + Math.sin(time * 0.02) * 0.2,
          bowing: 1.3 + Math.sin(time * 0.03) * 0.3,
          randomize: true,
          seed: seed || Math.floor(time * 1000) % 1000
        });

        if (converted.canvas) {
          // Scale based on building size
          const scaleX = (building.size.width * gridSize) / 32;
          const scaleY = (building.size.height * gridSize) / 32;
          const scale = Math.min(scaleX, scaleY) * 0.8; // Slightly smaller to fit

          const emojiX = centerX - (32 * scale) / 2;
          const emojiY = centerY - (32 * scale) / 2;

          // Draw the rough canvas onto the main canvas
          ctx.save();
          ctx.drawImage(converted.canvas, emojiX, emojiY, 32 * scale, 32 * scale);
          ctx.restore();
        }
      }
    } catch (error) {
      console.warn('Failed to render building emoji:', error);
      // Fall back to simple rendering
      drawFallbackBuilding(rc, centerX, centerY, gridSize, building, time);
    }
  } else {
    // Fallback rendering
    drawFallbackBuilding(rc, centerX, centerY, gridSize, building, time);
  }

  // Draw building name if it's a large building
  if (building.size.width > 1 || building.size.height > 1) {
    if (ctx) {
      ctx.fillStyle = '#000';
      ctx.font = 'bold 8px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(building.name, centerX + 1, centerY - building.size.height * gridSize / 2 - 5);

      ctx.fillStyle = '#FFF';
      ctx.fillText(building.name, centerX, centerY - building.size.height * gridSize / 2 - 6);
    }
  }
};

// Fallback rendering for buildings when emoji fails
const drawFallbackBuilding = (rc: any, centerX: number, centerY: number, gridSize: number, building: Building, time: number) => {
  const width = building.size.width * gridSize;
  const height = building.size.height * gridSize;
  const x = centerX - width / 2;
  const y = centerY - height / 2;

  // Building base with animated roughness
  const animatedRoughness = 1.2 + Math.sin(time * 0.01) * 0.3;
  rc.rectangle(x, y, width, height, {
    fill: '#8B4513',
    fillStyle: 'solid',
    stroke: '#654321',
    strokeWidth: 2,
    roughness: animatedRoughness
  });

  // Building details based on type
  switch (building.type) {
    case 'house':
      // Simple house with door
      rc.rectangle(x + width * 0.4, y + height * 0.6, width * 0.2, height * 0.4, {
        fill: '#654321',
        fillStyle: 'solid',
        roughness: animatedRoughness * 0.8
      });
      break;

    case 'castle':
      // Castle with towers
      rc.rectangle(x + width * 0.1, y, width * 0.15, height * 0.8, {
        fill: '#696969',
        fillStyle: 'solid',
        roughness: animatedRoughness
      });
      rc.rectangle(x + width * 0.75, y, width * 0.15, height * 0.8, {
        fill: '#696969',
        fillStyle: 'solid',
        roughness: animatedRoughness
      });
      break;

    case 'tower':
      // Tall tower
      rc.rectangle(x + width * 0.3, y, width * 0.4, height, {
        fill: '#708090',
        fillStyle: 'solid',
        roughness: animatedRoughness
      });
      break;

    case 'shop':
      // Shop with sign
      rc.rectangle(x + width * 0.3, y + height * 0.2, width * 0.4, height * 0.3, {
        fill: '#FFF',
        fillStyle: 'solid',
        roughness: animatedRoughness * 0.7
      });
      break;

    case 'tavern':
      // Tavern with windows
      for (let i = 0; i < 2; i++) {
        rc.rectangle(x + width * (0.2 + i * 0.3), y + height * 0.3, width * 0.15, height * 0.2, {
          fill: '#FFD700',
          fillStyle: 'solid',
          roughness: animatedRoughness * 0.6
        });
      }
      break;

    case 'temple':
      // Temple with pillars
      for (let i = 0; i < 3; i++) {
        rc.rectangle(x + width * (0.15 + i * 0.25), y + height * 0.2, width * 0.08, height * 0.6, {
          fill: '#F5F5DC',
          fillStyle: 'solid',
          roughness: animatedRoughness
        });
      }
      break;

    default:
      // Generic building
      rc.rectangle(x + width * 0.1, y + height * 0.1, width * 0.8, height * 0.8, {
        fill: '#D2B48C',
        fillStyle: 'solid',
        roughness: animatedRoughness
      });
  }
};