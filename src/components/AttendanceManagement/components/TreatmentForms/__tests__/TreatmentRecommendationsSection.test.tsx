import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { jest } from "@jest/globals";
import TreatmentRecommendationsSection from "../TreatmentRecommendationsSection";
import type { TreatmentRecommendation } from "../SpiritualConsultationForm";

const mockOnChange =
  jest.fn<(recommendations: TreatmentRecommendation) => void>();

const createMockRecommendations = (): TreatmentRecommendation => ({
  returnWeeks: 2,
  spiritualMedicalDischarge: false,
});

const createMockRecommendationsWithTreatments =
  (): TreatmentRecommendation => ({
    returnWeeks: 2,
    spiritualMedicalDischarge: false,
    lightBath: {
      startDate: new Date("2025-02-01"),
      bodyLocation: ["Coração"],
      color: "azul",
      duration: 2,
      quantity: 5,
    },
    rod: {
      startDate: new Date("2025-02-01"),
      bodyLocation: ["Lombar"],
      quantity: 3,
    },
  });

describe("TreatmentRecommendationsSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders basic recommendation fields", () => {
    const recommendations = createMockRecommendations();
    render(
      <TreatmentRecommendationsSection
        recommendations={recommendations}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("Recomendações de Tratamento")).toBeInTheDocument();
    expect(screen.getByLabelText("Retorno em (semanas)")).toBeInTheDocument();
    expect(screen.getByLabelText("Alta espiritual/médica")).toBeInTheDocument();
    expect(screen.getByLabelText("Banho de Luz")).toBeInTheDocument();
    expect(screen.getByLabelText("Tratamento com Bastão")).toBeInTheDocument();
  });

  it("displays initial return weeks value", () => {
    const recommendations = createMockRecommendations();
    render(
      <TreatmentRecommendationsSection
        recommendations={recommendations}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByDisplayValue("2")).toBeInTheDocument();
  });

  it("handles return weeks change", () => {
    const recommendations = createMockRecommendations();
    render(
      <TreatmentRecommendationsSection
        recommendations={recommendations}
        onChange={mockOnChange}
      />
    );

    fireEvent.change(screen.getByLabelText("Retorno em (semanas)"), {
      target: { value: "4" },
    });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...recommendations,
      returnWeeks: 4,
    });
  });

  it("handles return weeks with boundary values", () => {
    const recommendations = createMockRecommendations();
    render(
      <TreatmentRecommendationsSection
        recommendations={recommendations}
        onChange={mockOnChange}
      />
    );

    // Test minimum value (1)
    fireEvent.change(screen.getByLabelText("Retorno em (semanas)"), {
      target: { value: "0" },
    });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...recommendations,
      returnWeeks: 1,
    });

    // Test maximum value (52)
    fireEvent.change(screen.getByLabelText("Retorno em (semanas)"), {
      target: { value: "60" },
    });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...recommendations,
      returnWeeks: 52,
    });
  });

  it("handles spiritual discharge toggle", () => {
    const recommendations = createMockRecommendations();
    render(
      <TreatmentRecommendationsSection
        recommendations={recommendations}
        onChange={mockOnChange}
      />
    );

    fireEvent.click(screen.getByLabelText("Alta espiritual/médica"));

    expect(mockOnChange).toHaveBeenCalledWith({
      ...recommendations,
      spiritualMedicalDischarge: true,
    });
  });

  it("enables light bath treatment section", () => {
    const recommendations = createMockRecommendations();
    render(
      <TreatmentRecommendationsSection
        recommendations={recommendations}
        onChange={mockOnChange}
      />
    );

    fireEvent.click(screen.getByLabelText("Banho de Luz"));

    expect(mockOnChange).toHaveBeenCalledWith({
      ...recommendations,
      lightBath: {
        startDate: expect.any(Date),
        bodyLocation: [],
        color: "azul",
        duration: 1,
        quantity: 1,
      },
    });
  });

  it("disables light bath treatment section", () => {
    const recommendations = createMockRecommendationsWithTreatments();
    render(
      <TreatmentRecommendationsSection
        recommendations={recommendations}
        onChange={mockOnChange}
      />
    );

    // Light bath should be enabled initially
    expect(screen.getByLabelText("Banho de Luz")).toBeChecked();

    // Disable it
    fireEvent.click(screen.getByLabelText("Banho de Luz"));

    expect(mockOnChange).toHaveBeenCalledWith({
      returnWeeks: 2,
      spiritualMedicalDischarge: false,
      rod: recommendations.rod,
    });
  });

  it("shows light bath fields when enabled", () => {
    const recommendations = createMockRecommendationsWithTreatments();
    render(
      <TreatmentRecommendationsSection
        recommendations={recommendations}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByLabelText("Data de Início")).toBeInTheDocument();
    expect(screen.getByLabelText("Cor")).toBeInTheDocument();
    expect(screen.getByLabelText("Duração (7min = 1)")).toBeInTheDocument();
    expect(screen.getByLabelText("Quantidade de Sessões")).toBeInTheDocument();
  });

  it("handles light bath color change", () => {
    const recommendations = createMockRecommendationsWithTreatments();
    render(
      <TreatmentRecommendationsSection
        recommendations={recommendations}
        onChange={mockOnChange}
      />
    );

    const colorSelect = screen.getByLabelText("Cor");
    fireEvent.change(colorSelect, { target: { value: "verde" } });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...recommendations,
      lightBath: {
        ...recommendations.lightBath!,
        color: "verde",
      },
    });
  });

  it("handles light bath duration change", () => {
    const recommendations = createMockRecommendationsWithTreatments();
    render(
      <TreatmentRecommendationsSection
        recommendations={recommendations}
        onChange={mockOnChange}
      />
    );

    const durationInput = screen.getByLabelText("Duração (7min = 1)");
    fireEvent.change(durationInput, { target: { value: "3" } });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...recommendations,
      lightBath: {
        ...recommendations.lightBath!,
        duration: 3,
      },
    });
  });

  it("enables rod treatment section", () => {
    const recommendations = createMockRecommendations();
    render(
      <TreatmentRecommendationsSection
        recommendations={recommendations}
        onChange={mockOnChange}
      />
    );

    fireEvent.click(screen.getByLabelText("Tratamento com Bastão"));

    expect(mockOnChange).toHaveBeenCalledWith({
      ...recommendations,
      rod: {
        startDate: expect.any(Date),
        bodyLocation: [],
        quantity: 1,
      },
    });
  });

  it("disables rod treatment section", () => {
    const recommendations = createMockRecommendationsWithTreatments();
    render(
      <TreatmentRecommendationsSection
        recommendations={recommendations}
        onChange={mockOnChange}
      />
    );

    // Rod should be enabled initially
    expect(screen.getByLabelText("Tratamento com Bastão")).toBeChecked();

    // Disable it
    fireEvent.click(screen.getByLabelText("Tratamento com Bastão"));

    expect(mockOnChange).toHaveBeenCalledWith({
      returnWeeks: 2,
      spiritualMedicalDischarge: false,
      lightBath: recommendations.lightBath,
    });
  });

  it("shows rod fields when enabled", () => {
    const recommendations = createMockRecommendationsWithTreatments();
    render(
      <TreatmentRecommendationsSection
        recommendations={recommendations}
        onChange={mockOnChange}
      />
    );

    // Find the second "Data de Início" and "Quantidade de Sessões" (for rod)
    const dateInputs = screen.getAllByLabelText("Data de Início");
    const quantityInputs = screen.getAllByLabelText("Quantidade de Sessões");

    expect(dateInputs).toHaveLength(2); // One for light bath, one for rod
    expect(quantityInputs).toHaveLength(2); // One for light bath, one for rod
  });

  it("handles rod quantity change", () => {
    const recommendations = createMockRecommendationsWithTreatments();
    render(
      <TreatmentRecommendationsSection
        recommendations={recommendations}
        onChange={mockOnChange}
      />
    );

    // Find the rod section inputs by value and max attribute
    // Ensure we get the rod input which has max="20" and is in the rod section
    const allQuantityInputs = screen.getAllByDisplayValue(
      recommendations.rod!.quantity.toString()
    );
    const rodInput = allQuantityInputs.find(
      (input) =>
        input.getAttribute("max") === "20" && input.className.includes("w-full") // Rod has w-full, lightBath has w-20
    );

    fireEvent.change(rodInput!, { target: { value: "7" } });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...recommendations,
      rod: {
        ...recommendations.rod!,
        quantity: 7,
      },
    });
  });

  it("renders all available light bath colors", () => {
    const recommendations = createMockRecommendationsWithTreatments();
    render(
      <TreatmentRecommendationsSection
        recommendations={recommendations}
        onChange={mockOnChange}
      />
    );

    const expectedColors = [
      "Azul",
      "Verde",
      "Amarelo",
      "Vermelho",
      "Violeta",
      "Branco",
      "Laranja",
    ];

    expectedColors.forEach((color) => {
      expect(screen.getByText(color)).toBeInTheDocument();
    });
  });

  it("handles date changes for light bath", () => {
    const recommendations = createMockRecommendationsWithTreatments();
    render(
      <TreatmentRecommendationsSection
        recommendations={recommendations}
        onChange={mockOnChange}
      />
    );

    const dateInputs = screen.getAllByLabelText("Data de Início");
    const lightBathDateInput = dateInputs[0];

    fireEvent.change(lightBathDateInput, { target: { value: "2025-03-15" } });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...recommendations,
      lightBath: {
        ...recommendations.lightBath!,
        startDate: new Date("2025-03-15"),
      },
    });
  });

  it("handles date changes for rod", () => {
    const recommendations = createMockRecommendationsWithTreatments();
    render(
      <TreatmentRecommendationsSection
        recommendations={recommendations}
        onChange={mockOnChange}
      />
    );

    const dateInputs = screen.getAllByLabelText("Data de Início");
    const rodDateInput = dateInputs[1];

    fireEvent.change(rodDateInput, { target: { value: "2025-04-20" } });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...recommendations,
      rod: {
        ...recommendations.rod!,
        startDate: new Date("2025-04-20"),
      },
    });
  });
});
