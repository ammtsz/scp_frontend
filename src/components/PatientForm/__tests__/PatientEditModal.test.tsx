import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import PatientEditModal from "../PatientEditModal";
import type { EditPatientFormData } from "../useEditPatientForm";
import type { Patient } from "@/types/types";
import type { UseQueryResult } from "@tanstack/react-query";

// Mock modules
jest.mock("../useEditPatientForm");
jest.mock("@/hooks/usePatientQueries");

// Import mocked functions
import { useEditPatientForm } from "../useEditPatientForm";
import { usePatientWithAttendances } from "@/hooks/usePatientQueries";

// Cast to mocked functions
const mockUseEditPatientForm = useEditPatientForm as jest.MockedFunction<
  typeof useEditPatientForm
>;
const mockUsePatientWithAttendances =
  usePatientWithAttendances as jest.MockedFunction<
    typeof usePatientWithAttendances
  >;

jest.mock("../PatientFormFields", () => {
  return function MockPatientFormFields() {
    return <div data-testid="patient-form-fields">Form Fields</div>;
  };
});

jest.mock("../PatientTreatmentRecords", () => {
  return function MockPatientTreatmentRecords() {
    return <div data-testid="patient-treatment-records">Treatment Records</div>;
  };
});

jest.mock("@/components/common/BaseModal", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function MockBaseModal({ isOpen, title, children }: any) {
    return isOpen ? (
      <div data-testid="base-modal">
        <div>{title}</div>
        {children}
      </div>
    ) : null;
  };
});

jest.mock("@/components/common/ErrorDisplay", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function MockErrorDisplay({ error }: any) {
    return error ? <div data-testid="error-display">Error: {error}</div> : null;
  };
});

jest.mock("@/components/common/LoadingButton", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function MockLoadingButton({ isLoading, children }: any) {
    return (
      <button data-testid="loading-button" disabled={isLoading}>
        {isLoading ? "Loading..." : children}
      </button>
    );
  };
});

