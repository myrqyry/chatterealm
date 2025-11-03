import { SteeringBehavior } from '../SteeringBehavior';
import { GameEntity } from '../../GameEntity';
import { Vector2D } from '../Vector2D';

/**
 * @class WanderBehavior
 * @description A steering behavior that produces a random, natural-looking movement.
 */
export class WanderBehavior extends SteeringBehavior {
  private wanderRadius: number;
  private wanderDistance: number;
  private wanderJitter: number;
  private wanderTarget: Vector2D;

  constructor(radius: number = 5, distance: number = 10, jitter: number = 1) {
    super();
    this.wanderRadius = radius;
    this.wanderDistance = distance;
    this.wanderJitter = jitter;
    this.wanderTarget = new Vector2D();
  }

  public calculate(entity: GameEntity): Vector2D {
    this.wanderTarget.add(
      new Vector2D(
        (Math.random() - 0.5) * 2 * this.wanderJitter,
        (Math.random() - 0.5) * 2 * this.wanderJitter
      )
    );

    this.wanderTarget.normalize().multiplyScalar(this.wanderRadius);

    const target = entity.velocity
      .clone()
      .normalize()
      .multiplyScalar(this.wanderDistance)
      .add(this.wanderTarget)
      .add(entity.position);

    const desiredVelocity = target.clone().sub(entity.position).normalize().multiplyScalar(entity.maxSpeed);
    return desiredVelocity.sub(entity.velocity);

    return steeringForce;
  }
}
