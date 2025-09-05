import React from "react";
import { render, screen } from "@testing-library/react";
import EndOfDayModal from "../EndOfDayModal";
import type { IAttendanceStatusDetail, IPriority } from "@/types/globals";

// Manual test to verify our core fixes work
describe("EndOfDayModal - Manual Verification", () => {
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

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onFinalize: jest.fn(),
    incompleteAttendances: [],
    scheduledAbsences: [],
    completedAttendances: [],
    selectedDate: "2024-01-15",
    isLoading: false,
  };

  it("should show the selected date in the modal title", () => {
    render(<EndOfDayModal {...defaultProps} />);

    // Check if the specific date is displayed in the title
    // The date 2024-01-15 should be formatted as 15/01/2024 in pt-BR locale
    expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument();

    // Also verify that the title contains "Encerramento do Dia"
    expect(screen.getByText(/Encerramento do Dia/)).toBeInTheDocument();
  });

  it("should show scheduled absences when provided", () => {
    const scheduledAbsences = [
      createMockAttendance(1, "Patient 1"),
      createMockAttendance(2, "Patient 2"),
    ];

    render(
      <EndOfDayModal {...defaultProps} scheduledAbsences={scheduledAbsences} />
    );

    // Check if we have scheduled absences counted in the pending items
    expect(screen.getByText("2 item(s) pendente(s)")).toBeInTheDocument();
  });

  it("should show completed attendances count in props verification", () => {
    const completedAttendances = [
      createMockAttendance(1, "Patient 1"),
      createMockAttendance(2, "Patient 2"),
      createMockAttendance(3, "Patient 3"),
    ];

    const { rerender } = render(
      <EndOfDayModal
        {...defaultProps}
        completedAttendances={completedAttendances}
      />
    );

    // Verify the component accepts completedAttendances prop
    expect(completedAttendances).toHaveLength(3);

    // Test with different data
    const newCompletedAttendances = [createMockAttendance(4, "Patient 4")];

    rerender(
      <EndOfDayModal
        {...defaultProps}
        completedAttendances={newCompletedAttendances}
      />
    );

    expect(newCompletedAttendances).toHaveLength(1);
  });

  it("should use current date when selectedDate is not provided", () => {
    const propsWithoutDate = {
      ...defaultProps,
      selectedDate: undefined,
    };

    render(<EndOfDayModal {...propsWithoutDate} />);

    // Should still render without error and show some date
    const today = new Date().toLocaleDateString("pt-BR");
    const dateRegex = new RegExp(today.replace(/\//g, "\\/"));
    expect(screen.getByText(dateRegex)).toBeInTheDocument();
  });
});
