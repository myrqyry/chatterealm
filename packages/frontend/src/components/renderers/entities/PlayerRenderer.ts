import type { Player } from 'shared';

interface ParticleEmitter {
  (x: number, y: number, color: string, count?: number): void;
}

export const drawAnimatedPlayer = (rc: any, x: number, y: number, gridSize: number, player: Player, time: number, addParticles: ParticleEmitter, seed?: number) => {
  const centerX = x * gridSize + gridSize / 2;
  const centerY = y * gridSize + gridSize / 2;
  const ctx = (rc as any).ctx;
  const finalSeed = seed || 1;

  // Class-specific colors and effects
  const classData = {
    knight: { color: '#FFD700', secondary: '#B8860B', particleColor: '#FFD700' },
    rogue: { color: '#8B0000', secondary: '#DC143C', particleColor: '#FF4500' },
    mage: { color: '#4B0082', secondary: '#8A2BE2', particleColor: '#9370DB' }
  };

  const currentClass = classData[player.class as keyof typeof classData] || classData.knight;

  // Magical aura for all players
  const auraRadius = 24 + Math.sin(time * 0.02) * 2; // Much slower, gentler aura pulsing
  rc.circle(centerX, centerY, auraRadius, {
    fill: currentClass.color,
    fillStyle: 'solid',
    stroke: currentClass.secondary,
    strokeWidth: 4, // Thicker stroke
    roughness: 2,
    seed: finalSeed + x + y * 100
  });

  // Main player body with subtle pulsing
  const pulseScale = 1 + Math.sin(time * 0.025) * 0.05; // Much slower, gentler pulsing
  rc.circle(centerX, centerY, 14 * pulseScale, { // Larger base size
    fill: currentClass.color,
    fillStyle: 'solid',
    stroke: '#FFF',
    strokeWidth: 6, // Thicker stroke
    roughness: 1,
    seed: finalSeed + x + y * 100 + 1
  });

  // Class-specific visual effects
  if (player.class === 'knight') {
    // Knight: Shield effect
    rc.rectangle(centerX - 10, centerY - 10, 6, 16, { // Larger shield
      fill: '#C0C0C0',
      fillStyle: 'solid',
      stroke: '#808080',
      strokeWidth: 4, // Thicker
      roughness: 1,
      seed: finalSeed + x + y * 100 + 2
    });
    // Cross on shield
    rc.line(centerX - 7, centerY - 8, centerX - 7, centerY + 8, { // Larger cross
      stroke: '#FFD700',
      strokeWidth: 6, // Thicker
      seed: finalSeed + x + y * 100 + 3
    });
    rc.line(centerX - 10, centerY, centerX - 4, centerY, {
      stroke: '#FFD700',
      strokeWidth: 6,
      seed: finalSeed + x + y * 100 + 4
    });
  } else if (player.class === 'rogue') {
    // Rogue: Daggers/stealth effect
    for (let d = 0; d < 2; d++) {
      const daggerX = centerX + (d === 0 ? -8 : 8); // Further apart
      const daggerY = centerY - 3;
      rc.polygon([
        [daggerX - 2, daggerY - 6], // Larger daggers
        [daggerX + 2, daggerY - 6],
        [daggerX, daggerY + 3]
      ], {
        fill: '#C0C0C0',
        fillStyle: 'solid',
        stroke: '#808080',
        strokeWidth: 4, // Thicker
        seed: finalSeed + x + y * 100 + 5 + d
      });
    }
  } else if (player.class === 'mage') {
    // Mage: Magical runes
    const runeOffset = Math.sin(time * 0.015) * 3; // Much slower rune movement
    for (let r = 0; r < 3; r++) {
      const angle = (r * Math.PI * 2) / 3;
      const runeX = centerX + Math.cos(angle) * (16 + runeOffset); // Larger radius
      const runeY = centerY + Math.sin(angle) * (16 + runeOffset);
      rc.circle(runeX, runeY, 3, { // Larger runes
        fill: '#9370DB',
        fillStyle: 'solid',
        stroke: '#8A2BE2',
        strokeWidth: 4, // Thicker
        seed: finalSeed + x + y * 100 + 10 + r
      });
    }
  }

  // Health bar above player
  const healthPercent = player.stats.hp / player.stats.maxHp;
  const barWidth = 28; // Wider health bar
  const barHeight = 5; // Taller health bar

  // Background
  rc.rectangle(centerX - barWidth/2, centerY - 25, barWidth, barHeight, {
    fill: '#8B0000',
    fillStyle: 'solid',
    roughness: 0.5,
    seed: finalSeed + x + y * 100 + 20
  });

  // Health fill
  rc.rectangle(centerX - barWidth/2, centerY - 25, barWidth * healthPercent, barHeight, {
    fill: healthPercent > 0.6 ? '#32CD32' : healthPercent > 0.3 ? '#FFD700' : '#DC143C',
    fillStyle: 'solid',
    roughness: 0.5,
    seed: finalSeed + x + y * 100 + 21
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