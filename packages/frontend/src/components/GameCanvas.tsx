import React, { useRef, useEffect } from 'react';
import rough from 'roughjs';
import {
  Player,
  Item,
  AnimationSettings,
  TerrainType,
  GameWorld
} from 'shared';
import { GAME_CONFIG } from 'shared';
import { useGameStore } from '../stores/gameStore';
import { renderGame } from './renderers/canvas/RenderCoordinator';
import { CanvasDrawEffectComponent, createCanvasCirclePath, createCanvasStarPath, createCanvasLightningPath } from './animations/CanvasDrawEffect';
import { useContainerResize } from './GameCanvas/hooks/useContainerResize';
import { useCanvasSetup } from './GameCanvas/hooks/useCanvasSetup';
import { useParticleManager } from './GameCanvas/managers/ParticleManager';
import { useEffectManager } from './GameCanvas/managers/EffectManager';
import { useRegenerationManager } from './GameCanvas/managers/RegenerationManager';

const GameCanvas: React.FC = () => {
  const gameWorld = useGameStore(state => state.gameWorld);
  const unifiedSettings = useGameStore(state => state.unifiedSettings);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use the new hooks and managers
  const containerSize = useContainerResize(containerRef);
  const canvasSetup = useCanvasSetup(canvasRef, containerSize, gameWorld?.grid, 8);
  const { particles, addParticles, updateParticles } = useParticleManager({ 
    animationSettings: unifiedSettings.animations, 
    onAddParticles: undefined 
  });
  const { drawEffects, triggerDrawEffect } = useEffectManager({ canvasRef });
  const { regenerationEffects } = useRegenerationManager({ 
    gameWorld, 
    tileSizePx: canvasSetup.tileSizePx, 
    grid: gameWorld?.grid 
  });

  const grid = gameWorld?.grid || [];
  const players = gameWorld?.players || [];
  const npcs = gameWorld?.npcs || [];
  const items = gameWorld?.items || [];
  const showGrid = unifiedSettings.animations?.showGrid ?? true;
  const animationSettings = unifiedSettings.animations;

  // Render the game when setup is ready
  useEffect(() => {
    if (!canvasSetup.isReady || !canvasSetup.ctx || !gameWorld) return;

    const rc = rough.canvas(canvasSetup.canvas!);
    let animationId: number;
    let startTime = performance.now();

    const animate = (currentTime: number) => {
      const time = (currentTime - startTime) / 1000; // Convert to seconds

      // Update particles in the main render loop
      updateParticles();

      renderGame(
        rc,
        canvasSetup.ctx!,
        grid as { type: TerrainType }[][],
        players,
        npcs,
        items,
        showGrid,
        time,
        animationSettings,
        particles,
        addParticles,
        canvasSetup.tileSizePx,
        unifiedSettings.world.nightMode
      );

      animationId = requestAnimationFrame(animate);
    };

    // Start the animation loop
    animationId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [
    canvasSetup.isReady, 
    canvasSetup.ctx, 
    canvasSetup.tileSizePx, 
    gameWorld, 
    grid, 
    players, 
    npcs, 
    items, 
    showGrid, 
    animationSettings, 
    particles, 
    addParticles,
    unifiedSettings.world.nightMode 
  ]);

  const handlePointerDown = (ev: React.PointerEvent) => {
    if (!canvasRef.current || !canvasSetup.isReady || !gameWorld) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = ev.clientX;
    const clientY = ev.clientY;

    const cssX = clientX - rect.left;
    const cssY = clientY - rect.top;

    const localX = cssX - canvasSetup.offset.x;
    const localY = cssY - canvasSetup.offset.y;

    const tx = Math.floor(localX / canvasSetup.tileSizePx);
    const ty = Math.floor(localY / canvasSetup.tileSizePx);

    if (tx < 0 || ty < 0 || ty >= gameWorld.grid.length || tx >= (gameWorld.grid[0]?.length || 0)) return;

    const currentPlayer = useGameStore.getState().currentPlayer;
    if (!currentPlayer) return;

    useGameStore.getState().moveTo({ x: tx, y: ty });

    const pixelX = tx * canvasSetup.tileSizePx + canvasSetup.tileSizePx / 2;
    const pixelY = ty * canvasSetup.tileSizePx + canvasSetup.tileSizePx / 2;
    triggerDrawEffect(pixelX, pixelY, 'circle');
  };

  // Inner padding
  const innerPadding = 8;

  return (
    <div ref={containerRef} className="game-canvas-container">
      <canvas 
        ref={canvasRef} 
        className="game-canvas" 
        onPointerDown={handlePointerDown}
        style={{ display: canvasSetup.isReady ? 'block' : 'none' }}
      />
      {drawEffects.map(effect => (
        <CanvasDrawEffectComponent
          key={effect.id}
          canvasRef={canvasRef}
          path={effect.path}
          active={effect.active}
          duration={effect.duration}
          strokeColor={effect.strokeColor}
          strokeWidth={effect.strokeWidth}
          clearBeforeDraw={false}
        />
      ))}
      {regenerationEffects.map(effect => (
        <CanvasDrawEffectComponent
          key={effect.id}
          canvasRef={canvasRef}
          path={
            effect.type === 'circle'
              ? createCanvasCirclePath(effect.x, effect.y, 15, 12)
              : effect.type === 'star'
              ? createCanvasStarPath(effect.x, effect.y, 12, 8, 5)
              : createCanvasLightningPath(effect.x - 10, effect.y - 10, effect.x + 10, effect.y + 10, 4, 10)
          }
          active={effect.active}
          duration={2}
          strokeColor={
            effect.type === 'circle' ? '#00ff88' :
            effect.type === 'star' ? '#ff6b6b' : '#ffff00'
          }
          strokeWidth={2}
          clearBeforeDraw={false}
        />
      ))}
    </div>
  );
};

export default GameCanvas;
