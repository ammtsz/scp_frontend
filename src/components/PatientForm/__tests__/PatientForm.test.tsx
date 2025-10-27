import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PatientForm from "../index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AttendancesProvider } from "@/contexts/AttendancesContext";

// Mock the API
jest.mock("@/api/patients", () => ({
  createPatient: jest.fn(),
  getPatients: jest.fn().mockResolvedValue({
    success: true,
    value: [],
  }),
}));

jest.mock("@/api/attendances", () => ({
  getAttendancesByDate: jest.fn().mockResolvedValue({
    success: true,
    value: [],
  }),
}));

// Mock the usePatientForm hook
jest.mock("../usePatientForm", () => ({
  usePatientForm: jest.fn(),
}));

import { usePatientForm } from "../usePatientForm";

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AttendancesProvider>{component}</AttendancesProvider>
    </QueryClientProvider>
  );
};

const mockPatient = {
  name: "",
  phone: "",
  priority: "3" as const,
  status: "T" as const,
  birthDate: new Date("1990-01-01"),
  mainComplaint: "",
  startDate: new Date("2024-01-01"),
  dischargeDate: null,
  nextAttendanceDates: [],
  previousAttendances: [],
  currentRecommendations: {
    date: new Date(),
    food: "",
    water: "",
    ointment: "",
    lightBath: false,
    rod: false,
    spiritualTreatment: false,
    returnWeeks: 0,
  },
};

const defaultMockReturn = {
  patient: mockPatient,
  setPatient: jest.fn(),
  handleChange: jest.fn(),
  handleSpiritualConsultationChange: jest.fn(),
  handleSubmit: jest.fn(),
  isLoading: false,
};

