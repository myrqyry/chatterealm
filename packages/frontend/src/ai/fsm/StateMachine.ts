import { GameEntity } from '../GameEntity';
import { State } from './State';

/**
 * @class StateMachine
 * @description A class for managing the states of a game entity.
 */
export class StateMachine<T extends GameEntity> {
  private owner: T;
  private currentState: State<T> | null = null;
  private previousState: State<T> | null = null;
  private globalState: State<T> | null = null;

  constructor(owner: T) {
    this.owner = owner;
  }

  /**
   * Updates the state machine.
   */
  public update(delta: number): void {
    if (this.globalState) {
      this.globalState.execute(this.owner, delta);
    }

    if (this.currentState) {
      this.currentState.execute(this.owner, delta);
    }
  }

  /**
   * Changes the current state.
   * @param newState The new state.
   */
  public changeState(newState: State<T>): void {
    if (this.currentState) {
      this.previousState = this.currentState;
      this.currentState.exit(this.owner);
    }

    this.currentState = newState;
    this.currentState.enter(this.owner);
  }

  /**
   * Reverts to the previous state.
   */
  public revertToPreviousState(): void {
    if (this.previousState) {
      this.changeState(this.previousState);
    }
  }

  /**
   * Sets the current state.
   * @param state The new state.
   */
  public setCurrentState(state: State<T>): void {
    this.currentState = state;
  }

  /**
   * Sets the previous state.
   * @param state The new state.
   */
  public setPreviousState(state: State<T>): void {
    this.previousState = state;
  }

  /**
   * Sets the global state.
   * @param state The new state.
   */
  public setGlobalState(state: State<T>): void {
    this.globalState = state;
  }
}
