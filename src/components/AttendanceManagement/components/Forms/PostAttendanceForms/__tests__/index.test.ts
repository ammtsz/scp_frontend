/**
 * @jest-environment jsdom
 */

import * as PostAttendanceFormsExports from '../index';

describe('PostAttendanceForms Index Exports', () => {
  it('should export PostAttendanceModal component', () => {
    expect(PostAttendanceFormsExports.PostAttendanceModal).toBeDefined();
    expect(typeof PostAttendanceFormsExports.PostAttendanceModal).toBe('function'); // React component
  });

  it('should export TreatmentRecommendationsSection component', () => {
    expect(PostAttendanceFormsExports.TreatmentRecommendationsSection).toBeDefined();
    expect(typeof PostAttendanceFormsExports.TreatmentRecommendationsSection).toBe('function');
  });

  it('should export usePostAttendanceForm hook', () => {
    expect(PostAttendanceFormsExports.usePostAttendanceForm).toBeDefined();
    expect(typeof PostAttendanceFormsExports.usePostAttendanceForm).toBe('function');
  });

  it('should have correct export structure', () => {
    const exports = Object.keys(PostAttendanceFormsExports);
    const expectedExports = [
      'PostAttendanceModal',
      'TreatmentRecommendationsSection', 
      'usePostAttendanceForm'
    ];
    
    expectedExports.forEach(exportName => {
      expect(exports).toContain(exportName);
    });
  });

  it('should not export undefined values', () => {
    const exports = Object.values(PostAttendanceFormsExports);
    exports.forEach(exportedValue => {
      expect(exportedValue).toBeDefined();
      expect(exportedValue).not.toBeNull();
    });
  });
});