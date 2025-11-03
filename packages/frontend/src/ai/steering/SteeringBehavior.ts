import { GameEntity } from '../GameEntity';
import { Vector2D } from './Vector2D';

/**
 * @class SteeringBehavior
 * @description The base class for all steering behaviors.
 */
export abstract class SteeringBehavior {
  /**
   * Calculates the steering force for an entity.
   * @param entity The entity to calculate the steering force for.
   * @returns The calculated steering force.
   */
  public abstract calculate(entity: GameEntity): Vector2D;
}
