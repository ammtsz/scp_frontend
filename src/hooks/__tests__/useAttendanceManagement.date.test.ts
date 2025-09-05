import { renderHook, act } from "@testing-library/react";
import { useAttendanceManagement } from "../useAttendanceManagement";
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
const mockGetNextAttendanceDate = attendancesApi.getNextAttendanceDate as jest.MockedFunction<typeof attendancesApi.getNextAttendanceDate>;

describe("useAttendanceManagement - Date Parameter Integration", () => {
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
    
    mockGetNextAttendanceDate.mockResolvedValue({
      success: true,
      value: { next_date: "2025-08-12" },
    });
  });

  it("should use selected date when provided", async () => {
    const { result } = renderHook(() => useAttendanceManagement());

    // Set up form state for a new patient
    act(() => {
      result.current.setIsNewPatient(true);
      result.current.setSearch("Test Patient");
      result.current.setSelectedTypes(["spiritual"]);
      result.current.setPriority("1");
    });

    // Mock form event
    const mockEvent = {
      preventDefault: jest.fn(),
    } as unknown as React.FormEvent;

    // Call handleRegisterNewAttendance with a specific date
    await act(async () => {
      await result.current.handleRegisterNewAttendance(mockEvent, "2024-01-15");
    });

    // Verify that createAttendance was called with the selected date
    expect(mockCreateAttendance).toHaveBeenCalledWith({
      patient_id: 1,
      type: AttendanceType.SPIRITUAL,
      scheduled_date: "2024-01-15", // Should use the provided date
      scheduled_time: "21:00",
      notes: "Check-in sem agendamento - Novo paciente",
    });

    // Verify that getNextAttendanceDate was NOT called when date is provided
    expect(mockGetNextAttendanceDate).not.toHaveBeenCalled();
  });

  it("should use next available date when no date is provided", async () => {
    const { result } = renderHook(() => useAttendanceManagement());

    // Set up form state for existing patient
    act(() => {
      result.current.setIsNewPatient(false);
      result.current.setSelectedPatient("João Silva");
      result.current.setSearch("João Silva");
      result.current.setSelectedTypes(["spiritual"]);
      result.current.setPriority("1");
    });

    // Mock form event
    const mockEvent = {
      preventDefault: jest.fn(),
    } as unknown as React.FormEvent;

    // Call handleRegisterNewAttendance without a date
    await act(async () => {
      await result.current.handleRegisterNewAttendance(mockEvent);
    });

    // Verify that getNextAttendanceDate was called
    expect(mockGetNextAttendanceDate).toHaveBeenCalled();

    // Verify that createAttendance was called with the next available date
    expect(mockCreateAttendance).toHaveBeenCalledWith({
      patient_id: 1,
      type: AttendanceType.SPIRITUAL,
      scheduled_date: "2025-08-12", // Should use the next available date from API
      scheduled_time: "21:00",
      notes: "Check-in sem agendamento - Paciente existente",
    });
  });

  it("should call parent callback with selected date when provided", async () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() => useAttendanceManagement(mockCallback));

    // Set up form state for new patient
    act(() => {
      result.current.setIsNewPatient(true);
      result.current.setSearch("Test Patient");
      result.current.setSelectedTypes(["spiritual"]);
      result.current.setPriority("1");
    });

    // Mock form event
    const mockEvent = {
      preventDefault: jest.fn(),
    } as unknown as React.FormEvent;

    // Call handleRegisterNewAttendance with a specific date
    await act(async () => {
      await result.current.handleRegisterNewAttendance(mockEvent, "2024-01-15");
    });

    // Verify that the callback was called with the selected date
    expect(mockCallback).toHaveBeenCalledWith(
      "Test Patient",
      ["spiritual"],
      true,
      "1",
      "2024-01-15" // Should pass the selected date to the callback
    );
  });

  it("should handle multiple attendance types with selected date", async () => {
    const { result } = renderHook(() => useAttendanceManagement());

    // Set up form state for new patient with multiple attendance types
    act(() => {
      result.current.setIsNewPatient(true);
      result.current.setSearch("Test Patient");
      result.current.setSelectedTypes(["spiritual", "lightBath"]);
      result.current.setPriority("1");
    });

    // Mock form event
    const mockEvent = {
      preventDefault: jest.fn(),
    } as unknown as React.FormEvent;

    // Call handleRegisterNewAttendance with a specific date
    await act(async () => {
      await result.current.handleRegisterNewAttendance(mockEvent, "2024-01-15");
    });

    // Verify that createAttendance was called twice with the same selected date
    expect(mockCreateAttendance).toHaveBeenCalledTimes(2);
    
    // Check first call (spiritual)
    expect(mockCreateAttendance).toHaveBeenNthCalledWith(1, {
      patient_id: 1,
      type: AttendanceType.SPIRITUAL,
      scheduled_date: "2024-01-15",
      scheduled_time: "21:00",
      notes: "Check-in sem agendamento - Novo paciente",
    });
    
    // Check second call (lightBath)
    expect(mockCreateAttendance).toHaveBeenNthCalledWith(2, {
      patient_id: 1,
      type: AttendanceType.LIGHT_BATH,
      scheduled_date: "2024-01-15",
      scheduled_time: "21:00",
      notes: "Check-in sem agendamento - Novo paciente",
    });

    // Verify that getNextAttendanceDate was NOT called when date is provided
    expect(mockGetNextAttendanceDate).not.toHaveBeenCalled();
  });

  it("should fall back to next available date when API fails and no date provided", async () => {
    // Mock API failure
    mockGetNextAttendanceDate.mockRejectedValue(new Error("API Error"));

    const { result } = renderHook(() => useAttendanceManagement());

    // Set up form state
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

    // Call handleRegisterNewAttendance without a date
    await act(async () => {
      await result.current.handleRegisterNewAttendance(mockEvent);
    });

    // Verify that getNextAttendanceDate was called but failed
    expect(mockGetNextAttendanceDate).toHaveBeenCalled();

    // Verify that createAttendance was still called with a fallback date
    expect(mockCreateAttendance).toHaveBeenCalledWith(
      expect.objectContaining({
        patient_id: 1,
        type: AttendanceType.SPIRITUAL,
        scheduled_date: expect.any(String), // Should be some fallback date
        scheduled_time: "21:00",
        notes: "Check-in sem agendamento - Paciente existente",
      })
    );
  });
});
