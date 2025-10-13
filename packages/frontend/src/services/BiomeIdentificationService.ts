import { Biome, BoundingBox, Position, BiomeType } from 'shared';

export class BiomeIdentificationService {
  public identifyBiomeRegions(grid: { type: BiomeType }[][]): Biome[] {
    if (!grid || grid.length === 0) {
      return [];
    }

    const visited = new Set<string>();
    const regions: Biome[] = [];
    const height = grid.length;
    const width = grid[0].length;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const key = `${x},${y}`;
        if (visited.has(key)) {
          continue;
        }

        const biomeType = grid[y][x].type;
        const cells = this.floodFill(grid, x, y, biomeType, visited);

        if (cells.length > 0) {
          regions.push({
            type: biomeType,
            cells: cells,
            bounds: this.calculateBoundingBox(cells),
          });
        }
      }
    }

    return regions;
  }

  private floodFill(
    grid: { type: BiomeType }[][],
    startX: number,
    startY: number,
    targetType: BiomeType,
    visited: Set<string>
  ): Position[] {
    const cells: Position[] = [];
    const queue: Position[] = [{ x: startX, y: startY }];
    const height = grid.length;
    const width = grid[0].length;

    const startKey = `${startX},${startY}`;
    if (visited.has(startKey)) {
      return [];
    }
    visited.add(startKey);

    while (queue.length > 0) {
      const { x, y } = queue.shift()!;
      cells.push({ x, y });

      const neighbors = [
        { x: x + 1, y },
        { x: x - 1, y },
        { x, y: y + 1 },
        { x, y: y - 1 },
      ];

      for (const neighbor of neighbors) {
        const { x: nx, y: ny } = neighbor;
        const key = `${nx},${ny}`;

        if (
          nx >= 0 &&
          nx < width &&
          ny >= 0 &&
          ny < height &&
          !visited.has(key) &&
          grid[ny][nx].type === targetType
        ) {
          visited.add(key);
          queue.push({ x: nx, y: ny });
        }
      }
    }

    return cells;
  }

  private calculateBoundingBox(cells: Position[]): BoundingBox {
    if (cells.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    let minX = cells[0].x;
    let minY = cells[0].y;
    let maxX = cells[0].x;
    let maxY = cells[0].y;

    for (const cell of cells) {
      minX = Math.min(minX, cell.x);
      minY = Math.min(minY, cell.y);
      maxX = Math.max(maxX, cell.x);
      maxY = Math.max(maxY, cell.y);
    }

    return { minX, minY, maxX, maxY };
  }
}