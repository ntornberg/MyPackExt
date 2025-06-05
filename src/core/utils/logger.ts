// --- Logger Utility ---
import {DEBUG} from './settings'; // Import the global DEBUG variable

export class AppLogger {
    private static prefix = "[MyPackEnhancer]";

    public static info(message?: any, ...optionalParams: any[]): void {
        if (DEBUG) {
            console.info(`${this.prefix} [INFO] ${new Date().toISOString()}`, message, ...optionalParams);
        }
    }

    public static warn(message?: any, ...optionalParams: any[]): void {
        if (DEBUG) {
            console.warn(`${this.prefix} [WARN] ${new Date().toISOString()}`, message, ...optionalParams);
        }
    }

    public static error(message?: any, ...optionalParams: any[]): void {
        console.error(`${this.prefix} [ERROR] ${new Date().toISOString()}`, message, ...optionalParams);
    }
}
