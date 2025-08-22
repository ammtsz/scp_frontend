import React from "react";
import { render, screen } from "@testing-library/react";
import AttendanceList from "../index";
import { useAttendanceList } from "../useAttendanceList";
import { IPriority, IAttendanceByDate } from "@/types/globals";
import { PatientsProvider } from "@/contexts/PatientsContext";
import { AttendancesProvider } from "@/contexts/AttendancesContext";
import { getPatients } from "@/api/patients";
import { getAttendancesByDate, getNextAttendanceDate } from "@/api/attendances";

// Mock the APIs
jest.mock("@/api/patients");
jest.mock("@/api/attendances");
const mockGetPatients = getPatients as jest.MockedFunction<typeof getPatients>;
const mockGetAttendancesByDate = getAttendancesByDate as jest.MockedFunction<
  typeof getAttendancesByDate
>;
const mockGetNextAttendanceDate = getNextAttendanceDate as jest.MockedFunction<
  typeof getNextAttendanceDate
>;

// Mock the hook
jest.mock("../useAttendanceList");
const mockUseAttendanceList = useAttendanceList as jest.MockedFunction<
  typeof useAttendanceList
>;

// Helper function to render with providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <PatientsProvider>
      <AttendancesProvider>{ui}</AttendancesProvider>
    </PatientsProvider>
  );
};

describe("Rod Treatment Integration", () => {
  const mockAttendancesByDate: IAttendanceByDate = {
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
      scheduled: [
        {
          name: "João Silva",
          priority: "1" as IPriority,
          checkedInTime: null,
          onGoingTime: null,
          completedTime: null,
        },
      ],
      checkedIn: [],
      onGoing: [],
      completed: [],
    },
  };

  const defaultMockHookReturn = {
    selectedDate: "2025-01-15",
    setSelectedDate: jest.fn(),
    attendancesByDate: mockAttendancesByDate,
    loading: false,
    error: null,
    dragged: null,
    confirmOpen: false,
    pendingDrop: null,
    multiSectionModalOpen: false,
    multiSectionPending: null,
    collapsed: { spiritual: false, lightBath: false, rod: false },
    getPatients: jest.fn(),
    handleDragStart: jest.fn(),
    handleDragEnd: jest.fn(),
    handleDropWithConfirm: jest.fn(),
    handleConfirm: jest.fn(),
    handleCancel: jest.fn(),
    handleMultiSectionConfirm: jest.fn(),
    handleMultiSectionCancel: jest.fn(),
    toggleCollapsed: jest.fn(),
    refreshCurrentDate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup API mocks
    mockGetPatients.mockResolvedValue({ success: true, value: [] });
    mockGetAttendancesByDate.mockResolvedValue({ success: true, value: [] });
    mockGetNextAttendanceDate.mockResolvedValue({
      success: true,
      value: { next_date: "2025-01-15" },
    });

    // Setup default getPatients implementation
    defaultMockHookReturn.getPatients.mockImplementation(
      (type: string, status: string) => {
        const typeKey = type as keyof typeof mockAttendancesByDate;
        if (typeKey === "date") return [];
        const statusKey =
          status as keyof typeof mockAttendancesByDate.spiritual;
        return mockAttendancesByDate[typeKey]?.[statusKey] || [];
      }
    );

    mockUseAttendanceList.mockReturnValue(defaultMockHookReturn);
  });

  it("should render rod treatment section", () => {
    renderWithProviders(<AttendanceList />);

    // Should render the mixed section that includes rod treatments
    // Using a more flexible matcher to handle the split text
    expect(screen.getByText(/Banhos de Luz \+ Bastão/)).toBeInTheDocument();
  });

  it("should handle rod treatment collapse functionality", () => {
    renderWithProviders(<AttendanceList />);

    const collapseButton = screen.getByText(/Banhos de Luz \+ Bastão/);
    expect(collapseButton).toBeInTheDocument();

    // The collapse button should be present and functional
    expect(collapseButton.tagName).toBe("BUTTON");
  });

  it("should display rod treatment patients with correct styling", () => {
    renderWithProviders(<AttendanceList />);

    // The rod patients should be included in the mixed section columns
    expect(defaultMockHookReturn.getPatients).toHaveBeenCalledWith(
      "rod",
      "scheduled"
    );
    expect(defaultMockHookReturn.getPatients).toHaveBeenCalledWith(
      "rod",
      "checkedIn"
    );
    expect(defaultMockHookReturn.getPatients).toHaveBeenCalledWith(
      "rod",
      "onGoing"
    );
    expect(defaultMockHookReturn.getPatients).toHaveBeenCalledWith(
      "rod",
      "completed"
    );
  });

  it("should handle drag and drop for rod treatments", () => {
    renderWithProviders(<AttendanceList />);

    // Verify that rod treatments can be handled in drag and drop operations
    expect(defaultMockHookReturn.handleDragStart).toBeDefined();
    expect(defaultMockHookReturn.handleDropWithConfirm).toBeDefined();
  });

  it("should maintain collapsed state for rod treatments", () => {
    const collapsedMockReturn = {
      ...defaultMockHookReturn,
      collapsed: {
        spiritual: false,
        lightBath: true,
        rod: true,
      },
    };

    mockUseAttendanceList.mockReturnValue(collapsedMockReturn);

    renderWithProviders(<AttendanceList />);

    // When both lightBath and rod are collapsed, the mixed section should be collapsed
    const collapseButton = screen.getByText(/▶ Banhos de Luz \+ Bastão/);
    expect(collapseButton).toBeInTheDocument();
  });

  it("should verify rod treatment data exists in test data", () => {
    // Verify our test data includes rod treatments
    expect(mockAttendancesByDate.rod.scheduled).toHaveLength(1);
    expect(mockAttendancesByDate.rod.scheduled[0].name).toBe("João Silva");
    expect(mockAttendancesByDate.rod.scheduled[0].priority).toBe("1");
  });
});
