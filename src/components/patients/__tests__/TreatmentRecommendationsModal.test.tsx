import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TreatmentRecommendationsModal } from "../TreatmentRecommendationsModal";
import { Patient } from "@/types/types";

// Mock the hooks
const mockCreateTreatmentRecord = jest.fn();
const mockUpdateTreatmentRecord = jest.fn();
const mockCreateAttendance = jest.fn();

jest.mock("@/hooks/useTreatmentRecords", () => ({
  useCreateTreatmentRecord: () => ({
    mutateAsync: mockCreateTreatmentRecord,
    isPending: false,
  }),
  useUpdateTreatmentRecord: () => ({
    mutateAsync: mockUpdateTreatmentRecord,
    isPending: false,
  }),
  useTreatmentRecordByAttendance: () => ({
    data: null,
  }),
}));

jest.mock("@/hooks/useAttendanceQueries", () => ({
  useCreateAttendance: () => ({
    mutateAsync: mockCreateAttendance,
    isPending: false,
  }),
}));

// Mock components
jest.mock("@/components/common/BaseModal", () => {
  return function MockBaseModal({
    children,
    isOpen,
  }: {
    children: React.ReactNode;
    isOpen: boolean;
  }) {
    return isOpen ? <div data-testid="modal">{children}</div> : null;
  };
});

jest.mock("@/components/common/LoadingButton", () => {
  return function MockLoadingButton({
    children,
    onClick,
    isLoading,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    isLoading: boolean;
  }) {
    return (
      <button
        onClick={onClick}
        disabled={isLoading}
        data-testid="submit-button"
      >
        {children}
      </button>
    );
  };
});

jest.mock("@/components/common/ErrorDisplay", () => {
  return function MockErrorDisplay({ error }: { error: string }) {
    return <div data-testid="error-display">{error}</div>;
  };
});

