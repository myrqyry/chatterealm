import React, { useRef, useEffect } from 'react';
import rough from 'roughjs';
import {
  Player,
  Item,
  AnimationSettings,
  BiomeType,
  GameWorld
} from 'shared';
import { GAME_CONFIG } from 'shared';
import { useGameStore } from '../../stores/gameStore';
import { renderGame } from '../renderers/canvas/RenderCoordinator';
import { CanvasDrawEffectComponent, createCanvasCirclePath, createCanvasStarPath, createCanvasLightningPath } from '../animations/CanvasDrawEffect';
import { useContainerResize } from './hooks/useContainerResize';
import { useCanvasSetup } from './hooks/useCanvasSetup';
import { useParticleManager } from './managers/ParticleManager';
import { useEffectManager } from './managers/EffectManager';
import { useRegenerationManager } from './managers/RegenerationManager';
import { webSocketClient } from '../../services/webSocketClient';
import { CataclysmVisualizer } from '../CataclysmVisualizer';
import { Position } from 'shared';

/**
 * Main game canvas component that renders the game world and handles user interactions.
 *
 * This component is responsible for:
 * - Rendering the game world using HTML5 Canvas and Rough.js for hand-drawn styling
 * - Managing particle effects, draw effects, and regeneration animations
 * - Handling user input (pointer clicks) for movement and item interactions
 * - Coordinating multiple rendering systems and animation loops
 *
 * The component uses several custom hooks and managers to handle different aspects:
 * - Container resizing and canvas setup
 * - Particle system management
 * - Draw effect animations
 * - Regeneration effect rendering
 *
 * @returns The rendered game canvas with interactive elements and animations
 *
 * @example
 * ```tsx
 * <GameCanvas />
 * ```
 */
const GameCanvas: React.FC = () => {
  const gameWorld = useGameStore(state => state.gameWorld);
  const unifiedSettings = useGameStore(state => state.unifiedSettings);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use the new hooks and managers
  const containerSize = useContainerResize(containerRef);
  const canvasSetup = useCanvasSetup(
    canvasRef, 
    containerSize, 
    gameWorld?.grid, 
    8,
    unifiedSettings.visual.renderScale || 1.0 // Use setting or default to full resolution
  );
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
  const buildings = gameWorld?.buildings || [];
  const items = gameWorld?.items || [];
  const showGrid = unifiedSettings.animations?.showGrid ?? true;
  const animationSettings = unifiedSettings.animations;

  // Use refs to avoid restarting the animation loop
  const gameWorldRef = useRef(gameWorld);
  const gridRef = useRef(grid);
  const playersRef = useRef(players);
  const npcsRef = useRef(npcs);
  const itemsRef = useRef(items);
  const showGridRef = useRef(showGrid);
  const animationSettingsRef = useRef(animationSettings);
  const particlesRef = useRef(particles);
  const addParticlesRef = useRef(addParticles);
  const tileSizePxRef = useRef(canvasSetup.tileSizePx);
  const nightModeRef = useRef(unifiedSettings.world.nightMode);

  // Update refs when values change
  useEffect(() => {
    gameWorldRef.current = gameWorld;
  }, [gameWorld]);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    npcsRef.current = npcs;
  }, [npcs]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    showGridRef.current = showGrid;
  }, [showGrid]);

  useEffect(() => {
    animationSettingsRef.current = animationSettings;
  }, [animationSettings]);

  useEffect(() => {
    particlesRef.current = particles;
  }, [particles]);

  useEffect(() => {
    addParticlesRef.current = addParticles;
  }, [addParticles]);

  useEffect(() => {
    tileSizePxRef.current = canvasSetup.tileSizePx;
  }, [canvasSetup.tileSizePx]);

  useEffect(() => {
    nightModeRef.current = unifiedSettings.world.nightMode;
  }, [unifiedSettings.world.nightMode]);

  // Render the game when setup is ready
  useEffect(() => {
    if (!canvasSetup.isReady || !canvasSetup.ctx) return;

    const rc = rough.canvas(canvasSetup.canvas!);
    let animationId: number;
    let startTime = performance.now();

    const animate = (currentTime: number) => {
      const time = (currentTime - startTime) / 1000; // Convert to seconds

      // Update particles in the main render loop
      updateParticles();

      // Only render if we have a game world
      if (gameWorldRef.current) {
        renderGame(
          rc,
          canvasSetup.ctx!,
          gridRef.current as { type: BiomeType }[][],
          playersRef.current,
          npcsRef.current,
          itemsRef.current,
          buildings,
          showGridRef.current,
          time,
          animationSettingsRef.current,
          particlesRef.current,
          addParticlesRef.current,
          tileSizePxRef.current,
          nightModeRef.current
        );
      }

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
  }, [canvasSetup.isReady, canvasSetup.ctx, updateParticles]); // Only depend on setup and updateParticles

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

    // Check if clicked on an item for looting interaction
    const clickedItem = gameWorld.items.find(item => 
      item.position && item.position.x === tx && item.position.y === ty
    );

    if (clickedItem) {
      handleItemInteraction(clickedItem, currentPlayer);
      return;
    }

    // Default: move to clicked location
    useGameStore.getState().moveTo({ x: tx, y: ty });

    const pixelX = tx * canvasSetup.tileSizePx + canvasSetup.tileSizePx / 2;
    const pixelY = ty * canvasSetup.tileSizePx + canvasSetup.tileSizePx / 2;
    triggerDrawEffect(pixelX, pixelY, 'circle');
  };

  const handleItemInteraction = (item: Item, player: Player) => {
    // Check distance to item
    const distance = Math.max(
      Math.abs(item.position!.x - player.position.x),
      Math.abs(item.position!.y - player.position.y)
    );

    if (distance > GAME_CONFIG.lootInteractionRadius) {
      useGameStore.getState().setGameMessage('Item is too far away');
      return;
    }

    if (item.isHidden) {
      // Inspect hidden item
      webSocketClient.inspectItem(item.id);
    } else if (item.revealProgress >= 1.0 && item.canBeLooted) {
      // Loot revealed item
      webSocketClient.lootItem(item.id);
    } else if (item.revealProgress < 1.0) {
      // Item is still revealing
      useGameStore.getState().setGameMessage('Item is still being revealed...');
    } else {
      // Item not lootable
      useGameStore.getState().setGameMessage('Cannot loot this item right now');
    }
  };

  const getInfectedAreas = (): Position[] => {
    if (!gameWorld || !gameWorld.cataclysmCircle.isActive) {
      return [];
    }

    const infected: Position[] = [];
    const { center, radius } = gameWorld.cataclysmCircle;
    const grid = gameWorld.grid;

    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const distance = Math.sqrt(Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2));
        if (distance > radius) {
          infected.push({ x, y });
        }
      }
    }
    return infected;
  };

  const infectedAreas = getInfectedAreas();

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden p-2 box-border relative min-w-0 min-h-0" style={{ maxHeight: '100%', maxWidth: '100%' }}>
      <canvas
        ref={canvasRef}
        className={`border border-outline rounded-md block w-full h-full max-w-full max-h-full ${canvasSetup.isReady ? '' : 'hidden'}`} 
        onPointerDown={handlePointerDown}
        style={{ maxHeight: '100%', maxWidth: '100%' }}
      />
      {gameWorld?.phase === 'cataclysm' && gameWorld.cataclysmCircle.isActive && (
        <CataclysmVisualizer gameWorld={gameWorld} infectedAreas={infectedAreas} />
      )}
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
