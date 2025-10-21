"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  TimezoneContextValue,
  TimezoneInfo,
  TimezoneAPIResponse,
} from "../types/timezone";
import { TimezoneService } from "../api/timezone.service";

// Default timezone info for initial state
const defaultTimezoneInfo: TimezoneInfo = {
  timezone: "America/Sao_Paulo",
  date: new Date().toISOString().split("T")[0],
  time: new Date().toTimeString().split(" ")[0],
  offset: -3,
};

// Create the context
const TimezoneContext = createContext<TimezoneContextValue | undefined>(
  undefined
);

/**
 * TimezoneProvider component that manages timezone state and provides utilities
 */
export function TimezoneProvider({ children }: { children: React.ReactNode }) {
  // State management
  const [userTimezone, setUserTimezoneState] =
    useState<string>("America/Sao_Paulo");
  const [serverTimezone, setServerTimezone] =
    useState<TimezoneInfo>(defaultTimezoneInfo);
  const [detectedTimezone, setDetectedTimezone] =
    useState<TimezoneInfo>(defaultTimezoneInfo);
  const [isValidBrowserTimezone, setIsValidBrowserTimezone] =
    useState<boolean>(false);
  const [supportedTimezones, setSupportedTimezones] = useState<
    readonly string[]
  >([
    "America/Sao_Paulo",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Seattle",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Australia/Sydney",
  ]);
  const [timezoneInfo, setTimezoneInfo] = useState<TimezoneInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get current time in a specific timezone
   */
  const getCurrentTimeInTimezone = useCallback(
    async (timezone: string): Promise<TimezoneInfo | null> => {
      try {
        return await TimezoneService.getCurrentInTimezone(timezone);
      } catch (err) {
        console.error("Failed to get current time in timezone:", err);
        return null;
      }
    },
    []
  );

  /**
   * Set user timezone and persist to localStorage
   */
  const setUserTimezone = useCallback(
    async (timezone: string) => {
      setUserTimezoneState(timezone);
      if (typeof window !== "undefined") {
        localStorage.setItem("user-timezone", timezone);
      }

      // Update timezone info for the selected timezone
      try {
        const info = await getCurrentTimeInTimezone(timezone);
        setTimezoneInfo(info);
      } catch (error) {
        console.error("Failed to get timezone info:", error);
      }
    },
    [getCurrentTimeInTimezone]
  );

  /**
   * Refresh timezone information from the server
   */
  const refreshTimezoneInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Detect browser timezone
      const browserTimezone = TimezoneService.detectBrowserTimezone();

      // Get timezone info from server
      const response: TimezoneAPIResponse =
        await TimezoneService.getTimezoneInfo(browserTimezone || undefined);

      // Update state with server response
      setServerTimezone(response.server);
      setDetectedTimezone(response.detected);
      setIsValidBrowserTimezone(response.detected.isValidBrowserTimezone);

      // Update supported timezones if available
      if (response.supportedTimezones) {
        setSupportedTimezones(response.supportedTimezones);
      }

      // Set user timezone based on detection or stored preference
      const storedTimezone =
        typeof window !== "undefined"
          ? localStorage.getItem("user-timezone")
          : null;

      let selectedTimezone = response.server.timezone;
      if (storedTimezone) {
        selectedTimezone = storedTimezone;
      } else if (response.detected.isValidBrowserTimezone) {
        selectedTimezone = response.detected.timezone;
      }

      setUserTimezoneState(selectedTimezone);

      // Get timezone info for the selected timezone
      try {
        const info = await TimezoneService.getCurrentInTimezone(
          selectedTimezone
        );
        setTimezoneInfo(info);
      } catch (infoError) {
        console.error("Failed to get current timezone info:", infoError);
        // Fallback to server timezone info
        setTimezoneInfo(response.server);
      }
    } catch (err) {
      console.error("Failed to refresh timezone info:", err);
      setError("Falha ao carregar informações de fuso horário");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Validate a timezone
   */
  const validateTimezone = useCallback(
    async (timezone: string): Promise<boolean> => {
      try {
        const result = await TimezoneService.validateTimezone(timezone);
        return result.isValid;
      } catch (err) {
        console.error("Failed to validate timezone:", err);
        return false;
      }
    },
    []
  );

  /**
   * Format date in a specific timezone
   */
  const formatDateInTimezone = useCallback(
    (dateString: string, timeString: string, timezone: string): string => {
      return TimezoneService.formatDateTimeInTimezone(
        dateString,
        timeString,
        timezone
      );
    },
    []
  );

  /**
   * Convert date/time to user's timezone (simplified - would need backend conversion for accuracy)
   */
  const convertToUserTimezone = useCallback(
    (
      dateString: string,
      timeString: string,
      fromTimezone: string
    ): { date: string; time: string } => {
      // For now, return as-is since we're preserving existing date handling
      // This would be enhanced in future phases with proper timezone conversion
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _ = fromTimezone; // Acknowledge parameter for future use
      return { date: dateString, time: timeString };
    },
    []
  );

  // Initialize timezone information on mount
  useEffect(() => {
    refreshTimezoneInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run on mount to prevent infinite loop

  // Context value
  const contextValue: TimezoneContextValue = {
    userTimezone,
    serverTimezone,
    detectedTimezone,
    isValidBrowserTimezone,
    supportedTimezones,
    timezoneInfo,
    isLoading,
    error,
    setUserTimezone,
    refreshTimezoneInfo,
    getCurrentTimeInTimezone,
    validateTimezone,
    formatDateInTimezone,
    convertToUserTimezone,
  };

  return (
    <TimezoneContext.Provider value={contextValue}>
      {children}
    </TimezoneContext.Provider>
  );
}

/**
 * Hook to use the timezone context
 */
export function useTimezone(): TimezoneContextValue {
  const context = useContext(TimezoneContext);

  if (context === undefined) {
    throw new Error("useTimezone must be used within a TimezoneProvider");
  }

  return context;
}
