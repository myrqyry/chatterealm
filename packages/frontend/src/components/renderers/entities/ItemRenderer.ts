import type { Item } from 'shared';

// Optional `seed` parameter is accepted for deterministic/randomized effects
// (kept optional so existing callers without a seed continue to work).
export const drawAnimatedItem = (rc: any, x: number, y: number, gridSize: number, item: Item, time: number, seed?: number) => {
  const centerX = x * gridSize + gridSize / 2;
  const centerY = y * gridSize + gridSize / 2;

  // Floating animation
  const floatOffset = Math.sin(time * 0.015 + x + y) * 2; // Much slower, gentler float

  // Tarkov-style looting visual states
  if (item.isHidden) {
    // Hidden item - show as mysterious obscured shape
    drawHiddenItem(rc, centerX, centerY + floatOffset, time);
    return;
  }

  if (item.revealProgress < 1.0) {
    // Revealing item - show progress indicator
    drawRevealingItem(rc, centerX, centerY + floatOffset, item, time);
    return;
  }

  // Fully revealed item
  drawRevealedItem(rc, centerX, centerY + floatOffset, item, time, gridSize);
};

const drawHiddenItem = (rc: any, centerX: number, centerY: number, time: number) => {
  // Mysterious obscured shape with pulsing effect
  const pulseScale = 1 + Math.sin(time * 0.02) * 0.1;

  // Outer mystery glow
  rc.circle(centerX, centerY, 15 * pulseScale, {
    fill: '#666666',
    fillStyle: 'solid',
    stroke: '#999999',
    strokeWidth: 2,
    roughness: 2.0
  });

  // Question mark or mystery symbol
  const ctx = (rc as any).ctx;
  if (ctx) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(time * 0.005); // Slow rotation

    // Draw a question mark shape
    rc.circle(0, -3, 3, {
      fill: '#FFFFFF',
      fillStyle: 'solid',
      stroke: '#666666',
      strokeWidth: 2
    });

    // Question mark dot
    rc.circle(0, 5, 1, {
      fill: '#FFFFFF',
      fillStyle: 'solid'
    });

    ctx.restore();
  }
};

const drawRevealingItem = (rc: any, centerX: number, centerY: number, item: Item, time: number) => {
  // Show item with reveal progress
  const progress = item.revealProgress;

  // Background reveal circle
  rc.circle(centerX, centerY, 18, {
    fill: '#333333',
    fillStyle: 'solid',
    stroke: '#666666',
    strokeWidth: 2
  });

  // Progress arc
  const ctx = (rc as any).ctx;
  if (ctx) {
    ctx.save();
    ctx.translate(centerX, centerY);

    // Draw progress arc
    ctx.beginPath();
    ctx.arc(0, 0, 16, -Math.PI / 2, -Math.PI / 2 + (progress * 2 * Math.PI));
    ctx.lineWidth = 3;
    ctx.strokeStyle = getRarityColor(item.rarity);
    ctx.stroke();

    ctx.restore();
  }

  // Partially revealed item (scaled by progress)
  const scale = 0.3 + (progress * 0.7); // Start small, grow as revealed
  if (ctx) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);

    drawItemShape(rc, 0, 0, item, time);

    ctx.restore();
  }

  // Progress text
  if (ctx) {
    ctx.save();
    ctx.translate(centerX, centerY + 25);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(progress * 100)}%`, 0, 0);
    ctx.restore();
  }
};

const drawRevealedItem = (rc: any, centerX: number, centerY: number, item: Item, time: number, gridSize: number) => {
  const rarityColors = {
    common: '#9CA3AF',
    uncommon: '#10B981',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B'
  };

  const color = rarityColors[item.rarity as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'] || '#9CA3AF';

  // Lootable indicator (green glow if can be looted)
  if (item.canBeLooted) {
    rc.circle(centerX, centerY, 14, {
      fill: '#00FF00',
      fillStyle: 'solid',
      stroke: '#FFFFFF',
      strokeWidth: 2,
      roughness: 1.0
    });
  }

  // Animated glow effect
  rc.circle(centerX, centerY, 12, {
    fill: color,
    fillStyle: 'solid',
    stroke: '#FFF',
    strokeWidth: 7,
    roughness: 1.5
  });

  // Inner item shape
  drawItemShape(rc, centerX, centerY, item, time);

  // Sparkle effects for rare items
  if (item.rarity === 'legendary' || item.rarity === 'epic') {
    for (let s = 0; s < 3; s++) {
      const sparkleX = centerX + Math.sin(time * 0.025 + s * 2) * 6;
      const sparkleY = centerY + Math.cos(time * 0.05 + s * 2) * 8;
      rc.circle(sparkleX, sparkleY, 2, {
        fill: '#FFD700',
        fillStyle: 'solid'
      });
    }
  }
};

const drawItemShape = (rc: any, centerX: number, centerY: number, item: Item, time: number) => {
  const rotation = time * 0.01; // Slower rotation
  const ctx = (rc as any).ctx;
  if (ctx) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);

    const color = getRarityColor(item.rarity);

    // Draw different shapes based on item type
    if (item.type === 'weapon') {
      // Sword shape
      rc.rectangle(-3, -8, 6, 12, {
        fill: '#C0C0C0',
        fillStyle: 'solid',
        stroke: '#808080',
        strokeWidth: 4
      });
    } else if (item.type === 'consumable') {
      // Potion bottle
      rc.rectangle(-3, -6, 6, 9, {
        fill: color,
        fillStyle: 'solid',
        stroke: '#000',
        strokeWidth: 4
      });
      // Cork
      rc.rectangle(-2, -9, 4, 3, {
        fill: '#8B4513',
        fillStyle: 'solid'
      });
    } else {
      // Generic item
      rc.circle(0, 0, 5, {
        fill: color,
        fillStyle: 'solid',
        stroke: '#000',
        strokeWidth: 4
      });
    }

    ctx.restore();
  }
};

const getRarityColor = (rarity: string): string => {
  const colors = {
    common: '#9CA3AF',
    uncommon: '#10B981',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B'
  };
  return colors[rarity as keyof typeof colors] || '#9CA3AF';
};