import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

interface SmartSuggestionsProps {
  currentInput: string;
  gameContext: {
    recentMessages: string[];
    activeQuests: string[];
    nearbyPlayers: string[];
    currentActivity: string;
  };
  onSelectSuggestion: (suggestion: string) => void;
}

const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  currentInput,
  gameContext,
  onSelectSuggestion
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generateSuggestions = useCallback(
    debounce(async (input: string) => {
      if (input.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);

      try {
        const prompt = `Generate 3 chat message completions for a multiplayer game.

Current input: "${input}"
Game context:
- Recent messages: ${gameContext.recentMessages.slice(-3).join('; ')}
- Active quests: ${gameContext.activeQuests.join(', ')}
- Nearby players: ${gameContext.nearbyPlayers.join(', ')}
- Current activity: ${gameContext.currentActivity}

Suggestions should:
1. Complete or enhance the current input
2. Be contextually relevant to the game state
3. Be concise (max 100 characters)
4. Use appropriate gaming terminology
5. Include common actions like coordinating, greeting, asking for help

Return only the 3 suggestions as a JSON array of strings.`;

        const response = await fetch('/api/ai-proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gemini-pro',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: 'object',
                properties: {
                  suggestions: {
                    type: 'array',
                    items: { type: 'string' },
                    minItems: 3,
                    maxItems: 3,
                  },
                },
                required: ['suggestions'],
              },
              temperature: 0.8,
              maxOutputTokens: 200,
            },
          }),
        });

        const parsed = await response.json();
        setSuggestions(parsed.suggestions);
      } catch (error) {
        console.error('Failed to generate suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 500),
    [gameContext]
  );

  useEffect(() => {
    generateSuggestions(currentInput);
  }, [currentInput, generateSuggestions]);

  if (suggestions.length === 0 && !loading) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
      {loading ? (
        <div className="p-3 text-gray-400 text-sm">Generating suggestions...</div>
      ) : (
        suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelectSuggestion(suggestion)}
            className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
          >
            <span className="text-blue-400 mr-2">Tab {index + 1}:</span>
            {suggestion}
          </button>
        ))
      )}
    </div>
  );
};

export default SmartSuggestions;
