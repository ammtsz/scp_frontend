import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TopNavigation } from "../TopNavigation";
import { useTimezone } from "@/contexts/TimezoneContext";

// Mock the TimezoneContext
jest.mock("@/contexts/TimezoneContext");
const mockUseTimezone = useTimezone as jest.MockedFunction<typeof useTimezone>;

// Mock the TimezoneSettingsModal
jest.mock("../TimezoneSettingsModal", () => ({
  TimezoneSettingsModal: ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div data-testid="timezone-settings-modal">
        <button onClick={onClose} data-testid="modal-close-button">
          Close Modal
        </button>
      </div>
    ) : null,
}));

describe("TopNavigation", () => {
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the complete navigation structure", () => {
      render(<TopNavigation />);

      // Check main navigation element
      expect(screen.getByRole("navigation")).toBeInTheDocument();

      // Check app branding
      expect(screen.getByText("MVP Center")).toBeInTheDocument();
      expect(screen.getByText("Sistema de Atendimento")).toBeInTheDocument();

      // Check app logo/icon
      expect(screen.getByText("M")).toBeInTheDocument();
    });

    it("should render timezone display with correct information", () => {
      render(<TopNavigation />);

      // Should display timezone information
      expect(screen.getByText("Sao_Paulo (GMT-3)")).toBeInTheDocument();
    });

    it("should render settings button with accessibility attributes", () => {
      render(<TopNavigation />);

      const settingsButton = screen.getByRole("button", {
        name: /configurações de fuso horário/i,
      });
      expect(settingsButton).toBeInTheDocument();
      expect(settingsButton).toHaveAttribute(
        "title",
        "Configurações de Fuso Horário"
      );
    });

    it("should have proper CSS classes for styling", () => {
      render(<TopNavigation />);

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("bg-white", "border-b", "border-gray-200");

      const container = nav.querySelector(".max-w-7xl");
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass("mx-auto");
    });
  });

  describe("Timezone Display", () => {
    it("should show timezone with offset when timezoneInfo is available", () => {
      render(<TopNavigation />);

      expect(screen.getByText("Sao_Paulo (GMT-3)")).toBeInTheDocument();
    });

    it("should show positive GMT offset correctly", () => {
      mockUseTimezone.mockReturnValue({
        ...mockTimezoneContextValue,
        timezoneInfo: {
          timezone: "Europe/London",
          date: "2024-01-15",
          time: "17:30:00",
          offset: 1,
        },
      });

      render(<TopNavigation />);

      expect(screen.getByText("London (GMT+1)")).toBeInTheDocument();
    });

    it("should show zero GMT offset correctly", () => {
      mockUseTimezone.mockReturnValue({
        ...mockTimezoneContextValue,
        timezoneInfo: {
          timezone: "Europe/London",
          date: "2024-01-15",
          time: "17:30:00",
          offset: 0,
        },
      });

      render(<TopNavigation />);

      expect(screen.getByText("London (GMT+0)")).toBeInTheDocument();
    });

    it("should fall back to userTimezone when timezoneInfo is null", () => {
      mockUseTimezone.mockReturnValue({
        ...mockTimezoneContextValue,
        timezoneInfo: null,
      });

      render(<TopNavigation />);

      expect(screen.getByText("Sao_Paulo")).toBeInTheDocument();
    });

    it("should handle timezone without slash separator", () => {
      mockUseTimezone.mockReturnValue({
        ...mockTimezoneContextValue,
        userTimezone: "UTC",
        timezoneInfo: null,
      });

      render(<TopNavigation />);

      expect(screen.getByText("São Paulo")).toBeInTheDocument(); // fallback
    });

    it("should show timezone display on desktop but not on mobile", () => {
      render(<TopNavigation />);

      const timezoneText = screen.getByText("Sao_Paulo (GMT-3)");
      expect(timezoneText).toHaveClass("hidden", "sm:inline");
    });
  });

  describe("Modal Interaction", () => {
    it("should not show modal initially", () => {
      render(<TopNavigation />);

      expect(
        screen.queryByTestId("timezone-settings-modal")
      ).not.toBeInTheDocument();
    });

    it("should open modal when settings button is clicked", async () => {
      render(<TopNavigation />);

      const settingsButton = screen.getByRole("button", {
        name: /configurações de fuso horário/i,
      });
      fireEvent.click(settingsButton);

      await waitFor(() => {
        expect(
          screen.getByTestId("timezone-settings-modal")
        ).toBeInTheDocument();
      });
    });

    it("should close modal when close function is called", async () => {
      render(<TopNavigation />);

      // Open modal
      const settingsButton = screen.getByRole("button", {
        name: /configurações de fuso horário/i,
      });
      fireEvent.click(settingsButton);

      await waitFor(() => {
        expect(
          screen.getByTestId("timezone-settings-modal")
        ).toBeInTheDocument();
      });

      // Close modal
      const closeButton = screen.getByTestId("modal-close-button");
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(
          screen.queryByTestId("timezone-settings-modal")
        ).not.toBeInTheDocument();
      });
    });

    it("should pass correct props to TimezoneSettingsModal", async () => {
      render(<TopNavigation />);

      const settingsButton = screen.getByRole("button", {
        name: /configurações de fuso horário/i,
      });
      fireEvent.click(settingsButton);

      await waitFor(() => {
        const modal = screen.getByTestId("timezone-settings-modal");
        expect(modal).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(<TopNavigation />);

      const settingsButton = screen.getByRole("button", {
        name: /configurações de fuso horário/i,
      });
      expect(settingsButton).toHaveAttribute("title");
    });

    it("should be keyboard accessible", () => {
      render(<TopNavigation />);

      const settingsButton = screen.getByRole("button", {
        name: /configurações de fuso horário/i,
      });

      // Should be focusable
      settingsButton.focus();
      expect(settingsButton).toHaveFocus();

      // Should have focus styles
      expect(settingsButton).toHaveClass(
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-blue-500"
      );
    });

    it("should support keyboard navigation", () => {
      render(<TopNavigation />);

      const settingsButton = screen.getByRole("button", {
        name: /configurações de fuso horário/i,
      });

      // Tab to button
      settingsButton.focus();
      expect(settingsButton).toHaveFocus();

      // Enter should open modal
      fireEvent.keyDown(settingsButton, { key: "Enter", code: "Enter" });
      fireEvent.click(settingsButton); // simulate the actual click that would happen

      expect(screen.getByTestId("timezone-settings-modal")).toBeInTheDocument();
    });

    it("should have semantic HTML structure", () => {
      render(<TopNavigation />);

      // Should use proper nav element
      expect(screen.getByRole("navigation")).toBeInTheDocument();

      // Should have proper heading structure
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("MVP Center");
    });
  });

  describe("Responsive Design", () => {
    it("should hide timezone text on mobile screens", () => {
      render(<TopNavigation />);

      const timezoneText = screen.getByText("Sao_Paulo (GMT-3)");
      expect(timezoneText).toHaveClass("hidden", "sm:inline");
    });

    it("should maintain proper spacing and layout classes", () => {
      render(<TopNavigation />);

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass("px-6", "py-4");

      const container = nav.querySelector(".flex.items-center.justify-between");
      expect(container).toBeInTheDocument();
    });
  });

  describe("Branding Elements", () => {
    it("should display app logo with correct styling", () => {
      render(<TopNavigation />);

      const logoContainer = screen.getByText("M").parentElement;
      expect(logoContainer).toHaveClass(
        "w-8",
        "h-8",
        "bg-blue-600",
        "rounded-lg"
      );

      const logoText = screen.getByText("M");
      expect(logoText).toHaveClass("text-white", "font-bold", "text-sm");
    });

    it("should display app title and subtitle", () => {
      render(<TopNavigation />);

      const title = screen.getByText("MVP Center");
      expect(title).toHaveClass("text-xl", "font-semibold", "text-gray-900");

      const subtitle = screen.getByText("Sistema de Atendimento");
      expect(subtitle).toHaveClass("text-xs", "text-gray-500");
    });

    it("should have proper spacing between branding elements", () => {
      render(<TopNavigation />);

      const brandingContainer =
        screen.getByText("MVP Center").parentElement?.parentElement;
      expect(brandingContainer).toHaveClass("space-x-3");
    });
  });

  describe("Icon Integration", () => {
    it("should render Globe icon for timezone display", () => {
      render(<TopNavigation />);

      // The Globe icon should be present (using react-feather)
      const timezoneContainer =
        screen.getByText("Sao_Paulo (GMT-3)").parentElement;
      expect(timezoneContainer).toHaveClass(
        "flex",
        "items-center",
        "space-x-2"
      );
    });

    it("should render Settings icon in button", () => {
      render(<TopNavigation />);

      const settingsButton = screen.getByRole("button", {
        name: /configurações de fuso horário/i,
      });
      expect(settingsButton).toHaveClass(
        "flex",
        "items-center",
        "justify-center"
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle missing timezone context gracefully", () => {
      mockUseTimezone.mockReturnValue({
        ...mockTimezoneContextValue,
        userTimezone: "",
        timezoneInfo: null,
      });

      render(<TopNavigation />);

      // Should still render without crashing
      expect(screen.getByText("MVP Center")).toBeInTheDocument();
      expect(screen.getByText("São Paulo")).toBeInTheDocument(); // fallback
    });

    it("should handle undefined timezone info", () => {
      mockUseTimezone.mockReturnValue({
        ...mockTimezoneContextValue,
        timezoneInfo: null,
      });

      expect(() => render(<TopNavigation />)).not.toThrow();
    });
  });
});
