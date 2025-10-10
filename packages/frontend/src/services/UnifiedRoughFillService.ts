import { RoughCanvas } from 'roughjs/bin/canvas';
import { createNoise2D } from 'simplex-noise';
import { Biome, BIOME_RENDER_CONFIGS, BiomeRenderConfig } from 'shared';
import { BoundaryTracer } from '../utils/boundaryTracing';

export class UnifiedRoughFillService {
  private roughCanvas: RoughCanvas;
  private noiseGenerator = createNoise2D();
  private boundaryTracer: BoundaryTracer;

  constructor(roughCanvas: RoughCanvas) {
    this.roughCanvas = roughCanvas;
    this.boundaryTracer = new BoundaryTracer();
  }

  public applyUnifiedBiomeFill(
    biome: Biome,
    tileSize: number,
    animationFrame: number = 0
  ): void {
    const boundary = this.boundaryTracer.march(biome.cells, tileSize);
    if (boundary.length < 3) {
      return; // Not a valid polygon to draw
    }

    const config = BIOME_RENDER_CONFIGS[biome.type];

    const biomeId = biome.cells.length > 0 ? `${biome.cells[0].x},${biome.cells[0].y}` : '0';
    const animatedConfig = this.animateBiomeConfig(config, animationFrame, biomeId);

    // Convert boundary points to the format roughjs expects if necessary
    const polygon = boundary.map(p => [p[0], p[1]]) as [number, number][];

    this.roughCanvas.polygon(polygon, {
      fill: animatedConfig.colors.primary,
      fillStyle: animatedConfig.fillPattern,
      roughness: animatedConfig.roughnessBase,
      bowing: animatedConfig.bowingBase,
      stroke: animatedConfig.colors.border,
      strokeWidth: animatedConfig.strokeWidth,
      hachureAngle: animatedConfig.hachureAngle,
      hachureGap: animatedConfig.hachureGap
    });

    // Texture overlay logic will be called from BiomeRenderer after this
  }

  private animateBiomeConfig(config: BiomeRenderConfig, animationFrame: number, biomeId: string): BiomeRenderConfig {
    if (!config.animationProperties) {
      return config;
    }

    const animatedConfig = JSON.parse(JSON.stringify(config)); // Deep copy to avoid side effects
    const { breathingIntensity, colorPulse, roughnessVariation } = config.animationProperties;

    // Use a hash of the biomeId to seed the noise, making it deterministic per biome
    const biomeSeed = this.hashString(biomeId);
    const time = (animationFrame / 100);

    if (roughnessVariation) {
      const roughnessNoise = this.noiseGenerator(biomeSeed, time);
      animatedConfig.roughnessBase += roughnessNoise * roughnessVariation;
    }

    if (breathingIntensity) {
        const breathingNoise = Math.sin(time + biomeSeed);
        animatedConfig.bowingBase += breathingNoise * breathingIntensity;
    }

    if (colorPulse) {
        const pulse = (Math.sin(time * 2 + biomeSeed) + 1) / 2; // 0 to 1
        const primaryColor = this.lerpColor(config.colors.primary, config.colors.secondary, pulse * colorPulse);
        animatedConfig.colors.primary = primaryColor;
    }

    return animatedConfig;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash / 2147483647; // Normalize to ~ -1 to 1
  }

  private lerpColor(a: string, b: string, amount: number): string {
    const ah = parseInt(a.replace(/#/g, ''), 16),
          ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
          bh = parseInt(b.replace(/#/g, ''), 16),
          br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
          rr = Math.round(ar + amount * (br - ar)),
          rg = Math.round(ag + amount * (bg - ag)),
          rb = Math.round(ab + amount * (bb - ab));

    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb).toString(16).slice(1);
  }
}