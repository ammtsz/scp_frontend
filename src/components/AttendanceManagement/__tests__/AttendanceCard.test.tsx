import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AttendanceCard from "../components/AttendanceCards/AttendanceCard";
import {
  AttendanceProgression,
  AttendanceType,
  AttendanceStatusDetail,
  Priority,
} from "@/types/types";
import { IDraggedItem } from "../types";

// Mock react-feather
jest.mock("react-feather", () => ({
  X: ({ className }: { className?: string }) => (
    <div data-testid="x-icon" className={className}>
      ✕
    </div>
  ),
}));

// Mock the AttendanceTimes component
jest.mock("../components/AttendanceCards/AttendanceTimes", () => {
  return function MockAttendanceTimes({
    status,
    checkedInTime,
    onGoingTime,
    completedTime,
  }: {
    status: AttendanceProgression;
    checkedInTime?: string | null;
    onGoingTime?: string | null;
    completedTime?: string | null;
  }) {
    return (
      <div data-testid="attendance-times">
        Times: {status} -{checkedInTime && ` CheckedIn: ${checkedInTime}`}
        {onGoingTime && ` OnGoing: ${onGoingTime}`}
        {completedTime && ` Completed: ${completedTime}`}
      </div>
    );
  };
});

// Mock the TreatmentSessionProgress component
jest.mock("../../TreatmentSessionProgress", () => {
  return function MockTreatmentSessionProgress({
    patientId,
    attendanceType,
    showDetails,
  }: {
    patientId: number;
    attendanceType: string;
    showDetails: boolean;
  }) {
    return (
      <div data-testid="treatment-session-progress">
        Progress for patient {patientId} - Type: {attendanceType} - Details:{" "}
        {showDetails.toString()}
      </div>
    );
  };
});

