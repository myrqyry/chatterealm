// Core Game Types for Chat Grid Chronicles

export enum SocketEvents {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  JOIN_GAME = 'join_game',
  GAME_JOINED = 'game_joined',
  PLAYER_COMMAND = 'player_command',
  COMMAND_RESULT = 'command_result',
  GAME_STATE_UPDATE = 'game_state_update',
  PLAYER_JOINED = 'player_joined',
  PLAYER_DISCONNECTED = 'player_disconnected',
  ERROR = 'error',
}

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
  WATER = 'water',
  OCEAN = 'ocean',
  RIVER = 'river',
  MOUNTAIN_PEAK = 'mountain_peak',
  MOUNTAIN = 'mountain',
  HILLS = 'hills',
  SNOW = 'snow',
  ICE = 'ice',
  SNOWY_HILLS = 'snowy_hills',
  DUNES = 'dunes',
  OASIS = 'oasis',
  SAND = 'sand',
  DENSE_JUNGLE = 'dense_jungle',
  JUNGLE = 'jungle',
  DEEP_WATER = 'deep_water',
  MARSH = 'marsh',
  SWAMP = 'swamp',
  DENSE_FOREST = 'dense_forest',
  FOREST = 'forest',
  CLEARING = 'clearing',
  ROLLING_HILLS = 'rolling_hills',
  FLOWER_FIELD = 'flower_field',
  GRASSLAND = 'grassland',
  ROUGH_TERRAIN = 'rough_terrain',
  ANCIENT_RUINS = 'ancient_ruins',
  PLAIN = 'plain',
}

export enum Buff {
  HealthRegen = 'HealthRegen',
  ManaRegen = 'ManaRegen',
  DamageBoost = 'DamageBoost',
  SpeedBoost = 'SpeedBoost',
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

export enum MovementStyle {
  GRID = 'grid',
  FREE = 'free',
  HYBRID = 'hybrid'
}

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
  AUTO = 'auto'
}

export enum NotificationType {
  DESKTOP = 'desktop',
  SOUND = 'sound',
  INGAME = 'ingame'
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
  name?: string; // Made optional for backward compatibility
  twitchUsername: string;
  displayName: string;
  avatar: string; // emoji
  position: Position;
  class: PlayerClass;
  health: number; // Added to player
  mana: number; // Added to player
  stamina: number; // Added to player
  hunger: number; // Added to player
  thirst: number; // Added to player
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
  buffs?: Buff[]; // Added to player
}

export interface JoinGameData {
  id: string;
  displayName: string;
  class: PlayerClass;
  avatar?: string;
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
  tileSize: number; // Standard tile size in pixels for UI rendering
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

// Unified Settings Types
export interface PlayerGameSettings {
  // General Game Settings
  autoSaveEnabled: boolean;
  tutorialEnabled: boolean;
  minimapEnabled: boolean;
  showNPCNames: boolean;
  showItemNames: boolean;
  movementStyle: MovementStyle;

  // Combat Settings
  showDamageNumbers: boolean;
  autoCombatEnabled: boolean;
}

export interface AudioSettings {
  // Volume Controls
  audioMasterVolume: number;
  sfxVolume: number;
  musicVolume: number;

  // Toggle Controls
  soundEnabled: boolean;
  musicEnabled: boolean;
}

export interface NotificationSettings {
  // General Notifications
  desktopNotifications: boolean;
  soundNotifications: boolean;
  battleNotifications: boolean;
  systemNotifications: boolean;

  // Event-specific Notification Types
  playerJoinNotifications: NotificationType[];
  itemDropNotifications: NotificationType[];
  levelUpNotifications: NotificationType[];
  cataclysmNotifications: NotificationType[];
}

export interface VisualSettings {
  // Theme & Appearance
  theme: Theme;
  language: string;
  fontSize: number;

  // Accessibility
  highContrast: boolean;
  reduceMotion: boolean;

  // Visual Display
  showGrid: boolean;
  showParticles: boolean;
  showHealthBars: boolean;
  backgroundColor: string;
}

export interface WorldSettings {
  // World Dimensions
  worldWidth: number;
  worldHeight: number;

  // Terrain Animation
  grassWaveSpeed: number;
  treeSwaySpeed: number;
  flowerSpawnRate: number;
  windSpeed: number;
}

export interface AnimationSettings {
  // Animation Controls
  animationSpeed: number;
  breathingRate: number;
  particleCount: number;

  // Visual Display Settings
  showParticles: boolean;
  showGrid: boolean;

  // Terrain Animation
  grassWaveSpeed: number;
  treeSwaySpeed: number;
  flowerSpawnRate: number;
  windSpeed: number;

  // Rough.js Settings
  roughness: number;
  bowing: number;
  fillWeight: number;
  hachureAngle: number;
  hachureGap: number;
  fillStyle?: string;
  seed?: number;
}

// Combined Settings Type
export interface UnifiedSettings {
  game: PlayerGameSettings;
  audio: AudioSettings;
  notifications: NotificationSettings;
  visual: VisualSettings;
  world: WorldSettings;
  animations: AnimationSettings;
}

// Legacy AnimationSettings interface (keeping for compatibility)
export interface AnimationSettingsLegacy {
  animationSpeed: number;
  showGrid: boolean;
  roughness: number;
  bowing: number;
  fillWeight: number;
  hachureAngle: number;
  hachureGap: number;
  windSpeed?: number;
  grassWaveSpeed?: number;
  treeSwaySpeed?: number;
  flowerSpawnRate?: number;
  showParticles?: boolean;
  breathingRate?: number;
  particleCount?: number;
}
