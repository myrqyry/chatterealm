import { Player as PlayerData, Position, Stats, PlayerClass } from 'shared';

export class Player {
  id: string;
  name: string;
  position: Position;
  stats: Stats;
  class: PlayerClass;
  connected: boolean;
  lastActive: number;
  bio: string;

  constructor(playerData: PlayerData) {
    this.id = playerData.id;
    this.name = playerData.displayName;
    this.position = playerData.position;
    this.stats = playerData.stats;
    this.class = playerData.class;
    this.connected = true;
    this.lastActive = Date.now();
    this.bio = playerData.bio || '';
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
      bio: this.bio,
    };
  }
}

export function createPlayer(playerData: Partial<PlayerData>): Player {
  const player = new Player({
    id: playerData.id || '',
    displayName: playerData.displayName || 'Anonymous',
    position: playerData.position || { x: 0, y: 0 },
    stats: playerData.stats || { hp: 100, maxHp: 100, attack: 10, defense: 5, speed: 5 },
    class: playerData.class || PlayerClass.KNIGHT,
    connected: true,
    lastActive: Date.now(),
    twitchUsername: playerData.twitchUsername || '',
    avatar: playerData.avatar || 'default_avatar.png',
    health: playerData.health || 100,
    mana: playerData.mana || 100,
    stamina: playerData.stamina || 100,
    hunger: playerData.hunger || 100,
    thirst: playerData.thirst || 100,
    level: playerData.level || 1,
    experience: playerData.experience || 0,
    inventory: playerData.inventory || [],
    equipment: playerData.equipment || {},
    achievements: playerData.achievements || [],
    titles: playerData.titles || [],
    isAlive: playerData.isAlive || true,
    lastMoveTime: playerData.lastMoveTime || 0,
    spawnTime: playerData.spawnTime || Date.now(),
  });
  return player;
}