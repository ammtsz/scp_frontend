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
      data: {
        spiritual: {
          scheduled: [],
          checkedIn: [],
          onGoing: [],
          completed: [
            { patientId: 1, attendanceId: 1, name: "Patient 1", priority: "1" },
            { patientId: 2, attendanceId: 2, name: "Patient 2", priority: "1" },
            { patientId: 3, attendanceId: 3, name: "Patient 3", priority: "1" },
          ],
        },
        lightBath: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
        rod: { scheduled: [], checkedIn: [], onGoing: [], completed: [] },
      },
      error: null,
    })
  ),
}));

jest.mock("@/api/patients", () => ({
  getAllPatients: jest.fn(() => Promise.resolve({ data: [], error: null })),
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

    await waitFor(() => {
      expect(screen.getByText("Encerramento do Dia")).toBeInTheDocument();
    });

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