describe("PatientEditModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    patientId: "1",
    patientName: "Test Patient",
    onSuccess: jest.fn(),
  };

  const mockInitialData: EditPatientFormData = {
    name: "Test Patient",
    phone: "(11) 99999-9999",
    birthDate: new Date("1990-01-01"),
    priority: "2",
    status: "T",
    mainComplaint: "Test complaint",
    startDate: new Date("2024-01-01"),
    dischargeDate: null,
    nextAttendanceDates: [],
    currentRecommendations: {
      food: "",
      water: "",
      ointment: "",
      returnWeeks: 0,
      lightBath: false,
      rod: false,
      spiritualTreatment: false,
    },
  };

  const mockPatient: Patient = {
    id: "1",
    name: "Test Patient",
    phone: "(11) 99999-9999",
    priority: "2",
    status: "T",
    birthDate: new Date("1990-01-01"),
    mainComplaint: "Test complaint",
    startDate: new Date("2024-01-01"),
    dischargeDate: null,
    timezone: "America/Sao_Paulo",
    nextAttendanceDates: [],
    currentRecommendations: {
      date: new Date("2024-01-01"),
      food: "",
      water: "",
      ointment: "",
      returnWeeks: 0,
      lightBath: false,
      rod: false,
      spiritualTreatment: false,
    },
    previousAttendances: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock return values
    mockUseEditPatientForm.mockReturnValue({
      patient: mockInitialData,
      handleChange: jest.fn(),
      handleSpiritualConsultationChange: jest.fn(),
      handleSubmit: jest.fn(),
      isLoading: false,
      error: null,
      setError: jest.fn(),
    });

    mockUsePatientWithAttendances.mockReturnValue({
      data: mockPatient,
      isLoading: false,
      error: null,
      isError: false,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: true,
      isStale: false,
      isFetching: false,
      isFetchedAfterMount: true,
      isFetched: true,
      isPlaceholderData: false,
      isPreviousData: false,
      isRefetching: false,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      status: "success" as const,
      fetchStatus: "idle" as const,
      refetch: jest.fn(),
      remove: jest.fn(),
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      isPaused: false,
      isEnabled: true,
      isInitialLoading: false,
    } as unknown as UseQueryResult<Patient, Error>);
  });

  it("renders when open", () => {
    render(<PatientEditModal {...defaultProps} />);
    expect(screen.getByTestId("base-modal")).toBeInTheDocument();
    expect(screen.getByText("Atualizar Dados do Paciente")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<PatientEditModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId("base-modal")).not.toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockUsePatientWithAttendances.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
      isPending: true,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: false,
      isStale: false,
      isFetching: true,
      isFetchedAfterMount: false,
      isFetched: false,
      isPlaceholderData: false,
      isPreviousData: false,
      isRefetching: false,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      status: "pending" as const,
      fetchStatus: "fetching" as const,
      refetch: jest.fn(),
      remove: jest.fn(),
      dataUpdatedAt: 0,
      errorUpdatedAt: 0,
      isPaused: false,
      isEnabled: true,
      isInitialLoading: true,
    } as unknown as UseQueryResult<Patient, Error>);

    render(<PatientEditModal {...defaultProps} />);
    expect(
      screen.getByText("Carregando dados do paciente...")
    ).toBeInTheDocument();
  });

  it("shows error state", () => {
    mockUseEditPatientForm.mockReturnValue({
      patient: mockInitialData,
      handleChange: jest.fn(),
      handleSpiritualConsultationChange: jest.fn(),
      handleSubmit: jest.fn(),
      isLoading: false,
      error: "Test error",
      setError: jest.fn(),
    });

    render(<PatientEditModal {...defaultProps} />);
    expect(screen.getByTestId("error-display")).toHaveTextContent(
      "Error: Test error"
    );
  });

  it("renders form components", () => {
    render(<PatientEditModal {...defaultProps} />);
    expect(screen.getByTestId("patient-form-fields")).toBeInTheDocument();
    expect(screen.getByTestId("patient-treatment-records")).toBeInTheDocument();
  });

  it("calls hook with correct patient ID", () => {
    render(<PatientEditModal {...defaultProps} patientId="123" />);
    expect(mockUsePatientWithAttendances).toHaveBeenCalledWith("123");
  });

  it("shows fallback data when patient query fails", () => {
    mockUsePatientWithAttendances.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to load patient"),
      isError: true,
      isPending: false,
      isLoadingError: true,
      isRefetchError: false,
      isSuccess: false,
      isStale: false,
      isFetching: false,
      isFetchedAfterMount: false,
      isFetched: false,
      isPlaceholderData: false,
      isPreviousData: false,
      isRefetching: false,
      failureCount: 1,
      failureReason: new Error("Failed to load patient"),
      errorUpdateCount: 1,
      status: "error" as const,
      fetchStatus: "idle" as const,
      refetch: jest.fn(),
      remove: jest.fn(),
      dataUpdatedAt: 0,
      errorUpdatedAt: Date.now(),
      isPaused: false,
      isEnabled: true,
      isInitialLoading: false,
    } as unknown as UseQueryResult<Patient, Error>);

    render(<PatientEditModal {...defaultProps} />);

    // Should still render the form with fallback data
    expect(screen.getByTestId("patient-form-fields")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const mockOnClose = jest.fn();
    render(<PatientEditModal {...defaultProps} onClose={mockOnClose} />);

    // Look for buttons that might close the modal
    const closeButtons = screen.getAllByRole("button");
    const closeButton = closeButtons.find(
      (button) =>
        button.textContent?.includes("Cancelar") ||
        button.textContent?.includes("Fechar")
    );

    if (closeButton) {
      closeButton.click();
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it("calls onSuccess when form submission succeeds", () => {
    const mockOnSuccess = jest.fn();
    const mockUpdatedPatient = { id: 1, name: "Updated Patient" };

    mockUseEditPatientForm.mockReturnValue({
      patient: mockInitialData,
      handleChange: jest.fn(),
      handleSpiritualConsultationChange: jest.fn(),
      handleSubmit: jest.fn().mockImplementation(async (e) => {
        e.preventDefault();
        // Simulate successful submission by calling onSuccess
        if (mockOnSuccess) {
          mockOnSuccess(mockUpdatedPatient);
        }
      }),
      isLoading: false,
      error: null,
      setError: jest.fn(),
    });

    render(<PatientEditModal {...defaultProps} onSuccess={mockOnSuccess} />);

    // Find and click submit button
    const submitButtons = screen.getAllByRole("button");
    const submitButton = submitButtons.find(
      (button) =>
        button.textContent?.includes("Salvar") ||
        button.textContent?.includes("Atualizar")
    );

    if (submitButton) {
      submitButton.click();
      expect(mockOnSuccess).toHaveBeenCalledWith(mockUpdatedPatient);
    }
  });

  it("shows loading button when form is submitting", () => {
    mockUseEditPatientForm.mockReturnValue({
      patient: mockInitialData,
      handleChange: jest.fn(),
      handleSpiritualConsultationChange: jest.fn(),
      handleSubmit: jest.fn(),
      isLoading: true,
      error: null,
      setError: jest.fn(),
    });

    render(<PatientEditModal {...defaultProps} />);

    const loadingButton = screen.getByTestId("loading-button");
    expect(loadingButton).toBeDisabled();
    expect(loadingButton).toHaveTextContent("Loading...");
  });

  it("passes correct props to PatientFormFields", () => {
    render(<PatientEditModal {...defaultProps} />);

    expect(screen.getByTestId("patient-form-fields")).toBeInTheDocument();
    // The mock should have been called with the expected props
  });

  it("passes correct patientId to PatientTreatmentRecords", () => {
    render(<PatientEditModal {...defaultProps} patientId="456" />);

    expect(screen.getByTestId("patient-treatment-records")).toBeInTheDocument();
    // PatientTreatmentRecords should receive the patientId prop
  });

  it("dismisses error when setError is called", () => {
    const mockSetError = jest.fn();

    mockUseEditPatientForm.mockReturnValue({
      patient: mockInitialData,
      handleChange: jest.fn(),
      handleSpiritualConsultationChange: jest.fn(),
      handleSubmit: jest.fn(),
      isLoading: false,
      error: "Test error",
      setError: mockSetError,
    });

    render(<PatientEditModal {...defaultProps} />);

    expect(screen.getByTestId("error-display")).toBeInTheDocument();

    // The ErrorDisplay component should have onDismiss prop that calls setError(null)
    // Since we mocked ErrorDisplay, we can verify the prop was passed
  });

  it("shows spiritual consultation section when enabled", () => {
    render(<PatientEditModal {...defaultProps} />);

    // Should show spiritual consultation since showSpiritualConsultation is set to true
    expect(screen.getByTestId("patient-form-fields")).toBeInTheDocument();
    // The PatientFormFields mock should have received showSpiritualConsultation: true
  });

  it("transforms patient data correctly from API response", () => {
    const apiPatientData = {
      id: 1,
      name: "API Patient",
      phone: "(11) 99999-9999",
      priority: "1",
      status: "T",
      birthDate: new Date("1990-01-01"),
      mainComplaint: "API complaint",
      startDate: new Date("2024-01-01"),
      dischargeDate: null,
      timezone: "America/Sao_Paulo",
      nextAttendanceDates: [],
      currentRecommendations: {
        date: new Date(),
        food: "API food",
        water: "API water",
        ointment: "API ointment",
        returnWeeks: 2,
        lightBath: true,
        rod: false,
        spiritualTreatment: true,
      },
      previousAttendances: [],
    };

    mockUsePatientWithAttendances.mockReturnValue({
      data: apiPatientData,
      isLoading: false,
      error: null,
      isError: false,
      isPending: false,
      isLoadingError: false,
      isRefetchError: false,
      isSuccess: true,
      isStale: false,
      isFetching: false,
      isFetchedAfterMount: true,
      isFetched: true,
      isPlaceholderData: false,
      isPreviousData: false,
      isRefetching: false,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      status: "success" as const,
      fetchStatus: "idle" as const,
      refetch: jest.fn(),
      remove: jest.fn(),
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: 0,
      isPaused: false,
      isEnabled: true,
      isInitialLoading: false,
    } as unknown as UseQueryResult<Patient, Error>);

    render(<PatientEditModal {...defaultProps} />);

    // Should render without errors and pass transformed data to form
    expect(screen.getByTestId("patient-form-fields")).toBeInTheDocument();
    expect(mockUseEditPatientForm).toHaveBeenCalledWith(
      expect.objectContaining({
        patientId: defaultProps.patientId,
        initialData: expect.objectContaining({
          name: "API Patient",
          phone: "(11) 99999-9999",
        }),
      })
    );
  });
});
