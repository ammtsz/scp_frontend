/**
 * useAttendanceQueries Tests
 *
 * Comprehensive test suite for all attendance-related React Query hooks
 * including server state management, CRUD operations, and end-of-day workflow.
 */

import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import {
  useAttendancesByDate,
  useNextAttendanceDate,
  useCreateAttendance,
  useUpdateAttendance,
  useCompleteAttendance,
  useMarkAttendanceAsMissed,
  useBulkUpdateAttendanceStatus,
  useDeleteAttendance,
  useCheckInAttendance,
  useRefreshAttendances,
  useHandleIncompleteAttendances,
  useHandleAbsenceJustifications,
  attendanceKeys,
} from "../useAttendanceQueries";
import * as attendancesApi from "@/api/attendances";
import { AttendanceType } from "@/types/types";
import { AttendanceStatus as ApiAttendanceStatus } from "@/api/types";

// Mock the API
jest.mock("@/api/attendances");
const mockApi = attendancesApi as jest.Mocked<typeof attendancesApi>;

// Mock transformers
jest.mock("@/utils/apiTransformers", () => ({
  transformAttendanceWithPatientByDate: jest.fn(() => ({
    spiritual: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
    lightBath: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
    rod: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
  })),
}));

describe("useAttendanceQueries", () => {
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
    jest.clearAllMocks();
  });

  describe("useAttendancesByDate", () => {
    it("should fetch attendances for a specific date", async () => {
      const mockDate = "2024-01-15";
      const mockResponse = {
        success: true,
        value: [
          {
            id: 1,
            patient_name: "Test Patient",
            status: "scheduled",
            attendance_type: "spiritual",
          },
        ],
      };

      mockApi.getAttendancesByDate.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAttendancesByDate(mockDate), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApi.getAttendancesByDate).toHaveBeenCalledWith(mockDate);
      expect(result.current.data).toBeDefined();
    });

    it("should handle fetch errors gracefully", async () => {
      const mockDate = "2024-01-15";
      mockApi.getAttendancesByDate.mockResolvedValue({
        success: false,
        error: "Database error",
      });

      const { result } = renderHook(() => useAttendancesByDate(mockDate), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe("useNextAttendanceDate", () => {
    it("should fetch next attendance date", async () => {
      const mockResponse = {
        success: true,
        value: { next_date: "2024-01-16" },
      };

      mockApi.getNextAttendanceDate.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useNextAttendanceDate(), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBe("2024-01-16");
    });

    it("should fallback to today when no next date available", async () => {
      mockApi.getNextAttendanceDate.mockResolvedValue({
        success: true,
        value: null,
      });

      const { result } = renderHook(() => useNextAttendanceDate(), {
        wrapper: createWrapper,
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toMatch(/\d{4}-\d{2}-\d{2}/); // Today's date format
    });
  });

  describe("useCreateAttendance", () => {
    it("should create new attendance successfully", async () => {
      const mockResponse = {
        success: true,
        value: { id: 123, patient_id: 1, attendance_type: "spiritual" },
      };

      mockApi.createAttendance.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateAttendance(), {
        wrapper: createWrapper,
      });

      const createParams = {
        patientId: 1,
        attendanceType: "spiritual" as AttendanceType,
        scheduledDate: "2024-01-15",
      };

      await waitFor(async () => {
        await result.current.mutateAsync(createParams);
      });

      expect(mockApi.createAttendance).toHaveBeenCalledWith({
        patient_id: 1,
        type: "spiritual",
        scheduled_date: "2024-01-15",
        scheduled_time: "09:00",
      });
    });

    it("should handle creation errors", async () => {
      mockApi.createAttendance.mockResolvedValue({
        success: false,
        error: "Patient not found",
      });

      const { result } = renderHook(() => useCreateAttendance(), {
        wrapper: createWrapper,
      });

      const createParams = {
        patientId: 999,
        attendanceType: "spiritual" as AttendanceType,
      };

      await expect(result.current.mutateAsync(createParams)).rejects.toThrow(
        "Patient not found"
      );
    });
  });

  describe("useUpdateAttendance", () => {
    it("should update attendance status", async () => {
      const mockResponse = {
        success: true,
        value: { id: "123", status: "checked_in" },
      };

      mockApi.updateAttendance.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUpdateAttendance(), {
        wrapper: createWrapper,
      });

      const updateParams = {
        id: "123",
        status: ApiAttendanceStatus.CHECKED_IN,
      };

      await waitFor(async () => {
        await result.current.mutateAsync(updateParams);
      });

      expect(mockApi.updateAttendance).toHaveBeenCalledWith("123", {
        status: ApiAttendanceStatus.CHECKED_IN,
        absence_justified: undefined,
        absence_notes: undefined,
      });
    });
  });

  describe("useCompleteAttendance", () => {
    it("should complete attendance", async () => {
      const mockResponse = {
        success: true,
        value: { id: "123", status: "completed" },
      };

      mockApi.completeAttendance.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCompleteAttendance(), {
        wrapper: createWrapper,
      });

      await waitFor(async () => {
        await result.current.mutateAsync({ id: "123" });
      });

      expect(mockApi.completeAttendance).toHaveBeenCalledWith("123");
    });
  });

  describe("useMarkAttendanceAsMissed", () => {
    it("should mark attendance as missed with justification", async () => {
      const mockResponse = {
        success: true,
        value: { id: "123", status: "missed" },
      };

      mockApi.markAttendanceAsMissed.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useMarkAttendanceAsMissed(), {
        wrapper: createWrapper,
      });

      const missedParams = {
        id: "123",
        justified: true,
        notes: "Patient called to reschedule",
      };

      await waitFor(async () => {
        await result.current.mutateAsync(missedParams);
      });

      expect(mockApi.markAttendanceAsMissed).toHaveBeenCalledWith(
        "123",
        true,
        "Patient called to reschedule"
      );
    });
  });

  describe("useBulkUpdateAttendanceStatus", () => {
    it("should update multiple attendances at once", async () => {
      mockApi.bulkUpdateAttendanceStatus.mockResolvedValue(undefined);

      const { result } = renderHook(() => useBulkUpdateAttendanceStatus(), {
        wrapper: createWrapper,
      });

      const bulkParams = {
        ids: [1, 2, 3],
        status: "completed",
      };

      await waitFor(async () => {
        await result.current.mutateAsync(bulkParams);
      });

      expect(mockApi.bulkUpdateAttendanceStatus).toHaveBeenCalledWith(
        [1, 2, 3],
        "completed"
      );
    });
  });

  describe("useDeleteAttendance", () => {
    it("should delete attendance", async () => {
      const mockResponse = {
        success: true,
        value: { deleted: true },
      };

      mockApi.deleteAttendance.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useDeleteAttendance(), {
        wrapper: createWrapper,
      });

      await waitFor(async () => {
        await result.current.mutateAsync(123);
      });

      expect(mockApi.deleteAttendance).toHaveBeenCalledWith("123");
    });
  });

  describe("useCheckInAttendance", () => {
    it("should check in attendance (alias for status update)", async () => {
      const mockResponse = {
        success: true,
        value: { id: "123", status: "checked_in" },
      };

      mockApi.updateAttendance.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCheckInAttendance(), {
        wrapper: createWrapper,
      });

      const checkInParams = {
        attendanceId: 123,
        patientName: "Test Patient",
      };

      await waitFor(async () => {
        await result.current.mutateAsync(checkInParams);
      });

      expect(mockApi.updateAttendance).toHaveBeenCalledWith("123", {
        status: ApiAttendanceStatus.CHECKED_IN,
        absence_justified: undefined,
        absence_notes: undefined,
      });
    });
  });

  describe("useRefreshAttendances", () => {
    it("should invalidate queries for specific date", () => {
      const { result } = renderHook(() => useRefreshAttendances(), {
        wrapper: createWrapper,
      });

      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
      const testDate = "2024-01-15";

      result.current(testDate);

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: attendanceKeys.byDate(testDate),
      });
    });

    it("should invalidate all attendance queries when no date provided", () => {
      const { result } = renderHook(() => useRefreshAttendances(), {
        wrapper: createWrapper,
      });

      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      result.current();

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: attendanceKeys.all,
      });
    });
  });

  describe("useHandleIncompleteAttendances", () => {
    it("should handle incomplete attendances by completing them", async () => {
      mockApi.completeAttendance.mockResolvedValue({
        success: true,
        value: { status: "completed" },
      });

      const { result } = renderHook(() => useHandleIncompleteAttendances(), {
        wrapper: createWrapper,
      });

      const incompleteAttendances = [
        { attendanceId: 1, patientName: "Patient 1" },
        { attendanceId: 2, patientName: "Patient 2" },
      ];

      const params = {
        attendances: incompleteAttendances,
        action: "complete" as const,
      };

      await waitFor(async () => {
        await result.current.mutateAsync(params);
      });

      expect(mockApi.completeAttendance).toHaveBeenCalledTimes(2);
      expect(mockApi.completeAttendance).toHaveBeenCalledWith("1");
      expect(mockApi.completeAttendance).toHaveBeenCalledWith("2");
    });

    it("should handle incomplete attendances by rescheduling them", async () => {
      mockApi.updateAttendance.mockResolvedValue({
        success: true,
        value: { status: "scheduled" },
      });

      const { result } = renderHook(() => useHandleIncompleteAttendances(), {
        wrapper: createWrapper,
      });

      const incompleteAttendances = [
        { attendanceId: 1, patientName: "Patient 1" },
      ];

      const params = {
        attendances: incompleteAttendances,
        action: "reschedule" as const,
      };

      await waitFor(async () => {
        await result.current.mutateAsync(params);
      });

      expect(mockApi.updateAttendance).toHaveBeenCalledWith("1", {
        status: ApiAttendanceStatus.SCHEDULED,
        absence_justified: undefined,
        absence_notes: undefined,
      });
    });
  });

  describe("useHandleAbsenceJustifications", () => {
    it("should handle justified and unjustified absences", async () => {
      mockApi.updateAttendance.mockResolvedValue({
        success: true,
        value: { status: "missed" },
      });
      mockApi.markAttendanceAsMissed.mockResolvedValue({
        success: true,
        value: { status: "missed" },
      });

      const { result } = renderHook(() => useHandleAbsenceJustifications(), {
        wrapper: createWrapper,
      });

      const justifications = [
        {
          attendanceId: 1,
          patientName: "Patient 1",
          justified: true,
          notes: "Called to reschedule",
        },
        {
          attendanceId: 2,
          patientName: "Patient 2",
          justified: false,
          notes: "No show",
        },
      ];

      await waitFor(async () => {
        await result.current.mutateAsync(justifications);
      });

      // Justified absence
      expect(mockApi.updateAttendance).toHaveBeenCalledWith("1", {
        absence_justified: true,
        absence_notes: "Called to reschedule",
        status: ApiAttendanceStatus.MISSED,
      });

      // Unjustified absence
      expect(mockApi.markAttendanceAsMissed).toHaveBeenCalledWith(
        "2",
        false,
        "No show"
      );
    });
  });

  describe("Query Keys Factory", () => {
    it("should generate consistent query keys", () => {
      expect(attendanceKeys.all).toEqual(["attendances"]);
      expect(attendanceKeys.byDate("2024-01-15")).toEqual([
        "attendances",
        "byDate",
        "2024-01-15",
      ]);
      expect(attendanceKeys.nextDate()).toEqual(["attendances", "nextDate"]);
    });
  });
});
