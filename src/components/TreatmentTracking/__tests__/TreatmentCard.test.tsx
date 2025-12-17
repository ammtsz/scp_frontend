import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TreatmentCard } from "../TreatmentCard";
import { TreatmentSessionResponseDto } from "@/api/types";

// Mock TreatmentSessionsList component
jest.mock("../TreatmentSessionsList", () => ({
  TreatmentSessionsList: function MockTreatmentSessionsList({
    treatmentSessionId,
    patientName,
    onRecordUpdate,
  }: {
    treatmentSessionId: string;
    patientName: string;
    onRecordUpdate?: () => void;
  }) {
    return (
      <div data-testid="treatment-sessions-list">
        <div>Sessions for Patient: {patientName}</div>
        <div>Treatment Session ID: {treatmentSessionId}</div>
        <button onClick={onRecordUpdate}>Update Record</button>
      </div>
    );
  },
}));

// Mock React Feather icons
jest.mock("react-feather", () => ({
  ChevronDown: () => <div data-testid="chevron-down">▼</div>,
  ChevronUp: () => <div data-testid="chevron-up">▲</div>,
}));

// Mock date formatter
jest.mock("@/utils/formatters", () => ({
  formatDate: (date: string) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("pt-BR");
  },
}));

const createMockTreatmentSession = (
  overrides: Record<string, unknown> = {}
): TreatmentSessionResponseDto => ({
  id: 1,
  treatment_record_id: 1,
  attendance_id: 1,
  patient_id: 1,
  treatment_type: "spiritual" as "light_bath",
  body_location: "Cabeça",
  start_date: "2024-01-15",
  end_date: "2024-02-15",
  planned_sessions: 10,
  completed_sessions: 5,
  duration_minutes: 30,
  color: "#4F46E5",
  status: "scheduled",
  notes: "Tratamento para dores de cabeça",
  created_at: "2024-01-01T10:00:00Z",
  updated_at: "2024-01-01T10:00:00Z",
  ...overrides,
});

