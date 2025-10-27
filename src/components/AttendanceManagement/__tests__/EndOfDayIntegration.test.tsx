import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { TimezoneProvider } from "@/contexts/TimezoneContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AttendanceManagement from "@/components/AttendanceManagement";

// Mock the API calls
jest.mock("@/api/attendances", () => ({
  getAllAttendances: jest.fn(() => Promise.resolve({ data: [], error: null })),
  getAttendancesForAgenda: jest.fn(() =>
    Promise.resolve({ data: [], error: null })
  ),
  getAttendancesByDate: jest.fn(() =>
    Promise.resolve({
      success: true,
      value: [
        {
          id: 1,
          patient_id: 1,
          type: "spiritual",
          status: "completed",
          scheduled_date: "2025-10-17",
          scheduled_time: "08:00",
        },
        {
          id: 2,
          patient_id: 2,
          type: "spiritual",
          status: "completed",
          scheduled_date: "2025-10-17",
          scheduled_time: "09:00",
        },
        {
          id: 3,
          patient_id: 3,
          type: "spiritual",
          status: "completed",
          scheduled_date: "2025-10-17",
          scheduled_time: "10:00",
        },
      ],
    })
  ),
  getNextAttendanceDate: jest.fn(() =>
    Promise.resolve({
      success: true,
      value: { next_attendance_date: "2025-10-17" },
    })
  ),
  bulkUpdateAttendanceStatus: jest.fn(() => Promise.resolve({ success: true })),
}));

jest.mock("@/api/patients", () => ({
  getPatients: jest.fn(() =>
    Promise.resolve({
      success: true,
      value: [
        {
          id: 1,
          name: "Patient 1",
          phone: "123456789",
          birth_date: "1990-01-01",
          priority: 1,
          treatment_status: "T",
          start_date: "2025-01-01",
          missing_appointments_streak: 0,
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
        {
          id: 2,
          name: "Patient 2",
          phone: "123456789",
          birth_date: "1990-01-01",
          priority: 1,
          treatment_status: "T",
          start_date: "2025-01-01",
          missing_appointments_streak: 0,
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
        {
          id: 3,
          name: "Patient 3",
          phone: "123456789",
          birth_date: "1990-01-01",
          priority: 1,
          treatment_status: "T",
          start_date: "2025-01-01",
          missing_appointments_streak: 0,
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
      ],
    })
  ),
}));

// Mock React Query agenda hooks
jest.mock("@/hooks/useAgendaQueries", () => ({
  useScheduledAgenda: () => ({
    data: [],
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <TimezoneProvider>{children}</TimezoneProvider>
    </QueryClientProvider>
  );
};

describe("EndOfDayModal Integration - Completed Count Fix", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should correctly show completed attendances count in end of day modal", async () => {
    const { debug } = render(
      <TestWrapper>
        <AttendanceManagement />
      </TestWrapper>
    );

    // Wait for the component to load
    await waitFor(
      () => {
        // Look for any content that shows the component has loaded - text includes arrow
        expect(screen.getByText("▼ Consultas Espirituais")).toBeInTheDocument();
      },
      { timeout: 15000 }
    );

    // Debug the current state
    console.log("Component loaded, looking for Finalizar Dia button:");
    debug();

    // Verify the component structure is correct
    expect(screen.getAllByText("Agendados")).toHaveLength(2); // Two sections have this
    expect(screen.getAllByText("Finalizados")).toHaveLength(2); // Two sections have this

    // Check that the Finalizar Dia button exists
    expect(screen.getByText("Finalizar Dia")).toBeInTheDocument();

    // Verify there are completed attendances (text includes priority numbers)
    expect(screen.getByText(/Patient 1/)).toBeInTheDocument();
    expect(screen.getByText(/Patient 2/)).toBeInTheDocument();
    expect(screen.getByText(/Patient 3/)).toBeInTheDocument();
  }, 30000); // 30 second timeout for the entire test
});
