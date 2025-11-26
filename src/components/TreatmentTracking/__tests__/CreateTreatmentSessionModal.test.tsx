import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CreateTreatmentSessionModal } from "../CreateTreatmentSessionModal";
import type { PatientResponseDto } from "@/api/types";
import { PatientPriority, TreatmentStatus } from "@/api/types";

// Mock data
const mockPatients: PatientResponseDto[] = [
  {
    id: 1,
    name: "João Silva",
    priority: PatientPriority.INTERMEDIATE,
    treatment_status: TreatmentStatus.IN_TREATMENT,
    birth_date: "1990-01-01",
    start_date: "2024-01-01",
    missing_appointments_streak: 0,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Maria Santos",
    priority: PatientPriority.EMERGENCY,
    treatment_status: TreatmentStatus.NEW_PATIENT,
    birth_date: "1985-05-15",
    start_date: "2024-02-01",
    missing_appointments_streak: 1,
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
  },
];

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSubmit: jest.fn(),
  patients: mockPatients,
  isLoading: false,
};

describe("CreateTreatmentSessionModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the modal when isOpen is true", () => {
    render(<CreateTreatmentSessionModal {...defaultProps} />);

    expect(
      screen.getByText("Criar Nova Sessão de Tratamento")
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Paciente/)).toBeInTheDocument();
    expect(screen.getByText(/Tipo de Tratamento/)).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(<CreateTreatmentSessionModal {...defaultProps} isOpen={false} />);

    expect(
      screen.queryByText("Criar Nova Sessão de Tratamento")
    ).not.toBeInTheDocument();
  });

  it("displays validation errors for required fields", async () => {
    render(<CreateTreatmentSessionModal {...defaultProps} />);

    const submitButton = screen.getByText("Criar Sessão");
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorMessages = screen.getAllByText("Selecione um paciente");
      expect(errorMessages).toHaveLength(2); // One in option, one in error message
      expect(
        screen.getByText("Local do corpo é obrigatório")
      ).toBeInTheDocument();
    });
  });

  it("validates light bath specific fields when light bath is selected", async () => {
    render(<CreateTreatmentSessionModal {...defaultProps} />);

    // Light bath is selected by default
    const patientSelect = screen.getByLabelText(/Paciente/);
    fireEvent.change(patientSelect, { target: { value: "1" } });

    const bodyLocationSelect = screen.getByLabelText(/Local do Corpo/);
    fireEvent.change(bodyLocationSelect, { target: { value: "Coronário" } });

    // Clear duration to trigger validation
    const durationInput = screen.getByLabelText(/Duração/);
    fireEvent.change(durationInput, { target: { value: "" } });

    const submitButton = screen.getByText("Criar Sessão");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Duração deve estar entre 1 e 10 unidades (7min cada)")
      ).toBeInTheDocument();
    });
  });

  it("calls onSubmit with correct data when form is valid", async () => {
    const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
    render(
      <CreateTreatmentSessionModal {...defaultProps} onSubmit={mockOnSubmit} />
    );

    // Fill out the form
    const patientSelect = screen.getByLabelText(/Paciente/);
    fireEvent.change(patientSelect, { target: { value: "1" } });

    const bodyLocationSelect = screen.getByLabelText(/Local do Corpo/);
    fireEvent.change(bodyLocationSelect, { target: { value: "Coronário" } });

    const plannedSessionsInput = screen.getByLabelText(/Número de Sessões/);
    fireEvent.change(plannedSessionsInput, { target: { value: "5" } });

    const submitButton = screen.getByText("Criar Sessão");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          patient_id: 1,
          treatment_type: "light_bath",
          body_location: "Coronário",
          planned_sessions: 5,
          duration_minutes: 3,
          color: "azul",
        })
      );
    });
  });

  it("switches to rod treatment type and hides light bath fields", () => {
    render(<CreateTreatmentSessionModal {...defaultProps} />);

    // First verify light bath fields are visible
    expect(screen.getByLabelText(/Duração/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cor \*/)).toBeInTheDocument();

    const rodRadio = screen.getByLabelText(/Bastão/);
    fireEvent.click(rodRadio);

    expect(screen.queryByLabelText(/Duração/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Cor \*/)).not.toBeInTheDocument();
  });

  it("calculates end date automatically based on start date and sessions", () => {
    render(<CreateTreatmentSessionModal {...defaultProps} />);

    const startDateInput = screen.getByLabelText(/Data de Início/);
    fireEvent.change(startDateInput, { target: { value: "2024-01-01" } });

    const plannedSessionsInput = screen.getByLabelText(/Número de Sessões/);
    fireEvent.change(plannedSessionsInput, { target: { value: "4" } });

    const endDateInput = screen.getByLabelText(/Data de Término Prevista/);
    expect(endDateInput).toHaveValue("2024-01-22"); // 3 weeks later (4 sessions - 1)
  });

  it("calls onClose when close button is clicked", () => {
    const mockOnClose = jest.fn();
    render(
      <CreateTreatmentSessionModal {...defaultProps} onClose={mockOnClose} />
    );

    const closeButton = screen.getByLabelText(/Close modal/i);
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("displays loading state when isLoading is true", () => {
    render(<CreateTreatmentSessionModal {...defaultProps} isLoading={true} />);

    expect(screen.getByText("Criando...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Criando.../i })).toBeDisabled();
  });

  it("shows duration in minutes when duration is selected", () => {
    render(<CreateTreatmentSessionModal {...defaultProps} />);

    const durationInput = screen.getByLabelText(/Duração/);
    fireEvent.change(durationInput, { target: { value: "5" } });

    expect(screen.getByText("35 minutos total")).toBeInTheDocument();
  });

  it("displays patient info when patient is selected", () => {
    render(<CreateTreatmentSessionModal {...defaultProps} />);

    const patientSelect = screen.getByLabelText(/Paciente/);
    fireEvent.change(patientSelect, { target: { value: "1" } });

    expect(screen.getByText("Prioridade: 2 | Status: T")).toBeInTheDocument();
  });

  it("validates planned sessions range", async () => {
    render(<CreateTreatmentSessionModal {...defaultProps} />);

    const patientSelect = screen.getByLabelText(/Paciente/);
    fireEvent.change(patientSelect, { target: { value: "1" } });

    const bodyLocationSelect = screen.getByLabelText(/Local do Corpo/);
    fireEvent.change(bodyLocationSelect, { target: { value: "Coronário" } });

    const plannedSessionsInput = screen.getByLabelText(/Número de Sessões/);
    fireEvent.change(plannedSessionsInput, { target: { value: "51" } });

    const submitButton = screen.getByText("Criar Sessão");

    // Use fireEvent.submit on the form instead of clicking the button
    const form = submitButton.closest("form");
    if (form) {
      fireEvent.submit(form);
    } else {
      fireEvent.click(submitButton);
    }

    await waitFor(() => {
      expect(
        screen.getByText("Número de sessões deve estar entre 1 e 50")
      ).toBeInTheDocument();
    });
  });
});
