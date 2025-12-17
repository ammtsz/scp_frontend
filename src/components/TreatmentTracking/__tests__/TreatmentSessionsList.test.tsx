import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TreatmentSessionsList } from "../TreatmentSessionsList";
import { TreatmentSessionRecordResponseDto } from "@/api/types";
import {
  getTreatmentSessionRecordsBySession,
  completeTreatmentSessionRecord,
  markTreatmentSessionRecordMissed,
  rescheduleTreatmentSessionRecord,
} from "@/api/treatment-session-records";

// Mock the API functions
jest.mock("@/api/treatment-session-records");
const mockGetTreatmentSessionRecordsBySession =
  getTreatmentSessionRecordsBySession as jest.MockedFunction<
    typeof getTreatmentSessionRecordsBySession
  >;
const mockCompleteTreatmentSessionRecord =
  completeTreatmentSessionRecord as jest.MockedFunction<
    typeof completeTreatmentSessionRecord
  >;
const mockMarkTreatmentSessionRecordMissed =
  markTreatmentSessionRecordMissed as jest.MockedFunction<
    typeof markTreatmentSessionRecordMissed
  >;
const mockRescheduleTreatmentSessionRecord =
  rescheduleTreatmentSessionRecord as jest.MockedFunction<
    typeof rescheduleTreatmentSessionRecord
  >;

// Mock TreatmentSessionCard component
jest.mock("../TreatmentSessionCard", () => ({
  TreatmentSessionCard: ({
    sessionRecord,
    patientName,
    onComplete,
    onMarkMissed,
    onReschedule,
    showActions,
  }: {
    sessionRecord: TreatmentSessionRecordResponseDto;
    patientName?: string;
    onComplete?: (recordId: string) => void;
    onMarkMissed?: (recordId: string) => void;
    onReschedule?: (recordId: string) => void;
    showActions?: boolean;
  }) => (
    <div data-testid={`session-card-${sessionRecord.id}`}>
      <div>Session #{sessionRecord.session_number}</div>
      <div>Status: {sessionRecord.status}</div>
      <div>Patient: {patientName}</div>
      <div>Show Actions: {showActions ? "true" : "false"}</div>
      {showActions && (
        <div>
          <button onClick={() => onComplete?.(sessionRecord.id.toString())}>
            Complete Session
          </button>
          <button onClick={() => onMarkMissed?.(sessionRecord.id.toString())}>
            Mark Missed
          </button>
          <button onClick={() => onReschedule?.(sessionRecord.id.toString())}>
            Reschedule
          </button>
        </div>
      )}
    </div>
  ),
}));

// Mock window.prompt for reschedule testing
const originalPrompt = window.prompt;

const createMockSessionRecord = (
  overrides: Partial<TreatmentSessionRecordResponseDto> = {}
): TreatmentSessionRecordResponseDto => ({
  id: 1,
  treatment_session_id: 101,
  session_number: 1,
  scheduled_date: "2024-01-15T10:00:00Z",
  status: "scheduled",
  notes: "Session notes",
  created_at: "2024-01-01T10:00:00Z",
  updated_at: "2024-01-01T10:00:00Z",
  end_time: undefined,
  missed_reason: undefined,
  ...overrides,
});

