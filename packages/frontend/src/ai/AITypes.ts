import { GameEntity } from './GameEntity';
import type { NPC } from 'shared';

export type AIEntity = GameEntity & NPC;

export enum AIMessageType {
  // Generic messages
  ATTACK = 'ATTACK',
  TAKE_DAMAGE = 'TAKE_DAMAGE',
  HEAL = 'HEAL',

  // Movement messages
  MOVE_TO_POSITION = 'MOVE_TO_POSITION',
  STOP_MOVING = 'STOP_MOVING',

  // Communication messages
  PLAYER_NEARBY = 'PLAYER_NEARBY',
  PLAYER_TOO_FAR = 'PLAYER_TOO_FAR',
  PLAYER_ATTACKING = 'PLAYER_ATTACKING',

  // State-related messages
  STATE_CHANGE = 'STATE_CHANGE',
  ENTER_COMBAT = 'ENTER_COMBAT',
  LEAVE_COMBAT = 'LEAVE_COMBAT',

  // Item-related messages
  ITEM_SPAWNED = 'ITEM_SPAWNED',
  ITEM_PICKED_UP = 'ITEM_PICKED_UP',
}
