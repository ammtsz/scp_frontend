import React, { useState } from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { AttendancesProvider, useAttendances } from "../AttendancesContext";
import * as attendancesAPI from "@/api/attendances";
import {
  AttendanceType,
  AttendanceStatus,
  AttendanceResponseDto,
  PatientPriority,
  TreatmentStatus,
} from "@/api/types";

// Mock the attendances API
jest.mock("@/api/attendances");

const mockedAttendancesAPI = attendancesAPI as jest.Mocked<
  typeof attendancesAPI
>;

// Helper component to test the context
const TestConsumer = () => {
  const context = useAttendances();

  if (!context) {
    return <div data-testid="no-context">No context</div>;
  }

  return (
    <div>
      <div data-testid="attendances-data">
        {context.attendancesByDate ? "has-data" : "no-data"}
      </div>
      <div data-testid="selected-date">{context.selectedDate}</div>
      <div data-testid="loading">{context.loading.toString()}</div>
      <div data-testid="data-loading">{context.dataLoading.toString()}</div>
      <div data-testid="error">{context.error || "no-error"}</div>

      {/* Buttons to test actions */}
      <button
        data-testid="set-date-btn"
        onClick={() => context.setSelectedDate("2025-01-16")}
      >
        Set Date
      </button>
      <button
        data-testid="refresh-btn"
        onClick={() => context.refreshCurrentDate()}
      >
        Refresh
      </button>
      <button
        data-testid="bulk-update-btn"
        onClick={() => context.bulkUpdateStatus([1, 2], "completed")}
      >
        Bulk Update
      </button>
      <button
        data-testid="load-specific-date-btn"
        onClick={() => context.loadAttendancesByDate("2025-02-01")}
      >
        Load Specific Date
      </button>
      <button
        data-testid="init-date-btn"
        onClick={() => context.initializeSelectedDate()}
      >
        Initialize Date
      </button>
      <button
        data-testid="set-attendances-btn"
        onClick={() =>
          context.setAttendancesByDate({
            date: new Date("2025-01-15"),
            spiritual: {
              scheduled: [],
              checkedIn: [],
              onGoing: [],
              completed: [],
            },
            lightBath: {
              scheduled: [],
              checkedIn: [],
              onGoing: [],
              completed: [],
            },
            rod: {
              scheduled: [],
              checkedIn: [],
              onGoing: [],
              completed: [],
            },
            combined: {
              scheduled: [],
              checkedIn: [],
              onGoing: [],
              completed: [],
            },
          })
        }
      >
        Set Attendances
      </button>
    </div>
  );
};

// Helper component to test without provider
const TestConsumerWithoutProvider = () => {
  const context = useAttendances();

  if (!context) {
    return (
      <div data-testid="error-message">
        useAttendances must be used within AttendancesProvider
      </div>
    );
  }

  return <div>Should not render</div>;
};

const mockApiResponse = {
  success: true as const,
  value: [
    {
      id: 1,
      patient_id: 1,
      type: AttendanceType.SPIRITUAL,
      status: AttendanceStatus.SCHEDULED,
      scheduled_date: "2025-01-15",
      scheduled_time: "09:00",
      created_at: "2025-01-01T08:00:00.000Z",
      updated_at: "2025-01-10T08:00:00.000Z",
    },
    {
      id: 2,
      patient_id: 2,
      type: AttendanceType.LIGHT_BATH,
      status: AttendanceStatus.CHECKED_IN,
      scheduled_date: "2025-01-15",
      scheduled_time: "10:00",
      created_at: "2025-01-02T08:00:00.000Z",
      updated_at: "2025-01-11T08:00:00.000Z",
    },
  ],
};

