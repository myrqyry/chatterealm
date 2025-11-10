import { z } from 'zod';

export const ModerationResultSchema = z.object({
  isViolation: z.boolean(),
  severity: z.enum(['none', 'low', 'medium', 'high', 'critical']),
  categories: z.array(z.enum([
    'harassment',
    'hate_speech',
    'sexual_content',
    'violence',
    'spam',
    'self_harm',
    'none'
  ])),
  explanation: z.string(),
  suggestedAction: z.enum(['allow', 'flag', 'filter', 'block', 'ban']),
  filteredMessage: z.string().optional()
});

export type ModerationResult = z.infer<typeof ModerationResultSchema>;
