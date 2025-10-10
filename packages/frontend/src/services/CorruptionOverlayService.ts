import { RoughCanvas } from 'roughjs/bin/canvas';
import { Biome, Position } from 'shared';
import PoissonDiskSampling from 'poisson-disk-sampling';

export class CorruptionOverlayService {
  public applyCorruptionEffects(
    biome: Biome,
    corruptionLevel: number,
    rc: RoughCanvas,
    animationFrame: number
  ): void {
    if (corruptionLevel < 0.1) return;

    const chaosMultiplier = Math.min(corruptionLevel * 5, 8);

    this.addCorruptionGrowths(biome, chaosMultiplier, corruptionLevel, rc, animationFrame);

    // The color shifting and overlay will be handled by the BiomeRenderer's
    // existing animation and configuration system, which can be influenced
    // by the cataclysm level in the game state. This service will focus on
    // additive effects like growths.
  }

  private addCorruptionGrowths(
    biome: Biome,
    chaosMultiplier: number,
    corruptionLevel: number,
    rc: RoughCanvas,
    animationFrame: number
  ): void {
    const { minX, minY, maxX, maxY } = biome.bounds;
    const pds = new PoissonDiskSampling({
      shape: [maxX - minX, maxY - minY],
      minDistance: 30 - chaosMultiplier * 2,
      maxDistance: 100 - chaosMultiplier * 5,
      tries: 10,
    });

    const points = pds.fill();

    points.forEach(point => {
      const worldPoint = { x: point[0] + minX, y: point[1] + minY };

      if (this.isPointInBiome(worldPoint, biome.cells)) {
        const size = (5 + Math.random() * 10) * corruptionLevel;
        const animatedSize = this.animateGrowthSize(size, animationFrame, worldPoint);
        this.drawCorruptionGrowth(rc, worldPoint, animatedSize, chaosMultiplier);
      }
    });
  }

  private isPointInBiome(point: Position, cells: Position[]): boolean {
    return cells.some(cell => cell.x === Math.floor(point.x) && cell.y === Math.floor(point.y));
  }

  private animateGrowthSize(baseSize: number, animationFrame: number, point: Position): number {
    const animationSpeed = 0.1;
    const sizeVariation = 0.2;
    return baseSize * (1 + Math.sin(animationFrame * animationSpeed + point.x) * sizeVariation);
  }

  private drawCorruptionGrowth(rc: RoughCanvas, p: Position, s: number, chaos: number) {
    rc.circle(p.x, p.y, s, {
      fill: `rgba(148, 0, 211, ${0.3 + chaos / 10})`,
      fillStyle: 'zigzag-line',
      hachureAngle: Math.random() * 180,
      hachureGap: (s / 4) * (1 / (chaos/4 + 1)),
      roughness: 2 + chaos,
      stroke: `rgba(75, 0, 130, ${0.5 + chaos/10})`,
      strokeWidth: 1 + chaos / 4,
    });
  }
}