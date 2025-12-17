import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimezoneSelect, CompactTimezoneSelect } from "../TimezoneSelect";

// Mock the TimezoneContext
const mockTimezoneContext = {
  userTimezone: "America/Sao_Paulo",
  detectedTimezone: {
    timezone: "America/New_York",
    date: "2024-01-15",
    time: "14:30:00",
  },
  isValidBrowserTimezone: true,
  isLoading: false,
  validateTimezone: jest.fn(),
};

jest.mock("@/contexts/TimezoneContext", () => ({
  useTimezone: () => mockTimezoneContext,
}));

describe("TimezoneSelect", () => {
  const mockOnChange = jest.fn();

  const defaultProps = {
    value: "America/Sao_Paulo",
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockTimezoneContext.validateTimezone.mockResolvedValue(true);
    // Reset context to default values
    Object.assign(mockTimezoneContext, {
      userTimezone: "America/Sao_Paulo",
      detectedTimezone: {
        timezone: "America/New_York",
        date: "2024-01-15",
        time: "14:30:00",
      },
      isValidBrowserTimezone: true,
      isLoading: false,
    });
  });

  describe("Basic Rendering", () => {
    it("should render with default label", () => {
      render(<TimezoneSelect {...defaultProps} />);

      expect(screen.getByText("Fuso Horário")).toBeInTheDocument();
    });

    it("should render with custom label", () => {
      render(<TimezoneSelect {...defaultProps} label="Custom Timezone" />);

      expect(screen.getByText("Custom Timezone")).toBeInTheDocument();
    });

    it("should render select element", () => {
      render(<TimezoneSelect {...defaultProps} />);

      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });

    it("should have placeholder option", () => {
      render(<TimezoneSelect {...defaultProps} value="" />);

      expect(screen.getByText("Selecione um fuso horário")).toBeInTheDocument();
    });

    it("should render all timezone options", () => {
      render(<TimezoneSelect {...defaultProps} />);

      const expectedTimezones = [
        "Brasil (São Paulo)",
        "Estados Unidos (Nova York)",
        "Estados Unidos (Chicago)",
        "Estados Unidos (Denver)",
        "Estados Unidos (Los Angeles)",
        "Estados Unidos (Seattle)",
        "Reino Unido (Londres)",
        "França (Paris)",
        "Alemanha (Berlim)",
        "Japão (Tóquio)",
        "China (Xangai)",
        "Austrália (Sydney)",
      ];

      expectedTimezones.forEach((timezone) => {
        expect(screen.getByText(timezone)).toBeInTheDocument();
      });
    });
  });

  describe("Value and Selection", () => {
    it("should display selected value", () => {
      render(<TimezoneSelect {...defaultProps} value="America/New_York" />);

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("America/New_York");
    });

    it("should call onChange when selection changes", async () => {
      const user = userEvent.setup();
      render(<TimezoneSelect {...defaultProps} />);

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "America/New_York");

      expect(mockOnChange).toHaveBeenCalledWith("America/New_York");
    });

    it("should handle empty value", () => {
      render(<TimezoneSelect {...defaultProps} value="" />);

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("");
    });
  });

  describe("Disabled State", () => {
    it("should be disabled when disabled prop is true", () => {
      render(<TimezoneSelect {...defaultProps} disabled={true} />);

      const select = screen.getByRole("combobox");
      expect(select).toBeDisabled();
    });

    it("should be disabled when loading", () => {
      mockTimezoneContext.isLoading = true;

      render(<TimezoneSelect {...defaultProps} />);

      const select = screen.getByRole("combobox");
      expect(select).toBeDisabled();
    });

    it("should have disabled styling", () => {
      render(<TimezoneSelect {...defaultProps} disabled={true} />);

      const select = screen.getByRole("combobox");
      expect(select).toHaveClass(
        "disabled:bg-gray-100",
        "disabled:cursor-not-allowed"
      );
    });
  });

  describe("Loading State", () => {
    it("should display loading message when isLoading is true", () => {
      mockTimezoneContext.isLoading = true;

      render(<TimezoneSelect {...defaultProps} />);

      expect(
        screen.getByText("Carregando fusos horários...")
      ).toBeInTheDocument();
    });

    it("should not display loading message when not loading", () => {
      mockTimezoneContext.isLoading = false;

      render(<TimezoneSelect {...defaultProps} />);

      expect(
        screen.queryByText("Carregando fusos horários...")
      ).not.toBeInTheDocument();
    });
  });

  describe("Validation", () => {
    it("should validate timezone when value changes", async () => {
      render(<TimezoneSelect {...defaultProps} value="America/New_York" />);

      await waitFor(() => {
        expect(mockTimezoneContext.validateTimezone).toHaveBeenCalledWith(
          "America/New_York"
        );
      });
    });

    it("should not validate when value matches userTimezone", () => {
      render(<TimezoneSelect {...defaultProps} value="America/Sao_Paulo" />);

      expect(mockTimezoneContext.validateTimezone).not.toHaveBeenCalled();
    });

    it("should display validation error for invalid timezone", async () => {
      mockTimezoneContext.validateTimezone.mockResolvedValue(false);

      render(<TimezoneSelect {...defaultProps} value="Invalid/Timezone" />);

      await waitFor(() => {
        expect(
          screen.getByText("⚠️ Fuso horário inválido")
        ).toBeInTheDocument();
      });
    });

    it("should display validation error when validation fails", async () => {
      mockTimezoneContext.validateTimezone.mockRejectedValue(
        new Error("Validation failed")
      );

      render(<TimezoneSelect {...defaultProps} value="America/New_York" />);

      await waitFor(() => {
        expect(
          screen.getByText("⚠️ Erro ao validar fuso horário")
        ).toBeInTheDocument();
      });
    });

    it("should display validating indicator during validation", () => {
      mockTimezoneContext.validateTimezone.mockImplementation(
        () => new Promise(() => {})
      ); // Never resolves

      render(<TimezoneSelect {...defaultProps} value="America/New_York" />);

      expect(screen.getByText("Validando...")).toBeInTheDocument();
    });

    it("should show validation spinner during validation", () => {
      mockTimezoneContext.validateTimezone.mockImplementation(
        () => new Promise(() => {})
      );

      const { container } = render(
        <TimezoneSelect {...defaultProps} value="America/New_York" />
      );

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass(
        "rounded-full",
        "h-3",
        "w-3",
        "border-b",
        "border-gray-400"
      );
    });

    it("should apply error styling when validation fails", async () => {
      mockTimezoneContext.validateTimezone.mockResolvedValue(false);

      render(<TimezoneSelect {...defaultProps} value="Invalid/Timezone" />);

      const select = screen.getByRole("combobox");

      await waitFor(() => {
        expect(select).toHaveClass(
          "border-red-300",
          "focus:ring-red-500",
          "focus:border-red-500"
        );
      });
    });
  });

  describe("Detected Timezone Hint", () => {
    it("should display detected timezone hint when different from current value", () => {
      mockTimezoneContext.detectedTimezone.timezone = "America/New_York";

      render(<TimezoneSelect {...defaultProps} value="America/Sao_Paulo" />);

      expect(
        screen.getByText(/Detectamos seu fuso: Estados Unidos \(Nova York\)/)
      ).toBeInTheDocument();
    });

    it("should not display hint when detected timezone matches current value", () => {
      mockTimezoneContext.detectedTimezone.timezone = "America/Sao_Paulo";

      render(<TimezoneSelect {...defaultProps} value="America/Sao_Paulo" />);

      expect(screen.queryByText(/Detectamos seu fuso/)).not.toBeInTheDocument();
    });

    it("should not display hint when browser timezone is invalid", () => {
      mockTimezoneContext.isValidBrowserTimezone = false;

      render(<TimezoneSelect {...defaultProps} value="America/Sao_Paulo" />);

      expect(screen.queryByText(/Detectamos seu fuso/)).not.toBeInTheDocument();
    });

    it("should not display hint when showDetectedHint is false", () => {
      mockTimezoneContext.detectedTimezone.timezone = "America/New_York";

      render(
        <TimezoneSelect
          {...defaultProps}
          value="America/Sao_Paulo"
          showDetectedHint={false}
        />
      );

      expect(screen.queryByText(/Detectamos seu fuso/)).not.toBeInTheDocument();
    });

    it("should not display hint when loading", () => {
      mockTimezoneContext.isLoading = true;
      mockTimezoneContext.detectedTimezone.timezone = "America/New_York";

      render(<TimezoneSelect {...defaultProps} value="America/Sao_Paulo" />);

      expect(screen.queryByText(/Detectamos seu fuso/)).not.toBeInTheDocument();
    });

    it('should call onChange when "Usar detectado" button is clicked', async () => {
      const user = userEvent.setup();
      mockTimezoneContext.detectedTimezone.timezone = "America/New_York";

      render(<TimezoneSelect {...defaultProps} value="America/Sao_Paulo" />);

      const useDetectedButton = screen.getByText("Usar detectado");
      await user.click(useDetectedButton);

      expect(mockOnChange).toHaveBeenCalledWith("America/New_York");
    });

    it('should disable "Usar detectado" button when component is disabled', () => {
      mockTimezoneContext.detectedTimezone.timezone = "America/New_York";

      render(
        <TimezoneSelect
          {...defaultProps}
          value="America/Sao_Paulo"
          disabled={true}
        />
      );

      const useDetectedButton = screen.getByText("Usar detectado");
      expect(useDetectedButton).toBeDisabled();
    });
  });

  describe("Current Selection Info", () => {
    it("should display current selection info when value is set and valid", async () => {
      mockTimezoneContext.validateTimezone.mockResolvedValue(true);

      render(<TimezoneSelect {...defaultProps} value="America/New_York" />);

      await waitFor(() => {
        expect(
          screen.getByText("✓ Selecionado: Estados Unidos (Nova York)")
        ).toBeInTheDocument();
      });
    });

    it("should not display selection info when validating", () => {
      mockTimezoneContext.validateTimezone.mockImplementation(
        () => new Promise(() => {})
      );

      render(<TimezoneSelect {...defaultProps} value="America/New_York" />);

      expect(screen.queryByText(/✓ Selecionado:/)).not.toBeInTheDocument();
    });

    it("should not display selection info when validation error exists", async () => {
      mockTimezoneContext.validateTimezone.mockResolvedValue(false);

      render(<TimezoneSelect {...defaultProps} value="Invalid/Timezone" />);

      await waitFor(() => {
        expect(screen.queryByText(/✓ Selecionado:/)).not.toBeInTheDocument();
      });
    });

    it("should not display selection info when no value is set", () => {
      render(<TimezoneSelect {...defaultProps} value="" />);

      expect(screen.queryByText(/✓ Selecionado:/)).not.toBeInTheDocument();
    });
  });

  describe("Styling and Layout", () => {
    it("should apply custom className to container", () => {
      const { container } = render(
        <TimezoneSelect {...defaultProps} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("should have proper label styling", () => {
      render(<TimezoneSelect {...defaultProps} />);

      const label = screen.getByText("Fuso Horário");
      expect(label).toHaveClass(
        "block",
        "text-sm",
        "font-medium",
        "text-gray-700",
        "mb-1"
      );
    });

    it("should have proper select styling", () => {
      render(<TimezoneSelect {...defaultProps} />);

      const select = screen.getByRole("combobox");
      expect(select).toHaveClass(
        "w-full",
        "px-3",
        "py-2",
        "border",
        "border-gray-300",
        "rounded-md",
        "shadow-sm",
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-blue-500",
        "focus:border-blue-500"
      );
    });
  });

  describe("Timezone Label Mapping", () => {
    it("should handle unknown timezone in value prop", () => {
      // Unknown timezones are not in the options list so select will be empty
      render(<TimezoneSelect {...defaultProps} value="America/Tokyo" />);

      const select = screen.getByRole("combobox") as HTMLSelectElement;
      // Since America/Tokyo is not in the list of options, select will default to empty
      expect(select.value).toBe("");
    });

    it("should handle unknown timezone values gracefully", async () => {
      mockTimezoneContext.validateTimezone.mockResolvedValue(true);

      render(<TimezoneSelect {...defaultProps} value="Unknown/Timezone" />);

      await waitFor(() => {
        expect(
          screen.getByText("✓ Selecionado: Unknown/Timezone")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle multiple rapid value changes", async () => {
      const { rerender } = render(
        <TimezoneSelect {...defaultProps} value="America/New_York" />
      );

      rerender(<TimezoneSelect {...defaultProps} value="Europe/London" />);
      rerender(<TimezoneSelect {...defaultProps} value="Asia/Tokyo" />);

      await waitFor(() => {
        expect(mockTimezoneContext.validateTimezone).toHaveBeenCalledWith(
          "Asia/Tokyo"
        );
      });
    });

    it("should clear validation error when switching to userTimezone", () => {
      mockTimezoneContext.validateTimezone.mockResolvedValue(false);

      const { rerender } = render(
        <TimezoneSelect {...defaultProps} value="Invalid/Timezone" />
      );

      rerender(<TimezoneSelect {...defaultProps} value="America/Sao_Paulo" />);

      expect(screen.queryByText(/⚠️/)).not.toBeInTheDocument();
    });

    it("should handle validation promise rejection gracefully", async () => {
      mockTimezoneContext.validateTimezone.mockRejectedValue(
        new Error("Network error")
      );

      render(<TimezoneSelect {...defaultProps} value="America/New_York" />);

      await waitFor(() => {
        expect(
          screen.getByText("⚠️ Erro ao validar fuso horário")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper accessibility structure", () => {
      render(<TimezoneSelect {...defaultProps} />);

      const label = screen.getByText("Fuso Horário");
      const select = screen.getByRole("combobox");

      // Check that label and select exist and are properly structured
      expect(label).toBeInTheDocument();
      expect(select).toBeInTheDocument();
      expect(label.tagName).toBe("LABEL");
    });

    it("should be keyboard navigable", async () => {
      const user = userEvent.setup();
      render(<TimezoneSelect {...defaultProps} />);

      const select = screen.getByRole("combobox");

      await user.tab();
      expect(select).toHaveFocus();

      await user.keyboard("{ArrowDown}");
      // Should still be focused and functional
      expect(select).toHaveFocus();
    });
  });
});

describe("CompactTimezoneSelect", () => {
  const mockOnChange = jest.fn();

  const defaultProps = {
    value: "America/Sao_Paulo",
    onChange: mockOnChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockTimezoneContext.validateTimezone.mockResolvedValue(true);
  });

  describe("Basic Rendering", () => {
    it("should render without label", () => {
      render(<CompactTimezoneSelect {...defaultProps} />);

      expect(screen.queryByText("Fuso Horário")).not.toBeInTheDocument();
    });

    it("should render select element", () => {
      render(<CompactTimezoneSelect {...defaultProps} />);

      const select = screen.getByRole("combobox");
      expect(select).toBeInTheDocument();
    });

    it("should not show detected timezone hint", () => {
      mockTimezoneContext.detectedTimezone.timezone = "America/New_York";

      render(
        <CompactTimezoneSelect {...defaultProps} value="America/Sao_Paulo" />
      );

      expect(screen.queryByText(/Detectamos seu fuso/)).not.toBeInTheDocument();
    });

    it("should handle value changes", async () => {
      const user = userEvent.setup();
      render(<CompactTimezoneSelect {...defaultProps} />);

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "America/New_York");

      expect(mockOnChange).toHaveBeenCalledWith("America/New_York");
    });

    it("should apply custom className", () => {
      const { container } = render(
        <CompactTimezoneSelect {...defaultProps} className="compact-class" />
      );

      expect(container.firstChild).toHaveClass("compact-class");
    });

    it("should handle disabled state", () => {
      render(<CompactTimezoneSelect {...defaultProps} disabled={true} />);

      const select = screen.getByRole("combobox");
      expect(select).toBeDisabled();
    });
  });

  describe("Functionality Inheritance", () => {
    it("should still validate timezones", async () => {
      render(
        <CompactTimezoneSelect {...defaultProps} value="America/New_York" />
      );

      await waitFor(() => {
        expect(mockTimezoneContext.validateTimezone).toHaveBeenCalledWith(
          "America/New_York"
        );
      });
    });

    it("should display validation errors", async () => {
      mockTimezoneContext.validateTimezone.mockResolvedValue(false);

      render(
        <CompactTimezoneSelect {...defaultProps} value="Invalid/Timezone" />
      );

      await waitFor(() => {
        expect(
          screen.getByText("⚠️ Fuso horário inválido")
        ).toBeInTheDocument();
      });
    });

    it("should show current selection info", async () => {
      mockTimezoneContext.validateTimezone.mockResolvedValue(true);

      render(
        <CompactTimezoneSelect {...defaultProps} value="America/New_York" />
      );

      await waitFor(() => {
        expect(
          screen.getByText("✓ Selecionado: Estados Unidos (Nova York)")
        ).toBeInTheDocument();
      });
    });
  });
});
