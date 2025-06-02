/**
 * Creates a debounced version of a function.
 * @param {() => void} fn - The function to debounce.
 * @param {number} [ms=100] - The debounce delay in milliseconds. (Increased from original 20/25 for stability)
 * @returns {() => void} The debounced function.
 */
export const debounce = (fn: () => void, ms = 100): () => void => {
    let timeoutId: number;
    return () => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(fn, ms);
    };
};
