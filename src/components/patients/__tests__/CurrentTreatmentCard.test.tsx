import React from "react";
import { render, screen, fireEvent, waitFor } from "../../../test/testUtils";
import { CurrentTreatmentCard } from "../CurrentTreatmentCard";
import { Patient } from "@/types/types";
import {
  useTreatmentSessions,
  useDeleteTreatmentSession,
} from "../../../hooks/useTreatmentSessionsQueries";
import { useTreatmentRecords } from "../../../hooks/useTreatmentRecords";

// Mock the React Query hook
jest.mock("../../../hooks/usePatientQueries", () => ({
  useUpdatePatient: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
    error: null,
  })),
}));

// Mock the treatment sessions hooks
const mockMutateAsync = jest.fn();
const mockRefetch = jest.fn();

jest.mock("../../../hooks/useTreatmentSessionsQueries", () => ({
  useTreatmentSessions: jest.fn(() => ({
    treatmentSessions: [],
    loading: false,
    error: null,
    refetch: mockRefetch,
  })),
  useDeleteTreatmentSession: jest.fn(() => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
    error: null,
  })),
}));

// Mock the treatment records hook
jest.mock("../../../hooks/useTreatmentRecords", () => ({
  useTreatmentRecords: jest.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
  useCreateTreatmentRecord: jest.fn(() => ({
    mutateAsync: jest.fn(),
    isPending: false,
    error: null,
  })),
  useUpdateTreatmentRecord: jest.fn(() => ({
    mutateAsync: jest.fn(),
    isPending: false,
    error: null,
  })),
}));

// Mock attendance queries hooks
jest.mock("../../../hooks/useAttendanceQueries", () => ({
  useCreateAttendance: jest.fn(() => ({
    mutateAsync: jest.fn(),
    isPending: false,
    error: null,
  })),
}));

const mockPatient: Patient = {
  id: "1",
  name: "João Silva",
  phone: "(11) 99999-9999",
  birthDate: new Date("1980-05-15"),
  mainComplaint: "Dores de cabeça frequentes",
  status: "A",
  priority: "2",
  startDate: new Date("2024-01-15"),
  dischargeDate: new Date("2024-06-15"),
  timezone: "America/Sao_Paulo",
  nextAttendanceDates: [
    {
      date: new Date("2024-12-28"),
      type: "spiritual",
    },
  ],
  currentRecommendations: {
    date: new Date("2024-12-20"),
    food: "Leve",
    water: "2L/dia",
    ointment: "Aplicar 2x/dia",
    lightBath: true,
    rod: false,
    spiritualTreatment: true,
    returnWeeks: 2,
  },
  previousAttendances: [],
};

// Mock formatDateBR utility
jest.mock("@/utils/dateHelpers", () => ({
  formatDateBR: (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  },
}));

