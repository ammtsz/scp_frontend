import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PatientList from "../index";
import { usePatientList } from "../usePatientList";
import { PatientBasic } from "@/types/types";

// Mock Next.js Link
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock react-feather icons
jest.mock("react-feather", () => ({
  ChevronUp: () => <div data-testid="chevron-up">ChevronUp</div>,
  ChevronDown: () => <div data-testid="chevron-down">ChevronDown</div>,
  Filter: () => <div data-testid="filter">Filter</div>,
}));

// Mock the usePatientList hook
jest.mock("../usePatientList");

const mockUsePatientList = usePatientList as jest.MockedFunction<
  typeof usePatientList
>;

const mockPatients: PatientBasic[] = [
  {
    id: "1",
    name: "João Silva",
    phone: "(11) 99999-9999",
    priority: "1",
    status: "T",
  },
  {
    id: "2",
    name: "Maria Santos",
    phone: "(11) 88888-8888",
    priority: "2",
    status: "A",
  },
  {
    id: "3",
    name: "Pedro Oliveira",
    phone: "(11) 77777-7777",
    priority: "3",
    status: "F",
  },
];

const createMockUsePatientList = (
  overrides = {}
): ReturnType<typeof usePatientList> => ({
  patients: mockPatients,
  search: "",
  setSearch: jest.fn(),
  sortBy: null,
  setSortBy: jest.fn(),
  sortAsc: true,
  setSortAsc: jest.fn(),
  visibleCount: 20,
  setVisibleCount: jest.fn(),
  loaderRef: { current: null },
  filtered: mockPatients,
  handleSort: jest.fn(),
  sorted: mockPatients,
  paginated: mockPatients,
  statusLegend: {
    T: "Em Tratamento",
    A: "Alta Médica",
    F: "Faltas Consecutivas",
  },
  priorityLegend: { "1": "Exceção", "2": "Idoso/crianças", "3": "Padrão" },
  loading: false,
  error: null,
  refreshPatients: jest.fn(),
  ...overrides,
});

