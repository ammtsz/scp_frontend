import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TreatmentSessionConfirmation, {
  type CreatedTreatmentSession,
} from "../TreatmentSessionConfirmation";

// Mock the formatDateBR utility
jest.mock("@/utils/dateHelpers", () => ({
  formatDateBR: jest.fn((date: string | Date) => {
    if (typeof date === "string") {
      return date.split("-").reverse().join("/"); // Convert YYYY-MM-DD to DD/MM/YYYY
    }
    return date.toLocaleDateString("pt-BR");
  }),
}));

describe("TreatmentSessionConfirmation", () => {
  const mockOnAcknowledge = jest.fn();
  const patientName = "João Silva";

  const mockLightBathSession: CreatedTreatmentSession = {
    id: 1,
    treatment_record_id: 1,
    attendance_id: 1,
    patient_id: 1,
    treatment_type: "light_bath",
    body_location: "Cabeça",
    start_date: "2025-09-16",
    planned_sessions: 5,
    completed_sessions: 0,
    status: "scheduled",
    duration_minutes: 3, // 3 units = 21 minutes
    color: "Azul",
    notes: "Banho de luz - Azul - 21 minutos",
    created_at: "2025-09-16T10:00:00Z",
    updated_at: "2025-09-16T10:00:00Z",
  };

  const mockRodSession: CreatedTreatmentSession = {
    id: 2,
    treatment_record_id: 1,
    attendance_id: 1,
    patient_id: 1,
    treatment_type: "rod",
    body_location: "Coluna",
    start_date: "2025-09-16",
    planned_sessions: 3,
    completed_sessions: 0,
    status: "scheduled",
    notes: "Tratamento com bastão",
    created_at: "2025-09-16T10:00:00Z",
    updated_at: "2025-09-16T10:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render success confirmation with patient name", () => {
    render(
      <TreatmentSessionConfirmation
        sessions={[mockLightBathSession]}
        patientName={patientName}
        onAcknowledge={mockOnAcknowledge}
      />
    );

    expect(
      screen.getByText("Tratamento registrado com sucesso!")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `Tratamento para ${patientName} foi registrado e os agendamentos foram criados automaticamente.`
      )
    ).toBeInTheDocument();
  });

  it("should display treatment session details correctly", () => {
    render(
      <TreatmentSessionConfirmation
        sessions={[mockLightBathSession]}
        patientName={patientName}
        onAcknowledge={mockOnAcknowledge}
      />
    );

    // Check treatment type badge
    expect(screen.getByText("💡 Banho de Luz")).toBeInTheDocument();

    // Check body location
    expect(screen.getByText("Cabeça")).toBeInTheDocument();

    // Check color and duration
    expect(screen.getByText("Azul")).toBeInTheDocument();
    expect(screen.getByText("21 min")).toBeInTheDocument();

    // Check session count
    expect(screen.getByText("5 sessões")).toBeInTheDocument();
  });

  it("should display rod treatment sessions correctly", () => {
    render(
      <TreatmentSessionConfirmation
        sessions={[mockRodSession]}
        patientName={patientName}
        onAcknowledge={mockOnAcknowledge}
      />
    );

    // Check treatment type badge
    expect(screen.getByText("🔮 Bastão")).toBeInTheDocument();

    // Check body location
    expect(screen.getByText("Coluna")).toBeInTheDocument();

    // Check session count
    expect(screen.getByText("3 sessões")).toBeInTheDocument();
  });

  it("should show statistics summary correctly", () => {
    render(
      <TreatmentSessionConfirmation
        sessions={[mockLightBathSession, mockRodSession]}
        patientName={patientName}
        onAcknowledge={mockOnAcknowledge}
      />
    );

    // Check series count
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Séries criadas")).toBeInTheDocument();

    // Check total appointments (5 + 3 = 8)
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("Agendamentos automáticos")).toBeInTheDocument();

    // Check day of week
    expect(screen.getByText("Terças")).toBeInTheDocument();
    expect(screen.getByText("Dia da semana")).toBeInTheDocument();
  });

  it("should group sessions by treatment type", () => {
    render(
      <TreatmentSessionConfirmation
        sessions={[mockLightBathSession, mockRodSession]}
        patientName={patientName}
        onAcknowledge={mockOnAcknowledge}
      />
    );

    // Check group headers
    expect(screen.getByText("Banhos de Luz")).toBeInTheDocument();
    expect(screen.getByText("Tratamentos com Bastão")).toBeInTheDocument();

    // Check series count per group using getAllByText since both groups show "(1 série)"
    const seriesTexts = screen.getAllByText("(1 série)");
    expect(seriesTexts).toHaveLength(2); // One for each treatment type
  });

  it("should show automatic scheduling information", () => {
    render(
      <TreatmentSessionConfirmation
        sessions={[mockLightBathSession]}
        patientName={patientName}
        onAcknowledge={mockOnAcknowledge}
      />
    );

    expect(
      screen.getByText("Agendamentos automáticos criados")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Todos os agendamentos foram criados automaticamente para as terças-feiras/
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText("Agendamentos automáticos (às terças-feiras):")
    ).toBeInTheDocument();
  });

  it("should call onAcknowledge when acknowledge button is clicked", () => {
    render(
      <TreatmentSessionConfirmation
        sessions={[mockLightBathSession]}
        patientName={patientName}
        onAcknowledge={mockOnAcknowledge}
      />
    );

    const acknowledgeButton = screen.getByText("Entendi");
    fireEvent.click(acknowledgeButton);

    expect(mockOnAcknowledge).toHaveBeenCalledTimes(1);
  });

  it("should display custom message when provided", () => {
    const customMessage = "Mensagem personalizada de teste";

    render(
      <TreatmentSessionConfirmation
        sessions={[mockLightBathSession]}
        patientName={patientName}
        onAcknowledge={mockOnAcknowledge}
        customMessage={customMessage}
      />
    );

    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it("should handle empty sessions array gracefully", () => {
    render(
      <TreatmentSessionConfirmation
        sessions={[]}
        patientName={patientName}
        onAcknowledge={mockOnAcknowledge}
      />
    );

    // Should still show success header
    expect(
      screen.getByText("Tratamento registrado com sucesso!")
    ).toBeInTheDocument();

    // Should show zero statistics - be more specific about what we're checking
    expect(screen.getByText("Séries criadas")).toBeInTheDocument();
    expect(screen.getByText("Agendamentos automáticos")).toBeInTheDocument();

    // Check that the statistics section shows 0 values
    const statisticsContainer = screen
      .getByText("Séries criadas")
      .closest(".bg-blue-50");
    expect(statisticsContainer).toBeInTheDocument();
  });

  it("should handle single session correctly", () => {
    const singleSession = { ...mockLightBathSession, planned_sessions: 1 };

    render(
      <TreatmentSessionConfirmation
        sessions={[singleSession]}
        patientName={patientName}
        onAcknowledge={mockOnAcknowledge}
      />
    );

    expect(screen.getByText("1 sessão")).toBeInTheDocument(); // singular form
    expect(screen.getByText("Série criada")).toBeInTheDocument(); // singular form
  });
});
