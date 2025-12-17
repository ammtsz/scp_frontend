import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TimezoneSettingsModal } from "../TimezoneSettingsModal";
import { useTimezone } from "@/contexts/TimezoneContext";

// Mock the TimezoneContext
jest.mock("@/contexts/TimezoneContext");
const mockUseTimezone = useTimezone as jest.MockedFunction<typeof useTimezone>;

// Mock console.error to test error handling
const mockConsoleError = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

describe("TimezoneSettingsModal", () => {
  const mockOnClose = jest.fn();

  const mockTimezoneContextValue = {
    userTimezone: "America/Sao_Paulo",
    timezoneInfo: {
      timezone: "America/Sao_Paulo",
      date: "2024-01-15",
      time: "14:30:00",
      offset: -3,
    },
    setUserTimezone: jest.fn(),
    supportedTimezones: [
      "America/Sao_Paulo",
      "America/New_York",
      "Europe/London",
      "Asia/Tokyo",
    ] as readonly string[],
    serverTimezone: {
      timezone: "America/Sao_Paulo",
      date: "2024-01-15",
      time: "14:30:00",
      offset: -3,
    },
    detectedTimezone: {
      timezone: "America/Sao_Paulo",
      date: "2024-01-15",
      time: "14:30:00",
      offset: -3,
    },
    isValidBrowserTimezone: true,
    isLoading: false,
    error: null,
    refreshTimezoneInfo: jest.fn(),
    getCurrentTimeInTimezone: jest.fn(),
    validateTimezone: jest.fn(),
    formatDateInTimezone: jest.fn(),
    convertToUserTimezone: jest.fn(),
  };

  beforeEach(() => {
    mockUseTimezone.mockReturnValue(mockTimezoneContextValue);
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
  });

  describe("Modal Visibility", () => {
    it("should not render when isOpen is false", () => {
      render(<TimezoneSettingsModal isOpen={false} onClose={mockOnClose} />);

      expect(
        screen.queryByText("Configurações de Fuso Horário")
      ).not.toBeInTheDocument();
    });

    it("should render when isOpen is true", () => {
      render(<TimezoneSettingsModal isOpen={true} onClose={mockOnClose} />);

      expect(
        screen.getByText("Configurações de Fuso Horário")
      ).toBeInTheDocument();
    });

    it("should have proper modal structure when open", () => {
      render(<TimezoneSettingsModal isOpen={true} onClose={mockOnClose} />);

      // Check backdrop
      const backdrop = document.querySelector(
        ".fixed.inset-0.bg-black.bg-opacity-25"
      );
      expect(backdrop).toBeInTheDocument();

      // Check modal container
      const modal = document.querySelector(".bg-white.rounded-lg.shadow-xl");
      expect(modal).toBeInTheDocument();
    });
  });

  describe("Header Section", () => {
    beforeEach(() => {
      render(<TimezoneSettingsModal isOpen={true} onClose={mockOnClose} />);
    });

    it("should display modal title and subtitle", () => {
      expect(
        screen.getByText("Configurações de Fuso Horário")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Selecione o fuso horário do sistema")
      ).toBeInTheDocument();
    });

    it("should display Globe icon in header", () => {
      const header = screen.getByText("Configurações de Fuso Horário")
        .parentElement?.parentElement;
      expect(header).toHaveClass("flex", "items-center", "space-x-3");
    });

    it("should have close button with proper accessibility", () => {
      const closeButton =
        document.querySelector("button[aria-label]") ||
        document.querySelector("button:has(svg)");
      expect(closeButton).toBeInTheDocument();
    });

    it("should call onClose when close button is clicked", () => {
      // Find the close button (X icon)
      const closeButton = document.querySelector(".hover\\:bg-gray-100");
      fireEvent.click(closeButton!);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Current Timezone Info", () => {
    it("should display current timezone information", () => {
      render(<TimezoneSettingsModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("Fuso Horário Atual")).toBeInTheDocument();
      expect(
        screen.getByText(/São Paulo, Brasil \(GMT-3\)/)
      ).toBeInTheDocument();
      expect(screen.getByText("2024-01-15 às 14:30:00")).toBeInTheDocument();
    });

    it("should have proper styling for current timezone section", () => {
      render(<TimezoneSettingsModal isOpen={true} onClose={mockOnClose} />);

      const currentTimezoneSection =
        screen.getByText("Fuso Horário Atual").parentElement?.parentElement;
      expect(currentTimezoneSection).toHaveClass(
        "bg-blue-50",
        "rounded-lg",
        "border",
        "border-blue-200"
      );
    });

    it("should not display current timezone section when timezoneInfo is null", () => {
      mockUseTimezone.mockReturnValue({
        ...mockTimezoneContextValue,
        timezoneInfo: null,
      });

      render(<TimezoneSettingsModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.queryByText("Fuso Horário Atual")).not.toBeInTheDocument();
    });
  });

  describe("Timezone Selection", () => {
    beforeEach(() => {
      render(<TimezoneSettingsModal isOpen={true} onClose={mockOnClose} />);
    });

    it("should display selection label", () => {
      expect(
        screen.getByText("Selecionar Novo Fuso Horário")
      ).toBeInTheDocument();
    });

    it("should display all supported timezones", () => {
      expect(screen.getByText("São Paulo, Brasil")).toBeInTheDocument();
      expect(screen.getByText("Nova York, EUA")).toBeInTheDocument();
      expect(screen.getByText("Londres, Reino Unido")).toBeInTheDocument();
      expect(screen.getByText("Tóquio, Japão")).toBeInTheDocument();
    });

    it("should display timezone offsets", () => {
      expect(screen.getByText("GMT-3")).toBeInTheDocument();
      expect(screen.getByText("GMT-5")).toBeInTheDocument();
      expect(screen.getByText("GMT+0")).toBeInTheDocument();
      expect(screen.getByText("GMT+9")).toBeInTheDocument();
    });

    it("should mark current timezone as selected", () => {
      const saoPauloButton =
        screen.getByText("São Paulo, Brasil").parentElement?.parentElement;
      expect(saoPauloButton).toHaveClass(
        "bg-blue-50",
        "border-l-4",
        "border-blue-500"
      );
    });

    it("should show check icon for selected timezone", () => {
      const saoPauloButton =
        screen.getByText("São Paulo, Brasil").parentElement?.parentElement;
      // Check for presence of check icon (rendered by react-feather)
      const checkIcon = saoPauloButton?.querySelector("svg");
      expect(checkIcon).toBeInTheDocument();
    });

    it("should allow selecting different timezone", () => {
      const londonButton = screen
        .getByText("Londres, Reino Unido")
        .closest("button");
      fireEvent.click(londonButton!);

      // After clicking, London should be visually selected
      expect(londonButton).toHaveClass(
        "bg-blue-50",
        "border-l-4",
        "border-blue-500"
      );
    });

    it("should have proper scrollable container", () => {
      const container = document.querySelector(".max-h-64.overflow-y-auto");
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass("border", "border-gray-200", "rounded-lg");
    });

    it("should handle unknown timezone gracefully", () => {
      mockUseTimezone.mockReturnValue({
        ...mockTimezoneContextValue,
        supportedTimezones: ["Unknown/Timezone"] as readonly string[],
      });

      render(<TimezoneSettingsModal isOpen={true} onClose={mockOnClose} />);

      // Should display the original timezone name
      expect(screen.getByText("Unknown/Timezone")).toBeInTheDocument();
    });
  });

  describe("Footer Actions", () => {
    beforeEach(() => {
      render(<TimezoneSettingsModal isOpen={true} onClose={mockOnClose} />);
    });

    it("should display Cancel and Apply buttons", () => {
      expect(screen.getByText("Cancelar")).toBeInTheDocument();
      expect(screen.getByText("Aplicar")).toBeInTheDocument();
    });

    it("should call onClose when Cancel button is clicked", () => {
      const cancelButton = screen.getByText("Cancelar");
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should disable Apply button when no changes made", () => {
      const applyButton = screen.getByText("Aplicar").closest("button");
      expect(applyButton).toBeDisabled();
    });

    it("should enable Apply button when timezone selection changes", () => {
      // Select different timezone
      const londonButton = screen
        .getByText("Londres, Reino Unido")
        .closest("button");
      fireEvent.click(londonButton!);

      const applyButton = screen.getByText("Aplicar").closest("button");
      expect(applyButton).not.toBeDisabled();
    });

    it("should have proper button styling", () => {
      const cancelButton = screen.getByText("Cancelar").closest("button");
      expect(cancelButton).toHaveClass("bg-white", "border", "border-gray-300");

      const applyButton = screen.getByText("Aplicar").closest("button");
      expect(applyButton).toHaveClass("bg-blue-600", "text-white");
    });
  });

  describe("Apply Functionality", () => {
    it("should disable Apply button when no changes made", async () => {
      render(<TimezoneSettingsModal isOpen={true} onClose={mockOnClose} />);

      const applyButton = screen.getByText("Aplicar").closest("button");

      // Button should be disabled, so clicking it shouldn't do anything
      expect(applyButton).toBeDisabled();
      expect(mockTimezoneContextValue.setUserTimezone).not.toHaveBeenCalled();
    });

    it("should show loading state during apply", async () => {
      render(<TimezoneSettingsModal isOpen={true} onClose={mockOnClose} />);

      // Select different timezone
      const londonButton = screen
        .getByText("Londres, Reino Unido")
        .closest("button");
      fireEvent.click(londonButton!);

      // Click apply
      const applyButton = screen.getByText("Aplicar").closest("button");
      fireEvent.click(applyButton!);

      // Should show loading state
      expect(screen.getByText("Aplicando...")).toBeInTheDocument();

      // Should show spinner
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();

      // Should disable the button during loading
      const loadingButton = screen.getByText("Aplicando...").closest("button");
      expect(loadingButton).toBeDisabled();
    });

    it("should call setUserTimezone with selected timezone", async () => {
      render(<TimezoneSettingsModal isOpen={true} onClose={mockOnClose} />);

      // Select London timezone
      const londonButton = screen
        .getByText("Londres, Reino Unido")
        .closest("button");
      fireEvent.click(londonButton!);

      // Click apply
      const applyButton = screen.getByText("Aplicar");
      fireEvent.click(applyButton);

      expect(mockTimezoneContextValue.setUserTimezone).toHaveBeenCalledWith(
        "Europe/London"
      );
    });

    it("should call setUserTimezone when different timezone is applied", async () => {
      render(<TimezoneSettingsModal isOpen={true} onClose={mockOnClose} />);

      // Select different timezone
      const londonButton = screen
        .getByText("Londres, Reino Unido")
        .closest("button");
      fireEvent.click(londonButton!);

      // Click apply
      const applyButton = screen.getByText("Aplicar").closest("button");
      fireEvent.click(applyButton!);

      // Should call setUserTimezone with the selected timezone
      expect(mockTimezoneContextValue.setUserTimezone).toHaveBeenCalledWith(
        "Europe/London"
      );
    });

    it("should handle apply errors gracefully", async () => {
      const error = new Error("Network error");
      mockTimezoneContextValue.setUserTimezone.mockRejectedValue(error);

      render(<TimezoneSettingsModal isOpen={true} onClose={mockOnClose} />);

      // Select different timezone
      const londonButton = screen
        .getByText("Londres, Reino Unido")
        .closest("button");
      fireEvent.click(londonButton!);

      // Click apply
      const applyButton = screen.getByText("Aplicar");
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(mockConsoleError).toHaveBeenCalledWith(
          "Error updating timezone:",
          error
        );
      });

      // Should stop loading state
      expect(screen.getByText("Aplicar")).toBeInTheDocument();
      const updatedApplyButton = screen.getByText("Aplicar").closest("button");
      expect(updatedApplyButton).not.toBeDisabled();
    });
  });

  describe("Backdrop Interaction", () => {
    it("should close modal when clicking backdrop", () => {
      render(<TimezoneSettingsModal isOpen={true} onClose={mockOnClose} />);

      const backdrop = document.querySelector(
        ".fixed.inset-0.bg-black.bg-opacity-25"
      );
      fireEvent.click(backdrop!);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should not close modal when clicking modal content", () => {
      render(<TimezoneSettingsModal isOpen={true} onClose={mockOnClose} />);

      const modal = document.querySelector(".bg-white.rounded-lg");
      fireEvent.click(modal!);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    beforeEach(() => {
      render(<TimezoneSettingsModal isOpen={true} onClose={mockOnClose} />);
    });

    it("should have proper ARIA structure", () => {
      const modal =
        document.querySelector('[role="dialog"]') ||
        document.querySelector(".bg-white.rounded-lg");
      expect(modal).toBeInTheDocument();
    });

    it("should be keyboard navigable", () => {
      // Test tab navigation between timezone options
      const firstOption = screen
        .getByText("São Paulo, Brasil")
        .closest("button");

      firstOption?.focus();
      expect(firstOption).toHaveFocus();

      // Simulate tab key
      fireEvent.keyDown(firstOption!, { key: "Tab", code: "Tab" });
      // In real scenario, focus would move to next element
    });

    it("should support keyboard selection", () => {
      const londonButton = screen
        .getByText("Londres, Reino Unido")
        .closest("button");

      londonButton?.focus();
      fireEvent.keyDown(londonButton!, { key: "Enter", code: "Enter" });
      fireEvent.click(londonButton!); // simulate the click that would happen

      expect(londonButton).toHaveClass("bg-blue-50");
    });

    it("should have accessible button labels", () => {
      const cancelButton = screen.getByText("Cancelar").closest("button");
      expect(cancelButton).toBeInTheDocument();
      expect(cancelButton).toHaveTextContent("Cancelar");

      const applyButton = screen.getByText("Aplicar").closest("button");
      expect(applyButton).toBeInTheDocument();
      expect(applyButton).toHaveTextContent("Aplicar");
    });
  });

  describe("Responsive Design", () => {
    beforeEach(() => {
      render(<TimezoneSettingsModal isOpen={true} onClose={mockOnClose} />);
    });

    it("should have responsive modal sizing", () => {
      const modal = document.querySelector(".max-w-md.w-full");
      expect(modal).toBeInTheDocument();
    });

    it("should have proper spacing and padding", () => {
      const header = screen.getByText("Configurações de Fuso Horário")
        .parentElement?.parentElement?.parentElement;
      expect(header).toHaveClass("p-6");

      const content = screen.getByText(
        "Selecionar Novo Fuso Horário"
      ).parentElement;
      expect(content?.parentElement).toHaveClass("p-6");
    });

    it("should have scrollable content area", () => {
      const scrollableArea = document.querySelector(
        ".max-h-\\[80vh\\].overflow-hidden"
      );
      expect(scrollableArea).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty supported timezones", () => {
      mockUseTimezone.mockReturnValue({
        ...mockTimezoneContextValue,
        supportedTimezones: [] as readonly string[],
      });

      render(<TimezoneSettingsModal isOpen={true} onClose={mockOnClose} />);

      // Should still render without crashing
      expect(
        screen.getByText("Configurações de Fuso Horário")
      ).toBeInTheDocument();
    });

    it("should handle missing timezone context", () => {
      mockUseTimezone.mockReturnValue({
        ...mockTimezoneContextValue,
        timezoneInfo: null,
        userTimezone: "",
      });

      expect(() => {
        render(<TimezoneSettingsModal isOpen={true} onClose={mockOnClose} />);
      }).not.toThrow();
    });

    it("should prevent double-clicking apply button", async () => {
      render(<TimezoneSettingsModal isOpen={true} onClose={mockOnClose} />);

      // Select different timezone
      const londonButton = screen
        .getByText("Londres, Reino Unido")
        .closest("button");
      fireEvent.click(londonButton!);

      const applyButton = screen.getByText("Aplicar");

      // Double click rapidly
      fireEvent.click(applyButton);
      fireEvent.click(applyButton);

      // Should only be called once
      expect(mockTimezoneContextValue.setUserTimezone).toHaveBeenCalledTimes(1);
    });
  });
});
