import React from "react";
import { render, waitFor } from "@testing-library/react";
import { AttendancesProvider, useAttendances } from "../AttendancesContext";
import * as attendanceApi from "@/api/attendances";

// Mock the API functions
jest.mock("@/api/attendances");
jest.mock("@/utils/apiTransformers", () => ({
  transformAttendanceWithPatientByDate: jest.fn(),
}));

const mockGetAttendancesByDate =
  attendanceApi.getAttendancesByDate as jest.MockedFunction<
    typeof attendanceApi.getAttendancesByDate
  >;
const mockGetNextAttendanceDate =
  attendanceApi.getNextAttendanceDate as jest.MockedFunction<
    typeof attendanceApi.getNextAttendanceDate
  >;

// Import the mocked transformer
import { transformAttendanceWithPatientByDate } from "@/utils/apiTransformers";
const mockTransformAttendanceWithPatientByDate =
  transformAttendanceWithPatientByDate as jest.MockedFunction<
    typeof transformAttendanceWithPatientByDate
  >;

// Test component to access context
const TestComponent: React.FC = () => {
  const context = useAttendances();
  return (
    <div>
      <div data-testid="loading">{context.loading.toString()}</div>
      <div data-testid="data-loading">{context.dataLoading.toString()}</div>
      <div data-testid="selected-date">{context.selectedDate}</div>
      <div data-testid="error">{context.error || "null"}</div>
    </div>
  );
};

describe("AttendancesContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should provide context values correctly", async () => {
    // Mock successful API responses
    mockGetNextAttendanceDate.mockResolvedValue({
      success: true,
      value: { next_date: "2025-01-15" },
    });

    mockGetAttendancesByDate.mockResolvedValue({
      success: true,
      value: [],
    });

    mockTransformAttendanceWithPatientByDate.mockReturnValue({
      date: new Date("2025-01-15"),
      spiritual: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
      lightBath: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
      rod: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
      combined: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
    });

    const { getByTestId } = render(
      <AttendancesProvider>
        <TestComponent />
      </AttendancesProvider>
    );

    // Initially loading should be true
    expect(getByTestId("loading")).toHaveTextContent("true");

    // Wait for initialization to complete
    await waitFor(() => {
      expect(getByTestId("loading")).toHaveTextContent("false");
    });

    // Check that selected date was set from API
    expect(getByTestId("selected-date")).toHaveTextContent("2025-01-15");
    expect(getByTestId("error")).toHaveTextContent("null");
  });

  it("should handle API errors gracefully", async () => {
    // Mock API failure
    mockGetNextAttendanceDate.mockRejectedValue(new Error("API Error"));
    mockGetAttendancesByDate.mockResolvedValue({
      success: true,
      value: [],
    });

    mockTransformAttendanceWithPatientByDate.mockReturnValue({
      date: new Date(),
      spiritual: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
      lightBath: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
      rod: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
      combined: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
    });

    const { getByTestId } = render(
      <AttendancesProvider>
        <TestComponent />
      </AttendancesProvider>
    );

    // Wait for initialization to complete
    await waitFor(() => {
      expect(getByTestId("loading")).toHaveTextContent("false");
    });

    // Should fall back to current date
    const currentDate = new Date().toISOString().slice(0, 10);
    expect(getByTestId("selected-date")).toHaveTextContent(currentDate);
  });

  it("should provide all required context methods", () => {
    const TestMethodsComponent: React.FC = () => {
      const context = useAttendances();

      return (
        <div>
          <div data-testid="has-methods">
            {typeof context.loadAttendancesByDate === "function" &&
            typeof context.bulkUpdateStatus === "function" &&
            typeof context.initializeSelectedDate === "function" &&
            typeof context.refreshCurrentDate === "function" &&
            typeof context.checkEndOfDayStatus === "function" &&
            typeof context.finalizeEndOfDay === "function" &&
            typeof context.handleIncompleteAttendances === "function" &&
            typeof context.handleAbsenceJustifications === "function"
              ? "true"
              : "false"}
          </div>
        </div>
      );
    };

    mockGetNextAttendanceDate.mockResolvedValue({
      success: true,
      value: { next_date: "2025-01-15" },
    });

    mockGetAttendancesByDate.mockResolvedValue({
      success: true,
      value: [],
    });

    mockTransformAttendanceWithPatientByDate.mockReturnValue({
      date: new Date("2025-01-15"),
      spiritual: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
      lightBath: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
      rod: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
      combined: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
    });

    const { getByTestId } = render(
      <AttendancesProvider>
        <TestMethodsComponent />
      </AttendancesProvider>
    );

    expect(getByTestId("has-methods")).toHaveTextContent("true");
  });

  it("should throw error when used outside provider", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useAttendances must be used within an AttendancesProvider");

    consoleError.mockRestore();
  });

  it("should check end-of-day status correctly", async () => {
    mockGetNextAttendanceDate.mockResolvedValue({
      success: true,
      value: { next_date: "2025-01-15" },
    });

    mockGetAttendancesByDate.mockResolvedValue({
      success: true,
      value: [],
    });

    const mockAttendanceData = {
      date: new Date("2025-01-15"),
      spiritual: {
        scheduled: [
          {
            name: "Patient 1",
            priority: "1" as const,
            attendanceId: 1,
            patientId: 1,
          },
        ],
        checkedIn: [],
        onGoing: [],
        completed: [],
      },
      lightBath: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
      rod: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
      combined: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
    };

    mockTransformAttendanceWithPatientByDate.mockReturnValue(
      mockAttendanceData
    );

    const TestEndOfDayComponent: React.FC = () => {
      const context = useAttendances();
      const status = context.checkEndOfDayStatus();

      return (
        <div>
          <div data-testid="eod-status">{status.type}</div>
        </div>
      );
    };

    const { getByTestId } = render(
      <AttendancesProvider>
        <TestEndOfDayComponent />
      </AttendancesProvider>
    );

    await waitFor(() => {
      expect(getByTestId("eod-status")).toHaveTextContent("scheduled_absences");
    });
  });
});
