/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TreatmentRecommendationsTab from "../index";

import type { TreatmentRecommendation } from "../../../types";

// Mock the TreatmentRecommendationsSection component
jest.mock("../TreatmentRecommendationsSection", () => {
  return function MockTreatmentRecommendationsSection({
    onChange,
  }: {
    recommendations: TreatmentRecommendation;
    onChange: (recommendations: TreatmentRecommendation) => void;
  }) {
    return (
      <div data-testid="treatment-recommendations-section">
        <button
          data-testid="change-recommendations"
          onClick={() =>
            onChange({
              returnWeeks: 4,
              spiritualMedicalDischarge: false,
            })
          }
        >
          Change Recommendations
        </button>
      </div>
    );
  };
});

describe("TreatmentRecommendationsTab", () => {
  const mockFormData = {
    mainComplaint: "Test complaint",
    treatmentStatus: "N" as const,
    startDate: "2024-01-01",
    returnWeeks: 4,
    food: "Test food",
    water: "Test water",
    ointments: "Test ointments",
    recommendations: {
      returnWeeks: 4,
      spiritualMedicalDischarge: false,
    },
    notes: "Test notes",
  };

  const mockOnRecommendationsChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render without crashing", () => {
    render(
      <TreatmentRecommendationsTab
        formData={mockFormData}
        onRecommendationsChange={mockOnRecommendationsChange}
      />
    );

    expect(screen.getByText("🔄 Agendamento Automático")).toBeInTheDocument();
  });

  it("should display information card with automatic scheduling details", () => {
    render(
      <TreatmentRecommendationsTab
        formData={mockFormData}
        onRecommendationsChange={mockOnRecommendationsChange}
      />
    );

    expect(screen.getByText("🔄 Agendamento Automático")).toBeInTheDocument();
    expect(
      screen.getByText(
        "• Os tratamentos configurados aqui serão automaticamente agendados"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText("• Cada sessão será criada com intervalos semanais")
    ).toBeInTheDocument();
    expect(
      screen.getByText("• É possível ajustar datas individuais após a criação")
    ).toBeInTheDocument();
  });

  it("should render TreatmentRecommendationsSection with correct props", () => {
    render(
      <TreatmentRecommendationsTab
        formData={mockFormData}
        onRecommendationsChange={mockOnRecommendationsChange}
      />
    );

    expect(
      screen.getByTestId("treatment-recommendations-section")
    ).toBeInTheDocument();
  });

  it("should pass onRecommendationsChange callback to TreatmentRecommendationsSection", () => {
    render(
      <TreatmentRecommendationsTab
        formData={mockFormData}
        onRecommendationsChange={mockOnRecommendationsChange}
      />
    );

    const changeButton = screen.getByTestId("change-recommendations");
    changeButton.click();

    expect(mockOnRecommendationsChange).toHaveBeenCalledWith({
      returnWeeks: 4,
      spiritualMedicalDischarge: false,
    });
  });

  it("should have proper styling and structure", () => {
    render(
      <TreatmentRecommendationsTab
        formData={mockFormData}
        onRecommendationsChange={mockOnRecommendationsChange}
      />
    );

    const container = screen
      .getByText("🔄 Agendamento Automático")
      .closest("div")?.parentElement;
    expect(container).toHaveClass("space-y-6");

    const infoCard = screen
      .getByText("🔄 Agendamento Automático")
      .closest("div");
    expect(infoCard).toHaveClass(
      "bg-green-50",
      "border",
      "border-green-200",
      "rounded-md",
      "p-4"
    );
  });

  it("should handle different formData structures", () => {
    const alternativeFormData = {
      ...mockFormData,
      recommendations: {
        returnWeeks: 6,
        spiritualMedicalDischarge: true,
        lightBath: {
          startDate: "2024-01-01",
          treatments: [
            {
              locations: ["test"],
              color: "blue",
              duration: 10,
              quantity: 5,
              startDate: "2024-01-01",
            },
          ],
        },
        rod: {
          startDate: "2024-01-01",
          treatments: [
            {
              locations: ["test"],
              quantity: 5,
              startDate: "2024-01-01",
            },
          ],
        },
      },
    };

    render(
      <TreatmentRecommendationsTab
        formData={alternativeFormData}
        onRecommendationsChange={mockOnRecommendationsChange}
      />
    );

    expect(
      screen.getByTestId("treatment-recommendations-section")
    ).toBeInTheDocument();
  });
});
