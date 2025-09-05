import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import EndOfDayModal from "../EndOfDayModal";
import type { IAttendanceStatusDetail } from "@/types/globals";
import { useEndOfDay } from "../useEndOfDay";

// Mock the useEndOfDay hook
jest.mock("../useEndOfDay");
const mockUseEndOfDay = useEndOfDay as jest.MockedFunction<typeof useEndOfDay>;

// Mock data factories
const createMockAttendance = (
  overrides: Partial<IAttendanceStatusDetail> = {}
): IAttendanceStatusDetail => ({
  name: "John Doe",
  priority: "1",
  checkedInTime: null,
  onGoingTime: null,
  completedTime: null,
  attendanceId: 1,
  patientId: 1,
  ...overrides,
});

describe("EndOfDayModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    selectedDate: "2024-01-15",
    incompleteAttendances: [],
    completedAttendances: [],
    scheduledAbsences: [],
    onHandleCompletion: jest.fn(),
    onSubmitEndOfDay: jest.fn(),
  };

  const mockHookReturn = {
    currentStep: "incomplete" as const,
    absenceJustifications: [],
    isSubmitting: false,
    canProceedFromIncomplete: true,
    canProceedFromAbsences: true,
    handleJustificationChange: jest.fn(),
    handleNext: jest.fn(),
    handleBack: jest.fn(),
    handleSubmit: jest.fn(),
    handleCompletion: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEndOfDay.mockReturnValue(mockHookReturn);
  });

  it("does not render when isOpen is false", () => {
    render(<EndOfDayModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText("Finalizar o Dia")).not.toBeInTheDocument();
  });

  it("renders modal header correctly", () => {
    render(<EndOfDayModal {...defaultProps} />);

    expect(screen.getByText("Finalizar o Dia")).toBeInTheDocument();
  });

  it("renders close button and calls onClose when clicked", () => {
    render(<EndOfDayModal {...defaultProps} />);

    const closeButton = screen.getByLabelText("Fechar modal");
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("disables close button when submitting", () => {
    mockUseEndOfDay.mockReturnValue({
      ...mockHookReturn,
      isSubmitting: true,
    });

    render(<EndOfDayModal {...defaultProps} />);

    const closeButton = screen.getByLabelText("Fechar modal");
    expect(closeButton).toBeDisabled();
  });

  it("renders StepNavigation component", () => {
    render(<EndOfDayModal {...defaultProps} />);

    expect(screen.getByText("Atendimentos")).toBeInTheDocument();
    expect(screen.getByText("Faltas")).toBeInTheDocument();
    expect(screen.getByText("Confirmação")).toBeInTheDocument();
  });

  it("renders IncompleteAttendancesStep when currentStep is incomplete", () => {
    const incompleteAttendances = [
      createMockAttendance({ name: "Test Patient" }),
    ];

    render(
      <EndOfDayModal
        {...defaultProps}
        incompleteAttendances={incompleteAttendances}
      />
    );

    expect(screen.getByText(/Atendimentos Incompletos/)).toBeInTheDocument();
  });

  it("renders AbsenceJustificationStep when currentStep is absences", () => {
    mockUseEndOfDay.mockReturnValue({
      ...mockHookReturn,
      currentStep: "absences",
    });

    render(<EndOfDayModal {...defaultProps} />);

    expect(screen.getByText(/Faltas Agendadas/)).toBeInTheDocument();
  });

  it("renders ConfirmationStep when currentStep is confirm", () => {
    mockUseEndOfDay.mockReturnValue({
      ...mockHookReturn,
      currentStep: "confirm",
    });

    render(<EndOfDayModal {...defaultProps} />);

    expect(screen.getByText("Confirmação - 15/01/2024")).toBeInTheDocument();
    expect(screen.getByText("Finalizar Dia")).toBeInTheDocument();
  });

  it("passes correct props to useEndOfDay hook", () => {
    const incompleteAttendances = [createMockAttendance()];
    const scheduledAbsences = [{ patientId: 1, patientName: "John Doe" }];

    render(
      <EndOfDayModal
        {...defaultProps}
        incompleteAttendances={incompleteAttendances}
        scheduledAbsences={scheduledAbsences}
      />
    );

    expect(mockUseEndOfDay).toHaveBeenCalledWith(
      expect.objectContaining({
        incompleteAttendances,
        scheduledAbsences,
      })
    );
  });

  it("renders modal structure correctly", () => {
    render(<EndOfDayModal {...defaultProps} />);

    expect(screen.getByText("Finalizar o Dia")).toBeInTheDocument();
    expect(screen.getByText("Atendimentos")).toBeInTheDocument();
  });

  it("returns null for unknown step", () => {
    mockUseEndOfDay.mockReturnValue({
      ...mockHookReturn,
      currentStep: "invalid" as "incomplete",
    });

    render(<EndOfDayModal {...defaultProps} />);

    expect(screen.getByText("Finalizar o Dia")).toBeInTheDocument();
  });
});
