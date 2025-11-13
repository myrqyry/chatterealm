import { RateLimiterOptions } from '@chatterealm/shared';

const DEFAULT_OPTIONS: Required<RateLimiterOptions> = {
  maxEvents: 10, // Max events per window
  windowMs: 1000, // 1 second
};

/**
 * A simple in-memory rate limiter for Socket.IO events.
 */
export class RateLimiter {
  private clients: Map<string, number[]> = new Map();
  private options: Required<RateLimiterOptions>;

  constructor(options: RateLimiterOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Checks if a client is rate-limited.
   * @param socketId The ID of the socket to check.
   * @returns True if the client has exceeded the rate limit, false otherwise.
   */
  public isRateLimited(socketId: string): boolean {
    const now = Date.now();
    const windowStart = now - this.options.windowMs;

    // Get the client's event timestamps, or initialize if not present
    const clientTimestamps = this.clients.get(socketId) || [];

    // Filter out timestamps that are outside the current window
    const recentTimestamps = clientTimestamps.filter(ts => ts > windowStart);

    // If the number of recent events exceeds the max, the client is rate-limited
    if (recentTimestamps.length >= this.options.maxEvents) {
      return true;
    }

    // Add the current timestamp and update the client's record
    recentTimestamps.push(now);
    this.clients.set(socketId, recentTimestamps);

    return false;
  }

  /**
   * Cleans up the timestamp records for a disconnected client.
   * @param socketId The ID of the socket to clean up.
   */
  public cleanup(socketId: string): void {
    this.clients.delete(socketId);
  }
}