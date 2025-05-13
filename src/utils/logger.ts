// --- Logger Utility ---
// Provides a structured way to log messages.
export class AppLogger {
    private static prefix = "[MyPackEnhancer]";

    public static info(message?: any, ...optionalParams: any[]): void {
        console.info(`${this.prefix} [INFO] ${new Date().toISOString()}`, message, ...optionalParams);
    }

    public static warn(message?: any, ...optionalParams: any[]): void {
        console.warn(`${this.prefix} [WARN] ${new Date().toISOString()}`, message, ...optionalParams);
    }

    public static error(message?: any, ...optionalParams: any[]): void {
        console.error(`${this.prefix} [ERROR] ${new Date().toISOString()}`, message, ...optionalParams);
    }

    // Debug logs can be added here if needed, but are omitted for now to reduce verbosity.
}
