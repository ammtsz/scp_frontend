import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import NewPatientCheckInForm from "../NewPatientCheckInForm";
import { Patient } from "@/types/types";
import * as attendancesApi from "@/api/attendances";
import * as patientsApi from "@/api/patients";
import {
  PatientPriority,
  TreatmentStatus,
  AttendanceType,
  AttendanceStatus,
} from "@/api/types";
// Mock the APIs
jest.mock("@/api/attendances");
jest.mock("@/api/patients");
jest.mock("@/hooks/useAttendanceQueries", () => ({
  useAttendancesByDate: () => ({
    refetch: jest.fn(),
  }),
}));

const mockCreateAttendance =
  attendancesApi.createAttendance as jest.MockedFunction<
    typeof attendancesApi.createAttendance
  >;
const mockCheckInAttendance =
  attendancesApi.checkInAttendance as jest.MockedFunction<
    typeof attendancesApi.checkInAttendance
  >;
const mockUpdatePatient = patientsApi.updatePatient as jest.MockedFunction<
  typeof patientsApi.updatePatient
>;

const mockPatient: Patient = {
  id: "1",
  name: "João Silva",
  phone: "(11) 99999-9999",
  birthDate: new Date("1990-01-01"),
  priority: "2",
  status: "N",
  mainComplaint: "Test complaint",
  startDate: new Date(),
  dischargeDate: null,
  nextAttendanceDates: [],
  currentRecommendations: {
    date: new Date(),
    food: "",
    water: "",
    ointment: "",
    lightBath: false,
    rod: false,
    spiritualTreatment: false,
    returnWeeks: 0,
  },
  previousAttendances: [],
};

const defaultProps = {
  patient: mockPatient,
  onSuccess: jest.fn(),
  onCancel: jest.fn(),
};

const renderComponent = (props = {}) => {
  return render(<NewPatientCheckInForm {...defaultProps} {...props} />);
};

describe("NewPatientCheckInForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdatePatient.mockResolvedValue({
      success: true,
      value: {
        id: 1,
        name: "João Silva",
        priority: PatientPriority.INTERMEDIATE,
        treatment_status: TreatmentStatus.DISCHARGED,
        start_date: "2025-01-15",
        missing_appointments_streak: 0,
        created_at: "2025-01-15T00:00:00Z",
        updated_at: "2025-01-15T00:00:00Z",
      },
    });
    mockCreateAttendance.mockResolvedValue({
      success: true,
      value: {
        id: 1,
        patient_id: 1,
        type: AttendanceType.SPIRITUAL,
        status: AttendanceStatus.SCHEDULED,
        scheduled_date: "2025-01-15",
        scheduled_time: "09:00",
        created_at: "2025-01-15T00:00:00Z",
        updated_at: "2025-01-15T00:00:00Z",
      },
    });
    mockCheckInAttendance.mockResolvedValue({
      success: true,
      value: {
        id: 1,
        patient_id: 1,
        type: AttendanceType.SPIRITUAL,
        status: AttendanceStatus.CHECKED_IN,
        scheduled_date: "2025-01-15",
        scheduled_time: "09:00",
        checked_in_time: "09:00:00",
        created_at: "2025-01-15T00:00:00Z",
        updated_at: "2025-01-15T00:00:00Z",
      },
    });
  });

  it("renders form fields with patient data", () => {
    renderComponent();

    expect(screen.getByDisplayValue("João Silva")).toBeInTheDocument();
    expect(screen.getByDisplayValue("(11) 99999-9999")).toBeInTheDocument();
    expect(screen.getByDisplayValue("1990-01-01")).toBeInTheDocument();

    // Check priority select by getting the element and checking its value
    const prioritySelect = screen.getByRole("combobox");
    expect(prioritySelect).toHaveValue("2");
  });

  it("validates required fields", async () => {
    renderComponent();

    // Clear name field
    fireEvent.change(screen.getByDisplayValue("João Silva"), {
      target: { value: "" },
    });

    // Try to submit
    fireEvent.click(screen.getByText("Fazer Check-in"));

    await waitFor(() => {
      expect(screen.getByText("Nome é obrigatório.")).toBeInTheDocument();
    });
  });

  it("handles phone number formatting", () => {
    renderComponent();

    const phoneInput = screen.getByDisplayValue("(11) 99999-9999");
    fireEvent.change(phoneInput, { target: { value: "11988887777" } });

    expect(phoneInput).toHaveValue("(11) 98888-7777");
  });

  it("creates new attendance when no attendanceId provided", async () => {
    renderComponent();

    fireEvent.click(screen.getByText("Fazer Check-in"));

    await waitFor(() => {
      expect(mockUpdatePatient).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({
          name: "João Silva",
          phone: "(11) 99999-9999",
          birth_date: "1990-01-01",
        })
      );
      expect(mockCreateAttendance).toHaveBeenCalled();
      expect(mockCheckInAttendance).toHaveBeenCalled();
    });
  });

  it("checks in existing attendance when attendanceId provided", async () => {
    renderComponent({ attendanceId: 123 });

    fireEvent.click(screen.getByText("Fazer Check-in"));

    await waitFor(() => {
      expect(mockUpdatePatient).toHaveBeenCalled();
      expect(mockCreateAttendance).not.toHaveBeenCalled();
      expect(mockCheckInAttendance).toHaveBeenCalledWith("123");
    });
  });

  it("handles API errors gracefully", async () => {
    mockUpdatePatient.mockResolvedValue({
      success: false,
      error: "Patient update failed",
    });

    renderComponent();

    fireEvent.click(screen.getByText("Fazer Check-in"));

    await waitFor(() => {
      expect(
        screen.getByText(/Erro ao atualizar informações do paciente/)
      ).toBeInTheDocument();
    });
  });

  it("calls onSuccess callback with updated patient data", async () => {
    const onSuccess = jest.fn();
    renderComponent({ onSuccess });

    fireEvent.click(screen.getByText("Fazer Check-in"));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "João Silva",
          phone: "(11) 99999-9999",
          status: "T",
        })
      );
    });
  });

  it("calls onCancel when cancel button is clicked", () => {
    const onCancel = jest.fn();
    renderComponent({ onCancel });

    fireEvent.click(screen.getByText("Cancelar"));

    expect(onCancel).toHaveBeenCalled();
  });

  it("disables form during submission", async () => {
    // Mock a slow API call
    mockUpdatePatient.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: true,
                value: {
                  id: 1,
                  name: "João Silva",
                  priority: PatientPriority.INTERMEDIATE,
                  treatment_status: TreatmentStatus.DISCHARGED,
                  start_date: "2025-01-15",
                  missing_appointments_streak: 0,
                  created_at: "2025-01-15T00:00:00Z",
                  updated_at: "2025-01-15T00:00:00Z",
                },
              }),
            100
          )
        )
    );

    renderComponent();

    fireEvent.click(screen.getByText("Fazer Check-in"));

    // Check that form is disabled during submission
    expect(screen.getByText("Processando...")).toBeInTheDocument();
    expect(screen.getByDisplayValue("João Silva")).toBeDisabled();
    expect(screen.getByText("Cancelar")).toBeDisabled();
  });
});
