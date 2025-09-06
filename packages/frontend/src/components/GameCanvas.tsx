import React, { useRef, useEffect, useState, useCallback } from 'react';
import rough from 'roughjs';
import {
  Player,
  Item,
  AnimationSettings, // Now imported from shared
  TerrainType // Now imported from shared
} from 'shared/src/types/game';
import { GAME_CONFIG } from 'shared/src/constants/gameConstants';
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
  const animationRef = useRef<number>();
  const [particles, setParticles] = useState<Particle[]>([]);
  const timeRef = useRef(0);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rc = rough.canvas(canvas);
  const numTilesX = grid[0]?.length || 40; // Updated default to enlarged world width
  const numTilesY = grid.length || 30;     // Updated default to enlarged world height

    setupCanvas(canvas, ctx, numTilesX, numTilesY, gridSize);
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
      gridSize // Pass the gridSize as tileSize parameter
    );
  }, [grid, players, npcs, items, showGrid, particles, animationSettings, addParticlesToState, gridSize]);

  return <canvas ref={canvasRef} style={{ border: '1px solid #ccc' }} />;
};

export default GameCanvas;
