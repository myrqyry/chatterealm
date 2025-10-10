// Core Game Types for Chat Grid Chronicles
import { CharacterClass, CharacterVisual, ClassAbility } from './characterClasses';

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

export enum BuildingType {
  HOUSE = 'house',
  CASTLE = 'castle',
  TOWER = 'tower',
  SHOP = 'shop',
  TAVERN = 'tavern',
  TEMPLE = 'temple',
  FARM = 'farm',
  MILL = 'mill',
  BRIDGE = 'bridge',
  WALL = 'wall',
  GATE = 'gate',
  RUINS = 'ruins',
  SHRINE = 'shrine',
  WATCHTOWER = 'watchtower',
  STABLES = 'stables',
  BLACKSMITH = 'blacksmith',
  LIBRARY = 'library',
  LABORATORY = 'laboratory',
  WAREHOUSE = 'warehouse',
  BUNKER = 'bunker'
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
  NIGHT = 'night',
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

export interface Building {
  id:string;
  type: BuildingType;
  emoji: string;
  roughSvg?: string;
  position: Position;
  name: string;
  description: string;
  size: { width: number; height: number }; // in grid tiles
  isAccessible: boolean;
  providesBuff?: Buff;
  spawnChance: number;
  terrainPreference: TerrainType[]; // Which terrain types this building prefers
}

export interface Player {
  id: string;
  name?: string; // Made optional for backward compatibility
  twitchUsername?: string; // Made optional for new character creation system
  displayName: string;
  avatar: string; // emoji
  position: Position;
  class: PlayerClass;
  characterClass?: CharacterClass;
  visual?: CharacterVisual;
  health: number; // Added to player
  mana: number; // Added to player
  stamina: number; // Added to player
  hunger: number; // Added to player
  thirst: number; // Added to player
  stats: Stats;
  characterStats?: {
    vitality: number;
    intellect: number;
    agility: number;
    perception: number;
    resonance: number;
    scavenge: number;
  };
  abilities?: ClassAbility[];
  resources?: { [key: string]: number };
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
  // Tarkov-style looting properties
  isHidden: boolean; // Item starts hidden and must be revealed
  revealStartTime?: number; // When the reveal process started
  revealDuration: number; // How long it takes to fully reveal (based on rarity)
  revealProgress: number; // 0-1, how much of the item is revealed
  lastInteractionTime?: number; // Last time player interacted with this item
  canBeLooted: boolean; // Whether the item can be picked up
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

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface Biome {
  type: TerrainType;
  cells: Position[];
  bounds: BoundingBox;
}

export interface GameWorld {
  id: string;
  grid: Terrain[][];
  players: Player[];
  npcs: NPC[];
  items: Item[];
  buildings: Building[];
  cataclysmCircle: {
    center: Position;
    radius: number;
    isActive: boolean;
    shrinkRate: number;
    nextShrinkTime: number;
  };
  cataclysmRoughnessMultiplier: number; // Multiplier for terrain roughness during cataclysm (1.0 = normal, higher = more chaotic)
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
  nightMode: boolean; // Toggle for night time rendering effects
  // Tarkov-style looting settings
  lootingEnabled: boolean;
  itemRevealTimes: Record<ItemRarity, number>; // Reveal duration in milliseconds for each rarity
  maxItemsPerTile: number; // Maximum items that can spawn in one tile
  itemSpawnRate: number; // Chance of item spawning when terrain regenerates
  lootInteractionRadius: number; // How close player needs to be to interact with loot
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
  // Tarkov-style looting events
  item_reveal_update: (itemId: string, revealProgress: number) => void;
  loot_success: (item: Item) => void;
  loot_failure: (reason: string) => void;
}

export interface ClientToServerEvents {
  join_game: (playerData: Partial<Player>) => void;
  move_player: (direction: 'up' | 'down' | 'left' | 'right') => void;
  use_item: (itemId: string) => void;
  chat_command: (command: string) => void;
  // Tarkov-style looting events
  loot_item: (itemId: string) => void;
  inspect_item: (itemId: string) => void;
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

  // Performance Settings
  renderScale: number; // 0.25-1.0, lower values render at smaller resolution for better performance
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

  // World Rendering
  nightMode: boolean;
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
  strokeWidth: number;
  simplification: number;
  dashOffset: number;
  dashGap: number;
  zigzagOffset: number;
  curveFitting: number;
  curveTightness: number;
  curveStepCount: number;
  fillShapeRoughnessGain: number;
  disableMultiStroke: boolean;
  disableMultiStrokeFill: boolean;
  preserveVertices: boolean;
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

// Auto-wander types
export interface WanderSettings {
  maxRiskLevel: number;
  stopOnDanger: boolean;
  maxDistance: number;
  avoidHighLevelAreas: boolean;
  prioritizeLoot: string[];
}

export interface DangerAssessment {
  level: number;
  threats: string[];
}

export type DangerLevel = number;

// Tarkov-style looting types
export interface LootingSession {
  playerId: string;
  buildingId: string;
  startTime: number;
  duration: number;
  revealedItems: Item[];
  totalItems: number;
  canceled: boolean;
}

export interface LootResult {
  success: boolean;
  message: string;
}

// Hand-drawn building types
export interface HandDrawnBuilding {
  type: BuildingType;
  size: { width: number; height: number };
  roughSvg: string;
  lootCapacity: number;
  searchTime: number;
  dangerLevel: number;
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
