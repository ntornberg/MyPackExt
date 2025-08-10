import { AppLogger } from "../../core/utils/logger";

// Define the structure of the cache entry
export interface CacheEntry {
    combinedData: any;
    timestamp: number;
    expiresAt: number;
}

// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// Size threshold in bytes above which to use IndexedDB instead of chrome.storage
const SIZE_THRESHOLD = 100 * 1024;

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
    AppLogger.info(`[CACHE DB OPEN] Opening IndexedDB database: ${DB_NAME}, version: ${DB_VERSION}`);

    return new Promise((resolve, reject) => {
        let retryCount = 0;
        const maxRetries = 3;

        const attemptOpen = () => {
            try {
                const request = indexedDB.open(DB_NAME, DB_VERSION);

                request.onerror = (_) => {
                    const error = request.error || new Error('Unknown error opening database');
                    AppLogger.error(`[CACHE DB ERROR] Failed to open IndexedDB: ${error.message}`);

                    if (retryCount < maxRetries) {
                        retryCount++;
                        AppLogger.info(`[CACHE DB RETRY] Retrying database open (${retryCount}/${maxRetries})...`);
                        setTimeout(attemptOpen, 500); // Wait 500ms before retry
                    } else {
                        reject(error);
                    }
                };

                request.onsuccess = (_) => {
                    const db = request.result;
                    AppLogger.info(`[CACHE DB SUCCESS] Successfully opened database: ${DB_NAME}`);

                    // Handle connection errors
                    db.onerror = (event) => {
                        AppLogger.error(`[CACHE DB ERROR] Database error: ${(event.target as any).errorCode}`);
                    };

                    resolve(db);
                };

                request.onupgradeneeded = (_) => {
                    AppLogger.info(`[CACHE DB UPGRADE] Database upgrade needed for ${DB_NAME}`);
                    const db = request.result;

                    // Create object store for cache entries if it doesn't exist
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        AppLogger.info(`[CACHE DB CREATE] Creating object store: ${STORE_NAME}`);
                        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
                    }
                };
            } catch (error) {
                AppLogger.error(`[CACHE DB ERROR] Exception opening database: ${error}`);
                reject(error);
            }
        };

        attemptOpen();
    });
}

/**
 * Stores a cache entry in IndexedDB
 * @param {string} cacheCategory - The name of the cache category
 * @param {string} hash - The hash key
 * @param {CacheEntry} cacheEntry - The cache entry to store
 * @returns {Promise<void>}
 */
async function storeInIndexedDB(cacheCategory: string, cacheEntries: Record<string, CacheEntry>): Promise<void> {

    let db: IDBDatabase | null = null;
    db = await openDatabase();
    let entryPromises: Promise<Error | null>[] = [];
    for (const [hash, cacheEntry] of Object.entries(cacheEntries)) {
        const entryPromise = async (hash: string, cacheEntry: CacheEntry): Promise<Error | null> => {
            try {
                if (!db) {
                    const error = new Error('Failed to open database');
                    AppLogger.error(`[CACHE DB ERROR] ${error.message}`);

                    return error;
                }

                try {
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
                        return;
                    };

                    request.onerror = () => {
                        AppLogger.error(`[CACHE DB ERROR] Failed to store in IndexedDB: ${request.error?.message || 'Unknown error'}`);
                        return request.error;
                    };

                    transaction.onerror = (_) => {
                        AppLogger.error(`[CACHE DB ERROR] Transaction error: ${transaction.error?.message || 'Unknown error'}`);
                        return transaction.error;
                    };

                    transaction.oncomplete = () => {
                        if (db) db.close();
                    };
                } catch (transactionError) {
                    AppLogger.error(`[CACHE DB ERROR] Failed to create transaction: ${transactionError}`);
                    if (db) db.close();
                    return transactionError as Error;
                }
            } catch (error) {
                AppLogger.error(`[CACHE DB ERROR] IndexedDB store error: ${error}`);
                if (db) db.close();
                return error as Error;
            }
            return null;
        }
        entryPromises.push(entryPromise(hash, cacheEntry));
    }
    const result = await Promise.all(entryPromises);
    if (result.some(error => error !== null)) {
        AppLogger.error(`[CACHE DB ERROR] Failed to store all entries in IndexedDB: ${result.filter(error => error !== null).map(error => error?.message ?? 'Unknown error').join(', ')}`);
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
                                        timestamp: getRequest.result.timestamp,
                                        expiresAt: getRequest.result.expiresAt
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


    let db: IDBDatabase | null = null;
    try {
        db = await openDatabase();

        return new Promise((resolve, reject) => {
            if (!db) {
                const error = new Error('Failed to open database');
                AppLogger.error(`[CACHE DB ERROR] ${error.message}`);
                reject(error);
                return;
            }

            try {
                const transaction = db.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);

                // Use the composite key to retrieve the entry
                const request = store.get(`${cacheCategory}:${hash}`);

                request.onsuccess = () => {
                    if (request.result) {
                        const entry = {
                            combinedData: request.result.combinedData,
                            timestamp: request.result.timestamp,
                            expiresAt: request.result.expiresAt
                        };

                        // Check if expired
                        const now = Date.now();
                        if (entry.expiresAt && now > entry.expiresAt) {
                            AppLogger.info(`[CACHE DB EXPIRED] Cache entry expired: ${cacheCategory}:${hash}...`);

                            // Delete the expired entry in a separate transaction
                            try {
                                if (db) {
                                    const deleteTransaction = db.transaction([STORE_NAME], 'readwrite');
                                    const deleteStore = deleteTransaction.objectStore(STORE_NAME);
                                    deleteStore.delete(`${cacheCategory}:${hash}`);
                                    deleteTransaction.oncomplete = () => {
                                        AppLogger.info(`[CACHE DB] Deleted expired entry: ${cacheCategory}:${hash}...`);
                                    };
                                }
                            } catch (deleteError) {
                                AppLogger.error(`[CACHE DB ERROR] Failed to delete expired entry: ${deleteError}`);
                            }

                            resolve(null);
                        } else {
                            AppLogger.info(`[CACHE DB HIT] Found valid entry in IndexedDB: ${cacheCategory}:${hash}...`);
                            resolve(entry);
                        }
                    } else {
                        AppLogger.info(`[CACHE DB MISS] No entry found in IndexedDB: ${cacheCategory}:${hash}...`);
                        resolve(null);
                    }
                };

                request.onerror = () => {
                    AppLogger.error(`[CACHE DB ERROR] Failed to get from IndexedDB: ${request.error?.message || 'Unknown error'}`);
                    reject(request.error);
                };


                transaction.oncomplete = () => {
                    if (db) db.close();
                };
            } catch (transactionError) {
                AppLogger.error(`[CACHE DB ERROR] Failed to create transaction: ${transactionError}`);
                if (db) db.close();
                reject(transactionError);
            }
        });
    } catch (error) {
        AppLogger.error(`[CACHE DB ERROR] IndexedDB get error: ${error}`);
        if (db) db.close();
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

    return str.length * 2;
}

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



