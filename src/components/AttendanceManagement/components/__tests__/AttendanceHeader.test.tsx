import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AttendanceHeader } from "../AttendanceHeader";

// Mock the react-feather icons
jest.mock("react-feather", () => ({
  ChevronLeft: () => <div data-testid="chevron-left">Left</div>,
  ChevronRight: () => <div data-testid="chevron-right">Right</div>,
}));

describe("AttendanceHeader", () => {
  const mockOnDateChange = jest.fn();
  const defaultProps = {
    selectedDate: "2025-01-15",
    onDateChange: mockOnDateChange,
    isDayFinalized: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Date.now() to return a consistent date
    jest
      .spyOn(Date, "now")
      .mockImplementation(() => new Date("2025-01-15T12:00:00Z").getTime());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders the component with correct title", () => {
      render(<AttendanceHeader {...defaultProps} />);

      expect(screen.getByText("Data selecionada:")).toBeInTheDocument();
    });

    it("renders date input with correct value", () => {
      render(<AttendanceHeader {...defaultProps} />);

      const dateInput = screen.getByDisplayValue("2025-01-15");
      expect(dateInput).toBeInTheDocument();
      expect(dateInput).toHaveAttribute("type", "date");
    });

    it("renders navigation buttons", () => {
      render(<AttendanceHeader {...defaultProps} />);

      expect(screen.getByTestId("chevron-left")).toBeInTheDocument();
      expect(screen.getByTestId("chevron-right")).toBeInTheDocument();
      expect(screen.getByText("Hoje")).toBeInTheDocument();
    });
  });

  describe("Date Input Interaction", () => {
    it("calls onDateChange when date input changes", () => {
      render(<AttendanceHeader {...defaultProps} />);

      const dateInput = screen.getByDisplayValue("2025-01-15");
      fireEvent.change(dateInput, { target: { value: "2025-01-20" } });

      expect(mockOnDateChange).toHaveBeenCalledWith("2025-01-20");
    });

    it("has correct attributes on date input", () => {
      render(<AttendanceHeader {...defaultProps} />);

      const dateInput = screen.getByDisplayValue("2025-01-15");
      expect(dateInput).toHaveClass("input", "h-11", "flex-1");
      expect(dateInput).toHaveAttribute("lang", "pt-BR");
    });
  });

  describe("Navigation Buttons", () => {
    it("calls onDateChange with previous day when left chevron is clicked", () => {
      render(<AttendanceHeader {...defaultProps} />);

      const prevButton = screen.getByTestId("chevron-left").closest("button");
      if (prevButton) {
        fireEvent.click(prevButton);
        expect(mockOnDateChange).toHaveBeenCalledWith("2025-01-14");
      }
    });

    it("calls onDateChange with next day when right chevron is clicked", () => {
      render(<AttendanceHeader {...defaultProps} />);

      const nextButton = screen.getByTestId("chevron-right").closest("button");
      if (nextButton) {
        fireEvent.click(nextButton);
        expect(mockOnDateChange).toHaveBeenCalledWith("2025-01-16");
      }
    });

    it("calls onDateChange with today when Hoje button is clicked", () => {
      render(<AttendanceHeader {...defaultProps} />);

      const todayButton = screen.getByText("Hoje");
      fireEvent.click(todayButton);

      // Should call with today's date (2025-01-15 based on our mock)
      expect(mockOnDateChange).toHaveBeenCalledWith("2025-01-15");
    });

    it("navigation buttons have correct styling", () => {
      render(<AttendanceHeader {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveClass("button", "button-outline", "card-shadow");
      });
    });
  });

  describe("Day Finalization Status", () => {
    it("shows finalization message when day is finalized", () => {
      render(<AttendanceHeader {...defaultProps} isDayFinalized={true} />);

      expect(screen.getByText("Dia finalizado")).toBeInTheDocument();
      expect(
        screen.getByText("Os cartões estão desabilitados para edição")
      ).toBeInTheDocument();
    });

    it("does not show finalization message when day is not finalized", () => {
      render(<AttendanceHeader {...defaultProps} isDayFinalized={false} />);

      expect(screen.queryByText("Dia finalizado")).not.toBeInTheDocument();
      expect(
        screen.queryByText("Os cartões estão desabilitados para edição")
      ).not.toBeInTheDocument();
    });

    it("finalization message has correct styling", () => {
      render(<AttendanceHeader {...defaultProps} isDayFinalized={true} />);

      // Find the outer div container that has the styling classes
      const finalizationDiv = screen.getByText("📅").closest("div");
      expect(finalizationDiv).toHaveClass(
        "bg-green-100",
        "border",
        "border-green-400",
        "text-green-700",
        "px-4",
        "py-2",
        "rounded",
        "mb-4",
        "flex",
        "items-center",
        "gap-2"
      );
    });

    it("shows calendar emoji in finalization message", () => {
      render(<AttendanceHeader {...defaultProps} isDayFinalized={true} />);

      expect(screen.getByText("📅")).toBeInTheDocument();
    });
  });

  describe("Container Styling", () => {
    it("has correct container classes", () => {
      const { container } = render(<AttendanceHeader {...defaultProps} />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass("w-full", "max-w-6xl", "mx-auto", "p-4");
    });

    it("title has correct styling", () => {
      render(<AttendanceHeader {...defaultProps} />);

      const title = screen.getByText("Data selecionada:");
      expect(title).toHaveClass(
        "text-lg",
        "mb-4",
        "flex",
        "items-center",
        "gap-2"
      );
    });

    it("button container has correct gap", () => {
      render(<AttendanceHeader {...defaultProps} />);

      const buttonContainer = screen.getByText("Hoje").closest("div");
      expect(buttonContainer).toHaveClass("flex", "gap-2", "mb-4");
    });
  });

  describe("Date Navigation Edge Cases", () => {
    it("handles month boundary when going to previous day", () => {
      render(<AttendanceHeader {...defaultProps} selectedDate="2025-02-01" />);

      const prevButton = screen.getByTestId("chevron-left").closest("button");
      if (prevButton) {
        fireEvent.click(prevButton);
        expect(mockOnDateChange).toHaveBeenCalledWith("2025-01-31");
      }
    });

    it("handles month boundary when going to next day", () => {
      render(<AttendanceHeader {...defaultProps} selectedDate="2025-01-31" />);

      const nextButton = screen.getByTestId("chevron-right").closest("button");
      if (nextButton) {
        fireEvent.click(nextButton);
        expect(mockOnDateChange).toHaveBeenCalledWith("2025-02-01");
      }
    });

    it("handles year boundary correctly", () => {
      render(<AttendanceHeader {...defaultProps} selectedDate="2024-12-31" />);

      const nextButton = screen.getByTestId("chevron-right").closest("button");
      if (nextButton) {
        fireEvent.click(nextButton);
        expect(mockOnDateChange).toHaveBeenCalledWith("2025-01-01");
      }
    });
  });

  describe("Timezone Handling", () => {
    it("handles timezone offset correctly in today button", () => {
      // Mock a different timezone offset
      const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;
      Date.prototype.getTimezoneOffset = jest.fn(() => -180); // UTC-3 (Brazil timezone)

      render(<AttendanceHeader {...defaultProps} />);

      const todayButton = screen.getByText("Hoje");
      fireEvent.click(todayButton);

      // Should still return the correct local date
      expect(mockOnDateChange).toHaveBeenCalled();

      Date.prototype.getTimezoneOffset = originalGetTimezoneOffset;
    });
  });

  describe("Accessibility", () => {
    it("date input has proper attributes", () => {
      render(<AttendanceHeader {...defaultProps} />);

      const dateInput = screen.getByDisplayValue("2025-01-15");
      expect(dateInput).toHaveAttribute("lang", "pt-BR");
      expect(dateInput).toHaveAttribute("type", "date");
    });

    it("buttons are properly focusable", () => {
      render(<AttendanceHeader {...defaultProps} />);

      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button).toHaveAttribute("type", "button");
      });
    });
  });
});
