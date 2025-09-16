import React from "react";
import { render, screen } from "@testing-library/react";
import EndOfDayModal from "../EndOfDayContainer";

// Test to verify date handling is correct
describe("EndOfDayModal - Date Handling Fix", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onFinalize: jest.fn(),
    incompleteAttendances: [],
    scheduledAbsences: [],
    completedAttendances: [],
    isLoading: false,
  };

  it("should correctly format various YYYY-MM-DD dates without timezone issues", () => {
    const testCases = [
      { input: "2024-01-15", expected: "15/01/2024" },
      { input: "2024-12-31", expected: "31/12/2024" },
      { input: "2025-03-01", expected: "01/03/2025" },
      { input: "2023-07-04", expected: "04/07/2023" },
    ];

    testCases.forEach(({ input, expected }) => {
      const { unmount } = render(
        <EndOfDayModal {...defaultProps} selectedDate={input} />
      );

      // Check if the correctly formatted date is displayed
      expect(
        screen.getByText(new RegExp(expected.replace(/\//g, "\\/")))
      ).toBeInTheDocument();

      // Clean up for next test
      unmount();
    });
  });

  it("should handle edge cases like leap year dates", () => {
    const leapYearDate = "2024-02-29"; // 2024 is a leap year
    const expectedFormat = "29/02/2024";

    render(<EndOfDayModal {...defaultProps} selectedDate={leapYearDate} />);

    expect(
      screen.getByText(new RegExp(expectedFormat.replace(/\//g, "\\/")))
    ).toBeInTheDocument();
  });

  it("should display current date when selectedDate is undefined", () => {
    render(<EndOfDayModal {...defaultProps} selectedDate={undefined} />);

    // Should still render without error and show today's date
    // We can't predict the exact date, but it should be in pt-BR format
    expect(screen.getByText(/\d{2}\/\d{2}\/\d{4}/)).toBeInTheDocument();
  });

  it("should display current date when selectedDate is empty string", () => {
    render(<EndOfDayModal {...defaultProps} selectedDate="" />);

    // Should still render without error and show today's date
    expect(screen.getByText(/\d{2}\/\d{2}\/\d{4}/)).toBeInTheDocument();
  });
});
