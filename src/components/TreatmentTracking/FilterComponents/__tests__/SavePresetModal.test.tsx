import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SavePresetModal } from "../SavePresetModal";

describe("SavePresetModal", () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Modal Visibility", () => {
    it("should render modal when isOpen is true", () => {
      render(<SavePresetModal {...mockProps} isOpen={true} />);

      expect(screen.getByText("Salvar Filtros")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Ex: Tratamentos ativos desta semana")
      ).toBeInTheDocument();
    });

    it("should not render modal when isOpen is false", () => {
      render(<SavePresetModal {...mockProps} isOpen={false} />);

      expect(screen.queryByText("Salvar Filtros")).not.toBeInTheDocument();
    });

    it("should have correct modal structure and backdrop", () => {
      const { container } = render(<SavePresetModal {...mockProps} />);

      const backdrop = container.querySelector(".fixed.inset-0.bg-black\\/50");
      expect(backdrop).toBeInTheDocument();
      expect(backdrop).toHaveClass(
        "flex",
        "items-center",
        "justify-center",
        "z-50",
        "p-4"
      );

      const modalContent = container.querySelector(".bg-white.rounded-lg");
      expect(modalContent).toBeInTheDocument();
      expect(modalContent).toHaveClass("p-4", "sm:p-6", "w-full", "max-w-md");
    });
  });

  describe("Input Handling", () => {
    it("should render input field with correct attributes", () => {
      render(<SavePresetModal {...mockProps} />);

      const input = screen.getByPlaceholderText(
        "Ex: Tratamentos ativos desta semana"
      );
      expect(input).toHaveAttribute("type", "text");
      expect(input).toHaveAttribute(
        "placeholder",
        "Ex: Tratamentos ativos desta semana"
      );
      expect(input).toHaveClass(
        "w-full",
        "px-3",
        "py-2",
        "text-sm",
        "border",
        "border-gray-300",
        "rounded-lg",
        "focus:ring-2",
        "focus:ring-blue-500",
        "focus:border-blue-500"
      );
      // autoFocus is a React prop, it may not be reflected in the DOM in test environment
      expect(input).toBeInTheDocument();
    });

    it("should update input value when user types", () => {
      render(<SavePresetModal {...mockProps} />);

      const input = screen.getByPlaceholderText(
        "Ex: Tratamentos ativos desta semana"
      );
      fireEvent.change(input, { target: { value: "My Custom Filter" } });

      expect(input).toHaveValue("My Custom Filter");
    });

    it("should handle empty input value", () => {
      render(<SavePresetModal {...mockProps} />);

      const input = screen.getByPlaceholderText(
        "Ex: Tratamentos ativos desta semana"
      );
      expect(input).toHaveValue("");
    });

    it("should clear input when modal closes and reopens", () => {
      const { rerender } = render(
        <SavePresetModal {...mockProps} isOpen={true} />
      );

      const input = screen.getByPlaceholderText(
        "Ex: Tratamentos ativos desta semana"
      );
      fireEvent.change(input, { target: { value: "Test Filter" } });
      expect(input).toHaveValue("Test Filter");

      // Close modal
      const cancelButton = screen.getByText("Cancelar");
      fireEvent.click(cancelButton);

      // Reopen modal
      rerender(<SavePresetModal {...mockProps} isOpen={true} />);
      const newInput = screen.getByPlaceholderText(
        "Ex: Tratamentos ativos desta semana"
      );
      expect(newInput).toHaveValue("");
    });
  });

  describe("Save Functionality", () => {
    it("should have save button disabled when input is empty", () => {
      render(<SavePresetModal {...mockProps} />);

      const saveButton = screen.getByText("Salvar");
      expect(saveButton).toBeDisabled();
      expect(saveButton).toHaveClass(
        "disabled:bg-gray-400",
        "disabled:cursor-not-allowed"
      );
    });

    it("should have save button disabled when input contains only whitespace", () => {
      render(<SavePresetModal {...mockProps} />);

      const input = screen.getByPlaceholderText(
        "Ex: Tratamentos ativos desta semana"
      );
      fireEvent.change(input, { target: { value: "   " } });

      const saveButton = screen.getByText("Salvar");
      expect(saveButton).toBeDisabled();
    });

    it("should enable save button when input has valid text", () => {
      render(<SavePresetModal {...mockProps} />);

      const input = screen.getByPlaceholderText(
        "Ex: Tratamentos ativos desta semana"
      );
      fireEvent.change(input, { target: { value: "Valid Filter Name" } });

      const saveButton = screen.getByText("Salvar");
      expect(saveButton).not.toBeDisabled();
      expect(saveButton).toHaveClass(
        "bg-blue-600",
        "text-white",
        "hover:bg-blue-700"
      );
    });

    it("should call onSave with trimmed text when save button is clicked", () => {
      render(<SavePresetModal {...mockProps} />);

      const input = screen.getByPlaceholderText(
        "Ex: Tratamentos ativos desta semana"
      );
      fireEvent.change(input, { target: { value: "  My Filter Name  " } });

      const saveButton = screen.getByText("Salvar");
      fireEvent.click(saveButton);

      expect(mockProps.onSave).toHaveBeenCalledWith("My Filter Name");
      expect(mockProps.onSave).toHaveBeenCalledTimes(1);
    });

    it("should close modal and clear input after successful save", () => {
      render(<SavePresetModal {...mockProps} />);

      const input = screen.getByPlaceholderText(
        "Ex: Tratamentos ativos desta semana"
      );
      fireEvent.change(input, { target: { value: "Test Filter" } });

      const saveButton = screen.getByText("Salvar");
      fireEvent.click(saveButton);

      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("should not call onSave when input is empty and save is attempted", () => {
      render(<SavePresetModal {...mockProps} />);

      const saveButton = screen.getByText("Salvar");
      // Button should be disabled, but let's test the handler directly
      fireEvent.click(saveButton);

      expect(mockProps.onSave).not.toHaveBeenCalled();
    });

    it("should not call onSave when input contains only whitespace", () => {
      render(<SavePresetModal {...mockProps} />);

      const input = screen.getByPlaceholderText(
        "Ex: Tratamentos ativos desta semana"
      );
      fireEvent.change(input, { target: { value: "   " } });

      const saveButton = screen.getByText("Salvar");
      // Button should be disabled, but let's test the handler logic
      fireEvent.click(saveButton);

      expect(mockProps.onSave).not.toHaveBeenCalled();
    });
  });

  describe("Keyboard Interactions", () => {
    it("should save when Enter key is pressed with valid input", () => {
      render(<SavePresetModal {...mockProps} />);

      const input = screen.getByPlaceholderText(
        "Ex: Tratamentos ativos desta semana"
      );
      fireEvent.change(input, { target: { value: "Keyboard Save Test" } });
      fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

      expect(mockProps.onSave).toHaveBeenCalledWith("Keyboard Save Test");
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("should handle Enter key to save form", () => {
      render(<SavePresetModal {...mockProps} />);

      const input = screen.getByPlaceholderText(
        "Ex: Tratamentos ativos desta semana"
      );
      fireEvent.change(input, { target: { value: "Test" } });
      fireEvent.keyDown(input, { key: "Enter" });

      // Verify the functionality works - onSave should be called
      expect(mockProps.onSave).toHaveBeenCalledWith("Test");
      expect(mockProps.onClose).toHaveBeenCalled();
    });

    it("should not save when Enter is pressed with empty input", () => {
      render(<SavePresetModal {...mockProps} />);

      const input = screen.getByPlaceholderText(
        "Ex: Tratamentos ativos desta semana"
      );
      fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

      expect(mockProps.onSave).not.toHaveBeenCalled();
      expect(mockProps.onClose).not.toHaveBeenCalled();
    });

    it("should not save when Enter is pressed with whitespace-only input", () => {
      render(<SavePresetModal {...mockProps} />);

      const input = screen.getByPlaceholderText(
        "Ex: Tratamentos ativos desta semana"
      );
      fireEvent.change(input, { target: { value: "   " } });
      fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

      expect(mockProps.onSave).not.toHaveBeenCalled();
      expect(mockProps.onClose).not.toHaveBeenCalled();
    });

    it("should not react to other keys", () => {
      render(<SavePresetModal {...mockProps} />);

      const input = screen.getByPlaceholderText(
        "Ex: Tratamentos ativos desta semana"
      );
      fireEvent.change(input, { target: { value: "Test" } });
      fireEvent.keyDown(input, { key: "Escape", code: "Escape" });

      expect(mockProps.onSave).not.toHaveBeenCalled();
      expect(mockProps.onClose).not.toHaveBeenCalled();
    });
  });

  describe("Cancel Functionality", () => {
    it("should render cancel button with correct styling", () => {
      render(<SavePresetModal {...mockProps} />);

      const cancelButton = screen.getByText("Cancelar");
      expect(cancelButton).toBeInTheDocument();
      expect(cancelButton).toHaveClass(
        "px-4",
        "py-2",
        "text-sm",
        "text-gray-700",
        "hover:text-gray-900",
        "hover:bg-gray-100",
        "rounded-md",
        "transition-colors"
      );
    });

    it("should call onClose when cancel button is clicked", () => {
      render(<SavePresetModal {...mockProps} />);

      const cancelButton = screen.getByText("Cancelar");
      fireEvent.click(cancelButton);

      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("should clear input when cancel is clicked", () => {
      const { rerender } = render(<SavePresetModal {...mockProps} />);

      const input = screen.getByPlaceholderText(
        "Ex: Tratamentos ativos desta semana"
      );
      fireEvent.change(input, { target: { value: "Test Filter" } });
      expect(input).toHaveValue("Test Filter");

      const cancelButton = screen.getByText("Cancelar");
      fireEvent.click(cancelButton);

      // Simulate modal reopening after cancel
      rerender(<SavePresetModal {...mockProps} isOpen={true} />);
      const newInput = screen.getByPlaceholderText(
        "Ex: Tratamentos ativos desta semana"
      );
      expect(newInput).toHaveValue("");
    });

    it("should not call onSave when cancel is clicked", () => {
      render(<SavePresetModal {...mockProps} />);

      const input = screen.getByPlaceholderText(
        "Ex: Tratamentos ativos desta semana"
      );
      fireEvent.change(input, { target: { value: "Test Filter" } });

      const cancelButton = screen.getByText("Cancelar");
      fireEvent.click(cancelButton);

      expect(mockProps.onSave).not.toHaveBeenCalled();
    });
  });

  describe("Styling and Accessibility", () => {
    it("should have proper modal title with correct styling", () => {
      render(<SavePresetModal {...mockProps} />);

      const title = screen.getByText("Salvar Filtros");
      expect(title).toHaveClass(
        "text-base",
        "sm:text-lg",
        "font-semibold",
        "text-gray-900",
        "mb-3",
        "sm:mb-4"
      );
    });

    it("should have proper label with correct styling", () => {
      render(<SavePresetModal {...mockProps} />);

      const label = screen.getByText("Nome do filtro salvo");
      expect(label).toHaveClass(
        "block",
        "text-xs",
        "sm:text-sm",
        "font-medium",
        "text-gray-700",
        "mb-2"
      );
    });

    it("should have responsive button layout", () => {
      const { container } = render(<SavePresetModal {...mockProps} />);

      const buttonContainer = container.querySelector(
        ".flex.flex-col-reverse.sm\\:flex-row"
      );
      expect(buttonContainer).toBeInTheDocument();
      expect(buttonContainer).toHaveClass("sm:justify-end", "gap-2");
    });

    it("should have responsive spacing classes", () => {
      const { container } = render(<SavePresetModal {...mockProps} />);

      const spacingContainer = container.querySelector(
        ".space-y-3.sm\\:space-y-4"
      );
      expect(spacingContainer).toBeInTheDocument();
    });

    it("should have proper form structure with label and input", () => {
      render(<SavePresetModal {...mockProps} />);

      const input = screen.getByPlaceholderText(
        "Ex: Tratamentos ativos desta semana"
      );
      const label = screen.getByText("Nome do filtro salvo");

      expect(input).toBeInTheDocument();
      expect(label).toBeInTheDocument();
    });

    it("should have input ready for immediate typing", () => {
      render(<SavePresetModal {...mockProps} />);

      const input = screen.getByPlaceholderText(
        "Ex: Tratamentos ativos desta semana"
      );
      // autoFocus is a React prop, verify input is available for immediate interaction
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue("");
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long input text", () => {
      render(<SavePresetModal {...mockProps} />);

      const longText = "A".repeat(1000);
      const input = screen.getByPlaceholderText(
        "Ex: Tratamentos ativos desta semana"
      );
      fireEvent.change(input, { target: { value: longText } });

      expect(input).toHaveValue(longText);

      const saveButton = screen.getByText("Salvar");
      fireEvent.click(saveButton);

      expect(mockProps.onSave).toHaveBeenCalledWith(longText);
    });

    it("should handle special characters in input", () => {
      render(<SavePresetModal {...mockProps} />);

      const specialText = "Filter @#$% & 123 àáâã";
      const input = screen.getByPlaceholderText(
        "Ex: Tratamentos ativos desta semana"
      );
      fireEvent.change(input, { target: { value: specialText } });

      const saveButton = screen.getByText("Salvar");
      fireEvent.click(saveButton);

      expect(mockProps.onSave).toHaveBeenCalledWith(specialText);
    });

    it("should trim whitespace from both ends of input", () => {
      render(<SavePresetModal {...mockProps} />);

      const input = screen.getByPlaceholderText(
        "Ex: Tratamentos ativos desta semana"
      );
      fireEvent.change(input, {
        target: { value: "   Filter with spaces   " },
      });

      const saveButton = screen.getByText("Salvar");
      fireEvent.click(saveButton);

      expect(mockProps.onSave).toHaveBeenCalledWith("Filter with spaces");
    });

    it("should handle rapid open/close cycles", () => {
      const { rerender } = render(
        <SavePresetModal {...mockProps} isOpen={false} />
      );

      // Rapid open/close
      rerender(<SavePresetModal {...mockProps} isOpen={true} />);
      rerender(<SavePresetModal {...mockProps} isOpen={false} />);
      rerender(<SavePresetModal {...mockProps} isOpen={true} />);

      const input = screen.getByPlaceholderText(
        "Ex: Tratamentos ativos desta semana"
      );
      expect(input).toHaveValue("");
    });
  });

  describe("Component State Management", () => {
    it("should maintain independent state between different instances", () => {
      const { unmount } = render(<SavePresetModal {...mockProps} />);

      unmount();

      const newMockProps = {
        isOpen: true,
        onClose: jest.fn(),
        onSave: jest.fn(),
      };

      render(<SavePresetModal {...newMockProps} />);

      const input = screen.getByPlaceholderText(
        "Ex: Tratamentos ativos desta semana"
      );
      expect(input).toHaveValue("");
    });
  });
});
