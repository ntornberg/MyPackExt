import type {Course} from "../types";

// Define the structure of the cache entry
interface CacheEntry {
    combinedData: string;
    timestamp: number;
}

// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

/**
 * Retrieves cached data for a course.
 * @param {Course} course - The course to get cached data for.
 * @returns {Promise<CacheEntry | null>} - The cached data or null if not found or expired.
 */
export async function getCache(course: Course): Promise<CacheEntry | null> {
    const id = await hashString(course.abr + course.instructor);
    const cached = await chrome.storage.local.get("courseList");
    
    if (!cached || !cached.courseList) {
        return null;
    }
    
    const cache: Record<string, CacheEntry> = cached.courseList || {};
    const entry = cache[id];
    
    if (!entry) {
        return null;
    }
    
    // Check if the cache entry has expired
    const now = Date.now();
    if (entry.timestamp && (now - entry.timestamp > CACHE_EXPIRATION)) {
        // Cache expired, remove it
        delete cache[id];
        await chrome.storage.local.set({courseList: cache});
        return null;
    }
    
    return entry;
}

/**
 * Stores data in the cache for a course.
 * @param {Course} course - The course to cache data for.
 * @param {string} jsonData - The JSON data to cache.
 * @returns {Promise<void>}
 */
export async function setCache(course: Course, jsonData: string): Promise<void> {
    const id = await hashString(course.abr + course.instructor);
    const data = await chrome.storage.local.get(["courseList"]);
    const current_dict = data.courseList || {};
    
    // Create a cache entry with the current timestamp
    const cacheEntry: CacheEntry = {
        combinedData: jsonData,
        timestamp: Date.now()
    };
    
    current_dict[id] = cacheEntry;
    await chrome.storage.local.set({courseList: current_dict});
}

/**
 * Clears all cached course data.
 * @returns {Promise<void>}
 */
export async function clearCache(): Promise<void> {
    await chrome.storage.local.remove("courseList");
}

/**
 * Creates a hash from a string.
 * @param {string} message - The string to hash.
 * @returns {Promise<string>} - The hashed string.
 */
async function hashString(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message); // Convert string to bytes
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer); // Hash it
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert buffer to byte array
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // Bytes to hex string
    return hashHex;
}