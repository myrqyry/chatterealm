import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Base Types
export const Vector2Schema = z.object({
  x: z.number().describe('X coordinate'),
  y: z.number().describe('Y coordinate'),
});

export const ColorSchema = z.object({
  r: z.number().min(0).max(255).describe('Red component'),
  g: z.number().min(0).max(255).describe('Green component'),
  b: z.number().min(0).max(255).describe('Blue component'),
  a: z.number().min(0).max(1).optional().describe('Alpha component'),
});

// Character Classes
export const CharacterClassSchema = z.enum([
  'warrior', 'mage', 'rogue', 'cleric', 'ranger', 'paladin', 'druid', 'bard'
]);

// Player Schema
export const PlayerBaseSchema = z.object({
  id: z.string().uuid().describe('Unique player identifier'),
  name: z.string().min(1).max(32).describe('Player name'),
  emoji: z.string().min(1).max(4).describe('Player emoji representation'),
  position: Vector2Schema.describe('Player position'),
  color: ColorSchema.describe('Player color'),
  class: CharacterClassSchema.describe('Player character class'),
  health: z.number().min(0).max(100).describe('Current health'),
  maxHealth: z.number().min(1).max(200).describe('Maximum health'),
  experience: z.number().min(0).describe('Experience points'),
  level: z.number().min(1).describe('Player level'),
  inventory: z.array(z.string()).describe('Player inventory items'),
  statusEffects: z.array(z.string()).describe('Active status effects'),
  lastActive: z.string().datetime().describe('Last activity timestamp'),
  isHandDrawn: z.boolean().default(false).describe('Use hand-drawn emoji'),
  combatStyle: z.string().optional().describe('Combat style preference'),
  lootPreferences: z.array(z.string()).optional().describe('Loot preferences'),
});

export const PlayerSchema = PlayerBaseSchema.extend({
  createdAt: z.string().datetime().describe('Player creation timestamp'),
  updatedAt: z.string().datetime().describe('Last update timestamp'),
});

// NPC Schema
export const NPCSchema = z.object({
  id: z.string().uuid().describe('Unique NPC identifier'),
  name: z.string().min(1).max(64).describe('NPC name'),
  emoji: z.string().min(1).max(4).describe('NPC emoji representation'),
  position: Vector2Schema.describe('NPC position'),
  type: z.string().min(1).describe('NPC type'),
  health: z.number().min(0).describe('NPC health'),
  behavior: z.string().describe('NPC behavior pattern'),
  dialogue: z.array(z.string()).describe('Available dialogue options'),
});

// Item Schema
export const ItemSchema = z.object({
  id: z.string().uuid().describe('Unique item identifier'),
  name: z.string().min(1).max(64).describe('Item name'),
  emoji: z.string().min(1).max(4).describe('Item emoji representation'),
  position: Vector2Schema.describe('Item position'),
  type: z.string().min(1).describe('Item type'),
  value: z.number().min(0).describe('Item value'),
  rarity: z.string().describe('Item rarity'),
});

// World State Schema
export const WorldStateSchema = z.object({
  phase: z.enum(['peace', 'cataclysm', 'recovery']).describe('Current game phase'),
  time: z.number().min(0).describe('Current world time'),
  cataclysmProgress: z.number().min(0).max(100).describe('Cataclysm progress percentage'),
  corruptionLevel: z.number().min(0).max(1).describe('World corruption level'),
  lastCataclysm: z.string().datetime().nullable().describe('Last cataclysm timestamp'),
});

// Game World Schema
export const GameWorldSchema = z.object({
  id: z.string().uuid().describe('World identifier'),
  name: z.string().min(1).describe('World name'),
  width: z.number().min(1).describe('World width'),
  height: z.number().min(1).describe('World height'),
  players: z.array(PlayerSchema).describe('Active players'),
  npcs: z.array(NPCSchema).describe('Active NPCs'),
  items: z.array(ItemSchema).describe('World items'),
  state: WorldStateSchema.describe('World state'),
  createdAt: z.string().datetime().describe('World creation timestamp'),
  updatedAt: z.string().datetime().describe('Last world update'),
});

