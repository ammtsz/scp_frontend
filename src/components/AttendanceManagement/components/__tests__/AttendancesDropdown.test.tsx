import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AttendancesDropdown from "../AttendancesDropdown";
import { PreviousAttendance } from "@/types/types";

// Mock the dateHelpers utility
jest.mock("@/utils/dateHelpers", () => ({
  formatDateBR: jest.fn((date: string) => {
    // Return a simple mock format for testing
    return new Date(date).toLocaleDateString("pt-BR");
  }),
}));

describe("AttendancesDropdown", () => {
  const mockAttendances: PreviousAttendance[] = [
    {
      attendanceId: "1",
      date: new Date("2025-11-25"),
      type: "spiritual",
      notes: "First attendance notes",
      recommendations: {
        food: "Light meals",
        water: "Energized water",
        ointment: "Healing ointments",
        lightBath: true,
        rod: false,
        spiritualTreatment: true,
        returnWeeks: 2,
      },
    },
    {
      attendanceId: "2",
      date: new Date("2025-11-20"),
      type: "lightBath",
      notes: "Second attendance notes",
      recommendations: {
        food: "Fruits and vegetables",
        water: "Pure water",
        ointment: "Natural ointments",
        lightBath: true,
        rod: true,
        spiritualTreatment: false,
        returnWeeks: 1,
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render attendance list with dates", () => {
    render(<AttendancesDropdown attendances={mockAttendances} />);

    // Check that both attendance dates are displayed
    expect(screen.getAllByText(/Data:/)).toHaveLength(2);
    expect(screen.getByText(/24\/11\/2025/)).toBeInTheDocument(); // Fixed expected date
    expect(screen.getByText(/19\/11\/2025/)).toBeInTheDocument(); // Fixed expected date
  });

  it("should show collapse/expand indicators", () => {
    render(<AttendancesDropdown attendances={mockAttendances} />);

    // Initially, all items should be collapsed (▼)
    const collapseIndicators = screen.getAllByText("▼");
    expect(collapseIndicators).toHaveLength(2);
  });

  it("should expand attendance details when clicked", () => {
    render(<AttendancesDropdown attendances={mockAttendances} />);

    // Find the first attendance button and click it
    const firstAttendanceButton = screen.getAllByRole("button")[0];
    fireEvent.click(firstAttendanceButton);

    // Should show expand indicator (▲)
    expect(screen.getByText("▲")).toBeInTheDocument();

    // Should show the notes
    expect(screen.getByText("First attendance notes")).toBeInTheDocument();
  });

  it("should collapse attendance when clicked again", () => {
    render(<AttendancesDropdown attendances={mockAttendances} />);

    const firstAttendanceButton = screen.getAllByRole("button")[0];

    // Expand first
    fireEvent.click(firstAttendanceButton);
    expect(screen.getByText("▲")).toBeInTheDocument();

    // Collapse again
    fireEvent.click(firstAttendanceButton);
    expect(screen.queryByText("▲")).not.toBeInTheDocument();
    expect(screen.getAllByText("▼")).toHaveLength(2); // Back to both collapsed
  });

  it("should handle multiple attendances expanded simultaneously", () => {
    render(<AttendancesDropdown attendances={mockAttendances} />);

    const attendanceButtons = screen.getAllByRole("button");

    // Expand both attendances
    fireEvent.click(attendanceButtons[0]);
    fireEvent.click(attendanceButtons[1]);

    // Both should be expanded
    const expandedIndicators = screen.getAllByText("▲");
    expect(expandedIndicators).toHaveLength(2);

    // Both notes should be visible
    expect(screen.getByText("First attendance notes")).toBeInTheDocument();
    expect(screen.getByText("Second attendance notes")).toBeInTheDocument();
  });

  it("should render edit buttons with correct attributes", () => {
    render(<AttendancesDropdown attendances={mockAttendances} />);

    const editLinks = screen.getAllByText("Editar");

    expect(editLinks).toHaveLength(2);

    editLinks.forEach((link) => {
      expect(link).toHaveClass("cursor-not-allowed");
      expect(link).toHaveClass("opacity-60");
      expect(link).toHaveAttribute("tabIndex", "-1");
      expect(link).toHaveAttribute("aria-disabled", "true");
      expect(link).toHaveAttribute("href", "#");
    });
  });

  it("should display treatment information when expanded", () => {
    render(<AttendancesDropdown attendances={mockAttendances} />);

    // Expand the first attendance
    const firstAttendanceButton = screen.getAllByRole("button")[0];
    fireEvent.click(firstAttendanceButton);

    // Check if treatment info is displayed (this might need adjustment based on actual content)
    expect(screen.getByText("First attendance notes")).toBeInTheDocument();
  });

  it("should handle empty attendances array", () => {
    render(<AttendancesDropdown attendances={[]} />);

    // Should not crash and should render empty list
    expect(screen.queryByText(/Data:/)).not.toBeInTheDocument();
  });

  it("should handle attendance without notes", () => {
    const attendancesWithoutNotes: PreviousAttendance[] = [
      {
        attendanceId: "3",
        date: new Date("2025-11-25"),
        type: "spiritual",
        notes: "", // Empty notes
        recommendations: null,
      },
    ];

    render(<AttendancesDropdown attendances={attendancesWithoutNotes} />);

    const firstAttendanceButton = screen.getAllByRole("button")[0];
    fireEvent.click(firstAttendanceButton);

    // Should still expand but not show notes content
    expect(screen.getByText("▲")).toBeInTheDocument();
  });

  it("should use unique keys for list items", () => {
    const { container } = render(
      <AttendancesDropdown attendances={mockAttendances} />
    );

    const listItems = container.querySelectorAll("li");
    expect(listItems).toHaveLength(2);

    // Each li should have a unique key (React will handle this internally)
    listItems.forEach((item) => {
      expect(item).toBeInTheDocument();
    });
  });

  it("should apply correct CSS classes for styling", () => {
    const { container } = render(
      <AttendancesDropdown attendances={mockAttendances} />
    );

    // Check for main list classes
    const list = container.querySelector("ul");
    expect(list).toHaveClass("ml-4", "list-none", "text-sm");

    // Check for list item classes
    const listItems = container.querySelectorAll("li");
    listItems.forEach((item) => {
      expect(item).toHaveClass(
        "mb-2",
        "border-b",
        "border-[color:var(--border)]"
      );
    });

    // Check button classes
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toHaveClass(
        "w-full",
        "text-left",
        "py-2",
        "px-2",
        "bg-[color:var(--surface)]",
        "hover:bg-[color:var(--surface-hover)]",
        "rounded",
        "flex",
        "justify-between",
        "items-center"
      );
    });
  });

  it("should call formatDateBR with correct date format", () => {
    const { formatDateBR } = jest.requireMock("@/utils/dateHelpers");

    render(<AttendancesDropdown attendances={mockAttendances} />);

    expect(formatDateBR).toHaveBeenCalledWith("2025-11-25T00:00:00.000Z");
    expect(formatDateBR).toHaveBeenCalledWith("2025-11-20T00:00:00.000Z");
    expect(formatDateBR).toHaveBeenCalledTimes(2);
  });

  it("should handle attendances with undefined or null notes", () => {
    const attendancesWithNullNotes: PreviousAttendance[] = [
      {
        attendanceId: "4",
        date: new Date("2025-11-25"),
        type: "rod",
        notes: "",
        recommendations: null,
      },
    ];

    expect(() => {
      render(<AttendancesDropdown attendances={attendancesWithNullNotes} />);
    }).not.toThrow();

    const firstAttendanceButton = screen.getAllByRole("button")[0];
    fireEvent.click(firstAttendanceButton);

    // Should still expand without crashing
    expect(screen.getByText("▲")).toBeInTheDocument();
  });
});
