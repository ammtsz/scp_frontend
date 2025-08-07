import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import UnscheduledPatients from "../index";

// Mock the NewAttendanceForm since it requires context
jest.mock("../../NewAttendanceForm", () => {
  return function MockNewAttendanceForm() {
    return <div data-testid="new-attendance-form">Mock Form</div>;
  };
});

describe("UnscheduledPatients Dropdown Component", () => {
  const mockOnRegisterNewAttendance = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the dropdown header correctly", () => {
    render(
      <UnscheduledPatients
        onRegisterNewAttendance={mockOnRegisterNewAttendance}
      />
    );

    expect(
      screen.getByText("Check-in de pacientes não agendados")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Registre pacientes não agendados ou novos pacientes")
    ).toBeInTheDocument();
  });

  it("should be collapsed by default", () => {
    render(
      <UnscheduledPatients
        onRegisterNewAttendance={mockOnRegisterNewAttendance}
      />
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-expanded", "false");

    // Should not show the form when collapsed
    expect(screen.queryByTestId("new-attendance-form")).not.toBeInTheDocument();
  });

  it("should expand when clicked", () => {
    render(
      <UnscheduledPatients
        onRegisterNewAttendance={mockOnRegisterNewAttendance}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(button).toHaveAttribute("aria-expanded", "true");

    // Should show the form when expanded
    expect(screen.getByTestId("new-attendance-form")).toBeInTheDocument();
  });

  it("should have proper styling structure", () => {
    const { container } = render(
      <UnscheduledPatients
        onRegisterNewAttendance={mockOnRegisterNewAttendance}
      />
    );

    // Check the main container has the expected classes
    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass("card-shadow");
  });
});
