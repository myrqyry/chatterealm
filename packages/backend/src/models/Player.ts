import {
  Player as PlayerData,
  Position,
  Stats,
  PlayerClass,
  Item,
  CharacterClass,
  CharacterVisual,
  ClassAbility,
  Buff,
} from '@chatterealm/shared';

export class Player {
  id: string;
  name: string;
  position: Position;
  stats: Stats;
  class: PlayerClass;
  connected: boolean;
  lastActive: number;
  bio: string;

  // Add all other PlayerData properties
  twitchUsername?: string;
  avatar: string;
  health: number;
  mana: number;
  stamina: number;
  hunger: number;
  thirst: number;
  level: number;
  experience: number;
  inventory: Item[];
  equipment: {
    weapon?: Item;
    armor?: Item;
    accessory?: Item;
  };
  achievements: string[];
  titles: string[];
  isAlive: boolean;
  lastMoveTime: number;
  spawnTime: number;
  buffs?: Buff[];
  characterClass?: CharacterClass;
  visual?: CharacterVisual;
  abilities?: ClassAbility[];
  resources?: { [key: string]: number };
  characterStats?: {
    vitality: number;
    intellect: number;
    agility: number;
    perception: number;
    resonance: number;
    scavenge: number;
  };

  constructor(playerData: Partial<PlayerData>) {
    this.id = playerData.id || '';
    this.name = playerData.displayName || 'Anonymous';
    this.position = playerData.position || { x: 0, y: 0 };
    this.stats = playerData.stats || { hp: 100, maxHp: 100, attack: 10, defense: 5, speed: 5 };
    this.class = playerData.class || PlayerClass.KNIGHT;
    this.connected = playerData.connected ?? true;
    this.lastActive = playerData.lastActive ?? Date.now();
    this.bio = playerData.bio || '';
    this.twitchUsername = playerData.twitchUsername || '';
    this.avatar = playerData.avatar || 'default_avatar.png';
    this.health = playerData.health ?? 100;
    this.mana = playerData.mana ?? 100;
    this.stamina = playerData.stamina ?? 100;
    this.hunger = playerData.hunger ?? 100;
    this.thirst = playerData.thirst ?? 100;
    this.level = playerData.level ?? 1;
    this.experience = playerData.experience ?? 0;
    this.inventory = playerData.inventory ?? [];
    this.equipment = playerData.equipment ?? {};
    this.achievements = playerData.achievements ?? [];
    this.titles = playerData.titles ?? [];
    this.isAlive = playerData.isAlive ?? true;
    this.lastMoveTime = playerData.lastMoveTime ?? 0;
    this.spawnTime = playerData.spawnTime ?? Date.now();
    this.buffs = playerData.buffs ?? [];
    this.characterClass = playerData.characterClass;
    this.visual = playerData.visual;
    this.abilities = playerData.abilities ?? [];
    this.resources = playerData.resources ?? {};
    this.characterStats = playerData.characterStats ?? { vitality: 1, intellect: 1, agility: 1, perception: 1, resonance: 1, scavenge: 1 };
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
      bio: this.bio,
      twitchUsername: this.twitchUsername,
      avatar: this.avatar,
      health: this.health,
      mana: this.mana,
      stamina: this.stamina,
      hunger: this.hunger,
      thirst: this.thirst,
      level: this.level,
      experience: this.experience,
      inventory: this.inventory,
      equipment: this.equipment,
      achievements: this.achievements,
      titles: this.titles,
      isAlive: this.isAlive,
      lastMoveTime: this.lastMoveTime,
      spawnTime: this.spawnTime,
      buffs: this.buffs,
      characterClass: this.characterClass,
      visual: this.visual,
      abilities: this.abilities,
      resources: this.resources,
      characterStats: this.characterStats,
    };
  }
}