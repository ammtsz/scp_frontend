/**
 * Forms index.ts Test
 * 
 * Test for the Forms index.ts export file to ensure 100% coverage
 */

import { NewPatientCheckInForm } from '../index';

describe('Forms index exports', () => {
  it('should export NewPatientCheckInForm', () => {
    expect(NewPatientCheckInForm).toBeDefined();
    expect(typeof NewPatientCheckInForm).toBe('function');
  });
});