import { State } from '../State';
import { GameEntity } from '../../GameEntity';

/**
 * @class FollowingState
 * @description The state for an entity that is following another entity.
 */
export class FollowingState extends State<GameEntity> {
  public enter(entity: GameEntity): void {}

  public execute(entity: GameEntity): void {}

  public exit(entity: GameEntity): void {}
}
