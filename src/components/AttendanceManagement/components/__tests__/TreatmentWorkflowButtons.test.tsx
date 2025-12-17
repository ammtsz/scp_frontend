import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TreatmentWorkflowButtons } from "../TreatmentWorkflowButtons";

// Mock the modal store hook
const mockOpenEndOfDayModal = jest.fn();

jest.mock("@/stores/modalStore", () => ({
  useOpenEndOfDay: () => mockOpenEndOfDayModal,
}));

describe("TreatmentWorkflowButtons", () => {
  const mockOnFinalizeClick = jest.fn();
  const mockOnUnFinalizeClick = jest.fn();

  const defaultProps = {
    onUnFinalizeClick: mockOnUnFinalizeClick,
    onFinalizeClick: mockOnFinalizeClick,
    isDayFinalized: false,
    selectedDate: "2024-01-15",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("When day is not finalized", () => {
    it("renders finalize day button", () => {
      render(<TreatmentWorkflowButtons {...defaultProps} />);

      const button = screen.getByText("Finalizar Dia");
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    it("calls openEndOfDayModal when finalize button is clicked", () => {
      render(<TreatmentWorkflowButtons {...defaultProps} />);

      const button = screen.getByText("Finalizar Dia");
      fireEvent.click(button);

      expect(mockOpenEndOfDayModal).toHaveBeenCalledTimes(1);
      expect(mockOpenEndOfDayModal).toHaveBeenCalledWith({
        onFinalizeClick: mockOnFinalizeClick,
        selectedDate: "2024-01-15",
      });
    });

    it("has correct finalize button styling", () => {
      render(<TreatmentWorkflowButtons {...defaultProps} />);

      const button = screen.getByText("Finalizar Dia");
      expect(button).toHaveClass(
        "button",
        "button-primary",
        "w-full",
        "transition-colors"
      );
    });

    it("does not render unfinalize button", () => {
      render(<TreatmentWorkflowButtons {...defaultProps} />);

      expect(screen.queryByText("Desfinalizar")).not.toBeInTheDocument();
      expect(screen.queryByText("Dia finalizado")).not.toBeInTheDocument();
    });

    it("renders single button in container", () => {
      const { container } = render(
        <TreatmentWorkflowButtons {...defaultProps} />
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(1);
      expect(buttons[0]).toHaveTextContent("Finalizar Dia");

      const containerDiv = container.querySelector(
        ".mt-6.flex.gap-4.justify-center"
      );
      expect(containerDiv).toBeInTheDocument();
    });
  });

  describe("When day is finalized", () => {
    const finalizedProps = {
      ...defaultProps,
      isDayFinalized: true,
    };

    it("renders finalized status and unfinalize button", () => {
      render(<TreatmentWorkflowButtons {...finalizedProps} />);

      expect(screen.getByText("Dia finalizado")).toBeInTheDocument();
      expect(screen.getByText("Desfinalizar")).toBeInTheDocument();
    });

    it("finalized button is disabled", () => {
      render(<TreatmentWorkflowButtons {...finalizedProps} />);

      const finalizedButton = screen.getByText("Dia finalizado");
      expect(finalizedButton).toBeDisabled();
    });

    it("calls onUnFinalizeClick when unfinalize button is clicked", () => {
      render(<TreatmentWorkflowButtons {...finalizedProps} />);

      const button = screen.getByText("Desfinalizar");
      fireEvent.click(button);

      expect(mockOnUnFinalizeClick).toHaveBeenCalledTimes(1);
    });

    it("has correct finalized button styling", () => {
      render(<TreatmentWorkflowButtons {...finalizedProps} />);

      const finalizedButton = screen.getByText("Dia finalizado");
      expect(finalizedButton).toHaveClass(
        "button",
        "bg-gray-400",
        "text-gray-600",
        "cursor-not-allowed",
        "transition-colors",
        "flex-1"
      );
    });

    it("has correct unfinalize button styling", () => {
      render(<TreatmentWorkflowButtons {...finalizedProps} />);

      const button = screen.getByText("Desfinalizar");
      expect(button).toHaveClass(
        "button",
        "bg-orange-500",
        "hover:bg-orange-600",
        "text-white",
        "px-4",
        "py-2",
        "rounded-md",
        "transition-colors"
      );
    });

    it("renders two buttons in container", () => {
      render(<TreatmentWorkflowButtons {...finalizedProps} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2);
      expect(buttons[0]).toHaveTextContent("Dia finalizado");
      expect(buttons[1]).toHaveTextContent("Desfinalizar");
    });
  });

  describe("Component Structure", () => {
    it("has correct container structure", () => {
      const { container } = render(
        <TreatmentWorkflowButtons {...defaultProps} />
      );

      const containerDiv = container.querySelector("div");
      expect(containerDiv).toHaveClass(
        "mt-6",
        "flex",
        "gap-4",
        "justify-center"
      );
    });

    it("renders different content based on isDayFinalized prop", () => {
      const { rerender } = render(
        <TreatmentWorkflowButtons {...defaultProps} />
      );

      // Not finalized state
      expect(screen.getAllByRole("button")).toHaveLength(1);
      expect(screen.getByText("Finalizar Dia")).toBeInTheDocument();

      // Finalized state
      rerender(
        <TreatmentWorkflowButtons {...defaultProps} isDayFinalized={true} />
      );
      expect(screen.getAllByRole("button")).toHaveLength(2);
      expect(screen.getByText("Dia finalizado")).toBeInTheDocument();
      expect(screen.getByText("Desfinalizar")).toBeInTheDocument();
    });
  });

  describe("Props Handling", () => {
    it("passes correct parameters to openEndOfDayModal", () => {
      render(<TreatmentWorkflowButtons {...defaultProps} />);

      const button = screen.getByText("Finalizar Dia");
      fireEvent.click(button);

      expect(mockOpenEndOfDayModal).toHaveBeenCalledWith({
        onFinalizeClick: mockOnFinalizeClick,
        selectedDate: "2024-01-15",
      });
    });

    it("calls onUnFinalizeClick with correct parameters", () => {
      const finalizedProps = { ...defaultProps, isDayFinalized: true };
      render(<TreatmentWorkflowButtons {...finalizedProps} />);

      const button = screen.getByText("Desfinalizar");
      fireEvent.click(button);

      expect(mockOnUnFinalizeClick).toHaveBeenCalledTimes(1);
    });

    it("handles different selectedDate values", () => {
      const propsWithDifferentDate = {
        ...defaultProps,
        selectedDate: "2024-02-20",
      };
      render(<TreatmentWorkflowButtons {...propsWithDifferentDate} />);

      const button = screen.getByText("Finalizar Dia");
      fireEvent.click(button);

      expect(mockOpenEndOfDayModal).toHaveBeenCalledWith({
        onFinalizeClick: mockOnFinalizeClick,
        selectedDate: "2024-02-20",
      });
    });
  });

  describe("User Interaction", () => {
    it("finalize button responds to multiple clicks", () => {
      render(<TreatmentWorkflowButtons {...defaultProps} />);

      const button = screen.getByText("Finalizar Dia");
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockOpenEndOfDayModal).toHaveBeenCalledTimes(2);
    });

    it("unfinalize button responds to multiple clicks", () => {
      const finalizedProps = { ...defaultProps, isDayFinalized: true };
      render(<TreatmentWorkflowButtons {...finalizedProps} />);

      const button = screen.getByText("Desfinalizar");
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockOnUnFinalizeClick).toHaveBeenCalledTimes(2);
    });

    it("disabled button does not respond to clicks", () => {
      const finalizedProps = { ...defaultProps, isDayFinalized: true };
      render(<TreatmentWorkflowButtons {...finalizedProps} />);

      const disabledButton = screen.getByText("Dia finalizado");
      fireEvent.click(disabledButton);

      // No callbacks should be triggered for disabled button
      expect(mockOnFinalizeClick).not.toHaveBeenCalled();
      expect(mockOnUnFinalizeClick).not.toHaveBeenCalled();
      expect(mockOpenEndOfDayModal).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("finalize button has proper accessibility attributes", () => {
      render(<TreatmentWorkflowButtons {...defaultProps} />);

      const button = screen.getByRole("button", { name: "Finalizar Dia" });
      expect(button).toBeEnabled();
      expect(button).toHaveAttribute("type", "button");
    });

    it("unfinalize button has proper accessibility attributes", () => {
      const finalizedProps = { ...defaultProps, isDayFinalized: true };
      render(<TreatmentWorkflowButtons {...finalizedProps} />);

      const button = screen.getByRole("button", { name: "Desfinalizar" });
      expect(button).toBeEnabled();
      expect(button).toHaveAttribute("type", "button");
    });

    it("disabled button has proper disabled state", () => {
      const finalizedProps = { ...defaultProps, isDayFinalized: true };
      render(<TreatmentWorkflowButtons {...finalizedProps} />);

      const button = screen.getByRole("button", { name: "Dia finalizado" });
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("type", "button");
    });
  });
});
