import { GameEntity } from '../GameEntity';

/**
 * @class MemoryRecord
 * @description A class for representing a memory of a game entity.
 */
export class MemoryRecord {
  public entity: GameEntity;
  public lastSeen: number;

  constructor(entity: GameEntity) {
    this.entity = entity;
    this.lastSeen = Date.now();
  }
}

/**
 * @class MemorySystem
 * @description A class for representing the memory of a game entity.
 */
export class MemorySystem {
  private owner: GameEntity;
  private memoryMap: Map<number, MemoryRecord>;
  public memorySpan: number;

  constructor(owner: GameEntity, memorySpan: number = 10000) {
    this.owner = owner;
    this.memoryMap = new Map();
    this.memorySpan = memorySpan;
  }

  /**
   * Adds or updates a memory of an entity.
   * @param entity The entity to remember.
   */
  public updateMemory(entity: GameEntity): void {
    const record = this.memoryMap.get(entity.id);

    if (record) {
      record.lastSeen = Date.now();
    } else {
      this.memoryMap.set(entity.id, new MemoryRecord(entity));
    }
  }

  /**
   * Removes a memory of an entity.
   * @param entity The entity to forget.
   */
  public forgetEntity(entity: GameEntity): void {
    this.memoryMap.delete(entity.id);
  }

  /**
   * Returns true if the owner has a memory of the given entity.
   * @param entity The entity to check for.
   * @returns True if the owner has a memory of the given entity.
   */
  public hasMemoryOf(entity: GameEntity): boolean {
    return this.memoryMap.has(entity.id);
  }

  /**
   * Removes any memories that are older than the memory span.
   */
  public updateSystem(): void {
    const now = Date.now();
    for (const record of this.memoryMap.values()) {
      if (now - record.lastSeen > this.memorySpan) {
        this.forgetEntity(record.entity);
      }
    }
  }
}
