// packages/frontend/src/ai/GameEntity.ts

import { Vector3 } from 'three';
import { Telegram } from './Telegram';

export class GameEntity {
  public name: string;
  public position: Vector3;
  public boundingRadius: number;
  private static nextId = 0;
  public id: number;

  constructor(name = 'GameEntity', position = new Vector3()) {
    this.id = GameEntity.nextId++;
    this.name = name;
    this.position = position;
    this.boundingRadius = 0;
  }

  update(delta: number): void {
    // To be implemented by subclasses
  }

  handleMessage(telegram: Telegram): boolean {
    // To be implemented by subclasses
    return false;
  }
}
