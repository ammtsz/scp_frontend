// Central API exports for easy importing
export * from './patients';
export * from './attendances';
export * from './treatment-records';
export * from './schedule-settings';

// Export types
export * from './types';

// Re-export utilities
export * from './utils/functions';
export * from './utils/messages';

// Re-export axios instance
export { default as api } from './lib/axios';
