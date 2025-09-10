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
  };

  const grid = gameWorld?.grid || [];
  const players = gameWorld?.players || [];
  const npcs = gameWorld?.npcs || [];
  const items = gameWorld?.items || [];
  const showGrid = animationSettings?.showGrid ?? true;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const [particles, setParticles] = useState<Particle[]>([]);
  const timeRef = useRef(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

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
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rc = rough.canvas(canvas);
    const numTilesX = grid[0]?.length || 60; // Made wider for better screen utilization
    const numTilesY = grid.length || 30;     // Keep reasonable height

    // Get CSS size from container (this is the available space)
    const cssWidth = containerSize.width;
    const cssHeight = containerSize.height;

    // Get device pixel ratio for crisp rendering
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    // Calculate proper scaling to maintain aspect ratio but use maximum space
    const scaleX = cssWidth / (numTilesX * gridSize);
    const scaleY = cssHeight / (numTilesY * gridSize);
    const worldScale = Math.min(scaleX, scaleY); // Maintain aspect ratio
    const clampedWorldScale = Math.max(0.5, Math.min(worldScale, 5.0));

    // Calculate the actual rendered size
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
    
    // Center the properly scaled game world
    const offsetX = (cssWidth - renderedWidth) / 2;
    const offsetY = (cssHeight - renderedHeight) / 2;
    ctx.translate(offsetX, offsetY);

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
      tileSizePx // Pass explicit pixel tile size
    );
  }, [grid, players, npcs, items, showGrid, particles, animationSettings, addParticlesToState, gridSize, containerSize]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flex: '1 1 auto', // allow the container to grow/shrink to fill available space
        alignItems: 'stretch', // stretch to full height
        justifyContent: 'stretch', // stretch to full width
        overflow: 'hidden',
        position: 'relative',
        minWidth: 0, // important for flex children to prevent overflow in CSS layouts
        minHeight: 0
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          border: '1px solid var(--color-outline)',
          borderRadius: '8px',
          display: 'block',
          imageRendering: 'pixelated',
          width: '100%', // fill the available width of the container
          height: '100%', // fill the available height of the container
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      />
    </div>
  );
};

export default GameCanvas;
