import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BiomeTextureService } from '../BiomeTextureService';
import { Biome, BiomeType, Position } from 'shared';
import { RoughCanvas } from 'roughjs/bin/canvas';

// Mocking PoissonDiskSampling
vi.mock('poisson-disk-sampling', () => ({
  default: vi.fn(() => ({
    fill: vi.fn().mockReturnValue([[5, 5], [8, 8]]),
  })),
}));

const mockRoughCanvas = {
  line: vi.fn(),
  circle: vi.fn(),
  polygon: vi.fn(),
  rectangle: vi.fn(),
};

describe('BiomeTextureService', () => {
  let service: BiomeTextureService;
  const mockBiome: Biome = {
    id: 'biome-1',
    type: BiomeType.FOREST,
    cells: [{x: 0, y: 0}, {x: 5, y: 5}, {x: 8, y: 8}],
    bounds: { minX: 0, minY: 0, maxX: 10, maxY: 10 },
  };

  beforeEach(() => {
    service = new BiomeTextureService();
    vi.clearAllMocks();
  });

  it('should add texture overlay for trees', () => {
    service.addTextureOverlay(mockBiome, { type: 'trees', density: 0.1, size: 10 }, mockRoughCanvas as any, 0);
    expect(mockRoughCanvas.line).toHaveBeenCalled();
    expect(mockRoughCanvas.circle).toHaveBeenCalled();
  });

  it('should add texture overlay for rocks', () => {
    service.addTextureOverlay(mockBiome, { type: 'rocks', density: 0.1, size: 8 }, mockRoughCanvas as any, 0);
    expect(mockRoughCanvas.polygon).toHaveBeenCalled();
  });

  it('should add texture overlay for crystals', () => {
    service.addTextureOverlay(mockBiome, { type: 'crystals', density: 0.1, size: 12 }, mockRoughCanvas as any, 0);
    expect(mockRoughCanvas.polygon).toHaveBeenCalled();
  });

  it('should add texture overlay for ruins', () => {
    service.addTextureOverlay(mockBiome, { type: 'ruins', density: 0.1, size: 15 }, mockRoughCanvas as any, 0);
    expect(mockRoughCanvas.rectangle).toHaveBeenCalled();
  });

  it('should add texture overlay for corruption', () => {
    service.addTextureOverlay(mockBiome, { type: 'corruption', density: 0.1, size: 5 }, mockRoughCanvas as any, 0);
    expect(mockRoughCanvas.circle).toHaveBeenCalled();
  });
});