/**
 * Frontend timezone types and interfaces
 */

export interface TimezoneInfo {
  timezone: string;
  date: string;
  time: string;
  offset: number;
}

export interface TimezoneContextValue {
  // Current user's timezone (detected from browser or set manually)
  userTimezone: string;
  
  // Server timezone info (always Brazil)
  serverTimezone: TimezoneInfo;
  
  // Detected browser timezone info  
  detectedTimezone: TimezoneInfo;
  
  // Whether browser timezone is valid and supported
  isValidBrowserTimezone: boolean;
  
  // Supported timezones list
  supportedTimezones: readonly string[];
  
  // Current timezone info for the user's selected timezone
  timezoneInfo: TimezoneInfo | null;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUserTimezone: (timezone: string) => Promise<void>;
  refreshTimezoneInfo: () => Promise<void>;
  
  // Utility functions
  getCurrentTimeInTimezone: (timezone: string) => Promise<TimezoneInfo | null>;
  validateTimezone: (timezone: string) => Promise<boolean>;
  
  // Timezone-aware date utilities
  formatDateInTimezone: (dateString: string, timeString: string, timezone: string) => string;
  convertToUserTimezone: (dateString: string, timeString: string, fromTimezone: string) => { date: string; time: string };
}

export interface TimezoneAPIResponse {
  server: TimezoneInfo;
  detected: TimezoneInfo & { isValidBrowserTimezone: boolean };
  supportedTimezones: readonly string[];
}

export interface TimezoneValidationResponse {
  timezone: string;
  isValid: boolean;
  isSupported: boolean;
  currentDateTime: {
    date: string;
    time: string;
  } | null;
  offset: number | null;
}