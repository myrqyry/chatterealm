import type { Item } from 'shared/src/types/game';

export const drawAnimatedItem = (rc: any, x: number, y: number, gridSize: number, item: Item, time: number) => {
  const centerX = x * gridSize + gridSize / 2;
  const centerY = y * gridSize + gridSize / 2;

  // Floating animation
  const floatOffset = Math.sin(time * 0.05 + x + y) * 2;

  // Draw item as a floating animated shape
  const rarityColors = {
    common: '#9CA3AF',
    uncommon: '#10B981',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B'
  };

  const color = rarityColors[item.rarity as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'] || '#9CA3AF';

  // Animated glow effect
  rc.circle(centerX, centerY + floatOffset, 8, {
    fill: color,
    fillStyle: 'solid',
    stroke: '#FFF',
    strokeWidth: 2,
    roughness: 1.5
  });

  // Inner item shape with rotation
  const rotation = time * 0.02 + x + y;
  const ctx = (rc as any).ctx;
  if (ctx) {
    ctx.save();
    ctx.translate(centerX, centerY + floatOffset);
    ctx.rotate(rotation);

    // Draw different shapes based on item type
    if (item.type === 'weapon') {
      // Sword shape
      rc.rectangle(-2, -6, 4, 8, {
        fill: '#C0C0C0',
        fillStyle: 'solid',
        stroke: '#808080',
        strokeWidth: 1
      });
    } else if (item.type === 'consumable') {
      // Potion bottle
      rc.rectangle(-2, -4, 4, 6, {
        fill: color,
        fillStyle: 'solid',
        stroke: '#000',
        strokeWidth: 1
      });
      // Cork
      rc.rectangle(-1, -6, 2, 2, {
        fill: '#8B4513',
        fillStyle: 'solid'
      });
    } else {
      // Generic item
      rc.circle(0, 0, 3, {
        fill: color,
        fillStyle: 'solid',
        stroke: '#000',
        strokeWidth: 1
      });
    }

    ctx.restore();
  }

  // Sparkle effects for rare items
  if (item.rarity === 'legendary' || item.rarity === 'epic') {
    for (let s = 0; s < 3; s++) {
      const sparkleX = centerX + Math.sin(time * 0.1 + s * 2) * 6;
      const sparkleY = centerY + floatOffset + Math.cos(time * 0.1 + s * 2) * 6;
      rc.circle(sparkleX, sparkleY, 1, {
        fill: '#FFD700',
        fillStyle: 'solid'
      });
    }
  }
};