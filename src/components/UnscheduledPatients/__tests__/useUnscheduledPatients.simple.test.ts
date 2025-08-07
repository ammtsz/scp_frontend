/**
 * Simple compilation test for useUnscheduledPatients
 */
import { useUnscheduledPatients } from '../useUnscheduledPatients';

describe('useUnscheduledPatients - Compilation Test', () => {
  it('should import and define the hook correctly', () => {
    expect(useUnscheduledPatients).toBeDefined();
    expect(typeof useUnscheduledPatients).toBe('function');
  });
});