// Message Schema
export const MessageSchema = z.object({
  id: z.string().uuid().describe('Message identifier'),
  sender: z.string().min(1).describe('Message sender'),
  content: z.string().min(1).max(512).describe('Message content'),
  timestamp: z.string().datetime().describe('Message timestamp'),
  emoji: z.string().min(1).max(4).optional().describe('Sender emoji'),
  type: z.enum(['chat', 'system', 'combat', 'loot']).describe('Message type'),
});

// API Request/Response Schemas
export const ApiErrorSchema = z.object({
  error: z.string().describe('Error message'),
  code: z.string().optional().describe('Error code'),
  details: z.array(z.string()).optional().describe('Error details'),
});

// API Response Schemas
export const GetWorldResponseSchema = z.object({
  success: z.boolean().describe('Request success'),
  data: GameWorldSchema.describe('World data'),
  error: ApiErrorSchema.optional().describe('Error information'),
});

export const GetPlayersResponseSchema = z.object({
  success: z.boolean().describe('Request success'),
  data: z.array(PlayerSchema).describe('Players data'),
  error: ApiErrorSchema.optional().describe('Error information'),
});

export const GetPlayerResponseSchema = z.object({
  success: z.boolean().describe('Request success'),
  data: PlayerSchema.describe('Player data'),
  error: ApiErrorSchema.optional().describe('Error information'),
});

// API Request Schemas
export const CreatePlayerRequestSchema = z.object({
  name: z.string().min(1).max(32).describe('Player name'),
  emoji: z.string().min(1).max(4).describe('Player emoji'),
  class: CharacterClassSchema.describe('Character class'),
  color: ColorSchema.describe('Player color'),
  isHandDrawn: z.boolean().default(false).describe('Use hand-drawn emoji'),
});

export const UpdatePlayerRequestSchema = z.object({
  id: z.string().uuid().describe('Player identifier'),
  name: z.string().min(1).max(32).optional().describe('Player name'),
  emoji: z.string().min(1).max(4).optional().describe('Player emoji'),
  class: CharacterClassSchema.optional().describe('Character class'),
  color: ColorSchema.optional().describe('Player color'),
  isHandDrawn: z.boolean().optional().describe('Use hand-drawn emoji'),
});

// Game Command Schema
export const GameCommandRequestSchema = z.object({
  playerId: z.string().uuid().describe('Player identifier'),
  command: z.string().min(1).describe('Game command'),
  args: z.array(z.string()).optional().describe('Command arguments'),
});

// AI Proxy Schema
export const AIProxyRequestSchema = z.object({
  prompt: z.string().min(1).describe('AI prompt'),
  context: z.string().optional().describe('Additional context'),
  model: z.string().optional().describe('AI model'),
});

