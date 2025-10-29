import request from 'supertest';
import { app, httpServer } from '../index';

describe('Server Initialization', () => {
  beforeAll((done) => {
    // Wait for the async server start to complete
    setTimeout(done, 1000);
  });

  afterAll((done) => {
    if (httpServer.listening) {
      httpServer.close(done);
    } else {
      done();
    }
  });

  it('should start successfully without Twitch credentials', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});