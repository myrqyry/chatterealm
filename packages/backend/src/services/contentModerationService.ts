import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ModerationResult, ModerationResultSchema } from '@chatterealm/shared';
import GeminiClient from './geminiClient';
import LRUCache from 'lru-cache';

const CACHE_SIZE = 10000;

class ContentModerationService {
  private client = GeminiClient.getInstance();
  private violationCache: LRUCache<string, ModerationResult> = new LRUCache({ max: CACHE_SIZE });

  async moderateMessage(
    message: string,
    context: {
      userId: string;
      userHistory: string[];
      chatType: 'public' | 'private' | 'guild';
    }
  ): Promise<ModerationResult> {
    // Check cache for exact matches
    const cacheKey = `${message}-${context.chatType}`;
    if (this.violationCache.has(cacheKey)) {
      return this.violationCache.get(cacheKey)!;
    }

    const prompt = `Analyze this chat message for policy violations in a multiplayer game context.

Message: "${message}"
Chat type: ${context.chatType}
User's recent messages: ${context.userHistory.slice(-3).join(' | ')}

Evaluate for:
1. Harassment or bullying
2. Hate speech or discrimination
3. Sexual or inappropriate content
4. Threats or violent content
5. Spam or advertising
6. Self-harm references

Consider:
- Game-appropriate language (mild competitive trash talk is OK)
- Context from recent messages
- Chat type (private chats have more leniency)

Provide detailed analysis and recommended action.`;

    try {
      const response = await this.client.getGenerativeModel({ model: 'gemini-pro' }).generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: zodToJsonSchema(ModerationResultSchema),
          temperature: 0.3,
        },
      });

      const result = ModerationResultSchema.parse(JSON.parse(response.response.text()));
      return result;
    } catch (error) {
      console.error('Error moderating message:', error);
      // Return a default "allow" response in case of an error
      return {
        isViolation: false,
        severity: 'none',
        categories: ['none'],
        explanation: 'Error processing moderation request.',
        suggestedAction: 'allow',
      };
    }

    // Cache result if it's a violation
    if (result.isViolation) {
      this.violationCache.set(cacheKey, result);
    }

    return result;
  }

  async moderateUserProfile(profile: {
    displayName: string;
    bio: string;
    avatarDescription: string;
  }): Promise<{ allowed: boolean; issues: string[] }> {
    const content = `Display name: ${profile.displayName}\nBio: ${profile.bio}\nAvatar: ${profile.avatarDescription}`;

    const result = await this.moderateMessage(content, {
      userId: 'profile_check',
      userHistory: [],
      chatType: 'public'
    });

    return {
      allowed: !result.isViolation || result.severity === 'low',
      issues: result.categories.filter((c: string) => c !== 'none')
    };
  }
}

export default new ContentModerationService();
