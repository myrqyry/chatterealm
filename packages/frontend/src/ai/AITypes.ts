import { GameEntity } from './GameEntity';
import type { NPC } from 'shared';

export type AIEntity = GameEntity & Omit<NPC, 'id'>;
