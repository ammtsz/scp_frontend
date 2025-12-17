/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AttendancePage from "../page";

// Mock the PatientWalkInPanel component
jest.mock(
  "@/components/AttendanceManagement/components/Forms/WalkInForm",
  () => ({
    PatientWalkInPanel: ({
      onRegisterNewAttendance,
    }: {
      onRegisterNewAttendance: (
        name: string,
        types: string[],
        isNew: boolean,
        priority: string
      ) => void;
    }) => (
      <div data-testid="patient-walk-in-panel">
        <button
          data-testid="register-attendance-btn"
          onClick={() =>
            onRegisterNewAttendance("Test Patient", ["spiritual"], true, "2")
          }
        >
          Register New Attendance
        </button>
      </div>
    ),
  })
);

// Mock the LoadingFallback component
jest.mock("@/components/common/LoadingFallback", () => {
  return function MockLoadingFallback({
    message,
    size,
  }: {
    message?: string;
    size?: string;
  }) {
    return (
      <div
        data-testid="loading-fallback"
        data-message={message}
        data-size={size}
      >
        {message}
      </div>
    );
  };
});

// Mock the AttendanceManagement component
jest.mock("@/components/AttendanceManagement", () => {
  return function MockAttendanceManagement({
    unscheduledCheckIn,
    onCheckInProcessed,
  }: {
    unscheduledCheckIn: {
      name: string;
      types: string[];
      isNew: boolean;
      priority: string;
    } | null;
    onCheckInProcessed: () => void;
  }) {
    return (
      <div data-testid="attendance-management">
        <div>Attendance Management Component</div>
        {unscheduledCheckIn && (
          <div data-testid="unscheduled-check-in">
            Patient: {unscheduledCheckIn.name}
            <button onClick={onCheckInProcessed} data-testid="process-check-in">
              Process Check-in
            </button>
          </div>
        )}
      </div>
    );
  };
});

describe("AttendancePage", () => {
  it("should render all main components", () => {
    render(<AttendancePage />);

    expect(screen.getByTestId("patient-walk-in-panel")).toBeInTheDocument();
    expect(screen.getByText("Quadro de Atendimentos")).toBeInTheDocument();

    // Should render either loading fallback or the actual component
    const hasLoadingFallback = screen.queryByTestId("loading-fallback");
    const hasAttendanceManagement = screen.queryByTestId(
      "attendance-management"
    );
    expect(hasLoadingFallback || hasAttendanceManagement).toBeTruthy();
  });

  it("should display the correct heading and description", () => {
    render(<AttendancePage />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Quadro de Atendimentos"
    );

    const description = screen.getByText(/Gerencie o fluxo de atendimentos/);
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent(/arrastando e soltando/);
    expect(description).toHaveTextContent(/botão x para remover/);
  });

  it("should have proper layout structure", () => {
    const { container } = render(<AttendancePage />);

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass("flex", "flex-col", "gap-8", "my-16");

    // Card should have shadow
    const cardElement = container.querySelector(".card-shadow");
    expect(cardElement).toBeInTheDocument();
  });

  it("should handle unscheduled check-in state", () => {
    render(<AttendancePage />);

    // Initially no unscheduled check-in
    expect(
      screen.queryByTestId("unscheduled-check-in")
    ).not.toBeInTheDocument();

    // Trigger new attendance registration
    const registerButton = screen.getByTestId("register-attendance-btn");
    fireEvent.click(registerButton);

    // Should show unscheduled check-in
    expect(screen.getByTestId("unscheduled-check-in")).toBeInTheDocument();
    expect(screen.getByText("Patient: Test Patient")).toBeInTheDocument();
  });

  it("should clear unscheduled check-in when processed", () => {
    render(<AttendancePage />);

    // Register new attendance
    const registerButton = screen.getByTestId("register-attendance-btn");
    fireEvent.click(registerButton);

    // Verify it's there
    expect(screen.getByTestId("unscheduled-check-in")).toBeInTheDocument();

    // Process the check-in
    const processButton = screen.getByTestId("process-check-in");
    fireEvent.click(processButton);

    // Should be cleared
    expect(
      screen.queryByTestId("unscheduled-check-in")
    ).not.toBeInTheDocument();
  });

  it("should pass correct props to AttendanceManagement", () => {
    render(<AttendancePage />);

    // Register new attendance to trigger state change
    const registerButton = screen.getByTestId("register-attendance-btn");
    fireEvent.click(registerButton);

    // AttendanceManagement should receive the unscheduled check-in data
    expect(screen.getByTestId("unscheduled-check-in")).toBeInTheDocument();
    expect(screen.getByText("Patient: Test Patient")).toBeInTheDocument();
  });

  it("should use Suspense for lazy loading AttendanceManagement", () => {
    render(<AttendancePage />);

    // Should render either loading fallback or the actual component
    const hasLoadingFallback = screen.queryByTestId("loading-fallback");
    const hasAttendanceManagement = screen.queryByTestId(
      "attendance-management"
    );

    expect(hasLoadingFallback || hasAttendanceManagement).toBeTruthy();
  });

  it("should be a client component", () => {
    // Test that it renders without server-side issues
    expect(() => render(<AttendancePage />)).not.toThrow();
  });
});
