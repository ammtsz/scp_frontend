import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import TreatmentIndicator from "../AttendanceCards/TreatmentIndicator";
import type { TreatmentInfo } from "../../../../hooks/useTreatmentIndicators";

describe("TreatmentIndicator", () => {
  const mockOnInfoClick = jest.fn();

  beforeEach(() => {
    mockOnInfoClick.mockClear();
  });

  it("renders light bath treatment indicator", () => {
    const treatmentInfo: TreatmentInfo = {
      hasLightBath: true,
      hasRod: false,
      lightBathColor: "azul",
      lightBathDuration: 2,
      bodyLocations: ["Cabeça"],
      treatmentType: "lightbath",
    };

    render(
      <TreatmentIndicator
        treatmentInfo={treatmentInfo}
        onInfoClick={mockOnInfoClick}
      />
    );

    expect(screen.getByText("Banho de Luz")).toBeInTheDocument();
    expect(screen.getByText("ℹ️")).toBeInTheDocument();
  });

  it("renders rod treatment indicator", () => {
    const treatmentInfo: TreatmentInfo = {
      hasLightBath: false,
      hasRod: true,
      bodyLocations: ["Braço"],
      treatmentType: "rod",
    };

    render(
      <TreatmentIndicator
        treatmentInfo={treatmentInfo}
        onInfoClick={mockOnInfoClick}
      />
    );

    expect(screen.getByText("Bastão")).toBeInTheDocument();
  });

  it("renders combined treatment indicator", () => {
    const treatmentInfo: TreatmentInfo = {
      hasLightBath: true,
      hasRod: true,
      lightBathColor: "verde",
      lightBathDuration: 1,
      bodyLocations: ["Cabeça", "Braço"],
      treatmentType: "combined",
    };

    render(
      <TreatmentIndicator
        treatmentInfo={treatmentInfo}
        onInfoClick={mockOnInfoClick}
      />
    );

    expect(screen.getByText("Banho de Luz + Bastão")).toBeInTheDocument();
  });

  it("calls onInfoClick when info button is clicked", () => {
    const treatmentInfo: TreatmentInfo = {
      hasLightBath: true,
      hasRod: false,
      lightBathColor: "azul",
      lightBathDuration: 2,
      bodyLocations: ["Cabeça"],
      treatmentType: "lightbath",
    };

    render(
      <TreatmentIndicator
        treatmentInfo={treatmentInfo}
        onInfoClick={mockOnInfoClick}
      />
    );

    fireEvent.click(screen.getByText("ℹ️"));
    expect(mockOnInfoClick).toHaveBeenCalledTimes(1);
  });

  it("does not render when treatment type is none", () => {
    const treatmentInfo: TreatmentInfo = {
      hasLightBath: false,
      hasRod: false,
      bodyLocations: [],
      treatmentType: "none",
    };

    const { container } = render(
      <TreatmentIndicator
        treatmentInfo={treatmentInfo}
        onInfoClick={mockOnInfoClick}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
