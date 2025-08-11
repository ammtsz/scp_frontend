import { renderHook, act } from "@testing-library/react";
import { useUnscheduledPatients } from "../useUnscheduledPatients";
import * as patientsApi from "@/api/patients";
import * as attendancesApi from "@/api/attendances";
import { PatientPriority, AttendanceType, TreatmentStatus, AttendanceStatus } from "@/api/types";

// Mock the API modules
jest.mock("@/api/patients");
jest.mock("@/api/attendances");
jest.mock("@/contexts/PatientsContext", () => ({
  usePatients: () => ({
    patients: [
      {
        id: "1",
        name: "João Silva",
        phone: "11999999999",
        priority: "1",
        status: "T",
      },
    ],
    refreshPatients: jest.fn(),
  }),
}));
jest.mock("@/contexts/AttendancesContext", () => ({
  useAttendances: () => ({
    refreshCurrentDate: jest.fn(),
    attendancesByDate: {
      spiritual: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
      lightBath: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
    },
  }),
}));

const mockCreatePatient = patientsApi.createPatient as jest.MockedFunction<typeof patientsApi.createPatient>;
const mockCreateAttendance = attendancesApi.createAttendance as jest.MockedFunction<typeof attendancesApi.createAttendance>;
const mockCheckInAttendance = attendancesApi.checkInAttendance as jest.MockedFunction<typeof attendancesApi.checkInAttendance>;
const mockGetNextAttendanceDate = attendancesApi.getNextAttendanceDate as jest.MockedFunction<typeof attendancesApi.getNextAttendanceDate>;

