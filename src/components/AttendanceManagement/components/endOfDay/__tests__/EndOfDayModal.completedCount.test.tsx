import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EndOfDayModal from "../EndOfDayModal";
import type { IAttendanceStatusDetail, IPriority } from "@/types/globals";

// Mock factory for creating attendance data
const createMockAttendance = (
  id: number,
  name: string
): IAttendanceStatusDetail => ({
  patientId: id,
  attendanceId: id,
  name,
  priority: "1" as IPriority,
  checkedInTime: new Date(),
});

describe("EndOfDayModal - Completed Attendances Count", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onFinalize: jest.fn(),
    incompleteAttendances: [],
    scheduledAbsences: [],
    completedAttendances: [],
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to check for completed attendances count
  const expectCompletedAttendancesCount = (count: number) => {
    // Look for the "✓ Atendimentos finalizados:" text
    expect(screen.getByText("✓ Atendimentos finalizados:")).toBeInTheDocument();

    // Since the count is in a separate text node, we need to be more specific
    // Look for the count as part of a list item that contains the text
    const listItem = screen
      .getByText("✓ Atendimentos finalizados:")
      .closest("li");
    expect(listItem).toHaveTextContent(`✓ Atendimentos finalizados: ${count}`);
  };

  it("should show 0 finalized attendances when no attendances are provided", async () => {
    render(<EndOfDayModal {...defaultProps} />);

    // Since there are no incomplete attendances or scheduled absences,
    // modal should start on absences step and we can proceed to confirmation
    const nextButton = screen.getByText("Próximo");
    fireEvent.click(nextButton);

    await waitFor(() => {
      expectCompletedAttendancesCount(0);
    });
  });

  it("should show correct count of already completed attendances", async () => {
    const completedAttendances = [
      createMockAttendance(1, "Patient 1"),
      createMockAttendance(2, "Patient 2"),
      createMockAttendance(3, "Patient 3"),
    ];

    render(
      <EndOfDayModal
        {...defaultProps}
        completedAttendances={completedAttendances}
      />
    );

    // Navigate to confirmation step
    const nextButton = screen.getByText("Próximo");
    fireEvent.click(nextButton);

    await waitFor(() => {
      expectCompletedAttendancesCount(3);
    });
  });

  it("should add completed incomplete attendances to the total count", async () => {
    const completedAttendances = [
      createMockAttendance(1, "Patient 1"),
      createMockAttendance(2, "Patient 2"),
    ];

    const incompleteAttendances = [
      createMockAttendance(3, "Patient 3"),
      createMockAttendance(4, "Patient 4"),
    ];

    render(
      <EndOfDayModal
        {...defaultProps}
        completedAttendances={completedAttendances}
        incompleteAttendances={incompleteAttendances}
      />
    );

    // Complete one of the incomplete attendances (this will be the first "Concluir" button)
    const completeButtons = screen.getAllByText("Concluir");
    fireEvent.click(completeButtons[0]);

    // Navigate to absences step
    const nextButton = screen.getByText("Próximo");
    fireEvent.click(nextButton);

    // Navigate to confirmation step
    fireEvent.click(screen.getByText("Próximo"));

    await waitFor(() => {
      expectCompletedAttendancesCount(3);
    });
  });

  it("should update count dynamically as incomplete attendances are marked complete", async () => {
    const completedAttendances = [createMockAttendance(1, "Patient 1")];

    const incompleteAttendances = [
      createMockAttendance(2, "Patient 2"),
      createMockAttendance(3, "Patient 3"),
      createMockAttendance(4, "Patient 4"),
    ];

    render(
      <EndOfDayModal
        {...defaultProps}
        completedAttendances={completedAttendances}
        incompleteAttendances={incompleteAttendances}
      />
    );

    // Complete all incomplete attendances one by one
    const completeButtons = screen.getAllByText("Concluir");
    completeButtons.forEach((button) => fireEvent.click(button));

    // Navigate to absences step
    const nextButton = screen.getByText("Próximo");
    fireEvent.click(nextButton);

    // Navigate to confirmation step
    fireEvent.click(screen.getByText("Próximo"));

    await waitFor(() => {
      expectCompletedAttendancesCount(4);
    });
  });

  it("should handle large numbers of attendances correctly", async () => {
    const completedAttendances = Array.from({ length: 15 }, (_, i) =>
      createMockAttendance(i + 1, `Completed Patient ${i + 1}`)
    );

    const incompleteAttendances = Array.from({ length: 5 }, (_, i) =>
      createMockAttendance(i + 16, `Incomplete Patient ${i + 16}`)
    );

    render(
      <EndOfDayModal
        {...defaultProps}
        completedAttendances={completedAttendances}
        incompleteAttendances={incompleteAttendances}
      />
    );

    // Complete 3 of the incomplete attendances
    const completeButtons = screen.getAllByText("Concluir").slice(0, 3);
    completeButtons.forEach((button) => fireEvent.click(button));

    // Navigate to absences step
    const nextButton = screen.getByText("Próximo");
    fireEvent.click(nextButton);

    // Navigate to confirmation step
    fireEvent.click(screen.getByText("Próximo"));

    await waitFor(() => {
      expectCompletedAttendancesCount(18);
    });
  });

  it("should maintain count when navigating between steps", async () => {
    const completedAttendances = [
      createMockAttendance(1, "Patient 1"),
      createMockAttendance(2, "Patient 2"),
    ];

    const incompleteAttendances = [createMockAttendance(3, "Patient 3")];

    render(
      <EndOfDayModal
        {...defaultProps}
        completedAttendances={completedAttendances}
        incompleteAttendances={incompleteAttendances}
      />
    );

    // Complete the incomplete attendance
    const completeButton = screen.getByText("Concluir");
    fireEvent.click(completeButton);

    // Navigate to absences step
    const nextButton = screen.getByText("Próximo");
    fireEvent.click(nextButton);

    // Navigate to confirmation step
    fireEvent.click(screen.getByText("Próximo"));

    await waitFor(() => {
      expectCompletedAttendancesCount(3);
    });

    // Navigate back to absences
    const backButton = screen.getByText("Voltar");
    fireEvent.click(backButton);

    // Navigate back to confirmation
    fireEvent.click(screen.getByText("Próximo"));

    await waitFor(() => {
      expectCompletedAttendancesCount(3);
    });
  });
});
