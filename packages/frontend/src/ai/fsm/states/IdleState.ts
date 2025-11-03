import { State } from '../State';
import { WanderBehavior } from '../../steering/behaviors/WanderBehavior';
import { AIEntity } from '../../AITypes';

/**
 * @class IdleState
 * @description The state for an entity that is idle.
 */
export class IdleState extends State<AIEntity> {
  public enter(entity: AIEntity): void {
    entity.steering = new WanderBehavior();
    console.log(`${entity.name} is now idle and wandering.`);
  }

  public execute(entity: AIEntity): void {
    // The wandering behavior is handled by the GameEntity's update method.
  }

  public exit(entity: AIEntity): void {
    entity.steering = null;
    console.log(`${entity.name} is no longer idle.`);
  }
}
