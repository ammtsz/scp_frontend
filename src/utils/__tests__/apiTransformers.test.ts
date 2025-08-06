import { transformPriority, transformStatus, transformAttendanceType, transformAttendanceProgression } from '../apiTransformers';
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
});
