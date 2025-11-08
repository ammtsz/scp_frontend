import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PostTreatmentModal from "../PostTreatmentModal";
import * as modalStore from "@/stores/modalStore";
import * as treatmentSessionsHooks from "@/hooks/useTreatmentSessionsQueries";
import * as treatmentSessionRecordsHooks from "@/hooks/useTreatmentSessionRecordsQueries";
import { TreatmentSessionResponseDto } from "@/api/types";

// Mock dependencies
jest.mock("@/stores/modalStore");
jest.mock("@/hooks/useTreatmentSessionsQueries");
jest.mock("@/hooks/useTreatmentSessionRecordsQueries");

const mockModalStore = modalStore as jest.Mocked<typeof modalStore>;
const mockTreatmentSessionsHooks = treatmentSessionsHooks as jest.Mocked<
  typeof treatmentSessionsHooks
>;
const mockTreatmentSessionRecordsHooks =
  treatmentSessionRecordsHooks as jest.Mocked<
    typeof treatmentSessionRecordsHooks
  >;

// Test data
const mockTreatmentSessions: TreatmentSessionResponseDto[] = [
  {
    id: 1,
    treatment_record_id: 1,
    attendance_id: 1,
    patient_id: 123,
    treatment_type: "light_bath",
    body_location: "Coronário",
    start_date: "2024-01-01",
    planned_sessions: 10,
    completed_sessions: 3,
    status: "active",
    duration_minutes: 15,
    color: "Azul",
    notes: undefined,
    sessionRecords: [],
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-01-01T10:00:00Z",
  },
  {
    id: 2,
    treatment_record_id: 1,
    attendance_id: 1,
    patient_id: 123,
    treatment_type: "rod",
    body_location: "Plexo Solar",
    start_date: "2024-01-01",
    planned_sessions: 5,
    completed_sessions: 1,
    status: "active",
    duration_minutes: undefined,
    color: undefined,
    notes: undefined,
    sessionRecords: [],
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-01-01T10:00:00Z",
  },
];

const mockPostTreatmentModal = {
  isOpen: true,
  patientId: 123,
  patientName: "Test Patient",
  attendanceId: 1,
  attendanceType: "spiritual" as const,
  treatmentSessions: [],
  isLoadingSessions: false,
  onComplete: jest.fn(),
};

const mockCloseModal = jest.fn();

