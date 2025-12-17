import axios from 'axios';
import { TimezoneService } from '../timezone.service';
import { TimezoneAPIResponse, TimezoneValidationResponse, TimezoneInfo } from '../../types/timezone';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock navigator for browser tests
Object.defineProperty(global.navigator, 'language', {
  writable: true,
  value: 'pt-BR'
});

// Mock console methods to avoid logs in tests
const consoleSpy = {
  warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
};

describe('TimezoneService', () => {
  const mockApiBaseUrl = 'http://localhost:3002';
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    // Restore original console implementation between tests
    consoleSpy.warn.mockClear();
  });

  afterAll(() => {
    process.env = originalEnv;
    consoleSpy.warn.mockRestore();
  });

  describe('getTimezoneInfo', () => {
    const mockResponse: TimezoneAPIResponse = {
      server: {
        timezone: 'America/Sao_Paulo',
        date: '2025-11-27',
        time: '10:30:00',
        offset: -180
      },
      detected: {
        timezone: 'America/New_York',
        date: '2025-11-27', 
        time: '08:30:00',
        offset: -300,
        isValidBrowserTimezone: true
      },
      supportedTimezones: ['America/Sao_Paulo', 'America/New_York', 'Europe/London']
    };

    it('should get timezone info without browser timezone', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await TimezoneService.getTimezoneInfo();

      expect(mockedAxios.get).toHaveBeenCalledWith(`${mockApiBaseUrl}/timezone`, { params: {} });
      expect(result).toEqual(mockResponse);
    });

    it('should get timezone info with browser timezone', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockResponse });
      const browserTimezone = 'America/New_York';

      const result = await TimezoneService.getTimezoneInfo(browserTimezone);

      expect(mockedAxios.get).toHaveBeenCalledWith(`${mockApiBaseUrl}/timezone`, { 
        params: { browser_timezone: browserTimezone } 
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const errorMessage = 'Network error';
      mockedAxios.get.mockRejectedValue(new Error(errorMessage));

      await expect(TimezoneService.getTimezoneInfo()).rejects.toThrow(errorMessage);
      expect(mockedAxios.get).toHaveBeenCalledWith(`${mockApiBaseUrl}/timezone`, { params: {} });
    });
  });

  describe('validateTimezone', () => {
    const mockValidationResponse: TimezoneValidationResponse = {
      timezone: 'America/Sao_Paulo',
      isValid: true,
      isSupported: true,
      currentDateTime: {
        date: '2025-11-27',
        time: '10:30:00'
      },
      offset: -180
    };

    it('should validate a timezone successfully', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockValidationResponse });
      const timezone = 'America/Sao_Paulo';

      const result = await TimezoneService.validateTimezone(timezone);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${mockApiBaseUrl}/timezone/validate/${encodeURIComponent(timezone)}`
      );
      expect(result).toEqual(mockValidationResponse);
    });

    it('should handle special characters in timezone', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockValidationResponse });
      const timezone = 'America/São_Paulo'; // With accent

      const result = await TimezoneService.validateTimezone(timezone);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${mockApiBaseUrl}/timezone/validate/${encodeURIComponent(timezone)}`
      );
      expect(result).toEqual(mockValidationResponse);
    });

    it('should return invalid timezone response', async () => {
      const invalidResponse = {
        ...mockValidationResponse,
        isValid: false,
        isSupported: false,
        currentDateTime: null,
        offset: null
      };
      mockedAxios.get.mockResolvedValue({ data: invalidResponse });

      const result = await TimezoneService.validateTimezone('Invalid/Timezone');

      expect(result.isValid).toBe(false);
      expect(result.isSupported).toBe(false);
      expect(result.currentDateTime).toBeNull();
    });

    it('should handle API errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Validation failed'));

      await expect(TimezoneService.validateTimezone('America/Sao_Paulo')).rejects.toThrow('Validation failed');
    });
  });

  describe('getCurrentInTimezone', () => {
    const mockTimezoneInfo: TimezoneInfo = {
      timezone: 'America/Sao_Paulo',
      date: '2025-11-27',
      time: '10:30:00',
      offset: -180
    };

    it('should get current time in timezone', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockTimezoneInfo });
      const timezone = 'America/Sao_Paulo';

      const result = await TimezoneService.getCurrentInTimezone(timezone);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${mockApiBaseUrl}/timezone/current/${encodeURIComponent(timezone)}`
      );
      expect(result).toEqual(mockTimezoneInfo);
    });

    it('should handle URL encoding for complex timezone names', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockTimezoneInfo });
      const timezone = 'America/Kentucky/Louisville';

      const result = await TimezoneService.getCurrentInTimezone(timezone);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${mockApiBaseUrl}/timezone/current/${encodeURIComponent(timezone)}`
      );
      expect(result).toEqual(mockTimezoneInfo);
    });

    it('should handle API errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Current time failed'));

      await expect(TimezoneService.getCurrentInTimezone('America/Sao_Paulo')).rejects.toThrow('Current time failed');
    });
  });

  describe('detectBrowserTimezone', () => {
    const originalIntl = global.Intl;

    afterEach(() => {
      global.Intl = originalIntl;
    });

    it('should detect browser timezone successfully', () => {
      const mockTimezone = 'America/Sao_Paulo';
      global.Intl = {
        ...originalIntl,
        DateTimeFormat: jest.fn().mockImplementation(() => ({
          resolvedOptions: () => ({ timeZone: mockTimezone })
        }))
      } as unknown as typeof Intl;

      const result = TimezoneService.detectBrowserTimezone();

      expect(result).toBe(mockTimezone);
    });

    it('should return null when Intl API fails', () => {
      global.Intl = {
        ...originalIntl,
        DateTimeFormat: jest.fn().mockImplementation(() => {
          throw new Error('Intl API error');
        })
      } as unknown as typeof Intl;

      const result = TimezoneService.detectBrowserTimezone();

      expect(result).toBeNull();
      expect(consoleSpy.warn).toHaveBeenCalledWith('Failed to detect browser timezone:', expect.any(Error));
    });

    it('should handle missing Intl API', () => {
      // @ts-expect-error - Testing browser compatibility
      delete global.Intl;

      const result = TimezoneService.detectBrowserTimezone();

      expect(result).toBeNull();
    });
  });

  describe('getUserLocale', () => {
    const originalNavigator = global.navigator;

    afterEach(() => {
      global.navigator = originalNavigator;
    });

    it('should return navigator language when available', () => {
      Object.defineProperty(global.navigator, 'language', {
        writable: true,
        value: 'en-US'
      });

      const result = TimezoneService.getUserLocale();

      expect(result).toBe('en-US');
    });

    it('should return default locale when navigator is unavailable', () => {
      // @ts-expect-error - Testing server-side compatibility
      delete global.navigator;

      const result = TimezoneService.getUserLocale();

      expect(result).toBe('pt-BR');
    });

    it('should return default when navigator.language is undefined', () => {
      Object.defineProperty(global.navigator, 'language', {
        writable: true,
        value: undefined
      });

      const result = TimezoneService.getUserLocale();

      expect(result).toBe('pt-BR');
    });
  });

  describe('formatDateTimeInTimezone', () => {
    const originalToLocaleString = Date.prototype.toLocaleString;

    afterEach(() => {
      Date.prototype.toLocaleString = originalToLocaleString;
    });

    it('should format date time in timezone successfully', () => {
      const mockFormattedDate = '27/11/2025, 10:30:00';
      Date.prototype.toLocaleString = jest.fn().mockReturnValue(mockFormattedDate);

      const result = TimezoneService.formatDateTimeInTimezone(
        '2025-11-27',
        '10:30:00', 
        'America/Sao_Paulo'
      );

      expect(result).toBe(mockFormattedDate);
      expect(Date.prototype.toLocaleString).toHaveBeenCalledWith('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    });

    it('should handle formatting errors gracefully', () => {
      Date.prototype.toLocaleString = jest.fn().mockImplementation(() => {
        throw new Error('Invalid timezone');
      });

      const dateString = '2025-11-27';
      const timeString = '10:30:00';
      const result = TimezoneService.formatDateTimeInTimezone(
        dateString,
        timeString,
        'Invalid/Timezone'
      );

      expect(result).toBe(`${dateString} ${timeString}`);
      expect(consoleSpy.warn).toHaveBeenCalledWith('Failed to format date in timezone:', expect.any(Error));
    });

    it('should handle invalid date inputs', () => {
      // Mock toLocaleString to throw error for invalid dates
      Date.prototype.toLocaleString = jest.fn().mockImplementation(() => {
        throw new Error('Invalid date');
      });

      const dateString = 'invalid-date';
      const timeString = 'invalid-time';
      const result = TimezoneService.formatDateTimeInTimezone(
        dateString,
        timeString,
        'America/Sao_Paulo'
      );

      // When formatting fails, it should return fallback format
      expect(result).toBe(`${dateString} ${timeString}`);
      expect(consoleSpy.warn).toHaveBeenCalledWith('Failed to format date in timezone:', expect.any(Error));
    });

    it('should create valid date from components', () => {
      const mockFormattedDate = '27/11/2025, 15:45:30';
      Date.prototype.toLocaleString = jest.fn().mockReturnValue(mockFormattedDate);

      const result = TimezoneService.formatDateTimeInTimezone(
        '2025-11-27',
        '15:45:30',
        'Europe/London'
      );

      expect(result).toBe(mockFormattedDate);
      
      // Verify proper formatting options were used
      expect(Date.prototype.toLocaleString).toHaveBeenCalledWith('pt-BR', {
        timeZone: 'Europe/London',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    });
  });

  describe('environment configuration', () => {
    // Note: API_BASE_URL is set at module load time, so these tests verify the default behavior
    it('should use default localhost URL in test environment', async () => {
      mockedAxios.get.mockResolvedValue({ data: {} });

      await TimezoneService.getTimezoneInfo();

      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3002/timezone', { params: {} });
    });

    it('should construct proper API endpoint URLs', async () => {
      mockedAxios.get.mockResolvedValue({ data: {} });

      await TimezoneService.validateTimezone('America/Sao_Paulo');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3002/timezone/validate/America%2FSao_Paulo'
      );
    });
  });
});