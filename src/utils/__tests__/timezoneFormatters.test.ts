import {
  formatTime,
  formatTimeInTimezone,
  formatLocaleTime,
  createTimezoneFormatter,
} from '../timezoneFormatters';

describe('timezoneFormatters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatTime', () => {
    it('should format valid time string correctly without timezone', () => {
      const result = formatTime('14:30:00');
      expect(result).toBe('14:30');
    });

    it('should handle HH:mm format without timezone', () => {
      const result = formatTime('14:30');
      expect(result).toBe('14:30');
    });

    it('should format time with timezone provided', () => {
      const result = formatTime('14:30:00', 'America/Sao_Paulo');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('should handle null input gracefully', () => {
      const result = formatTime(null);
      expect(result).toBe('');
    });

    it('should handle undefined input gracefully', () => {
      const result = formatTime(undefined);
      expect(result).toBe('');
    });

    it('should handle empty string', () => {
      const result = formatTime('');
      expect(result).toBe('');
    });

    it('should format times correctly in different timezones', () => {
      const result = formatTime('14:30:00', 'America/New_York');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe('formatTimeInTimezone', () => {
    it('should format time in specified timezone', () => {
      const result = formatTimeInTimezone('14:30:00', 'America/Sao_Paulo');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('should use extended format when requested', () => {
      const result = formatTimeInTimezone('14:30:00', 'America/Sao_Paulo', { format: 'HH:mm:ss' });
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('should handle invalid timezone gracefully', () => {
      const result = formatTimeInTimezone('14:30:00', 'Invalid/Timezone');
      expect(result).toBe('14:30'); // Should fallback to basic formatting
    });

    it('should handle null timezone', () => {
      const result = formatTimeInTimezone('14:30:00', '' as string);
      expect(result).toBe('14:30');
    });

    it('should format correctly across all supported timezones', () => {
      const supportedTimezones = [
        'America/Sao_Paulo',
        'America/New_York',
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Paris',
        'Asia/Tokyo',
        'Asia/Shanghai',
        'Australia/Sydney',
        'UTC',
      ];

      supportedTimezones.forEach(timezone => {
        const result = formatTimeInTimezone('14:30:00', timezone);
        expect(result).toMatch(/\d{2}:\d{2}/);
        expect(result.length).toBeGreaterThanOrEqual(5); // HH:mm minimum
      });
    });

    it('should handle ISO datetime strings', () => {
      const result = formatTimeInTimezone('2025-10-20T14:30:00', 'America/Sao_Paulo');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('should handle ISO datetime with timezone', () => {
      const result = formatTimeInTimezone('2025-10-20T14:30:00.000Z', 'America/Sao_Paulo');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('should show timezone indicator when requested and different from Sao Paulo', () => {
      const result = formatTimeInTimezone('14:30:00', 'America/New_York', { showTimezone: true });
      expect(result).toMatch(/\d{2}:\d{2}/);
      expect(result).toContain('EST');
    });

    it('should not show timezone indicator for Sao Paulo even when requested', () => {
      const result = formatTimeInTimezone('14:30:00', 'America/Sao_Paulo', { showTimezone: true });
      expect(result).toMatch(/^\d{2}:\d{2}$/); // Should not contain timezone suffix
    });
  });

  describe('formatLocaleTime', () => {
    it('should format ISO datetime string correctly', () => {
      const result = formatLocaleTime('2025-10-20T14:30:00.000Z', 'America/Sao_Paulo');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('should show timezone when different from Sao Paulo and requested', () => {
      const result = formatLocaleTime('2025-10-20T14:30:00.000Z', 'America/New_York', { showTimezone: true });
      expect(result).toMatch(/\d{2}:\d{2}/);
      expect(result).toContain('EST');
    });

    it('should not show timezone indicator for Sao Paulo', () => {
      const result = formatLocaleTime('2025-10-20T14:30:00.000Z', 'America/Sao_Paulo', { showTimezone: true });
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should handle invalid timezone gracefully', () => {
      const result = formatLocaleTime('2025-10-20T14:30:00.000Z', 'Invalid/Timezone');
      expect(result).toBe('');
    });

    it('should handle null and undefined inputs', () => {
      expect(formatLocaleTime(null, 'America/Sao_Paulo')).toBe('');
      expect(formatLocaleTime(undefined, 'America/Sao_Paulo')).toBe('');
      expect(formatLocaleTime('', 'America/Sao_Paulo')).toBe('');
    });

    it('should handle invalid datetime strings', () => {
      const result = formatLocaleTime('invalid-date', 'America/Sao_Paulo');
      expect(result).toBe('');
    });
  });

  describe('createTimezoneFormatter', () => {
    it('should create a formatter object with timezone methods', () => {
      const formatter = createTimezoneFormatter('America/New_York');
      expect(typeof formatter).toBe('object');
      expect(typeof formatter.formatTime).toBe('function');
      expect(typeof formatter.formatLocaleTime).toBe('function');
      expect(typeof formatter.formatTimeInTimezone).toBe('function');
    });

    it('should create formatter that handles time formatting', () => {
      const formatter = createTimezoneFormatter('America/Sao_Paulo');
      const result = formatter.formatTime('14:30:00');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('should create formatter that handles invalid inputs', () => {
      const formatter = createTimezoneFormatter('America/Sao_Paulo');
      
      expect(formatter.formatTime(null)).toBe('');
      expect(formatter.formatTime(undefined)).toBe('');
      expect(formatter.formatTime('')).toBe('');
    });

    it('should create formatter with timezone-aware methods', () => {
      const formatter = createTimezoneFormatter('America/New_York');
      const timeResult = formatter.formatTime('14:30:00');
      const localeResult = formatter.formatLocaleTime('2025-10-20T14:30:00.000Z');
      
      expect(timeResult).toMatch(/\d{2}:\d{2}/);
      expect(localeResult).toMatch(/\d{2}:\d{2}/);
    });

    it('should handle invalid timezone in factory', () => {
      const formatter = createTimezoneFormatter('Invalid/Timezone');
      const result = formatter.formatTime('14:30:00');
      expect(result).toBe('14:30'); // Should still work with fallback
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed time strings gracefully', () => {
      const malformedTimes = [
        '25:30:00', // Invalid hour
        '14:70:00', // Invalid minute
        '14:30:70', // Invalid second
        'not-a-time',
        '14:30:00:00', // Too many parts
        '14', // Too few parts
      ];

      malformedTimes.forEach(time => {
        expect(() => formatTime(time)).not.toThrow();
        expect(() => formatTimeInTimezone(time, 'America/Sao_Paulo')).not.toThrow();
        expect(() => formatLocaleTime(time, 'America/Sao_Paulo')).not.toThrow();
      });
    });

    it('should handle timezone conversion edge cases', () => {
      // Test daylight saving time transitions
      const dstTestCases = [
        '2025-03-09T07:00:00.000Z', // Spring forward in US
        '2025-11-02T06:00:00.000Z', // Fall back in US
      ];

      dstTestCases.forEach(time => {
        expect(() => formatTimeInTimezone(time, 'America/New_York')).not.toThrow();
        expect(() => formatLocaleTime(time, 'America/New_York')).not.toThrow();
      });
    });

    it('should maintain performance with multiple conversions', () => {
      const startTime = performance.now();
      
      // Perform 100 timezone conversions
      for (let i = 0; i < 100; i++) {
        formatTimeInTimezone('14:30:00', 'America/New_York');
        formatLocaleTime('2025-10-20T14:30:00.000Z', 'Europe/London');
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 200 conversions in less than 100ms
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain compatibility with existing string-based time handling', () => {
      // Test formats that existing code might pass
      const existingFormats = [
        '14:30',
        '14:30:00',
      ];

      existingFormats.forEach(format => {
        const result = formatTime(format);
        expect(result).toMatch(/\d{2}:\d{2}/); // Valid time
      });
    });

    it('should handle legacy string slicing behavior', () => {
      // Original behavior: slice(0, 5) for HH:mm extraction
      expect(formatTime('14:30:00')).toBe('14:30');
      expect(formatTime('14:30')).toBe('14:30');
    });

    it('should handle various time string formats', () => {
      const timeFormats = [
        { input: '14:30:00', expected: /\d{2}:\d{2}/ },
        { input: '14:30', expected: /\d{2}:\d{2}/ },
        { input: '09:15:30', expected: /\d{2}:\d{2}/ },
      ];

      timeFormats.forEach(({ input, expected }) => {
        const result = formatTime(input);
        expect(result).toMatch(expected);
      });
    });
  });
});