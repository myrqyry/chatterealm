import { useState, useEffect } from 'react';
import { createCanvasCirclePath, createCanvasStarPath, createCanvasLightningPath } from '../../animations/CanvasDrawEffect';
import { GameWorld } from 'shared';

interface RegenerationEffect {
  id: string;
  x: number;
  y: number;
  type: 'circle' | 'star' | 'lightning';
  active: boolean;
}

interface RegenerationManagerProps {
  gameWorld: GameWorld | null;
  tileSizePx: number;
  grid: any[][] | null;
}

export const useRegenerationManager = ({ gameWorld, tileSizePx, grid }: RegenerationManagerProps) => {
  const [regenerationEffects, setRegenerationEffects] = useState<RegenerationEffect[]>([]);

  useEffect(() => {
    if (gameWorld?.phase === 'rebirth' && grid) {
      const effects: RegenerationEffect[] = [];
      const numEffects = Math.min(20, Math.floor((grid.length * (grid[0]?.length || 0)) / 50));

      for (let i = 0; i < numEffects; i++) {
        const x = Math.floor(Math.random() * (grid[0]?.length || 60));
        const y = Math.floor(Math.random() * grid.length);
        const types: ('circle' | 'star' | 'lightning')[] = ['circle', 'star', 'lightning'];
        const type = types[Math.floor(Math.random() * types.length)];

        effects.push({
          id: `regen-${i}-${Date.now()}`,
          x: x * tileSizePx + tileSizePx / 2,
          y: y * tileSizePx + tileSizePx / 2,
          type,
          active: true
        });
      }

      setRegenerationEffects(effects);

      const timer = setTimeout(() => {
        setRegenerationEffects([]);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [gameWorld?.phase, grid, tileSizePx]);

  return { regenerationEffects };
};
