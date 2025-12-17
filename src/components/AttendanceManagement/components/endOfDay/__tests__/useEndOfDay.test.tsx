import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEndOfDay } from "../useEndOfDay";
import { ReactNode } from "react";

// Mock the useAttendanceData hook
const mockUseAttendanceData = jest.fn();
jest.mock("../../../hooks", () => ({
  useAttendanceData: () => mockUseAttendanceData(),
}));

jest.mock("@/hooks/useAttendanceQueries", () => ({
  useHandleAbsenceJustifications: jest.fn(() => ({
    mutateAsync: jest.fn(),
  })),
}));

jest.mock("@/stores/modalStore", () => ({
  useCloseModal: jest.fn(() => jest.fn()),
}));

jest.mock("@/stores", () => ({
  useSetDayFinalized: jest.fn(() => jest.fn()),
}));

jest.mock("@/api/attendances", () => ({
  markAttendanceAsMissed: jest.fn(() => Promise.resolve({ success: true })),
}));

describe("useEndOfDay", () => {
  const mockOnHandleCompletion = jest.fn();
  const mockOnReschedule = jest.fn();

  const defaultProps = {
    onHandleCompletion: mockOnHandleCompletion,
    onReschedule: mockOnReschedule,
  };

  // Create a test wrapper with QueryClient
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const TestWrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    return TestWrapper;
  };

  const renderHookWithWrapper = (props = defaultProps) => {
    return renderHook(() => useEndOfDay(props), {
      wrapper: createWrapper(),
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock - no data
    mockUseAttendanceData.mockReturnValue({
      attendancesByDate: null,
      refreshData: jest.fn(),
    });
  });

  it("initializes with correct default values", () => {
    const { result } = renderHookWithWrapper();

    expect(result.current.currentStep).toBe("incomplete");
    expect(result.current.absenceJustifications).toEqual([]);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.canProceedFromIncomplete).toBe(true);
    expect(result.current.canProceedFromAbsences).toBe(true);
  });

  it("advances to next step from incomplete", () => {
    const { result } = renderHookWithWrapper();

    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentStep).toBe("absences");
  });

  it("advances to next step from absences", () => {
    const { result } = renderHookWithWrapper();

    // First go to absences step
    act(() => {
      result.current.handleNext();
    });

    // Then go to confirm step
    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentStep).toBe("confirm");
  });

  it("goes back to previous step from absences", () => {
    const { result } = renderHookWithWrapper();

    // Go to absences step first
    act(() => {
      result.current.handleNext();
    });

    // Then go back
    act(() => {
      result.current.handleBack();
    });

    expect(result.current.currentStep).toBe("incomplete");
  });

  it("handles completion callback", () => {
    const { result } = renderHookWithWrapper();

    act(() => {
      result.current.handleCompletion(123);
    });

    expect(mockOnHandleCompletion).toHaveBeenCalledWith(123);
  });

  it("handles form submission", async () => {
    const { result } = renderHookWithWrapper();

    await act(async () => {
      await result.current.handleSubmit();
    });

    // Check that the form was submitted (the hook handles submission internally)
    expect(result.current.isSubmitting).toBe(false);
  });

  describe("Navigation Logic", () => {
    it("does not go beyond confirm step", () => {
      const { result } = renderHookWithWrapper();

      // Start at incomplete step
      expect(result.current.currentStep).toBe("incomplete");

      // Navigate to absences step
      act(() => {
        result.current.handleNext();
      });

      expect(result.current.currentStep).toBe("absences");

      // Navigate to confirm step
      act(() => {
        result.current.handleNext();
      });

      expect(result.current.currentStep).toBe("confirm");

      // Try to go beyond - should stay on confirm step
      act(() => {
        result.current.handleNext();
      });

      expect(result.current.currentStep).toBe("confirm");
    });

    it("goes back from confirm to absences", () => {
      const { result } = renderHookWithWrapper();

      // Navigate to confirm step
      act(() => {
        result.current.handleNext(); // incomplete -> absences
      });
      expect(result.current.currentStep).toBe("absences");

      act(() => {
        result.current.handleNext(); // absences -> confirm
      });
      expect(result.current.currentStep).toBe("confirm");

      // Go back
      act(() => {
        result.current.handleBack();
      });

      expect(result.current.currentStep).toBe("absences");
    });

    it("does not go beyond incomplete step when going back", () => {
      const { result } = renderHookWithWrapper();

      // Try to go back from initial state
      act(() => {
        result.current.handleBack();
      });

      // Should stay on incomplete step
      expect(result.current.currentStep).toBe("incomplete");
    });
  });

  describe("Data Processing", () => {
    it("processes incomplete attendances correctly", () => {
      const mockAttendancesByDate = {
        spiritual: {
          checkedIn: [{ id: 1, patientName: "Patient 1" }],
          onGoing: [{ id: 2, patientName: "Patient 2" }],
        },
        lightBath: {
          checkedIn: [],
          onGoing: [],
        },
      };

      mockUseAttendanceData.mockReturnValue({
        attendancesByDate: mockAttendancesByDate,
        refreshData: jest.fn(),
      });

      const { result } = renderHookWithWrapper();

      expect(result.current.incompleteAttendances).toHaveLength(2);
      expect(result.current.canProceedFromIncomplete).toBe(false);
    });

    it("processes scheduled absences correctly", () => {
      const mockAttendancesByDate = {
        spiritual: {
          scheduled: [
            { id: 1, name: "Absent Patient 1", patientId: 1, attendanceId: 10 },
            { id: 2, name: "Absent Patient 2", patientId: 2, attendanceId: 11 },
          ],
        },
        lightBath: {
          scheduled: [],
        },
      };

      mockUseAttendanceData.mockReturnValue({
        attendancesByDate: mockAttendancesByDate,
        refreshData: jest.fn(),
      });

      const { result } = renderHookWithWrapper();

      expect(result.current.scheduledAbsences).toHaveLength(2);
      expect(result.current.scheduledAbsences[0]).toEqual({
        patientId: 1,
        patientName: "Absent Patient 1",
        attendanceType: "spiritual",
      });
    });
  });

  describe("Justification Handling", () => {
    it("updates justification correctly", () => {
      const mockAttendancesByDate = {
        spiritual: {
          scheduled: [
            {
              id: 1,
              patientName: "Absent Patient",
              patientId: 1,
              attendanceId: 10,
            },
          ],
        },
        lightBath: {
          scheduled: [],
        },
      };

      mockUseAttendanceData.mockReturnValue({
        attendancesByDate: mockAttendancesByDate,
        refreshData: jest.fn(),
      });

      const { result } = renderHookWithWrapper();

      act(() => {
        result.current.handleJustificationChange(
          1,
          "spiritual",
          true,
          "Patient was sick"
        );
      });

      const justification = result.current.absenceJustifications.find(
        (j) => j.patientId === 1 && j.attendanceType === "spiritual"
      );

      expect(justification?.justified).toBe(true);
      expect(justification?.justification).toBe("Patient was sick");
    });

    it("handles justification for non-existent patient", () => {
      const { result } = renderHookWithWrapper();

      // This should not crash even if patient doesn't exist
      act(() => {
        result.current.handleJustificationChange(
          999,
          "spiritual",
          true,
          "Doesn't exist"
        );
      });

      // Should not have any justifications since patient doesn't exist
      expect(result.current.absenceJustifications).toEqual([]);
    });
  });

  describe("Proceed Conditions", () => {
    it("blocks proceeding from incomplete when there are incomplete attendances", () => {
      const mockAttendancesByDate = {
        spiritual: {
          checkedIn: [{ id: 1, patientName: "Patient 1" }],
          onGoing: [],
        },
        lightBath: {
          checkedIn: [],
          onGoing: [],
        },
      };

      mockUseAttendanceData.mockReturnValue({
        attendancesByDate: mockAttendancesByDate,
        refreshData: jest.fn(),
      });

      const { result } = renderHookWithWrapper();

      expect(result.current.canProceedFromIncomplete).toBe(false);
    });

    it("allows proceeding from absences when all absences are justified", () => {
      const mockAttendancesByDate = {
        spiritual: {
          scheduled: [
            { id: 1, patientName: "Patient 1", patientId: 1, attendanceId: 10 },
          ],
        },
        lightBath: {
          scheduled: [],
        },
      };

      mockUseAttendanceData.mockReturnValue({
        attendancesByDate: mockAttendancesByDate,
        refreshData: jest.fn(),
      });

      const { result } = renderHookWithWrapper();

      // Initially blocked because no justifications provided
      expect(result.current.canProceedFromAbsences).toBe(false);

      // Add justification
      act(() => {
        result.current.handleJustificationChange(
          1,
          "spiritual",
          true,
          "Justified"
        );
      });

      // Now should be able to proceed
      expect(result.current.canProceedFromAbsences).toBe(true);
    });

    it("allows proceeding from absences when no absences exist", () => {
      const mockAttendancesByDate = {
        spiritual: { scheduled: [] },
        lightBath: { scheduled: [] },
      };

      mockUseAttendanceData.mockReturnValue({
        attendancesByDate: mockAttendancesByDate,
        refreshData: jest.fn(),
      });

      const { result } = renderHookWithWrapper();

      expect(result.current.canProceedFromAbsences).toBe(true);
    });
  });

  describe("Form Submission", () => {
    it("sets submitting state correctly during submission", async () => {
      const { result } = renderHookWithWrapper();

      const submitPromise = act(async () => {
        await result.current.handleSubmit();
      });

      // During submission (if we could catch it), isSubmitting would be true
      // After submission completes
      await submitPromise;
      expect(result.current.isSubmitting).toBe(false);
    });

    it("handles submission with scheduled absences", async () => {
      const mockAttendancesByDate = {
        spiritual: {
          scheduled: [
            { id: 1, patientName: "Patient 1", patientId: 1, attendanceId: 10 },
          ],
        },
        lightBath: {
          scheduled: [],
        },
      };
      const markAttendanceAsMissed =
        jest.requireMock("@/api/attendances").markAttendanceAsMissed;

      mockUseAttendanceData.mockReturnValue({
        attendancesByDate: mockAttendancesByDate,
        refreshData: jest.fn(),
      });

      const { result } = renderHookWithWrapper();

      // Add justification
      act(() => {
        result.current.handleJustificationChange(
          1,
          "spiritual",
          true,
          "Patient was sick"
        );
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(markAttendanceAsMissed).toHaveBeenCalledWith(
        "10",
        true,
        "Patient was sick"
      );
    });

    it("handles submission errors gracefully", async () => {
      const markAttendanceAsMissed =
        jest.requireMock("@/api/attendances").markAttendanceAsMissed;
      markAttendanceAsMissed.mockRejectedValue(new Error("Network error"));

      const mockAttendancesByDate = {
        spiritual: {
          scheduled: [
            { id: 1, patientName: "Patient 1", patientId: 1, attendanceId: 10 },
          ],
        },
        lightBath: {
          scheduled: [],
        },
      };

      mockUseAttendanceData.mockReturnValue({
        attendancesByDate: mockAttendancesByDate,
        refreshData: jest.fn(),
      });

      const { result } = renderHookWithWrapper();

      await act(async () => {
        try {
          await result.current.handleSubmit();
        } catch (error) {
          expect((error as Error).message).toBe("Network error");
        }
      });

      expect(result.current.isSubmitting).toBe(false);
    });

    it("handles absences without attendance IDs", async () => {
      const mockAttendancesByDate = {
        spiritual: {
          scheduled: [
            { id: 1, patientName: "Patient 1", patientId: 1 }, // No attendanceId
          ],
        },
        lightBath: {
          scheduled: [],
        },
      };

      mockUseAttendanceData.mockReturnValue({
        attendancesByDate: mockAttendancesByDate,
        refreshData: jest.fn(),
      });

      const { result } = renderHookWithWrapper();

      // Should not crash when attendance ID is missing
      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe("Memoization and Performance", () => {
    it("memoizes attendance calculations correctly", () => {
      const mockAttendancesByDate = {
        spiritual: {
          checkedIn: [{ id: 1, patientName: "Patient 1" }],
          completed: [{ id: 2, patientName: "Patient 2" }],
          scheduled: [
            { id: 3, patientName: "Patient 3", patientId: 3, attendanceId: 13 },
          ],
        },
        lightBath: {
          checkedIn: [],
          completed: [],
          scheduled: [],
        },
      };

      mockUseAttendanceData.mockReturnValue({
        attendancesByDate: mockAttendancesByDate,
        refreshData: jest.fn(),
      });

      const { result, rerender } = renderHookWithWrapper();

      const initialIncomplete = result.current.incompleteAttendances;
      const initialCompleted = result.current.completedAttendances;
      const initialScheduled = result.current.scheduledAbsences;

      // Rerender with same data
      rerender();

      // References should be the same due to memoization
      expect(result.current.incompleteAttendances).toBe(initialIncomplete);
      expect(result.current.completedAttendances).toBe(initialCompleted);
      expect(result.current.scheduledAbsences).toBe(initialScheduled);
    });
  });

  describe("Error Boundaries", () => {
    it("handles null attendance data gracefully", () => {
      mockUseAttendanceData.mockReturnValue({
        attendancesByDate: null,
        refreshData: jest.fn(),
      });

      const { result } = renderHookWithWrapper();

      // Should not crash with null data
      expect(result.current.incompleteAttendances).toBeDefined();
      expect(result.current.completedAttendances).toBeDefined();
      expect(result.current.scheduledAbsences).toBeDefined();
    });

    it("handles undefined patient IDs in scheduled absences", () => {
      const mockAttendancesByDate = {
        spiritual: {
          scheduled: [
            {
              id: 1,
              patientName: "Patient 1",
              patientId: undefined,
              attendanceId: 10,
            },
          ],
        },
        lightBath: {
          scheduled: [],
        },
      };

      mockUseAttendanceData.mockReturnValue({
        attendancesByDate: mockAttendancesByDate,
        refreshData: jest.fn(),
      });

      const { result } = renderHookWithWrapper();

      expect(result.current.scheduledAbsences).toHaveLength(1);
      expect(result.current.scheduledAbsences[0].patientId).toBe(0);
    });
  });
});
