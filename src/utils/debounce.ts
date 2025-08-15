/**
 * Creates a debounced version of a no-arg function.
 * Subsequent calls within the window reset the timer.
 *
 * @param {() => void} fn The function to debounce
 * @param {number} [ms=100] Delay in milliseconds
 * @returns {() => void} Debounced function
 */
export const debounce = (fn: () => void, ms = 100): (() => void) => {
  let timeoutId: number;
  return () => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(fn, ms);
  };
};
