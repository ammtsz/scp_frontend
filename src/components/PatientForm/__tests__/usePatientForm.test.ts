/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from '@testing-library/react';
import { usePatientForm } from '../usePatientForm';

// Create mock functions first
const mockPush = jest.fn();
const mockCreatePatientMutateAsync = jest.fn();
const mockAddPatientToAgendaMutateAsync = jest.fn();

// Mock modules
jest.mock('next/navigation');
jest.mock('@/hooks/usePatientQueries');
jest.mock('@/hooks/useAgendaQueries');
jest.mock('@/utils/formHelpers');
jest.mock('@/utils/apiTransformers');

// Import the mocked modules
import { useRouter } from 'next/navigation';
import { useCreatePatient } from '@/hooks/usePatientQueries';
import { useAddPatientToAgenda } from '@/hooks/useAgendaQueries';
import { formatPhoneNumber } from '@/utils/formHelpers';
import { transformPriorityToApi, transformStatusToApi } from '@/utils/apiTransformers';

// Mock alert
global.alert = jest.fn();



// Enum values for tests
const PatientPriority = {
  EMERGENCY: '1',
  INTERMEDIATE: '2',
  NORMAL: '3'
};

const TreatmentStatus = {
  NEW_PATIENT: 'N',
  SCHEDULED: 'S',
  CHECKED_IN: 'C'
};

// Cast mocked functions
const mockedFormatPhoneNumber = formatPhoneNumber as jest.MockedFunction<typeof formatPhoneNumber>;
const mockedTransformPriorityToApi = transformPriorityToApi as jest.MockedFunction<typeof transformPriorityToApi>;
const mockedTransformStatusToApi = transformStatusToApi as jest.MockedFunction<typeof transformStatusToApi>;