describe("PostTreatmentModal", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Setup default mocks
    mockModalStore.usePostTreatmentModal.mockReturnValue(
      mockPostTreatmentModal
    );
    mockModalStore.useCloseModal.mockReturnValue(mockCloseModal);

    mockTreatmentSessionsHooks.useTreatmentSessions.mockReturnValue({
      treatmentSessions: mockTreatmentSessions,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    // Setup React Query hook mock
    mockTreatmentSessionRecordsHooks.useBulkCompleteTreatmentSessionRecords.mockReturnValue(
      {
        mutateAsync: jest.fn().mockResolvedValue([]),
        isPending: false,
        error: null,
      } as unknown as ReturnType<
        typeof treatmentSessionRecordsHooks.useBulkCompleteTreatmentSessionRecords
      >
    );

    jest.clearAllMocks();
  });

  const renderModal = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <PostTreatmentModal />
      </QueryClientProvider>
    );
  };

  describe("Modal State", () => {
    it("should render when modal is open", () => {
      renderModal();

      expect(
        screen.getByText("Registrar Sessão de Tratamento")
      ).toBeInTheDocument();
      expect(screen.getByText("Paciente: Test Patient")).toBeInTheDocument();
    });

    it("should not render when modal is closed", () => {
      mockModalStore.usePostTreatmentModal.mockReturnValue({
        ...mockPostTreatmentModal,
        isOpen: false,
      });

      renderModal();

      expect(
        screen.queryByText("Registrar Sessão de Tratamento")
      ).not.toBeInTheDocument();
    });

    it("should show loading state when treatment sessions are loading", () => {
      mockTreatmentSessionsHooks.useTreatmentSessions.mockReturnValue({
        treatmentSessions: [],
        loading: true,
        error: null,
        refetch: jest.fn(),
      });

      renderModal();

      expect(screen.getByText("Carregando tratamentos...")).toBeInTheDocument();
    });

    it("should show error state when there is an error loading treatment sessions", () => {
      const errorMessage = "Failed to load sessions";
      mockTreatmentSessionsHooks.useTreatmentSessions.mockReturnValue({
        treatmentSessions: [],
        loading: false,
        error: errorMessage,
        refetch: jest.fn(),
      });

      renderModal();

      expect(
        screen.getByText(`Erro ao carregar tratamentos: ${errorMessage}`)
      ).toBeInTheDocument();
    });

    it("should show empty state when no treatment sessions exist", () => {
      mockTreatmentSessionsHooks.useTreatmentSessions.mockReturnValue({
        treatmentSessions: [],
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      renderModal();

      expect(
        screen.getByText(
          "Nenhum tratamento ativo encontrado para este paciente."
        )
      ).toBeInTheDocument();
    });
  });

  describe("Treatment Cards", () => {
    it("should display treatment cards with correct data", () => {
      renderModal();

      // Light Bath treatment
      expect(screen.getByText("Banho de Luz")).toBeInTheDocument();
      expect(screen.getByText("Coronário")).toBeInTheDocument();
      expect(screen.getByText("Cor:")).toBeInTheDocument();
      expect(screen.getByText("Azul")).toBeInTheDocument();
      expect(screen.getByText("Duração:")).toBeInTheDocument();
      expect(screen.getByText(/15.*min/)).toBeInTheDocument();
      expect(screen.getByText("3/10")).toBeInTheDocument();
      expect(screen.getByText("30% completo")).toBeInTheDocument();

      // Rod treatment
      expect(screen.getByText("Bastão")).toBeInTheDocument();
      expect(screen.getByText("Plexo Solar")).toBeInTheDocument();
      expect(screen.getByText("1/5")).toBeInTheDocument();
      expect(screen.getByText("20% completo")).toBeInTheDocument();
    });

    it("should allow toggling treatment completion", async () => {
      renderModal();

      const treatmentButtons = screen.getAllByRole("button", {
        name: /marcar como realizado nesta sessão/i,
      });
      const lightBathButton = treatmentButtons[0]; // First button is light bath

      // Initially not completed
      expect(lightBathButton).toBeInTheDocument();
      expect(
        screen.getByText("⚠️ Marque pelo menos um tratamento")
      ).toBeInTheDocument();

      // Click to mark as completed
      fireEvent.click(lightBathButton);

      await waitFor(() => {
        expect(screen.getByText("✓ Pronto para registrar")).toBeInTheDocument();
        expect(screen.getByText("Realizado nesta sessão")).toBeInTheDocument();
      });

      // Click again to unmark
      fireEvent.click(lightBathButton);

      await waitFor(() => {
        expect(
          screen.getByText("⚠️ Marque pelo menos um tratamento")
        ).toBeInTheDocument();
      });
    });

    it("should group sessions by treatment type and body location", () => {
      // Add another session with same treatment type and location
      const duplicatedSessions = [
        ...mockTreatmentSessions,
        {
          ...mockTreatmentSessions[0],
          id: 3,
          planned_sessions: 5,
          completed_sessions: 2,
        },
      ];

      mockTreatmentSessionsHooks.useTreatmentSessions.mockReturnValue({
        treatmentSessions: duplicatedSessions,
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      renderModal();

      // Should still show only one card for "Banho de Luz - Coronário"
      // but with combined sessions (10 + 5 = 15 planned, 3 + 2 = 5 completed)
      expect(screen.getByText("5/15")).toBeInTheDocument();
      expect(screen.getByText("33% completo")).toBeInTheDocument();
    });
  });

  describe("Form Interactions", () => {
    it("should handle general notes input", () => {
      renderModal();

      const notesTextarea = screen.getByPlaceholderText(
        "Adicione observações sobre a sessão de tratamento..."
      );

      fireEvent.change(notesTextarea, { target: { value: "Test notes" } });

      expect(notesTextarea).toHaveValue("Test notes");
    });

    it("should prevent submission when no treatments are marked", async () => {
      renderModal();

      const submitButton = screen.getByRole("button", {
        name: /registrar sessão/i,
      });

      expect(submitButton).toBeDisabled();

      fireEvent.click(submitButton);

      // Should not call any submit handlers
      expect(mockPostTreatmentModal.onComplete).not.toHaveBeenCalled();
    });

    it("should allow submission when at least one treatment is marked", async () => {
      renderModal();

      // Mark one treatment as completed
      const treatmentButtons = screen.getAllByRole("button", {
        name: /marcar como realizado nesta sessão/i,
      });
      const lightBathButton = treatmentButtons[0];
      fireEvent.click(lightBathButton);

      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: /registrar sessão/i,
        });
        expect(submitButton).not.toBeDisabled();
      });
    });

    it("should close modal when cancel button is clicked", () => {
      renderModal();

      const cancelButton = screen.getByRole("button", { name: /cancelar/i });
      fireEvent.click(cancelButton);

      expect(mockCloseModal).toHaveBeenCalledWith("postTreatment");
    });

    it("should close modal when X button is clicked", () => {
      renderModal();

      const closeButton = screen.getByRole("button", { name: /×/i });
      fireEvent.click(closeButton);

      expect(mockCloseModal).toHaveBeenCalledWith("postTreatment");
    });
  });

  describe("Data Integration", () => {
    it("should fetch treatment sessions for correct patient", () => {
      renderModal();

      expect(
        mockTreatmentSessionsHooks.useTreatmentSessions
      ).toHaveBeenCalledWith(123);
    });

    it("should handle missing patient ID gracefully", () => {
      mockModalStore.usePostTreatmentModal.mockReturnValue({
        ...mockPostTreatmentModal,
        patientId: undefined,
      });

      renderModal();

      expect(
        mockTreatmentSessionsHooks.useTreatmentSessions
      ).toHaveBeenCalledWith(0);
    });
  });

  describe("Visual States", () => {
    it("should apply correct styling for completed treatments", async () => {
      renderModal();

      const treatmentButtons = screen.getAllByRole("button", {
        name: /marcar como realizado nesta sessão/i,
      });
      const lightBathButton = treatmentButtons[0];
      const card = lightBathButton.closest(".bg-white");

      // Initially not completed
      expect(card).not.toHaveClass("ring-2", "ring-green-300", "bg-green-50");

      // Mark as completed
      fireEvent.click(lightBathButton);

      await waitFor(() => {
        expect(card).toHaveClass("ring-2", "ring-green-300", "bg-green-50");
      });
    });

    it("should show correct progress bars", () => {
      renderModal();

      const progressBars = document.querySelectorAll(
        ".h-2.rounded-full:not(.bg-gray-200)"
      );

      // Light bath: 30% progress
      expect(progressBars[0]).toHaveAttribute("style", "width: 30%;");
      expect(progressBars[0]).toHaveClass("bg-yellow-400");

      // Rod: 20% progress
      expect(progressBars[1]).toHaveAttribute("style", "width: 20%;");
      expect(progressBars[1]).toHaveClass("bg-blue-400");
    });
  });

  describe("Treatment Submission", () => {
    beforeEach(() => {
      // Mock getting existing records
      // TODO: Update these tests for React Query - temporarily commented out
      /*
      mockTreatmentSessionRecordsApi.getTreatmentSessionRecordsBySession.mockResolvedValue({
        success: true,
        value: [
          {
            id: 1,
            treatment_session_id: 1,
            attendance_id: 1,
            session_number: 4, // Next session to complete (completed_sessions + 1)
            scheduled_date: "2024-01-01",
            start_time: "10:00",
            end_time: undefined,
            notes: undefined,
            status: "scheduled" as const,
            missed_reason: undefined,
            performed_by: undefined,
            created_at: "2024-01-01T10:00:00Z",
            updated_at: "2024-01-01T10:00:00Z",
          }
        ]
      });

      // Mock successful completion
      mockTreatmentSessionRecordsApi.completeTreatmentSessionRecord.mockResolvedValue({
        success: true,
        value: {
          id: 1,
          treatment_session_id: 1,
          attendance_id: 1,
          session_number: 4,
          scheduled_date: "2024-01-01",
          start_time: "10:00",
          end_time: undefined,
          notes: "Test notes",
          status: "completed" as const,
          missed_reason: undefined,
          performed_by: undefined,
          created_at: "2024-01-01T10:00:00Z",
          updated_at: "2024-01-01T10:00:00Z",
        }
      });
      */
    });

    it("should call API and onComplete when treatment is submitted successfully", async () => {
      renderModal();

      // Mark one treatment as completed
      const treatmentButtons = screen.getAllByRole("button", {
        name: /marcar como realizado nesta sessão/i,
      });
      fireEvent.click(treatmentButtons[0]);

      // Add notes
      const notesTextarea = screen.getByPlaceholderText(
        "Adicione observações sobre a sessão de tratamento..."
      );
      fireEvent.change(notesTextarea, {
        target: { value: "Test treatment notes" },
      });

      // Submit
      const submitButton = screen.getByRole("button", {
        name: /registrar sessão/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          mockTreatmentSessionRecordsApi.getTreatmentSessionRecordsBySession
        ).toHaveBeenCalledWith("1");
        expect(
          mockTreatmentSessionRecordsApi.completeTreatmentSessionRecord
        ).toHaveBeenCalledWith("1", {
          completion_notes: "Test treatment notes",
        });
      });

      await waitFor(() => {
        expect(mockPostTreatmentModal.onComplete).toHaveBeenCalledWith(true);
      });
    });

    it("should handle API errors gracefully", async () => {
      mockTreatmentSessionRecordsApi.completeTreatmentSessionRecord.mockRejectedValue(
        new Error("API Error")
      );

      renderModal();

      // Mark one treatment as completed
      const treatmentButtons = screen.getAllByRole("button", {
        name: /marcar como realizado nesta sessão/i,
      });
      fireEvent.click(treatmentButtons[0]);

      // Submit
      const submitButton = screen.getByRole("button", {
        name: /registrar sessão/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/erro ao completar o tratamento/i)
        ).toBeInTheDocument();
      });

      // Should not call onComplete on error
      expect(mockPostTreatmentModal.onComplete).not.toHaveBeenCalled();
    });

    it("should show loading state during submission", async () => {
      // Make API call take some time
      mockTreatmentSessionRecordsApi.completeTreatmentSessionRecord.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  success: true,
                  value: {
                    id: 1,
                    treatment_session_id: 1,
                    attendance_id: 1,
                    session_number: 4,
                    scheduled_date: "2024-01-01",
                    status: "completed" as const,
                    created_at: "2024-01-01T10:00:00Z",
                    updated_at: "2024-01-01T10:00:00Z",
                  },
                }),
              100
            )
          )
      );

      renderModal();

      // Mark one treatment as completed
      const treatmentButtons = screen.getAllByRole("button", {
        name: /marcar como realizado nesta sessão/i,
      });
      fireEvent.click(treatmentButtons[0]);

      // Submit
      const submitButton = screen.getByRole("button", {
        name: /registrar sessão/i,
      });
      fireEvent.click(submitButton);

      // Should show loading text
      expect(
        screen.getByRole("button", { name: /registrando/i })
      ).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /registrar sessão/i })
        ).toBeInTheDocument();
      });
    });

    it("should create records for multiple treatment sessions when multiple treatments are selected", async () => {
      // Get the mock mutation function
      const mockMutateAsync = jest.fn().mockResolvedValue([]);
      mockTreatmentSessionRecordsHooks.useBulkCompleteTreatmentSessionRecords.mockReturnValue(
        {
          mutateAsync: mockMutateAsync,
          isPending: false,
        } as unknown as ReturnType<
          typeof treatmentSessionRecordsHooks.useBulkCompleteTreatmentSessionRecords
        >
      );

      renderModal();

      // Mark both treatments as completed
      const treatmentButtons = screen.getAllByRole("button", {
        name: /marcar como realizado nesta sessão/i,
      });
      fireEvent.click(treatmentButtons[0]); // Light bath
      fireEvent.click(treatmentButtons[1]); // Rod

      // Submit
      const submitButton = screen.getByRole("button", {
        name: /registrar sessão/i,
      });
      fireEvent.click(submitButton);

      // Check that the React Query mutation was called with correct data
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith([
          {
            sessionId: "1",
            completionData: {
              completion_notes: "Tratamento realizado para: Coronário",
            },
            newCompletedCount: 4,
          },
          {
            sessionId: "2",
            completionData: {
              completion_notes: "Tratamento realizado para: Plexo Solar",
            },
            newCompletedCount: 2,
          },
        ]);
      });
    });
  });
});