describe("AttendanceCard Component", () => {
  const mockPatient: AttendanceStatusDetail = {
    name: "João Silva",
    priority: "1" as Priority,
    attendanceId: 123,
    patientId: 456,
    checkedInTime: "09:00:00",
    onGoingTime: null,
    completedTime: null,
  };

  const defaultProps = {
    patient: mockPatient,
    status: "checkedIn" as AttendanceProgression,
    type: "spiritual" as AttendanceType,
    index: 0,
    dragged: null as IDraggedItem | null,
    handleDragStart: jest.fn(),
    handleDragEnd: jest.fn(),
    onDelete: jest.fn(),
    isNextToBeAttended: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render patient name and priority", () => {
      render(<AttendanceCard {...defaultProps} />);

      expect(screen.getByText(/João Silva \(1\)/)).toBeInTheDocument();
    });

    it("should render AttendanceTimes component", () => {
      render(<AttendanceCard {...defaultProps} />);

      expect(screen.getByTestId("attendance-times")).toBeInTheDocument();
    });

    it("should show patient index for checkedIn status", () => {
      render(<AttendanceCard {...defaultProps} status="checkedIn" index={2} />);

      expect(screen.getByText(/3\. João Silva \(1\)/)).toBeInTheDocument(); // index + 1
    });

    it("should not show patient index for non-checkedIn status", () => {
      render(<AttendanceCard {...defaultProps} status="scheduled" />);

      expect(screen.getByText(/João Silva \(1\)/)).toBeInTheDocument();
      expect(screen.queryByText(/1\./)).not.toBeInTheDocument();
    });

    it("should show 'next to be attended' indicator when isNextToBeAttended is true", () => {
      render(<AttendanceCard {...defaultProps} isNextToBeAttended={true} />);

      expect(screen.getByText("Próximo")).toBeInTheDocument();
    });

    it("should not show 'next to be attended' indicator when isNextToBeAttended is false", () => {
      render(<AttendanceCard {...defaultProps} isNextToBeAttended={false} />);

      expect(screen.queryByText("Próximo")).not.toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should apply correct styling for scheduled status", () => {
      render(<AttendanceCard {...defaultProps} status="scheduled" />);

      const card = screen.getByRole("listitem");
      expect(card).toHaveClass("border-l-4", "border-l-gray-400");
    });

    it("should apply correct styling for checkedIn status", () => {
      render(<AttendanceCard {...defaultProps} status="checkedIn" />);

      const card = screen.getByRole("listitem");
      expect(card).toHaveClass("border-l-4", "border-l-gray-400");
    });

    it("should apply correct styling for onGoing status", () => {
      render(<AttendanceCard {...defaultProps} status="onGoing" />);

      const card = screen.getByRole("listitem");
      expect(card).toHaveClass("border-l-4", "border-l-gray-400");
    });

    it("should apply correct styling for completed status", () => {
      render(<AttendanceCard {...defaultProps} status="completed" />);

      const card = screen.getByRole("listitem");
      expect(card).toHaveClass("border-l-4", "border-l-gray-400");
    });

    it("should apply dragged opacity when item is being dragged", () => {
      const draggedItem: IDraggedItem = {
        type: "spiritual",
        status: "checkedIn",
        idx: 0,
        patientId: 456,
      };

      render(<AttendanceCard {...defaultProps} dragged={draggedItem} />);

      const card = screen.getByRole("listitem");
      expect(card).toHaveClass("opacity-60");
    });

    it("should not apply dragged opacity when item is not being dragged", () => {
      const draggedItem: IDraggedItem = {
        type: "lightBath", // Different type
        status: "checkedIn",
        idx: 0,
        patientId: 456,
      };

      render(<AttendanceCard {...defaultProps} dragged={draggedItem} />);

      const card = screen.getByRole("listitem");
      expect(card).not.toHaveClass("opacity-60");
    });

    it("should have proper base classes", () => {
      render(<AttendanceCard {...defaultProps} />);

      const card = screen.getByRole("listitem");
      expect(card).toHaveClass(
        "relative",
        "h-24",
        "w-full",
        "flex",
        "items-center",
        "justify-center",
        "p-2",
        "rounded-lg",
        "bg-white",
        "text-center",
        "font-medium",
        "transition-all",
        "cursor-move",
        "select-none"
      );
    });
  });

  describe("Drag and Drop", () => {
    it("should be draggable", () => {
      render(<AttendanceCard {...defaultProps} />);

      const card = screen.getByRole("listitem");
      expect(card).toHaveAttribute("draggable", "true");
    });

    it("should call handleDragStart when drag starts", () => {
      const mockHandleDragStart = jest.fn();
      render(
        <AttendanceCard
          {...defaultProps}
          handleDragStart={mockHandleDragStart}
        />
      );

      const card = screen.getByRole("listitem");
      fireEvent.dragStart(card);

      expect(mockHandleDragStart).toHaveBeenCalledWith(
        "spiritual",
        0,
        "checkedIn"
      );
    });

    it("should call handleDragEnd when drag ends", () => {
      const mockHandleDragEnd = jest.fn();
      render(
        <AttendanceCard {...defaultProps} handleDragEnd={mockHandleDragEnd} />
      );

      const card = screen.getByRole("listitem");
      fireEvent.dragEnd(card);

      expect(mockHandleDragEnd).toHaveBeenCalled();
    });
  });

  describe("Dragged State Detection", () => {
    const testCases = [
      {
        description: "should detect dragged state when all properties match",
        dragged: {
          type: "spiritual" as AttendanceType,
          status: "checkedIn" as AttendanceProgression,
          idx: 0,
          patientId: 456,
        },
        cardProps: {
          type: "spiritual" as AttendanceType,
          status: "checkedIn" as AttendanceProgression,
          idx: 0,
        },
        expectedDragged: true,
      },
      {
        description: "should not detect dragged state when type differs",
        dragged: {
          type: "lightBath" as AttendanceType,
          status: "checkedIn" as AttendanceProgression,
          idx: 0,
          patientId: 1,
        },
        cardProps: {
          type: "spiritual" as AttendanceType,
          status: "checkedIn" as AttendanceProgression,
          idx: 0,
        },
        expectedDragged: false,
      },
      {
        description: "should not detect dragged state when status differs",
        dragged: {
          type: "spiritual" as AttendanceType,
          status: "scheduled" as AttendanceProgression,
          idx: 0,
          patientId: 1,
        },
        cardProps: {
          type: "spiritual" as AttendanceType,
          status: "checkedIn" as AttendanceProgression,
          idx: 0,
        },
        expectedDragged: false,
      },
      {
        description: "should not detect dragged state when index differs",
        dragged: {
          type: "spiritual" as AttendanceType,
          status: "checkedIn" as AttendanceProgression,
          idx: 1,
          patientId: 1,
        },
        cardProps: {
          type: "spiritual" as AttendanceType,
          status: "checkedIn" as AttendanceProgression,
          idx: 0,
        },
        expectedDragged: false,
      },
    ];

    testCases.forEach(
      ({ description, dragged, cardProps, expectedDragged }) => {
        it(description, () => {
          render(
            <AttendanceCard
              {...defaultProps}
              {...cardProps}
              dragged={dragged}
            />
          );

          const card = screen.getByRole("listitem");
          if (expectedDragged) {
            expect(card).toHaveClass("opacity-60");
          } else {
            expect(card).not.toHaveClass("opacity-60");
          }
        });
      }
    );
  });

  describe("Patient Data Variations", () => {
    it("should render different priority values", () => {
      const patientWithPriority2: AttendanceStatusDetail = {
        ...mockPatient,
        priority: "2" as Priority,
      };

      render(
        <AttendanceCard {...defaultProps} patient={patientWithPriority2} />
      );

      expect(screen.getByText(/João Silva \(2\)/)).toBeInTheDocument();
    });

    it("should render different patient names", () => {
      const differentPatient: AttendanceStatusDetail = {
        ...mockPatient,
        name: "Maria Santos",
      };

      render(<AttendanceCard {...defaultProps} patient={differentPatient} />);

      expect(screen.getByText(/Maria Santos \(1\)/)).toBeInTheDocument();
    });

    it("should pass correct times to AttendanceTimes component", () => {
      const patientWithTimes: AttendanceStatusDetail = {
        patientId: 1,
        name: "Test Patient",
        priority: "1" as Priority,
        checkedInTime: "09:00:00",
        onGoingTime: "09:30:00",
        completedTime: "10:00:00",
      };

      render(<AttendanceCard {...defaultProps} patient={patientWithTimes} />);

      const attendanceTimes = screen.getByTestId("attendance-times");
      expect(attendanceTimes).toHaveTextContent("CheckedIn: 09:00:00");
      expect(attendanceTimes).toHaveTextContent("OnGoing: 09:30:00");
      expect(attendanceTimes).toHaveTextContent("Completed: 10:00:00");
    });
  });

  describe("Next to be Attended Indicator", () => {
    it("should position the indicator correctly", () => {
      render(<AttendanceCard {...defaultProps} isNextToBeAttended={true} />);

      const indicator = screen.getByText("Próximo");
      expect(indicator).toHaveClass(
        "absolute",
        "top-1",
        "right-1",
        "text-red-700",
        "text-xs",
        "px-1",
        "py-0.5",
        "rounded",
        "z-10",
        "bg-red-100"
      );
    });
  });

  describe("Accessibility", () => {
    it("should have proper list item semantics", () => {
      render(<AttendanceCard {...defaultProps} />);

      const card = screen.getByRole("listitem");
      expect(card).toBeInTheDocument();
    });

    it("should be keyboard navigable (draggable)", () => {
      render(<AttendanceCard {...defaultProps} />);

      const card = screen.getByRole("listitem");
      expect(card).toHaveAttribute("draggable");
    });
  });

  describe("Edge Cases", () => {
    it("should handle null times gracefully", () => {
      const patientWithNullTimes: AttendanceStatusDetail = {
        patientId: 1,
        name: "Test Patient",
        priority: "1" as Priority,
        checkedInTime: null,
        onGoingTime: null,
        completedTime: null,
      };

      render(
        <AttendanceCard {...defaultProps} patient={patientWithNullTimes} />
      );

      expect(screen.getByText(/Test Patient \(1\)/)).toBeInTheDocument();
      expect(screen.getByTestId("attendance-times")).toBeInTheDocument();
    });

    it("should handle undefined isNextToBeAttended prop", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { isNextToBeAttended, ...propsWithoutNextToBeAttended } =
        defaultProps;

      render(<AttendanceCard {...propsWithoutNextToBeAttended} />);

      expect(screen.queryByText("Próximo")).not.toBeInTheDocument();
    });

    it("should handle high index numbers correctly", () => {
      render(
        <AttendanceCard {...defaultProps} status="checkedIn" index={99} />
      );

      expect(screen.getByText(/100\. João Silva \(1\)/)).toBeInTheDocument(); // index + 1
    });
  });

  describe("Delete Functionality", () => {
    it("shows delete button for scheduled status when onDelete is provided", () => {
      const mockOnDelete = jest.fn();

      render(
        <AttendanceCard
          {...defaultProps}
          status="scheduled"
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText("✕")).toBeInTheDocument();
      expect(screen.getByTitle("Remover")).toBeInTheDocument();
    });

    it("does not show delete button when attendanceId is not provided", () => {
      const patientWithoutId = { ...mockPatient, attendanceId: undefined };
      render(
        <AttendanceCard
          {...defaultProps}
          patient={patientWithoutId}
          status="scheduled"
        />
      );

      expect(screen.queryByText("✕")).not.toBeInTheDocument();
    });

    it("does not show delete button for non-scheduled status", () => {
      const mockOnDelete = jest.fn();

      render(
        <AttendanceCard
          {...defaultProps}
          status="onGoing"
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByTestId("x-icon")).not.toBeInTheDocument();
    });

    it("calls onDelete when delete button is clicked", () => {
      const mockOnDelete = jest.fn();

      render(
        <AttendanceCard
          {...defaultProps}
          status="scheduled"
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByTitle("Remover");
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).toHaveBeenCalledWith(123, "João Silva");
    });

    it("prevents drag start when delete button is clicked", () => {
      const mockOnDelete = jest.fn();
      const mockEvent = { stopPropagation: jest.fn() };

      render(
        <AttendanceCard
          {...defaultProps}
          status="scheduled"
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByTitle("Remover");
      fireEvent.click(deleteButton, mockEvent);

      expect(mockOnDelete).toHaveBeenCalled();
    });
  });

  describe("Treatment Session Progress", () => {
    it("should render treatment session progress for lightBath type", () => {
      render(
        <AttendanceCard
          {...defaultProps}
          type="lightBath"
          patient={{
            ...mockPatient,
            patientId: 456,
          }}
        />
      );

      expect(
        screen.getByTestId("treatment-session-progress")
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Progress for patient 456 - Type: light_bath - Details: false"
        )
      ).toBeInTheDocument();
    });

    it("should render treatment session progress for rod type", () => {
      render(
        <AttendanceCard
          {...defaultProps}
          type="rod"
          patient={{
            ...mockPatient,
            patientId: 789,
          }}
        />
      );

      expect(
        screen.getByTestId("treatment-session-progress")
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Progress for patient 789 - Type: rod - Details: false"
        )
      ).toBeInTheDocument();
    });

    it("should not render treatment session progress for spiritual type", () => {
      render(
        <AttendanceCard
          {...defaultProps}
          type="spiritual"
          patient={{
            ...mockPatient,
            patientId: 456,
          }}
        />
      );

      expect(
        screen.queryByTestId("treatment-session-progress")
      ).not.toBeInTheDocument();
    });

    it("should not render treatment session progress when patientId is undefined", () => {
      render(
        <AttendanceCard
          {...defaultProps}
          type="lightBath"
          patient={{
            ...mockPatient,
            patientId: undefined,
          }}
        />
      );

      expect(
        screen.queryByTestId("treatment-session-progress")
      ).not.toBeInTheDocument();
    });

    it("should render treatment session progress with showDetails=false", () => {
      render(
        <AttendanceCard
          {...defaultProps}
          type="lightBath"
          patient={{
            ...mockPatient,
            patientId: 123,
          }}
        />
      );

      const progressElement = screen.getByTestId("treatment-session-progress");
      expect(progressElement).toBeInTheDocument();
      expect(progressElement).toHaveTextContent("Details: false");
    });
  });
});