describe('usePatientForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.alert as jest.Mock).mockClear();
    
    // Setup mock implementations for hooks
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      refresh: jest.fn(),
    });
    
    (useCreatePatient as jest.Mock).mockReturnValue({
      mutateAsync: mockCreatePatientMutateAsync,
      isLoading: false,
    });
    
    (useAddPatientToAgenda as jest.Mock).mockReturnValue({
      mutateAsync: mockAddPatientToAgendaMutateAsync,
      isLoading: false,
    });
    
    // Reset mock implementations
    mockCreatePatientMutateAsync.mockResolvedValue({ id: 1, name: 'Test' });
    mockAddPatientToAgendaMutateAsync.mockResolvedValue({});
    mockedFormatPhoneNumber.mockImplementation((phone: string) => phone);
    mockedTransformPriorityToApi.mockReturnValue('1' as any);
    mockedTransformStatusToApi.mockReturnValue('N' as any);
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => usePatientForm());

      expect(result.current.patient.name).toBe('');
      expect(result.current.patient.phone).toBe('');
      expect(result.current.patient.priority).toBe('3');
      expect(result.current.patient.status).toBe('N');
      expect(result.current.patient.mainComplaint).toBe('');
      expect(result.current.patient.birthDate).toBeInstanceOf(Date);
      expect(result.current.patient.startDate).toBeInstanceOf(Date);
      expect(result.current.patient.dischargeDate).toBeNull();
      expect(result.current.patient.nextAttendanceDates).toEqual([]);
      expect(result.current.patient.previousAttendances).toEqual([]);
      expect(result.current.patient.currentRecommendations).toMatchObject({
        food: '',
        water: '',
        ointment: '',
        lightBath: false,
        rod: false,
        spiritualTreatment: false,
        returnWeeks: 0,
      });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.validationErrors).toEqual({});
    });
  });

  describe('Form State Management', () => {
    it('should handle text field changes', () => {
      const { result } = renderHook(() => usePatientForm());

      act(() => {
        result.current.handleChange({
          target: { name: 'name', value: 'John Doe', type: 'text' }
        } as unknown as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.patient.name).toBe('John Doe');
    });

    it('should handle phone number formatting', () => {
      mockedFormatPhoneNumber.mockReturnValue('(11) 99999-9999');
      
      const { result } = renderHook(() => usePatientForm());

      act(() => {
        result.current.handleChange({
          target: { name: 'phone', value: '11999999999', type: 'text' }
        } as unknown as React.ChangeEvent<HTMLInputElement>);
      });

      expect(mockedFormatPhoneNumber).toHaveBeenCalledWith('11999999999');
      expect(result.current.patient.phone).toBe('(11) 99999-9999');
    });

    it('should handle recommendation checkbox changes', () => {
      const { result } = renderHook(() => usePatientForm());

      act(() => {
        result.current.handleChange({
          target: { name: 'recommendations.lightBath', checked: true, type: 'checkbox' }
        } as unknown as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.patient.currentRecommendations.lightBath).toBe(true);
    });
  });

  describe('Spiritual Consultation Changes', () => {
    it('should handle discharge date changes', () => {
      const { result } = renderHook(() => usePatientForm());

      act(() => {
        result.current.handleSpiritualConsultationChange({
          target: { name: 'dischargeDate', value: '2024-12-31' }
        } as unknown as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.patient.dischargeDate).toBeInstanceOf(Date);
      expect(result.current.patient.dischargeDate?.getFullYear()).toBe(2024);
    });

    it('should handle discharge date clearing', () => {
      const { result } = renderHook(() => usePatientForm());

      act(() => {
        result.current.handleSpiritualConsultationChange({
          target: { name: 'dischargeDate', value: '' }
        } as unknown as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.patient.dischargeDate).toBeNull();
    });

    it('should handle next attendance date changes', () => {
      const { result } = renderHook(() => usePatientForm());

      act(() => {
        result.current.handleSpiritualConsultationChange({
          target: { name: 'nextDate', value: '2024-02-01' }
        } as unknown as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.patient.nextAttendanceDates).toHaveLength(1);
      expect(result.current.patient.nextAttendanceDates[0].date).toBeInstanceOf(Date);
      expect(result.current.patient.nextAttendanceDates[0].type).toBe('spiritual');
    });

    it('should clear next attendance dates when value is empty', () => {
      const { result } = renderHook(() => usePatientForm());

      // First set a date
      act(() => {
        result.current.handleSpiritualConsultationChange({
          target: { name: 'nextDate', value: '2024-02-01' }
        } as unknown as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.patient.nextAttendanceDates).toHaveLength(1);

      // Then clear it
      act(() => {
        result.current.handleSpiritualConsultationChange({
          target: { name: 'nextDate', value: '' }
        } as unknown as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.patient.nextAttendanceDates).toEqual([]);
    });

    it('should handle other date field changes', () => {
      const { result } = renderHook(() => usePatientForm());

      act(() => {
        result.current.handleSpiritualConsultationChange({
          target: { name: 'startDate', value: '2024-01-15' }
        } as unknown as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.patient.startDate).toBeInstanceOf(Date);
      expect(result.current.patient.startDate.getFullYear()).toBe(2024);
      expect(result.current.patient.startDate.getMonth()).toBe(0); // January is 0
      // Use toDateString to avoid timezone issues
      expect(result.current.patient.startDate.toDateString()).toContain('Jan');
    });
  });

  describe('Form Validation', () => {
    it('should validate required name field', () => {
      const { result } = renderHook(() => usePatientForm());

      // Empty name should be invalid
      act(() => {
        result.current.setPatient({
          ...result.current.patient,
          name: ''
        });
      });

      const isValid = result.current.isFormValid();
      expect(isValid).toBe(false);
    });

    it('should validate name field with valid input', () => {
      const { result } = renderHook(() => usePatientForm());

      act(() => {
        result.current.setPatient({
          ...result.current.patient,
          name: 'John Doe'
        });
      });

      const isValid = result.current.isFormValid();
      expect(isValid).toBe(true);
    });

    it('should validate birth date is not in the future', () => {
      const { result } = renderHook(() => usePatientForm());
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      act(() => {
        result.current.setPatient({
          ...result.current.patient,
          name: 'John Doe',
          birthDate: futureDate
        });
      });

      const isValid = result.current.isFormValid();
      expect(isValid).toBe(false);
    });

    it('should validate phone number format when provided', () => {
      const { result } = renderHook(() => usePatientForm());

      // Invalid phone format
      act(() => {
        result.current.setPatient({
          ...result.current.patient,
          name: 'John Doe',
          phone: '123'
        });
      });

      const isValid = result.current.isFormValid();
      expect(isValid).toBe(false);
    });

    it('should accept empty phone number', () => {
      const { result } = renderHook(() => usePatientForm());

      act(() => {
        result.current.setPatient({
          ...result.current.patient,
          name: 'John Doe',
          phone: ''
        });
      });

      const isValid = result.current.isFormValid();
      expect(isValid).toBe(true);
    });

    it('should accept valid phone number format', () => {
      const { result } = renderHook(() => usePatientForm());

      act(() => {
        result.current.setPatient({
          ...result.current.patient,
          name: 'John Doe',
          phone: '(11) 99999-9999'
        });
      });

      const isValid = result.current.isFormValid();
      expect(isValid).toBe(true);
    });
  });

  describe('Form Submission', () => {
    it('should prevent submission with invalid form', async () => {
      const { result } = renderHook(() => usePatientForm());

      // Submit form with empty name (invalid)
      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent<HTMLFormElement>;
      
      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Erro de validação'));
      expect(mockCreatePatientMutateAsync).not.toHaveBeenCalled();
    });

    it('should submit valid form successfully', async () => {
      const mockCreatedPatient = { id: 1, name: 'John Doe' };
      mockCreatePatientMutateAsync.mockResolvedValue(mockCreatedPatient);
      mockedTransformPriorityToApi.mockReturnValue(PatientPriority.INTERMEDIATE as any);
      mockedTransformStatusToApi.mockReturnValue(TreatmentStatus.NEW_PATIENT as any);

      const { result } = renderHook(() => usePatientForm());

      // Set valid form data
      act(() => {
        result.current.setPatient({
          ...result.current.patient,
          name: 'John Doe',
          priority: '2',
          status: 'N'
        });
      });

      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent<HTMLFormElement>;
      
      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockCreatePatientMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
          priority: '2',
          treatment_status: 'N',
          birth_date: expect.any(String)
        })
      );
      expect(global.alert).toHaveBeenCalledWith('Paciente cadastrado com sucesso!');
      expect(mockPush).toHaveBeenCalledWith('/patients');
    });

    it('should include phone when provided', async () => {
      const mockCreatedPatient = { id: 1, name: 'John Doe' };
      mockCreatePatientMutateAsync.mockResolvedValue(mockCreatedPatient);
      mockedFormatPhoneNumber.mockReturnValue('(11) 99999-9999');

      const { result } = renderHook(() => usePatientForm());

      act(() => {
        result.current.setPatient({
          ...result.current.patient,
          name: 'John Doe',
          phone: '(11) 99999-9999'
        });
      });

      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent<HTMLFormElement>;
      
      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockCreatePatientMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: '(11) 99999-9999'
        })
      );
    });

    it('should include birth date when provided', async () => {
      const mockCreatedPatient = { id: 1, name: 'John Doe' };
      mockCreatePatientMutateAsync.mockResolvedValue(mockCreatedPatient);

      const { result } = renderHook(() => usePatientForm());
      const birthDate = new Date('1990-01-01');

      act(() => {
        result.current.setPatient({
          ...result.current.patient,
          name: 'John Doe',
          birthDate: birthDate
        });
      });

      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent<HTMLFormElement>;
      
      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockCreatePatientMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          birth_date: '1990-01-01'
        })
      );
    });

    it('should include main complaint when provided', async () => {
      const mockCreatedPatient = { id: 1, name: 'John Doe' };
      mockCreatePatientMutateAsync.mockResolvedValue(mockCreatedPatient);

      const { result } = renderHook(() => usePatientForm());

      act(() => {
        result.current.setPatient({
          ...result.current.patient,
          name: 'John Doe',
          mainComplaint: 'Test complaint'
        });
      });

      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent<HTMLFormElement>;
      
      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockCreatePatientMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          main_complaint: 'Test complaint'
        })
      );
    });

    it('should handle patient creation error', async () => {
      const error = new Error('Creation failed');
      mockCreatePatientMutateAsync.mockRejectedValue(error);

      const { result } = renderHook(() => usePatientForm());

      act(() => {
        result.current.setPatient({
          ...result.current.patient,
          name: 'John Doe'
        });
      });

      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent<HTMLFormElement>;
      
      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(global.alert).toHaveBeenCalledWith('Erro ao cadastrar paciente: Creation failed');
      expect(result.current.isLoading).toBe(false);
    });

    it('should create attendance when next date is provided', async () => {
      const mockCreatedPatient = { id: 1, name: 'John Doe' };
      mockCreatePatientMutateAsync.mockResolvedValue(mockCreatedPatient);
      mockAddPatientToAgendaMutateAsync.mockResolvedValue({});

      const { result } = renderHook(() => usePatientForm());
      const nextDate = new Date('2024-02-01');

      act(() => {
        result.current.setPatient({
          ...result.current.patient,
          name: 'John Doe',
          nextAttendanceDates: [{ date: nextDate, type: 'spiritual' }]
        });
      });

      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent<HTMLFormElement>;
      
      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockAddPatientToAgendaMutateAsync).toHaveBeenCalledWith({
        patient_id: 1,
        type: 'spiritual',
        scheduled_date: '2024-02-01',
        scheduled_time: '20:00',
        notes: 'Agendamento criado durante cadastro do paciente'
      });
    });

    it('should try multiple time slots if first one fails', async () => {
      const mockCreatedPatient = { id: 1, name: 'John Doe' };
      mockCreatePatientMutateAsync.mockResolvedValue(mockCreatedPatient);
      
      // First call fails, second succeeds
      mockAddPatientToAgendaMutateAsync
        .mockRejectedValueOnce(new Error('Time slot taken'))
        .mockResolvedValueOnce({});

      const { result } = renderHook(() => usePatientForm());
      const nextDate = new Date('2024-02-01');

      act(() => {
        result.current.setPatient({
          ...result.current.patient,
          name: 'John Doe',
          nextAttendanceDates: [{ date: nextDate, type: 'spiritual' }]
        });
      });

      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent<HTMLFormElement>;
      
      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockAddPatientToAgendaMutateAsync).toHaveBeenCalledTimes(2);
      expect(mockAddPatientToAgendaMutateAsync).toHaveBeenNthCalledWith(1, {
        patient_id: 1,
        type: 'spiritual',
        scheduled_date: '2024-02-01',
        scheduled_time: '20:00',
        notes: 'Agendamento criado durante cadastro do paciente'
      });
      expect(mockAddPatientToAgendaMutateAsync).toHaveBeenNthCalledWith(2, {
        patient_id: 1,
        type: 'spiritual',
        scheduled_date: '2024-02-01',
        scheduled_time: '20:30',
        notes: 'Agendamento criado durante cadastro do paciente'
      });
    });

    it('should reset form after successful submission', async () => {
      const mockCreatedPatient = { id: 1, name: 'John Doe' };
      mockCreatePatientMutateAsync.mockResolvedValue(mockCreatedPatient);

      const { result } = renderHook(() => usePatientForm());

      act(() => {
        result.current.setPatient({
          ...result.current.patient,
          name: 'John Doe',
          phone: '(11) 99999-9999'
        });
      });

      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent<HTMLFormElement>;
      
      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      // Form should be reset to initial values
      expect(result.current.patient.name).toBe('');
      expect(result.current.patient.phone).toBe('');
    });
  });

  describe('Key Down Handling', () => {
    it('should prevent Enter key on non-submit elements', () => {
      const { result } = renderHook(() => usePatientForm());
      
      const mockEvent = {
        key: 'Enter',
        target: { tagName: 'INPUT', getAttribute: jest.fn().mockReturnValue(null) },
        preventDefault: jest.fn()
      } as unknown as React.KeyboardEvent<HTMLFormElement>;

      result.current.handleKeyDown(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should allow Enter key on submit button with valid form', () => {
      const { result } = renderHook(() => usePatientForm());

      // Set valid form
      act(() => {
        result.current.setPatient({
          ...result.current.patient,
          name: 'John Doe'
        });
      });

      const mockEvent = {
        key: 'Enter',
        target: { tagName: 'BUTTON', getAttribute: jest.fn().mockReturnValue('submit') },
        preventDefault: jest.fn()
      } as unknown as React.KeyboardEvent<HTMLFormElement>;

      result.current.handleKeyDown(mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should prevent Enter key on submit button with invalid form', () => {
      const { result } = renderHook(() => usePatientForm());

      // Form is invalid (empty name)
      const mockEvent = {
        key: 'Enter',
        target: { tagName: 'BUTTON', getAttribute: jest.fn().mockReturnValue('submit') },
        preventDefault: jest.fn()
      } as unknown as React.KeyboardEvent<HTMLFormElement>;

      result.current.handleKeyDown(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should not interfere with other keys', () => {
      const { result } = renderHook(() => usePatientForm());
      
      const mockEvent = {
        key: 'Tab',
        target: { tagName: 'INPUT' },
        preventDefault: jest.fn()
      } as unknown as React.KeyboardEvent<HTMLFormElement>;

      result.current.handleKeyDown(mockEvent);

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should set loading state during submission', async () => {
      // Mock the mutation to return a resolved promise
      mockCreatePatientMutateAsync.mockResolvedValue({ id: 1, name: 'John Doe' });
      
      const { result } = renderHook(() => usePatientForm());

      act(() => {
        result.current.setPatient({
          ...result.current.patient,
          name: 'John Doe'
        });
      });

      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent;
      
      // Initial state should not be loading
      expect(result.current.isLoading).toBe(false);
      
      // Submit form and wait for completion
      await act(async () => {
        await result.current.handleSubmit(mockEvent);
      });

      // After successful submission, should not be loading
      expect(result.current.isLoading).toBe(false);
      expect(mockCreatePatientMutateAsync).toHaveBeenCalled();
    });
  });
});