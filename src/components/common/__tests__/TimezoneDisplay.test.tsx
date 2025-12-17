import React from "react";
import { render, screen } from "@testing-library/react";
import { TimezoneDisplay, CompactTimezoneDisplay } from "../TimezoneDisplay";

// Mock the TimezoneContext
const mockTimezoneContext = {
  userTimezone: "America/Sao_Paulo",
  serverTimezone: {
    timezone: "America/Sao_Paulo",
    date: "2024-01-15",
    time: "14:30:00",
  },
  detectedTimezone: {
    timezone: "America/Sao_Paulo",
    date: "2024-01-15",
    time: "14:30:00",
  },
  isValidBrowserTimezone: true,
  isLoading: false,
  error: null as string | null,
  formatDateInTimezone: jest.fn(() => "15/01/2024 14:30:00"),
};

jest.mock("@/contexts/TimezoneContext", () => ({
  useTimezone: () => mockTimezoneContext,
}));

describe("TimezoneDisplay", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock context to default values
    Object.assign(mockTimezoneContext, {
      userTimezone: "America/Sao_Paulo",
      serverTimezone: {
        timezone: "America/Sao_Paulo",
        date: "2024-01-15",
        time: "14:30:00",
      },
      detectedTimezone: {
        timezone: "America/Sao_Paulo",
        date: "2024-01-15",
        time: "14:30:00",
      },
      isValidBrowserTimezone: true,
      isLoading: false,
      error: null as string | null,
      formatDateInTimezone: jest.fn(() => "15/01/2024 14:30:00"),
    });
  });

  describe("Loading State", () => {
    it("should display loading message when isLoading is true", () => {
      mockTimezoneContext.isLoading = true;

      render(<TimezoneDisplay />);

      expect(
        screen.getByText("Carregando informações de fuso horário...")
      ).toBeInTheDocument();
    });

    it("should display loading spinner when isLoading is true", () => {
      mockTimezoneContext.isLoading = true;

      const { container } = render(<TimezoneDisplay />);

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass(
        "rounded-full",
        "h-4",
        "w-4",
        "border-b-2",
        "border-blue-600"
      );
    });

    it("should have proper loading container styling", () => {
      mockTimezoneContext.isLoading = true;

      const { container } = render(<TimezoneDisplay />);

      const loadingContainer = container.firstChild;
      expect(loadingContainer).toHaveClass(
        "bg-blue-50",
        "border",
        "border-blue-200",
        "rounded-lg",
        "p-3",
        "text-sm"
      );
    });
  });

  describe("Error State", () => {
    it("should display error message when error exists", () => {
      const errorMessage = "Failed to load timezone information";
      mockTimezoneContext.error = errorMessage;

      render(<TimezoneDisplay />);

      expect(screen.getByText("Erro:")).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it("should have proper error container styling", () => {
      mockTimezoneContext.error = "Some error";

      const { container } = render(<TimezoneDisplay />);

      const errorContainer = container.firstChild;
      expect(errorContainer).toHaveClass(
        "bg-red-50",
        "border",
        "border-red-200",
        "rounded-lg",
        "p-3",
        "text-sm"
      );
    });

    it("should not display content when error exists", () => {
      mockTimezoneContext.error = "Some error";

      render(<TimezoneDisplay />);

      expect(
        screen.queryByText("Informações de Fuso Horário")
      ).not.toBeInTheDocument();
    });
  });

  describe("Normal Display", () => {
    it("should display timezone information header", () => {
      render(<TimezoneDisplay />);

      expect(
        screen.getByText("Informações de Fuso Horário")
      ).toBeInTheDocument();
    });

    it("should display user timezone", () => {
      render(<TimezoneDisplay />);

      expect(screen.getByText("Seu fuso:")).toBeInTheDocument();
      expect(screen.getByText("America/Sao_Paulo")).toBeInTheDocument();
    });

    it("should display current time", () => {
      render(<TimezoneDisplay />);

      expect(screen.getByText("Hora atual:")).toBeInTheDocument();
      expect(screen.getByText("15/01/2024 14:30:00")).toBeInTheDocument();
    });

    it("should call formatDateInTimezone with correct parameters", () => {
      render(<TimezoneDisplay />);

      expect(mockTimezoneContext.formatDateInTimezone).toHaveBeenCalledWith(
        expect.any(String), // date part
        expect.any(String), // time part
        "America/Sao_Paulo"
      );
    });

    it("should display server timezone information", () => {
      render(<TimezoneDisplay />);

      expect(screen.getByText("Servidor:")).toBeInTheDocument();
      expect(
        screen.getByText("America/Sao_Paulo (2024-01-15 14:30:00)")
      ).toBeInTheDocument();
    });

    it("should have proper container styling", () => {
      const { container } = render(<TimezoneDisplay />);

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass(
        "bg-gray-50",
        "border",
        "border-gray-200",
        "rounded-lg",
        "p-3",
        "text-xs",
        "space-y-2"
      );
    });
  });

  describe("Detected Timezone Display", () => {
    it("should not display detected timezone when it matches user timezone", () => {
      mockTimezoneContext.detectedTimezone.timezone = "America/Sao_Paulo";
      mockTimezoneContext.userTimezone = "America/Sao_Paulo";

      render(<TimezoneDisplay />);

      expect(screen.queryByText("Detectado:")).not.toBeInTheDocument();
    });

    it("should display detected timezone when different from user timezone", () => {
      mockTimezoneContext.detectedTimezone.timezone = "America/New_York";
      mockTimezoneContext.userTimezone = "America/Sao_Paulo";

      render(<TimezoneDisplay />);

      expect(screen.getByText("Detectado:")).toBeInTheDocument();
      expect(screen.getByText("America/New_York")).toBeInTheDocument();
    });

    it('should show "não suportado" warning when browser timezone is invalid', () => {
      mockTimezoneContext.detectedTimezone.timezone = "Invalid/Timezone";
      mockTimezoneContext.userTimezone = "America/Sao_Paulo";
      mockTimezoneContext.isValidBrowserTimezone = false;

      render(<TimezoneDisplay />);

      expect(screen.getByText("(não suportado)")).toBeInTheDocument();
    });

    it('should not show "não suportado" warning when browser timezone is valid', () => {
      mockTimezoneContext.detectedTimezone.timezone = "America/New_York";
      mockTimezoneContext.userTimezone = "America/Sao_Paulo";
      mockTimezoneContext.isValidBrowserTimezone = true;

      render(<TimezoneDisplay />);

      expect(screen.queryByText("(não suportado)")).not.toBeInTheDocument();
    });
  });

  describe("Invalid Browser Timezone Warning", () => {
    it("should display warning when browser timezone is invalid", () => {
      mockTimezoneContext.isValidBrowserTimezone = false;

      render(<TimezoneDisplay />);

      expect(
        screen.getByText(
          "⚠️ Fuso detectado automaticamente não é suportado. Usando padrão do Brasil."
        )
      ).toBeInTheDocument();
    });

    it("should not display warning when browser timezone is valid", () => {
      mockTimezoneContext.isValidBrowserTimezone = true;

      render(<TimezoneDisplay />);

      expect(
        screen.queryByText(
          "⚠️ Fuso detectado automaticamente não é suportado. Usando padrão do Brasil."
        )
      ).not.toBeInTheDocument();
    });

    it("should have proper warning styling", () => {
      mockTimezoneContext.isValidBrowserTimezone = false;

      render(<TimezoneDisplay />);

      const warningText = screen.getByText(
        "⚠️ Fuso detectado automaticamente não é suportado. Usando padrão do Brasil."
      );
      expect(warningText).toHaveClass("text-orange-600", "text-xs", "mt-2");
    });
  });

  describe("Text Styling", () => {
    it("should have proper label styling", () => {
      render(<TimezoneDisplay />);

      const labels = screen.getAllByText(/^(Seu fuso|Hora atual|Servidor):/);
      labels.forEach((label) => {
        expect(label).toHaveClass("font-medium", "text-gray-600");
      });
    });

    it("should have proper header styling", () => {
      render(<TimezoneDisplay />);

      const header = screen.getByText("Informações de Fuso Horário");
      expect(header).toHaveClass("font-semibold", "text-gray-700", "mb-2");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty server timezone gracefully", () => {
      mockTimezoneContext.serverTimezone = {
        timezone: "",
        date: "",
        time: "",
      };

      render(<TimezoneDisplay />);

      expect(screen.getByText("Servidor:")).toBeInTheDocument();
      // Check for the display pattern with parentheses
      expect(screen.getByText(/\(\s+\)/)).toBeInTheDocument();
    });

    it("should handle formatDateInTimezone returning empty string", () => {
      mockTimezoneContext.formatDateInTimezone = jest.fn(() => "");

      render(<TimezoneDisplay />);

      expect(screen.getByText("Hora atual:")).toBeInTheDocument();
    });

    it("should handle very long timezone names", () => {
      const longTimezone = "America/Argentina/ComodRivadavia";
      mockTimezoneContext.userTimezone = longTimezone;

      render(<TimezoneDisplay />);

      expect(screen.getByText(longTimezone)).toBeInTheDocument();
    });

    it("should handle special characters in timezone names", () => {
      const specialTimezone = "America/Sao_Paulo";
      mockTimezoneContext.userTimezone = specialTimezone;

      render(<TimezoneDisplay />);

      expect(screen.getByText(specialTimezone)).toBeInTheDocument();
    });
  });

  describe("Grid Layout", () => {
    it("should have proper grid container styling", () => {
      const { container } = render(<TimezoneDisplay />);

      const gridContainer = container.querySelector(".grid");
      expect(gridContainer).toHaveClass("grid-cols-1", "gap-2");
    });
  });
});

