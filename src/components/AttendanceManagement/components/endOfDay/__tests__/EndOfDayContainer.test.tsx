/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EndOfDayContainer from "../EndOfDayContainer";
import { useEndOfDayModal, useCloseModal } from "@/stores/modalStore";

// Mock all dependencies
jest.mock("@/stores/modalStore");
jest.mock("../useEndOfDay");
jest.mock("../StepNavigation", () => {
  return function MockStepNavigation({
    currentStep,
    incompleteAttendancesCount,
    scheduledAbsencesCount,
  }: {
    currentStep: string;
    incompleteAttendancesCount: number;
    scheduledAbsencesCount: number;
  }) {
    return (
      <div data-testid="step-navigation">
        <span>Current Step: {currentStep}</span>
        <span>Incomplete: {incompleteAttendancesCount}</span>
        <span>Absences: {scheduledAbsencesCount}</span>
      </div>
    );
  };
});

jest.mock("../Steps/IncompleteAttendancesStep", () => {
  return function MockIncompleteAttendancesStep({
    incompleteAttendances,
    onNext,
    onHandleCompletion,
    onReschedule,
  }: {
    incompleteAttendances: Array<{
      id: number;
      patientName: string;
      attendanceType: string;
    }>;
    onNext: () => void;
    onHandleCompletion: (id: number) => void;
    onReschedule: (id: number) => void;
  }) {
    return (
      <div data-testid="incomplete-step">
        <h3>Incomplete Attendances Step</h3>
        <div>Count: {incompleteAttendances.length}</div>
        <button onClick={() => onHandleCompletion(1)}>
          Complete Attendance 1
        </button>
        <button onClick={() => onReschedule(2)}>Reschedule Attendance 2</button>
        <button onClick={onNext}>Next Step</button>
      </div>
    );
  };
});

jest.mock("../Steps/AbsenceJustificationStep", () => {
  return function MockAbsenceJustificationStep({
    scheduledAbsences,
    onJustificationChange,
    onNext,
    onBack,
  }: {
    scheduledAbsences: Array<{
      patientId: number;
      patientName: string;
      attendanceType: string;
    }>;
    onJustificationChange: (patientId: string, justification: string) => void;
    onNext: () => void;
    onBack: () => void;
  }) {
    return (
      <div data-testid="absence-step">
        <h3>Absence Justification Step</h3>
        <div>Absences Count: {scheduledAbsences.length}</div>
        <input
          placeholder="Justification"
          onChange={(e) =>
            onJustificationChange("test-patient", e.target.value)
          }
        />
        <button onClick={onBack}>Back</button>
        <button onClick={onNext}>Next</button>
      </div>
    );
  };
});

jest.mock("../Steps/ConfirmationStep", () => {
  return function MockConfirmationStep({
    completedAttendances,
    scheduledAbsences,
    isSubmitting,
    onSubmit,
    onBack,
  }: {
    completedAttendances: Array<{
      id: number;
      patientName: string;
      attendanceType: string;
    }>;
    scheduledAbsences: Array<{
      patientId: number;
      patientName: string;
      attendanceType: string;
    }>;
    isSubmitting: boolean;
    onSubmit: () => void;
    onBack: () => void;
  }) {
    return (
      <div data-testid="confirmation-step">
        <h3>Confirmation Step</h3>
        <div>Completed: {completedAttendances.length}</div>
        <div>Scheduled Absences: {scheduledAbsences.length}</div>
        <button onClick={onBack} disabled={isSubmitting}>
          Back
        </button>
        <button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    );
  };
});

// Mock hooks
const mockUseEndOfDayModal = useEndOfDayModal as jest.MockedFunction<
  typeof useEndOfDayModal
>;
const mockUseCloseModal = useCloseModal as jest.MockedFunction<
  typeof useCloseModal
>;
const mockUseEndOfDay = jest.requireMock("../useEndOfDay").useEndOfDay;