describe("TreatmentSessionsList", () => {
  const defaultProps = {
    treatmentSessionId: "101",
    patientName: "João Silva",
    showActions: true,
    onRecordUpdate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window.prompt
    window.prompt = originalPrompt;
  });

  afterEach(() => {
    window.prompt = originalPrompt;
  });

  describe("Loading State", () => {
    it("displays loading state initially", () => {
      mockGetTreatmentSessionRecordsBySession.mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep loading state
      );

      render(<TreatmentSessionsList {...defaultProps} />);

      expect(
        screen.getByText("Carregando registros de sessão...")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Carregando registros de sessão...")
      ).toBeVisible();
    });
  });

  describe("Data Loading", () => {
    it("loads and displays session records successfully", async () => {
      const mockRecords = [
        createMockSessionRecord({
          id: 1,
          session_number: 1,
          status: "scheduled",
        }),
        createMockSessionRecord({
          id: 2,
          session_number: 2,
          status: "completed",
        }),
      ];

      mockGetTreatmentSessionRecordsBySession.mockResolvedValue({
        success: true,
        value: mockRecords,
        error: undefined,
      });

      render(<TreatmentSessionsList {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Sessões (2)")).toBeInTheDocument();
      });

      expect(screen.getByTestId("session-card-1")).toBeInTheDocument();
      expect(screen.getByTestId("session-card-2")).toBeInTheDocument();
    });

    it("sorts records by session number", async () => {
      const mockRecords = [
        createMockSessionRecord({
          id: 3,
          session_number: 3,
          status: "scheduled",
        }),
        createMockSessionRecord({
          id: 1,
          session_number: 1,
          status: "completed",
        }),
        createMockSessionRecord({
          id: 2,
          session_number: 2,
          status: "scheduled",
        }),
      ];

      mockGetTreatmentSessionRecordsBySession.mockResolvedValue({
        success: true,
        value: mockRecords,
        error: undefined,
      });

      render(<TreatmentSessionsList {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Sessões (3)")).toBeInTheDocument();
      });

      const sessionCards = screen.getAllByText(/Session #/);
      expect(sessionCards[0]).toHaveTextContent("Session #1");
      expect(sessionCards[1]).toHaveTextContent("Session #2");
      expect(sessionCards[2]).toHaveTextContent("Session #3");
    });

    it("calls API with correct treatment session ID", async () => {
      mockGetTreatmentSessionRecordsBySession.mockResolvedValue({
        success: true,
        value: [],
        error: undefined,
      });

      render(
        <TreatmentSessionsList {...defaultProps} treatmentSessionId="123" />
      );

      await waitFor(() => {
        expect(mockGetTreatmentSessionRecordsBySession).toHaveBeenCalledWith(
          "123"
        );
      });
    });

    it("does not load records when treatmentSessionId is empty", () => {
      render(<TreatmentSessionsList {...defaultProps} treatmentSessionId="" />);

      expect(mockGetTreatmentSessionRecordsBySession).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("displays error message when API call fails", async () => {
      mockGetTreatmentSessionRecordsBySession.mockResolvedValue({
        success: false,
        value: undefined,
        error: "Network error",
      });

      render(<TreatmentSessionsList {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Network error")).toBeInTheDocument();
      });

      expect(screen.getByText("Tentar novamente")).toBeInTheDocument();
    });

    it("displays generic error message when no specific error provided", async () => {
      mockGetTreatmentSessionRecordsBySession.mockResolvedValue({
        success: false,
        value: undefined,
        error: undefined,
      });

      render(<TreatmentSessionsList {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText("Erro ao carregar registros de sessão")
        ).toBeInTheDocument();
      });
    });

    it("displays error message when API throws exception", async () => {
      mockGetTreatmentSessionRecordsBySession.mockRejectedValue(
        new Error("Network error")
      );

      render(<TreatmentSessionsList {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText("Erro inesperado ao carregar registros")
        ).toBeInTheDocument();
      });
    });

    it("retries loading when retry button is clicked", async () => {
      // First call fails
      mockGetTreatmentSessionRecordsBySession.mockResolvedValueOnce({
        success: false,
        value: undefined,
        error: "Network error",
      });

      // Second call succeeds
      mockGetTreatmentSessionRecordsBySession.mockResolvedValueOnce({
        success: true,
        value: [createMockSessionRecord()],
        error: undefined,
      });

      render(<TreatmentSessionsList {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Network error")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Tentar novamente"));

      await waitFor(() => {
        expect(screen.getByText("Sessões (1)")).toBeInTheDocument();
      });

      expect(mockGetTreatmentSessionRecordsBySession).toHaveBeenCalledTimes(2);
    });
  });

  describe("Empty State", () => {
    it("displays empty state when no records found", async () => {
      mockGetTreatmentSessionRecordsBySession.mockResolvedValue({
        success: true,
        value: [],
        error: undefined,
      });

      render(<TreatmentSessionsList {...defaultProps} />);

      await waitFor(() => {
        expect(
          screen.getByText("Nenhum registro de sessão encontrado.")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Props Propagation", () => {
    it("passes correct props to TreatmentSessionCard components", async () => {
      const mockRecords = [
        createMockSessionRecord({ id: 1, session_number: 1 }),
      ];

      mockGetTreatmentSessionRecordsBySession.mockResolvedValue({
        success: true,
        value: mockRecords,
        error: undefined,
      });

      render(
        <TreatmentSessionsList
          {...defaultProps}
          patientName="Maria Silva"
          showActions={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("Patient: Maria Silva")).toBeInTheDocument();
        expect(screen.getByText("Show Actions: false")).toBeInTheDocument();
      });
    });

    it("passes undefined patient name when not provided", async () => {
      const mockRecords = [
        createMockSessionRecord({ id: 1, session_number: 1 }),
      ];

      mockGetTreatmentSessionRecordsBySession.mockResolvedValue({
        success: true,
        value: mockRecords,
        error: undefined,
      });

      render(
        <TreatmentSessionsList {...defaultProps} patientName={undefined} />
      );

      await waitFor(() => {
        expect(screen.getByText("Patient:")).toBeInTheDocument(); // undefined displays as empty
      });
    });
  });

  describe("Session Actions", () => {
    beforeEach(async () => {
      const mockRecords = [
        createMockSessionRecord({
          id: 1,
          session_number: 1,
          status: "scheduled",
        }),
      ];

      mockGetTreatmentSessionRecordsBySession.mockResolvedValue({
        success: true,
        value: mockRecords,
        error: undefined,
      });
    });

    describe("Complete Session", () => {
      it("completes session successfully", async () => {
        mockCompleteTreatmentSessionRecord.mockResolvedValue({
          success: true,
          value: createMockSessionRecord({ id: 1, status: "completed" }),
          error: undefined,
        });

        render(<TreatmentSessionsList {...defaultProps} />);

        await waitFor(() => {
          expect(screen.getByTestId("session-card-1")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Complete Session"));

        await waitFor(() => {
          expect(mockCompleteTreatmentSessionRecord).toHaveBeenCalledWith("1", {
            notes: "Sessão completada",
          });
        });

        expect(mockGetTreatmentSessionRecordsBySession).toHaveBeenCalledTimes(
          2
        ); // Initial load + reload
        expect(defaultProps.onRecordUpdate).toHaveBeenCalled();
      });

      it("handles complete session error", async () => {
        mockCompleteTreatmentSessionRecord.mockResolvedValue({
          success: false,
          value: undefined,
          error: "Cannot complete session",
        });

        render(<TreatmentSessionsList {...defaultProps} />);

        await waitFor(() => {
          expect(screen.getByTestId("session-card-1")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Complete Session"));

        await waitFor(() => {
          expect(
            screen.getByText("Cannot complete session")
          ).toBeInTheDocument();
        });

        expect(defaultProps.onRecordUpdate).not.toHaveBeenCalled();
      });

      it("handles complete session exception", async () => {
        mockCompleteTreatmentSessionRecord.mockRejectedValue(
          new Error("Network error")
        );

        render(<TreatmentSessionsList {...defaultProps} />);

        await waitFor(() => {
          expect(screen.getByTestId("session-card-1")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Complete Session"));

        await waitFor(() => {
          expect(
            screen.getByText("Erro inesperado ao completar sessão")
          ).toBeInTheDocument();
        });
      });
    });

    describe("Mark Missed Session", () => {
      it("marks session as missed successfully", async () => {
        mockMarkTreatmentSessionRecordMissed.mockResolvedValue({
          success: true,
          value: createMockSessionRecord({ id: 1, status: "missed" }),
          error: undefined,
        });

        render(<TreatmentSessionsList {...defaultProps} />);

        await waitFor(() => {
          expect(screen.getByTestId("session-card-1")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Mark Missed"));

        await waitFor(() => {
          expect(mockMarkTreatmentSessionRecordMissed).toHaveBeenCalledWith(
            "1",
            {
              missed_reason: "Paciente não compareceu",
            }
          );
        });

        expect(mockGetTreatmentSessionRecordsBySession).toHaveBeenCalledTimes(
          2
        ); // Initial load + reload
        expect(defaultProps.onRecordUpdate).toHaveBeenCalled();
      });

      it("handles mark missed error", async () => {
        mockMarkTreatmentSessionRecordMissed.mockResolvedValue({
          success: false,
          value: undefined,
          error: "Cannot mark as missed",
        });

        render(<TreatmentSessionsList {...defaultProps} />);

        await waitFor(() => {
          expect(screen.getByTestId("session-card-1")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Mark Missed"));

        await waitFor(() => {
          expect(screen.getByText("Cannot mark as missed")).toBeInTheDocument();
        });

        expect(defaultProps.onRecordUpdate).not.toHaveBeenCalled();
      });

      it("handles mark missed exception", async () => {
        mockMarkTreatmentSessionRecordMissed.mockRejectedValue(
          new Error("Network error")
        );

        render(<TreatmentSessionsList {...defaultProps} />);

        await waitFor(() => {
          expect(screen.getByTestId("session-card-1")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Mark Missed"));

        await waitFor(() => {
          expect(
            screen.getByText("Erro inesperado ao marcar como perdido")
          ).toBeInTheDocument();
        });
      });
    });

    describe("Reschedule Session", () => {
      it("reschedules session successfully", async () => {
        window.prompt = jest
          .fn()
          .mockReturnValueOnce("2024-01-20") // new date
          .mockReturnValueOnce("14:30"); // new time

        mockRescheduleTreatmentSessionRecord.mockResolvedValue({
          success: true,
          value: createMockSessionRecord({
            id: 1,
            scheduled_date: "2024-01-20T14:30:00Z",
          }),
          error: undefined,
        });

        render(<TreatmentSessionsList {...defaultProps} />);

        await waitFor(() => {
          expect(screen.getByTestId("session-card-1")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Reschedule"));

        await waitFor(() => {
          expect(mockRescheduleTreatmentSessionRecord).toHaveBeenCalledWith(
            "1",
            {
              new_date: "2024-01-20",
              new_time: "14:30",
            }
          );
        });

        expect(mockGetTreatmentSessionRecordsBySession).toHaveBeenCalledTimes(
          2
        ); // Initial load + reload
        expect(defaultProps.onRecordUpdate).toHaveBeenCalled();
      });

      it("does not reschedule when user cancels date prompt", async () => {
        window.prompt = jest.fn().mockReturnValue(null); // User cancels

        render(<TreatmentSessionsList {...defaultProps} />);

        await waitFor(() => {
          expect(screen.getByTestId("session-card-1")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Reschedule"));

        expect(mockRescheduleTreatmentSessionRecord).not.toHaveBeenCalled();
      });

      it("does not reschedule when user cancels time prompt", async () => {
        window.prompt = jest
          .fn()
          .mockReturnValueOnce("2024-01-20") // new date
          .mockReturnValueOnce(null); // User cancels time

        render(<TreatmentSessionsList {...defaultProps} />);

        await waitFor(() => {
          expect(screen.getByTestId("session-card-1")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Reschedule"));

        expect(mockRescheduleTreatmentSessionRecord).not.toHaveBeenCalled();
      });

      it("handles reschedule error", async () => {
        window.prompt = jest
          .fn()
          .mockReturnValueOnce("2024-01-20")
          .mockReturnValueOnce("14:30");

        mockRescheduleTreatmentSessionRecord.mockResolvedValue({
          success: false,
          value: undefined,
          error: "Cannot reschedule session",
        });

        render(<TreatmentSessionsList {...defaultProps} />);

        await waitFor(() => {
          expect(screen.getByTestId("session-card-1")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Reschedule"));

        await waitFor(() => {
          expect(
            screen.getByText("Cannot reschedule session")
          ).toBeInTheDocument();
        });

        expect(defaultProps.onRecordUpdate).not.toHaveBeenCalled();
      });

      it("handles reschedule exception", async () => {
        window.prompt = jest
          .fn()
          .mockReturnValueOnce("2024-01-20")
          .mockReturnValueOnce("14:30");

        mockRescheduleTreatmentSessionRecord.mockRejectedValue(
          new Error("Network error")
        );

        render(<TreatmentSessionsList {...defaultProps} />);

        await waitFor(() => {
          expect(screen.getByTestId("session-card-1")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Reschedule"));

        await waitFor(() => {
          expect(
            screen.getByText("Erro inesperado ao reagendar sessão")
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe("Large Record Sets", () => {
    it("shows record count information for large lists", async () => {
      const mockRecords = Array.from({ length: 15 }, (_, i) =>
        createMockSessionRecord({ id: i + 1, session_number: i + 1 })
      );

      mockGetTreatmentSessionRecordsBySession.mockResolvedValue({
        success: true,
        value: mockRecords,
        error: undefined,
      });

      render(<TreatmentSessionsList {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Sessões (15)")).toBeInTheDocument();
        expect(
          screen.getByText("Mostrando todas as 15 sessões")
        ).toBeInTheDocument();
      });
    });

    it("does not show record count information for small lists", async () => {
      const mockRecords = Array.from({ length: 5 }, (_, i) =>
        createMockSessionRecord({ id: i + 1, session_number: i + 1 })
      );

      mockGetTreatmentSessionRecordsBySession.mockResolvedValue({
        success: true,
        value: mockRecords,
        error: undefined,
      });

      render(<TreatmentSessionsList {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText("Sessões (5)")).toBeInTheDocument();
        expect(
          screen.queryByText(/Mostrando todas as/)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Effect Dependencies", () => {
    it("reloads records when treatmentSessionId changes", async () => {
      mockGetTreatmentSessionRecordsBySession.mockResolvedValue({
        success: true,
        value: [createMockSessionRecord()],
        error: undefined,
      });

      const { rerender } = render(
        <TreatmentSessionsList {...defaultProps} treatmentSessionId="101" />
      );

      await waitFor(() => {
        expect(mockGetTreatmentSessionRecordsBySession).toHaveBeenCalledWith(
          "101"
        );
      });

      mockGetTreatmentSessionRecordsBySession.mockClear();

      rerender(
        <TreatmentSessionsList {...defaultProps} treatmentSessionId="102" />
      );

      await waitFor(() => {
        expect(mockGetTreatmentSessionRecordsBySession).toHaveBeenCalledWith(
          "102"
        );
      });
    });
  });
});
