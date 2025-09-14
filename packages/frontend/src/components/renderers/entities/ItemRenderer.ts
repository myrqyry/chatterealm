import type { Item } from 'shared';

export const drawAnimatedItem = (rc: any, x: number, y: number, gridSize: number, item: Item, time: number, seed?: number) => {
  const centerX = x * gridSize + gridSize / 2;
  const centerY = y * gridSize + gridSize / 2;
  const finalSeed = seed || 1;

  // Floating animation
  const floatOffset = Math.sin(time * 0.015 + x + y) * 2; // Much slower, gentler float

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
  rc.circle(centerX, centerY + floatOffset, 12, { // Larger glow
    fill: color,
    fillStyle: 'solid',
    stroke: '#FFF',
    strokeWidth: 7, // Thicker stroke
    roughness: 1.5,
    seed: finalSeed + x + y * 100
  });

  // Inner item shape with rotation
  const rotation = time * 0.01 + x + y; // Slower rotation
  const ctx = (rc as any).ctx;
  if (ctx) {
    ctx.save();
    ctx.translate(centerX, centerY + floatOffset);
    ctx.rotate(rotation);

    // Draw different shapes based on item type
    if (item.type === 'weapon') {
      // Sword shape
      rc.rectangle(-3, -8, 6, 12, { // Larger sword
        fill: '#C0C0C0',
        fillStyle: 'solid',
        stroke: '#808080',
        strokeWidth: 4, // Thicker
        seed: finalSeed + x + y * 100 + 1
      });
    } else if (item.type === 'consumable') {
      // Potion bottle
      rc.rectangle(-3, -6, 6, 9, { // Larger potion
        fill: color,
        fillStyle: 'solid',
        stroke: '#000',
        strokeWidth: 4, // Thicker
        seed: finalSeed + x + y * 100 + 2
      });
      // Cork
      rc.rectangle(-2, -9, 4, 3, { // Larger cork
        fill: '#8B4513',
        fillStyle: 'solid',
        seed: finalSeed + x + y * 100 + 3
      });
    } else {
      // Generic item
      rc.circle(0, 0, 5, { // Larger generic item
        fill: color,
        fillStyle: 'solid',
        stroke: '#000',
        strokeWidth: 4, // Thicker
        seed: finalSeed + x + y * 100 + 4
      });
    }

    ctx.restore();
  }

  // Sparkle effects for rare items
  if (item.rarity === 'legendary' || item.rarity === 'epic') {
    for (let s = 0; s < 3; s++) {
      const sparkleX = centerX + Math.sin(time * 0.025 + s * 2) * 6; // Much slower, gentler orbit
      const sparkleY = centerY + floatOffset + Math.cos(time * 0.05 + s * 2) * 8;
      rc.circle(sparkleX, sparkleY, 2, { // Larger sparkles
        fill: '#FFD700',
        fillStyle: 'solid',
        seed: finalSeed + x + y * 100 + 10 + s
      });
    }
  }
};