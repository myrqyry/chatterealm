import { GameEntity } from './GameEntity';
import { MessageDispatcher } from './MessageDispatcher';

export class EntityManager {
  private entities: Map<number, GameEntity> = new Map();
  public messageDispatcher: MessageDispatcher;

  constructor() {
    this.messageDispatcher = new MessageDispatcher(this);
  }

  public add(entity: GameEntity): void {
    this.entities.set(entity.id, entity);
  }

  public remove(entity: GameEntity): void {
    this.entities.delete(entity.id);
  }

  public get(id: number): GameEntity | undefined {
    return this.entities.get(id);
  }

  public update(delta: number): void {
    this.messageDispatcher.dispatchDelayedMessages();

    for (const entity of this.entities.values()) {
      entity.update(delta);
    }
  }
}
