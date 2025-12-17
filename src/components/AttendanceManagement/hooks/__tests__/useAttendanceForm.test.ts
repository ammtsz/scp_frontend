import { renderHook, act } from '@testing-library/react';
import { useAttendanceForm } from '../useAttendanceForm';
import { useAttendanceManagement } from '@/hooks/useAttendanceManagement';
import { usePatients, useCreatePatient } from '@/hooks/usePatientQueries';
import { useCreateAttendance, useCheckInAttendance } from '@/hooks/useAttendanceQueries';
import { useQueryClient } from '@tanstack/react-query';
import { isPatientAlreadyScheduled } from '@/utils/businessRules';
import { getNextAvailableDate } from '@/utils/dateHelpers';
import { transformPriorityToApi } from '@/utils/apiTransformers';
import type { PatientBasic, Priority } from '@/types/types';

// Helper function to create mock events
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createMockEvent = (): any => ({ preventDefault: jest.fn() });

// Mock dependencies
jest.mock('@/hooks/useAttendanceManagement');
jest.mock('@/hooks/usePatientQueries');
jest.mock('@/hooks/useAttendanceQueries');
jest.mock('@tanstack/react-query');
jest.mock('@/utils/businessRules');
jest.mock('@/utils/dateHelpers');
jest.mock('@/utils/apiTransformers');

const mockUseAttendanceManagement = useAttendanceManagement as jest.MockedFunction<typeof useAttendanceManagement>;
const mockUsePatients = usePatients as jest.MockedFunction<typeof usePatients>;
const mockUseCreatePatient = useCreatePatient as jest.MockedFunction<typeof useCreatePatient>;
const mockUseCreateAttendance = useCreateAttendance as jest.MockedFunction<typeof useCreateAttendance>;
const mockUseCheckInAttendance = useCheckInAttendance as jest.MockedFunction<typeof useCheckInAttendance>;
const mockUseQueryClient = useQueryClient as jest.MockedFunction<typeof useQueryClient>;
const mockIsPatientAlreadyScheduled = isPatientAlreadyScheduled as jest.MockedFunction<typeof isPatientAlreadyScheduled>;
const mockGetNextAvailableDate = getNextAvailableDate as jest.MockedFunction<typeof getNextAvailableDate>;
const mockTransformPriorityToApi = transformPriorityToApi as jest.MockedFunction<typeof transformPriorityToApi>;

