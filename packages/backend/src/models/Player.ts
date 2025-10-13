import { Player as PlayerData, Position, Stats, PlayerClass } from 'shared';

export class Player {
  id: string;
  name: string;
  position: Position;
  stats: Stats;
  class: PlayerClass;
  connected: boolean;
  lastActive: number;

  constructor(playerData: PlayerData) {
    this.id = playerData.id;
    this.name = playerData.displayName;
    this.position = playerData.position;
    this.stats = playerData.stats;
    this.class = playerData.class;
    this.connected = true;
    this.lastActive = Date.now();
  }

  public move(direction: 'up' | 'down' | 'left' | 'right'): void {
    switch (direction) {
      case 'up':
        this.position.y -= 1;
        break;
      case 'down':
        this.position.y += 1;
        break;
      case 'left':
        this.position.x -= 1;
        break;
      case 'right':
        this.position.x += 1;
        break;
    }
    this.lastActive = Date.now();
  }

  public disconnect(): void {
    this.connected = false;
    this.lastActive = Date.now();
  }

  public reconnect(): void {
    this.connected = true;
    this.lastActive = Date.now();
  }

  public getData(): PlayerData {
    // This method is useful for sending player data to the client
    return {
      ...this,
      displayName: this.name,
      // Ensure all required PlayerData fields are here
      // This is a simplified example
    } as PlayerData;
  }
}