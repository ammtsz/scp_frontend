/**
 * Utility functions for converting between snake_case and camelCase
 * Used to handle API/Frontend naming convention differences
 */

// Convert snake_case to camelCase
export const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

// Convert camelCase to snake_case
export const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

// Deep convert object keys from snake_case to camelCase
export const keysToCamelCase = <T = unknown>(obj: unknown): T => {
  if (obj === null || obj === undefined) return obj as T;
  
  if (Array.isArray(obj)) {
    return obj.map(keysToCamelCase) as T;
  }
  
  if (typeof obj === 'object' && obj.constructor === Object) {
    const converted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = toCamelCase(key);
      converted[camelKey] = keysToCamelCase(value);
    }
    return converted as T;
  }
  
  return obj as T;
};

// Deep convert object keys from camelCase to snake_case
export const keysToSnakeCase = <T = unknown>(obj: unknown): T => {
  if (obj === null || obj === undefined) return obj as T;
  
  if (Array.isArray(obj)) {
    return obj.map(keysToSnakeCase) as T;
  }
  
  if (typeof obj === 'object' && obj.constructor === Object) {
    const converted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = toSnakeCase(key);
      converted[snakeKey] = keysToSnakeCase(value);
    }
    return converted as T;
  }
  
  return obj as T;
};

// Type-safe transformer for specific conversions
export type KeyTransformer<TInput, TOutput> = (input: TInput) => TOutput;

// Create a transformer that handles both key conversion and type mapping
export const createTransformer = <TInput, TOutput>(
  keyConverter: (obj: unknown) => unknown,
  typeMapper?: (obj: unknown) => TOutput
): KeyTransformer<TInput, TOutput> => {
  return (input: TInput): TOutput => {
    const keyConverted = keyConverter(input);
    return typeMapper ? typeMapper(keyConverted) : keyConverted as TOutput;
  };
};
