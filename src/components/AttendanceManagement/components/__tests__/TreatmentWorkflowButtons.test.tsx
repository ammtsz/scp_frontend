import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TreatmentWorkflowButtons } from "../TreatmentWorkflowButtons";

describe("TreatmentWorkflowButtons", () => {
  const mockOnEndOfDayClick = jest.fn();
  const mockOnUnFinalizeClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("when day is not finalized", () => {
    it("should render the Finalizar Dia button", () => {
      render(
        <TreatmentWorkflowButtons
          onEndOfDayClick={mockOnEndOfDayClick}
          onUnFinalizeClick={mockOnUnFinalizeClick}
          isDayFinalized={false}
        />
      );

      expect(screen.getByText("Finalizar Dia")).toBeInTheDocument();
      expect(screen.queryByText("Dia finalizado")).not.toBeInTheDocument();
      expect(screen.queryByText("Desfinalizar")).not.toBeInTheDocument();
    });

    it("should call onEndOfDayClick when Finalizar Dia button is clicked", () => {
      render(
        <TreatmentWorkflowButtons
          onEndOfDayClick={mockOnEndOfDayClick}
          onUnFinalizeClick={mockOnUnFinalizeClick}
          isDayFinalized={false}
        />
      );

      fireEvent.click(screen.getByText("Finalizar Dia"));
      expect(mockOnEndOfDayClick).toHaveBeenCalledTimes(1);
    });

    it("should apply correct classes to Finalizar Dia button", () => {
      render(
        <TreatmentWorkflowButtons
          onEndOfDayClick={mockOnEndOfDayClick}
          onUnFinalizeClick={mockOnUnFinalizeClick}
          isDayFinalized={false}
        />
      );

      const button = screen.getByText("Finalizar Dia");
      expect(button).toHaveClass(
        "button-primary",
        "w-full",
        "transition-colors"
      );
    });
  });

  describe("when day is finalized", () => {
    it("should render both Dia finalizado and Desfinalizar buttons", () => {
      render(
        <TreatmentWorkflowButtons
          onEndOfDayClick={mockOnEndOfDayClick}
          onUnFinalizeClick={mockOnUnFinalizeClick}
          isDayFinalized={true}
        />
      );

      expect(screen.getByText("Dia finalizado")).toBeInTheDocument();
      expect(screen.getByText("Desfinalizar")).toBeInTheDocument();
      expect(screen.queryByText("Finalizar Dia")).not.toBeInTheDocument();
    });

    it("should have Dia finalizado button disabled", () => {
      render(
        <TreatmentWorkflowButtons
          onEndOfDayClick={mockOnEndOfDayClick}
          onUnFinalizeClick={mockOnUnFinalizeClick}
          isDayFinalized={true}
        />
      );

      const finalizedButton = screen.getByText("Dia finalizado");
      expect(finalizedButton).toBeDisabled();
    });

    it("should call onUnFinalizeClick when Desfinalizar button is clicked", () => {
      render(
        <TreatmentWorkflowButtons
          onEndOfDayClick={mockOnEndOfDayClick}
          onUnFinalizeClick={mockOnUnFinalizeClick}
          isDayFinalized={true}
        />
      );

      fireEvent.click(screen.getByText("Desfinalizar"));
      expect(mockOnUnFinalizeClick).toHaveBeenCalledTimes(1);
    });

    it("should not call onEndOfDayClick when Dia finalizado button is clicked", () => {
      render(
        <TreatmentWorkflowButtons
          onEndOfDayClick={mockOnEndOfDayClick}
          onUnFinalizeClick={mockOnUnFinalizeClick}
          isDayFinalized={true}
        />
      );

      fireEvent.click(screen.getByText("Dia finalizado"));
      expect(mockOnEndOfDayClick).not.toHaveBeenCalled();
    });

    it("should apply correct classes to finalized state buttons", () => {
      render(
        <TreatmentWorkflowButtons
          onEndOfDayClick={mockOnEndOfDayClick}
          onUnFinalizeClick={mockOnUnFinalizeClick}
          isDayFinalized={true}
        />
      );

      const finalizedButton = screen.getByText("Dia finalizado");
      expect(finalizedButton).toHaveClass(
        "bg-gray-400",
        "text-gray-600",
        "cursor-not-allowed",
        "transition-colors",
        "flex-1"
      );

      const unfinalizeButton = screen.getByText("Desfinalizar");
      expect(unfinalizeButton).toHaveClass(
        "bg-orange-500",
        "hover:bg-orange-600",
        "text-white",
        "px-4",
        "py-2",
        "rounded-md",
        "transition-colors",
        "text-sm"
      );
    });
  });

  describe("with default props", () => {
    it("should work without onUnFinalizeClick prop", () => {
      render(
        <TreatmentWorkflowButtons
          onEndOfDayClick={mockOnEndOfDayClick}
          isDayFinalized={false}
        />
      );

      expect(screen.getByText("Finalizar Dia")).toBeInTheDocument();
    });

    it("should default isDayFinalized to false", () => {
      render(
        <TreatmentWorkflowButtons
          onEndOfDayClick={mockOnEndOfDayClick}
          onUnFinalizeClick={mockOnUnFinalizeClick}
        />
      );

      expect(screen.getByText("Finalizar Dia")).toBeInTheDocument();
      expect(screen.queryByText("Dia finalizado")).not.toBeInTheDocument();
    });
  });
});
