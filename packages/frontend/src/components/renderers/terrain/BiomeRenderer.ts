import { TerrainType, AnimationSettings } from 'shared/src/types/game';

export const drawBiome = (rc: any, startX: number, startY: number, gridSize: number, terrainType: TerrainType, time: number, settings: AnimationSettings) => {
  const roughness = settings?.roughness || 1.5;
  const bowing = settings?.bowing || 1.2;
  const fillWeight = settings?.fillWeight || 1.5;
  const hachureAngle = settings?.hachureAngle || 45;
  const hachureGap = settings?.hachureGap || 4;
  const fillStyle = settings?.fillStyle || 'hachure'; // New: Default fill style
  const seed = settings?.seed || 1; // New: Default seed for rough.js randomness
  const windSpeed = settings?.windSpeed || 0.02;
  const grassWaveSpeed = settings?.grassWaveSpeed || 0.1;
  const treeSwaySpeed = settings?.treeSwaySpeed || 0.03;
  const flowerSpawnRate = settings?.flowerSpawnRate || 0.01;

  switch (terrainType) {
    case TerrainType.SNOW:
    case TerrainType.ICE:
      // Snow-covered terrain
      rc.rectangle(startX, startY, gridSize, gridSize, {
        fill: '#f8fafc',
        fillStyle: fillStyle, // Use dynamic fillStyle
        stroke: '#e2e8f0',
        strokeWidth: 1,
        roughness: roughness * 0.5,
        seed: seed // Apply seed
      });
      // Snow sparkle effects
      if (Math.random() < 0.3) {
        rc.circle(startX + 5 + Math.random() * 10, startY + 5 + Math.random() * 10, 1, {
          fill: '#e0f2fe',
          fillStyle: fillStyle, // Use dynamic fillStyle
          seed: seed // Apply seed
        });
      }
      break;

    case TerrainType.SNOWY_HILLS:
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
        fillStyle: fillStyle, // Use dynamic fillStyle
        roughness: roughness * 0.7,
        seed: seed // Apply seed
      });
      break;

    case TerrainType.DUNES:
      // Desert dunes
      rc.rectangle(startX, startY, gridSize, gridSize, {
        fill: '#f4a460',
        fillStyle: fillStyle, // Use dynamic fillStyle
        stroke: '#d2691e',
        strokeWidth: 1,
        roughness: roughness * 1.3,
        seed: seed // Apply seed
      });
      // Dune ripples
      for (let d = 0; d < 2; d++) {
        const duneOffset = Math.sin(time * 0.03 + startX + d) * 1.5;
        rc.ellipse(startX + 8, startY + 8 + d * 6 + duneOffset, 15, 4, {
          fill: '#deb887',
          fillStyle: fillStyle, // Use dynamic fillStyle
          roughness: roughness * 0.8,
          seed: seed // Apply seed
        });
      }
      break;

    case TerrainType.OASIS:
      // Desert oasis with water
      rc.rectangle(startX, startY, gridSize, gridSize, {
        fill: '#f4a460',
        fillStyle: fillStyle, // Use dynamic fillStyle
        stroke: '#d2691e',
        strokeWidth: 1,
        roughness: roughness * 1.3,
        seed: seed // Apply seed
      });
      // Oasis water
      rc.ellipse(startX + 8, startY + 12, 8, 4, {
        fill: '#22d3ee',
        fillStyle: fillStyle, // Use dynamic fillStyle
        roughness: roughness * 0.5,
        seed: seed // Apply seed
      });
      // Palm trees
      for (let p = 0; p < 2; p++) {
        const palmOffset = Math.sin(time * treeSwaySpeed + startX + p) * 1;
        rc.line(startX + 6 + p * 4, startY + 8, startX + 6 + p * 4 + palmOffset, startY + 2, {
          stroke: '#8b4513',
          strokeWidth: 2,
          roughness: roughness * 0.8
        });
      }
      break;

    case TerrainType.SAND:
      // Regular desert sand
      rc.rectangle(startX, startY, gridSize, gridSize, {
        fill: '#f4a460',
        fillStyle: fillStyle, // Use dynamic fillStyle
        stroke: '#d2691e',
        strokeWidth: 1,
        roughness: roughness * 1.2,
        seed: seed // Apply seed
      });
      break;

    case TerrainType.DENSE_JUNGLE:
      // Very thick jungle
      rc.rectangle(startX, startY, gridSize, gridSize, {
        fill: '#166534',
        fillStyle: fillStyle, // Use dynamic fillStyle
        stroke: '#14532d',
        strokeWidth: 1,
        roughness: roughness * 2.0,
        seed: seed // Apply seed
      });
      // Dense vegetation
      for (let v = 0; v < 8; v++) {
        const vegX = startX + (v % 4) * 5 + 2;
        const vegY = startY + Math.floor(v / 4) * 6 + 2;
        const vegOffset = Math.sin(time * treeSwaySpeed + startX + v) * 2;
        rc.circle(vegX + vegOffset, vegY, 2.5, {
          fill: '#15803d',
          fillStyle: fillStyle, // Use dynamic fillStyle
          roughness: roughness * 1.5,
          seed: seed // Apply seed
        });
      }
      break;

    case TerrainType.JUNGLE:
      // Regular jungle
      rc.rectangle(startX, startY, gridSize, gridSize, {
        fill: '#16a34a',
        fillStyle: fillStyle, // Use dynamic fillStyle
        stroke: '#15803d',
        strokeWidth: 1,
        roughness: roughness * 1.8,
        seed: seed // Apply seed
      });
      // Jungle vegetation
      for (let v = 0; v < 5; v++) {
        const vegX = startX + (v % 3) * 7 + 3;
        const vegY = startY + Math.floor(v / 3) * 8 + 3;
        const vegOffset = Math.sin(time * treeSwaySpeed + startX + v) * 1.5;
        rc.circle(vegX + vegOffset, vegY, 2, {
          fill: '#22c55e',
          fillStyle: fillStyle, // Use dynamic fillStyle
          roughness: roughness * 1.2,
          seed: seed // Apply seed
        });
      }
      break;

    case TerrainType.DEEP_WATER:
      // Deep swamp water
      rc.rectangle(startX, startY, gridSize, gridSize, {
        fill: '#1e293b',
        fillStyle: fillStyle, // Use dynamic fillStyle
        stroke: '#334155',
        strokeWidth: 1,
        roughness: roughness * 0.8,
        seed: seed // Apply seed
      });
      // Bubbles
      if (Math.random() < 0.4) {
        rc.circle(startX + 5 + Math.random() * 10, startY + 8 + Math.random() * 8, 1.5, {
          fill: '#64748b',
          fillStyle: fillStyle, // Use dynamic fillStyle
          roughness: roughness * 0.3,
          seed: seed // Apply seed
        });
      }
      break;

    case TerrainType.MARSH:
      // Swampy marsh
      rc.rectangle(startX, startY, gridSize, gridSize, {
        fill: '#365314',
        fillStyle: fillStyle, // Use dynamic fillStyle
        stroke: '#4d7c0f',
        strokeWidth: 1,
        roughness: roughness * 1.4,
        seed: seed // Apply seed
      });
      // Marsh vegetation
      for (let m = 0; m < 3; m++) {
        rc.circle(startX + 4 + m * 4, startY + 6 + (m % 2) * 4, 1.5, {
          fill: '#65a30d',
          fillStyle: fillStyle, // Use dynamic fillStyle
          roughness: roughness * 1.0,
          seed: seed // Apply seed
        });
      }
      break;

    case TerrainType.SWAMP:
      // Regular swamp
      rc.rectangle(startX, startY, gridSize, gridSize, {
        fill: '#4d7c0f',
        fillStyle: fillStyle, // Use dynamic fillStyle
        stroke: '#65a30d',
        strokeWidth: 1,
        roughness: roughness * 1.6,
        seed: seed // Apply seed
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

    case TerrainType.ROLLING_HILLS:
      // Rolling hills
      rc.rectangle(startX, startY, gridSize, gridSize, {
        fill: '#86efac',
        fillStyle: fillStyle, // Use dynamic fillStyle
        stroke: '#4ade80',
        strokeWidth: 1,
        roughness: roughness * 1.1,
        seed: seed // Apply seed
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

    case TerrainType.FLOWER_FIELD:
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
        const flowerOffset = Math.sin(time * flowerSpawnRate + startX + f) * 1;
        rc.circle(flowerX + flowerOffset, flowerY, 1.5, {
          fill: ['#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][f % 4],
          fillStyle: 'solid',
          roughness: roughness * 0.4
        });
      }
      break;

    case TerrainType.GRASSLAND:
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
        const grassOffset = Math.sin(time * grassWaveSpeed + startX + g) * 2;
        rc.line(grassX + grassOffset, grassY, grassX + grassOffset, grassY - 3, {
          stroke: '#4ade80',
          strokeWidth: 1,
          roughness: roughness * 0.7
        });
      }
      break;

    case TerrainType.ROUGH_TERRAIN:
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

    case TerrainType.ANCIENT_RUINS:
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

    case TerrainType.PLAIN: // plain is the default case from the original logic
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
        const windOffset = Math.sin(time * windSpeed + startX + startY) * 2.5;

        rc.line(grassX, grassY, grassX + windOffset, grassY - 4 - Math.sin(time * 0.09 + i * 0.7) * 1.5, {
          stroke: '#32CD32',
          strokeWidth: 1.2,
          strokeLineDash: [2, 3],
          roughness: roughness * 1.2,
          bowing: bowing * 0.8
        });
      }

      // Enhanced occasional flowers with zigzag fill
      if ((startX + startY) % 12 === Math.floor(time * flowerSpawnRate * 10) % 12) {
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