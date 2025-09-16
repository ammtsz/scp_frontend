import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { jest } from "@jest/globals";
import EndOfDayModal from "../EndOfDayContainer";
import type { IAttendanceStatusDetail } from "@/types/globals";

interface EndOfDayData {
  incompleteAttendances: IAttendanceStatusDetail[];
  scheduledAbsences: IAttendanceStatusDetail[];
  absenceJustifications: Array<{
    patientId: number;
    patientName: string;
    justified: boolean;
    notes: string;
  }>;
}

const mockOnClose = jest.fn<() => void>();
const mockOnFinalize = jest.fn<(data: EndOfDayData) => Promise<void>>();
const mockOnHandleCompletion = jest.fn<(attendanceId: number) => void>();
const mockOnReschedule = jest.fn<(attendanceId: number) => void>();
const mockOnSubmitEndOfDay =
  jest.fn<
    (
      absenceJustifications: Array<{
        patientId: number;
        patientName: string;
        justified: boolean;
        notes: string;
      }>
    ) => void
  >();

const createMockIncompleteAttendance = (
  id: number,
  name: string
): IAttendanceStatusDetail => ({
  name,
  priority: "1",
  checkedInTime: null,
  onGoingTime: null,
  completedTime: null,
  patientId: id,
});

const createMockScheduledAbsence = (
  id: number,
  name: string
): IAttendanceStatusDetail => ({
  name,
  priority: "2",
  checkedInTime: null,
  onGoingTime: null,
  completedTime: null,
  patientId: id,
});

const defaultProps = {
  isOpen: true,
  onClose: mockOnClose,
  selectedDate: "2025-01-15",
  incompleteAttendances: [],
  completedAttendances: [],
  scheduledAbsences: [],
  onHandleCompletion: mockOnHandleCompletion,
  onReschedule: mockOnReschedule,
  onSubmitEndOfDay: mockOnSubmitEndOfDay,
};

