import { renderHook, act } from "@testing-library/react";
import { useAttendanceManagement } from "../hooks/useAttendanceManagement";
import { useAttendances } from "@/contexts/AttendancesContext";
import { usePatients } from "@/contexts/PatientsContext";
import { updateAttendanceStatus } from "@/api/attendanceSync";
import React from "react";
import { IPatients, IAttendanceByDate, IPriority } from "@/types/globals";

// Mock contexts and API
jest.mock("@/contexts/AttendancesContext");
jest.mock("@/contexts/PatientsContext");
jest.mock("@/api/attendanceSync");

const mockUseAttendances = useAttendances as jest.MockedFunction<
  typeof useAttendances
>;
const mockUsePatients = usePatients as jest.MockedFunction<typeof usePatients>;
const mockUpdateAttendanceStatus =
  updateAttendanceStatus as jest.MockedFunction<typeof updateAttendanceStatus>;

// Mock patient data with new patient status
const createNewPatientsMockData = (): IPatients[] => [
  {
    id: "1",
    name: "New Patient John",
    phone: "(11) 99999-9999",
    priority: "2" as IPriority,
    status: "N", // New patient status
  },
  {
    id: "2",
    name: "Existing Patient Jane",
    phone: "(11) 88888-8888",
    priority: "3" as IPriority,
    status: "T", // In treatment status
  },
];

