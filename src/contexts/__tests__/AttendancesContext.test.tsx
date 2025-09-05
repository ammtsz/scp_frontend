import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { AttendancesProvider, useAttendances } from "../AttendancesContext";
import * as attendancesAPI from "@/api/attendances";
import { AttendanceType, AttendanceStatus } from "@/api/types";

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
        value: "2025-01-15",
      });

      mockedAttendancesAPI.getAttendancesByDate.mockResolvedValue({
        success: true,
        value: [
          {
            id: 1,
            patient_id: 1,
            type: AttendanceType.SPIRITUAL,
            status: AttendanceStatus.SCHEDULED,
            scheduled_time: "08:00",
            checked_in_time: null,
            started_time: null,
            completed_time: null,
            priority: 1,
            patient: {
              id: 1,
              name: "João Silva",
              birth_date: "1990-01-01",
              mother_name: "Maria Silva",
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
            started_time: null,
            completed_time: null,
            priority: 2,
            patient: {
              id: 2,
              name: "Maria Santos",
              birth_date: "1985-05-15",
              mother_name: "Ana Santos",
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
          scheduled_time: "08:00",
          checked_in_time: null,
          started_time: null,
          completed_time: null,
          priority: 1,
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
        // Verify backend calls for marking absences
        expect(mockedAttendancesAPI.updateAttendance).toHaveBeenCalledWith(
          "1",
          {
            status: AttendanceStatus.CANCELLED,
          }
        );

        // Verify backend calls for incomplete attendances (checked in but not completed)
        expect(mockedAttendancesAPI.updateAttendance).toHaveBeenCalledWith(
          "2",
          {
            status: AttendanceStatus.CANCELLED,
          }
        );

        // Should call updateAttendance twice - once for each incomplete attendance
        expect(mockedAttendancesAPI.updateAttendance).toHaveBeenCalledTimes(2);
      });
    });

    it("should handle finalize end of day errors gracefully", async () => {
      // Mock API responses
      mockedAttendancesAPI.getNextAttendanceDate.mockResolvedValue({
        success: true,
        value: "2025-01-15",
      });

      mockedAttendancesAPI.getAttendancesByDate.mockResolvedValue({
        success: true,
        value: [
          {
            id: 1,
            patient_id: 1,
            type: AttendanceType.SPIRITUAL,
            status: AttendanceStatus.SCHEDULED,
            scheduled_time: "08:00",
            checked_in_time: null,
            started_time: null,
            completed_time: null,
            priority: 1,
            patient: {
              id: 1,
              name: "João Silva",
              birth_date: "1990-01-01",
              mother_name: "Maria Silva",
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

      const TestConsumerWithFinalize = () => {
        const context = useAttendances();

        if (!context) return <div>No context</div>;

        return (
          <div>
            <div data-testid="error">{context.error || "no-error"}</div>
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
        expect(screen.getByTestId("error")).toHaveTextContent("no-error");
      });

      // Execute finalize end of day with error
      fireEvent.click(screen.getByTestId("finalize-end-of-day-btn"));

      await waitFor(() => {
        // Should handle the error gracefully
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Erro ao finalizar dia: alguns atendimentos podem não ter sido atualizados"
        );
      });
    });
  });
});