describe("EndOfDayModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders modal when open", () => {
    render(<EndOfDayModal {...defaultProps} />);

    expect(
      screen.getByText("Encerramento do Dia - Atendimentos Incompletos")
    ).toBeInTheDocument();
    expect(screen.getByText("0 item(s) pendente(s)")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<EndOfDayModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText("Encerramento do Dia")).not.toBeInTheDocument();
  });

  it("displays incomplete attendances", () => {
    const incompleteAttendances = [
      createMockIncompleteAttendance(1, "João Silva"),
      createMockIncompleteAttendance(2, "Maria Santos"),
    ];

    render(
      <EndOfDayModal
        {...defaultProps}
        incompleteAttendances={incompleteAttendances}
      />
    );

    expect(
      screen.getByText("Atendimentos Incompletos (2)")
    ).toBeInTheDocument();
    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.getByText("Maria Santos")).toBeInTheDocument();
    expect(screen.getByText("2 item(s) pendente(s)")).toBeInTheDocument();
  });

  it("allows completing individual attendances", () => {
    const incompleteAttendances = [
      createMockIncompleteAttendance(1, "João Silva"),
    ];

    render(
      <EndOfDayModal
        {...defaultProps}
        incompleteAttendances={incompleteAttendances}
      />
    );

    const finalizeButton = screen.getByText("Finalizar");
    fireEvent.click(finalizeButton);

    expect(
      screen.getByText("✓ Todos os atendimentos foram finalizados")
    ).toBeInTheDocument();
  });

  it("navigates to absences step when no incomplete attendances", async () => {
    const scheduledAbsences = [createMockScheduledAbsence(1, "Pedro Costa")];

    render(
      <EndOfDayModal {...defaultProps} scheduledAbsences={scheduledAbsences} />
    );

    const nextButton = screen.getByText("Próximo");
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(nextButton);

    expect(
      screen.getByText("Encerramento do Dia - Justificação de Faltas")
    ).toBeInTheDocument();
    expect(screen.getByText("Justificação de Faltas (1)")).toBeInTheDocument();
    expect(screen.getByText("Pedro Costa")).toBeInTheDocument();
  });

  it("displays scheduled absences for justification", () => {
    const scheduledAbsences = [
      createMockScheduledAbsence(1, "Pedro Costa"),
      createMockScheduledAbsence(2, "Ana Oliveira"),
    ];

    render(
      <EndOfDayModal {...defaultProps} scheduledAbsences={scheduledAbsences} />
    );

    // Navigate to absences step
    fireEvent.click(screen.getByText("Próximo"));

    expect(screen.getByText("Pedro Costa")).toBeInTheDocument();
    expect(screen.getByText("Ana Oliveira")).toBeInTheDocument();

    // Check that radio buttons are present
    const justifiedRadios = screen.getAllByText("Justificada");
    const notJustifiedRadios = screen.getAllByText("Não Justificada");

    expect(justifiedRadios).toHaveLength(2);
    expect(notJustifiedRadios).toHaveLength(2);
  });

  it("handles absence justification selection", () => {
    const scheduledAbsences = [createMockScheduledAbsence(1, "Pedro Costa")];

    render(
      <EndOfDayModal {...defaultProps} scheduledAbsences={scheduledAbsences} />
    );

    // Navigate to absences step
    fireEvent.click(screen.getByText("Próximo"));

    // Select justified
    const justifiedRadios = screen.getAllByRole("radio");
    const justifiedRadio = justifiedRadios.find(
      (radio) => radio.getAttribute("name") === "justified-1"
    );
    fireEvent.click(justifiedRadio!);

    expect(justifiedRadio).toBeChecked();

    // Add notes
    const notesTextarea = screen.getByPlaceholderText(
      "Observações sobre a falta..."
    );
    fireEvent.change(notesTextarea, {
      target: { value: "Paciente comunicou antecipadamente" },
    });

    expect(notesTextarea).toHaveValue("Paciente comunicou antecipadamente");
  });

  it("prevents navigation to confirmation without justifying all absences", () => {
    const scheduledAbsences = [createMockScheduledAbsence(1, "Pedro Costa")];

    render(
      <EndOfDayModal {...defaultProps} scheduledAbsences={scheduledAbsences} />
    );

    // Navigate to absences step
    fireEvent.click(screen.getByText("Próximo"));

    // Try to proceed without justifying
    const nextButton = screen.getByText("Próximo");
    expect(nextButton).toBeDisabled();
  });

  it("navigates to confirmation step when all absences are justified", () => {
    const scheduledAbsences = [createMockScheduledAbsence(1, "Pedro Costa")];

    render(
      <EndOfDayModal {...defaultProps} scheduledAbsences={scheduledAbsences} />
    );

    // Navigate to absences step
    fireEvent.click(screen.getByText("Próximo"));

    // Justify the absence
    const justifiedRadio = screen.getAllByRole("radio")[0]; // First radio (justified)
    fireEvent.click(justifiedRadio);

    // Now should be able to proceed
    const nextButton = screen.getByText("Próximo");
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(nextButton);

    expect(
      screen.getByText("Encerramento do Dia - Confirmação de Encerramento")
    ).toBeInTheDocument();
    expect(screen.getByText("Confirmação de Encerramento")).toBeInTheDocument();
  });

  it("displays summary in confirmation step", () => {
    const incompleteAttendances = [
      createMockIncompleteAttendance(1, "João Silva"),
    ];
    const scheduledAbsences = [createMockScheduledAbsence(2, "Pedro Costa")];

    render(
      <EndOfDayModal
        {...defaultProps}
        incompleteAttendances={incompleteAttendances}
        scheduledAbsences={scheduledAbsences}
      />
    );

    // Complete attendance
    fireEvent.click(screen.getByText("Finalizar"));

    // Navigate to absences
    fireEvent.click(screen.getByText("Próximo"));

    // Justify absence
    const justifiedRadio = screen.getAllByRole("radio")[0];
    fireEvent.click(justifiedRadio);

    // Navigate to confirmation
    fireEvent.click(screen.getByText("Próximo"));

    expect(screen.getByText("Resumo:")).toBeInTheDocument();
    expect(
      screen.getByText("✓ Atendimentos finalizados: 1")
    ).toBeInTheDocument();
    expect(screen.getByText("✓ Faltas processadas: 1")).toBeInTheDocument();
    expect(screen.getByText("• Faltas justificadas: 1")).toBeInTheDocument();
    expect(
      screen.getByText("• Faltas não justificadas: 0")
    ).toBeInTheDocument();
  });

  it("handles form submission", async () => {
    mockOnFinalize.mockResolvedValue();

    render(<EndOfDayModal {...defaultProps} />);

    // Navigate through all steps
    fireEvent.click(screen.getByText("Próximo")); // incomplete -> absences
    fireEvent.click(screen.getByText("Próximo")); // absences -> confirmation

    // Submit
    fireEvent.click(screen.getByText("Finalizar Dia"));

    await waitFor(() => {
      expect(mockOnFinalize).toHaveBeenCalledWith({
        incompleteAttendances: [],
        scheduledAbsences: [],
        absenceJustifications: [],
      });
    });
  });

  it("shows loading state during submission", async () => {
    const delayedFinalize = jest
      .fn<(data: EndOfDayData) => Promise<void>>()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

    render(<EndOfDayModal {...defaultProps} onFinalize={delayedFinalize} />);

    // Navigate to confirmation
    fireEvent.click(screen.getByText("Próximo")); // incomplete -> absences
    fireEvent.click(screen.getByText("Próximo")); // absences -> confirmation

    // Submit
    fireEvent.click(screen.getByText("Finalizar Dia"));

    expect(screen.getByText("Finalizando...")).toBeInTheDocument();
    expect(screen.getByText("Cancelar")).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText("Finalizar Dia")).toBeInTheDocument();
    });
  });

  it("handles cancel action", () => {
    render(<EndOfDayModal {...defaultProps} />);

    fireEvent.click(screen.getByText("Cancelar"));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("allows navigation backward between steps", () => {
    render(<EndOfDayModal {...defaultProps} />);

    // Navigate forward
    fireEvent.click(screen.getByText("Próximo")); // incomplete -> absences
    fireEvent.click(screen.getByText("Próximo")); // absences -> confirmation

    expect(screen.getByText("Confirmação de Encerramento")).toBeInTheDocument();

    // Navigate backward
    fireEvent.click(screen.getByText("Voltar"));
    expect(screen.getByText(/Justificação de Faltas/)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Voltar"));
    expect(screen.getByText(/Atendimentos Incompletos/)).toBeInTheDocument();
  });

  it("validates all absences have justification before submission", async () => {
    const scheduledAbsences = [createMockScheduledAbsence(1, "Pedro Costa")];

    render(
      <EndOfDayModal {...defaultProps} scheduledAbsences={scheduledAbsences} />
    );

    // Navigate to confirmation without justifying absences
    fireEvent.click(screen.getByText("Próximo")); // incomplete -> absences
    fireEvent.click(screen.getByText("Próximo")); // absences -> confirmation

    // Try to submit
    fireEvent.click(screen.getByText("Finalizar Dia"));

    await waitFor(() => {
      expect(
        screen.getByText("Justificação de falta pendente para 1 paciente(s)")
      ).toBeInTheDocument();
    });

    expect(mockOnFinalize).not.toHaveBeenCalled();
  });

  it("disables form during external loading", () => {
    render(<EndOfDayModal {...defaultProps} isLoading={true} />);

    expect(screen.getByText("Cancelar")).toBeDisabled();
    expect(screen.getByText("Próximo")).toBeDisabled();
  });
});
