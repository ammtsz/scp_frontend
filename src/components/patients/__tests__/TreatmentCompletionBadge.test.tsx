import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TreatmentCompletionBadge } from "../TreatmentCompletionBadge";

describe("TreatmentCompletionBadge", () => {
  describe("Status Display", () => {
    it("renders completed status correctly", () => {
      render(
        <TreatmentCompletionBadge
          completionPercentage={100}
          status="completed"
          showCompletionPercentage
        />
      );

      expect(screen.getByText("Concluído")).toBeInTheDocument();
      expect(screen.getByText("✅")).toBeInTheDocument();
      expect(screen.getByText("(100%)")).toBeInTheDocument();
    });

    it("renders in progress status correctly", () => {
      render(
        <TreatmentCompletionBadge
          completionPercentage={60}
          status="in_progress"
          showCompletionPercentage
        />
      );

      expect(screen.getByText("Em Andamento")).toBeInTheDocument();
      expect(screen.getByText("▶️")).toBeInTheDocument();
      expect(screen.getByText("(60%)")).toBeInTheDocument();
    });

    it("renders active status correctly", () => {
      render(
        <TreatmentCompletionBadge
          completionPercentage={30}
          status="active"
          showCompletionPercentage
        />
      );

      expect(screen.getByText("Ativo")).toBeInTheDocument();
      expect(screen.getByText("🔄")).toBeInTheDocument();
      expect(screen.getByText("(30%)")).toBeInTheDocument();
    });

    it("renders suspended status correctly", () => {
      render(
        <TreatmentCompletionBadge
          completionPercentage={40}
          status="suspended"
          showCompletionPercentage
        />
      );

      expect(screen.getByText("Suspenso")).toBeInTheDocument();
      expect(screen.getByText("⏸️")).toBeInTheDocument();
      expect(screen.getByText("(40%)")).toBeInTheDocument();
    });

    it("renders cancelled status correctly", () => {
      render(
        <TreatmentCompletionBadge
          completionPercentage={20}
          status="cancelled"
          showCompletionPercentage
        />
      );

      expect(screen.getByText("Cancelado")).toBeInTheDocument();
      expect(screen.getByText("❌")).toBeInTheDocument();
      expect(screen.getByText("(20%)")).toBeInTheDocument();
    });

    it("renders scheduled status correctly", () => {
      render(
        <TreatmentCompletionBadge completionPercentage={0} status="scheduled" />
      );

      expect(screen.getByText("Agendado")).toBeInTheDocument();
      expect(screen.getByText("📅")).toBeInTheDocument();
      expect(screen.queryByText("(0%)")).not.toBeInTheDocument(); // 0% should not show
    });
  });

  describe("Milestone Display", () => {
    it("shows milestone for 100% completion", () => {
      render(
        <TreatmentCompletionBadge
          completionPercentage={100}
          status="completed"
          showMilestone={true}
        />
      );

      expect(screen.getByText("🏆")).toBeInTheDocument();
      expect(screen.getByText("Tratamento Finalizado!")).toBeInTheDocument();
    });

    it("shows milestone for 75%+ completion", () => {
      render(
        <TreatmentCompletionBadge
          completionPercentage={80}
          status="active"
          showMilestone={true}
        />
      );

      expect(screen.getByText("🎯")).toBeInTheDocument();
      expect(screen.getByText("Quase Lá!")).toBeInTheDocument();
    });

    it("shows milestone for 50%+ completion", () => {
      render(
        <TreatmentCompletionBadge
          completionPercentage={60}
          status="active"
          showMilestone={true}
        />
      );

      expect(screen.getByText("📈")).toBeInTheDocument();
      expect(screen.getByText("Meio Caminho")).toBeInTheDocument();
    });

    it("shows milestone for 25%+ completion", () => {
      render(
        <TreatmentCompletionBadge
          completionPercentage={40}
          status="active"
          showMilestone={true}
        />
      );

      expect(screen.getAllByText("🔄")).toHaveLength(2); // One in status, one in milestone
      expect(screen.getByText("Progredindo")).toBeInTheDocument();
    });

    it("shows milestone for early progress", () => {
      render(
        <TreatmentCompletionBadge
          completionPercentage={10}
          status="active"
          showMilestone={true}
        />
      );

      expect(screen.getByText("🚀")).toBeInTheDocument();
      expect(screen.getByText("Iniciado")).toBeInTheDocument();
    });

    it("shows milestone for 0% completion", () => {
      render(
        <TreatmentCompletionBadge
          completionPercentage={0}
          status="scheduled"
          showMilestone={true}
        />
      );

      // 0% completion should not show milestone
      expect(screen.queryByText("📋")).not.toBeInTheDocument();
      expect(screen.queryByText("Planejado")).not.toBeInTheDocument();
    });

    it("hides milestone when showMilestone is false", () => {
      render(
        <TreatmentCompletionBadge
          completionPercentage={50}
          status="active"
          showMilestone={false}
        />
      );

      expect(screen.queryByText("📈")).not.toBeInTheDocument();
      expect(screen.queryByText("Meio Caminho")).not.toBeInTheDocument();
    });
  });

  describe("Size Variants", () => {
    it("renders small size variant", () => {
      const { container } = render(
        <TreatmentCompletionBadge
          completionPercentage={50}
          status="active"
          size="sm"
        />
      );

      expect(container.querySelector(".px-2")).toBeInTheDocument();
      expect(container.querySelector(".text-xs")).toBeInTheDocument();
    });

    it("renders medium size variant (default)", () => {
      const { container } = render(
        <TreatmentCompletionBadge
          completionPercentage={50}
          status="active"
          size="md"
        />
      );

      expect(container.querySelector(".px-3")).toBeInTheDocument();
      expect(container.querySelector(".text-sm")).toBeInTheDocument();
    });

    it("renders large size variant", () => {
      const { container } = render(
        <TreatmentCompletionBadge
          completionPercentage={50}
          status="active"
          size="lg"
        />
      );

      expect(container.querySelector(".px-4")).toBeInTheDocument();
      expect(container.querySelector(".text-base")).toBeInTheDocument();
    });
  });

  describe("Color Schemes", () => {
    it("applies green colors for completed status", () => {
      const { container } = render(
        <TreatmentCompletionBadge
          completionPercentage={100}
          status="completed"
        />
      );

      expect(container.querySelector(".bg-green-100")).toBeInTheDocument();
      expect(container.querySelector(".text-green-800")).toBeInTheDocument();
    });

    it("applies blue colors for active status", () => {
      const { container } = render(
        <TreatmentCompletionBadge completionPercentage={50} status="active" />
      );

      expect(container.querySelector(".bg-blue-100")).toBeInTheDocument();
      expect(container.querySelector(".text-blue-800")).toBeInTheDocument();
    });

    it("applies orange colors for suspended status", () => {
      const { container } = render(
        <TreatmentCompletionBadge
          completionPercentage={30}
          status="suspended"
        />
      );

      expect(container.querySelector(".bg-orange-100")).toBeInTheDocument();
      expect(container.querySelector(".text-orange-800")).toBeInTheDocument();
    });

    it("applies red colors for cancelled status", () => {
      const { container } = render(
        <TreatmentCompletionBadge
          completionPercentage={20}
          status="cancelled"
        />
      );

      expect(container.querySelector(".bg-red-100")).toBeInTheDocument();
      expect(container.querySelector(".text-red-800")).toBeInTheDocument();
    });

    it("applies gray colors for scheduled status", () => {
      const { container } = render(
        <TreatmentCompletionBadge completionPercentage={0} status="scheduled" />
      );

      expect(container.querySelector(".bg-gray-100")).toBeInTheDocument();
      expect(container.querySelector(".text-gray-800")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles zero percentage correctly", () => {
      render(
        <TreatmentCompletionBadge completionPercentage={0} status="scheduled" />
      );

      expect(screen.getByText("Agendado")).toBeInTheDocument();
      expect(screen.queryByText("(0%)")).not.toBeInTheDocument();
    });

    it("handles over 100% percentage", () => {
      render(
        <TreatmentCompletionBadge
          completionPercentage={120}
          status="completed"
          showCompletionPercentage
        />
      );

      expect(screen.getByText("(120%)")).toBeInTheDocument();
    });
  });
});
