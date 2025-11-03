// packages/frontend/src/ai/EntityManager.ts

import { GameEntity } from './GameEntity';

export class EntityManager {
  private entities: Map<number, GameEntity> = new Map();

  addEntity(entity: GameEntity): void {
    this.entities.set(entity.id, entity);
  }

  removeEntity(entity: GameEntity): void {
    this.entities.delete(entity.id);
  }

  getEntityById(id: number): GameEntity | undefined {
    return this.entities.get(id);
  }

  updateEntities(delta: number): void {
    for (const entity of this.entities.values()) {
      entity.update(delta);
    }
  }

  getAllEntities(): GameEntity[] {
    return Array.from(this.entities.values());
  }
}
