import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import IncompleteAttendancesStep from "../Steps/IncompleteAttendancesStep";
import type { IAttendanceStatusDetailWithType } from "../../../utils/attendanceDataUtils";

// Mock data factory
const createMockAttendance = (
  overrides: Partial<IAttendanceStatusDetailWithType> = {}
): IAttendanceStatusDetailWithType => ({
  name: "John Doe",
  priority: "1",
  checkedInTime: new Date("2024-01-15T09:00:00"),
  onGoingTime: null,
  completedTime: null,
  attendanceId: 1,
  patientId: 1,
  attendanceType: "spiritual",
  ...overrides,
});

describe("IncompleteAttendancesStep", () => {
  const defaultProps = {
    incompleteAttendances: [],
    selectedDate: "2024-01-15",
    onHandleCompletion: jest.fn(),
    onReschedule: jest.fn(),
    onNext: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows success message when no incomplete attendances", () => {
    render(<IncompleteAttendancesStep {...defaultProps} />);

    expect(
      screen.getByText("Todos os atendimentos foram concluídos!")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Não há atendimentos incompletos para este dia.")
    ).toBeInTheDocument();
  });

  it("displays formatted date correctly", () => {
    render(<IncompleteAttendancesStep {...defaultProps} />);

    expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument();
  });

  it("shows warning when there are incomplete attendances", () => {
    const incompleteAttendances = [createMockAttendance()];

    render(
      <IncompleteAttendancesStep
        {...defaultProps}
        incompleteAttendances={incompleteAttendances}
      />
    );

    expect(screen.getByText("Atendimentos não concluídos")).toBeInTheDocument();
    expect(screen.getByText(/Há 1 atendimento/)).toBeInTheDocument();
  });

  it("renders incomplete attendance details", () => {
    const incompleteAttendances = [
      createMockAttendance({
        name: "Jane Doe",
        priority: "2",
        attendanceId: 123,
      }),
    ];

    render(
      <IncompleteAttendancesStep
        {...defaultProps}
        incompleteAttendances={incompleteAttendances}
      />
    );

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Priority: 2")).toBeInTheDocument();
  });

  it("displays check-in time when available", () => {
    const checkedInTime = new Date("2024-01-15T10:30:00");
    const incompleteAttendances = [
      createMockAttendance({
        checkedInTime,
      }),
    ];

    render(
      <IncompleteAttendancesStep
        {...defaultProps}
        incompleteAttendances={incompleteAttendances}
      />
    );

    expect(screen.getByText("Check-in: 10:30")).toBeInTheDocument();
  });

  it("calls onHandleCompletion when Concluir button is clicked", () => {
    const incompleteAttendances = [createMockAttendance({ attendanceId: 123 })];

    render(
      <IncompleteAttendancesStep
        {...defaultProps}
        incompleteAttendances={incompleteAttendances}
      />
    );

    fireEvent.click(screen.getByText("Concluir"));

    expect(defaultProps.onHandleCompletion).toHaveBeenCalledWith(123);
  });

  it("calls onReschedule when Reagendar button is clicked", () => {
    const incompleteAttendances = [createMockAttendance({ attendanceId: 123 })];

    render(
      <IncompleteAttendancesStep
        {...defaultProps}
        incompleteAttendances={incompleteAttendances}
      />
    );

    fireEvent.click(screen.getByText("Reagendar"));

    expect(defaultProps.onReschedule).toHaveBeenCalledWith(123);
  });

  it("displays both Concluir and Reagendar buttons for incomplete attendances", () => {
    const incompleteAttendances = [createMockAttendance({ attendanceId: 123 })];

    render(
      <IncompleteAttendancesStep
        {...defaultProps}
        incompleteAttendances={incompleteAttendances}
      />
    );

    expect(screen.getByText("Concluir")).toBeInTheDocument();
    expect(screen.getByText("Reagendar")).toBeInTheDocument();
  });

  it("disables Concluir button when attendanceId is missing", () => {
    const incompleteAttendances = [
      createMockAttendance({ attendanceId: undefined }),
    ];

    render(
      <IncompleteAttendancesStep
        {...defaultProps}
        incompleteAttendances={incompleteAttendances}
      />
    );

    const button = screen.getByText("Concluir");
    expect(button).toBeDisabled();
  });

  it("disables both buttons when attendanceId is missing", () => {
    const incompleteAttendances = [
      createMockAttendance({ attendanceId: undefined }),
    ];

    render(
      <IncompleteAttendancesStep
        {...defaultProps}
        incompleteAttendances={incompleteAttendances}
      />
    );

    const concluirButton = screen.getByText("Concluir");
    const reagendarButton = screen.getByText("Reagendar");

    expect(concluirButton).toBeDisabled();
    expect(reagendarButton).toBeDisabled();
  });

  it("enables Next button when no incomplete attendances", () => {
    render(<IncompleteAttendancesStep {...defaultProps} />);

    const nextButton = screen.getByText("Próximo");
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(nextButton);
    expect(defaultProps.onNext).toHaveBeenCalled();
  });

  it("disables Next button when there are incomplete attendances", () => {
    const incompleteAttendances = [createMockAttendance()];

    render(
      <IncompleteAttendancesStep
        {...defaultProps}
        incompleteAttendances={incompleteAttendances}
      />
    );

    const nextButton = screen.getByText("Próximo");
    expect(nextButton).toBeDisabled();
  });
});
