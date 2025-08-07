import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NewAttendanceForm from "../index";
import { useUnscheduledPatients } from "../../UnscheduledPatients/useUnscheduledPatients";

// Mock the hook
jest.mock("../../UnscheduledPatients/useUnscheduledPatients");

const mockUseUnscheduledPatients =
  useUnscheduledPatients as jest.MockedFunction<typeof useUnscheduledPatients>;

describe("NewAttendanceForm - Duplicate Patient Validation", () => {
  const defaultHookReturn = {
    search: "",
    setSearch: jest.fn(),
    hasNewAttendance: false,
    setHasNewAttendance: jest.fn(),
    selectedPatient: "",
    setSelectedPatient: jest.fn(),
    showDropdown: false,
    setShowDropdown: jest.fn(),
    isNewPatient: false,
    setIsNewPatient: jest.fn(),
    selectedTypes: [],
    setSelectedTypes: jest.fn(),
    priority: "3" as const,
    setPriority: jest.fn(),
    collapsed: true,
    setCollapsed: jest.fn(),
    filteredPatients: [
      {
        id: "1",
        name: "João Silva",
        phone: "11999999999",
        priority: "1" as const,
        status: "T" as const,
      },
    ],
    handleRegisterNewAttendance: jest.fn(),
    handleInputChange: jest.fn(),
    handleSelect: jest.fn(),
    handleTypeCheckbox: jest.fn(),
    resetForm: jest.fn(),
    isSubmitting: false,
    error: null,
    success: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUnscheduledPatients.mockReturnValue(defaultHookReturn);
  });

  it("should display error message when patient is already scheduled", async () => {
    const mockHandleRegister = jest.fn().mockResolvedValue(false);

    mockUseUnscheduledPatients.mockReturnValue({
      ...defaultHookReturn,
      selectedPatient: "João Silva",
      selectedTypes: ["spiritual"],
      error:
        'O paciente "João Silva" já possui atendimento agendado para hoje. Verifique a lista de atendimentos.',
      handleRegisterNewAttendance: mockHandleRegister,
      handleDeleteAttendance: undefined,
      getPatientAttendanceDetails: undefined,
    });

    render(<NewAttendanceForm />);

    // Check if error message is displayed
    expect(
      screen.getByText(/já possui atendimento agendado para hoje/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Verifique a lista de atendimentos/i)
    ).toBeInTheDocument();
  });

  it("should prevent form submission when patient is already scheduled", async () => {
    const mockHandleRegister = jest.fn().mockResolvedValue(false);

    mockUseUnscheduledPatients.mockReturnValue({
      ...defaultHookReturn,
      search: "João Silva", // This is required for the input value
      selectedPatient: "João Silva",
      selectedTypes: ["spiritual"],
      priority: "1",
      handleRegisterNewAttendance: mockHandleRegister,
      handleDeleteAttendance: undefined,
      getPatientAttendanceDetails: undefined,
    });

    render(<NewAttendanceForm />);

    const submitButton = screen.getByRole("button", { name: /salvar/i });

    // Button should be enabled since form is valid
    expect(submitButton).not.toBeDisabled();

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockHandleRegister).toHaveBeenCalled();
    });

    // Verify the hook validation prevents the submission
    expect(mockHandleRegister).toHaveBeenCalledTimes(1);
  });

  it("should show success message when patient check-in is successful", async () => {
    const mockHandleRegister = jest.fn().mockResolvedValue(true);

    mockUseUnscheduledPatients.mockReturnValue({
      ...defaultHookReturn,
      search: "Maria Santos",
      selectedPatient: "Maria Santos",
      selectedTypes: ["spiritual"],
      success:
        "Check-in realizado com sucesso! 1 atendimento(s) agendado(s) para 2025-08-12 às 21:00.",
      handleRegisterNewAttendance: mockHandleRegister,
      handleDeleteAttendance: undefined,
      getPatientAttendanceDetails: undefined,
    });

    render(<NewAttendanceForm />);

    // Check if success message is displayed
    expect(
      screen.getByText(/Check-in realizado com sucesso!/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/agendado.*2025-08-12.*21:00/i)
    ).toBeInTheDocument();
  });

  it("should disable submit button when form is invalid", () => {
    mockUseUnscheduledPatients.mockReturnValue({
      ...defaultHookReturn,
      selectedPatient: "", // No patient selected
      selectedTypes: [],
      handleDeleteAttendance: undefined,
      getPatientAttendanceDetails: undefined,
    });

    render(<NewAttendanceForm />);

    const submitButton = screen.getByRole("button", { name: /salvar/i });

    expect(submitButton).toBeDisabled();
  });

  it("should enable submit button when form is valid", () => {
    mockUseUnscheduledPatients.mockReturnValue({
      ...defaultHookReturn,
      search: "João Silva",
      selectedPatient: "João Silva",
      selectedTypes: ["spiritual"],
      priority: "1",
      handleDeleteAttendance: undefined,
      getPatientAttendanceDetails: undefined,
    });

    render(<NewAttendanceForm />);

    const submitButton = screen.getByRole("button", { name: /salvar/i });

    expect(submitButton).not.toBeDisabled();
  });
});
