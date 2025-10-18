import React from "react";
import { renderHook, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AgendaProvider, useAgenda } from "../AgendaContext";
import {
  getAttendancesForAgenda,
  deleteAttendance,
  createAttendance,
} from "@/api/attendances";
import { AttendanceType, AttendanceStatus } from "@/api/types";

// Mock the API functions
jest.mock("@/api/attendances");

const mockGetAttendancesForAgenda =
  getAttendancesForAgenda as jest.MockedFunction<
    typeof getAttendancesForAgenda
  >;
const mockDeleteAttendance = deleteAttendance as jest.MockedFunction<
  typeof deleteAttendance
>;
const mockCreateAttendance = createAttendance as jest.MockedFunction<
  typeof createAttendance
>;

// Mock data
const mockAttendances = [
  {
    id: 1,
    patient_id: 1,
    type: AttendanceType.SPIRITUAL,
    status: AttendanceStatus.SCHEDULED,
    scheduled_date: "2025-08-08",
    patient_name: "João Silva",
    patient_priority: "1",
    notes: "Test attendance",
  },
  {
    id: 2,
    patient_id: 2,
    type: AttendanceType.LIGHT_BATH,
    status: AttendanceStatus.SCHEDULED,
    scheduled_date: "2025-08-09",
    patient_name: "Maria Santos",
    patient_priority: "2",
    notes: "Test attendance 2",
  },
];

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AgendaProvider>{children}</AgendaProvider>
);

