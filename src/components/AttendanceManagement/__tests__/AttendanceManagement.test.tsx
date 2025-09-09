import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AttendanceManagement from "../index";
import { useAttendanceManagement } from "../hooks/useAttendanceManagement";
import { IPriority, IAttendanceByDate } from "@/types/globals";
import { PatientsProvider } from "@/contexts/PatientsContext";
import { AttendancesProvider } from "@/contexts/AttendancesContext";
import { getPatients } from "@/api/patients";
import { getAttendancesByDate, getNextAttendanceDate } from "@/api/attendances";

// Mock the APIs
jest.mock("@/api/patients");
jest.mock("@/api/attendances");
const mockGetPatients = getPatients as jest.MockedFunction<typeof getPatients>;
const mockGetAttendancesByDate = getAttendancesByDate as jest.MockedFunction<
  typeof getAttendancesByDate
>;
const mockGetNextAttendanceDate = getNextAttendanceDate as jest.MockedFunction<
  typeof getNextAttendanceDate
>;

// Mock the custom hook
jest.mock("../hooks/useAttendanceManagement");
const mockUseAttendanceManagement =
  useAttendanceManagement as jest.MockedFunction<
    typeof useAttendanceManagement
  >;

// Mock the ConfirmModal component
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

// Don't mock AttendanceColumn - use the real component for better coverage

