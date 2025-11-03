import { GameEntity } from '../GameEntity';
import { EntityManager } from '../EntityManager';
import { Vector2D } from '../steering/Vector2D';

/**
 * @class Vision
 * @description A class for representing the vision of a game entity.
 */
export class Vision {
  private owner: GameEntity;
  private entityManager: EntityManager;
  public range: number;
  public fieldOfView: number;

  constructor(owner: GameEntity, entityManager: EntityManager, range: number = 10, fieldOfView: number = Math.PI / 2) {
    this.owner = owner;
    this.entityManager = entityManager;
    this.range = range;
    this.fieldOfView = fieldOfView;
  }

  /**
   * Returns a list of all entities within the vision of the owner.
   * @returns A list of all entities within the vision of the owner.
   */
  public getVisibleEntities(): GameEntity[] {
    const visibleEntities: GameEntity[] = [];

    for (const entity of this.entityManager.getEntities()) {
      if (entity === this.owner) {
        continue;
      }

      const toEntity = entity.position.clone().sub(this.owner.position);
      const distance = toEntity.length();

      if (distance > this.range) {
        continue;
      }

      const angle = this.owner.velocity.clone().normalize().dot(toEntity.normalize());

      if (angle < Math.cos(this.fieldOfView / 2)) {
        continue;
      }

      visibleEntities.push(entity);
    }

    return visibleEntities;
  }
}
