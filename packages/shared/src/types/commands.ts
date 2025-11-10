import { z } from 'zod';

// Define command schemas
export const MoveCommandSchema = z.object({
  command: z.literal('move'),
  direction: z.enum(['north', 'south', 'east', 'west']),
  distance: z.number().optional()
});

export const TradeCommandSchema = z.object({
  command: z.literal('trade'),
  targetPlayer: z.string(),
  offerItems: z.array(z.object({
    itemId: z.string(),
    quantity: z.number()
  })),
  requestItems: z.array(z.object({
    itemId: z.string(),
    quantity: z.number()
  })).optional()
});

export const BuildCommandSchema = z.object({
  command: z.literal('build'),
  structure: z.string(),
  location: z.object({
    x: z.number(),
    y: z.number()
  }),
  rotation: z.number().optional()
});

export const GameCommandSchema = z.discriminatedUnion('command', [
  MoveCommandSchema,
  TradeCommandSchema,
  BuildCommandSchema
]);

export type GameCommand = z.infer<typeof GameCommandSchema>;
