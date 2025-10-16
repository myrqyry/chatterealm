import { Position } from 'shared';
import simplify from 'simplify-js';

type Point = { x: number; y: number };

export class BoundaryTracer {
  public march(cells: Position[], cellSize: number): number[][] {
    if (cells.length === 0) {
      return [];
    }

    const { grid, offsetX, offsetY } = this.createGrid(cells);
    const contours = this.traceContours(grid);

    if (contours.length === 0) {
      return [];
    }

    const worldContours = this.convertToWorldCoordinates(contours, cellSize, offsetX, offsetY);

    const simplifiedContours = worldContours.map(contour => {
      const pointsToSimplify = contour.map(p => ({ x: p[0], y: p[1] }));
      const simplified = this.simplify(pointsToSimplify, cellSize / 4, true); // Tolerance based on cell size
      return simplified.map(p => [p.x, p.y]);
    });

    // This logic assumes a single, continuous biome boundary. For biomes with holes or multiple separate areas,
    // this would need to be more sophisticated (e.g., using path winding rules to determine inner/outer paths).
    // For now, we return the longest contour found.
    if (simplifiedContours.length === 0) return [];
    simplifiedContours.sort((a, b) => b.length - a.length);
    return simplifiedContours[0];
  }

  private createGrid(cells: Position[]): { grid: number[][]; offsetX: number; offsetY: number } {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const cell of cells) {
      minX = Math.min(minX, cell.x);
      minY = Math.min(minY, cell.y);
      maxX = Math.max(maxX, cell.x);
      maxY = Math.max(maxY, cell.y);
    }

    const gridWidth = maxX - minX + 3;
    const gridHeight = maxY - minY + 3;
    const grid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0));

    const offsetX = minX - 1;
    const offsetY = minY - 1;

    for (const cell of cells) {
      grid[cell.y - offsetY][cell.x - offsetX] = 1;
    }

    return { grid, offsetX, offsetY };
  }

  private traceContours(grid: number[][]): Point[][] {
    const segments: {p1: Point, p2: Point}[] = [];
    const height = grid.length;
    const width = grid[0].length;

    for (let y = 0; y < height - 1; y++) {
      for (let x = 0; x < width - 1; x++) {
        const val =
          (grid[y][x]     * 1) | // top-left
          (grid[y][x+1]   * 2) | // top-right
          (grid[y+1][x+1] * 4) | // bottom-right
          (grid[y+1][x]   * 8);  // bottom-left

        this.getSegmentsForCell(val, x, y).forEach(seg => segments.push(seg));
      }
    }

    return this.linkSegments(segments);
  }

  private getSegmentsForCell(val: number, x: number, y: number): {p1: Point, p2: Point}[] {
    const top = { x: x + 0.5, y: y };
    const bottom = { x: x + 0.5, y: y + 1 };
    const left = { x: x, y: y + 0.5 };
    const right = { x: x + 1, y: y + 0.5 };

    switch(val) {
      case 0: return [];
      case 1: return [{ p1: top, p2: left }];
      case 2: return [{ p1: top, p2: right }];
      case 3: return [{ p1: left, p2: right }];
      case 4: return [{ p1: right, p2: bottom }];
      case 5: return [{ p1: top, p2: left }, { p1: right, p2: bottom }]; // Swapped with case 10
      case 6: return [{ p1: top, p2: bottom }];
      case 7: return [{ p1: left, p2: bottom }];
      case 8: return [{ p1: left, p2: bottom }];
      case 9: return [{ p1: top, p2: right }];
      case 10: return [{ p1: top, p2: right }, { p1: left, p2: bottom }]; // Swapped with case 5
      case 11: return [{ p1: right, p2: bottom }];
      case 12: return [{ p1: left, p2: right }];
      case 13: return [{ p1: top, p2: right }];
      case 14: return [{ p1: top, p2: left }];
      case 15: return [];
      default: return [];
    }
  }

  private linkSegments(segments: {p1: Point, p2: Point}[]): Point[][] {
    if (segments.length === 0) return [];

    const contours: Point[][] = [];
    const segmentPool = [...segments];

    while(segmentPool.length > 0) {
      let currentContour: Point[] = [];
      let currentSegment = segmentPool.pop()!;
      currentContour.push(currentSegment.p1, currentSegment.p2);

      let closed = false;
      while(!closed && segmentPool.length > 0) {
        const lastPoint = currentContour[currentContour.length - 1];
        let foundNext = false;
        for (let i = segmentPool.length - 1; i >= 0; i--) {
          const next = segmentPool[i];
          if (this.pointsAreEqual(next.p1, lastPoint)) {
            currentContour.push(next.p2);
            segmentPool.splice(i, 1);
            foundNext = true;
            break;
          }
          if (this.pointsAreEqual(next.p2, lastPoint)) {
            currentContour.push(next.p1);
            segmentPool.splice(i, 1);
            foundNext = true;
            break;
          }
        }

        if (!foundNext) {
          // Contour ended without closing, or it's just one segment
          break;
        }

        if (this.pointsAreEqual(currentContour[0], currentContour[currentContour.length-1])) {
          closed = true;
          // remove last point because it's same as first
          currentContour.pop();
        }
      }
      contours.push(currentContour);
    }

    return contours;
  }

  private pointsAreEqual(p1: Point, p2: Point): boolean {
    // Use a small epsilon for float comparison safety
    const epsilon = 1e-5;
    return Math.abs(p1.x - p2.x) < epsilon && Math.abs(p1.y - p2.y) < epsilon;
  }

  private convertToWorldCoordinates(contours: Point[][], cellSize: number, offsetX: number, offsetY: number): number[][][] {
    return contours.map(contour =>
      contour.map(point => [
        (point.x + offsetX) * cellSize,
        (point.y + offsetY) * cellSize
      ])
    );
  }

  private simplify(points: Point[], tolerance: number, highQuality: boolean): Point[] {
    return simplify(points, tolerance, highQuality);
  }
}