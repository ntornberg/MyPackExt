import { AppLogger } from '../utils/logger';

// Define the structure of the cache entry
interface CacheEntry {
    combinedData: string;
    timestamp: number;
}

// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// -------------------- Generic Cache Functions --------------------

/**
 * Creates a hash from an object's values.
 * @param {Record<string, any>} item - The object to use for the hash.
 * @returns {Promise<string>} - The generated unique key.
 */
export async function generateCacheKey(item: string): Promise<string> {
    return hashString(item);
}

/**
 * Retrieves cached data from a given cache category using a precomputed hash.
 * @param {string} cacheCategory - The name of the cache category.
 * @param {string} hash - The precomputed hash key.
 * @returns {Promise<CacheEntry | null>} - The cache entry or null if not found/expired.
 */
export async function getGenericCache(cacheCategory: string, hash: string): Promise<CacheEntry | null> {
    try {
        const cached = await chrome.storage.local.get(cacheCategory);
        if (!cached || !cached[cacheCategory]) {
            AppLogger.info(`[CACHE MISS] Category: ${cacheCategory}, Key: ${hash} (category not found)`);
            return null;
        }
        const cache: Record<string, CacheEntry> = cached[cacheCategory];
        const entry = cache[hash];
        if (!entry) {
            AppLogger.info(`[CACHE MISS] Category: ${cacheCategory}, Key: ${hash} (entry not found)`);
            return null;
        }
        // Check if the cache entry has expired
        const now = Date.now();
        if (entry.timestamp && (now - entry.timestamp > CACHE_EXPIRATION)) {
            AppLogger.info(`[CACHE EXPIRED] Category: ${cacheCategory}, Key: ${hash}`);
            delete cache[hash];
            await chrome.storage.local.set({ [cacheCategory]: cache });
            return null;
        }
        AppLogger.info(`[CACHE HIT] Category: ${cacheCategory}, Key: ${hash}`);
        return entry;
    } catch (error) {
        AppLogger.error(`[CACHE ERROR] getGenericCache: Category: ${cacheCategory}, Key: ${hash}`, error);
        return null;
    }
}

/**
 * Stores data in the given cache category using a precomputed hash.
 * @param {string} cacheCategory - The name of the cache category.
 * @param {string} hash - The precomputed hash key.
 * @param {string} jsonData - The JSON data to store.
 * @returns {Promise<void>}
 */
export async function setGenericCache(cacheCategory: string, hash: string, jsonData: string): Promise<void> {
    try {
        const data = await chrome.storage.local.get([cacheCategory]);
        const current = data[cacheCategory] || {};
        const cacheEntry: CacheEntry = {
            combinedData: jsonData,
            timestamp: Date.now()
        };
        current[hash] = cacheEntry;
        await chrome.storage.local.set({ [cacheCategory]: current });
        AppLogger.info(`[CACHE SET] Category: ${cacheCategory}, Key: ${hash}`);
    } catch (error) {
        AppLogger.error(`[CACHE ERROR] setGenericCache: Category: ${cacheCategory}, Key: ${hash}`, error);
    }
}

/**
 * Clears all cached data for a given cache category.
 * @param {string} cacheCategory - The cache category to clear.
 * @returns {Promise<void>}
 */
export async function clearGenericCache(cacheCategory: string): Promise<void> {
    try {
        await chrome.storage.local.remove(cacheCategory);
        AppLogger.info(`[CACHE CLEARED] Category: ${cacheCategory}`);
    } catch (error) {
        AppLogger.error(`[CACHE ERROR] clearGenericCache: Category: ${cacheCategory}`, error);
    }
}

/**
 * Clears all cached course data.
 * @returns {Promise<void>}
 */
export async function clearCache(): Promise<void> {
    return clearGenericCache("courseList");
}

// ------------------------ Helper Function ------------------------

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
