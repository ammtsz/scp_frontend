import { transformAttendancesToAgenda } from './agendaTransformers';
import { 
  AttendanceResponseDto,
  PatientResponseDto,
  AttendanceType,
  AttendanceStatus,
  PatientPriority,
  TreatmentStatus
} from '@/api/types';

describe('Agenda Transformers', () => {
  describe('transformAttendancesToAgenda', () => {
    const mockPatients: PatientResponseDto[] = [
      {
        id: 1,
        name: 'João Silva',
        phone: '(11) 99999-9999',
        priority: PatientPriority.EMERGENCY,
        treatment_status: TreatmentStatus.IN_TREATMENT,
        birth_date: '1990-05-15',
        main_complaint: 'Problema de saúde',
        start_date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        name: 'Maria Santos',
        phone: '(11) 88888-8888',
        priority: PatientPriority.INTERMEDIATE,
        treatment_status: TreatmentStatus.IN_TREATMENT,
        birth_date: '1985-08-20',
        main_complaint: 'Outro problema',
        start_date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    const mockAttendances: AttendanceResponseDto[] = [
      {
        id: 1,
        patient_id: 1,
        type: AttendanceType.SPIRITUAL,
        status: AttendanceStatus.SCHEDULED,
        scheduled_date: '2024-01-01',
        scheduled_time: '10:00',
        checked_in_at: undefined,
        started_at: undefined,
        completed_at: undefined,
        cancelled_at: undefined,
        notes: 'Regular consultation',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        patient_id: 2,
        type: AttendanceType.LIGHT_BATH,
        status: AttendanceStatus.SCHEDULED,
        scheduled_date: '2024-01-01',
        scheduled_time: '11:00',
        checked_in_at: undefined,
        started_at: undefined,
        completed_at: undefined,
        cancelled_at: undefined,
        notes: 'Light bath session',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 3,
        patient_id: 1,
        type: AttendanceType.SPIRITUAL,
        status: AttendanceStatus.SCHEDULED,
        scheduled_date: '2024-01-02',
        scheduled_time: '14:00',
        checked_in_at: undefined,
        started_at: undefined,
        completed_at: undefined,
        cancelled_at: undefined,
        notes: 'Follow-up spiritual session',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];

    it('should transform attendances to agenda format grouped by type and date', () => {
      const result = transformAttendancesToAgenda(mockAttendances, mockPatients);

      expect(result).toHaveProperty('spiritual');
      expect(result).toHaveProperty('lightBath');
      
      // Check spiritual attendances
      expect(result.spiritual).toHaveLength(2); // Two different dates
      expect(result.lightBath).toHaveLength(1); // One date
    });

    it('should group spiritual attendances by date', () => {
      const result = transformAttendancesToAgenda(mockAttendances, mockPatients);
      
      const spiritualAttendances = result.spiritual;
      
      // First date (2024-01-01)
      expect(spiritualAttendances[0].date).toEqual(new Date('2024-01-01'));
      expect(spiritualAttendances[0].patients).toHaveLength(1);
      expect(spiritualAttendances[0].patients[0]).toEqual({
        id: '1',
        name: 'João Silva',
        priority: '1' // EMERGENCY priority maps to "1"
      });
      
      // Second date (2024-01-02)
      expect(spiritualAttendances[1].date).toEqual(new Date('2024-01-02'));
      expect(spiritualAttendances[1].patients).toHaveLength(1);
      expect(spiritualAttendances[1].patients[0]).toEqual({
        id: '1',
        name: 'João Silva',
        priority: '1'
      });
    });

    it('should group light bath attendances by date', () => {
      const result = transformAttendancesToAgenda(mockAttendances, mockPatients);
      
      const lightBathAttendances = result.lightBath;
      
      expect(lightBathAttendances[0].date).toEqual(new Date('2024-01-01'));
      expect(lightBathAttendances[0].patients).toHaveLength(1);
      expect(lightBathAttendances[0].patients[0]).toEqual({
        id: '2',
        name: 'Maria Santos',
        priority: '2' // INTERMEDIATE priority maps to "2"
      });
    });

    it('should sort dates chronologically', () => {
      const unsortedAttendances: AttendanceResponseDto[] = [
        {
          ...mockAttendances[2], // 2024-01-02
          scheduled_date: '2024-01-03'
        },
        {
          ...mockAttendances[0], // 2024-01-01
          scheduled_date: '2024-01-01'
        },
        {
          ...mockAttendances[1],
          id: 4,
          scheduled_date: '2024-01-02'
        }
      ];

      const result = transformAttendancesToAgenda(unsortedAttendances, mockPatients);

      // Check that spiritual dates are sorted
      if (result.spiritual.length > 1) {
        expect(result.spiritual[0].date.getTime()).toBeLessThan(result.spiritual[1].date.getTime());
      }
    });

    it('should handle patients without data (fallback to patient ID)', () => {
      const attendancesWithoutPatientData: AttendanceResponseDto[] = [
        {
          id: 1,
          patient_id: 999, // Patient not in mockPatients
          type: AttendanceType.SPIRITUAL,
          status: AttendanceStatus.SCHEDULED,
          scheduled_date: '2024-01-01',
          scheduled_time: '10:00',
          checked_in_at: undefined,
          started_at: undefined,
          completed_at: undefined,
          cancelled_at: undefined,
          notes: 'Regular consultation',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      const result = transformAttendancesToAgenda(attendancesWithoutPatientData, mockPatients);

      expect(result.spiritual).toHaveLength(1);
      expect(result.spiritual[0].patients[0]).toEqual({
        id: '999',
        name: 'Paciente 999',
        priority: '3' // Default priority
      });
    });

    it('should only include scheduled attendances', () => {
      const mixedStatusAttendances: AttendanceResponseDto[] = [
        {
          ...mockAttendances[0],
          status: AttendanceStatus.SCHEDULED
        },
        {
          ...mockAttendances[1],
          id: 2,
          status: AttendanceStatus.COMPLETED // Should be excluded
        },
        {
          ...mockAttendances[2],
          id: 3,
          status: AttendanceStatus.CANCELLED // Should be excluded
        }
      ];

      const result = transformAttendancesToAgenda(mixedStatusAttendances, mockPatients);

      // Only the scheduled attendance should be included
      expect(result.spiritual).toHaveLength(1);
      expect(result.lightBath).toHaveLength(0);
    });

    it('should handle empty attendance array', () => {
      const result = transformAttendancesToAgenda([], mockPatients);
      
      expect(result.spiritual).toEqual([]);
      expect(result.lightBath).toEqual([]);
    });

    it('should handle attendances without patient array', () => {
      const result = transformAttendancesToAgenda(mockAttendances);
      
      expect(result.spiritual).toHaveLength(2);
      expect(result.lightBath).toHaveLength(1);
      
      // Should use fallback names
      expect(result.spiritual[0].patients[0].name).toBe('Paciente 1');
      expect(result.lightBath[0].patients[0].name).toBe('Paciente 2');
    });

    it('should handle different priority mappings', () => {
      const patientsWithDifferentPriorities: PatientResponseDto[] = [
        {
          ...mockPatients[0],
          priority: PatientPriority.NORMAL
        },
        {
          ...mockPatients[1],
          priority: PatientPriority.EMERGENCY
        }
      ];

      const result = transformAttendancesToAgenda(mockAttendances, patientsWithDifferentPriorities);

      expect(result.spiritual[0].patients[0].priority).toBe('3'); // NORMAL = "3"
      expect(result.lightBath[0].patients[0].priority).toBe('1'); // EMERGENCY = "1"
    });
  });
});
