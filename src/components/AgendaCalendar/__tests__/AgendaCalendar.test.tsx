import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AgendaCalendar from "../index";
import { useAgendaCalendar } from "../useAgendaCalendar";
import { formatDateBR } from "@/utils/dateHelpers";

// Mock the hook
jest.mock("../useAgendaCalendar");
jest.mock("@/utils/dateHelpers");

// Mock components
jest.mock("@/components/ConfirmModal/index", () => {
  return function MockConfirmModal({
    open,
    title,
    onConfirm,
    onCancel,
  }: {
    open: boolean;
    title: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) {
    if (!open) return null;
    return (
      <div data-testid="confirm-modal">
        <h3>{title}</h3>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  };
});

jest.mock("@/components/NewAttendanceModal", () => {
  return function MockNewAttendanceModal({
    open,
    onClose,
    onSubmit,
  }: {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Record<string, unknown>) => void;
  }) {
    if (!open) return null;
    return (
      <div data-testid="new-attendance-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={() => onSubmit({})}>Submit</button>
      </div>
    );
  };
});

const mockUseAgendaCalendar = useAgendaCalendar as jest.MockedFunction<
  typeof useAgendaCalendar
>;
const mockFormatDateBR = formatDateBR as jest.MockedFunction<
  typeof formatDateBR
>;

describe("AgendaCalendar Component", () => {
  const defaultHookReturn = {
    TABS: [
      { key: "spiritual" as const, label: "Consultas Espirituais" },
      { key: "lightBath" as const, label: "Banhos de Luz/Bastão" },
    ],
    selectedDate: "2025-08-07",
    setSelectedDate: jest.fn(),
    activeTab: "spiritual" as const,
    setActiveTab: jest.fn(),
    filteredAgenda: {
      spiritual: [
        {
          date: new Date("2025-08-07"),
          patients: [
            { id: "1", name: "João Silva" },
            { id: "2", name: "Maria Santos" },
          ],
        },
      ],
      lightBath: [],
    },
    openAgendaIdx: null,
    setOpenAgendaIdx: jest.fn(),
    isTabTransitioning: false,
    confirmRemove: null,
    setConfirmRemove: jest.fn(),
    showNewAttendance: false,
    setShowNewAttendance: jest.fn(),
    handleRemovePatient: jest.fn(),
    handleNewAttendance: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAgendaCalendar.mockReturnValue(defaultHookReturn);
    mockFormatDateBR.mockReturnValue("07/08/2025");
  });

  describe("Rendering", () => {
    it("should render the agenda calendar with proper layout", () => {
      render(<AgendaCalendar />);

      expect(screen.getByText("Agenda de Atendimentos")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Visualize e gerencie os agendamentos por data e tipo de atendimento"
        )
      ).toBeInTheDocument();
      expect(screen.getByText("+ Novo Agendamento")).toBeInTheDocument();
    });

    it("should render date input with proper label", () => {
      render(<AgendaCalendar />);

      expect(
        screen.getByLabelText("Selecione uma data para filtrar")
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue("2025-08-07")).toBeInTheDocument();
    });

    it("should render all tabs", () => {
      render(<AgendaCalendar />);

      expect(screen.getByText("Consultas Espirituais")).toBeInTheDocument();
      expect(screen.getByText("Banhos de Luz/Bastão")).toBeInTheDocument();
    });

    it("should apply card-shadow styling", () => {
      render(<AgendaCalendar />);

      const container = screen
        .getByText("Agenda de Atendimentos")
        .closest(".card-shadow");
      expect(container).toBeInTheDocument();
    });
  });

  describe("Date Selection", () => {
    it("should handle date change", () => {
      const setSelectedDate = jest.fn();
      mockUseAgendaCalendar.mockReturnValue({
        ...defaultHookReturn,
        setSelectedDate,
      });

      render(<AgendaCalendar />);

      const dateInput = screen.getByLabelText(
        "Selecione uma data para filtrar"
      );
      fireEvent.change(dateInput, { target: { value: "2025-08-08" } });

      expect(setSelectedDate).toHaveBeenCalledWith("2025-08-08");
    });

    it("should display selected date value", () => {
      mockUseAgendaCalendar.mockReturnValue({
        ...defaultHookReturn,
        selectedDate: "2025-12-25",
      });

      render(<AgendaCalendar />);

      expect(screen.getByDisplayValue("2025-12-25")).toBeInTheDocument();
    });
  });

  describe("Tab Navigation", () => {
    it("should render active tab with proper styling", () => {
      render(<AgendaCalendar />);

      const activeTab = screen.getByText("Consultas Espirituais");
      expect(activeTab).toHaveClass("active");
    });

    it("should handle tab switching", () => {
      const setActiveTab = jest.fn();
      mockUseAgendaCalendar.mockReturnValue({
        ...defaultHookReturn,
        setActiveTab,
      });

      render(<AgendaCalendar />);

      fireEvent.click(screen.getByText("Banhos de Luz/Bastão"));
      expect(setActiveTab).toHaveBeenCalledWith("lightBath");
    });

    it("should apply proper tab styling structure", () => {
      render(<AgendaCalendar />);

      const tabContainer = screen.getByText(
        "Consultas Espirituais"
      ).parentElement;
      expect(tabContainer).toHaveClass(
        "flex",
        "w-full",
        "bg-gray-50",
        "relative"
      );
    });
  });

  describe("Agenda Items", () => {
    it("should render agenda items when data exists", () => {
      render(<AgendaCalendar />);

      expect(screen.getByText("07/08/2025")).toBeInTheDocument();
      expect(screen.getByText("2 pacientes agendados")).toBeInTheDocument();
    });

    it("should handle agenda item expansion", () => {
      const setOpenAgendaIdx = jest.fn();
      mockUseAgendaCalendar.mockReturnValue({
        ...defaultHookReturn,
        setOpenAgendaIdx,
      });

      render(<AgendaCalendar />);

      fireEvent.click(screen.getByText("07/08/2025"));
      expect(setOpenAgendaIdx).toHaveBeenCalledWith(0);
    });

    it("should show expanded agenda content", () => {
      mockUseAgendaCalendar.mockReturnValue({
        ...defaultHookReturn,
        openAgendaIdx: 0,
      });

      render(<AgendaCalendar />);

      expect(screen.getByText("2 Pacientes agendados:")).toBeInTheDocument();
      expect(screen.getByText("João Silva")).toBeInTheDocument();
      expect(screen.getByText("Maria Santos")).toBeInTheDocument();
    });

    it("should show empty state when no agenda items", () => {
      mockUseAgendaCalendar.mockReturnValue({
        ...defaultHookReturn,
        filteredAgenda: {
          spiritual: [],
          lightBath: [],
        },
      });

      render(<AgendaCalendar />);

      expect(
        screen.getByText("Nenhuma consulta espiritual encontrada.")
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Selecione uma data diferente ou crie um novo agendamento."
        )
      ).toBeInTheDocument();
    });

    it("should handle patient removal", () => {
      const setConfirmRemove = jest.fn();
      mockUseAgendaCalendar.mockReturnValue({
        ...defaultHookReturn,
        openAgendaIdx: 0,
        setConfirmRemove,
      });

      render(<AgendaCalendar />);

      const cancelButtons = screen.getAllByText("Cancelar");
      fireEvent.click(cancelButtons[0]);

      expect(setConfirmRemove).toHaveBeenCalledWith({
        id: "1",
        date: expect.any(Date),
        name: "João Silva",
        type: "spiritual",
      });
    });
  });

  describe("New Attendance Modal", () => {
    it("should open new attendance modal", () => {
      const setShowNewAttendance = jest.fn();
      mockUseAgendaCalendar.mockReturnValue({
        ...defaultHookReturn,
        setShowNewAttendance,
      });

      render(<AgendaCalendar />);

      fireEvent.click(screen.getByText("+ Novo Agendamento"));
      expect(setShowNewAttendance).toHaveBeenCalledWith(true);
    });

    it("should render new attendance modal when open", () => {
      mockUseAgendaCalendar.mockReturnValue({
        ...defaultHookReturn,
        showNewAttendance: true,
      });

      render(<AgendaCalendar />);

      expect(screen.getByTestId("new-attendance-modal")).toBeInTheDocument();
    });

    it("should handle modal close", () => {
      const setShowNewAttendance = jest.fn();
      mockUseAgendaCalendar.mockReturnValue({
        ...defaultHookReturn,
        showNewAttendance: true,
        setShowNewAttendance,
      });

      render(<AgendaCalendar />);

      fireEvent.click(screen.getByText("Close"));
      expect(setShowNewAttendance).toHaveBeenCalledWith(false);
    });

    it("should handle modal submit", () => {
      const handleNewAttendance = jest.fn();
      mockUseAgendaCalendar.mockReturnValue({
        ...defaultHookReturn,
        showNewAttendance: true,
        handleNewAttendance,
      });

      render(<AgendaCalendar />);

      fireEvent.click(screen.getByText("Submit"));
      expect(handleNewAttendance).toHaveBeenCalledWith({});
    });
  });

  describe("Confirm Modal", () => {
    it("should show confirm modal when confirmRemove is set", () => {
      mockUseAgendaCalendar.mockReturnValue({
        ...defaultHookReturn,
        confirmRemove: {
          id: "1",
          date: new Date("2025-08-07"),
          name: "João Silva",
          type: "spiritual" as const,
        },
      });

      render(<AgendaCalendar />);

      expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
      expect(screen.getByText("Remover paciente")).toBeInTheDocument();
    });

    it("should handle confirm modal cancel", () => {
      const setConfirmRemove = jest.fn();
      mockUseAgendaCalendar.mockReturnValue({
        ...defaultHookReturn,
        confirmRemove: {
          id: "1",
          date: new Date("2025-08-07"),
          name: "João Silva",
          type: "spiritual" as const,
        },
        setConfirmRemove,
      });

      render(<AgendaCalendar />);

      fireEvent.click(screen.getByText("Cancel"));
      expect(setConfirmRemove).toHaveBeenCalledWith(null);
    });

    it("should handle confirm modal confirmation", () => {
      const handleRemovePatient = jest.fn();
      mockUseAgendaCalendar.mockReturnValue({
        ...defaultHookReturn,
        confirmRemove: {
          id: "1",
          date: new Date("2025-08-07"),
          name: "João Silva",
          type: "spiritual" as const,
        },
        handleRemovePatient,
      });

      render(<AgendaCalendar />);

      fireEvent.click(screen.getByText("Confirm"));
      expect(handleRemovePatient).toHaveBeenCalled();
    });
  });

  describe("Transitions and States", () => {
    it("should handle tab transition state", () => {
      mockUseAgendaCalendar.mockReturnValue({
        ...defaultHookReturn,
        isTabTransitioning: true,
      });

      render(<AgendaCalendar />);

      const transitionContainer = screen
        .getByText("07/08/2025")
        .closest(".transition-opacity");
      expect(transitionContainer).toHaveClass(
        "opacity-0",
        "pointer-events-none"
      );
    });

    it("should show normal state when not transitioning", () => {
      render(<AgendaCalendar />);

      const transitionContainer = screen
        .getByText("07/08/2025")
        .closest(".transition-opacity");
      expect(transitionContainer).toHaveClass("opacity-100");
      expect(transitionContainer).not.toHaveClass("pointer-events-none");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes for expandable sections", () => {
      render(<AgendaCalendar />);

      const expandButton = screen.getByRole("button", { name: /07\/08\/2025/ });
      expect(expandButton).toHaveAttribute("aria-expanded", "false");
      expect(expandButton).toHaveAttribute(
        "aria-controls",
        "agenda-patients-0"
      );
    });

    it("should update ARIA attributes when expanded", () => {
      mockUseAgendaCalendar.mockReturnValue({
        ...defaultHookReturn,
        openAgendaIdx: 0,
      });

      render(<AgendaCalendar />);

      const expandButton = screen.getByRole("button", { name: /07\/08\/2025/ });
      expect(expandButton).toHaveAttribute("aria-expanded", "true");
    });

    it("should have proper labels for form elements", () => {
      render(<AgendaCalendar />);

      expect(
        screen.getByLabelText("Selecione uma data para filtrar")
      ).toBeInTheDocument();
    });

    it("should have proper ARIA labels for action buttons", () => {
      mockUseAgendaCalendar.mockReturnValue({
        ...defaultHookReturn,
        openAgendaIdx: 0,
      });

      render(<AgendaCalendar />);

      const cancelButtons = screen.getAllByLabelText("Cancelar agendamento");
      expect(cancelButtons).toHaveLength(2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle single patient correctly", () => {
      mockUseAgendaCalendar.mockReturnValue({
        ...defaultHookReturn,
        filteredAgenda: {
          spiritual: [
            {
              date: new Date("2025-08-07"),
              patients: [{ id: "1", name: "João Silva" }],
            },
          ],
          lightBath: [],
        },
      });

      render(<AgendaCalendar />);

      expect(screen.getByText("1 paciente agendado")).toBeInTheDocument();
    });

    it("should handle different tab types in empty state", () => {
      mockUseAgendaCalendar.mockReturnValue({
        ...defaultHookReturn,
        activeTab: "lightBath",
        filteredAgenda: {
          spiritual: [],
          lightBath: [],
        },
      });

      render(<AgendaCalendar />);

      expect(
        screen.getByText("Nenhum banho de luz/bastão encontrado.")
      ).toBeInTheDocument();
    });

    it("should handle multiple agenda dates", () => {
      mockUseAgendaCalendar.mockReturnValue({
        ...defaultHookReturn,
        filteredAgenda: {
          spiritual: [
            {
              date: new Date("2025-08-07"),
              patients: [{ id: "1", name: "João Silva" }],
            },
            {
              date: new Date("2025-08-08"),
              patients: [{ id: "2", name: "Maria Santos" }],
            },
          ],
          lightBath: [],
        },
      });

      mockFormatDateBR
        .mockReturnValueOnce("07/08/2025")
        .mockReturnValueOnce("08/08/2025");

      render(<AgendaCalendar />);

      expect(screen.getByText("07/08/2025")).toBeInTheDocument();
      expect(screen.getByText("08/08/2025")).toBeInTheDocument();
    });
  });
});