// Mock console methods to prevent test noise
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('useAttendanceForm', () => {
  const mockPatients: PatientBasic[] = [
    { id: '1', name: 'João Silva', phone: '11999999999', priority: '2', status: 'T' },
    { id: '2', name: 'Maria Santos', phone: '11888888888', priority: '1', status: 'N' },
    { id: '3', name: 'Pedro Costa', phone: '11777777777', priority: '3', status: 'A' }
  ];

  const mockQueryClient = {
    invalidateQueries: jest.fn()
  };

  const mockCreatePatientMutation = {
    mutateAsync: jest.fn(),
    isLoading: false,
    error: null
  };

  const mockCreateAttendanceMutation = {
    mutateAsync: jest.fn(),
    isLoading: false,
    error: null
  };

  const mockCheckInAttendanceMutation = {
    mutateAsync: jest.fn(),
    isLoading: false,
    error: null
  };

  const defaultMockContext = {
    attendancesByDate: null,
    refreshCurrentDate: jest.fn().mockResolvedValue(undefined)
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseAttendanceManagement.mockReturnValue(defaultMockContext as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUsePatients.mockReturnValue({ data: mockPatients, isLoading: false, error: null } as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseQueryClient.mockReturnValue(mockQueryClient as any);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseCreatePatient.mockReturnValue(mockCreatePatientMutation as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseCreateAttendance.mockReturnValue(mockCreateAttendanceMutation as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockUseCheckInAttendance.mockReturnValue(mockCheckInAttendanceMutation as any);
    
    // Set up default return values for mutations
    mockCreatePatientMutation.mutateAsync.mockResolvedValue({ id: 'new-patient-1', name: 'New Patient' });
    mockCreateAttendanceMutation.mutateAsync.mockResolvedValue({ id: 123 });
    mockCheckInAttendanceMutation.mutateAsync.mockResolvedValue({ success: true });
    
    mockIsPatientAlreadyScheduled.mockReturnValue(false);
    mockGetNextAvailableDate.mockResolvedValue('2024-01-15');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockTransformPriorityToApi.mockImplementation((priority: Priority) => priority as any);
    
    consoleSpy.mockClear();
    consoleWarnSpy.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('Initial state and configuration', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAttendanceForm());

      expect(result.current.search).toBe('');
      expect(result.current.selectedPatient).toBe('');
      expect(result.current.isNewPatient).toBe(false);
      expect(result.current.selectedTypes).toEqual([]);
      expect(result.current.priority).toBe('3');
      expect(result.current.notes).toBe('');
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.success).toBeNull();
    });

    it('should accept custom default notes', () => {
      const { result } = renderHook(() => 
        useAttendanceForm({ defaultNotes: 'Custom default notes' })
      );

      expect(result.current.notes).toBe('Custom default notes');
    });

    it('should provide all expected interface methods', () => {
      const { result } = renderHook(() => useAttendanceForm());

      expect(typeof result.current.setSearch).toBe('function');
      expect(typeof result.current.setSelectedPatient).toBe('function');
      expect(typeof result.current.setIsNewPatient).toBe('function');
      expect(typeof result.current.setSelectedTypes).toBe('function');
      expect(typeof result.current.setPriority).toBe('function');
      expect(typeof result.current.setNotes).toBe('function');
      expect(typeof result.current.resetForm).toBe('function');
      expect(typeof result.current.handleRegisterNewAttendance).toBe('function');
      expect(Array.isArray(result.current.filteredPatients)).toBe(true);
    });
  });

  describe('Form state management', () => {
    it('should update search state correctly', () => {
      const { result } = renderHook(() => useAttendanceForm());

      act(() => {
        result.current.setSearch('João');
      });

      expect(result.current.search).toBe('João');
    });

    it('should filter patients based on search', () => {
      const { result } = renderHook(() => useAttendanceForm());

      act(() => {
        result.current.setSearch('João');
      });

      expect(result.current.filteredPatients).toEqual([
        expect.objectContaining({ name: 'João Silva' })
      ]);
    });

    it('should handle case-insensitive filtering', () => {
      const { result } = renderHook(() => useAttendanceForm());

      act(() => {
        result.current.setSearch('MARIA');
      });

      expect(result.current.filteredPatients).toEqual([
        expect.objectContaining({ name: 'Maria Santos' })
      ]);
    });

    it('should update selected patient correctly', () => {
      const { result } = renderHook(() => useAttendanceForm());

      act(() => {
        result.current.setSelectedPatient('João Silva');
      });

      expect(result.current.selectedPatient).toBe('João Silva');
    });

    it('should toggle new patient state', () => {
      const { result } = renderHook(() => useAttendanceForm());

      act(() => {
        result.current.setIsNewPatient(true);
      });

      expect(result.current.isNewPatient).toBe(true);
    });

    it('should manage selected types array', () => {
      const { result } = renderHook(() => useAttendanceForm());

      act(() => {
        result.current.setSelectedTypes(['spiritual', 'lightBath']);
      });

      expect(result.current.selectedTypes).toEqual(['spiritual', 'lightBath']);
    });

    it('should update priority correctly', () => {
      const { result } = renderHook(() => useAttendanceForm());

      act(() => {
        result.current.setPriority('1');
      });

      expect(result.current.priority).toBe('1');
    });

    it('should reset form to default state', () => {
      const { result } = renderHook(() => useAttendanceForm());

      // Set some form values
      act(() => {
        result.current.setSearch('Test Search');
        result.current.setSelectedPatient('Test Patient');
        result.current.setSelectedTypes(['spiritual']);
        result.current.setIsNewPatient(true);
        result.current.setNotes('Test Notes');
      });

      // Reset form
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.search).toBe('');
      expect(result.current.selectedPatient).toBe('');
      expect(result.current.selectedTypes).toEqual([]);
      expect(result.current.isNewPatient).toBe(false);
      expect(result.current.notes).toBe('');
      expect(result.current.error).toBeNull();
      expect(result.current.success).toBeNull();
    });
  });

  describe('Form validation', () => {
    it('should validate required fields - missing name', async () => {
      const { result } = renderHook(() => useAttendanceForm());

      act(() => {
        result.current.setSelectedTypes(['spiritual']);
      });

      const mockEvent = createMockEvent();
      
      await act(async () => {
        const success = await result.current.handleRegisterNewAttendance(mockEvent);
        expect(success).toBe(false);
      });

      expect(result.current.error).toContain('Por favor, preencha o nome do paciente');
    });

    it('should validate required fields - missing types', async () => {
      const { result } = renderHook(() => useAttendanceForm());

      act(() => {
        result.current.setSearch('Test Patient');
        result.current.setIsNewPatient(true);
      });

      const mockEvent = createMockEvent();
      
      await act(async () => {
        const success = await result.current.handleRegisterNewAttendance(mockEvent);
        expect(success).toBe(false);
      });

      expect(result.current.error).toContain('selecione pelo menos um tipo de atendimento');
    });

    it('should validate duplicate patient scheduling', async () => {
      mockIsPatientAlreadyScheduled.mockReturnValue(true);

      const { result } = renderHook(() => useAttendanceForm());

      act(() => {
        result.current.setSelectedPatient('João Silva');
        result.current.setSelectedTypes(['spiritual']);
      });

      const mockEvent = createMockEvent();
      
      await act(async () => {
        const success = await result.current.handleRegisterNewAttendance(mockEvent);
        expect(success).toBe(false);
      });

      expect(result.current.error).toContain('já possui atendimento agendado');
    });

    it('should prevent creating existing patient as new', async () => {
      const { result } = renderHook(() => useAttendanceForm());

      act(() => {
        result.current.setSearch('João Silva'); // Existing patient name
        result.current.setIsNewPatient(true);
        result.current.setSelectedTypes(['spiritual']);
      });

      const mockEvent = createMockEvent();
      
      await act(async () => {
        const success = await result.current.handleRegisterNewAttendance(mockEvent);
        expect(success).toBe(false);
      });

      expect(result.current.error).toContain('Paciente já cadastrado');
    });
  });

  describe('Attendance creation workflow', () => {
    it('should create attendance for existing patient successfully', async () => {
      mockCreateAttendanceMutation.mutateAsync.mockResolvedValue({ id: 123 });
      mockCheckInAttendanceMutation.mutateAsync.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useAttendanceForm());

      act(() => {
        result.current.setSelectedPatient('João Silva');
        result.current.setSelectedTypes(['spiritual']);
      });

      const mockEvent = createMockEvent();
      
      await act(async () => {
        const success = await result.current.handleRegisterNewAttendance(mockEvent);
        expect(success).toBe(true);
      });

      expect(mockCreateAttendanceMutation.mutateAsync).toHaveBeenCalledWith({
        patientId: 1,
        attendanceType: 'spiritual',
        scheduledDate: '2024-01-15'
      });

      expect(mockCheckInAttendanceMutation.mutateAsync).toHaveBeenCalledWith({
        attendanceId: 123,
        patientName: 'João Silva'
      });

      // Add delay to check if success is set asynchronously
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });
      
      // Success state is reset after form submission, so we verify through other means
      // The function should return true and make the expected calls
      expect(defaultMockContext.refreshCurrentDate).toHaveBeenCalled();
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['agenda']
      });
    });

    it('should create new patient and attendance successfully', async () => {
      mockCreatePatientMutation.mutateAsync.mockResolvedValue({ id: 999 });
      mockCreateAttendanceMutation.mutateAsync.mockResolvedValue({ id: 456 });

      const { result } = renderHook(() => useAttendanceForm());

      act(() => {
        result.current.setSearch('New Patient Name');
        result.current.setIsNewPatient(true);
        result.current.setSelectedTypes(['lightBath']);
        result.current.setPriority('2');
        result.current.setNotes('Test complaint');
      });

      const mockEvent = createMockEvent();
      
      await act(async () => {
        const success = await result.current.handleRegisterNewAttendance(mockEvent);
        expect(success).toBe(true);
      });

      expect(mockCreatePatientMutation.mutateAsync).toHaveBeenCalledWith({
        name: 'New Patient Name',
        priority: '2',
        birth_date: expect.any(String),
        main_complaint: 'Test complaint'
      });

      expect(mockCreateAttendanceMutation.mutateAsync).toHaveBeenCalledWith({
        patientId: 999,
        attendanceType: 'lightBath',
        scheduledDate: '2024-01-15'
      });
    });

    it('should handle multiple attendance types', async () => {
      mockCreateAttendanceMutation.mutateAsync.mockResolvedValue({ id: 123 });

      const { result } = renderHook(() => useAttendanceForm());

      act(() => {
        result.current.setSelectedPatient('João Silva');
        result.current.setSelectedTypes(['spiritual', 'lightBath', 'rod']);
      });

      const mockEvent = createMockEvent();
      
      await act(async () => {
        const success = await result.current.handleRegisterNewAttendance(mockEvent);
        expect(success).toBe(true);
      });

      expect(mockCreateAttendanceMutation.mutateAsync).toHaveBeenCalledTimes(3);
      // Success state is reset after form submission, verified through function return and calls
    });

    it('should handle attendance without auto check-in', async () => {
      mockCreateAttendanceMutation.mutateAsync.mockResolvedValue({ id: 123 });

      const { result } = renderHook(() => 
        useAttendanceForm({ autoCheckIn: false })
      );

      act(() => {
        result.current.setSelectedPatient('João Silva');
        result.current.setSelectedTypes(['spiritual']);
      });

      const mockEvent = createMockEvent();
      
      await act(async () => {
        const success = await result.current.handleRegisterNewAttendance(mockEvent);
        expect(success).toBe(true);
      });

      expect(mockCheckInAttendanceMutation.mutateAsync).not.toHaveBeenCalled();
      // Success state is reset after form submission, verified through function return and calls
    });
  });

  describe('Error handling', () => {
    it('should handle patient creation failure', async () => {
      mockCreatePatientMutation.mutateAsync.mockRejectedValue(new Error('Patient creation failed'));

      const { result } = renderHook(() => useAttendanceForm());

      act(() => {
        result.current.setSearch('New Patient');
        result.current.setIsNewPatient(true);
        result.current.setSelectedTypes(['spiritual']);
      });

      const mockEvent = createMockEvent();
      
      await act(async () => {
        const success = await result.current.handleRegisterNewAttendance(mockEvent);
        expect(success).toBe(false);
      });

      expect(result.current.error).toContain('Erro inesperado');
    });

    it('should handle attendance creation failure', async () => {
      mockCreateAttendanceMutation.mutateAsync.mockRejectedValue(new Error('Attendance creation failed'));

      const { result } = renderHook(() => useAttendanceForm());

      act(() => {
        result.current.setSelectedPatient('João Silva');
        result.current.setSelectedTypes(['spiritual']);
      });

      const mockEvent = createMockEvent();
      
      await act(async () => {
        const success = await result.current.handleRegisterNewAttendance(mockEvent);
        expect(success).toBe(false);
      });

      expect(result.current.error).toContain('Erro ao criar 1 atendimento(s)');
    });

    it('should handle check-in failure gracefully', async () => {
      mockCreateAttendanceMutation.mutateAsync.mockResolvedValue({ id: 123 });
      mockCheckInAttendanceMutation.mutateAsync.mockRejectedValue(new Error('Check-in failed'));

      const { result } = renderHook(() => useAttendanceForm());

      act(() => {
        result.current.setSelectedPatient('João Silva');
        result.current.setSelectedTypes(['spiritual']);
      });

      const mockEvent = createMockEvent();
      
      await act(async () => {
        const success = await result.current.handleRegisterNewAttendance(mockEvent);
        expect(success).toBe(true); // Should still succeed despite check-in failure
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error during check-in'), 
        expect.any(Error)
      );
      // Success state is reset after form submission, verified through function return and calls
    });

    it('should handle conflict errors specifically', async () => {
      mockCreateAttendanceMutation.mutateAsync.mockRejectedValue(new Error('409 Conflict: Time slot unavailable'));

      const { result } = renderHook(() => useAttendanceForm());

      act(() => {
        result.current.setSelectedPatient('João Silva');
        result.current.setSelectedTypes(['spiritual']);
      });

      const mockEvent = createMockEvent();
      
      await act(async () => {
        const success = await result.current.handleRegisterNewAttendance(mockEvent);
        expect(success).toBe(false);
      });

      expect(result.current.error).toContain('Conflito de horário detectado');
    });
  });

  describe('Callback integration', () => {
    it('should call onRegisterNewAttendance callback on success', async () => {
      const mockCallback = jest.fn();
      mockCreateAttendanceMutation.mutateAsync.mockResolvedValue({ id: 123 });

      const { result } = renderHook(() => 
        useAttendanceForm({ onRegisterNewAttendance: mockCallback })
      );

      act(() => {
        result.current.setSelectedPatient('João Silva');
        result.current.setSelectedTypes(['spiritual']);
        result.current.setPriority('1');
      });

      const mockEvent = createMockEvent();
      
      await act(async () => {
        await result.current.handleRegisterNewAttendance(mockEvent);
      });

      expect(mockCallback).toHaveBeenCalledWith(
        'João Silva',
        ['spiritual'],
        false, // isNew
        '1', // priority
        '2024-01-15' // date
      );
    });

    it('should call onFormSuccess callback on success', async () => {
      const mockSuccessCallback = jest.fn();
      mockCreateAttendanceMutation.mutateAsync.mockResolvedValue({ id: 123 });

      const { result } = renderHook(() => 
        useAttendanceForm({ onFormSuccess: mockSuccessCallback })
      );

      act(() => {
        result.current.setSelectedPatient('João Silva');
        result.current.setSelectedTypes(['spiritual']);
      });

      const mockEvent = createMockEvent();
      
      await act(async () => {
        await result.current.handleRegisterNewAttendance(mockEvent);
      });

      expect(mockSuccessCallback).toHaveBeenCalled();
    });

    it('should not call callbacks on failure', async () => {
      const mockCallback = jest.fn();
      const mockSuccessCallback = jest.fn();
      mockCreateAttendanceMutation.mutateAsync.mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => 
        useAttendanceForm({ 
          onRegisterNewAttendance: mockCallback,
          onFormSuccess: mockSuccessCallback
        })
      );

      act(() => {
        result.current.setSelectedPatient('João Silva');
        result.current.setSelectedTypes(['spiritual']);
      });

      const mockEvent = createMockEvent();
      
      await act(async () => {
        await result.current.handleRegisterNewAttendance(mockEvent);
      });

      expect(mockCallback).not.toHaveBeenCalled();
      expect(mockSuccessCallback).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases and integration', () => {
    it('should handle custom selected date', async () => {
      mockCreateAttendanceMutation.mutateAsync.mockResolvedValue({ id: 123 });

      const { result } = renderHook(() => useAttendanceForm());

      act(() => {
        result.current.setSelectedPatient('João Silva');
        result.current.setSelectedTypes(['spiritual']);
      });

      const mockEvent = createMockEvent();
      
      await act(async () => {
        const success = await result.current.handleRegisterNewAttendance(mockEvent, '2024-02-01');
        expect(success).toBe(true);
      });

      expect(mockCreateAttendanceMutation.mutateAsync).toHaveBeenCalledWith({
        patientId: 1,
        attendanceType: 'spiritual',
        scheduledDate: '2024-02-01'
      });
    });

    it('should handle form submission with isSubmitting state', async () => {
      mockCreateAttendanceMutation.mutateAsync.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ id: 123 }), 100))
      );

      const { result } = renderHook(() => useAttendanceForm());

      act(() => {
        result.current.setSelectedPatient('João Silva');
        result.current.setSelectedTypes(['spiritual']);
      });

      const mockEvent = createMockEvent();
      
      // Start submission (don't wrap in act to capture intermediate state)
      const submitPromise = result.current.handleRegisterNewAttendance(mockEvent);

      // Wait a moment for isSubmitting to be set to true
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      // Check that isSubmitting is true during submission
      expect(result.current.isSubmitting).toBe(true);

      // Wait for completion
      await act(async () => {
        await submitPromise;
      });

      // Check that isSubmitting is false after completion
      expect(result.current.isSubmitting).toBe(false);
    });
  });
});