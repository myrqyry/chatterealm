import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiClient {
  private static instance: GoogleGenerativeAI;

  private constructor() {}

  public static getInstance(): GoogleGenerativeAI {
    if (!GeminiClient.instance) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not set');
      }
      GeminiClient.instance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return GeminiClient.instance;
  }
}

export default GeminiClient;
