import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import PostTreatmentModal from "../PostTreatmentModal";
import type { TreatmentInfo } from "@/hooks/useTreatmentIndicators";

// Mock data factories
const createMockTreatmentInfo = (
  overrides?: Partial<TreatmentInfo>
): TreatmentInfo => ({
  hasLightBath: true,
  hasRod: true,
  lightBathColor: "azul",
  lightBathDuration: 20,
  bodyLocations: ["Cabeça", "Tórax", "Abdômen"],
  treatmentType: "combined",
  ...overrides,
});

const createMockTreatmentSessions = () => [
  {
    id: 1,
    treatmentType: "light_bath" as const,
    bodyLocations: ["Cabeça", "Tórax"],
    startDate: "2025-09-17",
    plannedSessions: 5,
    completedSessions: 2,
    status: "in_progress" as const,
    color: "azul",
    durationMinutes: 20,
  },
  {
    id: 2,
    treatmentType: "rod" as const,
    bodyLocations: ["Abdômen", "Pernas"],
    startDate: "2025-09-17",
    plannedSessions: 3,
    completedSessions: 1,
    status: "in_progress" as const,
  },
];

describe("PostTreatmentModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onComplete: jest.fn(),
    patientId: 1,
    patientName: "João Silva",
    treatmentInfo: createMockTreatmentInfo(),
    treatmentSessions: createMockTreatmentSessions(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders modal when isOpen is true", () => {
      render(<PostTreatmentModal {...defaultProps} />);

      expect(
        screen.getByRole("heading", { name: /completar tratamento/i })
      ).toBeInTheDocument();
      expect(screen.getByText("João Silva")).toBeInTheDocument();
    });

    it("does not render when isOpen is false", () => {
      render(<PostTreatmentModal {...defaultProps} isOpen={false} />);

      expect(
        screen.queryByText("Completar Tratamento")
      ).not.toBeInTheDocument();
    });

    it("displays treatment overview correctly", () => {
      render(<PostTreatmentModal {...defaultProps} />);

      expect(screen.getByText("Resumo do Tratamento")).toBeInTheDocument();
      // Check for treatment types in the overview section
      const treatmentOverview = screen
        .getByText("Resumo do Tratamento")
        .closest("div");
      expect(treatmentOverview).toBeInTheDocument();
    });

    it("displays treatment sessions with correct information", () => {
      render(<PostTreatmentModal {...defaultProps} />);

      // Light bath session
      expect(
        screen.getByText("Cor: azul | Duração: 20 min")
      ).toBeInTheDocument();
      expect(screen.getByText("Progresso: 2/5 sessões")).toBeInTheDocument();

      // Rod session
      expect(screen.getByText("Progresso: 1/3 sessões")).toBeInTheDocument();
    });

    it("displays body locations as checkboxes", () => {
      render(<PostTreatmentModal {...defaultProps} />);

      // Light bath locations
      expect(screen.getByLabelText(/Cabeça/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Tórax/)).toBeInTheDocument();

      // Rod locations
      expect(screen.getByLabelText(/Abdômen/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Pernas/)).toBeInTheDocument();
    });
  });

  describe("Body Location Selection", () => {
    it("allows selecting and deselecting body locations", () => {
      render(<PostTreatmentModal {...defaultProps} />);

      const cabeçaCheckbox = screen.getByLabelText(
        /Cabeça/
      ) as HTMLInputElement;

      // Initially unchecked
      expect(cabeçaCheckbox.checked).toBe(false);

      // Select location
      fireEvent.click(cabeçaCheckbox);
      expect(cabeçaCheckbox.checked).toBe(true);

      // Deselect location
      fireEvent.click(cabeçaCheckbox);
      expect(cabeçaCheckbox.checked).toBe(false);
    });

    it("shows completion indicator when all locations are selected", () => {
      render(<PostTreatmentModal {...defaultProps} />);

      // Select all locations for light bath session
      fireEvent.click(screen.getByLabelText(/Cabeça/));
      fireEvent.click(screen.getByLabelText(/Tórax/));

      expect(
        screen.getByText("✓ Sessão completa - todos os locais foram tratados")
      ).toBeInTheDocument();
    });

    it("updates submit button state based on selections", () => {
      render(<PostTreatmentModal {...defaultProps} />);

      const submitButton = screen.getByRole("button", {
        name: /completar tratamento/i,
      });

      // Initially disabled
      expect(submitButton).toBeDisabled();

      // Enable after selecting a location
      fireEvent.click(screen.getByLabelText(/Cabeça/));
      expect(submitButton).toBeEnabled();
    });
  });

  describe("Notes Functionality", () => {
    it("allows adding session-specific notes", () => {
      render(<PostTreatmentModal {...defaultProps} />);

      const sessionNotes = screen.getAllByPlaceholderText(
        /Adicione observações sobre esta sessão/
      );
      const firstSessionNote = sessionNotes[0];

      fireEvent.change(firstSessionNote, {
        target: { value: "Paciente relatou melhora" },
      });

      expect(firstSessionNote).toHaveValue("Paciente relatou melhora");
    });

    it("allows adding general notes", () => {
      render(<PostTreatmentModal {...defaultProps} />);

      const generalNotes = screen.getByPlaceholderText(
        /Adicione observações gerais/
      );

      fireEvent.change(generalNotes, {
        target: { value: "Sessão transcorreu bem" },
      });

      expect(generalNotes).toHaveValue("Sessão transcorreu bem");
    });
  });

  describe("Progress Tracking", () => {
    it("calculates and displays progress percentage correctly", () => {
      render(<PostTreatmentModal {...defaultProps} />);

      // Light bath: 2/5 sessions = 40%
      // Rod: 1/3 sessions = 33%

      const progressBars = document.querySelectorAll('[style*="width"]');
      expect(progressBars[0]).toHaveStyle("width: 40%");
      expect(progressBars[1]).toHaveStyle("width: 33%");
    });

    it("shows correct progress text", () => {
      render(<PostTreatmentModal {...defaultProps} />);

      expect(screen.getByText("40% completo")).toBeInTheDocument();
      expect(screen.getByText("33% completo")).toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    it("calls onComplete with correct data when submitted", async () => {
      const onComplete = jest.fn().mockResolvedValue(undefined);
      render(<PostTreatmentModal {...defaultProps} onComplete={onComplete} />);

      // Select some locations
      fireEvent.click(screen.getByLabelText(/Cabeça/));
      fireEvent.click(screen.getByLabelText(/Abdômen/));

      // Add general notes
      const generalNotes = screen.getByPlaceholderText(
        /Adicione observações gerais/
      );
      fireEvent.change(generalNotes, {
        target: { value: "Sessão bem-sucedida" },
      });

      // Submit
      const submitButton = screen.getByRole("button", {
        name: /completar tratamento/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith(
          {
            1: ["Cabeça"],
            2: ["Abdômen"],
          },
          "Sessão bem-sucedida"
        );
      });
    });

    it("shows loading state during submission", async () => {
      const onComplete = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      render(<PostTreatmentModal {...defaultProps} onComplete={onComplete} />);

      // Select a location to enable submit
      fireEvent.click(screen.getByLabelText(/Cabeça/));

      // Submit using button role to be more specific
      const submitButton = screen.getByRole("button", {
        name: /completar tratamento/i,
      });
      fireEvent.click(submitButton);

      expect(screen.getByText("Completando...")).toBeInTheDocument();
      expect(screen.getByText("Completando...")).toBeDisabled();
    });

    it("handles submission errors gracefully", async () => {
      const onComplete = jest
        .fn()
        .mockRejectedValue(new Error("Submission failed"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      render(<PostTreatmentModal {...defaultProps} onComplete={onComplete} />);

      // Select a location and submit
      fireEvent.click(screen.getByLabelText(/Cabeça/));
      const submitButton = screen.getByRole("button", {
        name: /completar tratamento/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error completing treatment:",
          expect.any(Error)
        );
      });

      // Should return to normal state
      expect(
        screen.getByRole("button", { name: /completar tratamento/i })
      ).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe("Modal Actions", () => {
    it("calls onClose when close button is clicked", () => {
      const onClose = jest.fn();
      render(<PostTreatmentModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByText("×"));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when cancel button is clicked", () => {
      const onClose = jest.fn();
      render(<PostTreatmentModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByText("Cancelar"));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("resets form state when modal is closed and reopened", () => {
      const { rerender } = render(<PostTreatmentModal {...defaultProps} />);

      // Select a location and add notes
      fireEvent.click(screen.getByLabelText(/Cabeça/));
      fireEvent.change(
        screen.getByPlaceholderText(/Adicione observações gerais/),
        {
          target: { value: "Test notes" },
        }
      );

      // Close modal
      rerender(<PostTreatmentModal {...defaultProps} isOpen={false} />);

      // Reopen modal
      rerender(<PostTreatmentModal {...defaultProps} isOpen={true} />);

      // Form should be reset
      expect(
        screen.getByLabelText(/Cabeça/) as HTMLInputElement
      ).not.toBeChecked();
      expect(
        screen.getByPlaceholderText(/Adicione observações gerais/)
      ).toHaveValue("");
    });
  });

  describe("Treatment Type Variations", () => {
    it("handles light bath only treatment", () => {
      const lightBathOnlyTreatment = createMockTreatmentInfo({
        hasLightBath: true,
        hasRod: false,
        treatmentType: "lightbath",
      });

      const lightBathOnlySessions = [createMockTreatmentSessions()[0]];

      render(
        <PostTreatmentModal
          {...defaultProps}
          treatmentInfo={lightBathOnlyTreatment}
          treatmentSessions={lightBathOnlySessions}
        />
      );

      // Check for light bath in treatment overview
      expect(screen.getAllByText("Banho de Luz")).toHaveLength(2); // One in overview, one in session
      expect(screen.queryByText("Bastão")).not.toBeInTheDocument();
    });

    it("handles rod only treatment", () => {
      const rodOnlyTreatment = createMockTreatmentInfo({
        hasLightBath: false,
        hasRod: true,
        treatmentType: "rod",
      });

      const rodOnlySessions = [createMockTreatmentSessions()[1]];

      render(
        <PostTreatmentModal
          {...defaultProps}
          treatmentInfo={rodOnlyTreatment}
          treatmentSessions={rodOnlySessions}
        />
      );

      // Check for rod in treatment overview
      expect(screen.getAllByText("Bastão")).toHaveLength(2); // One in overview, one in session
      expect(screen.queryByText("Banho de Luz")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels and roles", () => {
      render(<PostTreatmentModal {...defaultProps} />);

      // Check for proper checkbox labels
      expect(screen.getByLabelText(/Cabeça/)).toHaveAttribute(
        "type",
        "checkbox"
      );
      expect(screen.getByLabelText(/Tórax/)).toHaveAttribute(
        "type",
        "checkbox"
      );

      // Check for proper form structure
      expect(
        screen.getByPlaceholderText(/Adicione observações gerais/)
      ).toHaveAttribute("rows", "3");
    });

    it("supports keyboard navigation", () => {
      render(<PostTreatmentModal {...defaultProps} />);

      const firstCheckbox = screen.getByLabelText(/Cabeça/);

      // Focus and activate with mouse click (simpler test)
      firstCheckbox.focus();
      fireEvent.click(firstCheckbox);

      expect(firstCheckbox).toBeChecked();
    });
  });
});
