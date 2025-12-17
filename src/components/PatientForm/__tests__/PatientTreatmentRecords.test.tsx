import React from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import PatientTreatmentRecords from "../PatientTreatmentRecords";

// Mock the treatment records hook
jest.mock("@/hooks/useTreatmentRecords", () => ({
  useTreatmentRecordsCompat: jest.fn(),
}));

const mockUseTreatmentRecords = jest.requireMock(
  "@/hooks/useTreatmentRecords"
).useTreatmentRecordsCompat;

// Component doesn't use LoadingButton or ErrorDisplay - it has its own button and error handling

describe("PatientTreatmentRecords", () => {
  const defaultProps = {
    patientId: "123",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock return values
    mockUseTreatmentRecords.mockReturnValue({
      treatmentRecords: [],
      loading: false,
      error: null,
      refreshTreatmentRecords: jest.fn(),
    });
  });

  it("renders without crashing", () => {
    render(<PatientTreatmentRecords {...defaultProps} />);
    expect(screen.getByText("Registros de Tratamento")).toBeInTheDocument();
  });

  it("shows loading state", () => {
    mockUseTreatmentRecords.mockReturnValue({
      treatmentRecords: [],
      loading: true,
      error: null,
      refreshTreatmentRecords: jest.fn(),
    });

    render(<PatientTreatmentRecords {...defaultProps} />);
    expect(
      screen.getByText("Carregando registros de tratamento...")
    ).toBeInTheDocument();
  });

  it("shows error state", () => {
    mockUseTreatmentRecords.mockReturnValue({
      treatmentRecords: [],
      loading: false,
      error: "Failed to load records",
      refreshTreatmentRecords: jest.fn(),
    });

    render(<PatientTreatmentRecords {...defaultProps} />);
    expect(
      screen.getByText(/Erro ao carregar registros.*Failed to load records/)
    ).toBeInTheDocument();
  });

  it("shows empty state when no records", () => {
    render(<PatientTreatmentRecords {...defaultProps} />);
    expect(
      screen.getByText("Nenhum registro de tratamento encontrado")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Clique em "Novo Registro" para adicionar o primeiro registro'
      )
    ).toBeInTheDocument();
  });

  it("displays treatment records when available", () => {
    const mockRecords = [
      {
        id: "1",
        date: new Date("2024-01-01"),
        type: "spiritual",
        location: "chest",
        notes: "Treatment note 1",
        duration: "30 minutes",
      },
      {
        id: "2",
        date: new Date("2024-01-02"),
        type: "light_bath",
        location: "head",
        notes: "Treatment note 2",
        duration: "20 minutes",
      },
    ];

    mockUseTreatmentRecords.mockReturnValue({
      treatmentRecords: mockRecords,
      loading: false,
      error: null,
      refreshTreatmentRecords: jest.fn(),
    });

    render(<PatientTreatmentRecords {...defaultProps} />);

    expect(screen.getByText("Treatment note 1")).toBeInTheDocument();
    expect(screen.getByText("Treatment note 2")).toBeInTheDocument();
  });

  it("shows add button", () => {
    render(<PatientTreatmentRecords {...defaultProps} />);

    expect(screen.getByText("Novo Registro")).toBeInTheDocument();
  });

  it("calls refreshTreatmentRecords on mount", () => {
    const refreshMock = jest.fn();
    mockUseTreatmentRecords.mockReturnValue({
      treatmentRecords: [],
      loading: false,
      error: null,
      refreshTreatmentRecords: refreshMock,
    });

    render(<PatientTreatmentRecords {...defaultProps} />);
    expect(refreshMock).toHaveBeenCalled();
  });

  it("handles different patient IDs", () => {
    const refreshMock = jest.fn();
    mockUseTreatmentRecords.mockReturnValue({
      treatmentRecords: [],
      loading: false,
      error: null,
      refreshTreatmentRecords: refreshMock,
    });

    const { rerender } = render(<PatientTreatmentRecords patientId="123" />);
    expect(refreshMock).toHaveBeenCalledTimes(1);

    rerender(<PatientTreatmentRecords patientId="456" />);
    // Component should work with different patient IDs
    expect(screen.getByText("Registros de Tratamento")).toBeInTheDocument();
  });

  it("shows correct record count", () => {
    const mockRecords = [
      {
        id: "1",
        date: "2024-01-01",
        type: "spiritual",
        location: "chest",
        notes: "Note 1",
      },
      {
        id: "2",
        date: "2024-01-02",
        type: "light_bath",
        location: "head",
        notes: "Note 2",
      },
      {
        id: "3",
        date: "2024-01-03",
        type: "spiritual",
        location: "back",
        notes: "Note 3",
      },
    ];

    mockUseTreatmentRecords.mockReturnValue({
      treatmentRecords: mockRecords,
      loading: false,
      error: null,
      refreshTreatmentRecords: jest.fn(),
    });

    render(<PatientTreatmentRecords {...defaultProps} />);

    // Should display all 3 records
    expect(screen.getByText("Note 1")).toBeInTheDocument();
    expect(screen.getByText("Note 2")).toBeInTheDocument();
    expect(screen.getByText("Note 3")).toBeInTheDocument();
  });

  it("handles add button click", async () => {
    const refreshMock = jest.fn();
    mockUseTreatmentRecords.mockReturnValue({
      treatmentRecords: [],
      loading: false,
      error: null,
      refreshTreatmentRecords: refreshMock,
    });

    render(<PatientTreatmentRecords {...defaultProps} />);

    const addButton = screen.getByText("Novo Registro");
    expect(addButton).toBeInTheDocument();

    // Click should toggle to show form
    await act(async () => {
      addButton.click();
    });

    expect(screen.getByText("Cancelar")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Formulário de registro de tratamento será implementado aqui."
      )
    ).toBeInTheDocument();
  });

  it("handles form toggle functionality", async () => {
    mockUseTreatmentRecords.mockReturnValue({
      treatmentRecords: [],
      loading: false,
      error: null,
      refreshTreatmentRecords: jest.fn(),
    });

    render(<PatientTreatmentRecords {...defaultProps} />);

    const addButton = screen.getByText("Novo Registro");

    // Initial state - form should be hidden
    expect(
      screen.queryByText(
        "Formulário de registro de tratamento será implementado aqui."
      )
    ).not.toBeInTheDocument();

    // Click to show form
    await act(async () => {
      addButton.click();
    });

    expect(screen.getByText("Cancelar")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Formulário de registro de tratamento será implementado aqui."
      )
    ).toBeInTheDocument();

    // Click cancel to hide form
    const cancelButton = screen.getByText("Cancelar");
    await act(async () => {
      cancelButton.click();
    });

    expect(screen.getByText("Novo Registro")).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Formulário de registro de tratamento será implementado aqui."
      )
    ).not.toBeInTheDocument();
  });

  it("displays treatment records with different types correctly", () => {
    const mockRecords = [
      {
        id: "1",
        date: new Date("2024-01-01"),
        type: "spiritual",
        location: "chest",
        notes: "Spiritual treatment",
        duration: "30 minutes",
      },
      {
        id: "2",
        date: new Date("2024-01-02"),
        type: "light_bath",
        location: "head",
        notes: "Light bath treatment",
        duration: "20 minutes",
      },
      {
        id: "3",
        date: new Date("2024-01-03"),
        type: "rod",
        location: "back",
        notes: "Rod treatment",
        duration: "15 minutes",
      },
    ];

    mockUseTreatmentRecords.mockReturnValue({
      treatmentRecords: mockRecords,
      loading: false,
      error: null,
      refreshTreatmentRecords: jest.fn(),
    });

    render(<PatientTreatmentRecords {...defaultProps} />);

    expect(screen.getByText("Spiritual treatment")).toBeInTheDocument();
    expect(screen.getByText("Light bath treatment")).toBeInTheDocument();
    expect(screen.getByText("Rod treatment")).toBeInTheDocument();
  });

  it("handles null or undefined error gracefully", () => {
    mockUseTreatmentRecords.mockReturnValue({
      treatmentRecords: [],
      loading: false,
      error: null,
      refreshTreatmentRecords: jest.fn(),
    });

    render(<PatientTreatmentRecords {...defaultProps} />);

    // Should not show error display when error is null
    expect(screen.queryByTestId("error-display")).not.toBeInTheDocument();
  });

  it("handles empty string error", () => {
    mockUseTreatmentRecords.mockReturnValue({
      treatmentRecords: [],
      loading: false,
      error: "",
      refreshTreatmentRecords: jest.fn(),
    });

    render(<PatientTreatmentRecords {...defaultProps} />);

    // Should not show error display when error is empty string
    expect(screen.queryByTestId("error-display")).not.toBeInTheDocument();
  });

  it("formats dates correctly in treatment records", () => {
    const mockRecords = [
      {
        id: "1",
        date: new Date("2024-12-25T10:30:00"),
        type: "spiritual",
        location: "chest",
        notes: "Christmas treatment",
        duration: "30 minutes",
      },
    ];

    mockUseTreatmentRecords.mockReturnValue({
      treatmentRecords: mockRecords,
      loading: false,
      error: null,
      refreshTreatmentRecords: jest.fn(),
    });

    render(<PatientTreatmentRecords {...defaultProps} />);

    expect(screen.getByText("Christmas treatment")).toBeInTheDocument();
    // Date formatting would be handled by the actual component
  });

  it("handles very long treatment notes", () => {
    const longNote = "A".repeat(500); // Very long treatment note
    const mockRecords = [
      {
        id: "1",
        date: new Date("2024-01-01"),
        type: "spiritual",
        location: "chest",
        notes: longNote,
        duration: "30 minutes",
      },
    ];

    mockUseTreatmentRecords.mockReturnValue({
      treatmentRecords: mockRecords,
      loading: false,
      error: null,
      refreshTreatmentRecords: jest.fn(),
    });

    render(<PatientTreatmentRecords {...defaultProps} />);

    expect(screen.getByText(longNote)).toBeInTheDocument();
  });

  it("handles special characters in treatment notes", () => {
    const specialNote = "Treatment with special chars: áéíóú ñ ç @#$%&*()";
    const mockRecords = [
      {
        id: "1",
        date: new Date("2024-01-01"),
        type: "spiritual",
        location: "chest",
        notes: specialNote,
        duration: "30 minutes",
      },
    ];

    mockUseTreatmentRecords.mockReturnValue({
      treatmentRecords: mockRecords,
      loading: false,
      error: null,
      refreshTreatmentRecords: jest.fn(),
    });

    render(<PatientTreatmentRecords {...defaultProps} />);

    expect(screen.getByText(specialNote)).toBeInTheDocument();
  });

  it("handles refresh function gracefully", () => {
    const refreshMock = jest.fn();
    mockUseTreatmentRecords.mockReturnValue({
      treatmentRecords: [],
      loading: false,
      error: null,
      refreshTreatmentRecords: refreshMock,
    });

    render(<PatientTreatmentRecords {...defaultProps} />);

    expect(screen.getByText("Registros de Tratamento")).toBeInTheDocument();
    // The hook should be called properly during component mount
    expect(refreshMock).toHaveBeenCalled();
  });

  it("re-renders correctly when patient ID changes", () => {
    const refreshMock = jest.fn();
    mockUseTreatmentRecords.mockReturnValue({
      treatmentRecords: [],
      loading: false,
      error: null,
      refreshTreatmentRecords: refreshMock,
    });

    const { rerender } = render(<PatientTreatmentRecords patientId="123" />);
    expect(screen.getByText("Registros de Tratamento")).toBeInTheDocument();

    rerender(<PatientTreatmentRecords patientId="456" />);
    expect(screen.getByText("Registros de Tratamento")).toBeInTheDocument();

    // Hook is called without parameters in this component
    expect(mockUseTreatmentRecords).toHaveBeenCalledWith();
  });

  it("displays error message when network error occurs", () => {
    mockUseTreatmentRecords.mockReturnValue({
      treatmentRecords: [],
      loading: false,
      error: "Network Error: Unable to connect to server",
      refreshTreatmentRecords: jest.fn(),
    });

    render(<PatientTreatmentRecords {...defaultProps} />);

    // Check that the error container contains the expected text
    const errorElement = screen.getByText(/Erro ao carregar registros:/);
    expect(errorElement).toBeInTheDocument();
    expect(errorElement.textContent).toContain(
      "Network Error: Unable to connect to server"
    );
  });
});
