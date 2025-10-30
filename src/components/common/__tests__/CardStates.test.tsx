import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  EmptyState,
  ErrorState,
  AttendanceHistoryEmpty,
  ScheduledAttendancesEmpty,
  TreatmentRecommendationsEmpty,
  CurrentTreatmentEmpty,
} from "../CardStates";

describe("CardStates Components", () => {
  describe("EmptyState", () => {
    it("renders basic empty state correctly", () => {
      render(
        <EmptyState
          icon="📝"
          title="Test Title"
          description="Test description"
        />
      );

      expect(screen.getByText("📝")).toBeInTheDocument();
      expect(screen.getByText("Test Title")).toBeInTheDocument();
      expect(screen.getByText("Test description")).toBeInTheDocument();
    });

    it("renders with custom icon background color", () => {
      const { container } = render(
        <EmptyState
          icon="📅"
          title="Test Title"
          description="Test description"
          iconBgColor="bg-blue-50"
        />
      );

      const iconContainer = container.querySelector(".bg-blue-50");
      expect(iconContainer).toBeInTheDocument();
    });

    it("renders children when provided", () => {
      render(
        <EmptyState icon="📝" title="Test Title" description="Test description">
          <button>Custom Action</button>
        </EmptyState>
      );

      expect(
        screen.getByRole("button", { name: "Custom Action" })
      ).toBeInTheDocument();
    });
  });

  describe("ErrorState", () => {
    it("renders error state correctly", () => {
      const mockRetry = jest.fn();

      render(
        <ErrorState
          title="Error Title"
          message="Error message"
          onRetry={mockRetry}
        />
      );

      expect(screen.getByText("⚠️")).toBeInTheDocument();
      expect(screen.getByText("Error Title")).toBeInTheDocument();
      expect(screen.getByText("Error message")).toBeInTheDocument();
      expect(screen.getByText("Tentar novamente")).toBeInTheDocument();
    });

    it("calls onRetry when retry button is clicked", () => {
      const mockRetry = jest.fn();

      render(
        <ErrorState
          title="Error Title"
          message="Error message"
          onRetry={mockRetry}
        />
      );

      fireEvent.click(screen.getByText("Tentar novamente"));
      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it("renders custom retry label", () => {
      const mockRetry = jest.fn();

      render(
        <ErrorState
          title="Error Title"
          message="Error message"
          onRetry={mockRetry}
          retryLabel="Custom Retry"
        />
      );

      expect(screen.getByText("Custom Retry")).toBeInTheDocument();
    });
  });

  describe("AttendanceHistoryEmpty", () => {
    it("renders when patient has no next attendance dates", () => {
      const mockPatient = { nextAttendanceDates: [] };

      render(<AttendanceHistoryEmpty patient={mockPatient} />);

      expect(
        screen.getByText("Nenhum atendimento concluído")
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Agendar primeiro atendimento/)
      ).toBeInTheDocument();
    });

    it("renders with next attendance date information", () => {
      const mockPatient = {
        nextAttendanceDates: [{ date: new Date("2024-12-15") }],
      };

      render(<AttendanceHistoryEmpty patient={mockPatient} />);

      expect(
        screen.getByText("Nenhum atendimento concluído")
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Próximo atendimento agendado para/)
      ).toBeInTheDocument();
    });
  });

  describe("ScheduledAttendancesEmpty", () => {
    it("renders with correct links", () => {
      render(<ScheduledAttendancesEmpty patientId="123" />);

      expect(screen.getByText("Nenhum agendamento futuro")).toBeInTheDocument();

      const scheduleLink = screen.getByText("📅 Agendar Consulta");
      expect(scheduleLink).toBeInTheDocument();
      expect(scheduleLink.closest("a")).toHaveAttribute(
        "href",
        "/agenda?patient=123&action=schedule"
      );

      const agendaLink = screen.getByText("Ver Agenda");
      expect(agendaLink).toBeInTheDocument();
      expect(agendaLink.closest("a")).toHaveAttribute("href", "/agenda");
    });
  });

  describe("TreatmentRecommendationsEmpty", () => {
    it("renders and calls onCreateRecommendations", () => {
      const mockCreate = jest.fn();

      render(
        <TreatmentRecommendationsEmpty onCreateRecommendations={mockCreate} />
      );

      expect(
        screen.getByText("Recomendações não disponíveis")
      ).toBeInTheDocument();

      const createButton = screen.getByText("✨ Criar Recomendações");
      expect(createButton).toBeInTheDocument();

      fireEvent.click(createButton);
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });
  });

  describe("CurrentTreatmentEmpty", () => {
    it("renders current treatment empty state", () => {
      render(<CurrentTreatmentEmpty />);

      expect(screen.getByText("Nenhum tratamento ativo")).toBeInTheDocument();
      expect(
        screen.getByText(/não possui tratamentos em andamento/)
      ).toBeInTheDocument();
    });
  });
});
