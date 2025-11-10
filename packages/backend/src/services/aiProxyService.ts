import { GoogleGenerativeAI } from '@google/generative-ai';
import { Request, Response } from 'express';

class AIProxyService {
  private client: GoogleGenerativeAI;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async handleRequest(req: Request, res: Response) {
    try {
      const { model, contents, config } = req.body;
      const generativeModel = this.client.getGenerativeModel({ model });
      const result = await generativeModel.generateContent({ contents, generationConfig: config });
      res.json(result.response.text());
    } catch (error) {
      console.error('AI Proxy Error:', error);
      res.status(500).json({ error: 'Failed to process AI request' });
    }
  }
}

export default new AIProxyService();
