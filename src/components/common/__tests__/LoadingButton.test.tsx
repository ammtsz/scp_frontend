import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LoadingButton from "../LoadingButton";

describe("LoadingButton", () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render button with children text", () => {
      render(<LoadingButton>Click me</LoadingButton>);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Click me");
    });

    it("should render button with complex children", () => {
      render(
        <LoadingButton>
          <span>Save</span>
          <span> Document</span>
        </LoadingButton>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("Save Document");
    });

    it("should be enabled by default", () => {
      render(<LoadingButton>Click me</LoadingButton>);

      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
    });
  });

  describe("Loading State", () => {
    it("should show loading text when isLoading is true", () => {
      render(<LoadingButton isLoading={true}>Click me</LoadingButton>);

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("Carregando...");
      expect(button).not.toHaveTextContent("Click me");
    });

    it("should show custom loading text", () => {
      render(
        <LoadingButton isLoading={true} loadingText="Salvando...">
          Save
        </LoadingButton>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("Salvando...");
      expect(button).not.toHaveTextContent("Save");
    });

    it("should be disabled when isLoading is true", () => {
      render(<LoadingButton isLoading={true}>Click me</LoadingButton>);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should not show loading text when isLoading is false", () => {
      render(<LoadingButton isLoading={false}>Click me</LoadingButton>);

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("Click me");
      expect(button).not.toHaveTextContent("Carregando...");
    });
  });

  describe("Disabled State", () => {
    it("should be disabled when disabled prop is true", () => {
      render(<LoadingButton disabled={true}>Click me</LoadingButton>);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should be disabled when both disabled and isLoading are true", () => {
      render(
        <LoadingButton disabled={true} isLoading={true}>
          Click me
        </LoadingButton>
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should be disabled when isLoading is true even if disabled is false", () => {
      render(
        <LoadingButton disabled={false} isLoading={true}>
          Click me
        </LoadingButton>
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should be enabled when both disabled and isLoading are false", () => {
      render(
        <LoadingButton disabled={false} isLoading={false}>
          Click me
        </LoadingButton>
      );

      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
    });
  });

  describe("Variant Styling", () => {
    it("should apply primary variant by default", () => {
      render(<LoadingButton>Click me</LoadingButton>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("button", "button-primary");
    });

    it("should apply primary variant when specified", () => {
      render(<LoadingButton variant="primary">Click me</LoadingButton>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("button", "button-primary");
    });

    it("should apply secondary variant", () => {
      render(<LoadingButton variant="secondary">Click me</LoadingButton>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("button", "button-secondary");
    });

    it("should apply danger variant with proper classes", () => {
      render(<LoadingButton variant="danger">Delete</LoadingButton>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "button",
        "bg-red-600",
        "hover:bg-red-700",
        "text-white"
      );
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom className", () => {
      render(
        <LoadingButton className="my-custom-class">Click me</LoadingButton>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("button", "button-primary", "my-custom-class");
    });

    it("should apply multiple custom classes", () => {
      render(
        <LoadingButton className="class1 class2 class3">Click me</LoadingButton>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "button",
        "button-primary",
        "class1",
        "class2",
        "class3"
      );
    });

    it("should handle empty className", () => {
      render(<LoadingButton className="">Click me</LoadingButton>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("button", "button-primary");
    });
  });

  describe("Event Handling", () => {
    it("should call onClick when clicked and not loading", () => {
      render(<LoadingButton onClick={mockOnClick}>Click me</LoadingButton>);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it("should not call onClick when loading", () => {
      render(
        <LoadingButton onClick={mockOnClick} isLoading={true}>
          Click me
        </LoadingButton>
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it("should not call onClick when disabled", () => {
      render(
        <LoadingButton onClick={mockOnClick} disabled={true}>
          Click me
        </LoadingButton>
      );

      const button = screen.getByRole("button");
      fireEvent.click(button);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it("should handle other event handlers", () => {
      const mockOnFocus = jest.fn();
      const mockOnBlur = jest.fn();

      render(
        <LoadingButton onFocus={mockOnFocus} onBlur={mockOnBlur}>
          Click me
        </LoadingButton>
      );

      const button = screen.getByRole("button");

      fireEvent.focus(button);
      expect(mockOnFocus).toHaveBeenCalledTimes(1);

      fireEvent.blur(button);
      expect(mockOnBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe("HTML Attributes", () => {
    it("should forward standard button attributes", () => {
      render(
        <LoadingButton
          type="submit"
          id="test-button"
          data-testid="custom-button"
          aria-label="Custom button"
        >
          Submit
        </LoadingButton>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "submit");
      expect(button).toHaveAttribute("id", "test-button");
      expect(button).toHaveAttribute("data-testid", "custom-button");
      expect(button).toHaveAttribute("aria-label", "Custom button");
    });

    it("should handle form attributes", () => {
      render(
        <LoadingButton form="my-form" formAction="/submit" formMethod="post">
          Submit
        </LoadingButton>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("form", "my-form");
      expect(button).toHaveAttribute("formAction", "/submit");
      expect(button).toHaveAttribute("formMethod", "post");
    });
  });

  describe("Accessibility", () => {
    it("should be focusable when not disabled", () => {
      render(<LoadingButton>Click me</LoadingButton>);

      const button = screen.getByRole("button");
      button.focus();

      expect(button).toHaveFocus();
    });

    it("should not be focusable when disabled", () => {
      render(<LoadingButton disabled={true}>Click me</LoadingButton>);

      const button = screen.getByRole("button");

      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("disabled");
    });

    it("should support aria attributes", () => {
      render(
        <LoadingButton aria-describedby="help-text" aria-pressed="false">
          Toggle
        </LoadingButton>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-describedby", "help-text");
      expect(button).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("Loading State Transitions", () => {
    it("should handle loading state changes", () => {
      const { rerender } = render(<LoadingButton>Save</LoadingButton>);

      let button = screen.getByRole("button");
      expect(button).toHaveTextContent("Save");
      expect(button).not.toBeDisabled();

      rerender(<LoadingButton isLoading={true}>Save</LoadingButton>);

      button = screen.getByRole("button");
      expect(button).toHaveTextContent("Carregando...");
      expect(button).toBeDisabled();

      rerender(<LoadingButton isLoading={false}>Save</LoadingButton>);

      button = screen.getByRole("button");
      expect(button).toHaveTextContent("Save");
      expect(button).not.toBeDisabled();
    });

    it("should handle variant changes while loading", () => {
      const { rerender } = render(
        <LoadingButton variant="primary" isLoading={true}>
          Action
        </LoadingButton>
      );

      let button = screen.getByRole("button");
      expect(button).toHaveClass("button-primary");
      expect(button).toHaveTextContent("Carregando...");

      rerender(
        <LoadingButton variant="danger" isLoading={true}>
          Action
        </LoadingButton>
      );

      button = screen.getByRole("button");
      expect(button).toHaveClass(
        "bg-red-600",
        "hover:bg-red-700",
        "text-white"
      );
      expect(button).toHaveTextContent("Carregando...");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty children gracefully", () => {
      render(<LoadingButton>{""}</LoadingButton>);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should handle null children gracefully", () => {
      render(<LoadingButton>{null}</LoadingButton>);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should handle undefined loadingText gracefully", () => {
      render(
        <LoadingButton
          isLoading={true}
          loadingText={undefined as unknown as string}
        >
          Save
        </LoadingButton>
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should handle empty string loadingText", () => {
      render(
        <LoadingButton isLoading={true} loadingText="">
          Save
        </LoadingButton>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("");
      expect(button).not.toHaveTextContent("Save");
    });
  });

  describe("Component Combinations", () => {
    it("should work with all props combined", () => {
      render(
        <LoadingButton
          variant="danger"
          isLoading={true}
          loadingText="Deleting..."
          disabled={false}
          className="extra-class"
          onClick={mockOnClick}
          type="button"
          data-testid="complex-button"
        >
          Delete Item
        </LoadingButton>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "button",
        "bg-red-600",
        "hover:bg-red-700",
        "text-white",
        "extra-class"
      );
      expect(button).toHaveTextContent("Deleting...");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("type", "button");
      expect(button).toHaveAttribute("data-testid", "complex-button");

      // Should not trigger onClick when loading
      fireEvent.click(button);
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });
});
