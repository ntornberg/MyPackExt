// --- Logger Utility ---
/* eslint-disable no-console */
import { DEBUG } from "./settings"; // Import the global DEBUG variable

/**
 * Lightweight logger with a global DEBUG toggle that prefixes messages with a tag and timestamp.
 */
export class AppLogger {
  private static prefix = "[MyPackEnhancer]";

  /**
   * Logs an informational message when DEBUG is true.
   *
   * @param {unknown} message Primary message or object
   * @param {...unknown[]} optionalParams Additional values to print
   * @returns {void}
   */
  public static info(message?: unknown, ...optionalParams: unknown[]): void {
    if (DEBUG) {
      console.info(
        `${this.prefix} [INFO] ${new Date().toISOString()}`,
        message,
        ...optionalParams,
      );
    }
  }

  /**
   * Logs a warning message when DEBUG is true.
   *
   * @param {unknown} message Primary message or object
   * @param {...unknown[]} optionalParams Additional values to print
   * @returns {void}
   */
  public static warn(message?: unknown, ...optionalParams: unknown[]): void {
    if (DEBUG) {
      console.warn(
        `${this.prefix} [WARN] ${new Date().toISOString()}`,
        message,
        ...optionalParams,
      );
    }
  }

  /**
   * Logs an error message unconditionally.
   *
   * @param {unknown} message Primary message or object
   * @param {...unknown[]} optionalParams Additional values to print
   * @returns {void}
   */
  public static error(message?: unknown, ...optionalParams: unknown[]): void {
    console.error(
      `${this.prefix} [ERROR] ${new Date().toISOString()}`,
      message,
      ...optionalParams,
    );
  }
}
