import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { GameCommand, GameCommandSchema } from '@chatterealm/shared';

class NaturalLanguageCommandParser {
  async parseCommand(naturalLanguageInput: string): Promise<GameCommand | null> {
    try {
      const response = await fetch('/api/ai-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gemini-pro',
          contents: [{
            role: 'user', parts: [{
              text: `Parse this game command: "${naturalLanguageInput}"

          Extract the command type and relevant parameters. Examples:
          - "walk 5 steps north" → move command
          - "trade my 10 wood for 5 stone with PlayerX" → trade command
          - "build a house at coordinates 10, 20 facing east" → build command`}]}],
          config: {
            responseMimeType: 'application/json',
            responseSchema: zodToJsonSchema(GameCommandSchema),
          },
        }),
      });

      const parsedCommand = await response.json();
      return GameCommandSchema.parse(parsedCommand);
    } catch (error) {
      console.error('Failed to parse command:', error);
      return null;
    }
  }
}

export default new NaturalLanguageCommandParser();
