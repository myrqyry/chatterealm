import { BoundaryTracer } from './boundaryTracing';

describe('BoundaryTracer', () => {
  let tracer: BoundaryTracer;

  beforeEach(() => {
    tracer = new BoundaryTracer();
  });

  it('should correctly handle marching squares case 9', () => {
    const cells = [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
    ];
    const grid = [
      [1, 0],
      [1, 0],
    ];

    // @ts-ignore - private method
    const segments = tracer.getSegmentsForCell(9, 0, 0);
    expect(segments).toEqual([{ p1: { x: 0.5, y: 0 }, p2: { x: 1, y: 0.5 } }]);
  });
});