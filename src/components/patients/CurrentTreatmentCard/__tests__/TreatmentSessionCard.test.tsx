import React from "react";
import { render, screen, fireEvent } from "../../../../test/testUtils";
import { TreatmentSessionCard } from "../TreatmentSessionCard";

// Mock the TreatmentProgressBar component
jest.mock("../../TreatmentProgressBar", () => ({
  TreatmentProgressBar: ({
    completed,
    total,
  }: {
    completed: number;
    total: number;
  }) => (
    <div data-testid="progress-bar">
      {completed}/{total}
    </div>
  ),
}));

// Mock the TreatmentCompletionBadge component
jest.mock("../../TreatmentCompletionBadge", () => ({
  TreatmentCompletionBadge: ({
    completionPercentage,
  }: {
    completionPercentage: number;
  }) => <div data-testid="completion-badge">{completionPercentage}%</div>,
}));

const mockLightBathSession = {
  id: 1,
  treatment_type: "light_bath" as const,
  body_location: "Cabeça",
  planned_sessions: 10,
  completed_sessions: 3,
  status: "active",
  duration_minutes: 30,
  color: "azul",
  sessionRecords: [{ status: "scheduled" }, { status: "completed" }],
};

const mockRodSession = {
  id: 2,
  treatment_type: "rod" as const,
  body_location: "Ombro direito",
  planned_sessions: 5,
  completed_sessions: 2,
  status: "active",
};

describe("TreatmentSessionCard", () => {
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders light bath session correctly", () => {
    render(
      <TreatmentSessionCard
        session={mockLightBathSession}
        onDelete={mockOnDelete}
        isDeleting={false}
      />
    );

    expect(screen.getByText("Cabeça")).toBeInTheDocument();
    expect(screen.getByText("azul")).toBeInTheDocument();
    expect(screen.getByText("30 unidades")).toBeInTheDocument();
    expect(screen.getByTestId("progress-bar")).toHaveTextContent("3/10");
    expect(screen.getByTestId("completion-badge")).toHaveTextContent("30%");
  });

  it("renders rod session correctly", () => {
    render(
      <TreatmentSessionCard
        session={mockRodSession}
        onDelete={mockOnDelete}
        isDeleting={false}
      />
    );

    expect(screen.getByText("Ombro direito")).toBeInTheDocument();
    expect(screen.getByTestId("progress-bar")).toHaveTextContent("2/5");
    expect(screen.getByTestId("completion-badge")).toHaveTextContent("40%");
  });

  it("calls onDelete when delete button is clicked", () => {
    render(
      <TreatmentSessionCard
        session={mockLightBathSession}
        onDelete={mockOnDelete}
        isDeleting={false}
      />
    );

    const deleteButton = screen.getByTitle("Remover sessão");
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith("1", "Banho de Luz");
  });

  it("disables delete button when isDeleting is true", () => {
    render(
      <TreatmentSessionCard
        session={mockLightBathSession}
        onDelete={mockOnDelete}
        isDeleting={true}
      />
    );

    const deleteButton = screen.getByTitle("Remover sessão");
    expect(deleteButton).toBeDisabled();
  });

  it("handles session without optional fields", () => {
    const minimalSession = {
      id: 3,
      treatment_type: "rod" as const,
      body_location: "",
      planned_sessions: 1,
      completed_sessions: 0,
      status: "scheduled",
    };

    render(
      <TreatmentSessionCard
        session={minimalSession}
        onDelete={mockOnDelete}
        isDeleting={false}
      />
    );

    expect(screen.getByText("Local não especificado")).toBeInTheDocument();
    expect(screen.getByTestId("progress-bar")).toHaveTextContent("0/1");
  });
});
