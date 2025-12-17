import { sortPatientsByPriority, PRIORITY_LEVELS, PRIORITY_LABELS, isPatientAlreadyScheduled } from '../businessRules';
import type { AttendanceByDate, AttendanceStatus } from '../../types/types';

// Test patient interface with name property
interface TestPatient {
  name: string;
  priority: string;
  checkedInTime?: string | null;
}

describe('businessRules', () => {
  describe('sortPatientsByPriority', () => {
    it('should sort patients by priority first (1 > 2 > 3)', () => {
      const patients: TestPatient[] = [
        { name: 'Patient C', priority: '3', checkedInTime: '2025-01-15T09:00:00Z' },
        { name: 'Patient A', priority: '1', checkedInTime: '2025-01-15T10:00:00Z' },
        { name: 'Patient B', priority: '2', checkedInTime: '2025-01-15T08:00:00Z' },
      ];

      const sorted = sortPatientsByPriority(patients);

      expect(sorted[0].name).toBe('Patient A'); // Priority 1
      expect(sorted[1].name).toBe('Patient B'); // Priority 2
      expect(sorted[2].name).toBe('Patient C'); // Priority 3
    });

    it('should use check-in time as tiebreaker for same priority', () => {
      const patients: TestPatient[] = [
        { name: 'Patient B', priority: '1', checkedInTime: '2025-01-15T10:00:00Z' },
        { name: 'Patient A', priority: '1', checkedInTime: '2025-01-15T09:00:00Z' },
        { name: 'Patient C', priority: '1', checkedInTime: '2025-01-15T11:00:00Z' },
      ];

      const sorted = sortPatientsByPriority(patients);

      expect(sorted[0].name).toBe('Patient A'); // Same priority, earliest time
      expect(sorted[1].name).toBe('Patient B'); // Same priority, middle time
      expect(sorted[2].name).toBe('Patient C'); // Same priority, latest time
    });

    it('should handle mixed priority and time scenarios', () => {
      const patients: TestPatient[] = [
        { name: 'Priority 2 Late', priority: '2', checkedInTime: '2025-01-15T11:00:00Z' },
        { name: 'Priority 1 Late', priority: '1', checkedInTime: '2025-01-15T10:30:00Z' },
        { name: 'Priority 2 Early', priority: '2', checkedInTime: '2025-01-15T09:00:00Z' },
        { name: 'Priority 1 Early', priority: '1', checkedInTime: '2025-01-15T09:30:00Z' },
        { name: 'Priority 3', priority: '3', checkedInTime: '2025-01-15T08:00:00Z' },
      ];

      const sorted = sortPatientsByPriority(patients);

      expect(sorted[0].name).toBe('Priority 1 Early');  // Priority 1, earlier time
      expect(sorted[1].name).toBe('Priority 1 Late');   // Priority 1, later time
      expect(sorted[2].name).toBe('Priority 2 Early');  // Priority 2, earlier time
      expect(sorted[3].name).toBe('Priority 2 Late');   // Priority 2, later time
      expect(sorted[4].name).toBe('Priority 3');        // Priority 3
    });

    it('should handle patients without check-in time', () => {
      const patients: TestPatient[] = [
        { name: 'No Time', priority: '1', checkedInTime: null },
        { name: 'With Time', priority: '1', checkedInTime: '2025-01-15T09:00:00Z' },
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
      expect(PRIORITY_LABELS['1']).toBe('Exceção');
      expect(PRIORITY_LABELS['2']).toBe('Idoso/crianças');
      expect(PRIORITY_LABELS['3']).toBe('Padrão');
    });
  });

  describe('isPatientAlreadyScheduled', () => {
    const mockAttendancesByDate: AttendanceByDate = {
      date: new Date('2025-01-15'),
      spiritual: {
        scheduled: [
          { name: 'João Silva', priority: '1' },
          { name: 'Maria Santos', priority: '2' }
        ],
        checkedIn: [
          { name: 'Pedro Oliveira', priority: '1' }
        ],
        onGoing: [
          { name: 'Ana Costa', priority: '2' }
        ],
        completed: [
          { name: 'Carlos Ferreira', priority: '3' }
        ]
      } as AttendanceStatus,
      lightBath: {
        scheduled: [
          { name: 'Lucia Pereira', priority: '2' }
        ],
        checkedIn: [],
        onGoing: [],
        completed: []
      } as AttendanceStatus,
      rod: {
        scheduled: [],
        checkedIn: [
          { name: 'Roberto Lima', priority: '1' }
        ],
        onGoing: [],
        completed: []
      } as AttendanceStatus,
      combined: {
        scheduled: [],
        checkedIn: [],
        onGoing: [],
        completed: []
      } as AttendanceStatus
    };

    it('should return true when patient is found in spiritual scheduled', () => {
      const result = isPatientAlreadyScheduled(
        'João Silva',
        ['spiritual'],
        mockAttendancesByDate
      );
      expect(result).toBe(true);
    });

    it('should return true when patient is found in checkedIn status', () => {
      const result = isPatientAlreadyScheduled(
        'Pedro Oliveira',
        ['spiritual'],
        mockAttendancesByDate
      );
      expect(result).toBe(true);
    });

    it('should return true when patient is found in onGoing status', () => {
      const result = isPatientAlreadyScheduled(
        'Ana Costa',
        ['spiritual'],
        mockAttendancesByDate
      );
      expect(result).toBe(true);
    });

    it('should return true when patient is found in completed status', () => {
      const result = isPatientAlreadyScheduled(
        'Carlos Ferreira',
        ['spiritual'],
        mockAttendancesByDate
      );
      expect(result).toBe(true);
    });

    it('should return true when patient is found in different attendance type', () => {
      const result = isPatientAlreadyScheduled(
        'Lucia Pereira',
        ['lightBath'],
        mockAttendancesByDate
      );
      expect(result).toBe(true);
    });

    it('should return true when patient is found in rod attendance type', () => {
      const result = isPatientAlreadyScheduled(
        'Roberto Lima',
        ['rod'],
        mockAttendancesByDate
      );
      expect(result).toBe(true);
    });

    it('should return false when patient is not found', () => {
      const result = isPatientAlreadyScheduled(
        'Nome Inexistente',
        ['spiritual'],
        mockAttendancesByDate
      );
      expect(result).toBe(false);
    });

    it('should return false when attendancesByDate is null', () => {
      const result = isPatientAlreadyScheduled(
        'João Silva',
        ['spiritual'],
        null
      );
      expect(result).toBe(false);
    });

    it('should handle case-insensitive name matching', () => {
      const result = isPatientAlreadyScheduled(
        'joão silva',  // lowercase with correct accent
        ['spiritual'],
        mockAttendancesByDate
      );
      expect(result).toBe(true);
    });

    it('should handle multiple attendance types in search', () => {
      const result = isPatientAlreadyScheduled(
        'João Silva',
        ['spiritual', 'lightBath'],
        mockAttendancesByDate
      );
      expect(result).toBe(true);
    });

    it('should return false when searching in wrong attendance type', () => {
      const result = isPatientAlreadyScheduled(
        'João Silva',  // in spiritual, not lightBath
        ['lightBath'],
        mockAttendancesByDate
      );
      expect(result).toBe(false);
    });

    it('should handle empty selected attendance types', () => {
      const result = isPatientAlreadyScheduled(
        'João Silva',
        [],
        mockAttendancesByDate
      );
      expect(result).toBe(false);
    });

    it('should handle attendance type with empty status arrays', () => {
      const emptyAttendances: AttendanceByDate = {
        date: new Date('2025-01-15'),
        spiritual: {
          scheduled: [],
          checkedIn: [],
          onGoing: [],
          completed: []
        } as AttendanceStatus,
        lightBath: {
          scheduled: [],
          checkedIn: [],
          onGoing: [],
          completed: []
        } as AttendanceStatus,
        rod: {
          scheduled: [],
          checkedIn: [],
          onGoing: [],
          completed: []
        } as AttendanceStatus,
        combined: {
          scheduled: [],
          checkedIn: [],
          onGoing: [],
          completed: []
        } as AttendanceStatus
      };

      const result = isPatientAlreadyScheduled(
        'João Silva',
        ['spiritual'],
        emptyAttendances
      );
      expect(result).toBe(false);
    });

    it('should handle partially defined attendance types', () => {
      const partialAttendances: AttendanceByDate = {
        date: new Date('2025-01-15'),
        spiritual: {
          scheduled: [{ name: 'Test Patient', priority: '1' }],
          checkedIn: [],
          onGoing: [],
          completed: []
        } as AttendanceStatus,
        lightBath: {
          scheduled: [],
          checkedIn: [],
          onGoing: [],
          completed: []
        } as AttendanceStatus,
        rod: {
          scheduled: [],
          checkedIn: [],
          onGoing: [],
          completed: []
        } as AttendanceStatus,
        combined: {
          scheduled: [],
          checkedIn: [],
          onGoing: [],
          completed: []
        } as AttendanceStatus
      };

      const result = isPatientAlreadyScheduled(
        'Test Patient',
        ['spiritual'],
        partialAttendances
      );
      expect(result).toBe(true);
    });

    it('should handle attendance with undefined status arrays', () => {
      const attendancesWithNulls: AttendanceByDate = {
        date: new Date('2025-01-15'),
        spiritual: {
          scheduled: undefined as unknown as [],
          checkedIn: [],
          onGoing: [],
          completed: []
        } as AttendanceStatus,
        lightBath: {
          scheduled: [],
          checkedIn: [],
          onGoing: [],
          completed: []
        } as AttendanceStatus,
        rod: {
          scheduled: [],
          checkedIn: [],
          onGoing: [],
          completed: []
        } as AttendanceStatus,
        combined: {
          scheduled: [],
          checkedIn: [],
          onGoing: [],
          completed: []
        } as AttendanceStatus
      };

      const result = isPatientAlreadyScheduled(
        'Test Patient',
        ['spiritual'],
        attendancesWithNulls
      );
      expect(result).toBe(false);
    });
  });
});
