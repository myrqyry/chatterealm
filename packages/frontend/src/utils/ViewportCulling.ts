import { Biome, Position } from 'shared';

interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export class ViewportCuller {
  public cullBiomesForViewport(
    biomes: Biome[],
    viewport: BoundingBox,
    buffer: number = 64
  ): Biome[] {
    return biomes.filter(biome =>
      this.biomeIntersectsViewport(biome, viewport, buffer)
    );
  }

  public cullTexturePointsForViewport(
    texturePoints: Position[],
    viewport: BoundingBox
  ): Position[] {
    return texturePoints.filter(point =>
      this.pointInViewport(point, viewport)
    );
  }

  private biomeIntersectsViewport(biome: Biome, viewport: BoundingBox, buffer: number): boolean {
    const biomeBounds = biome.bounds;
    return (
      biomeBounds.minX < viewport.maxX + buffer &&
      biomeBounds.maxX > viewport.minX - buffer &&
      biomeBounds.minY < viewport.maxY + buffer &&
      biomeBounds.maxY > viewport.minY - buffer
    );
  }

  private pointInViewport(point: Position, viewport: BoundingBox): boolean {
    return (
      point.x >= viewport.minX &&
      point.x <= viewport.maxX &&
      point.y >= viewport.minY &&
      point.y <= viewport.maxY
    );
  }
}