jest.mock("@/components/common/Switch", () => {
  return function MockSwitch({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
  }) {
    return (
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        data-testid="switch"
      />
    );
  };
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

const mockDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
// Mock patient data
const mockPatientWithRecentAttendance: Patient = {
  id: "1",
  name: "João Silva",
  phone: "(11) 99999-9999",
  birthDate: new Date("1990-01-01"),
  priority: "2",
  status: "A",
  mainComplaint: "Test complaint",
  startDate: new Date(),
  dischargeDate: null,
  nextAttendanceDates: [],
  currentRecommendations: {
    date: new Date(),
    food: "Dieta leve",
    water: "2L/dia",
    ointment: "Pomada test",
    lightBath: true,
    rod: false,
    spiritualTreatment: true,
    returnWeeks: 2,
  },
  previousAttendances: [
    {
      attendanceId: "123",
      date: mockDate,
      type: "spiritual",
      notes: "Recent consultation",
      recommendations: {
        food: "Current diet",
        water: "Current water",
        ointment: "Current ointment",
        lightBath: true,
        rod: false,
        spiritualTreatment: true,
        returnWeeks: 2,
      },
    },
  ],
};

const mockPatientWithoutRecentAttendance: Patient = {
  ...mockPatientWithRecentAttendance,
  previousAttendances: [
    {
      attendanceId: "456",
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      type: "spiritual",
      notes: "Old consultation",
      recommendations: null,
    },
  ],
};

const mockPatientWithNoAttendances: Patient = {
  ...mockPatientWithRecentAttendance,
  previousAttendances: [],
};

describe("TreatmentRecommendationsModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Save Mode Selection", () => {
    it("shows update option when patient has recent attendance", () => {
      renderWithProviders(
        <TreatmentRecommendationsModal
          isOpen={true}
          onClose={jest.fn()}
          patient={mockPatientWithRecentAttendance}
        />
      );

      expect(screen.getByText("Atualizar Última Consulta")).toBeInTheDocument();
      expect(screen.getByText("Criar Nova Consulta")).toBeInTheDocument();
    });

    it("defaults to 'update' mode when recent attendance exists (within 7 days)", () => {
      renderWithProviders(
        <TreatmentRecommendationsModal
          isOpen={true}
          onClose={jest.fn()}
          patient={mockPatientWithRecentAttendance}
        />
      );

      const updateRadio = screen.getByDisplayValue("update");
      expect(updateRadio).toBeChecked();
    });

    it("defaults to 'create' mode when no recent attendance (older than 7 days)", () => {
      renderWithProviders(
        <TreatmentRecommendationsModal
          isOpen={true}
          onClose={jest.fn()}
          patient={mockPatientWithoutRecentAttendance}
        />
      );

      const createRadio = screen.getByDisplayValue("create");
      expect(createRadio).toBeChecked();
    });

    it("defaults to 'create' mode when no previous attendances", () => {
      renderWithProviders(
        <TreatmentRecommendationsModal
          isOpen={true}
          onClose={jest.fn()}
          patient={mockPatientWithNoAttendances}
        />
      );

      const createRadio = screen.getByDisplayValue("create");
      expect(createRadio).toBeChecked();

      // Update option should be present but disabled
      const updateRadio = screen.getByDisplayValue("update");
      expect(updateRadio).toBeDisabled();
      expect(updateRadio).not.toBeChecked();
    });

    it("allows switching between save modes", () => {
      renderWithProviders(
        <TreatmentRecommendationsModal
          isOpen={true}
          onClose={jest.fn()}
          patient={mockPatientWithRecentAttendance}
        />
      );

      const createRadio = screen.getByDisplayValue("create");
      const updateRadio = screen.getByDisplayValue("update");

      // Initially update should be checked
      expect(updateRadio).toBeChecked();

      // Switch to create
      fireEvent.click(createRadio);
      expect(createRadio).toBeChecked();
      expect(updateRadio).not.toBeChecked();

      // Switch back to update
      fireEvent.click(updateRadio);
      expect(updateRadio).toBeChecked();
      expect(createRadio).not.toBeChecked();
    });
  });

  describe("Form Submission", () => {
    it("updates existing treatment record when in update mode", async () => {
      mockUpdateTreatmentRecord.mockResolvedValue({});
      const onSuccess = jest.fn();

      renderWithProviders(
        <TreatmentRecommendationsModal
          isOpen={true}
          onClose={jest.fn()}
          patient={mockPatientWithRecentAttendance}
          onSuccess={onSuccess}
        />
      );

      // Ensure we're in update mode
      const updateRadio = screen.getByDisplayValue("update");
      fireEvent.click(updateRadio);

      // Fill in some form data
      const foodInput = screen.getByPlaceholderText(
        /alimentares.*evitar carnes/i
      );
      fireEvent.change(foodInput, { target: { value: "Nova dieta" } });

      // Submit form
      const submitButton = screen.getByTestId("submit-button");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateTreatmentRecord).toHaveBeenCalledWith({
          id: 123, // attendanceId from mock data
          data: expect.objectContaining({
            food: "Nova dieta",
            water: "2L/dia",
            ointments: "Pomada test",
            light_bath: true,
            rod: false,
            spiritual_treatment: false,
            return_in_weeks: 2,
          }),
        });
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it("creates new attendance and treatment record when in create mode", async () => {
      mockCreateAttendance.mockResolvedValue({ id: 999 });
      mockCreateTreatmentRecord.mockResolvedValue({});
      const onSuccess = jest.fn();

      renderWithProviders(
        <TreatmentRecommendationsModal
          isOpen={true}
          onClose={jest.fn()}
          patient={mockPatientWithRecentAttendance}
          onSuccess={onSuccess}
        />
      );

      // Switch to create mode
      const createRadio = screen.getByDisplayValue("create");
      fireEvent.click(createRadio);

      // Fill in some form data
      const waterInput = screen.getByPlaceholderText(/água/i);
      fireEvent.change(waterInput, { target: { value: "3L por dia" } });

      // Submit form
      const submitButton = screen.getByTestId("submit-button");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateAttendance).toHaveBeenCalledWith({
          patientId: 1,
          attendanceType: "spiritual",
          scheduledDate: expect.any(String),
        });
      });

      await waitFor(() => {
        expect(mockCreateTreatmentRecord).toHaveBeenCalledWith({
          attendance_id: 999,
          water: "3L por dia",
          food: "Dieta leve",
          ointments: "Pomada test",
          spiritual_treatment: false, // Always false since we removed this option
          light_bath: true,
          rod: false,
          return_in_weeks: 2,
        });
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it("handles errors during update mode submission", async () => {
      mockUpdateTreatmentRecord.mockRejectedValue(new Error("Update failed"));

      renderWithProviders(
        <TreatmentRecommendationsModal
          isOpen={true}
          onClose={jest.fn()}
          patient={mockPatientWithRecentAttendance}
        />
      );

      // Submit form (defaults to update mode)
      const submitButton = screen.getByTestId("submit-button");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("error-display")).toHaveTextContent(
          "Erro ao salvar recomendações. Tente novamente."
        );
      });
    });

    it("handles errors during create mode submission", async () => {
      mockCreateAttendance.mockRejectedValue(new Error("Create failed"));

      renderWithProviders(
        <TreatmentRecommendationsModal
          isOpen={true}
          onClose={jest.fn()}
          patient={mockPatientWithNoAttendances}
        />
      );

      // Submit form (defaults to create mode for patient with no attendances)
      const submitButton = screen.getByTestId("submit-button");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId("error-display")).toHaveTextContent(
          "Erro ao salvar recomendações. Tente novamente."
        );
      });
    });
  });

  describe("Form Fields", () => {
    it("renders all recommendation form fields", () => {
      renderWithProviders(
        <TreatmentRecommendationsModal
          isOpen={true}
          onClose={jest.fn()}
          patient={mockPatientWithRecentAttendance}
        />
      );

      expect(
        screen.getByPlaceholderText(/alimentares.*evitar carnes/i)
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/2L de água fluidificada/i)
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/unguentos recomendados/i)
      ).toBeInTheDocument();
      // Treatment options are now in conditional switch forms, not directly visible text
      expect(
        screen.getByText(/Configuração de.*Banho de Luz/i)
      ).toBeInTheDocument();
      // Light bath switch should be present and checked (based on patient data)
      expect(screen.getAllByTestId("switch")).toHaveLength(2); // Light bath and Rod switches
    });

    it("initializes form with current patient recommendations", () => {
      renderWithProviders(
        <TreatmentRecommendationsModal
          isOpen={true}
          onClose={jest.fn()}
          patient={mockPatientWithRecentAttendance}
        />
      );

      const foodInput = screen.getByDisplayValue("Dieta leve");
      const waterInput = screen.getByDisplayValue("2L/dia");
      const ointmentInput = screen.getByDisplayValue("Pomada test");

      expect(foodInput).toBeInTheDocument();
      expect(waterInput).toBeInTheDocument();
      expect(ointmentInput).toBeInTheDocument();
    });

    it("shows correct button text based on save mode", () => {
      renderWithProviders(
        <TreatmentRecommendationsModal
          isOpen={true}
          onClose={jest.fn()}
          patient={mockPatientWithRecentAttendance}
        />
      );

      // Initially in update mode
      expect(screen.getByText("Atualizar Recomendações")).toBeInTheDocument();

      // Switch to create mode
      const createRadio = screen.getByDisplayValue("create");
      fireEvent.click(createRadio);

      expect(screen.getByTestId("submit-button")).toHaveTextContent(
        "Criar Nova Consulta"
      );
    });
  });

  describe("Recent Attendance Display", () => {
    it("displays recent attendance details in update mode", () => {
      renderWithProviders(
        <TreatmentRecommendationsModal
          isOpen={true}
          onClose={jest.fn()}
          patient={mockPatientWithRecentAttendance}
        />
      );

      // Look specifically for the attendance details (not the general explanation)
      // Format mockDate as DD/MM/YYYY
      const day = String(mockDate.getDate()).padStart(2, "0");
      const month = String(mockDate.getMonth() + 1).padStart(2, "0");
      const year = mockDate.getFullYear();

      const dateRegex = new RegExp(
        `${day}/${month}/${year} - Consulta Espiritual`
      );
      expect(screen.getByText(dateRegex)).toBeInTheDocument();
      expect(
        screen.getByText(/Banho de Luz \+ Trat\. Espiritual/)
      ).toBeInTheDocument();
    });

    it("shows create option enabled and update option disabled when no recent attendances", () => {
      renderWithProviders(
        <TreatmentRecommendationsModal
          isOpen={true}
          onClose={jest.fn()}
          patient={mockPatientWithNoAttendances}
        />
      );

      const createRadio = screen.getByDisplayValue("create");
      const updateRadio = screen.getByDisplayValue("update");

      expect(createRadio).toBeInTheDocument();
      expect(createRadio).not.toBeDisabled();
      expect(createRadio).toBeChecked();

      expect(updateRadio).toBeInTheDocument();
      expect(updateRadio).toBeDisabled();
      expect(updateRadio).not.toBeChecked();
    });
  });
});
