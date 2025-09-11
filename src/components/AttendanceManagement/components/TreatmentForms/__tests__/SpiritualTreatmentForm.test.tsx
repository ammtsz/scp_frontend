import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SpiritualTreatmentForm from "../SpiritualTreatmentForm";
import { createAttendance } from "@/api/attendances";
import { createTreatmentSessionRecord } from "@/api/treatment-session-records";
import { getPatientById } from "@/api/patients";
import { createTreatmentSession } from "@/api/treatment-sessions";
import { AttendanceType } from "@/api/types";

// Mock the API functions
jest.mock("@/api/attendances");
jest.mock("@/api/treatment-session-records");
jest.mock("@/api/patients");
jest.mock("@/api/treatment-sessions");

const mockCreateAttendance = createAttendance as jest.MockedFunction<
  typeof createAttendance
>;
const mockCreateTreatmentSessionRecord =
  createTreatmentSessionRecord as jest.MockedFunction<
    typeof createTreatmentSessionRecord
  >;
const mockGetPatientById = getPatientById as jest.MockedFunction<
  typeof getPatientById
>;
const mockCreateTreatmentSession =
  createTreatmentSession as jest.MockedFunction<typeof createTreatmentSession>;

const defaultProps = {
  attendanceId: 1,
  patientId: 1,
  patientName: "João Silva",
  currentTreatmentStatus: "T" as const,
  onSubmit: jest.fn(),
  onCancel: jest.fn(),
  isLoading: false,
};

const mockAttendanceResponse = {
  id: 100,
  patient_id: 1,
  type: AttendanceType.ROD,
  status: "scheduled" as const,
  scheduled_date: "2025-09-17",
  scheduled_time: "08:00",
  notes: "Test appointment",
  created_at: "2025-09-10T00:00:00Z",
  updated_at: "2025-09-10T00:00:00Z",
};

