import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LocationSelector from "../LocationSelector";
import { LOCATION_GROUPS } from "@/utils/treatmentLocations";

describe("LocationSelector", () => {
  const defaultProps = {
    selectedLocations: [],
    customLocation: "",
    onLocationChange: jest.fn(),
    onCustomLocationChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the component with title and groups", () => {
      render(<LocationSelector {...defaultProps} />);

      expect(screen.getByText("Locais do Tratamento")).toBeInTheDocument();
      expect(screen.getByText("0/5 selecionados")).toBeInTheDocument();

      // Check if all location groups are rendered
      Object.keys(LOCATION_GROUPS).forEach((groupName) => {
        expect(screen.getByText(groupName)).toBeInTheDocument();
      });
    });

    it("should render all predefined locations", () => {
      render(<LocationSelector {...defaultProps} />);

      // Check if all locations from all groups are rendered
      Object.values(LOCATION_GROUPS)
        .flat()
        .forEach((location) => {
          expect(screen.getByText(location)).toBeInTheDocument();
        });
    });

    it("should display selected locations counter correctly", () => {
      render(
        <LocationSelector
          {...defaultProps}
          selectedLocations={["Coronário", "Lombar"]}
        />
      );

      expect(screen.getByText("2/5 selecionados")).toBeInTheDocument();
    });

    it("should render selected locations as badges", () => {
      const selectedLocations = ["Coronário", "Lombar"];
      render(
        <LocationSelector
          {...defaultProps}
          selectedLocations={selectedLocations}
        />
      );

      selectedLocations.forEach((location) => {
        const badges = screen.getAllByText(location);
        expect(badges.length).toBeGreaterThan(0); // Should appear both as badge and button
      });
    });
  });

  describe("Location Selection", () => {
    it("should call onLocationChange when a location is selected", async () => {
      const user = userEvent.setup();
      const mockOnLocationChange = jest.fn();

      render(
        <LocationSelector
          {...defaultProps}
          onLocationChange={mockOnLocationChange}
        />
      );

      const coronaryButton = screen.getByRole("button", { name: "Coronário" });
      await user.click(coronaryButton);

      expect(mockOnLocationChange).toHaveBeenCalledWith(["Coronário"]);
    });

    it("should call onLocationChange when a location is deselected", async () => {
      const user = userEvent.setup();
      const mockOnLocationChange = jest.fn();

      render(
        <LocationSelector
          {...defaultProps}
          selectedLocations={["Coronário"]}
          onLocationChange={mockOnLocationChange}
        />
      );

      const coronaryButton = screen.getByRole("button", { name: "Coronário" });
      await user.click(coronaryButton);

      expect(mockOnLocationChange).toHaveBeenCalledWith([]);
    });

    it("should remove location when clicking X on badge", async () => {
      const user = userEvent.setup();
      const mockOnLocationChange = jest.fn();

      render(
        <LocationSelector
          {...defaultProps}
          selectedLocations={["Coronário", "Lombar"]}
          onLocationChange={mockOnLocationChange}
        />
      );

      // Find the X button for Coronário badge using getAllByText to handle multiple matches
      const removeButtons = screen.getAllByRole("button", { name: "×" });
      await user.click(removeButtons[0]); // Click first remove button (Coronário)

      expect(mockOnLocationChange).toHaveBeenCalledWith(["Lombar"]);
    });

    it("should respect max selections limit", async () => {
      const user = userEvent.setup();
      const mockOnLocationChange = jest.fn();
      const maxSelections = 2;

      render(
        <LocationSelector
          {...defaultProps}
          selectedLocations={["Coronário", "Lombar"]}
          onLocationChange={mockOnLocationChange}
          maxSelections={maxSelections}
        />
      );

      expect(screen.getByText("2/2 selecionados")).toBeInTheDocument();

      // Try to select another location
      const headButton = screen.getByRole("button", { name: "Cabeça" });
      await user.click(headButton);

      // Should not call onLocationChange since max is reached
      expect(mockOnLocationChange).not.toHaveBeenCalled();
    });

    it("should disable buttons when max selections reached", () => {
      render(
        <LocationSelector
          {...defaultProps}
          selectedLocations={["Coronário", "Lombar"]}
          maxSelections={2}
        />
      );

      const headButton = screen.getByRole("button", { name: "Cabeça" });
      expect(headButton).toBeDisabled();
    });
  });

  describe("Custom Location", () => {
    it('should show custom location input when "Adicionar" is clicked', async () => {
      const user = userEvent.setup();

      render(<LocationSelector {...defaultProps} />);

      const addButton = screen.getByText("+ Adicionar");
      await user.click(addButton);

      expect(
        screen.getByPlaceholderText("Digite o local do tratamento...")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Adicionar" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancelar" })
      ).toBeInTheDocument();
    });

    it("should call onCustomLocationChange when typing in custom input", async () => {
      const user = userEvent.setup();
      const mockOnCustomLocationChange = jest.fn();

      render(
        <LocationSelector
          {...defaultProps}
          onCustomLocationChange={mockOnCustomLocationChange}
        />
      );

      const addButton = screen.getByText("+ Adicionar");
      await user.click(addButton);

      const input = screen.getByPlaceholderText(
        "Digite o local do tratamento..."
      );
      await user.type(input, "Local Personalizado");

      expect(mockOnCustomLocationChange).toHaveBeenCalledTimes(
        "Local Personalizado".length
      );
    });

    it("should add custom location when clicking Adicionar button", async () => {
      const user = userEvent.setup();
      const mockOnLocationChange = jest.fn();
      const mockOnCustomLocationChange = jest.fn();

      render(
        <LocationSelector
          {...defaultProps}
          customLocation="Local Personalizado"
          onLocationChange={mockOnLocationChange}
          onCustomLocationChange={mockOnCustomLocationChange}
        />
      );

      const addButton = screen.getByText("+ Adicionar");
      await user.click(addButton);

      const submitButton = screen.getByRole("button", { name: "Adicionar" });
      await user.click(submitButton);

      expect(mockOnLocationChange).toHaveBeenCalledWith([
        "Local Personalizado",
      ]);
      expect(mockOnCustomLocationChange).toHaveBeenCalledWith("");
    });

    it("should add custom location when pressing Enter", async () => {
      const user = userEvent.setup();
      const mockOnLocationChange = jest.fn();
      const mockOnCustomLocationChange = jest.fn();

      render(
        <LocationSelector
          {...defaultProps}
          customLocation="Local Personalizado"
          onLocationChange={mockOnLocationChange}
          onCustomLocationChange={mockOnCustomLocationChange}
        />
      );

      const addButton = screen.getByText("+ Adicionar");
      await user.click(addButton);

      const input = screen.getByPlaceholderText(
        "Digite o local do tratamento..."
      );
      await user.type(input, "Local Personalizado");
      await user.keyboard("{Enter}");

      expect(mockOnLocationChange).toHaveBeenCalledWith([
        "Local Personalizado",
      ]);
      expect(mockOnCustomLocationChange).toHaveBeenCalledWith("");
    });

    it("should cancel custom input when clicking Cancelar", async () => {
      const user = userEvent.setup();
      const mockOnCustomLocationChange = jest.fn();

      render(
        <LocationSelector
          {...defaultProps}
          customLocation="Some text"
          onCustomLocationChange={mockOnCustomLocationChange}
        />
      );

      const addButton = screen.getByText("+ Adicionar");
      await user.click(addButton);

      const cancelButton = screen.getByRole("button", { name: "Cancelar" });
      await user.click(cancelButton);

      expect(mockOnCustomLocationChange).toHaveBeenCalledWith("");
      expect(
        screen.queryByPlaceholderText("Digite o local do tratamento...")
      ).not.toBeInTheDocument();
    });

    it("should not add empty custom location", async () => {
      const user = userEvent.setup();
      const mockOnLocationChange = jest.fn();

      render(
        <LocationSelector
          {...defaultProps}
          customLocation=""
          onLocationChange={mockOnLocationChange}
        />
      );

      const addButton = screen.getByText("+ Adicionar");
      await user.click(addButton);

      const submitButton = screen.getByRole("button", { name: "Adicionar" });
      await user.click(submitButton);

      expect(mockOnLocationChange).not.toHaveBeenCalled();
    });
  });

  describe("Disabled State", () => {
    it("should disable all interactions when disabled prop is true", () => {
      render(<LocationSelector {...defaultProps} disabled={true} />);

      // Check that location buttons are disabled
      const coronaryButton = screen.getByRole("button", { name: "Coronário" });
      expect(coronaryButton).toBeDisabled();

      // Check that add custom location button is disabled
      const addButton = screen.getByText("+ Adicionar");
      expect(addButton).toBeDisabled();
    });

    it("should not show remove buttons on badges when disabled", () => {
      render(
        <LocationSelector
          {...defaultProps}
          selectedLocations={["Coronário"]}
          disabled={true}
        />
      );

      // When disabled, the badges should not have remove buttons
      const removeButtons = screen.queryAllByRole("button", { name: "×" });
      expect(removeButtons).toHaveLength(0);
    });
  });

  describe("Visual States", () => {
    it("should apply selected styling to selected locations", () => {
      render(
        <LocationSelector {...defaultProps} selectedLocations={["Coronário"]} />
      );

      const coronaryButton = screen.getByRole("button", { name: "Coronário" });
      expect(coronaryButton).toHaveClass(
        "bg-blue-50",
        "border-blue-300",
        "text-blue-800"
      );
    });

    it("should show help text", () => {
      render(<LocationSelector {...defaultProps} maxSelections={3} />);

      expect(
        screen.getByText(
          /Selecione até 3 locais onde o tratamento foi aplicado/
        )
      ).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle predefined location added as custom", async () => {
      const user = userEvent.setup();
      const mockOnLocationChange = jest.fn();
      const mockOnCustomLocationChange = jest.fn();

      render(
        <LocationSelector
          {...defaultProps}
          customLocation="Coronário" // Predefined location entered as custom
          onLocationChange={mockOnLocationChange}
          onCustomLocationChange={mockOnCustomLocationChange}
        />
      );

      const addButton = screen.getByText("+ Adicionar");
      await user.click(addButton);

      const submitButton = screen.getByRole("button", { name: "Adicionar" });
      await user.click(submitButton);

      expect(mockOnLocationChange).toHaveBeenCalledWith(["Coronário"]);
    });

    it("should not add duplicate locations", async () => {
      const user = userEvent.setup();
      const mockOnLocationChange = jest.fn();
      const mockOnCustomLocationChange = jest.fn();

      render(
        <LocationSelector
          {...defaultProps}
          selectedLocations={["Coronário"]}
          customLocation="Coronário"
          onLocationChange={mockOnLocationChange}
          onCustomLocationChange={mockOnCustomLocationChange}
        />
      );

      const addButton = screen.getByText("+ Adicionar");
      await user.click(addButton);

      const submitButton = screen.getByRole("button", { name: "Adicionar" });
      await user.click(submitButton);

      expect(mockOnLocationChange).not.toHaveBeenCalled();
    });
  });
});
