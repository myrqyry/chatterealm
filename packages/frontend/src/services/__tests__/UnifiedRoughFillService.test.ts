import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnifiedRoughFillService } from '../UnifiedRoughFillService';
import { Biome, BiomeType } from 'shared';
import { RoughCanvas } from 'roughjs/bin/canvas';

// Mocking BoundaryTracer dependency
vi.mock('../../utils/boundaryTracing', () => ({
  BoundaryTracer: vi.fn(() => ({
    march: vi.fn().mockReturnValue([
      [10, 10], [100, 10], [100, 100], [10, 100]
    ]),
  })),
}));

// Mocking RoughCanvas
const mockRoughCanvas = {
  polygon: vi.fn(),
};

describe('UnifiedRoughFillService', () => {
  let service: UnifiedRoughFillService;
  const mockBiome: Biome = {
    id: 'biome-1',
    type: BiomeType.GRASSLAND,
    cells: [{x: 0, y: 0}],
    bounds: { minX: 0, minY: 0, maxX: 10, maxY: 10 },
  };

  beforeEach(() => {
    service = new UnifiedRoughFillService(mockRoughCanvas as unknown as RoughCanvas);
    vi.clearAllMocks();
  });

  it('should call boundary tracer and draw a polygon', () => {
    service.applyUnifiedBiomeFill(mockBiome, 16, 0);
    expect(mockRoughCanvas.polygon).toHaveBeenCalledOnce();
  });

  it('should apply animation properties to the render config', () => {
    const animatedBiome: Biome = { ...mockBiome, type: BiomeType.TOXIC_ZONE };
    service.applyUnifiedBiomeFill(animatedBiome, 16, 100);

    const call = mockRoughCanvas.polygon.mock.calls[0];
    const options = call[1];

    expect(options.roughness).not.toBe(3);
    expect(options.bowing).not.toBe(2.5);
    expect(options.fill).not.toBe('#7FFF00');
  });
});