/**
 * useModalManagement Hook Tests
 * 
 * Comprehensive test suite for the        } as unknown
      });

    mockUpdatePatient.mockResolvedValue({
      success: true,
      value: { 
        id: 456, 
        name: 'Test Patient',
        priority: 'NORMAL',
        treatment_status: 'T',
        start_date: '2024-01-01',
        missing_appointments_streak: 0,
        phone: '11999999999'
      } as unknownanagement hook covering:
 * - Patient edit modal lifecycle and handlers
 * - Treatment form modal lifecycle and handlers  
 * - Treatment record creation and patient status updates
 * - Error handling and edge cases
 */

import { renderHook, act } from '@testing-library/react';
import { useModalManagement } from '../useModalManagement';
import { PatientPriority, TreatmentStatus } from '../../../../types/types';



// Mock API dependencies
jest.mock('@/api/treatment-records', () => ({
  createTreatmentRecord: jest.fn()
}));
jest.mock('@/api/patients', () => ({
  updatePatient: jest.fn()
}));

import { createTreatmentRecord } from '@/api/treatment-records';
import { updatePatient } from '@/api/patients';

const mockCreateTreatmentRecord = createTreatmentRecord as jest.MockedFunction<typeof createTreatmentRecord>;
const mockUpdatePatient = updatePatient as jest.MockedFunction<typeof updatePatient>;

