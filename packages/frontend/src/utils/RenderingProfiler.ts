interface RenderStats {
  frameTime: number;
  fps: number;
  biomesRendered: number;
  entitiesRendered: number;
}

export class RenderingProfiler {
  private frameTimings: number[] = [];
  private lastFrameTime: number = performance.now();
  private renderStats: RenderStats = {
    frameTime: 0,
    fps: 0,
    biomesRendered: 0,
    entitiesRendered: 0,
  };

  public profileFrame(renderFunction: () => { biomes: number, entities: number }): RenderStats {
    const startTime = performance.now();

    const { biomes, entities } = renderFunction();

    const endTime = performance.now();
    const frameTime = endTime - startTime;

    this.frameTimings.push(frameTime);
    if (this.frameTimings.length > 60) { // Keep last 60 frames
      this.frameTimings.shift();
    }

    this.updateRenderStats(frameTime, biomes, entities);

    return this.renderStats;
  }

  private updateRenderStats(frameTime: number, biomes: number, entities: number): void {
    const now = performance.now();
    const delta = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    const avgFrameTime = this.frameTimings.reduce((a, b) => a + b, 0) / this.frameTimings.length;

    this.renderStats = {
      frameTime: avgFrameTime,
      fps: 1 / delta,
      biomesRendered: biomes,
      entitiesRendered: entities,
    };
  }
}