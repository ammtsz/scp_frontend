import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TreatmentTrackingPage from "../page";
import type {
  CreateTreatmentSessionRequest,
  TreatmentSessionResponseDto,
  PatientResponseDto,
} from "@/api/types";

// Mock the custom hook
const mockUseTreatmentTracking = {
  filteredSessions: [] as TreatmentSessionResponseDto[],
  patients: [] as PatientResponseDto[],
  expandedTreatmentId: null as string | null,
  isLoading: false,
  error: null as string | null,
  isCreateModalOpen: false,
  openCreateModal: jest.fn(),
  closeCreateModal: jest.fn(),
  filters: {
    searchTerm: "",
    treatmentTypes: [],
    statuses: [],
    dateRange: { from: null, to: null },
  },
  updateSearchTerm: jest.fn(),
  updateTreatmentTypes: jest.fn(),
  updateStatuses: jest.fn(),
  updateDateRange: jest.fn(),
  setDatePreset: jest.fn(),
  clearFilters: jest.fn(),
  hasActiveFilters: false,
  savedPresets: [],
  savePreset: jest.fn(),
  loadPreset: jest.fn(),
  deletePreset: jest.fn(),
  handleCreateSession: jest.fn(),
  handleCompleteSession: jest.fn(),
  handleCancelSession: jest.fn(),
  handleToggleExpanded: jest.fn(),
  refetch: jest.fn(),
  getPatientName: jest.fn((id: number) => `Patient ${id}`),
  isCreating: false,
};

jest.mock("@/hooks/useTreatmentTracking", () => ({
  useTreatmentTracking: () => mockUseTreatmentTracking,
}));

// Mock components
interface TreatmentCardProps {
  session: TreatmentSessionResponseDto;
  patientName: string;
  onComplete: (id: number) => void;
  onCancel: (id: number) => void;
  onToggleExpanded: (id: string) => void;
  isExpanded: boolean;
}

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  resultCount: number;
}

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTreatmentSessionRequest) => void;
  patients: PatientResponseDto[];
  isLoading: boolean;
}

jest.mock("@/components/TreatmentTracking/TreatmentCard", () => ({
  TreatmentCard: ({
    session,
    patientName,
    onComplete,
    onCancel,
    onToggleExpanded,
    isExpanded,
  }: TreatmentCardProps) => (
    <div data-testid={`treatment-card-${session.id}`}>
      <h3>{patientName}</h3>
      <p>Session {session.id}</p>
      <button
        onClick={() => onComplete(session.id)}
        data-testid={`complete-${session.id}`}
      >
        Complete
      </button>
      <button
        onClick={() => onCancel(session.id)}
        data-testid={`cancel-${session.id}`}
      >
        Cancel
      </button>
      <button
        onClick={() => onToggleExpanded(session.id.toString())}
        data-testid={`toggle-${session.id}`}
      >
        {isExpanded ? "Collapse" : "Expand"}
      </button>
    </div>
  ),
}));

jest.mock("@/components/TreatmentTracking/FilterBar", () => ({
  FilterBar: ({
    searchTerm,
    onSearchChange,
    onClearFilters,
    hasActiveFilters,
    resultCount,
  }: FilterBarProps) => (
    <div data-testid="filter-bar">
      <input
        data-testid="search-input"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search..."
      />
      <span data-testid="result-count">{resultCount} results</span>
      {hasActiveFilters && (
        <button data-testid="clear-filters" onClick={onClearFilters}>
          Clear Filters
        </button>
      )}
    </div>
  ),
}));

