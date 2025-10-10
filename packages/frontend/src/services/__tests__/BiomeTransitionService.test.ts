import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BiomeTransitionService } from '../BiomeTransitionService';
import { Biome, BiomeType } from 'shared';
import { RoughCanvas } from 'roughjs/bin/canvas';

const mockRoughCanvas = {
  linearPath: vi.fn(),
};

describe('BiomeTransitionService', () => {
  let service: BiomeTransitionService;
  const biomeA: Biome = {
    id: 'A',
    type: BiomeType.GRASSLAND,
    cells: [{x: 1, y: 1}],
    bounds: { minX: 1, minY: 1, maxX: 1, maxY: 1 },
  };
  const biomeB: Biome = {
    id: 'B',
    type: BiomeType.FOREST,
    cells: [{x: 2, y: 1}],
    bounds: { minX: 2, minY: 1, maxX: 2, maxY: 1 },
  };

  beforeEach(() => {
    service = new BiomeTransitionService();
    vi.clearAllMocks();
  });

  it('should identify and render transitions between adjacent biomes', () => {
    const biomes = [biomeA, biomeB];
    service.renderBiomeTransitions(biomes, mockRoughCanvas as any, 10);

    expect(mockRoughCanvas.linearPath).toHaveBeenCalled();
    const call = mockRoughCanvas.linearPath.mock.calls[0];
    const options = call[1];

    // Check if the blended color is applied
    expect(options.stroke).toContain('rgba');
    expect(options.strokeWidth).toBeGreaterThan(1);
  });
});