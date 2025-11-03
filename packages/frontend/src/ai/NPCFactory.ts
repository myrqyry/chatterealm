import { AIEntity } from './AITypes';
import { EntityManager } from './EntityManager';
import { GameEntity } from './GameEntity';
import { IdleState } from './fsm/states';
import type { NPC } from 'shared';

/**
 * @class NPCFactory
 * @description A class for creating AI-controlled NPCs.
 */
export class NPCFactory {
  private entityManager: EntityManager;

  constructor(entityManager: EntityManager) {
    this.entityManager = entityManager;
  }

  /**
   * Creates an AI entity from an NPC data object.
   * @param npc The NPC data object.
   * @returns The created AI entity.
   */
  public create(npc: NPC): AIEntity {
    const entity = new GameEntity(this.entityManager, npc.position.x, npc.position.y) as AIEntity;

    // Copy properties from the NPC data object to the entity.
    Object.assign(entity, npc);

    // Set the entity's initial state.
    entity.stateMachine.setCurrentState(new IdleState());

    return entity;
  }
}
