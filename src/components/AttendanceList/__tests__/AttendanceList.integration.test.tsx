import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AttendanceList from "../index";
import { AttendancesProvider } from "@/contexts/AttendancesContext";

// Mock the API functions that AttendancesContext uses
jest.mock("@/api/attendances", () => ({
  getAttendancesByDate: jest.fn(),
  bulkUpdateAttendanceStatus: jest.fn(),
  getNextAttendanceDate: jest.fn(),
}));

// Mock ConfirmModal since it's external
jest.mock("@/components/ConfirmModal/index", () => {
  return function MockConfirmModal({
    open,
    message,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    onConfirm,
    onCancel,
  }: {
    open: boolean;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) {
    if (!open) return null;
    return (
      <div data-testid="confirm-modal">
        <p>{message}</p>
        <button onClick={onConfirm}>{confirmLabel}</button>
        <button onClick={onCancel}>{cancelLabel}</button>
      </div>
    );
  };
});

import {
  getAttendancesByDate,
  bulkUpdateAttendanceStatus,
  getNextAttendanceDate,
} from "@/api/attendances";
import { AttendanceType, AttendanceStatus } from "@/api";

const mockGetAttendancesByDate = getAttendancesByDate as jest.MockedFunction<
  typeof getAttendancesByDate
>;
const mockBulkUpdateAttendanceStatus =
  bulkUpdateAttendanceStatus as jest.MockedFunction<
    typeof bulkUpdateAttendanceStatus
  >;
const mockGetNextAttendanceDate = getNextAttendanceDate as jest.MockedFunction<
  typeof getNextAttendanceDate
>;

describe("AttendanceList Integration Tests", () => {
  const mockAttendancesData = [
    {
      id: 1,
      patient_id: 1,
      type: "spiritual" as AttendanceType,
      status: AttendanceStatus.SCHEDULED,
      scheduled_date: "2025-01-15",
      scheduled_time: "09:00",
      created_at: "2025-01-01T08:00:00.000Z",
      updated_at: "2025-01-10T08:00:00.000Z",
      Patient: {
        id: 1,
        name: "João Silva",
        priority: "1",
      },
    },
    {
      id: 2,
      patient_id: 2,
      type: "light_bath" as AttendanceType,
      status: AttendanceStatus.CHECKED_IN,
      scheduled_date: "2025-01-15",
      scheduled_time: "10:00",
      created_at: "2025-01-02T08:00:00.000Z",
      updated_at: "2025-01-11T08:00:00.000Z",
      Patient: {
        id: 2,
        name: "Maria Santos",
        priority: "2",
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Setup default successful API responses
    mockGetAttendancesByDate.mockResolvedValue({
      success: true,
      value: mockAttendancesData,
    });

    mockGetNextAttendanceDate.mockResolvedValue({
      success: true,
      value: { next_date: "2025-01-15" },
    });

    mockBulkUpdateAttendanceStatus.mockResolvedValue({
      success: true,
      value: { updated: 1, success: true },
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  const renderWithProvider = (props = {}) => {
    return render(
      <AttendancesProvider>
        <AttendanceList {...props} />
      </AttendancesProvider>
    );
  };

  describe("Real Component Integration", () => {
    it("should render with real useAttendanceList hook", async () => {
      renderWithProvider();

      // Wait for initial data load
      await waitFor(
        () => {
          expect(
            screen.queryByText("Carregando atendimentos...")
          ).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Check that the date is displayed
      expect(screen.getByDisplayValue("2025-01-15")).toBeInTheDocument();

      // Check that sections are rendered
      expect(screen.getByText("▼ Consultas Espirituais")).toBeInTheDocument();
      expect(screen.getByText("▼ Banho de Luz/Bastão")).toBeInTheDocument();
    });

    it("should render real AttendanceColumn components", async () => {
      renderWithProvider();

      await waitFor(
        () => {
          expect(
            screen.queryByText("Carregando atendimentos...")
          ).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Check that real AttendanceColumn components are rendered
      expect(screen.getAllByText("Agendados")).toHaveLength(2); // Both spiritual and light bath have this column
      expect(screen.getAllByText("Sala de Espera")).toHaveLength(2);
      expect(screen.getAllByText("Em Atendimento")).toHaveLength(2);
      expect(screen.getAllByText("Atendidos")).toHaveLength(2); // "Atendidos" not "Finalizados"
    });

    it("should handle section collapse with real functionality", async () => {
      renderWithProvider();

      await waitFor(
        () => {
          expect(
            screen.queryByText("Carregando atendimentos...")
          ).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      const spiritualButton = screen.getByText("▼ Consultas Espirituais");
      fireEvent.click(spiritualButton);

      // Should change to collapsed state
      await waitFor(() => {
        expect(screen.getByText("▶ Consultas Espirituais")).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle API errors with real error states", async () => {
      mockGetAttendancesByDate.mockRejectedValue(new Error("Network error"));

      renderWithProvider();

      await waitFor(
        () => {
          expect(
            screen.getAllByText("Erro ao carregar atendimentos")
          ).toHaveLength(2); // Error appears in both error state and component details
        },
        { timeout: 3000 }
      );
    });
  });

  describe("Component Composition", () => {
    it("should properly compose all child components", async () => {
      renderWithProvider();

      await waitFor(
        () => {
          expect(
            screen.queryByText("Carregando atendimentos...")
          ).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Check that the main container has proper structure
      const mainHeading = screen.getByText(/Atendimentos de/);
      expect(mainHeading).toBeInTheDocument();

      // Check date input
      const dateInput = screen.getByDisplayValue("2025-01-15");
      expect(dateInput).toBeInTheDocument();

      // Check sections
      const spiritualSection = screen.getByText("▼ Consultas Espirituais");
      const lightBathSection = screen.getByText("▼ Banho de Luz/Bastão");
      expect(spiritualSection).toBeInTheDocument();
      expect(lightBathSection).toBeInTheDocument();
    });
  });
});
