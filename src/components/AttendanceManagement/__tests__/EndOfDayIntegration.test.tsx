import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AttendancesProvider } from "@/contexts/AttendancesContext";
import { PatientsProvider } from "@/contexts/PatientsContext";
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

// Mock AgendaContext
jest.mock("@/contexts/AgendaContext", () => ({
  useAgenda: () => ({
    agenda: [],
    refreshAgenda: jest.fn(),
    loading: false,
    error: null,
  }),
  AgendaProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PatientsProvider>
    <AttendancesProvider>{children}</AttendancesProvider>
  </PatientsProvider>
);

describe("EndOfDayModal Integration - Completed Count Fix", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should correctly show completed attendances count in end of day modal", async () => {
    render(
      <TestWrapper>
        <AttendanceManagement />
      </TestWrapper>
    );

    await waitFor(
      () => {
        expect(screen.getByText("Finalizar Dia")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Click on the "Finalizar Dia" button
    fireEvent.click(screen.getByText("Finalizar Dia"));

    // Give it more time and use a more flexible text matcher
    await waitFor(
      () => {
        // Try to find any text that contains "Encerramento" - might be split across elements
        expect(
          screen.getByText((content) => {
            return content.includes("Encerramento");
          })
        ).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Since there are no incomplete attendances, the modal should be on absences step
    // Navigate to confirmation step
    const nextButton = screen.getByText("Próximo");
    fireEvent.click(nextButton);

    await waitFor(() => {
      // Should show the correct completed attendances count: 3
      expect(
        screen.getByText("✓ Atendimentos finalizados: 3")
      ).toBeInTheDocument();
    });
  });
});
