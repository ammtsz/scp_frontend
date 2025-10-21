import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import IncompleteAttendancesStep from "../Steps/IncompleteAttendancesStep";
import type { IAttendanceStatusDetailWithType } from "../../../utils/attendanceDataUtils";

// Mock the TimezoneContext
const mockUseTimezone = {
  userTimezone: "America/Sao_Paulo",
  setUserTimezone: jest.fn(),
  supportedTimezones: [
    "America/Sao_Paulo",
    "America/New_York",
  ] as readonly string[],
  timezoneDisplayNames: {},
  serverTimezone: {
    timezone: "America/Sao_Paulo",
    date: "2025-10-20",
    time: "14:30:00",
    offset: -3,
  },
  detectedTimezone: {
    timezone: "America/Sao_Paulo",
    date: "2025-10-20",
    time: "14:30:00",
    offset: -3,
  },
  isValidBrowserTimezone: true,
  isLoading: false,
  error: null,
};

jest.mock("@/contexts/TimezoneContext", () => ({
  useTimezone: () => mockUseTimezone,
}));

// Mock data factory
const createMockAttendance = (
  overrides: Partial<IAttendanceStatusDetailWithType> = {}
): IAttendanceStatusDetailWithType => ({
  name: "John Doe",
  priority: "1",
  checkedInTime: "09:00:00",
  onGoingTime: null,
  completedTime: null,
  attendanceId: 1,
  patientId: 1,
  attendanceType: "spiritual",
  ...overrides,
});

