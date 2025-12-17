/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import BasicInfoTab from "../BasicInfoTab";
import type {
  SpiritualTreatmentData,
  TreatmentStatus,
} from "../../hooks/usePostAttendanceForm";
import type { PatientResponseDto } from "@/api/types";
import {
  PatientPriority,
  TreatmentStatus as ApiTreatmentStatus,
} from "@/api/types";

describe("BasicInfoTab", () => {
  const mockFormData: SpiritualTreatmentData = {
    mainComplaint: "Test complaint",
    treatmentStatus: "N",
    startDate: "2024-01-01",
    returnWeeks: 4,
    food: "Test food",
    water: "Test water",
    ointments: "Test ointments",
    recommendations: {
      returnWeeks: 4,
      spiritualMedicalDischarge: false,
    },
    notes: "Test notes",
  };

  const mockPatientData: PatientResponseDto = {
    id: 1,
    name: "Test Patient",
    phone: "1234567890",
    priority: PatientPriority.NORMAL,
    treatment_status: ApiTreatmentStatus.NEW_PATIENT,
    birth_date: "1990-01-01",
    main_complaint: "Test complaint",
    start_date: "2024-01-01",
    missing_appointments_streak: 0,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  const mockOnFormDataChange = jest.fn();
  const mockOnDateChange = jest.fn(() => jest.fn());

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render without crashing", () => {
    render(
      <BasicInfoTab
        formData={mockFormData}
        currentTreatmentStatus="N"
        patientData={mockPatientData}
        onFormDataChange={mockOnFormDataChange}
        onDateChange={mockOnDateChange}
      />
    );

    expect(
      screen.getByText("Informações Básicas do Atendimento")
    ).toBeInTheDocument();
  });

  it("should display form fields with correct values", () => {
    render(
      <BasicInfoTab
        formData={mockFormData}
        currentTreatmentStatus="N"
        patientData={mockPatientData}
        onFormDataChange={mockOnFormDataChange}
        onDateChange={mockOnDateChange}
      />
    );

    expect(screen.getByLabelText("Principal Queixa *")).toHaveValue(
      "Test complaint"
    );
    expect(screen.getByLabelText("Status do Tratamento *")).toHaveValue("N");
    expect(screen.getByLabelText("Semanas para Retorno *")).toHaveValue(4);
    expect(screen.getByLabelText("Data de Início *")).toHaveValue("2024-01-01");
    expect(screen.getByLabelText("Observações Adicionais")).toHaveValue(
      "Test notes"
    );
  });

  it("should call onFormDataChange when main complaint changes", () => {
    render(
      <BasicInfoTab
        formData={mockFormData}
        currentTreatmentStatus="N"
        patientData={mockPatientData}
        onFormDataChange={mockOnFormDataChange}
        onDateChange={mockOnDateChange}
      />
    );

    const mainComplaintTextarea = screen.getByLabelText("Principal Queixa *");
    fireEvent.change(mainComplaintTextarea, {
      target: { value: "New complaint" },
    });

    expect(mockOnFormDataChange).toHaveBeenCalledWith(
      "mainComplaint",
      "New complaint"
    );
  });

  it("should call onFormDataChange when treatment status changes", () => {
    render(
      <BasicInfoTab
        formData={mockFormData}
        currentTreatmentStatus="N"
        patientData={mockPatientData}
        onFormDataChange={mockOnFormDataChange}
        onDateChange={mockOnDateChange}
      />
    );

    const treatmentStatusSelect = screen.getByLabelText(
      "Status do Tratamento *"
    );
    fireEvent.change(treatmentStatusSelect, { target: { value: "T" } });

    expect(mockOnFormDataChange).toHaveBeenCalledWith("treatmentStatus", "T");
  });

  it("should handle return weeks input with proper validation", () => {
    render(
      <BasicInfoTab
        formData={mockFormData}
        currentTreatmentStatus="N"
        patientData={mockPatientData}
        onFormDataChange={mockOnFormDataChange}
        onDateChange={mockOnDateChange}
      />
    );

    const returnWeeksInput = screen.getByLabelText("Semanas para Retorno *");

    // Test valid value
    fireEvent.change(returnWeeksInput, { target: { value: "8" } });
    expect(mockOnFormDataChange).toHaveBeenCalledWith("returnWeeks", 8);

    // Test edge case - minimum value
    fireEvent.change(returnWeeksInput, { target: { value: "0" } });
    expect(mockOnFormDataChange).toHaveBeenCalledWith("returnWeeks", 1);

    // Test edge case - maximum value
    fireEvent.change(returnWeeksInput, { target: { value: "100" } });
    expect(mockOnFormDataChange).toHaveBeenCalledWith("returnWeeks", 52);

    // Test invalid input
    fireEvent.change(returnWeeksInput, { target: { value: "invalid" } });
    expect(mockOnFormDataChange).toHaveBeenCalledWith("returnWeeks", 1);
  });

  it("should call onFormDataChange when notes change", () => {
    render(
      <BasicInfoTab
        formData={mockFormData}
        currentTreatmentStatus="N"
        patientData={mockPatientData}
        onFormDataChange={mockOnFormDataChange}
        onDateChange={mockOnDateChange}
      />
    );

    const notesTextarea = screen.getByLabelText("Observações Adicionais");
    fireEvent.change(notesTextarea, { target: { value: "New notes" } });

    expect(mockOnFormDataChange).toHaveBeenCalledWith("notes", "New notes");
  });

  it("should call onDateChange when start date changes", () => {
    const mockDateChangeHandler = jest.fn();
    mockOnDateChange.mockReturnValue(mockDateChangeHandler);

    render(
      <BasicInfoTab
        formData={mockFormData}
        currentTreatmentStatus="N"
        patientData={mockPatientData}
        onFormDataChange={mockOnFormDataChange}
        onDateChange={mockOnDateChange}
      />
    );

    const startDateInput = screen.getByLabelText("Data de Início *");
    fireEvent.change(startDateInput, { target: { value: "2024-02-01" } });

    expect(mockOnDateChange).toHaveBeenCalledWith("startDate");
    expect(mockDateChangeHandler).toHaveBeenCalled();
  });

  it("should disable start date input when patient has existing start date", () => {
    const patientWithStartDate = {
      ...mockPatientData,
      start_date: "2023-01-01",
    };

    render(
      <BasicInfoTab
        formData={mockFormData}
        currentTreatmentStatus="T"
        patientData={patientWithStartDate}
        onFormDataChange={mockOnFormDataChange}
        onDateChange={mockOnDateChange}
      />
    );

    const startDateInput = screen.getByLabelText("Data de Início *");
    expect(startDateInput).toBeDisabled();
    expect(
      screen.getByText("Data de início já estabelecida (somente leitura)")
    ).toBeInTheDocument();
  });

  it("should show different help text for new patients without start date", () => {
    render(
      <BasicInfoTab
        formData={mockFormData}
        currentTreatmentStatus="N"
        patientData={null}
        onFormDataChange={mockOnFormDataChange}
        onDateChange={mockOnDateChange}
      />
    );

    expect(
      screen.getByText("Data de início será definida nesta consulta")
    ).toBeInTheDocument();
  });

  it("should display current treatment status correctly", () => {
    render(
      <BasicInfoTab
        formData={mockFormData}
        currentTreatmentStatus="T"
        patientData={mockPatientData}
        onFormDataChange={mockOnFormDataChange}
        onDateChange={mockOnDateChange}
      />
    );

    expect(screen.getByText("Status atual: Em tratamento")).toBeInTheDocument();
  });

  it("should display all treatment status options", () => {
    render(
      <BasicInfoTab
        formData={mockFormData}
        currentTreatmentStatus="N"
        patientData={mockPatientData}
        onFormDataChange={mockOnFormDataChange}
        onDateChange={mockOnDateChange}
      />
    );

    expect(screen.getByText("N - Novo paciente")).toBeInTheDocument();
    expect(screen.getByText("T - Em tratamento")).toBeInTheDocument();
    expect(screen.getByText("A - Alta médica espiritual")).toBeInTheDocument();
    expect(screen.getByText("F - Faltas consecutivas")).toBeInTheDocument();
  });

  it("should show return weeks helper text", () => {
    render(
      <BasicInfoTab
        formData={mockFormData}
        currentTreatmentStatus="N"
        patientData={mockPatientData}
        onFormDataChange={mockOnFormDataChange}
        onDateChange={mockOnDateChange}
      />
    );

    expect(
      screen.getByText(
        /Uma nova consulta espiritual será agendada automaticamente para 4 semana\(s\) a partir de hoje/
      )
    ).toBeInTheDocument();
  });

  it("should handle different treatment statuses correctly", () => {
    const testCases: Array<{ status: TreatmentStatus; label: string }> = [
      { status: "N", label: "Novo paciente" },
      { status: "T", label: "Em tratamento" },
      { status: "A", label: "Alta médica espiritual" },
      { status: "F", label: "Faltas consecutivas" },
    ];

    testCases.forEach(({ status, label }) => {
      const { rerender } = render(
        <BasicInfoTab
          formData={mockFormData}
          currentTreatmentStatus={status}
          patientData={mockPatientData}
          onFormDataChange={mockOnFormDataChange}
          onDateChange={mockOnDateChange}
        />
      );

      expect(screen.getByText(`Status atual: ${label}`)).toBeInTheDocument();

      // Clean up for next iteration
      rerender(<div />);
    });
  });

  it("should have proper form structure and styling", () => {
    const { container } = render(
      <BasicInfoTab
        formData={mockFormData}
        currentTreatmentStatus="N"
        patientData={mockPatientData}
        onFormDataChange={mockOnFormDataChange}
        onDateChange={mockOnDateChange}
      />
    );

    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass("space-y-4");

    const inputs = container.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      expect(input).toHaveClass(
        "w-full",
        "px-3",
        "py-2",
        "border",
        "border-gray-300",
        "rounded-md"
      );
    });
  });
});