describe("AttendancesContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAttendancesAPI.getAttendancesByDate.mockResolvedValue(
      mockApiResponse
    );
    mockedAttendancesAPI.getNextAttendanceDate.mockResolvedValue({
      success: true,
      value: { next_date: "2025-01-15" },
    });
    mockedAttendancesAPI.bulkUpdateAttendanceStatus.mockResolvedValue({
      success: true,
      value: { updated: 1, success: true },
    });
  });

  describe("Provider Setup", () => {
    it("should provide context values to children", async () => {
      render(
        <AttendancesProvider>
          <TestConsumer />
        </AttendancesProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });

      expect(screen.getByTestId("error")).toHaveTextContent("no-error");
      expect(screen.getByTestId("selected-date")).toBeInTheDocument();
    });

    it("should throw error when used outside provider", () => {
      // Suppress console errors during this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestConsumerWithoutProvider />);
      }).toThrow("useAttendances must be used within an AttendancesProvider");

      // Restore console.error
      console.error = originalError;
    });
  });

  describe("Initial Load", () => {
    it("should initialize with loading state", async () => {
      render(
        <AttendancesProvider>
          <TestConsumer />
        </AttendancesProvider>
      );

      // Should eventually stop loading
      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });
    });

    it("should call getNextAttendanceDate on initialization", async () => {
      render(
        <AttendancesProvider>
          <TestConsumer />
        </AttendancesProvider>
      );

      await waitFor(() => {
        expect(mockedAttendancesAPI.getNextAttendanceDate).toHaveBeenCalled();
      });
    });

    it("should handle API errors during initialization", async () => {
      mockedAttendancesAPI.getNextAttendanceDate.mockRejectedValue(
        new Error("API Error")
      );

      render(
        <AttendancesProvider>
          <TestConsumer />
        </AttendancesProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });

      // Should still have a selected date (fallback to today)
      expect(screen.getByTestId("selected-date")).not.toHaveTextContent("");
    });
  });

  describe("Date Management", () => {
    it("should update selected date", async () => {
      render(
        <AttendancesProvider>
          <TestConsumer />
        </AttendancesProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });

      // Update date
      await userEvent.click(screen.getByTestId("set-date-btn"));

      expect(screen.getByTestId("selected-date")).toHaveTextContent(
        "2025-01-16"
      );
    });
  });

  describe("Data Loading", () => {
    it("should load attendances for selected date", async () => {
      render(
        <AttendancesProvider>
          <TestConsumer />
        </AttendancesProvider>
      );

      await waitFor(() => {
        expect(mockedAttendancesAPI.getAttendancesByDate).toHaveBeenCalled();
      });
    });

    it("should handle data loading errors", async () => {
      mockedAttendancesAPI.getAttendancesByDate.mockResolvedValue({
        success: false,
        error: "Failed to load data",
      });

      render(
        <AttendancesProvider>
          <TestConsumer />
        </AttendancesProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Failed to load data"
        );
      });
    });
  });

  describe("Refresh Functionality", () => {
    it("should refresh current date data", async () => {
      render(
        <AttendancesProvider>
          <TestConsumer />
        </AttendancesProvider>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });

      // Clear previous calls
      mockedAttendancesAPI.getAttendancesByDate.mockClear();

      // Trigger refresh
      await userEvent.click(screen.getByTestId("refresh-btn"));

      await waitFor(() => {
        expect(mockedAttendancesAPI.getAttendancesByDate).toHaveBeenCalled();
      });
    });
  });

  describe("Loading States", () => {
    it("should show data loading state during operations", async () => {
      // Delay the API response
      mockedAttendancesAPI.getAttendancesByDate.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockApiResponse), 100)
          )
      );

      render(
        <AttendancesProvider>
          <TestConsumer />
        </AttendancesProvider>
      );

      // Should eventually finish loading
      await waitFor(
        () => {
          expect(screen.getByTestId("loading")).toHaveTextContent("false");
        },
        { timeout: 2000 }
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      mockedAttendancesAPI.getAttendancesByDate.mockRejectedValue(
        new Error("Network error")
      );

      render(
        <AttendancesProvider>
          <TestConsumer />
        </AttendancesProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Erro ao carregar atendimentos"
        );
      });
    });

    it("should clear errors on successful operations", async () => {
      // Start with error
      mockedAttendancesAPI.getAttendancesByDate.mockResolvedValueOnce({
        success: false,
        error: "Initial error",
      });

      render(
        <AttendancesProvider>
          <TestConsumer />
        </AttendancesProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent("Initial error");
      });

      // Reset to success
      mockedAttendancesAPI.getAttendancesByDate.mockResolvedValue(
        mockApiResponse
      );

      // Trigger refresh
      await userEvent.click(screen.getByTestId("refresh-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent("no-error");
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty API responses", async () => {
      mockedAttendancesAPI.getAttendancesByDate.mockResolvedValue({
        success: true,
        value: [],
      });

      render(
        <AttendancesProvider>
          <TestConsumer />
        </AttendancesProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });

      // Should not have error even with empty data
      expect(screen.getByTestId("error")).toHaveTextContent("no-error");
    });

    it("should handle malformed API responses", async () => {
      mockedAttendancesAPI.getAttendancesByDate.mockResolvedValue({
        success: true,
        value: [],
      });

      render(
        <AttendancesProvider>
          <TestConsumer />
        </AttendancesProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });

      // Should handle gracefully
      expect(screen.getByTestId("attendances-data")).toBeInTheDocument();
    });
  });

  describe("Bulk Operations", () => {
    beforeEach(() => {
      mockedAttendancesAPI.getAttendancesByDate.mockResolvedValue(
        mockApiResponse
      );
      mockedAttendancesAPI.getNextAttendanceDate.mockResolvedValue({
        success: true,
        value: { next_date: "2025-01-15" },
      });
    });

    it("should handle bulk status updates successfully", async () => {
      mockedAttendancesAPI.bulkUpdateAttendanceStatus.mockResolvedValue({
        success: true,
        value: { updated: 2, success: true },
      });

      render(
        <AttendancesProvider>
          <TestConsumer />
        </AttendancesProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });

      fireEvent.click(screen.getByTestId("bulk-update-btn"));

      await waitFor(() => {
        expect(
          mockedAttendancesAPI.bulkUpdateAttendanceStatus
        ).toHaveBeenCalledWith([1, 2], "completed");
      });
    });

    it("should handle bulk update errors gracefully", async () => {
      mockedAttendancesAPI.bulkUpdateAttendanceStatus.mockResolvedValue({
        success: false,
        error: "Bulk update failed",
      });

      render(
        <AttendancesProvider>
          <TestConsumer />
        </AttendancesProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });

      fireEvent.click(screen.getByTestId("bulk-update-btn"));

      await waitFor(() => {
        // The context doesn't set error state for bulk update failures,
        // it just returns false, so we check that the API was called
        expect(
          mockedAttendancesAPI.bulkUpdateAttendanceStatus
        ).toHaveBeenCalledWith([1, 2], "completed");
      });
    });
  });

  describe("Advanced Context Operations", () => {
    beforeEach(() => {
      mockedAttendancesAPI.getAttendancesByDate.mockResolvedValue(
        mockApiResponse
      );
      mockedAttendancesAPI.getNextAttendanceDate.mockResolvedValue({
        success: true,
        value: { next_date: "2025-01-15" },
      });
    });

    it("should manually set attendances data", async () => {
      render(
        <AttendancesProvider>
          <TestConsumer />
        </AttendancesProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });

      fireEvent.click(screen.getByTestId("set-attendances-btn"));

      await waitFor(() => {
        expect(screen.getByTestId("selected-date")).toHaveTextContent(
          "2025-01-15"
        );
      });
    });

    it("should trigger initialization and date loading cycles", async () => {
      mockedAttendancesAPI.getAttendancesByDate.mockResolvedValue({
        success: true,
        value: [],
      });

      render(
        <AttendancesProvider>
          <TestConsumer />
        </AttendancesProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });

      fireEvent.click(screen.getByTestId("init-date-btn"));
      fireEvent.click(screen.getByTestId("load-specific-date-btn"));

      await waitFor(() => {
        expect(mockedAttendancesAPI.getAttendancesByDate).toHaveBeenCalledWith(
          "2025-02-01"
        );
        expect(mockedAttendancesAPI.getNextAttendanceDate).toHaveBeenCalled();
      });
    });
  });

  describe("Phase 5: End-of-Day Workflow Integration", () => {
    it("should finalize end of day with backend integration", async () => {
      // Mock API responses
      mockedAttendancesAPI.getNextAttendanceDate.mockResolvedValue({
        success: true,
        value: { next_date: "2025-01-15" },
      });

      mockedAttendancesAPI.markAttendanceAsMissed.mockResolvedValue({
        success: true,
        value: {
          id: 1,
          patient_id: 1,
          type: AttendanceType.SPIRITUAL,
          status: AttendanceStatus.MISSED,
          scheduled_time: "08:00",
        } as AttendanceResponseDto,
      });

      mockedAttendancesAPI.getAttendancesByDate.mockResolvedValue({
        success: true,
        value: [
          {
            id: 1,
            patient_id: 1,
            type: AttendanceType.SPIRITUAL,
            status: AttendanceStatus.SCHEDULED,
            scheduled_date: "2025-01-15",
            scheduled_time: "08:00",
            checked_in_time: undefined,
            started_time: undefined,
            completed_time: undefined,
            created_at: "2025-01-15T00:00:00Z",
            updated_at: "2025-01-15T00:00:00Z",
            patient: {
              id: 1,
              name: "João Silva",
              birth_date: "1990-01-01",
              priority: PatientPriority.EMERGENCY,
              treatment_status: TreatmentStatus.IN_TREATMENT,
              start_date: "2025-01-01",
              missing_appointments_streak: 0,
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          },
          {
            id: 2,
            patient_id: 2,
            type: AttendanceType.SPIRITUAL,
            status: AttendanceStatus.CHECKED_IN,
            scheduled_time: "09:00",
            checked_in_time: "08:55",
            started_time: undefined,
            completed_time: undefined,
            scheduled_date: "2025-01-15",
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-01-01T00:00:00Z",
            patient: {
              id: 2,
              name: "Maria Santos",
              birth_date: "1985-05-15",
              priority: PatientPriority.INTERMEDIATE,
              treatment_status: TreatmentStatus.IN_TREATMENT,
              start_date: "2025-01-01",
              missing_appointments_streak: 0,
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          },
        ],
      });

      mockedAttendancesAPI.updateAttendance.mockResolvedValue({
        success: true,
        value: {
          id: 1,
          patient_id: 1,
          type: AttendanceType.SPIRITUAL,
          status: AttendanceStatus.CANCELLED,
          scheduled_date: "2025-01-15",
          scheduled_time: "08:00",
          checked_in_time: undefined,
          started_time: undefined,
          completed_time: undefined,
          created_at: "2025-01-15T08:00:00Z",
          updated_at: "2025-01-15T08:00:00Z",
        },
      });

      // Enhanced test consumer with finalizeEndOfDay button
      const TestConsumerWithFinalize = () => {
        const context = useAttendances();

        if (!context) return <div>No context</div>;

        return (
          <div>
            <div data-testid="attendances-data">
              {context.attendancesByDate ? "has-data" : "no-data"}
            </div>
            <button
              data-testid="finalize-end-of-day-btn"
              onClick={() => context.finalizeEndOfDay()}
            >
              Finalize End of Day
            </button>
          </div>
        );
      };

      render(
        <AttendancesProvider>
          <TestConsumerWithFinalize />
        </AttendancesProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("attendances-data")).toHaveTextContent(
          "has-data"
        );
      });

      // Execute finalize end of day
      fireEvent.click(screen.getByTestId("finalize-end-of-day-btn"));

      await waitFor(() => {
        // Verify backend calls for scheduled absences (should be marked as missed)
        expect(
          mockedAttendancesAPI.markAttendanceAsMissed
        ).toHaveBeenCalledWith("1", false, "");

        // Verify backend calls for incomplete attendances (should be rescheduled to SCHEDULED)
        expect(mockedAttendancesAPI.updateAttendance).toHaveBeenCalledWith(
          "2",
          {
            status: AttendanceStatus.SCHEDULED,
          }
        );

        // Verify backend calls for adding notes to unjustified absences
        expect(mockedAttendancesAPI.updateAttendance).toHaveBeenCalledWith(
          "1",
          {
            notes: "Falta não justificada",
          }
        );

        // Should call updateAttendance twice - once for reschedule, once for notes
        expect(mockedAttendancesAPI.updateAttendance).toHaveBeenCalledTimes(2);
      });
    });

    it("should handle finalize end of day errors gracefully", async () => {
      // Simplified approach: test that finalizeEndOfDay correctly handles errors by checking the return value and console logs
      mockedAttendancesAPI.getNextAttendanceDate.mockResolvedValue({
        success: true,
        value: { next_date: "2025-01-15" },
      });

      mockedAttendancesAPI.getAttendancesByDate.mockResolvedValue({
        success: true,
        value: [
          {
            id: 1,
            patient_id: 1,
            type: AttendanceType.SPIRITUAL,
            status: AttendanceStatus.CHECKED_IN, // This will trigger the error path
            scheduled_time: "08:00",
            checked_in_time: "08:05",
            started_time: undefined,
            completed_time: undefined,
            scheduled_date: "2025-01-15",
            created_at: "2025-01-15T08:00:00Z",
            updated_at: "2025-01-15T08:00:00Z",
            patient: {
              id: 1,
              name: "João Silva",
              priority: PatientPriority.EMERGENCY,
              treatment_status: TreatmentStatus.IN_TREATMENT,
              birth_date: "1990-01-01",
              start_date: "2025-01-01",
              missing_appointments_streak: 0,
              created_at: "2025-01-01T00:00:00Z",
              updated_at: "2025-01-01T00:00:00Z",
            },
          },
        ],
      });

      // Mock API error
      mockedAttendancesAPI.updateAttendance.mockRejectedValue(
        new Error("API Error")
      );

      // Create a test component that directly tests the finalizeEndOfDay function
      const TestConsumerWithFinalize = () => {
        const context = useAttendances();
        const [result, setResult] = useState<object | null>(null);
        const [errorOccurred, setErrorOccurred] = useState(false);

        if (!context) return <div>No context</div>;

        return (
          <div>
            <div data-testid="result">{JSON.stringify(result)}</div>
            <div data-testid="error-occurred">
              {errorOccurred ? "error-caught" : "no-error-caught"}
            </div>
            <button
              data-testid="finalize-end-of-day-btn"
              onClick={async () => {
                try {
                  const res = await context.finalizeEndOfDay();
                  setResult(res);
                } catch {
                  setErrorOccurred(true);
                }
              }}
            >
              Finalize End of Day
            </button>
          </div>
        );
      };

      // Spy on console.error to capture the error messages
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <AttendancesProvider>
          <TestConsumerWithFinalize />
        </AttendancesProvider>
      );

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByTestId("result")).toHaveTextContent("null");
      });

      // Execute finalize end of day with error
      fireEvent.click(screen.getByTestId("finalize-end-of-day-btn"));

      // Wait for the operation to complete and check that errors were logged
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error handling incomplete attendances:",
          expect.any(Error)
        );
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error finalizing end of day:",
          expect.any(Error)
        );
      });

      // The function should still return a result (doesn't throw to caller)
      await waitFor(() => {
        expect(screen.getByTestId("error-occurred")).toHaveTextContent(
          "no-error-caught"
        );
        expect(screen.getByTestId("result")).not.toHaveTextContent("null");
      });

      consoleSpy.mockRestore();
    });
  });
});
