import { renderHook, act } from "@testing-library/react";
import { useEndOfDay } from "../useEndOfDay";
import type { IAttendanceStatusDetail } from "@/types/globals";

// Mock functions
const mockOnHandleCompletion = jest.fn();
const mockOnSubmitEndOfDay = jest.fn();

const createMockIncompleteAttendance = (
  overrides = {}
): IAttendanceStatusDetail => ({
  name: "Test Treatment",
  priority: "1" as const,
  patientId: 1,
  attendanceId: 1,
  ...overrides,
});

const createMockScheduledAbsence = (overrides = {}) => ({
  patientId: 1,
  patientName: "John Doe",
  attendanceType: "spiritual" as const,
  ...overrides,
});

describe("useEndOfDay", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    incompleteAttendances: [],
    scheduledAbsences: [],
    onHandleCompletion: mockOnHandleCompletion,
    onReschedule: jest.fn(),
    onSubmitEndOfDay: mockOnSubmitEndOfDay,
  };

  it("initializes with correct default values", () => {
    const { result } = renderHook(() => useEndOfDay(defaultProps));

    expect(result.current.currentStep).toBe("incomplete");
    expect(result.current.absenceJustifications).toEqual([]);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.canProceedFromIncomplete).toBe(true);
    expect(result.current.canProceedFromAbsences).toBe(true);
  });

  it("initializes absence justifications for scheduled absences", () => {
    const scheduledAbsences = [createMockScheduledAbsence()];
    const { result } = renderHook(() =>
      useEndOfDay({
        ...defaultProps,
        scheduledAbsences,
      })
    );

    expect(result.current.absenceJustifications).toHaveLength(1);
    expect(result.current.absenceJustifications[0]).toEqual({
      patientId: 1,
      patientName: "John Doe",
      attendanceType: "spiritual",
    });
  });

  it("advances to next step from incomplete", () => {
    const { result } = renderHook(() => useEndOfDay(defaultProps));

    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentStep).toBe("absences");
  });

  it("advances to next step from absences", () => {
    const { result } = renderHook(() => useEndOfDay(defaultProps));

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
    const { result } = renderHook(() => useEndOfDay(defaultProps));

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

  it("goes back to previous step from confirm", () => {
    const scheduledAbsences = [createMockScheduledAbsence()];
    const { result } = renderHook(() =>
      useEndOfDay({
        ...defaultProps,
        scheduledAbsences,
      })
    );

    // Should start at incomplete step
    expect(result.current.currentStep).toBe("incomplete");

    // Go to absences step
    act(() => {
      result.current.handleNext(); // incomplete -> absences
    });

    expect(result.current.currentStep).toBe("absences");

    // Justify the absence first
    act(() => {
      result.current.handleJustificationChange(1, "spiritual", true);
    });

    // Now go to confirm step
    act(() => {
      result.current.handleNext(); // absences -> confirm
    });

    expect(result.current.currentStep).toBe("confirm");

    // Then go back
    act(() => {
      result.current.handleBack(); // confirm -> absences
    });

    expect(result.current.currentStep).toBe("absences");
  });

  it("handles justification changes", () => {
    const scheduledAbsences = [createMockScheduledAbsence()];
    const { result } = renderHook(() =>
      useEndOfDay({
        ...defaultProps,
        scheduledAbsences,
      })
    );

    act(() => {
      result.current.handleJustificationChange(
        1,
        "spiritual",
        true,
        "Medical appointment"
      );
    });

    expect(result.current.absenceJustifications[0]).toEqual({
      patientId: 1,
      patientName: "John Doe",
      attendanceType: "spiritual",
      justified: true,
      justification: "Medical appointment",
    });
  });

  it("validates step progression with incomplete attendances", () => {
    const incompleteAttendances = [createMockIncompleteAttendance()];
    const { result } = renderHook(() =>
      useEndOfDay({
        ...defaultProps,
        incompleteAttendances,
      })
    );

    // Should not be able to proceed from incomplete when there are incomplete attendances
    expect(result.current.canProceedFromIncomplete).toBe(false);
  });

  it("validates step progression with scheduled absences", () => {
    const scheduledAbsences = [createMockScheduledAbsence()];
    const { result } = renderHook(() =>
      useEndOfDay({
        ...defaultProps,
        scheduledAbsences,
      })
    );

    // Should not be able to proceed from absences initially
    expect(result.current.canProceedFromAbsences).toBe(false);

    // Justify the absence
    act(() => {
      result.current.handleJustificationChange(1, "spiritual", true);
    });

    // Should be able to proceed now
    expect(result.current.canProceedFromAbsences).toBe(true);
  });

  it("handles form submission", async () => {
    const scheduledAbsences = [createMockScheduledAbsence()];
    const { result } = renderHook(() =>
      useEndOfDay({
        ...defaultProps,
        scheduledAbsences,
      })
    );

    // Justify the absence
    act(() => {
      result.current.handleJustificationChange(
        1,
        "spiritual",
        true,
        "Medical reason"
      );
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockOnSubmitEndOfDay).toHaveBeenCalledWith([
      {
        patientId: 1,
        patientName: "John Doe",
        attendanceType: "spiritual",
        justified: true,
        justification: "Medical reason",
      },
    ]);
  });

  it("handles completion callback", () => {
    const { result } = renderHook(() => useEndOfDay(defaultProps));

    act(() => {
      result.current.handleCompletion(123);
    });

    expect(mockOnHandleCompletion).toHaveBeenCalledWith(123);
  });

  it("sets isSubmitting during form submission", async () => {
    const { result } = renderHook(() => useEndOfDay(defaultProps));

    // Make the submission hang so we can check isSubmitting
    let resolveSubmission: () => void;
    const submissionPromise = new Promise<void>((resolve) => {
      resolveSubmission = resolve;
    });
    mockOnSubmitEndOfDay.mockReturnValue(submissionPromise);

    // Start submission
    act(() => {
      result.current.handleSubmit();
    });

    // Should be submitting
    expect(result.current.isSubmitting).toBe(true);

    // Resolve the submission
    await act(async () => {
      resolveSubmission!();
      await submissionPromise;
    });

    // Should not be submitting anymore
    expect(result.current.isSubmitting).toBe(false);
  });
});
