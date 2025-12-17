import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TreatmentSessionCard } from "../TreatmentSessionCard";
import { TreatmentSessionRecordResponseDto } from "@/api/types";

// Mock date formatters
jest.mock("@/utils/formatters", () => ({
  formatDate: (date: string) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("pt-BR");
  },
  formatTime: (date: string) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  },
  isPast: (date: Date) => {
    return date < new Date();
  },
}));

const createMockSessionRecord = (
  overrides: Partial<TreatmentSessionRecordResponseDto> = {}
): TreatmentSessionRecordResponseDto => ({
  id: 1,
  treatment_session_id: 101,
  session_number: 1,
  scheduled_date: "2024-01-15T10:00:00Z",
  status: "scheduled",
  notes: "Primeira sessão do tratamento",
  created_at: "2024-01-01T10:00:00Z",
  updated_at: "2024-01-01T10:00:00Z",
  end_time: undefined,
  missed_reason: undefined,
  ...overrides,
});

describe("TreatmentSessionCard", () => {
  const defaultProps = {
    sessionRecord: createMockSessionRecord(),
    patientName: "João Silva",
    showActions: true,
    onComplete: jest.fn(),
    onMarkMissed: jest.fn(),
    onReschedule: jest.fn(),
  };

  // Mock current date to be after the scheduled date for predictable testing
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-16T10:00:00Z")); // Day after scheduled
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders session card with basic information", () => {
      render(<TreatmentSessionCard {...defaultProps} />);

      expect(screen.getByText("Sessão #1")).toBeInTheDocument();
      expect(screen.getByText("Agendado")).toBeInTheDocument();
      expect(screen.getByText("João Silva")).toBeInTheDocument();
      expect(screen.getByText(/ID da Sessão: 101/)).toBeInTheDocument();
    });

    it("renders without patient name when not provided", () => {
      render(
        <TreatmentSessionCard {...defaultProps} patientName={undefined} />
      );

      expect(screen.getByText("Sessão #1")).toBeInTheDocument();
      expect(screen.queryByText("João Silva")).not.toBeInTheDocument();
    });

    it("displays formatted date and time", () => {
      render(<TreatmentSessionCard {...defaultProps} />);

      // Should show formatted date and time (mocked to return locale strings)
      expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument();
      expect(screen.getByText(/02:00/)).toBeInTheDocument(); // The mock returns UTC time formatted as local
    });

    it("displays session notes when provided", () => {
      render(<TreatmentSessionCard {...defaultProps} />);

      expect(screen.getByText("Notas:")).toBeInTheDocument();
      expect(
        screen.getByText("Primeira sessão do tratamento")
      ).toBeInTheDocument();
    });

    it("does not display notes when not provided", () => {
      const sessionWithoutNotes = createMockSessionRecord({ notes: undefined });
      render(
        <TreatmentSessionCard
          {...defaultProps}
          sessionRecord={sessionWithoutNotes}
        />
      );

      expect(screen.queryByText("Notas:")).not.toBeInTheDocument();
    });
  });

  describe("Status Labels and Colors", () => {
    it("displays correct label for scheduled status", () => {
      render(
        <TreatmentSessionCard
          {...defaultProps}
          sessionRecord={createMockSessionRecord({ status: "scheduled" })}
        />
      );

      expect(screen.getByText("Agendado")).toBeInTheDocument();
    });

    it("displays correct label for completed status", () => {
      render(
        <TreatmentSessionCard
          {...defaultProps}
          sessionRecord={createMockSessionRecord({ status: "completed" })}
        />
      );

      expect(screen.getByText("Completo")).toBeInTheDocument();
    });

    it("displays correct label for missed status", () => {
      render(
        <TreatmentSessionCard
          {...defaultProps}
          sessionRecord={createMockSessionRecord({ status: "missed" })}
        />
      );

      expect(screen.getByText("Perdido")).toBeInTheDocument();
    });

    it("displays correct label for cancelled status", () => {
      render(
        <TreatmentSessionCard
          {...defaultProps}
          sessionRecord={createMockSessionRecord({ status: "cancelled" })}
        />
      );

      expect(screen.getByText("Cancelado")).toBeInTheDocument();
    });

    it("applies correct CSS classes for scheduled status", () => {
      render(
        <TreatmentSessionCard
          {...defaultProps}
          sessionRecord={createMockSessionRecord({ status: "scheduled" })}
        />
      );

      const statusSpan = screen.getByText("Agendado");
      expect(statusSpan).toHaveClass(
        "bg-blue-100",
        "text-blue-800",
        "border-blue-300"
      );
    });

    it("applies correct CSS classes for completed status", () => {
      render(
        <TreatmentSessionCard
          {...defaultProps}
          sessionRecord={createMockSessionRecord({ status: "completed" })}
        />
      );

      const statusSpan = screen.getByText("Completo");
      expect(statusSpan).toHaveClass(
        "bg-green-100",
        "text-green-800",
        "border-green-300"
      );
    });

    it("applies correct CSS classes for missed status", () => {
      render(
        <TreatmentSessionCard
          {...defaultProps}
          sessionRecord={createMockSessionRecord({ status: "missed" })}
        />
      );

      const statusSpan = screen.getByText("Perdido");
      expect(statusSpan).toHaveClass(
        "bg-red-100",
        "text-red-800",
        "border-red-300"
      );
    });

    it("handles unknown status gracefully", () => {
      render(
        <TreatmentSessionCard
          {...defaultProps}
          sessionRecord={createMockSessionRecord({
            status: "unknown_status" as "scheduled",
          })}
        />
      );

      expect(screen.getByText("unknown_status")).toBeInTheDocument();
      // Should apply default gray styling
      const statusSpan = screen.getByText("unknown_status");
      expect(statusSpan).toHaveClass(
        "bg-gray-100",
        "text-gray-800",
        "border-gray-300"
      );
    });
  });

  describe("Action Buttons", () => {
    beforeAll(() => {
      // Set time to future for testing scheduled session actions
      jest.setSystemTime(new Date("2024-01-14T10:00:00Z")); // Day before scheduled
    });

    it("shows complete button for future scheduled sessions", () => {
      render(
        <TreatmentSessionCard
          {...defaultProps}
          sessionRecord={createMockSessionRecord({
            status: "scheduled",
            scheduled_date: "2024-01-15T10:00:00Z",
          })}
        />
      );

      expect(screen.getByText("✓ Marcar como Completo")).toBeInTheDocument();
    });

    it("does not show complete button for past scheduled sessions", () => {
      jest.setSystemTime(new Date("2024-01-16T10:00:00Z")); // Day after scheduled

      render(
        <TreatmentSessionCard
          {...defaultProps}
          sessionRecord={createMockSessionRecord({
            status: "scheduled",
            scheduled_date: "2024-01-15T10:00:00Z",
          })}
        />
      );

      expect(
        screen.queryByText("✓ Marcar como Completo")
      ).not.toBeInTheDocument();
    });

    it("shows mark missed button for past scheduled sessions", () => {
      jest.setSystemTime(new Date("2024-01-16T10:00:00Z")); // Day after scheduled

      render(
        <TreatmentSessionCard
          {...defaultProps}
          sessionRecord={createMockSessionRecord({
            status: "scheduled",
            scheduled_date: "2024-01-15T10:00:00Z",
          })}
        />
      );

      expect(screen.getByText("✗ Marcar como Perdido")).toBeInTheDocument();
    });

    it("does not show mark missed button for future scheduled sessions", () => {
      jest.setSystemTime(new Date("2024-01-14T10:00:00Z")); // Day before scheduled

      render(
        <TreatmentSessionCard
          {...defaultProps}
          sessionRecord={createMockSessionRecord({
            status: "scheduled",
            scheduled_date: "2024-01-15T10:00:00Z",
          })}
        />
      );

      expect(
        screen.queryByText("✗ Marcar como Perdido")
      ).not.toBeInTheDocument();
    });

    it("shows reschedule button for scheduled sessions", () => {
      render(
        <TreatmentSessionCard
          {...defaultProps}
          sessionRecord={createMockSessionRecord({ status: "scheduled" })}
        />
      );

      expect(screen.getByText("🔄 Reagendar")).toBeInTheDocument();
    });

    it("shows reschedule button for missed sessions", () => {
      render(
        <TreatmentSessionCard
          {...defaultProps}
          sessionRecord={createMockSessionRecord({ status: "missed" })}
        />
      );

      expect(screen.getByText("🔄 Reagendar")).toBeInTheDocument();
    });

    it("does not show reschedule button for completed sessions", () => {
      render(
        <TreatmentSessionCard
          {...defaultProps}
          sessionRecord={createMockSessionRecord({ status: "completed" })}
        />
      );

      expect(screen.queryByText("🔄 Reagendar")).not.toBeInTheDocument();
    });

    it("does not show actions when showActions is false", () => {
      jest.setSystemTime(new Date("2024-01-14T10:00:00Z")); // Day before scheduled

      render(
        <TreatmentSessionCard
          {...defaultProps}
          showActions={false}
          sessionRecord={createMockSessionRecord({ status: "scheduled" })}
        />
      );

      expect(
        screen.queryByText("✓ Marcar como Completo")
      ).not.toBeInTheDocument();
      expect(screen.queryByText("🔄 Reagendar")).not.toBeInTheDocument();
    });

    it("calls onComplete when complete button is clicked", () => {
      jest.setSystemTime(new Date("2024-01-14T10:00:00Z")); // Day before scheduled

      const onComplete = jest.fn();
      render(
        <TreatmentSessionCard
          {...defaultProps}
          onComplete={onComplete}
          sessionRecord={createMockSessionRecord({ status: "scheduled" })}
        />
      );

      fireEvent.click(screen.getByText("✓ Marcar como Completo"));
      expect(onComplete).toHaveBeenCalledWith("1");
    });

    it("calls onMarkMissed when mark missed button is clicked", () => {
      jest.setSystemTime(new Date("2024-01-16T10:00:00Z")); // Day after scheduled

      const onMarkMissed = jest.fn();
      render(
        <TreatmentSessionCard
          {...defaultProps}
          onMarkMissed={onMarkMissed}
          sessionRecord={createMockSessionRecord({ status: "scheduled" })}
        />
      );

      fireEvent.click(screen.getByText("✗ Marcar como Perdido"));
      expect(onMarkMissed).toHaveBeenCalledWith("1");
    });

    it("calls onReschedule when reschedule button is clicked", () => {
      const onReschedule = jest.fn();
      render(
        <TreatmentSessionCard
          {...defaultProps}
          onReschedule={onReschedule}
          sessionRecord={createMockSessionRecord({ status: "scheduled" })}
        />
      );

      fireEvent.click(screen.getByText("🔄 Reagendar"));
      expect(onReschedule).toHaveBeenCalledWith("1");
    });
  });

  describe("Special Content Display", () => {
    it("displays completion notes for completed sessions", () => {
      render(
        <TreatmentSessionCard
          {...defaultProps}
          sessionRecord={createMockSessionRecord({
            status: "completed",
            notes: "Sessão completada com sucesso",
          })}
        />
      );

      expect(screen.getByText("Notas de Conclusão:")).toBeInTheDocument();
      // Check that both regular notes and completion notes are shown
      expect(screen.getAllByText("Sessão completada com sucesso")).toHaveLength(
        2
      );
    });

    it("does not display completion notes for non-completed sessions", () => {
      render(
        <TreatmentSessionCard
          {...defaultProps}
          sessionRecord={createMockSessionRecord({
            status: "scheduled",
            notes: "Sessão agendada",
          })}
        />
      );

      expect(screen.queryByText("Notas de Conclusão:")).not.toBeInTheDocument();
      expect(screen.getByText("Notas:")).toBeInTheDocument();
    });

    it("displays missed reason for missed sessions", () => {
      render(
        <TreatmentSessionCard
          {...defaultProps}
          sessionRecord={createMockSessionRecord({
            status: "missed",
            missed_reason: "Paciente não compareceu",
          })}
        />
      );

      expect(screen.getByText("Motivo da Falta:")).toBeInTheDocument();
      expect(screen.getByText("Paciente não compareceu")).toBeInTheDocument();
    });

    it("does not display missed reason when not provided", () => {
      render(
        <TreatmentSessionCard
          {...defaultProps}
          sessionRecord={createMockSessionRecord({
            status: "missed",
            missed_reason: undefined,
          })}
        />
      );

      expect(screen.queryByText("Motivo da Falta:")).not.toBeInTheDocument();
    });

    it("displays completion time for completed sessions", () => {
      render(
        <TreatmentSessionCard
          {...defaultProps}
          sessionRecord={createMockSessionRecord({
            status: "completed",
            end_time: "2024-01-15T11:30:00Z",
          })}
        />
      );

      expect(screen.getByText(/Completado em:/)).toBeInTheDocument();
    });

    it("does not display completion time for non-completed sessions", () => {
      render(
        <TreatmentSessionCard
          {...defaultProps}
          sessionRecord={createMockSessionRecord({
            status: "scheduled",
          })}
        />
      );

      expect(screen.queryByText(/Completado em:/)).not.toBeInTheDocument();
    });

    it("displays missed timestamp for missed sessions", () => {
      render(
        <TreatmentSessionCard
          {...defaultProps}
          sessionRecord={createMockSessionRecord({
            status: "missed",
            updated_at: "2024-01-15T12:00:00Z",
          })}
        />
      );

      expect(screen.getByText(/Marcado como perdido em:/)).toBeInTheDocument();
    });

    it("does not display missed timestamp for non-missed sessions", () => {
      render(
        <TreatmentSessionCard
          {...defaultProps}
          sessionRecord={createMockSessionRecord({
            status: "completed",
          })}
        />
      );

      expect(
        screen.queryByText(/Marcado como perdido em:/)
      ).not.toBeInTheDocument();
    });
  });

  describe("Responsive Design", () => {
    it("shows mobile action button icons", () => {
      jest.setSystemTime(new Date("2024-01-14T10:00:00Z")); // Day before scheduled

      render(
        <TreatmentSessionCard
          {...defaultProps}
          sessionRecord={createMockSessionRecord({ status: "scheduled" })}
        />
      );

      // Should have both mobile and desktop versions of buttons
      const completeButton = screen.getByRole("button", {
        name: /marcar como completo/i,
      });
      expect(completeButton).toBeInTheDocument();

      const rescheduleButton = screen.getByRole("button", {
        name: /reagendar/i,
      });
      expect(rescheduleButton).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles missing optional props gracefully", () => {
      const minimalProps = {
        sessionRecord: createMockSessionRecord(),
      };

      render(<TreatmentSessionCard {...minimalProps} />);

      expect(screen.getByText("Sessão #1")).toBeInTheDocument();
      // Should not crash and should render basic information
    });

    it("handles session record with all optional fields", () => {
      const fullSessionRecord = createMockSessionRecord({
        notes: "Sessão completa",
        end_time: "2024-01-15T11:30:00Z",
        missed_reason: "Motivo da falta",
        status: "completed",
      });

      render(
        <TreatmentSessionCard
          sessionRecord={fullSessionRecord}
          patientName="João Silva"
          showActions={true}
        />
      );

      expect(screen.getByText("Sessão #1")).toBeInTheDocument();
      expect(screen.getByText("Completo")).toBeInTheDocument();
    });

    it("handles large session numbers correctly", () => {
      render(
        <TreatmentSessionCard
          {...defaultProps}
          sessionRecord={createMockSessionRecord({ session_number: 999 })}
        />
      );

      expect(screen.getByText("Sessão #999")).toBeInTheDocument();
    });
  });
});