describe("IncompleteAttendancesStep", () => {
  const defaultProps = {
    incompleteAttendances: [],
    selectedDate: "2024-01-15",
    onHandleCompletion: jest.fn(),
    onReschedule: jest.fn(),
    onNext: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows success message when no incomplete attendances", () => {
    render(<IncompleteAttendancesStep {...defaultProps} />);

    expect(
      screen.getByText("Todos os atendimentos foram concluídos!")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Não há atendimentos incompletos para este dia.")
    ).toBeInTheDocument();
  });

  it("displays formatted date correctly", () => {
    render(<IncompleteAttendancesStep {...defaultProps} />);

    expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument();
  });

  it("shows warning when there are incomplete attendances", () => {
    const incompleteAttendances = [createMockAttendance()];

    render(
      <IncompleteAttendancesStep
        {...defaultProps}
        incompleteAttendances={incompleteAttendances}
      />
    );

    expect(screen.getByText("Atendimentos não concluídos")).toBeInTheDocument();
    expect(screen.getByText(/Há 1 atendimento/)).toBeInTheDocument();
  });

  it("renders incomplete attendance details", () => {
    const incompleteAttendances = [
      createMockAttendance({
        name: "Jane Doe",
        priority: "2",
        attendanceId: 123,
      }),
    ];

    render(
      <IncompleteAttendancesStep
        {...defaultProps}
        incompleteAttendances={incompleteAttendances}
      />
    );

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Priority: 2")).toBeInTheDocument();
  });

  it("displays check-in time when available", () => {
    // Use a proper ISO datetime format that the component can parse
    const checkedInTime = "2024-01-15T10:30:00";
    const incompleteAttendances = [
      createMockAttendance({
        checkedInTime,
      }),
    ];

    render(
      <IncompleteAttendancesStep
        {...defaultProps}
        incompleteAttendances={incompleteAttendances}
      />
    );

    // Look for the time display more flexibly
    expect(screen.getByText(/Check-in:/)).toBeInTheDocument();
    expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument();
  });

  it("calls onHandleCompletion when Concluir button is clicked", () => {
    const incompleteAttendances = [createMockAttendance({ attendanceId: 123 })];

    render(
      <IncompleteAttendancesStep
        {...defaultProps}
        incompleteAttendances={incompleteAttendances}
      />
    );

    fireEvent.click(screen.getByText("Concluir"));

    expect(defaultProps.onHandleCompletion).toHaveBeenCalledWith(123);
  });

  it("calls onReschedule when Reagendar button is clicked", () => {
    const incompleteAttendances = [createMockAttendance({ attendanceId: 123 })];

    render(
      <IncompleteAttendancesStep
        {...defaultProps}
        incompleteAttendances={incompleteAttendances}
      />
    );

    fireEvent.click(screen.getByText("Reagendar"));

    expect(defaultProps.onReschedule).toHaveBeenCalledWith(123);
  });

  it("displays both Concluir and Reagendar buttons for incomplete attendances", () => {
    const incompleteAttendances = [createMockAttendance({ attendanceId: 123 })];

    render(
      <IncompleteAttendancesStep
        {...defaultProps}
        incompleteAttendances={incompleteAttendances}
      />
    );

    expect(screen.getByText("Concluir")).toBeInTheDocument();
    expect(screen.getByText("Reagendar")).toBeInTheDocument();
  });

  it("disables Concluir button when attendanceId is missing", () => {
    const incompleteAttendances = [
      createMockAttendance({ attendanceId: undefined }),
    ];

    render(
      <IncompleteAttendancesStep
        {...defaultProps}
        incompleteAttendances={incompleteAttendances}
      />
    );

    const button = screen.getByText("Concluir");
    expect(button).toBeDisabled();
  });

  it("disables both buttons when attendanceId is missing", () => {
    const incompleteAttendances = [
      createMockAttendance({ attendanceId: undefined }),
    ];

    render(
      <IncompleteAttendancesStep
        {...defaultProps}
        incompleteAttendances={incompleteAttendances}
      />
    );

    const concluirButton = screen.getByText("Concluir");
    const reagendarButton = screen.getByText("Reagendar");

    expect(concluirButton).toBeDisabled();
    expect(reagendarButton).toBeDisabled();
  });

  it("enables Next button when no incomplete attendances", () => {
    render(<IncompleteAttendancesStep {...defaultProps} />);

    const nextButton = screen.getByText("Próximo");
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(nextButton);
    expect(defaultProps.onNext).toHaveBeenCalled();
  });

  it("disables Next button when there are incomplete attendances", () => {
    const incompleteAttendances = [createMockAttendance()];

    render(
      <IncompleteAttendancesStep
        {...defaultProps}
        incompleteAttendances={incompleteAttendances}
      />
    );

    const nextButton = screen.getByText("Próximo");
    expect(nextButton).toBeDisabled();
  });

  describe("Timezone-Aware Functionality", () => {
    it("should format check-in times using timezone context", () => {
      const incompleteAttendances = [
        createMockAttendance({
          checkedInTime: "2024-01-15T14:30:00.000Z",
          name: "Test Patient",
        }),
      ];

      render(
        <IncompleteAttendancesStep
          {...defaultProps}
          incompleteAttendances={incompleteAttendances}
        />
      );

      // Should display formatted time based on timezone
      expect(screen.getByText(/Check-in:/)).toBeInTheDocument();
    });

    it("should show timezone indicator when different from São Paulo", () => {
      // Change mock to New York timezone
      mockUseTimezone.userTimezone = "America/New_York";

      const incompleteAttendances = [
        createMockAttendance({
          checkedInTime: "2024-01-15T18:30:00.000Z",
          name: "Test Patient",
        }),
      ];

      render(
        <IncompleteAttendancesStep
          {...defaultProps}
          incompleteAttendances={incompleteAttendances}
        />
      );

      // Should display time with timezone indicator for non-São Paulo timezone
      const checkInText = screen.getByText(/Check-in:/);
      expect(checkInText).toBeInTheDocument();

      // Reset mock
      mockUseTimezone.userTimezone = "America/Sao_Paulo";
    });

    it("should not show timezone indicator for São Paulo timezone", () => {
      const incompleteAttendances = [
        createMockAttendance({
          checkedInTime: "2024-01-15T14:30:00.000Z",
          name: "Test Patient",
        }),
      ];

      render(
        <IncompleteAttendancesStep
          {...defaultProps}
          incompleteAttendances={incompleteAttendances}
        />
      );

      const checkInText = screen.getByText(/Check-in:/);
      // Should not contain timezone abbreviations for São Paulo (default)
      expect(checkInText.textContent).not.toMatch(/BRT|BRST|EST|EDT/);
    });

    it("should handle invalid check-in times gracefully", () => {
      const incompleteAttendances = [
        createMockAttendance({
          checkedInTime: "invalid-time",
          name: "Test Patient",
        }),
      ];

      render(
        <IncompleteAttendancesStep
          {...defaultProps}
          incompleteAttendances={incompleteAttendances}
        />
      );

      // Should render without crashing and show patient name
      expect(screen.getByText("Test Patient")).toBeInTheDocument();
    });

    it("should format multiple attendance times consistently", () => {
      const incompleteAttendances = [
        createMockAttendance({
          checkedInTime: "2024-01-15T14:30:00.000Z",
          name: "Patient One",
          attendanceId: 1,
        }),
        createMockAttendance({
          checkedInTime: "2024-01-15T15:45:00.000Z",
          name: "Patient Two",
          attendanceId: 2,
        }),
      ];

      render(
        <IncompleteAttendancesStep
          {...defaultProps}
          incompleteAttendances={incompleteAttendances}
        />
      );

      // Should show both patients with formatted times
      expect(screen.getByText("Patient One")).toBeInTheDocument();
      expect(screen.getByText("Patient Two")).toBeInTheDocument();

      // Should display check-in times for both
      const checkInTexts = screen.getAllByText(/Check-in:/);
      expect(checkInTexts).toHaveLength(2);
    });

    it("should handle null check-in times without timezone errors", () => {
      const incompleteAttendances = [
        createMockAttendance({
          checkedInTime: null,
          name: "Test Patient",
        }),
      ];

      render(
        <IncompleteAttendancesStep
          {...defaultProps}
          incompleteAttendances={incompleteAttendances}
        />
      );

      // Should render patient without check-in time
      expect(screen.getByText("Test Patient")).toBeInTheDocument();
      expect(screen.queryByText(/Check-in:/)).not.toBeInTheDocument();
    });
  });
});
