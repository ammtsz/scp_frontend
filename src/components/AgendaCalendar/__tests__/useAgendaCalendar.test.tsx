import React from "react";
import { renderHook, act } from "@testing-library/react";
import { useAgendaCalendar } from "../useAgendaCalendar";
import { AgendaProvider } from "@/contexts/AgendaContext";
import { PatientsProvider } from "@/contexts/PatientsContext";
import {
  getAttendancesForAgenda,
  deleteAttendance,
  createAttendance,
} from "@/api/attendances";
import { getNextAttendanceDate } from "@/api/attendances";
import { getPatients } from "@/api/patients";
import {
  AttendanceType,
  AttendanceStatus,
  PatientPriority,
  TreatmentStatus,
} from "@/api/types";

// Mock dependencies
jest.mock("@/api/attendances");
jest.mock("@/api/patients");

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
const mockGetNextAttendanceDate = getNextAttendanceDate as jest.MockedFunction<
  typeof getNextAttendanceDate
>;
const mockGetPatients = getPatients as jest.MockedFunction<typeof getPatients>;

// Create wrapper with all required providers
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AgendaProvider>
    <PatientsProvider>{children}</PatientsProvider>
  </AgendaProvider>
);

describe("useAgendaCalendar Hook", () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Mock attendances API
    mockGetAttendancesForAgenda.mockResolvedValue({
      success: true,
      value: mockAttendances,
    });

    mockDeleteAttendance.mockResolvedValue({
      success: true,
      value: undefined,
    });

    mockCreateAttendance.mockResolvedValue({
      success: true,
      value: {
        id: 3,
        patient_id: 1,
        type: AttendanceType.SPIRITUAL,
        status: AttendanceStatus.SCHEDULED,
        scheduled_date: "2025-08-12",
        scheduled_time: "21:00",
        notes: "Test attendance",
        created_at: "2025-08-12T00:00:00Z",
        updated_at: "2025-08-12T00:00:00Z",
      },
    });

    mockGetNextAttendanceDate.mockResolvedValue({
      success: true,
      value: { next_date: "2025-08-12" },
    });

    // Mock patients API
    mockGetPatients.mockResolvedValue({
      success: true,
      value: [
        {
          id: 1,
          name: "João Silva",
          priority: PatientPriority.EMERGENCY,
          phone: "",
          treatment_status: TreatmentStatus.IN_TREATMENT,
          birth_date: "1990-01-01",
          start_date: "2025-08-01",
          created_at: "2025-08-08T00:00:00Z",
          updated_at: "2025-08-08T00:00:00Z",
        },
        {
          id: 2,
          name: "Maria Santos",
          priority: PatientPriority.INTERMEDIATE,
          phone: "",
          treatment_status: TreatmentStatus.IN_TREATMENT,
          birth_date: "1985-01-01",
          start_date: "2025-08-01",
          created_at: "2025-08-08T00:00:00Z",
          updated_at: "2025-08-08T00:00:00Z",
        },
      ],
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Basic Functionality", () => {
    it("should initialize with correct default values", async () => {
      const { result } = renderHook(() => useAgendaCalendar(), { wrapper });

      // Wait for initial load
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.selectedDate).toBe("");
      expect(result.current.activeTab).toBe("spiritual");
      expect(result.current.openAgendaIdx).toBe(0); // Opens first item by default
      expect(result.current.isTabTransitioning).toBe(false);
      expect(result.current.confirmRemove).toBeNull();
      expect(result.current.showNewAttendance).toBe(false);
    });

    it("should provide TABS configuration", async () => {
      const { result } = renderHook(() => useAgendaCalendar(), { wrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.TABS).toEqual([
        { key: "spiritual", label: "Consultas Espirituais" },
        { key: "lightBath", label: "Banhos de Luz/Bastão" },
      ]);
    });

    it("should expose backend data through filteredAgenda", async () => {
      const { result } = renderHook(() => useAgendaCalendar(), { wrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.filteredAgenda.spiritual).toHaveLength(1);
      expect(result.current.filteredAgenda.lightBath).toHaveLength(1);
      expect(result.current.filteredAgenda.spiritual[0].patients[0].name).toBe(
        "João Silva"
      );
    });
  });

  describe("Date Filtering", () => {
    it("should filter agenda by selected date", async () => {
      const { result } = renderHook(() => useAgendaCalendar(), { wrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.setSelectedDate("2025-08-08");
      });

      expect(result.current.filteredAgenda.spiritual).toHaveLength(1);
      expect(result.current.filteredAgenda.lightBath).toHaveLength(0); // Different date
    });

    it("should show all agenda items when no date selected", async () => {
      const { result } = renderHook(() => useAgendaCalendar(), { wrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.setSelectedDate("");
      });

      expect(result.current.filteredAgenda.spiritual).toHaveLength(1);
      expect(result.current.filteredAgenda.lightBath).toHaveLength(1);
    });
  });

  describe("Tab Navigation", () => {
    it("should handle tab transitions", async () => {
      const { result } = renderHook(() => useAgendaCalendar(), { wrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.setActiveTab("lightBath");
      });

      // Should trigger transition
      expect(result.current.isTabTransitioning).toBe(true);

      // After timeout, should complete transition
      await act(async () => {
        jest.advanceTimersByTime(100);
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(result.current.activeTab).toBe("lightBath");
    });
  });

  describe("Patient Removal", () => {
    it("should handle patient removal with backend integration", async () => {
      const { result } = renderHook(() => useAgendaCalendar(), { wrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Setup confirm remove with attendanceId
      act(() => {
        result.current.setConfirmRemove({
          id: "1",
          date: new Date("2025-08-08"),
          name: "João Silva",
          type: "spiritual",
          attendanceId: 1,
        });
      });

      // Execute removal
      await act(async () => {
        await result.current.handleRemovePatient();
      });

      expect(mockDeleteAttendance).toHaveBeenCalledWith(1);
      expect(result.current.confirmRemove).toBeNull();
    });

    it("should handle removal failure gracefully", async () => {
      mockDeleteAttendance.mockResolvedValue({
        success: false,
        error: "Delete failed",
      });

      const { result } = renderHook(() => useAgendaCalendar(), { wrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      act(() => {
        result.current.setConfirmRemove({
          id: "1",
          date: new Date("2025-08-08"),
          name: "João Silva",
          type: "spiritual",
          attendanceId: 1,
        });
      });

      await act(async () => {
        await result.current.handleRemovePatient();
      });

      expect(mockDeleteAttendance).toHaveBeenCalledWith(1);
      // Should not clear confirmRemove on failure
      expect(result.current.confirmRemove).not.toBeNull();
    });
  });

  describe("Backend State Integration", () => {
    it("should expose loading state from context", async () => {
      mockGetAttendancesForAgenda.mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep loading
      );

      const { result } = renderHook(() => useAgendaCalendar(), { wrapper });

      // Should start with loading state
      expect(result.current.loading).toBe(true);
    });

    it("should expose error state from context", async () => {
      mockGetAttendancesForAgenda.mockRejectedValue(new Error("Backend error"));

      const { result } = renderHook(() => useAgendaCalendar(), { wrapper });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(result.current.error).toBe("Erro ao carregar agenda");
    });
  });
});
