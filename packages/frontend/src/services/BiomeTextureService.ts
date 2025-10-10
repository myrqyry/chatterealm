import { RoughCanvas } from 'roughjs/bin/canvas';
import { Biome, Position } from 'shared';
import PoissonDiskSampling from 'poisson-disk-sampling';

// Define a new interface for texture configuration to avoid circular dependencies
interface TextureOverlayConfig {
  type: 'trees' | 'rocks' | 'crystals' | 'ruins' | 'corruption';
  density: number;
  size: number;
}

export class BiomeTextureService {
  public addTextureOverlay(
    biome: Biome,
    textureConfig: TextureOverlayConfig,
    roughCanvas: RoughCanvas,
    animationFrame: number
  ): void {
    const { minX, minY, maxX, maxY } = biome.bounds;
    const pds = new PoissonDiskSampling({
      shape: [maxX - minX, maxY - minY],
      minDistance: 1 / textureConfig.density,
      maxDistance: 2 / textureConfig.density,
      tries: 10
    });

    const points = pds.fill();

    points.forEach(point => {
      const worldPoint = { x: point[0] + minX, y: point[1] + minY };

      if (this.isPointInBiome(worldPoint, biome.cells)) {
        const animatedSize = this.animateTextureSize(
          textureConfig.size,
          animationFrame,
          worldPoint
        );

        switch (textureConfig.type) {
          case 'trees':
            this.drawRoughTree(roughCanvas, worldPoint, animatedSize);
            break;
          case 'rocks':
            this.drawRoughRock(roughCanvas, worldPoint, animatedSize);
            break;
          case 'crystals':
            this.drawRoughCrystal(roughCanvas, worldPoint, animatedSize);
            break;
          case 'ruins':
            this.drawRoughRuins(roughCanvas, worldPoint, animatedSize);
            break;
          case 'corruption':
            this.drawCorruptionEffect(roughCanvas, worldPoint, animatedSize);
            break;
        }
      }
    });
  }

  private isPointInBiome(point: Position, cells: Position[]): boolean {
    return cells.some(cell => cell.x === Math.floor(point.x) && cell.y === Math.floor(point.y));
  }

  private animateTextureSize(baseSize: number, animationFrame: number, point: Position): number {
    const animationSpeed = 0.05;
    const sizeVariation = 0.1;
    return baseSize * (1 + Math.sin(animationFrame * animationSpeed + point.x + point.y) * sizeVariation);
  }

  private drawRoughTree(rc: RoughCanvas, p: Position, s: number) {
    const trunkHeight = s * 1.5;
    const foliageRadius = s * 1.2;
    rc.line(p.x, p.y, p.x, p.y - trunkHeight, { stroke: '#8B4513', strokeWidth: s / 4 });
    rc.circle(p.x, p.y - trunkHeight, foliageRadius, {
      fill: '#228B22',
      fillStyle: 'hachure',
      hachureAngle: 60,
      hachureGap: s / 4,
      roughness: 1.5,
      stroke: 'darkgreen',
    });
  }

  private drawRoughRock(rc: RoughCanvas, p: Position, s: number) {
    const rockShape: [number, number][] = [
      [p.x - s * 0.8, p.y + s * 0.3],
      [p.x - s * 0.2, p.y - s * 0.7],
      [p.x + s * 0.7, p.y - s * 0.1],
      [p.x + s * 0.6, p.y + s * 0.6],
      [p.x - s * 0.5, p.y + s * 0.8]
    ];
    rc.polygon(rockShape, {
      fill: '#808080',
      fillStyle: 'solid',
      roughness: 2.5,
      stroke: '#696969',
      strokeWidth: 1.5,
    });
  }

  private drawRoughCrystal(rc: RoughCanvas, p: Position, s: number) {
    const crystalHeight = s * 1.8;
    const crystalBase = s * 0.8;
    const crystalShape: [number, number][] = [
      [p.x, p.y - crystalHeight],
      [p.x + crystalBase / 2, p.y],
      [p.x - crystalBase / 2, p.y]
    ];
    rc.polygon(crystalShape, {
      fill: 'rgba(0, 255, 255, 0.6)',
      fillStyle: 'solid',
      stroke: '#00FFFF',
      strokeWidth: 2,
      roughness: 1,
    });
  }

  private drawRoughRuins(rc: RoughCanvas, p: Position, s: number) {
    rc.rectangle(p.x - s / 2, p.y - s, s, s, {
      roughness: 2.8,
      fill: '#696969',
      fillStyle: 'cross-hatch',
      hachureGap: s / 3,
      hachureAngle: 45,
      stroke: 'black',
      strokeWidth: 2,
    });
    rc.rectangle(p.x, p.y - s/2, s/3, s/2, {
        roughness: 2,
        stroke: 'black',
        strokeWidth: 1,
    });
  }

  private drawCorruptionEffect(rc: RoughCanvas, p: Position, s: number) {
    rc.circle(p.x, p.y, s, {
      fill: '#9400D3',
      fillStyle: 'zigzag-line',
      hachureGap: s / 4,
      hachureAngle: Math.random() * 180,
      roughness: 3,
      stroke: '#4B0082',
      strokeWidth: 2,
    });
  }
}