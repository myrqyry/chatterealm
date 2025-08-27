// Core Game Types for Chat Grid Chronicles

export interface Position {
  x: number;
  y: number;
}

export interface Stats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
}

export enum TerrainType {
  PLAIN = 'plain',
  FOREST = 'forest',
  MOUNTAIN = 'mountain'
}

export enum PlayerClass {
  KNIGHT = 'knight',
  ROGUE = 'rogue',
  MAGE = 'mage'
}

export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  UTILITY = 'utility',
  CONSUMABLE = 'consumable'
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export interface Terrain {
  type: TerrainType;
  position: Position;
  movementCost: number;
  defenseBonus: number;
  visibilityModifier: number;
}

export interface Player {
  id: string;
  twitchUsername: string;
  displayName: string;
  avatar: string; // emoji
  position: Position;
  class: PlayerClass;
  stats: Stats;
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
  connected: boolean; // Track if player is currently connected
  lastActive: number; // Timestamp of last activity for cleanup
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  description: string;
  stats?: Partial<Stats>;
  specialEffect?: string;
  position?: Position; // for items on ground
  ownerId?: string; // for items in inventory
  durability?: number;
  maxDurability?: number;
}

export interface NPC {
  id: string;
  name: string;
  type: string;
  position: Position;
  stats: Stats;
  behavior: 'aggressive' | 'defensive' | 'passive' | 'wandering';
  lootTable: Item[];
  isAlive: boolean;
  lastMoveTime: number;
}

export interface GameWorld {
  id: string;
  grid: Terrain[][];
  players: Player[];
  npcs: NPC[];
  items: Item[];
  cataclysmCircle: {
    center: Position;
    radius: number;
    isActive: boolean;
    shrinkRate: number;
    nextShrinkTime: number;
  };
  worldAge: number;
  lastResetTime: number;
  phase: 'exploration' | 'cataclysm' | 'rebirth';
}

export interface GameState {
  world: GameWorld;
  activePlayers: Map<string, Player>;
  chatCommands: ChatCommand[];
  gameSettings: GameSettings;
}

export interface ChatCommand {
  id: string;
  username: string;
  command: string;
  args: string[];
  timestamp: number;
  processed: boolean;
}

export interface GameSettings {
  gridWidth: number;
  gridHeight: number;
  maxPlayers: number;
  cataclysmDuration: number;
  spawnCost: number; // channel points
  autoWanderCost: number;
  baseStats: Record<PlayerClass, Stats>;
  terrainConfig: Record<TerrainType, {
    movementCost: number;
    defenseBonus: number;
    visibilityModifier: number;
    spawnChance: number;
  }>;
}

export interface BattleResult {
  winner: Player | NPC;
  loser: Player | NPC;
  damage: number;
  experience: number;
  loot?: Item[];
  timestamp: number;
}

export interface GameEvent {
  id: string;
  type: 'player_join' | 'player_move' | 'battle' | 'item_drop' | 'cataclysm_start' | 'world_reset';
  data: any;
  timestamp: number;
}

// Socket.io event types
export interface ServerToClientEvents {
  world_update: (world: GameWorld) => void;
  player_update: (player: Player) => void;
  battle_result: (result: BattleResult) => void;
  game_event: (event: GameEvent) => void;
  chat_response: (message: string) => void;
}

export interface ClientToServerEvents {
  join_game: (playerData: Partial<Player>) => void;
  move_player: (direction: 'up' | 'down' | 'left' | 'right') => void;
  use_item: (itemId: string) => void;
  chat_command: (command: string) => void;
}