describe("AgendaContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAttendancesForAgenda.mockResolvedValue({
      success: true,
      value: mockAttendances,
    });
  });

  describe("AgendaProvider", () => {
    it("should load agenda on mount", async () => {
      const { result } = renderHook(() => useAgenda(), { wrapper });

      // Wait for initial load
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockGetAttendancesForAgenda).toHaveBeenCalledWith({
        status: "scheduled",
      });
      expect(result.current.agenda.spiritual).toHaveLength(1);
      expect(result.current.agenda.lightBath).toHaveLength(1);
      expect(result.current.loading).toBe(false);
    });

    it("should handle API errors gracefully", async () => {
      mockGetAttendancesForAgenda.mockResolvedValue({
        success: false,
        error: "API Error",
      });

      const { result } = renderHook(() => useAgenda(), { wrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.error).toBe("Erro ao carregar agenda");
      expect(result.current.agenda.spiritual).toHaveLength(0);
      expect(result.current.agenda.lightBath).toHaveLength(0);
    });
  });

  describe("loadAgendaAttendances", () => {
    it("should load attendances with filters", async () => {
      const { result } = renderHook(() => useAgenda(), { wrapper });

      await act(async () => {
        const attendances = await result.current.loadAgendaAttendances({
          type: "spiritual",
          limit: 10,
        });
        expect(attendances).toEqual(mockAttendances);
      });

      expect(mockGetAttendancesForAgenda).toHaveBeenCalledWith({
        type: "spiritual",
        limit: 10,
      });
    });

    it("should set error state when API fails", async () => {
      const apiError = new Error("Network error");
      mockGetAttendancesForAgenda.mockRejectedValue(apiError);

      const { result } = renderHook(() => useAgenda(), { wrapper });

      await act(async () => {
        await result.current.refreshAgenda();
      });

      expect(result.current.error).toBe("Erro ao carregar agenda");
      expect(result.current.loading).toBe(false);
    });
  });

  describe("refreshAgenda", () => {
    it("should refresh agenda data", async () => {
      const { result } = renderHook(() => useAgenda(), { wrapper });

      // Initial load
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Clear mocks and setup new data
      jest.clearAllMocks();
      const newMockData = [
        {
          id: 3,
          patient_id: 3,
          type: AttendanceType.SPIRITUAL,
          status: AttendanceStatus.SCHEDULED,
          scheduled_date: "2025-08-10",
          patient_name: "Pedro Oliveira",
          patient_priority: "3",
          notes: "New attendance",
        },
      ];
      mockGetAttendancesForAgenda.mockResolvedValue({
        success: true,
        value: newMockData,
      });

      await act(async () => {
        await result.current.refreshAgenda();
      });

      expect(mockGetAttendancesForAgenda).toHaveBeenCalledWith({
        status: "scheduled",
      });
      expect(result.current.agenda.spiritual).toHaveLength(1);
      expect(result.current.agenda.spiritual[0].patients[0].name).toBe(
        "Pedro Oliveira"
      );
    });

    it("should set loading state during refresh", async () => {
      const { result } = renderHook(() => useAgenda(), { wrapper });

      let loadingDuringRefresh = false;

      await act(async () => {
        const refreshPromise = result.current.refreshAgenda();
        loadingDuringRefresh = result.current.loading;
        await refreshPromise;
      });

      expect(loadingDuringRefresh).toBe(true);
      expect(result.current.loading).toBe(false);
    });
  });

  describe("removePatientFromAgenda", () => {
    it("should successfully remove patient", async () => {
      mockDeleteAttendance.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useAgenda(), { wrapper });

      await act(async () => {
        const success = await result.current.removePatientFromAgenda(1);
        expect(success).toBe(true);
      });

      expect(mockDeleteAttendance).toHaveBeenCalledWith("1");
      expect(mockGetAttendancesForAgenda).toHaveBeenCalledTimes(2); // Initial load + refresh
    });

    it("should handle removal failure", async () => {
      mockDeleteAttendance.mockResolvedValue({
        success: false,
        error: "Attendance not found",
      });

      const { result } = renderHook(() => useAgenda(), { wrapper });

      await act(async () => {
        const success = await result.current.removePatientFromAgenda(999);
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe("Attendance not found");
    });
  });

  describe("addPatientToAgenda", () => {
    it("should successfully add patient", async () => {
      mockCreateAttendance.mockResolvedValue({
        success: true,
        value: {
          id: 4,
          patient_id: 4,
          type: AttendanceType.SPIRITUAL,
          status: AttendanceStatus.SCHEDULED,
          scheduled_date: "2025-08-11",
          scheduled_time: "21:00",
          notes: "New patient",
          created_at: "2025-08-11T21:00:00Z",
          updated_at: "2025-08-11T21:00:00Z",
        },
      });

      const { result } = renderHook(() => useAgenda(), { wrapper });

      const attendanceData = {
        patient_id: 4,
        type: AttendanceType.SPIRITUAL,
        scheduled_date: "2025-08-11",
        scheduled_time: "21:00",
        notes: "New patient",
      };

      await act(async () => {
        const success = await result.current.addPatientToAgenda(attendanceData);
        expect(success).toBe(true);
      });

      expect(mockCreateAttendance).toHaveBeenCalledWith(attendanceData);
      expect(mockGetAttendancesForAgenda).toHaveBeenCalledTimes(2); // Initial load + refresh
    });

    it("should handle creation failure", async () => {
      mockCreateAttendance.mockResolvedValue({
        success: false,
        error: "Patient already scheduled",
      });

      const { result } = renderHook(() => useAgenda(), { wrapper });

      const attendanceData = {
        patient_id: 1,
        type: AttendanceType.SPIRITUAL,
        scheduled_date: "2025-08-08",
        scheduled_time: "21:00",
        notes: "Duplicate attendance",
      };

      await act(async () => {
        const success = await result.current.addPatientToAgenda(attendanceData);
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe("Patient already scheduled");
    });
  });

  describe("data transformation", () => {
    it("should correctly transform backend data to frontend format", async () => {
      const { result } = renderHook(() => useAgenda(), { wrapper });

      // Wait for initial load
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Check spiritual attendance
      expect(result.current.agenda.spiritual).toHaveLength(1);
      expect(result.current.agenda.spiritual[0]).toMatchObject({
        date: expect.any(Date),
        patients: [
          {
            id: "1",
            name: "João Silva",
            priority: "1",
            attendanceId: 1,
            attendanceType: "spiritual",
          },
        ],
      });

      // Check light bath attendance
      expect(result.current.agenda.lightBath).toHaveLength(1);
      expect(result.current.agenda.lightBath[0]).toMatchObject({
        date: expect.any(Date),
        patients: [
          {
            id: "2",
            name: "Maria Santos",
            priority: "2",
            attendanceId: 2,
            attendanceType: "lightBath",
          },
        ],
      });
    });

    it("should group patients by date and type correctly", async () => {
      const multipleAttendances = [
        {
          id: 1,
          patient_id: 1,
          type: AttendanceType.SPIRITUAL,
          status: AttendanceStatus.SCHEDULED,
          scheduled_date: "2025-08-08",
          patient_name: "João Silva",
          patient_priority: "1",
        },
        {
          id: 2,
          patient_id: 2,
          type: AttendanceType.SPIRITUAL,
          status: AttendanceStatus.SCHEDULED,
          scheduled_date: "2025-08-08",
          patient_name: "Maria Santos",
          patient_priority: "2",
        },
        {
          id: 3,
          patient_id: 3,
          type: AttendanceType.SPIRITUAL,
          status: AttendanceStatus.SCHEDULED,
          scheduled_date: "2025-08-09",
          patient_name: "Pedro Oliveira",
          patient_priority: "3",
        },
      ];

      mockGetAttendancesForAgenda.mockResolvedValue({
        success: true,
        value: multipleAttendances,
      });

      const { result } = renderHook(() => useAgenda(), { wrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Check that patients are grouped by date
      expect(result.current.agenda.spiritual).toHaveLength(2); // Two different dates

      // First date should have 2 patients
      const firstDateItem = result.current.agenda.spiritual.find(
        (item) => item.date.toISOString().split("T")[0] === "2025-08-08"
      );
      expect(firstDateItem?.patients).toHaveLength(2);

      // Second date should have 1 patient
      const secondDateItem = result.current.agenda.spiritual.find(
        (item) => item.date.toISOString().split("T")[0] === "2025-08-09"
      );
      expect(secondDateItem?.patients).toHaveLength(1);
    });
  });

  describe("error handling", () => {
    it("should handle network errors", async () => {
      mockGetAttendancesForAgenda.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAgenda(), { wrapper });

      await act(async () => {
        await result.current.refreshAgenda();
      });

      expect(result.current.error).toBe("Erro ao carregar agenda");
      expect(result.current.loading).toBe(false);
    });

    it("should handle removal errors gracefully", async () => {
      mockDeleteAttendance.mockRejectedValue(new Error("Delete failed"));

      const { result } = renderHook(() => useAgenda(), { wrapper });

      await act(async () => {
        const success = await result.current.removePatientFromAgenda(1);
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe("Delete failed");
    });

    it("should handle creation errors gracefully", async () => {
      mockCreateAttendance.mockRejectedValue(new Error("Create failed"));

      const { result } = renderHook(() => useAgenda(), { wrapper });

      const attendanceData = {
        patient_id: 1,
        type: AttendanceType.SPIRITUAL,
        scheduled_date: "2025-08-08",
        scheduled_time: "21:00",
        notes: "Test",
      };

      await act(async () => {
        const success = await result.current.addPatientToAgenda(attendanceData);
        expect(success).toBe(false);
      });

      expect(result.current.error).toBe("Create failed");
    });
  });
});
