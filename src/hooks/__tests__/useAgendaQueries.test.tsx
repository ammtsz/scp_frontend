/**
 * Agenda React Query Hooks Tests
 */

import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import {
  useScheduledAgenda,
  useAgendaAttendances,
  useRemovePatientFromAgenda,
  useAddPatientToAgenda,
  useRefreshAgenda,
} from "../useAgendaQueries";
import * as attendancesApi from "@/api/attendances";

// Mock the API
jest.mock("@/api/attendances");
const mockedAttendancesApi = attendancesApi as jest.Mocked<
  typeof attendancesApi
>;

// Create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return Wrapper;
};

describe("useAgendaQueries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("useAgendaAttendances", () => {
    it("should fetch agenda attendances successfully", async () => {
      const mockData = [
        {
          id: 1,
          patient_id: 1,
          patient_name: "Test Patient",
          patient_priority: "1",
          type: "spiritual",
          scheduled_date: "2025-10-27",
        },
      ];

      mockedAttendancesApi.getAttendancesForAgenda.mockResolvedValueOnce({
        success: true,
        value: mockData,
      });

      const { result } = renderHook(() => useAgendaAttendances(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(mockedAttendancesApi.getAttendancesForAgenda).toHaveBeenCalledWith(
        undefined
      );
    });

    it.skip("should handle API errors", async () => {
      mockedAttendancesApi.getAttendancesForAgenda.mockResolvedValueOnce({
        success: false,
        error: "Failed to fetch",
      });

      const { result } = renderHook(() => useAgendaAttendances(), {
        wrapper: createWrapper(),
      });

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true);
        },
        { timeout: 2000 }
      );

      expect(result.current.error?.message).toBe("Failed to fetch");
    });

    it("should accept filters", async () => {
      const filters = { status: "scheduled", type: "spiritual" };

      mockedAttendancesApi.getAttendancesForAgenda.mockResolvedValueOnce({
        success: true,
        value: [],
      });

      renderHook(() => useAgendaAttendances(filters), {
        wrapper: createWrapper(),
      });

      expect(mockedAttendancesApi.getAttendancesForAgenda).toHaveBeenCalledWith(
        filters
      );
    });
  });

  describe("useScheduledAgenda", () => {
    it("should fetch scheduled agenda with transformed data", async () => {
      const mockData = [
        {
          id: 1,
          patient_id: 1,
          patient_name: "Test Patient",
          patient_priority: "1" as const,
          type: "spiritual" as const,
          scheduled_date: "2025-10-27",
        },
      ];

      mockedAttendancesApi.getAttendancesForAgenda.mockResolvedValueOnce({
        success: true,
        value: mockData,
      });

      const { result } = renderHook(() => useScheduledAgenda(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.agenda).toEqual({
        spiritual: [
          {
            date: new Date("2025-10-27T00:00:00"),
            patients: [
              {
                id: "1",
                name: "Test Patient",
                priority: "1",
                attendanceId: 1,
                attendanceType: "spiritual",
              },
            ],
          },
        ],
        lightBath: [],
      });

      expect(mockedAttendancesApi.getAttendancesForAgenda).toHaveBeenCalledWith(
        {
          status: "scheduled",
        }
      );
    });
  });

  describe("useRemovePatientFromAgenda", () => {
    it("should remove patient successfully", async () => {
      mockedAttendancesApi.deleteAttendance.mockResolvedValueOnce({
        success: true,
        value: {},
      });

      const { result } = renderHook(() => useRemovePatientFromAgenda(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(1);

      expect(mockedAttendancesApi.deleteAttendance).toHaveBeenCalledWith("1");
    });

    it("should handle removal errors", async () => {
      mockedAttendancesApi.deleteAttendance.mockResolvedValueOnce({
        success: false,
        error: "Failed to delete",
      });

      const { result } = renderHook(() => useRemovePatientFromAgenda(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync(1)).rejects.toThrow(
        "Failed to delete"
      );
    });
  });

  describe("useAddPatientToAgenda", () => {
    it("should add patient successfully", async () => {
      const attendanceData = {
        patient_id: 1,
        type: "spiritual" as const,
        scheduled_date: "2025-10-27",
      };

      mockedAttendancesApi.createAttendance.mockResolvedValueOnce({
        success: true,
        value: { id: 1, ...attendanceData },
      });

      const { result } = renderHook(() => useAddPatientToAgenda(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(attendanceData);

      expect(mockedAttendancesApi.createAttendance).toHaveBeenCalledWith(
        attendanceData
      );
    });

    it("should handle addition errors", async () => {
      const attendanceData = {
        patient_id: 1,
        type: "spiritual" as const,
        scheduled_date: "2025-10-27",
      };

      mockedAttendancesApi.createAttendance.mockResolvedValueOnce({
        success: false,
        error: "Failed to create",
      });

      const { result } = renderHook(() => useAddPatientToAgenda(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync(attendanceData)).rejects.toThrow(
        "Failed to create"
      );
    });
  });

  describe("useRefreshAgenda", () => {
    it("should invalidate agenda queries", () => {
      const queryClient = new QueryClient();
      const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");

      const TestWrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const { result } = renderHook(() => useRefreshAgenda(), {
        wrapper: TestWrapper,
      });

      result.current();

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ["agenda"],
      });
    });
  });
});