jest.mock("@/components/TreatmentTracking/CreateTreatmentSessionModal", () => ({
  CreateTreatmentSessionModal: ({
    isOpen,
    onClose,
    onSubmit,
    patients,
    isLoading,
  }: CreateModalProps) =>
    isOpen ? (
      <div data-testid="create-modal">
        <button data-testid="close-modal" onClick={onClose}>
          Close
        </button>
        <button
          data-testid="submit-modal"
          onClick={() =>
            onSubmit({
              treatment_record_id: 1,
              attendance_id: 1,
              patient_id: 1,
              treatment_type: "light_bath" as const,
              body_location: "test",
              start_date: "2023-01-01",
              planned_sessions: 5,
            })
          }
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Submit"}
        </button>
        <span data-testid="patients-count">{patients.length} patients</span>
      </div>
    ) : null,
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

describe("TreatmentTrackingPage", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to default mock state
    Object.assign(mockUseTreatmentTracking, {
      filteredSessions: [],
      patients: [],
      expandedTreatmentId: null,
      isLoading: false,
      error: null,
      isCreateModalOpen: false,
      filters: {
        searchTerm: "",
        treatmentTypes: [],
        statuses: [],
        dateRange: { from: null, to: null },
      },
      hasActiveFilters: false,
      savedPresets: [],
      isCreating: false,
    });
  });

  describe("Loading State", () => {
    it("renders loading state", () => {
      mockUseTreatmentTracking.isLoading = true;
      render(<TreatmentTrackingPage />);

      expect(
        screen.getByText("Carregando sistema de acompanhamento...")
      ).toBeInTheDocument();
      expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    });

    it("applies correct loading state styling", () => {
      mockUseTreatmentTracking.isLoading = true;
      render(<TreatmentTrackingPage />);

      const container = screen
        .getByText("Carregando sistema de acompanhamento...")
        .closest(".min-h-screen");
      expect(container).toHaveClass("min-h-screen", "bg-gray-50", "p-8");
    });
  });

  describe("Main Content", () => {
    it("renders page title and description", () => {
      render(<TreatmentTrackingPage />);

      expect(
        screen.getByText("Acompanhamento de Tratamentos")
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Sistema completo para gerenciar sessões de tratamento e registros individuais"
        )
      ).toBeInTheDocument();
    });

    it("renders filter bar with correct props", () => {
      mockUseTreatmentTracking.filteredSessions = [
        { id: 1 } as TreatmentSessionResponseDto,
        { id: 2 } as TreatmentSessionResponseDto,
      ];
      render(<TreatmentTrackingPage />);

      expect(screen.getByTestId("filter-bar")).toBeInTheDocument();
      expect(screen.getByTestId("result-count")).toHaveTextContent("2 results");
    });

    it("renders main action buttons", () => {
      render(<TreatmentTrackingPage />);

      expect(screen.getByText("➕ Criar Nova Sessão")).toBeInTheDocument();
      expect(screen.getByText("🔄 Atualizar")).toBeInTheDocument();
    });

    it("shows creating state on create button", () => {
      mockUseTreatmentTracking.isCreating = true;
      render(<TreatmentTrackingPage />);

      expect(screen.getByText("⏳ Criando...")).toBeInTheDocument();
      expect(screen.getByText("⏳ Criando...")).toBeDisabled();
    });
  });

  describe("Error Handling", () => {
    it("displays error message when there's an error", () => {
      mockUseTreatmentTracking.error = "Something went wrong";
      render(<TreatmentTrackingPage />);

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(screen.getByText("❌")).toBeInTheDocument();
      expect(screen.getByText("Tentar novamente")).toBeInTheDocument();
    });

    it("calls refetch when retry button is clicked", async () => {
      mockUseTreatmentTracking.error = "Something went wrong";
      render(<TreatmentTrackingPage />);

      const retryButton = screen.getByText("Tentar novamente");
      await user.click(retryButton);

      expect(mockUseTreatmentTracking.refetch).toHaveBeenCalled();
    });

    it("shows alert on create session error", async () => {
      const alertSpy = jest.spyOn(window, "alert").mockImplementation();
      mockUseTreatmentTracking.handleCreateSession.mockRejectedValue(
        new Error("Create failed")
      );
      mockUseTreatmentTracking.isCreateModalOpen = true;

      render(<TreatmentTrackingPage />);

      const submitButton = screen.getByTestId("submit-modal");
      await user.click(submitButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith("Create failed");
      });

      alertSpy.mockRestore();
    });

    it("shows generic error message for unknown errors", async () => {
      const alertSpy = jest.spyOn(window, "alert").mockImplementation();
      mockUseTreatmentTracking.handleCreateSession.mockRejectedValue(
        "Unknown error"
      );
      mockUseTreatmentTracking.isCreateModalOpen = true;

      render(<TreatmentTrackingPage />);

      const submitButton = screen.getByTestId("submit-modal");
      await user.click(submitButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith("Erro ao criar sessão");
      });

      alertSpy.mockRestore();
    });
  });

  describe("Modal Interactions", () => {
    it("opens create modal when create button is clicked", async () => {
      render(<TreatmentTrackingPage />);

      const createButton = screen.getByText("➕ Criar Nova Sessão");
      await user.click(createButton);

      expect(mockUseTreatmentTracking.openCreateModal).toHaveBeenCalled();
    });

    it("renders modal when open", () => {
      mockUseTreatmentTracking.isCreateModalOpen = true;
      mockUseTreatmentTracking.patients = [
        { id: 1, name: "John" } as PatientResponseDto,
        { id: 2, name: "Jane" } as PatientResponseDto,
      ];

      render(<TreatmentTrackingPage />);

      expect(screen.getByTestId("create-modal")).toBeInTheDocument();
      expect(screen.getByTestId("patients-count")).toHaveTextContent(
        "2 patients"
      );
    });

    it("closes modal when close is clicked", async () => {
      mockUseTreatmentTracking.isCreateModalOpen = true;
      render(<TreatmentTrackingPage />);

      const closeButton = screen.getByTestId("close-modal");
      await user.click(closeButton);

      expect(mockUseTreatmentTracking.closeCreateModal).toHaveBeenCalled();
    });
  });

  describe("Empty State", () => {
    it("shows empty state when no sessions and no filters", () => {
      mockUseTreatmentTracking.filteredSessions = [];
      mockUseTreatmentTracking.hasActiveFilters = false;

      render(<TreatmentTrackingPage />);

      expect(
        screen.getByText("Nenhum tratamento encontrado.")
      ).toBeInTheDocument();
      expect(screen.getByText("Criar primeira sessão")).toBeInTheDocument();
    });

    it("shows filtered empty state when no sessions with filters", () => {
      mockUseTreatmentTracking.filteredSessions = [];
      mockUseTreatmentTracking.hasActiveFilters = true;

      render(<TreatmentTrackingPage />);

      expect(
        screen.getByText(
          "Nenhum tratamento encontrado com os filtros aplicados."
        )
      ).toBeInTheDocument();
      expect(screen.getByTestId("clear-filters")).toBeInTheDocument();
    });

    it("creates first session from empty state", async () => {
      mockUseTreatmentTracking.filteredSessions = [];
      mockUseTreatmentTracking.hasActiveFilters = false;

      render(<TreatmentTrackingPage />);

      const createFirstButton = screen.getByText("Criar primeira sessão");
      await user.click(createFirstButton);

      expect(mockUseTreatmentTracking.openCreateModal).toHaveBeenCalled();
    });

    it("clears filters from filtered empty state", async () => {
      mockUseTreatmentTracking.filteredSessions = [];
      mockUseTreatmentTracking.hasActiveFilters = true;

      render(<TreatmentTrackingPage />);

      const clearButton = screen.getByTestId("clear-filters");
      await user.click(clearButton);

      expect(mockUseTreatmentTracking.clearFilters).toHaveBeenCalled();
    });
  });

  describe("Treatment Sessions List", () => {
    const mockSessions: TreatmentSessionResponseDto[] = [
      {
        id: 1,
        patient_id: 101,
        treatment_type: "rod",
      } as TreatmentSessionResponseDto,
      {
        id: 2,
        patient_id: 102,
        treatment_type: "light_bath",
      } as TreatmentSessionResponseDto,
    ];

    it("renders treatment sessions", () => {
      mockUseTreatmentTracking.filteredSessions = mockSessions;
      render(<TreatmentTrackingPage />);

      expect(screen.getByText("Tratamentos (2)")).toBeInTheDocument();
      expect(screen.getByTestId("treatment-card-1")).toBeInTheDocument();
      expect(screen.getByTestId("treatment-card-2")).toBeInTheDocument();
    });

    it("displays correct patient names", () => {
      mockUseTreatmentTracking.filteredSessions = mockSessions;
      render(<TreatmentTrackingPage />);

      expect(screen.getByText("Patient 101")).toBeInTheDocument();
      expect(screen.getByText("Patient 102")).toBeInTheDocument();
    });

    it("handles complete session action", async () => {
      const alertSpy = jest.spyOn(window, "alert").mockImplementation();
      mockUseTreatmentTracking.filteredSessions = mockSessions;
      mockUseTreatmentTracking.handleCompleteSession.mockRejectedValue(
        new Error("Complete failed")
      );

      render(<TreatmentTrackingPage />);

      const completeButton = screen.getByTestId("complete-1");
      await user.click(completeButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith("Complete failed");
      });

      alertSpy.mockRestore();
    });

    it("handles cancel session action", async () => {
      const alertSpy = jest.spyOn(window, "alert").mockImplementation();
      mockUseTreatmentTracking.filteredSessions = mockSessions;
      mockUseTreatmentTracking.handleCancelSession.mockRejectedValue(
        new Error("Cancel failed")
      );

      render(<TreatmentTrackingPage />);

      const cancelButton = screen.getByTestId("cancel-1");
      await user.click(cancelButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith("Cancel failed");
      });

      alertSpy.mockRestore();
    });

    it("handles toggle expanded", async () => {
      mockUseTreatmentTracking.filteredSessions = mockSessions;
      render(<TreatmentTrackingPage />);

      const toggleButton = screen.getByTestId("toggle-1");
      await user.click(toggleButton);

      expect(
        mockUseTreatmentTracking.handleToggleExpanded
      ).toHaveBeenCalledWith("1");
    });

    it("shows correct expanded state", () => {
      mockUseTreatmentTracking.filteredSessions = mockSessions;
      mockUseTreatmentTracking.expandedTreatmentId = "1";
      render(<TreatmentTrackingPage />);

      expect(screen.getByText("Collapse")).toBeInTheDocument();
    });
  });

  describe("Filter Interactions", () => {
    it("handles search term updates", async () => {
      render(<TreatmentTrackingPage />);

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "test search");

      // Check that updateSearchTerm was called with each character
      expect(mockUseTreatmentTracking.updateSearchTerm).toHaveBeenCalledTimes(
        11
      );
      expect(mockUseTreatmentTracking.updateSearchTerm).toHaveBeenCalledWith(
        "t"
      );
      expect(mockUseTreatmentTracking.updateSearchTerm).toHaveBeenCalledWith(
        "e"
      );
      expect(mockUseTreatmentTracking.updateSearchTerm).toHaveBeenCalledWith(
        "s"
      );
    });

    it("shows clear filters button when filters are active", () => {
      mockUseTreatmentTracking.hasActiveFilters = true;
      render(<TreatmentTrackingPage />);

      expect(screen.getByTestId("clear-filters")).toBeInTheDocument();
    });
  });

  describe("Refresh Functionality", () => {
    it("handles refresh button click", async () => {
      const alertSpy = jest.spyOn(window, "alert").mockImplementation();
      mockUseTreatmentTracking.refetch.mockRejectedValue(
        new Error("Refresh failed")
      );

      render(<TreatmentTrackingPage />);

      const refreshButton = screen.getByText("🔄 Atualizar");
      await user.click(refreshButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith("Refresh failed");
      });

      alertSpy.mockRestore();
    });
  });

  describe("Component Structure and Styling", () => {
    it("applies correct page structure and classes", () => {
      render(<TreatmentTrackingPage />);

      const pageContainer = screen
        .getByText("Acompanhamento de Tratamentos")
        .closest(".min-h-screen");
      expect(pageContainer).toHaveClass("min-h-screen", "bg-gray-50", "p-8");

      const maxWidthContainer = screen
        .getByText("Acompanhamento de Tratamentos")
        .closest(".max-w-6xl");
      expect(maxWidthContainer).toHaveClass("max-w-6xl", "mx-auto");
    });

    it("renders treatment cards with proper IDs", () => {
      const mockSessions: TreatmentSessionResponseDto[] = [
        { id: 1, patient_id: 101 } as TreatmentSessionResponseDto,
        { id: 2, patient_id: 102 } as TreatmentSessionResponseDto,
      ];
      mockUseTreatmentTracking.filteredSessions = mockSessions;

      render(<TreatmentTrackingPage />);

      const card1Container = screen
        .getByTestId("treatment-card-1")
        .closest('[id="treatment-card-1"]');
      const card2Container = screen
        .getByTestId("treatment-card-2")
        .closest('[id="treatment-card-2"]');

      expect(card1Container).toBeInTheDocument();
      expect(card2Container).toBeInTheDocument();
      expect(card1Container).toHaveClass("relative", "scroll-mt-24");
      expect(card2Container).toHaveClass("relative", "scroll-mt-24");
    });
  });
});
