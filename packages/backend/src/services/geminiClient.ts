import { GoogleGenAI } from '@google/genai';

class GeminiClient {
  private static instance: GoogleGenAI;

  private constructor() {}

  public static getInstance(): GoogleGenAI {
    if (!GeminiClient.instance) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set');
      }
      GeminiClient.instance = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
    }
    return GeminiClient.instance;
  }
}

export default GeminiClient;