describe("AttendanceManagement Component", () => {
  // Helper function to render with providers
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <PatientsProvider>
        <AttendancesProvider>{component}</AttendancesProvider>
      </PatientsProvider>
    );
  };

  const mockAttendancesByDate: IAttendanceByDate = {
    date: new Date("2025-01-15"),
    spiritual: {
      scheduled: [
        {
          name: "João Silva",
          priority: "1" as IPriority,
          checkedInTime: null,
          onGoingTime: null,
          completedTime: null,
        },
      ],
      checkedIn: [
        {
          name: "Maria Santos",
          priority: "2" as IPriority,
          checkedInTime: new Date("2025-01-15T10:00:00Z"),
          onGoingTime: null,
          completedTime: null,
        },
      ],
      onGoing: [
        {
          name: "Pedro Oliveira",
          priority: "3" as IPriority,
          checkedInTime: new Date("2025-01-15T10:00:00Z"),
          onGoingTime: new Date("2025-01-15T10:30:00Z"),
          completedTime: null,
        },
      ],
      completed: [
        {
          name: "Ana Costa",
          priority: "1" as IPriority,
          checkedInTime: new Date("2025-01-15T09:00:00Z"),
          onGoingTime: new Date("2025-01-15T09:30:00Z"),
          completedTime: new Date("2025-01-15T10:00:00Z"),
        },
      ],
    },
    lightBath: {
      scheduled: [
        {
          name: "Carlos Mendes",
          priority: "2" as IPriority,
          checkedInTime: null,
          onGoingTime: null,
          completedTime: null,
        },
      ],
      checkedIn: [],
      onGoing: [],
      completed: [],
    },
    rod: {
      scheduled: [],
      checkedIn: [],
      onGoing: [],
      completed: [],
    },
  };

  const defaultMockHookReturn = {
    selectedDate: "2025-01-15",
    setSelectedDate: jest.fn(),
    attendancesByDate: mockAttendancesByDate,
    loading: false,
    error: null,
    dragged: null,
    confirmOpen: false,
    pendingDrop: null,
    multiSectionModalOpen: false,
    multiSectionPending: null,
    collapsed: { spiritual: false, lightBath: false, rod: false },
    editPatientModalOpen: false,
    patientToEdit: null,
    getPatients: jest.fn(),
    handleDragStart: jest.fn(),
    handleDragEnd: jest.fn(),
    handleDropWithConfirm: jest.fn(),
    handleConfirm: jest.fn(),
    handleCancel: jest.fn(),
    handleMultiSectionConfirm: jest.fn(),
    handleMultiSectionCancel: jest.fn(),
    toggleCollapsed: jest.fn(),
    refreshCurrentDate: jest.fn(),
    handleEditPatientCancel: jest.fn(),
    handleEditPatientSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup patients API mock
    mockGetPatients.mockResolvedValue({
      success: true,
      value: [],
    });

    // Setup attendances API mocks
    mockGetAttendancesByDate.mockResolvedValue({
      success: true,
      value: [],
    });

    mockGetNextAttendanceDate.mockResolvedValue({
      success: true,
      value: { next_date: "2025-01-15" },
    });

    // Setup default getPatients implementation
    defaultMockHookReturn.getPatients.mockImplementation(
      (type: string, status: string) => {
        const typeKey = type as keyof typeof mockAttendancesByDate;
        if (typeKey === "date") return [];
        const statusKey =
          status as keyof typeof mockAttendancesByDate.spiritual;
        return mockAttendancesByDate[typeKey]?.[statusKey] || [];
      }
    );
    mockUseAttendanceManagement.mockReturnValue(defaultMockHookReturn);
  });

  describe("Rendering States", () => {
    it("should render loading state", () => {
      mockUseAttendanceManagement.mockReturnValue({
        ...defaultMockHookReturn,
        loading: true,
      });

      renderWithProviders(<AttendanceManagement />);

      expect(
        screen.getByText("Carregando atendimentos...")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Atendimentos de 2025-01-15")
      ).not.toBeInTheDocument();
    });

    it("should render error state", () => {
      const errorMessage = "Erro de conexão";
      mockUseAttendanceManagement.mockReturnValue({
        ...defaultMockHookReturn,
        loading: false,
        error: errorMessage,
      });

      renderWithProviders(<AttendanceManagement />);

      expect(
        screen.getByText("Erro ao carregar atendimentos")
      ).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText("Tentar novamente")).toBeInTheDocument();
    });

    it("should call refreshCurrentDate when retry button is clicked", () => {
      const mockRefreshCurrentDate = jest.fn();
      mockUseAttendanceManagement.mockReturnValue({
        ...defaultMockHookReturn,
        loading: false,
        error: "Erro de teste",
        refreshCurrentDate: mockRefreshCurrentDate,
      });

      renderWithProviders(<AttendanceManagement />);

      fireEvent.click(screen.getByText("Tentar novamente"));
      expect(mockRefreshCurrentDate).toHaveBeenCalled();
    });

    it("should render main content when data is loaded", () => {
      renderWithProviders(<AttendanceManagement />);

      expect(screen.getByText("Data selecionada:")).toBeInTheDocument();
      expect(screen.getByDisplayValue("2025-01-15")).toBeInTheDocument();
      expect(screen.getByText("▼ Consultas Espirituais")).toBeInTheDocument();
      expect(screen.getByText("▼ Banhos de Luz + Bastão")).toBeInTheDocument();
    });
  });

  describe("Date Selection", () => {
    it("should display current selected date", () => {
      renderWithProviders(<AttendanceManagement />);

      const dateInput = screen.getByDisplayValue("2025-01-15");
      expect(dateInput).toBeInTheDocument();
      expect(dateInput).toHaveAttribute("type", "date");
    });

    it("should call setSelectedDate when date changes", () => {
      const mockSetSelectedDate = jest.fn();
      mockUseAttendanceManagement.mockReturnValue({
        ...defaultMockHookReturn,
        setSelectedDate: mockSetSelectedDate,
      });

      renderWithProviders(<AttendanceManagement />);

      const dateInput = screen.getByDisplayValue("2025-01-15");
      fireEvent.change(dateInput, { target: { value: "2025-01-16" } });

      expect(mockSetSelectedDate).toHaveBeenCalledWith("2025-01-16");
    });

    it("should set today's date when 'Hoje' button is clicked", () => {
      const mockSetSelectedDate = jest.fn();
      mockUseAttendanceManagement.mockReturnValue({
        ...defaultMockHookReturn,
        setSelectedDate: mockSetSelectedDate,
      });

      // Mock today's date
      const today = new Date();
      const todayString = today.toISOString().split("T")[0];

      renderWithProviders(<AttendanceManagement />);

      const hojeButton = screen.getByText("Hoje");
      expect(hojeButton).toBeInTheDocument();
      expect(hojeButton).toHaveClass("button", "button-outline", "card-shadow");

      fireEvent.click(hojeButton);

      expect(mockSetSelectedDate).toHaveBeenCalledWith(todayString);
    });
  });

  describe("Attendance Type Sections", () => {
    it("should render both spiritual and lightBath sections", () => {
      renderWithProviders(<AttendanceManagement />);

      expect(screen.getByText("▼ Consultas Espirituais")).toBeInTheDocument();
      expect(screen.getByText("▼ Banhos de Luz + Bastão")).toBeInTheDocument();
    });

    it("should toggle spiritual section when clicked", () => {
      const mockToggleCollapsed = jest.fn();
      mockUseAttendanceManagement.mockReturnValue({
        ...defaultMockHookReturn,
        toggleCollapsed: mockToggleCollapsed,
      });

      renderWithProviders(<AttendanceManagement />);

      fireEvent.click(screen.getByText("▼ Consultas Espirituais"));
      expect(mockToggleCollapsed).toHaveBeenCalledWith("spiritual");
    });

    it("should toggle lightBath section when clicked", () => {
      const mockToggleCollapsed = jest.fn();
      mockUseAttendanceManagement.mockReturnValue({
        ...defaultMockHookReturn,
        toggleCollapsed: mockToggleCollapsed,
      });

      renderWithProviders(<AttendanceManagement />);

      fireEvent.click(screen.getByText("▼ Banhos de Luz + Bastão"));
      expect(mockToggleCollapsed).toHaveBeenCalledWith("lightBath");
    });

    it("should show collapsed state indicator", () => {
      mockUseAttendanceManagement.mockReturnValue({
        ...defaultMockHookReturn,
        collapsed: { spiritual: true, lightBath: false, rod: false },
      });

      renderWithProviders(<AttendanceManagement />);

      expect(screen.getByText("▶ Consultas Espirituais")).toBeInTheDocument();
      expect(screen.getByText("▼ Banhos de Luz + Bastão")).toBeInTheDocument();
    });

    it("should hide attendance columns when section is collapsed", () => {
      mockUseAttendanceManagement.mockReturnValue({
        ...defaultMockHookReturn,
        collapsed: { spiritual: true, lightBath: false, rod: false },
      });

      renderWithProviders(<AttendanceManagement />);

      // When spiritual is collapsed, there should be fewer "Agendados" titles
      // (only from lightBath section, not spiritual)
      const agendadosElements = screen.getAllByText("Agendados");
      expect(agendadosElements).toHaveLength(1); // Only from lightBath section
    });
  });

  describe("Attendance Columns", () => {
    it("should render all attendance columns for each type", () => {
      renderWithProviders(<AttendanceManagement />);

      // Check that real AttendanceColumn components are rendered
      // Each section (spiritual and lightBath) should have these column headers
      expect(screen.getAllByText("Agendados")).toHaveLength(2);
      expect(screen.getAllByText("Sala de Espera")).toHaveLength(2);
      expect(screen.getAllByText("Em Atendimento")).toHaveLength(2);

      // Check that "Finalizados" columns exist (the real label for completed status)
      const finalizadosElements = screen.queryAllByText("Finalizados");
      expect(finalizadosElements.length).toBeGreaterThan(0);
    });

    it("should pass correct props to AttendanceColumn components", () => {
      renderWithProviders(<AttendanceManagement />);

      // Check if patients are rendered with the real component format
      // The patient name is now part of a larger text with priority
      expect(screen.getByText(/João Silva/)).toBeInTheDocument();
      expect(screen.getByText(/Maria Santos/)).toBeInTheDocument();
    });

    it("should call getPatients for each column", () => {
      const mockGetPatients = jest.fn((type: string, status: string) => {
        const typeKey = type as keyof typeof mockAttendancesByDate;
        if (typeKey === "date") return [];
        const statusKey =
          status as keyof typeof mockAttendancesByDate.spiritual;
        return mockAttendancesByDate[typeKey]?.[statusKey] || [];
      });
      mockUseAttendanceManagement.mockReturnValue({
        ...defaultMockHookReturn,
        getPatients: mockGetPatients,
      });

      renderWithProviders(<AttendanceManagement />);

      // Should be called for each type and status combination
      expect(mockGetPatients).toHaveBeenCalledWith("spiritual", "scheduled");
      expect(mockGetPatients).toHaveBeenCalledWith("spiritual", "checkedIn");
      expect(mockGetPatients).toHaveBeenCalledWith("spiritual", "onGoing");
      expect(mockGetPatients).toHaveBeenCalledWith("spiritual", "completed");
      expect(mockGetPatients).toHaveBeenCalledWith("lightBath", "scheduled");
      expect(mockGetPatients).toHaveBeenCalledWith("lightBath", "checkedIn");
      expect(mockGetPatients).toHaveBeenCalledWith("lightBath", "onGoing");
      expect(mockGetPatients).toHaveBeenCalledWith("lightBath", "completed");
    });
  });

  describe("Confirm Modals", () => {
    it("should render confirmation modal when confirmOpen is true", () => {
      mockUseAttendanceManagement.mockReturnValue({
        ...defaultMockHookReturn,
        confirmOpen: true,
      });

      renderWithProviders(<AttendanceManagement />);

      expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Tem certeza que deseja mover este atendimento para uma etapa anterior?"
        )
      ).toBeInTheDocument();
    });

    it("should call handleConfirm when confirm button is clicked", () => {
      const mockHandleConfirm = jest.fn();
      mockUseAttendanceManagement.mockReturnValue({
        ...defaultMockHookReturn,
        confirmOpen: true,
        handleConfirm: mockHandleConfirm,
      });

      renderWithProviders(<AttendanceManagement />);

      fireEvent.click(screen.getByText("Confirmar"));
      expect(mockHandleConfirm).toHaveBeenCalled();
    });

    it("should call handleCancel when cancel button is clicked", () => {
      const mockHandleCancel = jest.fn();
      mockUseAttendanceManagement.mockReturnValue({
        ...defaultMockHookReturn,
        confirmOpen: true,
        handleCancel: mockHandleCancel,
      });

      renderWithProviders(<AttendanceManagement />);

      fireEvent.click(screen.getByText("Cancelar"));
      expect(mockHandleCancel).toHaveBeenCalled();
    });

    it("should render multi-section modal when multiSectionModalOpen is true", () => {
      mockUseAttendanceManagement.mockReturnValue({
        ...defaultMockHookReturn,
        multiSectionModalOpen: true,
      });

      renderWithProviders(<AttendanceManagement />);

      expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Este paciente está agendado nas duas consultas. Deseja mover para 'Sala de Espera' em ambas?"
        )
      ).toBeInTheDocument();
      expect(screen.getByText("Mover em ambas")).toBeInTheDocument();
      expect(screen.getByText("Apenas nesta seção")).toBeInTheDocument();
    });

    it("should call handleMultiSectionConfirm when multi-section confirm is clicked", () => {
      const mockHandleMultiSectionConfirm = jest.fn();
      mockUseAttendanceManagement.mockReturnValue({
        ...defaultMockHookReturn,
        multiSectionModalOpen: true,
        handleMultiSectionConfirm: mockHandleMultiSectionConfirm,
      });

      renderWithProviders(<AttendanceManagement />);

      fireEvent.click(screen.getByText("Mover em ambas"));
      expect(mockHandleMultiSectionConfirm).toHaveBeenCalled();
    });

    it("should call handleMultiSectionCancel when multi-section cancel is clicked", () => {
      const mockHandleMultiSectionCancel = jest.fn();
      mockUseAttendanceManagement.mockReturnValue({
        ...defaultMockHookReturn,
        multiSectionModalOpen: true,
        handleMultiSectionCancel: mockHandleMultiSectionCancel,
      });

      renderWithProviders(<AttendanceManagement />);

      fireEvent.click(screen.getByText("Apenas nesta seção"));
      expect(mockHandleMultiSectionCancel).toHaveBeenCalled();
    });

    it("should not render modals when both are closed", () => {
      mockUseAttendanceManagement.mockReturnValue({
        ...defaultMockHookReturn,
        confirmOpen: false,
        multiSectionModalOpen: false,
      });

      renderWithProviders(<AttendanceManagement />);

      expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();
    });
  });

  describe("External Check-in Integration", () => {
    it("should pass externalCheckIn prop to hook", () => {
      const unscheduledCheckIn = {
        name: "External Patient",
        types: ["spiritual"],
        isNew: true,
        priority: "1" as IPriority,
      };

      renderWithProviders(
        <AttendanceManagement unscheduledCheckIn={unscheduledCheckIn} />
      );

      expect(mockUseAttendanceManagement).toHaveBeenCalledWith({
        unscheduledCheckIn,
        onCheckInProcessed: undefined,
        onNewPatientDetected: expect.any(Function),
      });
    });

    it("should pass onCheckInProcessed callback to hook", () => {
      const mockOnCheckInProcessed = jest.fn();

      renderWithProviders(
        <AttendanceManagement onCheckInProcessed={mockOnCheckInProcessed} />
      );

      expect(mockUseAttendanceManagement).toHaveBeenCalledWith({
        externalCheckIn: undefined,
        onCheckInProcessed: mockOnCheckInProcessed,
        onNewPatientDetected: expect.any(Function),
      });
    });

    it("should pass both externalCheckIn and callback to hook", () => {
      const unscheduledCheckIn = {
        name: "Test Patient",
        types: ["lightBath"],
        isNew: false,
        priority: "2" as IPriority,
      };
      const mockOnCheckInProcessed = jest.fn();

      renderWithProviders(
        <AttendanceManagement
          unscheduledCheckIn={unscheduledCheckIn}
          onCheckInProcessed={mockOnCheckInProcessed}
        />
      );

      expect(mockUseAttendanceManagement).toHaveBeenCalledWith({
        unscheduledCheckIn,
        onCheckInProcessed: mockOnCheckInProcessed,
        onNewPatientDetected: expect.any(Function),
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper language attribute on date input", () => {
      renderWithProviders(<AttendanceManagement />);

      const dateInput = screen.getByDisplayValue("2025-01-15");
      expect(dateInput).toHaveAttribute("lang", "pt-BR");
    });

    it("should have proper heading structure", () => {
      renderWithProviders(<AttendanceManagement />);

      const heading = screen.getByText("Data selecionada:");
      expect(heading.tagName).toBe("H2");
    });

    it("should have buttons that are keyboard accessible", () => {
      renderWithProviders(<AttendanceManagement />);

      const spiritualButton = screen.getByText("▼ Consultas Espirituais");
      const lightBathButton = screen.getByText("▼ Banhos de Luz + Bastão");

      expect(spiritualButton.tagName).toBe("BUTTON");
      expect(lightBathButton.tagName).toBe("BUTTON");
    });
  });

  describe("Component Integration", () => {
    it("should render without crashing when all props are provided", () => {
      const unscheduledCheckIn = {
        name: "Integration Test",
        types: ["spiritual", "lightBath"],
        isNew: true,
        priority: "3" as IPriority,
      };
      const mockCallback = jest.fn();

      const { container } = renderWithProviders(
        <AttendanceManagement
          unscheduledCheckIn={unscheduledCheckIn}
          onCheckInProcessed={mockCallback}
        />
      );

      expect(container).toBeInTheDocument();
    });

    it("should render without crashing when no props are provided", () => {
      const { container } = renderWithProviders(<AttendanceManagement />);
      expect(container).toBeInTheDocument();
    });

    it("should maintain consistent layout structure", () => {
      renderWithProviders(<AttendanceManagement />);

      // Check main container
      const mainContainer = screen
        .getByText("Data selecionada:")
        .closest("div");

      expect(mainContainer).toHaveClass(
        "w-full",
        "max-w-6xl",
        "mx-auto",
        "p-4"
      );

      // Check date input
      const dateInput = screen.getByDisplayValue("2025-01-15");
      expect(dateInput).toHaveClass("input", "h-11", "flex-1");
    });
  });
});
