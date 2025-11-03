import { State } from '../State';
import { GameEntity } from '../../GameEntity';

/**
 * @class IdleState
 * @description The state for an entity that is idle.
 */
export class IdleState extends State<GameEntity> {
  public enter(entity: GameEntity): void {
    console.log(`${entity.name} is now idle.`);
  }

  public execute(entity: GameEntity): void {
    // In a real game, the entity would look for things to do here.
  }

  public exit(entity: GameEntity): void {
    console.log(`${entity.name} is no longer idle.`);
  }
}
