import React from "react";
import { render, screen } from "@testing-library/react";
import {
  LightBathDetails,
  RodDetails,
  NotesBox,
  RecommendationsBox,
  SpiritualConsultationDetails,
  TreatmentDetailsContainer,
} from "../TreatmentDetailBoxes";

describe("TreatmentDetailBoxes", () => {
  describe("LightBathDetails", () => {
    it("renders light bath details correctly", () => {
      render(
        <LightBathDetails
          bodyLocations={["Cabeça", "Ombro"]}
          color="azul"
          duration={21}
          sessions={3}
          showSessions={true}
          sessionLabel="Sessões Programadas"
        />
      );

      expect(screen.getByText(/✨ Banho de Luz/)).toBeInTheDocument();
      expect(screen.getByText("azul")).toBeInTheDocument();
      expect(screen.getByText(/Cabeça, Ombro/)).toBeInTheDocument();
      expect(screen.getByText(/21 unidades/)).toBeInTheDocument();
      expect(screen.getByText(/Sessões:/)).toBeInTheDocument();
      expect(screen.getByText(/3/)).toBeInTheDocument();
    });

    it("renders without optional props", () => {
      render(<LightBathDetails bodyLocations={["Cabeça"]} />);

      expect(screen.getByText(/✨ Banho de Luz/)).toBeInTheDocument();
      expect(screen.getByText("Cabeça")).toBeInTheDocument();
    });
  });

  describe("RodDetails", () => {
    it("renders rod details correctly", () => {
      render(
        <RodDetails
          bodyLocations={["Ombro direito"]}
          sessions={2}
          showSessions={true}
          sessionLabel="Sessões Programadas"
        />
      );

      expect(screen.getByText(/🪄 Bastão/)).toBeInTheDocument();
      expect(screen.getByText(/Ombro direito/)).toBeInTheDocument();
      expect(screen.getByText(/Sessões:/)).toBeInTheDocument();
      expect(screen.getByText(/2/)).toBeInTheDocument();
    });
  });

  describe("NotesBox", () => {
    it("renders notes correctly", () => {
      render(<NotesBox notes="Test notes content" label="Observações" />);

      expect(screen.getByText("Observações:")).toBeInTheDocument();
      expect(screen.getByText("Test notes content")).toBeInTheDocument();
    });

    it("uses default label", () => {
      render(<NotesBox notes="Test notes content" />);

      expect(screen.getByText("Notas:")).toBeInTheDocument();
    });
  });

  describe("SpiritualConsultationDetails", () => {
    it("renders spiritual consultation details", () => {
      render(
        <SpiritualConsultationDetails description="Consulta agendada para avaliação" />
      );

      expect(screen.getByText("Consulta Espiritual")).toBeInTheDocument();
      expect(
        screen.getByText("Consulta agendada para avaliação")
      ).toBeInTheDocument();
    });
  });

  describe("RecommendationsBox", () => {
    it("renders recommendations correctly", () => {
      const recommendations = {
        food: "Evitar carne vermelha",
        water: "Beber água energizada",
        lightBath: true,
        returnWeeks: 4,
      };

      render(<RecommendationsBox recommendations={recommendations} />);

      expect(
        screen.getByText("📋 Consulta Espiritual - Recomendações:")
      ).toBeInTheDocument();
      expect(screen.getByText("Evitar carne vermelha")).toBeInTheDocument();
      expect(screen.getByText("Beber água energizada")).toBeInTheDocument();
      expect(screen.getByText("Recomendado")).toBeInTheDocument();
      expect(screen.getByText("4 semanas")).toBeInTheDocument();
    });
  });

  describe("TreatmentDetailsContainer", () => {
    it("renders children correctly", () => {
      render(
        <TreatmentDetailsContainer>
          <div>Test content</div>
        </TreatmentDetailsContainer>
      );

      expect(screen.getByText("Test content")).toBeInTheDocument();
    });
  });
});
