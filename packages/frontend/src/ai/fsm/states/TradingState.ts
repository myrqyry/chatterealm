import { State } from '../State';
import { GameEntity } from '../../GameEntity';

/**
 * @class TradingState
 * @description The state for an entity that is trading.
 */
export class TradingState extends State<GameEntity> {
  public enter(entity: GameEntity): void {}

  public execute(entity: GameEntity): void {}

  public exit(entity: GameEntity): void {}
}
