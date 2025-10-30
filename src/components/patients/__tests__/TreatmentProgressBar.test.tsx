import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TreatmentProgressBar } from "../TreatmentProgressBar";

describe("TreatmentProgressBar", () => {
  describe("Basic Progress Display", () => {
    it("renders progress bar with correct percentage", () => {
      render(<TreatmentProgressBar completed={3} total={10} />);

      expect(screen.getByText("30%")).toBeInTheDocument();
      expect(screen.getByText("Sessão 3 de 10")).toBeInTheDocument();
    });

    it("shows 100% completion when sessions are completed", () => {
      render(<TreatmentProgressBar completed={5} total={5} />);

      expect(screen.getByText("100%")).toBeInTheDocument();
      expect(screen.getByText("Tratamento Concluído")).toBeInTheDocument();
      expect(screen.getByText("Concluído")).toBeInTheDocument();
    });

    it("handles zero progress correctly", () => {
      render(<TreatmentProgressBar completed={0} total={8} />);

      expect(screen.getByText("0%")).toBeInTheDocument();
      expect(screen.getByText("Tratamento Iniciado")).toBeInTheDocument();
    });

    it("handles zero total sessions", () => {
      render(<TreatmentProgressBar completed={0} total={0} />);

      expect(screen.getByText("0%")).toBeInTheDocument();
    });
  });

  describe("Treatment Type Colors", () => {
    it("applies light_bath colors correctly", () => {
      const { container } = render(
        <TreatmentProgressBar
          completed={2}
          total={5}
          treatmentType="light_bath"
        />
      );

      const progressContainer = container.querySelector(".bg-yellow-100\\/80");
      expect(progressContainer).toBeInTheDocument();
    });

    it("applies rod colors correctly", () => {
      const { container } = render(
        <TreatmentProgressBar completed={2} total={5} treatmentType="rod" />
      );

      const progressContainer = container.querySelector(".bg-blue-100\\/80");
      expect(progressContainer).toBeInTheDocument();
    });

    it("applies spiritual colors by default", () => {
      const { container } = render(
        <TreatmentProgressBar completed={2} total={5} />
      );

      const progressContainer = container.querySelector(".bg-blue-100");
      expect(progressContainer).toBeInTheDocument();
    });
  });

  describe("Size Variants", () => {
    it("renders small size variant", () => {
      const { container } = render(
        <TreatmentProgressBar completed={2} total={5} size="sm" />
      );

      expect(container.querySelector(".h-2")).toBeInTheDocument();
      expect(container.querySelector(".text-xs")).toBeInTheDocument();
    });

    it("renders medium size variant (default)", () => {
      const { container } = render(
        <TreatmentProgressBar completed={2} total={5} size="md" />
      );

      expect(container.querySelector(".h-3")).toBeInTheDocument();
      expect(container.querySelector(".text-sm")).toBeInTheDocument();
    });

    it("renders large size variant", () => {
      const { container } = render(
        <TreatmentProgressBar completed={2} total={5} size="lg" />
      );

      expect(container.querySelector(".h-4")).toBeInTheDocument();
      expect(container.querySelector(".text-base")).toBeInTheDocument();
    });
  });

  describe("Session Details", () => {
    it("shows session details when showDetails=true", () => {
      render(
        <TreatmentProgressBar
          completed={3}
          total={10}
          showDetails={true}
          sessionDetails={{
            upcoming: 2,
            missed: 1,
            cancelled: 1,
          }}
        />
      );

      expect(screen.getByText("2 agendadas")).toBeInTheDocument();
      expect(screen.getByText("1 perdidas")).toBeInTheDocument();
      expect(screen.getByText("1 canceladas")).toBeInTheDocument();
      expect(screen.getByText("📅")).toBeInTheDocument();
      expect(screen.getByText("⚠️")).toBeInTheDocument();
      expect(screen.getByText("❌")).toBeInTheDocument();
    });

    it("hides session details when showDetails=false", () => {
      render(
        <TreatmentProgressBar
          completed={3}
          total={10}
          showDetails={false}
          sessionDetails={{
            upcoming: 2,
            missed: 1,
            cancelled: 1,
          }}
        />
      );

      expect(screen.queryByText("2 agendadas")).not.toBeInTheDocument();
      expect(screen.queryByText("1 perdidas")).not.toBeInTheDocument();
      expect(screen.queryByText("1 canceladas")).not.toBeInTheDocument();
    });

    it("shows only non-zero session details", () => {
      render(
        <TreatmentProgressBar
          completed={3}
          total={10}
          showDetails={true}
          sessionDetails={{
            upcoming: 2,
            missed: 0,
            cancelled: 1,
          }}
        />
      );

      expect(screen.getByText("2 agendadas")).toBeInTheDocument();
      expect(screen.queryByText("0 perdidas")).not.toBeInTheDocument();
      expect(screen.getByText("1 canceladas")).toBeInTheDocument();
    });
  });

  describe("Milestone Indicators", () => {
    it("shows milestone indicators for treatments with 5+ sessions", () => {
      render(<TreatmentProgressBar completed={3} total={10} />);

      expect(screen.getByText("25%")).toBeInTheDocument();
      expect(screen.getByText("50%")).toBeInTheDocument();
      expect(screen.getByText("75%")).toBeInTheDocument();
      expect(screen.getByText("Concluído")).toBeInTheDocument();
    });

    it("hides milestone indicators for treatments with less than 2 sessions", () => {
      const { container } = render(
        <TreatmentProgressBar completed={1} total={1} />
      );

      // Should not have milestone indicators
      const milestones = container.querySelectorAll(".text-xs.text-gray-500");
      expect(milestones).toHaveLength(0);
    });

    it("highlights reached milestones with treatment color", () => {
      const { container } = render(
        <TreatmentProgressBar
          completed={5}
          total={10}
          treatmentType="light_bath"
        />
      );

      // 25% and 50% should be highlighted (completed >= 3 and >= 5)
      const coloredMilestones = container.querySelectorAll(".text-yellow-700");
      expect(coloredMilestones.length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility", () => {
    it("has proper structure for screen readers", () => {
      render(<TreatmentProgressBar completed={3} total={10} />);

      // Progress information should be readable
      expect(screen.getByText("Sessão 3 de 10")).toBeInTheDocument();
      expect(screen.getByText("30%")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles more completed sessions than total", () => {
      render(<TreatmentProgressBar completed={12} total={10} />);

      expect(screen.getByText("120%")).toBeInTheDocument();
    });

    it("handles negative values gracefully", () => {
      render(<TreatmentProgressBar completed={-1} total={5} />);

      // Should handle gracefully and show 0%
      expect(screen.getByText("0%")).toBeInTheDocument();
    });
  });
});
