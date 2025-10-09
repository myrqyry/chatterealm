import React, { useRef, useEffect } from 'react';
import rough from 'roughjs';
import { RoughCanvas } from 'roughjs/bin/canvas';
import { GameWorld, Position } from 'shared';
import { GAME_CONFIG } from 'shared';

const CELL_SIZE = GAME_CONFIG.tileSize;

export const CataclysmVisualizer: React.FC<{
  gameWorld: GameWorld;
  infectedAreas: Position[];
}> = ({ gameWorld, infectedAreas }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const roughCanvasRef = useRef<RoughCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    roughCanvasRef.current = rough.canvas(canvasRef.current, {
      options: {
        roughness: 2.5,
        bowing: 3,
        stroke: '#ff0000',
        strokeWidth: 2,
        fill: 'rgba(255, 0, 0, 0.1)',
        fillStyle: 'zigzag-line'
      }
    });

    renderCataclysmEffects();
  }, [infectedAreas, gameWorld]);

  const renderCataclysmEffects = () => {
    const canvas = canvasRef.current;
    const roughCanvas = roughCanvasRef.current;
    if (!canvas || !roughCanvas || !gameWorld || !gameWorld.grid || gameWorld.grid.length === 0) return;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    infectedAreas.forEach((area, index) => {
      const chaos = Math.min(index * 0.1 + 1, 5);

      roughCanvas.rectangle(
        area.x * CELL_SIZE,
        area.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE,
        {
          roughness: chaos,
          bowing: chaos * 1.5,
          stroke: `hsl(${Math.random() * 60}, 70%, 40%)`,
          strokeWidth: Math.random() * 3 + 1,
          fill: `hsla(${Math.random() * 60}, 50%, 20%, 0.3)`,
          fillStyle: Math.random() > 0.5 ? 'zigzag-line' : 'cross-hatch'
        }
      );

      for (let i = 0; i < chaos * 2; i++) {
        const startX = area.x * CELL_SIZE + Math.random() * CELL_SIZE;
        const startY = area.y * CELL_SIZE + Math.random() * CELL_SIZE;
        const endX = startX + (Math.random() - 0.5) * CELL_SIZE;
        const endY = startY + (Math.random() - 0.5) * CELL_SIZE;

        roughCanvas.line(startX, startY, endX, endY, {
          roughness: chaos * 2,
          stroke: '#330000',
          strokeWidth: Math.random() * 2
        });
      }
    });
  };

  if (!gameWorld || !gameWorld.grid || gameWorld.grid.length === 0 || !gameWorld.grid[0]) {
      return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 pointer-events-none z-10"
      width={gameWorld.grid[0].length * CELL_SIZE}
      height={gameWorld.grid.length * CELL_SIZE}
    />
  );
};