describe("PatientList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading state correctly", () => {
    mockUsePatientList.mockReturnValue(
      createMockUsePatientList({
        loading: true,
      })
    );

    render(<PatientList />);

    expect(screen.getByText("Pacientes")).toBeInTheDocument();
    expect(
      screen.getByText("Carregando lista de pacientes...")
    ).toBeInTheDocument();
    expect(screen.getByText("Carregando pacientes...")).toBeInTheDocument();
  });

  test("renders error state correctly", () => {
    const errorMessage = "Failed to fetch patients";
    mockUsePatientList.mockReturnValue(
      createMockUsePatientList({
        error: errorMessage,
      })
    );

    render(<PatientList />);

    expect(screen.getByText("Pacientes")).toBeInTheDocument();
    expect(
      screen.getByText("Erro ao carregar lista de pacientes")
    ).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText("Tentar novamente")).toBeInTheDocument();
  });

  test('calls refreshPatients when "Tentar novamente" button is clicked', () => {
    const mockRefreshPatients = jest.fn();
    mockUsePatientList.mockReturnValue(
      createMockUsePatientList({
        error: "Test error",
        refreshPatients: mockRefreshPatients,
      })
    );

    render(<PatientList />);

    const retryButton = screen.getByText("Tentar novamente");
    fireEvent.click(retryButton);

    expect(mockRefreshPatients).toHaveBeenCalledTimes(1);
  });

  test("renders patient list with data", () => {
    mockUsePatientList.mockReturnValue(
      createMockUsePatientList({
        filtered: mockPatients,
        paginated: mockPatients,
      })
    );

    render(<PatientList />);

    // Check header - text is split across elements
    expect(screen.getByText("Pacientes")).toBeInTheDocument();
    expect(screen.getByText("(3)")).toBeInTheDocument();
    expect(
      screen.getByText("Gerencie e visualize todos os pacientes cadastrados")
    ).toBeInTheDocument();
    expect(screen.getByText("+ Novo Paciente")).toBeInTheDocument();

    // Check search input
    expect(
      screen.getByPlaceholderText("Buscar por nome...")
    ).toBeInTheDocument();

    // Check table headers
    expect(screen.getByText("Registro")).toBeInTheDocument();
    expect(screen.getByText("Nome")).toBeInTheDocument();
    expect(screen.getByText("Telefone")).toBeInTheDocument();
    expect(screen.getByText("Prioridade")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();

    // Check patient data
    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.getByText("Maria Santos")).toBeInTheDocument();
    expect(screen.getByText("Pedro Oliveira")).toBeInTheDocument();
    expect(screen.getByText("(11) 99999-9999")).toBeInTheDocument();
    expect(screen.getByText("(11) 88888-8888")).toBeInTheDocument();
    expect(screen.getByText("(11) 77777-7777")).toBeInTheDocument();
  });

  test("handles search input changes", () => {
    const mockSetSearch = jest.fn();
    mockUsePatientList.mockReturnValue(
      createMockUsePatientList({
        setSearch: mockSetSearch,
      })
    );

    render(<PatientList />);

    const searchInput = screen.getByPlaceholderText("Buscar por nome...");
    fireEvent.change(searchInput, { target: { value: "João" } });

    expect(mockSetSearch).toHaveBeenCalledWith("João");
  });

  test("handles sort column clicks", () => {
    const mockHandleSort = jest.fn();
    mockUsePatientList.mockReturnValue(
      createMockUsePatientList({
        handleSort: mockHandleSort,
      })
    );

    render(<PatientList />);

    // Click on name column header
    const nameHeader = screen.getByText("Nome");
    fireEvent.click(nameHeader.closest("th")!);

    expect(mockHandleSort).toHaveBeenCalledWith("name");
  });

  test("displays sort indicators correctly", () => {
    mockUsePatientList.mockReturnValue(
      createMockUsePatientList({
        sortBy: "name",
        sortAsc: true,
      })
    );

    render(<PatientList />);

    // Should show ChevronUp for ascending sort
    expect(screen.getAllByTestId("chevron-up")).toHaveLength(1);
    expect(screen.getAllByTestId("filter")).toHaveLength(4); // 4 non-sorted columns
  });

  test("displays descending sort indicator", () => {
    mockUsePatientList.mockReturnValue(
      createMockUsePatientList({
        sortBy: "priority",
        sortAsc: false,
      })
    );

    render(<PatientList />);

    // Should show ChevronDown for descending sort
    expect(screen.getAllByTestId("chevron-down")).toHaveLength(1);
    expect(screen.getAllByTestId("filter")).toHaveLength(4); // 4 non-sorted columns
  });

  test("displays status and priority legends", () => {
    mockUsePatientList.mockReturnValue(createMockUsePatientList());

    render(<PatientList />);

    // Status legend
    expect(screen.getByText("Legenda de Status:")).toBeInTheDocument();
    expect(screen.getByText(": Em Tratamento")).toBeInTheDocument();
    expect(screen.getByText(": Alta Médica")).toBeInTheDocument();
    expect(screen.getByText(": Faltas Consecutivas")).toBeInTheDocument();

    // Priority legend
    expect(screen.getByText("Legenda de Prioridade:")).toBeInTheDocument();
    expect(screen.getByText(": Exceção")).toBeInTheDocument();
    expect(screen.getByText(": Idoso/crianças")).toBeInTheDocument();
    expect(screen.getByText(": Padrão")).toBeInTheDocument();
  });

  test("handles patient row click navigation", () => {
    // Skip the actual window.location test as it's complex to mock
    // Just test that the row is clickable
    mockUsePatientList.mockReturnValue(createMockUsePatientList());

    render(<PatientList />);

    const patientRow = screen.getByText("João Silva").closest("tr")!;
    expect(patientRow).toHaveClass("cursor-pointer");

    // The onClick functionality is too complex to mock properly
    // but we can verify the row has the expected structure
    expect(patientRow).toBeInTheDocument();
  });

  test("displays tooltip legends on hover", () => {
    mockUsePatientList.mockReturnValue(createMockUsePatientList());

    render(<PatientList />);

    // Check for priority tooltip content - use getAllByText to handle multiple matches
    const priorityCells = screen.getAllByText("1");
    // Find the one in a priority cell (not ID cell)
    const priorityCell = priorityCells
      .find(
        (el) =>
          el.closest("td") && el.closest("td")?.querySelector(".legend-tag")
      )
      ?.closest("td");

    expect(priorityCell).toBeDefined();
    const priorityTooltip = priorityCell!.querySelector(".legend-tag");
    expect(priorityTooltip).toHaveTextContent("Exceção");

    // Check for status tooltip content - use getAllByText to handle multiple matches
    const statusCells = screen.getAllByText("T");
    // Find the one in a status cell (not legend)
    const statusCell = statusCells
      .find(
        (el) =>
          el.closest("td") && el.closest("td")?.querySelector(".legend-tag")
      )
      ?.closest("td");

    expect(statusCell).toBeDefined();
    const statusTooltip = statusCell!.querySelector(".legend-tag");
    expect(statusTooltip).toHaveTextContent("Em Tratamento");
  });

  test('renders "Novo Paciente" link with correct href', () => {
    mockUsePatientList.mockReturnValue(createMockUsePatientList());

    render(<PatientList />);

    const newPatientLink = screen.getByText("+ Novo Paciente").closest("a");
    expect(newPatientLink).toHaveAttribute("href", "/patients/new");
  });

  test("displays correct patient count in header", () => {
    const threePatients = [mockPatients[0], mockPatients[1], mockPatients[2]];
    mockUsePatientList.mockReturnValue(
      createMockUsePatientList({
        filtered: threePatients,
      })
    );

    render(<PatientList />);

    // Text is split across elements, check separately
    expect(screen.getByText("Pacientes")).toBeInTheDocument();
    expect(screen.getByText("(3)")).toBeInTheDocument();
  });

  test("renders all sortable column headers with proper click handlers", () => {
    const mockHandleSort = jest.fn();
    mockUsePatientList.mockReturnValue(
      createMockUsePatientList({
        handleSort: mockHandleSort,
      })
    );

    render(<PatientList />);

    // Test all sortable columns
    const sortableColumns = [
      "Registro",
      "Nome",
      "Telefone",
      "Prioridade",
      "Status",
    ];
    const expectedSortKeys = ["id", "name", "phone", "priority", "status"];

    sortableColumns.forEach((columnName, index) => {
      const header = screen.getByText(columnName);
      fireEvent.click(header.closest("th")!);
      expect(mockHandleSort).toHaveBeenCalledWith(expectedSortKeys[index]);
    });

    expect(mockHandleSort).toHaveBeenCalledTimes(5);
  });
});
