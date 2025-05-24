import { AppLogger } from '../utils/logger';

// Define the structure of the cache entry
export interface CacheEntry {
    combinedData: any;
    timestamp: number;
}

// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// Size threshold in bytes above which to use IndexedDB instead of chrome.storage
const SIZE_THRESHOLD = 100 * 1024; // 100KB

// DB name and store name for IndexedDB
const DB_NAME = 'mypack-extension-cache';
const STORE_NAME = 'cache-store';
const DB_VERSION = 1;

// -------------------- IndexedDB Setup --------------------

/**
 * Opens a connection to the IndexedDB database
 * @returns {Promise<IDBDatabase>} - A promise that resolves with the database connection
 */
async function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        // @ts-ignore
        request.onerror = (event) => {
            AppLogger.error(`[CACHE ERROR] Failed to open IndexedDB:`, request.error);
            reject(request.error);
        };
        // @ts-ignore
        request.onsuccess = (event) => {
            resolve(request.result);
        };
        // @ts-ignore
        request.onupgradeneeded = (event) => {
            const db = request.result;
            // Create object store for cache entries if it doesn't exist
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'key' });
            }
        };
    });
}

/**
 * Stores a cache entry in IndexedDB
 * @param {string} cacheCategory - The name of the cache category
 * @param {string} hash - The hash key
 * @param {CacheEntry} cacheEntry - The cache entry to store
 * @returns {Promise<void>}
 */
async function storeInIndexedDB(cacheCategory: string, hash: string, cacheEntry: CacheEntry): Promise<void> {
    try {
        
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            // Store the entry with a composite key of category:hash
            const request = store.put({
                key: `${cacheCategory}:${hash}`,
                category: cacheCategory,
                hash: hash,
                ...cacheEntry
            });
            
            request.onsuccess = () => {
                resolve();
            };
            
            request.onerror = () => {
                AppLogger.error(`[CACHE ERROR] Failed to store in IndexedDB:`, request.error);
                reject(request.error);
            };
            
            // Close the database when the transaction is complete
            transaction.oncomplete = () => {
                db.close();
            };
        });
    } catch (error) {
        AppLogger.error(`[CACHE ERROR] IndexedDB store error:`, error);
    }
}

/**
 * Retrieves all entries for a category from both Chrome storage and IndexedDB.
 * @param {string} cacheCategory - The cache category to retrieve
 * @returns {Promise<Record<string, CacheEntry> | null>} - All cache entries or null
 */
export async function getCacheCategory(cacheCategory: string): Promise<Record<string, CacheEntry> | null> {
    try {
        // First try Chrome storage
        if (isChromeStorageAvailable()) {
            const cached = await chrome.storage.local.get(cacheCategory);
            if (cached && cached[cacheCategory]) {
                return cached[cacheCategory];
            }
        }
        
        // Then try IndexedDB
        try {
            const db = await openDatabase();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                
                // Get all entries for this category
                const getAllKeysRequest = store.getAllKeys();
                
                getAllKeysRequest.onsuccess = () => {
                    const keys = getAllKeysRequest.result;
                    const result: Record<string, CacheEntry> = {};
                    let processed = 0;
                    
                    // If no keys, resolve immediately
                    if (keys.length === 0) {
                        resolve(null);
                        return;
                    }
                    
                    // Get all entries that start with the category prefix
                    for (const key of keys) {
                        if (typeof key === 'string' && key.startsWith(`${cacheCategory}:`)) {
                            const getRequest = store.get(key);
                            getRequest.onsuccess = () => {
                                if (getRequest.result) {
                                    const hash = getRequest.result.hash;
                                    result[hash] = {
                                        combinedData: getRequest.result.combinedData,
                                        timestamp: getRequest.result.timestamp
                                    };
                                }
                                processed++;
                                if (processed === keys.length) {
                                    resolve(Object.keys(result).length > 0 ? result : null);
                                }
                            };
                        } else {
                            processed++;
                        }
                    }
                };
                
                getAllKeysRequest.onerror = () => {
                    AppLogger.error(`[CACHE ERROR] Failed to get keys from IndexedDB:`, getAllKeysRequest.error);
                    reject(getAllKeysRequest.error);
                };
                
                // Close the database when the transaction is complete
                transaction.oncomplete = () => {
                    db.close();
                };
            });
        } catch (error) {
            AppLogger.error(`[CACHE ERROR] IndexedDB get category error:`, error);
            return null;
        }
    } catch (error) {
        AppLogger.error(`[CACHE ERROR] getCacheCategory: ${cacheCategory}`, error);
        return null;
    }
}

/**
 * Retrieves a cache entry from IndexedDB
 * @param {string} cacheCategory - The name of the cache category
 * @param {string} hash - The hash key
 * @returns {Promise<CacheEntry | null>} - The cache entry or null if not found
 */
