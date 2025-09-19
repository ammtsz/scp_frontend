import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PatientWalkInForm from "../PatientWalkInForm";
import { createAttendance, getAttendancesByDate } from "@/api/attendances";
import { transformAttendanceTypeToApi } from "@/utils/apiTransformers";

// Mock the contexts
jest.mock("@/contexts/PatientsContext", () => ({
  usePatients: () => ({
    patients: [
      {
        id: 1,
        name: "João Silva",
        phone: "11999999999",
        priority: "Normal" as const,
        mainComplaint: "Test complaint",
        startDate: "2025-01-01",
      },
    ],
    loading: false,
    refreshPatients: jest.fn(),
  }),
}));

jest.mock("@/contexts/AttendancesContext", () => ({
  useAttendances: () => ({
    refreshCurrentDate: jest.fn(),
    selectedDate: new Date("2025-01-15"),
  }),
}));

// Mock the API functions
jest.mock("@/api/attendances");
jest.mock("@/api/patients");
jest.mock("@/utils/apiTransformers");

const mockCreateAttendance = createAttendance as jest.MockedFunction<
  typeof createAttendance
>;
const mockGetAttendancesByDate = getAttendancesByDate as jest.MockedFunction<
  typeof getAttendancesByDate
>;
const mockTransformAttendanceTypeToApi =
  transformAttendanceTypeToApi as jest.MockedFunction<
    typeof transformAttendanceTypeToApi
  >;

const mockOnRegisterNewAttendance = jest.fn();

// Mock existing attendances (for duplicate checking)
const mockExistingAttendances = [
  {
    id: 1,
    attendanceType: "spiritual",
    patient: {
      id: 1,
      name: "João Silva",
    },
    status: "checked_in",
    checkedInTime: "10:00:00",
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
];

describe("PatientWalkInForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTransformAttendanceTypeToApi.mockImplementation((type: string) => type);
  });

  it("renders the form correctly", () => {
    render(
      <PatientWalkInForm
        onRegisterNewAttendance={mockOnRegisterNewAttendance}
      />
    );

    expect(screen.getByLabelText(/Nome do Paciente/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Telefone/)).toBeInTheDocument();
    expect(screen.getByText("Consulta Espiritual")).toBeInTheDocument();
    expect(screen.getByText("Banho de Luz")).toBeInTheDocument();
  });

  describe("Duplicate Prevention", () => {
    it("prevents duplicate attendance for existing patient with same type on same day", async () => {
      const user = userEvent.setup();

      // Mock the API calls
      mockGetAttendancesByDate.mockResolvedValue(mockExistingAttendances);

      render(
        <PatientWalkInForm
          onRegisterNewAttendance={mockOnRegisterNewAttendance}
        />
      );

      // Fill in the form with existing patient name
      const nameInput = screen.getByLabelText(/Nome do Paciente/);
      await user.type(nameInput, "João Silva");

      // Wait for patient suggestion and click it
      await waitFor(() => {
        const suggestion = screen.getByText("João Silva");
        expect(suggestion).toBeInTheDocument();
      });

      const suggestion = screen.getByText("João Silva");
      await user.click(suggestion);

      // Select attendance type that already exists (spiritual)
      const spiritualCheckbox = screen.getByLabelText("Consulta Espiritual");
      await user.click(spiritualCheckbox);

      // Submit the form
      const submitButton = screen.getByRole("button", {
        name: /check.in|registrar|salvar/i,
      });
      await user.click(submitButton);

      // Should show error message
      await waitFor(() => {
        expect(
          screen.getByText(
            /Este paciente já possui um atendimento de.*agendado para este dia/
          )
        ).toBeInTheDocument();
      });

      // Should not create attendance
      expect(mockCreateAttendance).not.toHaveBeenCalled();
    });

    it("allows attendance for existing patient with different type on same day", async () => {
      const user = userEvent.setup();

      // Mock the API calls - existing attendance is spiritual, new one is lightBath
      mockGetAttendancesByDate.mockResolvedValue(mockExistingAttendances);
      mockCreateAttendance.mockResolvedValue({
        id: 2,
        attendanceType: "lightBath",
        patientId: 1,
        status: "checked_in",
        checkedInTime: "11:00:00",
        createdAt: "2025-01-15T11:00:00Z",
        updatedAt: "2025-01-15T11:00:00Z",
      });

      render(
        <PatientWalkInForm
          onRegisterNewAttendance={mockOnRegisterNewAttendance}
        />
      );

      // Fill in the form with existing patient name
      const nameInput = screen.getByLabelText(/Nome do Paciente/);
      await user.type(nameInput, "João Silva");

      // Wait for patient suggestion and click it
      await waitFor(() => {
        const suggestion = screen.getByText("João Silva");
        expect(suggestion).toBeInTheDocument();
      });

      const suggestion = screen.getByText("João Silva");
      await user.click(suggestion);

      // Select different attendance type (lightBath)
      const lightBathCheckbox = screen.getByLabelText("Banho de Luz");
      await user.click(lightBathCheckbox);

      // Submit the form
      const submitButton = screen.getByRole("button", {
        name: /check.in|registrar|salvar/i,
      });
      await user.click(submitButton);

      // Should create attendance successfully
      await waitFor(() => {
        expect(mockCreateAttendance).toHaveBeenCalled();
      });

      // Should not show duplicate error
      expect(
        screen.queryByText(
          /Este paciente já possui um atendimento de.*agendado para este dia/
        )
      ).not.toBeInTheDocument();
    });

    it("handles API error gracefully when checking for duplicates", async () => {
      const user = userEvent.setup();

      // Mock API error
      mockGetAttendancesByDate.mockRejectedValue(new Error("API Error"));

      render(
        <PatientWalkInForm
          onRegisterNewAttendance={mockOnRegisterNewAttendance}
        />
      );

      // Fill in the form
      const nameInput = screen.getByLabelText(/Nome do Paciente/);
      await user.type(nameInput, "João Silva");

      // Wait for patient suggestion and click it
      await waitFor(() => {
        const suggestion = screen.getByText("João Silva");
        expect(suggestion).toBeInTheDocument();
      });

      const suggestion = screen.getByText("João Silva");
      await user.click(suggestion);

      const spiritualCheckbox = screen.getByLabelText("Consulta Espiritual");
      await user.click(spiritualCheckbox);

      // Submit the form
      const submitButton = screen.getByRole("button", {
        name: /check.in|registrar|salvar/i,
      });
      await user.click(submitButton);

      // Should show error message about checking duplicates
      await waitFor(() => {
        expect(
          screen.getByText(/Erro ao verificar atendimentos existentes/)
        ).toBeInTheDocument();
      });

      expect(mockCreateAttendance).not.toHaveBeenCalled();
    });
  });
});
