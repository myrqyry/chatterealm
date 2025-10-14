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
      id: this.id,
      displayName: this.name,
      position: this.position,
      stats: this.stats,
      class: this.class,
      connected: this.connected,
      lastActive: this.lastActive,
      twitchUsername: '', // Add missing properties with default values
      avatar: '',
      health: this.stats.hp,
      mana: 0,
      stamina: 0,
      hunger: 0,
      thirst: 0,
      level: 1,
      experience: 0,
      inventory: [],
      equipment: {},
      achievements: [],
      titles: [],
      isAlive: this.stats.hp > 0,
      lastMoveTime: 0,
      spawnTime: 0,
    };
  }
}