describe("useUnscheduledPatients - Fixes for Issues", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks
    mockCreatePatient.mockResolvedValue({
      success: true,
      value: { 
        id: 1, 
        name: "Test Patient", 
        phone: "123456789", 
        priority: PatientPriority.NORMAL, 
        main_complaint: "Test",
        treatment_status: TreatmentStatus.IN_TREATMENT,
        start_date: "2024-01-15",
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z"
      },
    });
    
    mockCreateAttendance.mockResolvedValue({
      success: true,
      value: { 
        id: 1, 
        patient_id: 1, 
        type: AttendanceType.SPIRITUAL, 
        scheduled_date: "2024-01-15", 
        scheduled_time: "21:00",
        status: AttendanceStatus.SCHEDULED,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z"
      },
    });

    mockCheckInAttendance.mockResolvedValue({
      success: true,
      value: { 
        id: 1, 
        patient_id: 1, 
        type: AttendanceType.SPIRITUAL, 
        scheduled_date: "2024-01-15", 
        scheduled_time: "21:00",
        status: AttendanceStatus.CHECKED_IN,
        checked_in_at: "2024-01-15T10:00:00Z",
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z"
      },
    });
    
    mockGetNextAttendanceDate.mockResolvedValue({
      success: true,
      value: { next_date: "2025-08-12" },
    });
  });

  describe("Fix 1: Unscheduled patients should be checked-in automatically", () => {
    it("should create attendance and immediately check them in for unscheduled patient", async () => {
      const { result } = renderHook(() => useUnscheduledPatients());

      // Set up form state for a new patient
      act(() => {
        result.current.setIsNewPatient(true);
        result.current.setSearch("Test Patient");
        result.current.setSelectedTypes(["spiritual"]);
        result.current.setPriority("1");
      });

      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      // Call handleRegisterNewAttendance
      await act(async () => {
        await result.current.handleRegisterNewAttendance(mockEvent);
      });

      // Verify that createAttendance was called
      expect(mockCreateAttendance).toHaveBeenCalledWith({
        patient_id: 1,
        type: AttendanceType.SPIRITUAL,
        scheduled_date: "2025-08-12",
        scheduled_time: "21:00",
        notes: "Check-in sem agendamento - Novo paciente",
      });

      // Verify that checkInAttendance was called after creation
      expect(mockCheckInAttendance).toHaveBeenCalledWith("1");
      expect(mockCheckInAttendance).toHaveBeenCalledTimes(1);
    });

    it("should handle check-in failure gracefully and still show success", async () => {
      // Mock check-in to fail
      mockCheckInAttendance.mockResolvedValue({
        success: false,
        error: "Check-in failed",
      });

      const { result } = renderHook(() => useUnscheduledPatients());

      act(() => {
        result.current.setIsNewPatient(false);
        result.current.setSelectedPatient("João Silva");
        result.current.setSearch("João Silva");
        result.current.setSelectedTypes(["spiritual"]);
        result.current.setPriority("1");
      });

      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        const success = await result.current.handleRegisterNewAttendance(mockEvent);
        expect(success).toBe(true); // Should still be successful even if check-in fails
      });

      expect(mockCreateAttendance).toHaveBeenCalled();
      expect(mockCheckInAttendance).toHaveBeenCalled();
      // Should have success message despite check-in failure
      expect(result.current.success).toContain("Check-in realizado com sucesso!");
    });

    it("should check in multiple attendances when multiple types are selected", async () => {
      // Mock for light bath attendance
      mockCreateAttendance.mockResolvedValueOnce({
        success: true,
        value: { 
          id: 1, 
          patient_id: 1, 
          type: AttendanceType.SPIRITUAL, 
          scheduled_date: "2024-01-15", 
          scheduled_time: "21:00",
          status: AttendanceStatus.SCHEDULED,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z"
        },
      }).mockResolvedValueOnce({
        success: true,
        value: { 
          id: 2, 
          patient_id: 1, 
          type: AttendanceType.LIGHT_BATH, 
          scheduled_date: "2024-01-15", 
          scheduled_time: "21:00",
          status: AttendanceStatus.SCHEDULED,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-15T10:00:00Z"
        },
      });

      const { result } = renderHook(() => useUnscheduledPatients());

      act(() => {
        result.current.setIsNewPatient(true);
        result.current.setSearch("Test Patient");
        result.current.setSelectedTypes(["spiritual", "lightBath"]);
        result.current.setPriority("1");
      });

      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleRegisterNewAttendance(mockEvent);
      });

      // Both attendances should be created
      expect(mockCreateAttendance).toHaveBeenCalledTimes(2);
      
      // Both should be checked in
      expect(mockCheckInAttendance).toHaveBeenCalledWith("1");
      expect(mockCheckInAttendance).toHaveBeenCalledWith("2");
      expect(mockCheckInAttendance).toHaveBeenCalledTimes(2);
    });
  });

  describe("Fix 2: Allow scheduling different attendance types for same patient", () => {
    it("should allow scheduling light bath when patient only has spiritual attendance", async () => {
      const { result } = renderHook(() => useUnscheduledPatients());

      act(() => {
        result.current.setIsNewPatient(false);
        result.current.setSelectedPatient("João Silva");
        result.current.setSearch("João Silva");
        result.current.setSelectedTypes(["lightBath"]); // Different type than what patient already has
        result.current.setPriority("1");
      });

      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        const success = await result.current.handleRegisterNewAttendance(mockEvent);
        expect(success).toBe(true);
      });

      // Should not show error about already scheduled
      expect(result.current.error).toBeNull();
      
      // Should create the light bath attendance
      expect(mockCreateAttendance).toHaveBeenCalledWith({
        patient_id: 1,
        type: AttendanceType.LIGHT_BATH,
        scheduled_date: "2025-08-12",
        scheduled_time: "21:00",
        notes: "Check-in sem agendamento - Paciente existente",
      });
    });

    it("should block scheduling same type when patient already has that type", async () => {
      const { result } = renderHook(() => useUnscheduledPatients());

      act(() => {
        result.current.setIsNewPatient(false);
        result.current.setSelectedPatient("João Silva");
        result.current.setSearch("João Silva");
        result.current.setSelectedTypes(["spiritual"]); // Same type as already scheduled
        result.current.setPriority("1");
      });

      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        const success = await result.current.handleRegisterNewAttendance(mockEvent);
        expect(success).toBe(false);
      });

      // Should show error about already scheduled for this type
      expect(result.current.error).toContain("já possui atendimento agendado para hoje nos tipos selecionados");
      
      // Should not create attendance
      expect(mockCreateAttendance).not.toHaveBeenCalled();
    });

    it("should allow scheduling both types when patient has none", async () => {
      const { result } = renderHook(() => useUnscheduledPatients());

      act(() => {
        result.current.setIsNewPatient(false);
        result.current.setSelectedPatient("João Silva");
        result.current.setSearch("João Silva");
        result.current.setSelectedTypes(["spiritual", "lightBath"]); // Both types
        result.current.setPriority("1");
      });

      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        const success = await result.current.handleRegisterNewAttendance(mockEvent);
        expect(success).toBe(true);
      });

      // Should not show error
      expect(result.current.error).toBeNull();
      
      // Should create both attendances
      expect(mockCreateAttendance).toHaveBeenCalledTimes(2);
    });

    it("should block scheduling when patient has partial overlap", async () => {
      const { result } = renderHook(() => useUnscheduledPatients());

      act(() => {
        result.current.setIsNewPatient(false);
        result.current.setSelectedPatient("João Silva");
        result.current.setSearch("João Silva");
        result.current.setSelectedTypes(["spiritual", "lightBath"]); // Both types, but patient already has spiritual
        result.current.setPriority("1");
      });

      const mockEvent = {
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent;

      await act(async () => {
        const success = await result.current.handleRegisterNewAttendance(mockEvent);
        expect(success).toBe(false);
      });

      // Should show error because patient already has spiritual
      expect(result.current.error).toContain("já possui atendimento agendado para hoje nos tipos selecionados");
      
      // Should not create any attendances
      expect(mockCreateAttendance).not.toHaveBeenCalled();
    });
  });
});
