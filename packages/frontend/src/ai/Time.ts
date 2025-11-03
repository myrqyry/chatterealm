// packages/frontend/src/ai/Time.ts

export class Time {
  private static instance: Time;
  private lastTime: number;
  private delta: number;
  public scale: number;

  private constructor() {
    this.lastTime = 0;
    this.delta = 0;
    this.scale = 1;
  }

  static getInstance(): Time {
    if (!Time.instance) {
      Time.instance = new Time();
    }
    return Time.instance;
  }

  update(): void {
    const now = performance.now();
    this.delta = (now - this.lastTime) / 1000;
    this.lastTime = now;
  }

  getDelta(): number {
    return this.delta * this.scale;
  }
}
