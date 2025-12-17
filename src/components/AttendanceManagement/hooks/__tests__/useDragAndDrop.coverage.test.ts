import { renderHook, act } from '@testing-library/react';
import { useDragAndDrop } from '../useDragAndDrop';
import { useAttendanceManagement } from '@/hooks/useAttendanceManagement';
import { usePatients } from '@/hooks/usePatientQueries';
import { updateAttendanceStatus } from '@/api/attendanceSync';
import * as modalStore from '@/stores/modalStore';
import { AttendanceByDate, AttendanceStatusDetail } from '@/types/types';

jest.mock('@/hooks/useAttendanceManagement');
jest.mock('@/hooks/usePatientQueries');
jest.mock('@/api/attendanceSync');
jest.mock('@/stores/modalStore');

const mockUseAttendanceManagement = useAttendanceManagement as jest.MockedFunction<typeof useAttendanceManagement>;
const mockUsePatients = usePatients as jest.MockedFunction<typeof usePatients>;
const mockUpdateAttendanceStatus = updateAttendanceStatus as jest.MockedFunction<typeof updateAttendanceStatus>;

const mockOpenPostAttendance = jest.fn();
const mockOpenPostTreatment = jest.fn();
const mockOpenNewPatientCheckIn = jest.fn();
const mockOpenMultiSection = jest.fn();

(modalStore.useOpenPostAttendance as jest.Mock).mockReturnValue(mockOpenPostAttendance);
(modalStore.useOpenPostTreatment as jest.Mock).mockReturnValue(mockOpenPostTreatment);
(modalStore.useOpenNewPatientCheckIn as jest.Mock).mockReturnValue(mockOpenNewPatientCheckIn);
(modalStore.useOpenMultiSection as jest.Mock).mockReturnValue(mockOpenMultiSection);

