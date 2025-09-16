import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ConfirmationStep from "../Steps/ConfirmationStep";
import type { AbsenceJustification } from "../types";

// Mock data factories
const createMockAttendance = (overrides: { name?: string } = {}) => ({
  name: "John Doe",
  ...overrides,
});

const createMockJustification = (
  overrides: Partial<AbsenceJustification> = {}
): AbsenceJustification => ({
  patientId: 1,
  patientName: "John Doe",
  justified: true,
  justification: "Medical appointment",
  ...overrides,
});

describe("ConfirmationStep", () => {
  const defaultProps = {
    selectedDate: "2024-01-15",
    completedAttendances: [],
    scheduledAbsences: [],
    absenceJustifications: [],
    isSubmitting: false,
    onSubmit: jest.fn(),
    onBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays formatted date correctly", () => {
    render(<ConfirmationStep {...defaultProps} />);

    expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument();
  });

  it("shows summary cards with correct counts", () => {
    const completedAttendances = [
      createMockAttendance(),
      createMockAttendance(),
    ];
    const absenceJustifications = [
      createMockJustification({ justified: true }),
      createMockJustification({ patientId: 2, justified: true }),
      createMockJustification({ patientId: 3, justified: false }),
    ];

    const { container } = render(
      <ConfirmationStep
        {...defaultProps}
        completedAttendances={completedAttendances}
        absenceJustifications={absenceJustifications}
      />
    );

    // Check the summary cards by their grid container class
    const summaryGrid = container.querySelector(
      ".grid.grid-cols-1.md\\:grid-cols-3"
    );
    expect(summaryGrid).toBeInTheDocument();

    // Look for the specific counts in summary cards
    const completedCard = container.querySelector(
      ".bg-green-50 .text-2xl.font-bold.text-green-600"
    );
    expect(completedCard).toHaveTextContent("2");

    const unjustifiedCard = container.querySelector(
      ".bg-red-50 .text-2xl.font-bold.text-red-600"
    );
    expect(unjustifiedCard).toHaveTextContent("1");
  });

  it("displays completed attendances list", () => {
    const completedAttendances = [
      createMockAttendance({ name: "Jane Doe" }),
      createMockAttendance({ name: "Bob Smith" }),
    ];

    const { container } = render(
      <ConfirmationStep
        {...defaultProps}
        completedAttendances={completedAttendances}
      />
    );

    // Find the completed attendances section heading specifically (h4 element)
    const completedSection = container.querySelector(
      "h4.text-md.font-medium.text-gray-900"
    );
    expect(completedSection).toHaveTextContent("Atendimentos Concluídos");

    expect(screen.getByText("• Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("• Bob Smith")).toBeInTheDocument();
  });

  it("displays justified absences with justifications", () => {
    const absenceJustifications = [
      createMockJustification({
        patientName: "John Doe",
        justified: true,
        justification: "Medical emergency",
      }),
    ];

    render(
      <ConfirmationStep
        {...defaultProps}
        absenceJustifications={absenceJustifications}
      />
    );

    const sections = screen.getAllByText("Faltas Justificadas");
    expect(sections.length).toBeGreaterThan(0);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(
      screen.getByText("Justificativa: Medical emergency")
    ).toBeInTheDocument();
  });

  it("displays unjustified absences", () => {
    const absenceJustifications = [
      createMockJustification({
        patientName: "Jane Doe",
        justified: false,
      }),
    ];

    render(
      <ConfirmationStep
        {...defaultProps}
        absenceJustifications={absenceJustifications}
      />
    );

    const sections = screen.getAllByText("Faltas Injustificadas");
    expect(sections.length).toBeGreaterThan(0);
    expect(screen.getByText("• Jane Doe")).toBeInTheDocument();
  });

  it("shows final confirmation message", () => {
    render(<ConfirmationStep {...defaultProps} />);

    expect(screen.getByText("Finalizar o dia")).toBeInTheDocument();
    expect(
      screen.getByText(/Clique em.*Finalizar Dia.*para confirmar/)
    ).toBeInTheDocument();
  });

  it("calls onBack when Back button is clicked", () => {
    render(<ConfirmationStep {...defaultProps} />);

    fireEvent.click(screen.getByText("Voltar"));

    expect(defaultProps.onBack).toHaveBeenCalled();
  });

  it("calls onSubmit when Finalizar Dia button is clicked", () => {
    render(<ConfirmationStep {...defaultProps} />);

    fireEvent.click(screen.getByText("Finalizar Dia"));

    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  it("disables buttons when submitting", () => {
    render(<ConfirmationStep {...defaultProps} isSubmitting={true} />);

    const backButton = screen.getByText("Voltar");
    const submitButton = screen.getByText("Finalizando...");

    expect(backButton).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it("shows loading state when submitting", () => {
    render(<ConfirmationStep {...defaultProps} isSubmitting={true} />);

    expect(screen.getByText("Finalizando...")).toBeInTheDocument();
    expect(screen.queryByText("Finalizar Dia")).not.toBeInTheDocument();
  });

  it("handles attendances without names", () => {
    const completedAttendances = [createMockAttendance({ name: undefined })];

    render(
      <ConfirmationStep
        {...defaultProps}
        completedAttendances={completedAttendances}
      />
    );

    expect(screen.getByText("• Attendance #1")).toBeInTheDocument();
  });
});
