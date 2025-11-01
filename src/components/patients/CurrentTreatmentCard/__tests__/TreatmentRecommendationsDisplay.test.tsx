import React from "react";
import { render, screen } from "../../../../test/testUtils";
import { TreatmentRecommendationsDisplay } from "../TreatmentRecommendationsDisplay";

const mockRecommendations = {
  date: new Date("2024-12-20"),
  food: "Dieta leve",
  water: "2L/dia",
  ointment: "Aplicar 2x/dia",
  lightBath: true,
  rod: false,
  spiritualTreatment: true,
  returnWeeks: 4,
};

describe("TreatmentRecommendationsDisplay", () => {
  it("renders all recommendation fields correctly", () => {
    render(
      <TreatmentRecommendationsDisplay recommendations={mockRecommendations} />
    );

    expect(screen.getByText(/Últimas Recomendações/)).toBeInTheDocument();
    expect(screen.getByText("🍎 Alimentação:")).toBeInTheDocument();
    expect(screen.getByText("💧 Água:")).toBeInTheDocument();
    expect(screen.getByText("🧴 Pomada:")).toBeInTheDocument();
    expect(screen.getByText("✨ Banho de luz:")).toBeInTheDocument();
    expect(screen.getByText("🪄 Bastão:")).toBeInTheDocument();
    expect(screen.getByText("🥼 Trat. Espiritual:")).toBeInTheDocument();
    expect(screen.getByText("📅 Retorno:")).toBeInTheDocument();
  });

  it("displays recommendation values correctly", () => {
    render(
      <TreatmentRecommendationsDisplay recommendations={mockRecommendations} />
    );

    expect(screen.getByText("Dieta leve")).toBeInTheDocument();
    expect(screen.getByText("2L/dia")).toBeInTheDocument();
    expect(screen.getByText("Aplicar 2x/dia")).toBeInTheDocument();
    expect(screen.getByText("4 semanas")).toBeInTheDocument();
  });

  it("shows 'Sim' for true boolean values and 'nenhuma' for false ones", () => {
    render(
      <TreatmentRecommendationsDisplay recommendations={mockRecommendations} />
    );

    // lightBath and spiritualTreatment are true
    const simElements = screen.getAllByText("Sim");
    expect(simElements).toHaveLength(2);

    // rod is false
    expect(screen.getByText("nenhuma")).toBeInTheDocument();
  });

  it("handles empty recommendation values", () => {
    const emptyRecommendations = {
      date: new Date("2024-12-20"),
      food: "",
      water: "",
      ointment: "",
      lightBath: false,
      rod: false,
      spiritualTreatment: false,
      returnWeeks: 0,
    };

    render(
      <TreatmentRecommendationsDisplay recommendations={emptyRecommendations} />
    );

    const nenhumaElements = screen.getAllByText("nenhuma");
    expect(nenhumaElements.length).toBeGreaterThan(0);
    expect(screen.getByText("Não definido")).toBeInTheDocument();
  });
});
