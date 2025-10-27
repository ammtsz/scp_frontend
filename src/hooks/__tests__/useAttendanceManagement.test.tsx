/**
 * useAttendanceManagement Tests
 *
 * Test suite for the hybrid attendance management hook that combines
 * React Query (server state) and Zustand (UI state) to replace AttendancesContext.
 */

import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { useAttendanceManagement } from "../useAttendanceManagement";
import { useAttendanceStore } from "@/stores/attendanceStore";

// Mock the React Query hooks
jest.mock("@/hooks/useAttendanceQueries", () => ({
  useAttendancesByDate: jest.fn(() => ({
    data: {
      spiritual: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
      lightBath: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
      rod: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
    },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useNextAttendanceDate: jest.fn(() => ({
    data: "2024-01-15",
    isLoading: false,
  })),
  useCreateAttendance: jest.fn(() => ({
    mutateAsync: jest.fn(),
  })),
  useUpdateAttendance: jest.fn(() => ({
    mutateAsync: jest.fn(),
  })),
  useCompleteAttendance: jest.fn(() => ({
    mutateAsync: jest.fn(),
  })),
  useMarkAttendanceAsMissed: jest.fn(() => ({
    mutateAsync: jest.fn(),
  })),
  useBulkUpdateAttendanceStatus: jest.fn(() => ({
    mutateAsync: jest.fn().mockResolvedValue({ success: true }),
  })),
  useDeleteAttendance: jest.fn(() => ({
    mutateAsync: jest.fn(),
  })),
  useCheckInAttendance: jest.fn(() => ({
    mutateAsync: jest.fn(),
  })),
  useHandleIncompleteAttendances: jest.fn(() => ({
    mutateAsync: jest.fn().mockResolvedValue({ success: true }),
  })),
  useHandleAbsenceJustifications: jest.fn(() => ({
    mutateAsync: jest.fn().mockResolvedValue({ success: true }),
  })),
  useRefreshAttendances: jest.fn(() => jest.fn()),
}));

describe("useAttendanceManagement", () => {
  let queryClient: QueryClient;

  const createWrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Reset Zustand store
    useAttendanceStore.getState().resetState();
  });

  it("should provide attendance data from React Query", async () => {
    const { result } = renderHook(() => useAttendanceManagement(), {
      wrapper: createWrapper,
    });

    expect(result.current.attendancesByDate).toBeDefined();
    expect(result.current.attendancesByDate?.spiritual).toBeDefined();
    expect(result.current.attendancesByDate?.lightBath).toBeDefined();
    expect(result.current.attendancesByDate?.rod).toBeDefined();
  });

  it("should provide UI state from Zustand store", () => {
    const { result } = renderHook(() => useAttendanceManagement(), {
      wrapper: createWrapper,
    });

    expect(result.current.selectedDate).toBe(
      new Date().toISOString().slice(0, 10)
    );
    expect(result.current.loading).toBe(false);
    expect(result.current.dataLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.dayFinalized).toBe(false);
  });

  it("should update selected date via Zustand action", () => {
    const { result } = renderHook(() => useAttendanceManagement(), {
      wrapper: createWrapper,
    });

    const newDate = "2024-02-15";

    act(() => {
      result.current.setSelectedDate(newDate);
    });

    expect(result.current.selectedDate).toBe(newDate);
  });

  it("should handle bulk status updates", async () => {
    const { result } = renderHook(() => useAttendanceManagement(), {
      wrapper: createWrapper,
    });

    const success = await result.current.bulkUpdateStatus(
      [1, 2, 3],
      "completed"
    );
    expect(success).toBe(true);
  });

  it("should handle incomplete attendances", async () => {
    const { result } = renderHook(() => useAttendanceManagement(), {
      wrapper: createWrapper,
    });

    const incompleteAttendances = [
      {
        attendanceId: 1,
        name: "Patient 1",
        priority: "2" as const,
        patientName: "Patient 1",
      },
    ];

    const success = await result.current.handleIncompleteAttendances(
      incompleteAttendances,
      "complete"
    );
    expect(success).toBe(true);
  });

  it("should handle absence justifications", async () => {
    const { result } = renderHook(() => useAttendanceManagement(), {
      wrapper: createWrapper,
    });

    const justifications = [
      {
        attendanceId: 1,
        patientName: "Patient 1",
        justified: true,
        notes: "Called to reschedule",
      },
    ];

    const success = await result.current.handleAbsenceJustifications(
      justifications
    );
    expect(success).toBe(true);
  });

  it("should check end-of-day status", () => {
    const { result } = renderHook(() => useAttendanceManagement(), {
      wrapper: createWrapper,
    });

    const status = result.current.checkEndOfDayStatus();
    expect(status.type).toBe("completed"); // Empty data means completed
  });

  it("should provide compatibility methods", () => {
    const { result } = renderHook(() => useAttendanceManagement(), {
      wrapper: createWrapper,
    });

    // Test compatibility method (should not throw)
    expect(() => {
      result.current.setAttendancesByDate(null);
    }).not.toThrow();

    expect(typeof result.current.loadAttendancesByDate).toBe("function");
    expect(typeof result.current.initializeSelectedDate).toBe("function");
    expect(typeof result.current.refreshCurrentDate).toBe("function");
    expect(typeof result.current.finalizeEndOfDay).toBe("function");
  });

  it("should maintain API compatibility with original Context", () => {
    const { result } = renderHook(() => useAttendanceManagement(), {
      wrapper: createWrapper,
    });

    // Verify all expected properties exist
    const expectedProperties = [
      "attendancesByDate",
      "selectedDate",
      "loading",
      "dataLoading",
      "error",
      "dayFinalized",
      "endOfDayStatus",
      "setSelectedDate",
      "setAttendancesByDate",
      "loadAttendancesByDate",
      "bulkUpdateStatus",
      "initializeSelectedDate",
      "refreshCurrentDate",
      "checkEndOfDayStatus",
      "finalizeEndOfDay",
      "handleIncompleteAttendances",
      "handleAbsenceJustifications",
    ];

    expectedProperties.forEach((prop) => {
      expect(result.current).toHaveProperty(prop);
    });
  });

  it("should initialize selected date from next available date", async () => {
    const { result } = renderHook(() => useAttendanceManagement(), {
      wrapper: createWrapper,
    });

    await waitFor(() => {
      result.current.initializeSelectedDate();
    });

    // Should use the mocked next date
    expect(result.current.selectedDate).toBe("2024-01-15");
  });
});
