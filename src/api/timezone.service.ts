import axios from 'axios';
import { TimezoneAPIResponse, TimezoneValidationResponse, TimezoneInfo } from '../types/timezone';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

/**
 * Frontend service for timezone-related API calls
 */
export class TimezoneService {
  
  /**
   * Get timezone information with optional browser timezone detection
   * @param browserTimezone Optional browser timezone to validate
   * @returns Server and detected timezone information
   */
  static async getTimezoneInfo(browserTimezone?: string): Promise<TimezoneAPIResponse> {
    const params = browserTimezone ? { browser_timezone: browserTimezone } : {};
    
    const response = await axios.get(`${API_BASE_URL}/timezone`, { params });
    return response.data;
  }
  
  /**
   * Validate a specific timezone
   * @param timezone The timezone to validate
   * @returns Validation result with timezone info
   */
  static async validateTimezone(timezone: string): Promise<TimezoneValidationResponse> {
    const encodedTimezone = encodeURIComponent(timezone);
    const response = await axios.get(`${API_BASE_URL}/timezone/validate/${encodedTimezone}`);
    return response.data;
  }
  
  /**
   * Get current date/time in a specific timezone
   * @param timezone The target timezone
   * @returns Current date/time information
   */
  static async getCurrentInTimezone(timezone: string): Promise<TimezoneInfo> {
    const encodedTimezone = encodeURIComponent(timezone);
    const response = await axios.get(`${API_BASE_URL}/timezone/current/${encodedTimezone}`);
    return response.data;
  }
  
  /**
   * Detect browser timezone using JavaScript Intl API
   * @returns Detected browser timezone or null if unavailable
   */
  static detectBrowserTimezone(): string | null {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
      console.warn('Failed to detect browser timezone:', error);
      return null;
    }
  }
  
  /**
   * Get user's locale for date formatting
   * @returns User's locale string
   */
  static getUserLocale(): string {
    if (typeof navigator !== 'undefined') {
      return navigator.language || 'pt-BR';
    }
    return 'pt-BR'; // Default to Brazilian Portuguese
  }
  
  /**
   * Format a date in a specific timezone using Brazilian locale
   * @param dateString Date in YYYY-MM-DD format
   * @param timeString Time in HH:MM:SS format
   * @param timezone Target timezone
   * @returns Formatted date string
   */
  static formatDateTimeInTimezone(
    dateString: string, 
    timeString: string, 
    timezone: string
  ): string {
    try {
      // Create date from components
      const date = new Date(`${dateString}T${timeString}`);
      
      // Format in the target timezone with Brazilian locale
      return date.toLocaleString('pt-BR', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.warn('Failed to format date in timezone:', error);
      return `${dateString} ${timeString}`;
    }
  }
}