// Mock attendance data with new patient
const createNewPatientAttendancesMockData = (): IAttendanceByDate => ({
  date: new Date("2025-01-15"),
  spiritual: {
    scheduled: [
      {
        name: "New Patient John",
        priority: "2" as IPriority,
        checkedInTime: null,
        onGoingTime: null,
        completedTime: null,
        attendanceId: 1,
        patientId: 1,
      },
      {
        name: "Existing Patient Jane",
        priority: "3" as IPriority,
        checkedInTime: null,
        onGoingTime: null,
        completedTime: null,
        attendanceId: 2,
        patientId: 2,
      },
    ],
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
});

// Wrapper component for hooks
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

describe("useAttendanceManagement - New Patient Detection", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock updateAttendanceStatus to always succeed
    mockUpdateAttendanceStatus.mockResolvedValue({
      success: true,
    });
  });

  it("should detect new patient when moving from scheduled to checkedIn", () => {
    const mockPatients = createNewPatientsMockData();
    const mockAttendances = createNewPatientAttendancesMockData();

    // Mock contexts
    mockUsePatients.mockReturnValue({
      patients: mockPatients,
      setPatients: jest.fn(),
      loading: false,
      error: null,
      refreshPatients: jest.fn(),
    });

    mockUseAttendances.mockReturnValue({
      selectedDate: "2025-01-15",
      setSelectedDate: jest.fn(),
      attendancesByDate: mockAttendances,
      setAttendancesByDate: jest.fn(),
      loading: false,
      dataLoading: false,
      error: null,
      loadAttendancesByDate: jest.fn(),
      bulkUpdateStatus: jest.fn(),
      initializeSelectedDate: jest.fn(),
      refreshCurrentDate: jest.fn(),
    });

    const mockOnNewPatientDetected = jest.fn();

    const { result } = renderHook(
      () =>
        useAttendanceManagement({
          onNewPatientDetected: mockOnNewPatientDetected,
        }),
      { wrapper }
    );

    // Start drag for new patient
    act(() => {
      result.current.handleDragStart("spiritual", 0, "scheduled");
    });

    // Verify drag state is set for new patient
    expect(result.current.dragged).toEqual({
      type: "spiritual",
      status: "scheduled",
      idx: 0,
      name: "New Patient John",
    });

    // Attempt to drop to checkedIn - should trigger new patient detection
    act(() => {
      result.current.handleDropWithConfirm("spiritual", "checkedIn");
    });

    // Should call the new patient detection callback
    expect(mockOnNewPatientDetected).toHaveBeenCalledWith({
      id: "1",
      name: "New Patient John",
      phone: "(11) 99999-9999",
      priority: "2",
      status: "N",
    });

    // Should reset drag state
    expect(result.current.dragged).toBe(null);
  });

  it("should NOT trigger new patient detection for existing patients", () => {
    const mockPatients = createNewPatientsMockData();
    const mockAttendances = createNewPatientAttendancesMockData();

    mockUsePatients.mockReturnValue({
      patients: mockPatients,
      setPatients: jest.fn(),
      loading: false,
      error: null,
      refreshPatients: jest.fn(),
    });

    mockUseAttendances.mockReturnValue({
      selectedDate: "2025-01-15",
      setSelectedDate: jest.fn(),
      attendancesByDate: mockAttendances,
      setAttendancesByDate: jest.fn(),
      loading: false,
      dataLoading: false,
      error: null,
      loadAttendancesByDate: jest.fn(),
      bulkUpdateStatus: jest.fn(),
      initializeSelectedDate: jest.fn(),
      refreshCurrentDate: jest.fn(),
    });

    const mockOnNewPatientDetected = jest.fn();

    const { result } = renderHook(
      () =>
        useAttendanceManagement({
          onNewPatientDetected: mockOnNewPatientDetected,
        }),
      { wrapper }
    );

    // Start drag for existing patient (index 1 = Existing Patient Jane)
    act(() => {
      result.current.handleDragStart("spiritual", 1, "scheduled");
    });

    // Attempt to drop to checkedIn - should NOT trigger new patient detection
    act(() => {
      result.current.handleDropWithConfirm("spiritual", "checkedIn");
    });

    // Should NOT call the new patient detection callback
    expect(mockOnNewPatientDetected).not.toHaveBeenCalled();
  });

  it("should only trigger new patient detection when moving to checkedIn status", () => {
    const mockPatients = createNewPatientsMockData();
    const mockAttendances = createNewPatientAttendancesMockData();

    mockUsePatients.mockReturnValue({
      patients: mockPatients,
      setPatients: jest.fn(),
      loading: false,
      error: null,
      refreshPatients: jest.fn(),
    });

    mockUseAttendances.mockReturnValue({
      selectedDate: "2025-01-15",
      setSelectedDate: jest.fn(),
      attendancesByDate: mockAttendances,
      setAttendancesByDate: jest.fn(),
      loading: false,
      dataLoading: false,
      error: null,
      loadAttendancesByDate: jest.fn(),
      bulkUpdateStatus: jest.fn(),
      initializeSelectedDate: jest.fn(),
      refreshCurrentDate: jest.fn(),
    });

    const mockOnNewPatientDetected = jest.fn();

    const { result } = renderHook(
      () =>
        useAttendanceManagement({
          onNewPatientDetected: mockOnNewPatientDetected,
        }),
      { wrapper }
    );

    // Start drag for new patient
    act(() => {
      result.current.handleDragStart("spiritual", 0, "scheduled");
    });

    // Try moving to onGoing (not checkedIn) - should NOT trigger detection
    act(() => {
      result.current.handleDropWithConfirm("spiritual", "onGoing");
    });

    // Should NOT call the new patient detection callback
    expect(mockOnNewPatientDetected).not.toHaveBeenCalled();
  });

  it("should handle missing patient data gracefully", () => {
    const mockAttendances = createNewPatientAttendancesMockData();

    mockUsePatients.mockReturnValue({
      patients: [], // Empty patients array
      setPatients: jest.fn(),
      loading: false,
      error: null,
      refreshPatients: jest.fn(),
    });

    mockUseAttendances.mockReturnValue({
      selectedDate: "2025-01-15",
      setSelectedDate: jest.fn(),
      attendancesByDate: mockAttendances,
      setAttendancesByDate: jest.fn(),
      loading: false,
      dataLoading: false,
      error: null,
      loadAttendancesByDate: jest.fn(),
      bulkUpdateStatus: jest.fn(),
      initializeSelectedDate: jest.fn(),
      refreshCurrentDate: jest.fn(),
    });

    const mockOnNewPatientDetected = jest.fn();

    const { result } = renderHook(
      () =>
        useAttendanceManagement({
          onNewPatientDetected: mockOnNewPatientDetected,
        }),
      { wrapper }
    );

    // Start drag
    act(() => {
      result.current.handleDragStart("spiritual", 0, "scheduled");
    });

    // Attempt to drop - should not crash with missing patient data
    act(() => {
      result.current.handleDropWithConfirm("spiritual", "checkedIn");
    });

    // Should not call the callback due to missing patient data
    expect(mockOnNewPatientDetected).not.toHaveBeenCalled();
  });

  it("should work with optional callback parameter", () => {
    const mockPatients = createNewPatientsMockData();
    const mockAttendances = createNewPatientAttendancesMockData();

    mockUsePatients.mockReturnValue({
      patients: mockPatients,
      setPatients: jest.fn(),
      loading: false,
      error: null,
      refreshPatients: jest.fn(),
    });

    mockUseAttendances.mockReturnValue({
      selectedDate: "2025-01-15",
      setSelectedDate: jest.fn(),
      attendancesByDate: mockAttendances,
      setAttendancesByDate: jest.fn(),
      loading: false,
      dataLoading: false,
      error: null,
      loadAttendancesByDate: jest.fn(),
      bulkUpdateStatus: jest.fn(),
      initializeSelectedDate: jest.fn(),
      refreshCurrentDate: jest.fn(),
    });

    // No callback provided
    const { result } = renderHook(() => useAttendanceManagement({}), {
      wrapper,
    });

    // Start drag for new patient
    act(() => {
      result.current.handleDragStart("spiritual", 0, "scheduled");
    });

    // Should not crash without callback
    expect(() => {
      act(() => {
        result.current.handleDropWithConfirm("spiritual", "checkedIn");
      });
    }).not.toThrow();

    // Should reset drag state
    expect(result.current.dragged).toBe(null);
  });
});
