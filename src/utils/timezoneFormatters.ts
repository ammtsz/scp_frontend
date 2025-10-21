/**
 * Timezone-aware time formatting utilities
 * 
 * These utilities enhance existing time display with timezone awareness
 * while maintaining backward compatibility with string-based time handling
 */

/**
 * Format a time string (HH:mm:ss) to display in a specific timezone
 * Maintains existing HH:mm format but adds timezone awareness
 * 
 * @param timeString - Time in HH:mm:ss format (e.g., "14:30:00")
 * @param timezone - Target timezone (e.g., "America/Sao_Paulo")
 * @param options - Formatting options
 * @returns Formatted time string with optional timezone indicator
 */
export function formatTimeInTimezone(
  timeString: string | null | undefined,
  timezone: string,
  options: {
    showTimezone?: boolean;
    format?: 'HH:mm' | 'HH:mm:ss' | 'locale';
    locale?: string;
  } = {}
): string {
  if (!timeString) return '';
  
  const { 
    showTimezone = false, 
    format = 'HH:mm', 
    locale = 'pt-BR' 
  } = options;

  try {
    // Handle both HH:mm:ss and ISO datetime strings
    let dateTime: Date;
    
    if (timeString.includes('T') || timeString.includes('-')) {
      // ISO datetime string
      dateTime = new Date(timeString);
    } else {
      // Time-only string (HH:mm:ss) - use today's date
      const today = new Date();
      const [hours, minutes, seconds = '00'] = timeString.split(':');
      dateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 
                         parseInt(hours), parseInt(minutes), parseInt(seconds));
    }

    if (isNaN(dateTime.getTime())) {
      // Fallback for invalid dates - return original format
      return format === 'HH:mm' ? timeString.slice(0, 5) : timeString;
    }

    // Convert to target timezone and format
    const timeZoneOptions: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      ...(format === 'HH:mm:ss' && { second: '2-digit' }),
      hour12: false
    };

    const formattedTime = dateTime.toLocaleTimeString(locale, timeZoneOptions);
    
    if (showTimezone && timezone !== 'America/Sao_Paulo') {
      const timezoneDisplay = getTimezoneShortName(timezone);
      return `${formattedTime} ${timezoneDisplay}`;
    }
    
    return formattedTime;
    
  } catch (error) {
    console.error('Error formatting time:', error);
    // Fallback to original simple formatting
    return format === 'HH:mm' ? timeString.slice(0, 5) : timeString;
  }
}

/**
 * Enhanced version of the existing formatTime function with timezone awareness
 * Backwards compatible with existing usage
 */
export function formatTime(
  time: string | null | undefined,
  timezone?: string,
  showTimezone?: boolean
): string {
  if (!time) return '';
  
  if (!timezone) {
    // Fallback to original behavior
    return time.slice(0, 5); // Extract HH:mm from HH:mm:ss
  }
  
  return formatTimeInTimezone(time, timezone, { 
    format: 'HH:mm', 
    showTimezone 
  });
}

/**
 * Format datetime for locale display with timezone awareness
 * Enhanced version for components using toLocaleTimeString
 */
export function formatLocaleTime(
  dateTimeString: string | null | undefined,
  timezone: string,
  options: {
    locale?: string;
    showTimezone?: boolean;
    hour12?: boolean;
  } = {}
): string {
  if (!dateTimeString) return '';
  
  const { 
    locale = 'pt-BR', 
    showTimezone = false, 
    hour12 = false 
  } = options;

  try {
    const dateTime = new Date(dateTimeString);
    
    if (isNaN(dateTime.getTime())) {
      return '';
    }

    const formattedTime = dateTime.toLocaleTimeString(locale, {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12
    });
    
    if (showTimezone && timezone !== 'America/Sao_Paulo') {
      const timezoneDisplay = getTimezoneShortName(timezone);
      return `${formattedTime} ${timezoneDisplay}`;
    }
    
    return formattedTime;
    
  } catch (error) {
    console.error('Error formatting locale time:', error);
    return '';
  }
}

/**
 * Get a short display name for timezone
 */
function getTimezoneShortName(timezone: string): string {
  const timezoneMap: Record<string, string> = {
    'America/Sao_Paulo': 'BRT',
    'America/New_York': 'EST',
    'America/Chicago': 'CST', 
    'America/Denver': 'MST',
    'America/Los_Angeles': 'PST',
    'America/Seattle': 'PST',
    'Europe/London': 'GMT',
    'Europe/Paris': 'CET',
    'Europe/Berlin': 'CET',
    'Asia/Tokyo': 'JST',
    'Asia/Shanghai': 'CST',
    'Australia/Sydney': 'AEDT'
  };
  
  return timezoneMap[timezone] || timezone.split('/')[1] || 'GMT';
}

/**
 * Check if we should show timezone indicators
 * Only show when timezone is different from default Brazil timezone
 */
export function shouldShowTimezone(timezone: string): boolean {
  return timezone !== 'America/Sao_Paulo';
}

/**
 * Create a timezone-aware time formatter hook-compatible function
 * For use with existing React components
 */
export function createTimezoneFormatter(timezone: string) {
  return {
    formatTime: (time: string | null | undefined) => 
      formatTime(time, timezone, shouldShowTimezone(timezone)),
    
    formatLocaleTime: (dateTime: string | null | undefined) =>
      formatLocaleTime(dateTime, timezone, { 
        showTimezone: shouldShowTimezone(timezone) 
      }),
    
    formatTimeInTimezone: (time: string | null | undefined, options?: Partial<{
      showTimezone: boolean;
      format: 'HH:mm' | 'HH:mm:ss' | 'locale';
      locale: string;
    }>) =>
      formatTimeInTimezone(time, timezone, {
        showTimezone: shouldShowTimezone(timezone),
        ...options
      })
  };
}