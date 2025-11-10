import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ModerationResult, ModerationResultSchema } from 'shared';

class ContentModerationService {
  private client: GoogleGenerativeAI;
  private violationCache: Map<string, ModerationResult> = new Map();

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

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

    const response = await this.client.getGenerativeModel({ model: 'gemini-pro' }).generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: zodToJsonSchema(ModerationResultSchema),
        temperature: 0.3,
      },
    });

    const result = ModerationResultSchema.parse(JSON.parse(response.response.text()));

    // Cache result if it's a violation
    if (result.isViolation) {
      this.violationCache.set(cacheKey, result);

      // Limit cache size
      if (this.violationCache.size > 10000) {
        const firstKey = this.violationCache.keys().next().value;
        if (firstKey) {
          this.violationCache.delete(firstKey);
        }
      }
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
