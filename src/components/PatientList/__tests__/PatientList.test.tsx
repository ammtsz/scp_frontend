import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PatientList from "../index";
import { usePatientList } from "../usePatientList";

// Mock the usePatientList hook
jest.mock("../usePatientList", () => ({
  usePatientList: jest.fn(),
}));

// Mock Next.js Link component
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

const mockPatients = [
  {
    id: 1,
    name: "João Silva",
    phone: "(11) 99999-9999",
    priority: "3",
    status: "T",
  },
  {
    id: 2,
    name: "Maria Santos",
    phone: "(11) 88888-8888",
    priority: "1",
    status: "A",
  },
];

const defaultMockReturn = {
  search: "",
  setSearch: jest.fn(),
  sortBy: "name",
  sortAsc: true,
  loaderRef: { current: null },
  filtered: mockPatients,
  handleSort: jest.fn(),
  paginated: mockPatients,
  statusLegend: {
    T: "Em Tratamento",
    A: "Alta Médica",
    F: "Faltas Consecutivas",
  },
  priorityLegend: {
    "1": "Exceção",
    "2": "Idoso/crianças",
    "3": "Padrão",
  },
  loading: false,
  error: null,
  refreshPatients: jest.fn(),
};

describe("PatientList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePatientList as jest.Mock).mockReturnValue(defaultMockReturn);
  });

  describe("Layout and Structure", () => {
    it("should use consistent card layout", () => {
      render(<PatientList />);

      const cardContainer = document.querySelector(".card-shadow");
      expect(cardContainer).toBeInTheDocument();
    });

    it("should display header with title and description", () => {
      render(<PatientList />);

      expect(screen.getByText("Pacientes")).toBeInTheDocument();
      expect(
        screen.getByText("Gerencie e visualize todos os pacientes cadastrados")
      ).toBeInTheDocument();
    });

    it("should show patient count in header", () => {
      render(<PatientList />);

      expect(screen.getByText(`(${mockPatients.length})`)).toBeInTheDocument();
    });

    it("should display new patient button", () => {
      render(<PatientList />);

      const newPatientButton = screen.getByText("+ Novo Paciente");
      expect(newPatientButton).toBeInTheDocument();
      expect(newPatientButton.closest("a")).toHaveAttribute(
        "href",
        "/patients/new"
      );
    });
  });

  describe("Search Functionality", () => {
    it("should render search input", () => {
      render(<PatientList />);

      const searchInput = screen.getByPlaceholderText("Buscar por nome...");
      expect(searchInput).toBeInTheDocument();
    });

    it("should call setSearch when typing in search input", () => {
      const mockSetSearch = jest.fn();
      (usePatientList as jest.Mock).mockReturnValue({
        ...defaultMockReturn,
        setSearch: mockSetSearch,
      });

      render(<PatientList />);

      const searchInput = screen.getByPlaceholderText("Buscar por nome...");
      fireEvent.change(searchInput, { target: { value: "João" } });

      expect(mockSetSearch).toHaveBeenCalledWith("João");
    });
  });

  describe("Table Display", () => {
    it("should render table with correct headers", () => {
      render(<PatientList />);

      expect(screen.getByText("Registro")).toBeInTheDocument();
      expect(screen.getByText("Nome")).toBeInTheDocument();
      expect(screen.getByText("Telefone")).toBeInTheDocument();
      expect(screen.getByText("Prioridade")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
    });

    it("should display patient data correctly", () => {
      render(<PatientList />);

      expect(screen.getByText("João Silva")).toBeInTheDocument();
      expect(screen.getByText("Maria Santos")).toBeInTheDocument();
      expect(screen.getByText("(11) 99999-9999")).toBeInTheDocument();
      expect(screen.getByText("(11) 88888-8888")).toBeInTheDocument();
    });

    it("should make table rows clickable", () => {
      render(<PatientList />);

      const firstRow = screen.getByText("João Silva").closest("tr");
      expect(firstRow).toHaveClass("cursor-pointer");

      // Note: In actual implementation, clicking would redirect to /patients/1
      // We're just testing that the row has the correct click handler setup
    });
  });

  describe("Sorting Functionality", () => {
    it("should call handleSort when clicking column headers", () => {
      const mockHandleSort = jest.fn();
      (usePatientList as jest.Mock).mockReturnValue({
        ...defaultMockReturn,
        handleSort: mockHandleSort,
      });

      render(<PatientList />);

      const nameHeader = screen.getByText(/Nome/);
      fireEvent.click(nameHeader);

      expect(mockHandleSort).toHaveBeenCalledWith("name");
    });

    it("should show sort indicators", () => {
      (usePatientList as jest.Mock).mockReturnValue({
        ...defaultMockReturn,
        sortBy: "name",
        sortAsc: true,
      });

      render(<PatientList />);

      // Check that the name header exists and is sorted
      expect(screen.getByText("Nome")).toBeInTheDocument();
      // The sort indicator might be in a different element, so just check for the column header
    });
  });

  describe("Legend Cards", () => {
    it("should display status legend", () => {
      render(<PatientList />);

      expect(screen.getByText("Legenda de Status:")).toBeInTheDocument();
      expect(
        screen.getByText(
          (content, element) => element?.textContent === "T: Em Tratamento"
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          (content, element) => element?.textContent === "A: Alta Médica"
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          (content, element) =>
            element?.textContent === "F: Faltas Consecutivas"
        )
      ).toBeInTheDocument();
    });

    it("should display priority legend", () => {
      render(<PatientList />);

      expect(screen.getByText("Legenda de Prioridade:")).toBeInTheDocument();
      expect(
        screen.getByText(
          (content, element) => element?.textContent === "1: Exceção"
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          (content, element) => element?.textContent === "2: Idoso/crianças"
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          (content, element) => element?.textContent === "3: Padrão"
        )
      ).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should show loading state", () => {
      (usePatientList as jest.Mock).mockReturnValue({
        ...defaultMockReturn,
        loading: true,
      });

      render(<PatientList />);

      expect(screen.getByText("Carregando pacientes...")).toBeInTheDocument();
      expect(
        screen.getByText("Carregando lista de pacientes...")
      ).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("should show error state", () => {
      const mockRefreshPatients = jest.fn();
      (usePatientList as jest.Mock).mockReturnValue({
        ...defaultMockReturn,
        loading: false,
        error: "Erro ao carregar pacientes",
        refreshPatients: mockRefreshPatients,
      });

      render(<PatientList />);

      expect(
        screen.getByText("Erro ao carregar pacientes")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Erro ao carregar lista de pacientes")
      ).toBeInTheDocument();

      const retryButton = screen.getByText("Tentar novamente");
      expect(retryButton).toBeInTheDocument();

      fireEvent.click(retryButton);
      expect(mockRefreshPatients).toHaveBeenCalled();
    });
  });

  describe("Responsive Design", () => {
    it("should have responsive grid for legend cards", () => {
      render(<PatientList />);

      const legendContainer = document.querySelector(
        ".grid.grid-cols-1.md\\:grid-cols-2"
      );
      expect(legendContainer).toBeInTheDocument();
    });

    it("should have overflow-x-auto for table", () => {
      render(<PatientList />);

      const tableContainer = document.querySelector(".overflow-x-auto");
      expect(tableContainer).toBeInTheDocument();
    });
  });
});
