import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AbsenceJustificationStep from "../Steps/AbsenceJustificationStep";
import type { AbsenceJustification, ScheduledAbsence } from "../types";

// Mock data factories
const createMockScheduledAbsence = (
  overrides: Partial<ScheduledAbsence> = {}
): ScheduledAbsence => ({
  patientId: 1,
  patientName: "John Doe",
  attendanceType: "spiritual",
  ...overrides,
});

const createMockJustification = (
  overrides: Partial<AbsenceJustification> = {}
): AbsenceJustification => ({
  patientId: 1,
  patientName: "John Doe",
  attendanceType: "spiritual",
  // justified is undefined initially
  ...overrides,
});

describe("AbsenceJustificationStep", () => {
  const defaultProps = {
    scheduledAbsences: [],
    selectedDate: "2024-01-15",
    absenceJustifications: [],
    onJustificationChange: jest.fn(),
    onNext: jest.fn(),
    onBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows success message when no scheduled absences", () => {
    render(<AbsenceJustificationStep {...defaultProps} />);

    expect(
      screen.getByText("Todas as presenças confirmadas!")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Não há faltas agendadas para justificar.")
    ).toBeInTheDocument();
  });

  it("displays formatted date correctly", () => {
    render(<AbsenceJustificationStep {...defaultProps} />);

    expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument();
  });

  it("shows warning when there are scheduled absences", () => {
    const scheduledAbsences = [createMockScheduledAbsence()];

    render(
      <AbsenceJustificationStep
        {...defaultProps}
        scheduledAbsences={scheduledAbsences}
      />
    );

    expect(screen.getByText("Pacientes faltosos")).toBeInTheDocument();
    expect(screen.getByText(/Há 1 paciente/)).toBeInTheDocument();
  });

  it("renders absence details", () => {
    const scheduledAbsences = [
      createMockScheduledAbsence({ patientName: "Jane Doe", patientId: 123 }),
    ];
    const absenceJustifications = [
      createMockJustification({ patientId: 123, patientName: "Jane Doe" }),
    ];

    render(
      <AbsenceJustificationStep
        {...defaultProps}
        scheduledAbsences={scheduledAbsences}
        absenceJustifications={absenceJustifications}
      />
    );

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Paciente ID: 123")).toBeInTheDocument();
  });

  it("handles justified radio button selection", () => {
    const scheduledAbsences = [createMockScheduledAbsence({ patientId: 123 })];
    const absenceJustifications = [createMockJustification({ patientId: 123 })];

    render(
      <AbsenceJustificationStep
        {...defaultProps}
        scheduledAbsences={scheduledAbsences}
        absenceJustifications={absenceJustifications}
      />
    );

    const justifiedRadio = screen.getByLabelText("Falta Justificada");
    fireEvent.click(justifiedRadio);

    expect(defaultProps.onJustificationChange).toHaveBeenCalledWith(
      123,
      "spiritual",
      true
    );
  });

  it("handles unjustified radio button selection", () => {
    const scheduledAbsences = [createMockScheduledAbsence({ patientId: 123 })];
    const absenceJustifications = [createMockJustification({ patientId: 123 })];

    render(
      <AbsenceJustificationStep
        {...defaultProps}
        scheduledAbsences={scheduledAbsences}
        absenceJustifications={absenceJustifications}
      />
    );

    const unjustifiedRadio = screen.getByLabelText("Falta Injustificada");
    fireEvent.click(unjustifiedRadio);

    expect(defaultProps.onJustificationChange).toHaveBeenCalledWith(
      123,
      "spiritual",
      false
    );
  });

  it("shows justification textarea when justified is selected", () => {
    const scheduledAbsences = [createMockScheduledAbsence({ patientId: 123 })];
    const absenceJustifications = [
      createMockJustification({ patientId: 123, justified: true }),
    ];

    render(
      <AbsenceJustificationStep
        {...defaultProps}
        scheduledAbsences={scheduledAbsences}
        absenceJustifications={absenceJustifications}
      />
    );

    expect(screen.getByLabelText("Justificativa")).toBeInTheDocument();
  });

  it("handles justification text input", () => {
    const scheduledAbsences = [createMockScheduledAbsence({ patientId: 123 })];
    const absenceJustifications = [
      createMockJustification({ patientId: 123, justified: true }),
    ];

    render(
      <AbsenceJustificationStep
        {...defaultProps}
        scheduledAbsences={scheduledAbsences}
        absenceJustifications={absenceJustifications}
      />
    );

    const textarea = screen.getByLabelText("Justificativa");
    fireEvent.change(textarea, { target: { value: "Patient was sick" } });

    expect(defaultProps.onJustificationChange).toHaveBeenCalledWith(
      123,
      "spiritual",
      true,
      "Patient was sick"
    );
  });

  it("enables Next button when all absences are justified", () => {
    const scheduledAbsences = [createMockScheduledAbsence({ patientId: 123 })];
    const absenceJustifications = [
      createMockJustification({ patientId: 123, justified: true }),
    ];

    render(
      <AbsenceJustificationStep
        {...defaultProps}
        scheduledAbsences={scheduledAbsences}
        absenceJustifications={absenceJustifications}
      />
    );

    const nextButton = screen.getByText("Próximo");
    expect(nextButton).not.toBeDisabled();
  });

  it("disables Next button when not all absences are justified", () => {
    const scheduledAbsences = [createMockScheduledAbsence({ patientId: 123 })];
    const absenceJustifications = [
      createMockJustification({ patientId: 123, justified: false }),
    ];

    render(
      <AbsenceJustificationStep
        {...defaultProps}
        scheduledAbsences={scheduledAbsences}
        absenceJustifications={absenceJustifications}
      />
    );

    const nextButton = screen.getByText("Próximo");
    expect(nextButton).toBeDisabled();
  });

  it("calls onBack when Back button is clicked", () => {
    render(<AbsenceJustificationStep {...defaultProps} />);

    fireEvent.click(screen.getByText("Voltar"));

    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it("enables Next button when no scheduled absences", () => {
    render(<AbsenceJustificationStep {...defaultProps} />);

    const nextButton = screen.getByText("Próximo");
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(nextButton);
    expect(defaultProps.onNext).toHaveBeenCalled();
  });
});
