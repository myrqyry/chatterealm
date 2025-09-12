import React, { useRef, useEffect, useState, useCallback } from 'react';
import rough from 'roughjs';
import {
  Player,
  Item,
  AnimationSettings, // Now imported from shared
  TerrainType // Now imported from shared
} from 'shared';
import { GAME_CONFIG } from 'shared';
import { useGameStore } from '../stores/gameStore';
import { setupCanvas } from './renderers/canvas/CanvasUtils';
import { updateParticles, Particle, addParticles } from './renderers/effects/ParticleSystem';
import { renderGame } from './renderers/canvas/RenderCoordinator';

const GameCanvas: React.FC = () => {
  const gameWorld = useGameStore(state => state.gameWorld);
  const unifiedSettings = useGameStore(state => state.unifiedSettings);



  // Use unified settings with fallbacks and explicit typing
  const animationSettings: AnimationSettings = {
    animationSpeed: unifiedSettings?.animations?.animationSpeed ?? 1.0,
    // Prefer animations category but fall back to visual booleans for backward compatibility
    showParticles: unifiedSettings?.animations?.showParticles ?? unifiedSettings?.visual?.showParticles ?? false,
    showGrid: unifiedSettings?.animations?.showGrid ?? unifiedSettings?.visual?.showGrid ?? true,
    roughness: unifiedSettings?.animations?.roughness ?? 1.5,
    bowing: unifiedSettings?.animations?.bowing ?? 1.2,
    fillWeight: unifiedSettings?.animations?.fillWeight ?? 1.5,
    hachureAngle: unifiedSettings?.animations?.hachureAngle ?? 45,
    hachureGap: unifiedSettings?.animations?.hachureGap ?? 4,
    breathingRate: unifiedSettings?.animations?.breathingRate ?? 0.05,
    particleCount: unifiedSettings?.animations?.particleCount ?? 5,
    // Terrain / world animation speeds (fallback to world settings or sensible defaults)
    grassWaveSpeed: unifiedSettings?.animations?.grassWaveSpeed ?? unifiedSettings?.world?.grassWaveSpeed ?? 0.5,
    treeSwaySpeed: unifiedSettings?.animations?.treeSwaySpeed ?? unifiedSettings?.world?.treeSwaySpeed ?? 0.5,
    flowerSpawnRate: unifiedSettings?.animations?.flowerSpawnRate ?? unifiedSettings?.world?.flowerSpawnRate ?? 0.2,
    windSpeed: unifiedSettings?.animations?.windSpeed ?? unifiedSettings?.world?.windSpeed ?? 0.3,
    // Optional rough.js extras
    fillStyle: unifiedSettings?.animations?.fillStyle ?? 'hachure',
    seed: unifiedSettings?.animations?.seed ?? 0,
    strokeWidth: unifiedSettings?.animations?.strokeWidth ?? 1.5,
    simplification: unifiedSettings?.animations?.simplification ?? 0.8,
    dashOffset: unifiedSettings?.animations?.dashOffset ?? 0,
    dashGap: unifiedSettings?.animations?.dashGap ?? 0,
    zigzagOffset: unifiedSettings?.animations?.zigzagOffset ?? 0,
    curveFitting: unifiedSettings?.animations?.curveFitting ?? 0.95,
    curveTightness: unifiedSettings?.animations?.curveTightness ?? 0,
    curveStepCount: unifiedSettings?.animations?.curveStepCount ?? 9,
    fillShapeRoughnessGain: unifiedSettings?.animations?.fillShapeRoughnessGain ?? 0.8,
    disableMultiStroke: unifiedSettings?.animations?.disableMultiStroke ?? false,
    disableMultiStrokeFill: unifiedSettings?.animations?.disableMultiStrokeFill ?? false,
    preserveVertices: unifiedSettings?.animations?.preserveVertices ?? false,
  };

  const grid = gameWorld?.grid || [];
  const players = gameWorld?.players || [];
  const npcs = gameWorld?.npcs || [];
  const items = gameWorld?.items || [];
  const showGrid = animationSettings?.showGrid ?? true;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const tileSizeRef = useRef(32);
  const animationRef = useRef<number>();
  const [particles, setParticles] = useState<Particle[]>([]);
  const timeRef = useRef(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Inner padding in CSS pixels (kept in code for pointer mapping)
  const innerPadding = 8;

  useEffect(() => {
    const animate = () => {
      const speedMultiplier = animationSettings?.animationSpeed || 1.0;
      timeRef.current = timeRef.current + speedMultiplier;

      if (animationSettings?.showParticles !== false) {
        setParticles(prev => updateParticles(prev));
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animationSettings?.animationSpeed, animationSettings?.showParticles]);

  const addParticlesToState = useCallback((x: number, y: number, color: string, count: number = 5) => {
    setParticles(prev => [...prev, ...addParticles(x, y, color, count)]);
  }, []);

  // Use shared game configuration constant for consistent tile size
  const gridSize = GAME_CONFIG.tileSize; // Central source of truth for tile size

  // Handle container resize to maintain aspect ratio
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });

    // Observe the wrapper div that receives full available space
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('GameCanvas: canvas ref is null');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('GameCanvas: cannot get 2d context');
      return;
    }

    const rc = rough.canvas(canvas);
    const numTilesX = grid[0]?.length || 60; // Made wider for better screen utilization
    const numTilesY = grid.length || 30;     // Keep reasonable height

    // Debug logging
    console.log('GameCanvas render:', {
      gameWorld: !!gameWorld,
      gridLength: grid.length,
      gridWidth: grid[0]?.length,
      numTilesX,
      numTilesY,
      players: players.length,
      npcs: npcs.length,
      items: items.length
    });

    // Get CSS size from container (this is the available space)
    const cssWidth = containerSize.width;
    const cssHeight = containerSize.height;

    // Get device pixel ratio for crisp rendering
    const dpr = Math.max(1, window.devicePixelRatio || 1);

  // Inner padding (visual inset) in CSS pixels so edge scribbles are visible
  // Calculate proper scaling to maintain aspect ratio but use maximum space
  // Use an effective drawing area that excludes the inner padding on each side
  const effectiveCssWidth = Math.max(0, cssWidth - innerPadding * 2);
  const effectiveCssHeight = Math.max(0, cssHeight - innerPadding * 2);

  const scaleX = effectiveCssWidth / (numTilesX * gridSize);
  const scaleY = effectiveCssHeight / (numTilesY * gridSize);
    const worldScale = Math.min(scaleX, scaleY); // Maintain aspect ratio
    const clampedWorldScale = Math.max(1.0, Math.min(worldScale, 5.0)); // Increased minimum scale

  console.log('Canvas scaling:', {
    cssWidth,
    cssHeight,
    effectiveCssWidth,
    effectiveCssHeight,
    numTilesX,
    numTilesY,
    gridSize,
    scaleX,
    scaleY,
    worldScale,
    clampedWorldScale
  });

  // Calculate the actual rendered size inside the effective drawing area
  const tileSizePx = gridSize * clampedWorldScale;
  const renderedWidth = numTilesX * tileSizePx;
  const renderedHeight = numTilesY * tileSizePx;
    
    // Set CSS size to fill the entire container
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    // Set backing buffer size (device pixels for crisp rendering)
    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);

    // Reset transform and apply device pixel ratio scaling
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    
  // Center the properly scaled game world inside the inner padding
  const offsetX = innerPadding + (effectiveCssWidth - renderedWidth) / 2;
  const offsetY = innerPadding + (effectiveCssHeight - renderedHeight) / 2;
  ctx.translate(offsetX, offsetY);

  // Store mapping info for pointer handlers (CSS pixels)
  offsetRef.current = { x: offsetX, y: offsetY };
  tileSizeRef.current = tileSizePx;

    setupCanvas(canvas, ctx, numTilesX, numTilesY, tileSizePx, cssWidth, cssHeight);
    ctx.imageSmoothingEnabled = false; // Keep pixel art crisp

    renderGame(
      rc,
      ctx,
      grid as { type: TerrainType }[][],
      players,
      npcs,
      items,
      showGrid,
      timeRef.current,
      animationSettings as AnimationSettings,
      particles,
      addParticlesToState,
      tileSizePx, // Pass explicit pixel tile size
      unifiedSettings.world.nightMode // Pass night mode setting
    );
  }, [grid, players, npcs, items, showGrid, particles, animationSettings, addParticlesToState, gridSize, containerSize]);

  const handlePointerDown = (ev: React.PointerEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = ev.clientX;
    const clientY = ev.clientY;

    // Map to CSS pixel coordinates relative to canvas
    const cssX = clientX - rect.left;
    const cssY = clientY - rect.top;

    // Convert to world tile coordinates using offset and tile size we stored earlier
    const localX = cssX - offsetRef.current.x;
    const localY = cssY - offsetRef.current.y;

    const tx = Math.floor(localX / tileSizeRef.current);
    const ty = Math.floor(localY / tileSizeRef.current);

    // Validate
    if (!gameWorld || tx < 0 || ty < 0 || ty >= gameWorld.grid.length || tx >= (gameWorld.grid[0]?.length || 0)) return;

    const currentPlayer = useGameStore.getState().currentPlayer;
    if (!currentPlayer) return;

    // Send move-to command with the clicked tile as target
    useGameStore.getState().moveTo({ x: tx, y: ty });
  };

  return (
    <div ref={containerRef} className="game-canvas-container">
      <canvas ref={canvasRef} className="game-canvas" onPointerDown={handlePointerDown} />
    </div>
  );
};

export default GameCanvas;
