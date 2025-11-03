/**
 * @class Vector2D
 * @description A class for representing a 2D vector.
 */
export class Vector2D {
  public x: number;
  public y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  public set(x: number, y: number): Vector2D {
    this.x = x;
    this.y = y;
    return this;
  }

  public clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }

  public add(v: Vector2D): Vector2D {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  public sub(v: Vector2D): Vector2D {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  public multiplyScalar(s: number): Vector2D {
    this.x *= s;
    this.y *= s;
    return this;
  }

  public divideScalar(s: number): Vector2D {
    this.x /= s;
    this.y /= s;
    return this;
  }

  public length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  public normalize(): Vector2D {
    return this.divideScalar(this.length() || 1);
  }

  public truncate(max: number): Vector2D {
    // Use squared length to avoid expensive sqrt calculation
    const lengthSq = this.x * this.x + this.y * this.y;
    if (lengthSq > max * max) {
      this.multiplyScalar(max / Math.sqrt(lengthSq));
    }
    return this;
  }

  public dot(v: Vector2D): number {
    return this.x * v.x + this.y * v.y;
  }

  public distanceTo(v: Vector2D): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
