import React, { useRef, useEffect, useState, useCallback } from 'react';
import rough from 'roughjs';
import {
  Player,
  Item,
  AnimationSettings, // Now imported from shared
  TerrainType // Now imported from shared
} from 'shared/src/types/game';
import { useGameStore } from '../stores/gameStore';
import { setupCanvas } from './renderers/canvas/CanvasUtils';
import { updateParticles, Particle, addParticles } from './renderers/effects/ParticleSystem';
import { renderGame } from './renderers/canvas/RenderCoordinator';

const GameCanvas: React.FC = () => {
  const gameWorld = useGameStore(state => state.gameWorld);
  const animationSettings = useGameStore(state => state.animationSettings);

  const grid = gameWorld?.grid || [];
  const players = gameWorld?.players || [];
  const npcs = gameWorld?.npcs || [];
  const items = gameWorld?.items || [];
  const showGrid = animationSettings?.showGrid ?? true;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const animate = () => {
      const speedMultiplier = animationSettings?.animationSpeed || 1.0;
      setTime(prev => prev + speedMultiplier);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rc = rough.canvas(canvas);
    const gridSize = 20;
    const numTilesX = grid[0]?.length || 20;
    const numTilesY = grid.length || 15;

    setupCanvas(canvas, ctx, numTilesX, numTilesY, gridSize);

    renderGame(
      rc,
      ctx,
      grid as { type: TerrainType }[][],
      players,
      npcs,
      items,
      showGrid,
      time,
      animationSettings as AnimationSettings,
      particles,
      addParticlesToState
    );
  }, [grid, players, npcs, items, showGrid, time, particles, animationSettings, addParticlesToState]);

  return <canvas ref={canvasRef} style={{ border: '1px solid #ccc' }} />;
};

export default GameCanvas;