describe('useDragAndDrop - Coverage Enhancement', () => {
  const mockSetAttendancesByDate = jest.fn();
  const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

  const createMockPatient = (overrides: Partial<AttendanceStatusDetail> = {}): AttendanceStatusDetail => ({
    name: 'Test Patient',
    priority: '3',
    patientId: 1,
    attendanceId: 100,
    treatmentAttendanceIds: [100],
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockClear();
    
    mockUsePatients.mockReturnValue({
      data: [{ id: 1, name: 'Test Patient', status: 'A' }],
      isLoading: false,
      error: null,
    } as never);

    mockUpdateAttendanceStatus.mockResolvedValue({ success: true });
  });

  describe('Combined Treatment Logic', () => {
    it('should handle combined lightBath+rod treatment moves within lightBath/rod sections', async () => {
      const mockAttendancesByDate: AttendanceByDate = {
        date: new Date('2024-01-15'),
        spiritual: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
        lightBath: { 
          scheduled: [createMockPatient({ patientId: 1, name: 'Combined Patient' })], 
          checkedIn: [], 
          onGoing: [], 
          completed: [] 
        },
        rod: { 
          scheduled: [createMockPatient({ patientId: 1, name: 'Combined Patient' })], 
          checkedIn: [], 
          onGoing: [], 
          completed: [] 
        },
        combined: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
      };

      mockUseAttendanceManagement.mockReturnValue({
        attendancesByDate: mockAttendancesByDate,
        setAttendancesByDate: mockSetAttendancesByDate,
      } as never);

      const { result } = renderHook(() => useDragAndDrop());

      // Start drag with combined treatment
      act(() => {
        result.current.handleDragStart('lightBath', 0, 'scheduled', 1);
      });

      // Drop to rod section (should move both parts together)
      await act(async () => {
        await result.current.handleDropWithConfirm('rod', 'checkedIn');
      });

      expect(mockSetAttendancesByDate).toHaveBeenCalled();
      expect(result.current.dragged).toBeNull();
    });

    it('should handle combined treatment moves from spiritual section (move only spiritual)', async () => {
      const mockAttendancesByDate: AttendanceByDate = {
        date: new Date('2024-01-15'),
        spiritual: { 
          scheduled: [createMockPatient({ patientId: 1, name: 'Spiritual Patient' })], 
          checkedIn: [], 
          onGoing: [], 
          completed: [] 
        },
        lightBath: { 
          scheduled: [], 
          checkedIn: [], 
          onGoing: [], 
          completed: [] 
        },
        rod: { 
          scheduled: [], 
          checkedIn: [], 
          onGoing: [], 
          completed: [] 
        },
        combined: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
      };

      mockUseAttendanceManagement.mockReturnValue({
        attendancesByDate: mockAttendancesByDate,
        setAttendancesByDate: mockSetAttendancesByDate,
      } as never);

      const { result } = renderHook(() => useDragAndDrop());

      // Start drag from spiritual section with combined treatment
      act(() => {
        result.current.handleDragStart('spiritual', 0, 'scheduled', 1);
      });

      // Drop to spiritual checkedIn (should move only spiritual part)
      await act(async () => {
        await result.current.handleDropWithConfirm('spiritual', 'checkedIn');
      });

      expect(mockSetAttendancesByDate).toHaveBeenCalled();
      expect(result.current.dragged).toBeNull();
    });
  });

  describe('Completion Flow with Modal Handling', () => {
    it('should open PostAttendanceModal for spiritual completion', async () => {
      const mockAttendancesByDate: AttendanceByDate = {
        date: new Date('2024-01-15'),
        spiritual: { 
          scheduled: [], 
          checkedIn: [createMockPatient({ 
            patientId: 1, 
            attendanceId: 100,
            name: 'Spiritual Patient' 
          })], 
          onGoing: [], 
          completed: [] 
        },
        lightBath: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
        rod: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
        combined: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
      };

      mockUseAttendanceManagement.mockReturnValue({
        attendancesByDate: mockAttendancesByDate,
        setAttendancesByDate: mockSetAttendancesByDate,
      } as never);

      const { result } = renderHook(() => useDragAndDrop());

      // Start drag from spiritual checkedIn
      act(() => {
        result.current.handleDragStart('spiritual', 0, 'checkedIn');
      });

      // Drop to completed (should open PostAttendanceModal)
      await act(async () => {
        await result.current.handleDropWithConfirm('spiritual', 'completed');
      });

      expect(mockOpenPostAttendance).toHaveBeenCalledWith({
        attendanceId: 100,
        patientId: 1,
        patientName: 'Spiritual Patient',
        attendanceType: 'spiritual',
        currentTreatmentStatus: 'T',
        currentStartDate: undefined,
        currentReturnWeeks: undefined,
        isFirstAttendance: false,
        onComplete: expect.any(Function),
      });
      expect(result.current.dragged).toBeNull();
    });

    it('should open PostTreatmentModal for lightBath completion', async () => {
      const mockAttendancesByDate: AttendanceByDate = {
        date: new Date('2024-01-15'),
        spiritual: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
        lightBath: { 
          scheduled: [], 
          checkedIn: [createMockPatient({ 
            patientId: 2, 
            attendanceId: 200,
            name: 'LightBath Patient' 
          })], 
          onGoing: [], 
          completed: [] 
        },
        rod: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
        combined: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
      };

      mockUseAttendanceManagement.mockReturnValue({
        attendancesByDate: mockAttendancesByDate,
        setAttendancesByDate: mockSetAttendancesByDate,
      } as never);

      const { result } = renderHook(() => useDragAndDrop());

      // Start drag from lightBath checkedIn
      act(() => {
        result.current.handleDragStart('lightBath', 0, 'checkedIn');
      });

      // Drop to completed (should open PostTreatmentModal)
      await act(async () => {
        await result.current.handleDropWithConfirm('lightBath', 'completed');
      });

      expect(mockOpenPostTreatment).toHaveBeenCalledWith({
        attendanceId: 200,
        patientId: 2,
        patientName: 'LightBath Patient',
        attendanceType: 'lightBath',
        onComplete: expect.any(Function),
      });
      expect(result.current.dragged).toBeNull();
    });

    it('should handle first-time patient detection for spiritual completion', async () => {
      const mockAttendancesByDate: AttendanceByDate = {
        date: new Date('2024-01-15'),
        spiritual: { 
          scheduled: [], 
          checkedIn: [createMockPatient({ 
            patientId: 3, 
            attendanceId: 300,
            name: 'New Patient' 
          })], 
          onGoing: [], 
          completed: [] 
        },
        lightBath: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
        rod: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
        combined: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
      };

      // Mock patient with status "N" (new patient)
      mockUsePatients.mockReturnValue({
        data: [{ id: 3, name: 'New Patient', status: 'N' }],
        isLoading: false,
        error: null,
      } as never);

      mockUseAttendanceManagement.mockReturnValue({
        attendancesByDate: mockAttendancesByDate,
        setAttendancesByDate: mockSetAttendancesByDate,
      } as never);

      const { result } = renderHook(() => useDragAndDrop());

      // Start drag from spiritual checkedIn
      act(() => {
        result.current.handleDragStart('spiritual', 0, 'checkedIn');
      });

      // Drop to completed
      await act(async () => {
        await result.current.handleDropWithConfirm('spiritual', 'completed');
      });

      expect(mockOpenPostAttendance).toHaveBeenCalledWith(
        expect.objectContaining({
          isFirstAttendance: true,
        })
      );
    });
  });

  describe('Multi-Section Modal Handling', () => {
    it('should open multi-section modal for patient in both spiritual and lightBath', async () => {
      const mockAttendancesByDate: AttendanceByDate = {
        date: new Date('2024-01-15'),
        spiritual: { 
          scheduled: [createMockPatient({ 
            patientId: 4, 
            attendanceId: 401,
            name: 'Multi Patient' 
          })], 
          checkedIn: [], 
          onGoing: [], 
          completed: [] 
        },
        lightBath: { 
          scheduled: [createMockPatient({ 
            patientId: 4, 
            attendanceId: 402,
            name: 'Multi Patient' 
          })], 
          checkedIn: [], 
          onGoing: [], 
          completed: [] 
        },
        rod: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
        combined: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
      };

      mockUseAttendanceManagement.mockReturnValue({
        attendancesByDate: mockAttendancesByDate,
        setAttendancesByDate: mockSetAttendancesByDate,
      } as never);

      const { result } = renderHook(() => useDragAndDrop());

      // Start drag from spiritual scheduled
      act(() => {
        result.current.handleDragStart('spiritual', 0, 'scheduled');
      });

      // Drop to spiritual checkedIn (should trigger multi-section modal)
      await act(async () => {
        await result.current.handleDropWithConfirm('spiritual', 'checkedIn');
      });

      expect(mockOpenMultiSection).toHaveBeenCalledWith(
        expect.any(Function), // checkInAll callback
        expect.any(Function)  // checkInSingle callback
      );
      expect(result.current.dragged).toBeNull();
    });

    it('should execute checkInAll functionality correctly', async () => {
      const mockAttendancesByDate: AttendanceByDate = {
        date: new Date('2024-01-15'),
        spiritual: { 
          scheduled: [createMockPatient({ 
            patientId: 5, 
            attendanceId: 501,
            treatmentAttendanceIds: [501],
            name: 'Multi All Patient' 
          })], 
          checkedIn: [], 
          onGoing: [], 
          completed: [] 
        },
        lightBath: { 
          scheduled: [createMockPatient({ 
            patientId: 5, 
            attendanceId: 502,
            treatmentAttendanceIds: [502],
            name: 'Multi All Patient' 
          })], 
          checkedIn: [], 
          onGoing: [], 
          completed: [] 
        },
        rod: { 
          scheduled: [createMockPatient({ 
            patientId: 5, 
            attendanceId: 503,
            treatmentAttendanceIds: [503],
            name: 'Multi All Patient' 
          })], 
          checkedIn: [], 
          onGoing: [], 
          completed: [] 
        },
        combined: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
      };

      mockUseAttendanceManagement.mockReturnValue({
        attendancesByDate: mockAttendancesByDate,
        setAttendancesByDate: mockSetAttendancesByDate,
      } as never);

      const { result } = renderHook(() => useDragAndDrop());

      // Start drag from spiritual scheduled
      act(() => {
        result.current.handleDragStart('spiritual', 0, 'scheduled');
      });

      // Drop to spiritual checkedIn (should trigger multi-section modal)
      await act(async () => {
        await result.current.handleDropWithConfirm('spiritual', 'checkedIn');
      });

      // Get the checkInAll callback and execute it
      const checkInAllCallback = mockOpenMultiSection.mock.calls[0][0];
      
      await act(async () => {
        await checkInAllCallback();
      });

      // Should have called backend sync for all attendance IDs
      expect(mockUpdateAttendanceStatus).toHaveBeenCalledWith(501, 'checkedIn');
      expect(mockUpdateAttendanceStatus).toHaveBeenCalledWith(502, 'checkedIn');
      expect(mockUpdateAttendanceStatus).toHaveBeenCalledWith(503, 'checkedIn');
      
      // Should have updated local state
      expect(mockSetAttendancesByDate).toHaveBeenCalled();
    });

    it('should handle backend sync failures gracefully in checkInAll', async () => {
      const mockAttendancesByDate: AttendanceByDate = {
        date: new Date('2024-01-15'),
        spiritual: { 
          scheduled: [createMockPatient({ 
            patientId: 6, 
            attendanceId: 601,
            treatmentAttendanceIds: [601],
            name: 'Error Patient' 
          })], 
          checkedIn: [], 
          onGoing: [], 
          completed: [] 
        },
        lightBath: { 
          scheduled: [createMockPatient({ 
            patientId: 6, 
            attendanceId: 602,
            treatmentAttendanceIds: [602],
            name: 'Error Patient' 
          })], 
          checkedIn: [], 
          onGoing: [], 
          completed: [] 
        },
        rod: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
        combined: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
      };

      // Mock backend failures
      mockUpdateAttendanceStatus.mockRejectedValue(new Error('Backend error'));

      mockUseAttendanceManagement.mockReturnValue({
        attendancesByDate: mockAttendancesByDate,
        setAttendancesByDate: mockSetAttendancesByDate,
      } as never);

      const { result } = renderHook(() => useDragAndDrop());

      // Start drag and trigger multi-section modal
      act(() => {
        result.current.handleDragStart('spiritual', 0, 'scheduled');
      });

      await act(async () => {
        await result.current.handleDropWithConfirm('spiritual', 'checkedIn');
      });

      // Execute checkInAll callback
      const checkInAllCallback = mockOpenMultiSection.mock.calls[0][0];
      
      await act(async () => {
        await checkInAllCallback();
      });

      // Should log warning about backend sync failures but continue with local update
      expect(consoleSpy).toHaveBeenCalledWith('Some backend syncs failed, continuing with local update');
      expect(mockSetAttendancesByDate).toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle completion move when patient is not found', async () => {
      const mockAttendancesByDate: AttendanceByDate = {
        date: new Date('2024-01-15'),
        spiritual: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
        lightBath: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
        rod: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
        combined: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
      };

      mockUseAttendanceManagement.mockReturnValue({
        attendancesByDate: mockAttendancesByDate,
        setAttendancesByDate: mockSetAttendancesByDate,
      } as never);

      const { result } = renderHook(() => useDragAndDrop());

      // Start drag with non-existent patient
      act(() => {
        result.current.handleDragStart('spiritual', 0, 'checkedIn');
      });

      // Drop to completed (patient not found, should reset dragged state)
      await act(async () => {
        await result.current.handleDropWithConfirm('spiritual', 'completed');
      });

      expect(mockOpenPostAttendance).not.toHaveBeenCalled();
      expect(result.current.dragged).toBeNull();
    });

    it('should handle completion move when patient has no attendanceId', async () => {
      const mockAttendancesByDate: AttendanceByDate = {
        date: new Date('2024-01-15'),
        spiritual: { 
          scheduled: [], 
          checkedIn: [createMockPatient({ 
            patientId: 7, 
            attendanceId: undefined, // No attendanceId
            name: 'No ID Patient' 
          }) as AttendanceStatusDetail], 
          onGoing: [], 
          completed: [] 
        },
        lightBath: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
        rod: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
        combined: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
      };

      mockUseAttendanceManagement.mockReturnValue({
        attendancesByDate: mockAttendancesByDate,
        setAttendancesByDate: mockSetAttendancesByDate,
      } as never);

      const { result } = renderHook(() => useDragAndDrop());

      // Start drag from patient without attendanceId
      act(() => {
        result.current.handleDragStart('spiritual', 0, 'checkedIn');
      });

      // Drop to completed (should not open modal due to missing attendanceId)
      await act(async () => {
        await result.current.handleDropWithConfirm('spiritual', 'completed');
      });

      expect(mockOpenPostAttendance).not.toHaveBeenCalled();
      expect(result.current.dragged).toBeNull();
    });
  });
});