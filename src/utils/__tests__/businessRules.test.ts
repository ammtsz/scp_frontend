import { sortPatientsByPriority, PRIORITY_LEVELS, PRIORITY_LABELS } from '../businessRules';

describe('businessRules', () => {
  describe('sortPatientsByPriority', () => {
    it('should sort patients by priority first (1 > 2 > 3)', () => {
      const patients = [
        { name: 'Patient C', priority: '3', checkedInTime: new Date('2025-01-15T09:00:00Z') },
        { name: 'Patient A', priority: '1', checkedInTime: new Date('2025-01-15T10:00:00Z') },
        { name: 'Patient B', priority: '2', checkedInTime: new Date('2025-01-15T08:00:00Z') },
      ];

      const sorted = sortPatientsByPriority(patients);

      expect(sorted[0].name).toBe('Patient A'); // Priority 1
      expect(sorted[1].name).toBe('Patient B'); // Priority 2  
      expect(sorted[2].name).toBe('Patient C'); // Priority 3
    });

    it('should use check-in time as tiebreaker for same priority', () => {
      const patients = [
        { name: 'Patient B', priority: '1', checkedInTime: new Date('2025-01-15T10:00:00Z') },
        { name: 'Patient A', priority: '1', checkedInTime: new Date('2025-01-15T09:00:00Z') },
        { name: 'Patient C', priority: '1', checkedInTime: new Date('2025-01-15T11:00:00Z') },
      ];

      const sorted = sortPatientsByPriority(patients);

      expect(sorted[0].name).toBe('Patient A'); // Same priority, earliest time
      expect(sorted[1].name).toBe('Patient B'); // Same priority, middle time
      expect(sorted[2].name).toBe('Patient C'); // Same priority, latest time
    });

    it('should handle mixed priority and time scenarios', () => {
      const patients = [
        { name: 'Priority 2 Late', priority: '2', checkedInTime: new Date('2025-01-15T11:00:00Z') },
        { name: 'Priority 1 Late', priority: '1', checkedInTime: new Date('2025-01-15T10:30:00Z') },
        { name: 'Priority 2 Early', priority: '2', checkedInTime: new Date('2025-01-15T09:00:00Z') },
        { name: 'Priority 1 Early', priority: '1', checkedInTime: new Date('2025-01-15T09:30:00Z') },
        { name: 'Priority 3', priority: '3', checkedInTime: new Date('2025-01-15T08:00:00Z') },
      ];

      const sorted = sortPatientsByPriority(patients);

      expect(sorted[0].name).toBe('Priority 1 Early');  // Priority 1, earlier time
      expect(sorted[1].name).toBe('Priority 1 Late');   // Priority 1, later time
      expect(sorted[2].name).toBe('Priority 2 Early');  // Priority 2, earlier time
      expect(sorted[3].name).toBe('Priority 2 Late');   // Priority 2, later time
      expect(sorted[4].name).toBe('Priority 3');        // Priority 3
    });

    it('should handle patients without check-in time', () => {
      const patients = [
        { name: 'No Time', priority: '1', checkedInTime: null },
        { name: 'With Time', priority: '1', checkedInTime: new Date('2025-01-15T09:00:00Z') },
        { name: 'No Time 2', priority: '1', checkedInTime: null },
      ];

      const sorted = sortPatientsByPriority(patients);

      expect(sorted[0].name).toBe('With Time');  // Has check-in time, comes first
      // Patients without time maintain relative order
    });
  });

  describe('PRIORITY_LEVELS', () => {
    it('should have correct priority level constants', () => {
      expect(PRIORITY_LEVELS.URGENT).toBe('1');
      expect(PRIORITY_LEVELS.STANDARD).toBe('2');
      expect(PRIORITY_LEVELS.ROUTINE).toBe('3');
    });
  });

  describe('PRIORITY_LABELS', () => {
    it('should have correct priority labels in Portuguese', () => {
      expect(PRIORITY_LABELS['1']).toBe('Urgente');
      expect(PRIORITY_LABELS['2']).toBe('Padrão');
      expect(PRIORITY_LABELS['3']).toBe('Rotina');
    });
  });
});
