import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PatientWalkInForm from "../PatientWalkInForm";
import { createAttendance, getAttendancesByDate } from "@/api/attendances";
import { transformAttendanceTypeToApi } from "@/utils/apiTransformers";
import {
  AttendanceType,
  AttendanceStatus,
  PatientPriority,
  TreatmentStatus,
} from "@/api/types";
import { IAttendanceType } from "@/types/globals";

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
    type: AttendanceType.SPIRITUAL,
    patient_id: 1,
    status: AttendanceStatus.CHECKED_IN,
    scheduled_date: "2025-01-15",
    scheduled_time: "10:00",
    checked_in_time: "10:00:00",
    notes: "Test attendance",
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z",
    patient: {
      id: 1,
      name: "João Silva",
      phone: "11999999999",
      priority: PatientPriority.NORMAL,
      treatment_status: TreatmentStatus.IN_TREATMENT,
      start_date: "2025-01-01",
      missing_appointments_streak: 0,
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    },
  },
];

describe("PatientWalkInForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTransformAttendanceTypeToApi.mockImplementation(
      (type: IAttendanceType) => type as AttendanceType
    );
  });

  it("renders the form correctly", () => {
    render(
      <PatientWalkInForm
        onRegisterNewAttendance={mockOnRegisterNewAttendance}
      />
    );

    expect(screen.getByText("Nome do Paciente")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Buscar paciente pelo nome...")
    ).toBeInTheDocument();
    expect(screen.getByText("Consulta Espiritual")).toBeInTheDocument();
    expect(screen.getByText("Banho de Luz")).toBeInTheDocument();
  });

  describe("Duplicate Prevention", () => {
    it("prevents duplicate attendance for existing patient with same type on same day", async () => {
      const user = userEvent.setup();

      // Mock the API calls
      mockGetAttendancesByDate.mockResolvedValue({
        success: true,
        value: mockExistingAttendances,
      });

      render(
        <PatientWalkInForm
          onRegisterNewAttendance={mockOnRegisterNewAttendance}
        />
      );

      // Fill in the form with existing patient name
      const nameInput = screen.getByPlaceholderText(
        "Buscar paciente pelo nome..."
      );
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
            "Agendamento duplicado! O paciente João Silva já possui atendimento(s) agendado(s) para hoje nos seguintes tipos: Consulta Espiritual."
          )
        ).toBeInTheDocument();
      });

      // Should not create attendance
      expect(mockCreateAttendance).not.toHaveBeenCalled();
    });

    it("allows attendance for existing patient with different type on same day", async () => {
      const user = userEvent.setup();

      // Mock the API calls - existing attendance is spiritual, new one is lightBath
      mockGetAttendancesByDate.mockResolvedValue({
        success: true,
        value: mockExistingAttendances,
      });
      mockCreateAttendance.mockResolvedValue({
        success: true,
        value: {
          id: 2,
          type: AttendanceType.LIGHT_BATH,
          patient_id: 1,
          status: AttendanceStatus.CHECKED_IN,
          scheduled_date: "2025-01-15",
          scheduled_time: "11:00",
          checked_in_time: "11:00:00",
          notes: "Test attendance",
          created_at: "2025-01-15T11:00:00Z",
          updated_at: "2025-01-15T11:00:00Z",
        },
      });

      render(
        <PatientWalkInForm
          onRegisterNewAttendance={mockOnRegisterNewAttendance}
        />
      );

      // Fill in the form with existing patient name
      const nameInput = screen.getByPlaceholderText(
        "Buscar paciente pelo nome..."
      );
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
      mockCreateAttendance.mockResolvedValue({
        success: false,
        error: "Creation failed",
      });

      render(
        <PatientWalkInForm
          onRegisterNewAttendance={mockOnRegisterNewAttendance}
        />
      );

      // Fill in the form
      const nameInput = screen.getByPlaceholderText(
        "Buscar paciente pelo nome..."
      );
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

      // Should show error message when attendance creation fails
      await waitFor(() => {
        expect(
          screen.getByText(
            "Erro ao criar 1 atendimento(s). Algumas podem ter sido criadas com sucesso."
          )
        ).toBeInTheDocument();
      });

      // CreateAttendance should be called (duplicate check failed, so it proceeds)
      expect(mockCreateAttendance).toHaveBeenCalled();
    });
  });
});