// OpenAPI Schema Generation
export const generateOpenApiSchema = () => {
  return {
    openapi: '3.0.3',
    info: {
      title: 'ChatterRealm API',
      description: 'API for ChatterRealm - A multiplayer emoji-based game world',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3001/api/v1',
        description: 'Development server',
      },
      {
        url: 'https://api.chatterrealm.com/api/v1',
        description: 'Production server',
      },
    ],
    paths: {
      '/world': {
        get: {
          tags: ['World'],
          summary: 'Get current game world state',
          description: 'Retrieves the complete game world including players, NPCs, and items',
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: GetWorldResponseSchema,
                },
              },
            },
            '404': {
              description: 'World not found',
              content: {
                'application/json': {
                  schema: ApiErrorSchema,
                },
              },
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: ApiErrorSchema,
                },
              },
            },
          },
        },
      },
      '/players': {
        get: {
          tags: ['Players'],
          summary: 'Get all players',
          description: 'Retrieves all active players in the game world',
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: GetPlayersResponseSchema,
                },
              },
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: ApiErrorSchema,
                },
              },
            },
          },
        },
        post: {
          tags: ['Players'],
          summary: 'Create a new player',
          description: 'Creates a new player in the game world',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: CreatePlayerRequestSchema,
              },
            },
          },
          responses: {
            '201': {
              description: 'Player created successfully',
              content: {
                'application/json': {
                  schema: GetPlayerResponseSchema,
                },
              },
            },
            '400': {
              description: 'Invalid request data',
              content: {
                'application/json': {
                  schema: ApiErrorSchema,
                },
              },
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: ApiErrorSchema,
                },
              },
            },
          },
        },
      },
      '/players/{playerId}': {
        get: {
          tags: ['Players'],
          summary: 'Get specific player',
          description: 'Retrieves a specific player by ID',
          parameters: [
            {
              name: 'playerId',
              in: 'path',
              required: true,
              schema: z.string().uuid(),
            },
          ],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: GetPlayerResponseSchema,
                },
              },
            },
            '404': {
              description: 'Player not found',
              content: {
                'application/json': {
                  schema: ApiErrorSchema,
                },
              },
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: ApiErrorSchema,
                },
              },
            },
          },
        },
        put: {
          tags: ['Players'],
          summary: 'Update player',
          description: 'Updates an existing player',
          parameters: [
            {
              name: 'playerId',
              in: 'path',
              required: true,
              schema: z.string().uuid(),
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: UpdatePlayerRequestSchema,
              },
            },
          },
          responses: {
            '200': {
              description: 'Player updated successfully',
              content: {
                'application/json': {
                  schema: GetPlayerResponseSchema,
                },
              },
            },
            '400': {
              description: 'Invalid request data',
              content: {
                'application/json': {
                  schema: ApiErrorSchema,
                },
              },
            },
            '404': {
              description: 'Player not found',
              content: {
                'application/json': {
                  schema: ApiErrorSchema,
                },
              },
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: ApiErrorSchema,
                },
              },
            },
          },
        },
      },
      '/game/command': {
        post: {
          tags: ['Game'],
          summary: 'Execute game command',
          description: 'Executes a game command for a player',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: GameCommandRequestSchema,
              },
            },
          },
          responses: {
            '200': {
              description: 'Command executed successfully',
              content: {
                'application/json': {
                  schema: z.object({
                    success: z.boolean(),
                    message: z.string().optional(),
                  }),
                },
              },
            },
            '400': {
              description: 'Invalid command',
              content: {
                'application/json': {
                  schema: ApiErrorSchema,
                },
              },
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: ApiErrorSchema,
                },
              },
            },
          },
        },
      },
      '/ai-proxy': {
        post: {
          tags: ['AI'],
          summary: 'AI proxy service',
          description: 'Handles AI-related requests',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: AIProxyRequestSchema,
              },
            },
          },
          responses: {
            '200': {
              description: 'AI response',
              content: {
                'application/json': {
                  schema: z.object({
                    response: z.string(),
                    model: z.string().optional(),
                  }),
                },
              },
            },
            '400': {
              description: 'Invalid request',
              content: {
                'application/json': {
                  schema: ApiErrorSchema,
                },
              },
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: ApiErrorSchema,
                },
              },
            },
          },
        },
      },
      '/emoji': {
        get: {
          tags: ['Assets'],
          summary: 'Get emoji SVG',
          description: 'Retrieves an emoji as SVG',
          parameters: [
            {
              name: 'char',
              in: 'query',
              required: true,
              schema: z.string().min(1).max(10),
            },
            {
              name: 'rough',
              in: 'query',
              required: false,
              schema: z.boolean(),
            },
            {
              name: 'roughness',
              in: 'query',
              required: false,
              schema: z.number().min(0).max(10),
            },
            {
              name: 'bowing',
              in: 'query',
              required: false,
              schema: z.number().min(0).max(10),
            },
          ],
          responses: {
            '200': {
              description: 'SVG image',
              content: {
                'image/svg+xml': {
                  schema: z.object({
                    svg: z.string(),
                  }),
                },
              },
            },
            '400': {
              description: 'Invalid emoji request',
              content: {
                'application/json': {
                  schema: ApiErrorSchema,
                },
              },
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: ApiErrorSchema,
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Vector2: zodToJsonSchema(Vector2Schema),
        Color: zodToJsonSchema(ColorSchema),
        Player: zodToJsonSchema(PlayerSchema),
        NPC: zodToJsonSchema(NPCSchema),
        Item: zodToJsonSchema(ItemSchema),
        WorldState: zodToJsonSchema(WorldStateSchema),
        GameWorld: zodToJsonSchema(GameWorldSchema),
        Message: zodToJsonSchema(MessageSchema),
        ApiError: zodToJsonSchema(ApiErrorSchema),
      },
    },
  };
};