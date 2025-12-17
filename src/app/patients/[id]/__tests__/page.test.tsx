import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useParams } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

// Helper function to render with QueryClient
const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

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

    renderWithQueryClient(<PatientDetailPage />);

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

    renderWithQueryClient(<PatientDetailPage />);

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

    renderWithQueryClient(<PatientDetailPage />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText("Carregando...")).not.toBeInTheDocument();
    });

    // Should show network error with retry option
    expect(screen.getByText("Erro de rede")).toBeInTheDocument();
    expect(screen.getByText("Tentar Novamente")).toBeInTheDocument();
  });

  it("shows patient not found error when patient is null", async () => {
    // Mock API to return null patient (not just error)
    mockGetPatientById.mockResolvedValue({
      success: true,
      value: undefined,
    });

    mockGetAttendancesByPatient.mockResolvedValue({
      success: true,
      value: [],
    });

    renderWithQueryClient(<PatientDetailPage />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText("Carregando...")).not.toBeInTheDocument();
    });

    // Should show patient not found error (lines 104-125)
    // The actual rendered text doesn't have a period
    expect(screen.getAllByText("Paciente não encontrado")).toHaveLength(2); // Title and error message
    expect(screen.getByText("Não encontrado")).toBeInTheDocument(); // Breadcrumb
    expect(screen.getByText("Voltar para Pacientes")).toBeInTheDocument();

    // Check the page structure for patient not found
    const container = screen
      .getByText("Não encontrado")
      .closest(".flex.flex-col.gap-8.my-16");
    expect(container).toBeInTheDocument();

    const innerContainer = screen
      .getByText("Não encontrado")
      .closest(".max-w-4xl.mx-auto.w-full.px-4");
    expect(innerContainer).toBeInTheDocument();
  });

  it("renders proper breadcrumb items for not found page", async () => {
    mockGetPatientById.mockResolvedValue({
      success: true,
      value: undefined,
    });

    renderWithQueryClient(<PatientDetailPage />);

    await waitFor(() => {
      expect(screen.queryByText("Carregando...")).not.toBeInTheDocument();
    });

    // Check that both breadcrumb items are present
    expect(screen.getByText("Pacientes")).toBeInTheDocument();
    expect(screen.getByText("Não encontrado")).toBeInTheDocument();
  });

  it("handles undefined patient data gracefully", async () => {
    // Mock API to return undefined patient
    mockGetPatientById.mockResolvedValue({
      success: true,
      value: undefined,
    });

    renderWithQueryClient(<PatientDetailPage />);

    await waitFor(() => {
      expect(screen.queryByText("Carregando...")).not.toBeInTheDocument();
    });

    // Should trigger the !patient condition and show not found error
    expect(screen.getAllByText("Paciente não encontrado")).toHaveLength(2);
  });

  it("shows PageError component with correct props for not found patient", async () => {
    mockGetPatientById.mockResolvedValue({
      success: true,
      value: undefined,
    });

    renderWithQueryClient(<PatientDetailPage />);

    await waitFor(() => {
      expect(screen.queryByText("Carregando...")).not.toBeInTheDocument();
    });

    // Verify PageError component is rendered with correct props
    expect(screen.getAllByText("Paciente não encontrado")).toHaveLength(2); // title and error message
    expect(screen.getByText("Voltar para Pacientes")).toBeInTheDocument(); // backLabel prop
    // The showBackButton={true} prop should make the back button visible
  });
});