describe("PatientForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePatientForm as jest.Mock).mockReturnValue(defaultMockReturn);
  });

  describe("Layout and Structure", () => {
    it("should use consistent card layout", () => {
      renderWithProviders(<PatientForm />);

      const cardContainer = document.querySelector(".card-shadow");
      expect(cardContainer).toBeInTheDocument();
    });

    it("should display form header with title and description", () => {
      renderWithProviders(<PatientForm />);

      expect(screen.getByText("Cadastro de Paciente")).toBeInTheDocument();
      expect(
        screen.getByText("Preencha as informações do novo paciente")
      ).toBeInTheDocument();
    });

    it("should display treatment section header", () => {
      renderWithProviders(<PatientForm />);

      expect(screen.getByText("Consulta Espiritual")).toBeInTheDocument();
      expect(
        screen.getByText("Informações sobre o tratamento")
      ).toBeInTheDocument();
    });
  });

  describe("Form Fields", () => {
    it("should render all required personal information fields", () => {
      renderWithProviders(<PatientForm />);

      expect(screen.getByLabelText("Nome *")).toBeInTheDocument();
      expect(screen.getByLabelText("Telefone")).toBeInTheDocument();
      expect(screen.getByLabelText("Data de Nascimento *")).toBeInTheDocument();
      expect(screen.getByLabelText("Prioridade")).toBeInTheDocument();
      expect(screen.getByLabelText("Status")).toBeInTheDocument();
      expect(screen.getByLabelText("Principal Queixa")).toBeInTheDocument();
    });

    it("should render all treatment information fields", () => {
      renderWithProviders(<PatientForm />);

      expect(screen.getByLabelText("Data de Início")).toBeInTheDocument();
      expect(
        screen.getByLabelText("Data da Próxima Consulta")
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Data da Alta")).toBeInTheDocument();
      expect(screen.getByLabelText("Alimentação")).toBeInTheDocument();
      expect(screen.getByLabelText("Água")).toBeInTheDocument();
      expect(screen.getByLabelText("Pomada")).toBeInTheDocument();
      expect(screen.getByLabelText("Semanas para retorno")).toBeInTheDocument();
    });

    it("should render treatment type checkboxes", () => {
      renderWithProviders(<PatientForm />);

      expect(screen.getByLabelText("Banho de luz")).toBeInTheDocument();
      expect(screen.getByLabelText("Bastão")).toBeInTheDocument();
      expect(
        screen.getByLabelText("Tratamento espiritual")
      ).toBeInTheDocument();
    });
  });

  describe("Priority Options", () => {
    it("should display correct priority options with new labels", () => {
      renderWithProviders(<PatientForm />);

      const prioritySelect = screen.getByLabelText("Prioridade");

      expect(prioritySelect).toBeInTheDocument();
      expect(screen.getByDisplayValue("3 - Padrão")).toBeInTheDocument();

      const options = screen.getAllByRole("option");
      const priorityOptions = options.filter(
        (option) =>
          option.textContent?.includes("Padrão") ||
          option.textContent?.includes("Idoso/crianças") ||
          option.textContent?.includes("Exceção")
      );

      expect(priorityOptions).toHaveLength(3);
    });
  });

  describe("Status Options", () => {
    it("should display correct status options with new labels", () => {
      renderWithProviders(<PatientForm />);

      const statusSelect = screen.getByLabelText("Status");

      expect(statusSelect).toBeInTheDocument();
      expect(screen.getByDisplayValue("Em Tratamento")).toBeInTheDocument();

      const options = screen.getAllByRole("option");
      const statusOptions = options.filter(
        (option) =>
          option.textContent?.includes("Em Tratamento") ||
          option.textContent?.includes("Alta Médica") ||
          option.textContent?.includes("Faltas Consecutivas")
      );

      expect(statusOptions).toHaveLength(3);
    });
  });

  describe("Form Interactions", () => {
    it("should call handleChange when personal fields are modified", () => {
      const mockHandleChange = jest.fn();
      (usePatientForm as jest.Mock).mockReturnValue({
        ...defaultMockReturn,
        handleChange: mockHandleChange,
      });

      renderWithProviders(<PatientForm />);

      const nameInput = screen.getByLabelText("Nome *");
      fireEvent.change(nameInput, { target: { value: "João Silva" } });

      expect(mockHandleChange).toHaveBeenCalled();
    });

    it("should call handleSpiritualConsultationChange for date fields", () => {
      const mockHandleSpiritualChange = jest.fn();
      (usePatientForm as jest.Mock).mockReturnValue({
        ...defaultMockReturn,
        handleSpiritualConsultationChange: mockHandleSpiritualChange,
      });

      renderWithProviders(<PatientForm />);

      const startDateInput = screen.getByLabelText("Data de Início");
      fireEvent.change(startDateInput, { target: { value: "2024-01-15" } });

      expect(mockHandleSpiritualChange).toHaveBeenCalled();
    });

    it("should call handleChange for recommendation fields", () => {
      const mockHandleChange = jest.fn();
      (usePatientForm as jest.Mock).mockReturnValue({
        ...defaultMockReturn,
        handleChange: mockHandleChange,
      });

      renderWithProviders(<PatientForm />);

      const foodInput = screen.getByLabelText("Alimentação");
      fireEvent.change(foodInput, { target: { value: "Dieta leve" } });

      expect(mockHandleChange).toHaveBeenCalled();
    });

    it("should call handleChange for checkbox fields", () => {
      const mockHandleChange = jest.fn();
      (usePatientForm as jest.Mock).mockReturnValue({
        ...defaultMockReturn,
        handleChange: mockHandleChange,
      });

      renderWithProviders(<PatientForm />);

      const lightBathCheckbox = screen.getByLabelText("Banho de luz");
      fireEvent.click(lightBathCheckbox);

      expect(mockHandleChange).toHaveBeenCalled();
    });
  });

  describe("Form Submission", () => {
    it("should call handleSubmit when form is submitted", () => {
      const mockHandleSubmit = jest.fn((e) => e.preventDefault());
      (usePatientForm as jest.Mock).mockReturnValue({
        ...defaultMockReturn,
        handleSubmit: mockHandleSubmit,
      });

      renderWithProviders(<PatientForm />);

      const form = document.querySelector("form");
      expect(form).toBeInTheDocument();

      fireEvent.submit(form!);

      expect(mockHandleSubmit).toHaveBeenCalled();
    });

    it("should render submit button with correct text", () => {
      renderWithProviders(<PatientForm />);

      const submitButton = screen.getByText("Salvar Paciente");
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute("type", "submit");
    });

    it("should show loading state when saving", () => {
      (usePatientForm as jest.Mock).mockReturnValue({
        ...defaultMockReturn,
        isLoading: true,
      });

      renderWithProviders(<PatientForm />);

      const submitButton = screen.getByText("Salvando...");
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Data Display", () => {
    it("should display patient data correctly", () => {
      const patientWithData = {
        ...mockPatient,
        name: "João Silva",
        phone: "(11) 99999-9999",
        mainComplaint: "Dor de cabeça",
        currentRecommendations: {
          ...mockPatient.currentRecommendations,
          food: "Dieta leve",
          water: "2 litros por dia",
          lightBath: true,
        },
      };

      (usePatientForm as jest.Mock).mockReturnValue({
        ...defaultMockReturn,
        patient: patientWithData,
      });

      renderWithProviders(<PatientForm />);

      expect(screen.getByDisplayValue("João Silva")).toBeInTheDocument();
      expect(screen.getByDisplayValue("(11) 99999-9999")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Dor de cabeça")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Dieta leve")).toBeInTheDocument();
      expect(screen.getByDisplayValue("2 litros por dia")).toBeInTheDocument();

      const lightBathCheckbox = screen.getByLabelText(
        "Banho de luz"
      ) as HTMLInputElement;
      expect(lightBathCheckbox.checked).toBe(true);
    });
  });

  describe("Responsive Design", () => {
    it("should have responsive grid classes", () => {
      renderWithProviders(<PatientForm />);

      const gridContainers = document.querySelectorAll(
        ".grid.grid-cols-1.md\\:grid-cols-2, .grid.grid-cols-1.md\\:grid-cols-3"
      );
      expect(gridContainers.length).toBeGreaterThan(0);
    });

    it("should have full width inputs", () => {
      renderWithProviders(<PatientForm />);

      const inputs = document.querySelectorAll(".input.w-full");
      expect(inputs.length).toBeGreaterThan(0);
    });
  });
});
