import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CorruptionOverlayService } from '../CorruptionOverlayService';
import { Biome, BiomeType } from 'shared';
import { RoughCanvas } from 'roughjs/bin/canvas';

vi.mock('poisson-disk-sampling', () => ({
  default: vi.fn(() => ({
    fill: vi.fn().mockReturnValue([[5, 5]]),
  })),
}));

const mockRoughCanvas = {
  circle: vi.fn(),
};

describe('CorruptionOverlayService', () => {
  let service: CorruptionOverlayService;
  const mockBiome: Biome = {
    id: 'biome-1',
    type: BiomeType.GRASSLAND,
    cells: [{x: 5, y: 5}],
    bounds: { minX: 0, minY: 0, maxX: 10, maxY: 10 },
  };

  beforeEach(() => {
    service = new CorruptionOverlayService();
    vi.clearAllMocks();
  });

  it('should not apply effects for low corruption levels', () => {
    service.applyCorruptionEffects(mockBiome, 0.05, mockRoughCanvas as any, 0);
    expect(mockRoughCanvas.circle).not.toHaveBeenCalled();
  });

  it('should apply corruption growths for high corruption levels', () => {
    service.applyCorruptionEffects(mockBiome, 0.8, mockRoughCanvas as any, 0);
    expect(mockRoughCanvas.circle).toHaveBeenCalled();
    const call = mockRoughCanvas.circle.mock.calls[0];
    const options = call[3];
    expect(options.fill).toContain('rgba(148, 0, 211');
  });
});