describe("CurrentTreatmentCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders treatment card with correct title", () => {
    render(<CurrentTreatmentCard patient={mockPatient} />);

    expect(screen.getByText("Consulta Espiritual")).toBeInTheDocument();
  });

  it("displays treatment timeline information", () => {
    render(<CurrentTreatmentCard patient={mockPatient} />);

    expect(screen.getByText("Início do Tratamento")).toBeInTheDocument();
    expect(screen.getByText("Próximo Atendimento")).toBeInTheDocument();
    expect(screen.getByText("Alta Prevista")).toBeInTheDocument();
  });

  it("shows discharge date when available", () => {
    render(<CurrentTreatmentCard patient={mockPatient} />);

    // Should show the formatted discharge date
    expect(screen.queryByText("Não definida")).not.toBeInTheDocument();
  });

  it('shows "Não definida" when discharge date is null', () => {
    const patientWithoutDischarge = { ...mockPatient, dischargeDate: null };
    render(<CurrentTreatmentCard patient={patientWithoutDischarge} />);

    expect(screen.getByText("Não definida")).toBeInTheDocument();
  });

  it("displays current recommendations section", () => {
    render(<CurrentTreatmentCard patient={mockPatient} />);

    expect(screen.getByText(/Últimas Recomendações/)).toBeInTheDocument();
    expect(screen.getByText("🍎 Alimentação:")).toBeInTheDocument();
    expect(screen.getByText("💧 Água:")).toBeInTheDocument();
    expect(screen.getByText("🧴 Pomada:")).toBeInTheDocument();
    expect(screen.getByText("✨ Banho de luz:")).toBeInTheDocument();
    expect(screen.getByText("🪄 Bastão:")).toBeInTheDocument();
    expect(screen.getByText("🥼 Trat. Espiritual:")).toBeInTheDocument();
  });

  it("displays recommendation values correctly", () => {
    render(<CurrentTreatmentCard patient={mockPatient} />);

    expect(screen.getByText("Leve")).toBeInTheDocument();
    expect(screen.getByText("2L/dia")).toBeInTheDocument();
    expect(screen.getByText("Aplicar 2x/dia")).toBeInTheDocument();
    expect(screen.getByText("2 semanas")).toBeInTheDocument();
  });

  it("shows treatment status badges with correct active/inactive states", () => {
    render(<CurrentTreatmentCard patient={mockPatient} />);

    // Light bath is true, so should show "Sim"
    const lightBathElements = screen.getAllByText("Sim");
    expect(lightBathElements.length).toBeGreaterThan(0);

    // Rod is false, so should show "nenhuma"
    const rodElements = screen.getAllByText("nenhuma");
    expect(rodElements.length).toBeGreaterThan(0);
  });

  it("renders treatment status badges for all boolean recommendations", () => {
    render(<CurrentTreatmentCard patient={mockPatient} />);

    // Should have TreatmentStatusBadge components for lightBath, rod, and spiritualTreatment
    const statusBadges = screen.getAllByText(/Sim|nenhuma/);
    expect(statusBadges.length).toBeGreaterThanOrEqual(2); // lightBath and spiritualTreatment show "Sim", rod shows "nenhuma"
  });

  describe("Delete Treatment Session Functionality", () => {
    const mockTreatmentSession = {
      id: 1,
      treatment_record_id: 1,
      attendance_id: 1,
      patient_id: 1,
      treatment_type: "light_bath" as const,
      body_location: "Cabeça",
      start_date: "2025-01-01",
      planned_sessions: 10,
      completed_sessions: 3,
      status: "in_progress" as const,
      duration_minutes: 30,
      color: "azul",
      notes: "Tratamento indo bem",
      sessionRecords: [],
      created_at: "2025-01-01T10:00:00Z",
      updated_at: "2025-01-01T10:00:00Z",
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("renders delete buttons for treatment sessions", () => {
      // Mock the hook to return treatment sessions
      (useTreatmentSessions as jest.Mock).mockReturnValue({
        treatmentSessions: [mockTreatmentSession],
        loading: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<CurrentTreatmentCard patient={mockPatient} />);

      // Look for delete buttons (trash icon)
      const deleteButtons = screen.getAllByTitle("Remover sessão");
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it("calls delete function when delete button is clicked", async () => {
      // Mock successful deletion
      mockMutateAsync.mockResolvedValue(true);

      // Mock the hook to return treatment sessions
      (useTreatmentSessions as jest.Mock).mockReturnValue({
        treatmentSessions: [mockTreatmentSession],
        loading: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<CurrentTreatmentCard patient={mockPatient} />);

      const deleteButton = screen.getAllByTitle("Remover sessão")[0];
      fireEvent.click(deleteButton);

      // Verify confirmation modal is shown
      expect(
        screen.getByText("Remover Sessão de Tratamento")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Esta ação não pode ser desfeita.")
      ).toBeInTheDocument();
      // Check that the modal contains both the question text and the treatment type
      expect(
        screen.getByText(/Tem certeza que deseja remover esta sessão de/)
      ).toBeInTheDocument();

      // Click confirm button in modal
      const confirmButton = screen.getByRole("button", { name: "Remover" });
      fireEvent.click(confirmButton);

      // Wait for the deletion to be called
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith("1");
        expect(mockRefetch).toHaveBeenCalled();
      });
    });

    it("does not delete when user cancels confirmation", async () => {
      // Mock the hook to return treatment sessions
      (useTreatmentSessions as jest.Mock).mockReturnValue({
        treatmentSessions: [mockTreatmentSession],
        loading: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<CurrentTreatmentCard patient={mockPatient} />);

      const deleteButton = screen.getAllByTitle("Remover sessão")[0];
      fireEvent.click(deleteButton);

      // Verify confirmation modal is shown
      expect(
        screen.getByText("Remover Sessão de Tratamento")
      ).toBeInTheDocument();

      // Click cancel button in modal
      const cancelButton = screen.getByRole("button", { name: "Cancelar" });
      fireEvent.click(cancelButton);

      // Verify modal is closed
      await waitFor(() => {
        expect(
          screen.queryByText("Remover Sessão de Tratamento")
        ).not.toBeInTheDocument();
      });

      // Verify deletion was not called (since user cancelled)
      expect(mockMutateAsync).not.toHaveBeenCalled();
      expect(mockRefetch).not.toHaveBeenCalled();
    });

    it("shows delete error when deletion fails", () => {
      // Mock the hook to return an error state
      (useDeleteTreatmentSession as jest.Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: { message: "Erro ao remover sessão" },
      });

      render(<CurrentTreatmentCard patient={mockPatient} />);

      // Should display the error message
      expect(
        screen.getByText(
          "Erro ao remover sessão de tratamento: Erro ao remover sessão"
        )
      ).toBeInTheDocument();
    });

    it("disables delete buttons when deletion is in progress", () => {
      // Mock the hook to return deleting state
      (useDeleteTreatmentSession as jest.Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: true,
        error: null,
      });

      // Mock the hook to return treatment sessions
      (useTreatmentSessions as jest.Mock).mockReturnValue({
        treatmentSessions: [mockTreatmentSession],
        loading: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<CurrentTreatmentCard patient={mockPatient} />);

      const deleteButtons = screen.getAllByTitle("Remover sessão");
      expect(deleteButtons[0]).toBeDisabled();
    });

    it("renders delete buttons for different treatment types", () => {
      const mockRodSession = {
        ...mockTreatmentSession,
        id: 2,
        treatment_type: "rod" as const,
      };

      // Mock the hook to return both types of treatment sessions
      (useTreatmentSessions as jest.Mock).mockReturnValue({
        treatmentSessions: [mockTreatmentSession, mockRodSession],
        loading: false,
        error: null,
        refetch: mockRefetch,
      });

      // Ensure delete hook is not in deleting state
      (useDeleteTreatmentSession as jest.Mock).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
        error: null,
      });

      render(<CurrentTreatmentCard patient={mockPatient} />);

      const deleteButtons = screen.getAllByTitle("Remover sessão");
      expect(deleteButtons.length).toBeGreaterThanOrEqual(1);

      // Verify delete buttons are present and enabled
      deleteButtons.forEach((button) => {
        expect(button).toBeInTheDocument();
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe("Treatment Records Integration", () => {
    it("should display recommendations from latest treatment record when available", () => {
      // Mock treatment records with a record for this patient
      const mockTreatmentRecord = {
        id: 1,
        attendance_id: 123, // This should match one of the patient's attendance IDs
        food: "Evitar carne vermelha",
        water: "Beber água energizada",
        ointments: "Aplicar pomada de arnica",
        light_bath: true,
        light_bath_color: "azul",
        rod: false,
        spiritual_treatment: true,
        return_in_weeks: 4,
        notes: "Paciente respondendo bem ao tratamento",
        created_at: "2024-10-28T10:00:00.000Z",
        updated_at: "2024-10-28T10:00:00.000Z",
      };

      // Mock the treatment records hook to return our test record
      (useTreatmentRecords as jest.Mock).mockReturnValue({
        data: [mockTreatmentRecord],
        isLoading: false,
        error: null,
      });

      // Create a patient with an attendance ID matching the treatment record
      const patientWithAttendance: Patient = {
        ...mockPatient,
        previousAttendances: [
          {
            attendanceId: "123", // This matches the treatment record attendance_id
            date: new Date("2024-10-25"),
            type: "spiritual",
            notes: "Primeira consulta",
            recommendations: null,
          },
        ],
        currentRecommendations: {
          date: new Date(),
          food: "",
          water: "",
          ointment: "",
          lightBath: false,
          rod: false,
          spiritualTreatment: false,
          returnWeeks: 0,
        },
      };

      render(<CurrentTreatmentCard patient={patientWithAttendance} />);

      // Verify recommendations are displayed from treatment record
      expect(screen.getByText("Evitar carne vermelha")).toBeInTheDocument();
      expect(screen.getByText("Beber água energizada")).toBeInTheDocument();
      expect(screen.getByText("Aplicar pomada de arnica")).toBeInTheDocument();
      expect(screen.getByText("4 semanas")).toBeInTheDocument();

      // Check that light bath shows "Sim" and rod shows "nenhuma"
      const lightBathElement = screen
        .getByText("✨ Banho de luz:")
        .closest("div");
      expect(lightBathElement).toHaveTextContent("Sim");

      const rodElement = screen.getByText("🪄 Bastão:").closest("div");
      expect(rodElement).toHaveTextContent("nenhuma");

      const spiritualTreatmentElement = screen
        .getByText("🥼 Trat. Espiritual:")
        .closest("div");
      expect(spiritualTreatmentElement).toHaveTextContent("Sim");
    });

    it("should fallback to patient recommendations when no treatment records available", () => {
      // Mock empty treatment records
      (useTreatmentRecords as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      const patientWithRecommendations: Patient = {
        ...mockPatient,
        currentRecommendations: {
          date: new Date("2024-10-25"),
          food: "Dieta leve",
          water: "Água comum",
          ointment: "Nenhuma pomada",
          lightBath: false,
          rod: true,
          spiritualTreatment: false,
          returnWeeks: 2,
        },
      };

      render(<CurrentTreatmentCard patient={patientWithRecommendations} />);

      // Verify fallback to patient recommendations
      expect(screen.getByText("Dieta leve")).toBeInTheDocument();
      expect(screen.getByText("Água comum")).toBeInTheDocument();
      expect(screen.getByText("Nenhuma pomada")).toBeInTheDocument();
      expect(screen.getByText("2 semanas")).toBeInTheDocument();
    });

    it("should handle loading state for treatment records", () => {
      // Mock loading state
      (useTreatmentRecords as jest.Mock).mockReturnValue({
        data: [],
        isLoading: true,
        error: null,
      });

      render(<CurrentTreatmentCard patient={mockPatient} />);

      // Component should still render without errors during loading
      expect(screen.getByText(/Status do Tratamento$/)).toBeInTheDocument();
    });
  });
});
