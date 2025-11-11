import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import GeminiClient from './geminiClient';

const ALLOWED_MODELS = ['gemini-pro'];

class AIProxyService {
  private client = GeminiClient.getInstance();

  validateRequest = [
    body('model').isIn(ALLOWED_MODELS).withMessage('Invalid model specified.'),
    body('contents').isArray({ min: 1, max: 10 }).withMessage('Contents must be a non-empty array with at most 10 elements.'),
    body('config').optional().isObject().withMessage('Config must be an object.'),
  ];

  async handleRequest(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { model, contents, config } = req.body;
      const generativeModel = this.client.getGenerativeModel({ model });
      const result = await generativeModel.generateContent({ contents, generationConfig: config });
      const responseText = result.response.text();
      const data = JSON.parse(responseText);
      res.json(data);
    } catch (error) {
      console.error('AI Proxy Error:', error);
      res.status(500).json({ error: 'Failed to process AI request' });
    }
  }
}

export default new AIProxyService();
