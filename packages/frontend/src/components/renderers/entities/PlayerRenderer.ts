import type { Player } from 'shared';

interface ParticleEmitter {
  (x: number, y: number, color: string, count?: number): void;
}

export const drawAnimatedPlayer = (rc: any, x: number, y: number, gridSize: number, player: Player, time: number, addParticles: ParticleEmitter) => {
  const centerX = x * gridSize + gridSize / 2;
  const centerY = y * gridSize + gridSize / 2;
  const ctx = (rc as any).ctx;

  // Class-specific colors and effects
  const classData = {
    knight: { color: '#FFD700', secondary: '#B8860B', particleColor: '#FFD700' },
    rogue: { color: '#8B0000', secondary: '#DC143C', particleColor: '#FF4500' },
    mage: { color: '#4B0082', secondary: '#8A2BE2', particleColor: '#9370DB' }
  };

  const currentClass = classData[player.class as keyof typeof classData] || classData.knight;

  // Magical aura for all players
  const auraRadius = 18 + Math.sin(time * 0.08) * 2;
  rc.circle(centerX, centerY, auraRadius, {
    fill: currentClass.color,
    fillStyle: 'solid',
    stroke: currentClass.secondary,
    strokeWidth: 2,
    roughness: 2
  });

  // Main player body with subtle pulsing
  const pulseScale = 1 + Math.sin(time * 0.1) * 0.05;
  rc.circle(centerX, centerY, 10 * pulseScale, {
    fill: currentClass.color,
    fillStyle: 'solid',
    stroke: '#FFF',
    strokeWidth: 4,
    roughness: 1
  });

  // Class-specific visual effects
  if (player.class === 'knight') {
    // Knight: Shield effect
    rc.rectangle(centerX - 8, centerY - 8, 4, 12, {
      fill: '#C0C0C0',
      fillStyle: 'solid',
      stroke: '#808080',
      strokeWidth: 2,
      roughness: 1
    });
    // Cross on shield
    rc.line(centerX - 6, centerY - 6, centerX - 6, centerY + 6, {
      stroke: '#FFD700',
      strokeWidth: 4
    });
    rc.line(centerX - 8, centerY, centerX - 4, centerY, {
      stroke: '#FFD700',
      strokeWidth: 4
    });
  } else if (player.class === 'rogue') {
    // Rogue: Daggers/stealth effect
    for (let d = 0; d < 2; d++) {
      const daggerX = centerX + (d === 0 ? -6 : 6);
      const daggerY = centerY - 2;
      rc.polygon([
        [daggerX - 1, daggerY - 4],
        [daggerX + 1, daggerY - 4],
        [daggerX, daggerY + 2]
      ], {
        fill: '#C0C0C0',
        fillStyle: 'solid',
        stroke: '#808080',
        strokeWidth: 2
      });
    }
  } else if (player.class === 'mage') {
    // Mage: Magical runes
    const runeOffset = Math.sin(time * 0.05) * 3;
    for (let r = 0; r < 3; r++) {
      const angle = (r * Math.PI * 2) / 3;
      const runeX = centerX + Math.cos(angle) * (12 + runeOffset);
      const runeY = centerY + Math.sin(angle) * (12 + runeOffset);
      rc.circle(runeX, runeY, 2, {
        fill: '#9370DB',
        fillStyle: 'solid',
        stroke: '#8A2BE2',
        strokeWidth: 2
      });
    }
  }

  // Health bar above player
  const healthPercent = player.stats.hp / player.stats.maxHp;
  const barWidth = 20;
  const barHeight = 3;

  // Background
  rc.rectangle(centerX - barWidth/2, centerY - 25, barWidth, barHeight, {
    fill: '#8B0000',
    fillStyle: 'solid',
    roughness: 0.5
  });

  // Health fill
  rc.rectangle(centerX - barWidth/2, centerY - 25, barWidth * healthPercent, barHeight, {
    fill: healthPercent > 0.6 ? '#32CD32' : healthPercent > 0.3 ? '#FFD700' : '#DC143C',
    fillStyle: 'solid',
    roughness: 0.5
  });

  // Player name with shadow effect
  if (ctx) {
    ctx.fillStyle = '#000';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(player.displayName, centerX + 1, centerY - 32);

    ctx.fillStyle = '#FFF';
    ctx.fillText(player.displayName, centerX, centerY - 33);
  }

  // Class indicator
  if (ctx && player.class) {
    ctx.fillStyle = currentClass.secondary;
    ctx.font = '8px Arial';
    ctx.fillText(player.class.toUpperCase(), centerX, centerY + 27);
  }

  // Occasional particle effects for active players
  if (Math.random() < 0.02) {
    addParticles(centerX, centerY, currentClass.particleColor, 3);
  }
};