import { SteeringBehavior } from '../SteeringBehavior';
import { GameEntity } from '../../GameEntity';
import { Vector2D } from '../Vector2D';

/**
 * @class SeekBehavior
 * @description A steering behavior that directs an entity toward a target.
 */
export class SeekBehavior extends SteeringBehavior {
  private target: Vector2D;

  constructor(target: Vector2D) {
    super();
    this.target = target;
  }

  public calculate(entity: GameEntity): Vector2D {
    const desiredVelocity = this.target.clone().sub(entity.position).normalize().multiplyScalar(entity.maxSpeed);
    return desiredVelocity.sub(entity.velocity);
    return steeringForce;
  }
}
