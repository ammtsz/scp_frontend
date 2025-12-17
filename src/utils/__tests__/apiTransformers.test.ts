import { 
  transformPriority, 
  transformStatus, 
  transformAttendanceType, 
  transformAttendanceProgression,
  transformStatusToApi,
  transformPriorityToApi,
  transformPatientFromApi,
  transformSinglePatientFromApi,
  transformAttendanceToPrevious,
  transformAttendanceToNext,
  transformPatientWithAttendances,
  transformAttendanceTypeToApi,
  transformAttendanceProgressionToApi
} from '../apiTransformers';
import { PatientPriority, TreatmentStatus, AttendanceType, AttendanceStatus, PatientResponseDto, AttendanceResponseDto } from '@/api/types';

describe('API Transformers', () => {
  describe('transformPriority', () => {
    it('should transform EMERGENCY to "1"', () => {
      expect(transformPriority(PatientPriority.EMERGENCY)).toBe('1');
    });

    it('should transform INTERMEDIATE to "2"', () => {
      expect(transformPriority(PatientPriority.INTERMEDIATE)).toBe('2');
    });

    it('should transform NORMAL to "3"', () => {
      expect(transformPriority(PatientPriority.NORMAL)).toBe('3');
    });

    it('should default to "3" for unknown priority', () => {
      expect(transformPriority('UNKNOWN' as PatientPriority)).toBe('3');
    });
  });

  describe('transformStatus', () => {
    it('should transform NEW_PATIENT to "N"', () => {
      expect(transformStatus(TreatmentStatus.NEW_PATIENT)).toBe('N');
    });

    it('should transform IN_TREATMENT to "T"', () => {
      expect(transformStatus(TreatmentStatus.IN_TREATMENT)).toBe('T');
    });

    it('should transform DISCHARGED to "A"', () => {
      expect(transformStatus(TreatmentStatus.DISCHARGED)).toBe('A');
    });

    it('should transform ABSENT to "F"', () => {
      expect(transformStatus(TreatmentStatus.ABSENT)).toBe('F');
    });

    it('should default to "T" for unknown status', () => {
      expect(transformStatus('UNKNOWN' as TreatmentStatus)).toBe('T');
    });
  });

  describe('transformAttendanceType', () => {
    it('should transform SPIRITUAL to "spiritual"', () => {
      expect(transformAttendanceType(AttendanceType.SPIRITUAL)).toBe('spiritual');
    });

    it('should transform LIGHT_BATH to "lightBath"', () => {
      expect(transformAttendanceType(AttendanceType.LIGHT_BATH)).toBe('lightBath');
    });

    it('should transform ROD to "rod"', () => {
      expect(transformAttendanceType(AttendanceType.ROD)).toBe('rod');
    });

    it('should default to "spiritual" for unknown type', () => {
      expect(transformAttendanceType('UNKNOWN' as AttendanceType)).toBe('spiritual');
    });
  });

  describe('transformAttendanceProgression', () => {
    it('should transform SCHEDULED to "scheduled"', () => {
      expect(transformAttendanceProgression(AttendanceStatus.SCHEDULED)).toBe('scheduled');
    });

    it('should transform CHECKED_IN to "checkedIn"', () => {
      expect(transformAttendanceProgression(AttendanceStatus.CHECKED_IN)).toBe('checkedIn');
    });

    it('should transform IN_PROGRESS to "onGoing"', () => {
      expect(transformAttendanceProgression(AttendanceStatus.IN_PROGRESS)).toBe('onGoing');
    });

    it('should transform COMPLETED to "completed"', () => {
      expect(transformAttendanceProgression(AttendanceStatus.COMPLETED)).toBe('completed');
    });

    it('should default to "scheduled" for unknown status', () => {
      expect(transformAttendanceProgression('UNKNOWN' as AttendanceStatus)).toBe('scheduled');
    });
  });

  describe('transformStatusToApi', () => {
    it('should transform "N" to NEW_PATIENT', () => {
      expect(transformStatusToApi('N')).toBe(TreatmentStatus.NEW_PATIENT);
    });

    it('should transform "T" to IN_TREATMENT', () => {
      expect(transformStatusToApi('T')).toBe(TreatmentStatus.IN_TREATMENT);
    });

    it('should transform "A" to DISCHARGED', () => {
      expect(transformStatusToApi('A')).toBe(TreatmentStatus.DISCHARGED);
    });

    it('should transform "F" to ABSENT', () => {
      expect(transformStatusToApi('F')).toBe(TreatmentStatus.ABSENT);
    });

    it('should default to NEW_PATIENT for unknown status', () => {
      expect(transformStatusToApi('X' as 'N')).toBe(TreatmentStatus.NEW_PATIENT);
    });
  });

  describe('transformPriorityToApi', () => {
    it('should transform "1" to EMERGENCY', () => {
      expect(transformPriorityToApi('1')).toBe(PatientPriority.EMERGENCY);
    });

    it('should transform "2" to INTERMEDIATE', () => {
      expect(transformPriorityToApi('2')).toBe(PatientPriority.INTERMEDIATE);
    });

    it('should transform "3" to NORMAL', () => {
      expect(transformPriorityToApi('3')).toBe(PatientPriority.NORMAL);
    });

    it('should default to NORMAL for unknown priority', () => {
      expect(transformPriorityToApi('9' as '1')).toBe(PatientPriority.NORMAL);
    });
  });

  describe('transformPatientFromApi', () => {
    const createMockPatient = (overrides = {}): PatientResponseDto => ({
      id: 1,
      name: 'Test Patient',
      phone: '11999999999',
      priority: PatientPriority.NORMAL,
      treatment_status: TreatmentStatus.IN_TREATMENT,
      birth_date: '1990-01-01',
      main_complaint: 'Test complaint',
      start_date: '2025-01-01',
      discharge_date: undefined,
      missing_appointments_streak: 0,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      ...overrides
    });

    it('should transform basic patient data', () => {
      const apiPatient = createMockPatient();
      const result = transformPatientFromApi(apiPatient);

      expect(result).toEqual({
        id: '1',
        name: 'Test Patient',
        phone: '11999999999',
        priority: '3',
        status: 'T'
      });
    });

    it('should handle missing phone number', () => {
      const apiPatient = createMockPatient({ phone: null });
      const result = transformPatientFromApi(apiPatient);

      expect(result.phone).toBe('');
    });

    it('should handle undefined phone number', () => {
      const apiPatient = createMockPatient({ phone: undefined });
      const result = transformPatientFromApi(apiPatient);

      expect(result.phone).toBe('');
    });
  });

  describe('transformSinglePatientFromApi', () => {
    const createMockPatient = (overrides = {}): PatientResponseDto => ({
      id: 1,
      name: 'Test Patient',
      phone: '11999999999',
      priority: PatientPriority.NORMAL,
      treatment_status: TreatmentStatus.IN_TREATMENT,
      birth_date: '1990-01-01',
      main_complaint: 'Test complaint',
      start_date: '2025-01-01',
      discharge_date: undefined,
      missing_appointments_streak: 0,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      ...overrides
    });

    it('should transform complete patient data', () => {
      const apiPatient = createMockPatient();
      const result = transformSinglePatientFromApi(apiPatient);

      expect(result.id).toBe('1');
      expect(result.name).toBe('Test Patient');
      expect(result.phone).toBe('11999999999');
      expect(result.priority).toBe('3');
      expect(result.status).toBe('T');
      expect(result.birthDate).toEqual(new Date('1990-01-01'));
      expect(result.mainComplaint).toBe('Test complaint');
      expect(result.startDate).toEqual(new Date('2025-01-01'));
      expect(result.dischargeDate).toBeNull();
    });

    it('should handle missing birth date', () => {
      const apiPatient = createMockPatient({ birth_date: null });
      const result = transformSinglePatientFromApi(apiPatient);

      expect(result.birthDate).toBeInstanceOf(Date);
    });

    it('should handle missing main complaint', () => {
      const apiPatient = createMockPatient({ main_complaint: null });
      const result = transformSinglePatientFromApi(apiPatient);

      expect(result.mainComplaint).toBe('');
    });

    it('should handle discharge date when provided', () => {
      const apiPatient = createMockPatient({ discharge_date: '2025-12-31' });
      const result = transformSinglePatientFromApi(apiPatient);

      expect(result.dischargeDate).toEqual(new Date('2025-12-31'));
    });

    it('should have default recommendations structure', () => {
      const apiPatient = createMockPatient();
      const result = transformSinglePatientFromApi(apiPatient);

      expect(result.currentRecommendations).toEqual({
        date: expect.any(Date),
        food: '',
        water: '',
        ointment: '',
        lightBath: false,
        rod: false,
        spiritualTreatment: false,
        returnWeeks: 0
      });
    });
  });

  describe('transformAttendanceToPrevious', () => {
    const createMockAttendance = (overrides = {}): AttendanceResponseDto => ({
      id: 1,
      patient_id: 1,
      scheduled_date: '2025-01-15',
      scheduled_time: '10:00',
      type: AttendanceType.SPIRITUAL,
      status: AttendanceStatus.COMPLETED,
      notes: 'Test notes',
      created_at: '2025-01-15T00:00:00Z',
      updated_at: '2025-01-15T00:00:00Z',
      ...overrides
    });

    it('should transform attendance to previous format', () => {
      const apiAttendance = createMockAttendance();
      const result = transformAttendanceToPrevious(apiAttendance);

      expect(result).toEqual({
        attendanceId: '1',
        date: new Date('2025-01-15T00:00:00'),
        type: 'spiritual',
        notes: 'Test notes',
        recommendations: null
      });
    });

    it('should handle missing notes', () => {
      const apiAttendance = createMockAttendance({ notes: undefined });
      const result = transformAttendanceToPrevious(apiAttendance);

      expect(result.notes).toBe('');
    });

    it('should handle different attendance types', () => {
      const lightBathAttendance = createMockAttendance({ type: AttendanceType.LIGHT_BATH });
      const rodAttendance = createMockAttendance({ type: AttendanceType.ROD });

      expect(transformAttendanceToPrevious(lightBathAttendance).type).toBe('lightBath');
      expect(transformAttendanceToPrevious(rodAttendance).type).toBe('rod');
    });
  });

  describe('transformAttendanceToNext', () => {
    const createMockAttendance = (overrides = {}): AttendanceResponseDto => ({
      id: 1,
      patient_id: 1,
      scheduled_date: '2025-01-20',
      scheduled_time: '14:00',
      type: AttendanceType.SPIRITUAL,
      status: AttendanceStatus.SCHEDULED,
      notes: undefined,
      created_at: '2025-01-15T00:00:00Z',
      updated_at: '2025-01-15T00:00:00Z',
      ...overrides
    });

    it('should transform attendance to next format', () => {
      const apiAttendance = createMockAttendance();
      const result = transformAttendanceToNext(apiAttendance);

      expect(result).toEqual({
        date: new Date('2025-01-20T00:00:00'),
        type: 'spiritual'
      });
    });

    it('should handle different attendance types', () => {
      const lightBathAttendance = createMockAttendance({ type: AttendanceType.LIGHT_BATH });
      const result = transformAttendanceToNext(lightBathAttendance);

      expect(result.type).toBe('lightBath');
    });
  });

  describe('transformPatientWithAttendances', () => {
    const createMockPatient = (): PatientResponseDto => ({
      id: 1,
      name: 'Test Patient',
      phone: '11999999999',
      priority: PatientPriority.NORMAL,
      treatment_status: TreatmentStatus.IN_TREATMENT,
      birth_date: '1990-01-01',
      main_complaint: 'Test complaint',
      start_date: '2025-01-01',
      discharge_date: undefined,
      missing_appointments_streak: 0,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    });

    const createMockAttendance = (overrides = {}): AttendanceResponseDto => ({
      id: 1,
      patient_id: 1,
      scheduled_date: '2025-01-15',
      scheduled_time: '10:00',
      type: AttendanceType.SPIRITUAL,
      status: AttendanceStatus.COMPLETED,
      notes: 'Test notes',
      created_at: '2025-01-15T00:00:00Z',
      updated_at: '2025-01-15T00:00:00Z',
      ...overrides
    });

    it('should transform patient with completed attendances', () => {
      const patient = createMockPatient();
      const attendances = [
        createMockAttendance({ id: 1, status: AttendanceStatus.COMPLETED, scheduled_date: '2025-01-10' }),
        createMockAttendance({ id: 2, status: AttendanceStatus.COMPLETED, scheduled_date: '2025-01-05' })
      ];

      const result = transformPatientWithAttendances(patient, attendances);

      expect(result.previousAttendances).toHaveLength(2);
      expect(result.previousAttendances[0].attendanceId).toBe('1'); // Most recent first
      expect(result.previousAttendances[1].attendanceId).toBe('2');
    });

    it('should filter out non-completed attendances from previous', () => {
      const patient = createMockPatient();
      const attendances = [
        createMockAttendance({ id: 1, status: AttendanceStatus.COMPLETED }),
        createMockAttendance({ id: 2, status: AttendanceStatus.SCHEDULED }),
        createMockAttendance({ id: 3, status: AttendanceStatus.IN_PROGRESS })
      ];

      const result = transformPatientWithAttendances(patient, attendances);

      expect(result.previousAttendances).toHaveLength(1);
      expect(result.previousAttendances[0].attendanceId).toBe('1');
    });

    it('should include future attendances', () => {
      const patient = createMockPatient();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      const futureDateString = futureDate.toISOString().split('T')[0];

      const attendances = [
        createMockAttendance({ 
          id: 1, 
          status: AttendanceStatus.SCHEDULED, 
          scheduled_date: futureDateString 
        }),
        createMockAttendance({ 
          id: 2, 
          status: AttendanceStatus.CHECKED_IN, 
          scheduled_date: futureDateString 
        })
      ];

      const result = transformPatientWithAttendances(patient, attendances);

      expect(result.nextAttendanceDates).toHaveLength(2);
    });

    it('should handle empty attendances array', () => {
      const patient = createMockPatient();
      const result = transformPatientWithAttendances(patient, []);

      expect(result.previousAttendances).toHaveLength(0);
      expect(result.nextAttendanceDates).toHaveLength(0);
    });
  });

  describe('reverse transformation functions', () => {
    describe('transformAttendanceTypeToApi', () => {
      it('should transform local to API format', () => {
        expect(transformAttendanceTypeToApi('spiritual')).toBe(AttendanceType.SPIRITUAL);
        expect(transformAttendanceTypeToApi('lightBath')).toBe(AttendanceType.LIGHT_BATH);
        expect(transformAttendanceTypeToApi('rod')).toBe(AttendanceType.ROD);
      });

      it('should default to SPIRITUAL for unknown type', () => {
        expect(transformAttendanceTypeToApi('unknown' as 'spiritual')).toBe(AttendanceType.SPIRITUAL);
      });
    });

    describe('transformAttendanceProgressionToApi', () => {
      it('should transform local to API format', () => {
        expect(transformAttendanceProgressionToApi('scheduled')).toBe(AttendanceStatus.SCHEDULED);
        expect(transformAttendanceProgressionToApi('checkedIn')).toBe(AttendanceStatus.CHECKED_IN);
        expect(transformAttendanceProgressionToApi('onGoing')).toBe(AttendanceStatus.IN_PROGRESS);
        expect(transformAttendanceProgressionToApi('completed')).toBe(AttendanceStatus.COMPLETED);
      });

      it('should default to SCHEDULED for unknown status', () => {
        expect(transformAttendanceProgressionToApi('unknown' as 'scheduled')).toBe(AttendanceStatus.SCHEDULED);
      });
    });
  });
});
