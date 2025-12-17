import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NewPatientCheckInForm from "../NewPatientCheckInForm";
import { Patient } from "@/types/types";

import {
  PatientPriority,
  TreatmentStatus,
  AttendanceType,
  AttendanceStatus,
} from "@/api/types";
// Mock the APIs
jest.mock("@/api/patients");

// Create mock functions for React Query mutations
const mockCreateAttendanceMutateAsync = jest.fn();
const mockCheckInAttendanceMutateAsync = jest.fn();
const mockRefreshCurrentDate = jest.fn();

jest.mock("@/hooks/useAttendanceManagement", () => ({
  useAttendanceManagement: () => ({
    refreshCurrentDate: mockRefreshCurrentDate,
  }),
}));

jest.mock("@/hooks/useAttendanceQueries", () => ({
  useCreateAttendance: () => ({
    mutateAsync: mockCreateAttendanceMutateAsync,
  }),
  useCheckInAttendance: () => ({
    mutateAsync: mockCheckInAttendanceMutateAsync,
  }),
}));

// Mock useUpdatePatient hook
const mockUpdatePatientMutateAsync = jest.fn();
jest.mock("@/hooks/usePatientQueries", () => ({
  useUpdatePatient: () => ({
    mutateAsync: mockUpdatePatientMutateAsync,
  }),
}));

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
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <NewPatientCheckInForm {...defaultProps} {...props} />
    </QueryClientProvider>
  );
};

describe("NewPatientCheckInForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful patient update via React Query hook
    mockUpdatePatientMutateAsync.mockResolvedValue({
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

    // Mock successful attendance creation
    mockCreateAttendanceMutateAsync.mockResolvedValue({
      id: 123,
      patientId: 1,
      type: AttendanceType.SPIRITUAL,
      status: AttendanceStatus.SCHEDULED,
      scheduledDate: "2025-01-15",
      scheduledTime: "09:00",
    });

    // Mock successful check-in
    mockCheckInAttendanceMutateAsync.mockResolvedValue({
      id: 123,
      patientId: 1,
      type: AttendanceType.SPIRITUAL,
      status: AttendanceStatus.CHECKED_IN,
      scheduledDate: "2025-01-15",
      scheduledTime: "09:00",
      checkedInTime: "09:00:00",
    });

    // Mock refresh function
    mockRefreshCurrentDate.mockResolvedValue(undefined);
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

  it("validates phone is required", async () => {
    renderComponent();

    // Clear phone field
    const phoneInput = screen.getByDisplayValue("(11) 99999-9999");
    fireEvent.change(phoneInput, { target: { value: "" } });

    // Try to submit
    fireEvent.click(screen.getByText("Fazer Check-in"));

    await waitFor(() => {
      expect(screen.getByText("Telefone é obrigatório.")).toBeInTheDocument();
    });
  });

  it("validates birth date is required", async () => {
    renderComponent();

    // Clear birth date field
    const birthDateInput = screen.getByDisplayValue("1990-01-01");
    fireEvent.change(birthDateInput, { target: { value: "" } });

    // Try to submit
    fireEvent.click(screen.getByText("Fazer Check-in"));

    await waitFor(() => {
      expect(
        screen.getByText("Data de nascimento é obrigatória.")
      ).toBeInTheDocument();
    });
  });

  it("handles phone number formatting", () => {
    renderComponent();

    const phoneInput = screen.getByDisplayValue("(11) 99999-9999");
    fireEvent.change(phoneInput, { target: { value: "11988887777" } });

    expect(phoneInput).toHaveValue("(11) 98888-7777");
  });

  it("handles priority field changes", () => {
    renderComponent();

    // The mock patient has priority "2", which corresponds to "2 - Idoso/crianças"
    const prioritySelect = screen.getByDisplayValue("2 - Idoso/crianças");
    fireEvent.change(prioritySelect, { target: { value: "1" } });

    expect(prioritySelect).toHaveValue("1");
  });

  it("handles birth date field changes", () => {
    renderComponent();

    const birthDateInput = screen.getByDisplayValue("1990-01-01");
    fireEvent.change(birthDateInput, { target: { value: "1985-05-15" } });

    expect(birthDateInput).toHaveValue("1985-05-15");
  });

  it("creates new attendance when no attendanceId provided", async () => {
    renderComponent();

    fireEvent.click(screen.getByText("Fazer Check-in"));

    await waitFor(() => {
      expect(mockUpdatePatientMutateAsync).toHaveBeenCalledWith({
        patientId: "1",
        data: expect.objectContaining({
          name: "João Silva",
          phone: "(11) 99999-9999",
          birth_date: "1990-01-01",
        }),
      });
      expect(mockCreateAttendanceMutateAsync).toHaveBeenCalled();
      expect(mockCheckInAttendanceMutateAsync).toHaveBeenCalled();
    });
  });

  it("checks in existing attendance when attendanceId provided", async () => {
    renderComponent({ attendanceId: 123 });

    fireEvent.click(screen.getByText("Fazer Check-in"));

    await waitFor(() => {
      expect(mockUpdatePatientMutateAsync).toHaveBeenCalled();
      expect(mockCreateAttendanceMutateAsync).not.toHaveBeenCalled();
      expect(mockCheckInAttendanceMutateAsync).toHaveBeenCalledWith({
        attendanceId: 123,
        patientName: "João Silva",
      });
    });
  });

  it("handles API errors gracefully", async () => {
    mockUpdatePatientMutateAsync.mockRejectedValue(
      new Error("Patient update failed")
    );

    renderComponent();

    fireEvent.click(screen.getByText("Fazer Check-in"));

    await waitFor(() => {
      expect(
        screen.getByText(/Erro ao processar check-in/)
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
    mockUpdatePatientMutateAsync.mockImplementation(
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
