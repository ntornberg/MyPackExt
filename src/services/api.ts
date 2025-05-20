/**
 * This file is a proxy to the new modular API structure.
 * Import the necessary functionality from the new structure.
 */

// Re-export everything from the main API index
export * from './api/index';

// For backward compatibility, we maintain the same imports
// Note: We don't need to explicitly import and re-export types that
// are already exported from './api/index'

