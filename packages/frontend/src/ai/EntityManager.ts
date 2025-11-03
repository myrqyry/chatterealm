import { GameEntity } from './GameEntity';
import { MessageDispatcher } from './MessageDispatcher';
import { NPCFactory } from './NPCFactory';

export class EntityManager {
  private entities: Map<number, GameEntity> = new Map();
  public messageDispatcher: MessageDispatcher;
  public npcFactory!: NPCFactory;

  constructor() {
    this.messageDispatcher = new MessageDispatcher(this);
  }

  public setNPCFactory(factory: NPCFactory): void {
    this.npcFactory = factory;
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

  public getEntities(): IterableIterator<GameEntity> {
    return this.entities.values();
  }

  public update(delta: number): void {
    this.messageDispatcher.dispatchDelayedMessages();

    for (const entity of this.entities.values()) {
      entity.update(delta);
    }
  }
}
