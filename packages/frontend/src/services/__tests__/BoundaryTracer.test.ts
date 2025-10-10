import { describe, it, expect } from 'vitest';
import { BoundaryTracer } from '../../utils/boundaryTracing';
import { Position } from 'shared';

describe('BoundaryTracer', () => {
  const tracer = new BoundaryTracer();

  it('should return an empty array for empty cells', () => {
    const cells: Position[] = [];
    const boundary = tracer.march(cells, 16);
    expect(boundary).toEqual([]);
  });

  it('should create a simple square boundary', () => {
    const cells: Position[] = [
      { x: 1, y: 1 }, { x: 2, y: 1 },
      { x: 1, y: 2 }, { x: 2, y: 2 },
    ];
    const boundary = tracer.march(cells, 10);

    // The exact output depends on the marching squares implementation and simplification.
    // A reasonable expectation is a simplified polygon representing the outer boundary.
    expect(boundary.length).toBeGreaterThan(3);
    // Further checks could validate the coordinates of the bounding box.
  });

  it('should handle a more complex shape', () => {
    const cells: Position[] = [
      { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
      { x: 1, y: 2 }, { x: 3, y: 2 },
      { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 },
    ];
    const boundary = tracer.march(cells, 10);
    expect(boundary.length).toBeGreaterThan(3);
  });
});