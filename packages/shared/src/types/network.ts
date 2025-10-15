/**
 * Options for configuring the WebSocket rate limiter.
 */
export interface RateLimiterOptions {
  /**
   * The maximum number of events allowed per window.
   * @default 10
   */
  maxEvents?: number;

  /**
   * The time window in milliseconds.
   * @default 1000 (1 second)
   */
  windowMs?: number;
}