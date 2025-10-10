import { RoughCanvas } from 'roughjs/bin/canvas';
import { Biome, BIOME_RENDER_CONFIGS, BiomeRenderConfig, Position } from 'shared';

interface BiomeTransition {
  boundary: [number, number][][]; // Array of boundary paths
  config: Partial<BiomeRenderConfig>;
}

export class BiomeTransitionService {
  public renderBiomeTransitions(
    biomes: Biome[],
    rc: RoughCanvas,
    tileSize: number,
  ): void {
    const transitions = this.identifyBiomeTransitions(biomes, tileSize);

    transitions.forEach(transition => {
      this.renderTransitionZone(transition.boundary, transition.config, rc);
    });
  }

  private identifyBiomeTransitions(biomes: Biome[], tileSize: number): BiomeTransition[] {
    const transitions: BiomeTransition[] = [];
    const biomeGrid: (Biome | null)[][] = [];

    // Create a grid of biomes for easier lookup
    biomes.forEach(biome => {
      biome.cells.forEach(cell => {
        if (!biomeGrid[cell.y]) biomeGrid[cell.y] = [];
        biomeGrid[cell.y][cell.x] = biome;
      });
    });

    biomes.forEach(biomeA => {
      biomeA.cells.forEach(cell => {
        const neighbors = [
          {x: cell.x + 1, y: cell.y},
          {x: cell.x - 1, y: cell.y},
          {x: cell.x, y: cell.y + 1},
          {x: cell.x, y: cell.y - 1},
        ];

        neighbors.forEach(n => {
          const biomeB = biomeGrid[n.y]?.[n.x];
          if (biomeB && biomeB !== biomeA) {
            const boundary = this.getSharedBoundary(cell, n, tileSize);
            const blendedConfig = this.blendBiomeConfigs(
              BIOME_RENDER_CONFIGS[biomeA.type],
              BIOME_RENDER_CONFIGS[biomeB.type],
              0.5 // simple 50/50 blend
            );
            transitions.push({ boundary: [boundary], config: blendedConfig });
          }
        });
      });
    });

    return transitions;
  }

  private getSharedBoundary(cellA: Position, cellB: Position, tileSize: number): [number, number][] {
    const ax = cellA.x * tileSize;
    const ay = cellA.y * tileSize;

    if (cellA.x < cellB.x) { // B is to the right of A
      return [[ax + tileSize, ay], [ax + tileSize, ay + tileSize]];
    }
    if (cellA.x > cellB.x) { // B is to the left of A
      return [[ax, ay], [ax, ay + tileSize]];
    }
    if (cellA.y < cellB.y) { // B is below A
      return [[ax, ay + tileSize], [ax + tileSize, ay + tileSize]];
    }
    // B is above A
    return [[ax, ay], [ax + tileSize, ay]];
  }


  private blendBiomeConfigs(configA: BiomeRenderConfig, configB: BiomeRenderConfig, ratio: number): Partial<BiomeRenderConfig> {
    const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

    return {
      colors: {
        primary: this.lerpColor(configA.colors.primary, configB.colors.primary, ratio),
        secondary: this.lerpColor(configA.colors.secondary, configB.colors.secondary, ratio),
        border: this.lerpColor(configA.colors.border, configB.colors.border, ratio),
      },
      roughnessBase: lerp(configA.roughnessBase, configB.roughnessBase, ratio),
      strokeWidth: lerp(configA.strokeWidth, configB.strokeWidth, ratio),
    };
  }

  private lerpColor(a: string, b: string, amount: number): string {
    const ah = parseInt(a.replace(/#/g, ''), 16),
          ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
          bh = parseInt(b.replace(/#/g, ''), 16),
          br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
          rr = Math.round(ar + amount * (br - ar)),
          rg = Math.round(ag + amount * (bg - ag)),
          rb = Math.round(ab + amount * (bb - ab));

    return `rgba(${rr}, ${rg}, ${rb}, 0.5)`; // Use RGBA for smooth blending
  }

  private renderTransitionZone(boundaryPaths: [number, number][][], config: Partial<BiomeRenderConfig>, rc: RoughCanvas): void {
    boundaryPaths.forEach(path => {
        if (path.length < 2) return;
        rc.linearPath(path, {
            stroke: config.colors?.primary || 'transparent',
            strokeWidth: (config.strokeWidth || 1) * 10, // Make transition wider
            roughness: 0, // Smooth line for blending
        });
    });
  }
}