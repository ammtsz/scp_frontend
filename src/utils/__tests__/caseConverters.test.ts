import { 
  toCamelCase, 
  toSnakeCase, 
  keysToCamelCase, 
  keysToSnakeCase 
} from '../caseConverters';

describe('Case Converters', () => {
  describe('toCamelCase', () => {
    it('should convert snake_case to camelCase', () => {
      expect(toCamelCase('patient_id')).toBe('patientId');
      expect(toCamelCase('scheduled_date')).toBe('scheduledDate');
      expect(toCamelCase('max_concurrent_spiritual')).toBe('maxConcurrentSpiritual');
    });

    it('should handle single words', () => {
      expect(toCamelCase('id')).toBe('id');
      expect(toCamelCase('name')).toBe('name');
    });

    it('should handle empty strings', () => {
      expect(toCamelCase('')).toBe('');
    });
  });

  describe('toSnakeCase', () => {
    it('should convert camelCase to snake_case', () => {
      expect(toSnakeCase('patientId')).toBe('patient_id');
      expect(toSnakeCase('scheduledDate')).toBe('scheduled_date');
      expect(toSnakeCase('maxConcurrentSpiritual')).toBe('max_concurrent_spiritual');
    });

    it('should handle single words', () => {
      expect(toSnakeCase('id')).toBe('id');
      expect(toSnakeCase('name')).toBe('name');
    });

    it('should handle empty strings', () => {
      expect(toSnakeCase('')).toBe('');
    });
  });

  describe('keysToCamelCase', () => {
    it('should convert object keys from snake_case to camelCase', () => {
      const input = {
        patient_id: 1,
        scheduled_date: '2025-01-15',
        created_at: '2025-01-01T00:00:00Z'
      };

      const expected = {
        patientId: 1,
        scheduledDate: '2025-01-15',
        createdAt: '2025-01-01T00:00:00Z'
      };

      expect(keysToCamelCase(input)).toEqual(expected);
    });

    it('should handle nested objects', () => {
      const input = {
        patient_data: {
          patient_id: 1,
          birth_date: '1990-01-01'
        },
        attendance_info: {
          scheduled_time: '09:00',
          checked_in_at: null
        }
      };

      const expected = {
        patientData: {
          patientId: 1,
          birthDate: '1990-01-01'
        },
        attendanceInfo: {
          scheduledTime: '09:00',
          checkedInAt: null
        }
      };

      expect(keysToCamelCase(input)).toEqual(expected);
    });

    it('should handle arrays', () => {
      const input = [
        { patient_id: 1, patient_name: 'John' },
        { patient_id: 2, patient_name: 'Jane' }
      ];

      const expected = [
        { patientId: 1, patientName: 'John' },
        { patientId: 2, patientName: 'Jane' }
      ];

      expect(keysToCamelCase(input)).toEqual(expected);
    });

    it('should handle null and undefined', () => {
      expect(keysToCamelCase(null)).toBeNull();
      expect(keysToCamelCase(undefined)).toBeUndefined();
    });

    it('should handle primitive values', () => {
      expect(keysToCamelCase('string')).toBe('string');
      expect(keysToCamelCase(123)).toBe(123);
      expect(keysToCamelCase(true)).toBe(true);
    });
  });

  describe('keysToSnakeCase', () => {
    it('should convert object keys from camelCase to snake_case', () => {
      const input = {
        patientId: 1,
        scheduledDate: '2025-01-15',
        createdAt: '2025-01-01T00:00:00Z'
      };

      const expected = {
        patient_id: 1,
        scheduled_date: '2025-01-15',
        created_at: '2025-01-01T00:00:00Z'
      };

      expect(keysToSnakeCase(input)).toEqual(expected);
    });

    it('should handle nested objects', () => {
      const input = {
        patientData: {
          patientId: 1,
          birthDate: '1990-01-01'
        },
        attendanceInfo: {
          scheduledTime: '09:00',
          checkedInAt: null
        }
      };

      const expected = {
        patient_data: {
          patient_id: 1,
          birth_date: '1990-01-01'
        },
        attendance_info: {
          scheduled_time: '09:00',
          checked_in_at: null
        }
      };

      expect(keysToSnakeCase(input)).toEqual(expected);
    });

    it('should handle arrays', () => {
      const input = [
        { patientId: 1, patientName: 'John' },
        { patientId: 2, patientName: 'Jane' }
      ];

      const expected = [
        { patient_id: 1, patient_name: 'John' },
        { patient_id: 2, patient_name: 'Jane' }
      ];

      expect(keysToSnakeCase(input)).toEqual(expected);
    });

    it('should handle null and undefined', () => {
      expect(keysToSnakeCase(null)).toBeNull();
      expect(keysToSnakeCase(undefined)).toBeUndefined();
    });

    it('should handle primitive values', () => {
      expect(keysToSnakeCase('string')).toBe('string');
      expect(keysToSnakeCase(123)).toBe(123);
      expect(keysToSnakeCase(true)).toBe(true);
    });
  });

  describe('Round-trip conversion', () => {
    it('should maintain data integrity in round-trip conversions', () => {
      const original = {
        patient_id: 1,
        patient_data: {
          birth_date: '1990-01-01',
          main_complaint: 'Test complaint'
        },
        attendance_list: [
          {
            scheduled_date: '2025-01-15',
            checked_in_at: null
          }
        ]
      };

      // Convert to camelCase and back to snake_case
      const camelCase = keysToCamelCase(original);
      const backToSnakeCase = keysToSnakeCase(camelCase);

      expect(backToSnakeCase).toEqual(original);
    });
  });
});
