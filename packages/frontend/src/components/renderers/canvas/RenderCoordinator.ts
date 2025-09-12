import type { Player, Item } from 'shared';
import { TerrainType, AnimationSettings } from 'shared';
import { GAME_CONFIG } from 'shared';
import { drawAnimatedTerrainTile } from '../terrain/TerrainRenderer';
import { drawAnimatedItem } from '../entities/ItemRenderer';
import { drawAnimatedNPC } from '../entities/NPCRenderer';
import { drawAnimatedPlayer } from '../entities/PlayerRenderer';
import { drawEffects } from '../effects/EffectRenderer';
import { drawAnimatedGridLines } from './GridRenderer';
import { Particle } from '../effects/ParticleSystem';

export interface ParticleEmitter {
  (x: number, y: number, color: string, count?: number): void;
}

export const renderGame = (
  rc: any,
  ctx: CanvasRenderingContext2D,
  grid: { type: TerrainType }[][],
  players: Player[],
  npcs: any[],
  items: Item[],
  showGrid: boolean,
  time: number,
  animationSettings: AnimationSettings,
  currentParticles: Particle[],
  addParticlesFn: ParticleEmitter,
  tileSize: number = GAME_CONFIG.tileSize, // Use shared tile size constant as fallback
  nightMode: boolean = false
) => {
  const gridSize = tileSize; // Use the passed tileSize parameter
  const numTilesX = grid[0]?.length || 20;
  const numTilesY = grid.length || 15;

  console.log('renderGame called:', {
    gridLength: grid.length,
    numTilesX,
    numTilesY,
    players: players.length,
    npcs: npcs.length,
    items: items.length,
    tileSize: gridSize
  });

  // Draw animated terrain with time-based effects
  for (let y = 0; y < numTilesY; y++) {
    for (let x = 0; x < numTilesX; x++) {
      const terrain = grid[y]?.[x];
      if (!terrain) continue;
      drawAnimatedTerrainTile(rc, x, y, gridSize, terrain.type, time, animationSettings);
    }
  }

  // Draw animated items with floating effect
  items.forEach(item => {
    if (item.position) {
      drawAnimatedItem(rc, item.position.x, item.position.y, gridSize, item, time);
    }
  });

  // Draw animated NPCs with movement
  npcs.forEach(npc => {
    if (npc.isAlive) {
      drawAnimatedNPC(rc, npc.position.x, npc.position.y, gridSize, time);
    }
  });

  // Draw animated players with special effects
  players.forEach(player => {
    if (player.isAlive) {
      drawAnimatedPlayer(rc, player.position.x, player.position.y, gridSize, player, time, addParticlesFn);
    }
  });

  // Draw animated particles
  drawEffects(ctx, currentParticles);

  // Subtle environmental overlays: moving cloud shadows and light shafts
  // These are intentionally low-cost and low-opacity so they remain atmospheric.
  const renderedWidth = numTilesX * gridSize;
  const renderedHeight = numTilesY * gridSize;

  const drawCloudShadows = () => {
    ctx.save();
    // Soft multiply so shadows darken underlying colors
    ctx.globalCompositeOperation = 'multiply';

    // Parameters tuned for subtlety
    const baseAlpha = 0.06;
    const cloudCount = 3; // few, large clouds

    for (let i = 0; i < cloudCount; i++) {
      const speed = 0.04 + i * 0.01;
      const cx = ((time * speed * 60) % (renderedWidth * 2)) - renderedWidth * 0.5 + i * 120;
      const cy = renderedHeight * (0.2 + (i * 0.15));
      const rx = renderedWidth * (0.6 - i * 0.12);
      const ry = renderedHeight * (0.35 - i * 0.08);

      // Create radial gradient for a soft cloud
      const g = ctx.createRadialGradient(cx, cy, Math.min(10, ry * 0.05), cx, cy, Math.max(rx, ry));
      // center is transparent darker (to allow underlying highlights), edges are slightly darker
      g.addColorStop(0, `rgba(0,0,0,${baseAlpha * 0.25})`);
      g.addColorStop(0.5, `rgba(0,0,0,${baseAlpha * 0.75})`);
      g.addColorStop(1, `rgba(0,0,0,0)`);

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  const drawLightShafts = () => {
    ctx.save();
    // Very subtle additive shafts to emulate sun filtering through foliage
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.06 * (0.6 + 0.4 * Math.sin(time * 0.01));

    // Draw 2 diagonal thin shafts
    for (let i = 0; i < 2; i++) {
      const shaftWidth = renderedWidth * 0.12;
      const pos = (time * 0.02 + i * 0.5) % (renderedWidth + renderedHeight) - (renderedHeight * 0.5);

      // create gradient along the shaft
      const g = ctx.createLinearGradient(-renderedHeight, pos, renderedWidth, pos + renderedHeight);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.45, 'rgba(255,255,230,0.06)');
      g.addColorStop(0.55, 'rgba(255,255,230,0.02)');
      g.addColorStop(1, 'rgba(255,255,255,0)');

      ctx.fillStyle = g;
      // rotate the context slightly to make shafts diagonal
      ctx.translate(0, 0);
      ctx.beginPath();
      ctx.rect(-renderedHeight, pos - shaftWidth / 2, renderedWidth + renderedHeight * 2, shaftWidth);
      ctx.fill();
    }

    ctx.restore();
  };

  // Draw overlays after particles but before grid lines so grid remains crisp
  try {
    drawCloudShadows();
    drawLightShafts();
  } catch (e) {
    // Swallow any drawing errors to avoid interfering with main render loop
    // eslint-disable-next-line no-console
    console.warn('Render overlay error', e);
  }

  // Apply night mode overlay if enabled
  if (nightMode) {
    ctx.save();
    // Use overlay blend mode for better color mixing with purple tint
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(30, 15, 45, 0.8)'; // Dark purple overlay
    ctx.fillRect(0, 0, renderedWidth, renderedHeight);

    // Add a second pass with multiply for deeper darkness
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(25, 20, 35, 0.6)'; // Additional dark purple multiply
    ctx.fillRect(0, 0, renderedWidth, renderedHeight);

    ctx.restore();
  }

  // Draw animated grid lines with subtle pulsing
  if (showGrid) {
    drawAnimatedGridLines(rc, numTilesX, numTilesY, gridSize, time);
  }
};
