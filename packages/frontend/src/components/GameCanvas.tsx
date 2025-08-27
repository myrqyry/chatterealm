import React, { useRef, useEffect, useState, useCallback } from 'react';
import rough from 'roughjs';
import {
  Player,
  Item
} from 'shared/src/types/game';

// Import Zustand store
import { useGameStore } from '../stores/gameStore';

// GameCanvas now gets data from Zustand store instead of props

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

const GameCanvas: React.FC = () => {
  // Get data from Zustand store
  const gameWorld = useGameStore(state => state.gameWorld);
  const animationSettings = useGameStore(state => state.animationSettings);

  // Extract data from gameWorld
  const grid = gameWorld?.grid || [];
  const players = gameWorld?.players || [];
  const npcs = gameWorld?.npcs || [];
  const items = gameWorld?.items || [];
  const showGrid = animationSettings?.showGrid ?? true;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [time, setTime] = useState(0);

  // Animation loop with speed control
  useEffect(() => {
    const animate = () => {
      const speedMultiplier = animationSettings?.animationSpeed || 1.0;
      setTime(prev => prev + speedMultiplier);

      // Update particles only if enabled
      if (animationSettings?.showParticles !== false) {
        setParticles(prev => prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 1,
            vy: p.vy + 0.1 // gravity
          }))
          .filter(p => p.life > 0)
        );
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

  // Add particle effect
  const addParticles = useCallback((x: number, y: number, color: string, count: number = 5) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 30,
        maxLife: 30,
        color,
        size: Math.random() * 3 + 1
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
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

    canvas.width = gridSize * numTilesX;
    canvas.height = gridSize * numTilesY;

    // Clear canvas with animated background
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, '#191724');
    bgGradient.addColorStop(1, '#1f1d2e');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw animated terrain with time-based effects
    for (let y = 0; y < numTilesY; y++) {
      for (let x = 0; x < numTilesX; x++) {
        const terrain = grid[y]?.[x];
        if (!terrain) continue;

        drawAnimatedTerrainTile(rc, x, y, gridSize, terrain.type, time);
      }
    }

    // Draw animated items with floating effect
    items.forEach(item => {
      if (item.position) {
        drawAnimatedItem(rc, item.position.x, item.position.y, gridSize, item, time);
      }
    });

    // Draw animated NPCs with movement
    npcs.forEach(npc => {
      if (npc.isAlive) {
        drawAnimatedNPC(rc, npc.position.x, npc.position.y, gridSize, time);
      }
    });

    // Draw animated players with special effects
    players.forEach(player => {
      if (player.isAlive) {
        drawAnimatedPlayer(rc, player.position.x, player.position.y, gridSize, player, time, addParticles);
      }
    });

    // Draw animated particles
    particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw animated grid lines with subtle pulsing
    if (showGrid) {
      drawAnimatedGridLines(rc, numTilesX, numTilesY, gridSize, time);
    }

  }, [grid, players, npcs, items, showGrid, time, particles, addParticles, animationSettings]);

  // Animated terrain drawing functions
  const drawAnimatedTerrainTile = (rc: any, x: number, y: number, gridSize: number, terrainType: any, time: number) => {
    const startX = x * gridSize;
    const startY = y * gridSize;

    // Get settings from props or use defaults
    const settings = animationSettings;
    const roughness = settings?.roughness || 1.5;
    const bowing = settings?.bowing || 1.2;
    const fillWeight = settings?.fillWeight || 1.5;
    const hachureAngle = settings?.hachureAngle || 45;
    const hachureGap = settings?.hachureGap || 4;
    const windSpeed = settings?.windSpeed || 0.02;
    const grassWaveSpeed = settings?.grassWaveSpeed || 0.1;
    const treeSwaySpeed = settings?.treeSwaySpeed || 0.03;
    const flowerSpawnRate = settings?.flowerSpawnRate || 0.01;

    // Enhanced terrain rendering based on advanced terrain types
    switch (terrainType) {
      case 'water':
      case 'ocean':
        // Ocean/deep water with wave animation
        rc.rectangle(startX, startY, gridSize, gridSize, {
          fill: '#1e40af',
          fillStyle: 'solid',
          stroke: '#1e3a8a',
          strokeWidth: 1,
          roughness: roughness * 0.5
        });
        // Animated waves
        for (let w = 0; w < 3; w++) {
          const waveOffset = Math.sin(time * 0.08 + x * 0.5 + w) * 2;
          rc.line(startX, startY + 5 + w * 8 + waveOffset, startX + gridSize, startY + 5 + w * 8 + waveOffset, {
            stroke: '#3b82f6',
            strokeWidth: 1,
            roughness: roughness * 0.8,
            bowing: bowing * 0.5
          });
        }
        break;

      case 'river':
        // Flowing river with current animation
        rc.rectangle(startX, startY, gridSize, gridSize, {
          fill: '#3b82f6',
          fillStyle: 'solid',
          stroke: '#1d4ed8',
          strokeWidth: 1,
          roughness: roughness * 0.7
        });
        // Animated current
        const currentOffset = Math.sin(time * 0.12 + y) * 3;
        rc.line(startX + 2, startY + 5 + currentOffset, startX + gridSize - 2, startY + 10 + currentOffset, {
          stroke: '#60a5fa',
          strokeWidth: 2,
          roughness: roughness * 0.6,
          bowing: bowing * 0.8
        });
        break;

      case 'mountain_peak':
        // Snow-capped mountain peaks
        rc.rectangle(startX, startY, gridSize, gridSize, {
          fill: '#64748b',
          fillStyle: 'solid',
          stroke: '#475569',
          strokeWidth: 1,
          roughness: roughness * 1.5
        });
        // Peak details
        rc.polygon([
          [startX + 2, startY + 15],
          [startX + 10, startY + 2],
          [startX + 18, startY + 15]
        ], {
          fill: '#f1f5f9',
          fillStyle: 'solid',
          roughness: roughness * 1.2
        });
        break;

      case 'mountain':
        // Rocky mountains with shadow
        rc.rectangle(startX, startY, gridSize, gridSize, {
          fill: '#78716c',
          fillStyle: 'solid',
          stroke: '#57534e',
          strokeWidth: 1,
          roughness: roughness * 1.8
        });
        // Mountain silhouette
        rc.polygon([
          [startX, startY + 18],
          [startX + 8, startY + 5],
          [startX + 16, startY + 12],
          [startX + gridSize, startY + 18]
        ], {
          fill: '#374151',
          fillStyle: 'solid',
          roughness: roughness * 1.3
        });
        break;

      case 'hills':
        // Rolling hills
        rc.rectangle(startX, startY, gridSize, gridSize, {
          fill: '#a3a3a3',
          fillStyle: 'solid',
          stroke: '#737373',
          strokeWidth: 1,
          roughness: roughness * 1.2
        });
        // Hill contours
        rc.ellipse(startX + 8, startY + 12, 12, 6, {
          fill: '#d4d4d8',
          fillStyle: 'solid',
          roughness: roughness * 0.8
        });
        break;

      case 'snow':
      case 'ice':
        // Snow-covered terrain
        rc.rectangle(startX, startY, gridSize, gridSize, {
          fill: '#f8fafc',
          fillStyle: 'solid',
          stroke: '#e2e8f0',
          strokeWidth: 1,
          roughness: roughness * 0.5
        });
        // Snow sparkle effects
        if (Math.random() < 0.3) {
          rc.circle(startX + 5 + Math.random() * 10, startY + 5 + Math.random() * 10, 1, {
            fill: '#e0f2fe',
            fillStyle: 'solid'
          });
        }
        break;

      case 'snowy_hills':
        // Snowy hills
        rc.rectangle(startX, startY, gridSize, gridSize, {
          fill: '#cbd5e1',
          fillStyle: 'solid',
          stroke: '#94a3b8',
          strokeWidth: 1,
          roughness: roughness * 1.0
        });
        // Snow-covered hill
        rc.ellipse(startX + 8, startY + 12, 12, 6, {
          fill: '#f1f5f9',
          fillStyle: 'solid',
          roughness: roughness * 0.7
        });
        break;

      case 'dunes':
        // Desert dunes
        rc.rectangle(startX, startY, gridSize, gridSize, {
          fill: '#f4a460',
          fillStyle: 'solid',
          stroke: '#d2691e',
          strokeWidth: 1,
          roughness: roughness * 1.3
        });
        // Dune ripples
        for (let d = 0; d < 2; d++) {
          const duneOffset = Math.sin(time * 0.03 + x + d) * 1.5;
          rc.ellipse(startX + 8, startY + 8 + d * 6 + duneOffset, 15, 4, {
            fill: '#deb887',
            fillStyle: 'solid',
            roughness: roughness * 0.8
          });
        }
        break;

      case 'oasis':
        // Desert oasis with water
        rc.rectangle(startX, startY, gridSize, gridSize, {
          fill: '#f4a460',
          fillStyle: 'solid',
          stroke: '#d2691e',
          strokeWidth: 1,
          roughness: roughness * 1.2
        });
        // Oasis water
        rc.ellipse(startX + 8, startY + 12, 8, 4, {
          fill: '#22d3ee',
          fillStyle: 'solid',
          roughness: roughness * 0.5
        });
        // Palm trees
        for (let p = 0; p < 2; p++) {
          const palmOffset = Math.sin(time * treeSwaySpeed + x + p) * 1;
          rc.line(startX + 6 + p * 4, startY + 8, startX + 6 + p * 4 + palmOffset, startY + 2, {
            stroke: '#8b4513',
            strokeWidth: 2,
            roughness: roughness * 0.8
          });
        }
        break;

      case 'sand':
        // Regular desert sand
        rc.rectangle(startX, startY, gridSize, gridSize, {
          fill: '#f4a460',
          fillStyle: 'solid',
          stroke: '#d2691e',
          strokeWidth: 1,
          roughness: roughness * 1.1
        });
        break;

      case 'dense_jungle':
        // Very thick jungle
        rc.rectangle(startX, startY, gridSize, gridSize, {
          fill: '#166534',
          fillStyle: 'solid',
          stroke: '#14532d',
          strokeWidth: 1,
          roughness: roughness * 2.0
        });
        // Dense vegetation
        for (let v = 0; v < 8; v++) {
          const vegX = startX + (v % 4) * 5 + 2;
          const vegY = startY + Math.floor(v / 4) * 6 + 2;
          const vegOffset = Math.sin(time * treeSwaySpeed + x + v) * 2;
          rc.circle(vegX + vegOffset, vegY, 2.5, {
            fill: '#15803d',
            fillStyle: 'solid',
            roughness: roughness * 1.5
          });
        }
        break;

      case 'jungle':
        // Regular jungle
        rc.rectangle(startX, startY, gridSize, gridSize, {
          fill: '#16a34a',
          fillStyle: 'solid',
          stroke: '#15803d',
          strokeWidth: 1,
          roughness: roughness * 1.8
        });
        // Jungle vegetation
        for (let v = 0; v < 5; v++) {
          const vegX = startX + (v % 3) * 7 + 3;
          const vegY = startY + Math.floor(v / 3) * 8 + 3;
          const vegOffset = Math.sin(time * treeSwaySpeed + x + v) * 1.5;
          rc.circle(vegX + vegOffset, vegY, 2, {
            fill: '#22c55e',
            fillStyle: 'solid',
            roughness: roughness * 1.2
          });
        }
        break;

      case 'deep_water':
        // Deep swamp water
        rc.rectangle(startX, startY, gridSize, gridSize, {
          fill: '#1e293b',
          fillStyle: 'solid',
          stroke: '#334155',
          strokeWidth: 1,
          roughness: roughness * 0.8
        });
        // Bubbles
        if (Math.random() < 0.4) {
          rc.circle(startX + 5 + Math.random() * 10, startY + 8 + Math.random() * 8, 1.5, {
            fill: '#64748b',
            fillStyle: 'solid',
            roughness: roughness * 0.3
          });
        }
        break;

      case 'marsh':
        // Swampy marsh
        rc.rectangle(startX, startY, gridSize, gridSize, {
          fill: '#365314',
          fillStyle: 'solid',
          stroke: '#4d7c0f',
          strokeWidth: 1,
          roughness: roughness * 1.4
        });
        // Marsh vegetation
        for (let m = 0; m < 3; m++) {
          rc.circle(startX + 4 + m * 4, startY + 6 + (m % 2) * 4, 1.5, {
            fill: '#65a30d',
            fillStyle: 'solid',
            roughness: roughness * 1.0
          });
        }
        break;

      case 'swamp':
        // Regular swamp
        rc.rectangle(startX, startY, gridSize, gridSize, {
          fill: '#4d7c0f',
          fillStyle: 'solid',
          stroke: '#65a30d',
          strokeWidth: 1,
          roughness: roughness * 1.6
        });
        // Swamp plants
        for (let s = 0; s < 4; s++) {
          rc.line(startX + 3 + s * 3, startY + 15, startX + 3 + s * 3, startY + 8, {
            stroke: '#16a34a',
            strokeWidth: 2,
            roughness: roughness * 0.8
          });
        }
        break;

      case 'dense_forest':
        // Very thick forest
        rc.rectangle(startX, startY, gridSize, gridSize, {
          fill: '#14532d',
          fillStyle: 'solid',
          stroke: '#166534',
          strokeWidth: 1,
          roughness: roughness * 2.2
        });
        // Dense trees
        for (let t = 0; t < 4; t++) {
          const treeX = startX + 3 + (t % 2) * 10;
          const treeY = startY + 4 + Math.floor(t / 2) * 8;
          const swayOffset = Math.sin(time * treeSwaySpeed + x + t) * 2;
          rc.line(treeX + swayOffset, treeY + 8, treeX + swayOffset, treeY, {
            stroke: '#92400e',
            strokeWidth: 2,
            roughness: roughness * 1.2
          });
          rc.circle(treeX + swayOffset, treeY - 2, 4, {
            fill: '#166534',
            fillStyle: 'solid',
            roughness: roughness * 1.5
          });
        }
        break;

      case 'forest':
        // Regular forest
        rc.rectangle(startX, startY, gridSize, gridSize, {
          fill: '#166534',
          fillStyle: 'solid',
          stroke: '#15803d',
          strokeWidth: 1,
          roughness: roughness * 1.7
        });
        // Forest trees
        for (let t = 0; t < 3; t++) {
          const treeX = startX + 4 + t * 6;
          const treeY = startY + 6;
          const swayOffset = Math.sin(time * treeSwaySpeed + x + t) * 1.5;
          rc.line(treeX + swayOffset, treeY + 8, treeX + swayOffset, treeY, {
            stroke: '#a16207',
            strokeWidth: 2,
            roughness: roughness * 1.0
          });
          rc.circle(treeX + swayOffset, treeY - 2, 3.5, {
            fill: '#22c55e',
            fillStyle: 'solid',
            roughness: roughness * 1.3
          });
        }
        break;

      case 'clearing':
        // Forest clearing
        rc.rectangle(startX, startY, gridSize, gridSize, {
          fill: '#84cc16',
          fillStyle: 'solid',
          stroke: '#65a30d',
          strokeWidth: 1,
          roughness: roughness * 0.8
        });
        // Small campfire
        rc.circle(startX + 8, startY + 10, 2, {
          fill: '#f59e0b',
          fillStyle: 'solid',
          roughness: roughness * 0.5
        });
        break;

      case 'rolling_hills':
        // Rolling hills
        rc.rectangle(startX, startY, gridSize, gridSize, {
          fill: '#86efac',
          fillStyle: 'solid',
          stroke: '#4ade80',
          strokeWidth: 1,
          roughness: roughness * 1.1
        });
        // Hill contours
        rc.ellipse(startX + 6, startY + 10, 8, 4, {
          fill: '#bbf7d0',
          fillStyle: 'solid',
          roughness: roughness * 0.6
        });
        rc.ellipse(startX + 12, startY + 14, 6, 3, {
          fill: '#dcfce7',
          fillStyle: 'solid',
          roughness: roughness * 0.5
        });
        break;

      case 'flower_field':
        // Beautiful flower field
        rc.rectangle(startX, startY, gridSize, gridSize, {
          fill: '#86efac',
          fillStyle: 'solid',
          stroke: '#4ade80',
          strokeWidth: 1,
          roughness: roughness * 0.9
        });
        // Flowers
        for (let f = 0; f < 6; f++) {
          const flowerX = startX + 3 + (f % 3) * 5;
          const flowerY = startY + 4 + Math.floor(f / 3) * 6;
          const flowerOffset = Math.sin(time * flowerSpawnRate + x + f) * 1;
          rc.circle(flowerX + flowerOffset, flowerY, 1.5, {
            fill: ['#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][f % 4],
            fillStyle: 'solid',
            roughness: roughness * 0.4
          });
        }
        break;

      case 'grassland':
        // Regular grassland
        rc.rectangle(startX, startY, gridSize, gridSize, {
          fill: '#84cc16',
          fillStyle: 'solid',
          stroke: '#65a30d',
          strokeWidth: 1,
          roughness: roughness * 1.0
        });
        // Grass details
        for (let g = 0; g < 4; g++) {
          const grassX = startX + 2 + g * 4;
          const grassY = startY + gridSize - 2;
          const grassOffset = Math.sin(time * grassWaveSpeed + x + g) * 2;
          rc.line(grassX + grassOffset, grassY, grassX + grassOffset, grassY - 3, {
            stroke: '#4ade80',
            strokeWidth: 1,
            roughness: roughness * 0.7
          });
        }
        break;

      case 'rough_terrain':
        // Rough terrain
        rc.rectangle(startX, startY, gridSize, gridSize, {
          fill: '#a8a29e',
          fillStyle: 'solid',
          stroke: '#78716c',
          strokeWidth: 1,
          roughness: roughness * 1.6
        });
        // Rocks
        for (let r = 0; r < 3; r++) {
          rc.circle(startX + 4 + r * 4, startY + 6 + (r % 2) * 4, 1.5, {
            fill: '#6b7280',
            fillStyle: 'solid',
            roughness: roughness * 1.2
          });
        }
        break;

      case 'ancient_ruins':
        // Ancient ruins
        rc.rectangle(startX, startY, gridSize, gridSize, {
          fill: '#a8a29e',
          fillStyle: 'solid',
          stroke: '#78716c',
          strokeWidth: 1,
          roughness: roughness * 1.4
        });
        // Ruins structure
        rc.rectangle(startX + 4, startY + 6, 6, 8, {
          fill: '#6b7280',
          fillStyle: 'solid',
          stroke: '#4b5563',
          strokeWidth: 1,
          roughness: roughness * 1.0
        });
        // Mysterious glow
        if (Math.random() < 0.3) {
          rc.circle(startX + 7, startY + 10, 3, {
            fill: '#8b5cf6',
            fillStyle: 'solid',
            stroke: '#a78bfa',
            strokeWidth: 1,
            roughness: roughness * 0.3
          });
        }
        break;

      default: // plain
        // Enhanced animated grass plain with advanced Rough.js effects
        rc.rectangle(startX, startY, gridSize, gridSize, {
          fill: '#90EE90',
          fillStyle: 'cross-hatch',
          fillWeight,
          hachureAngle: hachureAngle + Math.sin(time * 0.02) * 10,
          hachureGap,
          stroke: '#228B22',
          strokeWidth: 1.5,
          roughness,
          bowing
        });

        // Enhanced animated grass blades with dashed strokes
        for (let i = 0; i < 6; i++) {
          const grassX = startX + (i * 3.5) + Math.sin(time * grassWaveSpeed + i * 0.5) * 1.5;
          const grassY = startY + gridSize - 2;
          const windOffset = Math.sin(time * windSpeed + x + y) * 2.5;

          rc.line(grassX, grassY, grassX + windOffset, grassY - 4 - Math.sin(time * 0.09 + i * 0.7) * 1.5, {
            stroke: '#32CD32',
            strokeWidth: 1.2,
            strokeLineDash: [2, 3],
            roughness: roughness * 1.2,
            bowing: bowing * 0.8
          });
        }

        // Enhanced occasional flowers with zigzag fill
        if ((x + y) % 12 === Math.floor(time * flowerSpawnRate * 10) % 12) {
          const flowerX = startX + 8 + Math.sin(time * 0.025) * 2.5;
          const flowerY = startY + 12 + Math.cos(time * 0.02) * 1.5;
          rc.circle(flowerX, flowerY, 2.5, {
            fill: '#FFD700',
            fillStyle: 'zigzag',
            fillWeight: 2,
            hachureGap: 2,
            stroke: '#FFA500',
            strokeWidth: 1,
            roughness: roughness * 0.7
          });

          // Flower center with dots
          rc.circle(flowerX, flowerY, 1, {
            fill: '#FF6347',
            fillStyle: 'dots',
            fillWeight: 1.5,
            roughness: roughness * 0.4
          });
        }
        break;
    }
  };

  const drawAnimatedItem = (rc: any, x: number, y: number, gridSize: number, item: Item, time: number) => {
    const centerX = x * gridSize + gridSize / 2;
    const centerY = y * gridSize + gridSize / 2;

    // Floating animation
    const floatOffset = Math.sin(time * 0.05 + x + y) * 2;

    // Draw item as a floating animated shape
    const rarityColors = {
      common: '#9CA3AF',
      uncommon: '#10B981',
      rare: '#3B82F6',
      epic: '#8B5CF6',
      legendary: '#F59E0B'
    };

    const color = rarityColors[item.rarity as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'] || '#9CA3AF';

    // Animated glow effect
    rc.circle(centerX, centerY + floatOffset, 8, {
      fill: color,
      fillStyle: 'solid',
      stroke: '#FFF',
      strokeWidth: 2,
      roughness: 1.5
    });

    // Inner item shape with rotation
    const rotation = time * 0.02 + x + y;
    const ctx = (rc as any).ctx;
    if (ctx) {
      ctx.save();
      ctx.translate(centerX, centerY + floatOffset);
      ctx.rotate(rotation);

      // Draw different shapes based on item type
      if (item.type === 'weapon') {
        // Sword shape
        rc.rectangle(-2, -6, 4, 8, {
          fill: '#C0C0C0',
          fillStyle: 'solid',
          stroke: '#808080',
          strokeWidth: 1
        });
      } else if (item.type === 'consumable') {
        // Potion bottle
        rc.rectangle(-2, -4, 4, 6, {
          fill: color,
          fillStyle: 'solid',
          stroke: '#000',
          strokeWidth: 1
        });
        // Cork
        rc.rectangle(-1, -6, 2, 2, {
          fill: '#8B4513',
          fillStyle: 'solid'
        });
      } else {
        // Generic item
        rc.circle(0, 0, 3, {
          fill: color,
          fillStyle: 'solid',
          stroke: '#000',
          strokeWidth: 1
        });
      }

      ctx.restore();
    }

    // Sparkle effects for rare items
    if (item.rarity === 'legendary' || item.rarity === 'epic') {
      for (let s = 0; s < 3; s++) {
        const sparkleX = centerX + Math.sin(time * 0.1 + s * 2) * 6;
        const sparkleY = centerY + floatOffset + Math.cos(time * 0.1 + s * 2) * 6;
        rc.circle(sparkleX, sparkleY, 1, {
          fill: '#FFD700',
          fillStyle: 'solid'
        });
      }
    }
  };

  const drawAnimatedNPC = (rc: any, x: number, y: number, gridSize: number, time: number) => {
    const centerX = x * gridSize + gridSize / 2;
    const centerY = y * gridSize + gridSize / 2;

    // Breathing animation
    const breathScale = 1 + Math.sin(time * 0.05) * 0.1;

    // Pulsing danger aura
    const auraRadius = 14 + Math.sin(time * 0.1) * 2;
    rc.circle(centerX, centerY, auraRadius, {
      fill: '#DC143C',
      fillStyle: 'solid',
      stroke: '#8B0000',
      strokeWidth: 1,
      roughness: 2
    });

    // Main NPC body with breathing animation
    rc.circle(centerX, centerY, 8 * breathScale, {
      fill: '#DC143C',
      fillStyle: 'solid',
      stroke: '#8B0000',
      strokeWidth: 2,
      roughness: 1.5
    });

    // Angry eyes that follow movement
    const eyeOffset = Math.sin(time * 0.03) * 2;
    rc.circle(centerX - 3, centerY - 2 + eyeOffset, 1.5, {
      fill: '#FFF',
      fillStyle: 'solid'
    });
    rc.circle(centerX + 3, centerY - 2 + eyeOffset, 1.5, {
      fill: '#FFF',
      fillStyle: 'solid'
    });

    // Pupil
    rc.circle(centerX - 3, centerY - 2 + eyeOffset, 0.8, {
      fill: '#000',
      fillStyle: 'solid'
    });
    rc.circle(centerX + 3, centerY - 2 + eyeOffset, 0.8, {
      fill: '#000',
      fillStyle: 'solid'
    });

    // Spikes/horns using polygon
    for (let s = 0; s < 4; s++) {
      const angle = (s * Math.PI * 2) / 4;
      const spikeX = centerX + Math.cos(angle) * 10;
      const spikeY = centerY + Math.sin(angle) * 10;
      rc.polygon([
        [spikeX - 2, spikeY - 2],
        [spikeX + 2, spikeY - 2],
        [spikeX, spikeY + 2]
      ], {
        fill: '#8B0000',
        fillStyle: 'solid',
        roughness: 1
      });
    }
  };

  const drawAnimatedPlayer = (rc: any, x: number, y: number, gridSize: number, player: Player, time: number, addParticles: (x: number, y: number, color: string, count?: number) => void) => {
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
      strokeWidth: 1,
      roughness: 2
    });

    // Main player body with subtle pulsing
    const pulseScale = 1 + Math.sin(time * 0.1) * 0.05;
    rc.circle(centerX, centerY, 10 * pulseScale, {
      fill: currentClass.color,
      fillStyle: 'solid',
      stroke: '#FFF',
      strokeWidth: 2,
      roughness: 1
    });

    // Class-specific visual effects
    if (player.class === 'knight') {
      // Knight: Shield effect
      rc.rectangle(centerX - 8, centerY - 8, 4, 12, {
        fill: '#C0C0C0',
        fillStyle: 'solid',
        stroke: '#808080',
        strokeWidth: 1,
        roughness: 1
      });
      // Cross on shield
      rc.line(centerX - 6, centerY - 6, centerX - 6, centerY + 6, {
        stroke: '#FFD700',
        strokeWidth: 2
      });
      rc.line(centerX - 8, centerY, centerX - 4, centerY, {
        stroke: '#FFD700',
        strokeWidth: 2
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
          strokeWidth: 1
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
          strokeWidth: 1
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

  const drawAnimatedGridLines = (rc: any, numTilesX: number, numTilesY: number, gridSize: number, time: number) => {
    const pulseIntensity = 0.5 + Math.sin(time * 0.05) * 0.3;

    // Draw grid lines with subtle animation
    for (let x = 0; x <= numTilesX; x++) {
      rc.line(x * gridSize, 0, x * gridSize, numTilesY * gridSize, {
        stroke: `rgba(255, 255, 255, ${0.1 + pulseIntensity * 0.1})`,
        strokeWidth: 1
      });
    }
    for (let y = 0; y <= numTilesY; y++) {
      rc.line(0, y * gridSize, numTilesX * gridSize, y * gridSize, {
        stroke: `rgba(255, 255, 255, ${0.1 + pulseIntensity * 0.1})`,
        strokeWidth: 1
      });
    }
  };









  return <canvas ref={canvasRef} style={{ border: '1px solid #ccc' }} />;
};

export default GameCanvas;
