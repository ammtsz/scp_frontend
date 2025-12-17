import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AgendaColumn from "../AgendaColumn";
import { AttendanceType } from "@/types/types";

// Mock dependencies
jest.mock(
  "@/components/AttendanceManagement/components/AttendanceCards/AttendanceTypeTag",
  () => {
    return function MockAttendanceTypeTag({ type }: { type: AttendanceType }) {
      return <span data-testid="attendance-type-tag">{type}</span>;
    };
  }
);

jest.mock("@/utils/dateHelpers", () => ({
  formatDateWithDayOfWeekBR: jest.fn(
    (dateStr: string) => `Formatted ${dateStr}`
  ),
}));

jest.mock("@/components/common/Spinner", () => {
  return function MockSpinner({
    size,
    className,
  }: {
    size: string;
    className: string;
  }) {
    return (
      <div data-testid="spinner" data-size={size} className={className}>
        Loading...
      </div>
    );
  };
});

describe("AgendaColumn", () => {
  const mockPatient1 = {
    id: "1",
    name: "João Silva",
    attendanceId: 100,
    attendanceType: "spiritual" as AttendanceType,
  };

  const mockPatient2 = {
    id: "2",
    name: "Maria Santos",
    attendanceId: 101,
    attendanceType: "lightBath" as AttendanceType,
  };

  const defaultAgendaItem = {
    date: new Date("2024-01-15"),
    patients: [mockPatient1, mockPatient2],
  };

  const defaultProps = {
    title: "Consultas Espirituais",
    agendaItems: [defaultAgendaItem],
    openAgendaIdx: null,
    setOpenAgendaIdx: jest.fn(),
    onRemovePatient: jest.fn(),
    columnType: "spiritual" as const,
    isLoading: false,
    isRefreshing: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders without crashing", () => {
      render(<AgendaColumn {...defaultProps} />);

      expect(screen.getByText("Consultas Espirituais")).toBeInTheDocument();
    });

    it("displays column title correctly", () => {
      const customTitle = "Custom Column Title";
      render(<AgendaColumn {...defaultProps} title={customTitle} />);

      expect(screen.getByText(customTitle)).toBeInTheDocument();
    });

    it("displays agenda items count correctly - singular", () => {
      render(<AgendaColumn {...defaultProps} />);

      expect(screen.getByText("1 data com agendamentos")).toBeInTheDocument();
    });

    it("displays agenda items count correctly - plural", () => {
      const multipleItems = [
        defaultAgendaItem,
        { ...defaultAgendaItem, date: new Date("2024-01-16") },
      ];
      render(<AgendaColumn {...defaultProps} agendaItems={multipleItems} />);

      expect(screen.getByText("2 datas com agendamentos")).toBeInTheDocument();
    });

    it("applies correct styling classes", () => {
      const { container } = render(<AgendaColumn {...defaultProps} />);

      const columnDiv = container.firstChild as HTMLElement;
      expect(columnDiv).toHaveClass(
        "flex-1",
        "border",
        "border-gray-200",
        "shadow",
        "rounded-lg",
        "p-4",
        "bg-white",
        "relative"
      );
    });
  });

  describe("Refreshing State", () => {
    it("shows refreshing overlay when isRefreshing is true", () => {
      render(<AgendaColumn {...defaultProps} isRefreshing={true} />);

      expect(screen.getByTestId("spinner")).toBeInTheDocument();
      expect(screen.getByText("Atualizando...")).toBeInTheDocument();
    });

    it("applies opacity class when refreshing", () => {
      const { container } = render(
        <AgendaColumn {...defaultProps} isRefreshing={true} />
      );

      const columnDiv = container.firstChild as HTMLElement;
      expect(columnDiv).toHaveClass("opacity-75");
    });

    it("does not show refreshing overlay when isRefreshing is false", () => {
      render(<AgendaColumn {...defaultProps} isRefreshing={false} />);

      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
      expect(screen.queryByText("Atualizando...")).not.toBeInTheDocument();
    });

    it("does not apply opacity class when not refreshing", () => {
      const { container } = render(
        <AgendaColumn {...defaultProps} isRefreshing={false} />
      );

      const columnDiv = container.firstChild as HTMLElement;
      expect(columnDiv).not.toHaveClass("opacity-75");
    });
  });

  describe("Agenda Items Display", () => {
    it("displays agenda item date correctly", () => {
      render(<AgendaColumn {...defaultProps} />);

      expect(
        screen.getByText("Formatted 2024-01-15T00:00:00.000Z")
      ).toBeInTheDocument();
    });

    it("displays patient count correctly - singular", () => {
      const singlePatientItem = {
        ...defaultAgendaItem,
        patients: [mockPatient1],
      };
      render(
        <AgendaColumn {...defaultProps} agendaItems={[singlePatientItem]} />
      );

      expect(screen.getByText("1 paciente agendado")).toBeInTheDocument();
    });

    it("displays patient count correctly - plural", () => {
      render(<AgendaColumn {...defaultProps} />);

      expect(screen.getByText("2 pacientes agendados")).toBeInTheDocument();
    });

    it("shows collapsed state by default", () => {
      render(<AgendaColumn {...defaultProps} />);

      const expandButton = screen.getByRole("button", { expanded: false });
      expect(expandButton).toBeInTheDocument();
      expect(screen.queryByText("João Silva")).not.toBeInTheDocument();
    });

    it("shows expanded state when openAgendaIdx matches", () => {
      render(<AgendaColumn {...defaultProps} openAgendaIdx={0} />);

      expect(screen.getByText("João Silva")).toBeInTheDocument();
      expect(screen.getByText("Maria Santos")).toBeInTheDocument();
    });
  });

  describe("Interactive Behavior", () => {
    it("calls setOpenAgendaIdx with correct index when agenda item is clicked", () => {
      const setOpenAgendaIdxMock = jest.fn();
      render(
        <AgendaColumn
          {...defaultProps}
          setOpenAgendaIdx={setOpenAgendaIdxMock}
        />
      );

      const expandButton = screen.getByRole("button", { expanded: false });
      fireEvent.click(expandButton);

      expect(setOpenAgendaIdxMock).toHaveBeenCalledWith(0);
    });

    it("calls setOpenAgendaIdx with null when already open agenda item is clicked", () => {
      const setOpenAgendaIdxMock = jest.fn();
      render(
        <AgendaColumn
          {...defaultProps}
          openAgendaIdx={0}
          setOpenAgendaIdx={setOpenAgendaIdxMock}
        />
      );

      const collapseButton = screen.getByRole("button", { expanded: true });
      fireEvent.click(collapseButton);

      expect(setOpenAgendaIdxMock).toHaveBeenCalledWith(null);
    });

    it("shows rotate arrow when expanded", () => {
      const { container } = render(
        <AgendaColumn {...defaultProps} openAgendaIdx={0} />
      );

      const arrow = container.querySelector(".rotate-90");
      expect(arrow).toBeInTheDocument();
    });

    it("does not show rotate arrow when collapsed", () => {
      const { container } = render(
        <AgendaColumn {...defaultProps} openAgendaIdx={null} />
      );

      const arrow = container.querySelector(".rotate-90");
      expect(arrow).not.toBeInTheDocument();
    });
  });

  describe("Patient List Display", () => {
    beforeEach(() => {
      render(<AgendaColumn {...defaultProps} openAgendaIdx={0} />);
    });

    it("displays patient names when expanded", () => {
      expect(screen.getByText("João Silva")).toBeInTheDocument();
      expect(screen.getByText("Maria Santos")).toBeInTheDocument();
    });

    it("displays patient numbers correctly", () => {
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });

    it("displays attendance type tags", () => {
      const tags = screen.getAllByTestId("attendance-type-tag");
      expect(tags).toHaveLength(2);
      expect(tags[0]).toHaveTextContent("spiritual");
      expect(tags[1]).toHaveTextContent("lightBath");
    });

    it("displays cancel buttons for each patient", () => {
      const cancelButtons = screen.getAllByText("Cancelar");
      expect(cancelButtons).toHaveLength(2);
    });
  });

  describe("Remove Patient Functionality", () => {
    it("calls onRemovePatient with correct parameters when cancel button is clicked", () => {
      const onRemovePatientMock = jest.fn();
      render(
        <AgendaColumn
          {...defaultProps}
          openAgendaIdx={0}
          onRemovePatient={onRemovePatientMock}
        />
      );

      const cancelButtons = screen.getAllByText("Cancelar");
      fireEvent.click(cancelButtons[0]);

      expect(onRemovePatientMock).toHaveBeenCalledWith({
        id: "1",
        date: defaultAgendaItem.date,
        name: "João Silva",
        type: "spiritual",
        attendanceId: 100,
      });
    });

    it("handles patient without attendanceId", () => {
      const patientWithoutId = { ...mockPatient1, attendanceId: undefined };
      const agendaWithoutId = {
        ...defaultAgendaItem,
        patients: [patientWithoutId],
      };
      const onRemovePatientMock = jest.fn();

      render(
        <AgendaColumn
          {...defaultProps}
          agendaItems={[agendaWithoutId]}
          openAgendaIdx={0}
          onRemovePatient={onRemovePatientMock}
        />
      );

      const cancelButton = screen.getByText("Cancelar");
      fireEvent.click(cancelButton);

      expect(onRemovePatientMock).toHaveBeenCalledWith({
        id: "1",
        date: defaultAgendaItem.date,
        name: "João Silva",
        type: "spiritual",
        attendanceId: undefined,
      });
    });
  });

  describe("Loading State", () => {
    it("shows loading spinner when isLoading is true and no agenda items", () => {
      render(
        <AgendaColumn {...defaultProps} agendaItems={[]} isLoading={true} />
      );

      expect(screen.getByTestId("spinner")).toBeInTheDocument();
      expect(
        screen.getByText("Carregando agendamentos...")
      ).toBeInTheDocument();
    });

    it("shows loading spinner with correct props", () => {
      render(
        <AgendaColumn {...defaultProps} agendaItems={[]} isLoading={true} />
      );

      const spinner = screen.getByTestId("spinner");
      expect(spinner).toHaveAttribute("data-size", "md");
      expect(spinner).toHaveClass("text-blue-500");
    });
  });

  describe("Empty State", () => {
    it("shows spiritual empty message when no items and columnType is spiritual", () => {
      render(
        <AgendaColumn
          {...defaultProps}
          agendaItems={[]}
          columnType="spiritual"
        />
      );

      expect(
        screen.getByText("Nenhuma consulta espiritual encontrada.")
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Selecione uma data diferente ou crie um novo agendamento."
        )
      ).toBeInTheDocument();
    });

    it("shows light bath empty message when no items and columnType is lightBath", () => {
      render(
        <AgendaColumn
          {...defaultProps}
          agendaItems={[]}
          columnType="lightBath"
        />
      );

      expect(
        screen.getByText("Nenhum banho de luz/bastão encontrado.")
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Selecione uma data diferente ou crie um novo agendamento."
        )
      ).toBeInTheDocument();
    });
  });

  describe("Multiple Agenda Items", () => {
    const multipleItems = [
      defaultAgendaItem,
      { date: new Date("2024-01-16"), patients: [mockPatient1] },
      { date: new Date("2024-01-17"), patients: [mockPatient2] },
    ];

    it("renders multiple agenda items", () => {
      render(<AgendaColumn {...defaultProps} agendaItems={multipleItems} />);

      expect(screen.getAllByRole("button", { expanded: false })).toHaveLength(
        3
      );
    });

    it("handles opening different agenda items independently", () => {
      const setOpenAgendaIdxMock = jest.fn();
      render(
        <AgendaColumn
          {...defaultProps}
          agendaItems={multipleItems}
          setOpenAgendaIdx={setOpenAgendaIdxMock}
        />
      );

      const buttons = screen.getAllByRole("button");
      fireEvent.click(buttons[1]); // Click second item

      expect(setOpenAgendaIdxMock).toHaveBeenCalledWith(1);
    });

    it("shows correct styling for open vs closed items", () => {
      const { container } = render(
        <AgendaColumn
          {...defaultProps}
          agendaItems={multipleItems}
          openAgendaIdx={1}
        />
      );

      const agendaItems = container.querySelectorAll(
        ".mb-4.border.border-gray-200.rounded-lg.shadow-sm"
      );
      expect(agendaItems[0]).toHaveClass("bg-white");
      expect(agendaItems[1]).toHaveClass("bg-gray-100");
      expect(agendaItems[2]).toHaveClass("bg-white");
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA attributes for expandable content", () => {
      render(<AgendaColumn {...defaultProps} />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(button).toHaveAttribute(
        "aria-controls",
        "agenda-patients-spiritual-0"
      );
    });

    it("updates ARIA attributes when expanded", () => {
      render(<AgendaColumn {...defaultProps} openAgendaIdx={0} />);

      const expandButton = screen.getByRole("button", { expanded: true });
      expect(expandButton).toHaveAttribute("aria-expanded", "true");
    });

    it("has proper id for controlled content", () => {
      render(<AgendaColumn {...defaultProps} openAgendaIdx={0} />);

      const content = document.getElementById("agenda-patients-spiritual-0");
      expect(content).toBeInTheDocument();
    });

    it("has aria-label for remove buttons", () => {
      render(<AgendaColumn {...defaultProps} openAgendaIdx={0} />);

      const cancelButtons = screen.getAllByLabelText("Cancelar agendamento");
      expect(cancelButtons).toHaveLength(2);
    });
  });

  describe("Edge Cases", () => {
    it("handles empty patients array", () => {
      const emptyAgenda = { date: new Date("2024-01-15"), patients: [] };
      render(
        <AgendaColumn
          {...defaultProps}
          agendaItems={[emptyAgenda]}
          openAgendaIdx={0}
        />
      );

      expect(screen.getByText("0 pacientes agendados")).toBeInTheDocument();
      expect(screen.queryByText("Cancelar")).not.toBeInTheDocument();
    });

    it("handles patient without attendance type", () => {
      const patientWithoutType = {
        ...mockPatient1,
        attendanceType: undefined as unknown as AttendanceType,
      };
      const agendaWithoutType = {
        ...defaultAgendaItem,
        patients: [patientWithoutType],
      };

      render(
        <AgendaColumn
          {...defaultProps}
          agendaItems={[agendaWithoutType]}
          openAgendaIdx={0}
        />
      );

      expect(screen.getByText("João Silva")).toBeInTheDocument();
      // AttendanceTypeTag should not be rendered when attendanceType is undefined
      expect(
        screen.queryByTestId("attendance-type-tag")
      ).not.toBeInTheDocument();
    });

    it("handles very long patient names", () => {
      const longNamePatient = {
        ...mockPatient1,
        name: "João Silva da Costa Santos Oliveira Pereira",
      };
      const agendaWithLongName = {
        ...defaultAgendaItem,
        patients: [longNamePatient],
      };

      render(
        <AgendaColumn
          {...defaultProps}
          agendaItems={[agendaWithLongName]}
          openAgendaIdx={0}
        />
      );

      expect(
        screen.getByText("João Silva da Costa Santos Oliveira Pereira")
      ).toBeInTheDocument();
    });
  });
});