describe('useModalManagement', () => {
  const mockRefreshData = jest.fn();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockTreatmentData: any = {
    mainComplaint: 'Test complaint',
    treatmentStatus: 'T' as const,
    startDate: '2024-01-15',
    food: 'Test food recommendation',
    water: 'Test water recommendation',
    ointments: 'Test ointment recommendation',
    returnWeeks: 2,
    notes: 'Test notes',
    recommendations: {
      lightBath: {
        treatments: [{ color: 'blue' }]
      },
      rod: true,
      returnWeeks: 2,
      spiritualMedicalDischarge: false
    }
  };

  const mockAttendanceDetails = {
    id: 123,
    patientId: 456,
    patientName: 'Test Patient',
    attendanceType: 'spiritual',
    currentTreatmentStatus: 'T' as const,
    currentStartDate: new Date('2024-01-01'),
    currentReturnWeeks: 1,
    isFirstAttendance: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup successful API responses by default
    mockCreateTreatmentRecord.mockResolvedValue({
      success: true,
      value: {
        record: { 
          id: 789,
          attendance_id: 123,
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        }
      }
    });

    mockUpdatePatient.mockResolvedValue({
      success: true,
      value: { 
        id: 456, 
        name: 'Test Patient',
        priority: PatientPriority.NORMAL,
        treatment_status: TreatmentStatus.IN_TREATMENT,
        start_date: '2024-01-01',
        missing_appointments_streak: 0,
        phone: '11999999999',
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      }
    });
  });

  describe('Hook Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useModalManagement());

      expect(result.current.editPatientModalOpen).toBe(false);
      expect(result.current.patientToEdit).toBe(null);
      expect(result.current.treatmentFormOpen).toBe(false);
      expect(result.current.selectedAttendanceForTreatment).toBe(null);
    });

    it('should provide all expected handlers', () => {
      const { result } = renderHook(() => useModalManagement());

      expect(typeof result.current.handleEditPatientCancel).toBe('function');
      expect(typeof result.current.handleEditPatientSuccess).toBe('function');
      expect(typeof result.current.openEditPatientModal).toBe('function');
      expect(typeof result.current.handleTreatmentFormCancel).toBe('function');
      expect(typeof result.current.handleTreatmentFormSubmit).toBe('function');
      expect(typeof result.current.openTreatmentFormModal).toBe('function');
    });

    it('should accept refreshData prop', () => {
      const { result } = renderHook(() => useModalManagement({ refreshData: mockRefreshData }));

      // Should initialize normally with refreshData prop
      expect(result.current.editPatientModalOpen).toBe(false);
      expect(typeof result.current.handleEditPatientSuccess).toBe('function');
    });
  });

  describe('Patient Edit Modal Management', () => {
    it('should open patient edit modal correctly', () => {
      const { result } = renderHook(() => useModalManagement());
      
      const patient = { id: '123', name: 'Test Patient' };

      act(() => {
        result.current.openEditPatientModal(patient);
      });

      expect(result.current.editPatientModalOpen).toBe(true);
      expect(result.current.patientToEdit).toEqual(patient);
    });

    it('should close patient edit modal on cancel', () => {
      const { result } = renderHook(() => useModalManagement());
      
      // First open the modal
      act(() => {
        result.current.openEditPatientModal({ id: '123', name: 'Test Patient' });
      });

      // Then cancel
      act(() => {
        result.current.handleEditPatientCancel();
      });

      expect(result.current.editPatientModalOpen).toBe(false);
      expect(result.current.patientToEdit).toBe(null);
    });

    it('should close patient edit modal on success and refresh data', () => {
      const { result } = renderHook(() => useModalManagement({ refreshData: mockRefreshData }));
      
      // First open the modal
      act(() => {
        result.current.openEditPatientModal({ id: '123', name: 'Test Patient' });
      });

      // Then handle success
      act(() => {
        result.current.handleEditPatientSuccess();
      });

      expect(result.current.editPatientModalOpen).toBe(false);
      expect(result.current.patientToEdit).toBe(null);
      expect(mockRefreshData).toHaveBeenCalled();
    });

    it('should handle success without refreshData prop gracefully', () => {
      const { result } = renderHook(() => useModalManagement());
      
      act(() => {
        result.current.openEditPatientModal({ id: '123', name: 'Test Patient' });
      });

      // Should not throw error even without refreshData
      act(() => {
        result.current.handleEditPatientSuccess();
      });

      expect(result.current.editPatientModalOpen).toBe(false);
      expect(result.current.patientToEdit).toBe(null);
    });
  });

  describe('Treatment Form Modal Management', () => {
    it('should open treatment form modal correctly', () => {
      const { result } = renderHook(() => useModalManagement());

      act(() => {
        result.current.openTreatmentFormModal(mockAttendanceDetails);
      });

      expect(result.current.treatmentFormOpen).toBe(true);
      expect(result.current.selectedAttendanceForTreatment).toEqual(mockAttendanceDetails);
    });

    it('should close treatment form modal on cancel', () => {
      const { result } = renderHook(() => useModalManagement());
      
      // First open the modal
      act(() => {
        result.current.openTreatmentFormModal(mockAttendanceDetails);
      });

      // Then cancel
      act(() => {
        result.current.handleTreatmentFormCancel();
      });

      expect(result.current.treatmentFormOpen).toBe(false);
      expect(result.current.selectedAttendanceForTreatment).toBe(null);
    });
  });

  describe('Treatment Form Submission', () => {
    it('should handle successful treatment form submission', async () => {
      const { result } = renderHook(() => useModalManagement({ refreshData: mockRefreshData }));
      
      // First open the modal
      act(() => {
        result.current.openTreatmentFormModal(mockAttendanceDetails);
      });

      let submitResult: { treatmentRecordId: number } | undefined;

      await act(async () => {
        submitResult = await result.current.handleTreatmentFormSubmit(mockTreatmentData);
      });

      // Check API calls
      expect(mockCreateTreatmentRecord).toHaveBeenCalledWith({
        attendance_id: 123,
        main_complaint: 'Test complaint',
        treatment_status: 'T',
        food: 'Test food recommendation',
        water: 'Test water recommendation',
        ointments: 'Test ointment recommendation',
        spiritual_treatment: true,
        return_in_weeks: 2,
        notes: 'Test notes',
        light_bath: true,
        light_bath_color: 'blue',
        rod: true
      });

      // Should not update patient status for 'T' status
      expect(mockUpdatePatient).not.toHaveBeenCalled();

      // Check return value
      expect(submitResult).toEqual({ treatmentRecordId: 789 });

      // Check modal state
      expect(result.current.treatmentFormOpen).toBe(false);
      expect(result.current.selectedAttendanceForTreatment).toBe(null);
      expect(mockRefreshData).toHaveBeenCalled();
    });

    it('should update patient status when treatment status is "A" (alta)', async () => {
      const { result } = renderHook(() => useModalManagement({ refreshData: mockRefreshData }));
      
      act(() => {
        result.current.openTreatmentFormModal(mockAttendanceDetails);
      });

      const altaData = { ...mockTreatmentData, treatmentStatus: 'A' as const };

      await act(async () => {
        await result.current.handleTreatmentFormSubmit(altaData);
      });

      expect(mockCreateTreatmentRecord).toHaveBeenCalled();
      expect(mockUpdatePatient).toHaveBeenCalledWith('456', {
        treatment_status: 'A'
      });
    });

    it('should handle lightBath recommendations correctly', async () => {
      const { result } = renderHook(() => useModalManagement());
      
      act(() => {
        result.current.openTreatmentFormModal(mockAttendanceDetails);
      });

      const dataWithoutLightBath = {
        ...mockTreatmentData,
        recommendations: { rod: false }
      };

      await act(async () => {
        await result.current.handleTreatmentFormSubmit(dataWithoutLightBath);
      });

      expect(mockCreateTreatmentRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          light_bath: false,
          light_bath_color: undefined,
          rod: false
        })
      );
    });

    it('should throw error when no attendance selected', async () => {
      const { result } = renderHook(() => useModalManagement());

      // Don't open modal, so no attendance is selected
      await expect(async () => {
        await act(async () => {
          await result.current.handleTreatmentFormSubmit(mockTreatmentData);
        });
      }).rejects.toThrow('No attendance selected for treatment');
    });

    it('should handle treatment record creation failure', async () => {
      mockCreateTreatmentRecord.mockResolvedValue({
        success: false,
        error: 'Database error'
      });

      const { result } = renderHook(() => useModalManagement());
      
      act(() => {
        result.current.openTreatmentFormModal(mockAttendanceDetails);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.handleTreatmentFormSubmit(mockTreatmentData);
        });
      }).rejects.toThrow('Database error');
    });

    it('should handle treatment record creation with no value', async () => {
      mockCreateTreatmentRecord.mockResolvedValue({
        success: true,
        value: undefined
      });

      const { result } = renderHook(() => useModalManagement());
      
      act(() => {
        result.current.openTreatmentFormModal(mockAttendanceDetails);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.handleTreatmentFormSubmit(mockTreatmentData);
        });
      }).rejects.toThrow('Failed to create treatment record');
    });

    it('should handle API network error during treatment record creation', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockCreateTreatmentRecord.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useModalManagement());
      
      act(() => {
        result.current.openTreatmentFormModal(mockAttendanceDetails);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.handleTreatmentFormSubmit(mockTreatmentData);
        });
      }).rejects.toThrow('Network error');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error creating treatment record:', 
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle patient update failure gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      mockUpdatePatient.mockResolvedValue({
        success: false,
        error: 'Patient update failed'
      });

      const { result } = renderHook(() => useModalManagement({ refreshData: mockRefreshData }));
      
      act(() => {
        result.current.openTreatmentFormModal(mockAttendanceDetails);
      });

      const altaData = { ...mockTreatmentData, treatmentStatus: 'A' as const };

      // Should not throw error even if patient update fails
      let submitResult: { treatmentRecordId: number } | undefined;
      await act(async () => {
        submitResult = await result.current.handleTreatmentFormSubmit(altaData);
      });

      expect(submitResult).toEqual({ treatmentRecordId: 789 });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to update patient treatment status:', 
        'Patient update failed'
      );

      // Modal should still be closed and data refreshed
      expect(result.current.treatmentFormOpen).toBe(false);
      expect(mockRefreshData).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Edge Cases and Complex Scenarios', () => {
    it('should handle multiple modal operations in sequence', async () => {
      const { result } = renderHook(() => useModalManagement({ refreshData: mockRefreshData }));

      // Open patient edit modal
      act(() => {
        result.current.openEditPatientModal({ id: '123', name: 'Patient 1' });
      });
      expect(result.current.editPatientModalOpen).toBe(true);

      // Close and open treatment modal
      act(() => {
        result.current.handleEditPatientCancel();
        result.current.openTreatmentFormModal(mockAttendanceDetails);
      });

      expect(result.current.editPatientModalOpen).toBe(false);
      expect(result.current.treatmentFormOpen).toBe(true);

      // Complete treatment form
      await act(async () => {
        await result.current.handleTreatmentFormSubmit(mockTreatmentData);
      });

      expect(result.current.treatmentFormOpen).toBe(false);
    });

    it('should handle different treatment status values correctly', async () => {
      const { result } = renderHook(() => useModalManagement());
      
      const testCases = [
        { status: 'N' as const, shouldUpdatePatient: false },
        { status: 'T' as const, shouldUpdatePatient: false },
        { status: 'A' as const, shouldUpdatePatient: true },
        { status: 'F' as const, shouldUpdatePatient: false }
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();
        
        act(() => {
          result.current.openTreatmentFormModal(mockAttendanceDetails);
        });

        const data = { ...mockTreatmentData, treatmentStatus: testCase.status };

        await act(async () => {
          await result.current.handleTreatmentFormSubmit(data);
        });

        if (testCase.shouldUpdatePatient) {
          expect(mockUpdatePatient).toHaveBeenCalledWith('456', {
            treatment_status: testCase.status
          });
        } else {
          expect(mockUpdatePatient).not.toHaveBeenCalled();
        }
      }
    });

    it('should handle treatment data with complex recommendations', async () => {
      const { result } = renderHook(() => useModalManagement());
      
      act(() => {
        result.current.openTreatmentFormModal(mockAttendanceDetails);
      });

      const complexData = {
        ...mockTreatmentData,
        recommendations: {
          lightBath: {
            treatments: [
              { color: 'red' },
              { color: 'blue' }
            ]
          },
          rod: true
        }
      };

      await act(async () => {
        await result.current.handleTreatmentFormSubmit(complexData);
      });

      expect(mockCreateTreatmentRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          light_bath: true,
          light_bath_color: 'red', // Should use first color
          rod: true
        })
      );
    });
  });
});