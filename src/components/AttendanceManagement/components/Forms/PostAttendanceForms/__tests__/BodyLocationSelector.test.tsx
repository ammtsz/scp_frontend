import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import BodyLocationSelector from "../Tabs/TreatmentRecommendationsTab/BodyLocationSelector";

describe("BodyLocationSelector", () => {
  const mockOnLocationsSubmit = jest.fn();

  beforeEach(() => {
    mockOnLocationsSubmit.mockClear();
  });

  it("renders with default state", () => {
    render(<BodyLocationSelector onLocationsSubmit={mockOnLocationsSubmit} />);

    expect(
      screen.getByText("Adicione um ou mais locais para o tratamento:")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Selecione os locais do corpo")
    ).toBeInTheDocument();
    expect(screen.queryByText("Confirmar locais")).not.toBeInTheDocument();
  });

  it("opens dropdown when clicked", () => {
    render(<BodyLocationSelector onLocationsSubmit={mockOnLocationsSubmit} />);

    const dropdownButton = screen.getByRole("button");
    fireEvent.click(dropdownButton);

    expect(screen.getByText("Região Central")).toBeInTheDocument();
    expect(screen.getByText("Coluna e Pescoço")).toBeInTheDocument();
    expect(screen.getByText("Membros Superiores")).toBeInTheDocument();
    expect(screen.getByText("Membros Inferiores")).toBeInTheDocument();
    expect(screen.getByText("Local Personalizado")).toBeInTheDocument();
  });

  it("shows Add Treatment button when locations are selected", () => {
    render(<BodyLocationSelector onLocationsSubmit={mockOnLocationsSubmit} />);

    // Open dropdown
    const dropdownButton = screen.getByRole("button");
    fireEvent.click(dropdownButton);

    // Select a location
    const cabecaCheckbox = screen.getAllByRole("checkbox").find((checkbox) => {
      const parentLabel = checkbox.closest("label");
      return parentLabel?.textContent?.includes("cabeça");
    });
    expect(cabecaCheckbox).toBeDefined();
    fireEvent.click(cabecaCheckbox!);

    // Add Treatment button should appear
    expect(screen.getByText("Confirmar locais")).toBeInTheDocument();
  });

  it("submits multiple locations when Add Treatment is clicked", () => {
    render(<BodyLocationSelector onLocationsSubmit={mockOnLocationsSubmit} />);

    // Open dropdown
    const dropdownButton = screen.getByRole("button");
    fireEvent.click(dropdownButton);

    // Select multiple locations
    const cabecaCheckbox = screen.getAllByRole("checkbox").find((checkbox) => {
      const parentLabel = checkbox.closest("label");
      return parentLabel?.textContent?.includes("cabeça");
    });
    expect(cabecaCheckbox).toBeDefined();
    fireEvent.click(cabecaCheckbox!);

    const bracoCheckbox = screen.getAllByRole("checkbox").find((checkbox) => {
      const parentLabel = checkbox.closest("label");
      return parentLabel?.textContent?.includes("braço direito");
    });
    expect(bracoCheckbox).toBeDefined();
    fireEvent.click(bracoCheckbox!);

    // Click Add Treatment button
    const addButton = screen.getByText("Confirmar locais");
    fireEvent.click(addButton);

    // Should submit all selected locations at once
    expect(mockOnLocationsSubmit).toHaveBeenCalledWith([
      "cabeça",
      "braço direito",
    ]);
    expect(mockOnLocationsSubmit).toHaveBeenCalledTimes(1);
  });

  it("resets selector after submitting locations", () => {
    render(<BodyLocationSelector onLocationsSubmit={mockOnLocationsSubmit} />);

    // Open dropdown and select location
    const dropdownButton = screen.getByRole("button");
    fireEvent.click(dropdownButton);

    const cabecaCheckbox = screen.getAllByRole("checkbox").find((checkbox) => {
      const parentLabel = checkbox.closest("label");
      return parentLabel?.textContent?.includes("cabeça");
    });
    expect(cabecaCheckbox).toBeDefined();
    fireEvent.click(cabecaCheckbox!);

    // Click Add Treatment button
    const addButton = screen.getByText("Confirmar locais");
    fireEvent.click(addButton);

    // Should reset to default state
    expect(
      screen.getByText("Selecione os locais do corpo")
    ).toBeInTheDocument();
    expect(screen.queryByText("Confirmar locais")).not.toBeInTheDocument();
    expect(screen.queryByText("Locais Selecionados:")).not.toBeInTheDocument();
  });

  it("shows custom location input when selected", () => {
    render(<BodyLocationSelector onLocationsSubmit={mockOnLocationsSubmit} />);

    // Open dropdown
    const dropdownButton = screen.getByRole("button");
    fireEvent.click(dropdownButton);

    // Select custom location using a more specific approach
    const customCheckbox = screen.getAllByRole("checkbox").find((checkbox) => {
      const parentLabel = checkbox.closest("label");
      return parentLabel?.textContent?.includes("Local Personalizado");
    });
    expect(customCheckbox).toBeDefined();
    fireEvent.click(customCheckbox!);

    expect(
      screen.getByPlaceholderText("Digite o local específico...")
    ).toBeInTheDocument();
  });

  it("includes custom location in submission", () => {
    render(<BodyLocationSelector onLocationsSubmit={mockOnLocationsSubmit} />);

    // Open dropdown and select custom location
    const dropdownButton = screen.getByRole("button");
    fireEvent.click(dropdownButton);

    const customCheckbox = screen.getAllByRole("checkbox").find((checkbox) => {
      const parentLabel = checkbox.closest("label");
      return parentLabel?.textContent?.includes("Local Personalizado");
    });
    expect(customCheckbox).toBeDefined();
    fireEvent.click(customCheckbox!);

    // Type in custom location
    const customInput = screen.getByPlaceholderText(
      "Digite o local específico..."
    );
    fireEvent.change(customInput, { target: { value: "tornozelo medial" } });

    // Click Add Treatment button
    const addButton = screen.getByText("Confirmar locais");
    fireEvent.click(addButton);

    expect(mockOnLocationsSubmit).toHaveBeenCalledWith(["tornozelo medial"]);
  });

  it("combines predefined and custom locations in submission", () => {
    render(<BodyLocationSelector onLocationsSubmit={mockOnLocationsSubmit} />);

    // Open dropdown and select predefined location
    const dropdownButton = screen.getByRole("button");
    fireEvent.click(dropdownButton);

    const cabecaCheckbox = screen.getAllByRole("checkbox").find((checkbox) => {
      const parentLabel = checkbox.closest("label");
      return parentLabel?.textContent?.includes("cabeça");
    });
    expect(cabecaCheckbox).toBeDefined();
    fireEvent.click(cabecaCheckbox!);

    // Select custom location
    const customCheckbox = screen.getAllByRole("checkbox").find((checkbox) => {
      const parentLabel = checkbox.closest("label");
      return parentLabel?.textContent?.includes("Local Personalizado");
    });
    expect(customCheckbox).toBeDefined();
    fireEvent.click(customCheckbox!);

    // Type in custom location
    const customInput = screen.getByPlaceholderText(
      "Digite o local específico..."
    );
    fireEvent.change(customInput, { target: { value: "tornozelo medial" } });

    // Click Add Treatment button
    const addButton = screen.getByText("Confirmar locais");
    fireEvent.click(addButton);

    expect(mockOnLocationsSubmit).toHaveBeenCalledWith([
      "cabeça",
      "tornozelo medial",
    ]);
  });

  it("displays selected locations as tags", () => {
    render(<BodyLocationSelector onLocationsSubmit={mockOnLocationsSubmit} />);

    // Open dropdown and select locations
    const dropdownButton = screen.getByRole("button");
    fireEvent.click(dropdownButton);

    const cabecaCheckbox = screen.getAllByRole("checkbox").find((checkbox) => {
      const parentLabel = checkbox.closest("label");
      return parentLabel?.textContent?.includes("cabeça");
    });
    expect(cabecaCheckbox).toBeDefined();
    fireEvent.click(cabecaCheckbox!);

    const bracoCheckbox = screen.getAllByRole("checkbox").find((checkbox) => {
      const parentLabel = checkbox.closest("label");
      return parentLabel?.textContent?.includes("braço direito");
    });
    expect(bracoCheckbox).toBeDefined();
    fireEvent.click(bracoCheckbox!);

    // Check for selected locations display
    expect(screen.getByText("Locais Selecionados:")).toBeInTheDocument();

    // Look for tags in the selected locations section
    const selectedSection = screen.getByText(
      "Locais Selecionados:"
    ).parentElement;
    expect(selectedSection).toBeInTheDocument();
  });

  it("removes location when tag close button is clicked", async () => {
    render(<BodyLocationSelector onLocationsSubmit={mockOnLocationsSubmit} />);

    // Open dropdown and select a location
    const dropdownButton = screen.getByRole("button");
    fireEvent.click(dropdownButton);

    const cabecaCheckbox = screen.getAllByRole("checkbox").find((checkbox) => {
      const parentLabel = checkbox.closest("label");
      return parentLabel?.textContent?.includes("cabeça");
    });
    expect(cabecaCheckbox).toBeDefined();
    fireEvent.click(cabecaCheckbox!);

    // Find and click the remove button (×) in the tag
    await waitFor(() => {
      const removeButtons = screen.getAllByText("×");
      expect(removeButtons.length).toBeGreaterThan(0);
      fireEvent.click(removeButtons[0]);
    });

    // Should remove the location from selected locations
    expect(screen.queryByText("Locais Selecionados:")).not.toBeInTheDocument();
    expect(screen.queryByText("Confirmar locais")).not.toBeInTheDocument();
  });

  it("displays truncated text for many selections", () => {
    render(<BodyLocationSelector onLocationsSubmit={mockOnLocationsSubmit} />);

    // Open dropdown
    const dropdownButton = screen.getByRole("button");
    fireEvent.click(dropdownButton);

    // Select multiple locations
    const checkboxes = screen.getAllByRole("checkbox");
    // Select first 5 body part checkboxes (skip custom location)
    for (let i = 0; i < 5; i++) {
      fireEvent.click(checkboxes[i]);
    }

    // Should show truncated display
    expect(screen.getByText(/e mais \d+/)).toBeInTheDocument();
  });

  it("handles disabled state", () => {
    render(
      <BodyLocationSelector
        onLocationsSubmit={mockOnLocationsSubmit}
        disabled={true}
      />
    );

    const dropdownButton = screen.getByRole("button");
    expect(dropdownButton).toBeDisabled();
  });

  it("closes dropdown when clicking outside", async () => {
    render(
      <div>
        <BodyLocationSelector onLocationsSubmit={mockOnLocationsSubmit} />
        <div data-testid="outside">Outside element</div>
      </div>
    );

    // Open dropdown
    const dropdownButton = screen.getByRole("button");
    fireEvent.click(dropdownButton);

    // Verify dropdown is open
    expect(screen.getByText("Região Central")).toBeInTheDocument();

    // Click outside
    const outsideElement = screen.getByTestId("outside");
    fireEvent.mouseDown(outsideElement);

    // Wait for dropdown to close
    await waitFor(() => {
      expect(screen.queryByText("Região Central")).not.toBeInTheDocument();
    });
  });

  describe("Search functionality", () => {
    it("shows search input when dropdown is open", () => {
      render(
        <BodyLocationSelector onLocationsSubmit={mockOnLocationsSubmit} />
      );

      // Open dropdown
      const dropdownButton = screen.getByRole("button");
      fireEvent.click(dropdownButton);

      // Check for search input
      expect(
        screen.getByPlaceholderText("Buscar local do corpo...")
      ).toBeInTheDocument();
    });

    it("filters locations based on search term", () => {
      render(
        <BodyLocationSelector onLocationsSubmit={mockOnLocationsSubmit} />
      );

      // Open dropdown
      const dropdownButton = screen.getByRole("button");
      fireEvent.click(dropdownButton);

      // Get search input
      const searchInput = screen.getByPlaceholderText(
        "Buscar local do corpo..."
      );

      // Search for "cabeça"
      fireEvent.change(searchInput, { target: { value: "cabeça" } });

      // Should show only cabeça
      expect(screen.getByText("cabeça")).toBeInTheDocument();
      // Should not show other locations like "peito"
      expect(screen.queryByText("peito")).not.toBeInTheDocument();
    });

    it("shows no results message when search yields no matches", () => {
      render(
        <BodyLocationSelector onLocationsSubmit={mockOnLocationsSubmit} />
      );

      // Open dropdown
      const dropdownButton = screen.getByRole("button");
      fireEvent.click(dropdownButton);

      // Search for non-existent location
      const searchInput = screen.getByPlaceholderText(
        "Buscar local do corpo..."
      );
      fireEvent.change(searchInput, { target: { value: "xyz123" } });

      // Should show no results message
      expect(
        screen.getByText(/Nenhum local encontrado para/)
      ).toBeInTheDocument();
    });

    it("clears search when dropdown is closed by clicking outside", async () => {
      render(
        <div>
          <BodyLocationSelector onLocationsSubmit={mockOnLocationsSubmit} />
          <div data-testid="outside">Outside element</div>
        </div>
      );

      // Open dropdown
      const dropdownButton = screen.getByRole("button");
      fireEvent.click(dropdownButton);

      // Search for something
      const searchInput = screen.getByPlaceholderText(
        "Buscar local do corpo..."
      );
      fireEvent.change(searchInput, { target: { value: "cabeça" } });

      // Click outside to close
      const outsideElement = screen.getByTestId("outside");
      fireEvent.mouseDown(outsideElement);

      // Wait for dropdown to close
      await waitFor(() => {
        expect(screen.queryByText("Região Central")).not.toBeInTheDocument();
      });

      // Open dropdown again
      fireEvent.click(dropdownButton);

      // Search input should be cleared
      const newSearchInput = screen.getByPlaceholderText(
        "Buscar local do corpo..."
      );
      expect(newSearchInput).toHaveValue("");
    });

    it("clears search when opening dropdown", () => {
      render(
        <BodyLocationSelector onLocationsSubmit={mockOnLocationsSubmit} />
      );

      // Open dropdown
      const dropdownButton = screen.getByRole("button");
      fireEvent.click(dropdownButton);

      // Search for something
      const searchInput = screen.getByPlaceholderText(
        "Buscar local do corpo..."
      );
      fireEvent.change(searchInput, { target: { value: "cabeça" } });

      // Close dropdown by clicking button again
      fireEvent.click(dropdownButton);

      // Open dropdown again
      fireEvent.click(dropdownButton);

      // Search input should be cleared
      const newSearchInput = screen.getByPlaceholderText(
        "Buscar local do corpo..."
      );
      expect(newSearchInput).toHaveValue("");
    });

    it("search is case insensitive", () => {
      render(
        <BodyLocationSelector onLocationsSubmit={mockOnLocationsSubmit} />
      );

      // Open dropdown
      const dropdownButton = screen.getByRole("button");
      fireEvent.click(dropdownButton);

      // Search with different cases
      const searchInput = screen.getByPlaceholderText(
        "Buscar local do corpo..."
      );
      fireEvent.change(searchInput, { target: { value: "CABEÇA" } });

      // Should still find "cabeça"
      expect(screen.getByText("cabeça")).toBeInTheDocument();
    });

    it("clears search when submitting locations", () => {
      render(
        <BodyLocationSelector onLocationsSubmit={mockOnLocationsSubmit} />
      );

      // Open dropdown
      const dropdownButton = screen.getByRole("button");
      fireEvent.click(dropdownButton);

      // Search and select a location
      const searchInput = screen.getByPlaceholderText(
        "Buscar local do corpo..."
      );
      fireEvent.change(searchInput, { target: { value: "cabeça" } });

      const cabecaCheckbox = screen
        .getAllByRole("checkbox")
        .find((checkbox) => {
          const parentLabel = checkbox.closest("label");
          return parentLabel?.textContent?.includes("cabeça");
        });
      fireEvent.click(cabecaCheckbox!);

      // Submit
      const submitButton = screen.getByText("Confirmar locais");
      fireEvent.click(submitButton);

      // Open dropdown again
      fireEvent.click(dropdownButton);

      // Search input should be cleared
      const newSearchInput = screen.getByPlaceholderText(
        "Buscar local do corpo..."
      );
      expect(newSearchInput).toHaveValue("");
    });
  });

  describe("Custom Location Edge Cases", () => {
    it("should clear custom location when toggling custom location checkbox off", () => {
      render(
        <BodyLocationSelector onLocationsSubmit={mockOnLocationsSubmit} />
      );

      // Open dropdown
      const dropdownButton = screen.getByRole("button");
      fireEvent.click(dropdownButton);

      // Enable custom location
      const customLocationCheckbox = screen
        .getAllByRole("checkbox")
        .find((checkbox) => {
          const parentLabel = checkbox.closest("label");
          return parentLabel?.textContent?.includes("Local Personalizado");
        });
      fireEvent.click(customLocationCheckbox!);

      // Type custom location
      const customLocationInput = screen.getByPlaceholderText(
        "Digite o local específico..."
      );
      fireEvent.change(customLocationInput, {
        target: { value: "Custom Test Location" },
      });

      // Toggle custom location off
      fireEvent.click(customLocationCheckbox!);

      // Toggle back on to verify input was cleared
      fireEvent.click(customLocationCheckbox!);
      const newCustomLocationInput = screen.getByPlaceholderText(
        "Digite o local específico..."
      );
      expect(newCustomLocationInput).toHaveValue("");
    });

    it("should remove custom location tag when close button is clicked", () => {
      render(
        <BodyLocationSelector onLocationsSubmit={mockOnLocationsSubmit} />
      );

      // Open dropdown
      const dropdownButton = screen.getByRole("button");
      fireEvent.click(dropdownButton);

      // Enable custom location
      const customLocationCheckbox = screen
        .getAllByRole("checkbox")
        .find((checkbox) => {
          const parentLabel = checkbox.closest("label");
          return parentLabel?.textContent?.includes("Local Personalizado");
        });
      fireEvent.click(customLocationCheckbox!);

      // Type custom location
      const customLocationInput = screen.getByPlaceholderText(
        "Digite o local específico..."
      );
      fireEvent.change(customLocationInput, {
        target: { value: "Custom Test Location" },
      });

      // Verify custom location tag appears (use getAllByText since it appears in multiple places)
      const customLocationElements = screen.getAllByText(
        "Custom Test Location"
      );
      expect(customLocationElements).toHaveLength(2); // In dropdown button and in tag

      // Click close button on custom location tag (find within the tag element)
      const customLocationTags = screen.getAllByText("Custom Test Location");
      const tagElement = customLocationTags.find((el) =>
        el.closest("span")?.querySelector("button")
      );
      expect(tagElement).toBeInTheDocument();

      const closeButton = tagElement!.closest("span")!.querySelector("button");
      expect(closeButton).toBeInTheDocument();
      fireEvent.click(closeButton!);

      // Custom location should be removed
      expect(
        screen.queryByText("Custom Test Location")
      ).not.toBeInTheDocument();
      expect(customLocationCheckbox).not.toBeChecked();
    });
  });

  describe("Click Outside Functionality", () => {
    it("should close dropdown when clicking outside", () => {
      render(
        <BodyLocationSelector onLocationsSubmit={mockOnLocationsSubmit} />
      );

      // Open dropdown
      const dropdownButton = screen.getByRole("button");
      fireEvent.click(dropdownButton);

      // Verify dropdown is open
      expect(screen.getByText("Região Central")).toBeInTheDocument();

      // Click outside (on document body)
      fireEvent.mouseDown(document.body);

      // Dropdown should be closed
      expect(screen.queryByText("Região Central")).not.toBeInTheDocument();
    });

    it("should not close dropdown when clicking on search input", () => {
      render(
        <BodyLocationSelector onLocationsSubmit={mockOnLocationsSubmit} />
      );

      // Open dropdown
      const dropdownButton = screen.getByRole("button");
      fireEvent.click(dropdownButton);

      // Click on search input
      const searchInput = screen.getByPlaceholderText(
        "Buscar local do corpo..."
      );
      fireEvent.click(searchInput);

      // Dropdown should remain open
      expect(screen.getByText("Região Central")).toBeInTheDocument();
    });
  });
});
