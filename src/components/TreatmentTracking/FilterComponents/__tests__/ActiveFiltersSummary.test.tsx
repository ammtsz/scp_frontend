import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ActiveFiltersSummary } from "../ActiveFiltersSummary";

describe("ActiveFiltersSummary", () => {
  const mockProps = {
    searchTerm: "",
    treatmentTypes: [],
    statuses: [],
    dateRange: { start: null, end: null },
    onSearchChange: jest.fn(),
    onTreatmentTypesChange: jest.fn(),
    onStatusesChange: jest.fn(),
    onDateRangeChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Search Term Filter", () => {
    it("should display search term when provided", () => {
      const { container } = render(
        <ActiveFiltersSummary {...mockProps} searchTerm="John Doe" />
      );

      expect(container.textContent).toContain("🔍");
      expect(container.textContent).toContain("John Doe");
      expect(container.querySelector(".bg-blue-100")).toBeInTheDocument();
    });

    it("should not display search term when empty", () => {
      const { container } = render(
        <ActiveFiltersSummary {...mockProps} searchTerm="" />
      );

      expect(container.textContent).not.toContain("🔍");
    });

    it("should call onSearchChange with empty string when search term remove button is clicked", () => {
      render(<ActiveFiltersSummary {...mockProps} searchTerm="test search" />);

      const removeButton = screen.getByRole("button", { name: "✕" });
      fireEvent.click(removeButton);

      expect(mockProps.onSearchChange).toHaveBeenCalledWith("");
    });

    it("should truncate long search terms with max-width classes", () => {
      const longSearchTerm =
        "This is a very long search term that should be truncated";
      const { container } = render(
        <ActiveFiltersSummary {...mockProps} searchTerm={longSearchTerm} />
      );

      const spanWithTruncate = container.querySelector(
        ".truncate.max-w-\\[100px\\]"
      );
      expect(spanWithTruncate).toBeInTheDocument();
      expect(spanWithTruncate).toHaveClass(
        "truncate",
        "max-w-[100px]",
        "sm:max-w-none"
      );
    });
  });

  describe("Treatment Type Filters", () => {
    it("should display treatment type chips when provided", () => {
      render(
        <ActiveFiltersSummary
          {...mockProps}
          treatmentTypes={["light_bath", "rod"]}
        />
      );

      expect(screen.getByText("💡 Banho de Luz")).toBeInTheDocument();
      expect(screen.getByText("🪄 Bastão")).toBeInTheDocument();
    });

    it("should not display treatment type chips when empty array", () => {
      render(<ActiveFiltersSummary {...mockProps} treatmentTypes={[]} />);

      expect(screen.queryByText("💡 Banho de Luz")).not.toBeInTheDocument();
      expect(screen.queryByText("🪄 Bastão")).not.toBeInTheDocument();
    });

    it("should call onTreatmentTypesChange with filtered array when remove button is clicked", () => {
      render(
        <ActiveFiltersSummary
          {...mockProps}
          treatmentTypes={["light_bath", "rod"]}
        />
      );

      // Click remove button for light_bath
      const removeButtons = screen.getAllByText("✕");
      const lightBathRemoveButton = removeButtons.find((button) =>
        button.closest(".bg-green-100")
      );

      if (lightBathRemoveButton) {
        fireEvent.click(lightBathRemoveButton);
      }

      expect(mockProps.onTreatmentTypesChange).toHaveBeenCalledWith(["rod"]);
    });

    it("should not render chips for invalid treatment type values", () => {
      render(
        <ActiveFiltersSummary
          {...mockProps}
          treatmentTypes={["light_bath", "invalid_type"]}
        />
      );

      expect(screen.getByText("💡 Banho de Luz")).toBeInTheDocument();
      expect(screen.queryByText("invalid_type")).not.toBeInTheDocument();
    });

    it("should apply correct styling for treatment type chips", () => {
      const { container } = render(
        <ActiveFiltersSummary {...mockProps} treatmentTypes={["light_bath"]} />
      );

      const chipSpan = container.querySelector(".bg-green-100.text-green-800");
      expect(chipSpan).toBeInTheDocument();
      expect(chipSpan).toHaveClass("bg-green-100", "text-green-800");
    });
  });

  describe("Status Filters", () => {
    it("should display status chips when provided", () => {
      render(
        <ActiveFiltersSummary
          {...mockProps}
          statuses={["scheduled", "completed"]}
        />
      );

      expect(screen.getByText("📅 Agendado")).toBeInTheDocument();
      expect(screen.getByText("✅ Concluído")).toBeInTheDocument();
    });

    it("should not display status chips when empty array", () => {
      render(<ActiveFiltersSummary {...mockProps} statuses={[]} />);

      expect(screen.queryByText("📅 Agendado")).not.toBeInTheDocument();
      expect(screen.queryByText("✅ Concluído")).not.toBeInTheDocument();
    });

    it("should call onStatusesChange with filtered array when remove button is clicked", () => {
      render(
        <ActiveFiltersSummary
          {...mockProps}
          statuses={["scheduled", "completed"]}
        />
      );

      // Click remove button for scheduled status
      const removeButtons = screen.getAllByText("✕");
      const scheduledRemoveButton = removeButtons.find((button) =>
        button.closest(".bg-purple-100")
      );

      if (scheduledRemoveButton) {
        fireEvent.click(scheduledRemoveButton);
      }

      expect(mockProps.onStatusesChange).toHaveBeenCalledWith(["completed"]);
    });

    it("should not render chips for invalid status values", () => {
      render(
        <ActiveFiltersSummary
          {...mockProps}
          statuses={["scheduled", "invalid_status"]}
        />
      );

      expect(screen.getByText("📅 Agendado")).toBeInTheDocument();
      expect(screen.queryByText("invalid_status")).not.toBeInTheDocument();
    });

    it("should apply correct styling for status chips", () => {
      const { container } = render(
        <ActiveFiltersSummary {...mockProps} statuses={["scheduled"]} />
      );

      const chipSpan = container.querySelector(
        ".bg-purple-100.text-purple-800"
      );
      expect(chipSpan).toBeInTheDocument();
      expect(chipSpan).toHaveClass("bg-purple-100", "text-purple-800");
    });
  });

  describe("Date Range Filter", () => {
    it("should display date range when both start and end dates are provided", () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");

      const { container } = render(
        <ActiveFiltersSummary
          {...mockProps}
          dateRange={{ start: startDate, end: endDate }}
        />
      );

      expect(container.textContent).toContain("📅 2024-01-01 - 2024-01-31");
      expect(container.querySelector(".bg-orange-100")).toBeInTheDocument();
    });

    it("should display date range with start date only", () => {
      const startDate = new Date("2024-01-01");

      const { container } = render(
        <ActiveFiltersSummary
          {...mockProps}
          dateRange={{ start: startDate, end: null }}
        />
      );

      expect(container.textContent).toContain("📅 2024-01-01 - ...");
      expect(container.querySelector(".bg-orange-100")).toBeInTheDocument();
    });

    it("should display date range with end date only", () => {
      const endDate = new Date("2024-01-31");

      const { container } = render(
        <ActiveFiltersSummary
          {...mockProps}
          dateRange={{ start: null, end: endDate }}
        />
      );

      expect(container.textContent).toContain("📅 ... - 2024-01-31");
      expect(container.querySelector(".bg-orange-100")).toBeInTheDocument();
    });

    it("should not display date range when both dates are null", () => {
      render(
        <ActiveFiltersSummary
          {...mockProps}
          dateRange={{ start: null, end: null }}
        />
      );

      expect(
        screen.queryByText("📅", { exact: false })
      ).not.toBeInTheDocument();
    });

    it("should call onDateRangeChange with null values when remove button is clicked", () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");

      render(
        <ActiveFiltersSummary
          {...mockProps}
          dateRange={{ start: startDate, end: endDate }}
        />
      );

      // Click remove button for date range
      const removeButtons = screen.getAllByText("✕");
      const dateRangeRemoveButton = removeButtons.find((button) =>
        button.closest(".bg-orange-100")
      );

      if (dateRangeRemoveButton) {
        fireEvent.click(dateRangeRemoveButton);
      }

      expect(mockProps.onDateRangeChange).toHaveBeenCalledWith({
        start: null,
        end: null,
      });
    });

    it("should apply correct styling for date range chip", () => {
      const startDate = new Date("2024-01-01");

      const { container } = render(
        <ActiveFiltersSummary
          {...mockProps}
          dateRange={{ start: startDate, end: null }}
        />
      );

      const chipSpan = container.querySelector(
        ".bg-orange-100.text-orange-800"
      );
      expect(chipSpan).toBeInTheDocument();
      expect(chipSpan).toHaveClass("bg-orange-100", "text-orange-800");
    });
  });

  describe("Multiple Filters", () => {
    it("should display all filter types simultaneously", () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");

      const { container } = render(
        <ActiveFiltersSummary
          {...mockProps}
          searchTerm="John"
          treatmentTypes={["light_bath"]}
          statuses={["completed"]}
          dateRange={{ start: startDate, end: endDate }}
        />
      );

      expect(container.textContent).toContain("🔍");
      expect(container.textContent).toContain("John");
      expect(container.textContent).toContain("💡 Banho de Luz");
      expect(container.textContent).toContain("✅ Concluído");
      expect(container.textContent).toContain("📅 2024-01-01 - 2024-01-31");

      expect(container.querySelector(".bg-blue-100")).toBeInTheDocument();
      expect(container.querySelector(".bg-green-100")).toBeInTheDocument();
      expect(container.querySelector(".bg-purple-100")).toBeInTheDocument();
      expect(container.querySelector(".bg-orange-100")).toBeInTheDocument();
    });

    it("should handle multiple items of the same filter type", () => {
      render(
        <ActiveFiltersSummary
          {...mockProps}
          treatmentTypes={["light_bath", "rod"]}
          statuses={["scheduled", "completed", "cancelled"]}
        />
      );

      expect(screen.getByText("💡 Banho de Luz")).toBeInTheDocument();
      expect(screen.getByText("🪄 Bastão")).toBeInTheDocument();
      expect(screen.getByText("📅 Agendado")).toBeInTheDocument();
      expect(screen.getByText("✅ Concluído")).toBeInTheDocument();
      expect(screen.getByText("❌ Cancelado")).toBeInTheDocument();
    });
  });

  describe("Date Formatting", () => {
    it("should format dates correctly using ISO format", () => {
      const testDate = new Date("2024-12-25T15:30:00Z");

      const { container } = render(
        <ActiveFiltersSummary
          {...mockProps}
          dateRange={{ start: testDate, end: null }}
        />
      );

      expect(container.textContent).toContain("2024-12-25");
    });
  });

  describe("Empty States", () => {
    it("should render empty container when no filters are active", () => {
      const { container } = render(<ActiveFiltersSummary {...mockProps} />);

      const filterContainer = container.querySelector(".flex.flex-wrap");
      expect(filterContainer?.children).toHaveLength(0);
    });
  });

  describe("Accessibility", () => {
    it("should have proper button roles for remove actions", () => {
      render(
        <ActiveFiltersSummary
          {...mockProps}
          searchTerm="test"
          treatmentTypes={["light_bath"]}
        />
      );

      const removeButtons = screen.getAllByRole("button");
      expect(removeButtons).toHaveLength(2);
      removeButtons.forEach((button) => {
        expect(button).toHaveTextContent("✕");
      });
    });

    it("should have hover states for remove buttons", () => {
      render(<ActiveFiltersSummary {...mockProps} searchTerm="test" />);

      const removeButton = screen.getByRole("button");
      expect(removeButton).toHaveClass("hover:text-blue-800");
    });
  });

  describe("Responsive Design", () => {
    it("should apply responsive classes for mobile and desktop", () => {
      const { container } = render(
        <ActiveFiltersSummary {...mockProps} searchTerm="test" />
      );

      const chip = container.querySelector(".bg-blue-100");
      expect(chip).toHaveClass("px-2", "sm:px-3", "text-xs", "sm:text-sm");
    });

    it("should apply responsive gap classes to container", () => {
      const { container } = render(
        <ActiveFiltersSummary {...mockProps} searchTerm="test" />
      );

      const flexContainer = container.querySelector(".flex.flex-wrap");
      expect(flexContainer).toHaveClass("gap-1", "sm:gap-2");
    });

    it("should apply responsive padding to main container", () => {
      const { container } = render(<ActiveFiltersSummary {...mockProps} />);

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass("pt-3", "sm:pt-4");
    });
  });
});
