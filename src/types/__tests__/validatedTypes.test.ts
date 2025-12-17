import {
  // Enum Schemas
  PatientPrioritySchema,
  TreatmentStatusSchema,
  AttendanceTypeSchema,
  AttendanceStatusSchema,
  
  // Base Schemas
  PatientBaseSchema,
  PatientResponseSchema,
  AttendanceResponseSchema,
  TreatmentRecordSchema,
  PatientNoteSchema,
  CreatePatientRequestSchema,
  UpdatePatientRequestSchema,
  CreateAttendanceRequestSchema,
  
  // Validation Functions
  validatePatientResponse,
  validateAttendanceResponse,
  validatePatientNote,
  safeValidatePatientResponse,
  safeValidateAttendanceResponse,
  
  // Type Guards
  isValidPatientPriority,
  isValidAttendanceType,
  isValidAttendanceStatus,
  
  // Business Rules
  validateBusinessRules,
  
  // Types
  type PatientPriority,
  type TreatmentStatus,
  type AttendanceType,
  type AttendanceStatus,
} from '../validatedTypes';

describe('validatedTypes', () => {
  describe('Enum Schemas', () => {
    describe('PatientPrioritySchema', () => {
      it('should validate valid priority values', () => {
        expect(PatientPrioritySchema.parse('1')).toBe('1');
        expect(PatientPrioritySchema.parse('2')).toBe('2');
        expect(PatientPrioritySchema.parse('3')).toBe('3');
      });

      it('should reject invalid priority values', () => {
        expect(() => PatientPrioritySchema.parse('0')).toThrow();
        expect(() => PatientPrioritySchema.parse('4')).toThrow();
        expect(() => PatientPrioritySchema.parse(1)).toThrow();
        expect(() => PatientPrioritySchema.parse('')).toThrow();
        expect(() => PatientPrioritySchema.parse(null)).toThrow();
      });
    });

    describe('TreatmentStatusSchema', () => {
      it('should validate valid treatment status values', () => {
        expect(TreatmentStatusSchema.parse('N')).toBe('N');
        expect(TreatmentStatusSchema.parse('T')).toBe('T');
        expect(TreatmentStatusSchema.parse('A')).toBe('A');
        expect(TreatmentStatusSchema.parse('F')).toBe('F');
      });

      it('should reject invalid treatment status values', () => {
        expect(() => TreatmentStatusSchema.parse('X')).toThrow();
        expect(() => TreatmentStatusSchema.parse('n')).toThrow();
        expect(() => TreatmentStatusSchema.parse('')).toThrow();
        expect(() => TreatmentStatusSchema.parse(null)).toThrow();
      });
    });

    describe('AttendanceTypeSchema', () => {
      it('should validate valid attendance type values', () => {
        expect(AttendanceTypeSchema.parse('spiritual')).toBe('spiritual');
        expect(AttendanceTypeSchema.parse('light_bath')).toBe('light_bath');
      });

      it('should reject invalid attendance type values', () => {
        expect(() => AttendanceTypeSchema.parse('medical')).toThrow();
        expect(() => AttendanceTypeSchema.parse('Spiritual')).toThrow();
        expect(() => AttendanceTypeSchema.parse('')).toThrow();
        expect(() => AttendanceTypeSchema.parse(null)).toThrow();
      });
    });

    describe('AttendanceStatusSchema', () => {
      it('should validate valid attendance status values', () => {
        const validStatuses = ['scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'missed'];
        validStatuses.forEach(status => {
          expect(AttendanceStatusSchema.parse(status)).toBe(status);
        });
      });

      it('should reject invalid attendance status values', () => {
        expect(() => AttendanceStatusSchema.parse('pending')).toThrow();
        expect(() => AttendanceStatusSchema.parse('Scheduled')).toThrow();
        expect(() => AttendanceStatusSchema.parse('')).toThrow();
        expect(() => AttendanceStatusSchema.parse(null)).toThrow();
      });
    });
  });

  describe('PatientBaseSchema', () => {
    const validPatientBase = {
      id: 1,
      name: 'John Doe',
      phone: '(11) 99999-9999',
      priority: '1' as PatientPriority,
      treatment_status: 'N' as TreatmentStatus,
      birth_date: '2024-01-01T00:00:00Z',
      main_complaint: 'Headache',
      discharge_date: null,
      start_date: '2024-01-01T00:00:00Z',
      missing_appointments_streak: 0,
      timezone: 'America/Sao_Paulo',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    it('should validate a valid patient base', () => {
      expect(() => PatientBaseSchema.parse(validPatientBase)).not.toThrow();
    });

    it('should require positive ID', () => {
      expect(() => PatientBaseSchema.parse({ ...validPatientBase, id: 0 })).toThrow();
      expect(() => PatientBaseSchema.parse({ ...validPatientBase, id: -1 })).toThrow();
    });

    it('should require non-empty name', () => {
      expect(() => PatientBaseSchema.parse({ ...validPatientBase, name: '' })).toThrow();
    });

    it('should validate name length constraints', () => {
      expect(() => PatientBaseSchema.parse({ 
        ...validPatientBase, 
        name: 'a'.repeat(256) 
      })).toThrow();
    });

    it('should handle optional fields', () => {
      const minimalPatient = {
        id: 1,
        name: 'John Doe',
        priority: '1' as PatientPriority,
        treatment_status: 'N' as TreatmentStatus,
        start_date: '2024-01-01T00:00:00Z',
        missing_appointments_streak: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      expect(() => PatientBaseSchema.parse(minimalPatient)).not.toThrow();
    });

    it('should validate datetime format for birth_date', () => {
      expect(() => PatientBaseSchema.parse({ 
        ...validPatientBase, 
        birth_date: '2024-01-01' 
      })).toThrow();
      expect(() => PatientBaseSchema.parse({ 
        ...validPatientBase, 
        birth_date: 'invalid-date' 
      })).toThrow();
    });

    it('should use default timezone', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { timezone: _, ...patientWithoutTimezone } = validPatientBase;
      const parsed = PatientBaseSchema.parse(patientWithoutTimezone);
      expect(parsed.timezone).toBe('America/Sao_Paulo');
    });

    it('should require treatment_status field', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { treatment_status: _status, ...patientWithoutStatus } = validPatientBase;
      expect(() => PatientBaseSchema.parse(patientWithoutStatus)).toThrow();
    });
  });

  describe('PatientResponseSchema', () => {
    const validPatientResponse = {
      id: 1,
      name: 'John Doe',
      phone: '(11) 99999-9999',
      priority: '1' as PatientPriority,
      treatment_status: 'N' as TreatmentStatus,
      birth_date: '2024-01-01T00:00:00Z',
      main_complaint: 'Headache',
      discharge_date: null,
      start_date: '2024-01-01T00:00:00Z',
      missing_appointments_streak: 0,
      timezone: 'America/Sao_Paulo',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    it('should validate a valid patient response', () => {
      expect(() => PatientResponseSchema.parse(validPatientResponse)).not.toThrow();
    });

    it('should compute isEmergency correctly', () => {
      const emergencyPatient = PatientResponseSchema.parse({ 
        ...validPatientResponse, 
        priority: '1' 
      });
      expect(emergencyPatient.isEmergency).toBe(true);

      const normalPatient = PatientResponseSchema.parse({ 
        ...validPatientResponse, 
        priority: '3' 
      });
      expect(normalPatient.isEmergency).toBe(false);
    });

    it('should compute isActive correctly', () => {
      const activePatient = PatientResponseSchema.parse({ 
        ...validPatientResponse, 
        treatment_status: 'T' 
      });
      expect(activePatient.isActive).toBe(true);

      const newPatient = PatientResponseSchema.parse({ 
        ...validPatientResponse, 
        treatment_status: 'N' 
      });
      expect(newPatient.isActive).toBe(true); // N and T are both active in the schema

      const dischargedPatient = PatientResponseSchema.parse({ 
        ...validPatientResponse, 
        treatment_status: 'A' 
      });
      expect(dischargedPatient.isActive).toBe(false);

      const finishedPatient = PatientResponseSchema.parse({ 
        ...validPatientResponse, 
        treatment_status: 'F' 
      });
      expect(finishedPatient.isActive).toBe(false);
    });

    it('should compute daysSinceTreatmentStart correctly', () => {
      // Set a specific treatment start date and mock Date.now
      const treatmentStartDate = '2024-01-01T00:00:00Z';
      const mockNow = new Date('2024-01-05T00:00:00Z').getTime();
      
      // Mock Date.now
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => mockNow);

      const patient = PatientResponseSchema.parse({ 
        ...validPatientResponse, 
        start_date: treatmentStartDate 
      });
      
      expect(patient.daysSinceTreatmentStart).toBe(4);

      // Restore original Date.now
      Date.now = originalDateNow;
    });

    it('should validate start_date format', () => {
      expect(() => PatientResponseSchema.parse({ 
        ...validPatientResponse, 
        start_date: '2024-01-01' 
      })).toThrow();
      expect(() => PatientResponseSchema.parse({ 
        ...validPatientResponse, 
        start_date: 'invalid-date' 
      })).toThrow();
    });
  });

  describe('AttendanceResponseSchema', () => {
    const validAttendanceResponse = {
      id: 1,
      patient_id: 1,
      type: 'spiritual' as AttendanceType,
      status: 'scheduled' as AttendanceStatus,
      scheduled_date: '2024-01-01',
      scheduled_time: '09:00',
      notes: 'Test notes',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      checked_in_at: null,
      completed_at: null,
    };

    it('should validate a valid attendance response', () => {
      expect(() => AttendanceResponseSchema.parse(validAttendanceResponse)).not.toThrow();
    });

    it('should validate scheduled_date regex pattern', () => {
      expect(() => AttendanceResponseSchema.parse({ 
        ...validAttendanceResponse, 
        scheduled_date: '2024-1-1' 
      })).toThrow();
      expect(() => AttendanceResponseSchema.parse({ 
        ...validAttendanceResponse, 
        scheduled_date: '01-01-2024' 
      })).toThrow();
      expect(() => AttendanceResponseSchema.parse({ 
        ...validAttendanceResponse, 
        scheduled_date: '2024/01/01' 
      })).toThrow();
    });

    it('should validate scheduled_time regex pattern', () => {
      expect(() => AttendanceResponseSchema.parse({ 
        ...validAttendanceResponse, 
        scheduled_time: '9:00' 
      })).toThrow();
      expect(() => AttendanceResponseSchema.parse({ 
        ...validAttendanceResponse, 
        scheduled_time: '09:0' 
      })).toThrow();
      expect(() => AttendanceResponseSchema.parse({ 
        ...validAttendanceResponse, 
        scheduled_time: '9:30 AM' 
      })).toThrow();
    });

    it('should require positive patient_id', () => {
      expect(() => AttendanceResponseSchema.parse({ 
        ...validAttendanceResponse, 
        patient_id: 0 
      })).toThrow();
      expect(() => AttendanceResponseSchema.parse({ 
        ...validAttendanceResponse, 
        patient_id: -1 
      })).toThrow();
    });

    it('should handle optional time fields', () => {
      const attendanceWithTimestamps = AttendanceResponseSchema.parse({
        ...validAttendanceResponse,
        checked_in_time: '09:00:00',
        completed_time: '10:00:00',
      });
      expect(attendanceWithTimestamps.checked_in_time).toBe('09:00:00');
      expect(attendanceWithTimestamps.completed_time).toBe('10:00:00');
    });
  });

  describe('TreatmentRecordSchema', () => {
    const validTreatmentRecord = {
      id: 1,
      attendance_id: 1,
      food: 'Light meals',
      water: 'Increased intake',
      ointments: 'Apply twice daily',
      light_bath: true,
      light_bath_color: 'blue',
      rod: false,
      spiritual_treatment: true,
      return_in_weeks: 4,
      notes: 'Patient responded well',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    it('should validate a valid treatment record', () => {
      expect(() => TreatmentRecordSchema.parse(validTreatmentRecord)).not.toThrow();
    });

    it('should require positive IDs', () => {
      expect(() => TreatmentRecordSchema.parse({ 
        ...validTreatmentRecord, 
        id: 0 
      })).toThrow();
      expect(() => TreatmentRecordSchema.parse({ 
        ...validTreatmentRecord, 
        attendance_id: -1 
      })).toThrow();
    });

    it('should handle optional fields', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { food: _food, water: _water, ...recordWithoutOptionals } = validTreatmentRecord;
      expect(() => TreatmentRecordSchema.parse(recordWithoutOptionals)).not.toThrow();
    });

    it('should validate return_in_weeks range', () => {
      expect(() => TreatmentRecordSchema.parse({ 
        ...validTreatmentRecord, 
        return_in_weeks: 0 
      })).toThrow();
      expect(() => TreatmentRecordSchema.parse({ 
        ...validTreatmentRecord, 
        return_in_weeks: 53 
      })).toThrow();
    });

    it('should validate datetime formats', () => {
      expect(() => TreatmentRecordSchema.parse({ 
        ...validTreatmentRecord, 
        created_at: '2024-01-01' 
      })).toThrow();
      expect(() => TreatmentRecordSchema.parse({ 
        ...validTreatmentRecord, 
        updated_at: 'invalid-date' 
      })).toThrow();
    });
  });

  describe('PatientNoteSchema', () => {
    const validPatientNote = {
      id: 1,
      patient_id: 1,
      category: 'general',
      content: 'Patient is responding well to treatment',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    it('should validate a valid patient note', () => {
      expect(() => PatientNoteSchema.parse(validPatientNote)).not.toThrow();
    });

    it('should validate category enum values', () => {
      const validCategories = ['general', 'treatment', 'observation', 'behavior', 'medication', 'progress', 'family', 'emergency'];
      validCategories.forEach(category => {
        expect(() => PatientNoteSchema.parse({ 
          ...validPatientNote, 
          category 
        })).not.toThrow();
      });

      expect(() => PatientNoteSchema.parse({ 
        ...validPatientNote, 
        category: 'invalid' 
      })).toThrow();
    });

    it('should validate content length constraints', () => {
      expect(() => PatientNoteSchema.parse({ 
        ...validPatientNote, 
        content: '' 
      })).toThrow();
      
      expect(() => PatientNoteSchema.parse({ 
        ...validPatientNote, 
        content: 'a'.repeat(2001) 
      })).toThrow();
      
      // Valid content within limits
      expect(() => PatientNoteSchema.parse({ 
        ...validPatientNote, 
        content: 'a'.repeat(2000) 
      })).not.toThrow();
    });

    it('should require positive IDs', () => {
      expect(() => PatientNoteSchema.parse({ 
        ...validPatientNote, 
        id: 0 
      })).toThrow();
      expect(() => PatientNoteSchema.parse({ 
        ...validPatientNote, 
        patient_id: -1 
      })).toThrow();
    });

    it('should require positive patient_id and id', () => {
      expect(() => PatientNoteSchema.parse({ 
        ...validPatientNote, 
        patient_id: -1 
      })).toThrow();
      expect(() => PatientNoteSchema.parse({ 
        ...validPatientNote, 
        id: 0 
      })).toThrow();
    });
  });

  describe('Request Schemas', () => {
    describe('CreatePatientRequestSchema', () => {
      const validCreateRequest = {
        name: 'John Doe',
        phone: '(11) 99999-9999',
        priority: '1' as PatientPriority,
        birth_date: '2024-01-01T00:00:00Z',
        main_complaint: 'Headache',
        timezone: 'America/Sao_Paulo',
      };

      it('should validate a valid create patient request', () => {
        expect(() => CreatePatientRequestSchema.parse(validCreateRequest)).not.toThrow();
      });

      it('should use default values', () => {
        const minimalRequest = {
          name: 'John Doe',
          priority: '1' as PatientPriority,
        };
        const parsed = CreatePatientRequestSchema.parse(minimalRequest);
        expect(parsed.treatment_status).toBe('N');
        expect(parsed.timezone).toBe('America/Sao_Paulo');
      });

      it('should validate name constraints', () => {
        expect(() => CreatePatientRequestSchema.parse({ 
          ...validCreateRequest, 
          name: '' 
        })).toThrow();
        expect(() => CreatePatientRequestSchema.parse({ 
          ...validCreateRequest, 
          name: 'a'.repeat(256) 
        })).toThrow();
      });

      it('should handle optional fields', () => {
        const requestWithOptionals = CreatePatientRequestSchema.parse({
          name: 'Jane Doe',
          priority: '2' as PatientPriority,
        });
        expect(requestWithOptionals.phone).toBeUndefined();
        expect(requestWithOptionals.birth_date).toBeUndefined();
        expect(requestWithOptionals.main_complaint).toBeUndefined();
      });
    });

    describe('UpdatePatientRequestSchema', () => {
      it('should allow partial updates', () => {
        const partialUpdate = {
          name: 'Updated Name',
          discharge_date: '2024-01-01T00:00:00Z',
        };
        expect(() => UpdatePatientRequestSchema.parse(partialUpdate)).not.toThrow();
      });

      it('should validate discharge_date format', () => {
        expect(() => UpdatePatientRequestSchema.parse({ 
          discharge_date: '2024-01-01' 
        })).toThrow();
      });

      it('should allow empty update', () => {
        expect(() => UpdatePatientRequestSchema.parse({})).not.toThrow();
      });
    });

    describe('CreateAttendanceRequestSchema', () => {
      const validCreateAttendance = {
        patient_id: 1,
        type: 'spiritual' as AttendanceType,
        scheduled_date: '2024-01-01',
        scheduled_time: '09:00',
        notes: 'Test notes',
      };

      it('should validate a valid create attendance request', () => {
        expect(() => CreateAttendanceRequestSchema.parse(validCreateAttendance)).not.toThrow();
      });

      it('should validate regex patterns', () => {
        expect(() => CreateAttendanceRequestSchema.parse({ 
          ...validCreateAttendance, 
          scheduled_date: '2024-1-1' 
        })).toThrow();
        expect(() => CreateAttendanceRequestSchema.parse({ 
          ...validCreateAttendance, 
          scheduled_time: '9:00' 
        })).toThrow();
      });

      it('should require positive patient_id', () => {
        expect(() => CreateAttendanceRequestSchema.parse({ 
          ...validCreateAttendance, 
          patient_id: 0 
        })).toThrow();
      });

      it('should handle optional notes', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { notes: _notes, ...requestWithoutNotes } = validCreateAttendance;
        expect(() => CreateAttendanceRequestSchema.parse(requestWithoutNotes)).not.toThrow();
      });
    });
  });

  describe('Validation Functions', () => {
    const validPatientData = {
      id: 1,
      name: 'John Doe',
      phone: '(11) 99999-9999',
      priority: '1',
      treatment_status: 'N',
      birth_date: '2024-01-01T00:00:00Z',
      main_complaint: 'Headache',
      discharge_date: null,
      start_date: '2024-01-01T00:00:00Z',
      missing_appointments_streak: 0,
      timezone: 'America/Sao_Paulo',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    const validAttendanceData = {
      id: 1,
      patient_id: 1,
      type: 'spiritual',
      status: 'scheduled',
      scheduled_date: '2024-01-01',
      scheduled_time: '09:00',
      checked_in_time: null,
      started_time: null,
      completed_time: null,
      cancelled_date: null,
      absence_justified: null,
      absence_notes: null,
      notes: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      patient: {
        id: 1,
        name: 'John Doe',
        phone: '(11) 99999-9999',
        priority: '1',
        treatment_status: 'N',
        birth_date: '2024-01-01T00:00:00Z',
        main_complaint: 'Headache',
        discharge_date: null,
        start_date: '2024-01-01T00:00:00Z',
        missing_appointments_streak: 0,
        timezone: 'America/Sao_Paulo',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    };

    describe('validatePatientResponse', () => {
      it('should successfully validate valid patient data', () => {
        expect(() => validatePatientResponse(validPatientData)).not.toThrow();
      });

      it('should throw on invalid patient data', () => {
        expect(() => validatePatientResponse({ ...validPatientData, id: -1 })).toThrow();
        expect(() => validatePatientResponse({ ...validPatientData, name: '' })).toThrow();
      });
    });

    describe('validateAttendanceResponse', () => {
      it('should successfully validate valid attendance data', () => {
        expect(() => validateAttendanceResponse(validAttendanceData)).not.toThrow();
      });

      it('should throw on invalid attendance data', () => {
        expect(() => validateAttendanceResponse({ ...validAttendanceData, patient_id: 0 })).toThrow();
        expect(() => validateAttendanceResponse({ ...validAttendanceData, scheduled_date: '2024-1-1' })).toThrow();
      });
    });

    describe('validatePatientNote', () => {
      const validNoteData = {
        id: 1,
        patient_id: 1,
        category: 'general',
        content: 'Test note content',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      it('should successfully validate valid note data', () => {
        expect(() => validatePatientNote(validNoteData)).not.toThrow();
      });

      it('should throw on invalid note data', () => {
        expect(() => validatePatientNote({ ...validNoteData, content: '' })).toThrow();
        expect(() => validatePatientNote({ ...validNoteData, category: 'invalid' })).toThrow();
      });
    });

    describe('safeValidatePatientResponse', () => {
      it('should return success for valid data', () => {
        const result = safeValidatePatientResponse(validPatientData);
        expect(result.success).toBe(true);
      });

      it('should return error for invalid data', () => {
        const result = safeValidatePatientResponse({ ...validPatientData, id: -1 });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(0);
        }
      });
    });

    describe('safeValidateAttendanceResponse', () => {
      it('should return success for valid data', () => {
        const result = safeValidateAttendanceResponse(validAttendanceData);
        expect(result.success).toBe(true);
      });

      it('should return error for invalid data', () => {
        const result = safeValidateAttendanceResponse({ ...validAttendanceData, patient_id: 0 });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Type Guards', () => {
    describe('isValidPatientPriority', () => {
      it('should return true for valid priorities', () => {
        expect(isValidPatientPriority('1')).toBe(true);
        expect(isValidPatientPriority('2')).toBe(true);
        expect(isValidPatientPriority('3')).toBe(true);
      });

      it('should return false for invalid priorities', () => {
        expect(isValidPatientPriority('0')).toBe(false);
        expect(isValidPatientPriority('4')).toBe(false);
        expect(isValidPatientPriority(1)).toBe(false);
        expect(isValidPatientPriority(null)).toBe(false);
      });
    });

    describe('isValidAttendanceType', () => {
      it('should return true for valid types', () => {
        expect(isValidAttendanceType('spiritual')).toBe(true);
        expect(isValidAttendanceType('light_bath')).toBe(true);
      });

      it('should return false for invalid types', () => {
        expect(isValidAttendanceType('medical')).toBe(false);
        expect(isValidAttendanceType('Spiritual')).toBe(false);
        expect(isValidAttendanceType(null)).toBe(false);
      });
    });

    describe('isValidAttendanceStatus', () => {
      it('should return true for valid statuses', () => {
        const validStatuses = ['scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'missed'];
        validStatuses.forEach(status => {
          expect(isValidAttendanceStatus(status)).toBe(true);
        });
      });

      it('should return false for invalid statuses', () => {
        expect(isValidAttendanceStatus('pending')).toBe(false);
        expect(isValidAttendanceStatus('Scheduled')).toBe(false);
        expect(isValidAttendanceStatus(null)).toBe(false);
      });
    });
  });

  describe('Business Rules', () => {
    const mockPatient = {
      id: 1,
      name: 'John Doe',
      priority: '2' as PatientPriority,
      treatment_status: 'T' as TreatmentStatus,
      isEmergency: false,
      isActive: true,
      daysSinceTreatmentStart: 5,
    };

    describe('canScheduleAttendance', () => {
      it('should allow scheduling for active patients on future dates', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);
        const dateString = futureDate.toISOString().split('T')[0];
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(validateBusinessRules.canScheduleAttendance(mockPatient as any, dateString)).toBe(true);
      });

      it('should prevent scheduling for discharged patients', () => {
        const dischargedPatient = { ...mockPatient, treatment_status: 'A' };
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);
        const dateString = futureDate.toISOString().split('T')[0];
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(validateBusinessRules.canScheduleAttendance(dischargedPatient as any, dateString)).toBe(false);
      });

      it('should prevent scheduling in the past', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);
        const dateString = pastDate.toISOString().split('T')[0];
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(validateBusinessRules.canScheduleAttendance(mockPatient as any, dateString)).toBe(false);
      });
    });

    describe('isValidTreatmentProgression', () => {
      it('should allow valid status transitions', () => {
        // Valid transitions
        expect(validateBusinessRules.isValidTreatmentProgression('scheduled', 'checked_in')).toBe(true);
        expect(validateBusinessRules.isValidTreatmentProgression('checked_in', 'in_progress')).toBe(true);
        expect(validateBusinessRules.isValidTreatmentProgression('in_progress', 'completed')).toBe(true);
        expect(validateBusinessRules.isValidTreatmentProgression('completed', 'scheduled')).toBe(true);
        expect(validateBusinessRules.isValidTreatmentProgression('cancelled', 'scheduled')).toBe(true);
      });

      it('should prevent invalid status transitions', () => {
        // Invalid transitions
        expect(validateBusinessRules.isValidTreatmentProgression('scheduled', 'completed')).toBe(false);
        expect(validateBusinessRules.isValidTreatmentProgression('completed', 'in_progress')).toBe(false);
        expect(validateBusinessRules.isValidTreatmentProgression('missed', 'completed')).toBe(false);
      });
    });

    describe('validateAppointmentTime', () => {
      it('should allow valid business hours', () => {
        expect(validateBusinessRules.validateAppointmentTime('08:00')).toBe(true);
        expect(validateBusinessRules.validateAppointmentTime('12:00')).toBe(true);
        expect(validateBusinessRules.validateAppointmentTime('18:00')).toBe(true);
      });

      it('should reject times outside business hours', () => {
        expect(validateBusinessRules.validateAppointmentTime('07:59')).toBe(false);
        expect(validateBusinessRules.validateAppointmentTime('18:01')).toBe(false);
        expect(validateBusinessRules.validateAppointmentTime('22:00')).toBe(false);
        expect(validateBusinessRules.validateAppointmentTime('06:00')).toBe(false);
      });
    });
  });
});