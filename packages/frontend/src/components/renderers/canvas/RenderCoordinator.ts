import { Player, Item, TerrainType, AnimationSettings } from 'shared/src/types/game';
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
  addParticlesFn: ParticleEmitter
) => {
  const gridSize = 20;
  const numTilesX = grid[0]?.length || 20;
  const numTilesY = grid.length || 15;

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

  // Draw animated grid lines with subtle pulsing
  if (showGrid) {
    drawAnimatedGridLines(rc, numTilesX, numTilesY, gridSize, time);
  }
};