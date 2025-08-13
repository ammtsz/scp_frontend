import { formatDateBR, formatDateWithDayOfWeekBR } from '../dateHelpers';

describe('dateHelpers', () => {
  describe('formatDateBR', () => {
    it('should format date strings correctly in Brazilian format', () => {
      expect(formatDateBR('2025-08-12')).toBe('12/08/2025');
      expect(formatDateBR('2025-01-01')).toBe('01/01/2025');
      expect(formatDateBR('2025-12-31')).toBe('31/12/2025');
    });

    it('should handle ISO datetime strings correctly', () => {
      expect(formatDateBR('2025-08-12T00:00:00')).toBe('12/08/2025');
      expect(formatDateBR('2025-08-12T10:30:00Z')).toBe('12/08/2025');
    });

    it('should handle empty strings', () => {
      expect(formatDateBR('')).toBe('');
    });

    it('should handle invalid dates by returning the original string', () => {
      expect(formatDateBR('invalid-date')).toBe('invalid-date');
    });

    it('should be timezone-safe for date-only strings', () => {
      // This test ensures our fix prevents timezone issues
      const dateStr = '2025-08-12';
      const result = formatDateBR(dateStr);
      expect(result).toBe('12/08/2025');
      
      // The date should be consistent regardless of timezone
      const testDate = new Date(dateStr + 'T00:00:00');
      expect(testDate.getDate()).toBe(12);
      expect(testDate.getMonth() + 1).toBe(8);
      expect(testDate.getFullYear()).toBe(2025);
    });
  });

  describe('formatDateWithDayOfWeekBR', () => {
    it('should format date strings with day of week in Brazilian format', () => {
      // August 12, 2025 is a Tuesday
      expect(formatDateWithDayOfWeekBR('2025-08-12')).toBe('Terça-feira, 12/08/2025');
      
      // January 1, 2025 is a Wednesday
      expect(formatDateWithDayOfWeekBR('2025-01-01')).toBe('Quarta-feira, 01/01/2025');
      
      // December 31, 2025 is a Wednesday
      expect(formatDateWithDayOfWeekBR('2025-12-31')).toBe('Quarta-feira, 31/12/2025');
    });

    it('should handle ISO datetime strings correctly', () => {
      expect(formatDateWithDayOfWeekBR('2025-08-12T00:00:00')).toBe('Terça-feira, 12/08/2025');
      expect(formatDateWithDayOfWeekBR('2025-08-12T10:30:00Z')).toBe('Terça-feira, 12/08/2025');
    });

    it('should handle empty strings', () => {
      expect(formatDateWithDayOfWeekBR('')).toBe('');
    });

    it('should handle invalid dates by returning the original string', () => {
      expect(formatDateWithDayOfWeekBR('invalid-date')).toBe('invalid-date');
    });

    it('should correctly identify all days of the week', () => {
      // Test a week starting Monday, August 11, 2025
      expect(formatDateWithDayOfWeekBR('2025-08-11')).toBe('Segunda-feira, 11/08/2025');
      expect(formatDateWithDayOfWeekBR('2025-08-12')).toBe('Terça-feira, 12/08/2025');
      expect(formatDateWithDayOfWeekBR('2025-08-13')).toBe('Quarta-feira, 13/08/2025');
      expect(formatDateWithDayOfWeekBR('2025-08-14')).toBe('Quinta-feira, 14/08/2025');
      expect(formatDateWithDayOfWeekBR('2025-08-15')).toBe('Sexta-feira, 15/08/2025');
      expect(formatDateWithDayOfWeekBR('2025-08-16')).toBe('Sábado, 16/08/2025');
      expect(formatDateWithDayOfWeekBR('2025-08-17')).toBe('Domingo, 17/08/2025');
    });

    it('should be timezone-safe for date-only strings', () => {
      const dateStr = '2025-08-12';
      const result = formatDateWithDayOfWeekBR(dateStr);
      expect(result).toBe('Terça-feira, 12/08/2025');
      
      // The date should be consistent regardless of timezone
      const testDate = new Date(dateStr + 'T00:00:00');
      expect(testDate.getDate()).toBe(12);
      expect(testDate.getMonth() + 1).toBe(8);
      expect(testDate.getFullYear()).toBe(2025);
      expect(testDate.getDay()).toBe(2); // Tuesday
    });
  });
});
