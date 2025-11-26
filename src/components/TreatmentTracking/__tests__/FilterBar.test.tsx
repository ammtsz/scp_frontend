import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterBar } from "../FilterBar";
import { FilterPreset } from "@/types/filters";

const mockProps = {
  searchTerm: "",
  onSearchChange: jest.fn(),
  treatmentTypes: [],
  onTreatmentTypesChange: jest.fn(),
  statuses: [],
  onStatusesChange: jest.fn(),
  dateRange: { start: null, end: null },
  onDateRangeChange: jest.fn(),
  onDatePresetChange: jest.fn(),
  onClearFilters: jest.fn(),
  hasActiveFilters: false,
  savedPresets: [],
  onSavePreset: jest.fn(),
  onLoadPreset: jest.fn(),
  onRemovePreset: jest.fn(),
  resultCount: 0,
};

const mockPresets: FilterPreset[] = [
  {
    id: "preset-1",
    name: "Active Light Bath",
    filters: {
      searchTerm: "",
      treatmentTypes: ["light_bath"],
      statuses: ["scheduled"],
      dateRange: { start: null, end: null },
    },
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "preset-2",
    name: "This Week",
    filters: {
      searchTerm: "",
      treatmentTypes: [],
      statuses: [],
      dateRange: {
        start: new Date("2024-01-01"),
        end: new Date("2024-01-07"),
      },
    },
    createdAt: new Date("2024-01-01"),
  },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe("FilterBar Component", () => {
  describe("Rendering", () => {
    it("renders without crashing", () => {
      render(<FilterBar {...mockProps} />);
      expect(screen.getByText("🔍 Filtros de Busca")).toBeInTheDocument();
    });

    it("displays search input", () => {
      render(<FilterBar {...mockProps} />);
      expect(
        screen.getByLabelText("Buscar por paciente, local ou notas")
      ).toBeInTheDocument();
    });

    it("displays treatment type checkboxes", () => {
      render(<FilterBar {...mockProps} />);
      expect(screen.getByText(/💡.*Banho de Luz/)).toBeInTheDocument();
      expect(screen.getByText(/🪄.*Bastão/)).toBeInTheDocument();
    });

    it("displays status checkboxes", () => {
      render(<FilterBar {...mockProps} />);
      expect(screen.getByText(/📅.*Agendado/)).toBeInTheDocument();
      expect(screen.getByText(/⚡.*Em Progresso/)).toBeInTheDocument();
      expect(screen.getByText(/✅.*Concluído/)).toBeInTheDocument();
      expect(screen.getByText(/❌.*Cancelado/)).toBeInTheDocument();
    });
  });

  describe("Search functionality", () => {
    it("calls onSearchChange when search input changes", async () => {
      const user = userEvent.setup();
      render(<FilterBar {...mockProps} />);

      const searchInput = screen.getByLabelText(
        "Buscar por paciente, local ou notas"
      );
      await user.type(searchInput, "Test");

      // Should be called for each character typed
      expect(mockProps.onSearchChange).toHaveBeenCalledTimes(4);
      expect(mockProps.onSearchChange).toHaveBeenCalledWith("T");
      expect(mockProps.onSearchChange).toHaveBeenCalledWith("e");
      expect(mockProps.onSearchChange).toHaveBeenCalledWith("s");
      expect(mockProps.onSearchChange).toHaveBeenCalledWith("t");
    });
  });

  describe("Treatment type filters", () => {
    it("displays treatment type checkboxes", () => {
      render(<FilterBar {...mockProps} />);

      expect(screen.getByText(/💡.*Banho de Luz/)).toBeInTheDocument();
      expect(screen.getByText(/🪄.*Bastão/)).toBeInTheDocument();
    });

    it("checks treatment type when selected", () => {
      render(<FilterBar {...mockProps} treatmentTypes={["light_bath"]} />);

      const lightBathCheckbox = screen.getByRole("checkbox", {
        name: /💡.*Banho de Luz/,
      }) as HTMLInputElement;
      expect(lightBathCheckbox.checked).toBe(true);
    });

    it("calls onTreatmentTypesChange when checkbox is clicked", async () => {
      const user = userEvent.setup();
      render(<FilterBar {...mockProps} />);

      const lightBathCheckbox = screen.getByRole("checkbox", {
        name: /💡.*Banho de Luz/,
      });
      await user.click(lightBathCheckbox);

      expect(mockProps.onTreatmentTypesChange).toHaveBeenCalledWith([
        "light_bath",
      ]);
    });

    it("shows active filter when light bath is selected", () => {
      render(
        <FilterBar
          {...mockProps}
          treatmentTypes={["light_bath"]}
          hasActiveFilters={true}
        />
      );

      // Check for the active filter tag with Banho de Luz text (appears twice - checkbox + active filter)
      expect(screen.getAllByText(/💡.*Banho de Luz/)).toHaveLength(2);

      // Should have both clear all button and individual filter remove button
      const removeButtons = screen.getAllByRole("button", { name: /✕/ });
      expect(removeButtons).toHaveLength(2); // Clear all + individual filter remove
    });
  });

  describe("Status filters", () => {
    it("should display status checkboxes", () => {
      render(<FilterBar {...mockProps} />);

      expect(screen.getByText(/📅.*Agendado/)).toBeInTheDocument();
      expect(screen.getByText(/⚡.*Em Progresso/)).toBeInTheDocument();
      expect(screen.getByText(/✅.*Concluído/)).toBeInTheDocument();
      expect(screen.getByText(/❌.*Cancelado/)).toBeInTheDocument();
    });

    it("should check status when selected", () => {
      render(<FilterBar {...mockProps} statuses={["scheduled"]} />);

      const scheduledCheckbox = screen.getByRole("checkbox", {
        name: /📅.*Agendado/,
      }) as HTMLInputElement;
      expect(scheduledCheckbox.checked).toBe(true);
    });

    it("should call onStatusesChange when checkbox is clicked", async () => {
      const user = userEvent.setup();
      render(<FilterBar {...mockProps} />);

      const scheduledCheckbox = screen.getByRole("checkbox", {
        name: /📅.*Agendado/,
      });
      await user.click(scheduledCheckbox);

      expect(mockProps.onStatusesChange).toHaveBeenCalledWith(["scheduled"]);
    });
  });

  describe("Date range filters", () => {
    it("should display date preset buttons", () => {
      render(<FilterBar {...mockProps} />);

      expect(screen.getByText("Hoje")).toBeInTheDocument();
      expect(screen.getByText("Esta semana")).toBeInTheDocument();
      expect(screen.getByText("Este mês")).toBeInTheDocument();
      expect(screen.getByText("Este trimestre")).toBeInTheDocument();
      expect(screen.getByText("Período personalizado")).toBeInTheDocument();
    });

    it("should call onDatePresetChange when preset button is clicked", async () => {
      const user = userEvent.setup();
      render(<FilterBar {...mockProps} />);

      const todayButton = screen.getByText("Hoje");
      await user.click(todayButton);

      expect(mockProps.onDatePresetChange).toHaveBeenCalledWith("today");
    });

    it("should display date inputs", () => {
      render(<FilterBar {...mockProps} />);

      expect(screen.getByLabelText("Data inicial")).toBeInTheDocument();
      expect(screen.getByLabelText("Data final")).toBeInTheDocument();
    });

    it("should call onDateRangeChange when date input changes", async () => {
      const user = userEvent.setup();
      render(<FilterBar {...mockProps} />);

      const startDateInput = screen.getByLabelText("Data inicial");
      await user.type(startDateInput, "2024-01-01");

      expect(mockProps.onDateRangeChange).toHaveBeenCalled();
    });
  });

  describe("Clear filters", () => {
    it("should display clear filters button when hasActiveFilters is true", () => {
      render(<FilterBar {...mockProps} hasActiveFilters={true} />);

      expect(
        screen.getByRole("button", { name: /✕.*Limpar todos/ })
      ).toBeInTheDocument();
    });

    it("should not display clear filters button when hasActiveFilters is false", () => {
      render(<FilterBar {...mockProps} hasActiveFilters={false} />);

      expect(
        screen.queryByRole("button", { name: /✕.*Limpar todos/ })
      ).not.toBeInTheDocument();
    });

    it("should call onClearFilters when clear button is clicked", async () => {
      const user = userEvent.setup();
      render(<FilterBar {...mockProps} hasActiveFilters={true} />);

      const clearButton = screen.getByRole("button", {
        name: /✕.*Limpar todos/,
      });
      await user.click(clearButton);

      expect(mockProps.onClearFilters).toHaveBeenCalled();
    });
  });

  describe("Save preset", () => {
    it("should display save button when hasActiveFilters is true", () => {
      render(<FilterBar {...mockProps} hasActiveFilters={true} />);

      expect(
        screen.getByRole("button", { name: /💾.*Salvar/ })
      ).toBeInTheDocument();
    });

    it("should disable save button when hasActiveFilters is false", () => {
      render(<FilterBar {...mockProps} hasActiveFilters={false} />);

      const saveButton = screen.getByRole("button", { name: /💾.*Salvar/ });
      expect(saveButton).toBeDisabled();
    });

    it("should open save modal when save button is clicked", async () => {
      const user = userEvent.setup();
      render(<FilterBar {...mockProps} hasActiveFilters={true} />);

      const saveButton = screen.getByRole("button", { name: /💾.*Salvar/ });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText("Salvar Filtros")).toBeInTheDocument();
      });
    });

    it("should hide save modal when cancelled", async () => {
      const user = userEvent.setup();
      render(<FilterBar {...mockProps} hasActiveFilters={true} />);

      // Open modal
      const saveButton = screen.getByRole("button", { name: /💾.*Salvar/ });
      await user.click(saveButton);

      // Cancel
      const cancelButton = screen.getByText("Cancelar");
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText("Salvar Filtros")).not.toBeInTheDocument();
      });
    });
  });

  describe("Active filters display", () => {
    it("should show active filters summary when filters are applied", () => {
      render(
        <FilterBar
          {...mockProps}
          searchTerm="João"
          treatmentTypes={["light_bath"]}
          statuses={["scheduled"]}
          hasActiveFilters={true}
        />
      );

      // Should show search term
      expect(screen.getByText(/João/)).toBeInTheDocument();

      // Should show treatment type in active filters (using getAllByText since it appears in both places)
      expect(screen.getAllByText(/💡.*Banho de Luz/)).toHaveLength(2); // Checkbox label + active filter

      // Should show status in active filters
      expect(screen.getAllByText(/📅.*Agendado/)).toHaveLength(2); // Checkbox label + active filter
    });

    it("should not show active filters summary when no filters are applied", () => {
      render(<FilterBar {...mockProps} />);

      // Active filters section should not be present
      expect(screen.queryByText("🔍")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper labels for form inputs", () => {
      render(<FilterBar {...mockProps} />);

      expect(
        screen.getByLabelText("Buscar por paciente, local ou notas")
      ).toBeInTheDocument();
      expect(screen.getByText("Tipo de Tratamento")).toBeInTheDocument();
      expect(screen.getByText("Status da Sessão")).toBeInTheDocument();
      expect(screen.getByText("Período")).toBeInTheDocument();
    });

    it("should have proper checkbox labels", () => {
      render(<FilterBar {...mockProps} />);

      // Treatment type checkboxes
      expect(screen.getByText(/💡.*Banho de Luz/)).toBeInTheDocument();
      expect(screen.getByText(/🪄.*Bastão/)).toBeInTheDocument();

      // Status checkboxes
      expect(screen.getByText(/📅.*Agendado/)).toBeInTheDocument();
      expect(screen.getByText(/⚡.*Em Progresso/)).toBeInTheDocument();
      expect(screen.getByText(/✅.*Concluído/)).toBeInTheDocument();
      expect(screen.getByText(/❌.*Cancelado/)).toBeInTheDocument();
    });
  });

  describe("Collapsible Filter Grid", () => {
    it("should show collapse toggle button", () => {
      render(<FilterBar {...mockProps} />);

      const collapseButton = screen.getByTitle("Recolher filtros");
      expect(collapseButton).toBeInTheDocument();
    });

    it("should toggle filter grid visibility", async () => {
      const user = userEvent.setup();
      render(<FilterBar {...mockProps} />);

      const collapseButton = screen.getByTitle("Recolher filtros");

      // Initially visible
      expect(screen.getByText("Tipo de Tratamento")).toBeVisible();

      // Click to collapse
      await user.click(collapseButton);

      // Should be hidden with CSS classes
      const filterGrid = screen
        .getByText("Tipo de Tratamento")
        .closest(".space-y-6")?.parentElement;
      expect(filterGrid).toHaveClass(
        "max-h-0",
        "opacity-0",
        "pointer-events-none"
      );
    });
  });

  describe("Load preset", () => {
    it("should display preset dropdown when savedPresets exist", () => {
      render(<FilterBar {...mockProps} savedPresets={mockPresets} />);

      expect(screen.getByText("Active Light Bath")).toBeInTheDocument();
      expect(screen.getByText("This Week")).toBeInTheDocument();
    });

    it("should call onLoadPreset when preset is selected", async () => {
      const user = userEvent.setup();
      render(<FilterBar {...mockProps} savedPresets={mockPresets} />);

      const dropdown = screen.getByDisplayValue("Selecione um filtro");
      await user.selectOptions(dropdown, "preset-1");

      expect(mockProps.onLoadPreset).toHaveBeenCalledWith(mockPresets[0]);
    });
  });

  describe("Manage Presets", () => {
    it("should open manage modal when manage button is clicked", async () => {
      const user = userEvent.setup();
      render(<FilterBar {...mockProps} savedPresets={mockPresets} />);

      const manageButton = screen.getByRole("button", {
        name: /⚙️.*Gerenciar/,
      });
      await user.click(manageButton);

      await waitFor(() => {
        expect(
          screen.getByText("Gerenciar Filtros Salvos")
        ).toBeInTheDocument();
      });
    });

    it("should display presets in manage modal", async () => {
      const user = userEvent.setup();
      render(<FilterBar {...mockProps} savedPresets={mockPresets} />);

      const manageButton = screen.getByRole("button", {
        name: /⚙️.*Gerenciar/,
      });
      await user.click(manageButton);

      await waitFor(() => {
        const modalHeadings = screen.getAllByRole("heading", { level: 4 });
        expect(
          modalHeadings.find((h) => h.textContent === "Active Light Bath")
        ).toBeInTheDocument();
        expect(screen.getAllByText("This Week")[1]).toBeInTheDocument(); // Modal heading, not dropdown option
      });
    });

    it("should call onRemovePreset when remove button is clicked", async () => {
      const user = userEvent.setup();
      render(<FilterBar {...mockProps} savedPresets={mockPresets} />);

      const manageButton = screen.getByRole("button", {
        name: /⚙️.*Gerenciar/,
      });
      await user.click(manageButton);

      await waitFor(() => {
        expect(
          screen.getByText("Gerenciar Filtros Salvos")
        ).toBeInTheDocument();
      });

      // Click remove button for first preset
      const removeButtons = screen.getAllByText("🗑️");
      await user.click(removeButtons[0]);

      expect(mockProps.onRemovePreset).toHaveBeenCalledWith(mockPresets[0].id);
    });

    it("should load preset and close modal when load button is clicked", async () => {
      const user = userEvent.setup();
      render(<FilterBar {...mockProps} savedPresets={mockPresets} />);

      const manageButton = screen.getByRole("button", {
        name: /⚙️.*Gerenciar/,
      });
      await user.click(manageButton);

      await waitFor(() => {
        expect(
          screen.getByText("Gerenciar Filtros Salvos")
        ).toBeInTheDocument();
      });

      // Click load button for first preset (only emoji is shown on small screens, text on larger screens)
      const loadButtons = screen.getAllByText("📋");
      await user.click(loadButtons[0]);

      expect(mockProps.onLoadPreset).toHaveBeenCalledWith(mockPresets[0]);

      await waitFor(() => {
        expect(
          screen.queryByText("Gerenciar Filtros Salvos")
        ).not.toBeInTheDocument();
      });
    });
  });
});
