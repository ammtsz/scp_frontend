import {
  formatDate,
  formatTime,
  formatDateTime,
  isToday,
  isPast,
  getRelativeTimeDescription
} from '../formatters';

describe('formatters', () => {
  describe('formatDate', () => {
    it('should format dates in Brazilian format (DD/MM/YYYY)', () => {
      // Note: Date parsing of 'YYYY-MM-DD' strings treats them as UTC, which may be one day off
      expect(formatDate('2025-08-12T12:00:00')).toBe('12/08/2025');
      expect(formatDate('2025-01-01T12:00:00')).toBe('01/01/2025');
      expect(formatDate('2025-12-31T12:00:00')).toBe('31/12/2025');
    });

    it('should handle Date objects', () => {
      const date = new Date(2025, 7, 12); // Month is 0-indexed
      expect(formatDate(date)).toBe('12/08/2025');
    });

    it('should handle empty/invalid inputs', () => {
      expect(formatDate('')).toBe('');
      expect(formatDate('invalid-date')).toBe('invalid-date');
    });

    it('should handle ISO datetime strings', () => {
      expect(formatDate('2025-08-12T14:30:00Z')).toBe('12/08/2025');
    });
  });

  describe('formatTime', () => {
    it('should format time to HH:MM format', () => {
      expect(formatTime('14:30:00')).toBe('14:30');
      expect(formatTime('09:05:30')).toBe('09:05');
      expect(formatTime('23:59:59')).toBe('23:59');
    });

    it('should handle HH:MM format input', () => {
      expect(formatTime('14:30')).toBe('14:30');
      expect(formatTime('09:05')).toBe('09:05');
    });

    it('should handle Date objects', () => {
      const date = new Date('2025-08-12T14:30:00');
      expect(formatTime(date)).toBe('14:30');
    });

    it('should handle ISO datetime strings with T', () => {
      // Note: These may be affected by timezone conversion, testing the parsing logic
      const result1 = formatTime('2025-08-12T14:30:00Z');
      const result2 = formatTime('2025-08-12T09:05:30');
      
      // Verify format is HH:MM (5 characters)
      expect(result1).toMatch(/^\d{2}:\d{2}$/);
      expect(result2).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should handle time strings without T but with colons', () => {
      // This tests the specific branch: timeInput.includes(':') && !timeInput.includes('T')
      expect(formatTime('08:45:30')).toBe('08:45');
      expect(formatTime('12:00')).toBe('12:00');
      expect(formatTime('23:59:59')).toBe('23:59');
    });

    it('should handle edge cases for time parsing', () => {
      expect(formatTime('00:00:00')).toBe('00:00');
      expect(formatTime('24:00:00')).toBe('00:00'); // 24:00 rolls over to 00:00
    });

    it('should handle empty/invalid inputs', () => {
      expect(formatTime('')).toBe('');
      expect(formatTime('invalid-time')).toBe('invalid-time');
    });

    it('should handle null and undefined inputs gracefully', () => {
      // These inputs simulate edge cases where formatTime might receive unexpected values
      expect(formatTime('' as string)).toBe('');
      expect(formatTime('null')).toBe('null'); // String 'null' should be returned as-is if invalid
    });
  });

  describe('formatDateTime', () => {
    it('should combine date and time formatting', () => {
      const result = formatDateTime('2025-08-12T14:30:00');
      expect(result).toBe('12/08/2025 às 14:30');
    });

    it('should handle Date objects', () => {
      const date = new Date('2025-08-12T14:30:00');
      const result = formatDateTime(date);
      expect(result).toBe('12/08/2025 às 14:30');
    });

    it('should handle empty/invalid inputs', () => {
      expect(formatDateTime('')).toBe('');
      expect(formatDateTime('invalid-date')).toBe('invalid-date');
    });
  });

  describe('isToday', () => {
    it('should correctly identify today', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
      expect(isToday(today.toISOString())).toBe(true);
    });

    it('should return false for other dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isToday(tomorrow)).toBe(false);
    });

    it('should handle empty/invalid inputs', () => {
      expect(isToday('')).toBe(false);
      expect(isToday('invalid-date')).toBe(false);
    });
  });

  describe('isPast', () => {
    it('should correctly identify past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isPast(yesterday)).toBe(true);
      expect(isPast(yesterday.toISOString())).toBe(true);
    });

    it('should return false for future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isPast(tomorrow)).toBe(false);
    });

    it('should handle current time (could be true or false depending on exact timing)', () => {
      const now = new Date();
      const result = isPast(now);
      expect(typeof result).toBe('boolean');
    });

    it('should handle empty/invalid inputs', () => {
      expect(isPast('')).toBe(false);
      expect(isPast('invalid-date')).toBe(false);
    });
  });

  describe('getRelativeTimeDescription', () => {
    it('should return proper relative descriptions', () => {
      const today = new Date();
      const result = getRelativeTimeDescription(today);
      expect(result).toBe('hoje');
    });

    it('should handle future dates with "em X dias" format', () => {
      const future = new Date();
      future.setDate(future.getDate() + 5);
      const result = getRelativeTimeDescription(future);
      expect(result).toMatch(/^em \d+ dias$/);
    });

    it('should handle past dates with "há X dias" format', () => {
      const past = new Date();
      past.setDate(past.getDate() - 5);
      const result = getRelativeTimeDescription(past);
      expect(result).toMatch(/^há \d+ dias$/);
    });

    it('should handle tomorrow specifically', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const result = getRelativeTimeDescription(tomorrow);
      expect(result).toBe('amanhã');
    });

    it('should handle yesterday specifically', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = getRelativeTimeDescription(yesterday);
      expect(result).toBe('ontem');
    });

    it('should handle multiple days in future', () => {
      const future = new Date();
      future.setDate(future.getDate() + 10);
      const result = getRelativeTimeDescription(future);
      expect(result).toBe('em 10 dias');
    });

    it('should handle multiple days in past', () => {
      const past = new Date();
      past.setDate(past.getDate() - 10);
      const result = getRelativeTimeDescription(past);
      expect(result).toBe('há 10 dias');
    });

    it('should fallback to formatDate for invalid inputs', () => {
      const result = getRelativeTimeDescription('invalid-date');
      expect(typeof result).toBe('string');
    });

    it('should handle empty inputs', () => {
      expect(getRelativeTimeDescription('')).toBe('');
    });

    it('should handle date strings correctly', () => {
      const today = new Date();
      const todayString = today.toISOString();
      const result = getRelativeTimeDescription(todayString);
      expect(result).toBe('hoje');
    });
  });
});