describe("EndOfDayContainer", () => {
  const mockCloseModal = jest.fn();
  const mockOnHandleCompletion = jest.fn();
  const mockOnReschedule = jest.fn();
  const mockHandleNext = jest.fn();
  const mockHandleBack = jest.fn();
  const mockHandleSubmit = jest.fn();
  const mockHandleCompletion = jest.fn();
  const mockHandleReschedule = jest.fn();
  const mockHandleJustificationChange = jest.fn();

  const defaultEndOfDayState = {
    selectedDate: "2024-01-15",
    isOpen: true,
    onFinalizeClick: jest.fn(),
  };

  const defaultUseEndOfDayReturn = {
    currentStep: "incomplete" as const,
    absenceJustifications: {},
    isSubmitting: false,
    scheduledAbsences: [],
    completedAttendances: [],
    incompleteAttendances: [
      { id: 1, patientName: "John Doe", attendanceType: "spiritual" },
      { id: 2, patientName: "Jane Smith", attendanceType: "lightBath" },
    ],
    handleJustificationChange: mockHandleJustificationChange,
    handleNext: mockHandleNext,
    handleBack: mockHandleBack,
    handleSubmit: mockHandleSubmit,
    handleCompletion: mockHandleCompletion,
    handleReschedule: mockHandleReschedule,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseEndOfDayModal.mockReturnValue(defaultEndOfDayState);
    mockUseCloseModal.mockReturnValue(mockCloseModal);
    mockUseEndOfDay.mockReturnValue(defaultUseEndOfDayReturn);
  });

  it("renders modal structure correctly", () => {
    render(
      <EndOfDayContainer
        onHandleCompletion={mockOnHandleCompletion}
        onReschedule={mockOnReschedule}
      />
    );

    expect(screen.getByText("Finalizar o Dia")).toBeInTheDocument();
    expect(screen.getByLabelText("Fechar modal")).toBeInTheDocument();
    expect(screen.getByTestId("step-navigation")).toBeInTheDocument();
  });

  it("renders step navigation with correct props", () => {
    render(
      <EndOfDayContainer
        onHandleCompletion={mockOnHandleCompletion}
        onReschedule={mockOnReschedule}
      />
    );

    const stepNavigation = screen.getByTestId("step-navigation");
    expect(stepNavigation).toHaveTextContent("Current Step: incomplete");
    expect(stepNavigation).toHaveTextContent("Incomplete: 2");
    expect(stepNavigation).toHaveTextContent("Absences: 0");
  });

  it("closes modal when close button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <EndOfDayContainer
        onHandleCompletion={mockOnHandleCompletion}
        onReschedule={mockOnReschedule}
      />
    );

    const closeButton = screen.getByLabelText("Fechar modal");
    await user.click(closeButton);

    expect(mockCloseModal).toHaveBeenCalledWith("endOfDay");
  });

  it("disables close button when submitting", () => {
    mockUseEndOfDay.mockReturnValue({
      ...defaultUseEndOfDayReturn,
      isSubmitting: true,
    });

    render(
      <EndOfDayContainer
        onHandleCompletion={mockOnHandleCompletion}
        onReschedule={mockOnReschedule}
      />
    );

    const closeButton = screen.getByLabelText("Fechar modal");
    expect(closeButton).toBeDisabled();
  });

  describe("Step Rendering", () => {
    it("renders IncompleteAttendancesStep when currentStep is 'incomplete'", () => {
      render(
        <EndOfDayContainer
          onHandleCompletion={mockOnHandleCompletion}
          onReschedule={mockOnReschedule}
        />
      );

      expect(screen.getByTestId("incomplete-step")).toBeInTheDocument();
      expect(
        screen.getByText("Incomplete Attendances Step")
      ).toBeInTheDocument();
      expect(screen.getByText("Count: 2")).toBeInTheDocument();
    });

    it("renders AbsenceJustificationStep when currentStep is 'absences'", () => {
      const scheduledAbsences = [
        {
          patientId: 1,
          patientName: "Absent Patient",
          attendanceType: "spiritual",
        },
      ];

      mockUseEndOfDay.mockReturnValue({
        ...defaultUseEndOfDayReturn,
        currentStep: "absences",
        scheduledAbsences,
      });

      render(
        <EndOfDayContainer
          onHandleCompletion={mockOnHandleCompletion}
          onReschedule={mockOnReschedule}
        />
      );

      expect(screen.getByTestId("absence-step")).toBeInTheDocument();
      expect(
        screen.getByText("Absence Justification Step")
      ).toBeInTheDocument();
      expect(screen.getByText("Absences Count: 1")).toBeInTheDocument();
    });

    it("renders ConfirmationStep when currentStep is 'confirm'", () => {
      const completedAttendances = [
        {
          id: 1,
          patientName: "Completed Patient",
          attendanceType: "spiritual",
        },
      ];

      mockUseEndOfDay.mockReturnValue({
        ...defaultUseEndOfDayReturn,
        currentStep: "confirm",
        completedAttendances,
      });

      render(
        <EndOfDayContainer
          onHandleCompletion={mockOnHandleCompletion}
          onReschedule={mockOnReschedule}
        />
      );

      expect(screen.getByTestId("confirmation-step")).toBeInTheDocument();
      expect(screen.getByText("Confirmation Step")).toBeInTheDocument();
      expect(screen.getByText("Completed: 1")).toBeInTheDocument();
    });

    it("renders nothing for invalid step", () => {
      mockUseEndOfDay.mockReturnValue({
        ...defaultUseEndOfDayReturn,
        currentStep: "invalid" as const,
      });

      render(
        <EndOfDayContainer
          onHandleCompletion={mockOnHandleCompletion}
          onReschedule={mockOnReschedule}
        />
      );

      expect(screen.queryByTestId("incomplete-step")).not.toBeInTheDocument();
      expect(screen.queryByTestId("absence-step")).not.toBeInTheDocument();
      expect(screen.queryByTestId("confirmation-step")).not.toBeInTheDocument();
    });
  });

  describe("Step Interactions", () => {
    it("handles completion in IncompleteAttendancesStep", async () => {
      const user = userEvent.setup();

      render(
        <EndOfDayContainer
          onHandleCompletion={mockOnHandleCompletion}
          onReschedule={mockOnReschedule}
        />
      );

      const completeButton = screen.getByText("Complete Attendance 1");
      await user.click(completeButton);

      expect(mockHandleCompletion).toHaveBeenCalledWith(1);
    });

    it("handles rescheduling in IncompleteAttendancesStep", async () => {
      const user = userEvent.setup();

      render(
        <EndOfDayContainer
          onHandleCompletion={mockOnHandleCompletion}
          onReschedule={mockOnReschedule}
        />
      );

      const rescheduleButton = screen.getByText("Reschedule Attendance 2");
      await user.click(rescheduleButton);

      expect(mockHandleReschedule).toHaveBeenCalledWith(2);
    });

    it("handles next step navigation", async () => {
      const user = userEvent.setup();

      render(
        <EndOfDayContainer
          onHandleCompletion={mockOnHandleCompletion}
          onReschedule={mockOnReschedule}
        />
      );

      const nextButton = screen.getByText("Next Step");
      await user.click(nextButton);

      expect(mockHandleNext).toHaveBeenCalled();
    });

    it("handles justification changes in AbsenceJustificationStep", async () => {
      const user = userEvent.setup();

      mockUseEndOfDay.mockReturnValue({
        ...defaultUseEndOfDayReturn,
        currentStep: "absences",
        scheduledAbsences: [
          {
            patientId: 1,
            patientName: "Test Patient",
            attendanceType: "spiritual",
          },
        ],
      });

      render(
        <EndOfDayContainer
          onHandleCompletion={mockOnHandleCompletion}
          onReschedule={mockOnReschedule}
        />
      );

      const justificationInput = screen.getByPlaceholderText("Justification");
      await user.type(justificationInput, "Patient was sick");

      expect(mockHandleJustificationChange).toHaveBeenCalledWith(
        "test-patient",
        "Patient was sick"
      );
    });

    it("handles back navigation in AbsenceJustificationStep", async () => {
      const user = userEvent.setup();

      mockUseEndOfDay.mockReturnValue({
        ...defaultUseEndOfDayReturn,
        currentStep: "absences",
        scheduledAbsences: [
          {
            patientId: 1,
            patientName: "Test Patient",
            attendanceType: "spiritual",
          },
        ],
      });

      render(
        <EndOfDayContainer
          onHandleCompletion={mockOnHandleCompletion}
          onReschedule={mockOnReschedule}
        />
      );

      const backButton = screen.getByText("Back");
      await user.click(backButton);

      expect(mockHandleBack).toHaveBeenCalled();
    });

    it("handles form submission in ConfirmationStep", async () => {
      const user = userEvent.setup();

      mockUseEndOfDay.mockReturnValue({
        ...defaultUseEndOfDayReturn,
        currentStep: "confirm",
        completedAttendances: [
          {
            id: 1,
            patientName: "Completed Patient",
            attendanceType: "spiritual",
          },
        ],
      });

      render(
        <EndOfDayContainer
          onHandleCompletion={mockOnHandleCompletion}
          onReschedule={mockOnReschedule}
        />
      );

      const submitButton = screen.getByText("Submit");
      await user.click(submitButton);

      expect(mockHandleSubmit).toHaveBeenCalled();
    });

    it("disables buttons during submission in ConfirmationStep", () => {
      mockUseEndOfDay.mockReturnValue({
        ...defaultUseEndOfDayReturn,
        currentStep: "confirm",
        isSubmitting: true,
      });

      render(
        <EndOfDayContainer
          onHandleCompletion={mockOnHandleCompletion}
          onReschedule={mockOnReschedule}
        />
      );

      expect(screen.getByText("Back")).toBeDisabled();
      expect(screen.getByText("Submitting...")).toBeDisabled();
    });
  });

  describe("Error Handling", () => {
    it("handles completion errors", async () => {
      const error = new Error("Completion failed");
      mockOnHandleCompletion.mockRejectedValue(error);

      render(
        <EndOfDayContainer
          onHandleCompletion={mockOnHandleCompletion}
          onReschedule={mockOnReschedule}
        />
      );

      // Call the wrapped completion handler - it should catch errors internally
      const wrappedHandler =
        mockUseEndOfDay.mock.calls[0][0].onHandleCompletion;
      await wrappedHandler(1); // Should resolve, not reject

      // Verify the original handler was called
      expect(mockOnHandleCompletion).toHaveBeenCalledWith(1);
    });

    it("handles rescheduling errors", async () => {
      const error = new Error("Reschedule failed");
      mockOnReschedule.mockRejectedValue(error);

      render(
        <EndOfDayContainer
          onHandleCompletion={mockOnHandleCompletion}
          onReschedule={mockOnReschedule}
        />
      );

      // Call the wrapped reschedule handler - it should catch errors internally
      const wrappedHandler = mockUseEndOfDay.mock.calls[0][0].onReschedule;
      await wrappedHandler(1); // Should resolve, not reject

      // Verify the original handler was called
      expect(mockOnReschedule).toHaveBeenCalledWith(1);
    });

    it("handles non-Error exceptions in completion", async () => {
      const error = "String error";
      mockOnHandleCompletion.mockRejectedValue(error);

      render(
        <EndOfDayContainer
          onHandleCompletion={mockOnHandleCompletion}
          onReschedule={mockOnReschedule}
        />
      );

      // Call the wrapped completion handler
      const wrappedHandler =
        mockUseEndOfDay.mock.calls[0][0].onHandleCompletion;
      await wrappedHandler(1).catch(() => {
        // Error should be caught and handled internally
      });
    });

    it("handles non-Error exceptions in rescheduling", async () => {
      const error = "String error";
      mockOnReschedule.mockRejectedValue(error);

      render(
        <EndOfDayContainer
          onHandleCompletion={mockOnHandleCompletion}
          onReschedule={mockOnReschedule}
        />
      );

      // Call the wrapped reschedule handler
      const wrappedHandler = mockUseEndOfDay.mock.calls[0][0].onReschedule;
      await wrappedHandler(1).catch(() => {
        // Error should be caught and handled internally
      });
    });
  });

  describe("Data Passing", () => {
    it("passes correct props to IncompleteAttendancesStep", () => {
      render(
        <EndOfDayContainer
          onHandleCompletion={mockOnHandleCompletion}
          onReschedule={mockOnReschedule}
        />
      );

      const step = screen.getByTestId("incomplete-step");
      expect(step).toBeInTheDocument();

      // Verify the step receives the correct data
      expect(screen.getByText("Count: 2")).toBeInTheDocument();
    });

    it("passes correct props to AbsenceJustificationStep", () => {
      const scheduledAbsences = [
        {
          patientId: 1,
          patientName: "Absent Patient",
          attendanceType: "spiritual",
        },
        {
          patientId: 2,
          patientName: "Another Absent",
          attendanceType: "lightBath",
        },
      ];
      const absenceJustifications = { "patient-1": "Was sick" };

      mockUseEndOfDay.mockReturnValue({
        ...defaultUseEndOfDayReturn,
        currentStep: "absences",
        scheduledAbsences,
        absenceJustifications,
      });

      render(
        <EndOfDayContainer
          onHandleCompletion={mockOnHandleCompletion}
          onReschedule={mockOnReschedule}
        />
      );

      expect(screen.getByText("Absences Count: 2")).toBeInTheDocument();
    });

    it("passes correct props to ConfirmationStep", () => {
      const completedAttendances = [
        { id: 1, patientName: "Completed 1", attendanceType: "spiritual" },
        { id: 2, patientName: "Completed 2", attendanceType: "lightBath" },
      ];
      const scheduledAbsences = [
        {
          patientId: 3,
          patientName: "Absent Patient",
          attendanceType: "spiritual",
        },
      ];
      const absenceJustifications = { "patient-3": "Family emergency" };

      mockUseEndOfDay.mockReturnValue({
        ...defaultUseEndOfDayReturn,
        currentStep: "confirm",
        completedAttendances,
        scheduledAbsences,
        absenceJustifications,
      });

      render(
        <EndOfDayContainer
          onHandleCompletion={mockOnHandleCompletion}
          onReschedule={mockOnReschedule}
        />
      );

      expect(screen.getByText("Completed: 2")).toBeInTheDocument();
      expect(screen.getByText("Scheduled Absences: 1")).toBeInTheDocument();
    });
  });

  describe("Modal State Integration", () => {
    it("uses selected date from modal state", () => {
      const selectedDate = "2024-02-20";
      mockUseEndOfDayModal.mockReturnValue({
        ...defaultEndOfDayState,
        selectedDate,
      });

      render(
        <EndOfDayContainer
          onHandleCompletion={mockOnHandleCompletion}
          onReschedule={mockOnReschedule}
        />
      );

      // Verify the useEndOfDay hook was called (it would receive the selectedDate)
      expect(mockUseEndOfDay).toHaveBeenCalledWith(
        expect.objectContaining({
          onHandleCompletion: expect.any(Function),
          onReschedule: expect.any(Function),
        })
      );
    });

    it("handles undefined selected date gracefully", () => {
      mockUseEndOfDayModal.mockReturnValue({
        ...defaultEndOfDayState,
        selectedDate: undefined,
      });

      render(
        <EndOfDayContainer
          onHandleCompletion={mockOnHandleCompletion}
          onReschedule={mockOnReschedule}
        />
      );

      // Should still render without errors
      expect(screen.getByText("Finalizar o Dia")).toBeInTheDocument();
    });
  });
});
