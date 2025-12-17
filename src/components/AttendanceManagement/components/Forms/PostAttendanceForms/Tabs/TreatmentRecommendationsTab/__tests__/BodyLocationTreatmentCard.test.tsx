/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import BodyLocationTreatmentCard from "../BodyLocationTreatmentCard";
import type {
  LightBathLocationTreatment,
  RodLocationTreatment,
} from "../../../types";

// Mock LIGHT_BATH_COLORS
jest.mock("@/utils/treatmentColors", () => ({
  LIGHT_BATH_COLORS: [
    "Azul",
    "Verde",
    "Amarelo",
    "Laranja",
    "Vermelho",
    "Violeta",
  ],
}));

describe("BodyLocationTreatmentCard", () => {
  const mockLightBathTreatment: LightBathLocationTreatment = {
    locations: ["Cabeça", "Peito"],
    color: "Azul",
    duration: 2,
    quantity: 5,
    startDate: "2024-01-01",
  };

  const mockRodTreatment: RodLocationTreatment = {
    locations: ["Braços"],
    quantity: 3,
    startDate: "2024-01-01",
  };

  const mockOnChange = jest.fn();
  const mockOnRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Light Bath Treatment", () => {
    it("should render light bath treatment card correctly", () => {
      render(
        <BodyLocationTreatmentCard
          locations={["Cabeça", "Peito"]}
          treatmentType="lightBath"
          treatment={mockLightBathTreatment}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.getByText("Locais:")).toBeInTheDocument();
      expect(screen.getByText("Cabeça")).toBeInTheDocument();
      expect(screen.getByText("Peito")).toBeInTheDocument();
      expect(screen.getByDisplayValue("2024-01-01")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Azul")).toBeInTheDocument();
      expect(screen.getByDisplayValue("5")).toBeInTheDocument();
    });

    it("should display single location correctly", () => {
      render(
        <BodyLocationTreatmentCard
          locations={["Cabeça"]}
          treatmentType="lightBath"
          treatment={mockLightBathTreatment}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.getByText("Local:")).toBeInTheDocument();
      expect(screen.getByText("Cabeça")).toBeInTheDocument();
    });

    it("should call onChange when start date changes", () => {
      render(
        <BodyLocationTreatmentCard
          locations={["Cabeça"]}
          treatmentType="lightBath"
          treatment={mockLightBathTreatment}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      const dateInput = screen.getByDisplayValue("2024-01-01");
      fireEvent.change(dateInput, { target: { value: "2024-02-01" } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockLightBathTreatment,
        startDate: "2024-02-01",
      });
    });

    it("should call onChange when color changes", () => {
      render(
        <BodyLocationTreatmentCard
          locations={["Cabeça"]}
          treatmentType="lightBath"
          treatment={mockLightBathTreatment}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      const colorSelect = screen.getByDisplayValue("Azul");
      fireEvent.change(colorSelect, { target: { value: "Verde" } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockLightBathTreatment,
        color: "Verde",
      });
    });

    it("should call onChange when duration changes", () => {
      render(
        <BodyLocationTreatmentCard
          locations={["Cabeça"]}
          treatmentType="lightBath"
          treatment={mockLightBathTreatment}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      const durationSelects = screen.getAllByRole("combobox");
      const durationSelect = durationSelects.find(
        (select) => (select as HTMLSelectElement).value === "2"
      );
      fireEvent.change(durationSelect!, { target: { value: "4" } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockLightBathTreatment,
        duration: 4,
      });
    });

    it("should call onChange when quantity changes", () => {
      render(
        <BodyLocationTreatmentCard
          locations={["Cabeça"]}
          treatmentType="lightBath"
          treatment={mockLightBathTreatment}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      const quantityInput = screen.getByDisplayValue("5");
      fireEvent.change(quantityInput, { target: { value: "8" } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockLightBathTreatment,
        quantity: 8,
      });
    });

    it("should handle invalid quantity input gracefully", () => {
      render(
        <BodyLocationTreatmentCard
          locations={["Cabeça"]}
          treatmentType="lightBath"
          treatment={mockLightBathTreatment}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      const quantityInput = screen.getByDisplayValue("5");
      fireEvent.change(quantityInput, { target: { value: "" } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockLightBathTreatment,
        quantity: 1,
      });
    });

    it("should show all color options", () => {
      render(
        <BodyLocationTreatmentCard
          locations={["Cabeça"]}
          treatmentType="lightBath"
          treatment={mockLightBathTreatment}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      const colorSelects = screen.getAllByDisplayValue("Azul");
      expect(colorSelects.length).toBeGreaterThan(0);

      expect(screen.getByText("Selecione uma cor...")).toBeInTheDocument();
      expect(screen.getByText("Azul")).toBeInTheDocument();
      expect(screen.getByText("Verde")).toBeInTheDocument();
    });

    it("should show all duration options", () => {
      render(
        <BodyLocationTreatmentCard
          locations={["Cabeça"]}
          treatmentType="lightBath"
          treatment={mockLightBathTreatment}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.getByText("1 unidade (7 min)")).toBeInTheDocument();
      expect(screen.getByText("10 unidades (70 min)")).toBeInTheDocument();
    });
  });

  describe("Rod Treatment", () => {
    it("should render rod treatment card correctly", () => {
      render(
        <BodyLocationTreatmentCard
          locations={["Braços"]}
          treatmentType="rod"
          treatment={mockRodTreatment}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.getByText("Local:")).toBeInTheDocument();
      expect(screen.getByText("Braços")).toBeInTheDocument();
      expect(screen.getByDisplayValue("2024-01-01")).toBeInTheDocument();
      expect(screen.getByDisplayValue("3")).toBeInTheDocument();
    });

    it("should not show color and duration fields for rod treatment", () => {
      render(
        <BodyLocationTreatmentCard
          locations={["Braços"]}
          treatmentType="rod"
          treatment={mockRodTreatment}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.queryByText("Cor *")).not.toBeInTheDocument();
      expect(screen.queryByText("Duração *")).not.toBeInTheDocument();
    });

    it("should call onChange when rod quantity changes", () => {
      render(
        <BodyLocationTreatmentCard
          locations={["Braços"]}
          treatmentType="rod"
          treatment={mockRodTreatment}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      const quantityInput = screen.getByDisplayValue("3");
      fireEvent.change(quantityInput, { target: { value: "5" } });

      expect(mockOnChange).toHaveBeenCalledWith({
        ...mockRodTreatment,
        quantity: 5,
      });
    });
  });

  describe("Common Functionality", () => {
    it("should call onRemove when remove button is clicked", () => {
      render(
        <BodyLocationTreatmentCard
          locations={["Cabeça"]}
          treatmentType="lightBath"
          treatment={mockLightBathTreatment}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      const removeButton = screen.getByText("Remover");
      fireEvent.click(removeButton);

      expect(mockOnRemove).toHaveBeenCalled();
    });

    it("should disable all inputs when disabled prop is true", () => {
      render(
        <BodyLocationTreatmentCard
          locations={["Cabeça"]}
          treatmentType="lightBath"
          treatment={mockLightBathTreatment}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
          disabled={true}
        />
      );

      expect(screen.getByDisplayValue("2024-01-01")).toBeDisabled();
      expect(screen.getByDisplayValue("Azul")).toBeDisabled();
      expect(screen.getByDisplayValue("5")).toBeDisabled();
      expect(screen.getByText("Remover")).toBeDisabled();
    });

    it("should have correct input constraints", () => {
      render(
        <BodyLocationTreatmentCard
          locations={["Cabeça"]}
          treatmentType="lightBath"
          treatment={mockLightBathTreatment}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      const quantityInput = screen.getByDisplayValue("5");
      expect(quantityInput).toHaveAttribute("min", "1");
      expect(quantityInput).toHaveAttribute("max", "20");
      expect(quantityInput).toHaveAttribute("type", "number");
    });

    it("should have proper CSS classes for styling", () => {
      const { container } = render(
        <BodyLocationTreatmentCard
          locations={["Cabeça", "Pernas"]}
          treatmentType="lightBath"
          treatment={mockLightBathTreatment}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      const card = container.firstChild;
      expect(card).toHaveClass(
        "p-4",
        "border",
        "border-gray-200",
        "rounded-md",
        "bg-white"
      );

      const locationTags = container.querySelectorAll(".bg-blue-100");
      expect(locationTags).toHaveLength(2); // Two locations passed
    });

    it("should handle empty treatment values", () => {
      const emptyLightBathTreatment: LightBathLocationTreatment = {
        locations: ["Cabeça"],
        color: "",
        duration: 1,
        quantity: 1,
        startDate: "2024-01-01",
      };

      render(
        <BodyLocationTreatmentCard
          locations={["Cabeça"]}
          treatmentType="lightBath"
          treatment={emptyLightBathTreatment}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
        />
      );

      expect(screen.getByText("Selecione uma cor...")).toBeInTheDocument();
      expect(screen.getByDisplayValue("1")).toBeInTheDocument(); // quantity
      expect(screen.getByText("1 unidade (7 min)")).toBeInTheDocument(); // duration option
    });
  });
});
