import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { usePostAiProxy } from '@/api/generated/ai/ai';
import { AIProxyRequest } from '@/api/schemas';
import { toast } from '@/components/ui/ui/use-toast';

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
  const [error, setError] = useState<string | null>(null);
  const [optimisticSuggestions, setOptimisticSuggestions] = useState<string[]>([]);

  // TanStack Query mutation for AI proxy with enhanced error handling
  const { mutate: postAiProxy, isPending: isMutating } = usePostAiProxy({
    onSuccess: (data) => {
      try {
        // Check if response is valid JSON
        if (!data.data.response || typeof data.data.response !== 'string') {
          throw new Error('Invalid AI response format');
        }

        // Parse the JSON response to extract suggestions
        const parsed = JSON.parse(data.data.response);

        if (!Array.isArray(parsed.suggestions) || parsed.suggestions.length !== 3) {
          throw new Error('Invalid suggestions format - expected 3 suggestions');
        }

        setSuggestions(parsed.suggestions);
        setError(null);
      } catch (error) {
        console.error('Failed to parse AI response:', error);
        setError('Failed to process AI response');
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error('Failed to generate suggestions:', error);
      setError(`Failed to generate suggestions: ${error.response?.data?.error || error.message}`);
      setSuggestions([]);

      // Show user-friendly error notification
      toast({
        title: 'AI Suggestions Error',
        description: error.response?.data?.error || 'Failed to generate suggestions',
        variant: 'destructive',
      });

      setLoading(false);
    },
    retry: 1, // Retry failed requests once
    retryDelay: 1000, // Wait 1 second before retry
  });

  const generateSuggestions = useCallback(
    debounce(async (input: string) => {
      // Clear previous error and suggestions
      setError(null);
      setSuggestions([]);

      if (input.length < 2) {
        return;
      }

      setLoading(true);

      // Generate optimistic suggestions based on input pattern
      const generateOptimisticSuggestions = (text: string): string[] => {
        const lowerText = text.toLowerCase();

        // Basic pattern matching for common game scenarios
        if (lowerText.includes('help') || lowerText.includes('?')) {
          return [
            `🙏 Can someone help me with this?`,
            `💬 Does anyone know how to handle ${text}?`,
            `🔍 I need assistance with ${text}!`
          ];
        }

        if (lowerText.includes('attack') || lowerText.includes('fight')) {
          return [
            `🗡️ Let's attack the ${text} together!`,
            `⚔️ Who wants to join me in fighting ${text}?`,
            `🛡️ Preparing to attack ${text} - cover me!`
          ];
        }

        if (lowerText.includes('quest') || lowerText.includes('mission')) {
          return [
            `🏆 Starting quest: ${text} - let's go!`,
            `🗺️ Does anyone want to join my ${text} quest?`,
            `🎯 Focused on ${text} mission - need backup!`
          ];
        }

        // Default optimistic suggestions
        return [
          `💬 ${text} - what do you think?`,
          `🚀 ${text} sounds like a plan!`,
          `🤔 Has anyone tried ${text} before?`
        ];
      };

      // Show optimistic suggestions immediately for better UX
      const optimisticSuggestions = generateOptimisticSuggestions(input);
      setOptimisticSuggestions(optimisticSuggestions);

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

        const requestData: AIProxyRequest = {
          prompt: prompt,
          model: 'gemini-pro',
          context: JSON.stringify({
            recentMessages: gameContext.recentMessages.slice(-3),
            activeQuests: gameContext.activeQuests,
            nearbyPlayers: gameContext.nearbyPlayers,
            currentActivity: gameContext.currentActivity
          })
        };

        postAiProxy({ data: requestData });
      } catch (error) {
        console.error('Failed to generate suggestions:', error);
        setError('Failed to prepare AI request');
        setSuggestions([]);
        setLoading(false);
      }
    }, 500),
    [gameContext, postAiProxy]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      generateSuggestions.cancel();
    };
  }, [generateSuggestions]);

  useEffect(() => {
    if (currentInput.trim().length >= 2) {
      generateSuggestions(currentInput);
    } else {
      setSuggestions([]);
      setError(null);
    }
  }, [currentInput, generateSuggestions]);

  if (error) {
    return (
      <div className="absolute bottom-full left-0 right-0 mb-2 bg-red-900/80 backdrop-blur-sm rounded-lg shadow-xl border border-red-700 p-3">
        <div className="text-red-200 text-sm font-medium">
          ⚠️ {error}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0 && !loading && !isMutating && optimisticSuggestions.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
      {loading || isMutating ? (
        <div className="p-3 text-gray-400 text-sm flex items-center gap-2">
          <span className="animate-pulse">🤖</span>
          <span>Generating suggestions...</span>
        </div>
      ) : (
        (suggestions.length > 0 ? suggestions : optimisticSuggestions).map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelectSuggestion(suggestion)}
            className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
            disabled={loading || isMutating}
          >
            <span className="text-blue-400 mr-2">Tab {index + 1}:</span>
            <span className="truncate max-w-full">{suggestion}</span>
          </button>
        ))
      )}
    </div>
  );
};

export default SmartSuggestions;
