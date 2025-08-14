import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import AgendaColumn from "../AgendaColumn";

// Mock the Spinner component
jest.mock("@/components/Spinner", () => {
  return function MockSpinner({
    className,
    size,
  }: {
    className?: string;
    size?: string;
  }) {
    return (
      <div data-testid="spinner" className={className}>
        Loading spinner - {size}
      </div>
    );
  };
});

// Mock the date helper
jest.mock("@/utils/dateHelpers", () => ({
  formatDateWithDayOfWeekBR: jest.fn(() => "Quarta-feira, 14/08/2025"),
}));

const mockProps = {
  title: "Test Column",
  agendaItems: [],
  openAgendaIdx: null,
  setOpenAgendaIdx: jest.fn(),
  onRemovePatient: jest.fn(),
  columnType: "spiritual" as const,
};

describe("AgendaColumn", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render column title", () => {
    render(<AgendaColumn {...mockProps} />);

    expect(screen.getByText("Test Column")).toBeInTheDocument();
  });

  it("should show loading spinner when isLoading is true", () => {
    render(<AgendaColumn {...mockProps} isLoading={true} />);

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
    expect(screen.getByText("Carregando agendamentos...")).toBeInTheDocument();
  });

  it("should show empty state when no items and not loading", () => {
    render(<AgendaColumn {...mockProps} isLoading={false} />);

    expect(
      screen.getByText("Nenhuma consulta espiritual encontrada.")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Selecione uma data diferente ou crie um novo agendamento."
      )
    ).toBeInTheDocument();
  });

  it("should show empty state for lightBath column type", () => {
    render(
      <AgendaColumn {...mockProps} columnType="lightBath" isLoading={false} />
    );

    expect(
      screen.getByText("Nenhum banho de luz/bastão encontrado.")
    ).toBeInTheDocument();
  });

  it("should show agenda items when provided", () => {
    const agendaItems = [
      {
        date: new Date("2025-08-14"),
        patients: [
          {
            id: "1",
            name: "João Silva",
            attendanceId: 123,
            attendanceType: "spiritual" as const,
          },
        ],
      },
    ];

    render(
      <AgendaColumn
        {...mockProps}
        agendaItems={agendaItems}
        isLoading={false}
      />
    );

    expect(screen.getByText("Quarta-feira, 14/08/2025")).toBeInTheDocument();
    expect(screen.getByText("1 paciente agendado")).toBeInTheDocument();
  });

  it("should not show loading spinner when isLoading is false", () => {
    render(<AgendaColumn {...mockProps} isLoading={false} />);

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
  });

  it("should default isLoading to false when not provided", () => {
    render(<AgendaColumn {...mockProps} />);

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    expect(
      screen.getByText("Nenhuma consulta espiritual encontrada.")
    ).toBeInTheDocument();
  });
});
