import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AttendanceList from "../index";
import { useAttendanceList } from "../useAttendanceList";
import { IPriority, IAttendanceByDate } from "@/types/globals";

// Mock the custom hook
jest.mock("../useAttendanceList");
const mockUseAttendanceList = useAttendanceList as jest.MockedFunction<
  typeof useAttendanceList
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

describe("AttendanceList Component", () => {
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
    collapsed: { spiritual: false, lightBath: false },
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
  };

  beforeEach(() => {
    jest.clearAllMocks();
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
    mockUseAttendanceList.mockReturnValue(defaultMockHookReturn);
  });

  describe("Rendering States", () => {
    it("should render loading state", () => {
      mockUseAttendanceList.mockReturnValue({
        ...defaultMockHookReturn,
        loading: true,
      });

      render(<AttendanceList />);

      expect(
        screen.getByText("Carregando atendimentos...")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Atendimentos de 2025-01-15")
      ).not.toBeInTheDocument();
    });

    it("should render error state", () => {
      const errorMessage = "Erro de conexão";
      mockUseAttendanceList.mockReturnValue({
        ...defaultMockHookReturn,
        loading: false,
        error: errorMessage,
      });

      render(<AttendanceList />);

      expect(
        screen.getByText("Erro ao carregar atendimentos")
      ).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText("Tentar novamente")).toBeInTheDocument();
    });

    it("should call refreshCurrentDate when retry button is clicked", () => {
      const mockRefreshCurrentDate = jest.fn();
      mockUseAttendanceList.mockReturnValue({
        ...defaultMockHookReturn,
        loading: false,
        error: "Erro de teste",
        refreshCurrentDate: mockRefreshCurrentDate,
      });

      render(<AttendanceList />);

      fireEvent.click(screen.getByText("Tentar novamente"));
      expect(mockRefreshCurrentDate).toHaveBeenCalled();
    });

    it("should render main content when data is loaded", () => {
      render(<AttendanceList />);

      expect(
        screen.getByText("Atendimentos de 2025-01-15")
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue("2025-01-15")).toBeInTheDocument();
      expect(screen.getByText("▼ Consultas Espirituais")).toBeInTheDocument();
      expect(screen.getByText("▼ Banho de Luz/Bastão")).toBeInTheDocument();
    });
  });

  describe("Date Selection", () => {
    it("should display current selected date", () => {
      render(<AttendanceList />);

      const dateInput = screen.getByDisplayValue("2025-01-15");
      expect(dateInput).toBeInTheDocument();
      expect(dateInput).toHaveAttribute("type", "date");
    });

    it("should call setSelectedDate when date changes", () => {
      const mockSetSelectedDate = jest.fn();
      mockUseAttendanceList.mockReturnValue({
        ...defaultMockHookReturn,
        setSelectedDate: mockSetSelectedDate,
      });

      render(<AttendanceList />);

      const dateInput = screen.getByDisplayValue("2025-01-15");
      fireEvent.change(dateInput, { target: { value: "2025-01-16" } });

      expect(mockSetSelectedDate).toHaveBeenCalledWith("2025-01-16");
    });
  });

  describe("Attendance Type Sections", () => {
    it("should render both spiritual and lightBath sections", () => {
      render(<AttendanceList />);

      expect(screen.getByText("▼ Consultas Espirituais")).toBeInTheDocument();
      expect(screen.getByText("▼ Banho de Luz/Bastão")).toBeInTheDocument();
    });

    it("should toggle spiritual section when clicked", () => {
      const mockToggleCollapsed = jest.fn();
      mockUseAttendanceList.mockReturnValue({
        ...defaultMockHookReturn,
        toggleCollapsed: mockToggleCollapsed,
      });

      render(<AttendanceList />);

      fireEvent.click(screen.getByText("▼ Consultas Espirituais"));
      expect(mockToggleCollapsed).toHaveBeenCalledWith("spiritual");
    });

    it("should toggle lightBath section when clicked", () => {
      const mockToggleCollapsed = jest.fn();
      mockUseAttendanceList.mockReturnValue({
        ...defaultMockHookReturn,
        toggleCollapsed: mockToggleCollapsed,
      });

      render(<AttendanceList />);

      fireEvent.click(screen.getByText("▼ Banho de Luz/Bastão"));
      expect(mockToggleCollapsed).toHaveBeenCalledWith("lightBath");
    });

    it("should show collapsed state indicator", () => {
      mockUseAttendanceList.mockReturnValue({
        ...defaultMockHookReturn,
        collapsed: { spiritual: true, lightBath: false },
      });

      render(<AttendanceList />);

      expect(screen.getByText("▶ Consultas Espirituais")).toBeInTheDocument();
      expect(screen.getByText("▼ Banho de Luz/Bastão")).toBeInTheDocument();
    });

    it("should hide attendance columns when section is collapsed", () => {
      mockUseAttendanceList.mockReturnValue({
        ...defaultMockHookReturn,
        collapsed: { spiritual: true, lightBath: false },
      });

      render(<AttendanceList />);

      // When spiritual is collapsed, there should be fewer "Agendados" titles
      // (only from lightBath section, not spiritual)
      const agendadosElements = screen.getAllByText("Agendados");
      expect(agendadosElements).toHaveLength(1); // Only from lightBath section
    });
  });

  describe("Attendance Columns", () => {
    it("should render all attendance columns for each type", () => {
      render(<AttendanceList />);

      // Check that real AttendanceColumn components are rendered
      // Each section (spiritual and lightBath) should have these column headers
      expect(screen.getAllByText("Agendados")).toHaveLength(2);
      expect(screen.getAllByText("Sala de Espera")).toHaveLength(2);
      expect(screen.getAllByText("Em Atendimento")).toHaveLength(2);

      // Check that "Atendidos" columns exist (the real label for completed status)
      const atendidosElements = screen.queryAllByText("Atendidos");
      expect(atendidosElements.length).toBeGreaterThan(0);
    });

    it("should pass correct props to AttendanceColumn components", () => {
      render(<AttendanceList />);

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
      mockUseAttendanceList.mockReturnValue({
        ...defaultMockHookReturn,
        getPatients: mockGetPatients,
      });

      render(<AttendanceList />);

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
      mockUseAttendanceList.mockReturnValue({
        ...defaultMockHookReturn,
        confirmOpen: true,
      });

      render(<AttendanceList />);

      expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Tem certeza que deseja mover este atendimento para uma etapa anterior?"
        )
      ).toBeInTheDocument();
    });

    it("should call handleConfirm when confirm button is clicked", () => {
      const mockHandleConfirm = jest.fn();
      mockUseAttendanceList.mockReturnValue({
        ...defaultMockHookReturn,
        confirmOpen: true,
        handleConfirm: mockHandleConfirm,
      });

      render(<AttendanceList />);

      fireEvent.click(screen.getByText("Confirmar"));
      expect(mockHandleConfirm).toHaveBeenCalled();
    });

    it("should call handleCancel when cancel button is clicked", () => {
      const mockHandleCancel = jest.fn();
      mockUseAttendanceList.mockReturnValue({
        ...defaultMockHookReturn,
        confirmOpen: true,
        handleCancel: mockHandleCancel,
      });

      render(<AttendanceList />);

      fireEvent.click(screen.getByText("Cancelar"));
      expect(mockHandleCancel).toHaveBeenCalled();
    });

    it("should render multi-section modal when multiSectionModalOpen is true", () => {
      mockUseAttendanceList.mockReturnValue({
        ...defaultMockHookReturn,
        multiSectionModalOpen: true,
      });

      render(<AttendanceList />);

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
      mockUseAttendanceList.mockReturnValue({
        ...defaultMockHookReturn,
        multiSectionModalOpen: true,
        handleMultiSectionConfirm: mockHandleMultiSectionConfirm,
      });

      render(<AttendanceList />);

      fireEvent.click(screen.getByText("Mover em ambas"));
      expect(mockHandleMultiSectionConfirm).toHaveBeenCalled();
    });

    it("should call handleMultiSectionCancel when multi-section cancel is clicked", () => {
      const mockHandleMultiSectionCancel = jest.fn();
      mockUseAttendanceList.mockReturnValue({
        ...defaultMockHookReturn,
        multiSectionModalOpen: true,
        handleMultiSectionCancel: mockHandleMultiSectionCancel,
      });

      render(<AttendanceList />);

      fireEvent.click(screen.getByText("Apenas nesta seção"));
      expect(mockHandleMultiSectionCancel).toHaveBeenCalled();
    });

    it("should not render modals when both are closed", () => {
      mockUseAttendanceList.mockReturnValue({
        ...defaultMockHookReturn,
        confirmOpen: false,
        multiSectionModalOpen: false,
      });

      render(<AttendanceList />);

      expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();
    });
  });

  describe("External Check-in Integration", () => {
    it("should pass externalCheckIn prop to hook", () => {
      const externalCheckIn = {
        name: "External Patient",
        types: ["spiritual"],
        isNew: true,
        priority: "1" as IPriority,
      };

      render(<AttendanceList externalCheckIn={externalCheckIn} />);

      expect(mockUseAttendanceList).toHaveBeenCalledWith({
        externalCheckIn,
        onCheckInProcessed: undefined,
      });
    });

    it("should pass onCheckInProcessed callback to hook", () => {
      const mockOnCheckInProcessed = jest.fn();

      render(<AttendanceList onCheckInProcessed={mockOnCheckInProcessed} />);

      expect(mockUseAttendanceList).toHaveBeenCalledWith({
        externalCheckIn: undefined,
        onCheckInProcessed: mockOnCheckInProcessed,
      });
    });

    it("should pass both externalCheckIn and callback to hook", () => {
      const externalCheckIn = {
        name: "Test Patient",
        types: ["lightBath"],
        isNew: false,
        priority: "2" as IPriority,
      };
      const mockOnCheckInProcessed = jest.fn();

      render(
        <AttendanceList
          externalCheckIn={externalCheckIn}
          onCheckInProcessed={mockOnCheckInProcessed}
        />
      );

      expect(mockUseAttendanceList).toHaveBeenCalledWith({
        externalCheckIn,
        onCheckInProcessed: mockOnCheckInProcessed,
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper language attribute on date input", () => {
      render(<AttendanceList />);

      const dateInput = screen.getByDisplayValue("2025-01-15");
      expect(dateInput).toHaveAttribute("lang", "pt-BR");
    });

    it("should have proper heading structure", () => {
      render(<AttendanceList />);

      const heading = screen.getByText("Atendimentos de 2025-01-15");
      expect(heading.tagName).toBe("H2");
    });

    it("should have buttons that are keyboard accessible", () => {
      render(<AttendanceList />);

      const spiritualButton = screen.getByText("▼ Consultas Espirituais");
      const lightBathButton = screen.getByText("▼ Banho de Luz/Bastão");

      expect(spiritualButton.tagName).toBe("BUTTON");
      expect(lightBathButton.tagName).toBe("BUTTON");
    });
  });

  describe("Component Integration", () => {
    it("should render without crashing when all props are provided", () => {
      const externalCheckIn = {
        name: "Integration Test",
        types: ["spiritual", "lightBath"],
        isNew: true,
        priority: "3" as IPriority,
      };
      const mockCallback = jest.fn();

      const { container } = render(
        <AttendanceList
          externalCheckIn={externalCheckIn}
          onCheckInProcessed={mockCallback}
        />
      );

      expect(container).toBeInTheDocument();
    });

    it("should render without crashing when no props are provided", () => {
      const { container } = render(<AttendanceList />);
      expect(container).toBeInTheDocument();
    });

    it("should maintain consistent layout structure", () => {
      render(<AttendanceList />);

      // Check main container
      const mainContainer = screen
        .getByText("Atendimentos de 2025-01-15")
        .closest("div");
      expect(mainContainer).toHaveClass(
        "w-full",
        "max-w-5xl",
        "mx-auto",
        "p-4"
      );

      // Check date input
      const dateInput = screen.getByDisplayValue("2025-01-15");
      expect(dateInput).toHaveClass("input", "mb-4");
    });
  });
});