describe("CompactTimezoneDisplay", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(mockTimezoneContext, {
      userTimezone: "America/Sao_Paulo",
      isLoading: false,
      error: null as string | null,
    });
  });

  describe("Normal Display", () => {
    it("should display timezone with location icon", () => {
      render(<CompactTimezoneDisplay />);

      expect(screen.getByText("📍 America/Sao_Paulo")).toBeInTheDocument();
    });

    it("should have proper styling", () => {
      const { container } = render(<CompactTimezoneDisplay />);

      const displayElement = container.firstChild;
      expect(displayElement).toHaveClass("text-xs", "text-gray-500");
    });

    it("should display different timezones correctly", () => {
      mockTimezoneContext.userTimezone = "America/New_York";

      render(<CompactTimezoneDisplay />);

      expect(screen.getByText("📍 America/New_York")).toBeInTheDocument();
    });
  });

  describe("Hidden States", () => {
    it("should not render when loading", () => {
      mockTimezoneContext.isLoading = true;

      const { container } = render(<CompactTimezoneDisplay />);

      expect(container.firstChild).toBeNull();
    });

    it("should not render when error exists", () => {
      mockTimezoneContext.error = "Some error";

      const { container } = render(<CompactTimezoneDisplay />);

      expect(container.firstChild).toBeNull();
    });

    it("should not render when both loading and error exist", () => {
      mockTimezoneContext.isLoading = true;
      mockTimezoneContext.error = "Some error";

      const { container } = render(<CompactTimezoneDisplay />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty timezone string", () => {
      mockTimezoneContext.userTimezone = "";

      render(<CompactTimezoneDisplay />);

      expect(screen.getByText("📍")).toBeInTheDocument();
    });

    it("should handle very long timezone names", () => {
      const longTimezone = "America/Argentina/ComodRivadavia";
      mockTimezoneContext.userTimezone = longTimezone;

      render(<CompactTimezoneDisplay />);

      expect(screen.getByText(`📍 ${longTimezone}`)).toBeInTheDocument();
    });

    it("should handle special characters in timezone", () => {
      mockTimezoneContext.userTimezone = "Europe/Zürich";

      render(<CompactTimezoneDisplay />);

      expect(screen.getByText("📍 Europe/Zürich")).toBeInTheDocument();
    });
  });

  describe("State Transitions", () => {
    it("should transition from loading to normal display", () => {
      mockTimezoneContext.isLoading = true;

      const { container, rerender } = render(<CompactTimezoneDisplay />);

      expect(container.firstChild).toBeNull();

      mockTimezoneContext.isLoading = false;
      rerender(<CompactTimezoneDisplay />);

      expect(screen.getByText("📍 America/Sao_Paulo")).toBeInTheDocument();
    });

    it("should transition from error to normal display", () => {
      mockTimezoneContext.error = "Some error";

      const { container, rerender } = render(<CompactTimezoneDisplay />);

      expect(container.firstChild).toBeNull();

      mockTimezoneContext.error = null;
      rerender(<CompactTimezoneDisplay />);

      expect(screen.getByText("📍 America/Sao_Paulo")).toBeInTheDocument();
    });

    it("should hide when error occurs after normal display", () => {
      const { rerender } = render(<CompactTimezoneDisplay />);

      expect(screen.getByText("📍 America/Sao_Paulo")).toBeInTheDocument();

      mockTimezoneContext.error = "Some error";
      rerender(<CompactTimezoneDisplay />);

      expect(
        screen.queryByText("📍 America/Sao_Paulo")
      ).not.toBeInTheDocument();
    });
  });
});