async function getFromIndexedDB(cacheCategory: string, hash: string): Promise<CacheEntry | null> {
    try {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            
            // Use the composite key to retrieve the entry
            const request = store.get(`${cacheCategory}:${hash}`);
            
            request.onsuccess = () => {
                if (request.result) {
                    const entry = {
                        combinedData: request.result.combinedData,
                        timestamp: request.result.timestamp
                    };
                    
                    // Check if expired
                    const now = Date.now();
                    if (entry.timestamp && (now - entry.timestamp > CACHE_EXPIRATION)) {
                        // Delete the expired entry
                        const deleteTransaction = db.transaction([STORE_NAME], 'readwrite');
                        const deleteStore = deleteTransaction.objectStore(STORE_NAME);
                        deleteStore.delete(`${cacheCategory}:${hash}`);
                        resolve(null);
                    } else {
                        resolve(entry);
                    }
                } else {
                    resolve(null);
                }
            };
            
            request.onerror = () => {
                AppLogger.error(`[CACHE ERROR] Failed to get from IndexedDB:`, request.error);
                reject(request.error);
            };
            
            // Close the database when the transaction is complete
            transaction.oncomplete = () => {
                db.close();
            };
        });
    } catch (error) {
        AppLogger.error(`[CACHE ERROR] IndexedDB get error:`, error);
        return null;
    }
}

/**
 * Clears all entries for a category from IndexedDB
 * @param {string} cacheCategory - The cache category to clear
 * @returns {Promise<void>}
 */
async function clearFromIndexedDB(cacheCategory: string): Promise<void> {
    try {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            // Get all keys
            const getAllKeysRequest = store.getAllKeys();
            
            getAllKeysRequest.onsuccess = () => {
                const keys = getAllKeysRequest.result;
                let deleted = 0;
                
                // If no keys, resolve immediately
                if (keys.length === 0) {
                    resolve();
                    return;
                }
                
                // Delete all entries that start with the category prefix
                for (const key of keys) {
                    if (typeof key === 'string' && key.startsWith(`${cacheCategory}:`)) {
                        const deleteRequest = store.delete(key);
                        deleteRequest.onsuccess = () => {
                            deleted++;
                            if (deleted === keys.length) {
                                resolve();
                            }
                        };
                        deleteRequest.onerror = () => {
                            AppLogger.error(`[CACHE ERROR] Failed to delete from IndexedDB:`, deleteRequest.error);
                            reject(deleteRequest.error);
                        };
                    }
                }
            };
            
            getAllKeysRequest.onerror = () => {
                AppLogger.error(`[CACHE ERROR] Failed to get keys from IndexedDB:`, getAllKeysRequest.error);
                reject(getAllKeysRequest.error);
            };
            
            // Close the database when the transaction is complete
            transaction.oncomplete = () => {
                db.close();
            };
        });
    } catch (error) {
        AppLogger.error(`[CACHE ERROR] IndexedDB clear error:`, error);
    }
}

// -------------------- Size Utilities --------------------

/**
 * Estimates the size of a string in bytes
 * @param {string} str - The string to measure
 * @returns {number} - The estimated size in bytes
 */
function estimateSize(str: string): number {
    // A rough estimate is 2 bytes per character for UTF-16
    return str.length * 2;
}

// -------------------- Generic Cache Functions --------------------

/**
 * Creates a hash from an object's values.
 * @param {Record<string, any>} item - The object to use for the hash.
 * @returns {Promise<string>} - The generated unique key.
 */
// Set to track which key patterns we've already logged
const loggedCacheKeys = new Set<string>();

export async function generateCacheKey(item: string): Promise<string> {
    // Log only the first time for each unique input pattern
    const pattern = item.split(' ')[0]; // Log pattern once per type (course abbr or batch-gradeprof)
    
    if (!loggedCacheKeys.has(pattern)) {
        const hash = await hashString(item);
        AppLogger.info(`[CACHE KEY] Sample for pattern "${pattern}": Input "${item}" -> Hash: "${hash}"`);
        loggedCacheKeys.add(pattern);
    }
    
    return hashString(item);
}

/**
 * Checks if the Chrome extension storage API is available
 * @returns {boolean} True if chrome.storage is available
 */
function isChromeStorageAvailable(): boolean {
  return typeof chrome !== 'undefined' && 
         chrome !== null && 
         typeof chrome.storage !== 'undefined' && 
         chrome.storage !== null &&
         typeof chrome.storage.local !== 'undefined';
}

// Set to track whether we've logged sample cache entries
const loggedSampleCacheData = {
    retrieve: false,
    store: false
};

/**
 * Retrieves cached data from a given cache category using a precomputed hash.
 * First checks chrome.storage, then falls back to IndexedDB for larger items.
 * @param {string} cacheCategory - The name of the cache category.
 * @param {string} hash - The precomputed hash key.
 * @returns {Promise<CacheEntry | null>} - The cache entry or null if not found/expired.
 */