describe("SpiritualTreatmentForm - Error Handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock patient API to return valid data
    mockGetPatientById.mockResolvedValue({
      success: true,
      value: {
        id: 1,
        name: "João Silva",
        phone: "11999999999",
        birth_date: "1980-01-01",
        priority: 3,
        treatment_status: "N",
        start_date: "2025-01-01",
        missing_appointments_streak: 0,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      },
    });

    // Mock treatment session creation to succeed
    mockCreateTreatmentSession.mockResolvedValue({
      success: true,
      value: {
        id: 1,
        patient_id: 1,
        type: "rod",
        status: "active",
        total_sessions_recommended: 2,
        sessions_completed: 0,
        created_at: "2025-09-10T00:00:00Z",
        updated_at: "2025-09-10T00:00:00Z",
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Attendance creation errors", () => {
    it("should display error when attendance creation fails due to time slot conflict", async () => {
      // Mock successful treatment record creation
      const mockOnSubmit = jest
        .fn()
        .mockResolvedValue({ treatmentRecordId: 1 });

      // Mock attendance creation failure
      mockCreateAttendance.mockResolvedValue({
        success: false,
        error: "No available slots for rod attendance on 2025-09-17 at 08:00",
      });

      render(
        <SpiritualTreatmentForm
          {...defaultProps}
          onSubmit={mockOnSubmit}
          initialData={{
            mainComplaint: "Dor nas costas",
            treatmentStatus: "T",
            attendanceDate: new Date(),
            startDate: new Date("2025-09-17"),
            returnWeeks: 2,
            food: "",
            water: "",
            ointments: "",
            recommendations: {
              returnWeeks: 2,
              spiritualMedicalDischarge: false,
              rod: {
                startDate: new Date("2025-09-17"),
                treatments: [
                  {
                    location: "Coluna",
                    quantity: 2,
                    startDate: new Date("2025-09-17"),
                  },
                ],
              },
            },
            notes: "",
          }}
        />
      );

      // Wait for patient data to load
      await waitFor(() => {
        expect(
          screen.getByText(/Formulário de Tratamento Espiritual - João Silva/)
        ).toBeInTheDocument();
      });

      // Submit the form
      const submitButton = screen.getByRole("button", { name: /salvar/i });
      fireEvent.click(submitButton);

      // Wait for error to appear
      await waitFor(() => {
        const errorMessage = screen.getByText(
          /No available slots for rod attendance on 2025-09-17 at 08:00/i
        );
        expect(errorMessage).toBeInTheDocument();
      });

      // Form should not close (onCancel should not be called)
      expect(defaultProps.onCancel).not.toHaveBeenCalled();
    });

    it("should display multiple errors when multiple sessions fail to create", async () => {
      // Mock successful treatment record creation
      const mockOnSubmit = jest
        .fn()
        .mockResolvedValue({ treatmentRecordId: 1 });

      // Mock attendance creation failure for both sessions
      mockCreateAttendance
        .mockResolvedValueOnce({
          success: false,
          error: "No available slots for rod attendance on 2025-09-17 at 08:00",
        })
        .mockResolvedValueOnce({
          success: false,
          error: "No available slots for rod attendance on 2025-09-24 at 08:00",
        });

      render(
        <SpiritualTreatmentForm
          {...defaultProps}
          onSubmit={mockOnSubmit}
          initialData={{
            mainComplaint: "Dor nas costas",
            treatmentStatus: "T",
            attendanceDate: new Date(),
            startDate: new Date("2025-09-17"),
            returnWeeks: 2,
            food: "",
            water: "",
            ointments: "",
            recommendations: {
              returnWeeks: 2,
              spiritualMedicalDischarge: false,
              rod: {
                startDate: new Date("2025-09-17"),
                treatments: [
                  {
                    location: "Coluna",
                    quantity: 2, // This will create 2 sessions
                    startDate: new Date("2025-09-17"),
                  },
                ],
              },
            },
            notes: "",
          }}
        />
      );

      // Wait for patient data to load
      await waitFor(() => {
        expect(
          screen.getByText(/Formulário de Tratamento Espiritual - João Silva/)
        ).toBeInTheDocument();
      });

      // Submit the form
      const submitButton = screen.getByRole("button", { name: /salvar/i });
      fireEvent.click(submitButton);

      // Wait for errors to appear
      await waitFor(() => {
        expect(
          screen.getByText(
            /No available slots for rod attendance on 2025-09-17/i
          )
        ).toBeInTheDocument();
        expect(
          screen.getByText(
            /No available slots for rod attendance on 2025-09-24/i
          )
        ).toBeInTheDocument();
      });
    });

    it("should handle successful attendance creation but failed session record creation", async () => {
      // Mock successful treatment record creation
      const mockOnSubmit = jest
        .fn()
        .mockResolvedValue({ treatmentRecordId: 1 });

      // Mock successful attendance creation
      mockCreateAttendance.mockResolvedValue({
        success: true,
        value: mockAttendanceResponse,
      });

      // Mock failed session record creation
      mockCreateTreatmentSessionRecord.mockResolvedValue({
        success: false,
        error: "Database connection error",
      });

      render(
        <SpiritualTreatmentForm
          {...defaultProps}
          onSubmit={mockOnSubmit}
          initialData={{
            mainComplaint: "Dor nas costas",
            treatmentStatus: "T",
            attendanceDate: new Date(),
            startDate: new Date("2025-09-17"),
            returnWeeks: 2,
            food: "",
            water: "",
            ointments: "",
            recommendations: {
              returnWeeks: 2,
              spiritualMedicalDischarge: false,
              rod: {
                startDate: new Date("2025-09-17"),
                treatments: [
                  {
                    location: "Coluna",
                    quantity: 1,
                    startDate: new Date("2025-09-17"),
                  },
                ],
              },
            },
            notes: "",
          }}
        />
      );

      // Wait for patient data to load
      await waitFor(() => {
        expect(
          screen.getByText(/Formulário de Tratamento Espiritual - João Silva/)
        ).toBeInTheDocument();
      });

      // Submit the form
      const submitButton = screen.getByRole("button", { name: /salvar/i });
      fireEvent.click(submitButton);

      // Wait for error to appear
      await waitFor(() => {
        expect(
          screen.getByText(
            /Erro ao criar registro da sessão 1: Database connection error/i
          )
        ).toBeInTheDocument();
      });
    });
  });
});
