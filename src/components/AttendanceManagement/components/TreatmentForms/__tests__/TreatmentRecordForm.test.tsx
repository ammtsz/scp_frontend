import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TreatmentRecordForm from "../TreatmentRecordForm";

// Mock the utils module
jest.mock("@/utils/treatmentLocations", () => ({
  LOCATION_GROUPS: {
    "Região Central": ["Coronário", "Coração", "Estômago", "Cabeça"],
    "Coluna e Pescoço": ["Lombar", "Pescoço"],
    "Membros Superiores": [
      "Braço Direito",
      "Braço Esquerdo",
      "Ombro Direito",
      "Ombro Esquerdo",
      "Punho Direito",
      "Punho Esquerdo",
    ],
    "Membros Inferiores": [
      "Perna Direita",
      "Perna Esquerda",
      "Pé",
      "Joelho Direito",
      "Joelho Esquerdo",
      "Tornozelo Direito",
      "Tornozelo Esquerdo",
    ],
  },
  isValidLocation: (location: string) => {
    const allLocations = [
      "Coronário",
      "Coração",
      "Estômago",
      "Cabeça",
      "Lombar",
      "Pescoço",
      "Braço Direito",
      "Braço Esquerdo",
      "Ombro Direito",
      "Ombro Esquerdo",
      "Punho Direito",
      "Punho Esquerdo",
      "Perna Direita",
      "Perna Esquerda",
      "Pé",
      "Joelho Direito",
      "Joelho Esquerdo",
      "Tornozelo Direito",
      "Tornozelo Esquerdo",
    ];
    return allLocations.includes(location);
  },
}));

describe("TreatmentRecordForm", () => {
  const defaultProps = {
    attendanceId: 1,
    treatmentType: "spiritual" as const,
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render form with correct title for spiritual treatment", () => {
      render(<TreatmentRecordForm {...defaultProps} />);

      expect(
        screen.getByText("Registro de Tratamento - Consulta Espiritual")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Registre os detalhes do tratamento realizado")
      ).toBeInTheDocument();
    });

    it("should render all form fields", () => {
      render(<TreatmentRecordForm {...defaultProps} />);

      expect(screen.getByText("Locais do Tratamento")).toBeInTheDocument();
      expect(screen.getByLabelText("Quantidade")).toBeInTheDocument();
      expect(screen.getByLabelText("Horário de Início")).toBeInTheDocument();
      expect(screen.getByLabelText("Horário de Término")).toBeInTheDocument();
      expect(screen.getByLabelText("Observações")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Salvar Registro" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancelar" })
      ).toBeInTheDocument();
    });
  });

  describe("Form Interactions", () => {
    it("should update quantity when input changes", async () => {
      const user = userEvent.setup();
      render(<TreatmentRecordForm {...defaultProps} />);

      const quantityInput = screen.getByLabelText(
        "Quantidade"
      ) as HTMLInputElement;
      // Clear field by selecting all and then typing
      await user.click(quantityInput);
      await user.keyboard("{Control>}a{/Control}");
      await user.keyboard("5");

      expect(quantityInput).toHaveValue(5);
    });

    it("should update notes when textarea changes", async () => {
      const user = userEvent.setup();
      render(<TreatmentRecordForm {...defaultProps} />);

      const notesTextarea = screen.getByLabelText("Observações");
      await user.type(notesTextarea, "Treatment went well");

      expect(notesTextarea).toHaveValue("Treatment went well");
    });
  });

  describe("Form Submission", () => {
    it("should call onSubmit with correct data when form is valid", async () => {
      const user = userEvent.setup();
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

      render(<TreatmentRecordForm {...defaultProps} onSubmit={mockOnSubmit} />);

      // Select a location first
      const coronaryButton = screen.getByRole("button", { name: "Coronário" });
      await user.click(coronaryButton);

      // Fill form
      const quantityInput = screen.getByLabelText(
        "Quantidade"
      ) as HTMLInputElement;
      const notesTextarea = screen.getByLabelText("Observações");

      // Clear and set quantity
      await user.click(quantityInput);
      await user.keyboard("{Control>}a{/Control}");
      await user.keyboard("3");
      await user.type(notesTextarea, "Test treatment notes");

      // Submit form
      const submitButton = screen.getByRole("button", {
        name: "Salvar Registro",
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            treatmentType: "spiritual",
            locations: ["Coronário"],
            quantity: 3,
            notes: "Test treatment notes",
          })
        );
      });
    });
  });

  describe("Cancel Functionality", () => {
    it("should call onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup();
      const mockOnCancel = jest.fn();

      render(<TreatmentRecordForm {...defaultProps} onCancel={mockOnCancel} />);

      const cancelButton = screen.getByRole("button", { name: "Cancelar" });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });
});