/**
 * Retrieves cached data from a given cache category using a precomputed hash.
 * First checks chrome.storage, then falls back to IndexedDB for larger items.
 * @param {string} cacheCategory - The name of the cache category.
 * @param {string} hash - The precomputed hash key.
 * @returns {Promise<CacheEntry | null>} - The cache entry or null if not found/expired.
 */
export async function getGenericCache(cacheCategory: string, hash: string): Promise<CacheEntry | null> {
    try {
        if (isChromeStorageAvailable()) {

            try {
                const cached = await chrome.storage.local.get(cacheCategory);
                if (cached && cached[cacheCategory]) {
                    const cache: Record<string, CacheEntry> = cached[cacheCategory];
                    const entry = cache[hash];
                    if (entry) {
                        // Check if the cache entry has expired
                        const now = Date.now();
                        if (entry.timestamp && (now - entry.timestamp > CACHE_EXPIRATION)) {
                            AppLogger.info(`[CACHE EXPIRED] ${cacheCategory} cache expired for hash: ${hash}...`);
                            delete cache[hash];
                            await chrome.storage.local.set({ [cacheCategory]: cache });
                            return null;
                        }


                        return entry;
                    }
                }

            } catch (chromeError) {
                AppLogger.error(`[CACHE ERROR] Chrome storage get failed: ${chromeError}`, chromeError);
            }
        } else {
            AppLogger.info(`[CACHE INFO] Chrome storage not available, trying IndexedDB`);
        }
        try {
            const indexedResult = await getFromIndexedDB(cacheCategory, hash);

            return indexedResult;
        } catch (indexedDBError) {
            AppLogger.error(`[CACHE ERROR] IndexedDB get failed: ${indexedDBError}`, indexedDBError);
            return null;
        }
    } catch (error) {
        AppLogger.error(`[CACHE ERROR] getGenericCache: Category: ${cacheCategory}, Key: ${hash}, Error: ${error}`, error);
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
export async function setGenericCache(cacheCategory: string, cacheEntries: Record<string, any>, cacheExpirationOverride?: number): Promise<void> {
    try {

        const dataAsString = typeof cacheEntries === 'string'
            ? cacheEntries
            : JSON.stringify(cacheEntries);

        const dataSize = estimateSize(dataAsString);
        const cacheEntryList: Record<string, CacheEntry> = {};
        for (const [hash, item] of Object.entries(cacheEntries)) {
            const cacheEntry: CacheEntry = {
                combinedData: item,
                timestamp: Date.now(),
                expiresAt: Date.now() + (cacheExpirationOverride || CACHE_EXPIRATION)
            };
            cacheEntryList[hash] = cacheEntry;
        }



        if (dataSize > SIZE_THRESHOLD || !isChromeStorageAvailable()) {
            try {
                await storeInIndexedDB(cacheCategory, cacheEntryList);
            } catch (indexedDBError) {
                AppLogger.error(`[CACHE ERROR] IndexedDB storage failed: ${indexedDBError}`, indexedDBError);
                throw indexedDBError;
            }
            return;
        }

        // Use chrome.storage for smaller items
        try {
            const currentCache: Record<string, CacheEntry> = (await chrome.storage.local.get(cacheCategory))[cacheCategory] || {};
            for (const [hash, cacheEntry] of Object.entries(cacheEntryList)) {
                currentCache[hash] = cacheEntry;
            }
            await chrome.storage.local.set({ [cacheCategory]: { ...currentCache } });
            AppLogger.info('Current Cache: ', currentCache);
            AppLogger.info('Cache Entry List: ', cacheEntryList);
            AppLogger.info(`[CACHE SUCCESS] Successfully stored in Chrome storage: ${cacheCategory}:${Object.keys(cacheEntryList)}...`);
        } catch (chromeStorageError) {
            AppLogger.error(`[CACHE ERROR] Chrome storage failed: ${chromeStorageError}`, chromeStorageError);
            // Fall back to IndexedDB if Chrome storage fails
            try {
                await storeInIndexedDB(cacheCategory, cacheEntryList);
            } catch (fallbackError) {
                AppLogger.error(`[CACHE ERROR] Fallback to IndexedDB also failed: ${fallbackError}`, fallbackError);
                throw fallbackError;
            }
        }
    } catch (error) {
        AppLogger.error(`[CACHE ERROR] setGenericCache: Category: ${cacheCategory}, Error: ${error}`, error);
        throw error;
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
