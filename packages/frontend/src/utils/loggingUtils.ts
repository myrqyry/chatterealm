/**
 * Logging utility with throttling to reduce console spam
 */

interface LogEntry {
  timestamp: number;
  count: number;
  lastMessage: string;
}

class ThrottledLogger {
  private logThrottleMap: Map<string, LogEntry> = new Map();
  private readonly throttleWindow: number = 60000; // 1 minute
  private readonly maxLogFrequency: number = 5000; // Max once per 5 seconds

  /**
   * Throttled logging function that prevents spam
   * @param key Unique identifier for the log type
   * @param message Log message
   * @param type Console method (log, error, warn, info)
   * @param force Log immediately regardless of throttling
   */
  log(key: string, message: string, type: 'log' | 'error' | 'warn' | 'info' = 'log', force = false): void {
    const now = Date.now();
    const entry = this.logThrottleMap.get(key);

    if (!entry || force) {
      // First occurrence or forced log
      this.logThrottleMap.set(key, {
        timestamp: now,
        count: 1,
        lastMessage: message
      });

      console[type](`[${key}] ${message}`);
      return;
    }

    // Check if enough time has passed since last log
    if (now - entry.timestamp < this.maxLogFrequency) {
      entry.count++;
      return;
    }

    // Log the message, potentially with suppressed count
    const prefix = entry.count > 1 ? `[${key}] [${entry.count} suppressed] ` : `[${key}] `;

    console[type](`${prefix}${message}`);

    // Reset for next occurrence
    this.logThrottleMap.set(key, {
      timestamp: now,
      count: 1,
      lastMessage: message
    });

    // Clean up old entries occasionally
    if (Math.random() < 0.1) { // 10% chance to clean up
      this.cleanup();
    }
  }

  /**
   * Clear all throttled log entries
   */
  clear(): void {
    this.logThrottleMap.clear();
  }

  /**
   * Remove log entries older than the throttle window
   */
  private cleanup(): void {
    const cutoff = Date.now() - this.throttleWindow;

    for (const [key, entry] of this.logThrottleMap.entries()) {
      if (entry.timestamp < cutoff) {
        this.logThrottleMap.delete(key);
      }
    }
  }

  /**
   * Get current log stats for debugging
   */
  getStats(): { [key: string]: LogEntry } {
    const stats: { [key: string]: LogEntry } = {};
    for (const [key, value] of this.logThrottleMap.entries()) {
      stats[key] = { ...value };
    }
    return stats;
  }
}

// Export singleton instance
export const throttledLogger = new ThrottledLogger();

// Convenience functions for common log types
export const throttledLog = (key: string, message: string, force = false) =>
  throttledLogger.log(key, message, 'log', force);

export const throttledError = (key: string, message: string, force = false) =>
  throttledLogger.log(key, message, 'error', force);

export const throttledWarn = (key: string, message: string, force = false) =>
  throttledLogger.log(key, message, 'warn', force);

export const throttledInfo = (key: string, message: string, force = false) =>
  throttledLogger.log(key, message, 'info', force);

export default throttledLogger;
