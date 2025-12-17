/**
 * @jest-environment jsdom
 */

import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock all dependencies
jest.mock("@/hooks/useFormHandler");
jest.mock("@/api/patients");
jest.mock("@/api/treatment-sessions");
jest.mock("@/stores/modalStore");
jest.mock("../../../../../hooks/useSpiritualTreatmentSubmission");

import {
  usePostAttendanceForm,
  SpiritualTreatmentData,
} from "../usePostAttendanceForm";

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("usePostAttendanceForm", () => {
  // Access mocked functions
  const mockUseFormHandler = jest.requireMock(
    "@/hooks/useFormHandler"
  ).useFormHandler;
  const mockGetPatientById = jest.requireMock("@/api/patients").getPatientById;
  const mockCreateTreatmentSession = jest.requireMock(
    "@/api/treatment-sessions"
  ).createTreatmentSession;
  const mockUsePostAttendanceModal = jest.requireMock(
    "@/stores/modalStore"
  ).usePostAttendanceModal;
  const mockUseCloseModal = jest.requireMock(
    "@/stores/modalStore"
  ).useCloseModal;
  const mockUseSpiritualTreatmentSubmission = jest.requireMock(
    "../../../../../hooks/useSpiritualTreatmentSubmission"
  ).useSpiritualTreatmentSubmission;

  let mockCloseModal: jest.Mock;
  let mockOnComplete: jest.Mock;
  let mockSubmitTreatmentRecord: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock functions
    mockCloseModal = jest.fn();
    mockOnComplete = jest.fn();
    mockSubmitTreatmentRecord = jest.fn();

    // Mock store hooks with basic return values
    mockUsePostAttendanceModal.mockReturnValue({
      isOpen: true,
      attendanceId: 1,
      patientId: 1,
      currentTreatmentStatus: "T",
      isLoading: false,
      onComplete: mockOnComplete,
    });

    mockUseCloseModal.mockReturnValue(mockCloseModal);

    // Mock spiritual treatment submission hook
    mockUseSpiritualTreatmentSubmission.mockReturnValue({
      submitTreatmentRecord: mockSubmitTreatmentRecord,
    });

    // Mock form handler with complete return type
    mockUseFormHandler.mockReturnValue({
      formData: {
        mainComplaint: "Test complaint",
        treatmentStatus: "T",
        startDate: "2024-01-15",
        returnWeeks: 1,
        food: "Light foods",
        water: "Drink plenty",
        ointments: "None",
        recommendations: {
          returnWeeks: 1,
          spiritualMedicalDischarge: false,
        },
        notes: "Test notes",
      },
      setFormData: jest.fn(),
      handleChange: jest.fn(),
      handleSubmit: jest.fn(),
      isLoading: false,
      error: null,
      clearError: jest.fn(),
      setError: jest.fn(),
      resetForm: jest.fn(),
    });

    // Mock API calls
    mockGetPatientById.mockResolvedValue({
      success: true,
      value: {
        id: 1,
        name: "Test Patient",
        email: "test@example.com",
        phone: "11999999999",
        main_complaint: "Test complaint",
        start_date: "2024-01-15",
        priority: 2,
        treatment_status: "T",
        missing_appointments_streak: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });

    mockCreateTreatmentSession.mockResolvedValue({
      success: true,
      value: {
        id: 1,
        treatment_record_id: 1,
        attendance_id: 1,
        patient_id: 1,
        treatment_type: "light_bath",
        body_location: "Head",
        start_date: "2024-01-15",
        planned_sessions: 5,
        completed_sessions: 0,
        status: "scheduled",
        duration_minutes: 2,
        color: "Blue",
        notes: "Test session",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });
  });

  describe("Hook Initialization", () => {
    it("should initialize successfully", () => {
      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      expect(result.current).toBeDefined();
      expect(result.current.formData).toBeDefined();
      expect(result.current.handleCancel).toBeDefined();
      expect(result.current.handleSubmit).toBeDefined();
    });

    it("should provide form state", async () => {
      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      expect(result.current.formData.mainComplaint).toBe("Test complaint");
      expect(result.current.formData.treatmentStatus).toBe("T");

      // Wait for patient data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("Patient Data Loading", () => {
    it("should fetch patient data on mount", async () => {
      renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(mockGetPatientById).toHaveBeenCalledWith("1");
    });

    it("should handle patient data fetch failure", async () => {
      mockGetPatientById.mockResolvedValue({
        success: false,
        error: "Patient not found",
      });

      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(result.current.fetchError).toBe("Patient not found");
    });

    it("should handle network errors in patient fetch", async () => {
      mockGetPatientById.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(result.current.fetchError).toBe(
        "Erro ao carregar dados do paciente"
      );
    });
  });

  describe("Form Actions", () => {
    it("should handle cancel action", () => {
      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.handleCancel();
      });

      expect(mockCloseModal).toHaveBeenCalledWith("postAttendance");
    });
  });

  describe("State Management", () => {
    it("should manage confirmation state", () => {
      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      expect(result.current.showConfirmation).toBe(false);

      act(() => {
        result.current.resetConfirmation();
      });

      expect(result.current.showConfirmation).toBe(false);
      expect(result.current.createdSessions).toEqual([]);
    });

    it("should manage error state", () => {
      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      expect(result.current.showErrors).toBe(false);

      act(() => {
        result.current.resetErrors();
      });

      expect(result.current.showErrors).toBe(false);
      expect(result.current.sessionErrors).toEqual([]);
    });

    it("should handle retry session creation", () => {
      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.retrySessionCreation();
      });

      expect(result.current.showErrors).toBe(false);
    });
  });

  describe("Utility Functions", () => {
    it("should format date correctly", () => {
      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      const formatted = result.current.formatDateForInput("2024-01-15");
      expect(formatted).toBe("2024-01-15");
    });

    it("should get correct treatment status labels", () => {
      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      expect(result.current.getTreatmentStatusLabel("N")).toBe("Novo paciente");
      expect(result.current.getTreatmentStatusLabel("T")).toBe("Em tratamento");
      expect(result.current.getTreatmentStatusLabel("A")).toBe(
        "Alta médica espiritual"
      );
      expect(result.current.getTreatmentStatusLabel("F")).toBe(
        "Faltas consecutivas"
      );
    });
  });

  describe("Loading States", () => {
    it("should handle external loading state", () => {
      mockUsePostAttendanceModal.mockReturnValue({
        isOpen: true,
        attendanceId: 1,
        patientId: 1,
        currentTreatmentStatus: "T",
        isLoading: true, // External loading
        onComplete: mockOnComplete,
      });

      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      expect(result.current.isLoading).toBe(true);
    });

    it("should combine multiple loading states", () => {
      mockUseFormHandler.mockReturnValue({
        formData: {
          mainComplaint: "Test complaint",
          treatmentStatus: "T",
          startDate: "2024-01-15",
          returnWeeks: 1,
          food: "Light foods",
          water: "Drink plenty",
          ointments: "None",
          recommendations: {
            returnWeeks: 1,
            spiritualMedicalDischarge: false,
          },
          notes: "Test notes",
        },
        setFormData: jest.fn(),
        handleChange: jest.fn(),
        handleSubmit: jest.fn(),
        isLoading: true, // Form loading
        error: null,
        clearError: jest.fn(),
        setError: jest.fn(),
        resetForm: jest.fn(),
      });

      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing patientId", () => {
      mockUsePostAttendanceModal.mockReturnValue({
        isOpen: true,
        attendanceId: 1,
        // No patientId provided
        currentTreatmentStatus: "T",
        isLoading: false,
        onComplete: mockOnComplete,
      });

      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      // Should not crash and should not call getPatientById
      expect(result.current).toBeDefined();
      expect(mockGetPatientById).not.toHaveBeenCalled();
    });

    it("should handle missing attendanceId", () => {
      mockUsePostAttendanceModal.mockReturnValue({
        isOpen: true,
        // No attendanceId provided
        patientId: 1,
        currentTreatmentStatus: "T",
        isLoading: false,
        onComplete: mockOnComplete,
      });

      renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      // Should not crash
      expect(true).toBe(true);
    });
  });

  describe("Form Handler Integration", () => {
    it("should integrate with form handler correctly", () => {
      renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      // Verify form handler was called with expected parameters
      expect(mockUseFormHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          initialState: expect.objectContaining({
            mainComplaint: expect.any(String),
            treatmentStatus: expect.any(String),
            startDate: expect.any(String),
          }),
          onSubmit: expect.any(Function),
          validate: expect.any(Function),
        })
      );
    });

    it("should provide form change handlers", () => {
      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      expect(result.current.handleRecommendationsChange).toBeDefined();
      expect(result.current.handleDateChange).toBeDefined();
      expect(typeof result.current.handleRecommendationsChange).toBe(
        "function"
      );
      expect(typeof result.current.handleDateChange).toBe("function");
    });
  });

  describe("Data State", () => {
    it("should provide patient data state", () => {
      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      expect(result.current.patientData).toBeDefined();
      expect(result.current.fetchingPatient).toBeDefined();
      expect(result.current.setFetchError).toBeDefined();
    });

    it("should provide current treatment status", () => {
      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      expect(result.current.currentTreatmentStatus).toBe("T");
    });
  });

  describe("Error States", () => {
    it("should provide error management functions", () => {
      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.clearError).toBeDefined();
      expect(result.current.sessionErrors).toBeDefined();
      expect(result.current.showErrors).toBeDefined();
    });
  });

  describe("Session Management", () => {
    it("should provide session management state", () => {
      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      expect(result.current.createdSessions).toBeDefined();
      expect(result.current.showConfirmation).toBeDefined();
      expect(result.current.resetConfirmation).toBeDefined();
      expect(Array.isArray(result.current.createdSessions)).toBe(true);
    });
  });

  describe("Form Validation", () => {
    beforeEach(() => {
      // Mock form handler with validation function accessible
      const mockValidationFn = jest.fn();
      mockUseFormHandler.mockImplementation(
        (config: {
          validate?: (data: SpiritualTreatmentData) => string | null;
        }) => {
          // Call validation function to test it
          if (config.validate) {
            mockValidationFn.mockImplementation(config.validate);
          }

          return {
            formData: {
              mainComplaint: "Test complaint",
              treatmentStatus: "T",
              startDate: "2024-01-15",
              returnWeeks: 1,
              food: "Light foods",
              water: "Drink plenty",
              ointments: "None",
              recommendations: {
                returnWeeks: 1,
                spiritualMedicalDischarge: false,
              },
              notes: "Test notes",
            },
            setFormData: jest.fn(),
            handleChange: jest.fn(),
            handleSubmit: jest.fn(),
            isLoading: false,
            error: null,
            clearError: jest.fn(),
            setError: jest.fn(),
            resetForm: jest.fn(),
            validate: mockValidationFn,
          };
        }
      );
    });

    it("should validate main complaint is required", () => {
      renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      const mockFormHandler = mockUseFormHandler.mock.calls[0][0];
      const validationResult = mockFormHandler.validate({
        mainComplaint: "",
        treatmentStatus: "T",
        startDate: "2024-01-15",
        returnWeeks: 1,
        recommendations: { returnWeeks: 1, spiritualMedicalDischarge: false },
        food: "",
        water: "",
        ointments: "",
        notes: "",
      });

      expect(validationResult).toBe("Principal queixa é obrigatória");
    });

    it("should validate return weeks range", () => {
      renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      const mockFormHandler = mockUseFormHandler.mock.calls[0][0];

      // Test too low
      const lowWeeksResult = mockFormHandler.validate({
        mainComplaint: "Test complaint",
        treatmentStatus: "T",
        startDate: "2024-01-15",
        returnWeeks: 0,
        recommendations: { returnWeeks: 0, spiritualMedicalDischarge: false },
        food: "",
        water: "",
        ointments: "",
        notes: "",
      });
      expect(lowWeeksResult).toBe(
        "Semanas para retorno deve estar entre 1 e 52"
      );

      // Test too high
      const highWeeksResult = mockFormHandler.validate({
        mainComplaint: "Test complaint",
        treatmentStatus: "T",
        startDate: "2024-01-15",
        returnWeeks: 53,
        recommendations: { returnWeeks: 53, spiritualMedicalDischarge: false },
        food: "",
        water: "",
        ointments: "",
        notes: "",
      });
      expect(highWeeksResult).toBe(
        "Semanas para retorno deve estar entre 1 e 52"
      );
    });

    it("should validate future start dates are not allowed", () => {
      renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      const mockFormHandler = mockUseFormHandler.mock.calls[0][0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const futureDateString = futureDate.toISOString().split("T")[0];

      const validationResult = mockFormHandler.validate({
        mainComplaint: "Test complaint",
        treatmentStatus: "T",
        startDate: futureDateString,
        returnWeeks: 1,
        recommendations: { returnWeeks: 1, spiritualMedicalDischarge: false },
        food: "",
        water: "",
        ointments: "",
        notes: "",
      });

      expect(validationResult).toBe("Data de início não pode ser futura");
    });

    it("should validate light bath treatments", () => {
      renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      const mockFormHandler = mockUseFormHandler.mock.calls[0][0];

      // Test missing treatments
      const missingTreatmentsResult = mockFormHandler.validate({
        mainComplaint: "Test complaint",
        treatmentStatus: "T",
        startDate: "2024-01-15",
        returnWeeks: 1,
        recommendations: {
          returnWeeks: 1,
          spiritualMedicalDischarge: false,
          lightBath: { treatments: [] },
        },
        food: "",
        water: "",
        ointments: "",
        notes: "",
      });
      expect(missingTreatmentsResult).toBe(
        "Selecione pelo menos um local para o banho de luz"
      );

      // Test missing locations
      const missingLocationsResult = mockFormHandler.validate({
        mainComplaint: "Test complaint",
        treatmentStatus: "T",
        startDate: "2024-01-15",
        returnWeeks: 1,
        recommendations: {
          returnWeeks: 1,
          spiritualMedicalDischarge: false,
          lightBath: {
            treatments: [
              {
                locations: [],
                color: "Blue",
                duration: 2,
                quantity: 5,
                startDate: "2024-01-15",
              },
            ],
          },
        },
        food: "",
        water: "",
        ointments: "",
        notes: "",
      });
      expect(missingLocationsResult).toBe(
        "Todos os locais do banho de luz devem ser especificados"
      );

      // Test missing color
      const missingColorResult = mockFormHandler.validate({
        mainComplaint: "Test complaint",
        treatmentStatus: "T",
        startDate: "2024-01-15",
        returnWeeks: 1,
        recommendations: {
          returnWeeks: 1,
          spiritualMedicalDischarge: false,
          lightBath: {
            treatments: [
              {
                locations: ["Head"],
                color: "",
                duration: 2,
                quantity: 5,
                startDate: "2024-01-15",
              },
            ],
          },
        },
        food: "",
        water: "",
        ointments: "",
        notes: "",
      });
      expect(missingColorResult).toBe(
        "Cor do banho de luz é obrigatória para todos os locais"
      );
    });

    it("should validate rod treatments", () => {
      renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      const mockFormHandler = mockUseFormHandler.mock.calls[0][0];

      // Test missing treatments
      const missingTreatmentsResult = mockFormHandler.validate({
        mainComplaint: "Test complaint",
        treatmentStatus: "T",
        startDate: "2024-01-15",
        returnWeeks: 1,
        recommendations: {
          returnWeeks: 1,
          spiritualMedicalDischarge: false,
          rod: { treatments: [] },
        },
        food: "",
        water: "",
        ointments: "",
        notes: "",
      });
      expect(missingTreatmentsResult).toBe(
        "Selecione pelo menos um local para o tratamento com bastão"
      );

      // Test invalid quantity
      const invalidQuantityResult = mockFormHandler.validate({
        mainComplaint: "Test complaint",
        treatmentStatus: "T",
        startDate: "2024-01-15",
        returnWeeks: 1,
        recommendations: {
          returnWeeks: 1,
          spiritualMedicalDischarge: false,
          rod: {
            treatments: [
              { locations: ["Head"], quantity: 25, startDate: "2024-01-15" },
            ],
          },
        },
        food: "",
        water: "",
        ointments: "",
        notes: "",
      });
      expect(invalidQuantityResult).toBe(
        "Quantidade de tratamentos com bastão deve estar entre 1 e 20"
      );
    });
  });

  describe("Treatment Session Creation", () => {
    beforeEach(() => {
      // Reset mocks and ensure attendanceId and patientId are available
      mockUsePostAttendanceModal.mockReturnValue({
        isOpen: true,
        attendanceId: 1,
        patientId: 1,
        currentTreatmentStatus: "T",
        isLoading: false,
        onComplete: mockOnComplete,
      });

      mockSubmitTreatmentRecord.mockResolvedValue({
        treatmentRecordId: 123,
        success: true,
      });
    });

    it("should create light bath treatment sessions successfully", async () => {
      renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      const testData = {
        mainComplaint: "Test complaint",
        treatmentStatus: "T" as const,
        startDate: "2024-01-15",
        returnWeeks: 1,
        food: "",
        water: "",
        ointments: "",
        notes: "",
        recommendations: {
          returnWeeks: 1,
          spiritualMedicalDischarge: false,
          lightBath: {
            treatments: [
              {
                locations: ["Head", "Chest"],
                color: "Blue",
                duration: 2,
                quantity: 5,
                startDate: "2024-01-15",
              },
            ],
          },
        },
      };

      const mockFormHandler = mockUseFormHandler.mock.calls[0][0];

      await act(async () => {
        await mockFormHandler.onSubmit(testData);
      });

      // Should have called spiritual treatment submission
      expect(mockSubmitTreatmentRecord).toHaveBeenCalledWith(testData, 1);

      // Should have created 2 treatment sessions (one per location)
      expect(mockCreateTreatmentSession).toHaveBeenCalledTimes(2);
      expect(mockCreateTreatmentSession).toHaveBeenCalledWith(
        expect.objectContaining({
          treatment_record_id: 123,
          treatment_type: "light_bath",
          body_location: "Head",
          color: "Blue",
          duration_minutes: 2,
        })
      );
      expect(mockCreateTreatmentSession).toHaveBeenCalledWith(
        expect.objectContaining({
          treatment_record_id: 123,
          treatment_type: "light_bath",
          body_location: "Chest",
          color: "Blue",
          duration_minutes: 2,
        })
      );
    });

    it("should create rod treatment sessions successfully", async () => {
      renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      const testData = {
        mainComplaint: "Test complaint",
        treatmentStatus: "T" as const,
        startDate: "2024-01-15",
        returnWeeks: 1,
        food: "",
        water: "",
        ointments: "",
        notes: "",
        recommendations: {
          returnWeeks: 1,
          spiritualMedicalDischarge: false,
          rod: {
            treatments: [
              {
                locations: ["Back", "Legs"],
                quantity: 3,
                startDate: "2024-01-15",
              },
            ],
          },
        },
      };

      const mockFormHandler = mockUseFormHandler.mock.calls[0][0];

      await act(async () => {
        await mockFormHandler.onSubmit(testData);
      });

      // Should have created 2 treatment sessions (one per location)
      expect(mockCreateTreatmentSession).toHaveBeenCalledTimes(2);
      expect(mockCreateTreatmentSession).toHaveBeenCalledWith(
        expect.objectContaining({
          treatment_record_id: 123,
          treatment_type: "rod",
          body_location: "Back",
        })
      );
    });

    it("should handle treatment session creation errors", async () => {
      mockCreateTreatmentSession.mockResolvedValue({
        success: false,
        error: "Session creation failed",
      });

      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      const testData = {
        mainComplaint: "Test complaint",
        treatmentStatus: "T" as const,
        startDate: "2024-01-15",
        returnWeeks: 1,
        food: "",
        water: "",
        ointments: "",
        notes: "",
        recommendations: {
          returnWeeks: 1,
          spiritualMedicalDischarge: false,
          lightBath: {
            treatments: [
              {
                locations: ["Head"],
                color: "Blue",
                duration: 2,
                quantity: 5,
                startDate: "2024-01-15",
              },
            ],
          },
        },
      };

      const mockFormHandler = mockUseFormHandler.mock.calls[0][0];

      await act(async () => {
        await mockFormHandler.onSubmit(testData);
      });

      // Should show errors
      expect(result.current.showErrors).toBe(true);
      expect(result.current.sessionErrors).toHaveLength(1);
      expect(result.current.sessionErrors[0].treatment_type).toBe("light_bath");
      expect(result.current.sessionErrors[0].errors[0]).toContain(
        "Session creation failed"
      );
    });

    it("should handle validation errors before creating sessions", async () => {
      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      const testData = {
        mainComplaint: "Test complaint",
        treatmentStatus: "T" as const,
        startDate: "2024-01-15",
        returnWeeks: 1,
        food: "",
        water: "",
        ointments: "",
        notes: "",
        recommendations: {
          returnWeeks: 1,
          spiritualMedicalDischarge: false,
          lightBath: {
            treatments: [
              {
                locations: ["Head"],
                color: "Blue",
                duration: 15, // Invalid duration > 10
                quantity: 5,
                startDate: "2024-01-15",
              },
            ],
          },
        },
      };

      const mockFormHandler = mockUseFormHandler.mock.calls[0][0];

      await act(async () => {
        await mockFormHandler.onSubmit(testData);
      });

      // Should not create any sessions due to validation error
      expect(mockCreateTreatmentSession).not.toHaveBeenCalled();
      expect(result.current.showErrors).toBe(true);
      expect(result.current.sessionErrors[0].errors[0]).toContain(
        "Duração deve ser entre 1 e 10"
      );
    });

    it("should handle missing attendanceId or patientId", async () => {
      mockUsePostAttendanceModal.mockReturnValue({
        isOpen: true,
        // Missing attendanceId and patientId
        currentTreatmentStatus: "T",
        isLoading: false,
        onComplete: mockOnComplete,
      });

      renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      const testData = {
        mainComplaint: "Test complaint",
        treatmentStatus: "T" as const,
        startDate: "2024-01-15",
        returnWeeks: 1,
        food: "",
        water: "",
        ointments: "",
        notes: "",
        recommendations: {
          returnWeeks: 1,
          spiritualMedicalDischarge: false,
          lightBath: {
            treatments: [
              {
                locations: ["Head"],
                color: "Blue",
                duration: 2,
                quantity: 5,
                startDate: "2024-01-15",
              },
            ],
          },
        },
      };

      const mockFormHandler = mockUseFormHandler.mock.calls[0][0];

      await act(async () => {
        try {
          await mockFormHandler.onSubmit(testData);
        } catch (error) {
          expect((error as Error).message).toBe(
            "Attendance ID is required for treatment submission"
          );
        }
      });
    });
  });

  describe("Error Parsing", () => {
    it("should parse structured error details", async () => {
      // Ensure spiritual treatment submission succeeds
      mockSubmitTreatmentRecord.mockResolvedValue({
        treatmentRecordId: 123,
        success: true,
      });

      const structuredError = new Error("Multiple errors");
      (
        structuredError as Error & {
          errorDetails: {
            lightBathErrors: string[];
            rodErrors: string[];
            allErrors: string[];
          };
        }
      ).errorDetails = {
        lightBathErrors: ["Light bath error 1", "Light bath error 2"],
        rodErrors: ["Rod error 1"],
        allErrors: ["Light bath error 1", "Light bath error 2", "Rod error 1"],
      };

      mockCreateTreatmentSession.mockRejectedValue(structuredError);

      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      const testData = {
        mainComplaint: "Test complaint",
        treatmentStatus: "T" as const,
        startDate: "2024-01-15",
        returnWeeks: 1,
        food: "",
        water: "",
        ointments: "",
        notes: "",
        recommendations: {
          returnWeeks: 1,
          spiritualMedicalDischarge: false,
          lightBath: {
            treatments: [
              {
                locations: ["Head"],
                color: "Blue",
                duration: 2,
                quantity: 5,
                startDate: "2024-01-15",
              },
            ],
          },
        },
      };

      const mockFormHandler = mockUseFormHandler.mock.calls[0][0];

      await act(async () => {
        await mockFormHandler.onSubmit(testData);
      });

      expect(result.current.sessionErrors).toHaveLength(1);
      expect(result.current.sessionErrors[0].treatment_type).toBe("light_bath");
      // The error message should contain the original error message
      expect(result.current.sessionErrors[0].errors[0]).toContain(
        "Multiple errors"
      );
    });

    it("should parse validation error messages", async () => {
      // Ensure spiritual treatment submission succeeds
      mockSubmitTreatmentRecord.mockResolvedValue({
        treatmentRecordId: 123,
        success: true,
      });

      const validationError = new Error(
        "duration_minutes must not be greater than 10"
      );
      mockCreateTreatmentSession.mockRejectedValue(validationError);

      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      const testData = {
        mainComplaint: "Test complaint",
        treatmentStatus: "T" as const,
        startDate: "2024-01-15",
        returnWeeks: 1,
        food: "",
        water: "",
        ointments: "",
        notes: "",
        recommendations: {
          returnWeeks: 1,
          spiritualMedicalDischarge: false,
          lightBath: {
            treatments: [
              {
                locations: ["Head"],
                color: "Blue",
                duration: 2,
                quantity: 5,
                startDate: "2024-01-15",
              },
            ],
          },
        },
      };

      const mockFormHandler = mockUseFormHandler.mock.calls[0][0];

      await act(async () => {
        await mockFormHandler.onSubmit(testData);
      });

      expect(result.current.sessionErrors[0].errors[0]).toContain(
        "duration_minutes must not be greater than 10"
      );
    });
  });

  describe("Change Handlers", () => {
    it("should handle recommendations change", () => {
      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      const newRecommendations = {
        returnWeeks: 2,
        spiritualMedicalDischarge: true,
        lightBath: {
          startDate: "2024-01-15",
          treatments: [
            {
              locations: ["Head"],
              color: "Blue",
              duration: 2,
              quantity: 5,
              startDate: "2024-01-15",
            },
          ],
        },
      };

      act(() => {
        result.current.handleRecommendationsChange(newRecommendations);
      });

      expect(mockUseFormHandler().setFormData).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it("should handle date change", () => {
      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      const mockEvent = {
        target: { value: "2024-02-01" },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleDateChange("startDate")(mockEvent);
      });

      expect(mockUseFormHandler().setFormData).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it("should handle empty date change with today fallback", () => {
      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      const mockEvent = {
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleDateChange("startDate")(mockEvent);
      });

      expect(mockUseFormHandler().setFormData).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });
  });

  describe("Effect Handlers", () => {
    it("should update form data when patient data is loaded", async () => {
      const mockPatientData = {
        id: 1,
        name: "Test Patient",
        email: "test@example.com",
        phone: "11999999999",
        main_complaint: "Updated complaint",
        start_date: "2024-01-10",
        priority: 2,
        treatment_status: "T",
        missing_appointments_streak: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockGetPatientById.mockResolvedValue({
        success: true,
        value: mockPatientData,
      });

      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      // Wait for patient data to load and form to update
      await waitFor(() => {
        expect(result.current.patientData).toEqual(mockPatientData);
      });

      expect(mockUseFormHandler().setFormData).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it("should set today's date for new patients", async () => {
      mockUsePostAttendanceModal.mockReturnValue({
        isOpen: true,
        attendanceId: 1,
        patientId: 1,
        currentTreatmentStatus: "N", // New patient
        isLoading: false,
        onComplete: mockOnComplete,
      });

      const mockPatientData = {
        id: 1,
        name: "New Patient",
        email: "new@example.com",
        phone: "11999999999",
        main_complaint: "New complaint",
        start_date: null, // New patient has no start date
        priority: 2,
        treatment_status: "N",
        missing_appointments_streak: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockGetPatientById.mockResolvedValue({
        success: true,
        value: mockPatientData,
      });

      renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      await waitFor(() => {
        expect(mockUseFormHandler().setFormData).toHaveBeenCalledWith(
          expect.any(Function)
        );
      });
    });
  });

  describe("Reset Functions", () => {
    it("should reset confirmation state", () => {
      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      // Simulate some confirmation state
      act(() => {
        result.current.resetConfirmation();
      });

      expect(result.current.showConfirmation).toBe(false);
      expect(result.current.createdSessions).toEqual([]);
    });

    it("should reset error state", () => {
      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.resetErrors();
      });

      expect(result.current.showErrors).toBe(false);
      expect(result.current.sessionErrors).toEqual([]);
    });

    it("should retry session creation", () => {
      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.retrySessionCreation();
      });

      expect(result.current.showErrors).toBe(false);
      expect(result.current.sessionErrors).toEqual([]);
    });
  });

  describe("Form Data Formatting", () => {
    it("should format return weeks with bounds", () => {
      mockUseFormHandler.mockImplementation(
        (config: {
          formatters?: { returnWeeks?: (value: unknown) => number };
        }) => {
          // Test the formatters
          if (config.formatters?.returnWeeks) {
            const formattedLow = config.formatters.returnWeeks(-5);
            const formattedHigh = config.formatters.returnWeeks(100);
            const formattedNormal = config.formatters.returnWeeks(10);

            expect(formattedLow).toBe(1);
            expect(formattedHigh).toBe(52);
            expect(formattedNormal).toBe(10);
          }

          return {
            formData: {
              mainComplaint: "",
              treatmentStatus: "T",
              startDate: "2024-01-15",
              returnWeeks: 1,
              food: "",
              water: "",
              ointments: "",
              recommendations: {
                returnWeeks: 1,
                spiritualMedicalDischarge: false,
              },
              notes: "",
            },
            setFormData: jest.fn(),
            handleChange: jest.fn(),
            handleSubmit: jest.fn(),
            isLoading: false,
            error: null,
            clearError: jest.fn(),
            setError: jest.fn(),
            resetForm: jest.fn(),
          };
        }
      );

      renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      expect(mockUseFormHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          formatters: expect.objectContaining({
            returnWeeks: expect.any(Function),
          }),
        })
      );
    });
  });

  // Additional tests to improve coverage
  describe("Error Parsing Edge Cases", () => {
    it("should handle parseSessionCreationErrors with missing recommendations structure", async () => {
      mockSubmitTreatmentRecord.mockResolvedValue({
        treatmentRecordId: 123,
        success: true,
      });

      // Create error that will trigger error parsing fallback
      const parseError = new Error("Parsing failed");
      mockCreateTreatmentSession.mockRejectedValue(parseError);

      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      const testData = {
        mainComplaint: "Test complaint",
        treatmentStatus: "T" as const,
        startDate: "2024-01-15",
        returnWeeks: 1,
        food: "",
        water: "",
        ointments: "",
        notes: "",
        recommendations: {
          returnWeeks: 1,
          spiritualMedicalDischarge: false,
          lightBath: {
            treatments: [
              {
                locations: ["Head"],
                color: "Blue",
                duration: 2,
                quantity: 5,
                startDate: "2024-01-15",
              },
            ],
          },
          rod: {
            treatments: [
              {
                locations: ["Back"],
                quantity: 3,
                startDate: "2024-01-15",
              },
            ],
          },
        },
      };

      const mockFormHandler = mockUseFormHandler.mock.calls[0][0];

      await act(async () => {
        await mockFormHandler.onSubmit(testData);
      });

      // Should create fallback error messages for both treatment types
      expect(result.current.sessionErrors).toHaveLength(2);
      const lightBathError = result.current.sessionErrors.find(
        (e) => e.treatment_type === "light_bath"
      );
      const rodError = result.current.sessionErrors.find(
        (e) => e.treatment_type === "rod"
      );

      expect(lightBathError?.errors[0]).toContain("Parsing failed");
      expect(rodError?.errors[0]).toContain("Parsing failed");
    });

    it("should handle rod session creation exceptions", async () => {
      mockSubmitTreatmentRecord.mockResolvedValue({
        treatmentRecordId: 123,
        success: true,
      });

      // Mock createTreatmentSession to succeed for light bath but fail for rod
      mockCreateTreatmentSession
        .mockResolvedValueOnce({ success: true, value: { id: 1 } }) // Light bath success
        .mockRejectedValueOnce(new Error("Rod creation exception")); // Rod exception

      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      const testData = {
        mainComplaint: "Test complaint",
        treatmentStatus: "T" as const,
        startDate: "2024-01-15",
        returnWeeks: 1,
        food: "",
        water: "",
        ointments: "",
        notes: "",
        recommendations: {
          returnWeeks: 1,
          spiritualMedicalDischarge: false,
          lightBath: {
            treatments: [
              {
                locations: ["Head"],
                color: "Blue",
                duration: 2,
                quantity: 5,
                startDate: "2024-01-15",
              },
            ],
          },
          rod: {
            treatments: [
              {
                locations: ["Back"],
                quantity: 3,
                startDate: "2024-01-15",
              },
            ],
          },
        },
      };

      const mockFormHandler = mockUseFormHandler.mock.calls[0][0];

      await act(async () => {
        await mockFormHandler.onSubmit(testData);
      });

      // Should show errors instead of successful creations due to exception during treatment session creation
      expect(result.current.sessionErrors).toHaveLength(1);
      expect(result.current.sessionErrors[0].treatment_type).toBe("rod");
      expect(result.current.sessionErrors[0].errors[0]).toContain(
        "Rod creation exception"
      );
      expect(result.current.showErrors).toBe(true);
      expect(result.current.showConfirmation).toBe(false);
    });

    it("should handle successful session creation with confirmation display", async () => {
      mockSubmitTreatmentRecord.mockResolvedValue({
        treatmentRecordId: 123,
        success: true,
      });

      mockCreateTreatmentSession.mockResolvedValue({
        success: true,
        value: { id: 456 },
      });

      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      const testData = {
        mainComplaint: "Test complaint",
        treatmentStatus: "T" as const,
        startDate: "2024-01-15",
        returnWeeks: 1,
        food: "",
        water: "",
        ointments: "",
        notes: "",
        recommendations: {
          returnWeeks: 1,
          spiritualMedicalDischarge: false,
          lightBath: {
            treatments: [
              {
                locations: ["Head", "Chest"],
                color: "Blue",
                duration: 2,
                quantity: 5,
                startDate: "2024-01-15",
              },
            ],
          },
        },
      };

      const mockFormHandler = mockUseFormHandler.mock.calls[0][0];

      await act(async () => {
        await mockFormHandler.onSubmit(testData);
      });

      // Should show confirmation dialog with created sessions
      expect(result.current.showConfirmation).toBe(true);
      expect(result.current.createdSessions).toHaveLength(2);
      expect(result.current.createdSessions[0].body_location).toBe("Head");
      expect(result.current.createdSessions[1].body_location).toBe("Chest");

      // Should call onComplete callback
      expect(mockOnComplete).toHaveBeenCalled();
    });

    it("should handle mixed successful and failed session creation", async () => {
      mockSubmitTreatmentRecord.mockResolvedValue({
        treatmentRecordId: 123,
        success: true,
      });

      // First location succeeds, second fails
      mockCreateTreatmentSession
        .mockResolvedValueOnce({ success: true, value: { id: 456 } })
        .mockResolvedValueOnce({
          success: false,
          error: "Second location failed",
        });

      const { result } = renderHook(() => usePostAttendanceForm(), {
        wrapper: TestWrapper,
      });

      const testData = {
        mainComplaint: "Test complaint",
        treatmentStatus: "T" as const,
        startDate: "2024-01-15",
        returnWeeks: 1,
        food: "",
        water: "",
        ointments: "",
        notes: "",
        recommendations: {
          returnWeeks: 1,
          spiritualMedicalDischarge: false,
          lightBath: {
            treatments: [
              {
                locations: ["Head", "Chest"],
                color: "Blue",
                duration: 2,
                quantity: 5,
                startDate: "2024-01-15",
              },
            ],
          },
        },
      };

      const mockFormHandler = mockUseFormHandler.mock.calls[0][0];

      await act(async () => {
        await mockFormHandler.onSubmit(testData);
      });

      // Should show errors due to partial failure (when any session creation fails, entire operation shows errors)
      expect(result.current.sessionErrors).toHaveLength(1);
      expect(result.current.sessionErrors[0].errors[0]).toContain(
        "Second location failed"
      );
      expect(result.current.showErrors).toBe(true);
      expect(result.current.showConfirmation).toBe(false);
    });
  });
});
