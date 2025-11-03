// packages/frontend/src/ai/AITypes.ts

import { GameEntity } from './GameEntity';

export type AIEntity = GameEntity;

export interface ITelegram {
  sender: number;
  receiver: number;
  message: string;
  dispatchTime: number;
  extraInfo?: unknown;
}
