import { 
  transformPriority, 
  transformStatus, 
  transformAttendanceType, 
  transformAttendanceProgression,
  transformStatusToApi,
  transformPriorityToApi
} from '../apiTransformers';
import { PatientPriority, TreatmentStatus, AttendanceType, AttendanceStatus } from '@/api/types';

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
  });

  describe('transformAttendanceType', () => {
    it('should transform SPIRITUAL to "spiritual"', () => {
      expect(transformAttendanceType(AttendanceType.SPIRITUAL)).toBe('spiritual');
    });

    it('should transform LIGHT_BATH to "lightBath"', () => {
      expect(transformAttendanceType(AttendanceType.LIGHT_BATH)).toBe('lightBath');
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
});