export async function getGenericCache(cacheCategory: string, hash: string): Promise<CacheEntry | null> {
    try {
        // Check if Chrome storage is available
        if (isChromeStorageAvailable()) {
            // First try chrome.storage
            const cached = await chrome.storage.local.get(cacheCategory);
            if (cached && cached[cacheCategory]) {
                const cache: Record<string, CacheEntry> = cached[cacheCategory];
                const entry = cache[hash];
                if (entry) {
                    // Check if the cache entry has expired
                    const now = Date.now();
                    if (entry.timestamp && (now - entry.timestamp > CACHE_EXPIRATION)) {
                        delete cache[hash];
                        await chrome.storage.local.set({ [cacheCategory]: cache });
                        return null;
                    }
                    
                    // Log sample data format (only once)
                    if (!loggedSampleCacheData.retrieve) {
                        AppLogger.info(`[CACHE RETRIEVED] Sample data format for category "${cacheCategory}":`, {
                            storage: 'Chrome Storage',
                            hash: hash.substring(0, 10) + '...',
                            dataPreview: typeof entry.combinedData === 'string' 
                                ? entry.combinedData.substring(0, 100) + '...' 
                                : 'Not a string',
                            timestamp: new Date(entry.timestamp).toISOString()
                        });
                        loggedSampleCacheData.retrieve = true;
                    }
                    
                    return entry;
                }
            }
        }
        
        // Try IndexedDB
        const indexedResult = await getFromIndexedDB(cacheCategory, hash);
        
        // Log sample format from IndexedDB (only once)
        if (indexedResult && !loggedSampleCacheData.retrieve) {
            AppLogger.info(`[CACHE RETRIEVED] Sample data format for category "${cacheCategory}":`, {
                storage: 'IndexedDB',
                hash: hash.substring(0, 10) + '...',
                dataPreview: typeof indexedResult.combinedData === 'string' 
                    ? indexedResult.combinedData.substring(0, 100) + '...' 
                    : 'Not a string',
                timestamp: new Date(indexedResult.timestamp).toISOString()
            });
            loggedSampleCacheData.retrieve = true;
        }
        
        return indexedResult;
    } catch (error) {
        AppLogger.error(`[CACHE ERROR] getGenericCache: Category: ${cacheCategory}, Key: ${hash}`, error);
        return null;
    }
}

/**
 * Stores data in the appropriate cache storage based on size.
 * Uses IndexedDB for large items, chrome.storage for smaller ones.
 * @param {string} cacheCategory - The name of the cache category.
 * @param {string} hash - The precomputed hash key.
 * @param {string} jsonData - The JSON data to store.
 * @returns {Promise<void>}
 */
export async function setGenericCache(cacheCategory: string, hash: string, jsonData: any): Promise<void> {
    try {
        // Ensure jsonData is a string
        const dataAsString = typeof jsonData === 'string' 
            ? jsonData 
            : JSON.stringify(jsonData);
        
        const dataSize = estimateSize(dataAsString);
        const cacheEntry: CacheEntry = {
            combinedData: dataAsString,
            timestamp: Date.now()
        };
        
        // Log sample cache storage info (only once)
        if (!loggedSampleCacheData.store) {
            AppLogger.info(`[CACHE STORED] Sample data format for category "${cacheCategory}":`, {
                hash: hash.substring(0, 10) + '...',
                storage: dataSize > SIZE_THRESHOLD ? 'IndexedDB' : 'Chrome Storage',
                dataSize: `${Math.round(dataSize / 1024)} KB`,
                dataPreview: dataAsString.substring(0, 100) + '...',
                dataType: typeof jsonData,
                timestamp: new Date(cacheEntry.timestamp).toISOString()
            });
            loggedSampleCacheData.store = true;
        }
        
        // Use IndexedDB for large items or if Chrome storage is not available
        if (dataSize > SIZE_THRESHOLD || !isChromeStorageAvailable()) {
            await storeInIndexedDB(cacheCategory, hash, cacheEntry);
            return;
        }
        
        // Use chrome.storage for smaller items
        const data = await chrome.storage.local.get([cacheCategory]);
        const current = data[cacheCategory] || {};
        current[hash] = cacheEntry;
        await chrome.storage.local.set({ [cacheCategory]: current });
    } catch (error) {
        AppLogger.error(`[CACHE ERROR] setGenericCache: Category: ${cacheCategory}, Key: ${hash}`, error);
    }
}

/**
 * Clears all cached data for a given cache category from all storage mechanisms.
 * @param {string} cacheCategory - The cache category to clear.
 * @returns {Promise<void>}
 */
export async function clearGenericCache(cacheCategory: string): Promise<void> {
    try {
        // Clear from chrome.storage if available
        if (isChromeStorageAvailable()) {
            await chrome.storage.local.remove(cacheCategory);
        }
        
        // Clear from IndexedDB
        await clearFromIndexedDB(cacheCategory);
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