describe("TreatmentCard", () => {
  const defaultProps = {
    session: createMockTreatmentSession(),
    patientName: "João Silva",
    showActions: true,
    isExpanded: false,
    onComplete: jest.fn(),
    onCancel: jest.fn(),
    onToggleExpanded: jest.fn(),
    onRecordUpdate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders treatment card with basic information", () => {
      render(<TreatmentCard {...defaultProps} />);

      expect(screen.getByText("João Silva")).toBeInTheDocument();
      expect(screen.getByText("Espiritual")).toBeInTheDocument();
      expect(screen.getByText("Agendado")).toBeInTheDocument();
      expect(screen.getByText("Cabeça")).toBeInTheDocument();
    });

    it("displays treatment type labels correctly", () => {
      const { rerender } = render(
        <TreatmentCard
          {...defaultProps}
          session={createMockTreatmentSession({ treatment_type: "spiritual" })}
        />
      );
      expect(screen.getByText("Espiritual")).toBeInTheDocument();

      rerender(
        <TreatmentCard
          {...defaultProps}
          session={createMockTreatmentSession({ treatment_type: "light_bath" })}
        />
      );
      expect(screen.getByText("Banho de Luz")).toBeInTheDocument();

      rerender(
        <TreatmentCard
          {...defaultProps}
          session={createMockTreatmentSession({ treatment_type: "rod" })}
        />
      );
      expect(screen.getByText("Bastão")).toBeInTheDocument();
    });

    it("displays status labels correctly", () => {
      const { rerender } = render(
        <TreatmentCard
          {...defaultProps}
          session={createMockTreatmentSession({ status: "scheduled" })}
        />
      );
      expect(screen.getByText("Agendado")).toBeInTheDocument();

      rerender(
        <TreatmentCard
          {...defaultProps}
          session={createMockTreatmentSession({ status: "completed" })}
        />
      );
      expect(screen.getByText("Completo")).toBeInTheDocument();

      rerender(
        <TreatmentCard
          {...defaultProps}
          session={createMockTreatmentSession({ status: "cancelled" })}
        />
      );
      expect(screen.getByText("Cancelado")).toBeInTheDocument();
    });

    it("renders dates when provided", () => {
      render(<TreatmentCard {...defaultProps} />);

      expect(screen.getByText(/Início:/)).toBeInTheDocument();
      expect(screen.getByText(/Fim:/)).toBeInTheDocument();
    });

    it("does not render end date when not provided", () => {
      const sessionWithoutEndDate = createMockTreatmentSession({
        end_date: undefined,
      });
      render(
        <TreatmentCard {...defaultProps} session={sessionWithoutEndDate} />
      );

      expect(screen.getByText(/Início:/)).toBeInTheDocument();
      expect(screen.queryByText(/Fim:/)).not.toBeInTheDocument();
    });

    it("displays progress information", () => {
      render(<TreatmentCard {...defaultProps} />);

      expect(screen.getByText("5 / 10 sessões")).toBeInTheDocument();
      expect(screen.getByText("50% completo")).toBeInTheDocument();
    });

    it("displays notes when provided", () => {
      render(<TreatmentCard {...defaultProps} />);

      expect(screen.getByText("Notas:")).toBeInTheDocument();
      expect(
        screen.getByText("Tratamento para dores de cabeça")
      ).toBeInTheDocument();
    });

    it("does not display notes when not provided", () => {
      const sessionWithoutNotes = createMockTreatmentSession({
        notes: undefined,
      });
      render(<TreatmentCard {...defaultProps} session={sessionWithoutNotes} />);

      expect(screen.queryByText("Notas:")).not.toBeInTheDocument();
    });

    it("displays creation date when provided", () => {
      render(<TreatmentCard {...defaultProps} />);

      expect(screen.getByText(/Criado em:/)).toBeInTheDocument();
    });
  });

  describe("Progress Bar", () => {
    it("calculates progress percentage correctly", () => {
      const { rerender } = render(<TreatmentCard {...defaultProps} />);

      // 5/10 = 50%
      expect(screen.getByText("50% completo")).toBeInTheDocument();

      // Test 100% completion
      rerender(
        <TreatmentCard
          {...defaultProps}
          session={createMockTreatmentSession({
            completed_sessions: 10,
            planned_sessions: 10,
          })}
        />
      );
      expect(screen.getByText("100% completo")).toBeInTheDocument();

      // Test 0% completion
      rerender(
        <TreatmentCard
          {...defaultProps}
          session={createMockTreatmentSession({
            completed_sessions: 0,
            planned_sessions: 10,
          })}
        />
      );
      expect(screen.getByText("0% completo")).toBeInTheDocument();
    });

    it("handles edge case with 0 planned sessions", () => {
      render(
        <TreatmentCard
          {...defaultProps}
          session={createMockTreatmentSession({
            completed_sessions: 5,
            planned_sessions: 0,
          })}
        />
      );

      expect(screen.getByText("0% completo")).toBeInTheDocument();
    });

    it("caps progress at 100% when completed sessions exceed planned", () => {
      render(
        <TreatmentCard
          {...defaultProps}
          session={createMockTreatmentSession({
            completed_sessions: 15,
            planned_sessions: 10,
          })}
        />
      );

      expect(screen.getByText("100% completo")).toBeInTheDocument();
    });
  });

  describe("Status Styling", () => {
    it("applies correct styling for spiritual treatment type", () => {
      render(
        <TreatmentCard
          {...defaultProps}
          session={createMockTreatmentSession({
            treatment_type: "spiritual" as "light_bath",
          })}
        />
      );

      const typeLabel = screen.getByText("Espiritual");
      expect(typeLabel).toHaveClass(
        "bg-blue-100",
        "text-blue-800",
        "border-blue-300"
      );
    });

    it("applies correct styling for light bath treatment type", () => {
      render(
        <TreatmentCard
          {...defaultProps}
          session={createMockTreatmentSession({ treatment_type: "light_bath" })}
        />
      );

      const typeLabel = screen.getByText("Banho de Luz");
      expect(typeLabel).toHaveClass(
        "bg-yellow-100",
        "text-yellow-800",
        "border-yellow-300"
      );
    });
  });

  describe("Actions", () => {
    it("shows complete button when session can be completed", () => {
      render(
        <TreatmentCard
          {...defaultProps}
          session={createMockTreatmentSession({
            status: "scheduled",
            completed_sessions: 10,
            planned_sessions: 10,
          })}
        />
      );

      expect(screen.getByText("Finalizar Tratamento")).toBeInTheDocument();
    });

    it("does not show complete button when session cannot be completed", () => {
      render(
        <TreatmentCard
          {...defaultProps}
          session={createMockTreatmentSession({
            status: "scheduled",
            completed_sessions: 5,
            planned_sessions: 10,
          })}
        />
      );

      expect(
        screen.queryByText("Finalizar Tratamento")
      ).not.toBeInTheDocument();
    });

    it("shows cancel button when session can be cancelled", () => {
      render(
        <TreatmentCard
          {...defaultProps}
          session={createMockTreatmentSession({ status: "scheduled" })}
        />
      );

      expect(screen.getByText("Cancelar Tratamento")).toBeInTheDocument();
    });

    it("does not show cancel button for completed sessions", () => {
      render(
        <TreatmentCard
          {...defaultProps}
          session={createMockTreatmentSession({ status: "completed" })}
        />
      );

      expect(screen.queryByText("Cancelar Tratamento")).not.toBeInTheDocument();
    });

    it("does not show cancel button for cancelled sessions", () => {
      render(
        <TreatmentCard
          {...defaultProps}
          session={createMockTreatmentSession({ status: "cancelled" })}
        />
      );

      expect(screen.queryByText("Cancelar Tratamento")).not.toBeInTheDocument();
    });

    it("does not show actions when showActions is false", () => {
      render(
        <TreatmentCard
          {...defaultProps}
          showActions={false}
          session={createMockTreatmentSession({
            status: "scheduled",
            completed_sessions: 10,
            planned_sessions: 10,
          })}
        />
      );

      expect(
        screen.queryByText("Finalizar Tratamento")
      ).not.toBeInTheDocument();
      expect(screen.queryByText("Cancelar Tratamento")).not.toBeInTheDocument();
    });

    it("calls onComplete when complete button is clicked", () => {
      const onComplete = jest.fn();
      render(
        <TreatmentCard
          {...defaultProps}
          onComplete={onComplete}
          session={createMockTreatmentSession({
            status: "scheduled",
            completed_sessions: 10,
            planned_sessions: 10,
          })}
        />
      );

      fireEvent.click(screen.getByText("Finalizar Tratamento"));
      expect(onComplete).toHaveBeenCalledWith("1");
    });

    it("calls onCancel when cancel button is clicked", () => {
      const onCancel = jest.fn();
      render(
        <TreatmentCard
          {...defaultProps}
          onCancel={onCancel}
          session={createMockTreatmentSession({ status: "scheduled" })}
        />
      );

      fireEvent.click(screen.getByText("Cancelar Tratamento"));
      expect(onCancel).toHaveBeenCalledWith("1");
    });
  });

  describe("Expansion Functionality", () => {
    it("shows expand button when not expanded", () => {
      render(<TreatmentCard {...defaultProps} isExpanded={false} />);

      expect(screen.getByText("Ver sessões (10)")).toBeInTheDocument();
      expect(screen.getByTestId("chevron-down")).toBeInTheDocument();
    });

    it("shows collapse button when expanded", () => {
      render(<TreatmentCard {...defaultProps} isExpanded={true} />);

      expect(screen.getAllByText("Ocultar sessões")).toHaveLength(2); // Main and bottom buttons
      expect(screen.getAllByTestId("chevron-up")).toHaveLength(2);
    });

    it("calls onToggleExpanded when expand button is clicked", () => {
      const onToggleExpanded = jest.fn();
      render(
        <TreatmentCard
          {...defaultProps}
          onToggleExpanded={onToggleExpanded}
          isExpanded={false}
        />
      );

      fireEvent.click(screen.getByText("Ver sessões (10)"));
      expect(onToggleExpanded).toHaveBeenCalledWith("1");
    });

    it("calls onToggleExpanded when collapse button is clicked", () => {
      const onToggleExpanded = jest.fn();
      render(
        <TreatmentCard
          {...defaultProps}
          onToggleExpanded={onToggleExpanded}
          isExpanded={true}
        />
      );

      // Click the main collapse button
      fireEvent.click(screen.getAllByText("Ocultar sessões")[0]);
      expect(onToggleExpanded).toHaveBeenCalledWith("1");
    });

    it("renders TreatmentSessionsList when expanded", () => {
      render(<TreatmentCard {...defaultProps} isExpanded={true} />);

      expect(screen.getByTestId("treatment-sessions-list")).toBeInTheDocument();
      expect(
        screen.getByText("Sessions for Patient: João Silva")
      ).toBeInTheDocument();
      expect(screen.getByText("Treatment Session ID: 1")).toBeInTheDocument();
    });

    it("does not render TreatmentSessionsList when collapsed", () => {
      render(<TreatmentCard {...defaultProps} isExpanded={false} />);

      expect(
        screen.queryByTestId("treatment-sessions-list")
      ).not.toBeInTheDocument();
    });

    it("passes correct props to TreatmentSessionsList", () => {
      render(<TreatmentCard {...defaultProps} isExpanded={true} />);

      expect(
        screen.getByText("Sessions for Patient: João Silva")
      ).toBeInTheDocument();
      expect(screen.getByText("Treatment Session ID: 1")).toBeInTheDocument();

      // Test onRecordUpdate callback
      fireEvent.click(screen.getByText("Update Record"));
      expect(defaultProps.onRecordUpdate).toHaveBeenCalled();
    });
  });

  describe("Responsive Design", () => {
    it("shows responsive cancel button text", () => {
      render(
        <TreatmentCard
          {...defaultProps}
          session={createMockTreatmentSession({ status: "scheduled" })}
        />
      );

      // Should show both mobile emoji and desktop text
      const cancelButton = screen.getByRole("button", {
        name: /cancelar tratamento/i,
      });
      expect(cancelButton).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles missing optional props gracefully", () => {
      const minimalProps = {
        session: createMockTreatmentSession(),
        patientName: "João Silva",
      };

      render(<TreatmentCard {...minimalProps} />);

      expect(screen.getByText("João Silva")).toBeInTheDocument();
      // Should not crash and should render basic information
    });

    it("handles unknown treatment types", () => {
      render(
        <TreatmentCard
          {...defaultProps}
          session={createMockTreatmentSession({
            treatment_type: "unknown_type" as "light_bath",
          })}
        />
      );

      expect(screen.getByText("unknown_type")).toBeInTheDocument();
    });

    it("handles unknown status types", () => {
      render(
        <TreatmentCard
          {...defaultProps}
          session={createMockTreatmentSession({
            status: "unknown_status" as "scheduled",
          })}
        />
      );

      expect(screen.getByText("unknown_status")).toBeInTheDocument();
    });
  });
});
