import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useParams } from "next/navigation";
import PatientDetailPage from "../page";
import { getPatientById } from "@/api/patients";
import { getAttendancesByPatient } from "@/api/attendances";

// Mock Next.js hooks and components
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

jest.mock("@/components/common/Breadcrumb", () => {
  return function MockBreadcrumb({
    items,
  }: {
    items: Array<{ label: string; href?: string; isActive?: boolean }>;
  }) {
    return (
      <nav>
        {items.map((item, index) => (
          <span key={index}>{item.label}</span>
        ))}
      </nav>
    );
  };
});

// Mock API calls
jest.mock("@/api/patients");
jest.mock("@/api/attendances");

const mockGetPatientById = getPatientById as jest.MockedFunction<
  typeof getPatientById
>;
const mockGetAttendancesByPatient =
  getAttendancesByPatient as jest.MockedFunction<
    typeof getAttendancesByPatient
  >;
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;

describe("PatientDetailPage Error Handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ id: "non-existent-id" });
  });

  it("shows patient not found error when patient does not exist", async () => {
    // Mock API to return 404 error
    mockGetPatientById.mockResolvedValue({
      success: false,
      error: "Paciente não encontrado",
    });

    mockGetAttendancesByPatient.mockResolvedValue({
      success: false,
      error: "Not found",
    });

    render(<PatientDetailPage />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText("Carregando...")).not.toBeInTheDocument();
    });

    // Should show patient not found error
    expect(screen.getAllByText("Paciente não encontrado")).toHaveLength(2); // Title and error message
    expect(screen.getByText("Não encontrado")).toBeInTheDocument(); // Breadcrumb

    // Should not show retry button for 404 errors
    expect(screen.queryByText("Tentar Novamente")).not.toBeInTheDocument();

    // Should show back button
    expect(screen.getByText("Voltar para Pacientes")).toBeInTheDocument();
  });

  it("shows generic server error with retry option for other errors", async () => {
    // Mock API to return server error
    mockGetPatientById.mockResolvedValue({
      success: false,
      error: "Erro interno do servidor, por favor tente novamente mais tarde",
    });

    mockGetAttendancesByPatient.mockResolvedValue({
      success: false,
      error: "Server error",
    });

    render(<PatientDetailPage />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText("Carregando...")).not.toBeInTheDocument();
    });

    // Should show server error
    expect(
      screen.getByText(
        "Erro interno do servidor, por favor tente novamente mais tarde"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Erro")).toBeInTheDocument(); // Breadcrumb

    // Should show retry button for server errors
    expect(screen.getByText("Tentar Novamente")).toBeInTheDocument();

    // Should show back button
    expect(screen.getByText("Voltar para Pacientes")).toBeInTheDocument();
  });

  it("handles network errors gracefully", async () => {
    // Mock API to throw network error
    mockGetPatientById.mockResolvedValue({
      success: false,
      error: "Erro de rede",
    });

    render(<PatientDetailPage />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText("Carregando...")).not.toBeInTheDocument();
    });

    // Should show network error with retry option
    expect(screen.getByText("Erro de rede")).toBeInTheDocument();
    expect(screen.getByText("Tentar Novamente")).toBeInTheDocument();
  });
});
