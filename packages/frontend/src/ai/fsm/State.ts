import { GameEntity } from '../GameEntity';

/**
 * @class State
 * @description The base class for all FSM states.
 */
export abstract class State<T extends GameEntity> {
  /**
   * This method is called when the state is entered.
   * @param entity The entity that owns this state.
   */
  public abstract enter(entity: T): void;

  /**
   * This method is called on each update cycle.
   * @param entity The entity that owns this state.
   */
  public abstract execute(entity: T): void;

  /**
   * This method is called when the state is exited.
   * @param entity The entity that owns this state.
   */
  public abstract exit(entity: T): void;
}
